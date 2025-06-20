# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a static HTML-based project for creating and managing photovoltaic (solar panel) installation quotes. The project specifically handles quotes for solar installations by iSolar PV s.r.o., with the main project being "ASV Solnice" - a 99.82 kWp solar installation.

## File Structure and Purpose

- `index.html` - Main detailed quote with comprehensive pricing breakdown and technical specifications
- `nabidka-fve-asv-solnice.html` - Alternative quote format with different styling and layout
- `nabidka-fve-asv-nova.html` - Another quote variant
- `nabidka-fve-solnice.html` - Additional quote format
- `seznam-nabidek.html` - Index page listing all available quotes
- `rozpocet-kalkulace.html` - Budget calculator/spreadsheet interface for quote calculations
- `nabidka-email-verze.html` - Email-friendly version of quotes
- `chranena-nabidka.html` - Password-protected or secured quote version

## Technology Stack

- Pure HTML/CSS/JavaScript (no frameworks)
- Responsive design using CSS Grid and Flexbox
- LocalStorage for data persistence between pages
- Czech language interface

## Quote Data Flow

The system uses localStorage to pass calculated data between pages:
1. `rozpocet-kalkulace.html` - Users input/calculate pricing data
2. Data is stored in localStorage as `budgetData` or `calculatorData`
3. Quote pages (like `index.html`) automatically load and apply this data on page load
4. Data includes itemized costs, totals, VAT calculations, and technical specifications

## Key Components Structure

### Technical Specifications
- SolarEdge inverters (SE50K, SE25K)
- Power optimizers (S1000 series)
- K2 Systems mounting structure
- **Leapton Energy LP182x182-M-60-MH-460 panels** (supplied by customer)
- Electrical components and cabling

### Pricing Categories
- SolarEdge components
- Installation work
- K2 mounting system
- Electrical panels and switchboards
- Cabling and electrical installation
- Transportation
- Service and commissioning

## Styling Conventions

- Primary color scheme: Blue gradient (#2c5aa0 to #1e3a72)
- White background with subtle shadows
- Grid-based layouts for responsive design
- Czech formatting for numbers and currency (Kč)
- Professional styling with hover effects and transitions

## Local Development

Since this is a static HTML project:
- Open HTML files directly in a browser
- No build process or package management required
- For local development server: `python -m http.server 8000` or similar
- Files can be edited with any text editor

## Content Management

- All pricing data is embedded in HTML/JavaScript
- Quote content is manually updated in HTML files
- Customer information and project details are hardcoded
- PDF documents stored in `dsp-solnice/` directory contain technical drawings

## Localization

- All content is in Czech language
- Currency displayed in Czech Koruna (Kč)
- Date format: DD. M. YYYY
- Czech number formatting (space as thousands separator)

# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.

## Recent Work Completed (2025-06-20)

### Panel Type Update
- Changed FV panel type from JinkoSolar JKM-460M-60HL4 to **Leapton Energy LP182x182-M-60-MH-460**
- Updated in both `index.html` (root) and `projects/asv-solnice/index.html`
- Issue was that GitHub Pages uses root index.html, not the project subfolder

### PDF Print Optimization
- Added comprehensive CSS print styles for A4 format
- Included cache busting meta tags to force browser refresh
- Print styles include:
  - Color preservation for gradients
  - Proper page breaks
  - A4 margins (1.5cm)
  - Prevention of element deformation

### Files Modified
1. `index.html` - Root file used by GitHub Pages
2. `projects/asv-solnice/index.html` - Project-specific file

### Git Status
- All changes committed and pushed to GitHub
- Latest commits:
  - acc148d - Root nabídky oprava s panely a PDF
  - 25862e7 - PDF optimalizace pro projects/asv-solnice/
  - b1483db - Původní změna panelů

### System Architecture
- Universal system v2.0 implemented
- Database-driven component management
- GitHub Actions automation
- Scalable for multiple projects