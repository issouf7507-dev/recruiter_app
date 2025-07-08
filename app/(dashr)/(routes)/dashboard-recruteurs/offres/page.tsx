"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { fetchData } from "@/utils/utilts";
import { JobOffer } from "@/types/types";
import { Loader2 } from "lucide-react";
import { useUserStore } from "@/store/userStore";
import { useRecruteurId } from "@/hooks/useRecruteurId";

export default function OffresPage() {
  const { user, loading } = useUserStore();
  const recruteurId = useRecruteurId();

  const { data: querymoffres, isLoading } = useQuery({
    queryKey: ["querymoffres2", recruteurId],
    queryFn: () => fetchData(`/api/recruteur/offresbyuser/${recruteurId}`),
    enabled: !!recruteurId,
  });

  console.log(querymoffres);

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[60vh] w-full">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }
  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Mes offres d'emploi</h1>
        <Link
          href="/dashboard-recruteurs/offres/new"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-4 py-2 rounded-md"
        >
          Créer une nouvelle offre
        </Link>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {querymoffres?.map((offer: JobOffer) => (
          <Link
            key={offer.id}
            href={`/dashboard-recruteurs/offres/${offer.id}/kanban`}
            className="block transition-transform hover:scale-[1.02]"
          >
            <Card>
              <CardHeader>
                <div className="flex justify-between items-start">
                  <div>
                    <CardTitle className="text-xl">{offer.title}</CardTitle>
                    <p className="text-sm text-muted-foreground mt-1">
                      {offer.company}
                    </p>
                  </div>
                  <Badge
                    variant={offer.etat === "active" ? "default" : "secondary"}
                  >
                    {offer.etat === "active" ? "Active" : "Fermée"}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-muted-foreground"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                        />
                      </svg>
                      {offer.location}
                    </div>
                    <Badge variant="outline">{offer.type}</Badge>
                  </div>

                  <div className="flex justify-between items-center pt-4 border-t">
                    <div>
                      <p className="text-sm font-medium">
                        {offer.applications.length} candidatures
                      </p>
                      {/* {offer.newCandidatures > 0 && (
                        <p className="text-xs text-primary">
                          {offer.newCandidatures} nouvelles
                        </p>
                      )} */}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Créée le {new Date(offer.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
