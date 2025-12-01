# Lisa - Lecture Simplifiée

Lisa est une application de lecture minimaliste pour enfants, inspirée par le design épuré de Grammarly, Apple et Vercel.

## ✨ Philosophie

- **Un seul écran** - Expérience focalisée sans distraction
- **Lecture naturelle** - Les histoires se déroulent progressivement
- **Questions intégrées** - Posées naturellement dans le flux de lecture
- **Hints contextuels** - Définitions des mots au clic
- **Pas de jugement** - Analyse en arrière-plan, feedback positif uniquement
- **Design minimaliste** - Interface épurée, style Apple/Vercel

## 🛠️ Tech Stack

- **Next.js 15** (App Router)
- **TypeScript**
- **Tailwind CSS v4**
- **Framer Motion** pour les animations fluides
- **Lucide React** pour les icônes minimalistes

## 🚀 Démarrage Rapide

### Installation

1. Cloner le dépôt:
```bash
git clone <repository-url>
cd lisa-next
```

2. Installer les dépendances:
```bash
yarn install
```

3. Lancer le serveur de développement:
```bash
yarn dev
```

Ouvrir [http://localhost:3000](http://localhost:3000) pour voir l'application.

## 📁 Structure du Projet

```
lisa-next/
├── src/
│   ├── app/
│   │   ├── learn/         # Page principale unique
│   │   ├── page.tsx       # Redirection vers /learn
│   │   ├── layout.tsx     # Layout global minimaliste
│   │   └── globals.css    # Styles globaux épurés
│   └── components/
│       ├── ui/            # Composants UI de base
│       ├── lisa/          # Composants Lisa (animations)
│       └── error-boundary.tsx
└── public/                # Assets statiques
```

## 🎯 Fonctionnalités

### 📖 Lecture Progressive
- Les paragraphes apparaissent un par un (5 secondes chacun)
- Animation douce et fluide
- Auto-progression avec possibilité de pause

### 💡 Hints Intégrés
- Mots importants soulignés en pointillés
- Clic → tooltip élégant avec définition et exemple
- Non intrusif, contrôlé par l'enfant

### ❓ Questions Naturelles
- Intégrées dans le flux de l'histoire
- Interface épurée, feedback visuel subtil
- Explications douces après chaque réponse
- Pas de score visible, analyse en arrière-plan

### 🎨 Navigation Intuitive
- **Clic sur les côtés** de l'écran pour naviguer
- **Boutons discrets** en bas (précédent, pause/play, suivant)
- **Indicateurs minimalistes** de progression
- **Hint initial** qui disparaît après 5 secondes

## 🎨 Design Principles

- **Fond blanc épuré** - Zéro distraction
- **Typographie légère** - Font-weight: light
- **Couleurs neutres** - Gris doux, touches de violet
- **Animations subtiles** - Framer Motion
- **Espacement généreux** - Respiration visuelle
- **Focus sur le contenu** - Interface invisible

## 🚀 Prochaines Étapes

- [ ] Intégration API Groq pour génération d'histoires
- [ ] Système de persistence (localStorage)
- [ ] Bibliothèque d'histoires
- [ ] Personnalisation (âge, niveau, intérêts)
- [ ] Mode hors ligne complet
- [ ] Audio text-to-speech optionnel

## 📝 Scripts Disponibles

- `yarn dev` - Serveur de développement
- `yarn build` - Build de production
- `yarn start` - Serveur de production
- `yarn lint` - ESLint

## 🤝 Contribution

Projet éducatif. Contributions bienvenues !

## 📄 Licence

Projet à but éducatif.
