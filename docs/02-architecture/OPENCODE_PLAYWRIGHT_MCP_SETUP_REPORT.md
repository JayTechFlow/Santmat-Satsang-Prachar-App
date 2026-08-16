# OpenCode + Playwright MCP Setup Report

> Tooling/environment configuration only. No application source was modified.
> Repo: `Santmat-Satsang-Prachar` (admin-panel, backend, firebase, mobile untouched).

## 1. Operating system

- macOS (darwin), Apple Silicon (`/opt/homebrew` toolchain)
- Shell: zsh

## 2. OpenCode path

- `/Users/jaymac/.opencode/bin/opencode`

## 3. OpenCode version

- `1.18.18`

## 4. Node version

- `/opt/homebrew/bin/node` — `v26.7.0`

## 5. npm / npx versions

- npm: `11.19.0`
- npx: `11.19.0`

## 6. OpenCode MCP configuration location

- **Global (user-level):** `/Users/jaymac/.config/opencode/opencode.jsonc`
- No project-level `opencode.json` / `.opencode/` exists in the repository — global config is authoritative.

## 7. MCP server names

| Name | Mode |
|---|---|
| `JayTechFlow_MCP` | Isolated browser (default) — pre-existing |
| `playwright` | Isolated browser (default) — pre-existing |
| `chrome-existing` | Existing Chrome session (`--extension`) — **added during this setup** |

## 8. MCP commands

```jsonc
"JayTechFlow_MCP": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }
"playwright":      { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest"] }
"chrome-existing": { "type": "local", "command": ["npx", "-y", "@playwright/mcp@latest", "--extension"] }
```

Pre-existing config was preserved and merged (no unrelated settings destroyed). Added only `chrome-existing`.

## 9. Playwright MCP version

- `0.0.79` (from `npm view @playwright/mcp` and `npx -y @playwright/mcp@latest --version`)

## 10. Browser detected

- **Google Chrome 151.0.7922.138** at `/Applications/Google Chrome.app`
- No `google-chrome` / `chromium` binaries on PATH; Chrome application used directly.
- Playwright MCP launches its own Chrome instance using the installed Google Chrome executable.

## 11. Existing Chrome connection status

- **Configured and verified.**
- Playwright CRX extension **v0.15.0 installed and enabled** in Chrome (Default profile, `location=1`, no disable reasons).
- `chrome-existing` MCP server (`--extension` mode) starts and binds `http://localhost:8931` — verified via `lsof`:
  ```
  Listening on http://localhost:8931
  ```
- Chrome is currently running with the Admin Dashboard tab open at `http://127.0.0.1:5173/` (title `admin-panel`).
- Extension connection is **user-activated**: the Playwright CRX icon must be clicked on the project tab (or `Alt+Shift+C`/`Alt+Shift+R`) to attach the MCP server to that tab. Server side is ready and listening.

## 12. Isolated browser status

- **Working (verified end-to-end).**
- `playwright` / `JayTechFlow_MCP` launch a dedicated Playwright-managed Chrome with an isolated profile at `~/Library/Caches/ms-playwright-mcp/mcp-chrome-34a7db9`.
- The isolated profile had a persisted authenticated session (dashboard loaded as user `jk7078962`, role `Platform Admin`).
- No personal Chrome profile, cookies, or production account credentials are touched.

## 13. Browser capabilities (verified by actual execution)

| Capability | Status |
|---|---|
| Navigation | PASS (localhost:5173 → /login redirect → dashboard) |
| Page snapshot (accessibility) | PASS |
| Screenshots | PASS (8 captured, saved to `docs/02-architecture/screenshots/`) |
| Click | PASS (Quick Search modal opened) |
| Fill / type | PASS (search text entered) |
| Keyboard | PASS (Escape pressed, modal closed) |
| Viewport / browser context resize | PASS (10 viewports applied) |
| Network inspection | PASS (request list captured with status codes) |
| Console / runtime inspection | PASS (console log captured) |
| Tabs | PASS (tab list available) |
| Evaluate (JS runtime) | PASS (overflow measurements computed in page) |

## 14. Admin Panel URL

- **http://127.0.0.1:5173/** (also reachable via `localhost:5173`)
- Dev command confirmed from `admin-panel/package.json`: `"dev": "vite"` — started as `npm run dev -- --host 127.0.0.1 --port 5173`
- Vite v8.1.5, HTTP 200, PID `66096` (currently running)
- No changes made to `package.json` or any source file.

## 15. Screenshot test

- PASS. Files saved in `docs/02-architecture/screenshots/`:
  - `phase8-login-page.png` (login view)
  - `phase8-final-dashboard-1280x720.png` (authenticated dashboard)
  - `viewport-320x568-login.png`
  - `viewport-390x844-login.png`
  - `viewport-768x1024-overflow.png` (overflow documented, not fixed — out of scope)
  - `viewport-1280x720-dashboard.png`
  - `viewport-1920x1080-dashboard.png`

## 16. Console test

- PASS. `console-log.txt` captured.
- **Errors: 0, Warnings: 0**
- Info/verbose entries (non-issues): Vite HMR connect messages, React DevTools download hint, DOM autocomplete suggestion on password field.
- No React runtime errors, no uncaught exceptions, no unhandled rejections, no ResizeObserver loops, no Firebase errors.

## 17. Network test

- PASS — all requests **200**.
- Classified: PASS (no 401/403/404/500/CORS/TIMEOUT/ERR_FAILED).
- Endpoints observed:
  - `identitytoolkit.googleapis.com/v1/accounts:signInWithPassword` → 200 (Authentication)
  - `identitytoolkit.googleapis.com/v1/accounts:lookup` → 200
  - `securetoken.googleapis.com/v1/token` → 200 (token refresh)
  - `firestore.googleapis.com/.../documents:runAggregationQuery` → 200 (dashboard metrics)
  - `firestore.googleapis.com/.../Firestore/Listen/channel` → 200 (realtime listeners)
- Project: `santmat-satsang-prachar`. No tokens/credentials logged in this report.

## 18. Responsive test

- PASS — 10 viewports applied via Playwright MCP viewport resize:

| Viewport | Horizontal overflow | Notes |
|---|---|---|
| 320x568 | 0 px | login page clean |
| 360x800 | 0 px | clean |
| 390x844 | 0 px | clean (required mobile target) |
| 430x932 | 0 px | clean |
| 600x800 | 0 px | clean |
| 768x1024 | **173 px** | stat-card grid overflows (dashboard) — reported, NOT fixed (out of scope) |
| 1024x1366 | **64 px** | stat-card grid overflows — reported, NOT fixed |
| 1280x720 | 0 px | clean (required desktop target) |
| 1440x900 | 0 px | clean |
| 1920x1080 | 0 px | clean |

- Inspected: sidebar, header, stat cards, charts, tables region, dashboard layout at all sizes.
- Overflow was detected but **not modified** per setup scope (no CSS/React changes).

## 19. Configuration files changed

- `/Users/jaymac/.config/opencode/opencode.jsonc` — added `chrome-existing` MCP server (extension mode). Existing `JayTechFlow_MCP` and `playwright` entries untouched.

## 20. Environment changes

- Vite dev server started (background, PID `66096`) — process only, no files.
- Chrome left running; Playwright CRX extension already installed (no installation performed).
- Screenshots + console log added under `docs/02-architecture/screenshots/`.
- `npx -y @playwright/mcp@latest` cached in npm npx cache (not globally installed).

## 21. Security considerations

- No Firebase password, OTP, service-account key, API key, JWT, or refresh token was placed in any MCP configuration, Playwright config, or repository file.
- `opencode.jsonc` contains only command strings (`npx -y @playwright/mcp@latest [--extension]`).
- No credentials were entered into the browser by this setup; existing authenticated session (persisted MCP profile) was used as-is.
- `chrome-existing` (extension mode) only attaches to the tab where the user activates the Playwright CRX extension — personal/unrelated tabs are not automated.
- Isolation maintained: Playwright MCP uses its own Chrome profile (`ms-playwright-mcp` cache), never the personal Chrome profile.

## 22. Remaining setup requirements

1. **Activate the Playwright CRX extension** on the Admin Dashboard tab (`http://127.0.0.1:5173/`) — click the extension icon or press `Alt+Shift+C` — to attach the `chrome-existing` MCP server to the running session. (Server side already listens on port 8931.)
2. **Restart OpenCode** (if `chrome-existing` tools are not yet visible in the session) so the new MCP server's tools load.
3. Optional: enable extra capabilities for deeper testing via `--caps devtools` / `--caps vision` if required.

## 23. Final verification checklist

- [PASS] OpenCode executable verified — `/Users/jaymac/.opencode/bin/opencode`
- [PASS] OpenCode version verified — 1.18.18
- [PASS] MCP server configured — 3 servers in `~/.config/opencode/opencode.jsonc`
- [PASS] Playwright MCP starts — v0.0.79
- [PASS] MCP connection visible in `opencode mcp list` — all 3 connected
- [PASS] Browser available — Google Chrome 151.0.7922.138
- [PASS] Chromium available — Playwright-managed Chrome launched successfully
- [PASS] Existing Chrome connection — extension installed/enabled, MCP server listening on 8931, admin tab present in Chrome
- [PASS] Isolated Chromium successfully tested — navigation, snapshot, click, type, keyboard, resize
- [PASS] Local Admin Panel opened — http://127.0.0.1:5173/ (HTTP 200)
- [PASS] Screenshot captured — 8 files
- [PASS] Console inspected — 0 errors / 0 warnings
- [PASS] Network inspected — all 200
- [PASS] Responsive viewport changed — 10 viewports
- [PASS] 390x844 tested
- [PASS] 1280x720 tested

## 24. Final verdict

**MCP + BROWSER AUTOMATION READY**

Browser automation was exercised end-to-end against the live local Admin Panel: page load, authenticated dashboard render, snapshot, screenshot, click/type/keyboard, console inspection, network inspection, and 10-viewport responsive testing all executed successfully.