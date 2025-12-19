import React, { useRef } from 'react';
import { motion } from 'framer-motion';
import { CAMERA_IMAGE_URL, SHUTTER_SOUND, ANIMATION_TIMING } from '../constants';
import PolaroidPhoto from './PolaroidPhoto';

/**
 * Camera component - Retro camera with viewfinder and photo ejection
 */
const Camera = ({
  videoRef,
  photos,
  isEjecting,
  onCapture,
  photoHandlers
}) => {
  const canvasRef = useRef(null);
  const audioRef = useRef(null);

  const handleCapture = async () => {
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
    onCapture(imageData);
  };

  // Filter photos that are still in the camera (not on wall)
  const photosInCamera = photos.filter(p => !p.onWall);

  return (
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
          transition={{ duration: ANIMATION_TIMING.ejection / 1000, ease: 'easeOut' }}
        >
          <PolaroidPhoto
            photo={photo}
            isInCamera={true}
            {...photoHandlers}
          />
        </motion.div>
      ))}

      {/* Hidden Canvas for Capture */}
      <canvas ref={canvasRef} className="hidden" />

      {/* Shutter Sound */}
      <audio ref={audioRef} src={SHUTTER_SOUND} />
    </div>
  );
};

export default Camera;
