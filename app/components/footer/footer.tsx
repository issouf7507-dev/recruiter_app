import React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  Linkedin,
  Twitter,
  Facebook,
  Instagram,
  Youtube,
  Github,
  ArrowRight,
  Heart,
  Shield,
  Globe,
  Users,
  Building,
  Briefcase,
  MessageSquare,
  HelpCircle,
  FileText,
} from "lucide-react";

const Footer = () => {
  const currentYear = new Date().getFullYear();

  const footerSections = [
    {
      title: "Plateforme",
      links: [
        { name: "Fonctionnalités", href: "/fonctionnalite" },
        { name: "Tarifs", href: "/tarifs" },
        { name: "Témoignages", href: "/temoignages" },
        { name: "À propos", href: "/a-propos" },
        { name: "Contact", href: "/contact" },
      ],
    },
    {
      title: "Solutions",
      links: [
        { name: "Pour les recruteurs", href: "/fonctionnalite" },
        { name: "Pour les candidats", href: "/fonctionnalite" },
        { name: "Pour les entreprises", href: "/fonctionnalite" },
        { name: "API & Intégrations", href: "/fonctionnalite" },
        { name: "Partenaires", href: "/contact" },
      ],
    },
    {
      title: "Ressources",
      links: [
        { name: "Centre d'aide", href: "/support" },
        { name: "Documentation", href: "/support" },
        { name: "Blog", href: "/blog" },
        { name: "Webinaires", href: "/contact" },
        { name: "Événements", href: "/contact" },
      ],
    },
    {
      title: "Support",
      links: [
        { name: "Contact", href: "/contact" },
        { name: "FAQ", href: "/support" },
        { name: "Chat en ligne", href: "/contact" },
        { name: "Support technique", href: "/contact" },
        { name: "Formation", href: "/contact" },
      ],
    },
  ];

  const socialLinks = [
    { name: "LinkedIn", icon: <Linkedin className="h-5 w-5" />, href: "#" },
    { name: "Twitter", icon: <Twitter className="h-5 w-5" />, href: "#" },
    { name: "Facebook", icon: <Facebook className="h-5 w-5" />, href: "#" },
    { name: "Instagram", icon: <Instagram className="h-5 w-5" />, href: "#" },
    { name: "YouTube", icon: <Youtube className="h-5 w-5" />, href: "#" },
  ];

  const contactInfo = [
    {
      icon: <Mail className="h-4 w-4" />,
      label: "Email",
      value: "contact@ylsix-rh.com",
      href: "mailto:contact@recruter.com",
    },
    {
      icon: <Phone className="h-4 w-4" />,
      label: "Téléphone",
      value: "+225 05 44 65 94 90",
      href: "tel:+2250544659490",
    },
    {
      icon: <MapPin className="h-4 w-4" />,
      label: "Adresse",
      value: "Cocody Abatta",
      href: "#",
    },
    {
      icon: <Clock className="h-4 w-4" />,
      label: "Horaires",
      value: "Lun-Ven 9h-18h (UTA)",
      href: "#",
    },
  ];

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
      icon: <Heart className="h-4 w-4" />,
    },
  ];

  return (
    <footer className="bg-background border-t">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-12">
        {/* Top Section with Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-12">
          {stats.map((stat, index) => (
            <div key={index} className="text-center">
              <div className="flex items-center justify-center mb-2">
                {stat.icon}
              </div>
              <div className="text-2xl font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-sm text-muted-foreground">{stat.label}</div>
            </div>
          ))}
        </div>

        <Separator className="mb-12" />

        {/* Main Footer Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-8 mb-12">
          {/* Company Info */}
          <div className="lg:col-span-1">
            <div className="flex items-center space-x-2 mb-4">
              <div className="h-5 w-6 bg-primary rounded-br-lg rounded-tr-sm rounded-tl-lg rounded-bl-sm flex-shrink-0" />
              <span className="text-xl font-bold text-foreground">Ylsix</span>
            </div>
            <p className="text-muted-foreground text-sm mb-6">
              Révolutionnez vos recrutements avec notre plateforme intelligente.
              Connectez les meilleurs talents aux meilleures opportunités.
            </p>

            {/* Social Links */}
            <div className="flex space-x-3">
              {socialLinks.map((social, index) => (
                <Link
                  key={index}
                  href={social.href}
                  className="w-8 h-8 bg-muted rounded-full flex items-center justify-center hover:bg-primary hover:text-primary-foreground transition-colors"
                  aria-label={social.name}
                >
                  {social.icon}
                </Link>
              ))}
            </div>
          </div>

          {/* Footer Sections */}
          {footerSections.map((section, index) => (
            <div key={index}>
              <h3 className="font-semibold text-foreground mb-4">
                {section.title}
              </h3>
              <ul className="space-y-2">
                {section.links.map((link, linkIndex) => (
                  <li key={linkIndex}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <Separator className="mb-8" />

        {/* Contact & Newsletter */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
          {/* Contact Info */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Contactez-nous
            </h3>
            <div className="space-y-3">
              {contactInfo.map((contact, index) => (
                <div key={index} className="flex items-center gap-3">
                  <div className="text-muted-foreground">{contact.icon}</div>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {contact.label}
                    </p>
                    <Link
                      href={contact.href}
                      className="text-sm text-muted-foreground hover:text-foreground transition-colors"
                    >
                      {contact.value}
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h3 className="font-semibold text-foreground mb-4">
              Restez informé
            </h3>
            <p className="text-sm text-muted-foreground mb-4">
              Recevez nos dernières actualités et conseils de recrutement.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Votre email"
                className="flex-1 px-3 py-2 border border-input rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent"
              />
              <Button
                size="sm"
                className="bg-primary text-primary-foreground hover:bg-primary/90"
              >
                S'abonner
                <ArrowRight className="ml-1 h-3 w-3" />
              </Button>
            </div>
          </div>
        </div>

        <Separator className="mb-8" />

        {/* Bottom Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Copyright & Legal */}
          <div className="flex flex-col md:flex-row items-center gap-4 text-sm text-muted-foreground">
            <p>© {currentYear} Ylsix. Tous droits réservés.</p>
            <div className="flex items-center gap-4">
              <Link
                href="/mentions-legales"
                className="hover:text-foreground transition-colors"
              >
                Mentions légales
              </Link>
              <Link
                href="/politique-confidentialite"
                className="hover:text-foreground transition-colors"
              >
                Politique de confidentialité
              </Link>
              <Link
                href="/conditions-utilisation"
                className="hover:text-foreground transition-colors"
              >
                Conditions d'utilisation
              </Link>
            </div>
          </div>

          {/* Trust Badges */}
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Shield className="h-4 w-4" />
              <span>RGPD Conforme</span>
            </div>
            <div className="flex items-center gap-1">
              <Globe className="h-4 w-4" />
              <span>SSL Sécurisé</span>
            </div>
            <div className="flex items-center gap-1">
              <Heart className="h-4 w-4" />
              <span>Made with ❤️</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
