"use client";

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
  DialogClose,
  DialogTitle,
} from "@repo/ui/components/dialog";
import { ChevronLeft, ChevronRight, Maximize, X } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { Button } from "@repo/ui/src/components/button";

interface ImageGalleryProps {
  images: string[];
  title: string;
}

export function ImageGallery({ images, title }: ImageGalleryProps) {
  const [mainApi, setMainApi] = useState<CarouselApi>();
  const [thumbApi, setThumbApi] = useState<CarouselApi>();
  const [lightboxApi, setLightboxApi] = useState<CarouselApi>();
  const [activeIndex, setActiveIndex] = useState(0);
  const [isLightboxOpen, setIsLightboxOpen] = useState(false);

  // Sync main carousel to thumbnail, and update active index
  useEffect(() => {
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
  useEffect(() => {
    if (isLightboxOpen && lightboxApi) {
      lightboxApi.scrollTo(activeIndex, true); // jump to current active index without animation
    }
  }, [isLightboxOpen, lightboxApi, activeIndex]);

  // Sync main when lightbox changes
  useEffect(() => {
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

  const onThumbClick = useCallback(
    (index: number) => {
      if (!mainApi) return;
      mainApi.scrollTo(index);
    },
    [mainApi],
  );

  if (!images?.length) return null;

  return (
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
            <Button
              variant="secondary"
              className="rounded-full size-10"
              aria-label="Open fullscreen"
              onClick={() => setIsLightboxOpen(true)}
            >
              <Maximize />
            </Button>
          </div>

          <CarouselPrevious className="left-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white size-10" />
          <CarouselNext className="right-4 opacity-0 group-hover:opacity-100 transition-opacity bg-primary text-white size-10" />
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
        className="w-screen! h-screen! max-w-none! max-h-none! translate-x-0! translate-y-0! top-0! left-0! rounded-none! p-0 border-none bg-black flex flex-col"
        showCloseButton={false}
      >
        <div className="flex items-center justify-between px-6 py-4 shrink-0">
          <DialogTitle className="text-white text-sm font-semibold opacity-90 truncate max-w-[50%]">
            {title}
          </DialogTitle>
          <span className="text-white/60 text-sm font-medium">
            {activeIndex + 1} / {images.length}
          </span>
          <DialogClose asChild>
            <Button variant="ghost" className="text-white">
              <X />
            </Button>
          </DialogClose>
        </div>

        <div className="flex-1 relative flex items-center min-h-0">
          <button
            onClick={() => lightboxApi?.scrollPrev()}
            className="absolute left-4 z-10 p-2 text-white/50 hover:text-white transition-colors"
            aria-label="Previous image"
          >
            <ChevronLeft className="size-12" />
          </button>

          <Carousel
            setApi={setLightboxApi}
            className="w-full h-full [&>div]:h-full [&>div]:w-full"
          >
            <CarouselContent className="h-full w-full">
              {images.map((src, index) => (
                <CarouselItem key={index} className="relative h-full p-0">
                  <div className="relative w-full h-full">
                    <Image
                      src={src}
                      alt={`${title} - Image ${index + 1}`}
                      fill
                      className="object-contain"
                    />
                  </div>
                </CarouselItem>
              ))}
            </CarouselContent>
          </Carousel>

          <button
            onClick={() => lightboxApi?.scrollNext()}
            className="absolute right-4 z-10 p-2 text-white/50 hover:text-white transition-colors"
            aria-label="Next image"
          >
            <ChevronRight className="size-12" />
          </button>
        </div>

        {images.length > 1 && (
          <div className="shrink-0 px-6 py-4 flex gap-2 overflow-x-auto scrollbar-hide">
            {images.map((src, index) => (
              <button
                key={index}
                onClick={() => lightboxApi?.scrollTo(index)}
                className={cn(
                  "shrink-0 w-24 aspect-video relative rounded overflow-hidden border-2 transition-all",
                  activeIndex === index
                    ? "border-white opacity-100"
                    : "border-transparent opacity-40 hover:opacity-70",
                )}
              >
                <Image
                  src={src}
                  alt={`Thumbnail ${index + 1}`}
                  fill
                  className="object-cover"
                />
              </button>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
