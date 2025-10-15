# 🎨 Template CV Minimaliste - Documentation

## 📋 Implémentation Terminée

J'ai créé un template CV minimaliste qui reproduit exactement le design professionnel de l'image que vous avez fournie. Voici les détails de l'implémentation :

## ✨ Caractéristiques du Template Minimaliste

### 🎨 **Design**

- **Layout en 2 colonnes** : Sidebar sombre (33%) + Contenu principal (67%)
- **Couleurs** : Sidebar gris foncé (#2d3748) + Contenu blanc
- **Typographie** : Arial, texte en majuscules pour les titres
- **Style** : Épuré, professionnel, moderne

### 📱 **Structure**

#### **Sidebar Gauche (Sombre)**

- Photo de profil circulaire
- Section Contact avec icônes
- Section Education
- Section Skills avec barres de progression

#### **Contenu Principal (Blanc)**

- Nom en grandes majuscules
- Titre professionnel
- Résumé professionnel
- Section Experience détaillée

## 🛠️ Fichiers Créés/Modifiés

### **Nouveaux Composants**

```
components/cv/templates/MinimalistTemplate.tsx
├── Composant React pour la prévisualisation
├── Layout en 2 colonnes avec sidebar sombre
├── Formatage des dates en anglais (Jan 2020 - Present)
└── Gestion des données vides

lib/cv-templates/minimal-pdf.ts
├── Générateur HTML pour l'export PDF
├── Styles CSS optimisés pour l'impression
├── Même layout que la prévisualisation
└── Support des couleurs pour l'impression
```

### **Modifications Existantes**

```
components/cv/CVPreview.tsx
├── Import du MinimalistTemplate
├── Condition pour utiliser le template selon le layout
└── Fallback vers le template générique

components/cv/CVTemplateSelector.tsx
├── Aperçu visuel spécifique au template minimaliste
├── Prévisualisation avec sidebar sombre + contenu blanc
└── Gradient sombre pour différencier le style

components/cv/CVPersonalInfoForm.tsx
├── Ajout du champ "Titre professionnel" (jobTitle)
└── Placement entre nom/prénom et email

app/api/candidat/cv/[id]/export/route.ts
├── Import du générateur PDF minimaliste
├── Condition pour choisir le bon générateur
└── Support de l'export PDF spécialisé
```

### **Base de Données**

```
prisma/schema.prisma
├── Ajout du champ jobTitle dans CVPersonalInfo
└── Synchronisation avec la base de données
```

## 🎯 Fonctionnalités Spécifiques

### **Prévisualisation**

- ✅ Layout fidèle à l'image de référence
- ✅ Sidebar sombre avec photo de profil
- ✅ Sections Contact, Education, Skills
- ✅ Contenu principal avec nom en majuscules
- ✅ Formatage des dates en anglais
- ✅ Barres de progression pour les compétences

### **Export PDF**

- ✅ HTML optimisé pour l'impression A4
- ✅ Couleurs préservées (@media print)
- ✅ Layout identique à la prévisualisation
- ✅ Typographie professionnelle
- ✅ Gestion des sauts de page

### **Sélecteur de Template**

- ✅ Aperçu visuel distinctif
- ✅ Prévisualisation miniature du layout
- ✅ Gradient sombre pour identification
- ✅ Description "Simplicité et élégance"

## 📊 Données Supportées

### **Informations Personnelles**

- Prénom/Nom (affiché en MAJUSCULES)
- Titre professionnel (nouveau champ)
- Photo de profil (circulaire)
- Email, téléphone, adresse
- LinkedIn, site web
- Résumé professionnel

### **Expériences**

- Poste (en MAJUSCULES)
- Entreprise | Lieu | Dates
- Description détaillée
- Réalisations (liste à puces)
- Formatage : "Jan 2020 - Present"

### **Formation**

- Institution (en MAJUSCULES)
- Diplôme/Domaine
- Dates formatées
- Affichage compact dans la sidebar

### **Compétences**

- Nom de la compétence
- Niveau visuel (barre de progression blanche)
- Affichage dans la sidebar sombre

## 🎨 Détails de Style

### **Couleurs**

```css
Sidebar: #2d3748 (gris foncé)
Contenu: #ffffff (blanc)
Texte sidebar: #ffffff (blanc)
Texte principal: #2d3748 (gris foncé)
Accents: #718096 (gris moyen)
```

### **Typographie**

```css
Nom: 36px, bold, UPPERCASE, letterspacing: 2px
Titre: 18px, light, normal case
Sections: 16px, bold, UPPERCASE, letterspacing: 1px
Contenu: 11-12px, normal
```

### **Layout**

```css
Format: A4 (210mm x 297mm)
Sidebar: 33.33% de largeur
Padding: 30px/25px
Marges PDF: 20mm/15mm
```

## 🚀 Utilisation

### **Pour les Candidats**

1. Sélectionner le template "Minimaliste"
2. Remplir les informations personnelles (avec titre professionnel)
3. Ajouter expériences, formations, compétences
4. Prévisualiser en temps réel
5. Exporter en PDF professionnel

### **Rendu Final**

- CV sur 1 page A4 optimisé
- Layout professionnel et moderne
- Lisibilité excellente
- Impression parfaite en couleur ou N&B
- Compatible ATS (Applicant Tracking Systems)

## 🔧 Configuration Technique

### **Prérequis**

- Prisma client régénéré
- Base de données synchronisée
- Puppeteer installé pour l'export PDF

### **Commandes**

```bash
# Régénérer Prisma après modifications
npx prisma generate

# Synchroniser la base de données
npx prisma db push

# Tester la connexion
npx tsx scripts/test-prisma.ts
```

## ✅ Résultat

Le template minimaliste est maintenant entièrement fonctionnel et reproduit fidèlement le design professionnel de l'image de référence. Les candidats peuvent :

- ✅ **Créer des CVs** avec le style minimaliste
- ✅ **Prévisualiser** le rendu exact en temps réel
- ✅ **Exporter en PDF** avec une qualité professionnelle
- ✅ **Personnaliser** toutes les sections
- ✅ **Gérer** plusieurs versions de leur CV

Le template s'intègre parfaitement dans le générateur de CV existant et offre une alternative élégante et moderne aux autres styles disponibles ! 🎉
