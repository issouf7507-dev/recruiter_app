"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import React, { useState, useEffect, SetStateAction, Dispatch } from "react";
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
  UserPlus,
  Share2,
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
import { usePathname } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { AuthGuard } from "@/components/auth-guard";
import { UserType } from "@/app/generated/prisma";
import { signOut } from "@/lib/auth-client";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      retryDelay: 1000,
    },
  },
});

export default function RecruteursLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const links = [
    {
      label: "Tableau de bord",
      href: "/dashboard-recruteurs",
      icon: <LayoutDashboard className="h-5 w-5 text-white" />,
    },
    // {
    //   label: "Test d'accès",
    //   href: "/dashboard-recruteurs/test-access",
    //   icon: <HelpCircle className="h-5 w-5 text-white" />,
    // },
    {
      label: "Offres d'emploi",
      href: "#",
      icon: <Briefcase className="h-5 w-5 text-white" />,
      subItems: [
        { label: "Créer une offre", href: "/mesoffres/creer" },
        { label: "Mes offres", href: "/mesoffres" },
        {
          label: "Diffusion des offres",
          href: "/dashboard-recruteurs/diffusion-offres",
        },
        {
          label: "Historique diffusion",
          href: "/dashboard-recruteurs/historique-diffusion",
        },
        // { label: "Modèles d'offres", href: "/mesoffres/modeles" },
      ],
    },
    {
      label: "Candidatures",
      href: "/candidatures",
      icon: <Users className="h-5 w-5 text-white" />,
      subItems: [
        {
          label: "Candidatures reçues",
          href: "/dashboard-recruteurs/candidatures",
        },
        {
          label: "Candidats favoris",
          href: "/dashboard-recruteurs/candidatures-favoris",
        },
        { label: "Tableau Kanban", href: "/dashboard-recruteurs/kanban" },
      ],
    },
    {
      label: "Recherche de candidats",
      href: "/dashboard-recruteurs/recherche-candidats",
      icon: <Search className="h-5 w-5 text-white" />,
    },
    {
      label: "Recherche de CV",
      href: "/dashboard-recruteurs/recherche-cv",
      icon: <Search className="h-5 w-5 text-white" />,
    },
    {
      label: "Messagerie",
      href: "/dashboard-recruteurs/messagerie",
      icon: <MessageSquare className="h-5 w-5 text-white" />,
    },
    {
      label: "Statistiques et rapports",
      href: "/dashboard-recruteurs/statistiques",
      icon: <BarChart2 className="h-5 w-5 text-white" />,
    },
    {
      label: "Profil entreprise",
      href: "/dashboard-recruteurs/profil",
      icon: <Building2 className="h-5 w-5 text-white" />,
    },
    {
      label: "Aide et support",
      href: "/dashboard-recruteurs/aide",
      icon: <HelpCircle className="h-5 w-5 text-white" />,
    },
    {
      label: "Invitations",
      href: "/dashboard-recruteurs/invitations",
      icon: <UserPlus className="h-5 w-5 text-white" />,
    },
  ];

  const [open, setOpen] = useState(false);
  const { setTheme } = useTheme();

  // const { user, loading } = useAuth();

  const pathname = usePathname();
  let isActive = "";
  let isActive2 = "";

  for (const link of links) {
    // console.log(link.subItems);

    if (link.href === pathname) {
      isActive2 = link.href;
    }

    if (link.subItems) {
      for (const subItem of link.subItems) {
        if (subItem.href === pathname) {
          // console.log(subItem.href);
          isActive = subItem.href;
        }
      }
    }
  }

  const [loadingLogo, setLoadingLogo] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setLoadingLogo(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // if (loading) {
  //   return (
  //     <div className="h-screen flex items-center justify-center">
  //       Chargement...
  //     </div>
  //   );
  // }

  // console.log(user);

  if (loadingLogo) {
    return (
      <div className="flex justify-center items-center h-screen bg-background">
        <div className="flex flex-col items-center space-y-6">
          {/* Animated Logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.5, rotate: -180 }}
            animate={{
              opacity: 1,
              scale: 1,
              rotate: 0,
            }}
            transition={{
              duration: 1.2,
              ease: "easeOut",
              type: "spring",
              stiffness: 100,
            }}
            className="relative"
          >
            {/* Pulse effect background */}
            <motion.div
              className="absolute inset-0 bg-primary/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.1, 0.3],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />

            {/* Main logo with subtle rotation */}
            <motion.div
              animate={{
                rotate: [0, 5, -5, 0],
              }}
              transition={{
                duration: 3,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              <Image
                src="/SVG/Logo_normal.svg"
                alt="Ylsix"
                width={400}
                height={400}
                className="w-40 h-40 relative z-10"
              />
            </motion.div>
          </motion.div>

          {/* Loading text with typing effect */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5, duration: 0.8 }}
            className="text-center"
          >
            <motion.h2
              className="text-2xl md:text-3xl font-bold text-primary mb-2"
              animate={{
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            >
              Ylsix
            </motion.h2>
            <motion.p
              className="text-muted-foreground text-sm md:text-base"
              animate={{
                opacity: [0.3, 0.8, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            >
              Plateforme de recrutement nouvelle génération
            </motion.p>
          </motion.div>

          {/* Loading dots */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.8, duration: 0.5 }}
            className="flex space-x-2"
          >
            {[0, 1, 2].map((index) => (
              <motion.div
                key={index}
                className="w-2 h-2 bg-primary rounded-full"
                animate={{
                  scale: [1, 1.5, 1],
                  opacity: [0.3, 1, 0.3],
                }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: "easeInOut",
                  delay: index * 0.2,
                }}
              />
            ))}
          </motion.div>
        </div>
      </div>
    );
  }

  // Utiliser AuthGuard pour gérer l'authentification et la redirection
  return (
    // <AuthGuard requiredUserType={UserType.RECRUTEUR}>
    <RecruteursLayoutContent
      children={children}
      // user={user}
      links={links}
      open={open}
      setOpen={setOpen}
      isActive={isActive}
      isActive2={isActive2}
      setTheme={setTheme}
    />
    // </AuthGuard>
  );
}

function RecruteursLayoutContent({
  children,
  // user,
  links,
  open,
  setOpen,
  isActive,
  isActive2,
  setTheme,
}: {
  children: React.ReactNode;
  // user: any;
  links: any[];
  open: boolean;
  setOpen: (open: boolean) => void;
  isActive: string;
  isActive2: string;
  setTheme: (theme: string) => void;
}) {
  return (
    <QueryClientProvider client={queryClient}>
      <ErrorBoundary>
        <div
          className={cn(
            "rounded-md flex flex-col md:flex-row bg-gray-100 dark:bg-card w-full flex-1  mx-auto border border-neutral-200 dark:border-neutral-700 overflow-hidden",
            "h-screen overflow-y-hidden " // for your use case, use `h-screen` instead of `h-[60vh]`
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
                  {links.map((link, idx) => (
                    <div key={idx} className="w-full">
                      <SidebarLink
                        link={link}
                        className={isActive2 === link.href && "bg-[#0c0c19]"}
                      />
                      {open && link.subItems && (
                        <div className="ml-6 mt-1 flex flex-col gap-1 border-l border-white/20 pl-4">
                          {link.subItems.map((subItem: any, subIdx: any) => (
                            <Link
                              key={subIdx}
                              href={subItem.href}
                              className={cn(
                                "text-sm text-white/80 hover:text-white py-1 px-2 rounded-md transition-colors duration-200 hover:bg-white/10",
                                isActive === subItem.href &&
                                  "text-white bg-white/10"
                              )}
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

              {/* Footer avec thème, profil et déconnexion */}
              <div className="flex-shrink-0 space-y-4 pt-4 border-t border-white/20">
                {/* Sélecteur de thème */}
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
                <SidebarLink
                  className="uppercase"
                  link={{
                    label: "User",
                    href: "#",
                    icon: (
                      <Avatar>
                        <AvatarFallback className="text-[14px] font-bold bg-white/20 text-white">
                          {/* {(user?.name &&
                            (
                              user?.name.split(" ")[0].slice(0, 1) +
                              user?.name.split(" ")[1].slice(0, 1)
                            ).toUpperCase()) ||
                            ""} */}
                        </AvatarFallback>
                      </Avatar>
                    ),
                  }}
                />

                {/* Bouton de déconnexion */}
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full justify-start text-white/80 hover:text-white hover:bg-white/10"
                  onClick={async () => {
                    await signOut();
                    window.location.href = "/auth/connexion";
                  }}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  {open && "Se déconnecter"}
                </Button>
              </div>
            </SidebarBody>
          </Sidebar>

          <div className="w-full h-screen overflow-y-auto">{children}</div>
        </div>
      </ErrorBoundary>
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
