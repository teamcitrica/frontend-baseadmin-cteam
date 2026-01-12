# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
frontend-base-admin-cteam is a Next.js 15 base administration application built with HeroUI components. The app features a responsive design with light/dark theme support and a complete admin panel for managing bookings (reservas), clients (clientes), tasks (tareas), and app configuration.

## Essential Commands
- **Development**: `npm run dev` (with Turbo mode enabled)  
- **Build**: `npm run build`
- **Linting**: `npm run lint` (ESLint with TypeScript support and auto-fix)
- **Start production**: `npm start`

## Architecture & Key Technologies
- **Framework**: Next.js 15 with App Router architecture
- **UI Library**: HeroUI v2 + citrica-ui-toolkit v0.0.10 (custom component library)
- **Styling**: SCSS with Citrica Design System + Tailwind CSS 3.4
- **Database**: Supabase (with React hooks integration)
- **State Management**: React Context for auth/cart, custom hooks for data fetching
- **Theme**: next-themes for light/dark mode with HeroUI provider
- **Icons**: Lucide React icons

## Component Architecture
The app uses a structured atomic design pattern:

### Citrica UI System (`/shared/components/citrica-ui/`)
- **Atoms**: Basic components like `text.tsx`, `card.tsx`, `icon.ts`
- **Molecules**: Combined components like `button.tsx`, `carrusel.tsx`, `modal.tsx`  
- **Organisms**: Complex components like `navbar.tsx`, `sidebar.tsx`, `footer.tsx`, `header.tsx`
- **Third-parties**: External component integrations like `video.jsx`

#### Header Component (`header.tsx`)
Multi-variant header component with optional button functionality:

**Variants:**
- `travel`: Dark overlay style with centered navigation and white CTA button
- `team`: Clean white background with split navigation and black rounded CTA button  
- `minimal`: Simple layout with only logo and optional button (no navigation)

**Props:**
- `logo?: React.ReactNode` - Custom logo component
- `variant?: 'travel' | 'team' | 'minimal'` - Header style variant (default: 'travel')
- `className?: string` - Additional CSS classes
- `showButton?: boolean` - Controls button visibility (default: false)
- `buttonText?: string` - Custom button text (default: 'GET STARTED')
- `onButtonClick?: () => void` - Custom button click handler

**Features:**
- Responsive design with mobile hamburger menu
- Scroll-based background transitions
- Auto-adapts button text for each variant (respects custom text)
- Uses siteConfig.navLinks for navigation items
- Smooth scroll to sections functionality

### Citrica UI Toolkit (citrica-ui-toolkit v0.0.10)
Custom component library built on top of HeroUI with Citrica design tokens.

**Available Components:**
- **Button**: Customizable button with variants (primary, secondary, flat, success, warning, danger) and admin mode support
- **Input**: Text input with icon support, multiple variants (primary, secondary), and form validation
- **Select**: Dropdown select with custom styling, icon support, and option rendering
- **Text**: Typography component with responsive variants (display, headline, title, subtitle, body, label)
- **Icon**: Lucide icon wrapper with size and color props
- **Card**: Card component with header/footer support
- **Textarea**: Multi-line text input with character limits
- **Modal**: Modal dialog with customizable size and placement
- **Carousel**: Swiper-based carousel with autoplay and pagination

**Usage Example:**
```tsx
import { Button, Input, Select, Text } from 'citrica-ui-toolkit';

<Button variant="primary" label="Save" onPress={handleSave} />
<Input variant="primary" label="Email" type="email" startIcon="Mail" />
<Select variant="primary" label="Country" options={countries} />
<Text variant="headline" weight="bold">Welcome</Text>
```

### Citrica Design System (Styles Architecture)
SCSS files organized in numbered folders following ITCSS methodology:

1. **01-settings**: Global variables, colors, fonts, mixins
   - `colors/` - Light/dark theme color tokens
   - `colors-admin/` - Admin-specific color tokens
   - `settings.scss` - Grid system, typography, responsive variables
   - `mixins.scss` - Responsive mixins and utilities

2. **02-tools**: SCSS functions and tools
3. **03-external**: External library overrides
4. **04-generic**: Reset and normalize styles
5. **05-tags**: HTML tag defaults
6. **06-keyframes**: Animation keyframes
7. **07-objects**: Layout objects (grid, containers)
8. **08-components**: Component-specific styles
9. **09-utilities**: Utility classes
10. **10-tokens**: Design tokens for components
    - `button-tokens.scss` - Button variants and states
    - `input-tokens.scss` - Input field styling
    - `select-tokens.scss` - Select dropdown styling
    - `textarea-tokens.scss` - Textarea styling
    - `text-tokens.scss` - Typography tokens
    - `calendar-tokens.scss` - Calendar component tokens
    - `form-tokens.scss` - Form-wide tokens
    - `login-tokens.scss` - Login-specific tokens
11. **11-atomic-design**: Atomic design components
12. **custom.scss**: Project-specific custom styles

**Design Token System:**
- Supports both regular and admin variants for all components
- CSS variables for dynamic theming
- Responsive typography and spacing scales
- Color tokens following Material Design naming (primary, secondary, tertiary, etc.)

## Key Features & Patterns
- **Responsive Navbar**: Auto-changing colors on scroll, mobile drawer menu
- **Admin Panel**: Sidebar navigation with nested sub-items using URL search params
  - `/admin/reservas` - Booking management with calendar, weekly, and availability views
  - `/admin/clientes` - Client management
  - `/admin/tareas` - Task management
  - `/admin/config-app` - Application configuration
- **Form Management**: Custom hooks for data management with Supabase integration
- **Authentication**: Supabase auth context with login, forgot password, and new password pages
- **Toast System**: HeroUI toast provider with top-right placement

## Database Integration
- Supabase client with custom hooks in `/app/hooks/`

## File Structure Notes  
- App pages follow Next.js App Router convention
- Shared utilities in `/shared/` with TypeScript types
- Site configuration centralized in `/config/site.ts`
- Custom fonts in `/fonts/` directory
- Static assets in `/public/img/`

## Development Notes
- Uses ES modules and TypeScript strict mode
- Custom icon system with Lucide React icons
- Locale set to Spanish (es-ES) in HeroUI provider
- Environment supports both development and production builds with Turbo mode