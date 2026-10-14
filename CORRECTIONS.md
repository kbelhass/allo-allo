# Corrections apportées

## Chat — messages mélangés
1. **Une seule liste de messages pour toutes les conversations** : le fil affichait tous les messages sans filtrer par conversation. → Chaque conversation a maintenant son propre fil.
2. **Identifiant de conversation non unique** (`match_<id>`) : deux membres parlant à la même personne partageaient la même conversation. → Identifiant calculé à partir des deux participants (`conv~idA~idB`), identique des deux côtés.
3. **Tous les visiteurs non connectés avaient le même identifiant** (`me_current_user`, le profil de démo « Karim »), de même que toute personne passant par la connexion SMS. Leurs messages se mélangeaient. → La messagerie demande un compte ; plus aucun identifiant partagé.
4. **Outil de test « Expéditeur : moi / elle »** qui permettait d'écrire à la place de l'autre personne : supprimé. Les messages partent toujours du compte connecté.
5. **Cache local partagé entre comptes** (`allo_allo_chat_messages_v2`) : supprimé ; cache par compte.
6. **Le serveur renvoyait n'importe quelle conversation à n'importe qui** : il vérifie maintenant que l'utilisateur fait partie de la conversation.

## Chat — suppression
- Supprimer un message **pour moi** ou **pour tout le monde** (auteur uniquement) : toucher le message.
- Supprimer une **conversation** (pour soi ; l'autre personne garde la sienne) : icône corbeille.
- Messages éphémères réellement supprimés côté serveur (avant, ils revenaient à la synchronisation suivante).
- Échec d'envoi visible, avec bouton « Réessayer ». Les aperçus de la liste montrent le vrai dernier message.

## Sécurité
- **Porte dérobée admin supprimée** : n'importe quel email contenant « admin », ou le mot de passe `admin` / `admin2026`, donnait l'accès administrateur. → Connexion admin vérifiée par le serveur (`ADMIN_EMAIL` / `ADMIN_PASSWORD`), limitée à 5 essais / 15 min.
- L'espace admin n'est plus accessible sans être administrateur (le bouton de la page de connexion y menait directement). Le compte de démo « Karim » n'est plus administrateur : tout nouveau visiteur l'était par défaut.
- **Connexion par SMS désactivée** : le code était affiché à l'écran et jamais vérifié, donc n'importe qui pouvait entrer dans le compte d'un autre avec son numéro. **Connexion « biométrique » désactivée** : elle ouvrait le dernier compte inscrit.
- Un compte sans mot de passe n'accepte plus n'importe quel mot de passe.
- Contrôles côté serveur : taille/type des médias, limite de 60 messages par minute, champs filtrés.

## Hébergement
- Render remplacé par Oracle Cloud : `Dockerfile`, `docker-compose.yml` (app + PostgreSQL + HTTPS Caddy), scripts `deploy/`, guide `DEPLOIEMENT_ORACLE.md`.
- Messages dans une vraie table PostgreSQL (avant : un seul bloc JSON réécrit à chaque message). Écriture des profils seulement en cas de changement ; synchronisation toutes les 10 s au lieu de 2,5 s.

## Reste à faire (non corrigé)
1. **Authentification réelle côté serveur** (sessions/JWT). Aujourd'hui, `/api/profiles`, `/api/accounts` et `/api/sync` renvoient à tous les clients les profils complets, **y compris email, téléphone et empreinte du mot de passe**, et la connexion se vérifie dans le navigateur. Le serveur ne peut donc pas prouver qui est l'utilisateur : la vérification « fait partie de la conversation » repose sur l'identifiant envoyé par l'appli. À corriger avant d'accueillir de vrais membres.
2. Données de démonstration dans l'appli (Nour, Kenza, « Mariem »…) présentes dans la liste de contacts de chaque membre ; matchs automatiques à chaque « like » (`isMatch = true`) ; compteur de messages non lus fixé à 1.
3. Crédits, paiements et modération vidéo : uniquement dans l'état local du navigateur (rien n'est enregistré côté serveur).
4. Les messages vocaux sont simulés (aucun enregistrement audio réel).
