# 🏎️ AutoVendo — Premium Vehicle Marketplace Monorepo

[![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3.4-38B2AC?style=for-the-badge&logo=tailwind-css)](https://tailwindcss.com/)
[![Turborepo](https://img.shields.io/badge/Turborepo-2.0-EF4444?style=for-the-badge&logo=turborepo)](https://turbo.build/)
[![Prisma](https://img.shields.io/badge/Prisma-5-2D3748?style=for-the-badge&logo=prisma)](https://www.prisma.io/)

AutoVendo is a state-of-the-art vehicle marketplace engineered for speed, security, and a premium user experience. Built as a high-performance monorepo, it seamlessly integrates a customer-facing marketplace with a powerful administrative suite.

---

## 🏗️ Architecture

AutoVendo utilizes a modern monorepo structure powered by **Turborepo**, ensuring efficient builds and seamless code sharing across applications.

### 📱 Applications

- **[Web](apps/web)**: The flagship marketplace. Features advanced multi-step vehicle insertion, dynamic filtering, and a glassmorphic UI.
- **[Admin](apps/admin)**: Command center for platform operators. Oversee inventory, manage dealer registrations, and monitor ecosystem health.

### 📦 Core Packages

- **`@repo/ui`**: A high-end, atomic design system library built with Radix UI and Tailwind CSS.
- **`@repo/db`**: The centralized data layer, including our optimized Prisma schema and type-safe client.
- **`@repo/auth`**: Unified authentication and authorization logic.
- **`@repo/utils`**: Shared business logic, formatting helpers, and common utilities.

---

## ✨ Key Features

- **🛡️ Secure Vehicle Inserter**: A rigorous 4-step listing process with strict Zod validation, anti-tampering logic, and MIME-type secured media uploads.
- **⚡ High-Performance Search**: Real-time filtering powered by a centralized constants system for cars, trucks, and campers.
- **🎨 Elite Aesthetics**: A "wow" factor design philosophy featuring dark mode, smooth transitions, and premium typography.
- **📱 Device Agnostic**: Fully responsive architecture optimized for mobile, tablet, and desktop experiences.

---

## 🚀 Getting Started

### Prerequisites

- **Node.js**: `v18.17.0` or higher
- **Database**: PostgreSQL (recommended)
- **Package Manager**: `npm` (configured with workspaces)

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/aliyansajid/autovendo.git
    cd autovendo
    ```
2.  **Install Dependencies**
    ```bash
    npm install
    ```
3.  **Environment Setup**
    Copy `.env.example` in both root and `apps/web` to `.env` and configure your credentials.
4.  **Database Migration**
    ```bash
    npx turbo db:push
    ```
5.  **Run Development**
    ```bash
    npm run dev
    ```

---

## 🛠️ Development Workflow

AutoVendo leverages Turbo's filtering for a focused development experience:

- **Run Web only**: `npm run dev --filter=web`
- **Build all**: `npm run build`
- **Lint all**: `npm run lint`
- **Type Check**: `npm run check-types`

---

## 📄 License

This project is proprietary. All rights reserved.
