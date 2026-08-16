# Client Design Token Inventory

**CLIENT ROOT:** `/Users/jaymac/Documents/Santmat-Satsang-Prachar/CLIENT DESIGN/`

## Colors
| Token Name | Client Value | Hex | Usage | Status |
|------------|-------------|-----|-------|--------|
| primary | amber-600 | `#EA580C` | Primary actions, buttons, active states | NOT MAPPED |
| primary-hover | amber-500 | `#D97706` | Button hover, active states | NOT MAPPED |
| primary-light | amber-100 | `#FEC636` | Light backgrounds, accents | NOT MAPPED |
| primary-dark | amber-700 | `#C45A0A` | Hover darker, text | NOT MAPPED |
| secondary | stone-100 | `#F9FAFB` | Card backgrounds, light sections | NOT MAPPED |
| secondary-dark | stone-900 | `#1C1917` | Primary text, high contrast | NOT MAPPED |
| secondary-darkest | stone-950 | `#0A0A0A` | Extreme contrast, code blocks | NOT MAPPED |
| accent-emerald | emerald-50 | `#ECFDF5` | Success states, emerald badges | NOT MAPPED |
| accent-emerald-dark | emerald-700 | `#059669` | Success text, links | NOT MAPPED |
| accent-purple | violet-50 | `#F5F3FF` | Purple states, secondary accents | NOT MAPPED |
| caution-amber | amber-50 | `#FFFBEB` | Warning backgrounds | NOT MAPPED |
| caution-red | red-50 | `#FEF2F2` | Error states | NOT MAPPED |
| border-default | stone-200 | `#E5E7EB` | Dividers, borders | NOT MAPPED |
| background | stone-50 | `#F9FAFB` | Page backgrounds | NOT MAPPED |
| surface | white | `#FFFFFF` | Cards, modals, overlays | NOT MAPPED |

## Typography
| Token Name | Client Value | Usage | Status |
|------------|-------------|-------|--------|
| font-family | `Mukta, 'Noto Sans Devanagari', 'Inter', sans-serif` | Global font family | NOT MAPPED |
| font-weight-normal | 400 (font-normal) | Body text | NOT MAPPED |
| font-weight-medium | 500 (font-medium) | Labels, secondary text | NOT MAPPED |
| font-weight-bold | 700 (font-bold) | Headings, strong text | NOT MAPPED |
| font-weight-extrabold | 800 (font-extrabold) | Page titles, major headings | NOT MAPPED |
| font-size-xxs | 0.65rem (text-xs) | Small captions | NOT MAPPED |
| font-size-xs | 0.75rem (text-sm) | Caption, meta text | NOT MAPPED |
| font-size-sm | 0.875rem (text-sm) | Small text | NOT MAPPED |
| font-size-base | 1rem (text-base) | Body paragraph default | NOT MAPPED |
| font-size-lg | 1.125rem (text-lg) | Large body, section headers | NOT MAPPED |
| font-size-xl | 1.25rem (text-xl) | Article headers | NOT MAPPED |
| font-size-2xl | 1.5rem (text-2xl) | Card values, metric numbers | NOT MAPPED |
| font-size-3xl | 1.875rem (text-3xl) | Dashboard section headers | NOT MAPPED |
| font-size-4xl | 2.25rem (text-4xl) | Page titles | NOT MAPPED |
| line-height-normal | 1.5 (leading-normal) | Body text default | NOT MAPPED |
| line-height-relaxed | 1.625 (leading-relaxed) | Long-form text | NOT MAPPED |
| line-height-snug | 1.375 (leading-snug) | Headings, compact text | NOT MAPPED |

## Font Sizes (Mapping to Tailwind v4)
| Size | Tailwind Class | CSS Rem/Px |
|------|---------------|------------|
| xs | text-xs | 0.75rem = 12px |
| sm | text-sm | 0.875rem = 14px |
| base | text-base | 1rem = 16px |
| lg | text-lg | 1.125rem = 18px |
| xl | text-xl | 1.25rem = 20px |
| 2xl | text-2xl | 1.5rem = 24px |
| 3xl | text-3xl | 1.875rem = 30px |
| 4xl | text-4xl | 2.25rem = 36px |
| 5xl | text-5xl | 3rem = 48px |

## Font Weights
| Weight | Value | Tailwind Class |
|--------|-------|----------------|
| thin | 100 | text-thin |
| extralight | 200 | text-extralight |
| light | 300 | text-light |
| normal | 400 | text-normal | Not typically used in Tailwind |
| medium | 500 | font-medium |
| semibold | 600 | font-semibold |
| bold | 700 | font-bold |
| extrabold | 800 | font-extrabold |
| black | 900 | text-black |

## Line Heights
| Height | Value | Tailwind Class |
|--------|-------|----------------|
| none | 1 | leading-none |
| tight | 1.25 | leading-tight |
| snug | 1.375 | leading-snug |
| normal | 1.5 | leading-normal |
| relaxed | 1.625 | leading-relaxed |
| loose | 2 | leading-loose |

## Spacing (Token Scale)
| Token | Value | CSS | Usage |
|-------|-------|-----|-------|
| space-0 | 0 | 0px | No spacing |
| space-1 | 0.25rem (4px) | p-1 / gap-1 | Tight spacing |
| space-2 | 0.5rem (8px) | p-2 / gap-2 | Very tight |
| space-3 | 0.75rem (12px) | p-3 / gap-3 | Small |
| space-4 | 1rem (16px) | p-4 / gap-4 | Standard | 
| space-6 | 1.5rem (24px) | p-6 / gap-6 | Page padding |
| space-8 | 2rem (32px) | p-8 / gap-8 | Large margin |
| space-10 | 2.5rem (40px) | p-10 | Extra large |
| space-12 | 3rem (48px) | p-12 | Section spacing |
| space-16 | 4rem (64px) | p-16 | Section divider |
| space-20 | 5rem (80px) | p-20 | Section margin |
| space-24 | 6rem (96px) | p-24 | Section margin |

## Radius (Border Radius)
| Token | Value | Tailwind Class |
|-------|-------|----------------|
| radius-sm | 0.125rem (2px) | rounded-sm |
| radius-md | 0.2rem (3px) | rounded-md |
| radius | 0.25rem (4px) | rounded |
| radius-lg | 0.5rem (8px) | rounded-lg |
| radius-xl | 0.75rem (12px) | rounded-xl |
| radius-2xl | 1rem (16px) | rounded-2xl |
| radius-3xl | 1.5rem (24px) | rounded-3xl |
| radius-full | 9999px | rounded-full |
| radius-none | 0 | rounded-none |

## Shadows (Token Scale)
| Token | Value | Tailwind Class |
|-------|-------|----------------|
| shadow-sm | 1px 1px 2px 0px rgba(0, 0, 0, 0.05) | shadow-sm |
| shadow | 0px 1px 3px 0px rgba(0, 0, 0, 0.1) | shadow |
| shadow-md | 0px 4px 6px -1px rgba(0, 0, 0, 0.1) | Not standard Tailwind |
| shadow-lg | 0px 10px 15px -3px rgba(0, 0, 0, 0.1) | shadow-lg |
| shadow-xl | 0px 20px 25px -5px rgba(0, 0, 0, 0.1) | shadow-xl |
| shadow-2xl | 0px 25px 50px -12px rgba(0, 0, 0, 0.25) | shadow-2xl |
| shadow-inner | inset 0 2px 4px 0px rgba(0, 0, 0, 0.05) | shadow-inner |

## Breakpoints
| Breakpoint | Min Width | Tailwind Class | Usage |
|------------|-----------|----------------|-------|
| sm | 640px | sm: | Tablet threshold |
| md | 768px | md: | iPad/mini-laptop |
| lg | 1024px | lg: | Desktop |
| xl | 1280px | xl: | Large desktop |
| 2xl | 1536px | 2xl: | Extra large |

## Motion & Transitions
| Token | Value | Usage | Status |
|-------|-------|-------|--------|
| transition-fast | 150ms | Fast interactions, hover states | NOT MAPPED |
| transition-normal | 250ms | Standard transitions | NOT MAPPED |
| transition-slow | 350ms | Modal entries, page transitions | NOT MAPPED |
| easing-standard | cubic-bezier(0.4, 0, 0.2, 1) | Default easing | NOT MAPPED |
| easing-sharp | cubic-bezier(0.4, 0, 1, 1) | Quick interactions | NOT MAPPED |
| easing-smooth | cubic-bezier(0.4, 0, 0.2, 1) | Smooth transitions | NOT MAPPED |

### Animation Names (motion v12)
| Animation | Usage | Status |
|-----------|-------|--------|
| animate-in | Element entrance animation | NOT MAPPED |
| zoom-in-95 | Scale in from 95% | NOT MAPPED |
| fade-in-50 | Fade in from opacity 0 | NOT MAPPED |
| slide-in-from-top | Slide down entrance | NOT MAPPED |
| slide-in-from-left | Slide right entrance | NOT MAPPED |
| slide-in-from-bottom | Slide up entrance | NOT MAPPED |
| duration-150 | 150ms duration | NOT MAPPED |
| duration-200 | 200ms duration | NOT MAPPED |
| duration-300 | 300ms duration | NOT MAPPED |
| ease-out | Default easing | NOT MAPPED |
| hover:transition-all | Hover transition all properties | NOT MAPPED |

## Icons
| Token | Client Library | Version | Usage | Status |
|-------|---------------|---------|-------|--------|
| icon-library | lucide-react | 0.546.0 | All UI icons | NOT MAPPED |
| icon-set | Check, X, Upload, Music, Bell, Edit2, Trash2, Plus, Play, Pause, Search, FolderTree, BookOpen, Users, List, Smartphone, Layers, Award, Clock, Volume2, LinkIcon, Timer, FileText, RefreshCw, Info, Eye, EyeOff, Heart, Star | 0.546.0 | All actions, navigation, status | NOT MAPPED |
| icon-style | Fill (some), Stroke (some), Duotone (some) | 0.546.0 | Consistent icon style | NOT MAPPED |
| icon-color | currentColor (default), amber-600 (active states) | 0.546.0 | Color per context | NOT MAPPED |

## Forms
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| input-bg | stone-50 | `bg-stone-50` | Input background | NOT MAPPED |
| input-border | stone-200 | `border border-stone-200` | Input border | NOT MAPPED |
| input-radius | xl | `rounded-xl` | Input border radius | NOT MAPPED |
| input-height | py-2.5 | `py-2.5` (10px) | Input touch target | NOT MAPPED |
| input-padding | px-3.5 | `px-3.5` (14px) | Horizontal input padding | NOT MAPPED |
| input-focus-ring | ring-2 ring-primary | `ring-2 ring-[var(--primary)]` | Input focus ring | NOT MAPPED |
| input-focus-outline | outline-none | `outline-none` | Remove default outline | NOT MAPPED |
| select-bg | stone-50 | `bg-stone-50` | Select background | NOT MAPPED |
| select-border | stone-200 | `border border-stone-200` | Select border | NOT MAPPED |
| select-radius | xl | `rounded-xl` | Select border radius | NOT MAPPED |
| select-height | py-2 | `py-2` (8px) | Select touch target | NOT MAPPED |
| textarea-bg | stone-50 | `bg-stone-50` | Textarea background | NOT MAPPED |
| textarea-border | stone-200 | `border border-stone-200` | Textarea border | NOT MAPPED |
| textarea-radius | xl | `rounded-xl` | Textarea border radius | NOT MAPPED |
| textarea-height | px-3 py-3 | `py-3` (12px) | Vertical textarea padding | NOT MAPPED |
| textarea-padding | px-3 | `px-3` (12px) | Horizontal textarea padding | NOT MAPPED |
| textarea-focus-ring | ring-2 ring-primary | `ring-2 ring-[var(--primary)]` | Textarea focus ring | NOT MAPPED |
| button-primary-bg | amber-600 | `bg-[#EA580C]` | Primary button bg | NOT MAPPED |
| button-primary-hover | amber-500 | `bg-[#C45A0A]` | Primary button hover | NOT MAPPED |
| button-primary-text | white | `text-white` | Primary button text | NOT MAPPED |
| button-secondary-bg | stone-100 | `bg-stone-100` | Secondary button bg | NOT MAPPED |
| button-secondary-hover | stone-200 | `bg-stone-200` | Secondary button hover | NOT MAPPED |
| button-secondary-text | stone-800 | `text-stone-800` | Secondary button text | NOT MAPPED |
| button-text-color | stone-900 | `text-stone-900` | Button text color (light) | NOT MAPPED |
| button-disabled-bg | stone-100 | `bg-stone-100/80` | Disabled button bg | NOT MAPPED |
| button-disabled-text | stone-500 | `text-stone-500` | Disabled button text | NOT MAPPED |
| toggle-track-bg | stone-200 | `bg-stone-200` | Switch track unchecked | NOT MAPPED |
| toggle-thumb-bg | white | `bg-white` | Switch thumb | NOT MAPPED |
| toggle-thumb-checked-bg | amber-600 | `bg-[var(--primary)]` | Switch thumb checked | NOT MAPPED |

## Status Badges
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| badge-amber | amber-100 | `bg-amber-100 text-amber-900` | Amber status | NOT MAPPED |
| badge-amber-hover | amber-100 hover:bg-amber-200 | `hover:bg-amber-200` | Amber hover | NOT MAPPED |
| badge-stone | stone-100 | `bg-stone-100 text-stone-700` | Stone status | NOT MAPPED |
| badge-emerald | emerald-100 | `bg-emerald-100 text-emerald-700` | Emerald status | NOT MAPPED |
| badge-red | red-100 | `bg-red-100 text-red-700` | Error/status | NOT MAPPED |

## Tables
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| table-header-bg | transparent | - | Table header | NOT MAPPED |
| table-header-font | [0.72rem] font-bold text-stone-500 uppercase | `text-[0.72rem] font-bold text-stone-500 uppercase` | Table header styling | NOT MAPPED |
| table-cell-py | py-3 | `py-3` (12px) | Table cell vertical padding | NOT MAPPED |
| table-cell-font | text-stone-600 font-medium / text-stone-800 font-bold | `text-stone-600 font-medium / text-stone-800 font-bold` | Table cell text | NOT MAPPED |
| table-action-text-right | whitespace-nowrap space-x-1.5 | `text-right whitespace-nowrap space-x-1.5` | Action cell alignment | NOT MAPPED |
| status-badge-amber | inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold | `inline-flex items-center rounded-full px-2 py-0.5 text-xs font-bold` | Amber status badge | NOT MAPPED |
| status-badge-stone | similar with stone colors | Similar with stone colors | Stone status badge | NOT MAPPED |

## Grids
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| grid-1-col | 1 | `grid grid-cols-1` | Single column | NOT MAPPED |
| grid-2-col-sm | 2 | `sm:grid-cols-2` | Two columns on tablet | NOT MAPPED |
| grid-2-col | 2 | `grid-cols-2` | Two columns | NOT MAPPED |
| grid-3-col-lg | 3 | `lg:grid-cols-3` | Three columns on desktop | NOT MAPPED |
| grid-4-col-lg | 4 | `lg:grid-cols-4` | Four columns on desktop | NOT MAPPED |
| grid-col-1-fr_2gr | 1fr 2fr | `grid grid-cols-[1fr_2gr] gap-6` | Form layout (label input) | NOT MAPPED |
| gap-1 | 0.25rem (4px) | `gap-1` | Tight grid gap | NOT MAPPED |
| gap-2 | 0.5rem (8px) | `gap-2` | Very tight gap | NOT MAPPED |
| gap-3 | 0.75rem (12px) | `gap-3` | Small gap | NOT MAPPED |
| gap-4 | 1rem (16px) | `gap-4` | Standard gap | NOT MAPPED |
| gap-6 | 1.5rem (24px) | `gap-6` | Page spacing gap | NOT MAPPED |

## Timeline/Pills
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| timeline-bg | stone-100/80 | `bg-stone-100/80` | Timeline pill background | NOT MAPPED |
| timeline-pill | px-1.5 py-1 rounded-2xl | `px-1.5 py-1 rounded-2xl` | Pill styling | NOT MAPPED |
| timeline-active | amber-600 | `bg-[#EA580C] text-white` | Active pill state | NOT MAPPED |
| timeline-hover | hover:bg-amber-100 | `hover:bg-amber-100` | Hover state | NOT MAPPED |
| timeline-items | 7d, 30d, 180d, 1y, 2y, 5y, lifetime | - | Timeline periods | NOT MAPPED |

## Progress Bars
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| progress-bar-height | h-2 | `h-2` (8px) | Progress bar height | NOT MAPPED |
| progress-bar-bg | stone-100 | `bg-stone-100` | Track background | NOT MAPPED |
| progress-bar-filled | percentage-based | `w-{percentage}` | Filled portion | NOT MAPPED |
| progress-bar-amber | amber-600 | `bg-amber-600` | Amber fill | NOT MAPPED |
| progress-bar-emerald | emerald-500 | `bg-emerald-500` | Emerald fill | NOT MAPPED |

## Modals
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| modal-overlay | bg-black/60 backdrop-blur-xs | `fixed inset-0 z-50 bg-black/60 backdrop-blur-xs` | Modal backdrop | NOT MAPPED |
| modal-content | bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200 | `bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-stone-200` | Modal content container | NOT MAPPED |
| modal-close | p-1 rounded-full | `p-1 rounded-full` | Close button | NOT MAPPED |
| modal-header | - | - | Modal header section | NOT MAPPED |
| modal-body | - | - | Modal body section | NOT MAPPED |
| modal-footer | - | - | Modal footer section | NOT MAPPED |

## Avatars
| Token | Value | Tailwind Classes | Usage | Status |
|-------|-------|-----------------|-------|--------|
| avatar-size | w-10 h-10 | `w-10 h-10` (40px) | Avatar size | NOT MAPPED |
| avatar-bg | amber-100 | `bg-amber-100` | Avatar background | NOT MAPPED |
| avatar-text-color | amber-700 | `text-amber-700` | Avatar initials text | NOT MAPPED |
| avatar-shape | rounded-full | `rounded-full` | Avatar shape | NOT MAPPED |

## Scrollbars
| Token | Value | Usage | Status |
|-------|-------|-------|--------|
| scrollbar-thumb | amber-200 | `::-webkit-scrollbar-thumb:bg-amber-200` | Scrollbar thumb | NOT MAPPED |
| scrollbar-track | transparent | `::-webkit-scrollbar-track` | Scrollbar track | NOT MAPPED |
| scrollbar-width | auto | `scrollbar-width: auto` | Scrollbar width | NOT MAPPED |

## Focus Ring
| Token | Value | Usage | Status |
|-------|-------|-------|--------|
| focus-ring-width | 2px | `ring-2` | Focus ring width | NOT MAPPED |
| focus-ring-color | `var(--primary)` / `#EA580C` | `ring-primary` | Focus ring color | NOT MAPPED |
| focus-ring-offset | 2px | `ring-offset-2` | Focus ring offset | NOT MAPPED |

## Z-Index
| Token | Value | Usage | Status |
|-------|-------|-------|--------|
| z-dropdown | 100 | Dropdown menus | NOT MAPPED |
| z-modal | 200 | Modals | NOT MAPPED |
| z-tooltip | 300 | Tooltips | NOT MAPPED |
| z-toast | 400 | Toast notifications | NOT MAPPED |
| z-sidebar | 500 | Sidebar | NOT MAPPED |

## Summary
- **Total tokens identified:** 95+ individual design tokens
- **Color tokens:** 12+
- **Typography tokens:** 25+ (font family, weights, sizes, line heights)
- **Spacing tokens:** 24+ (padding, margins, gaps)
- **Radius tokens:** 9+
- **Shadow tokens:** 7+
- **Breakpoint tokens:** 5+
- **Motion/transition tokens:** 10+
- **Icon tokens:** 3+
- **Form tokens:** 30+
- **Table tokens:** 6+
- **Grid tokens:** 9+
- **Timeline tokens:** 5+
- **Progress bar tokens:** 5+
- **Modal tokens:** 5+
- **Avatar tokens:** 4+
- **Scrollbar tokens:** 3+
- **Focus ring tokens:** 3+
- **Z-index tokens:** 5+

**All status:** NOT MAPPED (ready for Phase 4-5 mapping to existing admin panel tokens)