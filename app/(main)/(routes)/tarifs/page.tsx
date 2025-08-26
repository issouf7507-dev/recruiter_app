"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
import { Check, X, Star, ArrowRight } from "lucide-react";
import Link from "next/link";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

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
    cta: "/recruteur/inscription",
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
    cta: "/recruteur/inscription",
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
    cta: "/recruteur/inscription",
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
      return "an (facturé annuellement)";
    }
    return plan.period;
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge variant="secondary" className="mb-4 px-4 py-2">
              Tarifs transparents
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Des tarifs adaptés à{" "}
            <span className="text-primary">vos besoins</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Choisissez le plan qui correspond le mieux à votre entreprise.
            Commencez gratuitement et évoluez selon vos besoins.
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            className="flex items-center justify-center gap-4 mb-12"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.6 }}
          >
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
            <AnimatePresence>
              {annualBilling && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  transition={{ duration: 0.3 }}
                >
                  <Badge variant="secondary" className="ml-2">
                    Économisez 20%
                  </Badge>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        </div>
      </section>

      {/* Pricing Cards */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {pricingPlans.map((plan, index) => (
              <motion.div
                key={plan.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: index * 0.2 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
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
                        {getPrice(plan)} {plan.currency}
                        <span
                          className={`text-sm md:text-base font-normal ${
                            plan.isPopular ? "text-white" : ""
                          }`}
                        >
                          {" "}
                          {/* {annualBilling ? "/an" : "/mois"} */}/{" "}
                          {getPeriod(plan)}
                        </span>
                      </div>
                      {annualBilling && plan.price > 0 && (
                        <p
                          className={`text-sm text-muted-foreground mt-2 ${
                            plan.isPopular ? "text-white" : ""
                          }`}
                        >
                          Économisez {plan.price * 2} XOF par an
                        </p>
                      )}
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
                            <Check
                              className={`w-4 h-4 md:w-5 md:h-5 text-primary mr-2 md:mr-3 mt-0.5 flex-shrink-0 ${
                                plan.isPopular ? "text-white" : ""
                              }`}
                            />
                            <span>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <Link href={plan.cta} className="block">
                      <Button
                        className={`w-full text-sm md:text-base ${
                          plan.buttonVariant === "primary"
                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                            : ""
                        } ${plan.isPopular ? "bg-white text-primary" : ""}`}
                      >
                        {plan.buttonText}
                        <ArrowRight className="ml-2 h-4 w-4" />
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      <Separator />

      {/* Feature Comparison */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Comparaison détaillée des fonctionnalités
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez toutes les fonctionnalités incluses dans chaque plan
            </p>
          </motion.div>

          <motion.div
            className="overflow-x-auto"
            initial={{ opacity: 0, x: -50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
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
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={category.category}>
                    <motion.tr
                      className="bg-muted/30"
                      initial={{ opacity: 0, y: 20 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.5, delay: categoryIndex * 0.1 }}
                    >
                      <td className="p-4 font-semibold text-primary">
                        {category.category}
                      </td>
                      <td></td>
                      <td></td>
                      <td></td>
                    </motion.tr>
                    {category.items.map((item, itemIndex) => (
                      <motion.tr
                        key={item.name}
                        className="border-b"
                        initial={{ opacity: 0, x: -20 }}
                        whileInView={{ opacity: 1, x: 0 }}
                        viewport={{ once: true }}
                        transition={{
                          duration: 0.4,
                          delay: categoryIndex * 0.1 + itemIndex * 0.05,
                        }}
                        whileHover={{ backgroundColor: "rgba(0,0,0,0.02)" }}
                      >
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
                      </motion.tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </motion.div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-16 px-4 bg-muted/30">
        <div className=" mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Questions fréquentes
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Tout ce que vous devez savoir sur nos tarifs et services
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {faqs.map((faq, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="shadow-none border bg-transparent">
                  <CardHeader>
                    <CardTitle className="text-lg">{faq.question}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground">{faq.answer}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto text-center">
          <motion.div
            className="bg-primary/5 rounded-2xl p-8 md:p-12"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
            whileHover={{
              scale: 1.02,
              transition: { duration: 0.3 },
            }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Prêt à révolutionner vos recrutements ?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Rejoignez des milliers de recruteurs qui font confiance à notre
              plateforme. Commencez gratuitement dès aujourd'hui.
            </motion.p>
            <motion.div
              className="flex flex-col sm:flex-row gap-4 justify-center"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/recruteur/inscription">
                  <Button
                    size="lg"
                    className="bg-primary text-primary-foreground hover:bg-primary/90"
                  >
                    Commencer gratuitement
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </motion.div>
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                transition={{ duration: 0.2 }}
              >
                <Link href="/contact">
                  <Button variant="outline" size="lg">
                    Parler à un expert
                  </Button>
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
