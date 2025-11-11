const express = require('express');
const multer = require('multer');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const { exec } = require('child_process');
const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend/build')));

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, 'uploads');
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

const upload = multer({ storage: storage });

app.post('/api/convert', upload.single('file'), (req, res) => {
  try {
    const { targetFormat } = req.body;
    const inputFile = req.file.path;
    const outputFileName = req.file.originalname.split('.')[0] + '.' + targetFormat;
    const outputFile = path.join(__dirname, 'converted', outputFileName);

    if (!fs.existsSync(path.join(__dirname, 'converted'))) {
      fs.mkdirSync(path.join(__dirname, 'converted'), { recursive: true });
    }

    let command = '';
    const inputExt = path.extname(req.file.originalname).toLowerCase();

    switch (inputExt) {
      case '.jpg':
      case '.jpeg':
      case '.png':
      case '.gif':
        if (['.pdf', '.webp'].includes(targetFormat)) {
          command = `convert "${inputFile}" "${outputFile}"`;
        }
        break;
      case '.mp4':
      case '.avi':
      case '.mov':
        if (['.mp3', '.wav'].includes(targetFormat)) {
          command = `ffmpeg -i "${inputFile}" "${outputFile}"`;
        }
        break;
      case '.mp3':
      case '.wav':
        if (['.mp4'].includes(targetFormat)) {
          command = `ffmpeg -i "${inputFile}" -f image2 -loop 1 -i "${path.join(__dirname, 'placeholder.jpg')}" -shortest "${outputFile}"`;
        }
        break;
      case '.pdf':
        if (['.jpg', '.png'].includes(targetFormat)) {
          command = `convert "${inputFile}" "${outputFile}"`;
        }
        break;
    }

    if (!command) {
      return res.status(400).json({ error: 'Conversion not supported' });
    }

    exec(command, (error, stdout, stderr) => {
      if (error) {
        console.error('Conversion error:', error);
        return res.status(500).json({ error: 'Conversion failed' });
      }

      res.download(outputFile, outputFileName, (err) => {
        if (err) {
          console.error('Download error:', err);
        }
        fs.unlinkSync(inputFile);
        fs.unlinkSync(outputFile);
      });
    });

  } catch (error) {
    console.error('Server error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/formats', (req, res) => {
  const formats = {
    image: ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.pdf'],
    audio: ['.mp3', '.wav'],
    video: ['.mp4', '.avi', '.mov']
  };
  res.json(formats);
});

app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/build/index.html'));
});

app.listen(PORT, () => {
  console.log(`Format Factory Server running on port ${PORT}`);
});