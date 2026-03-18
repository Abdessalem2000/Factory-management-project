# 🖥️ Commandes Supabase Terminal

## 📋 **Commandes à exécuter dans l'ordre :**

### **1. Lier le projet**
```bash
supabase link --project-ref cejduleutqjmtlsmzbrg
```
- Cette commande lie votre projet local au projet Supabase
- Vérifie que le projet existe et est accessible
- Configure les clés API automatiquement

### **2. Créer une nouvelle migration**
```bash
supabase migration new new-migration
```
- Crée un nouveau fichier de migration
- Prépare le schéma pour être appliqué
- Nomme la migration "new-migration"

### **3. Appliquer toutes les migrations**
```bash
supabase db push
```
- Applique le schéma Prisma à la base de données
- Crée toutes les tables (workers, suppliers, etc.)
- Configure les relations et contraintes

## 🎯 **Après ces commandes :**

### **4. Insérer les données algériennes**
```bash
# Dans votre terminal backend
npx prisma db seed
```

### **5. Tester la connexion**
```bash
node test-db-connection.js
```

## 📊 **Résultat attendu :**

Après la commande `supabase db push`, vous devriez voir :
```
✅ Linked to project cejduleutqjmtlsmzbrg
✅ Created migration: new-migration
✅ Database schema pushed successfully
📋 Created tables: workers, suppliers, raw_materials, etc.
```

## 🔍 **Vérification :**

### **Tester l'API avec vraie base de données :**
1. Arrêter le serveur mock : `Ctrl+C`
2. Démarrer le serveur Prisma : `npm run dev:simple`
3. Tester : `curl http://localhost:3000/api/db-test`

### **Tester avec le frontend :**
1. Allez sur : `http://localhost:5174`
2. Page "Worker Management"
3. Formulaire "Add Worker"
4. Soumettre avec données algériennes

## ⚠️ **Points importants :**

1. **Exécutez dans l'ordre** : link → migration → push
2. **Attendez chaque commande** avant de passer à la suivante
3. **Vérifiez les erreurs** à chaque étape
4. **Les clés API** seront configurées automatiquement

## 🚀 **Si tout fonctionne :**

- ✅ **Base de données** : Connectée et accessible
- ✅ **Tables créées** : Workers, Suppliers, etc.
- ✅ **API fonctionnelle** : Avec vraie base de données
- ✅ **Frontend prêt** : Formulaires connectés à Supabase

---

**Exécutez ces commandes une par une et dites-moi les résultats !** 🎯
