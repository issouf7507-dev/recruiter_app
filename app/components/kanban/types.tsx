// Types pour le système Kanban
export type KanbanColumn = {
  color: string;
  createdAt?: string;
  id?: string;
  isDefault?: boolean;
  jobOfferId?: string;
  name: string;
  order?: number;
  updatedAt?: string;
};

export type Note = {
  id?: string;
  content: string;
  authorId: string;
  authorType: string;
  createdAt?: string;
};

export type Application = {
  id: string;
  candidat: {
    id: string;
    nom: string;
    prenom: string;
    email: string;
    competences: string[];
    cv: string;
    letterm: string;
  };
  note?: string;
  rating?: number;
  message?: string;
  cv?: string;
  createdAt: string;
  columnId: string;
  notes: Note[];
  checklist: ChecklistItem[];
  attachments: Attachment[];
  files: ApplicationFile[];
};

export type ChecklistItem = {
  id: string;
  title: string;
  description?: string;
  isCompleted: boolean;
  applicationId: string;
  createdById: string;
  createdByType: string;
  createdAt: string;
  updatedAt: string;
};

export type Attachment = {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  uploadedById: string;
  uploadedByType: string;
  createdAt: string;
  updatedAt: string;
};

export type ApplicationFile = {
  id: string;
  fileName: string;
  fileUrl: string;
  fileType: string;
  fileSize: number;
  uploadedById: string;
  uploadedByType: string;
  createdAt: string;
  updatedAt: string;
};

// Couleurs disponibles pour les colonnes
export const availableColors = [
  { value: "bg-blue-300/30", label: "Bleu" },
  { value: "bg-green-300/30", label: "Vert" },
  { value: "bg-pink-300/30", label: "Rose" },
  { value: "bg-yellow-300/30", label: "Jaune" },
  { value: "bg-purple-300/30", label: "Violet" },
  { value: "bg-red-300/30", label: "Rouge" },
];

// Fonction utilitaire pour couleur aléatoire
export function getRandomColor() {
  const colors = [
    "#F59E42", // orange
    "#60A5FA", // blue
    "#34D399", // green
    "#F472B6", // pink
    "#FACC15", // yellow
    "#A78BFA", // purple
    "#F87171", // red
    "#38BDF8", // sky
    "#4ADE80", // emerald
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

// Fonctions utilitaires pour les fichiers
export const getFileIcon = (fileType: string) => {
  const type = fileType.toLowerCase();
  if (type.includes("pdf")) {
    return (
      <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-red-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("doc") || type.includes("word")) {
    return (
      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-blue-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("excel")) {
    return (
      <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-green-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("powerpoint")) {
    return (
      <div className="w-10 h-10 bg-yellow-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-yellow-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("image")) {
    return (
      <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-pink-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else if (type.includes("text")) {
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  } else {
    return (
      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
        <svg
          className="w-6 h-6 text-gray-600"
          fill="currentColor"
          viewBox="0 0 20 20"
        >
          <path
            fillRule="evenodd"
            d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4zm2 6a1 1 0 011-1h6a1 1 0 110 2H7a1 1 0 01-1-1zm1 3a1 1 0 100 2h6a1 1 0 100-2H7z"
            clipRule="evenodd"
          />
        </svg>
      </div>
    );
  }
};

export const formatFileSize = (bytes: number) => {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};
