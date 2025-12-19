import { useState, useCallback } from 'react';
import { generateImageCaption } from '../services';
import { getUserLanguage, formatDate, dataUrlToBlob } from '../utils';
import { ANIMATION_TIMING } from '../constants';

/**
 * Create a new photo object
 * @param {string} imageData - Base64 image data
 * @returns {Object} Photo object
 */
const createPhotoObject = (imageData) => {
  const userLang = getUserLanguage();
  return {
    id: Date.now(),
    image: imageData,
    date: formatDate(new Date(), userLang),
    caption: '',
    isGenerating: true,
    isDeveloping: true,
    position: { x: 0, y: 0 },
    onWall: false
  };
};

/**
 * Custom hook for managing photos state
 * @returns {Object} Photos state and handlers
 */
export const usePhotos = () => {
  const [photos, setPhotos] = useState([]);

  const addPhoto = useCallback((imageData) => {
    const newPhoto = createPhotoObject(imageData);
    setPhotos(prev => [...prev, newPhoto]);
    return newPhoto;
  }, []);

  const updatePhoto = useCallback((photoId, updates) => {
    setPhotos(prev => prev.map(p =>
      p.id === photoId ? { ...p, ...updates } : p
    ));
  }, []);

  const deletePhoto = useCallback((photoId) => {
    setPhotos(prev => prev.filter(p => p.id !== photoId));
  }, []);

  const generateCaption = useCallback(async (imageBlob, photoId) => {
    const userLang = getUserLanguage();
    const caption = await generateImageCaption(imageBlob, userLang);
    updatePhoto(photoId, { caption, isGenerating: false });
  }, [updatePhoto]);

  const refreshCaption = useCallback(async (photo) => {
    updatePhoto(photo.id, { isGenerating: true });
    const imageBlob = await dataUrlToBlob(photo.image);
    await generateCaption(imageBlob, photo.id);
  }, [updatePhoto, generateCaption]);

  const moveToWall = useCallback((photoId, position) => {
    updatePhoto(photoId, { onWall: true, position });
  }, [updatePhoto]);

  const updatePosition = useCallback((photoId, position) => {
    updatePhoto(photoId, { position });
  }, [updatePhoto]);

  const finishDeveloping = useCallback((photoId) => {
    updatePhoto(photoId, { isDeveloping: false });
  }, [updatePhoto]);

  const handlePhotoCapture = useCallback(async (imageData) => {
    const newPhoto = addPhoto(imageData);
    const imageBlob = await dataUrlToBlob(imageData);

    // Generate caption
    generateCaption(imageBlob, newPhoto.id);

    // Stop developing effect after animation
    setTimeout(() => {
      finishDeveloping(newPhoto.id);
    }, ANIMATION_TIMING.ejection + ANIMATION_TIMING.developing);

    return newPhoto;
  }, [addPhoto, generateCaption, finishDeveloping]);

  return {
    photos,
    addPhoto,
    updatePhoto,
    deletePhoto,
    generateCaption,
    refreshCaption,
    moveToWall,
    updatePosition,
    finishDeveloping,
    handlePhotoCapture
  };
};
