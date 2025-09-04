"use client";
import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
  Search,
  MapPin,
  Building,
} from "lucide-react";
import Header from "../components/header/header";
import Footer from "../components/footer/footer";
import ChatBox from "@/components/ChatBox";
import { useTheme } from "next-themes";
import { useAutoRedirect } from "@/hooks/useAutoRedirect";

// Animation variants
const fadeInUp = {
  initial: { opacity: 0, y: 60 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.8 },
  animate: { opacity: 1, scale: 1 },
  transition: { duration: 0.5, ease: "easeOut" },
};

const slideInLeft = {
  initial: { opacity: 0, x: -60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

const slideInRight = {
  initial: { opacity: 0, x: 60 },
  animate: { opacity: 1, x: 0 },
  transition: { duration: 0.6, ease: "easeOut" },
};

// Data structure for pricing cards
const pricingPlans = [
  {
    id: 1,
    name: "Plan Gratuit",
    price: 0,
    currency: "€",
    period: "Mois",
    description:
      "Parfait pour découvrir la plateforme et commencer vos premiers recrutements",
    features: [
      "Jusqu'à 3 offres d'emploi actives",
      "Tableau Kanban basique",
      "Profil candidat complet",
      "Support par email",
    ],
    buttonText: "Commencer gratuitement",
    buttonVariant: "default",
    isPopular: false,
    onClick: () => {}, // Will be set in component
  },
  {
    id: 2,
    name: "Plan Pro",
    price: 20,
    currency: "€",
    period: "Mois",
    description:
      "Pour les équipes de recrutement qui veulent optimiser leurs processus",
    features: [
      "Offres d'emploi illimitées",
      "Templates d'offres personnalisables",
      "Collaboration d'équipe (jusqu'à 5 membres)",
      "Recherche avancée de candidats",
      "Statistiques détaillées",
    ],
    buttonText: "Commencer maintenant",
    buttonVariant: "primary",
    isPopular: true,
    onClick: () => {}, // Will be set in component
  },
  {
    id: 3,
    name: "Plan Entreprise",
    price: 35,
    currency: "€",
    period: "Mois",
    description:
      "Solution complète pour les grandes entreprises et agences de recrutement",
    features: [
      "Tout du plan Pro",
      "Équipe illimitée",
      "Diffusion multi-canal",
      "API personnalisée",
      "Gestionnaire de compte dédié",
      "Support 24/7",
    ],
    buttonText: "Commencer maintenant",
    buttonVariant: "default",
    isPopular: false,
    onClick: () => {}, // Will be set in component
  },
];

export default function Home() {
  const [isOpen, setIsOpen] = useState(false);
  const [isSearchModalOpen, setIsSearchModalOpen] = useState(false);
  const router = useRouter();
  const { theme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Redirection automatique si l'utilisateur est connecté
  const { user, isLoading } = useAutoRedirect();

  // Search states
  const [searchQuery, setSearchQuery] = useState("");
  const [searchLocation, setSearchLocation] = useState("");
  const [searchCompany, setSearchCompany] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // Set onClick handlers for pricing cards
  const pricingPlansWithHandlers = pricingPlans.map((plan) => ({
    ...plan,
    onClick: () => setIsOpen(true),
  }));

  // Handle search
  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSearching(true);

    try {
      // Build search parameters
      const searchParams = new URLSearchParams();
      if (searchQuery) searchParams.append("q", searchQuery);
      if (searchLocation) searchParams.append("location", searchLocation);
      if (searchCompany) searchParams.append("company", searchCompany);

      // Navigate to search results page
      router.push(`/offres?${searchParams.toString()}`);
      setIsSearchModalOpen(false);

      // Reset search form
      setSearchQuery("");
      setSearchLocation("");
      setSearchCompany("");
    } catch (error) {
      console.error("Erreur lors de la recherche:", error);
    } finally {
      setIsSearching(false);
    }
  };

  const [loadingLogo, setLoadingLogo] = useState(true);

  useEffect(() => {
    setMounted(true);
    const timer = setTimeout(() => {
      setLoadingLogo(false);
    }, 4000);
    return () => clearTimeout(timer);
  }, []);

  // Afficher un loader si l'utilisateur est connecté et en cours de redirection
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Redirection en cours...</p>
        </div>
      </div>
    );
  }

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

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <Header />
      {/* Hero Section */}
      <section className=" mx-auto px-4 py-12  flex  gap-8 justify-center flex-col min-h-screen items-center">
        {/* Left: Text */}
        <motion.div
          className="text-center  w-full "
          initial="initial"
          animate="animate"
          variants={fadeInUp}
        >
          <motion.div variants={fadeInUp} transition={{ delay: 0.1 }}>
            <Badge
              variant="secondary"
              className="mb-4 md:mb-6 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm"
            >
              Plateforme de recrutement nouvelle génération
            </Badge>
          </motion.div>
          <motion.h1
            className="text-3xl md:text-5xl lg:text-6xl xl:text-7xl w-full mb-4 md:mb-5 leading-tight"
            variants={fadeInUp}
            transition={{ delay: 0.2 }}
          >
            Recrutement, RH et conformité pour <br />
            <span className="text-primary">les équipes mondiales</span>
          </motion.h1>
          <motion.p
            className="w-full text-base md:text-lg lg:text-xl mb-6 md:mb-10 max-w-2xl lg:max-w-none mx-auto lg:mx-0 px-4 lg:px-0"
            variants={fadeInUp}
            transition={{ delay: 0.3 }}
          >
            Recrutez des talents dans 150+ pays, gérez la paie mondiale et
            restez 100% conformes—le tout sur une seule plateforme.
          </motion.p>
          <motion.div
            className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center  items-center px-4 lg:px-0"
            variants={fadeInUp}
            transition={{ delay: 0.4 }}
          >
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              className="text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
              onClick={() => {
                window.location.href = "/offres";
              }}
            >
              Rechercher une offre
            </Button>
          </motion.div>
        </motion.div>

        {/* Right: Dashboard Image */}
        <motion.div
          className="w-full flex justify-center items-center"
          initial="initial"
          animate="animate"
          variants={slideInRight}
          transition={{ delay: 0.5 }}
        >
          <div className="relative w-full max-w-5xl">
            {mounted && (
              <Image
                src={
                  resolvedTheme === "dark" ? "/dashdark.png" : "/dashlight.png"
                }
                alt="Dashboard Ylsix"
                width={800}
                height={600}
                className="w-full h-auto rounded-xl shadow-2xl border border-border/50"
                priority
              />
            )}
            {/* Floating elements for visual appeal */}
            <motion.div
              className="absolute -top-4 -right-4 w-8 h-8 bg-primary/20 rounded-full"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.5, 0.8, 0.5],
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
            />
            <motion.div
              className="absolute -bottom-4 -left-4 w-6 h-6 bg-secondary/30 rounded-full"
              animate={{
                scale: [1, 1.3, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{
                duration: 2.5,
                repeat: Infinity,
                ease: "easeInOut",
                delay: 0.5,
              }}
            />
          </div>
        </motion.div>
      </section>

      {/* Logos Clients */}

      {/* Features Section */}
      <section id="features" className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 px-4">
            Boostez vos recrutements avec une plateforme intelligente
          </h2>
          <p className="text-base md:text-lg lg:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
            Multipliez vos canaux de recrutement et touchez les meilleurs
            talents. Diffusez vos offres sur +160 jobboards, trouvez les bons
            profils sur LinkedIn et CVthèques, et activez la cooptation pour
            booster votre visibilité.
          </p>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 md:gap-8"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          <motion.div variants={scaleIn}>
            <Card className="border bg-transparent hover:shadow-md transition-all duration-300 shadow-none h-[450px]">
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
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => {
                    window.location.href = "/a-propos";
                  }}
                >
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn}>
            <Card className=" hover:shadow-xl transition-all duration-300 bg-primary text-primary-foreground h-[450px]">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <Briefcase className="w-8 h-8 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  Collaborez avec vos équipes
                </h3>
                <p className="text-sm mb-4">
                  Instaurez un processus de recrutement collaboratif. Créez plus
                  de synergie avec vos équipes pour évaluer et recruter vos
                  futurs collaborateurs. Recueillez les commentaires et
                  évaluations de chacun et décidez ensemble des meilleurs
                  candidats pour votre entreprise.
                </p>
                <Button
                  variant="outline"
                  className="border-white text-primary"
                  onClick={() => {
                    window.location.href = "/a-propos";
                  }}
                >
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn}>
            <Card className="border bg-transparent hover:shadow-md transition-all duration-300 shadow-none h-[450px]">
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
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => {
                    window.location.href = "/a-propos";
                  }}
                >
                  En savoir plus
                </Button>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div variants={scaleIn}>
            <Card className="border bg-transparent hover:shadow-md transition-all duration-300 shadow-none h-[450px]">
              <CardContent className="p-8 flex flex-col items-center text-center">
                <Shield className="w-8 h-8 text-primary mb-4" />
                <h3 className="text-lg font-semibold mb-2 text-foreground">
                  Attirez et sourcez des candidats
                </h3>
                <p className="text-muted-foreground text-sm mb-4">
                  Multidiffusez, sourcez et cooptez. Élaborez une stratégie
                  multicanale pour recruter les bons candidats. Multidiffusez
                  sur +160 jobboards, sourcez vos candidats sur LinkedIn et
                  CVthèques, et utilisez le réseau de vos collaborateurs grâce à
                  la cooptation.
                </p>
                <Button
                  variant="link"
                  className="text-primary"
                  onClick={() => {
                    window.location.href = "/a-propos";
                  }}
                >
                  Commencer gratuitement
                </Button>
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      </section>

      {/* Avantages Section */}
      <section className="bg-muted/50 py-12 md:py-20">
        <div className="container mx-auto px-4 flex flex-col md:flex-row items-center gap-8 md:gap-16">
          <motion.div
            className="flex-1 order-2 md:order-1"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInLeft}
          >
            <div className="w-full h-48 md:h-64 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-4xl md:text-7xl text-primary">🎯</span>
            </div>
          </motion.div>
          <motion.div
            className="flex-1 order-1 md:order-2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInRight}
          >
            <Badge
              variant="secondary"
              className="mb-4 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm"
            >
              Avantages clés
            </Badge>
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Une plateforme complète pour optimiser vos recrutements
            </h2>
            <ul className="space-y-3 md:space-y-4 text-base md:text-lg text-muted-foreground mb-6 md:mb-8">
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  Tableau Kanban pour suivre vos candidatures en temps réel
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  Système de templates pour créer des offres rapidement
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  Collaboration d'équipe avec gestion des rôles et permissions
                </span>
              </li>
              <li className="flex items-start">
                <CheckCircle2 className="w-4 h-4 md:w-5 md:h-5 text-primary mr-3 mt-0.5 flex-shrink-0" />
                <span>
                  Diffusion multi-canal et recherche de candidats avancée
                </span>
              </li>
            </ul>
            <Button
              onClick={() => setIsOpen(true)}
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90 text-base md:text-lg px-6 md:px-8 py-4 md:py-6 w-full sm:w-auto"
            >
              Commencer gratuitement
            </Button>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="container mx-auto px-4 py-12 md:py-20">
        <motion.div
          className="text-center mb-12 md:mb-16"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <Badge
            variant="secondary"
            className="mb-4 px-3 md:px-4 py-1 md:py-2 text-xs md:text-sm"
          >
            Nos tarifs
          </Badge>
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4 px-4">
            Nous avons des plans exclusifs pour vous
          </h2>
        </motion.div>
        <motion.div
          className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8 max-w-5xl mx-auto"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.1 }}
          variants={staggerContainer}
        >
          {pricingPlansWithHandlers.map((plan) => (
            <motion.div key={plan.id} variants={scaleIn}>
              <Card
                className={`shadow-none min-h-[600px] md:h-[650px] ${
                  plan.isPopular
                    ? "border-2 border-primary bg-primary"
                    : "bg-transparent"
                }`}
              >
                <CardContent className="flex flex-col justify-between h-full">
                  <div className="p-6 md:p-8 flex flex-col">
                    <h3
                      className={`text-lg md:text-xl font-semibold mb-2 text-foreground ${
                        plan.isPopular ? "text-white" : ""
                      }`}
                    >
                      {plan.name}
                    </h3>
                    <div
                      className={`text-xl md:text-3xl font-bold text-primary mb-4 md:mb-7 ${
                        plan.isPopular ? "text-white" : ""
                      }`}
                    >
                      {plan.price} {plan.currency}
                      <span
                        className={`text-sm md:text-base font-normal ${
                          plan.isPopular ? "text-white" : ""
                        }`}
                      >
                        {" "}
                        / {plan.period}
                      </span>
                    </div>
                    <div className="flex items-center justify-center mb-4 md:mb-7">
                      <p
                        className={`text-muted-foreground text-xs md:text-sm text-center ${
                          plan.isPopular ? "text-white" : ""
                        }`}
                      >
                        {plan.description}
                      </p>
                    </div>
                    <div
                      className={`border-b border-gray-200 w-full mb-4 md:mb-7 ${
                        plan.isPopular ? "border-white" : ""
                      }`}
                    ></div>

                    <ul className="space-y-2 text-muted-foreground text-xs md:text-sm mb-4 md:mb-6 list-disc flex flex-col gap-2">
                      {plan.features.map((feature, index) => (
                        <li
                          key={index}
                          className={`flex items-start ${
                            plan.isPopular ? "text-white" : ""
                          }`}
                        >
                          <CheckCircle2
                            className={`w-4 h-4 md:w-5 md:h-5 text-primary mr-2 md:mr-3 mt-0.5 flex-shrink-0 ${
                              plan.isPopular ? "text-white" : ""
                            }`}
                          />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Button
                    onClick={plan.onClick}
                    className={`w-full text-sm md:text-base ${
                      plan.buttonVariant === "primary"
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : ""
                    } ${plan.isPopular ? "bg-white text-primary" : ""}`}
                  >
                    {plan.buttonText}
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* Testimonial Section */}
      <section className="container mx-auto px-4 py-12 md:py-20">
        <div className="flex flex-col md:flex-row items-center gap-8 md:gap-12">
          <motion.div
            className="flex-1 order-2 md:order-1"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInLeft}
          >
            <Card className="shadow-xl bg-transparent">
              <CardContent className="p-6 md:p-8">
                <div className="flex items-center mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className="w-4 h-4 md:w-5 md:h-5 text-yellow-400 fill-current"
                    />
                  ))}
                </div>
                <p className="text-muted-foreground mb-4 text-base md:text-lg">
                  "Comment Revolut a simplifié la relocalisation des employés
                  avec Hirer. La plateforme est facile à utiliser et l'équipe de
                  support est toujours disponible. Nous avons économisé du temps
                  et de l'argent sur l'embauche mondiale."
                </p>
                <div className="flex items-center mt-6">
                  <div className="w-10 h-10 md:w-12 md:h-12 bg-primary/10 rounded-full flex items-center justify-center mr-3 text-xl md:text-2xl">
                    👨‍💼
                  </div>
                  <div>
                    <div className="font-semibold text-foreground text-sm md:text-base">
                      Lukas Bensing
                    </div>
                    <div className="text-xs md:text-sm text-muted-foreground">
                      Responsable RH, Revolut
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </motion.div>
          <motion.div
            className="flex-1 flex justify-center order-1 md:order-2"
            initial="initial"
            whileInView="animate"
            viewport={{ once: true, amount: 0.3 }}
            variants={slideInRight}
          >
            <div className="w-full h-48 md:h-64 bg-primary/10 rounded-xl flex items-center justify-center">
              <span className="text-4xl md:text-7xl text-primary">💼</span>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Newsletter Section */}
      <section className="bg-primary/10 py-12 md:py-16">
        <motion.div
          className="container mx-auto px-4 text-center"
          initial="initial"
          whileInView="animate"
          viewport={{ once: true, amount: 0.3 }}
          variants={fadeInUp}
        >
          <h2 className="text-2xl md:text-3xl lg:text-4xl font-bold text-foreground mb-4">
            Abonnez-vous à notre newsletter
          </h2>
          <p className="text-base md:text-lg text-muted-foreground mb-6 md:mb-8 max-w-xl mx-auto">
            Recevez les dernières actualités et mises à jour sur l'embauche
            mondiale, les RH et la paie directement dans votre boîte mail.
          </p>
          <form className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center items-center max-w-xl mx-auto">
            <input
              type="email"
              placeholder="Entrez votre email"
              className="w-full sm:w-auto px-4 md:px-6 py-3 md:py-4 rounded-lg border border-border focus:outline-none focus:ring-2 focus:ring-primary text-sm md:text-base"
              required
            />
            <Button
              type="submit"
              className="px-6 md:px-8 py-3 md:py-4 text-sm md:text-lg w-full sm:w-auto"
            >
              Recevoir le guide
            </Button>
          </form>
        </motion.div>
      </section>

      {/* Footer */}
      <Footer />

      {/* Chat Box */}
      <ChatBox />

      {/* les absoulutes  */}

      {isOpen && (
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
              <Link href="/recruteur/inscription" className="group">
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

              <Link href="/candidat/inscription" className="group">
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
      )}

      {/* Search Modal */}
      {isSearchModalOpen && (
        <div className="fixed inset-0 w-full h-full bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="relative flex flex-col bg-card rounded-xl md:rounded-2xl shadow-2xl p-6 md:p-8 w-full max-w-2xl animate-in fade-in-0 zoom-in-95 duration-300 max-h-[90vh] overflow-y-auto">
            {/* Close button */}
            <button
              onClick={() => setIsSearchModalOpen(false)}
              className="absolute top-3 right-3 md:top-4 md:right-4 p-2 hover:bg-muted rounded-full transition-colors duration-200 group"
            >
              <X className="w-4 h-4 md:w-5 md:h-5 text-muted-foreground group-hover:text-foreground transition-colors" />
            </button>

            {/* Header */}
            <div className="text-center mb-6 md:mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-primary mb-2 md:mb-3">
                Rechercher une offre
              </h2>
              <p className="text-muted-foreground text-base md:text-lg">
                Trouvez l'opportunité qui vous correspond
              </p>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSearch} className="space-y-4 md:space-y-6">
              <div className="space-y-3 md:space-y-4">
                <div>
                  <Label
                    htmlFor="searchQuery"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    <Search className="w-4 h-4 inline mr-2" />
                    Poste ou compétences
                  </Label>
                  <Input
                    id="searchQuery"
                    type="text"
                    placeholder="Ex: Développeur React, Marketing Digital..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="searchLocation"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    <MapPin className="w-4 h-4 inline mr-2" />
                    Localisation
                  </Label>
                  <Input
                    id="searchLocation"
                    type="text"
                    placeholder="Ex: Paris, Télétravail, Abidjan..."
                    value={searchLocation}
                    onChange={(e) => setSearchLocation(e.target.value)}
                    className="w-full"
                  />
                </div>

                <div>
                  <Label
                    htmlFor="searchCompany"
                    className="text-sm font-medium text-foreground mb-2 block"
                  >
                    <Building className="w-4 h-4 inline mr-2" />
                    Entreprise (optionnel)
                  </Label>
                  <Input
                    id="searchCompany"
                    type="text"
                    placeholder="Ex: Google, Microsoft..."
                    value={searchCompany}
                    onChange={(e) => setSearchCompany(e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsSearchModalOpen(false)}
                  className="flex-1"
                >
                  Annuler
                </Button>
                <Button
                  type="submit"
                  disabled={
                    isSearching ||
                    (!searchQuery && !searchLocation && !searchCompany)
                  }
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSearching ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Recherche...
                    </>
                  ) : (
                    <>
                      <Search className="w-4 h-4 mr-2" />
                      Rechercher
                    </>
                  )}
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
