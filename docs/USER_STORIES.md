# User Stories & Sprint Backlog
## Project: InsightX – AI Product Analytics Platform

### 1. User Stories & Acceptance Criteria

#### **US-101: Integration SDK Event Capture**
*   **As a** Full-Stack Developer
*   **I want to** integrate a lightweight JavaScript SDK script tag into my website
*   **So that** I can send custom client-side events to the InsightX collection servers.
*   **Acceptance Criteria (Gherkin)**:
    ```gherkin
    Scenario: Successful Event Telemetry Transmission
      Given the developer has initialized the SDK with "InsightX.init('API_KEY_123')"
      When a user triggers "InsightX.track('Add to Cart', { price: 29.99 })"
      Then the SDK should compile a JSON payload containing the event name, properties, unique userId, browser language, and viewport dimensions
      And make a non-blocking POST request to "/api/v1/track"
      And return a 200 OK success response from the server
    ```

#### **US-102: Interactive Funnel Visualization**
*   **As a** Growth Product Manager
*   **I want to** view step-by-step funnel drop-offs for key signup flows
*   **So that** I can identify optimization opportunities.
*   **Acceptance Criteria (Gherkin)**:
    ```gherkin
    Scenario: Viewing Funnel Step Analysis
      Given a project has tracked 1,000 "Landing" events, 500 "Signup" events, and 100 "Purchase" events
      When the PM requests a Funnel analysis for "Landing -> Signup -> Purchase"
      Then the Analytics Engine should output:
        - Landing Step: 100% completion (1,000 users)
        - Signup Step: 50% completion (500 users, 50% drop-off)
        - Purchase Step: 10% completion (100 users, 80% drop-off relative to signup)
      And the frontend dashboard should render these as a vertical drop-off bar chart.
    ```

#### **US-103: AI Churn Prediction Scoring**
*   **As a** Customer Success Manager
*   **I want to** review active accounts sorted by churn probability scores
*   **So that** I can reach out to at-risk accounts before they cancel.
*   **Acceptance Criteria (Gherkin)**:
    ```gherkin
    Scenario: Querying Churn Risk Matrix
      Given the ML engine runs daily user activity classification
      When the PM opens the "AI Insights" page
      Then the dashboard should render a table listing users with their predicted risk levels:
        - High Risk (last active > 14 days ago, active minutes drop > 50%)
        - Healthy (active within 3 days, consistent frequency)
      And show key recommendation actions (e.g. "Send discount coupon").
    ```

---

### 2. Sprint Backlog (Sprint 1 - Core Ingestion & Dashboard)
| Task ID | Component | Task Description | Estimate (Story Points) | Status |
| :--- | :--- | :--- | :---: | :--- |
| **TS-001** | Database | Design SQLite tables schema (`users`, `events`, `flags`, `projects`). | 2 | Completed |
| **TS-002** | SDK | Write Javascript Client SDK (`insightx.js`) with track call handler. | 3 | In Progress |
| **TS-003** | Backend | Implement Express/FastAPI `track` ingestion endpoint with API validation. | 3 | In Progress |
| **TS-004** | Backend | Build statistics engine for funnels and N-day cohort matrices. | 5 | In Progress |
| **TS-005** | Backend | Build statistics formulas for A/B testing and local ML predictors. | 5 | In Progress |
| **TS-006** | Frontend | Develop React SPA dashboard with Tailwind CSS templates. | 8 | In Progress |
