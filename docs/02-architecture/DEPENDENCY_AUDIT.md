# Dependency Audit Report

## 1. Overview
This document contains the dependency audit for the Santmat-Satsang-Prachar repository. The audit covered the three main components of the project:
*   **Admin Panel** (`admin-panel/package.json`)
*   **Backend** (`backend/firebase/functions/package.json`)
*   **Mobile** (`mobile/app/pubspec.yaml`)

## 2. Unused Packages
A comprehensive search through the codebase reveals that all declared dependencies are actively utilized.
*   **Admin Panel**: Core libraries like `@uiw/react-md-editor`, `firebase`, `lucide-react`, `react-router-dom`, and `rehype-sanitize` are correctly imported and used across multiple components and services.
*   **Backend**: Both `firebase-admin` and `firebase-functions` are foundational and widely used across the cloud functions. The `firebase-functions-test` package is also correctly utilized in test files.
*   **Mobile**: A static analysis (via `dependency_validator`) initially flagged `cupertino_icons` and `hive` as potentially unused, but manual verification confirmed their active use (e.g., `CupertinoIcons.timer` in `app_icons.dart` and `hive` in `storage_service.dart`).

**Status:** No unused packages found. The dependency definitions are lean and accurate.

## 3. Duplicate Packages
There are no redundant or duplicate packages defined within the individual dependency files (i.e., no overlapping dependencies between `dependencies` and `devDependencies`). 

Across the workspace, while the Admin Panel uses the web `firebase` SDK and the Backend uses `firebase-admin`, this is the correct architectural separation as one is for the client side and the other is for the server environment. No consolidation is required.

**Status:** No duplicate packages found.

## 4. Version Conflicts & Outdated Packages
The dependency resolution graphs are healthy without any explicit version conflicts breaking the builds. However, some packages have newer versions available.

### Mobile (`pubspec.yaml`)
A few packages have newer resolvable or major versions available:
*   `flutter_lints` (Current: 5.0.0, Resolvable: 6.0.0)
*   `google_fonts` (Current: 6.3.3, Resolvable: 8.1.0, Latest: 8.2.1)
*   `go_router` (Current: 17.2.3, Latest: 17.3.0)
*   `flutter_riverpod` (Current: 3.3.2, Latest: 3.4.2)
*   `intl` (Current: 0.20.2, Latest: 0.20.3)

*Recommendation:* Consider running `flutter pub upgrade` periodically to keep up with minor improvements and security patches.

### Admin Panel & Backend (`package.json`)
Dependencies in both the admin and backend node projects reflect a modern and compatible stack (e.g., `react` v19, `firebase` v12, `firebase-admin` v11.8.0). No major version conflicts were detected in the source tree.

## 5. Conclusion
The repository maintains a well-structured dependency graph with no bloated, unused, or duplicate packages. The architectural separation of concerns (React client, Node.js Firebase functions, Flutter app) is properly reflected in the distinct dependency files. Routine upgrades are recommended to ensure long-term stability and access to the newest package features.
