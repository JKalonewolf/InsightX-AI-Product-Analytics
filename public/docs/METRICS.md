# Product Metrics & Statistical Framework
## Project: InsightX – AI Product Analytics Platform

### 1. Key SaaS and Growth Metrics

#### **Daily Active Users (DAU) & Monthly Active Users (MAU)**
*   **Definition**: The count of unique users who trigger at least one tracking event during a 24-hour window (DAU) or a 30-day window (MAU).

#### **Product Stickiness**
*   **Formula**:
    $$\text{Stickiness} = \frac{\text{DAU}}{\text{MAU}}$$
*   **Meaning**: The probability that an active user visits the product on any given day. A stickiness of $20\%$ means users visit 6 days out of a 30-day month.

#### **Average Revenue Per User (ARPU)**
*   **Formula**:
    $$\text{ARPU} = \frac{\text{Total Revenue generated in period } t}{\text{Total Active Users in period } t}$$

#### **Customer Lifetime Value (CLV)**
*   **Formula**:
    $$\text{CLV} = \frac{\text{ARPU} \times \text{Gross Margin (\%) }}{\text{Churn Rate}}$$
*   **Meaning**: The total net revenue a company expects to earn from a single customer throughout their subscription relationship.

#### **Customer Acquisition Cost (CAC)**
*   **Formula**:
    $$\text{CAC} = \frac{\text{Total Sales \& Marketing Expenses in period } t}{\text{New Customers acquired in period } t}$$

#### **Net Revenue Retention (NRR)**
*   **Formula**:
    $$\text{NRR} = \frac{\text{Starting MRR} + \text{Expansion MRR} - \text{Contraction MRR} - \text{Churned MRR}}{\text{Starting MRR}} \times 100\%$$
*   **Meaning**: The percentage of recurring revenue retained from existing customers over a given period, accounting for upgrades, downgrades, and churn.

---

### 2. A/B Testing Statistical Calculations

To evaluate whether a variation B outperforms a control A in conversion rate, InsightX calculates conversion probabilities, Standard Errors, Z-Scores, P-values, and statistical significance.

#### **Conversion Rate**
$$p_A = \frac{C_A}{N_A}, \quad p_B = \frac{C_B}{N_B}$$
where $C$ represents conversions and $N$ represents total cohort size.

#### **Standard Error (SE)**
$$\text{SE}_A = \sqrt{\frac{p_A(1 - p_A)}{N_A}}, \quad \text{SE}_B = \sqrt{\frac{p_B(1 - p_B)}{N_B}}$$

#### **Pooled Conversion Rate (\(p_p\))**
$$p_p = \frac{C_A + C_B}{N_A + N_B}$$

#### **Z-Score**
$$Z = \frac{p_B - p_A}{\sqrt{p_p(1 - p_p)\left(\frac{1}{N_A} + \frac{1}{N_B}\right)}}$$

#### **P-Value (Two-Tailed Test)**
Using the Standard Normal distribution function $\Phi(Z)$:
$$\text{p-value} = 2(1 - \Phi(|Z|))$$

#### **Statistical Significance Decision**
If $\text{p-value} < 0.05$ (meaning confidence is $\ge 95\%$), the result is flagged as **Statistically Significant**. If $p_B > p_A$, Variation B is declared the **Winner** with a lift of:
$$\text{Lift} = \frac{p_B - p_A}{p_A} \times 100\%$$

---

### 3. Cohort Retention Definitions

#### **Classic Cohort Retention**
Measures the percentage of users who return and perform an action on *exactly* Day $t$ relative to their cohort start date (Day 0).
$$\text{Retention}(t) = \frac{\text{Active Users on Day } t \text{ who started on Day 0}}{\text{Total Users who started on Day 0}}$$

#### **Rolling Cohort Retention**
Measures the percentage of users who return on *or after* Day $t$ relative to their start date. This is less sensitive to daily fluctuations.
$$\text{Rolling Retention}(t) = \frac{\text{Users active on or after Day } t \text{ who started on Day 0}}{\text{Total Users who started on Day 0}}$$
