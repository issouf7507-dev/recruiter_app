import { Button } from "@/components/ui/button";
import Link from "next/link";
import React from "react";

const Header = () => {
  return (
    <header className="fixed w-full border-b border-border bg-background/80 backdrop-blur-sm top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
          <span className="text-xl font-bold text-foreground">Xlsix</span>
        </div>

        <div className="flex items-center space-x-4">
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
        </div>
      </div>
    </header>
  );
};

export default Header;
