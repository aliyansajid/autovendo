import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
} from "@repo/ui/components/card";
import { UploadCloud, X } from "lucide-react";
import { useFormContext } from "react-hook-form";
import { Dispatch, SetStateAction } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@repo/ui/components/button";
import { toast } from "sonner";

export function MediaSection({
  previewImages,
  setPreviewImages,
}: {
  previewImages: string[];
  setPreviewImages: Dispatch<SetStateAction<string[]>>;
}) {
  const t = useTranslations("VehicleFormSections");
  const { setValue, watch, formState } = useFormContext<any>();

  // We purposefully do not revoke blob URLs on component unmount because the review step uses them.
  // Instead, we only revoke them when the user explicitly removes an image.

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 0) {
      const currentImages = watch("images") || [];
      if (currentImages.length + files.length > 10) {
        toast.error(t("mediaLimitError"));
        return;
      }

      const newPreviews = files.map((file) => URL.createObjectURL(file));
      setPreviewImages((prev) => [...prev, ...newPreviews]);
      setValue("images", [...currentImages, ...files], { shouldDirty: true });
    }
  };

  const removeImage = (index: number) => {
    const urlToRemove = previewImages[index];
    if (urlToRemove && urlToRemove.startsWith("blob:")) {
      URL.revokeObjectURL(urlToRemove);
    }

    setPreviewImages((prev) => prev.filter((_, i) => i !== index));
    const currentImages = watch("images") || [];
    if (Array.isArray(currentImages)) {
      setValue(
        "images",
        currentImages.filter((_, i) => i !== index),
        { shouldDirty: true },
      );
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("mediaTitle")}</CardTitle>
        <CardDescription>{t("mediaDesc")}</CardDescription>
      </CardHeader>
      <CardContent>
        {formState?.errors?.images?.message && (
          <div className="mb-4 text-sm font-medium text-destructive animate-in fade-in slide-in-from-top-1">
            {formState.errors.images.message as string}
          </div>
        )}

        {previewImages.length > 0 && previewImages.length < 5 && (
          <div className="mb-4 p-3 rounded-lg bg-orange-500/10 border border-orange-500/20 text-orange-600 dark:text-orange-400 text-sm animate-in fade-in slide-in-from-top-1">
            {t("mediaMinNeeded", { count: 5 - previewImages.length })}
          </div>
        )}
        <div className="border-2 border-dashed rounded-lg h-60 w-full flex flex-col items-center justify-center cursor-pointer hover:bg-muted/50 transition-colors hover:border-primary/50 relative">
          <div className="flex flex-col items-center gap-4 text-center pointer-events-none">
            <div className="p-4 rounded-full bg-primary/10">
              <UploadCloud className="h-8 w-8 text-primary" />
            </div>
            <div className="space-y-1">
              <h3 className="text-lg font-semibold">{t("mediaClickUpload")}</h3>
              <p className="text-sm text-muted-foreground">
                WEBP, PNG, JPG, JPEG
              </p>
            </div>
          </div>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
            onChange={handleImageUpload}
          />
        </div>

        {previewImages.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 animate-in fade-in slide-in-from-bottom-2">
            {previewImages.map((src, index) => {
              const fullSrc =
                src.startsWith("blob:") || src.startsWith("http")
                  ? src
                  : `${process.env.NEXT_PUBLIC_R2_PUBLIC_DOMAIN || ""}/${src}`;

              return (
                <div
                  key={index}
                  className="relative aspect-video group rounded-lg overflow-hidden border bg-muted"
                >
                  {/* Using standard img tag to prevent Next.js Image component failing on blob:// URLs */}
                  <img
                    src={fullSrc}
                    alt={`${t("mediaPreview")} ${index + 1}`}
                    className="object-cover w-full h-full rounded-md transition-transform group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <Button
                      variant="destructive"
                      type="button"
                      size="icon"
                      onClick={() => removeImage(index)}
                      className="rounded-full"
                    >
                      <X />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
