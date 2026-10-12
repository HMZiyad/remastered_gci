# Architecture & Infrastructure
**Good Car Imports → Remastered**

This document outlines the architecture, deployment infrastructure, and memory management strategy designed specifically for the 4 GB RAM VPS constraint.

---

## 1. System Overview

```mermaid
graph TD
    Client[Client / Browser]
    Nginx[Nginx Reverse Proxy]
    Next[Next.js 15 (Node.js)]
    DB[(MariaDB)]
    Redis[(Redis)]
    Worker[BullMQ Worker (Node.js)]

    Client -- HTTPS --> Nginx
    Nginx -- Static Uploads --> Disk
    Nginx -- Dynamic / SSR --> Next
    Next -- Read/Write --> DB
    Next -- Pub/Sub & Queue --> Redis
    Redis -- Jobs --> Worker
    Worker -- Update Status --> DB
    Worker -- Processed Images --> Disk
```

---

## 2. Component Specifications

### 2.1 Web Server (Nginx)
- **Role:** SSL termination, HTTP/2 multiplexing, static file serving, and reverse proxy.
- **Why:** Serves images directly from `/public/uploads/` bypassing Node.js entirely, saving massive amounts of memory and CPU.
- **Memory Budget:** ~100 MB.

### 2.2 Application Server (Next.js 15)
- **Role:** SSR, ISR, and API route handlers.
- **Process Manager:** PM2 in `cluster` mode (2 instances).
- **Memory Limit:** 400 MB per instance (800 MB total). PM2 will auto-restart an instance if it exceeds this threshold (`max_memory_restart`).
- **Why PM2 over Docker?** Dockerizing Node.js adds unnecessary memory overhead for a single-node deployment. PM2 cluster mode utilizes multiple cores efficiently while sharing the host OS memory pool.

### 2.3 Database (MariaDB 10.11)
- **Role:** Persistent relational data.
- **Why MariaDB?** Requested in the brief to keep the legacy engine. Migrating data from the PHP app's raw SQL dumps is much safer when staying within the MySQL ecosystem.
- **Memory Budget:** Cap `innodb_buffer_pool_size` to 512 MB to ensure it doesn't starve the Node processes. (Total DB budget: ~1 GB).

### 2.4 In-Memory Datastore (Redis 7)
- **Role:** Pub/Sub for Server-Sent Events (SSE) and job queue backing (BullMQ).
- **Configuration:** `maxmemory 256mb` with `allkeys-lru` eviction policy.
- **Why:** Essential for real-time dashboard updates without polling, and required by BullMQ for background image processing.

### 2.5 Background Worker (BullMQ + sharp)
- **Role:** Processes raw image uploads into AVIF, WebP, and scaled JPEGs, plus generates blurhashes.
- **Process Manager:** PM2 (1 instance).
- **Memory Management:** `sharp` is a memory-hungry C++ binding. The worker is configured with `WORKER_CONCURRENCY=2` to ensure it only processes 2 images simultaneously, preventing out-of-memory (OOM) kills on the 4 GB VPS. Memory capped at 200 MB via PM2.

---

## 3. Storage Pipeline

1. Admin uploads raw image (e.g. 5 MB JPEG) via dashboard.
2. Next.js API receives file, writes temporary file to disk, creates `VehiclePhoto` DB record, and adds job to BullMQ.
3. API responds immediately (`202 Accepted`).
4. BullMQ worker picks up job:
   - Strips EXIF data.
   - Generates sizes: 320w, 640w, 960w, 1440w, 2048w.
   - Generates formats: AVIF, WebP, JPEG.
   - Generates `blurhash` for LQIP (Low Quality Image Placeholder).
   - Writes generated files to `/public/uploads/vehicles/YYYY-MM/`.
   - Inserts records into `image_variants` table.
5. On completion, Worker publishes Redis event `photo.processed`.
6. Next.js SSE pushes event to Admin dashboard to update UI.

---

## 4. Security Measures

- **Authentication:** Argon2id password hashing; short-lived JWT stored in `httpOnly`, `Secure`, `SameSite=Lax` cookies.
- **API Protection:** Next.js Route Handlers validate all incoming payloads using `zod`.
- **Infrastructure:** Nginx configured with HSTS, CSP, X-Frame-Options. `DEBUG_MODE` strictly false in production.

---

## 5. Total Memory Budget (4 GB VPS)

| Component | Budget | Configuration Mechanism |
|---|---|---|
| OS / Kernel / Headroom | ~750 MB | Native |
| MariaDB | ~1000 MB | `innodb_buffer_pool_size=512M` |
| Next.js (PM2 Cluster) | 800 MB | `max_memory_restart: '400M'` (x2) |
| BullMQ Worker (PM2) | 200 MB | `max_memory_restart: '200M'`, concurrency=2 |
| Redis | 256 MB | `maxmemory 256mb` in `redis.conf` |
| Nginx | ~100 MB | Default |
| **Total** | **~3106 MB** | (~900 MB safe buffer for spikes) |
