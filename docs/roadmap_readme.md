This roadmap outlines the phased transformation of the Web3 Incident Shield into a full-fledged SaaS product. Each phase builds upon the previous one, ensuring a stable and scalable transition. The steps are ordered to minimize breaking changes and establish necessary foundations before adding complex features.

The Plan
Phase 1: Foundational SaaS Infrastructure
This phase establishes the core backend services required for any SaaS product, moving away from client-side-only data storage.

Set up Supabase Project and Database Schema:

Why: Supabase provides a PostgreSQL database, authentication, and real-time capabilities, making it an ideal choice for a Bolt.new project. Establishing the database schema first ensures data integrity and provides a clear structure for subsequent backend and frontend development.
Files to modify: No direct file modifications yet, but this step involves setting up the Supabase project via the Supabase dashboard. You should define tables for users, risks, incidents, playbooks, audits, vulnerabilities, communication_channels, communication_roles, communication_principles, communication_templates, security_checklist_items, security_checklist_status, post_incident_reviews, and ai_analyses. Ensure primary keys, foreign keys, and appropriate data types are set up.
Implement User Authentication with Supabase Auth:

Why: User authentication is fundamental for a multi-tenant SaaS application. Supabase Auth integrates seamlessly with its database and provides various authentication methods.
Files to modify:
src/context/data-context.tsx: Modify the DataProvider to initialize the Supabase client and manage user sessions instead of relying solely on localStorage. This will involve removing localStorage reads/writes for user-specific data.
app/(app)/layout.tsx: Wrap the children with a new AuthGuard component or similar logic to protect routes that require authentication.
Create new authentication-related pages (e.g., app/(auth)/login/page.tsx, app/(auth)/signup/page.tsx, app/(auth)/forgot-password/page.tsx) and corresponding UI components.
Modify src/components/layout/sidebar-nav.tsx to conditionally display navigation items based on user authentication status.
Migrate Existing localStorage Data to Supabase:

Why: This is crucial for existing users to retain their data when transitioning to the SaaS model. It should be a one-time migration process triggered upon a user's first login or account creation.
Files to modify:
src/context/data-context.tsx: Implement a migration function that, upon a user's first login, checks if localStorage contains existing data. If so, it should read the data, transform it to match the Supabase schema, and insert it into the Supabase database. After successful migration, clear the localStorage data to prevent conflicts.
Add a UI element (e.g., a modal) to guide users through the migration process if data is detected.
Refactor Data Management to Use Supabase API:

Why: Once authentication and the database are in place, all data operations (CRUD) must interact with Supabase instead of localStorage. This ensures data persistence, multi-device access, and prepares for multi-tenancy.
Files to modify:
src/context/data-context.tsx: Replace all localStorage interactions (loadFromStorage, saveToStorage) with Supabase client calls (e.g., supabase.from('risks').select('*'), supabase.from('incidents').insert(...)).
Update all components that use useData() to handle asynchronous data fetching and mutations, including loading states and error handling. This will affect almost all app/(app)/**/*.tsx files.
Phase 2: Core SaaS Features
This phase introduces essential features for a commercial SaaS product, focusing on user accounts and monetization.

Implement User Profile and Account Management:

Why: Users need to manage their profile information, change passwords, and view their subscription status.
Files to modify:
Create a new page app/(app)/settings/profile/page.tsx for user profile management.
Add a link to this page in src/components/layout/sidebar-nav.tsx.
Implement UI components for displaying and updating user information.
Integrate Stripe for Subscription Management:

Why: Stripe is a leading payment gateway for SaaS subscriptions. This enables monetization of the product.
Files to modify:
Set up Stripe products and pricing plans in the Stripe dashboard.
Create a new page app/(app)/settings/subscription/page.tsx for subscription management.
Implement Stripe Checkout for new subscriptions and Stripe Customer Portal for managing existing subscriptions. This will involve using Stripe's client-side SDK and potentially Supabase Edge Functions for webhook handling (e.g., stripe-webhook function to update user subscription status in the Supabase database).
Update src/context/data-context.tsx or create a new context/hook to manage subscription status and control feature access.
Implement Role-Based Access Control (RBAC) for Features:

Why: Different subscription tiers or user roles might have access to different features (e.g., free tier vs. premium tier).
Files to modify:
src/context/data-context.tsx: Add logic to retrieve the user's role/subscription status from Supabase.
Modify relevant app/(app)/**/*.tsx pages and components to conditionally render UI elements or restrict functionality based on the user's subscription status or role. For example, limit the number of incidents for a free tier, or restrict AI analysis to premium users.
Phase 3: Enhanced Product Features
This phase focuses on adding new, valuable features that leverage the SaaS infrastructure, improving collaboration and insights.

Implement Multi-User Collaboration within Organizations:

Why: Incident response is a team effort. Allowing multiple users within an organization to access and manage shared data is a significant SaaS enhancement.
Files to modify:
Database Schema: Add organization_id to relevant tables (e.g., risks, incidents, playbooks) and a user_organizations join table.
src/context/data-context.tsx: Modify data fetching queries to filter data by organization_id and ensure users only see data relevant to their organization.
Implement an "Organization Settings" page (app/(app)/settings/organization/page.tsx) for inviting/managing team members within an organization.
Update UI components across the application to reflect shared data and potentially show who created/modified entries.
Integrate Real-time Notifications and Alerts:

Why: Timely alerts are crucial for incident management. This moves beyond simple toast messages to persistent notifications.
Files to modify:
Backend: Use Supabase Realtime or webhooks to trigger notifications (e.g., when a new incident is created, status changes, or an action item is assigned).
Frontend: Implement a notification system (e.g., a notification bell icon with a dropdown) to display unread alerts. This could involve a new component in src/components/layout/sidebar-nav.tsx or app/(app)/layout.tsx.
Add a new database table for notifications.
Develop Advanced Analytics and Reporting Dashboards:

Why: Provide deeper insights into incident trends, team performance, and preparedness over time, leveraging the centralized data.
Files to modify:
Create new pages (e.g., app/(app)/analytics/incidents/page.tsx, app/(app)/analytics/team-performance/page.tsx).
Utilize a charting library (e.g., Recharts, already in package.json) to visualize data from Supabase.
Add new queries to src/context/data-context.tsx to fetch aggregated data for these dashboards.
Enhance AI Analysis with Genkit and Server-Side Processing:

Why: Move AI processing to the backend to protect API keys, handle rate limits, and potentially integrate more complex AI workflows (e.g., RAG, tool use) using Genkit.
Files to modify:
app/incidents/analysis/page.tsx: Modify the runAnalysis function to call a server-side API route (e.g., a Next.js API route or a Supabase Edge Function) instead of direct client-side calls to AI providers.
Create a new Next.js API route (e.g., app/api/ai-analysis/route.ts) that uses the Genkit flow (src/ai/flows/generate-incident-analysis.ts) to process the request and securely manage the AI API keys.
Remove client-side API key storage from localStorage in app/incidents/analysis/page.tsx.
Phase 4: Marketing & Growth
This phase focuses on attracting and converting users to the SaaS product.

Develop a Public-Facing Landing Page and Marketing Site:

Why: A professional landing page is essential for showcasing the product, its features, and value proposition to potential customers.
Files to modify:
Create new top-level pages outside the (app) group (e.g., app/page.tsx for the marketing landing page, app/features/page.tsx, app/pricing/page.tsx, app/contact/page.tsx).
Update the root app/layout.tsx to handle both marketing and application routes.
Design compelling UI elements using Tailwind CSS and shadcn/ui to highlight the product's benefits.
Implement SEO Best Practices:

Why: Optimize the marketing site for search engines to improve organic discoverability.
Files to modify:
Add Metadata to all public-facing pages (app/layout.tsx, app/page.tsx, etc.).
Ensure semantic HTML structure.
Implement dynamic sitemaps and robots.txt if necessary (though for a static export, this might be handled by the hosting provider).
Phase 5: Operational Excellence & Scalability
Ongoing efforts to ensure the product is robust, performant, and secure.

Set up Comprehensive Monitoring and Logging:

Why: Essential for identifying issues, tracking performance, and understanding user behavior in a production SaaS environment.
Files to modify:
Integrate a logging library (e.g., Winston, Pino) into the backend (Next.js API routes, Supabase Edge Functions).
Connect to a monitoring service (e.g., Sentry, Datadog, Prometheus/Grafana) for error tracking, performance metrics, and uptime monitoring.
Implement Automated Testing and CI/CD Pipeline:

Why: Automate the development workflow to ensure code quality, prevent regressions, and enable faster, more reliable deployments.
Files to modify:
Add unit tests for utility functions and React components (e.g., using Jest and React Testing Library).
Add integration tests for API routes and database interactions.
Set up a CI/CD pipeline (e.g., GitHub Actions) to run tests and deploy automatically on code pushes to main branches.
Continuous Performance Optimization and Security Audits:

Why: Ongoing efforts to ensure the application remains fast, responsive, and secure as it scales and new features are added.
Files to modify:
Regularly review code for performance bottlenecks and security vulnerabilities.
Conduct periodic security audits (manual and automated) of the application and its infrastructure.
Optimize database queries, API responses, and frontend rendering.