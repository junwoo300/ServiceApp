import React from 'react';

const UploadButton = ({ onUpload }) => {
  const handleUpload = (event) => {
    const file = event.target.files[0];
    const reader = new FileReader();
    reader.onloadend = () => {
      onUpload(reader.result);
    };
    if (file) {
      reader.readAsDataURL(file);
    }
  };

  return (
    <label className="image-upload-button">
      <input type="file" accept="image/*" onChange={handleUpload} />
      <span>Choose image</span>
    </label>
  );
};

export default UploadButton;
