import { useState, useRef, useEffect, useCallback } from 'react';
import { VIDEO_CONSTRAINTS } from '../constants';

/**
 * Custom hook for managing camera/webcam functionality
 */
export const useCamera = () => {
  const [stream, setStream] = useState(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);

  // Initialize camera
  useEffect(() => {
    const initCamera = async () => {
      try {
        const mediaStream = await navigator.mediaDevices.getUserMedia(VIDEO_CONSTRAINTS);
        setStream(mediaStream);
        setIsReady(true);
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError(err);
      }
    };

    initCamera();

    // Cleanup on unmount
    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Connect stream to video element
  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  // Capture photo from video
  const capturePhoto = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    const context = canvas.getContext('2d');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0);

    return canvas.toDataURL('image/png');
  }, []);

  return {
    videoRef,
    canvasRef,
    isReady,
    error,
    capturePhoto
  };
};

export default useCamera;
