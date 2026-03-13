import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useTransform } from 'framer-motion';
import { Download, Trash2, Edit2, RefreshCw, Camera, Sun, Moon } from 'lucide-react';
import html2canvas from 'html2canvas';

const GEMINI_API_KEY = 'AIzaSyDxhfiN0Ftu_CqRtk4b5uhdBGQRK8AZzWY';

function App() {
  const [photos, setPhotos] = useState([]);
  const [stream, setStream] = useState(null);
  const [isEjecting, setIsEjecting] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    // Check system preference on mount
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    setIsDarkMode(prefersDark);
  }, []);

  useEffect(() => {
    // Apply theme class to document
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  const toggleTheme = () => {
    setIsDarkMode(prev => !prev);
  };

  useEffect(() => {
    // Request webcam access
    navigator.mediaDevices.getUserMedia({ video: { width: 1280, height: 720 } })
      .then((mediaStream) => {
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      })
      .catch((err) => {
        console.error('Error accessing webcam:', err);
      });

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const capturePhoto = async () => {
    if (!videoRef.current || isEjecting) return;

    // Play shutter sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }

    // Capture image from video
    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    const imageData = canvas.toDataURL('image/png');
    const imageBlob = await (await fetch(imageData)).blob();

    // Get browser language
    const userLang = navigator.language || navigator.userLanguage;

    // Create new photo object
    const newPhoto = {
      id: Date.now(),
      image: imageData,
      date: new Date().toLocaleDateString(userLang, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      }),
      caption: '',
      isGenerating: true,
      isDeveloping: true,
      position: { x: 0, y: 0 },
      onWall: false
    };

    setPhotos(prev => [...prev, newPhoto]);
    setIsEjecting(true);

    // Generate AI caption
    generateCaption(imageBlob, newPhoto.id, userLang);

    // Stop ejection animation after 2 seconds
    setTimeout(() => {
      setIsEjecting(false);
      // Stop developing effect after 3 more seconds
      setTimeout(() => {
        setPhotos(prev => prev.map(p =>
          p.id === newPhoto.id ? { ...p, isDeveloping: false } : p
        ));
      }, 3000);
    }, 2000);
  };

  const generateCaption = async (imageBlob, photoId, lang) => {
    try {
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(imageBlob);
      reader.onloadend = async () => {
        const base64Image = reader.result.split(',')[1];

        const response = await fetch(
          `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash-exp:generateContent?key=${GEMINI_API_KEY}`,
          {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              contents: [{
                parts: [
                  { text: `Generate a warm, short blessing or nice comment about this photo in ${lang} language. Keep it under 20 words and make it heartfelt.` },
                  { inline_data: { mime_type: 'image/png', data: base64Image } }
                ]
              }]
            })
          }
        );

        const data = await response.json();
        const caption = data?.candidates?.[0]?.content?.parts?.[0]?.text || 'Beautiful moment captured!';

        setPhotos(prev => prev.map(p =>
          p.id === photoId ? { ...p, caption, isGenerating: false } : p
        ));
      };
    } catch (error) {
      console.error('Error generating caption:', error);
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, caption: 'A wonderful memory!', isGenerating: false } : p
      ));
    }
  };

  const deletePhoto = (photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  };

  const downloadPhoto = async (photoId) => {
    const photoElement = document.getElementById(`photo-${photoId}`);
    if (!photoElement) return;

    try {
      const canvas = await html2canvas(photoElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `retro-photo-${photoId}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  return (
    <div className={`min-h-screen font-handwritten overflow-hidden transition-colors duration-500 ${
      isDarkMode
        ? 'bg-gradient-to-br from-gray-900 via-slate-900 to-zinc-900'
        : 'bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50'
    }`}>
      {/* Title */}
      <div className="fixed top-4 md:top-8 left-0 right-0 text-center z-10 px-4">
        <h1 className={`text-3xl sm:text-4xl md:text-6xl font-bold transition-colors duration-500 ${
          isDarkMode ? 'text-amber-100' : 'text-amber-900'
        }`}>Bao Retro Camera</h1>
      </div>

      {/* Theme Toggle Button */}
      <button
        onClick={toggleTheme}
        className={`fixed top-4 md:top-8 left-4 md:left-8 z-20 p-3 rounded-full shadow-lg transition-all duration-300 ${
          isDarkMode
            ? 'bg-slate-800 hover:bg-slate-700 text-amber-300'
            : 'bg-white/80 hover:bg-white text-amber-700'
        }`}
        aria-label={isDarkMode ? 'Switch to light mode' : 'Switch to dark mode'}
      >
        <motion.div
          initial={false}
          animate={{ rotate: isDarkMode ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          {isDarkMode ? <Moon size={24} /> : <Sun size={24} />}
        </motion.div>
      </button>

      {/* Instructions */}
      <div className={`hidden md:block fixed bottom-8 right-8 backdrop-blur-sm p-4 rounded-lg shadow-lg max-w-xs z-10 transition-colors duration-500 ${
        isDarkMode
          ? 'bg-slate-800/80 text-amber-100'
          : 'bg-white/80 text-amber-900'
      }`}>
        <h3 className="text-2xl font-bold mb-2">How to Use</h3>
        <ul className={`text-lg space-y-1 ${isDarkMode ? 'text-amber-200' : 'text-amber-800'}`}>
          <li>• Click the button to take a photo</li>
          <li>• Drag photos to the wall</li>
          <li>• Double-click text to edit</li>
          <li>• Hover for more options</li>
        </ul>
      </div>

      {/* Mobile Floating Capture Button */}
      <button
        onClick={capturePhoto}
        disabled={isEjecting}
        className="md:hidden fixed top-20 right-4 z-30 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-gray-400 text-white p-4 rounded-full shadow-lg transition-colors"
        aria-label="Take Photo"
      >
        <Camera size={24} />
      </button>

      {/* Photo Wall - Draggable Photos */}
      {photos.filter(p => p.onWall).map(photo => (
        <PolaroidPhoto
          key={photo.id}
          photo={photo}
          setPhotos={setPhotos}
          deletePhoto={deletePhoto}
          downloadPhoto={downloadPhoto}
          generateCaption={generateCaption}
          isDarkMode={isDarkMode}
        />
      ))}

      {/* Camera Container */}
      <div
        className="fixed left-1/2 -translate-x-1/2 md:left-16 md:translate-x-0"
        style={{
          bottom: 'clamp(16px, 5vh, 64px)',
          width: 'min(90vw, 450px)',
          height: 'min(90vw, 450px)',
          maxWidth: '450px',
          maxHeight: '450px',
          zIndex: 20
        }}
      >
        {/* Camera Background Image */}
        <img
          src="https://s.baoyu.io/images/retro-camera.webp"
          alt="Retro Camera"
          className="absolute w-full h-full object-contain"
          style={{ left: 0, bottom: 0 }}
        />

        {/* Video Viewfinder */}
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="absolute object-cover"
          style={{
            bottom: '32%',
            left: '62%',
            transform: 'translateX(-50%)',
            width: '27%',
            height: '27%',
            borderRadius: '50%',
            zIndex: 30
          }}
        />

        {/* Shutter Button */}
        <button
          onClick={capturePhoto}
          className="absolute bg-transparent border-none outline-none"
          style={{
            bottom: '40%',
            left: '18%',
            width: '11%',
            height: '11%',
            cursor: 'pointer',
            zIndex: 30
          }}
          aria-label="Take Photo"
        />

        {/* Photo Ejection Slot */}
        {photos.filter(p => !p.onWall).map(photo => (
          <motion.div
            key={photo.id}
            className="absolute"
            style={{
              transform: 'translateX(-50%)',
              top: 0,
              left: '50%',
              width: '35%',
              height: '100%',
              zIndex: 10
            }}
            initial={{ y: 0 }}
            animate={{ y: isEjecting ? '-40%' : 0 }}
            transition={{ duration: 2, ease: 'easeOut' }}
          >
            <PolaroidPhoto
              photo={photo}
              setPhotos={setPhotos}
              deletePhoto={deletePhoto}
              downloadPhoto={downloadPhoto}
              generateCaption={generateCaption}
              isInCamera={true}
              isDarkMode={isDarkMode}
            />
          </motion.div>
        ))}
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Sound */}
      <audio ref={audioRef} src="data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBTGH0fPTgjMGHm7A7+OZUQ0MUKzn77BfGgU7ltry0YU2Bx9uyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OUavm8bJiGgU6mNzyz4I9Bx9vyO/mnlINDlGr5vGyYhoFOpjc8s+CPQcfb8jv5p5SDQ5Rq+bxsmIaBTqY3PLPgj0HH2/I7+aeUg0OU=" />
    </div>
  );
}

function PolaroidPhoto({ photo, setPhotos, deletePhoto, downloadPhoto, generateCaption, isInCamera = false, isDarkMode = false }) {
  const [isHovered, setIsHovered] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(photo.caption);
  const [isTouching, setIsTouching] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnd = (event, info) => {
    if (isInCamera) {
      // Move photo to wall
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? { ...p, onWall: true, position: { x: info.point.x, y: info.point.y } }
          : p
      ));
    } else {
      // Update position on wall
      setPhotos(prev => prev.map(p =>
        p.id === photo.id
          ? { ...p, position: { x: info.point.x, y: info.point.y } }
          : p
      ));
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(photo.caption);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    setPhotos(prev => prev.map(p =>
      p.id === photo.id ? { ...p, caption: editText } : p
    ));
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(photo.caption);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleRefresh = async () => {
    setPhotos(prev => prev.map(p =>
      p.id === photo.id ? { ...p, isGenerating: true } : p
    ));

    const imageBlob = await (await fetch(photo.image)).blob();
    const userLang = navigator.language || navigator.userLanguage;
    generateCaption(imageBlob, photo.id, userLang);
  };

  const handleDoubleClick = (e) => {
    if (!isEditing) {
      handleEdit();
    }
  };

  return (
    <motion.div
      id={`photo-${photo.id}`}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className="absolute cursor-move select-none touch-none"
      style={{
        x: photo.position.x,
        y: photo.position.y,
        width: isInCamera ? '100%' : 'min(85vw, 300px)',
      }}
      initial={isInCamera ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => setTimeout(() => setIsTouching(false), 200)}
    >
      {/* Polaroid Card */}
      <div className={`p-3 md:p-4 shadow-2xl transition-colors duration-500 ${
        isDarkMode ? 'bg-slate-800' : 'bg-white'
      }`} style={{ aspectRatio: '3/4' }}>
        {/* Photo Area */}
        <div
          className="relative bg-gray-200 mb-3 overflow-hidden"
          style={{ height: '70%' }}
        >
          <img
            src={photo.image}
            alt="Captured moment"
            className={`w-full h-full object-cover transition-all duration-3000 ${
              photo.isDeveloping ? 'blur-lg opacity-30' : 'blur-0 opacity-100'
            }`}
          />
          {photo.isDeveloping && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-2xl text-gray-600">Developing...</span>
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="space-y-1 md:space-y-2">
          <div className={`text-base md:text-xl font-bold transition-colors duration-500 ${
            isDarkMode ? 'text-amber-200' : 'text-gray-700'
          }`}>{photo.date}</div>

          <div
            className="relative"
            onMouseEnter={() => setIsTextHovered(true)}
            onMouseLeave={() => setIsTextHovered(false)}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className={`w-full text-base md:text-xl border-2 rounded p-2 font-handwritten resize-none transition-colors duration-500 ${
                  isDarkMode
                    ? 'text-amber-100 bg-slate-700 border-amber-500'
                    : 'text-gray-800 bg-gray-50 border-amber-300'
                }`}
                rows={3}
              />
            ) : (
              <div className={`text-base md:text-xl min-h-[50px] md:min-h-[60px] transition-colors duration-500 ${
                isDarkMode ? 'text-amber-100' : 'text-gray-800'
              }`}>
                {photo.isGenerating ? (
                  <span className={isDarkMode ? 'italic text-amber-400' : 'italic text-gray-500'}>
                    Generating caption...
                  </span>
                ) : (
                  photo.caption
                )}
              </div>
            )}

            {/* Edit Icons */}
            {(isTextHovered || isTouching) && !isEditing && !photo.isGenerating && (
              <div className={`absolute top-0 right-0 flex gap-2 p-1 rounded shadow-lg transition-colors duration-500 ${
                isDarkMode ? 'bg-slate-700/90' : 'bg-white/90'
              }`}>
                <button
                  onClick={handleEdit}
                  className="p-1 hover:bg-amber-100 rounded active:bg-amber-200"
                  aria-label="Edit caption"
                >
                  <Edit2 size={16} className={`md:w-[18px] md:h-[18px] ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`} />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-amber-100 rounded active:bg-amber-200"
                  aria-label="Regenerate caption"
                >
                  <RefreshCw size={16} className={`md:w-[18px] md:h-[18px] ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`} />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Toolbar */}
      {(isHovered || isTouching) && !photo.isDeveloping && photo.onWall && (
        <div className={`absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 flex gap-2 p-1.5 md:p-2 rounded-lg shadow-lg transition-colors duration-500 ${
          isDarkMode ? 'bg-slate-700/95' : 'bg-white/95'
        }`}>
          <button
            onClick={() => downloadPhoto(photo.id)}
            className={`p-1.5 md:p-2 rounded transition-colors ${
              isDarkMode
                ? 'hover:bg-slate-600 active:bg-slate-500'
                : 'hover:bg-amber-100 active:bg-amber-200'
            }`}
            aria-label="Download photo"
          >
            <Download size={18} className={`md:w-5 md:h-5 ${isDarkMode ? 'text-amber-300' : 'text-amber-700'}`} />
          </button>
          <button
            onClick={() => deletePhoto(photo.id)}
            className="p-1.5 md:p-2 hover:bg-red-100 active:bg-red-200 rounded transition-colors"
            aria-label="Delete photo"
          >
            <Trash2 size={18} className="text-red-600 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
}

export default App;
