# Client Design Forensic Analysis

**Source Directory:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN`  
**Target Application:** `admin-panel/`  
**Date:** August 16, 2026  
**Analyst:** Lead Frontend Architect & UI Reconstruction Specialist  

---

## 1. Executive Visual Specification

The client design specifies a modern, warm Indian devotional administration portal featuring:
- **Palette:** Warm Saffron (`#EA580C`), Dark Saffron (`#C45A0A`), Golden Amber (`#F59E0B`, `#D97706`), Warm Paper/Cream Canvas (`#FAF8F5`, `#FBF9F5`, `#FFFBF0`), Stone Text Scale (`#1C1917`, `#44403C`, `#78716C`).
- **Typography:** Primary Devanagari font `'Mukta'`, supported by `'Noto Sans Devanagari'`, `'Inter'`, sans-serif.
- **Iconography:** Lucide Icons (`v1.27.0`) paired with custom sacred SVG assets (`DiyaIcon`, `NamasteIcon`).
- **Geometry:** Soft rounded containers (`rounded-2xl`, `rounded-xl`, `rounded-full`), clean stone borders (`border-stone-200`, `border-amber-200`), layered soft shadows (`shadow-sm`, `shadow-md`, `shadow-xl`).
- **Layout:** 2-column split shell (fixed width left sidebar 256px `w-64`, top sticky header 64px `h-16`, scrollable content canvas `overflow-y-auto bg-[#FAF8F5]`).

---

## 2. Granular Token Forensic Breakdown

### 2.1 Colors
- **Primary Accent (Saffron):** `#EA580C` (Orange-600) — Used for active navigation pills, primary action buttons, timeline selection tabs.
- **Primary Hover:** `#C45A0A` — Hover state for primary buttons and links.
- **Devotional Accent (Amber/Gold):** `#F59E0B` (Amber-500), `#D97706` (Amber-600), `#B45309` (Amber-700).
- **Background Outer Shell:** `#FBF9F5` — Surrounding application frame.
- **Background Main Canvas:** `#FAF8F5` — Main content scroll canvas background.
- **Card Surface:** `#FFFFFF` — White surface cards for data tables, form containers, and metric grids.
- **Card Highlight Surface:** `#FFFBF0` — Warm highlight background for support info box and featured cards.
- **Border / Divider:** `#E7E5E4` (Stone-200), `#FDE68A` (Amber-200).
- **Text Primary (Heading):** `#1C1917` (Stone-900) — Bold titles, modal headers, data table cell titles.
- **Text Secondary (Body):** `#44403C` (Stone-700 / Stone-600) — Subtitles, form label text, description body.
- **Text Muted (Meta):** `#78716C` (Stone-500) — Timestamps, search placeholder text, table headers.
- **Status Colors:**
  - Published / Active (Green): `#10B981` (Emerald-500), bg `#D1FAE5`
  - Draft / Scheduled (Amber): `#F59E0B` (Amber-500), bg `#FEF3C7`
  - Suspended / Danger (Rose): `#EF4444` (Rose-500), bg `#FEE2E2`
  - Information (Blue): `#3B82F6` (Blue-500), bg `#DBEAFE`

### 2.2 Typography Scale & Weights
- **Font Family:** `'Mukta', 'Noto Sans Devanagari', 'Inter', sans-serif`
- **Weights:** Light (300), Regular (400), Medium (500), SemiBold (600), Bold (700), ExtraBold (800)
- **Hierarchy:**
  - Page Title: 1.25rem (20px), `font-extrabold`, line-height 1.2
  - Section Subtitle: 0.75rem (12px), `font-medium`, color `#57534E`
  - Card Title: 1.0rem (16px), `font-bold`, color `#1C1917`
  - Metric Display Value: 1.5rem (24px) / 1.875rem (30px), `font-extrabold`
  - Table Cell Title: 0.875rem (14px), `font-bold`
  - Label / Badge Text: 0.75rem (12px), `font-bold`

### 2.3 Spacing & Geometry
- **Outer Shell Padding:** `p-6` (24px) spacing across main content pages.
- **Grid Gaps:** `gap-4` (16px), `gap-6` (24px) between metric cards and analytic panels.
- **Sidebar Dimensions:** Width 256px (`w-64`), padding `p-3`, header `p-4`.
- **Header Dimensions:** Height 64px (`h-16`), horizontal padding `px-6`.
- **Card Radii:** `rounded-2xl` (16px) for major page cards, `rounded-xl` (12px) for form inputs & buttons.
- **Pill Radii:** `rounded-full` (9999px) for active status badges & top control buttons.

---

## 3. Interactive Component Forensic Patterns

1. **Top Control Bar:** Clean action header with quick search `Cmd+K`, date indicator, notification bell badge with counter, mobile app preview button (`bg-amber-50 text-amber-900 border-amber-300 rounded-full`), and user profile trigger with RBAC role badge.
2. **Left Navigation Drawer:** Brand box with Diya SVG logo, Devanagari app title "संतमत सत्संग प्रचार", section headers in Hindi, active item highlighted in Saffron `#EA580C` with white text, and warm yellow support box at bottom.
3. **Data Table Pattern:** Warm white container (`bg-white rounded-2xl border border-stone-200 shadow-sm`), Hindi column headers, inline audio play/pause preview buttons, status pill badges, and quick action icon buttons (`Edit`, `Delete`, `Archive`).
4. **Form & Dialog Pattern:** Radix UI accessible modal overlays with backdrop blur (`bg-stone-900/40 backdrop-blur-xs`), Hindi labels (`शीर्षक`, `विवरण`, `बोल/लिरिक्स`, `ऑडियो फ़ाइल`, `कवर चित्र`), Saffron primary submit button `#EA580C`, and stone outline cancel button.

---

## 4. Architectural Integration Mapping

- **Visual Specs Source:** `CLIENT DESIGN/`
- **Functional Source:** `admin-panel/src/`
- **Preserved Backend Systems:**
  - Firebase Authentication & PermissionEngine (`developer_super_admin`, `client_super_admin`, `mobile_user`)
  - Firestore Collections & Sub-collections (`media_audio`, `stuti_binti`, `categories`, `banners`, `suvichar`, `playlists`, `users`)
  - `StorageService`, `StorageRepository`, `StoragePolicyEngine`, `MediaUploadPipeline`
  - Vitest Unit Testing Suites & Oxlint Linter
