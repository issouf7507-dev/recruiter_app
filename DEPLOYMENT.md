# Guide de Déploiement - YLSIX (VPS)

## Variables d'Environnement Requises

Avant de déployer, assurez-vous que toutes les variables d'environnement suivantes sont configurées :

### Variables Obligatoires

```bash
# JWT Secrets
JWT_SECRET=votre-secret-jwt-recruiter-super-securise
JWT_SECRET_CANDIDAT=votre-secret-jwt-candidate-super-securise

# Base de données
DATABASE_URL=postgresql://user:password@localhost:5432/dbname

# Redis (pour les WebSockets et le cache)
REDIS_URL=redis://localhost:6379

# Configuration Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app
```

### Variables Optionnelles

```bash
# URL de l'application
NEXT_PUBLIC_APP_URL=https://ylsix.com
APP_URL=https://ylsix.com

# Environnement
NODE_ENV=production
```

## Étapes de Déploiement sur VPS

### 1. Préparation du Serveur

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Installer Node.js (version 18+)
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Installer PM2 pour la gestion des processus
sudo npm install -g pm2

# Installer PostgreSQL
sudo apt install postgresql postgresql-contrib -y

# Installer Redis
sudo apt install redis-server -y
```

### 2. Configuration de la Base de Données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données et l'utilisateur
CREATE DATABASE ylsix_db;
CREATE USER ylsix_user WITH PASSWORD 'votre_mot_de_passe';
GRANT ALL PRIVILEGES ON DATABASE ylsix_db TO ylsix_user;
\q
```

### 3. Configuration de l'Application

```bash
# Cloner le projet
git clone votre-repo.git
cd recruter

# Installer les dépendances
npm install

# Créer le fichier .env
cp .env.example .env
nano .env
```

### 4. Configuration des Variables d'Environnement

Éditez le fichier `.env` :

```bash
# JWT Secrets
JWT_SECRET=votre-secret-jwt-recruiter-super-securise
JWT_SECRET_CANDIDAT=votre-secret-jwt-candidate-super-securise

# Base de données
DATABASE_URL=postgresql://ylsix_user:votre_mot_de_passe@localhost:5432/ylsix_db

# Redis
REDIS_URL=redis://localhost:6379

# Email
EMAIL_HOST=smtp.gmail.com
EMAIL_PORT=587
EMAIL_USER=votre-email@gmail.com
EMAIL_PASS=votre-mot-de-passe-app

# Application
NEXT_PUBLIC_APP_URL=https://ylsix.com
APP_URL=https://ylsix.com
NODE_ENV=production
```

### 5. Vérification et Build

```bash
# Vérifier les variables d'environnement
npm run check-env

# Appliquer les migrations de base de données
npx prisma migrate deploy

# Build de l'application
npm run build
```

### 6. Configuration de PM2

Créer un fichier `ecosystem.config.js` :

```javascript
module.exports = {
  apps: [
    {
      name: "ylsix",
      script: "npm",
      args: "start",
      cwd: "/chemin/vers/votre/projet",
      env: {
        NODE_ENV: "production",
        PORT: 3000,
      },
      instances: 1,
      autorestart: true,
      watch: false,
      max_memory_restart: "1G",
      error_file: "./logs/err.log",
      out_file: "./logs/out.log",
      log_file: "./logs/combined.log",
      time: true,
    },
  ],
};
```

### 7. Démarrage de l'Application

```bash
# Créer les dossiers de logs
mkdir logs

# Démarrer avec PM2
pm2 start ecosystem.config.js

# Sauvegarder la configuration PM2
pm2 save

# Configurer le démarrage automatique
pm2 startup
```

### 8. Configuration Nginx (Recommandé)

```bash
# Installer Nginx
sudo apt install nginx -y

# Créer la configuration
sudo nano /etc/nginx/sites-available/ylsix
```

Configuration Nginx :

```nginx
server {
    listen 80;
    server_name ylsix.com www.ylsix.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

```bash
# Activer le site
sudo ln -s /etc/nginx/sites-available/ylsix /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl restart nginx
```

### 9. Configuration SSL avec Let's Encrypt

```bash
# Installer Certbot
sudo apt install certbot python3-certbot-nginx -y

# Obtenir le certificat SSL
sudo certbot --nginx -d ylsix.com -d www.ylsix.com

# Configurer le renouvellement automatique
sudo crontab -e
# Ajouter : 0 12 * * * /usr/bin/certbot renew --quiet
```

## Résolution des Erreurs Courantes

### Erreur "Application error: a client-side exception has occurred"

**Causes possibles :**

1. Variables d'environnement manquantes
2. Problème de connexion à la base de données
3. Erreur dans le code client

**Solutions :**

1. **Vérifier les variables d'environnement :**

   ```bash
   npm run check-env
   ```

2. **Vérifier les logs :**

   ```bash
   # Logs PM2
   pm2 logs ylsix

   # Logs Nginx
   sudo tail -f /var/log/nginx/error.log
   ```

3. **Tester la connexion à la base de données :**

   ```bash
   npx prisma db push
   ```

4. **Redémarrer l'application :**
   ```bash
   pm2 restart ylsix
   ```

### Erreur d'Authentification

**Causes possibles :**

1. `JWT_SECRET` ou `JWT_SECRET_CANDIDAT` manquants
2. Tokens expirés ou invalides

**Solutions :**

1. Vérifier que les secrets JWT sont configurés
2. Vider le cache du navigateur
3. Se reconnecter

### Erreur de Base de Données

**Causes possibles :**

1. `DATABASE_URL` incorrecte
2. Base de données non accessible
3. Migrations non appliquées

**Solutions :**

1. Vérifier l'URL de la base de données
2. Appliquer les migrations :
   ```bash
   npx prisma migrate deploy
   ```

## Monitoring et Maintenance

### 1. Surveillance des Logs

```bash
# Logs en temps réel
pm2 logs ylsix --lines 100

# Statut des processus
pm2 status

# Utilisation des ressources
pm2 monit
```

### 2. Sauvegarde de la Base de Données

```bash
# Créer un script de sauvegarde
nano backup.sh
```

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
pg_dump ylsix_db > backup_$DATE.sql
gzip backup_$DATE.sql
```

### 3. Mise à Jour de l'Application

```bash
# Arrêter l'application
pm2 stop ylsix

# Pull les dernières modifications
git pull origin main

# Installer les nouvelles dépendances
npm install

# Appliquer les migrations
npx prisma migrate deploy

# Build
npm run build

# Redémarrer
pm2 start ylsix
```

## Sécurité

### 1. Firewall

```bash
# Configurer UFW
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Mise à Jour Régulière

```bash
# Mettre à jour le système
sudo apt update && sudo apt upgrade -y

# Mettre à jour Node.js si nécessaire
```

### 3. Monitoring de Sécurité

- Surveiller les logs d'accès
- Configurer des alertes pour les tentatives d'intrusion
- Maintenir les certificats SSL à jour

## Support

En cas de problème :

1. Vérifiez les logs : `pm2 logs ylsix`
2. Consultez la console du navigateur
3. Testez avec `npm run check-env`
4. Vérifiez la connectivité de la base de données
5. Contactez le support technique
