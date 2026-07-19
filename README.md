# FreelanceOS

SaaS de gestion d'activité freelance : clients, projets, tâches (Kanban), devis et factures avec génération PDF, et un dashboard de synthèse.

Projet portfolio construit en apprenant Spring Boot en conditions réelles (voir la section [Concepts Spring](#concepts-spring-appris-dans-ce-projet) pour un résumé utile en entretien).

## Stack technique

| Couche      | Techno |
|-------------|--------|
| Backend     | Java 21, Spring Boot 3.3 (Web, Data JPA, Validation), Maven |
| Base de données | PostgreSQL 16 (Docker) |
| Frontend    | React 18, TypeScript, Vite, Tailwind CSS v4 |
| Drag & drop | @dnd-kit |
| Documentation API | springdoc-openapi (Swagger UI) |
| PDF         | OpenPDF |
| Authentification | Spring Security + JWT (jjwt) |

## Architecture

Monorepo pensé pour accueillir sans refonte un futur microservice Python d'IA (`ai-service/`), des dashboards analytiques avancés, et une dockerisation complète.

```
freelanceos/
├── backend/
│   └── src/main/java/com/weblocal/freelanceos/
│       ├── client/      CRUD clients
│       ├── project/     CRUD projets + Kanban (statut/priorité/position)
│       ├── task/        Sous-tâches d'un projet + Kanban de détail
│       ├── invoice/     Devis/factures, calculs HT/TVA/TTC, génération PDF
│       ├── dashboard/   Endpoint d'agrégation pour les cartes de synthèse
│       ├── auth/        Authentification JWT (User, rôles ADMIN/CLIENT, sécurité)
│       ├── portal/      Portail client en lecture seule (ses projets, ses devis/factures)
│       ├── common/      BaseEntity, exceptions, gestion d'erreurs centralisée
│       └── config/      CORS, OpenAPI/Swagger
├── frontend/
│   └── src/
│       ├── api/         Client HTTP (axios), un fichier par ressource
│       ├── components/  UI réutilisable (Sidebar, DataTable, Modal, Kanban...)
│       ├── context/     AuthContext (session JWT persistée)
│       ├── pages/       Dashboard, Clients, Projets, ProjectDetail, Factures, Login
│       ├── pages/portal/ Portail client (Mes projets, Mes factures)
│       ├── types/       Types TypeScript alignés sur les DTO backend
│       └── hooks/       (réservé pour une prochaine phase)
├── docker-compose.yml   PostgreSQL uniquement pour l'instant
└── README.md
```

Chaque module backend suit une architecture stricte en couches :
`Controller → Service → Repository`, avec DTOs dédiés en entrée/sortie (jamais l'entité JPA exposée directement) et un mapper entité ↔ DTO.

## Modèle de données

- **Client** : nom, email, entreprise, téléphone, adresse, notes
- **Project** : titre, statut (Prospect/En cours/Terminé/Annulé), priorité, client, technos, dates, montant estimé, position (Kanban)
- **Task** : sous-tâche d'un projet, statut (À faire/En cours/Terminé), priorité, position (Kanban)
- **Invoice** : devis ou facture, lignes (description/quantité/prix), montants HT/TVA/TTC calculés automatiquement, statut, numéro auto-généré (`DEV-2026-0001`, `FAC-2026-0001`)
- **User** : compte de connexion (email, mot de passe hashé, rôle `ADMIN` ou `CLIENT`). Un `User` de rôle `CLIENT` est toujours rattaché à un `Client` précis.

## Installation et lancement

### Prérequis
- Java 21 (JDK)
- Docker Desktop (pour PostgreSQL)
- Node.js 18+

### 1. Base de données
```bash
docker compose up -d
```
> PostgreSQL est exposé sur le port **5433** (et non 5432 par défaut) car un PostgreSQL natif occupe déjà ce port sur la machine de développement d'origine. Si ce n'est pas votre cas, vous pouvez remettre `5432:5432` dans `docker-compose.yml` et `application.yml`.

### 2. Backend
```bash
cd backend
./mvnw.cmd spring-boot:run       # Windows
./mvnw spring-boot:run           # macOS/Linux
```
Aucune installation manuelle de Maven n'est nécessaire : le **Maven Wrapper** (`mvnw`/`mvnw.cmd`) télécharge automatiquement la bonne version au premier lancement.

- API : http://localhost:8080
- Swagger UI : http://localhost:8080/swagger-ui.html

Un compte **ADMIN** est créé automatiquement au tout premier démarrage (voir `AdminBootstrap`) :
- Email : `admin@freelanceos.local`
- Mot de passe : `ChangeMe123!`

> ⚠️ Change ces identifiants avant tout usage réel, via les variables d'environnement `APP_ADMIN_EMAIL` / `APP_ADMIN_PASSWORD` (et régénère `APP_JWT_SECRET` — voir `application.yml`). Ce compte n'est recréé qu'une seule fois ; le modifier ensuite se fait directement en base ou en supprimant la ligne dans `users` pour forcer une nouvelle génération au prochain démarrage.

### 3. Frontend
```bash
cd frontend
npm install
npm run dev
```
- Application : http://localhost:5173

## Fonctionnalités

- **Clients** : CRUD complet, recherche et tri
- **Projets** : CRUD complet, filtres par statut/priorité, vue liste ET vue **Kanban** (drag & drop entre les 4 colonnes, synchronisé avec l'API)
- **Détail projet** : sous-tâches en **Kanban** à 3 colonnes, drag & drop synchronisé
- **Devis/Factures** : création avec lignes dynamiques, calcul automatique HT/TVA/TTC, changement de statut, conversion devis → facture, **export PDF**
- **Dashboard** : nombre de clients, projets en cours, CA du mois (factures payées), montant des factures impayées
- **Authentification** : connexion par email/mot de passe (JWT), deux rôles :
  - **ADMIN** (toi) : accès complet à toute l'application ci-dessus
  - **CLIENT** : accès à un **portail en lecture seule** (`/portail`) montrant uniquement SES projets (statut, priorité, dates, montant, technos) et SES devis/factures (avec téléchargement PDF)
- **Génération d'accès client** : depuis la page Clients, le bouton « Générer un accès » crée (ou réinitialise) le compte de connexion d'un client, avec un mot de passe aléatoire affiché une seule fois

## Concepts Spring appris dans ce projet

Un résumé pour pouvoir les expliquer en entretien :

- **Injection de dépendances par constructeur** (`@RequiredArgsConstructor` + champs `final`) plutôt que `@Autowired` sur les champs — plus facile à tester, dépendances explicites.
- **Architecture en couches** : `@RestController` (HTTP) → `@Service` (logique métier) → `@Repository` (accès données). Le contrôleur n'appelle jamais un repository directement.
- **DTO vs Entité** : les entités JPA (`@Entity`) ne sont jamais exposées dans l'API. Des DTO dédiés (records Java) définissent le contrat d'entrée/sortie, avec leurs propres règles de validation (`@Valid`, `@NotBlank`...).
- **`@RestControllerAdvice`** : centralise la gestion des exceptions pour toute l'application (404 sur ressource introuvable, 400 sur erreur de validation, 409 sur conflit métier, 500 en filet de sécurité).
- **Relations JPA et `LAZY` loading** : avec `spring.jpa.open-in-view=false` (une pratique plus saine que la valeur par défaut Spring Boot), toute lecture d'une relation `@ManyToOne`/`@ElementCollection` doit se faire **à l'intérieur** d'une transaction (`@Transactional` au niveau du service) — sinon `LazyInitializationException`. C'est le bug le plus instructif rencontré dans ce projet : voir `ProjectService`, `TaskService`, `InvoiceService`.
- **Intégrité référentielle vs UX** : supprimer une ressource encore référencée ailleurs (ex: client avec des projets) doit renvoyer une erreur métier claire (409 Conflict), pas laisser remonter une contrainte SQL brute en 500. Voir `ClientService.delete` / `ProjectService.delete`.
- **BigDecimal pour l'argent** : jamais `double`/`float` pour des calculs monétaires (erreurs d'arrondi binaire), voir `InvoiceService.calculerMontants`.
- **Authentification stateless par JWT** : au login, le serveur vérifie les identifiants (`AuthenticationManager` + `PasswordEncoder` BCrypt) et génère un token signé. Pour chaque requête suivante, un filtre (`JwtAuthenticationFilter`) valide juste la signature du token — sans session côté serveur ni retour en base — et peuple le `SecurityContext`.
- **Autorisation par rôle** : `@PreAuthorize("hasRole('ADMIN')")` au niveau de chaque contrôleur, avec `@EnableMethodSecurity`. Le portail client (`PortalController`) ne fait JAMAIS confiance à un id passé par le frontend : il filtre toujours par le `clientId` extrait du token, pour qu'un client ne puisse techniquement pas voir les données d'un autre même en modifiant l'URL.
- **404 plutôt que 403 pour éviter l'énumération** : quand un client tente d'accéder à une facture qui n'est pas la sienne, l'API renvoie "introuvable" plutôt que "interdit" — sinon on confirmerait par la réponse HTTP qu'un id appartenant à quelqu'un d'autre existe bien.

## Ce qu'il reste à faire manuellement

- **Tester l'application vous-même** dans le navigateur (CRUD, Kanban en drag-and-drop réel, PDF, dashboard) — les tests automatisés de cette session ont validé le CRUD, les calculs, la génération PDF et le rendu des Kanban, mais **le geste de glisser-déposer lui-même n'a pas pu être simulé de façon fiable par l'outillage de test automatisé** (limitation connue de @dnd-kit face à des événements pointeur synthétiques). Merci de vérifier ce point en particulier.
- **Créer vos propres données** (clients/projets réels de votre activité WebLocal) — la base a été nettoyée après chaque test.
- Le port PostgreSQL (5433) est spécifique à cette machine de dev ; à ajuster si vous déployez ailleurs.
- Aucun test automatisé (JUnit/Vitest) n'a été écrit — à considérer si vous voulez consolider avant d'ajouter des fonctionnalités.
- **Change les identifiants admin par défaut** (`admin@freelanceos.local` / `ChangeMe123!`) et le secret JWT avant tout usage réel — voir la section Installation ci-dessus.
- Il n'y a pas d'écran "mot de passe oublié" : si un client perd son mot de passe, régénère-lui un accès depuis la page Clients.

## Suggestions pour la suite

- **Dockerisation complète** : `Dockerfile` pour le backend (build multi-stage Maven) et le frontend (build Vite + Nginx), puis les ajouter à `docker-compose.yml`.
- **CI/CD** : GitHub Actions pour lancer les tests et builder les images à chaque push.
- **Cloud** : déploiement du backend (ex: Railway, Render, Scaleway) + frontend (ex: Vercel, Netlify) + PostgreSQL managé.
- **Tests automatisés** : tests unitaires des services (calculs de facturation en priorité), tests d'intégration Spring Boot Test + Testcontainers pour les repositories.
- **Microservice IA** (`ai-service/`) : suggestions de tarification, relances automatiques de factures en retard, résumé de projet — dossier déjà prévu dans l'architecture.
- **Dashboards analytiques avancés** : évolution du CA dans le temps, répartition par client/techno.
