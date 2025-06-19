# AlmaPhone

## Overview

AlmaPhone is a modern, open-source web-based VoIP phone application built with Vue.js 3. Designed for businesses that need a reliable, feature-rich softphone solution that runs directly in the browser without requiring additional software installations.

## Features

- **Web-Based VoIP Calling**: Make and receive calls directly through your browser
- **Real-Time Communication**: WebRTC-based calling with high-quality audio
- **Contact Management**: Integrated phonebook and contact directory
- **Call History**: Track incoming, outgoing, and missed calls
- **Modern UI**: Clean, responsive interface built with PrimeVue components
- **Cross-Platform**: Works on desktop and mobile browsers

## Technology Stack

- **Vue.js 3** with Composition API and TypeScript
- **Vite** for fast development and optimized builds
- **Pinia** for reactive state management
- **PrimeVue** for professional UI components
- **Axios** for API communication
- **Vue Router** for SPA navigation

## Prerequisites

- Node.js (v18 or higher)
- npm or yarn package manager
- Modern web browser with WebRTC support

## Installation

1. Clone the repository:
   ```bash
   git clone <repository-url>
   cd almaphone-frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment:
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. Start development server:
   ```bash
   npm run dev
   ```

5. Build for production:
   ```bash
   npm run build
   ```

## Development Commands

```bash
npm run dev         # Start development server
npm run build       # Build for production
npm run preview     # Preview production build
npm run type-check  # TypeScript type checking
npm run lint        # Run ESLint
npm run format      # Format code with Prettier
```
