# Guide de Dépannage - Kanban Board Drag & Drop

## Problème : Les changements ne persistent pas après actualisation

### Symptômes

- Le drag and drop fonctionne visuellement
- L'API retourne un statut 200
- Après actualisation, les cartes reviennent à leur position d'origine

### Causes Possibles

#### 1. Problème de Cache

**Symptôme :** Les données sont mises en cache et ne se rafraîchissent pas

**Solution :**

```bash
# Vérifier que Redis fonctionne
node diagnostic-kanban.js

# Vider le cache manuellement
redis-cli FLUSHALL
```

#### 2. Problème de Base de Données

**Symptôme :** L'API retourne 200 mais la base de données n'est pas mise à jour

**Vérification :**

```sql
-- Vérifier que l'application a bien été déplacée
SELECT id, columnId FROM Application WHERE id = 'your-application-id';
```

#### 3. Problème d'Authentification

**Symptôme :** L'utilisateur n'a pas les droits pour modifier l'application

**Vérification :**

- Vérifier que le token JWT est valide
- Vérifier que l'utilisateur est bien le recruteur de l'offre

#### 4. Problème WebSocket

**Symptôme :** Les mises à jour en temps réel ne fonctionnent pas

**Vérification :**

```javascript
// Dans la console du navigateur
console.log("WebSocket connected:", socket?.connected);
```

### Étapes de Diagnostic

#### Étape 1 : Vérifier les Logs

```bash
# Démarrer le serveur en mode debug
NODE_ENV=development DEBUG=* npm run dev
```

#### Étape 2 : Tester l'API Manuellement

```bash
# Utiliser le script de test
node test-move-application.js
```

#### Étape 3 : Vérifier la Base de Données

```bash
# Se connecter à la base de données
npx prisma studio
```

#### Étape 4 : Vérifier Redis

```bash
# Se connecter à Redis
redis-cli
> KEYS *
> GET "kanban:board:your-offer-id"
```

### Solutions

#### Solution 1 : Forcer le Rafraîchissement

```javascript
// Dans le composant KanbanBoard
const onDragEnd = async (result: DropResult) => {
  // ... code existant ...

  try {
    const response = await postData(
      moveData,
      "/api/recruteur/kanban/move-application"
    );

    if (response.success) {
      // Forcer le rafraîchissement des données
      await queryoffresbyidrefetch();
    }
  } catch (error) {
    console.error("Erreur:", error);
  }
};
```

#### Solution 2 : Améliorer la Gestion d'Erreur

```javascript
// Dans l'API move-application
export async function POST(req: NextRequest) {
  try {
    // ... code existant ...

    // Log pour debug
    console.log("Application déplacée:", {
      applicationId,
      newColumnId,
      success: true,
    });

    return NextResponse.json({
      success: true,
      application: updatedApplication,
    });
  } catch (error) {
    console.error("Erreur déplacement:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
```

#### Solution 3 : Vérifier les Permissions

```javascript
// Dans l'API move-application
const authenticatedUser = await getAuthenticatedUser(req);
if (!authenticatedUser || authenticatedUser.type !== "RECRUTEUR") {
  return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
}

// Vérifier que l'application appartient au recruteur
const application = await prisma.application.findFirst({
  where: {
    id: applicationId,
    jobOffer: {
      recruteurId: authenticatedUser.recruteurId,
    },
  },
});
```

### Prévention

#### 1. Monitoring

```javascript
// Ajouter des logs de monitoring
console.log("Drag & Drop Event:", {
  applicationId,
  fromColumn: sourceColumnId,
  toColumn: newColumnId,
  timestamp: new Date().toISOString(),
});
```

#### 2. Validation

```javascript
// Valider les données avant mise à jour
if (!applicationId || !newColumnId) {
  return NextResponse.json({ error: "Données manquantes" }, { status: 400 });
}
```

#### 3. Tests Automatisés

```bash
# Créer des tests unitaires
npm test -- --testNamePattern="move-application"
```

### Commandes Utiles

```bash
# Redémarrer le serveur
npm run dev

# Vérifier les variables d'environnement
node -e "console.log(process.env.DATABASE_URL)"

# Tester Redis
redis-cli ping

# Vérifier les logs
tail -f logs/app.log
```

### Support

Si le problème persiste :

1. Vérifier les logs du serveur
2. Tester avec le script de diagnostic
3. Vérifier la configuration de la base de données
4. Contacter l'équipe de développement
