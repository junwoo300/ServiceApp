import React, { useState } from 'react';
import UploadButton from './UploadButton';
import ImageDisplay from './ImageDisplay';

const ImageUploader = () => {
  const [imageUrl, setImageUrl] = useState(null);

  const handleUpload = (imageData) => {
    setImageUrl(imageData);
  };

  return (
    <div className="image-upload-panel">
      <div className="image-upload-header">
        <div>
          <span className="section-tag">Asset</span>
          <h2>อัปโหลดและแสดงรูปภาพ</h2>
        </div>
        <div className="mini-stat-card">
          <span>Preview</span>
          <strong>{imageUrl ? 'Ready' : 'Waiting'}</strong>
        </div>
      </div>

      <UploadButton onUpload={handleUpload} />
      {imageUrl ? <ImageDisplay imageUrl={imageUrl} /> : <div className="upload-placeholder">เลือกไฟล์ภาพเพื่อแสดงตัวอย่าง</div>}
    </div>
  );
};

export default ImageUploader;