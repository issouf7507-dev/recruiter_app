# 🟡 06 - DUPLICATION DE CODE

## ⚠️ Priorité: MOYENNE

Ces problèmes concernent le code dupliqué qui rend la maintenance difficile.

---

## 1. 🔧 Header.tsx - Duplication Massive

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`  
**Lignes**: 115-428

### ❌ Problème

Le code du menu utilisateur est dupliqué **4 FOIS** dans le même fichier :

1. Desktop - Menu Recruteur (lignes 115-163)
2. Desktop - Menu Candidat (lignes 165-211)
3. Mobile - Menu Recruteur (lignes 298-362)
4. Mobile - Menu Candidat (lignes 365-428)

```typescript
// Version 1 - Desktop Recruteur
{!isPending && session?.user && user?.type === "RECRUTEUR" && (
  <DropdownMenu>
    <DropdownMenuTrigger asChild>
      <Avatar>...</Avatar>
    </DropdownMenuTrigger>
    <DropdownMenuContent>
      <DropdownMenuItem onClick={() => router.push("/dashboard-recruteurs")}>
        Mon espace
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push("/dashboard-recruteurs/profil")}>
        Modifier mon profil recruteur
      </DropdownMenuItem>
      <DropdownMenuItem onClick={async () => { await signOut(); window.location.reload(); }}>
        Se déconnecter
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
)}

// Version 2 - Desktop Candidat (MÊME CODE avec variations mineures)
{!isPending && session?.user && user?.type === "CANDIDAT" && (
  <DropdownMenu>
    {/* ... quasi identique ... */}
  </DropdownMenu>
)}

// Version 3 & 4 - Mobile (ENCORE LE MÊME CODE !)
```

### ⚠️ Risques
- Maintenance cauchemardesque
- Bugs dans une version mais pas l'autre
- Changement doit être fait 4 fois
- Code illisible

### ✅ Solution

Créer des composants réutilisables (déjà détaillé dans 03-ARCHITECTURE.md) :

```typescript
// components/header/UserMenu/UserMenu.tsx
interface UserMenuProps {
  user: AuthUser;
  isMobile?: boolean;
}

export const UserMenu = ({ user, isMobile = false }: UserMenuProps) => {
  const MenuComponent = isMobile ? MobileUserMenu : DesktopUserMenu;
  
  return <MenuComponent user={user} />;
};

// components/header/UserMenu/DesktopUserMenu.tsx
export const DesktopUserMenu = ({ user }: { user: AuthUser }) => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <UserAvatar user={user} />
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <UserMenuContent user={user} />
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

// components/header/UserMenu/UserMenuContent.tsx
export const UserMenuContent = ({ user }: { user: AuthUser }) => {
  const router = useRouter();
  const dashboardPath = getDashboardPath(user.type);
  const profilePath = getProfilePath(user.type);

  return (
    <>
      <DropdownMenuItem onClick={() => router.push(dashboardPath)}>
        <User className="mr-2 h-4 w-4" />
        Mon espace
      </DropdownMenuItem>
      <DropdownMenuItem onClick={() => router.push(profilePath)}>
        <Settings className="mr-2 h-4 w-4" />
        Modifier mon profil
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem onClick={logout} className="text-destructive">
        <LogOut className="mr-2 h-4 w-4" />
        Se déconnecter
      </DropdownMenuItem>
    </>
  );
};
```

### 📝 Actions
1. Extraire le code commun
2. Créer des composants réutilisables
3. Paramétrer les différences
4. Supprimer la duplication
5. **Gain**: ~300 lignes supprimées !

---

## 2. 🔧 Logique d'Inscription Dupliquée

### 📍 Localisation
**Fichiers**:
- `app/auth/candidat/inscription/page.tsx`
- `app/auth/recruteur/inscription/page.tsx`

### ❌ Problème

Les deux pages d'inscription ont une structure quasi identique :
- Même gestion de formulaire
- Même gestion d'état
- Même UI de base
- Seuls les champs différent

### ✅ Solution

Créer un composant d'inscription générique :

```typescript
// components/auth/SignupForm/SignupForm.tsx
interface SignupFormProps<T extends z.ZodType> {
  userType: "CANDIDAT" | "RECRUTEUR";
  schema: T;
  fields: FormFieldConfig[];
  onSubmit: (values: z.infer<T>) => Promise<void>;
  redirectPath: string;
}

export function SignupForm<T extends z.ZodType>({
  userType,
  schema,
  fields,
  onSubmit,
  redirectPath,
}: SignupFormProps<T>) {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: getDefaultValues(fields),
  });

  const handleSubmit = async (values: z.infer<T>) => {
    try {
      setIsLoading(true);
      await onSubmit(values);
      toast.success("Inscription réussie !");
      router.push(redirectPath);
    } catch (error) {
      toast.error("Erreur lors de l'inscription");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Inscription {userType}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <FormFields fields={fields} control={form.control} />
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Inscription..." : "S'inscrire"}
            </Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
```

**Utilisation** :

```typescript
// app/auth/candidat/inscription/page.tsx
import { SignupForm } from "@/components/auth/SignupForm";
import { candidatSignupSchema, candidatFields } from "@/lib/schemas/candidat";

export default function InscriptionCandidat() {
  return (
    <SignupForm
      userType="CANDIDAT"
      schema={candidatSignupSchema}
      fields={candidatFields}
      onSubmit={signupCandidat}
      redirectPath="/auth/candidat/connexion"
    />
  );
}
```

### 📝 Actions
1. Créer le composant générique
2. Définir la configuration des champs
3. Migrer les pages d'inscription
4. **Gain**: ~400 lignes supprimées !

---

## 3. 🔧 Déconnexion Dupliquée

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`

### ❌ Problème

Code de déconnexion répété **4 fois** avec des variantes :

```typescript
// Version 1
onClick={async () => {
  await signOut();
  window.location.reload();
}}

// Version 2
onClick={async () => {
  await fetch("/api/auth/logout", { method: "POST" });
  window.location.reload();
}}
```

### ✅ Solution

Déjà détaillée dans 02-AUTHENTIFICATION.md :

```typescript
// lib/auth-utils.ts
export async function logout() {
  // Une seule implémentation
}

// Utilisation partout
<Button onClick={logout}>Se déconnecter</Button>
```

---

## 4. 🔧 Requêtes Prisma Dupliquées

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Même requête répétée dans plusieurs fichiers :

```typescript
// Dans route1.ts
const user = await prisma.user.findUnique({
  where: { id },
  include: { candidat: true },
});

// Dans route2.ts (MÊME CODE)
const user = await prisma.user.findUnique({
  where: { id },
  include: { candidat: true },
});

// Dans action.ts (ENCORE)
const user = await prisma.user.findUnique({
  where: { id },
  include: { candidat: true },
});
```

### ✅ Solution

Repository Pattern (détaillé dans 03-ARCHITECTURE.md et 04-BASE-DE-DONNEES.md) :

```typescript
// lib/repositories/user.repository.ts
export class UserRepository {
  static async findByIdWithProfile(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { candidat: true, recruteur: true },
    });
  }
}

// Utilisation partout
const user = await UserRepository.findByIdWithProfile(id);
```

---

## 5. 🔧 Validation Dupliquée

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Schémas de validation répétés :

```typescript
// Dans inscription/page.tsx
const formSchema = z.object({
  email: z.string().email(),
  password: z.string().min(6),
  // ...
});

// Dans action/signup.ts (devrait être le même !)
const signupSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8), // ❌ Différent !
  // ...
});
```

### ✅ Solution

Centraliser les schémas :

```typescript
// lib/validators/auth.schemas.ts
export const emailSchema = z.string().email("Email invalide");

export const passwordSchema = z
  .string()
  .min(8, "Minimum 8 caractères")
  .regex(/[A-Z]/, "Une majuscule requise")
  .regex(/[a-z]/, "Une minuscule requise")
  .regex(/[0-9]/, "Un chiffre requis");

export const signupCandidatSchema = z.object({
  email: emailSchema,
  password: passwordSchema,
  confirmPassword: z.string(),
  nom: z.string().min(2).max(100),
  prenom: z.string().min(2).max(100),
  // ...
}).refine((data) => data.password === data.confirmPassword, {
  message: "Les mots de passe ne correspondent pas",
  path: ["confirmPassword"],
});

// ✅ Utiliser le MÊME schéma partout
// - Client: inscription/page.tsx
// - Serveur: action/signup.ts
// - API: app/api/auth/signup/route.ts
```

---

## 6. 🔧 Avatar et Initiales Dupliqués

### 📍 Localisation
**Fichier**: `app/components/header/header.tsx`

### ❌ Problème

Logique d'avatar dupliquée partout :

```typescript
// Version 1
<Avatar>
  <AvatarImage src={session?.user?.image || undefined} />
  <AvatarFallback>
    {session?.user?.name
      ? session?.user?.name[0]
      : session?.user?.email
        ? session?.user?.email[0]
        : "U"}
  </AvatarFallback>
</Avatar>

// Version 2 (légèrement différente)
<Avatar>
  <AvatarImage src={session?.user?.image || undefined} />
  <AvatarFallback>
    {session?.user?.name
      ? session?.user?.name.charAt(0) + session?.user?.email.charAt(0)
      : "U"}
  </AvatarFallback>
</Avatar>
```

### ✅ Solution

Créer un composant Avatar réutilisable :

```typescript
// components/ui/UserAvatar.tsx
interface UserAvatarProps {
  user: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
  };
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const UserAvatar = ({ user, size = "md", className }: UserAvatarProps) => {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  const getInitials = () => {
    if (user.name) {
      const parts = user.name.split(" ");
      if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
      }
      return user.name.substring(0, 2).toUpperCase();
    }
    if (user.email) {
      return user.email.substring(0, 2).toUpperCase();
    }
    return "U";
  };

  return (
    <Avatar className={cn(sizeClasses[size], className)}>
      <AvatarImage src={user.image || undefined} alt={user.name || user.email || "User"} />
      <AvatarFallback>{getInitials()}</AvatarFallback>
    </Avatar>
  );
};
```

**Utilisation** :

```typescript
// Partout
<UserAvatar user={user} size="md" />
```

---

## 7. 🔧 Gestion de Dates Dupliquée

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Formatage de dates répété :

```typescript
// Version 1
new Date(dateString).toLocaleDateString("fr-FR")

// Version 2
format(new Date(dateString), "dd/MM/yyyy", { locale: fr })

// Version 3
dateString.split("T")[0]
```

### ✅ Solution

Créer des utilitaires de dates :

```typescript
// lib/utils/date.utils.ts
import { format, formatDistanceToNow, parseISO } from "date-fns";
import { fr } from "date-fns/locale";

export const DateUtils = {
  /**
   * Formater une date en français
   */
  format(date: string | Date, pattern = "dd/MM/yyyy"): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, pattern, { locale: fr });
  },

  /**
   * Date relative (il y a 2 jours)
   */
  formatRelative(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(d, { addSuffix: true, locale: fr });
  },

  /**
   * Formater pour input date
   */
  formatForInput(date: string | Date): string {
    const d = typeof date === "string" ? parseISO(date) : date;
    return format(d, "yyyy-MM-dd");
  },

  /**
   * Vérifier si une date est passée
   */
  isPast(date: string | Date): boolean {
    const d = typeof date === "string" ? parseISO(date) : date;
    return d < new Date();
  },

  /**
   * Calculer l'âge
   */
  calculateAge(birthDate: string | Date): number {
    const d = typeof birthDate === "string" ? parseISO(birthDate) : birthDate;
    const today = new Date();
    let age = today.getFullYear() - d.getFullYear();
    const monthDiff = today.getMonth() - d.getMonth();
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
      age--;
    }
    return age;
  },
};
```

**Utilisation** :

```typescript
// Partout
import { DateUtils } from "@/lib/utils/date.utils";

// Afficher
DateUtils.format(user.createdAt);
DateUtils.formatRelative(message.createdAt); // "il y a 2 heures"

// Âge
const age = DateUtils.calculateAge(candidat.dateNaissance);
```

---

## 8. 🔧 Messages Toast Dupliqués

### 📍 Localisation
**Multiples fichiers**

### ❌ Problème

Messages d'erreur répétés partout :

```typescript
// Version 1
toast.error("Une erreur est survenue");

// Version 2
toast.error("Une erreur est survenue lors de l'inscription");

// Version 3
toast.error("Erreur");
```

### ✅ Solution

Centraliser les messages :

```typescript
// lib/constants/messages.ts
export const ToastMessages = {
  // Succès
  success: {
    signup: "Inscription réussie !",
    login: "Connexion réussie !",
    update: "Modifications enregistrées",
    delete: "Suppression effectuée",
    create: "Création réussie",
  },

  // Erreurs
  error: {
    generic: "Une erreur est survenue",
    network: "Erreur de connexion",
    unauthorized: "Vous devez être connecté",
    forbidden: "Accès refusé",
    notFound: "Élément non trouvé",
    validation: "Données invalides",
  },

  // Info
  info: {
    loading: "Chargement...",
    processing: "Traitement en cours...",
  },
};

// Helper
export const showToast = {
  success: (message: string) => toast.success(message),
  error: (message: string) => toast.error(message),
  info: (message: string) => toast.info(message),
};
```

**Utilisation** :

```typescript
import { ToastMessages, showToast } from "@/lib/constants/messages";

// Au lieu de
toast.success("Inscription réussie !");

// Utiliser
showToast.success(ToastMessages.success.signup);
```

---

## 📊 Résumé des Duplications

| Fichier/Section | Lignes dupliquées | Gain potentiel |
|----------------|-------------------|----------------|
| Header.tsx | ~300 lignes | 75% réduction |
| Pages d'inscription | ~400 lignes | 60% réduction |
| Requêtes Prisma | ~200 lignes | 80% réduction |
| Validation | ~150 lignes | 90% réduction |
| Avatar/UI | ~100 lignes | 85% réduction |
| **TOTAL** | **~1150 lignes** | **~800 lignes économisées** |

## ✅ Checklist Anti-Duplication

- [ ] Header décomposé en composants
- [ ] Formulaires d'inscription unifiés
- [ ] Repository pattern pour les requêtes
- [ ] Schémas de validation centralisés
- [ ] Composants UI réutilisables (Avatar, etc.)
- [ ] Utilitaires de dates centralisés
- [ ] Messages centralisés
- [ ] Logique métier extraite dans des services
- [ ] Tests pour les composants réutilisables

## 📝 Principe DRY (Don't Repeat Yourself)

> "Every piece of knowledge must have a single, unambiguous, authoritative representation within a system."

Avant d'écrire du code, demandez-vous :
1. Ce code existe-t-il déjà ailleurs ?
2. Puis-je le rendre réutilisable ?
3. Où devrait-il vivre (composant, hook, utilitaire) ?

---

**💡 Bénéfices**: Code plus court, bugs réduits, maintenance facilitée, cohérence améliorée.


