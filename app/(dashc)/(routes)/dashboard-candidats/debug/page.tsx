"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function DebugPage() {
  const [conversations, setConversations] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch("/api/candidat/conversations");
      console.log("Response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Conversations data:", data);
        setConversations(data);
      } else {
        const errorData = await response.json();
        console.error("Error response:", errorData);
        setError(errorData.error || "Erreur lors du chargement");
      }
    } catch (error) {
      console.error("Fetch error:", error);
      setError("Erreur réseau");
    } finally {
      setLoading(false);
    }
  };

  const testMessages = async (conversationId: string) => {
    try {
      const response = await fetch(
        `/api/candidat/conversations/${conversationId}/messages`
      );
      console.log("Messages response status:", response.status);

      if (response.ok) {
        const data = await response.json();
        console.log("Messages data:", data);
      } else {
        const errorData = await response.json();
        console.error("Messages error:", errorData);
      }
    } catch (error) {
      console.error("Messages fetch error:", error);
    }
  };

  useEffect(() => {
    fetchConversations();
  }, []);

  return (
    <div className="p-6 space-y-6 w-full overflow-y-auto">
      <Card>
        <CardHeader>
          <CardTitle>Debug - Conversations</CardTitle>
        </CardHeader>
        <CardContent>
          <Button onClick={fetchConversations} disabled={loading}>
            {loading ? "Chargement..." : "Recharger les conversations"}
          </Button>

          {error && (
            <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
              <strong>Erreur:</strong> {error}
            </div>
          )}

          <div className="mt-4">
            <h3 className="font-semibold mb-2">
              Conversations trouvées: {conversations.length}
            </h3>

            {conversations.length === 0 ? (
              <p className="text-muted-foreground">
                Aucune conversation trouvée
              </p>
            ) : (
              <div className="space-y-4">
                {conversations.map((conv, index) => (
                  <div key={conv.id} className="p-4 border rounded">
                    <h4 className="font-medium">Conversation {index + 1}</h4>
                    <p>
                      <strong>ID:</strong> {conv.id}
                    </p>
                    <p>
                      <strong>Recruteur:</strong> {conv.recruteur?.name}
                    </p>
                    <p>
                      <strong>Entreprise:</strong> {conv.recruteur?.entreprise}
                    </p>
                    <p>
                      <strong>Offre:</strong> {conv.jobOffer?.title}
                    </p>
                    <p>
                      <strong>Messages non lus:</strong> {conv.unreadCount}
                    </p>
                    <p>
                      <strong>Dernière mise à jour:</strong>{" "}
                      {new Date(conv.updatedAt).toLocaleString()}
                    </p>

                    <Button
                      onClick={() => testMessages(conv.id)}
                      size="sm"
                      className="mt-2"
                    >
                      Tester les messages
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
