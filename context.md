# FramStack POC Context

## 1) Project Vision
Build a desktop-first Inventory Management Proof of Concept (POC) using Tauri + React + TypeScript + SQLite, with role-based access (Admin and User), focused on inventory, sales, purchase, analytics, and administration.

Primary goal: demonstrate a clean, scalable, and production-oriented architecture in a demo-ready application.

## 2) Core Principles
- Always refer to latest official documentation before implementation decisions.
- Keep architecture modular so POC can evolve into production.
- Apply role-based authorization consistently in UI, API commands, and database operations.
- Keep auditability in mind for inventory and financial-impacting transactions.

## 3) Documentation-First Rule (Mandatory)
For every phase and feature, verify with latest docs first:
- Tauri v2 docs (commands, security, capabilities, plugins)
- React docs (component patterns, hooks, routing)
- TypeScript docs (strict typing, utility types)
- SQLite docs (schema, transactions, indexes, pragmas)
- Tailwind CSS docs (latest setup and configuration)

Definition of done for any task includes a short note: "Checked latest documentation".

## 4) POC Scope
In scope:
- Desktop app shell with auth and role-based navigation.
- Inventory stock management flow.
- Product, Season, User management (Admin only).
- Sales and Purchase transaction recording.
- Basic Analytics dashboard.
- Local SQLite persistence.

Out of scope for initial POC:
- Cloud sync / multi-device sync.
- Advanced forecasting/ML.
- Multi-warehouse advanced optimization.
- External billing integrations.

## 5) Roles and Permissions
### Admin
- Can access all modules.
- User creation and role assignment.
- Product creation/edit and lifecycle management.
- Season creation/edit.
- Stock adjustment operations.
- View all analytics and admin settings.

### User
- Access to operational modules (as permitted): Sales, Purchase, Inventory views.
- Cannot access admin management pages.
- Cannot create/modify users.

## 6) Layout and Navigation Decisions
### Main Window Layout
- Top Navbar: global actions and context.
- Left Sidebar: module navigation.
- Main Content Area: page content.

### Navbar (keep minimal and global)
- App name and environment badge (POC).
- Global search (products, transactions, users depending on role).
- Quick actions (role-based): new sale, new purchase, add stock.
- Notifications (low-stock alerts, pending tasks).
- User profile menu (role, settings, logout).

### Sidebar (primary modules)
Common:
- Dashboard
- Inventory
- Sales
- Purchase
- Analytics

Admin-only:
- Admin
- Users
- Products
- Seasons
- Settings

Suggested grouping:
- Operations: Inventory, Sales, Purchase
- Insights: Analytics
- Administration (Admin only): Admin, Users, Products, Seasons, Settings

## 7) Feature Modules (POC)
- Auth & Session
- Dashboard
- Inventory
- Sales
- Purchase
- Analytics
- Admin Management

### Admin Management Includes
- User management (create/update/activate/deactivate)
- Product management
- Season management
- Basic master-data controls needed for inventory workflows

## 8) Proposed Data Model (Initial)
Note: source-of-truth model fields should be finalized from provided Excel sheet.

Core entities:
- users
- roles
- products
- categories (optional)
- seasons
- inventory_stocks
- stock_movements
- purchases
- purchase_items
- sales
- sale_items
- suppliers (optional for POC)
- customers (optional for POC)
- audit_logs

Essential relationships:
- one role to many users
- one product to many stock movements
- one sale to many sale_items
- one purchase to many purchase_items
- one season to many products/transactions (if applicable)

## 9) Excel Mapping Action
The attached Excel is treated as canonical field-definition input for models.

Action to complete early in Phase 1:
- Extract each sheet/table into a model dictionary.
- Map fields to SQLite schema types.
- Identify primary keys, unique constraints, and foreign keys.
- Produce a final schema migration plan.

If full workbook content is not machine-readable in current workspace, perform manual mapping from the source file before schema lock.

## 10) Phased Delivery Plan
## Phase 0: Foundation and Conventions
Deliverables:
- Project conventions documented.
- Folder structure baseline.
- Tailwind setup.
- Routing shell and role-guard scaffolding.

Acceptance:
- App boots in Tauri desktop.
- Placeholder pages render with role-based route guards.

## Phase 1: Database and Auth Core
Deliverables:
- SQLite initialization and migration system.
- Users, roles, products, seasons base schema.
- Login/session and role resolution.

Acceptance:
- Admin/User login works.
- Role-based menu visibility and route access enforced.

## Phase 2: Master Data (Admin)
Deliverables:
- Admin screens for user creation.
- Product creation/editing.
- Season creation/editing.

Acceptance:
- CRUD for users/products/seasons works with validation and persistence.

## Phase 3: Inventory Core
Deliverables:
- Stock register and stock movement tracking.
- Stock in/out and adjustment operations.
- Low stock indicators.

Acceptance:
- Inventory totals are transaction-safe and traceable.

## Phase 4: Sales and Purchase
Deliverables:
- Sales entry flow with line items.
- Purchase entry flow with line items.
- Automatic stock movement updates from transactions.

Acceptance:
- Sales reduce stock, purchases increase stock correctly.
- Invalid stock actions are blocked.

## Phase 5: Analytics and Dashboard
Deliverables:
- KPI cards (stock value, low stock count, sales summary, purchase summary).
- Time-filtered charts/tables for key metrics.

Acceptance:
- Metrics match transactional records.

## Phase 6: Hardening and Demo Readiness
Deliverables:
- Error handling and UX polish.
- Input validation and basic audit logs.
- Demo script and seeded sample data.

Acceptance:
- Stable demo flow from login to admin setup to transactions to analytics.

## 11) Recommended Frontend Structure
src/
- app/
  - router.tsx
  - layout/
    - AppShell.tsx
    - Navbar.tsx
    - Sidebar.tsx
- modules/
  - auth/
  - dashboard/
  - inventory/
  - sales/
  - purchase/
  - analytics/
  - admin/
    - users/
    - products/
    - seasons/
- shared/
  - components/
  - hooks/
  - utils/
  - types/
- services/
  - api/
  - db/

src-tauri/src/
- commands/
  - auth.rs
  - users.rs
  - products.rs
  - seasons.rs
  - inventory.rs
  - sales.rs
  - purchase.rs
  - analytics.rs
- db/
  - mod.rs
  - migrations/
  - repositories/
- models/
- main.rs

## 12) Security and RBAC Enforcement Layers
- UI layer: hide/disable unauthorized navigation and actions.
- Route layer: block unauthorized page access.
- Command layer (Tauri): enforce role checks server-side.
- Data layer: scoped queries where needed.

Never rely on UI-only role restrictions.

## 13) POC Demo Flow
- Login as Admin.
- Create Users.
- Create Seasons.
- Create Products.
- Add Purchase (stock in).
- Add Sale (stock out).
- Open Analytics and verify impact.
- Login as User and verify restricted access.

## 14) Non-Functional Goals (POC)
- Fast local performance.
- Predictable offline behavior (local DB).
- Clean, modern, responsive desktop UI (Tailwind).
- Clear code boundaries for future scaling.

## 15) Immediate Next Tasks
1. Install and configure Tailwind in current app.
2. Replace starter screen with AppShell (Navbar + Sidebar + Content).
3. Add route definitions for modules and role guards.
4. Implement SQLite bootstrap and first migration.
5. Convert Excel model definitions into finalized SQL schema and TypeScript/Rust types.

## 16) Source of Truth
- This context file is the working architecture guide for the POC.
- Update this file whenever scope, phases, schema, or module boundaries change.
- Every update should continue to follow latest documentation across all used technologies.
