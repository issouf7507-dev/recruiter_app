"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Briefcase,
  Search,
  MessageSquare,
  BarChart2,
  FileText,
  Star,
  Zap,
  Shield,
  Globe,
  Target,
  TrendingUp,
  CheckCircle2,
  ArrowRight,
  LayoutDashboard,
  ClipboardList,
  UserCheck,
  Building,
  Mail,
  Bell,
  Settings,
  Eye,
  Heart,
  Calendar,
  MapPin,
  DollarSign,
  Clock,
  Award,
  Lightbulb,
  Cpu,
  Database,
  Lock,
  RefreshCw,
  Smartphone,
  Monitor,
  Tablet,
} from "lucide-react";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

const features = {
  recruteurs: [
    {
      icon: <Briefcase className="h-8 w-8 text-primary" />,
      title: "Gestion des offres d'emploi",
      description:
        "Créez, modifiez et gérez vos offres d'emploi avec des templates personnalisables",
      features: [
        "Templates d'offres réutilisables",
        "Éditeur WYSIWYG avancé",
        "Gestion des statuts et visibilité",
        "Diffusion multi-canal automatique",
      ],
    },
    {
      icon: <LayoutDashboard className="h-8 w-8 text-primary" />,
      title: "Tableau Kanban intelligent",
      description:
        "Suivez vos candidatures avec un tableau Kanban personnalisable et collaboratif",
      features: [
        "Colonnes personnalisables",
        "Drag & drop en temps réel",
        "Collaboration d'équipe",
        "Notes et commentaires",
      ],
    },
    {
      icon: <Users className="h-8 w-8 text-primary" />,
      title: "Gestion des candidatures",
      description:
        "Organisez et évaluez vos candidatures avec des outils avancés",
      features: [
        "Système de notation",
        "Filtres et recherche avancée",
        "Historique des interactions",
        "Export des données",
      ],
    },
    {
      icon: <Search className="h-8 w-8 text-primary" />,
      title: "Recherche de candidats",
      description:
        "Trouvez les meilleurs talents avec notre moteur de recherche intelligent",
      features: [
        "Recherche par compétences",
        "Matching automatique",
        "Base de données de CV",
        "Suggestions personnalisées",
      ],
    },
    {
      icon: <BarChart2 className="h-8 w-8 text-primary" />,
      title: "Statistiques et rapports",
      description:
        "Analysez vos performances de recrutement avec des métriques détaillées",
      features: [
        "Tableaux de bord personnalisables",
        "Métriques en temps réel",
        "Rapports automatisés",
        "Comparaisons temporelles",
      ],
    },
    {
      icon: <Building className="h-8 w-8 text-primary" />,
      title: "Gestion d'équipe",
      description: "Collaborez efficacement avec votre équipe de recrutement",
      features: [
        "Gestion des rôles et permissions",
        "Invitations d'équipe",
        "Partage de candidatures",
        "Workflow collaboratif",
      ],
    },
  ],
  candidats: [
    {
      icon: <FileText className="h-8 w-8 text-primary" />,
      title: "Profil complet",
      description:
        "Créez un profil professionnel attractif avec toutes vos informations",
      features: [
        "CV et lettre de motivation",
        "Expériences professionnelles",
        "Formations et compétences",
        "Portfolio et réalisations",
      ],
    },
    {
      icon: <ClipboardList className="h-8 w-8 text-primary" />,
      title: "Suivi des candidatures",
      description: "Suivez l'état de vos candidatures en temps réel",
      features: [
        "Statut des candidatures",
        "Notifications en temps réel",
        "Historique complet",
        "Relances automatiques",
      ],
    },
    {
      icon: <Heart className="h-8 w-8 text-primary" />,
      title: "Offres favorites",
      description: "Sauvegardez et organisez vos offres d'emploi préférées",
      features: [
        "Liste de favoris",
        "Alertes personnalisées",
        "Comparaison d'offres",
        "Partage avec contacts",
      ],
    },
    {
      icon: <Bell className="h-8 w-8 text-primary" />,
      title: "Alertes personnalisées",
      description:
        "Recevez des notifications pour les offres qui correspondent à votre profil",
      features: [
        "Critères personnalisables",
        "Notifications par email",
        "Notifications push",
        "Fréquence personnalisable",
      ],
    },
    {
      icon: <Target className="h-8 w-8 text-primary" />,
      title: "Recommandations intelligentes",
      description: "Découvrez des offres d'emploi adaptées à votre profil",
      features: [
        "Matching automatique",
        "Suggestions personnalisées",
        "Score de compatibilité",
        "Évolution des recommandations",
      ],
    },
    {
      icon: <MessageSquare className="h-8 w-8 text-primary" />,
      title: "Messagerie intégrée",
      description: "Communiquez directement avec les recruteurs",
      features: [
        "Chat en temps réel",
        "Notifications de messages",
        "Historique des conversations",
        "Partage de documents",
      ],
    },
  ],
  plateforme: [
    {
      icon: <Zap className="h-8 w-8 text-primary" />,
      title: "Performance optimisée",
      description:
        "Une plateforme rapide et réactive pour une expérience utilisateur optimale",
      features: [
        "Temps de chargement < 2s",
        "Cache intelligent Redis",
        "Optimisation des requêtes",
        "CDN global",
      ],
    },
    {
      icon: <Shield className="h-8 w-8 text-primary" />,
      title: "Sécurité renforcée",
      description: "Protection des données et confidentialité garanties",
      features: [
        "Chiffrement SSL/TLS",
        "Authentification sécurisée",
        "Conformité RGPD",
        "Sauvegardes automatiques",
      ],
    },
    {
      icon: <Globe className="h-8 w-8 text-primary" />,
      title: "Multi-canal",
      description: "Diffusez vos offres sur plus de 160 plateformes",
      features: [
        "LinkedIn, Indeed, APEC",
        "Pôle Emploi, Apec",
        "Réseaux sociaux",
        "Sites spécialisés",
      ],
    },
    {
      icon: <Smartphone className="h-8 w-8 text-primary" />,
      title: "Responsive design",
      description: "Accédez à la plateforme depuis n'importe quel appareil",
      features: [
        "Mobile-first design",
        "Application mobile native",
        "Synchronisation cross-device",
        "Interface adaptative",
      ],
    },
    {
      icon: <RefreshCw className="h-8 w-8 text-primary" />,
      title: "Temps réel",
      description: "Mises à jour instantanées et collaboration en temps réel",
      features: [
        "WebSocket pour temps réel",
        "Notifications push",
        "Synchronisation automatique",
        "Collaboration multi-utilisateurs",
      ],
    },
    {
      icon: <Cpu className="h-8 w-8 text-primary" />,
      title: "Intelligence artificielle",
      description: "IA intégrée pour optimiser vos recrutements",
      features: [
        "Matching candidat-offre",
        "Analyse de CV automatique",
        "Prédiction de performance",
        "Optimisation des processus",
      ],
    },
  ],
};

const stats = [
  {
    label: "Offres publiées",
    value: "10,000+",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    label: "Candidats actifs",
    value: "50,000+",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Entreprises partenaires",
    value: "1,000+",
    icon: <Building className="h-4 w-4" />,
  },
  {
    label: "Taux de satisfaction",
    value: "98%",
    icon: <Star className="h-4 w-4" />,
  },
];

function page() {
  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            Découvrez nos fonctionnalités
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Une plateforme complète pour{" "}
            <span className="text-primary">optimiser vos recrutements</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Découvrez toutes les fonctionnalités qui font de notre plateforme
            l'outil idéal pour les recruteurs et les candidats.
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Tabs */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <Tabs defaultValue="recruteurs" className="w-full">
            <TabsList className="grid w-full grid-cols-3 mb-12 bg-transparent border">
              <TabsTrigger
                value="recruteurs"
                className="flex items-center gap-2"
              >
                <Users className="h-4 w-4" />
                Recruteurs
              </TabsTrigger>
              <TabsTrigger
                value="candidats"
                className="flex items-center gap-2"
              >
                <UserCheck className="h-4 w-4" />
                Candidats
              </TabsTrigger>
              <TabsTrigger
                value="plateforme"
                className="flex items-center gap-2"
              >
                <Cpu className="h-4 w-4" />
                Plateforme
              </TabsTrigger>
            </TabsList>

            <TabsContent value="recruteurs">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.recruteurs.map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 shadow-none border"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        {feature.icon}
                        <CardTitle className="text-lg">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="candidats">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.candidats.map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 shadow-none border"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        {feature.icon}
                        <CardTitle className="text-lg">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>

            <TabsContent value="plateforme">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {features.plateforme.map((feature, index) => (
                  <Card
                    key={index}
                    className="hover:shadow-lg transition-all duration-300 shadow-none border"
                  >
                    <CardHeader>
                      <div className="flex items-center gap-3 mb-4">
                        {feature.icon}
                        <CardTitle className="text-lg">
                          {feature.title}
                        </CardTitle>
                      </div>
                      <CardDescription>{feature.description}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ul className="space-y-2">
                        {feature.features.map((item, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{item}</span>
                          </li>
                        ))}
                      </ul>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      <Separator />

      {/* Workflow Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Workflow de recrutement simplifié
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment notre plateforme optimise chaque étape de votre
              processus de recrutement
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <FileText className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                1. Création d'offre
              </h3>
              <p className="text-muted-foreground">
                Utilisez nos templates ou créez des offres personnalisées
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Globe className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">
                2. Diffusion multi-canal
              </h3>
              <p className="text-muted-foreground">
                Publiez automatiquement sur 160+ plateformes
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <LayoutDashboard className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Gestion Kanban</h3>
              <p className="text-muted-foreground">
                Suivez vos candidatures avec notre tableau intelligent
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <UserCheck className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">4. Recrutement</h3>
              <p className="text-muted-foreground">
                Collaborez avec votre équipe pour choisir le meilleur candidat
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Prêt à révolutionner vos recrutements ?
          </h2>
          <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
            Rejoignez des milliers de recruteurs qui font confiance à notre
            plateforme
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              className="bg-primary text-primary-foreground hover:bg-primary/90"
            >
              Commencer gratuitement
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button variant="outline" size="lg">
              Voir la démo
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}

export default page;
