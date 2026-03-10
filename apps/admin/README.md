# 🛠️ AutoVendo — Admin Dashboard

The mission control for the AutoVendo ecosystem. Designed for operational efficiency and platform moderation.

## 🎯 Primary Functions

- **Listing Management**: Review, approve, or flag vehicle listings for quality assurance.
- **Dealer Oversight**: Manage dealer registrations, verify business credentials, and monitor performance.
- **Platform Analytics**: High-level insights into marketplace activity and user growth.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **Database**: Prisma + PostgreSQL
- **Components**: Shared `@repo/ui` library
- **Auth**: Role-based access control (RBAC)

---

## 💻 Development

Run the development server:

```bash
npm run dev
```

Or via the monorepo root:

```bash
npm run dev --filter=admin
```

---

## 🛡️ Moderation Workflow

All vehicle data is accessed via the `@repo/db` package, ensuring consistent data structures and shared validation logic with the main Web portal.
