"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Target,
  Award,
  TrendingUp,
  Heart,
  Shield,
  Zap,
  Star,
  CheckCircle,
  ArrowRight,
  Building,
  Lightbulb,
  MapPin,
  Mail,
  Linkedin,
  Twitter,
  Briefcase,
  Phone,
} from "lucide-react";
import Link from "next/link";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

const stats = [
  {
    label: "Entreprises partenaires",
    value: "1,000+",
    icon: <Building className="h-4 w-4" />,
  },
  {
    label: "Candidats actifs",
    value: "50,000+",
    icon: <Users className="h-4 w-4" />,
  },
  {
    label: "Offres publiées",
    value: "10,000+",
    icon: <Briefcase className="h-4 w-4" />,
  },
  {
    label: "Taux de satisfaction",
    value: "98%",
    icon: <Star className="h-4 w-4" />,
  },
];

const values = [
  {
    icon: <Heart className="h-8 w-8" />,
    title: "Passion",
    description:
      "Nous sommes passionnés par l'innovation et l'excellence dans le recrutement.",
    color: "text-red-600",
  },
  {
    icon: <Shield className="h-8 w-8" />,
    title: "Confiance",
    description:
      "La confiance de nos clients est notre plus grande récompense.",
    color: "text-blue-600",
  },
  {
    icon: <Zap className="h-8 w-8" />,
    title: "Innovation",
    description: "Nous repoussons constamment les limites de la technologie.",
    color: "text-yellow-600",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Collaboration",
    description: "Nous croyons en la puissance du travail d'équipe.",
    color: "text-green-600",
  },
];

const milestones = [
  {
    year: "2020",
    title: "Fondation",
    description:
      "Création de la plateforme avec une vision claire : révolutionner le recrutement.",
    icon: <Lightbulb className="h-6 w-6" />,
  },
  {
    year: "2021",
    title: "Premiers clients",
    description:
      "Accueil de nos 100 premiers clients et validation du concept.",
    icon: <Users className="h-6 w-6" />,
  },
  {
    year: "2022",
    title: "Expansion",
    description:
      "Lancement de nouvelles fonctionnalités et croissance de l'équipe.",
    icon: <TrendingUp className="h-6 w-6" />,
  },
  {
    year: "2023",
    title: "Leadership",
    description: "Devenu leader du marché avec 1000+ entreprises partenaires.",
    icon: <Award className="h-6 w-6" />,
  },
  {
    year: "2024",
    title: "Innovation IA",
    description:
      "Intégration de l'intelligence artificielle pour optimiser les recrutements.",
    icon: <Zap className="h-6 w-6" />,
  },
];

const team = [
  {
    name: "LOUKOU Stéphane yao",
    role: "CEO",
    description: "15 ans d'expérience en RH et recrutement. ",
    avatar: "/avatars/marie.jpg",
    linkedin: "#",
    twitter: "#",
  },

  {
    name: "AMALAMAN EMMANUELLA",
    role: "Directrice Marketing",
    description:
      "Stratège marketing avec 10 ans d'expérience dans le SaaS B2B.",
    avatar: "/avatars/sophie.jpg",
    linkedin: "#",
    twitter: "#",
  },
  {
    name: "OUATTARA BITCHERESSE ISSOUF",
    role: "Directeur Commercial",
    description:
      "Spécialiste en développement commercial et relations clients.",
    avatar: "/avatars/lucas.jpg",
    linkedin: "#",
    twitter: "#",
  },
];

const certifications = [
  // {
  //   name: "ISO 27001",
  //   description: "Certification sécurité de l'information",
  //   icon: <Shield className="h-6 w-6" />,
  // },
  {
    name: "RGPD",
    description: "Conformité protection des données",
    icon: <CheckCircle className="h-6 w-6" />,
  },
  // {
  //   name: "SOC 2",
  //   description: "Certification sécurité et disponibilité",
  //   icon: <Award className="h-6 w-6" />,
  // },
];

const offices = [
  {
    city: "Paris",
    country: "Côte d'Ivoire",
    address: "Cocody Abatta",
    phone: "+225 05 44 65 94 90",
    email: "contact@ylsix-rh.com",
    icon: <MapPin className="h-6 w-6" />,
  },
  // {
  //   city: "Lyon",
  //   country: "France",
  //   address: "456 Avenue des Affaires, 69002 Lyon",
  //   phone: "+33 4 78 12 34 56",
  //   email: "lyon@recruter.com",
  //   icon: <MapPin className="h-6 w-6" />,
  // },
];

export default function AProposPage() {
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
              À propos de nous
            </Badge>
          </motion.div>

          <motion.h1
            className="text-4xl md:text-6xl font-bold mb-6"
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            Révolutionner le <span className="text-primary">recrutement</span>{" "}
            depuis 2020
          </motion.h1>

          <motion.p
            className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4 }}
          >
            Nous sommes une équipe passionnée qui croit en la puissance de la
            technologie pour transformer l'expérience de recrutement et
            connecter les meilleurs talents aux meilleures opportunités.
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

      {/* Mission & Vision */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Notre mission
              </h2>
              <p className="text-lg text-muted-foreground mb-6">
                Simplifier et optimiser le processus de recrutement pour toutes
                les entreprises, quelle que soit leur taille. Nous croyons que
                chaque entreprise mérite d'avoir accès aux meilleurs outils de
                recrutement.
              </p>
              <p className="text-lg text-muted-foreground mb-8">
                Notre plateforme combine intelligence artificielle, expérience
                utilisateur intuitive et support client exceptionnel pour
                révolutionner la façon dont les entreprises recrutent.
              </p>
              <motion.div
                className="flex flex-col sm:flex-row gap-4"
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: 0.4 }}
              >
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/contact">
                    <Button>
                      Nous contacter
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </Link>
                </motion.div>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  transition={{ duration: 0.2 }}
                >
                  <Link href="/fonctionnalite">
                    <Button variant="outline">
                      Découvrir nos fonctionnalités
                    </Button>
                  </Link>
                </motion.div>
              </motion.div>
            </motion.div>
            <motion.div
              className="relative"
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <Card className="shadow-none border bg-transparent">
                <CardContent className="p-8">
                  <Target className="h-12 w-12 text-primary mb-6" />
                  <h3 className="text-2xl font-bold mb-4">Notre vision</h3>
                  <p className="text-muted-foreground mb-6">
                    Devenir la plateforme de référence pour le recrutement
                    intelligent, en connectant plus de 1 million d'entreprises
                    avec les meilleurs talents mondiaux d'ici 2030.
                  </p>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Recrutement automatisé et intelligent</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Expérience candidat optimale</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <CheckCircle className="h-5 w-5 text-green-500" />
                      <span>Données et analytics avancés</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </div>
      </section>

      <Separator />

      {/* Values */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            className="text-center mb-12"
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Nos valeurs</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Les principes qui guident nos actions et définissent notre culture
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {values.map((value, index) => (
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
                  <CardContent className="p-6 flex flex-col items-center">
                    <motion.div
                      className={`${value.color} mb-4 text-center`}
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.3 },
                      }}
                    >
                      {value.icon}
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-3">
                      {value.title}
                    </h3>
                    <p className="text-muted-foreground text-sm">
                      {value.description}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Timeline */}
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
              Notre histoire
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Découvrez les étapes clés de notre développement
            </p>
          </motion.div>

          <div className="relative">
            <motion.div
              className="absolute left-1/2 transform -translate-x-1/2 w-0.5 h-full bg-primary/20"
              initial={{ scaleY: 0 }}
              whileInView={{ scaleY: 1 }}
              viewport={{ once: true }}
              transition={{ duration: 1, delay: 0.5 }}
            ></motion.div>
            <div className="space-y-8">
              {milestones.map((milestone, index) => (
                <motion.div
                  key={index}
                  className={`flex items-center ${
                    index % 2 === 0 ? "flex-row" : "flex-row-reverse"
                  }`}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -50 : 50 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.8, delay: index * 0.2 }}
                >
                  <div className="w-1/2 px-8">
                    <motion.div
                      whileHover={{
                        y: -5,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Card className="shadow-none border bg-transparent">
                        <CardContent className="p-6">
                          <div className="flex items-center gap-3 mb-3">
                            <motion.div
                              className="text-primary"
                              whileHover={{
                                scale: 1.1,
                                transition: { duration: 0.3 },
                              }}
                            >
                              {milestone.icon}
                            </motion.div>
                            <Badge variant="secondary">{milestone.year}</Badge>
                          </div>
                          <h3 className="text-lg font-semibold mb-2">
                            {milestone.title}
                          </h3>
                          <p className="text-muted-foreground text-sm">
                            {milestone.description}
                          </p>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </div>
                  <motion.div
                    className="w-4 h-4 bg-primary rounded-full border-4 border-background"
                    initial={{ scale: 0 }}
                    whileInView={{ scale: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.5, delay: index * 0.2 + 0.3 }}
                    whileHover={{
                      scale: 1.2,
                      transition: { duration: 0.3 },
                    }}
                  ></motion.div>
                  <div className="w-1/2"></div>
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Team */}
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
              Notre équipe
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Rencontrez les talents qui font de notre vision une réalité
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {team.map((member, index) => (
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
                      className="w-20 h-20 bg-muted rounded-full mx-auto mb-4 flex items-center justify-center"
                      whileHover={{
                        scale: 1.1,
                        transition: { duration: 0.3 },
                      }}
                    >
                      <Users className="h-8 w-8 text-muted-foreground" />
                    </motion.div>
                    <h3 className="text-lg font-semibold mb-1">
                      {member.name}
                    </h3>
                    <p className="text-primary text-sm mb-3">{member.role}</p>
                    <p className="text-muted-foreground text-sm mb-4">
                      {member.description}
                    </p>
                    <div className="flex justify-center gap-2">
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Linkedin className="h-4 w-4" />
                        </Button>
                      </motion.div>
                      <motion.div
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                        >
                          <Twitter className="h-4 w-4" />
                        </Button>
                      </motion.div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Certifications & Offices */}
      <section className="py-16 px-4 bg-muted/30">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Certifications */}
            <motion.div
              initial={{ opacity: 0, x: -50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8 }}
            >
              <h2 className="text-3xl font-bold mb-6">Certifications</h2>
              <p className="text-muted-foreground mb-8">
                Nous nous engageons à maintenir les plus hauts standards de
                qualité et de sécurité.
              </p>
              <div className="space-y-4">
                {certifications.map((cert, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{
                      x: 5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="shadow-none border bg-transparent">
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <motion.div
                            className="text-primary"
                            whileHover={{
                              scale: 1.1,
                              transition: { duration: 0.3 },
                            }}
                          >
                            {cert.icon}
                          </motion.div>
                          <div>
                            <h3 className="font-semibold">{cert.name}</h3>
                            <p className="text-sm text-muted-foreground">
                              {cert.description}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Offices */}
            <motion.div
              initial={{ opacity: 0, x: 50 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              <h2 className="text-3xl font-bold mb-6">Nos bureaux</h2>
              <p className="text-muted-foreground mb-8">
                Présents en France pour vous accompagner au plus près.
              </p>
              <div className="space-y-4">
                {offices.map((office, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6, delay: index * 0.1 }}
                    whileHover={{
                      x: -5,
                      transition: { duration: 0.3 },
                    }}
                  >
                    <Card className="shadow-none border bg-transparent">
                      <CardContent className="p-4">
                        <div className="flex items-start gap-4">
                          <motion.div
                            className="text-primary mt-1"
                            whileHover={{
                              scale: 1.1,
                              transition: { duration: 0.3 },
                            }}
                          >
                            {office.icon}
                          </motion.div>
                          <div className="flex-1">
                            <h3 className="font-semibold">
                              {office.city}, {office.country}
                            </h3>
                            <p className="text-sm text-muted-foreground mb-2">
                              {office.address}
                            </p>
                            <div className="space-y-1 text-sm">
                              <p className="flex items-center gap-2">
                                <Phone className="h-3 w-3" />
                                {office.phone}
                              </p>
                              <p className="flex items-center gap-2">
                                <Mail className="h-3 w-3" />
                                {office.email}
                              </p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </motion.div>
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
              Prêt à nous rejoindre ?
            </motion.h2>
            <motion.p
              className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Découvrez comment notre plateforme peut transformer vos
              recrutements et rejoignez des milliers d'entreprises satisfaites.
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
                    Voir nos tarifs
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
                    Nous contacter
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
