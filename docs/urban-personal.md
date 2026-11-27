# Testy Shop · Urban Personal

## Parcours

| Écran | Français | Espagnol |
| --- | --- | --- |
| Vue d’ensemble et accès Urban Access | /compte | /es/cuenta |
| Profil | /compte/profil | /es/cuenta/perfil |
| Adresses de livraison | /compte/adresses | /es/cuenta/direcciones |
| Nouvelle adresse | /compte/adresses/nouvelle | /es/cuenta/direcciones/nueva |
| Modification d’une adresse | /compte/adresses/[id] | /es/cuenta/direcciones/[id] |
| Suivi et assistance de commande | /compte/commandes | /es/cuenta/pedidos |
| Sécurité | /compte/securite | /es/cuenta/seguridad |
| Assistance | /compte/assistance | /es/cuenta/ayuda |

Les favoris utilisent toujours les routes `/favoris` et `/es/favoritos`. L’aperçu charge les premiers produits visibles dans l’ordre d’ajout renvoyé par Supabase. Le bloc de bienvenue affiche le prénom disponible et propose de reprendre les achats.

L’en-tête commercial desktop reste visible. Une colonne de navigation de 248 px accompagne le contenu. Sur mobile, la vue d’ensemble utilise un en-tête de compte, trois accès directs et des liens groupés. Les sous-pages ont un retour explicite et un défilement naturel, avec la barre inférieure réservée à la vue d’ensemble.

## Profil, adresses et commerce

Le profil permet de modifier le prénom, le nom et le téléphone dans la limite des champs existants. L’e-mail de connexion est présenté en lecture seule et l’avatar est représenté par les initiales. Le changement de mot de passe passe par le formulaire Urban Access et l’opération Supabase existants. Le compte affiche un refus explicite quand Supabase exige une nouvelle authentification.

La gestion des adresses utilise une page de formulaire dédiée sur desktop et mobile. Un dialogue natif permet de confirmer une suppression ou de l’annuler. L’opération existante `set_default_address` garantit une mise à jour atomique de l’adresse par défaut. Si la fiche a été enregistrée et que la promotion échoue ensuite, la confirmation distingue les deux résultats et la liste permet de relancer la promotion. Supprimer l’adresse par défaut laisse le compte sans adresse désignée jusqu’à un nouveau choix.

Le sélecteur du lot 07 relit les adresses du compte et suggère le défaut par son ordre et son libellé. Il vérifie la fiche choisie avant l’ouverture de WhatsApp. Une mise à jour ou une suppression arrête le passage et présente la modification à la personne. Les informations manuelles restent facultatives pour les visiteurs et les clients.

Les pages commandes et assistance utilisent les coordonnées configurées de la boutique. Les actions de suivi, de modification, de livraison et d’aide préparent des textes distincts, localisés et encodés. Le suivi se déroule avec la boutique dans WhatsApp. En l’absence de numéro configuré, les liens renvoient vers l’assistance existante.

## Protection des données

Le middleware vérifie la session avant de servir les pages privées. Les retours après connexion sont limités aux noms de routes internes autorisés. Le lien d’édition conserve un identifiant d’adresse UUID et les opérations restent soumises à l’identité vérifiée et à la RLS.

Les lectures et modifications de données privées évitent le cache public. Une écriture vérifie l’origine et confirme que l’identité attendue correspond à la session courante. L’API prend le propriétaire depuis la session et limite la mise à jour du profil aux champs autorisés. Les caches clients de profil et d’adresses sont vidés au changement de compte ou à la déconnexion. Le panier invité reste dans le navigateur.

Le lot réutilise les tables, les politiques et l’index unique existants. Il ne nécessite aucune migration.

## Fichiers

- `app/layouts/account.vue`, `app/assets/css/customer.css` et `app/components/customer/` pour Urban Personal.
- `app/pages/compte/`, `app/middleware/customer-account.ts`, `shared/utils/customerAccount.ts` et `app/composables/useCustomer*.ts` pour les routes, l’état et les formulaires.
- `server/utils/customerAccount.ts` et `server/api/account/` pour les lectures et écritures de profil et d’adresses.
- `app/composables/useAuthFlow.ts`, `server/api/auth/action.post.ts` et `app/components/commerce/CommerceRuntime.vue` pour le retour validé et la gestion des changements de session.
- `app/components/commerce/CommerceOrderDialog.vue` et `app/composables/useWhatsAppContact.ts` pour le sélecteur et les liens d’assistance.
- `i18n/locales/fr.json` et `i18n/locales/es.json` pour les libellés et les messages.
- `nuxt.config.ts` pour laisser le hook existant déduire le type des pages générées.

## Vérification exécutée

- `pnpm typecheck` et `pnpm build` sous Windows avec Node 24, puis démarrage du bundle de production.
- Chrome sur 320, 375, 390, 430, 768, 1024 et 1440 px. Vue d’ensemble, profil, adresses, formulaire et commandes ont été contrôlés. Essais avec un prénom long, un viewport mobile court, le mouvement réduit et la navigation clavier du dialogue de suppression.
- Deux comptes de test sur Supabase pour vérifier la connexion, le retour vers la page voulue, la relecture et la modification du profil, la création et la suppression d’adresses, la promotion concurrente de deux adresses et l’isolation entre comptes. Le changement de mot de passe a été confirmé par une nouvelle connexion. La disparition de la session a provoqué un retour vers Urban Access. La déconnexion et le changement de compte ont conservé le panier invité.
- Chronologie des favoris contrôlée à partir des données Supabase. Dans la préparation d’une commande, une adresse nouvellement créée a été sélectionnée, modifiée depuis l’API authentifiée puis supprimée. L’aperçu a signalé les deux changements avant le transfert.
- Les quatre brouillons d’assistance WhatsApp ont été lus en FR et ES. Un second serveur sans numéro a servi à vérifier le repli. Le test utilise un numéro d’exemple et s’arrête au brouillon. Le clavier natif et l’ouverture de l’application WhatsApp avec le numéro officiel de la boutique restent à vérifier sur un appareil physique.

Les dix captures sont dans `.data/qa/lot08`, avec une version desktop de 1440 px et une version mobile de 390 px pour chaque écran demandé.

