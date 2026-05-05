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

1. Remplacer le domaine `camargaqua.fr` par le vrai domaine si différent dans :
   - `sitemap.xml` (5 URLs)
   - `robots.txt` (1 URL)
   - balises `<link rel="canonical">` et `<meta property="og:*">` de chaque page
2. Compléter `legal/mentions-legales.html` (SIRET, RCS, capital, TVA, directeur de publication, hébergeur).
3. Soumettre le sitemap dans **Google Search Console** : `https://camargaqua.fr/sitemap.xml`.
4. Remplacer le numéro de téléphone dans `contact.html` (actuellement masqué).

## Formulaire de contact

Le formulaire ouvre le client mail de l'utilisateur avec un message pré-rempli, routé selon le type de demande :
- Direction → `direction@camargaqua.fr`
- Commercial → `commercial@camargaqua.fr`
- Presse → `presse@camargaqua.fr`
- Partenariat → `direction@camargaqua.fr`
- Autre → `contact@camargaqua.fr`

Pour un envoi serveur (sans ouvrir le client mail), brancher **Formspree** ou **Netlify Forms** :
- ajouter `action="https://formspree.io/f/XXXX" method="POST"` au `<form>` dans `contact.html`
- supprimer le bloc `if (form) { ... }` dans `assets/site.js`

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
