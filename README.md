# SkyOps Flight Tracking & Airspace Control - Setup Guide

This guide provides setup, installation, and testing instructions for the SkyOps Flight Tracking and Airspace Control dashboard.

---

## Prerequisites

Before setting up the project, make sure your development machine has the following tools installed:
- **Node.js**: v20.0.0 or higher (LTS recommended)
- **npm**: v10.0.0 or higher
- **Angular CLI**: Managed locally through the project's development dependencies

---

## Setup & Installation

### 1. Install Dependencies
To install the project dependencies, navigate to the root directory of the project in your terminal and run:
```bash
npm install
```
This will fetch and configure all packages, including **Angular 21**, **Tailwind CSS v4**, **Leaflet**, and **Vitest**.

### 2. Run the Development Server
To start the local Angular development server:
```bash
npm run start
```
or run directly via Angular CLI:
```bash
npx ng serve
```

Once compilation is complete, open your web browser and go to **`http://localhost:4200/`**. The application will automatically hot-reload whenever you save changes to your source files.

### 3. Build for Production
To compile the application with full optimizations and bundle production assets:
```bash
npm run build
```
The production bundle will be generated inside the `dist/` directory, ready for static deployment to standard cloud platforms (e.g., Netlify, Vercel, Firebase Hosting).

---

## Testing Guide

This project is configured with **Vitest** via the Angular build pipeline (`@angular/build:unit-test`), offering rapid unit testing execution inside a JSDOM environment.

### Run Tests Once
To run all tests once and verify compile/execution correctness:
```bash
npx ng test --watch=false
```

### Run Tests in Watch Mode
To run tests continuously during active code changes:
```bash
npx ng test
```
