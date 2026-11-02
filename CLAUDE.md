# Lineup Manager — contexte du projet

Application de gestion de lineup et de suivi de match pour le roller derby. Destinée à un usage sur tablette.

## Stack

- Angular 21 (composants standalone, signals, `@if`/`@for`), TypeScript strict.
- Tailwind CSS v4 (tokens dans `src/styles.css`, bloc `@theme`).
- Angular CDK pour le drag and drop (`cdkDrag`, `cdkDropList`).
- Supabase : seules les **joueuses** sont en base (table `Player`, via `PlayerRepository` et `RosterService`). Les lignes, la zone Jammers et tout ce qui concerne le match restent en mémoire.
- Configuration : URL et clé **publishable** (`sb_publishable_…`) dans `src/app/core/supabase.config.ts`. Elle est publique ; l'accès est protégé par la RLS côté Supabase. Ne jamais y mettre une clé secrète.
- `src/app/data/roster.mock.ts` est conservé mais n'est plus utilisé. Ne pas le supprimer sans demander confirmation. `jams.mock.ts` alimente encore les jams.

## Pages

- **`/roster`** : trois lignes (Ligne 1, Ligne 2, Fatline) et une zone Jammers. On glisse les joueuses depuis le drawer Charter. Le compteur à côté du titre compte les blockers présentes dans au moins une ligne, plus les jammers déposées.
- **`/game`** : trois zones.
  - Track : deux tracks SVG côte à côte, jammeuse à gauche et blockers à droite. 20 secteurs, 40 zones, repères tous les 3,048 m. Géométrie dans `track-geometry.ts`, calculée en mm d'après le schéma fourni.
  - Stats : jams, points, pénalités, lead, lead par ligne.
  - Jams : table avec choix de la ligne et de la jammeuse, lead, points (+4 / −1), pénalités.
  - Menu ⋮ : « Synchroniser la base » (sans action pour l'instant) et « Réinitialiser le match » (modale de confirmation).
- **`/game/match`** : statistiques et pénalités. Les cartes des joueuses sont cliquables : un clic ajoute une pénalité au dernier jam de la joueuse. Maximum 7 pénalités par joueuse sur le match. Couleur de la carte : orange à 4, rouge à 6, désactivée à 7.
- **Charter** : drawer latéral sur desktop, feuille en bas sur mobile. Filtres B, J, P, O exclusifs. Création, édition et suppression de joueuses.

## Modèle de données

- `PlayerType` : `playerId`, `derbyName`, `surname`, `position` (`B` | `J`), `specialization?` (`P` | `O`), `rotation`.
- `RosterType` : `blockers`, `jammers`, `lines` (`{ name, blockerIds }`), `placedJammerIds`.
- Une blocker peut être dans plusieurs lignes. Une jammer n'est jamais dans une ligne : elle est seulement dans la zone Jammers.
- `JamType` : `jamNumber`, `jammer` (playerId), `lineName`, `points`, `lead`, `penalties` (une entrée par pénalité), `passages` (jammeuse, `TrackPassage[]`), `blockerPassages` (ligne, `TrackPassage[]`).
- `TrackPassage` : `{ zoneId, outcome: 'win' | 'loss' }`.
- Services : `RosterService` (effectif, lignes, zone Jammers), `GameService` (jams, points, pénalités, passages, réinitialisation), `CharterDrawerService` (ouverture du drawer).

## Décisions importantes

- Couleurs des barres de progression : moins de 25 % rouge, moins de 50 % orange, moins de 75 % bleu, sinon vert (`src/app/shared/performance-color.ts`).
- Couleurs des passages sur le track : victoire en vert, sortie en jaune vers rouge, selon la part de chaque issue. Le volume n'agit que sur l'opacité.
- Scrollbars (`src/styles.css`) : 12 px sur Chrome, Edge et Safari. Firefox reste en `scrollbar-width: thin`, car il n'accepte pas de largeur en pixels.
- Drag tactile : délai de 250 ms (`cdkDragStartDelay`), pour distinguer défilement et glisser.
- Taille des cibles tactiles : au moins 44 px sur les boutons d'action principaux.

## Points en attente

- Les informations données au survol ne sont pas visibles sur tablette : texte de zone du track, motif de désactivation d'une carte. À afficher autrement.
- La hauteur de la page Game utilise `calc(100dvh-4.5rem)`, valeur approximative pour la barre du haut. À valider sur une tablette réelle.
- Persistance du match (jams, passages, pénalités) dans Supabase : à faire plus tard. Bouton « Synchroniser la base » toujours sans action.
- Le bundle initial dépasse le budget de 500 kB depuis l'ajout de `@supabase/supabase-js` : envisager un chargement différé du client.

## Commandes

- Build : `npx ng build`
- Serveur de dev : `npx ng serve` (port 4200)

## Consignes de travail

- Vérifier le code avant d'affirmer qu'un élément existe encore : ce fichier décrit un état à une date donnée.
- Répondre de façon concise, en français.
