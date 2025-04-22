"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import React, { useState } from "react";
import { Sidebar, SidebarBody, SidebarLink } from "@/components/ui/sidebar";
import {
  LayoutDashboard,
  LogOut,
  HelpCircle,
  Building2,
  BarChart2,
  MessageSquare,
  Search,
  Users,
  Briefcase,
  Sun,
  Moon,
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
  CardTitle,
  CardDescription,
  CardHeader,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { postData } from "@/utils/utilts";

const queryClient = new QueryClient();
export default function RecruteursLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    {
      label: "Tableau de bord",
      href: "/dashboard-recruteurs",
      icon: <LayoutDashboard className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Offres d'emploi",
      href: "/offres",
      icon: <Briefcase className="h-5 w-5 text-neutral-500" />,
      subItems: [
        { label: "Créer une offre", href: "/mesoffres/creer" },
        { label: "Mes offres", href: "/mesoffres" },
        { label: "Modèles d'offres", href: "/mesoffres/modeles" },
      ],
    },
    {
      label: "Candidatures",
      href: "/candidatures",
      icon: <Users className="h-5 w-5 text-neutral-500" />,
      subItems: [
        {
          label: "Candidatures reçues",
          href: "/dashboard-recruteurs/candidatures",
        },
        {
          label: "Candidats favoris",
          href: "/dashboard-recruteurs/candidatures-favoris",
        },
        { label: "Tableau Kanban", href: "/dashboard-recruteurs/offres" },
      ],
    },
    {
      label: "Recherche de CV",
      href: "/dashboard-recruteurs/recherche-cv",
      icon: <Search className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Messagerie",
      href: "/dashboard-recruteurs/messagerie",
      icon: <MessageSquare className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Statistiques et rapports",
      href: "/dashboard-recruteurs/statistiques",
      icon: <BarChart2 className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Profil entreprise",
      href: "/dashboard-recruteurs/profil",
      icon: <Building2 className="h-5 w-5 text-neutral-500" />,
    },
    {
      label: "Aide et support",
      href: "/dashboard-recruteurs/aide",
      icon: <HelpCircle className="h-5 w-5 text-neutral-500" />,
    },
  ];

  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  const { user, loading } = useAuth();

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
              <Link href="/recruteur/connexion">Se connecter</Link>
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
                {links.map((link, idx) => (
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
              <Button
                variant="ghost"
                className="w-full justify-start gap-2"
                onClick={() => {
                  // Handle logout
                  postData({}, "/api/auth/logout")
                    .then((res) => {
                      if (res.message) {
                        window.location.href = "/recruteur/connexion";
                      }
                      // console.log(res);
                    })
                    .catch((error) => {
                      console.error("Erreur lors de la déconnexion:", error);
                    });
                }}
              >
                <LogOut className="h-5 w-5 text-neutral-500" />
                {open && <span>Déconnexion</span>}
              </Button>
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
