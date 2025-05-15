import { Bell } from "lucide-react";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { AlerteNotificationType } from "@/types/types";

export function AlerteNotification({
  notifications,
  isLoading,
}: {
  notifications: AlerteNotificationType[];
  isLoading: boolean;
}) {
  const queryClient = useQueryClient();

  // const { data: notifications, isLoading } = useQuery<AlerteNotification[]>({
  //   queryKey: ["alerte-notifications"],
  //   queryFn: async () => {
  //     const response = await fetch("/api/candidat/notifications");
  //     if (!response.ok) {
  //       throw new Error("Erreur lors de la récupération des notifications");
  //     }
  //     return response.json();
  //   },
  // });

  const markAsRead = useMutation({
    mutationFn: async (notificationIds: string[]) => {
      const response = await fetch("/api/candidat/notifications", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationIds }),
      });
      if (!response.ok) {
        throw new Error("Erreur lors du marquage des notifications");
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["alerte-notifications"] });
    },
    onError: () => {
      toast.error("Erreur lors du marquage des notifications");
    },
  });

  const nonLues = notifications?.filter((n) => !n.lu) || [];

  const handleMarkAllAsRead = () => {
    if (nonLues.length > 0) {
      markAsRead.mutate(nonLues.map((n) => n.id));
    }
  };

  const handleNotificationClick = (notification: AlerteNotificationType) => {
    // Marquer comme lu
    markAsRead.mutate([notification.id]);

    // Rediriger vers l'offre
    // if (notification.offre?.id) {
    //   router.push(`/offres/${notification.offre.id}`);
    // }
  };

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {nonLues.length > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0"
            >
              {nonLues.length}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {nonLues.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              className="text-xs"
              onClick={handleMarkAllAsRead}
              disabled={markAsRead.isPending}
            >
              Tout marquer comme lu
            </Button>
          )}
        </div>
        <ScrollArea className="h-[300px]">
          {isLoading ? (
            <div className="p-4 text-center text-muted-foreground">
              Chargement...
            </div>
          ) : notifications?.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              Aucune notification
            </div>
          ) : (
            <div className="p-2">
              {notifications?.map((notification) => (
                //  <Link
                //             href={`/dashboard-candidats/toutes-les-offres/${offre.id}`}
                //             className="hover:underline"
                //           >
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 cursor-pointer hover:bg-accent ${
                    !notification.lu ? "bg-accent/50" : ""
                  }`}
                  onClick={() => {
                    handleNotificationClick(notification);
                    window.location.href = `/dashboard-candidats/toutes-les-offres/${notification.offreId}`;
                  }}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-medium">{notification.titre}</p>
                      <p className="text-sm text-muted-foreground">
                        {notification.message}
                      </p>
                      {/* {notification.offre && (
                        <>
                          <p className="text-sm text-muted-foreground">
                            {notification.offre.title} -{" "}
                            {notification.offre.company}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {notification.offre.location}
                          </p>
                        </>
                      )} */}
                    </div>
                    <span className="text-xs text-muted-foreground">
                      {new Date(notification.createdAt).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}
