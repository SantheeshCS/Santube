# SanTube 🎬

> Download YouTube videos and Instagram Reels instantly — no login, no storage, streams directly to you.

## Tech Stack

- **Frontend**: React 18 + Vite + Tailwind CSS v4
- **Backend**: Node.js + Express
- **Engine**: [yt-dlp](https://github.com/yt-dlp/yt-dlp)

## Prerequisites

Make sure these are installed:

| Tool | Install |
|------|---------|
| Node.js 18+ | https://nodejs.org |
| Python 3.8+ | https://python.org |
| yt-dlp | `pip install yt-dlp` |
| ffmpeg (optional) | https://ffmpeg.org — needed for 1080p YouTube |

## Quick Start

### 1. Backend

```bash
cd backend
npm install
node server.js
# Runs on http://localhost:3001
```

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
# Opens at http://localhost:5173
```

## Environment Variables

Create `backend/.env` to override defaults:

```env
PORT=3001
YT_DLP_PATH=yt-dlp   # or full path e.g. C:/Python/Scripts/yt-dlp.exe
```

## API Reference

### `POST /api/fetch-info`
```json
// Request
{ "url": "https://youtube.com/watch?v=..." }

// Response
{
  "title": "Video Title",
  "thumbnail": "https://...",
  "duration": 213,
  "uploader": "Channel Name",
  "platform": "youtube",
  "formats": [
    { "formatId": "137", "label": "1080p HD", "quality": "1080p", "ext": "mp4", "filesize": 52428800, "hasAudio": false },
    { "formatId": "22",  "label": "720p HD",  "quality": "720p",  "ext": "mp4", "filesize": null, "hasAudio": true },
    ...
  ]
}
```

### `GET /api/download?url=&formatId=&title=&ext=`
Streams the video file directly to the browser.

## Rate Limiting

5 requests per IP per minute on all `/api/` routes.

## Disclaimer

> For personal use only. Respect copyright laws and platform terms of service.
