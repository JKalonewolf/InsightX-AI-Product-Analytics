# User Personas, Empathy & Journey Maps
## Project: InsightX – AI Product Analytics Platform

### 1. User Personas

#### **Persona 1: Sarah, Lead Product Manager**
*   **Role**: Lead Product Manager at a fast-growing B2B SaaS startup ($50$ employees).
*   **Demographics**: Age 32, MBA background, tech-savvy but does not write production code.
*   **Goals**: Wants to optimize the user onboarding flow, understand why trial users drop off, and measure feature adoption without constantly asking data analysts for SQL queries.
*   **Frustrations**: Legacy tools are too expensive, and setting up complex funnel charts requires weeks of configuration. Standard tools only tell her *what* happened, not *why* (requires manual Excel crunching).

#### **Persona 2: Alex, Full-Stack Software Engineer**
*   **Role**: Lead Engineer in charge of implementing metrics and integrating the platform SDK.
*   **Demographics**: Age 27, strong JavaScript/TypeScript skills, performance-oriented.
*   **Goals**: Wants an SDK that is dead-simple to integrate, lightweight (does not slow down page speeds), and doesn't pollute the global scope with bugs.
*   **Frustrations**: Bloated analytics scripts that block the main thread, poor type definitions, and complex key authentication systems that break in local test environments.

---

### 2. Empathy Map for Sarah (Lead PM)

| What does she THINK & FEEL? | What does she SEE? |
| :--- | :--- |
| * "I hope our launch goes well, but how will we know if users are actually using the new dashboard feature?" | * Competitors rolling out features rapidly. |
| * "I feel overwhelmed by the sheer volume of raw data but lack actionable insights." | * Engineering backlogs blocking simple analytics requests. |
| * "Will we meet our conversion goals this quarter?" | * Messy dashboards with conflicting metrics. |

| What does she SAY & DO? | What does she HEAR? |
| :--- | :--- |
| * "Let's run a quick A/B test to optimize our sign-up form." | * Engineers complaining about analytics script size. |
| * Manually exports CSV files to Excel to calculate retention rate. | * Executives demanding data-backed projections. |
| * Encourages the team to follow the data. | * Customer support complaining about onboarding drop-offs. |

---

### 3. Customer Journey Map (Onboarding & Integration)

| Stage | 1. Discovery | 2. SDK Integration | 3. Verify Telemetry | 4. Generate Insights |
| :--- | :--- | :--- | :--- | :--- |
| **User Action** | Sarah searches for a cost-effective analytics tool with A/B testing and AI insights. | Alex copies the one-line SDK script into the header of their web app. | Sarah performs a login action and checks if the event is logged immediately. | Sarah uses the funnel interface to see completion rates and gets an AI summary. |
| **Touchpoint** | Landing page, pricing table. | Code editor, developer documentation. | InsightX SDK Live Event Stream console. | Funnel panel, AI insights chatbot interface. |
| **Customer Goal** | Find a tool with predictable pricing and modern ML capabilities. | Integrate the telemetry library without breaking performance. | Confirm that events are tracking and registering accurately in real-time. | Identify conversion bottlenecks and get an automated root cause summary. |
| **Experience (1-5)**| 4/5 (Simple landing page) | 5/5 (One-line copy-paste script) | 5/5 (Real-time live terminal validation) | 4/5 (AI accurately tags drop-off points) |
| **Opportunities** | Offer clear comparison tables showing price difference with Amplitude. | Provide pre-configured NPM packages and TypeScript wrappers. | Show active validation checkmarks in the settings tab. | Enable Slack alerts for conversion drops. |
