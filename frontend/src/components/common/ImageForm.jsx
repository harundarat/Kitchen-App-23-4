import React, { useState, useEffect } from "react";

export default function ImageForm({
  children,
  id,
  name,
  label,
  onChange,
  ...rest
}) {
  const [selectedImage, setSelectedImage] = useState(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState(null);
  useEffect(() => {
    onChange(selectedImage, imagePreviewUrl);
  }, [selectedImage, imagePreviewUrl]);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {label && (
        <label className="text-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        id={id}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
      {/* {children} */}
    </div>
  );
}
