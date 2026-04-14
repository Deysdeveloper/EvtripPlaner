import requests
import sys
import json
from datetime import datetime

class EVTripPlannerAPITester:
    def __init__(self, base_url="http://localhost:8001"):
        self.base_url = base_url
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def run_test(self, name, method, endpoint, expected_status, data=None, timeout=30):
        """Run a single API test"""
        url = f"{self.base_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}

        self.tests_run += 1
        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if method == 'GET':
                response = requests.get(url, headers=headers, timeout=timeout)
            elif method == 'POST':
                response = requests.post(url, json=data, headers=headers, timeout=timeout)

            success = response.status_code == expected_status
            
            if success:
                self.tests_passed += 1
                print(f"✅ Passed - Status: {response.status_code}")
                try:
                    response_data = response.json()
                    print(f"   Response keys: {list(response_data.keys()) if isinstance(response_data, dict) else 'Non-dict response'}")
                except:
                    print("   Response: Non-JSON or empty")
            else:
                print(f"❌ Failed - Expected {expected_status}, got {response.status_code}")
                try:
                    error_data = response.json()
                    print(f"   Error: {error_data}")
                except:
                    print(f"   Raw response: {response.text[:200]}")

            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": response.status_code,
                "success": success,
                "response_data": response.json() if success else None
            })

            return success, response.json() if success else {}

        except Exception as e:
            print(f"❌ Failed - Error: {str(e)}")
            self.test_results.append({
                "name": name,
                "method": method,
                "endpoint": endpoint,
                "expected_status": expected_status,
                "actual_status": "ERROR",
                "success": False,
                "error": str(e)
            })
            return False, {}

    def test_health_check(self):
        """Test health check endpoint"""
        success, response = self.run_test(
            "Health Check",
            "GET",
            "api/health",
            200
        )
        return success

    def test_valid_trip_calculation(self):
        """Test trip calculation with valid cities"""
        trip_data = {
            "start": "New Delhi",
            "end": "Mumbai", 
            "batteryCapacity": 60,
            "efficiency": 0.15,
            "initialCharge": 80
        }
        
        success, response = self.run_test(
            "Valid Trip Calculation (New Delhi to Mumbai)",
            "POST",
            "api/calculate-trip",
            200,
            data=trip_data,
            timeout=45
        )
        
        if success:
            # Verify required fields in response
            required_fields = [
                'distance', 'eta', 'temperature', 'energyRequired', 
                'finalCharge', 'isTripPossible', 'routeGeometry', 
                'startCoords', 'endCoords'
            ]
            missing_fields = [field for field in required_fields if field not in response]
            if missing_fields:
                print(f"⚠️  Missing required fields: {missing_fields}")
                return False
            else:
                print(f"✅ All required fields present")
                print(f"   Distance: {response.get('distance')} km")
                print(f"   ETA: {response.get('eta')}")
                print(f"   Final Charge: {response.get('finalCharge')}%")
                print(f"   Trip Possible: {response.get('isTripPossible')}")
        
        return success

    def test_invalid_location(self):
        """Test trip calculation with invalid location"""
        trip_data = {
            "start": "InvalidCityXYZ123",
            "end": "AnotherInvalidCity456",
            "batteryCapacity": 60,
            "efficiency": 0.15,
            "initialCharge": 80
        }
        
        success, response = self.run_test(
            "Invalid Location Test",
            "POST",
            "api/calculate-trip",
            400,
            data=trip_data,
            timeout=30
        )
        return success

    def test_short_distance_trip(self):
        """Test trip calculation with short distance"""
        trip_data = {
            "start": "Delhi",
            "end": "Gurgaon",
            "batteryCapacity": 60,
            "efficiency": 0.15,
            "initialCharge": 80
        }
        
        success, response = self.run_test(
            "Short Distance Trip (Delhi to Gurgaon)",
            "POST",
            "api/calculate-trip",
            200,
            data=trip_data,
            timeout=30
        )
        return success

    def test_low_battery_scenario(self):
        """Test trip calculation with low initial battery"""
        trip_data = {
            "start": "New Delhi",
            "end": "Mumbai",
            "batteryCapacity": 40,  # Smaller battery
            "efficiency": 0.20,     # Less efficient
            "initialCharge": 30     # Low initial charge
        }
        
        success, response = self.run_test(
            "Low Battery Scenario",
            "POST",
            "api/calculate-trip",
            200,
            data=trip_data,
            timeout=45
        )
        
        if success and response:
            print(f"   Trip Possible: {response.get('isTripPossible')}")
            print(f"   Final Charge: {response.get('finalCharge')}%")
            if response.get('chargingStops'):
                print(f"   Charging Stops Suggested: {len(response.get('chargingStops'))}")
        
        return success

def main():
    print("🚗 Starting EV Trip Planner API Tests")
    print("=" * 50)
    
    # Setup
    tester = EVTripPlannerAPITester()
    
    # Run tests
    print("\n📋 Running Backend API Tests...")
    
    # Test 1: Health Check
    health_ok = tester.test_health_check()
    
    # Test 2: Valid trip calculation
    valid_trip_ok = tester.test_valid_trip_calculation()
    
    # Test 3: Invalid location handling
    invalid_location_ok = tester.test_invalid_location()
    
    # Test 4: Short distance trip
    short_trip_ok = tester.test_short_distance_trip()
    
    # Test 5: Low battery scenario
    low_battery_ok = tester.test_low_battery_scenario()
    
    # Print results
    print(f"\n📊 Test Results Summary")
    print("=" * 50)
    print(f"Tests passed: {tester.tests_passed}/{tester.tests_run}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run)*100:.1f}%")
    
    # Detailed results
    print(f"\n📝 Detailed Results:")
    for result in tester.test_results:
        status = "✅ PASS" if result['success'] else "❌ FAIL"
        print(f"   {status} - {result['name']}")
        if not result['success'] and 'error' in result:
            print(f"      Error: {result['error']}")
    
    # Save results to file
    try:
        with open('test_reports/backend_api_results.json', 'w') as f:
            json.dump({
                'timestamp': datetime.now().isoformat(),
                'total_tests': tester.tests_run,
                'passed_tests': tester.tests_passed,
                'success_rate': (tester.tests_passed/tester.tests_run)*100,
                'test_details': tester.test_results
            }, f, indent=2)
        print(f"\n💾 Results saved to test_reports/backend_api_results.json")
    except Exception as e:
        print(f"\n⚠️ Could not save results to file: {e}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())