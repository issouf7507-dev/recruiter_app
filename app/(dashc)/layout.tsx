"use client";
import { SessionProvider } from "next-auth/react";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useState } from "react";
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
import { useAuth } from "@/hooks/useAuth";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuthCandidat } from "@/hooks/useAuthCandidat";

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
      icon: <LayoutDashboard className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Offres d'emploi",
      href: "/dashboard-candidats/offres-recommandees",
      icon: <Briefcase className="h-5 w-5 text-neutral-500" />,
      subItems: [
        {
          label: "Offres recommandées",
          href: "/dashboard-candidats/offres-recommandees",
        },
        {
          label: "Toutes les offres",
          href: "/dashboard-candidats/toutes-les-offres",
        },
        { label: "Favoris", href: "/offres/toutes-les-offres" },
      ],
    },
    {
      label: "Mes candidatures",
      href: "/dashboard-candidats/candidatures",
      icon: <ClipboardList className="h-5 w-5 text-neutral-500" />,
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
      href: "/dashboard-candidats/profil",
      icon: <User className="h-5 w-5 text-neutral-500" />,
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
        {
          label: "CV et pièces jointes",
          href: "/dashboard-candidats/cv-pieces-jointes",
        },
      ],
    },
    {
      label: "Suivi de carrière",
      href: "/dashboard-candidats/suivi-carriere",
      icon: <TrendingUp className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Messages",
      href: "/dashboard-candidats/messagerie",
      icon: <MessageSquare className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Alertes emploi",
      href: "/dashboard-candidats/alertes-emploi",
      icon: <Bell className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Aide",
      href: "/dashboard-candidats/aide",
      icon: <HelpCircle className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Déconnexion",
      href: "/logout",
      icon: <LogOut className="h-5 w-5 text-neutral-500" />,
    },
  ];

  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  const { user, loading } = useAuthCandidat();

  if (loading) {
    return (
      <div className="h-screen flex items-center justify-center">
        Chargement...
      </div>
    );
  }

  if (!user) {
    return (
      <div className="h-screen flex items-center justify-center">
        <Card className="w-96 text-center">
          <CardHeader className="flex flex-col items-center gap-2">
            <Lock className="w-10 h-10 text-red-500" />
            <CardTitle>Accès restreint</CardTitle>
            <CardDescription>
              Vous devez être connecté pour accéder à cette section.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p>
              Connectez-vous pour continuer et profiter de toutes les
              fonctionnalités.
            </p>
          </CardContent>
          <CardFooter className="flex justify-center">
            <Button asChild variant="link">
              <Link href="/candidat/connexion">Se connecter</Link>
            </Button>
          </CardFooter>
        </Card>
        <div></div>
      </div>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <div
        className={cn(
          "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-card w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
          "h-[100vh]" // for your use case, use `h-screen` instead of `h-[60vh]`
        )}
      >
        <Sidebar open={open} setOpen={setOpen}>
          <SidebarBody className="justify-between gap-10">
            <div className="flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
              {open ? <Logo /> : <LogoIcon />}
              <div className="mt-8 flex flex-col gap-2">
                {linksCandidat.map((link, idx) => (
                  <div key={idx}>
                    <SidebarLink link={link} />
                    {open && link.subItems && (
                      <div className="ml-10 mt-1 flex flex-col gap-1">
                        {link.subItems.map((subItem, subIdx) => (
                          <Link
                            key={subIdx}
                            href={subItem.href}
                            className="text-sm text-neutral-500 hover:text-neutral-800 py-1"
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
            <div className=" flex flex-col">
              <div className="flex-shrink-0">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="icon">
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
              <SidebarLink
                link={{
                  label: "Manu Arora",
                  href: "#",
                  icon: (
                    <Image
                      src="https://assets.aceternity.com/manu.png"
                      className="h-7 w-7 flex-shrink-0 rounded-full"
                      width={50}
                      height={50}
                      alt="Avatar"
                    />
                  ),
                }}
              />
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
        Acet Labs
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
