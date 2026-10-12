# Phase 0 — Discovery & Audit + Implementation Plan
**Good Car Imports → Remastered (Next.js)**
*Audited: 2026-10-10 | Auditor: Antigravity*

---

## Part I — AUDIT (`docs/01-audit.md`)

---

### 1. Route / Page Inventory

#### 1.1 Public Frontend

| Legacy URL | File | Proposed New URL | Notes |
|---|---|---|---|
| `/` | `index.php` | `/` | Hero video, trust badges, featured vehicles (3), pre-order process steps |
| `/inventory.php` | `inventory.php` | `/inventory` | Grid + list view, sidebar filters (search/brand/body/price/grade), sort, pagination (6/page) |
| `/vehicle.php?slug=<slug>` | `vehicle.php` | `/vehicles/[slug]` | Photo gallery + lightbox, specs bar, spec table, description, booking form, map, similar vehicles |
| `/pre-order.php` | `pre-order.php` | `/pre-order` | Multi-step form (3 steps) |
| `/about.php` | `about.php` | `/about` | Heritage hero, values grid, CTA |
| `/contact.php` | `contact.php` | `/contact` | Inquiry form, map embed, address/hours/WhatsApp |

#### 1.2 Public API Endpoints

| Legacy | Action | New Route |
|---|---|---|
| `POST /api/inquiry.php` | `type=contact` | `POST /api/inquiries` |
| `POST /api/inquiry.php` | `type=booking` | `POST /api/inquiries` (with `vehicle_id`) |
| `POST /api/inquiry.php` | `type=pre_order` | `POST /api/pre-orders` |

#### 1.3 Admin Dashboard (`/admin/`)

| Legacy URL | Description | New URL |
|---|---|---|
| `/admin/login.php` | Login form, bcrypt verify, session | `/admin/login` |
| `/admin/logout.php` | Session destroy | `/admin/logout` |
| `/admin/dashboard.php` | 4 KPI cards, recent sales widget, pending inward widget, live forex ticker, notification bell | `/admin/dashboard` |
| `/admin/inventory.php` | Vehicle CRUD, multi-image upload, badge/status management | `/admin/inventory` |
| `/admin/stock-inward.php` | 5-stage import pipeline with auto-promotion to vehicles | `/admin/stock-inward` |
| `/admin/inquiries.php` | Inquiries + pre-orders management | `/admin/inquiries` |
| `/admin/sales-register.php` | Sales ledger | `/admin/sales` |
| `/admin/report.php` | Business report download | `/admin/reports` |

#### 1.4 Admin API (`/api/admin.php?action=`)

| Action | Method | Description |
|---|---|---|
| `add_vehicle` | POST | Add vehicle, multi-image upload, cover index, auto-slug |
| `edit_vehicle` | POST | Edit vehicle, replace gallery, auto-create sale record when status=sold |
| `delete_vehicle` | POST | Hard-delete (CASCADE photos, SET NULL sales/pipeline) |
| `get_vehicle` | GET | Fetch vehicle + photos for modal |
| `add_stock_inward` | POST | New auction-won record |
| `edit_stock_inward` | POST | Update stage; auto-promotes to vehicles at ctg_customs / dhaka_handover |
| `get_stock_inward` | GET | Fetch record for modal |
| `global_search` | GET | Cross-entity search (inventory + pipeline + sales) |
| `get_inquiry` | GET | Fetch + auto-mark new→contacted |
| `delete_inquiry` | POST | Delete inquiry |
| `get_pre_order` | GET | Fetch + auto-mark new→sourcing |
| `delete_pre_order` | POST | Delete pre-order |
| `read_notifications` | POST | Update session timestamp |

---

### 2. Database Schema (8 Tables)

Engine: InnoDB · Charset: utf8mb4_unicode_ci · MySQL 8.0.46 confirmed in dump.

#### `users`
Columns: `id`, `name`, `email` (UNIQUE), `password_hash` (bcrypt cost=12), `role` ENUM('admin','manager','staff'), `title`, `avatar_initials`, `is_active`, `last_login_at`, `created_at`, `updated_at`.

#### `vehicles` (Master Inventory)
Key columns: `stock_id`, `car_name`, `package_trim`, `year_of_manufacture`, `reiwa_year`, `color_name/code/hex`, `auction_grade`, `interior_grade`, `mileage_km`, `chassis_code` (UNIQUE), `transmission`, `engine_spec/cc`, `fuel_type` ENUM('Petrol','Diesel','Hybrid','PHEV','Electric','Octane'), `seats`, `drive_train`, `body_type` ENUM('SUV','Sedan','Hatchback','MPV','Crossover','Wagon','Coupe','Pickup','Microbus','HIACE-Van'), `brand`, `status` ENUM('available','port_clearance','vessel_transit','pre_booked','sold','reserved'), `price_bdt` BIGINT (stored in **paisa — divide by 100**), `landed_cost`, `cover_photo` (relative path), `description`, `safety_features/interior_features/exterior_features` (JSON), `is_featured`, `is_new_arrival`, `badge_text`, `showroom_location`, `slug`, `views_count`.

#### `vehicle_photos`
`vehicle_id` FK → vehicles(id) CASCADE, `file_path` (relative to UPLOAD_PATH), `label`, `file_size_bytes`, `is_cover`, `sort_order`.

#### `stock_inward` (Import Pipeline)
Stages: `auction_won → japan_yard → sea_transit → ctg_customs → dhaka_handover`.
Key fields: `won_price_jpy`, `bdt_equivalent`, `vessel_name`, `eta_date`, `duty_amount`, `bill_of_lading`, `jaai_cert`, `jumvea_cert`, `radiation_clear`.
**Auto-promotion rule:** ctg_customs → vehicle status=port_clearance; dhaka_handover → vehicle status=available.

#### `inquiries`
Types: contact/booking/general. Statuses: new→contacted→converted→closed. FK vehicle_id (SET NULL).

#### `pre_orders`
Statuses: new→sourcing→quoted→confirmed→closed. Fields: region_of_origin, body_style, make_model, year_from/to, budget_min/max_bdt (paisa), timeline, color_preference, whatsapp.

#### `sales`
Fields: vehicle_id (SET NULL), chassis_code, sale_price_bdt (paisa), client_area, payment_status (pending/partial/cleared/lc_settlement), delivery_status (pending/delivered/brta_pending), sale_date.

#### `settings` (Key-Value Store)
Active keys: forex_jpy_bdt, company_name, company_phone_1/2, company_email, company_address_1/2, whatsapp_number, business_hours, business_hours_note, smtp_host/port/username/password, smtp_from_email/name.

**Live backup data (dump: 2026-09-11):** 2 inquiries, 10 sample vehicles, 5 stock_inward, 3 sales. SMTP credentials are empty — uses PHPMailer.

---

### 3. Admin Features & Roles

**Roles in schema:** admin, manager, staff. **⚠️ RBAC is not enforced** — any authenticated user has full admin access in the legacy code. Must be fixed.

**Admin Feature Set:**
1. KPI Dashboard (revenue, monthly sales, live stock, leads + growth % vs prior period)
2. Live Inventory CRUD + multi-image upload
3. Stock Inward pipeline (5 stages, auto-promotion)
4. Inquiry + Pre-Order management
5. Sales Register
6. Business Report download
7. Global search across inventory/pipeline/sales
8. Notification bell with activity feed (10 latest events)
9. Live Forex ticker (¥1 = ৳X, refreshed from DB/cache)

---

### 4. Forms

| Form | Location | Method | Endpoint |
|---|---|---|---|
| Contact Inquiry | contact.php | AJAX POST | /api/inquiry.php (type=contact) |
| Vehicle Booking | vehicle.php sidebar | AJAX POST | /api/inquiry.php (type=booking) |
| Pre-Order (3-step) | pre-order.php | AJAX POST | /api/inquiry.php (type=pre_order) |
| Admin Login | admin/login.php | PHP form POST | session-based |
| Add Vehicle | Admin modal | AJAX multipart POST | /api/admin.php?action=add_vehicle |
| Edit Vehicle | Admin modal | AJAX multipart POST | /api/admin.php?action=edit_vehicle |
| Add/Edit Stock Inward | Admin modal | AJAX POST | /api/admin.php?action=add/edit_stock_inward |

---

### 5. Third-Party Integrations

| Service | Where Used | Details |
|---|---|---|
| WhatsApp | All pages (FAB), vehicle detail, contact | `wa.me/<number>?text=...` deep link; number +8801992424492 |
| Google Maps | vehicle.php, contact.php | iFrame embed + link to "56 Inner Circular Road Eastern Trade Center Dhaka" |
| PHPMailer (SMTP) | api/inquiry.php | Admin notification emails; SMTP config in settings table (currently empty) |
| ExchangeRate API | functions.php → getForexRate() | `api.exchangerate-api.com/v4/latest/JPY`; cached 1hr to `assets/forex_cache.json` |
| Google Fonts | design-tokens.css | Hanken Grotesk (400-800), Inter (300-700), Material Symbols Outlined |
| Facebook | Footer | facebook.com/share/1GgiR3HrNP/ |
| Instagram | Footer | instagram.com/goodcarimports/ |
| Privacy Policy / ToS | Footer | Google Docs links |
| **Analytics** | — | **MISSING — no GA4, no GSC** |
| **Cron Jobs** | — | **NONE found** |

---

### 6. File Upload System

| Aspect | Detail |
|---|---|
| Upload root | `assets/images/uploads/` |
| Vehicle photos | `uploads/vehicles/YYYY-MM/gci_<uniqid>.<ext>` |
| Static uploads | `uploads/home.mp4` (48.9 MB!), `cross.jpg`, `hero-car.jpg`, `preorder-bg.jpg`, `vezel.jpg`, `auction.png`, `lc300.jpg` |
| Max file size | 10 MB per file |
| Allowed MIME | `image/jpeg`, `image/png`, `image/webp` |
| Processing | **None** — raw upload only, no resize, no AVIF/WebP conversion, no EXIF strip |
| Cover photo | Stored as relative path in `vehicles.cover_photo` |

**Static assets (sizes):** logo.png 2.3 MB ⚠️, logo-transparent.png 109 KB, car-loader.gif 353 KB.

---

### 7. Legacy URL → New URL Redirect Map (301s needed)

| Legacy | New |
|---|---|
| `/` | `/` |
| `/inventory.php[?*]` | `/inventory[?*]` |
| `/vehicle.php?slug=<slug>` | `/vehicles/<slug>` |
| `/pre-order.php` | `/pre-order` |
| `/about.php` | `/about` |
| `/contact.php` | `/contact` |
| `/admin/`, `/admin/index.php` | `/admin` |
| `/admin/dashboard.php` | `/admin/dashboard` |
| `/admin/inventory.php` | `/admin/inventory` |
| `/admin/stock-inward.php` | `/admin/stock-inward` |
| `/admin/inquiries.php` | `/admin/inquiries` |
| `/admin/sales-register.php` | `/admin/sales` |
| `/admin/report.php` | `/admin/reports` |
| `/admin/login.php` | `/admin/login` |
| `/api/inquiry.php` | `/api/inquiries` |

---

### 8. Design System (Extracted Verbatim)

#### 8.1 Color Palette

**Light Mode (`:root`):**
```
--primary: #bc001f           (Vibrant Red)
--on-primary: #ffffff
--primary-container: #e6192e
--secondary: #5b5f63         (Chrome/Silver)
--tertiary: #006b2e          (WhatsApp Green)
--tertiary-container: #00873c
--error: #ba1a1a
--surface: #f8f9fa
--surface-container-lowest: #ffffff
--surface-container-low: #f3f4f5
--surface-container: #edeeef
--surface-container-high: #e7e8e9
--surface-container-highest: #e1e3e4
--on-surface: #191c1d
--background: #f8f9fa
--outline: #926e6c
--border-silver: #e2e8f0
--whatsapp-green: #25D366
--glass-bg: rgba(255,255,255,0.80)
--glass-blur: 12px
```

**Dark Mode (`[data-theme="dark"]`):** default for the site; stored in localStorage('theme').
```
--primary: #ff4d5e
--background: #121212
--surface: #121212
--surface-container: #1e1e1e
--on-surface: #e1e3e4
--glass-bg: rgba(20,20,20,0.85)
--border-silver: #333333
```

#### 8.2 Typography
```
--font-headline: 'Hanken Grotesk', sans-serif   (weights: 400,500,600,700,800)
--font-body: 'Inter', sans-serif                 (weights: 300,400,500,600,700)

Display Large:     48px / 56px / 700 / tracking -0.02em
Headline Large:    32px / 40px / 600
Headline Mobile:   28px / 36px / 600
Title Medium:      20px / 28px / 600
Body Large:        18px / 28px / 400
Body Medium:       16px / 24px / 400  (base body)
Label Small:       12px / 16px / 600 / tracking 0.05em
Price BDT:         24px / 32px / 700
```

#### 8.3 Spacing
```
--unit-xs: 4px  --unit-sm: 8px  --unit-md: 16px
--unit-lg: 24px  --unit-xl: 48px  --gutter: 24px
--container-max: 1440px
--margin-desktop: 64px  --margin-mobile: 20px
```

#### 8.4 Border Radii
```
--radius-sm: 2px  --radius: 4px  --radius-md: 6px
--radius-lg: 8px  --radius-xl: 12px  --radius-full: 9999px
```

#### 8.5 Shadows
```
--shadow-xs: 0 1px 2px rgba(0,0,0,0.04)
--shadow-sm: 0 1px 3px rgba(0,0,0,0.06)
--shadow-ambient: 0 20px 30px -10px rgba(91,95,99,0.06)
--shadow-card-hover: 0 20px 30px -10px rgba(91,95,99,0.10)
--shadow-modal: 0 25px 50px -12px rgba(0,0,0,0.15)
```

#### 8.6 Transitions & Animations
```
--transition-fast: 150ms ease
--transition-base: 200ms ease
--transition-slow: 300ms ease
```
Key animations:
- Nav underline slide-in on hover (width: 0→100%, 200ms)
- Header glass effect on scroll (opacity + backdrop-filter, 200ms)
- Vehicle card hover: shadow elevation (ambient→card-hover) + translateY(-4px)
- WhatsApp FAB pulse animation
- Site loader (first visit only, min 2s, sessionStorage flag)
- Grade pill toggle active state

#### 8.7 Sidebar Width (Admin)
```
--sidebar-width: 256px
```

#### 8.8 Breakpoints (inferred)
```
≤ 480px  — small mobile
≤ 768px  — mobile (container padding: 20px; hamburger nav; filter sidebar toggled)
≥ 769px  — tablet+
≥ 1024px — desktop
≥ 1440px — container max-width cap
```

#### 8.9 Business Logic Functions (to reimplement)
- `formatBDT(paisa, short)` — Bangladeshi comma format (e.g. ৳45,00,000 or ৳45.0L)
- `formatBDNumber(n)` — 2-digit grouping after first 3 digits
- `formatMileage(km)` — "34k KM" or "34,000 KM"
- `getGradeClass(grade)` — grade-excellent (5.0/S/6.0), grade-good (4.5/A), grade-standard (4.0/B), grade-fair (R/3.5)
- `getStatusBadge(status)` — color-coded HTML badge for 6 statuses
- `getInwardStageBadge(stage)` — 5 import pipeline stages
- `generateSlug(text)` — lowercase, alphanumeric + hyphens
- `getForexRate()` — Live JPY→BDT, cached 1hr
- Price stored as **paisa (×100)**; all DB prices must be divided by 100 for display

---

### 9. SEO Baseline (Current Gaps)

| Signal | Status |
|---|---|
| Title / Meta description | ✅ Dynamic per page |
| Canonical URL | ❌ Missing |
| Open Graph / Twitter Cards | ❌ Missing |
| JSON-LD Structured Data | ❌ Missing entirely |
| sitemap.xml | ❌ Missing |
| robots.txt | ❌ Missing |
| llms.txt | ❌ Missing |
| Breadcrumb schema | ❌ HTML only |
| Alt text | ⚠️ Present but generic |
| GA4 / GSC | ❌ Missing |
| Bilingual / hreflang | ❌ English only |
| IndexNow | ❌ Missing |

---

### 10. Security Gaps (Legacy → Must Fix in New)

| Issue | Legacy | New |
|---|---|---|
| CSRF protection | ❌ Missing | ✅ Next.js CSRF tokens or SameSite=Strict cookies |
| Rate limiting (login + forms) | ❌ Missing | ✅ BullMQ / middleware |
| RBAC enforcement | ❌ Not enforced | ✅ Role-based middleware |
| EXIF strip on upload | ❌ Missing | ✅ sharp strips EXIF |
| Image dimension limits | ❌ Missing | ✅ Validate in upload handler |
| Security headers (CSP/HSTS) | ❌ Missing | ✅ Nginx + Next.js headers |
| DEBUG_MODE in prod | ⚠️ true | ✅ false via .env |
| Parameterized queries | ✅ PDO | ✅ Prisma/Drizzle |
| bcrypt hashing | ✅ cost=12 | ✅ argon2id (stronger) |

---

### 11. Requirement Conflicts (Presented for Your Decision)

#### Conflict A — Design Fidelity vs. Image Pipeline
**Problem:** The brief requires "pixel-identical design" AND serving AVIF/WebP with `srcset`. The legacy serves raw JPEGs with no responsive images. A strict pixel-diff visual regression will flag any rendering difference from `srcset`.
- **Option 1 (Recommended):** Use `<picture>` with AVIF/WebP but match rendered pixel dimensions exactly → visual regression passes with minimal threshold
- **Option 2:** Serve original JPEG URLs only → no change but no image optimization

#### Conflict B — Hero Video vs. Core Web Vitals
**Problem:** The homepage uses a **48.9 MB** `home.mp4` autoplay hero video. This will fail LCP < 2.5s and Lighthouse ≥ 90 on mobile.
- **Option 1 (Recommended):** Add a static LCP poster image, `preload="none"` on video, defer load → LCP passes, video appearance unchanged (video loads after page is interactive)
- **Option 2:** Re-encode video to smaller size (requires approval — alters an asset)
- **Option 3:** Replace video with poster image → LCP improves but changes design

#### Conflict C — logo.png (2.3 MB) vs. Performance
**Problem:** Full logo is 2.3 MB. Serving it in the admin sidebar on every page load will hurt Lighthouse.
- **Option 1 (Recommended):** Serve optimized WebP/AVIF version via Next.js `<Image>` (transparent to user) — already uses `logo-transparent.png` (109 KB) for the nav
- **Option 2:** Keep original only

---

---

## Part II — IMPLEMENTATION PLAN

---

### Architecture Summary

```
┌─────────────────────────────────────────┐
│  Nginx (443 HTTPS, HTTP/2, gzip/brotli) │
│  Let's Encrypt TLS · Security Headers   │
└───────────────┬─────────────────────────┘
                │ reverse proxy :3000
┌───────────────▼─────────────────────────┐
│  Next.js 15 (App Router) + TypeScript   │
│  PM2 cluster mode                       │
│  ├─ Public pages: SSR + ISR             │
│  ├─ Dashboard: client-rendered (auth)   │
│  └─ Route Handlers: REST API            │
└──────┬──────────────┬────────────────────┘
       │              │
┌──────▼──────┐  ┌────▼──────────────────┐
│ MariaDB 10+ │  │ Redis 7 (mem-capped   │
│ Prisma ORM  │  │ 256MB, pub/sub,       │
│ ≤1GB RAM    │  │ BullMQ queue)         │
└─────────────┘  └───────────────────────┘
       │
┌──────▼──────────────────────────────────┐
│ BullMQ Worker: sharp image processing   │
│ (concurrency 2, AVIF+WebP+JPEG srcset,  │
│ EXIF strip, LQIP/blurhash)              │
└─────────────────────────────────────────┘
```

### Memory Budget (4 GB VPS)
| Service | Budget |
|---|---|
| Node.js (Next.js + PM2 2 workers) | ≤ 1 GB |
| MariaDB | ≤ 1 GB |
| Redis | ≤ 256 MB |
| Nginx | ≤ 100 MB |
| OS + headroom | ~650 MB |
| **Total** | **≤ 4 GB** |

---

### Dependency Justifications

| Dependency | Why | Alternatives rejected |
|---|---|---|
| **Next.js 15** | App Router gives SSR/ISR per route; only major React framework with built-in image optimization | Remix (less ISR support), Vite SPA (no SSR) |
| **TypeScript** | Required by brief; type-safety across DB models and API | — |
| **Prisma** | Generates typed queries from schema; MySQL/MariaDB support; migration tooling | Drizzle (less ecosystem for complex joins) |
| **MariaDB** | Keep legacy engine per brief; familiar syntax; simpler data migration | Switching to PostgreSQL (migration risk) |
| **Redis + BullMQ** | Required by brief for pub/sub + queue; BullMQ is the de-facto BullMQ successor | Raw Bull v3 (deprecated) |
| **sharp** | Required by brief; fastest Node.js image processor; AVIF/WebP output; EXIF strip | Jimp (slower), Imagemagick (heavyweight) |
| **Zod** | Validation across API route handlers; works with Prisma | Yup (heavier, less TS integration) |
| **PM2** | Process management + cluster mode; simpler than Docker Compose for single-VPS | Docker Compose (heavier; requires more RAM) |
| **jose (JWT)** | Lightweight JWT for httpOnly cookie auth; no secret exposure | jsonwebtoken (CommonJS, less tree-shakeable) |
| **Nodemailer** | SMTP email; drop-in replacement for PHPMailer logic | Resend SDK (requires new account) |
| **browser-image-compression** | Client-side pre-resize before upload (brief requirement) | canvas resize (more code) |
| **blurhash** | LQIP placeholder; tiny; widely used | thumbhash (newer, less ecosystem) |
| **Playwright** | Visual regression + E2E (brief requirement) | Cypress (no multi-browser visual regression) |
| **k6** | Load testing (brief requirement) | autocannon (less scripting capability) |

---

### Phase Breakdown

#### Phase 0 ✅ — Discovery & Audit (this document)
Deliverables: `docs/01-audit.md`, Implementation Plan, owner Q&A batch.

---

#### Phase 1 — Foundation & Dev Environment
*Prerequisite: answers to Q7–Q10 (SMTP, VPS, domain, fresh DB dump)*

Tasks:
1. Scaffold Next.js 15 project in `remastered-good-car-imports/` with TypeScript, App Router
2. Docker Compose for local dev: MariaDB, Redis, Node
3. Prisma schema mirroring the 8 legacy tables (plus new `image_variants` table for processed files)
4. `.env.example` with all required vars
5. Nginx config (HTTPS, HTTP/2, gzip, security headers, reverse proxy)
6. PM2 ecosystem file with memory limits
7. CI skeleton (GitHub Actions): lint → type-check → test → build
8. `docs/02-architecture.md` (final architecture diagram)

---

#### Phase 2 — Design System & Shell
*Prerequisite: Conflict A/B/C decisions*

Tasks:
1. Port `design-tokens.css` verbatim to `app/globals.css` CSS custom properties
2. Replicate `frontend.css` components as CSS Modules (no redesign — copy exact selectors)
3. Shared layout: `<Header>` (glassmorphic, scroll effect, theme toggle), `<Footer>` (social links, address, WhatsApp), `<SiteLoader>` (gif, sessionStorage flag), `<WhatsAppFAB>`
4. Playwright baseline screenshot suite: capture legacy pages at 375/768/1280/1920px (against staging legacy deploy)
5. Dark/light theme toggle (localStorage, `data-theme` on `<html>`)

---

#### Phase 3 — Public Pages (SSR/ISR)

Pages and their data patterns:

| Page | Strategy | Revalidation Trigger |
|---|---|---|
| `/` | ISR (revalidate: 60s) | On vehicle add/edit/delete via `revalidateTag('featured')` |
| `/inventory` | SSR (dynamic params) | On every request; filter params in URL |
| `/vehicles/[slug]` | ISR (revalidate: 30s) | On vehicle edit via `revalidateTag('vehicle-<slug>')` |
| `/pre-order` | Static | None (form page) |
| `/about` | Static | None |
| `/contact` | Static | None |

Tasks per page:
- Pixel-accurate HTML/CSS port from PHP
- SEO: `generateMetadata()` per page, Open Graph, canonical, breadcrumbs
- JSON-LD: Organization, AutoDealer, Vehicle/Offer, BreadcrumbList, WebSite+SearchAction
- `sitemap.xml` (dynamic, includes vehicle image entries + lastmod)
- `robots.txt`
- `/llms.txt` and `/llms-full.txt`

---

#### Phase 4 — Real-Time Updates & API

Tasks:
1. REST API route handlers for all public + admin API actions (replaces PHP endpoints)
2. Server-Sent Events endpoint `/api/sse` with Redis `SUBSCRIBE` for push updates to public tabs
3. ISR revalidation hooks: every dashboard mutation calls `revalidatePath`/`revalidateTag` + Redis `PUBLISH`
4. Public pages: `EventSource` client that patches vehicle cards in-place on SSE message (no full reload, no CLS)
5. Polling fallback (30s interval) if SSE fails
6. Dashboard real-time: new inquiries/vehicles appear instantly via SSE; optimistic UI with rollback
7. Automatic reconnection (exponential backoff)

SSE message format:
```json
{ "event": "vehicle.updated", "slug": "toyota-land-cruiser-300-...", "data": {...} }
```

---

#### Phase 5 — Image Upload Pipeline

Tasks:
1. Client: `browser-image-compression` pre-resize (max 2560px, quality 0.85)
2. Client: drag-and-drop multi-upload, 3–4 concurrent with per-file progress bars
3. Client: retry with backoff, instant local preview, drag-to-reorder, cover selection
4. API: `POST /api/admin/vehicles/[id]/photos` — accept raw upload, respond immediately with `{ status: "processing", jobId }`
5. BullMQ worker (`sharp`): strip EXIF, auto-rotate, generate AVIF+WebP+JPEG at [320,640,960,1440,2048]px, blurhash LQIP — concurrency 2
6. Storage: `public/uploads/vehicles/YYYY-MM/<chassis>/<width>.<format>` served by Nginx with `Cache-Control: immutable`
7. Storage interface (abstract): local disk → can swap to S3/R2 without rewriting upload handler
8. Disk usage monitor + orphan cleanup job (weekly)
9. Validation: MIME sniffing (`file-type` package), size limit (10 MB), dimension limit, filename sanitization
10. Frontend delivery: `<picture>` with AVIF/WebP sources, `srcset`, `sizes`, `loading="lazy"`, LCP image gets `priority` + explicit width/height

**Storage estimate:** 20 photos × 5MB ≈ 100MB raw; processed at 5 widths × 3 formats ≈ ~15MB total per vehicle (after compression). 50 GB disk → ~3,300 vehicle capacity before needing R2/CDN.

---

#### Phase 6 — Admin Dashboard & Auth

Tasks:
1. Auth: JWT in httpOnly cookie, argon2id password hashing, CSRF double-submit, rate limiting on login (5 attempts/15 min)
2. Password migration: detect bcrypt hash from legacy → verify, then rehash as argon2id on next login. Forced reset option if preferred.
3. Role-based middleware: `admin` → full access; `manager` → no delete, no settings; `staff` → read-only + inquiry management
4. Admin pages: Dashboard, Inventory, Stock Inward, Inquiries, Sales Register, Reports (pixel-accurate port)
5. Admin API: all 13 actions ported to Route Handlers with Zod validation
6. Global search (cross-entity, debounced)
7. Notification bell + activity feed

---

#### Phase 7 — SEO, Analytics, Security & Ops

Tasks:
1. All JSON-LD schemas: Organization, AutoDealer, LocalBusiness, Vehicle+Offer, BreadcrumbList, FAQPage, WebSite+SearchAction, ImageObject
2. OG image generation per vehicle (Next.js `ImageResponse`)
3. GA4 setup instructions + GSC/Bing Webmaster instructions
4. Privacy-friendly event tracking: inquiry submit, WhatsApp click, phone click
5. `ufw` + `fail2ban` + SSH hardening + unattended-upgrades documented in `docs/server-setup.md`
6. Automated daily DB backup + weekly upload backup with rotation
7. Sentry-compatible error monitoring (`@sentry/nextjs`)
8. Health endpoint `/api/health`
9. Log rotation (PM2 logrotate or logrotate.d)
10. Zero-downtime deploy script: build → migrate → PM2 reload → rollback plan

---

#### Testing & Acceptance

| Test | Tool | Trigger |
|---|---|---|
| Unit/integration (API, auth, upload) | Jest + Supertest | CI on every PR |
| E2E (browse/filter/search, inquiry form, admin CRUD, live update ≤2s) | Playwright | CI on every PR |
| Visual regression vs. baseline | Playwright `expect(page).toHaveScreenshot()` | CI on every PR |
| Structured data validation | Schema.org validator (automated via Playwright) | Before cutover |
| Lighthouse / Core Web Vitals | Playwright + lighthouse-ci | Before cutover |
| Load test | k6 | Before cutover |

---

#### Migration & Cutover Checklist

1. Run migration script dry-run → verify row counts + orphaned records + broken image links
2. Convert legacy uploads to new pipeline in batch (throttled, 2 concurrent sharp workers)
3. DNS TTL reduced to 60s ≥ 48h before cutover
4. Staging deploy + full test suite pass
5. Production deploy with zero-downtime PM2 reload
6. 301 redirects active for all legacy URLs
7. Sitemap resubmitted to Google Search Console + IndexNow ping
8. Search Console change-of-address notes
9. Rollback plan: repoint DNS A record to old server (TTL 60s → 1 min rollback)

---

### Proposed Timeline (Rough — to be confirmed after Q&A)

| Phase | Estimated Duration |
|---|---|
| Phase 1 — Foundation | 1 week |
| Phase 2 — Design System & Shell | 1 week |
| Phase 3 — Public Pages | 1.5 weeks |
| Phase 4 — Real-Time | 1 week |
| Phase 5 — Image Pipeline | 1 week |
| Phase 6 — Admin Dashboard | 1.5 weeks |
| Phase 7 — SEO, Ops, Testing | 1 week |
| Migration & Cutover | 0.5 weeks |
| **Total** | **~8.5 weeks** |

---

## Part III — Questions for Owner (Batch, per Working Rules)

> Please answer all of these before I write any application code.

**Business & Content**

1. **Brands / Cities:** Which car brands do you stock most frequently? Which cities beyond Dhaka should be targeted in SEO (e.g., Chittagong, Sylhet, Rajshahi, Khulna)?

2. **Bilingual:** Do you want English + Bangla? The legacy site is English-only. If yes, which pages need Bangla, and do you have translations ready?

3. **Company Claims:** The About page says "15+ years of experience" and "500+ Cars Delivered." Are these accurate for the new site? Any verifiable credentials to add (trade license, BARVIDA membership, etc.)?

4. **Customer Reviews:** Do you have real reviews (Google, Facebook) to display as structured data? Never fabricated.

5. **Blog / Guides:** Should I scaffold empty blog routes now for future content, or do you have content ready?

6. **AI Crawlers (`llms.txt`):** Can I allow GPTBot, OAI-SearchBot, ClaudeBot, PerplexityBot, Google-Extended, Applebot-Extended in robots.txt? Yes or No.

**Technical**

7. **SMTP Provider:** What email provider should I configure for transactional emails (inquiry notifications)? Options: Gmail SMTP, Sendgrid, Mailgun, Resend, or other.

8. **VPS & Staging:** Is the VPS already provisioned with Debian 12 and SSH access? Do you have a staging subdomain (e.g., `staging.goodcarimports.com`) or should we plan one?

9. **Domain & DNS:** Which domain registrar? Current TTL on the A record? We need to lower it to 60s ≥ 48h before cutover.

10. **Fresh Database Dump:** The backup is from 2026-09-11. Will you provide a fresh dump before Phase 1 begins, or should I work from the existing backup?

11. **Vehicle Photo Archive:** Are production vehicle photos in `assets/images/uploads/vehicles/`? Should I extract `good-car-imports-deploy.zip` (191 MB) to enumerate and migrate them?

12. **Admin Password:** Is the bcrypt hash in `database/seed.sql` the real production hash, or a placeholder? Preference: (a) migrate as-is and rehash on next login, or (b) force a password reset flow on first login?

**Design / Performance (Conflicts)**

13. **Conflict A — Image format:** Should I use `<picture>` with AVIF/WebP + `srcset` (Option 1 — recommended), or serve JPEG only (Option 2)?

14. **Conflict B — Hero video:** How should I handle the 48.9 MB `home.mp4`?
    - Option 1 (Recommended): Poster image + `preload="none"`, deferred video load
    - Option 2: Re-encode video to smaller file (you approve first)
    - Option 3: Replace video with a static poster image

15. **Conflict C — Logo size:** The 2.3 MB `logo.png` in the admin sidebar — should I serve it via Next.js `<Image>` (auto-optimized WebP, no visible change), or keep the raw PNG?

---

*— End of Phase 0 Audit & Implementation Plan —*
*Awaiting your answers to the 15 questions above. Once received, Phase 1 will begin immediately.*
