---
title: Politique de Confidentialité — Tempo Subs
meta:
  - name: description
    content: Politique de confidentialité de l'application Tempo Subs — collecte de données, sous-traitants, droits RGPD.
  - name: robots
    content: index, follow
---

# Politique de Confidentialité — Tempo Subs

_Dernière mise à jour : 17 mai 2026_

## 1. Qui est responsable du traitement ?

Antoine Pollet, auto-entrepreneur immatriculé en France.
Saint-Leu-la-Forêt (Val-d'Oise), France.
Contact : pollet.antoine.alexis@gmail.com

Une migration vers une SASU est planifiée pour fin 2026. Le responsable du traitement sera alors actualisé dans la présente politique.

## 2. Qu'est-ce que Tempo Subs ?

Tempo Subs (ci-après « Tempo ») est une application mobile (iOS, Android) qui aide les utilisateurs à suivre leurs abonnements récurrents (services en ligne, factures, dépenses fixes, etc.) et à recevoir des notifications push avant chaque échéance.

L'application fonctionne en mode **local-first** : la quasi-totalité de tes données reste stockée localement sur ton appareil (IndexedDB / localStorage). Seules les données strictement nécessaires à l'envoi des notifications push sont synchronisées avec nos serveurs.

## 3. Quelles données collectons-nous ?

### Identifiants anonymes

- **user_id** : identifiant unique aléatoire (UUID v4) généré localement sur ton appareil. Aucune information personnelle directe (nom, email, téléphone, adresse) n'y est associée.
- **device_id** : identifiant unique aléatoire (UUID v4) propre à chaque appareil installé.
- **user_secret** : jeton d'authentification généré côté serveur lors du premier enregistrement, stocké de manière sécurisée sur ton appareil.

### Données techniques nécessaires à la livraison des notifications

- **Token FCM (Firebase Cloud Messaging)** : jeton fourni par Google permettant d'adresser une notification push à ton appareil.
- **Plateforme** : iOS ou Android.
- **Fuseau horaire** : afin d'envoyer les notifications à une heure adaptée à ton emplacement.
- **Version de l'application** (optionnel).

### Données fonctionnelles (miroir minimal des abonnements à notifier)

Pour chaque abonnement dont tu actives les rappels :

- Nom de l'abonnement (ex. « Netflix »)
- Date de prochaine échéance
- Montant (optionnel)
- Devise (optionnel)
- Nombre de jours d'avance pour la notification

**Important** : nous ne collectons **aucune** donnée sur ton compte bancaire, tes moyens de paiement, ton historique de transactions, ta géolocalisation précise, tes contacts, ni aucune donnée biométrique.

## 4. Pourquoi collectons-nous ces données ?

Finalité unique : t'envoyer les notifications push de rappel d'échéance que tu nous as expressément demandées.

**Base légale (RGPD art. 6.1.b)** : exécution d'un contrat — tu nous demandes explicitement de t'envoyer ces notifications, et ce service ne peut pas fonctionner sans ces données.

Tu peux à tout moment révoquer cette autorisation en :

- refusant les permissions de notification au niveau du système (Réglages iOS / Android),
- désinstallant l'application,
- demandant l'effacement de tes données via l'email indiqué en section 7.

## 5. Avec qui partageons-nous ces données ?

Nous faisons appel aux sous-traitants suivants, strictement nécessaires au fonctionnement du service :

### Google LLC — Firebase Cloud Messaging (FCM)

- **Finalité** : routage des notifications push vers ton appareil.
- **Données transmises** : token FCM, contenu de la notification (nom de l'abonnement, date d'échéance).
- **Localisation** : États-Unis. Le transfert hors UE est encadré par les Clauses Contractuelles Types (CCT) de la Commission européenne et la décision d'adéquation EU-US Data Privacy Framework.
- **Politique** : [firebase.google.com/support/privacy](https://firebase.google.com/support/privacy)

### Cloudflare, Inc. — Workers + D1 (hébergement backend)

- **Finalité** : héberger l'API et la base de données nécessaires à l'envoi des notifications.
- **Données stockées** : user_id, device_id, user_secret, token FCM, miroir d'abonnements.
- **Localisation** : infrastructure mondiale ; le traitement peut avoir lieu dans des centres de données situés dans l'UE ou hors UE selon le edge le plus proche. Tout transfert hors UE est encadré par CCT.
- **Politique** : [cloudflare.com/privacypolicy](https://www.cloudflare.com/privacypolicy/)

### Apple Inc. (iOS uniquement) — Apple Push Notification service (APNs)

- **Finalité** : livraison finale de la notification sur ton appareil iOS. Google FCM transmet à APNs en amont.
- **Données transmises** : payload de notification, token APNs (géré par Apple).
- **Politique** : [apple.com/legal/privacy](https://www.apple.com/legal/privacy/)

Aucune donnée n'est vendue, échangée, louée, ni transmise à des fins publicitaires ou marketing.

## 6. Combien de temps conservons-nous tes données ?

- Tant que l'application reste installée sur ton appareil et que tu utilises les notifications.
- Si tu désinstalles l'application, Google FCM nous indique que le token n'est plus valide (« UNREGISTERED ») au prochain envoi : nous supprimons alors automatiquement la ligne correspondante dans notre base.
- Si tu n'utilises plus l'application pendant plus de 12 mois consécutifs sans qu'elle soit désinstallée, nous purgeons proactivement tes données.
- Les éléments du miroir d'abonnements sont mis à jour à chaque synchronisation et écrasent les versions précédentes.

## 7. Tes droits

Conformément au RGPD, tu disposes des droits suivants :

- **Accès** : obtenir confirmation que des données te concernant sont traitées, et en recevoir copie.
- **Rectification** : corriger toute donnée inexacte ou incomplète.
- **Effacement** : demander la suppression de tes données (« droit à l'oubli »).
- **Opposition** : t'opposer au traitement.
- **Portabilité** : recevoir tes données dans un format structuré et couramment utilisé.
- **Limitation** : restreindre temporairement le traitement.

Tu peux exercer ces droits en écrivant à **pollet.antoine.alexis@gmail.com**. Nous te répondrons sous 30 jours maximum.

Tu disposes également du droit d'introduire une réclamation auprès de la Commission Nationale de l'Informatique et des Libertés (CNIL) — [cnil.fr/fr/plaintes](https://www.cnil.fr/fr/plaintes).

## 8. Sécurité

- Les communications entre l'application et nos serveurs sont chiffrées en HTTPS (TLS 1.3).
- L'authentification utilise un jeton secret généré côté serveur (Bearer token) propre à chaque utilisateur.
- La base de données est hébergée chez Cloudflare D1 avec chiffrement au repos.

## 9. Données des mineurs

Tempo n'est pas destiné aux mineurs de moins de 13 ans. Nous ne collectons pas sciemment de données concernant des enfants. Si tu penses qu'un mineur a transmis des données, contacte-nous pour suppression immédiate.

## 10. Modifications

Toute modification substantielle de la présente politique sera notifiée via l'application ou par la mise à jour de la date en tête de document. La version applicable est toujours celle accessible à l'URL [tempo.polletantoine.com/privacy](https://tempo.polletantoine.com/privacy).

## 11. Loi applicable

La présente politique est régie par le droit français. Tout litige relève de la compétence exclusive des tribunaux français.
