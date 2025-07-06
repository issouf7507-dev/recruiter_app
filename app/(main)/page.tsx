"use client";
import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Briefcase,
  TrendingUp,
  Shield,
  CheckCircle2,
  ArrowRight,
  Star,
  UserCheck,
  X,
} from "lucide-react";
import Header from "../components/header/header";

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isStep, setIsStep] = useState(1);
  const [isRecruteur, setIsRecruteur] = useState(false);
  const [isCandidat, setIsCandidat] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <section className="container mx-auto px-4 py-20 flex items-center gap-12 justify-center flex-col h-screen ">
        {/* Left: Text */}
        <div className="text-center w-full">
          <Badge variant="secondary" className="mb-6 px-4 py-2 text-sm">
            Plateforme de recrutement nouvelle génération
          </Badge>
          <h1 className="text-7xl w-full mb-5">
            Recrutement, RH et conformité pour <br />
            <span className="text-primary">les équipes mondiales</span>
          </h1>
          <p className="w-full text-xl mb-10">
            Recrutez des talents dans 150+ pays, gérez la paie mondiale et
            restez 100% <br />
            conformes—le tout sur une seule plateforme.
          </p>
          <div className="flex gap-4 justify-center ">
            {/* <Link href="/recruteur/inscription"> */}
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
            {/* </Link> */}
            <Link href="#demo">
              <Button variant="outline" size="lg" className="text-lg px-8 py-6">
                Réserver une démo
              </Button>
            </Link>
          </div>
        </div>
        {/* Right: Stat Card */}
      </section>

      {/* Logos Clients */}
      {/* <section className="container mx-auto px-4 py-8">
        <div className="flex flex-wrap justify-center items-center gap-8 opacity-70">
          <Image src="/vercel.svg" alt="Vercel" width={100} height={32} />
          <Image src="/globe.svg" alt="Globe" width={100} height={32} />
          <Image src="/next.svg" alt="Next.js" width={100} height={32} />
          <Image src="/window.svg" alt="Window" width={100} height={32} />
          <span className="text-lg font-semibold">Microsoft</span>
        </div>
      </section> */}

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Boostez vos recrutements avec une plateforme intelligente
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Multipliez vos canaux de recrutement et touchez les meilleurs
            talents. Diffusez vos offres sur +160 jobboards, trouvez les bons
            profils sur LinkedIn et CVthèques, et activez la cooptation pour
            booster votre visibilité.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          <Card className="border  hover:shadow-md transition-all duration-300 shadow-none">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Users className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Personnalisez vos processus de recrutement
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Sublimez l'expérience candidat. Adaptez votre processus de
                recrutement en fonction de vos candidats et personnalisez les
                étapes pour attirer, évaluer et recruter en toute simplicité.
              </p>
              <Button variant="link" className="text-primary">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
          <Card className=" hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Briefcase className="w-8 h-8 mb-4" />
              <h3 className="text-lg font-semibold mb-2">
                Collaborez avec vos équipes
              </h3>
              <p className="text-sm mb-4">
                Instaurez un processus de recrutement collaboratif. Créez plus
                de synergie avec vos équipes pour évaluer et recruter vos futurs
                collaborateurs. Recueillez les commentaires et évaluations de
                chacun et décidez ensemble des meilleurs candidats pour votre
                entreprise.
              </p>
              <Button variant="outline" className="border-white text-primary">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
          <Card className="border hover:shadow-md transition-all duration-300 shadow-none">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <TrendingUp className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Simplifiez votre quotidien
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Automatisez vos tâches chronophages. Embauchez plus rapidement
                avec une plateforme de recrutement qui automatise les tâches
                comme la planification des entretiens et les demandes
                d'approbation. Utilisez notre outil de statistiques pour
                améliorer vos sources d'acquisition et vous concentrer sur
                l'essentiel.
              </p>
              <Button variant="link" className="text-primary">
                En savoir plus
              </Button>
            </CardContent>
          </Card>
          <Card className="border  hover:shadow-md transition-all duration-300 shadow-none ">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <Shield className="w-8 h-8 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2 text-foreground">
                Attirez et sourcez des candidats
              </h3>
              <p className="text-muted-foreground text-sm mb-4">
                Multidiffusez, sourcez et cooptez. Élaborez une stratégie
                multicanale pour recruter les bons candidats. Multidiffusez sur
                +160 jobboards, sourcez vos candidats sur LinkedIn et CVthèques,
                et utilisez le réseau de vos collaborateurs grâce à la
                cooptation.
              </p>
              <Button variant="link" className="text-primary">
                Commencer gratuitement
              </Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Avantages Section */}
      <section className="bg-muted/50 py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-16">
          <div className="flex-1">
            <div className="w-full h-64 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-7xl text-primary">👨‍💼</span>
            </div>
          </div>
          <div className="flex-1">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
              Avantages clés
            </Badge>
            <h2 className="text-4xl font-bold text-foreground mb-4">
              Profitez des avantages d'avoir tout sur une seule plateforme
            </h2>
            <ul className="space-y-4 text-lg text-muted-foreground mb-8">
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3" />
                Intégration et départ en un clic
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3" />
                Conformité et contrats automatisés
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3" />
                Paiements mondiaux en 120+ devises
              </li>
              <li className="flex items-center">
                <CheckCircle2 className="w-5 h-5 text-primary mr-3" />
                Support 24/7 pour vous et votre équipe
              </li>
            </ul>
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-lg px-8 py-6"
            >
              Commencer gratuitement
            </Button>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-20">
        <div className="text-center mb-16">
          <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm">
            Nos tarifs
          </Badge>
          <h2 className="text-4xl font-bold text-foreground mb-4">
            Nous avons des plans exclusifs pour vous
          </h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          <Card className="shadow-lg">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Salarié EOR
              </h3>
              <div className="text-3xl font-bold text-primary mb-4">
                599€<span className="text-base font-normal">/Mois</span>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li>Embaucher dans 150+ pays</li>
                <li>Conformité automatisée</li>
                <li>Paiements mondiaux</li>
                <li>Support 24/7</li>
              </ul>
              <Button className="w-full">Commencer</Button>
            </CardContent>
          </Card>
          <Card className="shadow-lg border-2 border-primary">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Prestataire
              </h3>
              <div className="text-3xl font-bold text-primary mb-4">
                99€<span className="text-base font-normal">/Mois</span>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li>Intégrer des prestataires mondialement</li>
                <li>Contrats conformes</li>
                <li>Paiements automatisés</li>
                <li>Support dans 180+ pays</li>
              </ul>
              <Button className="w-full bg-primary text-primary-foreground">
                Commencer
              </Button>
            </CardContent>
          </Card>
          <Card className="shadow-lg">
            <CardContent className="p-8 flex flex-col items-center text-center">
              <h3 className="text-xl font-semibold mb-2 text-foreground">
                Paie mondiale
              </h3>
              <div className="text-3xl font-bold text-primary mb-4">
                1200€<span className="text-base font-normal">/Mois</span>
              </div>
              <ul className="space-y-2 text-muted-foreground text-sm mb-6">
                <li>Gérer la paie dans 120+ pays</li>
                <li>Déclarations fiscales automatisées</li>
                <li>Support multi-devises</li>
                <li>Gestionnaire de compte dédié</li>
              </ul>
              <Button className="w-full">Commencer</Button>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-4 py-20">
        <div className="flex flex-col md:flex-row items-center gap-12">
          <div className="flex-1">
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-5 h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-lg">
                  "Comment Revolut a simplifié la relocalisation des employés
                  avec Hirer. La plateforme est facile à utiliser et l'équipe de
                  support est toujours disponible. Nous avons économisé du temps
                  et de l'argent sur l'embauche mondiale."
                </p>
                <div className="flex items-center mt-6">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-2xl">
                    👨‍💼
                  </div>
                  <div>
                    <div className="font-semibold text-foreground">
                      Lukas Bensing
                    </div>
                    <div className="text-sm text-muted-foreground">
                      Responsable RH, Revolut
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
          <div className="flex-1 flex justify-center">
            <div className="w-full h-64 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-7xl text-primary">💼</span>
            </div>
          </div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary/10 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
            Abonnez-vous à notre newsletter
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-xl mx-auto">
            Recevez les dernières actualités et mises à jour sur l'embauche
            mondiale, les RH et la paie directement dans votre boîte mail.
          </p>
          <form className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Entrez votre email"
              className="w-full sm:w-auto px-6 py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary"
              required
            />
            <Button type="submit" className="px-8 py-4 text-lg">
              Recevoir le guide
            </Button>
          </form>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-muted py-12 mt-12">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-8 mb-8">
            <div className="flex items-center space-x-2">
              <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
              <span className="text-xl font-bold text-foreground">Hirer</span>
            </div>
            <div className="flex gap-6 text-muted-foreground text-lg">
              <Link href="#features" className="hover:text-foreground">
                Fonctionnalités
              </Link>
              <Link href="#pricing" className="hover:text-foreground">
                Tarifs
              </Link>
              <Link href="#about" className="hover:text-foreground">
                À propos
              </Link>
            </div>
            <div className="flex gap-4">
              <a href="#" aria-label="Twitter" className="hover:opacity-80">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M22 5.92a8.38 8.38 0 01-2.36.65A4.13 4.13 0 0021.4 4.1a8.19 8.19 0 01-2.6.99A4.1 4.1 0 0012 8.09c0 .32.04.64.1.94A11.65 11.65 0 013 4.89a4.07 4.07 0 001.27 5.47A4.07 4.07 0 012.8 9.1v.05a4.1 4.1 0 003.29 4.02c-.36.1-.74.16-1.13.16-.28 0-.54-.03-.8-.08a4.1 4.1 0 003.83 2.85A8.23 8.23 0 012 19.54a11.62 11.62 0 006.29 1.84c7.55 0 11.68-6.26 11.68-11.68 0-.18-.01-.36-.02-.54A8.18 8.18 0 0022 5.92z"
                    fill="currentColor"
                  />
                </svg>
              </a>
              <a href="#" aria-label="LinkedIn" className="hover:opacity-80">
                <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
                  <path
                    d="M19 0h-14c-2.76 0-5 2.24-5 5v14c0 2.76 2.24 5 5 5h14c2.76 0 5-2.24 5-5v-14c0-2.76-2.24-5-5-5zm-11 19h-3v-9h3v9zm-1.5-10.28c-.97 0-1.75-.79-1.75-1.75s.78-1.75 1.75-1.75 1.75.79 1.75 1.75-.78 1.75-1.75 1.75zm13.5 10.28h-3v-4.5c0-1.08-.02-2.47-1.5-2.47-1.5 0-1.73 1.17-1.73 2.39v4.58h-3v-9h2.88v1.23h.04c.4-.75 1.38-1.54 2.84-1.54 3.04 0 3.6 2 3.6 4.59v4.72z"
                    fill="currentColor"
                  />
                </svg>
              </a>
            </div>
          </div>
          <div className="border-t border-border pt-8 text-center text-muted-foreground">
            <p>&copy; 2024 Hirer. Tous droits réservés.</p>
          </div>
        </div>
      </footer>

      {/* les absoulutes  */}

      {isOpen && (
        <div className="fixed inset-0 w-full h-full bg-[#00000083] z-50 flex items-center justify-center">
          <div className="relative flex flex-col  bg-white rounded-lg p-4 w-[800px]">
            <div className="absolute top-0 right-0 p-5 cursor-pointer-">
              <X
                className="w-6 h-6 text-primary mb-2 cursor-pointer "
                onClick={() => setIsOpen(false)}
              />
            </div>
            <p className=" text-center text-3xl font-bold text-primary">
              Bienvenue sur xlsix
            </p>
            <p className="text-gray-400 text-center text-lg">
              Vous etes un recruteur ? ou un candidat ?
            </p>
            <div className="grid grid-cols-2 gap-5 mt-5 w-full">
              <Link href="/recruteur/inscription">
                <div className="flex flex-col items-center justify-center border-4 hover:border-primary rounded-lg p-4 h-40 cursor-pointer">
                  <UserCheck size={60} className="text-primary mb-2" />
                  <p className="text-2xl">Recruteur</p>
                </div>
              </Link>

              <Link href="/candidat/inscription">
                <div className="flex flex-col items-center justify-center border-4 hover:border-primary rounded-lg p-4 h-40 cursor-pointer">
                  <Briefcase size={60} className="text-primary mb-2" />
                  <p className="text-2xl">Candidat</p>
                </div>
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
