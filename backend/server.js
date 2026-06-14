const express = require("express");
const cors = require("cors");
const rateLimit = require("express-rate-limit");
const { spawn } = require("child_process");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3001;

// ── Middleware ────────────────────────────────────────────────────────────────
app.use(cors());
app.use(express.json());

// ── Rate Limiting ─────────────────────────────────────────────────────────────
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: "Too many requests. Please wait a minute before trying again.",
    code: "RATE_LIMITED",
  },
});
app.use("/api/", limiter);

// ── URL Validation ────────────────────────────────────────────────────────────
function detectPlatform(url) {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.replace("www.", "");
    if (
      hostname === "youtube.com" ||
      hostname === "youtu.be" ||
      hostname === "m.youtube.com" ||
      hostname === "music.youtube.com"
    ) {
      return "youtube";
    }
    if (hostname === "instagram.com" || hostname === "instagr.am") {
      return "instagram";
    }
    return null;
  } catch {
    return null;
  }
}

// ── yt-dlp helpers ────────────────────────────────────────────────────────────
// Use 'python -m yt_dlp' so it works even when the yt-dlp script is not on PATH.
// Override with YT_DLP_PATH env var to use a direct binary path.
function spawnYtDlp(args) {
  const customPath = process.env.YT_DLP_PATH;
  if (customPath) {
    return spawn(customPath, args);
  }
  return spawn("python", ["-m", "yt_dlp", ...args]);
}

function buildFormatList(formats, platform) {
  const results = [];
  const targets = [
    { height: 1080, label: "1080p HD", quality: "1080p" },
    { height: 720,  label: "720p HD",  quality: "720p"  },
    { height: 480,  label: "480p",     quality: "480p"  },
    { height: 360,  label: "360p",     quality: "360p"  },
  ];

  // Audio only — prefer m4a/mp3 over webm for compatibility
  const audioFmt = formats
    .filter((f) => f.vcodec === "none" && f.acodec && f.acodec !== "none")
    .sort((a, b) => {
      const preferred = ["m4a", "mp3", "aac"];
      const aScore = preferred.includes(a.ext) ? 1 : 0;
      const bScore = preferred.includes(b.ext) ? 1 : 0;
      if (bScore !== aScore) return bScore - aScore;
      return (b.abr || 0) - (a.abr || 0);
    })[0];

  for (const target of targets) {
    // Strategy 1: match by format_note ("1080p", "720p", "480p", "360p")
    // Strategy 2: height-range fallback — handles non-standard aspect ratios
    //   e.g. 1920x802 video: height 802 falls in the 1080p range [756–1188]
    const lo = Math.floor(target.height * 0.70);
    const hi = Math.ceil(target.height * 1.10);

    const match = formats
      .filter((f) => {
        if (!f.vcodec || f.vcodec === "none") return false;
        if (f.format_note && f.format_note.includes(target.quality)) return true;
        if (f.height && f.height >= lo && f.height <= hi) return true;
        return false;
      })
      .sort((a, b) => {
        // Prefer combined (has audio) over video-only
        const aAudio = a.acodec && a.acodec !== "none" ? 1 : 0;
        const bAudio = b.acodec && b.acodec !== "none" ? 1 : 0;
        if (bAudio !== aAudio) return bAudio - aAudio;
        // Then highest filesize
        return (b.filesize || b.filesize_approx || 0) - (a.filesize || a.filesize_approx || 0);
      })[0];

    if (match) {
      let formatId = match.format_id;
      let hasAudio = !!(match.acodec && match.acodec !== "none");
      let filesize = match.filesize || match.filesize_approx || 0;

      if (!hasAudio && audioFmt) {
        formatId = `${match.format_id}+${audioFmt.format_id}`;
        hasAudio = true;
        filesize += audioFmt.filesize || audioFmt.filesize_approx || 0;
      }

      results.push({
        formatId,
        label: target.label,
        quality: target.quality,
        ext: "mp4", // Combined formats are remuxed to mp4
        filesize: filesize || null,
        hasAudio,
      });
    }
  }

  if (audioFmt) {
    results.push({
      formatId: audioFmt.format_id,
      label: "Audio Only",
      quality: "audio",
      ext: audioFmt.ext || "m4a",
      filesize: audioFmt.filesize || audioFmt.filesize_approx || null,
      hasAudio: true,
    });
  }

  // If still no video formats found, add a "best" fallback
  if (results.length <= 1) {
    results.unshift({
      formatId: "best",
      label: "Best Quality",
      quality: "best",
      ext: "mp4",
      filesize: null,
      hasAudio: true,
    });
  }

  return results;
}

// ── POST /api/fetch-info ──────────────────────────────────────────────────────
app.post("/api/fetch-info", (req, res) => {
  const { url } = req.body;

  if (!url || typeof url !== "string") {
    return res.status(400).json({ error: "URL is required.", code: "MISSING_URL" });
  }

  const platform = detectPlatform(url.trim());
  if (!platform) {
    return res.status(400).json({
      error: "Invalid URL. Only YouTube and Instagram links are supported.",
      code: "INVALID_URL",
    });
  }

  const args = [
    "--dump-json",
    "--no-playlist",
    "--no-warnings",
    url.trim(),
  ];

  const proc = spawnYtDlp(args);
  let stdout = "";
  let stderr = "";

  proc.stdout.on("data", (chunk) => (stdout += chunk.toString()));
  proc.stderr.on("data", (chunk) => (stderr += chunk.toString()));

  proc.on("close", async (code) => {
    if (code !== 0) {
      // Instagram image fallback
      if (stderr.includes("There is no video in this post")) {
        try {
          const { instagramGetUrl } = require("instagram-url-direct");
          const igData = await instagramGetUrl(url.trim());
          if (igData && igData.url_list && igData.url_list.length > 0) {
            const formats = igData.url_list.map((u, i) => ({
              formatId: "ig_image_" + i,
              label: igData.url_list.length > 1 ? `Image ${i + 1} (High Quality)` : "High Quality Image",
              quality: "image",
              ext: "jpg",
              filesize: null,
              hasAudio: false
            }));
            
            return res.json({
              title: (igData.post_info && igData.post_info.caption) ? igData.post_info.caption.split('\n')[0].slice(0, 100) : "Instagram Image",
              thumbnail: igData.url_list[0],
              duration: null,
              uploader: (igData.post_info && igData.post_info.owner_username) ? igData.post_info.owner_username : "Instagram Post",
              platform: "instagram",
              formats
            });
          }
        } catch (e) {
          console.error("IG image fallback error:", e);
        }
      }

      // Parse common yt-dlp errors
      if (stderr.includes("Private video") || stderr.includes("private")) {
        return res.status(403).json({ error: "This video is private.", code: "PRIVATE_VIDEO" });
      }
      if (stderr.includes("geo") || stderr.includes("not available in your country")) {
        return res.status(403).json({
          error: "This video is geo-restricted in your region.",
          code: "GEO_RESTRICTED",
        });
      }
      if (stderr.includes("Unable to extract") || stderr.includes("Unsupported URL")) {
        return res.status(400).json({ error: "Could not fetch video info. The URL may be invalid or unsupported.", code: "EXTRACTION_FAILED" });
      }
      if (stderr.includes("HTTP Error 404")) {
        return res.status(404).json({ error: "Video not found. It may have been deleted.", code: "NOT_FOUND" });
      }
      return res.status(500).json({
        error: "Failed to fetch video information. " + (stderr.slice(0, 200) || "Unknown error."),
        code: "YT_DLP_ERROR",
      });
    }

    try {
      const info = JSON.parse(stdout);
      const formats = buildFormatList(info.formats || [], platform);

      res.json({
        title: info.title || "Untitled Video",
        thumbnail: info.thumbnail || null,
        duration: info.duration || null,
        uploader: info.uploader || info.channel || null,
        platform,
        formats,
      });
    } catch (err) {
      res.status(500).json({ error: "Failed to parse video data.", code: "PARSE_ERROR" });
    }
  });

  proc.on("error", (err) => {
    if (err.code === "ENOENT") {
      return res.status(500).json({
        error: "Python or yt-dlp is not installed. Run: pip install yt-dlp",
        code: "YT_DLP_NOT_FOUND",
      });
    }
    res.status(500).json({ error: err.message, code: "SPAWN_ERROR" });
  });
});

// ── GET /api/download ─────────────────────────────────────────────────────────
app.get("/api/download", async (req, res) => {
  const { url, formatId, title, ext } = req.query;

  if (!url || !formatId) {
    return res.status(400).json({ error: "url and formatId are required.", code: "MISSING_PARAMS" });
  }

  const platform = detectPlatform(url);
  if (!platform) {
    return res.status(400).json({ error: "Invalid URL.", code: "INVALID_URL" });
  }

  // Sanitize filename — keep unicode/international chars, only strip chars
  // that are truly invalid in filenames across Windows/macOS/Linux
  const rawTitle = (title || "video").trim();
  const safeTitle = rawTitle
    .replace(/[<>:"/\\|?*\x00-\x1F]/g, "")   // strip invalid filename chars
    .replace(/\s+/g, " ")
    .trim()
    .slice(0, 150) || "video";
  const safeExt = (ext || "mp4").replace(/[^a-zA-Z0-9]/g, "").slice(0, 5) || "mp4";

  // Build Content-Disposition with proper RFC 5987 UTF-8 encoding
  // browsers use filename* for unicode, filename= as ASCII fallback
  const asciiFallback = safeTitle.replace(/[^\x20-\x7E]/g, "_").slice(0, 80);
  const encodedName = encodeURIComponent(`${safeTitle}.${safeExt}`).replace(/'/g, "%27");
  const contentDisposition =
    `attachment; filename="${asciiFallback}.${safeExt}"; filename*=UTF-8''${encodedName}`;

  // Set headers upfront — before any write
  res.setHeader("Content-Disposition", contentDisposition);

  if (formatId.startsWith("ig_image")) {
    res.setHeader("Content-Type", "image/jpeg");
    try {
      const index = parseInt(formatId.split("_")[2]) || 0;
      const { instagramGetUrl } = require("instagram-url-direct");
      const igData = await instagramGetUrl(url.trim());
      
      if (!igData || !igData.url_list || !igData.url_list[index]) {
        if (!res.headersSent) res.status(404).json({error: "Image not found", code: "NOT_FOUND"});
        return;
      }
      
      const directUrl = igData.url_list[index];
      const imgRes = await fetch(directUrl);
      if (!imgRes.ok) throw new Error("Failed to fetch image");
      
      const { Readable } = require('stream');
      Readable.fromWeb(imgRes.body).pipe(res);
    } catch (err) {
      console.error("[IG Image download error]", err);
      if (!res.headersSent) res.status(500).json({error: "Failed to download image", code: "DOWNLOAD_FAILED"});
    }
    return;
  }

  res.setHeader("Content-Type", "application/octet-stream");

  if (formatId.includes("+")) {
    const [vidId, audId] = formatId.split("+");
    let ffmpegPath;
    try {
      ffmpegPath = require("ffmpeg-static");
    } catch (e) {
      console.error("ffmpeg-static not found");
      return res.status(500).json({ error: "Server missing ffmpeg-static for muxing.", code: "FFMPEG_MISSING" });
    }

    const videoProc = spawnYtDlp(["-f", vidId, "--no-warnings", "-o", "-", url.trim()]);
    const audioProc = spawnYtDlp(["-f", audId, "--no-warnings", "-o", "-", url.trim()]);

    const ffmpegArgs = [
      "-i", "pipe:3",
      "-i", "pipe:4",
      "-c", "copy",
      "-movflags", "frag_keyframe+empty_moov",
      "-f", "mp4",
      "pipe:1"
    ];

    const ffmpegProc = spawn(ffmpegPath, ffmpegArgs, {
      stdio: ['ignore', 'pipe', 'pipe', 'pipe', 'pipe']
    });

    videoProc.stdout.pipe(ffmpegProc.stdio[3]);
    audioProc.stdout.pipe(ffmpegProc.stdio[4]);

    ffmpegProc.stdout.pipe(res);

    ffmpegProc.stderr.on("data", (chunk) => {
      // console.error("[ffmpeg stderr]", chunk.toString());
    });

    ffmpegProc.on("error", (err) => {
      console.error("[ffmpeg spawn error]", err);
      if (!res.headersSent) {
        res.status(500).json({ error: "Failed to start download.", code: "SPAWN_ERROR" });
      }
    });

    ffmpegProc.on("close", (code) => {
      if (code !== 0) {
        console.error(`[ffmpeg] exited with code ${code}`);
      }
      if (!res.writableEnded) res.end();
    });

    req.on("close", () => {
      if (!videoProc.killed) videoProc.kill("SIGTERM");
      if (!audioProc.killed) audioProc.kill("SIGTERM");
      if (!ffmpegProc.killed) ffmpegProc.kill("SIGTERM");
    });

  } else {
    const args = [
      "-f", formatId,
      "--no-playlist",
      "--no-warnings",
      "-o", "-",
      url.trim(),
    ];

    const proc = spawnYtDlp(args);

    proc.stdout.on("data", (chunk) => {
      res.write(chunk);
    });

    proc.stderr.on("data", (chunk) => {
      console.error("[yt-dlp stderr]", chunk.toString());
    });

    proc.on("error", (err) => {
      console.error("[spawn error]", err);
      if (!res.headersSent) {
        if (err.code === "ENOENT") {
          res.status(500).json({
            error: "yt-dlp is not installed or not in PATH. Run: pip install yt-dlp",
            code: "YT_DLP_NOT_FOUND",
          });
        } else {
          res.status(500).json({ error: "Failed to start download.", code: "SPAWN_ERROR" });
        }
      }
    });

    proc.on("close", (code) => {
      if (code !== 0) {
        console.error(`[yt-dlp] download exited with code ${code}`);
        if (!res.headersSent) {
          res.status(500).json({ error: "Download failed. The video may be unavailable.", code: "DOWNLOAD_FAILED" });
          return;
        }
      }
      // End the response cleanly
      if (!res.writableEnded) res.end();
    });

    // Kill process if client disconnects
    req.on("close", () => {
      if (!proc.killed) proc.kill("SIGTERM");
    });
  }
});

// ── Health check ──────────────────────────────────────────────────────────────
app.get("/", (req, res) => {
  res.send("SanTube API is running successfully! 🚀");
});

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", service: "SanTube API", version: "1.0.0" });
});

// ── Start ─────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`\n🎬 SanTube Backend running at http://localhost:${PORT}`);
  console.log(`   Using yt-dlp: ${process.env.YT_DLP_PATH || "python -m yt_dlp"}`);
  console.log(`   Rate limit: 5 requests/min per IP\n`);
});
