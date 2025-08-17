"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
  Mail,
  Phone,
  MapPin,
  Clock,
  MessageSquare,
  Users,
  Building,
  HelpCircle,
  Send,
  CheckCircle,
  AlertCircle,
  Globe,
  Calendar,
  ArrowRight,
  Star,
  Shield,
  Zap,
} from "lucide-react";
import { toast } from "sonner";
import Header from "../../../components/header/header";
import Footer from "../../../components/footer/footer";

const contactFormSchema = z.object({
  nom: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  entreprise: z
    .string()
    .min(2, "Le nom de l'entreprise doit contenir au moins 2 caractères"),
  telephone: z.string().min(8, "Numéro de téléphone invalide"),
  sujet: z.string().min(1, "Veuillez sélectionner un sujet"),
  message: z
    .string()
    .min(10, "Le message doit contenir au moins 10 caractères"),
  typeUtilisateur: z.string().min(1, "Veuillez sélectionner votre profil"),
});

const sujets = [
  { value: "demande-info", label: "Demande d'information" },
  { value: "demo", label: "Demande de démonstration" },
  { value: "devis", label: "Demande de devis" },
  { value: "support", label: "Support technique" },
  { value: "partenariat", label: "Partenariat commercial" },
  { value: "autre", label: "Autre" },
];

const typesUtilisateur = [
  { value: "recruteur", label: "Recruteur / RH" },
  { value: "candidat", label: "Candidat" },
  { value: "entreprise", label: "Entreprise" },
  { value: "partenaire", label: "Partenaire" },
  { value: "autre", label: "Autre" },
];

const contactInfo = [
  {
    icon: <Mail className="h-6 w-6" />,
    title: "Email",
    value: "contact@ylsix-rh.com",
    description: "Réponse sous 24h",
    color: "text-blue-600",
  },
  {
    icon: <Phone className="h-6 w-6" />,
    title: "Téléphone",
    value: "+225 05 44 65 94 90",
    description: "Lun-Ven 9h-18h",
    color: "text-green-600",
  },
  {
    icon: <MapPin className="h-6 w-6" />,
    title: "Adresse",
    value: "Cocody Abatta",
    description: "Siège social",
    color: "text-purple-600",
  },
  {
    icon: <Clock className="h-6 w-6" />,
    title: "Horaires",
    value: "Lundi - Vendredi",
    description: "9h00 - 18h00 (UTC)",
    color: "text-orange-600",
  },
];

const supportOptions = [
  {
    icon: <HelpCircle className="h-8 w-8" />,
    title: "Centre d'aide",
    description: "Trouvez rapidement des réponses à vos questions",
    link: "/support",
    color: "bg-blue-50 text-blue-600",
  },
  {
    icon: <MessageSquare className="h-8 w-8" />,
    title: "Chat en ligne",
    description: "Discutez avec notre équipe en temps réel",
    link: "#",
    color: "bg-green-50 text-green-600",
  },
  {
    icon: <Users className="h-8 w-8" />,
    title: "Communauté",
    description: "Échangez avec d'autres utilisateurs",
    link: "#",
    color: "bg-purple-50 text-purple-600",
  },
  {
    icon: <Building className="h-8 w-8" />,
    title: "Partenaires",
    description: "Devenez partenaire de notre plateforme",
    link: "#",
    color: "bg-orange-50 text-orange-600",
  },
];

const stats = [
  {
    label: "Clients satisfaits",
    value: "98%",
    icon: <Star className="h-4 w-4" />,
  },
  {
    label: "Temps de réponse",
    value: "< 24h",
    icon: <Clock className="h-4 w-4" />,
  },
  {
    label: "Support disponible",
    value: "24/7",
    icon: <Shield className="h-4 w-4" />,
  },
  {
    label: "Langues supportées",
    value: "3",
    icon: <Globe className="h-4 w-4" />,
  },
];

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<z.infer<typeof contactFormSchema>>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      nom: "",
      email: "",
      entreprise: "",
      telephone: "",
      sujet: "",
      message: "",
      typeUtilisateur: "",
    },
  });

  async function onSubmit(values: z.infer<typeof contactFormSchema>) {
    try {
      setIsSubmitting(true);

      // Simulation d'envoi - à remplacer par votre API
      await new Promise((resolve) => setTimeout(resolve, 2000));

      toast.success("Message envoyé avec succès !");
      setIsSubmitted(true);
      form.reset();
    } catch (error) {
      toast.error("Erreur lors de l'envoi du message");
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-background">
        <Header />
        <div className="container mx-auto px-4 py-24 m">
          <div className="max-w-2xl mx-auto text-center">
            <div className="mb-8 flex flex-col items-center justify-center">
              <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
              <h1 className="text-3xl font-bold mb-4">Message envoyé !</h1>
              <p className="text-lg text-muted-foreground mb-8">
                Merci pour votre message. Notre équipe vous répondra dans les
                plus brefs délais.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              {contactInfo.slice(0, 2).map((info, index) => (
                <Card key={index} className="text-center bg-transparent">
                  <CardContent className="pt-6 flex flex-col items-center justify-center">
                    <div className={`${info.color} mb-2`}>{info.icon}</div>
                    <h3 className="font-semibold mb-1">{info.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {info.value}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>

            <Button onClick={() => setIsSubmitted(false)}>
              Retour à la page de contact
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero Section */}
      <section className="pt-32 pb-12 px-4">
        <div className="container mx-auto text-center">
          <Badge variant="secondary" className="mb-4 px-4 py-2">
            Contactez-nous
          </Badge>
          <h1 className="text-4xl md:text-6xl font-bold mb-6">
            Nous sommes là pour <span className="text-primary">vous aider</span>
          </h1>
          <p className="text-xl text-muted-foreground mb-8 max-w-3xl mx-auto">
            Que vous ayez une question, besoin d'aide ou envie de collaborer,
            notre équipe est à votre disposition.
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

      {/* Contact Form & Info */}
      <section className="py-12 px-4">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <Card className="shadow-none border bg-transparent">
              <CardHeader>
                <CardTitle className="text-2xl">
                  Envoyez-nous un message
                </CardTitle>
                <CardDescription>
                  Remplissez le formulaire ci-dessous et nous vous répondrons
                  rapidement.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                  >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="nom"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nom complet *</FormLabel>
                            <FormControl>
                              <Input placeholder="Votre nom" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email *</FormLabel>
                            <FormControl>
                              <Input
                                type="email"
                                placeholder="votre@email.com"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="entreprise"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Entreprise *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Nom de votre entreprise"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="telephone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Téléphone *</FormLabel>
                            <FormControl>
                              <Input
                                type="tel"
                                placeholder="Votre numéro"
                                {...field}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="typeUtilisateur"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Votre profil *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez votre profil" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="w-full bg-background  ">
                                {typesUtilisateur.map((type) => (
                                  <SelectItem
                                    key={type.value}
                                    value={type.value}
                                  >
                                    {type.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="sujet"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Sujet *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger className="w-full">
                                  <SelectValue placeholder="Sélectionnez un sujet" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent className="w-full bg-background">
                                {sujets.map((sujet) => (
                                  <SelectItem
                                    key={sujet.value}
                                    value={sujet.value}
                                  >
                                    {sujet.label}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Message *</FormLabel>
                          <FormControl>
                            <Textarea
                              placeholder="Décrivez votre demande..."
                              className="min-h-[120px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <Button
                      type="submit"
                      className="w-full"
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Envoi en cours...
                        </>
                      ) : (
                        <>
                          <Send className="mr-2 h-4 w-4" />
                          Envoyer le message
                        </>
                      )}
                    </Button>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Contact Info */}
            <div className="space-y-6">
              <Card className="shadow-none border bg-transparent  ">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Informations de contact
                  </CardTitle>
                  <CardDescription>
                    Retrouvez toutes nos coordonnées pour nous contacter.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {contactInfo.map((info, index) => (
                    <div key={index} className="flex items-start gap-4">
                      <div className={`${info.color} mt-1`}>{info.icon}</div>
                      <div>
                        <h3 className="font-semibold">{info.title}</h3>
                        <p className="text-foreground">{info.value}</p>
                        <p className="text-sm text-muted-foreground">
                          {info.description}
                        </p>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="shadow-none border bg-transparent">
                <CardHeader>
                  <CardTitle className="text-2xl">
                    Autres options de support
                  </CardTitle>
                  <CardDescription>
                    Découvrez d'autres façons de nous contacter.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {supportOptions.map((option, index) => (
                      <div
                        key={index}
                        className="p-4 rounded-lg border  hover:shadow-md transition-shadow cursor-pointer"
                      >
                        <div className={` mb-3`}>{option.icon}</div>
                        <h3 className="font-semibold mb-2">{option.title}</h3>
                        <p className="text-sm text-muted-foreground mb-3">
                          {option.description}
                        </p>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="p-0 h-auto"
                          onClick={() => {
                            window.location.href = "/a-propos";
                          }}
                        >
                          En savoir plus
                          <ArrowRight className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
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
              Trouvez rapidement des réponses à vos questions
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
            <Card className="shadow-none border bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">
                  Quel est le délai de réponse ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nous nous engageons à répondre à toutes les demandes sous 24h
                  ouvrées. Pour les urgences, contactez-nous par téléphone.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">
                  Proposez-vous des démonstrations ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Oui, nous proposons des démonstrations personnalisées de 30
                  minutes pour vous présenter toutes les fonctionnalités de
                  notre plateforme.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">
                  Comment devenir partenaire ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Nous recherchons des partenaires dans différents secteurs.
                  Contactez-nous pour discuter des opportunités de
                  collaboration.
                </p>
              </CardContent>
            </Card>

            <Card className="shadow-none border bg-transparent">
              <CardHeader>
                <CardTitle className="text-lg">
                  Supportez-vous plusieurs langues ?
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Oui, notre équipe supporte le français, l'anglais et
                  l'espagnol. Nous prévoyons d'ajouter d'autres langues
                  prochainement.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
