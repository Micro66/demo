import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { Camera as CameraIcon } from 'lucide-react';
import { CAMERA_IMAGE_URL, SHUTTER_SOUND_BASE64 } from '../constants';
import PolaroidPhoto from './PolaroidPhoto';

/**
 * Camera component - The main camera interface with viewfinder and photo ejection
 */
const Camera = ({
  videoRef,
  canvasRef,
  photosInCamera,
  isEjecting,
  onCapture,
  onDelete,
  onDownload,
  onUpdateCaption,
  onMoveToWall,
  onUpdatePosition,
  onRegenerateCaption
}) => {
  const audioRef = useRef(null);

  const handleCapture = () => {
    // Play shutter sound
    if (audioRef.current) {
      audioRef.current.currentTime = 0;
      audioRef.current.play();
    }
    onCapture();
  };

  return (
    <>
      {/* Mobile Floating Capture Button */}
      <button
        onClick={handleCapture}
        disabled={isEjecting}
        className="md:hidden fixed top-20 right-4 z-30 bg-amber-600 hover:bg-amber-700 active:bg-amber-800 disabled:bg-gray-400 text-white p-4 rounded-full shadow-lg transition-colors"
        aria-label="Take Photo"
      >
        <CameraIcon size={24} />
      </button>

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
          src={CAMERA_IMAGE_URL}
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
          onClick={handleCapture}
          disabled={isEjecting}
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
        {photosInCamera.map(photo => (
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
              onDelete={onDelete}
              onDownload={onDownload}
              onUpdateCaption={onUpdateCaption}
              onMoveToWall={onMoveToWall}
              onUpdatePosition={onUpdatePosition}
              onRegenerateCaption={onRegenerateCaption}
              isInCamera={true}
            />
          </motion.div>
        ))}
      </div>

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Sound */}
      <audio ref={audioRef} src={SHUTTER_SOUND_BASE64} />
    </>
  );
};

export default Camera;
