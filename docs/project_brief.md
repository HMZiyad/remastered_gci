# ROLE
You are a senior full-stack architect and engineer. Plan first, then execute in phases. Produce a written Implementation Plan and wait for my approval before writing code. After approval, work phase by phase and verify each phase with tests and browser checks before moving on.

# PROJECT SUMMARY
Migrate an existing car importer/distributor website (Bangladesh) from PHP + vanilla JavaScript + HTML + CSS (cPanel, 1 GB RAM, 3 GB SSD) to a React-based stack on a new VPS (4 GB RAM, 50 GB SSD). The legacy source code is in: /Users/ziyad/projects/good cars/good-car-imports. The legacy database dump is in: /Users/ziyad/projects/good cars/good-car-imports/database_backup.sql. The VPS OS is: Debian 12.

# GOALS (all are mandatory)
1. Full migration of every public page, the admin dashboard, and all data to React.
2. Real-time updates: changes made in the dashboard must appear on the public site without a manual refresh.
3. Fast image uploads: uploading many high-resolution car photos must be quick and reliable.
4. Pixel-identical design: the new site must look and behave the same as the old one.
5. Strong SEO for traditional search engines AND AI platforms (ChatGPT, Gemini, Perplexity, Claude, Google AI Overviews).

# PHASE 0: DISCOVERY AND AUDIT (no code changes yet)
- Crawl the legacy codebase and produce an inventory of: every route/page, every PHP endpoint, DB tables and relationships, admin features and user roles, forms, third-party integrations (WhatsApp, maps, analytics, email/SMS), cron jobs, file upload paths, and existing URL structure.
- Extract the design system from the legacy CSS: colors, fonts, font sizes, spacing, breakpoints, shadows, border radii, animations, icons, and image assets. Save these as design tokens (CSS variables / Tailwind config) with values copied verbatim, not approximated.
- Capture baseline screenshots of every page at 375px, 768px, 1280px and 1920px widths. These are the visual reference.
- Record legacy URLs so every one can be 301-redirected to its new equivalent.
- Output: `docs/01-audit.md` and the Implementation Plan. Stop and ask me about anything ambiguous.

# TARGET ARCHITECTURE (propose it in the plan; justify any deviation)
- Frontend: Next.js (App Router) + React + TypeScript. Use SSR/ISR for public pages so crawlers receive full HTML. Dashboard can be client-rendered behind authentication.
- Styling: reuse the legacy CSS faithfully (CSS Modules or Tailwind with tokens extracted in Phase 0). No redesign, no "modernizing", no new component-library look.
- Backend: Node.js (Next.js route handlers or a separate Express/Fastify service), REST or tRPC with validation (Zod).
- Database: MySQL/MariaDB (keep the legacy engine to simplify migration) with Prisma or Drizzle ORM. Write a migration script that imports all legacy data with integrity checks and row-count verification.
- Cache and queue: Redis (memory-capped) for caching, pub/sub, and a BullMQ job queue.
- Process and server: PM2 or Docker Compose, Nginx reverse proxy with gzip/brotli, HTTP/2, HTTPS via Let's Encrypt, security headers.
- Memory budget for the 4 GB VPS: Node app ≤ 1 GB, MySQL ≤ 1 GB, Redis ≤ 256 MB, leaving headroom for Nginx and the OS. Show the budget in the plan and tune accordingly.
- Authentication: secure session or JWT in httpOnly cookies, bcrypt/argon2 password hashing, role-based access (reuse the legacy roles), CSRF protection, rate limiting on login and forms, and a password-reset flow. Legacy admin passwords must be migrated safely, or a forced reset must be implemented.
- Containers: Docker Compose to orchestrate the Nginx, Node.js, MySQL, and Redis services.

# REAL-TIME UPDATES (eliminate manual refresh)
- When an admin creates, edits, deletes, or reorders a vehicle, price, status (available/sold/reserved), or banner, the public site must reflect it automatically.
- Implement a two-layer solution:
  a) On-demand ISR revalidation (revalidatePath/revalidateTag) triggered by every dashboard mutation, so new visitors and crawlers always get fresh HTML.
  b) Push updates to already-open browser tabs via Server-Sent Events (preferred, lightweight) or WebSocket, using Redis pub/sub. Public pages should update the affected cards or listings in place with no full reload and no layout shift.
- The dashboard itself should update live too (e.g., new inquiries appear instantly, and two admins editing see each other's changes). Use optimistic UI with rollback on failure.
- Add automatic reconnection and a polling fallback if SSE/WebSocket is blocked.

# FAST IMAGE UPLOAD PIPELINE
Problem: uploading many high-resolution car photos is slow. Solve it end to end:
- Client side: drag-and-drop multi-file upload, client-side resize/compress before sending (browser-image-compression or canvas, max long edge ~2560px, quality ~0.85), parallel uploads (3-4 concurrent) with per-file progress bars, retry with backoff, and resumable/chunked upload for large files (tus protocol or S3-style multipart).
- Show an instant local preview, so the admin can keep working while uploads finish. Drag-to-reorder photos, choose the cover image, and delete or replace images.
- Server side: accept the original quickly, respond immediately, then process in a background BullMQ worker using `sharp`: strip EXIF (including GPS), auto-rotate, and generate AVIF + WebP + JPEG fallback at multiple widths (e.g., 320, 640, 960, 1440, 2048), plus a tiny blur placeholder (LQIP/blurhash). Cap worker concurrency to protect RAM (e.g., 2 concurrent jobs).
- Storage on the VPS disk under a structured path, served by Nginx with long-lived immutable cache headers. Design the storage layer behind an interface so it can later move to S3/Cloudflare R2/CDN without rewriting. Include a disk-usage monitor and a cleanup job for orphaned files, plus a note about the 50 GB budget (estimate the per-vehicle storage footprint).
- Frontend delivery: responsive `srcset`/`<picture>`, lazy loading below the fold, priority loading for the LCP image, explicit width/height to avoid layout shift.
- Validate on the server: MIME sniffing (not just extension), size limits, image dimension limits, and filename sanitization. Reject anything that is not a real image.
- Target: 20 photos of ~5 MB each should become usable in the dashboard in seconds (previews immediately, processed variants in the background with a visible "processing" status).

# DESIGN CONSISTENCY (non-negotiable)
- The new site must match the legacy design exactly: layout, typography, colors, spacing, hover/transition effects, responsive behavior, and copy.
- Build a Playwright visual-regression suite comparing new pages against the Phase 0 baseline screenshots at all four widths. Differences above a small threshold must be fixed, not accepted.
- Do not change any text, imagery, or layout unless I approve it. Any improvement ideas go in `docs/suggestions.md` only.
- Preserve existing UX details (sliders, filters, sorting, search, inquiry forms, WhatsApp/call buttons, language options if any).

# SEO FOR SEARCH ENGINES AND AI PLATFORMS
Target queries: leading car importers and sellers in Bangladesh, e.g., "car importer in Bangladesh", "reconditioned cars Bangladesh", "Toyota/Honda/Nissan import Dhaka", "best car dealer in Dhaka", "[BRAND_NAME] car price in Bangladesh". Confirm and expand this keyword list in the plan: [ADD_MODELS/BRANDS/CITIES].

Technical SEO:
- Server-rendered HTML for all public pages (no content that appears only after client-side JS).
- Clean, stable, keyword-meaningful URLs (e.g., /cars/toyota/corolla-axio-2018-white). 301-redirect every legacy URL.
- Per-page unique `<title>`, meta description, canonical URL, Open Graph and Twitter cards (generate OG images per vehicle), via the Next.js Metadata API.
- Auto-generated `sitemap.xml` (with image entries and lastmod, split if large) and `robots.txt`. Update the sitemap automatically on dashboard changes, and ping/submit via IndexNow.
- If the site is bilingual (English/Bangla), implement hreflang correctly.
- Core Web Vitals targets: LCP < 2.5 s, INP < 200 ms, CLS < 0.1, Lighthouse mobile ≥ 90 for Performance, SEO, Accessibility, and Best Practices. Test with throttled mobile (the Bangladesh mobile network reality).
- Semantic HTML, a single H1 per page, logical heading hierarchy, descriptive alt text for every image (auto-suggest from make/model/year/color), breadcrumbs, internal linking (related vehicles, brand hubs, "similar cars").

Structured data (JSON-LD, validated with Google's Rich Results Test and schema.org validator):
- Organization / AutoDealer + LocalBusiness (name, address, phone, hours, geo, sameAs social profiles)
- Vehicle/Car + Offer (make, model, year, mileage, fuel, transmission, color, VIN if available, price in BDT, availability)
- BreadcrumbList, FAQPage (on brand and category pages), WebSite with SearchAction, ImageObject
- Reviews/AggregateRating only if real reviews exist (never fabricate)

AI-platform visibility (GEO/AEO):
- Create `/llms.txt` and `/llms-full.txt` summarizing the business, services, brands, locations, contact info, and key pages in clean Markdown.
- In robots.txt, explicitly allow reputable AI crawlers (GPTBot, OAI-SearchBot, ChatGPT-User, ClaudeBot, Claude-SearchBot, PerplexityBot, Google-Extended, Applebot-Extended), subject to my confirmation.
- Write concise, factual, answer-first content blocks on key pages: who we are, how car import to Bangladesh works (duties, timeline, documents, shipping from Japan etc.), financing, warranty, "why buy from us". Use question-style headings and short direct answers that AI systems can quote. Content must be accurate, so mark anything needing my verification with `TODO-VERIFY`.
- Consistent NAP (name, address, phone) across the site and schema. Provide a checklist for Google Business Profile, Bing Places, and business directories.
- Add an `/about` page with E-E-A-T signals (company history, team, licenses, showroom photos), plus a blog/guides section structure for long-tail queries.

Local SEO: Bangladesh/Dhaka focus, with Bangla and English keyword variants, a map embed (lazy-loaded), and location/showroom pages.

Analytics: GA4 + Google Search Console + Bing Webmaster setup instructions; privacy-friendly event tracking for inquiry form submits, WhatsApp clicks, and phone clicks.

# SECURITY, RELIABILITY AND OPERATIONS
- Input validation everywhere, parameterized queries only, XSS/CSRF/CORS protection, secure headers (CSP, HSTS), secrets in environment variables (provide `.env.example`), and no secrets in the repo.
- Automated daily database backups plus weekly upload backups with rotation (keep within disk budget) and a documented restore procedure.
- Logging, error monitoring (e.g., Sentry-compatible), uptime/health endpoint, and log rotation.
- Zero-downtime deployment: a CI script (GitHub Actions or a simple deploy script) with build, test, migrate, and PM2 reload, plus a rollback plan.
- Firewall (ufw), fail2ban, SSH hardening, and automatic security updates documented in a server setup guide.

# MIGRATION AND CUTOVER
- Build and test on a staging subdomain first.
- Run the data migration script in dry-run mode, then real mode, with a verification report (counts, orphaned records, broken image links).
- Convert legacy images to the new pipeline in batch (throttled so it doesn't exhaust RAM).
- Provide a cutover checklist: DNS/TTL, redirects verified, sitemap resubmitted, Search Console change notes, and a rollback path to the old site.

# TESTING AND ACCEPTANCE CRITERIA
- Unit and integration tests for the API, upload pipeline, and auth. Playwright E2E for: browse/filter/search cars, inquiry form, admin login, add/edit/delete vehicle, multi-image upload, and live update (admin edits a price and an open public tab changes within ~2 seconds without refresh).
- Visual regression vs. the legacy baseline: all pages pass.
- Lighthouse and Core Web Vitals targets met on staging.
- Structured data validates with zero errors.
- Load test (k6 or autocannon): the site stays responsive under realistic concurrent traffic within the 4 GB RAM budget.
- Final deliverables: source code, `README.md`, `docs/` (architecture, audit, deployment, backup/restore, admin user guide with screenshots, SEO checklist), a migration report, and a summary of everything that differs from the legacy site (should be nothing visible).

# WORKING RULES
- Ask me questions in one batch at the end of Phase 0, not one at a time.
- Make small, reviewable commits with clear messages, and keep a running `docs/progress.md`.
- Never delete or modify the legacy source; work in a new directory/repo.
- Prefer boring, well-maintained libraries. Justify every major dependency, and avoid heavy ones given the memory budget.
- If any requirement conflicts with another (e.g., design fidelity vs. performance), stop and present options with trade-offs instead of choosing silently.
- Start now with Phase 0, and present the Implementation Plan for my approval.