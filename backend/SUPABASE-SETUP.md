# 🗄️ Supabase Migration Guide

## 📋 Étapes de configuration

### 1. Créer un projet Supabase
1. Allez sur [https://supabase.com](https://supabase.com)
2. Créez un compte ou connectez-vous
3. Cliquez sur "New Project"
4. Choisissez une organisation ou créez-en une
5. Nommez votre projet : `factory-management-db`
6. Choisissez la région la plus proche (ex: `eu-west-1`)
7. Créez un mot de passe fort pour la base de données
8. Cliquez sur "Create new project"

### 2. Obtenir les informations de connexion
Une fois le projet créé :
1. Allez dans `Settings` > `Database`
2. Copiez la `Connection string` (format PostgreSQL)
3. Elle ressemblera à : 
```
postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres
```

### 3. Configurer les variables d'environnement
Dans votre fichier `.env` :
```env
# Supabase Database URL
DATABASE_URL="postgresql://postgres:[YOUR-PASSWORD]@db.[PROJECT-REF].supabase.co:5432/postgres"

# Supabase Service Role Key (pour le backend)
SUPABASE_SERVICE_KEY="[YOUR-SERVICE-ROLE-KEY]"

# Supabase Anon Key (pour le frontend)
SUPABASE_ANON_KEY="[YOUR-ANON-KEY]"
```

### 4. Installer Prisma
```bash
npm install prisma @prisma/client
npm install -D prisma
```

### 5. Initialiser Prisma
```bash
npx prisma init
```

### 6. Mettre à jour le schéma Prisma
Le schéma est déjà défini dans `prisma/schema.prisma`

### 7. Générer le client Prisma
```bash
npx prisma generate
```

### 8. Pousser le schéma vers Supabase
```bash
npx prisma db push
```

### 9. (Optionnel) Créer des données de test
```bash
npx prisma db seed
```

## 🔗 Variables Supabase à trouver

Dans votre dashboard Supabase :
1. **Project URL** : `https://[PROJECT-REF].supabase.co`
2. **Database URL** : Dans Settings > Database
3. **Service Role Key** : Dans Settings > API
4. **Anon Key** : Dans Settings > API

## 🚀 Après configuration

Une fois configuré, vous pourrez :
- Utiliser Prisma Client avec TypeScript complet
- Bénéficier de l'autocomplétion SQL
- Avoir des requêtes sécurisées et typées
- Utiliser le tableau de bord Supabase pour voir vos données

## 📝 Prochaines étapes

1. Configurer Supabase (étapes ci-dessus)
2. Installer Prisma dans le projet
3. Mettre à jour les endpoints API pour utiliser Prisma
4. Tester les opérations CRUD
5. Déployer sur Render avec la nouvelle base de données
