## 🚀 Docker Deployment (Zero-Dependency Server Setup)

You do **not** need Node.js, npm, MariaDB, or Redis installed on the server. The entire stack (MariaDB 10.11, Redis 7, and Next.js Web App) runs via Docker Compose.

### Quick Start

1. **Clone the repository on your server:**
   ```bash
   git clone <repo-url>
   cd remastered-good-car-imports
   ```

2. **(Optional) Configure environment:**
   Create `.env` if you wish to override default passwords or SMTP credentials:
   ```bash
   cp .env.example .env
   ```

3. **Start everything:**
   ```bash
   docker compose up -d --build
   ```

That's it! 
- MariaDB and Redis will start with healthchecks.
- The web container will wait for MariaDB, synchronize database tables automatically (`prisma db push`), seed the initial admin account (`admin@goodcarimports.com` / `password123`) if the database is fresh, and launch the Next.js server.
- The site will be available immediately at `http://<your-server-ip>:3000`.
- All uploads (`public/uploads`) and database tables (`mariadb_data`) are persisted across container restarts.

### Useful Docker Commands

- **View real-time logs:**
  ```bash
  docker compose logs -f web
  ```

- **Stop services:**
  ```bash
  docker compose down
  ```

- **Rebuild after pulling new code:**
  ```bash
  git pull
  docker compose up -d --build
  ```

- **Run Prisma Studio (without host Node/npm):**
  ```bash
  docker compose exec web npx prisma studio
  ```

- **Manually re-seed database (clears and re-seeds):**
  ```bash
  docker compose exec web npm run db:seed
  ```
