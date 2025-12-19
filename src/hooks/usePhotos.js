import { useState, useCallback } from 'react';
import { generateImageCaption } from '../utils/geminiApi';
import { createPhotoObject, dataUrlToBlob, getUserLanguage, downloadPhotoElement } from '../utils/photoUtils';

/**
 * Custom hook for managing photos state and operations
 */
export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);

  // Add a new photo
  const addPhoto = useCallback((imageData) => {
    const lang = getUserLanguage();
    const newPhoto = createPhotoObject(imageData, lang);

    setPhotos(prev => [...prev, newPhoto]);

    // Generate AI caption
    generateCaptionForPhoto(imageData, newPhoto.id, lang);

    // Stop developing effect after 5 seconds
    setTimeout(() => {
      setPhotos(prev => prev.map(p =>
        p.id === newPhoto.id ? { ...p, isDeveloping: false } : p
      ));
    }, 5000);

    return newPhoto;
  }, []);

  // Generate caption for a photo
  const generateCaptionForPhoto = useCallback(async (imageData, photoId, lang) => {
    try {
      const imageBlob = await dataUrlToBlob(imageData);
      const caption = await generateImageCaption(imageBlob, lang);

      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, caption, isGenerating: false } : p
      ));
    } catch (error) {
      console.error('Error generating caption:', error);
      setPhotos(prev => prev.map(p =>
        p.id === photoId ? { ...p, caption: 'A wonderful memory!', isGenerating: false } : p
      ));
    }
  }, []);

  // Regenerate caption for existing photo
  const regenerateCaption = useCallback(async (photoId) => {
    const photo = photos.find(p => p.id === photoId);
    if (!photo) return;

    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, isGenerating: true } : p
    ));

    const lang = getUserLanguage();
    await generateCaptionForPhoto(photo.image, photoId, lang);
  }, [photos, generateCaptionForPhoto]);

  // Update photo caption
  const updateCaption = useCallback((photoId, caption) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, caption } : p
    ));
  }, []);

  // Move photo to wall
  const moveToWall = useCallback((photoId, position) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, onWall: true, position } : p
    ));
  }, []);

  // Update photo position
  const updatePosition = useCallback((photoId, position) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, position } : p
    ));
  }, []);

  // Delete photo
  const deletePhoto = useCallback((photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  // Download photo
  const downloadPhoto = useCallback((photoId) => {
    downloadPhotoElement(`photo-${photoId}`, photoId);
  }, []);

  // Get photos on wall
  const photosOnWall = photos.filter(p => p.onWall);

  // Get photos in camera (not on wall)
  const photosInCamera = photos.filter(p => !p.onWall);

  return {
    photos,
    photosOnWall,
    photosInCamera,
    addPhoto,
    deletePhoto,
    downloadPhoto,
    updateCaption,
    moveToWall,
    updatePosition,
    regenerateCaption
  };
};

export default usePhotos;
