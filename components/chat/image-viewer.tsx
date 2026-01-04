'use client';
import { DialogTitle } from '@radix-ui/react-dialog';
import { Download, X, ZoomIn, ZoomOut } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTrigger,
} from '@/components/ui/dialog';
import { cn } from '@/lib/utils';

interface ImageViewerProps {
  src: string;
  alt: string;
  className?: string;
  thumbnailClassName?: string;
}

export function ImageViewer({
  src,
  alt,
  className,
  thumbnailClassName,
}: ImageViewerProps) {
  const [open, setOpen] = useState(false);
  const [zoom, setZoom] = useState(1);

  const handleZoomIn = () => setZoom((prev) => Math.min(prev + 0.25, 3));
  const handleZoomOut = () => setZoom((prev) => Math.max(prev - 0.25, 0.5));
  const handleReset = () => setZoom(1);

  const handleDownload = async () => {
    try {
      const response = await fetch(src);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = alt || 'image';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <div
          className={cn(
            'relative cursor-pointer overflow-hidden rounded-lg group',
            className,
          )}
        >
          <Image
            src={src}
            alt={alt}
            width={300}
            height={300}
            className={cn(
              'object-cover transition-transform duration-300 hover:scale-105',
              thumbnailClassName,
            )}
          />
          <div className='absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300 flex items-center justify-center'>
            <ZoomIn
              className='text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300'
              size={32}
            />
          </div>
        </div>
      </DialogTrigger>

      <DialogContent
        className='min-w-[95vw] w-full h-[95vh] p-0 gap-0 '
        onOpenAutoFocus={(e) => e.preventDefault()}
      >
        <DialogHeader className='sr-only'>
          <DialogTitle>{alt}</DialogTitle>
        </DialogHeader>

        {/* Controls Bar */}
        <div className='absolute top-4 right-4 z-50 flex items-center gap-2'>
          <Button
            variant='secondary'
            size='icon'
            onClick={handleZoomOut}
            disabled={zoom <= 0.5}
          >
            <ZoomOut size={18} />
          </Button>

          <Button
            variant='secondary'
            size='sm'
            onClick={handleReset}
            className=' min-w-15'
          >
            {Math.round(zoom * 100)}%
          </Button>

          <Button
            variant='secondary'
            size='icon'
            onClick={handleZoomIn}
            disabled={zoom >= 3}
          >
            <ZoomIn size={18} />
          </Button>

          <Button variant='secondary' size='icon' onClick={handleDownload}>
            <Download size={18} />
          </Button>

          <Button
            variant='secondary'
            size='icon'
            onClick={() => setOpen(false)}
          >
            <X size={18} />
          </Button>
        </div>

        {/* Image Container */}
        <div className='relative w-full h-full flex items-center justify-center overflow-auto p-8'>
          <div
            className='relative transition-transform duration-200 ease-out'
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
            }}
          >
            <Image
              src={src}
              alt={alt}
              width={1920}
              height={1080}
              className='max-w-full max-h-full w-auto h-auto object-contain'
              quality={100}
              priority
            />
          </div>
        </div>

        {/* Image Caption */}
        {alt && (
          <div className='absolute bottom-0 left-0 right-0 bg-linear-to-t from-black/80 to-transparent p-6 text-white'>
            <p className='text-sm text-center'>{alt}</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
