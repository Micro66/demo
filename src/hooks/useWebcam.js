import { useState, useEffect, useRef } from 'react';
import { CAMERA_CONFIG } from '../constants';

/**
 * Custom hook for managing webcam access
 * @returns {Object} { videoRef, stream, error }
 */
export const useWebcam = () => {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const videoRef = useRef(null);

  useEffect(() => {
    let mediaStream = null;

    const initWebcam = async () => {
      try {
        mediaStream = await navigator.mediaDevices.getUserMedia(CAMERA_CONFIG);
        setStream(mediaStream);
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      } catch (err) {
        console.error('Error accessing webcam:', err);
        setError(err);
      }
    };

    initWebcam();

    return () => {
      if (mediaStream) {
        mediaStream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  useEffect(() => {
    if (stream && videoRef.current) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  return { videoRef, stream, error };
};
