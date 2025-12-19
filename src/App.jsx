import React, { useState } from 'react';
import { useWebcam, usePhotos } from './hooks';
import { ANIMATION_TIMING } from './constants';
import {
  Camera,
  Header,
  Instructions,
  MobileCaptureButton,
  PhotoWall
} from './components';

function App() {
  const [isEjecting, setIsEjecting] = useState(false);
  const { videoRef } = useWebcam();
  const {
    photos,
    updatePhoto,
    deletePhoto,
    refreshCaption,
    moveToWall,
    updatePosition,
    handlePhotoCapture
  } = usePhotos();

  // Handlers to pass to photo components
  const photoHandlers = {
    onDelete: deletePhoto,
    onUpdate: updatePhoto,
    onRefreshCaption: refreshCaption,
    onMoveToWall: moveToWall,
    onUpdatePosition: updatePosition
  };

  const handleCapture = async (imageData) => {
    if (isEjecting) return;

    setIsEjecting(true);
    await handlePhotoCapture(imageData);

    // Stop ejection animation
    setTimeout(() => {
      setIsEjecting(false);
    }, ANIMATION_TIMING.ejection);
  };

  const handleMobileCapture = () => {
    const video = videoRef.current;
    if (video) {
      const canvas = document.createElement('canvas');
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      canvas.getContext('2d').drawImage(video, 0, 0);
      handleCapture(canvas.toDataURL('image/png'));
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 font-handwritten overflow-hidden">
      {/* Title */}
      <Header />

      {/* Instructions */}
      <Instructions />

      {/* Mobile Floating Capture Button */}
      <MobileCaptureButton
        onClick={handleMobileCapture}
        disabled={isEjecting}
      />

      {/* Photo Wall - Draggable Photos */}
      <PhotoWall photos={photos} photoHandlers={photoHandlers} />

      {/* Camera Container */}
      <Camera
        videoRef={videoRef}
        photos={photos}
        isEjecting={isEjecting}
        onCapture={handleCapture}
        photoHandlers={photoHandlers}
      />
    </div>
  );
}

export default App;
