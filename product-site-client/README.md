# Product Site Client (React + Vite)

This directory contains the React frontend application for Product Site, built using Vite.

## Project Specifics

-   **Purpose:** [Describe the main purpose and features of this client application.]
-   **Key Technologies:** React, Vite, [Other major libraries, e.g., Redux, React Router, Tailwind CSS]

## Development Setup

### Prerequisites

-   Node.js (Recommended version: LTS, e.g., v18.x or v20.x)
-   npm (comes with Node.js)

### Installation

1.  Navigate to the client directory:
    ```bash
    cd product-site-client
    ```
2.  Install dependencies:
    ```bash
    npm install
    ```

### Running the Development Server

```bash
npm run dev
```

This will start the Vite development server, typically available at `http://localhost:5173` (or the next available port).

### Building for Production

```bash
npm run build
```

This command bundles the application into the `dist/` directory for deployment.

## Environment Variables

-   [Describe any environment variables used by the client, e.g., `VITE_API_BASE_URL`]
-   Refer to Vite's documentation on [Env Variables and Modes](https://vitejs.dev/guide/env-and-mode.html) for more details.

## Linting

ESLint is configured for this project. To lint your files:

```bash
npm run lint
```

---

## Original Vite Template Information (React + Vite)

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.
