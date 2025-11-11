# Format Factory

A full-stack web application for converting files between different formats.

## Features

- **Image Conversion**: Convert between JPG, PNG, GIF, WebP, and PDF formats
- **Audio Conversion**: Convert between MP3 and WAV formats
- **Video Conversion**: Extract audio from video files (MP4, AVI, MOV to MP3/WAV)
- **PDF Conversion**: Convert PDF files to image formats

## Technology Stack

### Frontend
- React 18
- Axios for API calls
- CSS3 with modern styling
- Responsive design

### Backend
- Node.js with Express
- Multer for file uploads
- ImageMagick and FFmpeg for format conversion
- CORS enabled

## Installation

### Backend Setup
```bash
cd backend
npm install
npm start
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

## Usage

1. Start the backend server on port 3001
2. Start the frontend server on port 3000
3. Open your browser and navigate to `http://localhost:3000`
4. Select a file to convert
5. Choose the target format
6. Click convert and download the converted file

## API Endpoints

- `POST /api/convert` - Convert file format
- `GET /api/formats` - Get supported formats

## Dependencies

### System Dependencies
- ImageMagick (for image conversion)
- FFmpeg (for audio/video conversion)

### Install on Ubuntu/Debian
```bash
sudo apt-get update
sudo apt-get install imagemagick ffmpeg
```

### Install on macOS
```bash
brew install imagemagick ffmpeg
```

## Project Structure

```
├── backend/
│   ├── server.js
│   ├── package.json
│   ├── uploads/
│   └── converted/
├── frontend/
│   ├── src/
│   │   ├── App.js
│   │   ├── App.css
│   │   └── index.js
│   ├── public/
│   └── package.json
└── README.md
```