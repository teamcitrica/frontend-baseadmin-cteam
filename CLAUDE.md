# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview
Study-Expeditions is a Next.js 15 application built with HeroUI components, focused on managing study expedition requests for institutions. The app features a responsive design with both light/dark theme support and admin panel functionality.

## Essential Commands
- **Development**: `npm run dev` (with Turbo mode enabled)  
- **Build**: `npm run build`
- **Linting**: `npm run lint` (ESLint with TypeScript support and auto-fix)
- **Start production**: `npm start`

## Architecture & Key Technologies
- **Framework**: Next.js 15 with App Router architecture
- **UI Library**: HeroUI v2 (custom UI components)
- **Styling**: SCSS with custom design tokens + Tailwind CSS
- **Database**: Supabase (with React hooks integration)
- **State Management**: React Context for auth/cart, custom hooks for data fetching
- **Theme**: next-themes for light/dark mode with HeroUI provider

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

### Custom Styling System
- SCSS files organized in numbered folders (01-settings to 11-atomic-design)
- Custom text tokens and design system variables
- Responsive breakpoints using custom Col/Container components (`@citrica/objects`)

## Key Features & Patterns
- **Responsive Navbar**: Auto-changing colors on scroll, mobile drawer menu
- **Admin Panel**: Sidebar navigation with nested sub-items using URL search params
- **Form Management**: Custom hooks for study expedition requests with Supabase integration
- **Authentication**: Supabase auth context (currently commented out in layout)
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