"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  disabled?: boolean;
}

export const ImageUpload = ({
  onUpload,
  currentUrl,
  disabled = false,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { edgestore } = useEdgeStore();

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      const uploadedFile = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: currentUrl || undefined,
        },
      });

      if (uploadedFile.url) {
        onUpload(uploadedFile.url);
        toast.success(`Photo de profil "${file.name}" mise à jour`);
      } else {
        toast.error("Erreur lors de l'upload");
      }
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      toast.error("Erreur lors de l'upload de l'image");
    } finally {
      setUploading(false);
    }
  };

  const handleImageSelect = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        handleImageUpload(file);
      }
    };
    input.click();
  };

  return (
    <Button
      variant="outline"
      size="icon"
      className="absolute bottom-0 right-0 rounded-full"
      type="button"
      disabled={disabled || uploading}
      onClick={handleImageSelect}
    >
      {uploading ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : (
        <Camera className="h-4 w-4" />
      )}
    </Button>
  );
};
