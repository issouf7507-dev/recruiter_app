"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Search,
  MessageCircle,
  Mail,
  Phone,
  MapPin,
  Calendar,
} from "lucide-react";
import { toast } from "sonner";
import InitiateChatModal from "@/app/components/InitiateChatModal";
import { useRouter } from "next/navigation";

interface Candidat {
  id: string;
  name: string;
  email: string;
  telephone: string | null;
  ville: string | null;
  avatar: string | null;
  applicationId: string;
  applicationDate: string;
}

interface JobOffer {
  id: number;
  title: string;
  company: string;
}

export default function CandidatsPage({ params }: { params: { id: string } }) {
  const [candidats, setCandidats] = useState<Candidat[]>([]);
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCandidat, setSelectedCandidat] = useState<Candidat | null>(
    null
  );
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const router = useRouter();

  useEffect(() => {
    fetchCandidats();
    fetchJobOffer();
  }, [params.id]);

  const fetchCandidats = async () => {
    try {
      const response = await fetch(
        `/api/recruteur/candidats-disponibles?jobOfferId=${params.id}`
      );
      if (response.ok) {
        const data = await response.json();
        setCandidats(data);
      } else {
        toast.error("Erreur lors du chargement des candidats");
      }
    } catch (error) {
      console.error("Erreur:", error);
      toast.error("Erreur lors du chargement des candidats");
    } finally {
      setLoading(false);
    }
  };

  const fetchJobOffer = async () => {
    try {
      const response = await fetch(`/api/recruteur/offres/${params.id}`);
      if (response.ok) {
        const data = await response.json();
        setJobOffer(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement de l'offre:", error);
    }
  };

  const handleInitiateChat = (candidat: Candidat) => {
    setSelectedCandidat(candidat);
    setIsChatModalOpen(true);
  };

  const handleChatSuccess = (conversationId: string) => {
    // Rediriger vers la messagerie
    router.push(
      `/dashboard-recruteurs/messagerie?conversation=${conversationId}`
    );
  };

  const filteredCandidats = candidats.filter(
    (candidat) =>
      candidat.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      candidat.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex h-[calc(100vh-4rem)] items-center justify-center w-full">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">
            Chargement des candidats...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 w-full overflow-y-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Candidats</h1>
          {jobOffer && (
            <p className="text-muted-foreground">
              {jobOffer.title} - {jobOffer.company}
            </p>
          )}
        </div>
        <Badge variant="secondary">
          {candidats.length} candidat{candidats.length > 1 ? "s" : ""}
        </Badge>
      </div>

      {/* Barre de recherche */}
      <div className="relative">
        <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher un candidat..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-9"
        />
      </div>

      {/* Liste des candidats */}
      {filteredCandidats.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm
                ? "Aucun candidat trouvé"
                : "Aucun candidat pour cette offre"}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {filteredCandidats.map((candidat) => (
            <Card
              key={candidat.id}
              className="hover:shadow-md transition-shadow"
            >
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarImage src={candidat.avatar || ""} />
                    <AvatarFallback>
                      {candidat.name
                        .split(" ")
                        .map((n) => n[0])
                        .join("")}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <CardTitle className="text-lg truncate">
                      {candidat.name}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground truncate">
                      {candidat.email}
                    </p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                {/* Informations du candidat */}
                <div className="space-y-2">
                  {candidat.telephone && (
                    <div className="flex items-center gap-2 text-sm">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      <span>{candidat.telephone}</span>
                    </div>
                  )}
                  {candidat.ville && (
                    <div className="flex items-center gap-2 text-sm">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      <span>{candidat.ville}</span>
                    </div>
                  )}
                  <div className="flex items-center gap-2 text-sm">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>
                      Candidature le{" "}
                      {new Date(candidat.applicationDate).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={() => handleInitiateChat(candidat)}
                    className="flex-1"
                    size="sm"
                  >
                    <MessageCircle className="h-4 w-4 mr-2" />
                    Contacter
                  </Button>
                  <Button variant="outline" size="sm">
                    <Mail className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Modal de chat */}
      {selectedCandidat && jobOffer && (
        <InitiateChatModal
          isOpen={isChatModalOpen}
          onClose={() => {
            setIsChatModalOpen(false);
            setSelectedCandidat(null);
          }}
          candidat={{
            id: selectedCandidat.id,
            name: selectedCandidat.name,
            email: selectedCandidat.email,
          }}
          jobOffer={jobOffer}
          onSuccess={handleChatSuccess}
        />
      )}
    </div>
  );
}
