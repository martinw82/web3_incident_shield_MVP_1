1. Project Overview
Web3 Incident Shield is a comprehensive, client-side application designed to assist Web3 organizations in managing their security incident preparedness and response. It provides tools for:

Risk Assessment: Identifying and prioritizing potential security risks.
Security & Audit Management: Tracking compliance checklists, external audits, and vulnerabilities.
Communication Planning: Defining communication channels, roles, principles, and templates.
Response Playbooks: Creating detailed, step-by-step procedures for various incident types.
Active Incident Management: Real-time tracking, logging, and coordination of ongoing incidents.
AI-Powered Analysis: Leveraging large language models (LLMs) for in-depth incident analysis.
Preparedness Reporting: Generating comprehensive reports on the organization's incident readiness.
All application data is persisted locally within the user's browser using localStorage, making it a self-contained, privacy-focused tool.

2. Technologies Used
This project is built using a modern web development stack:

Framework: Next.js 15 (React)
Language: TypeScript
Styling: Tailwind CSS
UI Components: shadcn/ui (built on Radix UI)
Icons: Lucide React
Form Management: react-hook-form with zod for validation
Toast Notifications: sonner
AI Integration: Direct API calls to Google Gemini, OpenAI GPT, and Anthropic Claude. (Note: Genkit AI is configured but not actively used by the frontend for these direct calls).
Data Persistence: Browser's localStorage
3. Prerequisites
Before you begin, ensure you have the following installed on your development machine:

Node.js: Version 18.x or higher (LTS recommended).
npm: Node Package Manager (comes with Node.js).
4. Installation
Follow these steps to set up the project locally:

Clone the repository:


git clone <repository-url>
cd web3-incident-shield
(Note: In the Bolt environment, the project files are already provided, so this step is conceptual for a typical setup.)

Install dependencies:


npm install
Run the development server:


npm run dev
This will start the Next.js development server, typically accessible at http://localhost:3000.

Build for production (static export):
The next.config.js is configured for static HTML export (output: 'export'). To build the static assets:


npm run build
The generated static files will be located in the out/ directory.

5. Project Structure
The project follows the Next.js App Router convention, organized for clarity and scalability:


.
├── app/
│   ├── (app)/                  # Main application routes
│   │   ├── communication/      # Communication Plan feature
│   │   ├── incidents/          # Incident Management (active, analysis, history)
│   │   ├── playbook/           # Response Playbook feature
│   │   ├── report/             # Preparedness Report feature
│   │   ├── risk-assessment/    # Risk Assessment feature
│   │   ├── security-audit/     # Security & Audit feature
│   │   ├── page.tsx            # Dashboard page
│   │   └── layout.tsx          # Main application layout (with DataProvider, Sidebar)
│   ├── globals.css             # Global Tailwind CSS styles
│   └── layout.tsx              # Root HTML layout
├── components/ui/              # shadcn/ui components (generated/managed by shadcn/ui CLI)
├── docs/                       # Documentation (e.g., user_readme.md)
├── hooks/
│   └── use-mobile.ts           # Custom hook for mobile detection
├── lib/
│   └── utils.ts                # Utility functions (e.g., `cn` for Tailwind class merging)
├── public/                     # Static assets
├── src/
│   ├── ai/                     # Genkit AI configuration and flows
│   │   ├── flows/
│   │   │   └── generate-incident-analysis.ts # Genkit flow for AI analysis (not directly used by frontend)
│   │   └── genkit.ts           # Genkit configuration
│   ├── components/layout/      # Layout-specific components
│   │   └── sidebar-nav.tsx     # Sidebar navigation
│   └── context/
│       └── data-context.tsx    # React Context for global data management and localStorage persistence
├── .eslintrc.json              # ESLint configuration
├── next.config.js              # Next.js configuration
├── package.json                # Project dependencies and scripts
├── postcss.config.js           # PostCSS configuration
├── tailwind.config.ts          # Tailwind CSS configuration
└── tsconfig.json               # TypeScript configuration
6. Key Technical Features
Client-Side Data Persistence: All application data (risks, incidents, playbooks, etc.) is managed through src/context/data-context.tsx and stored directly in the browser's localStorage. This provides a serverless, local-first experience.
Modular UI with shadcn/ui: The user interface is built using shadcn/ui components, which are highly customizable and integrate seamlessly with Tailwind CSS. This promotes consistency and rapid UI development.
AI Integration (Direct API Calls): The app/incidents/analysis/page.tsx directly interacts with external AI provider APIs (Google Gemini, OpenAI, Anthropic) using API keys provided by the user. This allows for flexible AI model selection.
Responsive Design: The application is designed to be responsive across various screen sizes, utilizing Tailwind CSS's utility-first approach.
Form Handling: Robust form management and validation are implemented using react-hook-form and zod, ensuring data integrity and a smooth user experience.
Static Site Generation (SSG): Configured to export as a static site, making it highly performant and easy to deploy on any static hosting platform.
7. Known Issues & Troubleshooting
During development, certain patterns and issues were addressed:

"use client" Directive:

Issue: Next.js 13+ App Router treats components as Server Components by default. Using client-side hooks (useState, useEffect, etc.) in such components without proper directives leads to errors.
Fix: Ensure that any component file utilizing client-side React features (e.g., useState, useEffect, browser-specific APIs) has the "use client"; directive at the very top of the file. This correctly marks them as Client Components. Examples include app/(app)/communication/page.tsx, src/context/data-context.tsx, etc.
"Warning: Extra attributes from the server: %s%s":

Issue: This warning occurs when the server-rendered HTML (during SSR or SSG) contains attributes that differ from what the client-side React hydration expects. This often happens with dynamic styles or attributes that are only relevant on the client.
Fix: This was primarily mitigated by correctly applying the "use client" directive to components that manage their own state or interact with the DOM. For static exports, ensure that client-side-only attributes are not present in the initial render or are handled gracefully during hydration.
AI Integration - Genkit Flow vs. Direct API Calls:

Observation: While a Genkit flow (src/ai/flows/generate-incident-analysis.ts) is defined for AI analysis, the app/incidents/analysis/page.tsx currently makes direct API calls to Google Gemini, OpenAI, and Anthropic.
Implication: The Genkit flow is not actively utilized by the frontend for the AI analysis feature as implemented. This means Genkit's benefits (e.g., observability, caching, retries) are not currently leveraged for this specific feature. This might be a planned future integration or a design choice.
AI API Key Storage:

Observation: User-provided AI API keys are stored directly in the browser's localStorage.
Security Note: While convenient for a local-first application, storing sensitive API keys directly in localStorage is generally not recommended for production applications, especially those handling sensitive data or requiring high security. These keys could be exposed via XSS attacks.
Data Persistence (Client-Side Only):

Observation: All application data resides solely in the user's browser localStorage.
Limitation: If the user clears their browser data, all application data will be lost. There is no built-in cloud backup or synchronization. This also means the application is single-user and not designed for collaborative use out-of-the-box.
8. Deployment
Since the project is configured for static HTML export (output: 'export' in next.config.js), deployment is straightforward:

Build the project:

npm run build
Deploy the out/ directory: The out/ directory contains all the necessary static HTML, CSS, and JavaScript files. You can deploy this directory to any static site hosting provider, such as:
Netlify
Vercel
GitHub Pages
Cloudflare Pages
Amazon S3 + CloudFront
9. Future Upgrades & Development Notes
Here are some considerations and potential enhancements for future development:

Backend Integration:

User Authentication: Implement a robust authentication system (e.g., using NextAuth.js, Supabase Auth, Firebase Auth) for multi-user support.
Centralized Data Storage: Migrate data from localStorage to a persistent backend database (e.g., Supabase PostgreSQL, Firebase Firestore, a custom Node.js API with MongoDB/PostgreSQL). This would enable data backup, synchronization across devices, and collaborative features.
Secure API Key Management: Move AI API keys and other sensitive credentials to a secure backend, accessible only via server-side calls, to prevent client-side exposure.
Full Genkit Integration:

Integrate the existing Genkit flows (src/ai/flows/generate-incident-analysis.ts) into the frontend's AI analysis feature. This would allow leveraging Genkit's built-in features like tracing, metrics, caching, and model routing.
Explore other Genkit capabilities for prompt engineering, data retrieval, or tool use within the application.
Real-time Features:

Implement WebSockets (e.g., with Socket.IO, Supabase Realtime) for real-time updates on active incidents, allowing multiple team members to see changes instantly.
Notifications:

Add in-app or push notifications for critical incident updates, new log entries, or assigned action items.
Advanced Reporting:

Enhance the preparedness report generation with more dynamic charts, customizable templates, and export options (e.g., direct PDF generation on the server-side if a backend is introduced).
Testing:

Implement a comprehensive testing suite including unit tests (e.g., Jest, React Testing Library), integration tests, and end-to-end tests (e.g., Playwright, Cypress) to ensure stability and prevent regressions.
CI/CD Pipeline:

Set up Continuous Integration/Continuous Deployment pipelines (e.g., GitHub Actions, GitLab CI/CD) to automate testing, building, and deployment processes.
Error Handling & Logging:

Implement more centralized and robust error handling mechanisms.
Integrate with an error monitoring service (e.g., Sentry, LogRocket) for production environments.
Performance Optimization:

Continuously monitor and optimize application performance, especially as more features or data are added.