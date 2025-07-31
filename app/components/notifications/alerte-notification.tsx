"use client";

import { useState, useEffect } from "react";
import { Bell, X, MessageCircle, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { ScrollArea } from "@/components/ui/scroll-area";
import { toast } from "sonner";

interface Notification {
  id: string;
  titre: string;
  message: string;
  type: string;
  lu: boolean;
  offreId?: number;
  createdAt: string;
}

export default function NotificationBell() {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    // Polling pour vérifier les nouvelles notifications toutes les 30 secondes
    const interval = setInterval(fetchNotifications, 30000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    setUnreadCount(notifications.filter((n) => !n.lu).length);
  }, [notifications]);

  const fetchNotifications = async () => {
    try {
      const response = await fetch("/api/candidat/notifications");
      if (response.ok) {
        const data = await response.json();
        setNotifications(data);
      }
    } catch (error) {
      console.error("Erreur lors du chargement des notifications:", error);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      setLoading(true);
      const response = await fetch("/api/candidat/notifications", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ notificationId }),
      });

      if (response.ok) {
        setNotifications((prev) =>
          prev.map((n) => (n.id === notificationId ? { ...n, lu: true } : n))
        );
      }
    } catch (error) {
      console.error("Erreur lors de la mise à jour de la notification:", error);
      toast.error("Erreur lors de la mise à jour de la notification");
    } finally {
      setLoading(false);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case "message":
        return <MessageCircle className="h-4 w-4 text-blue-500" />;
      case "application":
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case "alerte":
        return <AlertCircle className="h-4 w-4 text-orange-500" />;
      default:
        return <Bell className="h-4 w-4 text-gray-500" />;
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      return "À l'instant";
    } else if (diffInHours < 24) {
      return `Il y a ${diffInHours}h`;
    } else {
      return date.toLocaleDateString("fr-FR");
    }
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs flex items-center justify-center"
            >
              {unreadCount > 9 ? "9+" : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h4 className="font-semibold">Notifications</h4>
          {unreadCount > 0 && (
            <Badge variant="secondary" className="text-xs">
              {unreadCount} non lu{unreadCount > 1 ? "s" : ""}
            </Badge>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-muted-foreground">
              <Bell className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>Aucune notification</p>
            </div>
          ) : (
            <div className="p-2">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-3 rounded-lg mb-2 transition-colors ${
                    notification.lu
                      ? "bg-muted/50"
                      : "bg-blue-50 dark:bg-blue-950/20"
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <h5 className="font-medium text-sm leading-tight">
                          {notification.titre}
                        </h5>
                        {!notification.lu && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            disabled={loading}
                            className="h-6 w-6 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-muted-foreground mt-2">
                        {formatDate(notification.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
        {notifications.length > 0 && (
          <div className="p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => setIsOpen(false)}
            >
              Fermer
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  );
}
