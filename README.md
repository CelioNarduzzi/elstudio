# 📊 ElStudio

**ElStudio** est une application web moderne pensée pour la **gestion complète d’une organisation**. Elle centralise les outils essentiels d'une entreprise : gestion des utilisateurs, sécurité, rôles, préférences, et se développe comme une plateforme modulaire pouvant intégrer différents modules métiers.

---

## ✨ Fonctionnalités principales (Actuellement utilisables)

- 🔐 Authentification sécurisée via JWT
- 👤 Gestion des utilisateurs (création, modification, désactivation)
- 🧑‍💼 Attribution de rôles personnalisés avec gestion des droits d'accès
- 📧 Envoi d'e-mails (invitation, réinitialisation de mot de passe, notification)
- 📝 Gestion du profil utilisateur
- 🌗 Thème clair/sombre selon les préférences de l'utilisateur
- 🌍 Support multilingue (langue + format de date personnalisables)
- 📱 Interface responsive moderne (React + Tailwind CSS)
- ⚙️ Système de préférences utilisateur stocké en base de données
- 🏢 Personnalisation par organisation (nom + logo + configuration SMTP)
- 🔐 Sécurité avancée : changement de mot de passe forcé à la première connexion, suppression logique des utilisateurs

---

## 🧩 Une plateforme modulaire

**ElStudio** est conçu comme une **suite d'applications métiers** intégrées dans un écosystème cohérent, activables selon les besoins de l'organisation. Les futures applications prévues incluent :

- 👨‍💼 **Gestion RH** : dossiers employés, contrats, congés, bulletins de salaire
- 📅 **Gestion de projet & calendrier** : tâches, jalons, assignations, synchronisation d’équipe
- 🧾 **Comptabilité** : factures, dépenses, budget, génération de rapports
- 📂 **Documents & fichiers** : dépôt sécurisé, versionning, partage interne
- 📦 **Gestion des stocks & inventaire** : produits, quantités, alertes, bons de livraison
- 💬 **Communication interne** : messagerie, commentaires, notifications
- 🛠️ **Support & tickets** : système de tickets pour le support technique ou administratif
- 📚 **Base de connaissances** : wiki d’entreprise, procédures, documentation interne
- 🎓 **Formations & onboarding** : modules internes, suivi des compétences
- 📊 **Dashboard personnalisable** : visualisation des KPIs & données clés
- 🔍 **Journal d’audit** : traçabilité des actions utilisateur

> Tous les modules seront intégrés progressivement avec une logique d’activation simple.

---

## 🛠️ Installation

### 📦 Prérequis

- [Docker](https://www.docker.com/)
- [Git](https://git-scm.com/)
- [Node.js](https://nodejs.org/) (facultatif pour développement frontend)
- [Python 3.11+](https://www.python.org/)
- [Poetry](https://python-poetry.org/) (pour gérer les dépendances Python localement)

---

### ⚡ Lancer le projet avec Docker (recommandé)

```bash
# Cloner le projet
git clone https://github.com/ton-utilisateur/elstudio.git
cd elstudio

# Lancer les services (API, Frontend, DB)
docker-compose up --build

### Accède à l'app :

# Frontend : http://localhost:5173

# Backend API : http://localhost:8000/docs

# Admin DB (pgAdmin) : http://localhost:5050

### 🙌 Auteurs
Développé par Celio Narduzzi – avec ❤️ et React.

