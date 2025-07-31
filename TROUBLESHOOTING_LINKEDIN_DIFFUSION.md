# Guide de dépannage - Diffusion LinkedIn

## Problème : Erreur 400 lors de la diffusion LinkedIn

### 1. Vérification de la configuration

#### Variables d'environnement requises
Assurez-vous que ces variables sont définies dans votre fichier `.env.local` :

```env
# LinkedIn Integration
LINKEDIN_CLIENT_ID="your-linkedin-client-id"
LINKEDIN_CLIENT_SECRET="your-linkedin-client-secret"
LINKEDIN_ACCESS_TOKEN="your-linkedin-access-token"
LINKEDIN_PERSON_URN="urn:li:person:your-person-id"
```

#### Comment obtenir les credentials LinkedIn

1. **Créer une application LinkedIn** :
   - Allez sur [LinkedIn Developers](https://www.linkedin.com/developers/)
   - Créez une nouvelle application
   - Notez le `Client ID` et `Client Secret`

2. **Obtenir un Access Token** :
   - Dans votre application LinkedIn, allez dans "Auth"
   - Configurez les URLs de redirection
   - Utilisez l'URL d'autorisation pour obtenir un code
   - Échangez le code contre un access token

3. **Obtenir votre Person URN** :
   - Utilisez l'API LinkedIn pour récupérer votre profil
   - L'URN sera au format : `urn:li:person:xxxxxxxx`

### 2. Test de configuration

Utilisez le bouton "Test Config" dans l'interface pour vérifier :
- La présence des variables d'environnement
- L'authentification utilisateur
- L'accès aux offres d'emploi

### 3. Problèmes courants

#### Erreur 400 - Configuration manquante
**Symptôme** : `Configuration LinkedIn manquante`
**Solution** : Vérifiez que `LINKEDIN_ACCESS_TOKEN` est défini

#### Erreur 401 - Token invalide
**Symptôme** : `Non autorisé`
**Solution** : 
- Vérifiez que vous êtes connecté en tant que recruteur
- Vérifiez que le token JWT est valide

#### Erreur 404 - Offre non trouvée
**Symptôme** : `Offre non trouvée ou non autorisée`
**Solution** :
- Vérifiez que l'offre existe
- Vérifiez que vous êtes le propriétaire de l'offre

#### Erreur LinkedIn API
**Symptôme** : Erreur de l'API LinkedIn
**Solutions possibles** :
- Token LinkedIn expiré (renouvelez-le)
- Permissions insuffisantes (vérifiez les scopes)
- Person URN incorrect
- Contenu trop long (LinkedIn limite à 3000 caractères)

### 4. Debugging

#### Logs côté serveur
Vérifiez les logs du serveur pour voir :
- Les données reçues
- La configuration LinkedIn
- Les erreurs de l'API LinkedIn

#### Console navigateur
Ouvrez la console du navigateur pour voir :
- Les requêtes envoyées
- Les réponses reçues
- Les erreurs JavaScript

### 5. Solutions temporaires

Si la diffusion LinkedIn ne fonctionne pas :

1. **Utilisez les autres plateformes** (Indeed, APEC, etc.)
2. **Copiez le lien généré** et publiez manuellement
3. **Utilisez l'aperçu LinkedIn** pour créer le contenu

### 6. Support

Si le problème persiste :
1. Vérifiez les logs du serveur
2. Testez avec une offre simple
3. Vérifiez la documentation LinkedIn API
4. Contactez le support technique

## Commandes utiles

```bash
# Vérifier les variables d'environnement
echo $LINKEDIN_ACCESS_TOKEN

# Redémarrer le serveur de développement
npm run dev

# Vérifier les logs
tail -f logs/app.log
``` 