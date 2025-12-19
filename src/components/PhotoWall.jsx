import React from 'react';
import PolaroidPhoto from './PolaroidPhoto';

/**
 * PhotoWall component - Displays draggable photos on the wall
 */
const PhotoWall = ({ photos, photoHandlers }) => {
  // Filter photos that are on the wall
  const wallPhotos = photos.filter(p => p.onWall);

  return (
    <>
      {wallPhotos.map(photo => (
        <PolaroidPhoto
          key={photo.id}
          photo={photo}
          {...photoHandlers}
        />
      ))}
    </>
  );
};

export default PhotoWall;
