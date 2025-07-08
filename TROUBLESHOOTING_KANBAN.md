# 🔧 Dépannage Kanban - Problèmes de Synchronisation

## Problème : Notes non visibles après actualisation

### Symptômes

- ✅ Les notes sont bien créées en base de données
- ❌ Les notes ne s'affichent pas immédiatement après actualisation
- ⏱️ Il faut attendre un délai pour voir les nouvelles notes

### Causes identifiées et solutions

## 1. **Cache Redis non invalidé** ✅ CORRIGÉ

**Problème :** La route de création de notes n'invalidait pas le cache Redis.

**Solution appliquée :**

```typescript
// Dans app/api/recruteur/kanban/application/[applicationId]/route.ts
import { CACHE_KEYS, cacheUtils } from "@/lib/redis";

// Après la création de la note
const cacheKey = CACHE_KEYS.KANBAN_BOARD(authenticatedUser.recruteurId);
await cacheUtils.del(cacheKey);
console.log("Cache invalidé pour:", cacheKey);
```

## 2. **WebSocket non fonctionnel** ✅ CORRIGÉ

**Problème :** Les événements WebSocket n'étaient pas émis correctement.

**Solution appliquée :**

- ✅ Correction des noms d'événements (`join:offer` au lieu de `join:kanban`)
- ✅ Ajout des événements WebSocket dans toutes les routes API
- ✅ Configuration du serveur personnalisé avec WebSocket

## 3. **État local non synchronisé** ✅ AMÉLIORÉ

**Problème :** Le composant ne mettait pas à jour l'état local immédiatement.

**Solution appliquée :**

```typescript
// Mise à jour immédiate de l'état local
const updatedNotes = response.application.notes || [];
setSelectedCard({
  ...selectedCard,
  notes: updatedNotes,
});

// Rechargement différé pour synchronisation
setTimeout(() => {
  queryoffresbyidrefetch();
}, 500);
```

## Tests de vérification

### 1. Test WebSocket

```bash
npm run test:websocket
```

### 2. Test manuel

1. Créer une note
2. Vérifier qu'elle s'affiche immédiatement
3. Actualiser la page
4. Vérifier qu'elle est toujours visible

### 3. Vérification des logs

```bash
# Dans les logs du serveur, chercher :
"Cache invalidé pour:"
"Note ajoutée via WebSocket:"
"Client connecté:"
```

## Configuration requise

### Variables d'environnement

```env
REDIS_HOST=redis-13302.c281.us-east-1-2.ec2.redns.redis-cloud.com
REDIS_PORT=13302
REDIS_PASSWORD=UZII9yu2XTgnURGyxmluWHh2Pnx85pKy
REDIS_USERNAME=default
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### Scripts package.json

```json
{
  "scripts": {
    "dev": "node server.js",
    "test:websocket": "node test-websocket.js"
  }
}
```

## Ordre de démarrage

1. **Démarrer Redis** (si local)
2. **Démarrer le serveur :** `npm run dev`
3. **Tester WebSocket :** `npm run test:websocket`
4. **Ouvrir l'application** dans le navigateur

## Monitoring

### Logs à surveiller

- ✅ "WebSocket connecté"
- ✅ "Cache invalidé pour:"
- ✅ "Note ajoutée via WebSocket:"
- ❌ "Erreur Redis:"
- ❌ "Erreur WebSocket:"

### Métriques de performance

- Temps de réponse API : < 200ms
- Temps de synchronisation WebSocket : < 100ms
- Taille du cache Redis : < 10MB

## Problèmes courants

### 1. WebSocket ne se connecte pas

**Solution :** Vérifier que le serveur utilise `node server.js` et non `next dev`

### 2. Cache toujours présent

**Solution :** Vérifier les logs "Cache invalidé" et les clés Redis

### 3. Notes dupliquées

**Solution :** Vérifier que l'état local est correctement mis à jour

## Support

Si les problèmes persistent :

1. Vérifier les logs du serveur
2. Exécuter `npm run test:websocket`
3. Vérifier la connectivité Redis
4. Redémarrer le serveur avec `npm run dev`
