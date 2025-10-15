# 🟡 08 - PROBLÈMES DE PERFORMANCE

## ⚠️ Priorité: MOYENNE

Ces problèmes peuvent impacter l'expérience utilisateur et la scalabilité.

---

## 1. 🔧 N+1 Query Problem

### 📍 Localisation
**Multiples routes API**

### ❌ Problème

Requêtes dans des boucles causant des N+1 queries :

```typescript
// ❌ BAD: N+1 queries
const applications = await prisma.application.findMany();

for (const app of applications) {
  // Query pour chaque application !
  const candidat = await prisma.candidat.findUnique({
    where: { id: app.candidatId },
  });
  
  const jobOffer = await prisma.jobOffer.findUnique({
    where: { id: app.jobOfferId },
  });
}
// Si 100 applications = 201 queries !
```

### ✅ Solution

Utiliser les includes Prisma :

```typescript
// ✅ GOOD: 1 seule query
const applications = await prisma.application.findMany({
  include: {
    candidat: {
      include: {
        user: {
          select: {
            name: true,
            email: true,
            image: true,
          },
        },
      },
    },
    jobOffer: {
      select: {
        id: true,
        title: true,
        company: true,
      },
    },
    column: true,
  },
});
// Une seule query avec joins !
```

---

## 2. 🔧 Fetching Excessif

### 📍 Localisation
**Hooks custom** (`useUser`, etc.)

### ❌ Problème

Fetch à chaque montage de composant :

```typescript
// hooks/useUser.ts
export function useUser() {
  useEffect(() => {
    fetchUser(); // ❌ Fetch à chaque fois !
  }, []);
}

// Utilisé dans 10 composants = 10 fetches !
```

### ✅ Solution

Utiliser React Query avec cache :

```typescript
// hooks/useAuth.ts
export function useAuth() {
  const { data: session } = useSession();
  
  const { data: user, isLoading } = useQuery({
    queryKey: ["user", session?.user?.id],
    queryFn: async () => {
      const res = await fetch("/api/auth/me");
      return res.json();
    },
    enabled: !!session?.user?.id,
    staleTime: 5 * 60 * 1000, // ✅ Cache 5 minutes
    cacheTime: 10 * 60 * 1000,
  });

  return { user, isLoading };
}

// Utilisé dans 10 composants = 1 seul fetch !
```

---

## 3. 🔧 Pas de Pagination

### 📍 Localisation
**Routes API de listing**

### ❌ Problème

Récupération de toutes les données :

```typescript
// ❌ Charge TOUTES les offres !
const offers = await prisma.jobOffer.findMany();
// Si 10 000 offres = problème !
```

### ✅ Solution

Implémenter la pagination :

```typescript
// app/api/offres/route.ts
export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  const page = parseInt(searchParams.get("page") || "1");
  const pageSize = parseInt(searchParams.get("pageSize") || "20");
  const skip = (page - 1) * pageSize;

  const [offers, total] = await Promise.all([
    prisma.jobOffer.findMany({
      where: { etat: "active" },
      take: pageSize,
      skip,
      orderBy: { createdAt: "desc" },
      include: {
        recruteur: {
          select: {
            name: true,
            logo: true,
          },
        },
      },
    }),
    prisma.jobOffer.count({
      where: { etat: "active" },
    }),
  ]);

  return NextResponse.json({
    data: offers,
    pagination: {
      page,
      pageSize,
      total,
      totalPages: Math.ceil(total / pageSize),
    },
  });
}
```

**Côté client avec infinite scroll** :

```typescript
// hooks/useInfiniteOffers.ts
export function useInfiniteOffers() {
  return useInfiniteQuery({
    queryKey: ["offers"],
    queryFn: async ({ pageParam = 1 }) => {
      const res = await fetch(`/api/offres?page=${pageParam}&pageSize=20`);
      return res.json();
    },
    getNextPageParam: (lastPage) => {
      const { page, totalPages } = lastPage.pagination;
      return page < totalPages ? page + 1 : undefined;
    },
  });
}
```

---

## 4. 🔧 Images Non Optimisées

### 📍 Localisation
**Composants utilisant des images**

### ❌ Problème

Utilisation de `<img>` au lieu de `next/image` :

```typescript
// ❌ BAD
<img src={user.image} alt="Avatar" />
```

### ✅ Solution

Utiliser Next.js Image :

```typescript
// ✅ GOOD
import Image from "next/image";

<Image
  src={user.image || "/default-avatar.png"}
  alt="Avatar"
  width={40}
  height={40}
  className="rounded-full"
  priority={false}
  loading="lazy"
/>
```

---

## 5. 🔧 Pas de Debouncing sur la Recherche

### 📍 Localisation
**Composants de recherche**

### ❌ Problème

Requête à chaque frappe :

```typescript
// ❌ BAD
<Input
  onChange={(e) => {
    // Requête à chaque caractère !
    searchOffers(e.target.value);
  }}
/>
```

### ✅ Solution

Implémenter le debouncing :

```typescript
// hooks/useDebounce.ts
export function useDebounce<T>(value: T, delay = 500): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

// Utilisation
const [search, setSearch] = useState("");
const debouncedSearch = useDebounce(search, 500);

useEffect(() => {
  if (debouncedSearch) {
    searchOffers(debouncedSearch);
  }
}, [debouncedSearch]);
```

---

## 6. 🔧 Requêtes Non Parallélisées

### 📍 Localisation
**Routes API et Server Actions**

### ❌ Problème

Requêtes séquentielles au lieu de parallèles :

```typescript
// ❌ BAD: 3 secondes si chaque requête prend 1s
const user = await prisma.user.findUnique({...});
const applications = await prisma.application.findMany({...});
const notifications = await prisma.notification.findMany({...});
```

### ✅ Solution

Paralléliser avec Promise.all :

```typescript
// ✅ GOOD: 1 seconde !
const [user, applications, notifications] = await Promise.all([
  prisma.user.findUnique({...}),
  prisma.application.findMany({...}),
  prisma.notification.findMany({...}),
]);
```

---

## 7. 🔧 Pas de Mise en Cache

### 📍 Localisation
**Routes API statiques ou peu changeantes**

### ❌ Problème

Aucun cache pour les données statiques :

```typescript
// ❌ Query à chaque requête
export async function GET() {
  const templates = await prisma.cVTemplate.findMany();
  return NextResponse.json(templates);
}
```

### ✅ Solution

Utiliser Next.js revalidate et Redis :

```typescript
// ✅ Cache Next.js
export const revalidate = 3600; // 1 heure

export async function GET() {
  const templates = await prisma.cVTemplate.findMany();
  return NextResponse.json(templates);
}

// ✅ Ou Redis pour cache distribué
import Redis from "ioredis";
const redis = new Redis(process.env.REDIS_URL);

export async function GET() {
  const cacheKey = "cv:templates";
  
  // Vérifier le cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    return NextResponse.json(JSON.parse(cached));
  }
  
  // Sinon, query et cache
  const templates = await prisma.cVTemplate.findMany();
  await redis.setex(cacheKey, 3600, JSON.stringify(templates));
  
  return NextResponse.json(templates);
}
```

---

## 8. 🔧 Chargement Non Optimisé des Composants

### 📍 Localisation
**Composants lourds**

### ❌ Problème

Tous les composants chargés immédiatement :

```typescript
// ❌ BAD
import { RichTextEditor } from "@/components/RichTextEditor";
import { PDFViewer } from "@/components/PDFViewer";
import { ChartDashboard } from "@/components/ChartDashboard";
```

### ✅ Solution

Utiliser dynamic import :

```typescript
// ✅ GOOD: Code splitting
import dynamic from "next/dynamic";

const RichTextEditor = dynamic(
  () => import("@/components/RichTextEditor"),
  {
    loading: () => <Skeleton className="h-64" />,
    ssr: false, // Si nécessaire
  }
);

const PDFViewer = dynamic(
  () => import("@/components/PDFViewer"),
  { loading: () => <p>Chargement...</p> }
);

const ChartDashboard = dynamic(
  () => import("@/components/ChartDashboard")
);
```

---

## 9. 🔧 Re-renders Inutiles

### 📍 Localisation
**Composants complexes**

### ❌ Problème

Composants qui re-render trop souvent :

```typescript
// ❌ BAD: Re-render à chaque changement du parent
const CandidateCard = ({ candidate, onSelect }) => {
  return (
    <div onClick={() => onSelect(candidate.id)}>
      {candidate.name}
    </div>
  );
};
```

### ✅ Solution

Utiliser React.memo et useCallback :

```typescript
// ✅ GOOD
const CandidateCard = React.memo(({ candidate, onSelect }) => {
  return (
    <div onClick={() => onSelect(candidate.id)}>
      {candidate.name}
    </div>
  );
});

// Dans le parent
const ParentComponent = () => {
  const handleSelect = useCallback((id: string) => {
    // Logic
  }, []);

  return (
    <>
      {candidates.map((c) => (
        <CandidateCard
          key={c.id}
          candidate={c}
          onSelect={handleSelect} // ✅ Référence stable
        />
      ))}
    </>
  );
};
```

---

## 10. 🔧 Pas de Lazy Loading pour les Listes

### 📍 Localisation
**Listes longues**

### ❌ Problème

Render de toutes les lignes :

```typescript
// ❌ BAD: Render 1000 candidats
{candidats.map((c) => (
  <CandidatCard key={c.id} candidat={c} />
))}
```

### ✅ Solution

Utiliser la virtualisation :

```typescript
// ✅ GOOD: Virtualisation
import { useVirtualizer } from "@tanstack/react-virtual";

const VirtualizedList = ({ items }) => {
  const parentRef = useRef<HTMLDivElement>(null);

  const virtualizer = useVirtualizer({
    count: items.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 100, // Hauteur estimée
    overscan: 5,
  });

  return (
    <div ref={parentRef} style={{ height: "600px", overflow: "auto" }}>
      <div
        style={{
          height: `${virtualizer.getTotalSize()}px`,
          position: "relative",
        }}
      >
        {virtualizer.getVirtualItems().map((virtualItem) => {
          const item = items[virtualItem.index];
          return (
            <div
              key={virtualItem.key}
              style={{
                position: "absolute",
                top: 0,
                left: 0,
                width: "100%",
                height: `${virtualItem.size}px`,
                transform: `translateY(${virtualItem.start}px)`,
              }}
            >
              <CandidatCard candidat={item} />
            </div>
          );
        })}
      </div>
    </div>
  );
};
```

---

## 📊 Résumé des Optimisations

| Problème | Impact | Gain estimé |
|----------|--------|-------------|
| N+1 Queries | 🔴 Élevé | 80-90% réduction temps de requête |
| Pas de cache | 🔴 Élevé | 70% réduction charge serveur |
| Pas de pagination | 🟠 Moyen | 60% réduction données transférées |
| Re-renders inutiles | 🟠 Moyen | 50% amélioration fluidité UI |
| Images non optimisées | 🟡 Faible | 40% réduction poids pages |

## ✅ Checklist Performance

- [ ] Éliminer les N+1 queries
- [ ] Implémenter le cache (Redis)
- [ ] Ajouter la pagination partout
- [ ] Optimiser les images avec next/image
- [ ] Debouncing sur les inputs de recherche
- [ ] Paralléliser les requêtes indépendantes
- [ ] Code splitting avec dynamic imports
- [ ] Mémoïsation des composants (React.memo)
- [ ] Virtualisation des longues listes
- [ ] Monitoring avec outils (Lighthouse, Web Vitals)

## 🔧 Outils de Monitoring

```typescript
// lib/monitoring/performance.ts
export const logPerformance = () => {
  if (typeof window !== "undefined") {
    // Web Vitals
    import("web-vitals").then(({ getCLS, getFID, getFCP, getLCP, getTTFB }) => {
      getCLS(console.log);
      getFID(console.log);
      getFCP(console.log);
      getLCP(console.log);
      getTTFB(console.log);
    });
  }
};

// Mesurer les requêtes API
export async function measureApiCall<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const start = performance.now();
  try {
    const result = await fn();
    const duration = performance.now() - start;
    console.log(`[API] ${name}: ${duration.toFixed(2)}ms`);
    return result;
  } catch (error) {
    const duration = performance.now() - start;
    console.error(`[API ERROR] ${name}: ${duration.toFixed(2)}ms`, error);
    throw error;
  }
}
```

---

**💡 Règle d'or**: Mesurer avant d'optimiser. Utiliser Chrome DevTools et Lighthouse.


