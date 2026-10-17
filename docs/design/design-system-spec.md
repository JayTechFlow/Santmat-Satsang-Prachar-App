# Santmat Satsang Prachar Design System Specification

## Overview

This document defines the visual design system for the Santmat Satsang Prachar admin dashboard, establishing consistent patterns, components, and guidelines to create a modern, accessible, and efficient user experience while preserving the spiritual essence of the platform.

## Design Principles

1. **Clarity Over Clutter** - Present information clearly without unnecessary visual elements
2. **Spiritual Harmony** - Reflect the peaceful nature of Santmat through warm, natural aesthetics
3. **Efficiency First** - Optimize for task completion with minimal friction
4. **Inclusive Design** - Ensure accessibility for all administrators regardless of ability
5. **Cultural Sensitivity** - Respect and integrate traditional Devanagari script and local preferences

## Color Palette

### Brand Colors
- **Primary (Saffron)**: `#EA580C` - Used for primary actions, highlights, and key interactions
- **Primary Hover**: `#C2410C` - Slightly darker for hover states
- **Primary Light**: `#FFF7ED` - Subtle background for highlighted areas

### Neutral Palette
- **Surface**: `#FFFFFF` - Primary card and panel backgrounds
- **Background**: `#FBF9F5` - Main page background with warm undertone
- **Background Alt**: `#FAF8F5` - Alternative background for sections

### Typography Colors
- **Text Primary**: `#1C1917` - High contrast body and heading text
- **Text Secondary**: `#78716C` - Supporting text and descriptions
- **Text Muted**: `#A8A29E` - Disabled states, placeholders

### Semantic Colors
- **Success**: `#059669` - Positive actions and success states
- **Warning**: `#D97706` - Cautionary messages and warnings
- **Danger**: `#DC2626` - Destructive actions and errors
- **Info**: `#0284C7` - Notifications and informational content

## Typography System

### Font Stack
Primary font: **Mukta** (fallback to system sans-serif)

```css
font-family: 'Mukta', system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
```

### Heading Scale
- **H1**: 32px / 40px line-height (Dashboard titles)
- **H2**: 24px / 32px line-height (Section headers)
- **H3**: 20px / 28px line-height (Card titles)
- **H4**: 16px / 24px line-height (Sub-sections)

### Body Text
- **Body Large**: 16px / 24px line-height (Primary content)
- **Body Medium**: 14px / 20px line-height (Secondary content)
- **Body Small**: 12px / 18px line-height (Supporting text, labels)

### Font Weights
- **Light**: 300 (Minimal usage)
- **Regular**: 400 (Body text default)
- **Medium**: 500 (Emphasized content)
- **Semi-bold**: 600 (Subheadings)
- **Bold**: 700 (Headings, important elements)

## Spacing System

Based on an 8px grid system:

- **XXS**: 4px
- **XS**: 8px
- **SM**: 12px
- **MD**: 16px
- **LG**: 24px
- **XL**: 32px
- **XXL**: 40px
- **XXXL**: 48px

## Component Design Guidelines

### Cards & Containers

**Elevation Levels:**
- **None**: Flat surfaces (background panels)
- **XS**: 0px X, 1px Y, 2px Blur, #000000/5% (Default cards)
- **SM**: 0px X, 4px Y, 6px Blur, #000000/5% (Hover states)

**Border Radius:**
- **Cards & Panels**: 12px
- **Buttons & Pills**: 8px
- **Badges**: 6px
- **Input Fields**: 8px

### Buttons

**Variants:**
- **Primary**: Solid saffron with white text for main actions
- **Secondary**: White with border for common actions
- **Tertiary**: Subtle background for less important actions
- **Destructive**: Red for delete/archive operations
- **Ghost**: Text-only links that look like buttons

**Sizes:**
- **Small**: 32px height, 12px padding (Icon buttons, tags)
- **Medium**: 40px height, 16px horizontal padding (Default)
- **Large**: 48px height, 20px horizontal padding (Primary actions)

### Forms

**Input States:**
- **Default**: Light border with subtle shadow
- **Focus**: Primary color ring with enhanced shadow
- **Error**: Red border with appropriate messaging
- **Success**: Green border for validated inputs
- **Disabled**: Reduced opacity with no interaction

**Labels:**
- Always use clear, descriptive labels above input fields
- Required fields marked with red asterisk
- Help text below inputs when needed

### Data Display

**Tables:**
- Clean borders with subtle row striping
- Sticky headers for large datasets
- Contextual actions on hover
- Proper sorting and filtering affordances

**Lists:**
- Consistent padding and spacing
- Clear visual hierarchy between items
- Hover states for interactive list items

### Navigation

**Sidebar:**
- Collapsible for small screens
- Grouped by functional areas
- Active state highlighting
- RBAC-aware item visibility

**Header:**
- Contextual actions based on current view
- Consistent placement of global elements
- Responsive behavior for mobile

## Responsive Breakpoints

```css
/* Mobile First */
--mobile-sm: 360px;
--mobile-md: 390px;
--tablet: 768px;
--laptop: 1024px;
--desktop: 1366px;
--widescreen: 1920px;
```

## Accessibility Guidelines

### Color Contrast
- All text must meet WCAG AA standards (4.5:1 ratio)
- Interactive elements require 3:1 contrast ratio
- Focus indicators must be clearly visible

### Keyboard Navigation
- All interactive elements accessible via tab
- Logical tab order matching visual layout
- Skip links for main content areas

### Screen Reader Support
- Proper heading hierarchy
- ARIA labels for decorative elements
- Form field associations with labels

## Iconography

### Icon Set
Using Lucide React icons consistently across the application:

**Sizing:**
- **Small**: 16px (Inline text, badges)
- **Medium**: 20px (Default buttons, navigation)
- **Large**: 24px (Feature icons, illustrations)

**Color Treatment:**
- Inherit parent text color by default
- Primary color for active states
- Muted colors for secondary actions

## Motion & Animation

### Principles
- Subtle animations to enhance usability
- Performance-focused implementations
- Meaningful transitions that guide user attention

### Timing & Easing
- **Micro-interactions**: 150ms ease-in-out
- **Page transitions**: 300ms ease
- **Modal appearances**: 200ms ease-out

## Dark Mode Considerations

While not currently implemented, the design system should support dark mode in the future:

### Dark Palette Base
- Surface: `#1C1917`
- Background: `#292524`
- Text primary: `#FAFAF9`
- Text secondary: `#D6D3D1`

## Implementation Guidelines

### CSS Custom Properties

All design tokens should be defined as CSS variables in the root:

```css
:root {
  /* Color Tokens */
  --color-brand: #EA580C;
  --color-brand-hover: #C2410C;

  /* Spacing Tokens */
  --spacing-xs: 0.5rem;
  --spacing-sm: 0.75rem;
  --spacing-md: 1rem;

  /* Typography Tokens */
  --font-size-h1: 2rem;
  --font-size-body: 1rem;
}
```

### Component API Consistency

All components should follow consistent patterns:
- Boolean props for simple switches (loading, disabled)
- Enum props for variant selection (size, variant)
- Event handler props prefixed with "on" (onClick, onChange)
- Support for className and style passthrough
- Proper TypeScript interfaces for all props

## Future Expansion

This design system is intended to evolve:
- Regular audit for consistency violations
- Component library expansion based on usage patterns
- Performance optimization of design implementations
- Continuous accessibility improvements