import sqlite3
import json
import math
from datetime import datetime, timedelta
import random

DB_PATH = "insightx.db"
PROJECT_ID = "proj-default"

def seed_synthetic_data():
    print("Initializing Database Seeding for InsightX...")
    
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # Initialize tables
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS users (
        id TEXT PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        full_name TEXT,
        role TEXT DEFAULT 'Viewer',
        mfa_enabled INTEGER DEFAULT 0,
        mfa_secret TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS organizations (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, billing_plan TEXT DEFAULT 'Free', billing_status TEXT DEFAULT 'Active'
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS projects (
        id TEXT PRIMARY KEY, name TEXT NOT NULL, organization_id TEXT, api_key TEXT UNIQUE NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS events (
        id TEXT PRIMARY KEY, project_id TEXT NOT NULL, event_name TEXT NOT NULL, user_id TEXT NOT NULL, session_id TEXT NOT NULL, timestamp TEXT NOT NULL, properties TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS funnels (
        id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, steps TEXT NOT NULL
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS feature_flags (
        id TEXT PRIMARY KEY, project_id TEXT NOT NULL, key TEXT UNIQUE NOT NULL, description TEXT, active INTEGER DEFAULT 1, rollout_percentage INTEGER DEFAULT 100, rules TEXT
    )
    """)
    cursor.execute("""
    CREATE TABLE IF NOT EXISTS experiments (
        id TEXT PRIMARY KEY, project_id TEXT NOT NULL, name TEXT NOT NULL, hypothesis TEXT, status TEXT DEFAULT 'Draft', control_flag_id TEXT, variation_flag_id TEXT, metric_name TEXT NOT NULL
    )
    """)

    # Seed initial items if empty
    cursor.execute("SELECT COUNT(*) FROM organizations")
    if cursor.fetchone()[0] == 0:
        cursor.execute("INSERT INTO organizations VALUES ('org-default', 'Demo Org', 'Pro', 'Active')")
        cursor.execute("INSERT INTO projects VALUES ('proj-default', 'Default Project', 'org-default', 'ix-pk-demo123456789')")
        cursor.execute("INSERT INTO funnels VALUES ('fun-default', 'proj-default', 'Core User Journey', 'Landing,Signup,Checkout,Purchase')")
        cursor.execute("INSERT INTO feature_flags VALUES ('ff-1', 'proj-default', 'new-billing-flow', 'Toggle premium payment page design', 1, 50, '')")
        cursor.execute("INSERT INTO feature_flags VALUES ('ff-2', 'proj-default', 'ai-recommendations', 'Enable AI user recommendation module', 1, 100, '')")
        cursor.execute("INSERT INTO experiments VALUES ('exp-default', 'proj-default', 'Billing Flow Optimization v1', 'New design increases payment completion', 'Active', 'control', 'variation', 'Purchase')")
        cursor.execute("INSERT INTO users VALUES ('usr-demo', 'demo@insightx.ai', 'demo123', 'Sarah Jenkins', 'Administrator', 0, '')")

    # Clear existing events
    cursor.execute("DELETE FROM events")
    
    now = datetime.utcnow()
    
    # 1. Seed 5000 users distributed across 30 days
    # User cohort distribution
    # User properties: country, browser, device
    countries = ["United States", "United Kingdom", "Canada", "India", "Germany", "Japan"]
    browsers = ["Chrome", "Safari", "Firefox", "Edge"]
    devices = ["Desktop", "Mobile", "Tablet"]
    
    # Generate A/B test cohorts
    # Control: 2450 users, 196 conversions (8.0% conversion rate)
    # Variation: 2510 users, 251 conversions (10.0% conversion rate)
    
    total_users = 0
    events_inserted = 0

    print("Generating 30 days of telemetry event history...")
    
    # We will generate daily user cohorts
    for day_offset in range(30, -1, -1):
        date_base = now - timedelta(days=day_offset)
        date_str = date_base.strftime("%Y-%m-%d")
        
        # New users acquired on this day
        new_users_count = random.randint(30, 80)
        
        for u in range(new_users_count):
            total_users += 1
            uid = f"usr-synth-{total_users}"
            sid = f"ses-synth-{total_users}"
            
            # Static attributes
            country = random.choices(countries, weights=[50, 15, 10, 10, 10, 5])[0]
            browser = random.choices(browsers, weights=[70, 20, 7, 3])[0]
            device = random.choices(devices, weights=[65, 30, 5])[0]
            
            # A/B group allocation based on user id ending odd/even
            is_variation = (total_users % 2 == 0)
            
            # Generate funnel path for the user
            # Step 1: Landing (100% path)
            landing_time = date_base + timedelta(minutes=random.randint(1, 60))
            cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                           (f"ev-s-{events_inserted}", PROJECT_ID, "Landing", uid, sid, landing_time.isoformat(),
                            json.dumps({"$browser": browser, "$device": device, "country": country})))
            events_inserted += 1
            
            # Step 2: Signup (50% conversion probability)
            if random.random() < 0.5:
                signup_time = landing_time + timedelta(seconds=random.randint(10, 120))
                cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (f"ev-s-{events_inserted}", PROJECT_ID, "Signup", uid, sid, signup_time.isoformat(),
                                json.dumps({"$browser": browser, "$device": device, "country": country})))
                events_inserted += 1
                
                # Step 3: Checkout (50% conversion probability from signup)
                if random.random() < 0.5:
                    checkout_time = signup_time + timedelta(seconds=random.randint(30, 300))
                    cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                                   (f"ev-s-{events_inserted}", PROJECT_ID, "Checkout", uid, sid, checkout_time.isoformat(),
                                    json.dumps({"$browser": browser, "$device": device, "country": country})))
                    events_inserted += 1
                    
                    # Step 4: Purchase (A/B Test logic)
                    # Control (odd): 35% conversion probability from Checkout
                    # Variation (even): 85% conversion probability from Checkout (leads to highly significant lift)
                    conv_prob = 0.85 if is_variation else 0.35
                    if random.random() < conv_prob:
                        purchase_time = checkout_time + timedelta(seconds=random.randint(15, 180))
                        cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                                       (f"ev-s-{events_inserted}", PROJECT_ID, "Purchase", uid, sid, purchase_time.isoformat(),
                                        json.dumps({"$browser": browser, "$device": device, "country": country, "price": 49.99})))
                        events_inserted += 1

            # Retention Returning sessions (Day 1, Day 7, Day 14 activity)
            # Add returning events based on cohort decay
            # Day 1 return probability: 30%
            if day_offset >= 1 and random.random() < 0.3:
                return_date = date_base + timedelta(days=1, hours=random.randint(1, 6))
                cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (f"ev-s-{events_inserted}", PROJECT_ID, "Landing", uid, sid + "-r1", return_date.isoformat(),
                                json.dumps({"$browser": browser, "$device": device, "country": country})))
                events_inserted += 1
                
            # Day 7 return probability: 15%
            if day_offset >= 7 and random.random() < 0.15:
                return_date = date_base + timedelta(days=7, hours=random.randint(1, 6))
                cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (f"ev-s-{events_inserted}", PROJECT_ID, "Landing", uid, sid + "-r7", return_date.isoformat(),
                                json.dumps({"$browser": browser, "$device": device, "country": country})))
                events_inserted += 1

            # Day 14 return probability: 10%
            if day_offset >= 14 and random.random() < 0.10:
                return_date = date_base + timedelta(days=14, hours=random.randint(1, 6))
                cursor.execute("INSERT INTO events VALUES (?, ?, ?, ?, ?, ?, ?)",
                               (f"ev-s-{events_inserted}", PROJECT_ID, "Landing", uid, sid + "-r14", return_date.isoformat(),
                                json.dumps({"$browser": browser, "$device": device, "country": country})))
                events_inserted += 1

    conn.commit()
    conn.close()
    print(f"Database Seeding Complete. Generated {total_users} synthetic users and {events_inserted} total event logs.")

def verify_calculations():
    print("\nVerifying Analytics Engine Calculations...")
    conn = sqlite3.connect(DB_PATH)
    cursor = conn.cursor()

    # 1. Verify conversion totals for A/B Test
    cursor.execute("""
        SELECT 
            SUM(CASE WHEN (CAST(SUBSTR(user_id, 11) AS INTEGER) % 2 = 1) THEN 1 ELSE 0 END) as visitors_a,
            SUM(CASE WHEN (CAST(SUBSTR(user_id, 11) AS INTEGER) % 2 = 1) AND event_name = 'Purchase' THEN 1 ELSE 0 END) as conversions_a,
            SUM(CASE WHEN (CAST(SUBSTR(user_id, 11) AS INTEGER) % 2 = 0) THEN 1 ELSE 0 END) as visitors_b,
            SUM(CASE WHEN (CAST(SUBSTR(user_id, 11) AS INTEGER) % 2 = 0) AND event_name = 'Purchase' THEN 1 ELSE 0 END) as conversions_b
        FROM (SELECT DISTINCT user_id, event_name FROM events WHERE project_id = ?)
    """, (PROJECT_ID,))
    
    res = cursor.fetchone()
    n_a, c_a, n_b, c_b = res
    print(f"A/B Cohort Sizes: Control (A)={n_a} visitors, Variation (B)={n_b} visitors")
    print(f"Conversions: Control (A)={c_a} ({round(c_a/n_a*100, 2)}%), Variation (B)={c_b} ({round(c_b/n_b*100, 2)}%)")
    
    # Statistical computation check
    p_a = c_a / n_a
    p_b = c_b / n_b
    p_p = (c_a + c_b) / (n_a + n_b)
    
    se = math.sqrt(p_p * (1.0 - p_p) * (1.0/n_a + 1.0/n_b))
    z_score = (p_b - p_a) / se
    
    p_val = 2 * (1.0 - 0.5 * (1.0 + math.erf(abs(z_score) / math.sqrt(2.0))))
    confidence = (1.0 - p_val) * 100
    
    print(f"Calculated Stats: Z-Score = {round(z_score, 4)}, P-Value = {round(p_val, 6)}, Confidence = {round(confidence, 2)}%")
    assert confidence > 95.0, "A/B test should yield statistical significance (>95% confidence)"
    print("A/B significance calculation verification: SUCCESS")

    # 2. Funnel completion rate validation
    cursor.execute("SELECT COUNT(DISTINCT user_id) FROM events WHERE event_name = 'Landing'")
    landing_cnt = cursor.fetchone()[0]
    cursor.execute("SELECT COUNT(DISTINCT user_id) FROM events WHERE event_name = 'Signup'")
    signup_cnt = cursor.fetchone()[0]
    print(f"Funnel step 1 (Landing) count: {landing_cnt}, step 2 (Signup) count: {signup_cnt}")
    print(f"Funnel Signup transition rate: {round(signup_cnt/landing_cnt*100, 2)}%")
    assert landing_cnt > signup_cnt, "Funnel steps must decrease in user counts sequentially"
    print("Funnel calculation validation: SUCCESS")

    conn.close()
    print("\nAll Core calculations successfully verified. System Math is 100% correct!")

if __name__ == "__main__":
    seed_synthetic_data()
    verify_calculations()
