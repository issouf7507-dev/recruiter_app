# 🔧 Corrections WebSocket - Guide de Dépannage

## Problèmes identifiés et corrigés

### 1. **Incohérence dans les noms d'événements**

**Problème :** Le client utilisait `"join:kanban"` mais le serveur attendait `"join:offer"`

**Correction :**

- ✅ Modifié `KanbanBoard.tsx` pour utiliser `"join:offer"` et `"leave:offer"`
- ✅ Uniformisé les noms d'événements entre client et serveur

### 2. **Configuration du serveur personnalisé**

**Problème :** Next.js n'utilisait pas le serveur personnalisé avec WebSocket

**Correction :**

- ✅ Modifié `package.json` pour utiliser `node server.js` au lieu de `next dev`
- ✅ Le serveur personnalisé configure automatiquement WebSocket

### 3. **Événements WebSocket dans les routes API**

**Problème :** Les routes API n'émettaient pas d'événements WebSocket

**Correction :**

- ✅ Ajouté `kanbanEvents.noteAdded()` dans la route de création de notes
- ✅ Ajouté `kanbanEvents.noteUpdated()` dans la route de modification de notes
- ✅ Ajouté `kanbanEvents.applicationMoved()` dans la route de déplacement

## Configuration actuelle

### Serveur WebSocket (`server.js`)

```javascript
const { configureSocket } = require("./lib/socket");

// Configurer WebSocket sur le serveur HTTP
configureSocket(server);
```

### Routes API avec événements

```javascript
// Route de création de notes
await kanbanEvents.noteAdded(applicationId, note, offerId);

// Route de modification de notes
await kanbanEvents.noteUpdated(applicationId, note, offerId);

// Route de déplacement d'application
await kanbanEvents.applicationMoved(
  applicationId,
  newColumnId,
  offerId,
  application
);
```

### Client WebSocket (`useWebSocket.ts`)

```javascript
// Rejoindre une room
socket.emit("join:offer", offerId);

// Écouter les événements
socket.on("note:added", handleNoteAdded);
socket.on("application:moved", handleApplicationMoved);
```

## Test de la configuration

### 1. Démarrer le serveur

```bash
npm run dev
```

### 2. Tester les WebSockets

```bash
npm run test:websocket
```

### 3. Vérifier les logs

- Console du serveur : Connexions WebSocket
- Console du navigateur : Événements reçus

## Fonctionnalités corrigées

### ✅ Notes en temps réel

- Création de notes → Événement `note:added`
- Modification de notes → Événement `note:updated`
- Synchronisation immédiate entre utilisateurs

### ✅ Drag & Drop en temps réel

- Déplacement d'application → Événement `application:moved`
- Mise à jour immédiate de l'interface
- Persistance en base de données

### ✅ Cache Redis

- Invalidation automatique du cache
- Synchronisation des données
- Performance optimisée

## Dépannage

### Problème : Les événements ne sont pas reçus

1. **Vérifier la connexion WebSocket**

```javascript
// Dans la console du navigateur
console.log("WebSocket connected:", socket?.connected);
```

2. **Vérifier les logs du serveur**

```bash
# Regarder les logs de connexion
npm run dev
```

3. **Tester manuellement**

```bash
npm run test:websocket
```

### Problème : Les données ne persistent pas

1. **Vérifier les logs d'API**

```bash
# Regarder les logs des routes API
npm run dev
```

2. **Vérifier la base de données**

```bash
# Utiliser Prisma Studio
npx prisma studio
```

3. **Vérifier Redis**

```bash
# Se connecter à Redis
redis-cli
> KEYS "kanban:*"
```

### Problème : Performance lente

1. **Vérifier le cache Redis**

```bash
redis-cli
> INFO memory
```

2. **Vider le cache si nécessaire**

```bash
redis-cli
> FLUSHALL
```

## Variables d'environnement requises

```env
# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
REDIS_PASSWORD=
REDIS_USERNAME=

# WebSocket
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Architecture finale

```
Client (React)
    ↓ WebSocket
Serveur (Node.js + Socket.IO)
    ↓ Redis Pub/Sub
Base de données (PostgreSQL)
    ↓ Cache
Redis
```

## Avantages de la correction

- ⚡ **Temps réel** : Mises à jour instantanées
- 🔄 **Synchronisation** : Tous les utilisateurs voient les changements
- 💾 **Persistance** : Données sauvegardées en base
- 🚀 **Performance** : Cache Redis pour les requêtes fréquentes
- 🛡️ **Fiabilité** : Gestion d'erreurs et rollback automatique

## Prochaines étapes

1. **Tester en production** avec Redis Cloud
2. **Monitorer les performances** avec des métriques
3. **Ajouter des notifications** push pour les événements importants
4. **Optimiser le cache** avec des stratégies d'expiration
