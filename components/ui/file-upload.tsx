"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Loader2, Upload, X } from "lucide-react";
import { useEdgeStore } from "@/lib/edgestore";

interface FileUploadProps {
  onUpload: (fileData: {
    fileName: string;
    fileUrl: string;
    fileType: string;
    fileSize: number;
  }) => void;
  accept?: string;
  multiple?: boolean;
  maxSize?: number; // en bytes
  disabled?: boolean;
  className?: string;
  buttonText?: string;
  bucket?: "publicFiles" | "kanbanAttachments";
}

export function FileUpload({
  onUpload,
  accept = ".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.xls,.xlsx,.ppt,.pptx",
  multiple = false,
  maxSize = 10 * 1024 * 1024, // 10MB par défaut
  disabled = false,
  className = "",
  buttonText = "Sélectionner des fichiers",
  bucket = "kanbanAttachments",
}: FileUploadProps) {
  const { edgestore } = useEdgeStore();
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files || []);

    // Validation de la taille
    const oversizedFiles = files.filter((file) => file.size > maxSize);
    if (oversizedFiles.length > 0) {
      alert(
        `Les fichiers suivants sont trop volumineux (max ${Math.round(
          maxSize / 1024 / 1024
        )}MB): ${oversizedFiles.map((f) => f.name).join(", ")}`
      );
      return;
    }

    setSelectedFiles(files);
  };

  const handleUpload = async () => {
    if (selectedFiles.length === 0) return;

    setIsUploading(true);
    setUploadProgress(0);

    try {
      for (let i = 0; i < selectedFiles.length; i++) {
        const file = selectedFiles[i];

        // Upload avec EdgeStore
        const uploadedFile = await edgestore[bucket].upload({
          file: file,
          options: {
            replaceTargetUrl: undefined,
          },
          onProgressChange: (progress) => {
            setUploadProgress(progress);
          },
        });

        if (uploadedFile) {
          // Appeler la fonction de callback avec les données du fichier
          onUpload({
            fileName: file.name,
            fileUrl: uploadedFile.url,
            fileType: file.type || "application/octet-stream",
            fileSize: file.size,
          });
        }
      }

      // Réinitialiser après upload réussi
      setSelectedFiles([]);
      setUploadProgress(0);
    } catch (error) {
      console.error("Erreur lors de l'upload:", error);
      alert("Erreur lors de l'upload des fichiers");
    } finally {
      setIsUploading(false);
    }
  };

  const removeFile = (index: number) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const clearFiles = () => {
    setSelectedFiles([]);
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Sélection de fichiers */}
      <div className="space-y-2">
        <input
          type="file"
          multiple={multiple}
          accept={accept}
          onChange={handleFileSelect}
          className="hidden"
          id="file-upload-input"
          disabled={disabled || isUploading}
        />
        <label
          htmlFor="file-upload-input"
          className={`flex items-center justify-center w-full h-32 border-2 border-dashed rounded-lg cursor-pointer transition-colors ${
            disabled || isUploading
              ? "border-gray-300 bg-gray-50 cursor-not-allowed"
              : "border-gray-300 hover:border-primary hover:bg-gray-50"
          }`}
        >
          <div className="flex flex-col items-center space-y-2">
            <Upload className="w-8 h-8 text-gray-400" />
            <div className="text-sm text-gray-600">
              <span className="font-medium text-primary hover:underline">
                Cliquez pour sélectionner
              </span>{" "}
              ou glissez-déposez
            </div>
            <p className="text-xs text-gray-500">
              {accept} (max {Math.round(maxSize / 1024 / 1024)}MB)
            </p>
          </div>
        </label>
      </div>

      {/* Liste des fichiers sélectionnés */}
      {selectedFiles.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-medium text-gray-700">
              Fichiers sélectionnés ({selectedFiles.length})
            </h4>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={clearFiles}
              disabled={isUploading}
            >
              <X className="w-4 h-4 mr-1" />
              Effacer
            </Button>
          </div>

          <div className="space-y-2 max-h-40 overflow-y-auto">
            {selectedFiles.map((file, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-2 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-primary/10 rounded flex items-center justify-center">
                    <Upload className="w-4 h-4 text-primary" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-gray-900 truncate">
                      {file.name}
                    </p>
                    <p className="text-xs text-gray-500">
                      {(file.size / 1024 / 1024).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => removeFile(index)}
                  disabled={isUploading}
                  className="text-red-600 hover:text-red-700"
                >
                  <X className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Barre de progression */}
      {isUploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Upload en cours...</span>
            <span>{uploadProgress}%</span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2">
            <div
              className="bg-primary h-2 rounded-full transition-all duration-300"
              style={{ width: `${uploadProgress}%` }}
            />
          </div>
        </div>
      )}

      {/* Bouton d'upload */}
      {selectedFiles.length > 0 && (
        <Button
          onClick={handleUpload}
          disabled={isUploading || disabled}
          className="w-full"
        >
          {isUploading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Upload en cours...
            </>
          ) : (
            <>
              <Upload className="w-4 h-4 mr-2" />
              {buttonText}
            </>
          )}
        </Button>
      )}
    </div>
  );
}
