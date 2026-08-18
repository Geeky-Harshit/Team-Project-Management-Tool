# Team Management Tool (TMT)

A **multi-tenant Kanban project management application** built with **Next.js 16 App Router**, **Prisma ORM 7**, **Neon PostgreSQL**, **Better Auth**, and **server-first authorization**.

TMT enables teams to collaborate within organizations using Kanban boards while providing secure role-based access control, member invitations, activity tracking, and an organization-level dashboard.

---

## ✨ Features

### 🔐 Authentication

- Email & Password authentication
- Session-based authentication with Better Auth (PostgreSQL adapter)
- Protected routes using middleware/proxy
- Secure server-side session validation

### 🏢 Organization Management

- Create organizations with unique slug-based URLs
- Switch seamlessly between multiple organizations
- Multi-tenant architecture
- Organization context available across all organization routes

### 👥 Members & Invitations

- Invite members via email
- Secure token-based invitation flow
- Validate and accept invitations
- Pending invite management
- Remove pending invitations
- Prevent duplicate active invitations for the same email

### 🔑 Role-Based Access Control

Supported roles:

- **Owner**
- **Admin**
- **Member**
- **Viewer**

Permissions are enforced **server-side** to ensure users cannot bypass authorization from the client.

---

## 📋 Boards & Tasks

### Boards

- Create boards
- Rename boards
- Archive boards
- Restore archived boards

### Lists

- Create lists
- Rename lists
- Delete lists (with cascade deletion)

### Cards

- Create cards
- Edit card details
- Assign members
- Set due dates
- Move cards between lists
- Reorder cards

### Comments

- Add comments
- Reply to comments
- Activity tracking

---

## 🎯 Drag & Drop

Built with **dnd-kit** for smooth Kanban interactions.

Features include:

- Drag cards across lists
- Dynamic tilt angle based on drag direction
- Reorder cards
- Persistent ordering via atomic SQL transactions

---

## 📊 Dashboard

Organization dashboard provides:

- Organization statistics
- Recent activity feed
- Overdue task summary
- Member workload overview

---

## 📜 Activity Feed

Major actions are logged automatically, including:

- Board creation
- List updates
- Card creation
- Card movement
- Comments
- Member invitations
- Organization events

---

## 🎨 User Experience

- Loading skeletons
- Route-level error pages
- Route-level not found pages
- Toast notifications
- Responsive UI

---

# 🛠 Tech Stack

| Category | Technology |
|----------|------------|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| UI | React 19 |
| Styling | Tailwind CSS |
| Components | shadcn/ui |
| Database | PostgreSQL (Neon Serverless) |
| ORM | Prisma ORM 7 (`@prisma/adapter-neon`) |
| Authentication | Better Auth |
| Drag & Drop | dnd-kit |
| Notifications | Sonner |
| Email | Nodemailer |
| Fake Data | Faker |

---

# 📁 Project Structure

```text
├── prisma
│   ├── schema.prisma
│   └── migrations/
├── prisma.config.ts
├── src
│   ├── actions
│   │   ├── boards-action.ts
│   │   ├── cards-action.ts
│   │   └── lists-action.ts
│   ├── app
│   │   ├── (auth)
│   │   │   ├── sign-in
│   │   │   │   └── page.tsx
│   │   │   └── sign-up
│   │   │       └── page.tsx
│   │   ├── [orgSlug]
│   │   │   ├── boards
│   │   │   │   ├── [boardId]
│   │   │   │   │   ├── loading.tsx
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── archived
│   │   │   │   │   └── page.tsx
│   │   │   │   ├── loading.tsx
│   │   │   │   └── page.tsx
│   │   │   ├── error.tsx
│   │   │   ├── layout.tsx
│   │   │   ├── members
│   │   │   │   └── page.tsx
│   │   │   ├── not-found.tsx
│   │   │   └── page.tsx
│   │   ├── api
│   │   │   ├── activity
│   │   │   │   └── route.ts
│   │   │   ├── auth
│   │   │   │   └── [...all]
│   │   │   │       └── route.ts
│   │   │   ├── boards
│   │   │   │   └── [id]
│   │   │   │       └── cards
│   │   │   │           └── route.ts
│   │   │   ├── cards
│   │   │   │   └── [cardId]
│   │   │   │       └── comments
│   │   │   │           └── route.ts
│   │   │   ├── invites
│   │   │   │   ├── [token]
│   │   │   │   │   ├── accept
│   │   │   │   │   │   └── route.ts
│   │   │   │   │   └── route.ts
│   │   │   │   └── route.ts
│   │   │   └── orgs
│   │   │       └── [slug]
│   │   │           └── boards
│   │   │               └── route.ts
│   │   ├── dashboard
│   │   │   └── page.tsx
│   │   ├── error.tsx
│   │   ├── globals.css
│   │   ├── invite
│   │   │   └── page.tsx
│   │   ├── layout.tsx
│   │   ├── not-found.tsx
│   │   └── page.tsx
│   ├── components
│   │   ├── board
│   │   │   ├── board-header.tsx
│   │   │   ├── card-comments.tsx
│   │   │   ├── card-detail-modal.tsx
│   │   │   ├── card-item.tsx
│   │   │   ├── column-header.tsx
│   │   │   ├── kanban-board.tsx
│   │   │   ├── list-column.tsx
│   │   │   └── restore-board-button.tsx
│   │   ├── create-board-card.tsx
│   │   ├── create-card-form.tsx
│   │   ├── create-list-form.tsx
│   │   ├── dashboard
│   │   │   ├── dashboard-stats.tsx
│   │   │   ├── organization-form.tsx
│   │   │   ├── organization-list.tsx
│   │   │   ├── overdue-tasks.tsx
│   │   │   ├── workload-breakdown.tsx
│   │   │   └── workspace-activity.tsx
│   │   ├── invite
│   │   │   ├── invite-card.tsx
│   │   │   └── invite-error.tsx
│   │   ├── members
│   │   │   ├── invite-form.tsx
│   │   │   ├── member-row.tsx
│   │   │   ├── members-client.tsx
│   │   │   ├── members-list.tsx
│   │   │   └── pending-invites.tsx
│   │   ├── navbar.tsx
│   │   ├── sidebar.tsx
│   │   └── ui
│   │       ├── avatar.tsx
│   │       ├── button.tsx
│   │       ├── card.tsx
│   │       ├── dropdown-menu.tsx
│   │       ├── input.tsx
│   │       ├── label.tsx
│   │       └── textarea.tsx
│   ├── context
│   │   └── org-context.tsx
│   ├── generated/prisma
│   ├── hooks
│   │   └── useOrgs.ts
│   ├── lib
│   │   ├── activity-logger.ts
│   │   ├── auth
│   │   │   ├── auth-client.ts
│   │   │   ├── auth.ts
│   │   │   ├── permissions.ts
│   │   │   └── server-permissions.ts
│   │   ├── mailer.ts
│   │   ├── prisma.ts
│   │   └── utils.ts
│   ├── proxy.ts
│   ├── scripts
│   │   └── seed.ts
│   └── types
│       ├── activity.ts
│       ├── board.ts
│       ├── card.ts
│       ├── index.ts
│       └── organization.ts
```

---

# 🔐 Authentication & Authorization

Authentication is powered by **Better Auth**.

Features include:

- Email/password login
- Session management
- Organization support
- Role-based authorization
- Server-side permission checks

Authorization is enforced on the server for all protected operations.

---

# 🌐 Multi-Tenant Routing

Organizations use slug-based routing:

```text
/{orgSlug}
```

Example:

```text
/geekyants
/geekyants/boards
/geekyants/dashboard
/geekyants/settings
```

The active organization is managed globally using `OrgContext`.

---

# 🚀 Getting Started

## Prerequisites

- Node.js 20+
- PostgreSQL database (e.g., [Neon DB](https://neon.tech))

---

## Clone the repository

```bash
git clone <repository-url>
cd team-management-tool
```

---

## Install dependencies

```bash
npm install
```

---

## Configure Environment Variables

Create a `.env` file in the root directory:

```env
DATABASE_URL="postgresql://<user>:<password>@<neon-host>.neon.tech/neondb?sslmode=require"

BETTER_AUTH_SECRET="your-better-auth-secret"
BETTER_AUTH_URL=http://localhost:3000
NEXT_PUBLIC_BETTER_AUTH_URL=http://localhost:3000

SMTP_HOST=smtp.example.com
SMTP_PORT=587
SMTP_USER=user@example.com
SMTP_PASS=password
SMTP_FROM=noreply@example.com
```

---

## Push Schema & Generate Prisma Client

Push the database models to Neon PostgreSQL and generate the typed Prisma Client:

```bash
npx prisma db push
npx prisma generate
```

---

## Start Development Server

```bash
npm run dev
```

Open:

```
http://localhost:3000
```

---

# 📜 Available Scripts

## Development

```bash
npm run dev
```

## Production Build

```bash
npm run build
```

## Start Production

```bash
npm run start
```

## Lint

```bash
npm run lint
```

## Prisma Database Management

```bash
# Push schema changes to the database
npx prisma db push

# Generate typed client
npx prisma generate

# Open visual web database browser
npx prisma studio
```

---

# 🌱 Seed Data

The seed script generates realistic demo data in PostgreSQL.

Run:

```bash
npx tsx src/scripts/seed.ts
```

Seeded data includes:

- 3 Organizations
- 12 Users (Default password: `Password@123`)
- 5 Boards
- Multiple Lists
- 220 Cards
- 500+ Activity Logs
- Valid invite tokens
- Expired invite tokens

---

# 📡 API Overview

### Organizations

- Create organization
- List organizations
- Switch active organization

### Boards

```
GET    /api/orgs/[slug]/boards
POST   /api/orgs/[slug]/boards
```

### Lists

- Create list
- Update list
- Delete list

### Cards

- Create card
- Update card
- Delete card
- Reorder cards
- Drag & Drop across lists

### Comments

- Create comment
- Reply to comment

### Invitations

```
GET     /api/invites
POST    /api/invites
DELETE  /api/invites
```

Validate invite:

```
GET /api/invites/[token]
```

Accept invite:

```
POST /api/invites/[token]/accept
```

### Activity

```
GET /api/activity
```
```