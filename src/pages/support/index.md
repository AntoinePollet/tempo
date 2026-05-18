---
title: Support — Tempo Subs
meta:
  - name: description
    content: Aide, FAQ et contact pour l'application Tempo Subs.
  - name: robots
    content: index, follow
---

# Support — Tempo Subs

_Dernière mise à jour : 18 mai 2026_

Tu as besoin d'aide avec Tempo Subs ? Cette page répond aux questions les plus fréquentes. Si tu ne trouves pas ce que tu cherches, contacte-nous directement.

## Nous contacter

**Email** : [pollet.antoine.alexis@gmail.com](mailto:pollet.antoine.alexis@gmail.com)

Nous répondons sous **48 heures** en moyenne, jours ouvrés. Précise dans ton message :

- Le modèle de ton appareil (ex. iPhone 15 Pro, iOS 18.4)
- La version de Tempo Subs (visible dans Réglages tout en bas)
- Une description claire du problème ou de la question
- Si possible, une capture d'écran

## Questions fréquentes

### Mes notifications n'arrivent pas

C'est de loin le problème le plus courant. Trois choses à vérifier dans l'ordre :

1. **Permission iOS / Android activée** :
   - **iOS** : Réglages → Notifications → Tempo → activer « Autoriser les notifications »
   - **Android** : Paramètres → Apps → Tempo → Notifications → activer
2. **Mode Concentration / Ne pas déranger** désactivé, ou Tempo autorisé dans le mode actif
3. **Dans Tempo** : ouvre Réglages → vérifie que le statut indique « Notifications activées » en vert. Si tu vois un bouton « Activer les notifications » désactivé, c'est que la permission système est refusée — retour à l'étape 1.

Si tout est correct mais aucune notif n'arrive, contacte-nous avec l'ID de ton appareil (visible dans Réglages → Avancé) pour qu'on puisse diagnostiquer côté serveur.

### J'ai perdu mes données

Tes abonnements sont stockés **localement** sur ton appareil. Si tu as supprimé l'app ou changé de téléphone, ils sont perdus — sauf si tu avais fait une sauvegarde.

**Pour éviter cette situation** : Réglages → Données → **Exporter une sauvegarde**. Ça télécharge un fichier `.json` que tu peux garder sur iCloud, Google Drive, ou par email.

**Pour restaurer une sauvegarde** : Réglages → Données → **Importer une sauvegarde** → sélectionne ton fichier `.json`.

Tempo crée automatiquement une **sauvegarde de sécurité** avant chaque import, au cas où.

### Comment annuler ou mettre en pause un abonnement ?

Dans l'app, ouvre l'abonnement → tape sur :

- **Pause** : tu ne reçois plus de rappels, mais l'abonnement reste dans ta liste et ton total mensuel
- **Annuler** : marque l'abonnement comme résilié, conserve l'historique sans le compter dans tes totaux
- **Icône poubelle** : suppression définitive sans trace

À noter : ces actions concernent **uniquement le suivi dans Tempo**. Elles ne résilient pas l'abonnement chez le service concerné (Netflix, Spotify…), que tu dois faire séparément.

### Exporter mes abonnements dans mon calendrier

Réglages → Calendrier → **Exporter tous les abonnements**. Ça télécharge un fichier `.ics` que tu peux ouvrir avec Calendrier (iOS), Google Agenda, Outlook, etc. Les événements créés sont récurrents et signalent chaque prochaine échéance.

Pour les retirer ensuite : Réglages → Calendrier → **Retirer du calendrier** → importe le `.ics` annulateur que Tempo génère.

### Changer la devise

Réglages → Devise préférée. Tous tes abonnements seront convertis et affichés dans la nouvelle devise. Les montants saisis restent inchangés en base — seul l'affichage des totaux change.

### Tempo a-t-il accès à mes comptes bancaires ?

**Non.** Tempo ne se connecte à aucune banque, ne lit aucune transaction, n'a aucun accès à tes moyens de paiement. Tu saisis manuellement chaque abonnement, comme dans une liste. C'est volontairement low-tech : pas de risque sécurité, pas de partage de données avec des agrégateurs.

### Mes données sont-elles partagées ?

Tempo est **local-first**. Tes abonnements vivent sur ton appareil. La seule chose que nous envoyons à nos serveurs est un **miroir minimal** nécessaire à l'envoi des notifications push (nom de l'abonnement, date d'échéance, montant). Aucune publicité, aucun tracker, aucune revente de données.

Détail complet dans notre [politique de confidentialité](https://tempo.polletantoine.com/privacy).

### Tempo est-il gratuit pour toujours ?

Au lancement, **Tempo Subs est entièrement gratuit, sans achats in-app**. À terme, certaines fonctionnalités avancées pourraient devenir payantes (export PDF, multi-comptes, etc.), mais les fonctions de base (suivi + notifications) resteront gratuites.

## Signaler un bug

Envoie-nous un email avec :

1. Étapes pour reproduire (ex. « J'ouvre Tempo, je tape sur + , l'app crashe »)
2. Comportement attendu vs comportement observé
3. Version de l'app + iOS/Android + modèle d'appareil
4. Capture d'écran ou vidéo si pertinent

## Suggérer une fonctionnalité

Pareil — un email avec ton idée. On lit tout, et les retours utilisateurs orientent activement la feuille de route.

## Compatibilité

- **iOS** 15.0 et plus récent
- **Android** 8.0 (API 26) et plus récent
- **Web (PWA)** : navigateurs modernes (Chrome, Safari, Firefox, Edge récents)

## Liens utiles

- [Politique de confidentialité](https://tempo.polletantoine.com/privacy)
- [Site Tempo Subs](https://tempo.polletantoine.com)
