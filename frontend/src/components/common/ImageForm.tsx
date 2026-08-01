import { useEffect, useState, type InputHTMLAttributes } from "react";

interface ImageFormProps extends Omit<
  InputHTMLAttributes<HTMLInputElement>,
  "onChange" | "type"
> {
  id: string;
  label?: string;
  onChange: (file: File | null, previewUrl: string | null) => void;
}

export default function ImageForm({
  id,
  name,
  label,
  onChange,
  ...props
}: ImageFormProps) {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreviewUrl, setImagePreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    onChange(selectedImage, imagePreviewUrl);
  }, [imagePreviewUrl, onChange, selectedImage]);

  const handleImageChange: InputHTMLAttributes<HTMLInputElement>["onChange"] = (
    event,
  ) => {
    const file = event.currentTarget.files?.[0];
    if (!file) return;
    setSelectedImage(file);
    const reader = new FileReader();
    reader.onloadend = () => {
      setImagePreviewUrl(
        typeof reader.result === "string" ? reader.result : null,
      );
    };
    reader.readAsDataURL(file);
  };

  return (
    <div>
      {label && (
        <label className="text-primary" htmlFor={id}>
          {label}
        </label>
      )}
      <input
        {...props}
        id={id}
        name={name}
        type="file"
        accept="image/*"
        onChange={handleImageChange}
        className="hidden"
      />
    </div>
  );
}
