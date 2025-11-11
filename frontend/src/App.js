import React, { useState, useRef } from 'react';
import axios from 'axios';
import './App.css';

function App() {
  const [file, setFile] = useState(null);
  const [targetFormat, setTargetFormat] = useState('');
  const [loading, setLoading] = useState(false);
  const [formats, setFormats] = useState({});
  const fileInputRef = useRef(null);

  React.useEffect(() => {
    fetchFormats();
  }, []);

  const fetchFormats = async () => {
    try {
      const response = await axios.get('/api/formats');
      setFormats(response.data);
    } catch (error) {
      console.error('Error fetching formats:', error);
    }
  };

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      const fileExt = selectedFile.name.split('.').pop().toLowerCase();
      setTargetFormat('');
    }
  };

  const handleConvert = async () => {
    if (!file || !targetFormat) {
      alert('Please select a file and target format');
      return;
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('file', file);
    formData.append('targetFormat', targetFormat);

    try {
      const response = await axios.post('/api/convert', formData, {
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      const fileName = file.name.split('.')[0] + '.' + targetFormat;
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      setFile(null);
      setTargetFormat('');
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    } catch (error) {
      console.error('Conversion error:', error);
      alert('Conversion failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const getSupportedFormats = () => {
    if (!file) return [];
    const fileExt = file.name.split('.').pop().toLowerCase();

    const supportedFormats = [];
    Object.entries(formats).forEach(([category, exts]) => {
      if (exts.includes('.' + fileExt)) {
        if (category === 'image') {
          supportedFormats.push(...['.pdf', '.webp']);
        } else if (category === 'video') {
          supportedFormats.push(...['.mp3', '.wav']);
        } else if (category === 'audio') {
          supportedFormats.push('.mp4');
        }
      }
    });

    return [...new Set(supportedFormats)];
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>Format Factory</h1>
        <p>Convert your files between different formats</p>
      </header>

      <main className="App-main">
        <div className="upload-section">
          <div className="file-upload">
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*,video/*,audio/*,.pdf"
              className="file-input"
              id="file-upload"
            />
            <label htmlFor="file-upload" className="file-label">
              {file ? file.name : 'Choose File'}
            </label>
          </div>

          {file && (
            <div className="conversion-options">
              <h3>Convert to:</h3>
              <div className="format-buttons">
                {getSupportedFormats().map((format) => (
                  <button
                    key={format}
                    className={`format-btn ${targetFormat === format ? 'active' : ''}`}
                    onClick={() => setTargetFormat(format.replace('.', ''))}
                  >
                    {format.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>
          )}

          {file && targetFormat && (
            <button
              className="convert-btn"
              onClick={handleConvert}
              disabled={loading}
            >
              {loading ? 'Converting...' : `Convert to ${targetFormat.toUpperCase()}`}
            </button>
          )}
        </div>

        <div className="info-section">
          <h3>Supported Formats:</h3>
          <div className="formats-grid">
            <div className="format-category">
              <h4>Images</h4>
              <p>JPG, PNG, GIF, WebP, PDF</p>
            </div>
            <div className="format-category">
              <h4>Audio</h4>
              <p>MP3, WAV</p>
            </div>
            <div className="format-category">
              <h4>Video</h4>
              <p>MP4, AVI, MOV</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

export default App;