# Configuration EdgeStore

Ce document explique la configuration et l'utilisation d'EdgeStore pour l'upload de fichiers dans le projet.

## Configuration

### 1. Route API EdgeStore

Le fichier `app/api/edgestore/[...edgestore]/route.ts` configure le bucket EdgeStore avec :

- **Taille maximale** : 10MB par fichier
- **Types acceptés** :
  - Images : `image/*` (jpg, jpeg, png, gif, webp)
  - Documents : `application/pdf`, `application/msword`, `application/vnd.openxmlformats-officedocument.wordprocessingml.document`

### 2. Provider EdgeStore

Le fichier `lib/edgestore.ts` configure le provider React pour EdgeStore.

### 3. Intégration dans le layout

Le `EdgeStoreProvider` est intégré dans `app/layout.tsx` pour être disponible dans toute l'application.

## Composants d'Upload

### FileUpload

Composant réutilisable pour l'upload de documents (CV, lettres de motivation).

**Props :**

- `onUpload`: Fonction appelée après un upload réussi
- `currentUrl`: URL du fichier actuel (pour le remplacement)
- `accept`: Types de fichiers acceptés
- `type`: "document" ou "image"
- `label`: Label pour les messages de succès
- `buttonText`: Texte du bouton
- `disabled`: État désactivé

**Utilisation :**

```tsx
<FileUpload
  onUpload={(url) => setValue("cv", url)}
  currentUrl={watch("cv")}
  type="document"
  label="CV"
  buttonText="Changer le CV"
  accept=".pdf,.doc,.docx"
/>
```

### ImageUpload

Composant spécialisé pour l'upload d'images de profil.

**Props :**

- `onUpload`: Fonction appelée après un upload réussi
- `currentUrl`: URL de l'image actuelle (pour le remplacement)
- `disabled`: État désactivé

**Utilisation :**

```tsx
<ImageUpload
  onUpload={(url) => setValue("image", url)}
  currentUrl={watch("image")}
/>
```

## Fonctionnalités

### 1. Remplacement automatique

Les composants utilisent l'option `replaceTargetUrl` pour remplacer automatiquement les fichiers existants au lieu d'en créer de nouveaux.

### 2. Validation des types

EdgeStore valide automatiquement les types de fichiers selon la configuration du bucket.

### 3. Gestion des erreurs

Les composants gèrent les erreurs d'upload et affichent des messages appropriés via toast.

### 4. États de chargement

Chaque composant affiche un loader pendant l'upload et désactive les interactions.

### 5. Noms de fichiers

EdgeStore génère automatiquement des noms de fichiers uniques, mais les messages de succès affichent le nom original du fichier.

## Utilisation dans les pages

### Page Informations Personnelles

La page `app/(dashc)/(routes)/dashboard-candidats/informations-personnelles/page.tsx` utilise :

1. **ImageUpload** pour la photo de profil
2. **FileUpload** pour le CV
3. **FileUpload** pour la lettre de motivation

### Mode édition

Les composants d'upload ne sont affichés qu'en mode édition (`isEditing = true`).

### Affichage en lecture seule

En mode lecture seule, seuls les liens vers les fichiers sont affichés.

## Avantages d'EdgeStore

1. **Performance** : Upload direct vers le cloud
2. **Sécurité** : Validation côté serveur
3. **Fiabilité** : Gestion automatique des erreurs
4. **Flexibilité** : Configuration facile des types acceptés
5. **UX** : Feedback en temps réel avec loaders
