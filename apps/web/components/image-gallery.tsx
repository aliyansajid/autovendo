"use client";

import * as React from "react";
import Image from "next/image";
import { cn } from "@repo/ui/lib/utils";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@repo/ui/components/carousel";
import {
  Dialog,
  DialogContent,
  DialogTrigger,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { Maximize2 } from "lucide-react";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [mainApi, setMainApi] = React.useState<CarouselApi>();
  const [thumbApi, setThumbApi] = React.useState<CarouselApi>();
  const [lightboxApi, setLightboxApi] = React.useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = React.useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = React.useState(false);

  // Sync main carousel to thumbnail, and update active index
  React.useEffect(() => {
    if (!mainApi) return;

    const onSelect = () => {
      const index = mainApi.selectedScrollSnap();
      setActiveIndex(index);
      if (thumbApi) {
        thumbApi.scrollTo(index);
      }
    };

    mainApi.on("select", onSelect);
    return () => {
      mainApi.off("select", onSelect);
    };
  }, [mainApi, thumbApi]);

  // Sync lightly when opening lightbox
  React.useEffect(() => {
    if (isLightboxOpen && lightboxApi) {
      lightboxApi.scrollTo(activeIndex, true); // jump to current active index without animation
    }
  }, [isLightboxOpen, lightboxApi, activeIndex]);

  // Sync main when lightbox changes
  React.useEffect(() => {
    if (!lightboxApi) return;

    const onLightboxSelect = () => {
      const index = lightboxApi.selectedScrollSnap();
      if (mainApi) {
        mainApi.scrollTo(index, true);
      }
    };

    lightboxApi.on("select", onLightboxSelect);
    return () => {
      lightboxApi.off("select", onLightboxSelect);
    };
  }, [lightboxApi, mainApi]);

  const onThumbClick = React.useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi],
  );

  if (!images?.length) return null;

  return (
    <div className="space-y-4">
      <Dialog open={isLightboxOpen} onOpenChange={setIsLightboxOpen}>
        <div className="rounded-xl overflow-hidden shadow-sm border bg-background group relative">
          <Carousel setApi={setMainApi} className="w-full">
            <CarouselContent>
              {images.map((src, index) => (
                <CarouselItem key={index}>
                  <div
                    className="relative aspect-video w-full cursor-zoom-in"
                    onClick={() => setIsLightboxOpen(true)}
                  >
                    <Image
                      src={src}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-cover"
                      priority={index === 0}
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>

            <div className="absolute top-4 right-4 z-10 opacity-0 group-hover:opacity-100 transition-opacity">
              <DialogTrigger asChild>
                <button
                  type="button"
                  className="bg-black/50 hover:bg-black/70 text-white p-2 rounded-full backdrop-blur-sm transition-colors"
                  aria-label="Open fullscreen"
                >
                  <Maximize2 className="w-4 h-4" />
                </button>
              </DialogTrigger>
            </div>

            <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-none shadow-md hidden sm:flex" />
            <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-white/80 hover:bg-white border-none shadow-md hidden sm:flex" />
          </Carousel>
        </div>

        {images.length > 1 && (
          <Carousel
            setApi={setThumbApi}
            opts={{
              align: "start",
              dragFree: true,
            }}
            className="w-full"
          >
            <CarouselContent className="-ml-3">
              {images.map((src, index) => (
                <CarouselItem
                  key={index}
                  className="pl-3 basis-1/4 sm:basis-1/5 lg:basis-1/6"
                >
                  <button
                    type="button"
                    onClick={() => onThumbClick(index)}
                    className={cn(
                      "relative aspect-video w-full rounded-lg overflow-hidden transition-all duration-200 border-2",
                      activeIndex === index
                        ? "border-primary shadow-sm"
                        : "border-transparent opacity-60 hover:opacity-100",
                    )}
                  >
                    <Image
                      src={src}
                      alt={`Thumbnail ${index + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>
        )}

        <DialogContent
          className="max-w-7xl w-[95vw] h-[90vh] p-0 border-none bg-black/95 flex flex-col justify-center gap-0 overflow-hidden sm:rounded-2xl"
          showCloseButton={true}
        >
          <div className="absolute top-4 left-4 z-50">
            <DialogTitle className="text-white text-lg font-medium opacity-80">
              {activeIndex + 1} / {images.length}
            </DialogTitle>
          </div>
          <Carousel
            setApi={setLightboxApi}
            className="w-full h-full flex-1 flex flex-col items-center justify-center min-h-0"
          >
            <CarouselContent className="h-full flex-1">
              {images.map((src, index) => (
                <CarouselItem
                  key={index}
                  className="flex items-center justify-center p-2 sm:p-12 relative w-full h-full"
                >
                  <div className="relative w-full h-full">
                    <Image
                      src={src}
                      alt={`${title} - Fullscreen Image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
            <CarouselPrevious
              className="left-2 sm:left-4 bg-white/10 text-white border-none hover:bg-white/20 hover:text-white"
              variant="ghost"
            />
            <CarouselNext
              className="right-2 sm:right-4 bg-white/10 text-white border-none hover:bg-white/20 hover:text-white"
              variant="ghost"
            />
          </Carousel>
        </DialogContent>
      </Dialog>
    </div>
  );
}
