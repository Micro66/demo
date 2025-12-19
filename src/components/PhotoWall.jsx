import React from 'react';
import PolaroidPhoto from './PolaroidPhoto';

/**
 * PhotoWall component - Displays all photos that have been moved to the wall
 */
const PhotoWall = ({
  photos,
  onDelete,
  onDownload,
  onUpdateCaption,
  onMoveToWall,
  onUpdatePosition,
  onRegenerateCaption
}) => {
  return (
    <>
      {photos.map(photo => (
        <PolaroidPhoto
          key={photo.id}
          photo={photo}
          onDelete={onDelete}
          onDownload={onDownload}
          onUpdateCaption={onUpdateCaption}
          onMoveToWall={onMoveToWall}
          onUpdatePosition={onUpdatePosition}
          onRegenerateCaption={onRegenerateCaption}
        />
      ))}
    </>
  );
};

export default PhotoWall;
