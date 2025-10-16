
"use client";

import { useState, useRef } from 'react';
import ReactCrop, { type Crop, centerCrop, makeAspectCrop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Slider } from './ui/slider';
import { RotateCw, ZoomIn, ZoomOut } from 'lucide-react';

interface CropperImageProps {
  imageSrc: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCropComplete: (blob: Blob) => void;
}

function centerAspectCrop(mediaWidth: number, mediaHeight: number, aspect: number): Crop {
  return centerCrop(
    makeAspectCrop({ unit: '%', width: 90 }, aspect, mediaWidth, mediaHeight),
    mediaWidth,
    mediaHeight
  );
}

export function CropperImage({ imageSrc, open, onOpenChange, onCropComplete }: CropperImageProps) {
  const imgRef = useRef<HTMLImageElement>(null);
  const [crop, setCrop] = useState<Crop>();
  const [completedCrop, setCompletedCrop] = useState<Crop>();
  const [scale, setScale] = useState(1);
  const [rotate, setRotate] = useState(0);
  const aspect = 1;

  function onImageLoad(e: React.SyntheticEvent<HTMLImageElement>) {
    const { width, height } = e.currentTarget;
    setCrop(centerAspectCrop(width, height, aspect));
    setCompletedCrop(centerAspectCrop(width, height, aspect));
  }

  async function handleCrop() {
    if (completedCrop?.width && completedCrop?.height && imgRef.current) {
        const croppedBlob = await getCroppedImg(imgRef.current, completedCrop, scale, rotate);
        onCropComplete(croppedBlob);
        onOpenChange(false);
    }
  }

  function getCroppedImg(image: HTMLImageElement, crop: Crop, scale = 1, rotate = 0): Promise<Blob> {
    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        if (!ctx) {
            reject(new Error('No 2d context'));
            return;
        }

        const scaleX = image.naturalWidth / image.width;
        const scaleY = image.naturalHeight / image.height;
        
        const pixelRatio = window.devicePixelRatio || 1;

        canvas.width = Math.floor(crop.width * scaleX * pixelRatio);
        canvas.height = Math.floor(crop.height * scaleY * pixelRatio);

        ctx.scale(pixelRatio, pixelRatio);
        ctx.imageSmoothingQuality = 'high';

        const cropX = crop.x * scaleX;
        const cropY = crop.y * scaleY;

        const rotateRads = rotate * Math.PI / 180;
        const centerX = image.naturalWidth / 2;
        const centerY = image.naturalHeight / 2;

        ctx.save();
        
        ctx.translate(-cropX, -cropY);
        ctx.translate(centerX, centerY);
        ctx.rotate(rotateRads);
        ctx.scale(scale, scale);
        ctx.translate(-centerX, -centerY);
        ctx.drawImage(
            image,
            0,
            0,
            image.naturalWidth,
            image.naturalHeight,
        );

        ctx.restore();

        canvas.toBlob((blob) => {
            if (!blob) {
                reject(new Error('Canvas is empty'));
                return;
            }
            resolve(blob);
        }, 'image/jpeg', 0.95);
    });
  }
  
  // Reset state when closing the dialog
  const handleOpenChange = (isOpen: boolean) => {
    if (!isOpen) {
      setTimeout(() => {
        setScale(1);
        setRotate(0);
        setCrop(undefined);
        setCompletedCrop(undefined);
      }, 300); // delay to allow animation to finish
    }
    onOpenChange(isOpen);
  };

  if (!imageSrc) return null;

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="max-w-md md:max-w-lg">
        <DialogHeader>
          <DialogTitle>Cortar Imagem</DialogTitle>
          <DialogDescription>Ajuste a imagem para o seu perfil. Use os controles para dar zoom e girar.</DialogDescription>
        </DialogHeader>
        <div className="flex justify-center items-center overflow-hidden h-64 md:h-80 bg-muted/50 rounded-md my-4">
          <ReactCrop
            crop={crop}
            onChange={(_, percentCrop) => setCrop(percentCrop)}
            onComplete={(c) => setCompletedCrop(c)}
            aspect={aspect}
            circularCrop
          >
            <img
              ref={imgRef}
              alt="Crop me"
              src={imageSrc}
              style={{ transform: `scale(${scale}) rotate(${rotate}deg)`, maxHeight: '70vh' }}
              onLoad={onImageLoad}
            />
          </ReactCrop>
        </div>
        <div className="space-y-4">
            <div className='space-y-2'>
                <label className="text-sm font-medium">Zoom</label>
                <div className="flex items-center gap-2">
                    <ZoomOut className="h-5 w-5 text-muted-foreground" />
                    <Slider defaultValue={[1]} min={1} max={3} step={0.1} value={[scale]} onValueChange={(value) => setScale(value[0])} />
                    <ZoomIn className="h-5 w-5 text-muted-foreground" />
                </div>
            </div>
            <div className='space-y-2'>
                 <label className="text-sm font-medium">Girar</label>
                 <Button variant="outline" className="w-full" onClick={() => setRotate(r => (r + 90) % 360)}>
                    <RotateCw className="mr-2 h-4 w-4" /> Girar 90°
                </Button>
            </div>
        </div>
        <DialogFooter className="pt-4 flex-col-reverse sm:flex-row sm:justify-end gap-2">
          <Button variant="ghost" onClick={() => handleOpenChange(false)}>Cancelar</Button>
          <Button onClick={handleCrop}>Salvar Foto</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
