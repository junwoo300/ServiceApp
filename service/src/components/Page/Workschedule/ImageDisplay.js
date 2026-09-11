import React from 'react';

const ImageDisplay = ({ imageUrl }) => {
  return (
    <div className="image-preview-wrap">
      <img src={imageUrl} alt="Uploaded preview" className="image-preview" />
    </div>
  );
};

export default ImageDisplay;
