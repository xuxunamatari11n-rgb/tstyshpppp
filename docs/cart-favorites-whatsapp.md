# Testy Shop · Lot 07

## Panier

`app/stores/cart.ts` conserve les identifiants, les quantités et un prix de référence dans le navigateur après l’hydratation. Les compteurs viennent de ce store. `/panier` et `/es/carrito` utilisent les lignes dans le catalogue actuel. Le mini-panier desktop réutilise les mêmes lignes et s’ouvre depuis l’en-tête. Sur mobile, le lien de navigation mène à la page panier, qui remplace les raccourcis habituels par une barre de commande.

`/api/shop/selection` charge les produits par lots d’identifiants. Le catalogue public continue d’appliquer les règles de visibilité Supabase, y compris celles des catégories. Une ligne disparue reste identifiable comme indisponible jusqu’à son retrait explicite. Le panier affiche les changements de prix et les dépassements de stock. Une quantité serveur inconnue ne devient pas un stock fictif. Les montants affichés utilisent le format commercial existant.

## Favoris

`app/stores/favorites.ts` utilise une liste locale pour les invités et les opérations de compte pour les utilisateurs authentifiés. Une connexion déclenche la fusion des identifiants visibles. Les doublons sont évités et une écriture confirmée retire la référence de la liste invitée. En cas d’échec partiel, les références non synchronisées restent sur l’appareil et la page propose de réessayer. Les actions authentifiées sont annulées visuellement en cas d’échec. La déconnexion retire les favoris privés de l’état client.

`server/api/account/favorites.*` utilise la session vérifiée et les règles RLS existantes. Le contrôle supplémentaire de l’identifiant du compte empêche une requête démarrée avant un changement de session d’agir sur le nouveau compte. Les données privées sont servies sans cache. Les routes `/favoris` et `/es/favoritos` réutilisent les cartes du catalogue.

## Commande par WhatsApp

`app/composables/useOrderPreparation.ts` valide de nouveau les produits avant l’aperçu et avant l’ouverture de WhatsApp. Si les données commerciales ont changé entre les deux, l’aperçu se met à jour et demande une nouvelle action. La commande directe utilise la quantité sélectionnée sur la fiche sans toucher au panier. Les coordonnées et indications saisies sont facultatives et appartiennent au brouillon de la boîte de dialogue. Un compte connecté peut choisir une adresse existante via `/api/account/addresses`, avec contrôle de session et accès limité aux adresses de ce compte.

Le brouillon affiche le texte exact, localisé, avec le total estimé. Le numéro provient de la configuration commerciale Supabase ou de `NUXT_PUBLIC_WHATSAPP_NUMBER`. Il est validé et le message est encodé dans un lien `https://wa.me/`. Une absence de numéro propose l’assistance. L’ouverture de WhatsApp conserve le panier et laisse à la personne la décision d’envoyer ou de modifier le message. Les modalités de livraison sont à confirmer avec la boutique.

## Interface

Les composants `app/components/commerce/` réutilisent le dialogue natif, le verrouillage de défilement, le retour de focus, GSAP et les primitives existantes. Les états vides, la validation et les textes de commande sont traduits en FR et ES. Le pied d’Urban Access utilise les clés de navigation existantes pour la confidentialité et les mentions légales, avec retour à la ligne au besoin. Les liens juridiques ne sont affichés que si leurs routes existent.

## Vérifications exécutées

- Contrôle TypeScript et build de production Nuxt sous Windows avec Node 24. Démarrage et tests sur le résultat du build.
- Chrome aux largeurs 320, 375, 390, 430, 768, 1024 et 1440 px pour le panier, les favoris et la préparation de commande. Le mini-panier a été testé au clavier, avec fermeture par Échap et clic sur le fond, retour du focus et verrouillage maintenu lors de l’ouverture du second dialogue. Le test utilise la préférence de mouvement réduit.
- Ajout depuis l’accueil, le catalogue, la recherche, les produits associés et les actions de fiche desktop et mobile. Quantités cumulées, modification, sous-totaux, rechargement et vidage explicite ont été vérifiés. Le navigateur conserve le panier pendant la préparation directe et l’ouverture de WhatsApp.
- Catalogue Supabase réel et exclusion d’un produit de test placé dans une catégorie masquée. Le navigateur a simulé un changement de prix et une baisse du stock pour vérifier l’avertissement, le blocage de la commande et la possibilité d’ajuster ou retirer la ligne. La restauration d’une quantité invalide a également été testée.
- Supabase réel avec un compte de test et son adresse temporaire. Favoris invités, fusion, absence de doublons, refus d’une ligne masquée, protection contre un changement de compte et isolation après déconnexion ont été vérifiés. Une erreur réseau contrôlée a exercé la reprise de la fusion et l’annulation d’une modification optimiste.
- Liens WhatsApp FR et ES interceptés dans Chrome, avec contenu encodé, quantités sélectionnées et total. L’absence de numéro a été vérifiée. Le numéro d’exemple du test ne sert qu’à exercer la construction du lien, aucun message n’a été envoyé.
- Les clés FR et ES de confidentialité et de mentions légales sont définies. Les deux formats du panneau Urban Access utilisent la couleur calculée `#C8F135`.

Le panier accepte jusqu’à 40 références distinctes. Si le texte final dépasse la taille prise en charge par le lien, l’interface invite à raccourcir le message ou à préparer une commande plus petite. Une utilisation commerciale de WhatsApp requiert le numéro officiel de la boutique. L’ouverture dans l’application WhatsApp native reste à vérifier avec ce numéro.

Les captures se trouvent dans `.data/qa/lot07` : mini-panier desktop, panier desktop et mobile, favoris desktop et préparation de commande desktop et mobile.

