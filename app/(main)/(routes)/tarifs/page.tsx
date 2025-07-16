"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  Check,
  X,
  Star,
  Users,
  Briefcase,
  Zap,
  Shield,
  Globe,
  MessageSquare,
  BarChart2,
  FileText,
  Building,
  Clock,
  Mail,
  Phone,
  ArrowRight,
  Crown,
  Sparkles,
} from "lucide-react";
import Link from "next/link";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

const pricingPlans = [
  {
    id: "gratuit",
    name: "Gratuit",
    price: 0,
    currency: "€",
    period: "mois",
    description: "Parfait pour découvrir la plateforme",
    popular: false,
    features: [
      { text: "Jusqu'à 3 offres d'emploi actives", included: true },
      { text: "Tableau Kanban basique", included: true },
      { text: "Profil candidat complet", included: true },
      { text: "Recherche d'offres", included: true },
      { text: "Support par email", included: true },
      { text: "Templates d'offres", included: false },
      { text: "Collaboration d'équipe", included: false },
      { text: "Statistiques avancées", included: false },
      { text: "Diffusion multi-canal", included: false },
      { text: "API personnalisée", included: false },
    ],
    buttonText: "Commencer gratuitement",
    buttonVariant: "outline" as const,
    cta: "/recruteur/inscription",
  },
  {
    id: "pro",
    name: "Pro",
    price: 49,
    currency: "€",
    period: "mois",
    description: "Pour les équipes de recrutement",
    popular: true,
    features: [
      { text: "Offres d'emploi illimitées", included: true },
      { text: "Tableau Kanban avancé", included: true },
      { text: "Profil candidat complet", included: true },
      { text: "Recherche d'offres", included: true },
      { text: "Support par email", included: true },
      { text: "Templates d'offres personnalisables", included: true },
      { text: "Collaboration d'équipe (jusqu'à 5 membres)", included: true },
      { text: "Recherche avancée de candidats", included: true },
      { text: "Statistiques détaillées", included: true },
      { text: "Diffusion multi-canal", included: false },
      { text: "API personnalisée", included: false },
    ],
    buttonText: "Commencer l'essai gratuit",
    buttonVariant: "default" as const,
    cta: "/recruteur/inscription",
  },
  {
    id: "entreprise",
    name: "Entreprise",
    price: 199,
    currency: "€",
    period: "mois",
    description: "Solution complète pour grandes entreprises",
    popular: false,
    features: [
      { text: "Offres d'emploi illimitées", included: true },
      { text: "Tableau Kanban avancé", included: true },
      { text: "Profil candidat complet", included: true },
      { text: "Recherche d'offres", included: true },
      { text: "Support par email", included: true },
      { text: "Templates d'offres personnalisables", included: true },
      { text: "Collaboration d'équipe illimitée", included: true },
      { text: "Recherche avancée de candidats", included: true },
      { text: "Statistiques détaillées", included: true },
      { text: "Diffusion multi-canal (160+ plateformes)", included: true },
      { text: "API personnalisée", included: true },
      { text: "Gestionnaire de compte dédié", included: true },
      { text: "Support 24/7", included: true },
    ],
    buttonText: "Contacter les ventes",
    buttonVariant: "default" as const,
    cta: "/contact",
  },
];

const features = [
  {
    category: "Gestion des offres",
    items: [
      { name: "Offres d'emploi illimitées", pro: true, entreprise: true },
      { name: "Templates personnalisables", pro: true, entreprise: true },
      { name: "Éditeur WYSIWYG", pro: true, entreprise: true },
      { name: "Gestion des statuts", pro: true, entreprise: true },
    ],
  },
  {
    category: "Recrutement",
    items: [
      { name: "Tableau Kanban avancé", pro: true, entreprise: true },
      { name: "Collaboration d'équipe", pro: true, entreprise: true },
      { name: "Système de notation", pro: true, entreprise: true },
      { name: "Notes et commentaires", pro: true, entreprise: true },
    ],
  },
  {
    category: "Recherche et diffusion",
    items: [
      { name: "Recherche avancée de candidats", pro: true, entreprise: true },
      { name: "Diffusion multi-canal", entreprise: true },
      { name: "Matching automatique", pro: true, entreprise: true },
      { name: "Base de données de CV", pro: true, entreprise: true },
    ],
  },
  {
    category: "Analytics et rapports",
    items: [
      { name: "Statistiques détaillées", pro: true, entreprise: true },
      {
        name: "Tableaux de bord personnalisables",
        pro: true,
        entreprise: true,
      },
      { name: "Rapports automatisés", pro: true, entreprise: true },
      { name: "Métriques en temps réel", pro: true, entreprise: true },
    ],
  },
  {
    category: "Support et intégration",
    items: [
      { name: "Support par email", pro: true, entreprise: true },
      { name: "Support 24/7", entreprise: true },
      { name: "API personnalisée", entreprise: true },
      { name: "Gestionnaire de compte dédié", entreprise: true },
    ],
  },
];

const faqs = [
  {
    question: "Puis-je changer de plan à tout moment ?",
    answer:
      "Oui, vous pouvez passer à un plan supérieur à tout moment. La facturation sera ajustée au prorata. Pour passer à un plan inférieur, cela prendra effet à la fin de votre période de facturation actuelle.",
  },
  {
    question: "Y a-t-il des frais cachés ?",
    answer:
      "Non, nos tarifs sont transparents. Le prix affiché est le prix que vous payez, sans frais cachés ni surprises. Seuls les services optionnels comme la diffusion multi-canal peuvent engendrer des coûts supplémentaires.",
  },
  {
    question: "Proposez-vous un essai gratuit ?",
    answer:
      "Oui, tous nos plans incluent un essai gratuit de 14 jours. Vous pouvez tester toutes les fonctionnalités sans engagement et annuler à tout moment.",
  },
  {
    question: "Qu'en est-il de la sécurité des données ?",
    answer:
      "Nous prenons la sécurité très au sérieux. Toutes les données sont chiffrées, nous respectons le RGPD et effectuons des sauvegardes régulières. Votre confidentialité est notre priorité.",
  },
  {
    question: "Puis-je annuler mon abonnement ?",
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre tableau de bord. Aucune pénalité ne s'applique et vous conservez l'accès jusqu'à la fin de votre période de facturation.",
  },
  {
    question: "Le support est-il inclus ?",
    answer:
      "Oui, tous les plans incluent le support par email. Les plans Pro et Entreprise bénéficient d'un support prioritaire, et le plan Entreprise inclut un support 24/7 et un gestionnaire de compte dédié.",
  },
];

export default function TarifsPage() {
  const [annualBilling, setAnnualBilling] = useState(false);

  const getPrice = (plan: (typeof pricingPlans)[0]) => {
    if (annualBilling) {
      return Math.round(plan.price * 10); // 2 mois gratuits sur l'année
    }
    return plan.price;
  };

  const getPeriod = (plan: (typeof pricingPlans)[0]) => {
    if (annualBilling) {
      return "mois (facturé annuellement)";
    }
    return plan.period;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-24 pb-12 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            Tarifs transparents
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Des tarifs adaptés à{" "}
            <span className="text-primary">vos besoins</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Choisissez le plan qui correspond le mieux à votre entreprise.
            Commencez gratuitement et évoluez selon vos besoins.
          </p>

          {/* Billing Toggle */}
          <div className="flex items-center justify-center gap-4 mb-12">
            <Label htmlFor="billing-toggle" className="text-sm">
              Facturation mensuelle
            </Label>
            <Switch
              id="billing-toggle"
              checked={annualBilling}
              onCheckedChange={setAnnualBilling}
            />
            <Label htmlFor="billing-toggle" className="text-sm">
              Facturation annuelle
            </Label>
            {annualBilling && (
              <Badge variant="secondary" className="ml-2">
                Économisez 20%
              </Badge>
            )}
          </div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan) => (
              <Card
                key={plan.id}
                className={`relative ${
                  plan.popular ? "border-primary shadow-lg scale-105" : "border"
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <Badge className="bg-primary text-primary-foreground px-4 py-2">
                      <Star className="h-4 w-4 mr-1" />
                      Le plus populaire
                    </Badge>
                  </div>
                )}

                <CardHeader className="text-center pb-8">
                  <CardTitle className="text-2xl font-bold">
                    {plan.name}
                  </CardTitle>
                  <CardDescription className="text-base">
                    {plan.description}
                  </CardDescription>
                  <div className="mt-6">
                    <div className="flex items-baseline justify-center">
                      <span className="text-4xl font-bold">
                        {getPrice(plan)}
                      </span>
                      <span className="text-xl text-muted-foreground ml-1">
                        {plan.currency}
                      </span>
                      <span className="text-muted-foreground ml-1">
                        /{getPeriod(plan)}
                      </span>
                    </div>
                    {annualBilling && plan.price > 0 && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Économisez {plan.price * 2}€ par an
                      </p>
                    )}
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className={`flex items-center gap-3 ${
                          feature.included
                            ? "text-foreground"
                            : "text-muted-foreground"
                        }`}
                      >
                        {feature.included ? (
                          <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        ) : (
                          <X className="h-5 w-5 text-gray-400 flex-shrink-0" />
                        )}
                        <span className="text-sm">{feature.text}</span>
                      </li>
                    ))}
                  </ul>

                  <Separator className="my-6" />

                  <Link href={plan.cta} className="block">
                    <Button
                      className={`w-full ${
                        plan.popular
                          ? "bg-primary text-primary-foreground hover:bg-primary/90"
                          : ""
                      }`}
                      variant={plan.buttonVariant}
                    >
                      {plan.buttonText}
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature Comparison */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comparaison détaillée des fonctionnalités
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités incluses dans chaque plan
            </p>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-4 font-semibold">
                    Fonctionnalités
                  </th>
                  <th className="text-center p-4 font-semibold">Gratuit</th>
                  <th className="text-center p-4 font-semibold">Pro</th>
                  <th className="text-center p-4 font-semibold">Entreprise</th>
                </tr>
              </thead>
              <tbody>
                {features.map((category) => (
                  <React.Fragment key={category.category}>
                    <tr className="bg-muted/30">
                      <td className="p-4 font-semibold text-primary">
                        {category.category}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </tr>
                    {category.items.map((item) => (
                      <tr key={item.name} className="border-b">
                        <td className="p-4">{item.name}</td>
                        <td className="text-center p-4">
                          <X className="h-5 w-5 text-gray-400 mx-auto" />
                        </td>
                        <td className="text-center p-4">
                          {item.pro ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                        <td className="text-center p-4">
                          {item.entreprise ? (
                            <Check className="h-5 w-5 text-green-500 mx-auto" />
                          ) : (
                            <X className="h-5 w-5 text-gray-400 mx-auto" />
                          )}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur nos tarifs et services
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {faqs.map((faq, index) => (
              <Card key={index} className="shadow-none border">
                <CardHeader>
                  <CardTitle className="text-lg">{faq.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground">{faq.answer}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <div className="bg-primary/5 rounded-2xl p-8 md:p-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Prêt à révolutionner vos recrutements ?
            </h2>
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Rejoignez des milliers de recruteurs qui font confiance à notre
              plateforme. Commencez gratuitement dès aujourd'hui.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/recruteur/inscription">
                <Button
                  size="lg"
                  className="bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Link href="/contact">
                <Button variant="outline" size="lg">
                  Parler à un expert
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
