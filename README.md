# PHIDHOSTING

Tanzania's professional hosting provider — domains, web hosting & business email SaaS platform.

## Tech Stack

- **Framework:** Next.js 15 (App Router)
- **Auth:** NextAuth.js v5 (beta) — JWT strategy, Credentials provider
- **ORM:** Prisma v5 — SQLite (dev) / MySQL (production)
- **Styling:** Tailwind CSS v3, custom brand/navy/accent palette
- **UI:** Radix UI primitives, Lucide React icons
- **Forms:** React Hook Form + Zod validation
- **Email:** Nodemailer (SMTP)

## Features

### Customer Dashboard (`/dashboard`)
- Overview stats (domains, hosting, email, invoices)
- Domain management
- Web hosting accounts
- Email hosting services
- Invoices & payment history
- Support tickets (open / view thread)
- Notifications
- Profile & account settings

### Admin Panel (`/admin`)
- Overview with live platform stats & alerts
- Customer management (search, detail view)
- Domain management (expiry tracking)
- Web hosting accounts
- Email hosting services
- Finance (invoices + payments)
- Support tickets (view thread, reply, assign, change status)
- Provisioning jobs (retry failed jobs)
- Server infrastructure (WHM/cPanel + Mailcow)
- DNS records & registrar integrations
- Staff & role management
- Audit logs
- System settings

## Getting Started

### Prerequisites
- Node.js ≥ 18
- pnpm / npm / yarn

### Installation

```bash
# 1. Clone
git clone https://github.com/PHIDTECH/phidhosting.git
cd phidhosting

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env and fill in all required values

# 4. Set up the database
npm run db:push

# 5. Seed with sample data
npm run db:seed

# 6. Start development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

### Seed Credentials

| Role  | Email                    | Password     |
|-------|--------------------------|--------------|
| Admin | admin@phidhosting.com    | Admin@123!   |
| Demo  | demo@example.com         | Customer@123!|

## Project Structure

```
src/
├── app/
│   ├── (public)/          # Public marketing pages
│   ├── (auth)/            # /login, /register
│   ├── (dashboard)/       # Customer dashboard
│   ├── (admin)/           # Admin panel
│   └── api/               # API routes
├── components/
│   ├── ui/                # Base UI components
│   ├── dashboard/         # Dashboard sidebar + topbar
│   ├── admin/             # Admin sidebar + topbar
│   ├── home/              # Landing page sections
│   └── layout/            # Navbar, Footer
├── lib/
│   ├── auth.ts            # NextAuth config
│   ├── prisma.ts          # Prisma client
│   └── utils.ts           # Utilities
└── middleware.ts           # Route protection
prisma/
├── schema.prisma           # Database schema
└── seed.ts                 # Seed data
```

## Environment Variables

See `.env.example` for the full list. Key variables:

| Variable | Description |
|---|---|
| `DATABASE_URL` | SQLite (`file:./dev.db`) or MySQL connection string |
| `AUTH_SECRET` | Random 32-char secret for NextAuth |
| `SMTP_*` | SMTP credentials for transactional email |
| `SPACESHIP_API_*` | Spaceship domain registrar API |
| `WHM_*` | WHM/cPanel server API credentials |
| `MAILCOW_*` | Mailcow email server API credentials |

## Scripts

```bash
npm run dev          # Start development server
npm run build        # Production build
npm run db:push      # Push schema to DB (no migration)
npm run db:migrate   # Create & run migration
npm run db:seed      # Seed database
npm run db:studio    # Open Prisma Studio
```

## License

Private — PHIDTECH. All rights reserved.
