"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Download,
  Trash2,
  Eye,
  File,
  FileImage,
} from "lucide-react";

interface Document {
  id: number;
  nom: string;
  type: string;
  taille: string;
  dateAjout: Date;
  estPrincipal: boolean;
}

const CvPiecesJointesPage = () => {
  const [documents, setDocuments] = useState<Document[]>([
    {
      id: 1,
      nom: "CV_Principal.pdf",
      type: "pdf",
      taille: "2.5 MB",
      dateAjout: new Date("2024-01-15"),
      estPrincipal: true,
    },
    {
      id: 2,
      nom: "Lettre_Motivation.pdf",
      type: "pdf",
      taille: "1.2 MB",
      dateAjout: new Date("2024-01-15"),
      estPrincipal: false,
    },
    {
      id: 3,
      nom: "Photo_Profil.jpg",
      type: "image",
      taille: "500 KB",
      dateAjout: new Date("2024-01-16"),
      estPrincipal: false,
    },
  ]);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [documentType, setDocumentType] = useState<string>("");

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      setSelectedFile(event.target.files[0]);
    }
  };

  const handleUpload = () => {
    if (selectedFile && documentType) {
      const newDocument: Document = {
        id: documents.length + 1,
        nom: selectedFile.name,
        type: selectedFile.type.split("/")[1],
        taille: `${(selectedFile.size / 1024 / 1024).toFixed(1)} MB`,
        dateAjout: new Date(),
        estPrincipal: documentType === "cv",
      };

      setDocuments([...documents, newDocument]);
      setSelectedFile(null);
      setDocumentType("");
    }
  };

  const handleDelete = (id: number) => {
    setDocuments(documents.filter((doc) => doc.id !== id));
  };

  const handleSetPrincipal = (id: number) => {
    setDocuments(
      documents.map((doc) => ({
        ...doc,
        estPrincipal: doc.id === id,
      }))
    );
  };

  const getFileIcon = (type: string) => {
    switch (type) {
      case "pdf":
        return <FileText className="h-6 w-6 text-red-500" />;
      case "image":
        return <FileImage className="h-6 w-6 text-blue-500" />;
      case "doc":
      case "docx":
        return <FileText className="h-6 w-6 text-blue-600" />;
      default:
        return <File className="h-6 w-6 text-gray-500" />;
    }
  };

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">CV et Pièces jointes</h1>
        <div className="flex gap-4">
          <Select value={documentType} onValueChange={setDocumentType}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Type de document" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="cv">CV</SelectItem>
              <SelectItem value="lettre">Lettre de motivation</SelectItem>
              <SelectItem value="photo">Photo de profil</SelectItem>
              <SelectItem value="autre">Autre document</SelectItem>
            </SelectContent>
          </Select>
          <div className="flex items-center gap-2">
            <Input
              type="file"
              onChange={handleFileChange}
              className="hidden"
              id="file-upload"
            />
            <Label
              htmlFor="file-upload"
              className="flex items-center gap-2 cursor-pointer"
            >
              <Upload className="h-4 w-4" />
              <span>Sélectionner un fichier</span>
            </Label>
            {selectedFile && (
              <Button onClick={handleUpload}>Télécharger</Button>
            )}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {documents.map((document) => (
          <Card key={document.id}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="flex items-start gap-3">
                  {getFileIcon(document.type)}
                  <div>
                    <h3 className="font-semibold">{document.nom}</h3>
                    <div className="text-sm text-muted-foreground">
                      {document.taille} •{" "}
                      {document.dateAjout.toLocaleDateString()}
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="icon">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="outline" size="icon">
                    <Download className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleDelete(document.id)}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </div>
              {document.estPrincipal ? (
                <div className="mt-4 text-sm text-green-600 font-medium">
                  CV Principal
                </div>
              ) : document.type === "pdf" ? (
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-4"
                  onClick={() => handleSetPrincipal(document.id)}
                >
                  Définir comme CV principal
                </Button>
              ) : null}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default CvPiecesJointesPage;
