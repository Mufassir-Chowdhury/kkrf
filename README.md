# Kishorkontho Pathok Forum (KKRF) - Sylhet Mahanagar

A comprehensive web portal for **Kishorkontho Pathok Forum, Sylhet Mahanagar**, built with SvelteKit. This application manages the organization's activities, scholarship programs (Medhabritti), exam results, and information dissemination.

## 🚀 Features

### Public Portal
- **Dynamic Home Page**: Features an interactive carousel, activity accordion, and committee member profiles.
- **Scholarship Management (Medhabritti)**: 
  - Information and admit card distribution for annual scholarship exams.
  - Online registration system (`/britti_registration`).
- **Exam Results**: 
  - Automated parsing and display of exam results from CSV (`/results`).
  - Filtering by Class (4th-10th) and Category (Talentpool, General, Special).
- **Interactive Search**: Integrated with **Algolia** for fast content discovery.
- **PDF Generation**: Capabilities to generate and download documents (e.g., Admit Cards) using `html2pdf.js` and `jspdf`.
- **Responsive Design**: Fully responsive UI built with **TailwindCSS**.

### Administrative
- **Admin Panel**: Dedicated section (`/(admin)`) for managing content and data.
- **Authentication**: secure login handling (`/login`).

## 🛠 Tech Stack

- **Framework**: [SvelteKit](https://kit.svelte.dev/) (SSR + CSR)
- **Styling**: [TailwindCSS](https://tailwindcss.com/)
- **Backend/Data**: 
  - **Firebase** (Hosting/Auth/Database)
  - **PapaParse** (CSV Parsing for results)
- **Search**: [Algolia](https://www.algolia.com/)
- **Utilities**: `jspdf`, `html2pdf.js`

## 📂 Project Structure

```bash
src/
├── lib/            # Shared utilities (Firebase init, components)
├── routes/         # Application routes (File-based routing)
│   ├── (admin)/    # Admin-only routes
│   ├── results/    # Result display logic (CSV parsing)
│   ├── admit/      # Admit card generation
│   └── ...         # Other static/functional pages
└── app.html        # Main HTML entry point
```

## ⚡ Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- npm or pnpm

### Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd kkrf
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Build for production:
   ```bash
   npm run build
   ```

## 🔮 Roadmap & Improvements

While the application is functional, the following areas have been identified for future enhancement:

### 🏗 Architecture & Code Quality
- **Migrate to TypeScript**: The codebase currently uses JavaScript. Adopting TypeScript would improve type safety and maintainability.
- **Component Reusability**: Extract common UI elements (cards, buttons, modals) into the `src/lib/components` directory to reduce duplication.
- **Environment Variables**: Ensure all sensitive keys (Firebase, Algolia) are strictly managed via `.env` files.

### 🚀 Data Management
- **Dynamic Content**: Move hardcoded data (Committee members, Activities) from Svelte files to a database (Firebase Firestore) to allow non-technical admins to update them.
- **Database for Results**: Currently, results are loaded from a static CSV file. This should be migrated to a database query for better performance, security, and scalability.

### 🛡 Reliability & Testing
- **Error Handling**: Implement global error boundaries and user-friendly error messages (e.g., if the CSV fails to load).
- **Testing**: Add unit tests for utility functions and End-to-End (E2E) tests using Playwright/Cypress for critical flows like Registration and Result checking.

### ⚡ Performance
- **Image Optimization**: Use `svelte-img` or similar tools for automatic image resizing and lazy loading.
- **Result Pagination**: If the results dataset grows large, implement server-side pagination instead of client-side filtering.
