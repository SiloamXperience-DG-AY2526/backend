#!/bin/bash
# Comprehensive test script for donor partner endpoints
# Tests all CRUD operations, pagination, filtering, and error cases
# Usage: ./comprehensive-donor-tests.sh <JWT_TOKEN>

if [ -z "$1" ]; then
  echo "❌ Error: JWT token required"
  echo ""
  echo "Usage: ./comprehensive-donor-tests.sh <JWT_TOKEN>"
  echo ""
  echo "Get token by logging in:"
  echo 'curl -X POST "http://localhost:3000/api/v1/auth/login" \'
  echo '  -H "Content-Type: application/json" \'
  echo '  -d '"'"'{"email":"partner@example.com","password":"password123"}'"'"''
  exit 1
fi

BASE="http://localhost:3000/api/v1"
TOKEN="$1"

# Colors for output
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo "================================================================"
echo "🧪 COMPREHENSIVE DONOR PARTNER ENDPOINT TESTS"
echo "================================================================"
echo ""

# ============================================================================
# TEST 1: GET /donations/home - Homepage Statistics
# ============================================================================
echo -e "${BLUE}TEST 1: Get Homepage Statistics${NC}"
echo "Purpose: Retrieve dashboard stats (total projects, donations, amounts)"
echo "Expected: JSON with totalProjects, totalDonations, totalAmount"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donations/home" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 2: GET /donation-projects - Browse All Projects (Default)
# ============================================================================
echo -e "${BLUE}TEST 2: Browse All Donation Projects (No Filter)${NC}"
echo "Purpose: Get all approved projects available for donations"
echo "Expected: Array of projects with pagination metadata"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 3: GET /donation-projects?type=brick - Filter Brick Projects
# ============================================================================
echo -e "${BLUE}TEST 3: Browse Brick Projects${NC}"
echo "Purpose: Filter projects by type=brick"
echo "Expected: Projects where type is 'brick'"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects?type=brick&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 4: GET /donation-projects?type=sponsor - Filter Sponsor Projects
# ============================================================================
echo -e "${BLUE}TEST 4: Browse Sponsor Projects${NC}"
echo "Purpose: Filter projects by type=sponsor"
echo "Expected: Projects where type is 'sponsor'"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects?type=sponsor&page=1&limit=5" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 5: GET /donation-projects - Test Pagination
# ============================================================================
echo -e "${BLUE}TEST 5: Test Pagination (Page 1, Limit 2)${NC}"
echo "Purpose: Verify pagination works correctly"
echo "Expected: Max 2 projects, pagination metadata showing page 1"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects?page=1&limit=2" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 6: GET /donation-projects/:id - Get Single Project Details
# ============================================================================
echo -e "${BLUE}TEST 6: Get Single Project Details${NC}"
echo "Purpose: Retrieve detailed info for a specific project"
echo "Note: Replace PROJECT_ID with an actual UUID from previous responses"
echo "Expected: Full project details with manager info and totalRaised"
echo "Status: Should return 200 OK if valid UUID, 404 if not found"
echo "---"
echo -e "${YELLOW}⚠️  Manual Test Required: Replace PROJECT_ID with actual value${NC}"
echo 'curl -X GET "$BASE/donation-projects/PROJECT_ID" -H "Authorization: Bearer $TOKEN"'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 7: GET /donations/me - My Donation History (All)
# ============================================================================
echo -e "${BLUE}TEST 7: Get My Donation History (All Statuses)${NC}"
echo "Purpose: Retrieve all donations made by logged-in partner"
echo "Expected: Array of donation transactions with project details"
echo "Status: Should return 200 OK (empty array if no donations)"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donations/me?status=all&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 8: GET /donations/me?status=pending - Filter Pending Donations
# ============================================================================
echo -e "${BLUE}TEST 8: Get My Pending Donations${NC}"
echo "Purpose: Filter donations where receipt is pending"
echo "Expected: Donations with receiptStatus = 'pending'"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donations/me?status=pending&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 9: GET /donations/me?status=received - Filter Completed Donations
# ============================================================================
echo -e "${BLUE}TEST 9: Get My Completed Donations${NC}"
echo "Purpose: Filter donations where receipt is received"
echo "Expected: Donations with receiptStatus = 'received'"
echo "Status: Should return 200 OK"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donations/me?status=received&page=1&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 10: GET /donation-projects/me - My Proposed Projects
# ============================================================================
echo -e "${BLUE}TEST 10: Get My Proposed Partner-Led Projects${NC}"
echo "Purpose: Retrieve all projects proposed by logged-in partner"
echo "Expected: Array of projects where managedBy = current user ID"
echo "Status: Should return 200 OK (empty array if no proposed projects)"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects/me" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 11: POST /donation-projects - Create Partner-Led Project
# ============================================================================
echo -e "${BLUE}TEST 11: Create New Partner-Led Project${NC}"
echo "Purpose: Submit a new partner-led donation project proposal"
echo "Expected: Created project with status 'draft' or 'submitted'"
echo "Status: Should return 201 Created"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X POST "$BASE/donation-projects" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Project: Community Center",
    "location": "Jakarta, Indonesia",
    "about": "Build a community center for underprivileged youth",
    "objectives": "Provide safe space for education and activities",
    "beneficiaries": "300 children and teenagers",
    "targetFund": 25000,
    "deadline": "2026-12-31T00:00:00.000Z",
    "startDate": "2026-01-20T00:00:00.000Z",
    "endDate": "2026-12-31T00:00:00.000Z",
    "type": "partnerLed"
  }' | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 12: GET /donation-projects/me/:id - Get My Specific Project
# ============================================================================
echo -e "${BLUE}TEST 12: Get My Specific Proposed Project${NC}"
echo "Purpose: Retrieve details of a specific project I proposed"
echo "Note: Replace PROJECT_ID with UUID from TEST 11 response"
echo "Expected: Full project details (only accessible if I'm the manager)"
echo "Status: Should return 200 OK if owner, 403 if not owner"
echo "---"
echo -e "${YELLOW}⚠️  Manual Test Required: Replace PROJECT_ID with actual value from TEST 11${NC}"
echo 'curl -X GET "$BASE/donation-projects/me/PROJECT_ID" -H "Authorization: Bearer $TOKEN"'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 13: PATCH /donation-projects/:id - Update My Project
# ============================================================================
echo -e "${BLUE}TEST 13: Update My Proposed Project${NC}"
echo "Purpose: Modify a project I created (before approval)"
echo "Note: Replace PROJECT_ID with UUID from TEST 11 response"
echo "Expected: Updated project details"
echo "Status: Should return 200 OK if owner, 403 if not owner, 404 if not found"
echo "---"
echo -e "${YELLOW}⚠️  Manual Test Required: Replace PROJECT_ID with actual value from TEST 11${NC}"
echo 'curl -X PATCH "$BASE/donation-projects/PROJECT_ID" \'
echo '  -H "Authorization: Bearer $TOKEN" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"title": "Updated: Community Center Expansion", "targetFund": 30000}'"'"''
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 14: POST /donation-projects/:id/withdraw - Withdraw Project
# ============================================================================
echo -e "${BLUE}TEST 14: Withdraw My Proposed Project${NC}"
echo "Purpose: Withdraw a project proposal (mark as withdrawn)"
echo "Note: Replace PROJECT_ID with UUID from TEST 11 response"
echo "Expected: Project with submissionStatus = 'withdrawn'"
echo "Status: Should return 200 OK if owner and not approved, 400 if already approved"
echo "---"
echo -e "${YELLOW}⚠️  Manual Test Required: Replace PROJECT_ID with actual value from TEST 11${NC}"
echo 'curl -X POST "$BASE/donation-projects/me/PROJECT_ID/withdraw" \'
echo '  -H "Authorization: Bearer $TOKEN" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{"reason": "Need to revise project scope"}'"'"''
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 15: POST /donations - Make a Donation
# ============================================================================
echo -e "${BLUE}TEST 15: Make a New Donation${NC}"
echo "Purpose: Submit a donation to an approved project"
echo "Note: Replace PROJECT_ID with an approved project UUID"
echo "Expected: Created donation transaction"
echo "Status: Should return 201 Created"
echo "---"
echo -e "${YELLOW}⚠️  Manual Test Required: Replace PROJECT_ID with actual approved project UUID${NC}"
echo 'curl -X POST "$BASE/donations" \'
echo '  -H "Authorization: Bearer $TOKEN" \'
echo '  -H "Content-Type: application/json" \'
echo '  -d '"'"'{
    "projectId": "PROJECT_ID",
    "type": "individual",
    "amount": 250,
    "countryOfResidence": "Singapore",
    "paymentMode": "credit_card"
  }'"'"''
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 16: Error Case - Invalid Project Type Filter
# ============================================================================
echo -e "${BLUE}TEST 16: Error Case - Invalid Project Type${NC}"
echo "Purpose: Test validation for invalid query parameters"
echo "Expected: 400 Bad Request with validation error"
echo "Status: Should return 400"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects?type=invalid_type" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 17: Error Case - Invalid Pagination Parameters
# ============================================================================
echo -e "${BLUE}TEST 17: Error Case - Invalid Pagination${NC}"
echo "Purpose: Test validation for invalid pagination parameters"
echo "Expected: 400 Bad Request with validation error for page=0"
echo "Status: Should return 400"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects?page=0&limit=10" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 18: Error Case - Access Without Authentication
# ============================================================================
echo -e "${BLUE}TEST 18: Error Case - Unauthenticated Request${NC}"
echo "Purpose: Test that endpoints are protected"
echo "Expected: 401 Unauthorized"
echo "Status: Should return 401"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 19: Error Case - Invalid Project ID Format
# ============================================================================
echo -e "${BLUE}TEST 19: Error Case - Invalid UUID Format${NC}"
echo "Purpose: Test validation for malformed UUIDs"
echo "Expected: 400 Bad Request with validation error"
echo "Status: Should return 400"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects/not-a-valid-uuid" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

# ============================================================================
# TEST 20: Error Case - Non-existent Project ID
# ============================================================================
echo -e "${BLUE}TEST 20: Error Case - Non-existent Project${NC}"
echo "Purpose: Test handling of valid UUID but non-existent resource"
echo "Expected: 404 Not Found"
echo "Status: Should return 404"
echo "---"
curl -s -w "\nHTTP Status: %{http_code}\n" -X GET "$BASE/donation-projects/123e4567-e89b-12d3-a456-426614174000" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
echo ""
echo "================================================================"
echo ""

echo ""
echo -e "${GREEN}✅ Test Suite Complete!${NC}"
echo ""
echo "================================================================"
echo "📊 SUMMARY OF EXPECTED BEHAVIORS"
echo "================================================================"
echo ""
echo "✅ SUCCESSFUL CASES (200/201):"
echo "   - GET /donations/home → Dashboard statistics"
echo "   - GET /donation-projects → All approved projects"
echo "   - GET /donation-projects?type=brick → Filter brick projects"
echo "   - GET /donation-projects?type=sponsor → Filter sponsor projects"
echo "   - GET /donation-projects/:id → Single project details"
echo "   - GET /donations/me?status=all → My donation history (all statuses)"
echo "   - GET /donations/me?status=pending → My pending donations"
echo "   - GET /donations/me?status=received → My received donations"
echo "   - GET /donation-projects/me → My proposed projects"
echo "   - POST /donation-projects → Create partner-led project"
echo "   - PATCH /donation-projects/:id → Update my project"
echo "   - POST /donation-projects/:id/withdraw → Withdraw my project"
echo "   - POST /donations → Make a donation"
echo ""
echo "❌ ERROR CASES (400/401/403/404):"
echo "   - 400: Invalid type (not brick/sponsor/partnerLed), invalid pagination (page<1 or limit>100)"
echo "   - 401: Missing or invalid JWT token"
echo "   - 403: Accessing project not owned by user"
echo "   - 404: Valid UUID but resource doesn't exist"
echo ""
echo "================================================================"
echo "📝 NOTES FOR MANUAL TESTS"
echo "================================================================"
echo ""
echo "Tests 6, 12, 13, 14, 15 require manual UUID replacement:"
echo ""
echo "1. Run TEST 11 to create a project and copy its 'id' from response"
echo "2. Use that ID for tests 12, 13, 14"
echo "3. Copy an approved project ID from TEST 2 for tests 6 and 15"
echo ""
echo "Example workflow:"
echo '  PROJECT_ID="abc123..."  # From TEST 11 response'
echo '  curl -X GET "$BASE/donation-projects/$PROJECT_ID" -H "Authorization: Bearer $TOKEN"'
echo ""
echo "================================================================"
