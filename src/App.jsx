import React, { useState, useCallback } from 'react';
import { Camera, PhotoWall, Instructions, Title } from './components';
import { useCamera, usePhotos } from './hooks';

function App() {
  const [isEjecting, setIsEjecting] = useState(false);

  const { videoRef, canvasRef, capturePhoto } = useCamera();
  const {
    photosOnWall,
    photosInCamera,
    addPhoto,
    deletePhoto,
    downloadPhoto,
    updateCaption,
    moveToWall,
    updatePosition,
    regenerateCaption
  } = usePhotos();

  const handleCapture = useCallback(() => {
    if (isEjecting) return;

    const imageData = capturePhoto();
    if (!imageData) return;

    addPhoto(imageData);
    setIsEjecting(true);

    // Stop ejection animation after 2 seconds
    setTimeout(() => {
      setIsEjecting(false);
    }, 2000);
  }, [isEjecting, capturePhoto, addPhoto]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-pink-50 font-handwritten overflow-hidden">
      {/* Title */}
      <Title />

      {/* Instructions */}
      <Instructions />

      {/* Photo Wall - Draggable Photos */}
      <PhotoWall
        photos={photosOnWall}
        onDelete={deletePhoto}
        onDownload={downloadPhoto}
        onUpdateCaption={updateCaption}
        onMoveToWall={moveToWall}
        onUpdatePosition={updatePosition}
        onRegenerateCaption={regenerateCaption}
      />

      {/* Camera */}
      <Camera
        videoRef={videoRef}
        canvasRef={canvasRef}
        photosInCamera={photosInCamera}
        isEjecting={isEjecting}
        onCapture={handleCapture}
        onDelete={deletePhoto}
        onDownload={downloadPhoto}
        onUpdateCaption={updateCaption}
        onMoveToWall={moveToWall}
        onUpdatePosition={updatePosition}
        onRegenerateCaption={regenerateCaption}
      />
    </div>
  );
}

export default App;
