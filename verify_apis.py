import urllib.request
import json

def test_endpoint(url, method="GET", data=None, headers=None):
    if headers is None:
        headers = {}
    
    req = urllib.request.Request(url, method=method, headers=headers)
    if data:
        req.data = json.dumps(data).encode("utf-8")
        req.add_header("Content-Type", "application/json")
        
    try:
        with urllib.request.urlopen(req) as response:
            status = response.status
            body = response.read().decode("utf-8")
            return status, json.loads(body)
    except urllib.error.HTTPError as e:
        return e.code, e.reason
    except Exception as e:
        return 0, str(e)

def run_tests():
    print("Executing Backend API Integration Tests...")
    base_url = "http://127.0.0.1:8000"
    
    # 1. Login
    login_url = f"{base_url}/api/v1/auth/login"
    status_login, res_login = test_endpoint(login_url, "POST", {"email": "demo@insightx.ai", "password": "demo123"})
    print(f"POST /api/v1/auth/login - Status: {status_login} - Success: {res_login.get('success')}")
    token = res_login.get("token")
    
    # 2. Get Dashboard Metrics
    dash_url = f"{base_url}/api/v1/analytics/dashboard"
    status_dash, res_dash = test_endpoint(dash_url)
    print(f"GET /api/v1/analytics/dashboard - Status: {status_dash} - Events Count: {res_dash.get('metrics', {}).get('total_events')}")
    
    # 3. Get Funnel Metrics
    fun_url = f"{base_url}/api/v1/analytics/funnels"
    status_fun, res_fun = test_endpoint(fun_url)
    print(f"GET /api/v1/analytics/funnels - Status: {status_fun} - Stages Count: {len(res_fun.get('stages', []))}")
    
    # 4. Get Retention Matrix
    ret_url = f"{base_url}/api/v1/analytics/retention"
    status_ret, res_ret = test_endpoint(ret_url)
    print(f"GET /api/v1/analytics/retention - Status: {status_ret} - Cohort Rows: {len(res_ret.get('cohorts', []))}")

    # 5. Churn Predictions
    churn_url = f"{base_url}/api/v1/ai/predict-churn"
    status_churn, res_churn = test_endpoint(churn_url, "POST")
    print(f"POST /api/v1/ai/predict-churn - Status: {status_churn} - Predictions Count: {len(res_churn.get('predictions', []))}")

    # 6. Revenue Forecast
    rev_url = f"{base_url}/api/v1/ai/forecast-revenue"
    status_rev, res_rev = test_endpoint(rev_url)
    print(f"GET /api/v1/ai/forecast-revenue - Status: {status_rev} - Slopes: {res_rev.get('slope')}")

    # 7. AI Query
    query_url = f"{base_url}/api/v1/ai/query"
    status_q, res_q = test_endpoint(query_url, "POST", {"query": "Why did conversion drop?"})
    print(f"POST /api/v1/ai/query - Status: {status_q} - Chatbot Response Length: {len(res_q.get('answer', ''))}")

    # 8. Reports CRUD (Module 16)
    headers = {"Authorization": f"Bearer {token}"} if token else {}
    rep_payload = {
        "name": "Acme Core Segmentations Report",
        "type": "Segmentation",
        "format": "CSV",
        "schedule": "Daily",
        "email_recipients": "analyst@acme.com",
        "project_id": "proj-default"
    }
    rep_create_url = f"{base_url}/api/v1/reports"
    status_rc, res_rc = test_endpoint(rep_create_url, "POST", rep_payload, headers)
    print(f"POST /api/v1/reports - Status: {status_rc} - Success: {res_rc.get('success')}")
    report_id = res_rc.get("report_id")

    if report_id:
        # Get
        status_rg, res_rg = test_endpoint(f"{base_url}/api/v1/reports?project_id=proj-default", "GET", None, headers)
        print(f"GET /api/v1/reports - Status: {status_rg} - Reports Count: {len(res_rg.get('reports', []))}")
        
        # Trigger
        status_rt, res_rt = test_endpoint(f"{base_url}/api/v1/reports/{report_id}/trigger", "POST", None, headers)
        print(f"POST /api/v1/reports/:id/trigger - Status: {status_rt} - Success: {res_rt.get('success')}")
        
        # Delete
        status_rd, res_rd = test_endpoint(f"{base_url}/api/v1/reports/{report_id}", "DELETE", None, headers)
        print(f"DELETE /api/v1/reports/:id - Status: {status_rd} - Success: {res_rd.get('success')}")

    # 9. Alert Channels Config (Module 17)
    chan_payload = {
        "name": "#general-alerts Slack webhook",
        "type": "Slack",
        "config": {"webhook_url": "https://hooks.slack.com/services/test/url"},
        "project_id": "proj-default"
    }
    chan_create_url = f"{base_url}/api/v1/alerts/channels"
    status_cc, res_cc = test_endpoint(chan_create_url, "POST", chan_payload, headers)
    print(f"POST /api/v1/alerts/channels - Status: {status_cc} - Success: {res_cc.get('success')}")
    channel_id = res_cc.get("channel_id")

    if channel_id:
        # Get
        status_cg, res_cg = test_endpoint(f"{base_url}/api/v1/alerts/channels?project_id=proj-default", "GET", None, headers)
        print(f"GET /api/v1/alerts/channels - Status: {status_cg} - Channels Count: {len(res_cg.get('channels', []))}")
        
        # Test trigger
        status_ct, res_ct = test_endpoint(f"{base_url}/api/v1/alerts/channels/{channel_id}/test", "POST", None, headers)
        print(f"POST /api/v1/alerts/channels/:id/test - Status: {status_ct} - Success: {res_ct.get('success')}")
        
        # Delete
        status_cd, res_cd = test_endpoint(f"{base_url}/api/v1/alerts/channels/{channel_id}", "DELETE", None, headers)
        print(f"DELETE /api/v1/alerts/channels/:id - Status: {status_cd} - Success: {res_cd.get('success')}")

    # 10. Admin Users Console & Permissions (Module 19)
    status_admin_users, res_admin_users = test_endpoint(f"{base_url}/api/v1/admin/users", "GET", None, headers)
    print(f"GET /api/v1/admin/users - Status: {status_admin_users} - Response: {res_admin_users}")
    if isinstance(res_admin_users, dict) and res_admin_users.get('users'):
        first_user = res_admin_users.get('users')[0]
        status_role, res_role = test_endpoint(f"{base_url}/api/v1/admin/users/{first_user['id']}/role", "PUT", {"role": "Administrator"}, headers)
        print(f"PUT /api/v1/admin/users/:id/role - Status: {status_role} - Response: {res_role}")

    # 11. Admin Projects (Module 19)
    status_admin_proj, res_admin_proj = test_endpoint(f"{base_url}/api/v1/admin/projects", "GET", None, headers)
    print(f"GET /api/v1/admin/projects - Status: {status_admin_proj} - Response: {res_admin_proj}")

    # 12. Admin System Audit Trail Logs (Module 19)
    status_admin_logs, res_admin_logs = test_endpoint(f"{base_url}/api/v1/admin/logs", "GET", None, headers)
    print(f"GET /api/v1/admin/logs - Status: {status_admin_logs} - Response: {res_admin_logs}")

    # 13. Billing Plan Quotas & Invoices (Module 20)
    status_org, res_org = test_endpoint(f"{base_url}/api/v1/organizations", "GET", None, headers)
    if isinstance(res_org, dict) and res_org.get('organizations'):
        first_org = res_org.get('organizations')[0]
        org_id = first_org['id']
        
        # Update billing plan
        status_bill, res_bill = test_endpoint(f"{base_url}/api/v1/organizations/{org_id}/billing", "PUT", {"billing_plan": "Pro"}, headers)
        print(f"PUT /api/v1/organizations/:id/billing - Status: {status_bill} - Response: {res_bill}")
        
        # Fetch invoices
        status_inv, res_inv = test_endpoint(f"{base_url}/api/v1/organizations/{org_id}/invoices", "GET", None, headers)
        print(f"GET /api/v1/organizations/:id/invoices - Status: {status_inv} - Response: {res_inv}")

if __name__ == "__main__":
    run_tests()
