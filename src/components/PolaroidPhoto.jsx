import React, { useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { Download, Trash2, Edit2, RefreshCw } from 'lucide-react';
import html2canvas from 'html2canvas';

/**
 * PolaroidPhoto component - Displays a draggable polaroid-style photo
 */
const PolaroidPhoto = ({
  photo,
  onDelete,
  onUpdate,
  onRefreshCaption,
  onMoveToWall,
  onUpdatePosition,
  isInCamera = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isTextHovered, setIsTextHovered] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editText, setEditText] = useState(photo.caption);
  const [isTouching, setIsTouching] = useState(false);
  const inputRef = useRef(null);

  const handleDragEnd = (event, info) => {
    if (isInCamera) {
      onMoveToWall(photo.id, { x: info.point.x, y: info.point.y });
    } else {
      onUpdatePosition(photo.id, { x: info.point.x, y: info.point.y });
    }
  };

  const handleEdit = () => {
    setIsEditing(true);
    setEditText(photo.caption);
    setTimeout(() => inputRef.current?.focus(), 0);
  };

  const handleSave = () => {
    onUpdate(photo.id, { caption: editText });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setEditText(photo.caption);
    setIsEditing(false);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      handleSave();
    } else if (e.key === 'Escape') {
      handleCancel();
    }
  };

  const handleRefresh = () => {
    onRefreshCaption(photo);
  };

  const handleDoubleClick = () => {
    if (!isEditing) {
      handleEdit();
    }
  };

  const handleDownload = async () => {
    const photoElement = document.getElementById(`photo-${photo.id}`);
    if (!photoElement) return;

    try {
      const canvas = await html2canvas(photoElement, {
        backgroundColor: '#ffffff',
        scale: 2
      });

      const link = document.createElement('a');
      link.download = `retro-photo-${photo.id}.png`;
      link.href = canvas.toDataURL();
      link.click();
    } catch (error) {
      console.error('Error downloading photo:', error);
    }
  };

  return (
    <motion.div
      id={`photo-${photo.id}`}
      drag
      dragMomentum={false}
      onDragEnd={handleDragEnd}
      className="absolute cursor-move select-none touch-none"
      style={{
        x: photo.position.x,
        y: photo.position.y,
        width: isInCamera ? '100%' : 'min(85vw, 300px)',
      }}
      initial={isInCamera ? { opacity: 1 } : { opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onTouchStart={() => setIsTouching(true)}
      onTouchEnd={() => setTimeout(() => setIsTouching(false), 200)}
    >
      {/* Polaroid Card */}
      <div className="bg-white p-3 md:p-4 shadow-2xl" style={{ aspectRatio: '3/4' }}>
        {/* Photo Area */}
        <div
          className="relative bg-gray-200 mb-3 overflow-hidden"
          style={{ height: '70%' }}
        >
          <img
            src={photo.image}
            alt="Captured moment"
            className={`w-full h-full object-cover transition-all duration-3000 ${
              photo.isDeveloping ? 'blur-lg opacity-30' : 'blur-0 opacity-100'
            }`}
          />
          {photo.isDeveloping && (
            <div className="absolute inset-0 bg-white/60 flex items-center justify-center">
              <span className="text-2xl text-gray-600">Developing...</span>
            </div>
          )}
        </div>

        {/* Text Area */}
        <div className="space-y-1 md:space-y-2">
          <div className="text-base md:text-xl text-gray-700 font-bold">{photo.date}</div>

          <div
            className="relative"
            onMouseEnter={() => setIsTextHovered(true)}
            onMouseLeave={() => setIsTextHovered(false)}
            onDoubleClick={handleDoubleClick}
          >
            {isEditing ? (
              <textarea
                ref={inputRef}
                value={editText}
                onChange={(e) => setEditText(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={handleSave}
                className="w-full text-base md:text-xl text-gray-800 bg-gray-50 border-2 border-amber-300 rounded p-2 font-handwritten resize-none"
                rows={3}
              />
            ) : (
              <div className="text-base md:text-xl text-gray-800 min-h-[50px] md:min-h-[60px]">
                {photo.isGenerating ? (
                  <span className="italic text-gray-500">Generating caption...</span>
                ) : (
                  photo.caption
                )}
              </div>
            )}

            {/* Edit Icons */}
            {(isTextHovered || isTouching) && !isEditing && !photo.isGenerating && (
              <div className="absolute top-0 right-0 flex gap-2 bg-white/90 p-1 rounded shadow-lg">
                <button
                  onClick={handleEdit}
                  className="p-1 hover:bg-amber-100 rounded active:bg-amber-200"
                  aria-label="Edit caption"
                >
                  <Edit2 size={16} className="text-amber-700 md:w-[18px] md:h-[18px]" />
                </button>
                <button
                  onClick={handleRefresh}
                  className="p-1 hover:bg-amber-100 rounded active:bg-amber-200"
                  aria-label="Regenerate caption"
                >
                  <RefreshCw size={16} className="text-amber-700 md:w-[18px] md:h-[18px]" />
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Hover Toolbar */}
      {(isHovered || isTouching) && !photo.isDeveloping && photo.onWall && (
        <div className="absolute -top-10 md:-top-12 left-1/2 -translate-x-1/2 flex gap-2 bg-white/95 p-1.5 md:p-2 rounded-lg shadow-lg">
          <button
            onClick={handleDownload}
            className="p-1.5 md:p-2 hover:bg-amber-100 active:bg-amber-200 rounded transition-colors"
            aria-label="Download photo"
          >
            <Download size={18} className="text-amber-700 md:w-5 md:h-5" />
          </button>
          <button
            onClick={() => onDelete(photo.id)}
            className="p-1.5 md:p-2 hover:bg-red-100 active:bg-red-200 rounded transition-colors"
            aria-label="Delete photo"
          >
            <Trash2 size={18} className="text-red-600 md:w-5 md:h-5" />
          </button>
        </div>
      )}
    </motion.div>
  );
};

export default PolaroidPhoto;
