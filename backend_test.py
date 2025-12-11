import requests
import sys
import json
from datetime import datetime

class SafeHavenAPITester:
    def __init__(self, base_url="https://safehaven-sos.preview.emergentagent.com/api"):
        self.base_url = base_url
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
        
        result = {
            "test": name,
            "success": success,
            "details": details,
            "timestamp": datetime.now().isoformat()
        }
        self.test_results.append(result)
        
        status = "✅ PASSED" if success else "❌ FAILED"
        print(f"{status} - {name}")
        if details:
            print(f"   Details: {details}")

    def run_test(self, name, method, endpoint, expected_status, data=None, headers=None):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        test_headers = {'Content-Type': 'application/json'}
        
        if self.token:
            test_headers['Authorization'] = f'Bearer {self.token}'
        
        if headers:
            test_headers.update(headers)

        try:
            if method == 'GET':
                response = requests.get(url, headers=test_headers, timeout=10)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=test_headers, timeout=10)
            elif method == 'DELETE':
                response = requests.delete(url, headers=test_headers, timeout=10)

            success = response.status_code == expected_status
            details = f"Status: {response.status_code}"
            
            if not success:
                details += f" (expected {expected_status})"
                try:
                    error_detail = response.json().get('detail', 'No error detail')
                    details += f", Error: {error_detail}"
                except:
                    details += f", Response: {response.text[:100]}"
            
            self.log_test(name, success, details)
            
            if success:
                try:
                    return True, response.json()
                except:
                    return True, {}
            else:
                return False, {}

        except Exception as e:
            self.log_test(name, False, f"Exception: {str(e)}")
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = datetime.now().strftime('%H%M%S')
        user_data = {
            "email": f"test_user_{timestamp}@safehaven.test",
            "password": "TestPassword123!",
            "name": "Maria Test",
            "phone": "(11) 99999-9999"
        }
        
        success, response = self.run_test(
            "User Registration",
            "POST",
            "auth/register",
            200,
            data=user_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            self.user_id = response['user']['id']
            return True, user_data
        return False, user_data

    def test_user_login(self, user_data):
        """Test user login"""
        login_data = {
            "email": user_data["email"],
            "password": user_data["password"]
        }
        
        success, response = self.run_test(
            "User Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'access_token' in response:
            self.token = response['access_token']
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_add_trusted_contact(self):
        """Test adding trusted contact"""
        contact_data = {
            "name": "Ana Trusted",
            "email": "ana.trusted@example.com",
            "phone": "(11) 88888-8888"
        }
        
        success, response = self.run_test(
            "Add Trusted Contact",
            "POST",
            "contacts",
            200,
            data=contact_data
        )
        
        if success and 'id' in response:
            return True, response['id']
        return False, None

    def test_list_contacts(self):
        """Test listing trusted contacts"""
        success, response = self.run_test(
            "List Trusted Contacts",
            "GET",
            "contacts",
            200
        )
        
        if success and isinstance(response, list):
            return True, len(response)
        return False, 0

    def test_send_emergency_alert(self):
        """Test sending emergency alert"""
        alert_data = {
            "location": "Test Location - Emergency Drill"
        }
        
        success, response = self.run_test(
            "Send Emergency Alert",
            "POST",
            "alerts/send",
            200,
            data=alert_data
        )
        
        if success and 'id' in response:
            return True, response['id']
        return False, None

    def test_get_alerts_history(self):
        """Test getting alerts history"""
        success, response = self.run_test(
            "Get Alerts History",
            "GET",
            "alerts",
            200
        )
        
        if success and isinstance(response, list):
            return True, len(response)
        return False, 0

    def test_delete_contact(self, contact_id):
        """Test deleting trusted contact"""
        success, response = self.run_test(
            "Delete Trusted Contact",
            "DELETE",
            f"contacts/{contact_id}",
            200
        )
        return success

    def test_clear_user_data(self):
        """Test clearing all user data"""
        success, response = self.run_test(
            "Clear User Data",
            "DELETE",
            "user/clear",
            200
        )
        return success

    def test_invalid_login(self):
        """Test login with invalid credentials"""
        invalid_data = {
            "email": "nonexistent@test.com",
            "password": "wrongpassword"
        }
        
        success, response = self.run_test(
            "Invalid Login (Should Fail)",
            "POST",
            "auth/login",
            401,
            data=invalid_data
        )
        return success

    def test_unauthorized_access(self):
        """Test accessing protected endpoint without token"""
        # Temporarily remove token
        original_token = self.token
        self.token = None
        
        success, response = self.run_test(
            "Unauthorized Access (Should Fail)",
            "GET",
            "auth/me",
            401
        )
        
        # Restore token
        self.token = original_token
        return success

    def run_all_tests(self):
        """Run complete test suite"""
        print("🚀 Starting SafeHaven API Tests...")
        print(f"Testing against: {self.base_url}")
        print("=" * 60)

        # Test user registration and authentication
        reg_success, user_data = self.test_user_registration()
        if not reg_success:
            print("❌ Registration failed, stopping tests")
            return False

        # Test login
        if not self.test_user_login(user_data):
            print("❌ Login failed, stopping tests")
            return False

        # Test profile access
        self.test_get_user_profile()

        # Test contact management
        contact_success, contact_id = self.test_add_trusted_contact()
        if contact_success:
            self.test_list_contacts()
            
            # Test emergency alert (requires contacts)
            alert_success, alert_id = self.test_send_emergency_alert()
            if alert_success:
                self.test_get_alerts_history()
            
            # Test contact deletion
            self.test_delete_contact(contact_id)

        # Test security
        self.test_invalid_login()
        self.test_unauthorized_access()

        # Test data clearing (this will delete the user)
        self.test_clear_user_data()

        # Print summary
        print("\n" + "=" * 60)
        print(f"📊 Test Summary: {self.tests_passed}/{self.tests_run} tests passed")
        
        if self.tests_passed == self.tests_run:
            print("🎉 All tests passed!")
            return True
        else:
            print(f"⚠️  {self.tests_run - self.tests_passed} tests failed")
            return False

def main():
    tester = SafeHavenAPITester()
    success = tester.run_all_tests()
    
    # Save detailed results
    with open('/app/test_reports/backend_api_results.json', 'w') as f:
        json.dump({
            'summary': {
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': f"{(tester.tests_passed/tester.tests_run*100):.1f}%" if tester.tests_run > 0 else "0%",
                'timestamp': datetime.now().isoformat()
            },
            'detailed_results': tester.test_results
        }, f, indent=2)
    
    return 0 if success else 1

if __name__ == "__main__":
    sys.exit(main())