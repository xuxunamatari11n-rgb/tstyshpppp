# Testy Shop · Urban Access

Le lot 06.1 applique le layout `auth` aux routes `/compte` et `/es/cuenta`. Les paramètres existants `intent=create-account`, `intent=reset` et `intent=recovery` restent valides. Les callbacks Supabase et les routes de protection suivent les conventions du lot 06.

## Écrans et comportement

- Connexion et inscription avec libellés permanents, autocomplétion native et boutons permettant d’afficher ou de masquer les mots de passe.
- Mot de passe oublié, saisie et confirmation du nouveau mot de passe, lien invalide et écrans dédiés après les opérations réussies. Les messages d’envoi d’e-mail évitent de révéler si une adresse correspond à un compte.
- Validation localisée par champ, focus sur le premier champ invalide, erreur serveur lisible et bouton occupé pendant une requête. Le passage d’un formulaire à l’autre conserve l’adresse saisie et efface le mot de passe.
- Composition desktop en deux colonnes, campagne compacte sur mobile et formulaire qui défile naturellement. Le bandeau mobile se retire sur les états de récupération et les viewports courts. Le footer propose uniquement les destinations qui existent dans la version exécutée. Les aperçus légaux existants sont disponibles en développement.
- La campagne réutilise `crossbody.webp`, `headphones.webp` et `sneaker.webp` dans `public/images/home`. La disposition mobile utilise deux photos. Les illustrations sont décoratives et les textes de campagne restent accessibles.
- L’apparition GSAP des textes et des photos utilise le mécanisme de campagne existant. Le changement d’écran anime le contenu du formulaire et conserve la campagne sur la même page. Les animations respectent les préférences de mouvement réduit et sont arrêtées au démontage.
- Le client conserve `useShopSession` et `/api/auth/action`. La récupération continue d’exiger une session acceptée par le serveur. Les opérations Auth, les cookies, les callbacks, les rôles et les migrations Supabase restent gérés par le socle du lot précédent.

## Fichiers

| Fichier | Rôle |
| --- | --- |
| `app/layouts/auth.vue` | En-tête, campagne, contenu et pied de page |
| `app/assets/css/auth.css` | Composition responsive, champs, boutons et états |
| `app/components/auth/AuthCampaign.vue` | Composition photo et animation de la campagne |
| `app/components/auth/AuthPasswordField.vue` | Champ de mot de passe et contrôle de visibilité |
| `app/pages/compte/index.vue` | Écrans authentifiés et visiteurs, navigation et focus |
| `app/composables/useAuthFlow.ts` | État du parcours, validation et appels aux opérations existantes |
| `app/components/ui/UiInput.vue` | Emplacement optionnel pour le contrôle d’un champ |
| `app/composables/useEntranceMotion.ts` | Paramètres du mouvement d’entrée |
| `i18n/locales/fr.json` et `i18n/locales/es.json` | Contenu et libellés accessibles FR/ES |

## Validation

- `pnpm typecheck` et `pnpm build` sous Windows avec Node 24 et le preset Nitro Node.
- Chrome headless sur le build de production. Largeurs vérifiées en français et en espagnol : 320, 375, 390, 430, 768, 1024, 1440 et 1920 px. Les vérifications couvrent les routes directes, la place du formulaire, le défilement jusqu’au bouton sur un écran court, le mouvement réduit, le changement de langue, le focus, la visibilité du mot de passe, les erreurs localisées, l’attente et la prévention des doubles envois.
- Supabase réel, avec un compte temporaire préconfirmé : mot de passe erroné, connexion, restauration de session après navigation et vérification du cookie HTTP-only, contrôle de confirmation, changement de mot de passe, reconnexion et déconnexion. Le callback de récupération sans jeton a renvoyé vers l’écran d’expiration localisé.
- Les états post-inscription et post-demande de récupération ont été vérifiés dans le navigateur avec des réponses réseau contrôlées. L’envoi et la réception des e-mails, puis l’ouverture des liens reçus, restent à valider avec le domaine et le SMTP finaux.
- Le viewport réduit et les attributs d’autocomplétion ont été vérifiés dans Chrome. Le clavier natif et un gestionnaire de mots de passe enregistré n’ont pas été testés sur un appareil physique.

Les quatre captures du build local se trouvent dans `.data/qa/lot061`. Les vues desktop utilisent une largeur de 1440 px et les vues mobile une largeur de 390 px.

