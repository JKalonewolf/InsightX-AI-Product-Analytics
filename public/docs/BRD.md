# Business Requirements Document (BRD)
## Project: InsightX – AI Product Analytics Platform

### 1. Executive Summary
InsightX is an enterprise-grade, AI-powered product analytics SaaS platform designed to help digital-first organizations understand user behavior, optimize conversions, and predict churn. By combining event tracking, journey visualizations, and cohort retention engines with advanced machine learning forecasts, InsightX bridges the gap between raw data collection and actionable growth strategies.

### 2. Project Vision
In the modern SaaS environment, tools like Mixpanel and Amplitude provide descriptive analytics (what happened), while data science teams build custom predictive models (what will happen). InsightX consolidates these paradigms, offering a single-pane product analytics tool equipped with out-of-the-box ML models for conversion forecasting, anomaly detection, cohort clustering, and churn prediction.

### 3. Business Objectives & Success Criteria
*   **Customer Acquisition**: Achieve 100 enterprise registrations and 2,000 developer accounts within 6 months of launch.
*   **Time-to-Value (TTV)**: Reduce the time from registration to initial dashboard generation to under 5 minutes through a one-line integration SDK.
*   **Churn Reduction**: Enable customers to decrease their user churn rate by an average of 15% through preemptive ML recommendations.
*   **Operational Efficiency**: Maximize event collection throughput while keeping server cost below $0.05 per 10,000 events processed.

### 4. Scope of the Product
#### 4.1 In-Scope (Phase 1 MVP)
*   **Web SDK**: Lightweight JS script for initializing and tracking custom/automatic events.
*   **Real-time Ingestion Pipeline**: Ingestion endpoint processing events and pushing them to a storage engine.
*   **Analytical Dashboards**: Standard metrics (DAU/MAU, session length, retention) and customizable reports.
*   **Funnels & Retention Cohorts**: Interactive visual drop-off analysis and dynamic N-day retention matrix.
*   **A/B Testing & Feature Flags**: Standard randomized split testing with automatic p-value and statistical significance calculation.
*   **AI Engine**: Native forecasting, user clustering, and churn prediction.

#### 4.2 Out-of-Scope (Future Phases)
*   **Mobile App Native SDKs**: iOS and Android native code libraries (deferred to Phase 2).
*   **Video Session Replay**: Storing and rendering actual MP4 recordings of screens (replaced in MVP by lightweight mouse-trail/event-log rendering to conserve network and storage overhead).
*   **Database Partitioning & Horizontal Sharding**: Distributed ClickHouse setup (replaced by partitioned SQLite/PostgreSQL schema for prototype validation).

### 5. Stakeholder Matrix
| Role | Dept / Entity | Description / Interests | Key Requirement |
| :--- | :--- | :--- | :--- |
| **Product Manager** | Customer Team | Wants to track feature adoption, run experiments, and evaluate drop-offs. | Funnel building, A/B statistics |
| **Data Scientist** | Customer Team | Wants clean event data, cohort exports, and prediction results. | API endpoints, CSV exports |
| **Developer** | Customer Team | Wants a stable, bug-free, non-blocking SDK integration. | One-line JavaScript SDK |
| **Security Officer** | Customer Team | Concerns about data leakage, user consent, and regulatory rules. | GDPR, CCPA & SOC2 conformity |
| **InsightX DevOps** | Internal | Wants a highly scalable, cheap pipeline with auto-healing. | Low latency queue, SQLite/Postgres partitions |

### 6. Compliance, Governance & Data Privacy
InsightX is built with a "Privacy by Design" approach to guarantee compliance with regional regulations:
*   **GDPR / CCPA**: Supported via strict data anonymization, explicit cookie consent structures, and API endpoints for "Right to be Forgotten" (deleting user profiles and their corresponding event history).
*   **Data Masking**: The InsightX SDK automatically redacts user inputs containing credit card numbers, passwords, and sensitive PII from any automatic event capture (e.g. form submissions).
*   **SOC2 Compliance**: Database credentials are encrypted, and access controls are role-based (RBAC) to enforce auditing.

### 7. Financial & ROI Modeling (Cost Analysis)
*   **Data Ingestion Costs**: Estimating 10 million events/month per standard customer. Running on AWS RDS and ECS, we target a cost structure of:
    *   Ingestion API (FastAPI) + Redis: ~$15/month per node.
    *   Database (PostgreSQL on Neon/RDS): ~$30/month.
    *   Data storage (S3 + Athena): ~$0.023 per GB.
*   **Revenue Generation Strategy**:
    *   **Free Plan**: 100k events/month, 3 dashboards, 1 team member.
    *   **Pro Plan ($99/mo)**: 5M events/month, unlimited dashboards, basic A/B testing, AI insights.
    *   **Enterprise ($499+/mo)**: Unlimited events, predictive AI models, custom SLA, dedicated server.
