import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Link from "next/link";
import React, { useState } from "react";
import { Menu, X } from "lucide-react";
import { ModeToggle } from "../toggle-dark/toggle-dark";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <header className="fixed w-full border-b border-border bg-background/80 backdrop-blur-sm top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
          <Link href="/">
            <span className="text-xl font-bold text-foreground">Ylsix</span>
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
          <Link href="/recruteur/connexion">
            <Button
              variant="ghost"
              className="text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              Se connecter
            </Button>
          </Link>
          <Link href="/recruteur/inscription">
            <Button className="bg-primary text-primary-foreground hover:bg-primary/90">
              Commencer gratuitement
            </Button>
          </Link>

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
            <Link
              href="/recruteur/connexion"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button
                variant="ghost"
                className="w-full justify-start text-muted-foreground hover:text-foreground hover:bg-accent"
              >
                Se connecter
              </Button>
            </Link>
            <Link
              href="/recruteur/inscription"
              onClick={() => setIsMenuOpen(false)}
            >
              <Button className="w-full justify-start bg-primary text-primary-foreground hover:bg-primary/90">
                Commencer gratuitement
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
};

export default Header;
