# CamargAqua — site institutionnel

Site statique HTML/CSS/JS prêt à déployer. Aucune dépendance, aucun build.

## Structure

```
index.html               Accueil
projet.html              Le Projet
produit.html             Le Produit
ancrage.html             Notre Ancrage
contact.html             Contact (formulaire fonctionnel)
404.html                 Page d'erreur
robots.txt               Indexation
sitemap.xml              Plan du site
assets/
  site.css               Tokens design + styles partagés
  site.js                Menu mobile + envoi du formulaire
  favicon.svg            Favicon
legal/
  mentions-legales.html  À compléter (SIRET, RCS, hébergeur)
  confidentialite.html   RGPD
```

À **ne pas déployer** : `design.tar.gz`, `design_extracted/`, `.claude/`, ce `README.md`.

## Déploiement (le plus simple)

**Netlify / Vercel / Cloudflare Pages (recommandé)** — drag-and-drop du dossier, le site est en ligne en 30 secondes. HTTPS gratuit, CDN inclus.

**OVH / hébergeur classique** — uploader le contenu via FTP à la racine du domaine.

**GitHub Pages** — push sur une branche, activer Pages dans les paramètres du repo.

Aucune configuration serveur n'est nécessaire (pas de PHP, pas de Node, pas de base de données).

## Une fois en ligne

1. ~~Remplacer le domaine `camargaqua.fr` par le vrai domaine~~ → fait, domaine réel `camargaqua.com` (`camargaqua.fr` n'est pas enregistré).
2. Compléter `legal/mentions-legales.html` (SIRET, RCS, capital, TVA, directeur de publication, hébergeur) → fait, données sourcées sur [annuaire-entreprises.data.gouv.fr](https://annuaire-entreprises.data.gouv.fr/entreprise/camargaqua-939829818).
3. Soumettre le sitemap dans **Google Search Console** : `https://camargaqua.com/sitemap.xml`.
4. Remplacer le numéro de téléphone dans `contact.html` (actuellement masqué).

## Formulaire de contact

Envoi direct côté serveur via **Netlify Forms** (`data-netlify="true"` + honeypot anti-spam dans `contact.html`, soumission en `fetch` dans `assets/site.js`). Le champ "Sujet" (Direction/Commercial/Presse/Partenariat/Autre) est transmis dans le message pour triage manuel — pas de routage automatique vers des boîtes différentes.

À faire une fois déployé : **Netlify → Site settings → Forms → Form notifications → Add notification → Email notification** → `victor.michel1@camargaqua.com`.

## Photographies

Les visuels actuels sont des photographies Unsplash hotlinkées (libres de droit, attribution non obligatoire). À remplacer par des photos réelles :
1. Déposer les fichiers dans `assets/photos/`
2. Remplacer les URLs `https://images.unsplash.com/...` dans les pages HTML par les chemins locaux
3. Garder les attributs `width`/`height` à jour pour éviter les sauts de mise en page

## Performance

- Polices Google Fonts en `display=swap` (texte visible immédiatement)
- Image hero préchargée (`<link rel="preload">`, `fetchpriority="high"`)
- Reste des images en `loading="lazy"` avec dimensions explicites (pas de CLS)
- Aucun framework JS, ~3 KB de JS personnalisé
- CSS unique partagé, mis en cache par le navigateur

## Accessibilité

- Skip link clavier
- Menu mobile avec `aria-expanded`
- Statut du formulaire annoncé via `aria-live`
- Contrastes conformes WCAG AA
- `prefers-reduced-motion` respecté
