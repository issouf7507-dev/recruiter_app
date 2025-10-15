"use client";
import { SessionProvider } from "next-auth/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useState, useEffect, Dispatch, SetStateAction } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LogOut,
  HelpCircle,
  MessageSquare,
  Briefcase,
  Sun,
  Moon,
  Bell,
  TrendingUp,
  User,
  ClipboardList,
  Lock,
  Loader2,
  FileText,
} from "lucide-react";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import Link from "next/link";
import { motion } from "framer-motion";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { ThemeProvider } from "@/components/theme-provider";
import { useTheme } from "next-themes";
import { Button } from "@/components/ui/button";

import { useUserStore } from "@/store/userStore";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

import NotificationBell from "@/app/components/notifications/alerte-notification";

import { useSession } from "@/lib/auth-client";

const queryClient = new QueryClient();
export default function CandidatsLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const linksCandidat = [
    {
      label: "Accueil",
      href: "/dashboard-candidats",
      icon: <LayoutDashboard className="h-5 w-5 text-white" />,
    },
    {
      label: "Offres d'emploi",
      href: "/dashboard-candidats/offres-recommandees",
      icon: <Briefcase className="h-5 w-5 text-white" />,
      subItems: [
        {
          label: "Offres recommandées",
          href: "/dashboard-candidats/offres-recommandees",
        },
        {
          label: "Toutes les offres",
          href: "/dashboard-candidats/toutes-les-offres",
        },
        // { label: "Favoris", href: "/offres/toutes-les-offres" },
      ],
    },
    {
      label: "Mes candidatures",
      href: "/#",
      icon: <ClipboardList className="h-5 w-5 text-white" />,
      subItems: [
        {
          label: "En cours",
          href: "/dashboard-candidats/candidatures-en-cours",
        },
        {
          label: "Acceptées",
          href: "/dashboard-candidats/candidatures-acceptees",
        },
        {
          label: "Refusées",
          href: "/dashboard-candidats/candidatures-refusees",
        },
      ],
    },
    {
      label: "Mon profil",
      href: "/#",
      icon: <User className="h-5 w-5 text-white" />,
      subItems: [
        {
          label: "Informations personnelles",
          href: "/dashboard-candidats/informations-personnelles",
        },
        { label: "Expériences", href: "/dashboard-candidats/experiences" },
        {
          label: "Formation et Compétences",
          href: "/dashboard-candidats/formations-competences",
        },
        // { label: "Compétences", href: "/dashboard-candidats/competences" },
        // {
        //   label: "CV et pièces jointes",
        //   href: "/dashboard-candidats/cv-pieces-jointes",
        // },
      ],
    },
    {
      label: "Générateur de CV",
      href: "/dashboard-candidats/generateur-cv",
      icon: <FileText className="h-5 w-5 text-white" />,
    },
    // {
    //   label: "Suivi de carrière",
    //   href: "/dashboard-candidats/suivi-carriere",
    //   icon: <TrendingUp className="h-5 w-5 text-neutral-500" />,
    // },
    {
      label: "Messages",
      href: "/dashboard-candidats/messagerie",
      icon: <MessageSquare className="h-5 w-5 text-white" />,
    },
    {
      label: "Alertes emploi",
      href: "/dashboard-candidats/alertes-emploi",
      icon: <Bell className="h-5 w-5 text-white" />,
    },
    {
      label: "Aide",
      href: "/dashboard-candidats/aide",
      icon: <HelpCircle className="h-5 w-5 text-white" />,
    },
    // {
    //   label: "Debug",
    //   href: "/dashboard-candidats/debug",
    //   icon: <HelpCircle className="h-5 w-5 text-white" />,
    // },
  ];

  const [open, setOpen] = useState(false);

  const { setTheme } = useTheme();

  // const { candidat, loading } = useAuthCandidat();
  const { data: session, isPending } = useSession();

  if (isPending) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    );
  }

  return (
    <CandidatsLayoutContent
      children={children}
      candidat={session?.user}
      linksCandidat={linksCandidat}
      open={open}
      setOpen={setOpen}
      setTheme={setTheme}
    />
  );
}

function CandidatsLayoutContent({
  children,
  candidat,
  linksCandidat,
  open,
  setOpen,
  setTheme,
}: {
  children: React.ReactNode;
  candidat: any;
  linksCandidat: any[];
  open: boolean;
  setOpen: (open: boolean) => void;
  setTheme: (theme: string) => void;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-card w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
          "h-[100vh]" // for your use case, use `h-screen` instead of `h-[60vh]`
        )}
      >
        <Sidebar
          open={open}
          setOpen={setOpen as Dispatch<SetStateAction<boolean>>}
        >
          <SidebarBody className="flex flex-col justify-between border bg-[#2a294b] dark:bg-card rounded-lg p-4">
            {/* Header avec logo */}
            <div className="flex-shrink-0 mb-2">
              {/* {open ? <Logo /> : <LogoIcon />} */}
              <Image
                src="/SVG/Logo_normal.svg"
                alt="Ylsix"
                width={400}
                height={400}
                className="w-20 h-20 relative z-10"
              />
            </div>
            {/* Navigation principale */}
            <div className="flex-1 overflow-y-auto">
              <div className="flex flex-col gap-1">
                {linksCandidat.map((link, idx) => (
                  <div key={idx} className="w-full">
                    <SidebarLink link={link} />
                    {open && link.subItems && (
                      <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-white/20 pl-4">
                        {link.subItems.map((subItem: any, subIdx: number) => (
                          <Link
                            key={subIdx}
                            href={subItem.href}
                            className="text-sm text-white/80 hover:text-white py-1 px-2 rounded-md transition-colors duration-200 hover:bg-white/10"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Footer avec thème et profil */}
            <div className="flex-shrink-0 mt-6 space-y-4">
              {/* Séparateur */}
              <div className="border-t border-white/20 pt-4"></div>

              {/* Bouton thème */}
              <div className="flex justify-center">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                    >
                      <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                      <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                      <span className="sr-only">Toggle theme</span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={() => setTheme("light")}>
                      Light
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("dark")}>
                      Dark
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setTheme("system")}>
                      System
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              {/* Profil utilisateur */}
              {/* <SidebarLink
                link={{
                  label: `${candidat?.candidat?.nom
                    .charAt(0)
                    .toUpperCase()}${candidat?.candidat?.nom.slice(
                    1
                  )} ${candidat.candidat?.prenom
                    .charAt(0)
                    .toUpperCase()}${candidat.candidat?.prenom.slice(1)}`,
                  href: "#",
                  icon: <User className="w-4 h-4" />,
                }}
              /> */}

              {/* Notifications */}
              <div className="flex justify-center">
                <NotificationBell />
              </div>

              {/* Bouton de déconnexion */}
              <Button
                variant="ghost"
                size="sm"
                className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                onClick={async () => {
                  try {
                    // Appel de la route de déconnexion
                    const response = await fetch("/api/auth/logout", {
                      method: "POST",
                      headers: {
                        "Content-Type": "application/json",
                      },
                    });

                    if (response.ok) {
                      // Redirection vers la page de connexion après déconnexion
                      window.location.href = "/candidat/connexion";
                    } else {
                      console.error("Erreur lors de la déconnexion");
                    }
                  } catch (error) {
                    console.error("Erreur lors de la déconnexion:", error);
                  }
                }}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {open && "Se déconnecter"}
              </Button>
            </div>
          </SidebarBody>
        </Sidebar>

        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
        </ThemeProvider>
      </div>
    </QueryClientProvider>
  );
}

const Logo = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
      <motion.span
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="font-medium text-black dark:text-white whitespace-pre"
      >
        Ylsix
      </motion.span>
    </Link>
  );
};

const LogoIcon = () => {
  return (
    <Link
      href="#"
      className="font-normal flex space-x-2 items-center text-sm text-black py-1 relative z-20"
    >
      <div className="h-5 w-6 bg-black dark:bg-white rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
    </Link>
  );
};
