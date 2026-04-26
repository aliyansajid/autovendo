# 🌐 AutoVendo — Web Portal

The flagship customer-facing marketplace for AutoVendo. Designed for visual excellence and robust data integrity.

## 🚀 Key Modules

### **1. Vehicle Insertion Engine**

A secure, multi-step flow for creating high-quality listings.

- **Security**: Strict enum validation against aggregated constants.
- **Media**: Secure image uploads with MIME-type verification (PNG/JPG/WEBP).
- **UX**: Dynamic form fields that adapt based on the vehicle category (Car, Truck, Camper, etc.).

### **2. Advanced Search & Discovery**

- Real-time filtering across thousands of attributes.
- Centralized constants ensures search parameters are always valid and synchronized with the database.

---

## 🛠️ Technology Stack

- **Framework**: Next.js 14 (App Router)
- **State Management**: React Hook Form
- **Validation**: Zod (High-security implementation)
- **UI Components**: Shared `@repo/ui` library
- **Icons**: Lucide React

---

## 💻 Development

Run the development server natively:

```bash
npm run dev
```

Or via the root monorepo:

```bash
npm run dev --filter=web
```

---

## 🔒 Security Measures

This app implements strict client and server-side validation to prevent payload injection and data tampering in high-stakes forms (like vehicle pricing and contact info).
