import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X, UserCheck, Briefcase } from "lucide-react";
import { ModeToggle } from "../toggle-dark/toggle-dark";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useRouter } from "next/navigation";
import { useUser } from "@/hooks/useUser";
import {
  Sheet,
  SheetContent,
  SheetTitle,
  SheetHeader,
  SheetTrigger,
  SheetDescription,
} from "@/components/ui/sheet";
import Image from "next/image";
import CandidatProfileForm from "@/components/CandidatProfileForm";
import { signOut, useSession } from "@/lib/auth-client";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  const { data: session, isPending } = useSession();
  const [isOpenCandidat, setIsOpenCandidat] = useState(false);
  // const { loading: loadingCandidat, candidat } = useAuthCandidat();
  const { user, loading } = useUser();

  const router = useRouter();

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  console.log(user);

  return (
    <div>
      <header className="fixed w-full border-b border-border bg-background/80 backdrop-blur-sm top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {/* <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" /> */}
            <Link href="/">
              <Image
                src="/SVG/Logo_normal.svg"
                alt="Ylsix"
                width={150}
                height={150}
                className="w-15 h-15"
              />
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-4">
            <Link href="/offres">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Offres d'emploi
              </Button>
            </Link>
            <Link href="/fonctionnalite">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Fonctionnalités
              </Button>
            </Link>
            <Link href="/tarifs">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Tarifs
              </Button>
            </Link>
            <Link href="/temoignages">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Témoignages
              </Button>
            </Link>
            <Link href="/a-propos">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                À propos
              </Button>
            </Link>
            <Link href="/contact">
              <Button
                variant="ghost"
                className="text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Contact
              </Button>
            </Link>

            {/* Si user connecté, afficher avatar + dropdown, sinon bouton */}
            {!isPending && session?.user && user?.type === "RECRUTEUR" && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={
                        session?.user?.name || session?.user?.email || "Avatar"
                      }
                    />
                    <AvatarFallback>
                      {session?.user?.name
                        ? session?.user?.name[0]
                        : session?.user?.email
                          ? session?.user?.email[0]
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      if (user?.type === "CANDIDAT") {
                        router.push("/dashboard-candidats");
                      } else if (user?.type === "RECRUTEUR") {
                        router.push("/dashboard-recruteurs");
                      }
                    }}
                  >
                    Mon espace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/dashboard-recruteurs/profil");
                    }}
                  >
                    Modifier mon profil recruteur
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      window.location.reload();
                    }}
                  >
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isPending && session?.user && user?.type === "CANDIDAT" && (
              <DropdownMenu modal={false}>
                <DropdownMenuTrigger asChild>
                  <Avatar className="cursor-pointer">
                    <AvatarImage
                      src={session?.user?.image || undefined}
                      alt={
                        session?.user?.name || session?.user?.email || "Avatar"
                      }
                    />
                    <AvatarFallback>
                      {session?.user?.name
                        ? session?.user?.name.charAt(0) +
                          session?.user?.email.charAt(0)
                        : session?.user?.email
                          ? session?.user?.email.charAt(0) +
                            session?.user?.name.charAt(0)
                          : "U"}
                    </AvatarFallback>
                  </Avatar>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem
                    onClick={() => {
                      router.push("/dashboard-candidats");
                    }}
                  >
                    Mon espace
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      setIsOpenCandidat(true);
                    }}
                  >
                    Modifier mon profil candidat
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={async () => {
                      await signOut();
                      window.location.reload();
                    }}
                  >
                    Se déconnecter
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}

            {!isPending && !session?.user && (
              <Button
                onClick={() => setIsOpen(true)}
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                Commencer gratuitement
              </Button>
            )}

            <ModeToggle />
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMenu}
              className="p-2"
            >
              {isMenuOpen ? (
                <X className="h-5 w-5" />
              ) : (
                <Menu className="h-5 w-5" />
              )}
            </Button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t border-border bg-background/95 backdrop-blur-sm">
            <div className="container mx-auto px-4 py-4 space-y-3">
              <Link href="/offres" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Offres d'emploi
                </Button>
              </Link>
              <Link href="/fonctionnalite" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Fonctionnalités
                </Button>
              </Link>
              <Link href="/tarifs" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Tarifs
                </Button>
              </Link>
              <Link href="/temoignages" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Témoignages
                </Button>
              </Link>
              <Link href="/a-propos" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  À propos
                </Button>
              </Link>
              <Link href="/contact" onClick={() => setIsMenuOpen(false)}>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
                >
                  Contact
                </Button>
              </Link>

              <Separator className="my-2" />

              {/* Gestion des utilisateurs connectés en mobile */}
              {!isPending && session?.user && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={
                          session?.user?.name ||
                          session?.user?.email ||
                          "Avatar"
                        }
                      />
                      <AvatarFallback>
                        {session?.user?.name
                          ? session?.user?.name[0]
                          : session?.user?.email
                            ? session?.user?.email[0]
                            : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session?.user?.name || session?.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {/* {session?.user?.type === "CANDIDAT" ? "Candidat" : "Recruteur"} */}
                      </p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      // if (user.type === "CANDIDAT") {
                      //   router.push("/dashboard-candidats");
                      // } else if (user.type === "RECRUTEUR") {
                      //   router.push("/dashboard-recruteurs");
                      // }
                    }}
                  >
                    Mon espace
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/dashboard-recruteurs/profil");
                    }}
                  >
                    Modifier mon profil recruteur
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.reload();
                    }}
                  >
                    Se déconnecter
                  </Button>
                </div>
              )}

              {!isPending && session?.user && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg">
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={session?.user?.image || undefined}
                        alt={
                          session?.user?.name ||
                          session?.user?.email ||
                          "Avatar"
                        }
                      />
                      <AvatarFallback>
                        {session?.user?.name
                          ? session?.user?.name.charAt(0) +
                            session?.user?.email.charAt(0)
                          : session?.user?.email
                            ? session?.user?.email.charAt(0) +
                              session?.user?.name.charAt(0)
                            : "U"}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-foreground truncate">
                        {session?.user?.name && session?.user?.email
                          ? `${session?.user?.name} ${session?.user?.email}`
                          : session?.user?.email}
                      </p>
                      <p className="text-xs text-muted-foreground">Candidat</p>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      router.push("/dashboard-candidats");
                    }}
                  >
                    Mon espace
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start"
                    onClick={() => {
                      setIsMenuOpen(false);
                      setIsOpenCandidat(true);
                    }}
                  >
                    Modifier mon profil candidat
                  </Button>
                  <Button
                    variant="ghost"
                    className="w-full justify-start text-destructive hover:text-destructive"
                    onClick={async () => {
                      setIsMenuOpen(false);
                      await fetch("/api/auth/logout", { method: "POST" });
                      window.location.reload();
                    }}
                  >
                    Se déconnecter
                  </Button>
                </div>
              )}

              {/* Bouton pour utilisateurs non connectés */}
              {!isPending && !session?.user && !session?.user && (
                <Button
                  onClick={() => {
                    setIsMenuOpen(false);
                    setIsOpen(true);
                  }}
                  className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Commencer gratuitement
                </Button>
              )}

              {/* ModeToggle en mobile */}
              <div className="flex justify-center pt-2">
                <ModeToggle />
              </div>
            </div>
          </div>
        )}

        {isOpen && (
          <div className="min-h-screen bg-background">
            <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="relative flex flex-col bg-card rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
                {/* Close button */}
                <button
                  onClick={() => setIsOpen(false)}
                  className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-muted rounded-full transition-colors duration-200 group"
                >
                  <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
                </button>

                {/* Header */}
                <div className="text-center mb-6 md:mb-8">
                  <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-primary mb-2 md:mb-3">
                    Bienvenue sur Ylsix
                  </h2>
                  <p className="text-muted-foreground text-base md:text-lg">
                    Vous êtes un recruteur ou un candidat ?
                  </p>
                </div>

                {/* Options */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                  <Link href="/auth/recruteur/connexion" className="group">
                    <div className="flex flex-col items-center justify-center border-2 border-border hover:border-primary hover:shadow-lg rounded-xl p-6 md:p-8 h-40 md:h-48 cursor-pointer transition-all duration-300 bg-gradient-to-br from-card to-muted hover:from-primary/5 hover:to-primary/10">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                        <UserCheck
                          size={24}
                          className="text-primary md:w-8 md:h-8"
                        />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                        Recruteur
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground text-center">
                        Publiez des offres et trouvez les meilleurs talents
                      </p>
                    </div>
                  </Link>

                  <Link href="/auth/candidat/connexion" className="group">
                    <div className="flex flex-col items-center justify-center border-2 border-border hover:border-primary hover:shadow-lg rounded-xl p-6 md:p-8 h-40 md:h-48 cursor-pointer transition-all duration-300 bg-gradient-to-br from-card to-muted hover:from-primary/5 hover:to-primary/10">
                      <div className="w-12 h-12 md:w-16 md:h-16 bg-primary/10 rounded-full flex items-center justify-center mb-3 md:mb-4 group-hover:bg-primary/20 transition-colors duration-300">
                        <Briefcase
                          size={24}
                          className="text-primary md:w-8 md:h-8"
                        />
                      </div>
                      <h3 className="text-lg md:text-xl font-semibold text-foreground mb-2">
                        Candidat
                      </h3>
                      <p className="text-xs md:text-sm text-muted-foreground text-center">
                        Découvrez des opportunités et postulez facilement
                      </p>
                    </div>
                  </Link>
                </div>

                {/* Footer */}
                <div className="text-center mt-4 md:mt-6">
                  <p className="text-xs md:text-sm text-muted-foreground">
                    Rejoignez notre communauté de professionnels
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      <Sheet open={isOpenCandidat} onOpenChange={setIsOpenCandidat}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto px-6 py-8">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-xl font-bold">
              Modifier mon profil candidat
            </SheetTitle>
            <SheetDescription>
              Mettez à jour vos informations personnelles et professionnelles
            </SheetDescription>
          </SheetHeader>

          <CandidatProfileForm onClose={() => setIsOpenCandidat(false)} />
        </SheetContent>
      </Sheet>
    </div>
  );
};

export default Header;
