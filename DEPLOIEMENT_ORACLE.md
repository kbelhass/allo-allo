# Déployer Allo-Allo sur Oracle Cloud

**Architecture** : une VM Oracle (Ubuntu) fait tourner 3 conteneurs Docker :
`caddy` (HTTPS automatique) → `app` (Allo-Allo) → `db` (PostgreSQL).
Les données (profils, messages) sont dans un volume Docker qui survit aux mises à jour.

> HTTPS est indispensable : sans lui, le navigateur bloque la caméra et le micro (appels audio/vidéo).

---

## 1. Ce qu'il vous faut
- Un compte Oracle Cloud (une carte bancaire est demandée pour vérifier l'identité).
- Un nom de domaine **ou** un sous-domaine gratuit (ex. sur duckdns.org) qui pointera vers votre serveur.
- Le dossier du projet (ce zip).

## 2. Créer la VM (console Oracle → Compute → Instances → Create instance)
- **Image** : Ubuntu 24.04 (ou 22.04).
- **Shape** : `VM.Standard.A1.Flex` (Ampere ARM). Choisissez 2 OCPU / 12 Go de RAM (ou 1 OCPU / 6 Go si la capacité manque). Toutes les images utilisées ici existent en ARM.
  - Si Oracle répond *« Out of host capacity »* : réessayez plus tard ou dans un autre domaine de disponibilité.
  - Alternative : `VM.Standard.E2.1.Micro` (1 Go de RAM). Ça fonctionne grâce au swap que le script ajoute, mais la première compilation sera lente.
- **Réseau** : cochez « Assign a public IPv4 address ».
- **Clé SSH** : téléchargez la clé privée et gardez-la précieusement (impossible de la récupérer ensuite).
- Vérifiez dans la console que la ressource porte bien le label **Always Free-eligible**. Les limites du palier gratuit ont changé récemment : vérifiez celles de votre compte.

## 3. Ouvrir les ports dans le réseau Oracle
Console → Networking → Virtual Cloud Networks → votre VCN → votre subnet → **Security List** → *Add Ingress Rules* :

| Source CIDR | Protocole | Port de destination |
|---|---|---|
| 0.0.0.0/0 | TCP | 80 |
| 0.0.0.0/0 | TCP | 443 |
| 0.0.0.0/0 | UDP | 443 |

(Le port 22 pour SSH existe déjà.) Il y a **deux** pare-feux : celui-ci (cloud) et celui de la VM, que le script de l'étape 6 règle pour vous.

## 4. IP fixe (recommandé)
Networking → *Reserved Public IPs* → créez-en une et attachez-la à votre VM, pour que l'adresse ne change jamais.

## 5. Nom de domaine
- Avec DuckDNS : créez un sous-domaine (ex. `alloallo.duckdns.org`) et mettez-y l'IP publique de la VM.
- Avec votre propre domaine : créez un enregistrement DNS de type **A** vers l'IP publique.
- Attendez quelques minutes, puis vérifiez que `ping votre-domaine` répond avec la bonne IP.

## 6. Envoyer le projet et préparer la VM
Depuis votre ordinateur (remplacez les valeurs) :
```bash
scp -i ma-cle.key alloallo-oracle.zip ubuntu@IP_PUBLIQUE:~
ssh -i ma-cle.key ubuntu@IP_PUBLIQUE
```
Sur la VM :
```bash
sudo apt-get install -y unzip
unzip alloallo-oracle.zip -d alloallo && cd alloallo
bash deploy/oracle-setup.sh
```
Puis **déconnectez-vous et reconnectez-vous** en SSH (pour activer Docker sans `sudo`).

## 7. Configuration
```bash
cd ~/alloallo
cp .env.example .env
nano .env
```
- `DOMAIN` : votre domaine, ex. `alloallo.duckdns.org`
- `POSTGRES_PASSWORD` : générez-le avec `openssl rand -hex 24` (lettres et chiffres uniquement)
- `ADMIN_EMAIL` / `ADMIN_PASSWORD` : vos identifiants administrateur (choisissez un vrai mot de passe long)

## 8. Lancer
```bash
docker compose up -d --build
docker compose ps            # les 3 services doivent être "running" / "healthy"
docker compose logs -f app   # Ctrl+C pour quitter les logs
```
La première compilation prend quelques minutes. Ouvrez ensuite `https://votre-domaine`.
Le certificat HTTPS est obtenu automatiquement au premier accès (comptez une minute).

**Connexion administrateur** : sur la page de connexion, entrez `ADMIN_EMAIL` et `ADMIN_PASSWORD` (le serveur les vérifie ; l'ancien accès par mot de passe « admin » n'existe plus).

## 9. Reprendre les données de l'ancien hébergement (optionnel)
Si votre ancienne base PostgreSQL (par exemple Neon, via l'ancien `DATABASE_URL`) contient des profils/comptes à garder, faites-le **avant d'ouvrir le site au public** :
```bash
docker compose up -d db
docker compose exec -T db psql -U alloallo alloallo -c "CREATE TABLE IF NOT EXISTS app_state (key TEXT PRIMARY KEY, value JSONB NOT NULL)"
pg_dump --data-only --table=app_state "ANCIEN_DATABASE_URL" | docker compose exec -T db psql -U alloallo alloallo
docker compose up -d --build
```
(`pg_dump` s'installe avec `sudo apt-get install -y postgresql-client`. Si la version du serveur Neon est plus récente que celle du client, installez la version correspondante.)
Les anciens **messages** ne sont pas repris : ils étaient mélangés entre les membres et inutilisables.

## 10. Sauvegardes (important)
Une VM gratuite peut être arrêtée ou supprimée par Oracle (voir plus bas) : ne comptez jamais sur elle seule.
```bash
chmod +x deploy/backup.sh && ./deploy/backup.sh     # test manuel
crontab -e
# ajoutez cette ligne (sauvegarde chaque nuit à 3h) :
0 3 * * * /home/ubuntu/alloallo/deploy/backup.sh >> /home/ubuntu/alloallo/backups/backup.log 2>&1
```
Copiez régulièrement le dossier `backups/` **hors du serveur** (ex. depuis votre PC : `scp -i ma-cle.key ubuntu@IP:~/alloallo/backups/*.gz .`).

Restauration sur une base vide :
```bash
docker compose down
docker volume rm alloallo_pgdata
docker compose up -d db
gunzip -c backups/alloallo_XXXX.sql.gz | docker compose exec -T db psql -U alloallo alloallo
docker compose up -d
```

## 11. Mettre à jour l'application
Remplacez les fichiers du projet sur la VM (sans toucher à `.env`), puis :
```bash
docker compose up -d --build
```

## 12. Dépannage
| Symptôme | Piste |
|---|---|
| Le site ne répond pas | Ports 80/443 ouverts dans la Security List **et** script `oracle-setup.sh` exécuté ? |
| Erreur de certificat | Le domaine pointe-t-il bien vers l'IP de la VM ? `docker compose logs caddy` |
| Erreur 502 | `docker compose logs app` (base de données non prête, variable manquante…) |
| `permission denied` sur docker | Vous ne vous êtes pas reconnecté en SSH après l'étape 6 |
| Compilation qui plante (VM 1 Go) | Vérifiez le swap : `free -h` |
| Connexion admin refusée | `ADMIN_EMAIL`/`ADMIN_PASSWORD` renseignés dans `.env` ? Puis `docker compose up -d` |

## 13. À savoir sur l'offre gratuite d'Oracle
- Oracle peut **récupérer les instances Always Free jugées inactives** (selon sa documentation : utilisation CPU très faible sur 7 jours). Une petite app peut y être exposée : surveillez l'instance et gardez des sauvegardes hors serveur. Vérifiez dans la documentation Oracle si passer en compte « Pay As You Go » (qui reste gratuit dans les limites Always Free) change cette règle pour vous.
- Les quotas du palier gratuit ARM ont été revus à la baisse en 2026 : la configuration proposée (2 OCPU / 12 Go) reste dans les limites annoncées, mais contrôlez celles de votre compte.
