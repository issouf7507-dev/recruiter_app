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

import {
  Star,
  Quote,
  Users,
  TrendingUp,
  Clock,
  Target,
  CheckCircle,
  ArrowRight,
  Building,
  Briefcase,
  Award,
  Heart,
  MessageSquare,
  Zap,
  Shield,
} from "lucide-react";
import Link from "next/link";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

const testimonials = [
  {
    id: 1,
    name: "Marie Laurent",
    role: "DRH",
    company: "TechCorp",
    avatar: "/avatars/marie-l.jpg",
    rating: 5,
    content:
      "Recruter a révolutionné notre processus de recrutement. Le tableau Kanban nous permet de suivre efficacement nos candidatures et l'IA nous aide à identifier les meilleurs profils. Notre temps de recrutement a été réduit de 60% !",
    industry: "Technologie",
    companySize: "200-500 employés",
    results: [
      "Temps de recrutement réduit de 60%",
      "Qualité des candidats améliorée de 40%",
      "Coût par recrutement diminué de 30%",
    ],
  },
  {
    id: 2,
    name: "Thomas Dubois",
    role: "CEO",
    company: "StartupInnov",
    avatar: "/avatars/thomas-d.jpg",
    rating: 5,
    content:
      "En tant que startup, nous avions besoin d'une solution flexible et abordable. Recruter nous a permis de professionnaliser notre recrutement sans exploser notre budget. L'équipe support est exceptionnelle !",
    industry: "Startup",
    companySize: "10-50 employés",
    results: [
      "Premier recrutement en 2 semaines",
      "Équipe de 15 personnes recrutée en 6 mois",
      "ROI positif dès le 3ème mois",
    ],
  },
  {
    id: 3,
    name: "Sophie Martin",
    role: "Responsable RH",
    company: "GrandeBanque",
    avatar: "/avatars/sophie-m.jpg",
    rating: 5,
    content:
      "La diffusion multi-canal nous a permis d'élargir considérablement notre pool de candidats. Nous touchons maintenant des profils que nous n'aurions jamais pu atteindre avec nos méthodes traditionnelles.",
    industry: "Finance",
    companySize: "1000+ employés",
    results: [
      "Pool de candidats multiplié par 3",
      "Diversité des profils améliorée",
      "Conformité réglementaire respectée",
    ],
  },
  {
    id: 4,
    name: "Lucas Bernard",
    role: "Fondateur",
    company: "EcoSolutions",
    avatar: "/avatars/lucas-b.jpg",
    rating: 5,
    content:
      "L'interface intuitive et les fonctionnalités collaboratives ont transformé notre façon de travailler. Toute l'équipe peut maintenant participer au processus de recrutement de manière organisée.",
    industry: "Environnement",
    companySize: "50-200 employés",
    results: [
      "Collaboration d'équipe optimisée",
      "Décisions de recrutement plus rapides",
      "Satisfaction équipe augmentée",
    ],
  },
  {
    id: 5,
    name: "Emma Roux",
    role: "Talent Manager",
    company: "CreativeAgency",
    avatar: "/avatars/emma-r.jpg",
    rating: 5,
    content:
      "Les templates personnalisables nous permettent de maintenir notre identité de marque tout en optimisant nos processus. L'expérience candidat est vraiment au cœur de leur approche.",
    industry: "Marketing",
    companySize: "100-500 employés",
    results: [
      "Branding cohérent maintenu",
      "Expérience candidat améliorée",
      "Taux d'acceptation +25%",
    ],
  },
  {
    id: 6,
    name: "Pierre Moreau",
    role: "Directeur Général",
    company: "ManufacturingPlus",
    avatar: "/avatars/pierre-m.jpg",
    rating: 5,
    content:
      "La plateforme nous a aidés à digitaliser complètement notre processus de recrutement. Les statistiques nous donnent une visibilité précieuse sur nos performances.",
    industry: "Industrie",
    companySize: "500-1000 employés",
    results: [
      "Processus 100% digitalisé",
      "Analytics en temps réel",
      "Optimisation continue des processus",
    ],
  },
];

const caseStudies = [
  {
    id: 1,
    title: "TechCorp : Recrutement de masse pour une expansion internationale",
    company: "TechCorp",
    industry: "Technologie",
    challenge:
      "Recruter 50 développeurs en 3 mois pour une expansion européenne",
    solution: "Utilisation de l'IA pour le matching et diffusion multi-canal",
    results: [
      "50 développeurs recrutés en 2.5 mois",
      "Coût réduit de 40% vs agences",
      "Qualité des profils maintenue",
    ],
    testimonial: testimonials[0],
  },
  {
    id: 2,
    title: "StartupInnov : Construction d'une équipe de A à Z",
    company: "StartupInnov",
    industry: "Startup",
    challenge:
      "Construire une équipe complète depuis zéro avec un budget limité",
    solution: "Plan Pro avec templates et collaboration d'équipe",
    results: [
      "Équipe de 15 personnes en 6 mois",
      "Budget respecté",
      "Culture d'entreprise préservée",
    ],
    testimonial: testimonials[1],
  },
];

const stats = [
  {
    label: "Clients satisfaits",
    value: "98%",
    icon: <Heart className="h-4 w-4" />,
  },
  {
    label: "Temps de recrutement réduit",
    value: "60%",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    label: "Coût par recrutement",
    value: "-30%",
    icon: <TrendingUp className="h-4 w-4" />,
  },
  {
    label: "Qualité des candidats",
    value: "+40%",
    icon: <Target className="h-4 w-4" />,
  },
];

const industries = [
  "Toutes les industries",
  "Technologie",
  "Finance",
  "Marketing",
  "Industrie",
  "Startup",
  "Environnement",
];

export default function TemoignagesPage() {
  const [selectedIndustry, setSelectedIndustry] = useState(
    "Toutes les industries"
  );

  const filteredTestimonials =
    selectedIndustry === "Toutes les industries"
      ? testimonials
      : testimonials.filter((t) => t.industry === selectedIndustry);

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
              Témoignages clients
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Ils nous font <span className="text-primary">confiance</span>
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Découvrez comment des entreprises de tous secteurs ont transformé
            leurs recrutements grâce à notre plateforme.
          </motion.p>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                className="text-center"
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.6 + index * 0.1 }}
                whileHover={{
                  scale: 1.05,
                  transition: { duration: 0.3 },
                }}
              >
                <div className="flex items-center justify-center mb-2">
                  {stat.icon}
                </div>
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-8"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl font-bold mb-4">Avis de nos clients</h2>
            <p className="text-muted-foreground mb-6">
              Découvrez les retours d'expérience de nos utilisateurs
            </p>

            {/* Industry Filter */}
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {industries.map((industry, index) => (
                <motion.div
                  key={industry}
                  initial={{ opacity: 0, scale: 0.8 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: index * 0.1 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  <Button
                    variant={
                      selectedIndustry === industry ? "default" : "outline"
                    }
                    size="sm"
                    onClick={() => setSelectedIndustry(industry)}
                  >
                    {industry}
                  </Button>
                </motion.div>
              ))}
            </div>
          </motion.div>

          <AnimatePresence mode="wait">
            <motion.div
              key={selectedIndustry}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.5 }}
            >
              {filteredTestimonials.map((testimonial, index) => (
                <motion.div
                  key={testimonial.id}
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: index * 0.1 }}
                  whileHover={{
                    y: -10,
                    transition: { duration: 0.3 },
                  }}
                >
                  <Card className="shadow-none border hover:shadow-md transition-shadow bg-transparent">
                    <CardHeader>
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 bg-muted rounded-full flex items-center justify-center">
                            <Users className="h-6 w-6 text-muted-foreground" />
                          </div>
                          <div>
                            <h3 className="font-semibold">
                              {testimonial.name}
                            </h3>
                            <p className="text-sm text-muted-foreground">
                              {testimonial.role} • {testimonial.company}
                            </p>
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-xs">
                          {testimonial.industry}
                        </Badge>
                      </div>

                      {/* Rating */}
                      <div className="flex items-center gap-1 mb-3">
                        {[...Array(testimonial.rating)].map((_, i) => (
                          <Star
                            key={i}
                            className="h-4 w-4 fill-yellow-400 text-yellow-400"
                          />
                        ))}
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="mb-4">
                        <Quote className="h-6 w-6 text-primary mb-2" />
                        <p className="text-muted-foreground text-sm italic">
                          "{testimonial.content}"
                        </p>
                      </div>

                      <Separator className="my-4" />

                      <div>
                        <h4 className="font-semibold text-sm mb-2">
                          Résultats obtenus :
                        </h4>
                        <ul className="space-y-1">
                          {testimonial.results.map((result, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-xs text-muted-foreground"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </motion.div>
          </AnimatePresence>
        </div>
      </section>

      <Separator />

      {/* Case Studies */}
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
              Études de cas
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez comment nos clients ont résolu leurs défis de
              recrutement
            </p>
          </motion.div>

          <div className="space-y-8">
            {caseStudies.map((study, index) => (
              <motion.div
                key={study.id}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.8, delay: index * 0.2 }}
                whileHover={{
                  y: -5,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="shadow-none border bg-transparent">
                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-xl mb-2">
                          {study.title}
                        </CardTitle>
                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Building className="h-4 w-4" />
                            {study.company}
                          </span>
                          <span className="flex items-center gap-1">
                            <Briefcase className="h-4 w-4" />
                            {study.industry}
                          </span>
                        </div>
                      </div>
                      <Badge variant="secondary">{study.industry}</Badge>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      <div>
                        <h4 className="font-semibold mb-2 text-red-600">
                          Défi
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {study.challenge}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-blue-600">
                          Solution
                        </h4>
                        <p className="text-sm text-muted-foreground">
                          {study.solution}
                        </p>
                      </div>
                      <div>
                        <h4 className="font-semibold mb-2 text-green-600">
                          Résultats
                        </h4>
                        <ul className="space-y-1">
                          {study.results.map((result, index) => (
                            <li
                              key={index}
                              className="flex items-center gap-2 text-sm text-muted-foreground"
                            >
                              <CheckCircle className="h-3 w-3 text-green-500" />
                              {result}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    <Separator className="my-6" />

                    {/* Testimonial */}
                    <div className="bg-muted/30 rounded-lg p-4">
                      <div className="flex items-start gap-3">
                        <Quote className="h-5 w-5 text-primary mt-1" />
                        <div>
                          <p className="text-sm italic text-muted-foreground mb-2">
                            "{study.testimonial.content}"
                          </p>
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-muted rounded-full flex items-center justify-center">
                              <Users className="h-4 w-4 text-muted-foreground" />
                            </div>
                            <div>
                              <p className="text-sm font-semibold">
                                {study.testimonial.name}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {study.testimonial.role},{" "}
                                {study.testimonial.company}
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Success Stories Grid */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Success Stories
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Des résultats concrets qui parlent d'eux-mêmes
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: <Zap className="h-6 w-6 text-blue-600" />,
                title: "Recrutement accéléré",
                value: "60%",
                description: "Réduction du temps de recrutement moyen",
                bgColor: "bg-blue-100",
              },
              {
                icon: <Target className="h-6 w-6 text-green-600" />,
                title: "Qualité améliorée",
                value: "40%",
                description: "Amélioration de la qualité des candidats",
                bgColor: "bg-green-100",
              },
              {
                icon: <TrendingUp className="h-6 w-6 text-purple-600" />,
                title: "Coûts réduits",
                value: "30%",
                description: "Réduction du coût par recrutement",
                bgColor: "bg-purple-100",
              },
              {
                icon: <Heart className="h-6 w-6 text-orange-600" />,
                title: "Satisfaction client",
                value: "98%",
                description: "De nos clients recommandent notre plateforme",
                bgColor: "bg-orange-100",
              },
            ].map((story, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 50 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.1 }}
                whileHover={{
                  y: -10,
                  transition: { duration: 0.3 },
                }}
              >
                <Card className="text-center shadow-none border bg-transparent">
                  <CardContent className="p-6">
                    <motion.div
                      className={`w-12 h-12 ${story.bgColor} rounded-full flex items-center justify-center mx-auto mb-4`}
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.3 },
                      }}
                    >
                      {story.icon}
                    </motion.div>
                    <h3 className="font-semibold mb-2">{story.title}</h3>
                    <p className="text-2xl font-bold text-primary mb-2">
                      {story.value}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {story.description}
                    </p>
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
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8 }}
          >
            <motion.h2
              className="text-3xl md:text-4xl font-bold mb-4"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Prêt à rejoindre nos clients satisfaits ?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Découvrez comment notre plateforme peut transformer vos
              recrutements et vous faire économiser temps et argent.
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
                <Link href="/tarifs">
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
                    Demander une démo
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
