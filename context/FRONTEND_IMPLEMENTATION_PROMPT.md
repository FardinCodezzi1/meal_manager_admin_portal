# Master Frontend Implementation Prompt: Mess Meal Manager & Tour Portal

> **Instructions for the AI Coding Assistant / Developer:**
> You are building a modern, responsive, high-performance **Next.js frontend application** for the **Mess Meal Manager & Tour Expense Platform**.
> 
> The backend is already fully built, tested, and live on **Render** (NestJS + Neon PostgreSQL).
> Your goal is to build a beautiful, user-friendly frontend in Next.js using reusable UI components and styling patterns from an existing reference portal.

---

## 1. Project Overview & Environments

* **Live Backend API Base URL**: `https://meal-manager-api.onrender.com/api`
* **Local Development Fallback**: `http://localhost:3000/api`
* **Interactive Swagger API Docs**: [https://meal-manager-api.onrender.com/api/docs](https://meal-manager-api.onrender.com/api/docs)
* **Raw OpenAPI 3.0.3 Spec**: [https://meal-manager-api.onrender.com/api/openapi.json](https://meal-manager-api.onrender.com/api/openapi.json)
* **Backend Specification Reference**: `D:\Personal\Other\meal_manager_api\context\BACKEND_SPECIFICATION.md`
* **Existing Single-Page Prototype Code Reference**: `D:\Personal\Other\meal_manager_api\client\page.tsx`
  *(Contains the complete working business logic, state models, calculation formulas, and UI flows for all tabs. Use this to understand all calculations and workflows!)*

---

## 2. Reusable Component Source Library

You **MUST** copy, adapt, and reuse existing components, helpers, and styling patterns from this local project directory:
📂 **`D:\Next Js\Sky SMS\skysms_website_portal`**

### Key Assets to Borrow:
1. **Utility & Styling**:
   - `lib/utils.ts` (`cn()` helper combining `clsx` and `tailwind-merge`).
   - Tailwind CSS configuration (`globals.css` / Tailwind tokens).
2. **UI Primitives (`components/ui/`)**:
   - `button.tsx` (Variants, sizes, loading spinners).
   - `card.tsx` (Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter).
   - `dialog.tsx` (Accessible Radix/Base-UI modal dialogs with smooth backdrops).
   - `table.tsx` (Table, TableHeader, TableBody, TableRow, TableHead, TableCell).
   - `dropdown-menu.tsx` (Action menus, options popovers, profile selectors).
   - `badge.tsx` (Status badges: `PENDING`, `APPROVED`, `REJECTED`, `ACTIVE`, `LEFT`, `LEAD`, `ACCOUNTANT`).
   - `checkbox.tsx` (For bazar checklist mode & personal notes).
   - `switch.tsx` (For toggling settings, auto-rotation, notice active).
   - `skeleton.tsx` (Loading state skeletons).
   - `sonner.tsx` (Toast notification system with `toast.success()`, `toast.error()`).
3. **Common Feature Wrappers (`components/common/`)**:
   - `PageHeader.tsx` (Standard title, subtitle, and action buttons header).
   - `CreateButton.tsx` (Call-to-action button with plus icon).
   - `ListRowActions.tsx` (Row action menus).
   - `Motion.tsx` (Framer motion animation wrappers).
   - `AuthGuard.tsx` (Route protection wrapper).
4. **Providers (`providers/`)**:
   - `QueryProvider.tsx` (`@tanstack/react-query` for API caching and mutation hooks).
   - `ThemeProvider.tsx` (`next-themes` for Dark/Light mode support).

---

## 3. Recommended Packages to Install

In your new Next.js project, install the necessary dependencies:
```bash
npm install @tanstack/react-query lucide-react clsx tailwind-merge class-variance-authority sonner framer-motion next-themes
npm install -D @tailwindcss/postcss postcss
```
*(Optionally `@base-ui/react` or `@radix-ui/react-*` matching the skysms portal components).*

---

## 4. API Client & Authentication Layer

Create a unified API client (e.g. `lib/api.ts` or `services/api.ts`):
- Read `NEXT_PUBLIC_API_URL` from `.env.local` (default to `https://meal-manager-api.onrender.com/api`).
- Automatically attach `Authorization: Bearer <token>` from `localStorage` / cookie.
- Response interceptor:
  - If backend responds with error, parse `{ error: "message" }`.
  - If 401 Unauthorized, clear token and redirect to `/login`.

---

## 5. Core Screens & Functional Requirements

### Screen 1: Authentication & User Profile
- **Login (`/login`)**: Email & password authentication.
- **Register (`/register`)**: Name, email, password, phone.
- **Profile & Settings (`/profile`)**:
  - Update personal information (name, phone, email).
  - Change password (requires current password).
  - Safe account deletion guardrail (Manager cannot delete if active members remain; member must leave mess first; past data is anonymized).

### Screen 2: Mess Overview & Roommates (`/dashboard` or `/mess`)
- Mess invite card displaying invite code (e.g., `MESS-ABC12`) with copy-to-clipboard button.
- Active members table with roles (`MANAGER`, `MEMBER`), join date, and contact details.
- Settings modal (Manager only): Rename mess, regenerate invite code, transfer manager role.
- Safe mess closure dialog (requires manager password confirmation).

### Screen 3: Manager Rotation Queue & Anti-Cheat Audit Logs (`/mess/rotation`)
- Sequence drag-and-drop or reorder controls showing who is next in line to become Manager.
- Manual emergency override transfer with mandatory reason prompt.
- **Anti-Cheat Audit Log**: Immutable timeline table showing every rotation event, timestamp, and who initiated it.

### Screen 4: Bazar Expense Logging (`/bazar`)
- Month selector (e.g. `2026-10`).
- **Submission Modal (2 Modes)**:
  - *Quick Mode*: Date, category, amount, notes.
  - *Checklist Mode*: Itemized list (item name, quantity, unit price, checkbox).
- **Approval Workflow**:
  - Submissions from members show as `PENDING`.
  - Manager has One-Click `Approve` (green) or `Reject` (red) buttons.
  - Manager's own submissions are auto-approved.

### Screen 5: Daily Meals Tracker (`/meals`)
- Calendar / Monthly Grid displaying daily meals per member.
- Quick logging for lunch and dinner (decimal inputs: 0, 0.5, 1.0, 1.5, 2.0).
- **Leave Requests Sub-system**:
  - Member can submit date-range leave requests (`startDate`, `endDate`, `reason`).
  - Manager approves/rejects leave requests.
  - Approved leaves automatically zero out daily meals (`lunch: 0, dinner: 0, isLeave: true`).

### Screen 6: Monthly Financial Summary & Balances (`/summary`)
- Monthly KPI Cards:
  - Total Approved Bazar
  - Total Deposits Collected
  - Total Meals Consumed
  - **Meal Rate** (`Total Approved Bazar / Total Meals`)
- **Balance Reconciliation Table**:
  - Per member: `Total Meals`, `Deposited`, `Meal Cost`, and `Balance`.
  - Positive balance: Green pill (+ Surplus / Refund).
  - Negative balance: Red pill (- Due / Owing).
- Cloud Data Export button (`/api/mess/export?monthKey=YYYY-MM`).

### Screen 7: Tour Expense Management Portal (`/tours`)
- Tour listing cards with destination, dates, budget progress bar, and user role.
- Tour creation & join via invite code (`TOUR-XXXXX`).
- **Tour Workspace (`/tours/[id]`)**:
  - Financial Summary: Total deposits, total expenses, fund balance, remaining budget, and **Per-Member Equal Share**.
  - Participants tab: Tour Lead can appoint `ACCOUNTANT` role, or add offline friends (`Rahim (Cash)`).
  - Deposit recording: Accountant/Lead records member payments.
  - Expense tracker: Categorized expense receipts (Transport, Hotel, Food, Tickets).
  - Final settlement balance sheet.

### Screen 8: Super Admin Platform Oversight (`/admin`)
- Accessible only if `user.isSuperAdmin === true` (automatically active for `fardin1.codezzi@gmail.com`).
- Platform KPI Telemetry: Total registered users, total active messes, total tours, cumulative bazar & meals.
- User management table: Search users, view active messes, and **Reset forgotten user passwords**.
- Platform mess & tour deletion with confirmation modals.

### Screen 9: Personal Notes & Checklists (`/notes`)
- Private, mess-isolated personal notes and checklists with toggleable check-items.

---

## 6. Execution Guidelines

1. **Borrow Don't Reinvent**: Copy the Radix/Base-UI primitives, modals, buttons, tables, and badge styling directly from `D:\Next Js\Sky SMS\skysms_website_portal`.
2. **Mobile First & Responsive**: Use responsive cards on mobile screens and clean tables on desktop screens.
3. **Toasts & Feedback**: Always trigger `toast.success()` or `toast.error()` via Sonner on API calls.
4. **Token Persistence**: Store the JWT token in `localStorage` as `auth_token` or an HTTP cookie.
5. **Refer to `client/page.tsx`**: When in doubt about exact state variables, calculations, or logic, inspect `D:\Personal\Other\meal_manager_api\client\page.tsx`.
