import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { UploadCloud, X } from "lucide-react";
import Image from "next/image";
import { useFormContext } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { Button } from "@repo/ui/components/button";

export function MediaSection({
  previewImages,
  setPreviewImages,
}: {
  previewImages: string[];
  setPreviewImages: Dispatch<SetStateAction<string[]>>;
}) {
  const { setValue, watch } = useFormContext();

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);

      const currentImages = watch("images") || [];
      setValue("images", [...currentImages, ...files]);
    }
  };

  const removeImage = (index: number) => {
    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    const currentImages = watch("images") || [];
    if (Array.isArray(currentImages)) {
      setValue(
        "images",
        currentImages.filter((_, i) => i !== index),
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Vehicle Images</CardTitle>
        <CardDescription>
          Add photos of your vehicle. High quality photos increase your chances
          of selling.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="border-2 border-dashed rounded-lg h-60 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors hover:border-primary/50 relative">
          <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">Click to upload photos</h3>
              <p className="text-sm text-muted-foreground">
                WEBP, PNG, JPG, JPEG
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/*"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>

        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2">
            {previewImages.map((src, index) => (
              <div
                key={index}
                className="relative aspect-video group rounded-lg overflow-hidden border bg-muted"
              >
                <Image
                  src={src}
                  alt={`Vehicle preview ${index + 1}`}
                  fill
                  className="object-cover transition-transform group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button
                    variant="destructive"
                    type="button"
                    onClick={() => removeImage(index)}
                    className="rounded-full h-10 w-10 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
