"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Camera, Upload } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";
import { toast } from "sonner";

interface ImageUploadProps {
  onUpload: (url: string) => void;
  currentUrl?: string;
  disabled?: boolean;
  variant?: "icon" | "button";
  uploadText?: string;
  successMessage?: string;
}

export const ImageUpload = ({
  onUpload,
  currentUrl,
  disabled = false,
  variant = "icon",
  uploadText = "Choisir une image",
  successMessage,
}: ImageUploadProps) => {
  const [uploading, setUploading] = useState(false);
  const { edgestore } = useEdgeStore();

  const handleImageUpload = async (file: File) => {
    try {
      setUploading(true);

      // Validation de la taille du fichier (max 5MB pour les logos)
      if (file.size > 5 * 1024 * 1024) {
        toast.error("Le fichier est trop volumineux (max 5MB)");
        return;
      }

      // Validation du type de fichier
      if (!file.type.startsWith("image/")) {
        toast.error("Seuls les fichiers image sont acceptés");
        return;
      }

      const uploadedFile = await edgestore.publicFiles.upload({
        file,
        options: {
          replaceTargetUrl: currentUrl || undefined,
        },
      });

      if (uploadedFile.url) {
        onUpload(uploadedFile.url);
        toast.success(
          successMessage || `Image "${file.name}" uploadée avec succès`
        );
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

  if (variant === "button") {
    return (
      <Button
        variant="outline"
        type="button"
        disabled={disabled || uploading}
        onClick={handleImageSelect}
        className="w-full"
      >
        {uploading ? (
          <>
            <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            Upload en cours...
          </>
        ) : (
          <>
            <Upload className="h-4 w-4 mr-2" />
            {uploadText}
          </>
        )}
      </Button>
    );
  }

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
