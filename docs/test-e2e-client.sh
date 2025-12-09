#!/bin/bash
# EUFORIA EVENTS - E2E Test para Frontend Client (v1.3)
# Tests: Guest Identification → Song Request → My Requests

set -e

API_URL="http://localhost:3000/api"
EVENT_ID="cmiy78sge0005jqvd8duq13yf"
EVENT_SLUG="evento-demo-2501"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  EUFORIA EVENTS - E2E Test Client v1.3${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================
# 1. GET EVENT BY SLUG (Public)
# ============================================
echo -e "${YELLOW}[1/6] Getting event by slug...${NC}"
EVENT_RESPONSE=$(curl -s "$API_URL/events/slug/$EVENT_SLUG")
echo "Response: $EVENT_RESPONSE"

if echo "$EVENT_RESPONSE" | grep -q "error"; then
  echo -e "❌ Error getting event"
  exit 1
fi
echo -e "${GREEN}✅ Event found: $EVENT_SLUG${NC}"
echo ""

# ============================================
# 2. GET MUSICADJ CONFIG (Public)
# ============================================
echo -e "${YELLOW}[2/6] Getting MUSICADJ config...${NC}"
CONFIG_RESPONSE=$(curl -s "$API_URL/events/$EVENT_ID/musicadj/config")
echo "Response: $CONFIG_RESPONSE"

if echo "$CONFIG_RESPONSE" | grep -q '"enabled":true'; then
  echo -e "${GREEN}✅ MUSICADJ enabled for this event${NC}"
else
  echo -e "❌ MUSICADJ not enabled"
  exit 1
fi
echo ""

# ============================================
# 3. IDENTIFY GUEST (Public)
# ============================================
echo -e "${YELLOW}[3/6] Identifying guest...${NC}"
GUEST_EMAIL="test-e2e-$(date +%s)@example.com"
GUEST_NAME="E2E Test User"
GUEST_WHATSAPP="+54 9 2901 123456"

GUEST_RESPONSE=$(curl -s -X POST "$API_URL/guests/identify" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$GUEST_EMAIL\",
    \"displayName\": \"$GUEST_NAME\",
    \"whatsapp\": \"$GUEST_WHATSAPP\"
  }")

echo "Response: $GUEST_RESPONSE"

if echo "$GUEST_RESPONSE" | grep -q "error"; then
  echo -e "❌ Error identifying guest"
  exit 1
fi

GUEST_ID=$(echo "$GUEST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Guest identified: $GUEST_ID${NC}"
echo ""

# ============================================
# 4. CREATE SONG REQUEST (Public)
# ============================================
echo -e "${YELLOW}[4/6] Creating song request...${NC}"
REQUEST_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/musicadj/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"title\": \"Bohemian Rhapsody\",
    \"artist\": \"Queen\"
  }")

echo "Response: $REQUEST_RESPONSE"

if echo "$REQUEST_RESPONSE" | grep -q "error"; then
  echo -e "❌ Error creating request"
  echo "Response: $REQUEST_RESPONSE"
  exit 1
fi

REQUEST_ID=$(echo "$REQUEST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Song request created: $REQUEST_ID${NC}"
echo ""

# ============================================
# 5. GET GUEST REQUESTS (Public)
# ============================================
echo -e "${YELLOW}[5/6] Getting guest requests...${NC}"
MY_REQUESTS_RESPONSE=$(curl -s "$API_URL/guests/$GUEST_ID/requests?eventId=$EVENT_ID")
echo "Response: $MY_REQUESTS_RESPONSE"

if echo "$MY_REQUESTS_RESPONSE" | grep -q "$REQUEST_ID"; then
  echo -e "${GREEN}✅ Guest requests retrieved successfully${NC}"
else
  echo -e "❌ Request not found in guest requests"
  exit 1
fi
echo ""

# ============================================
# 6. TEST COOLDOWN (Public)
# ============================================
echo -e "${YELLOW}[6/6] Testing cooldown (should fail)...${NC}"
COOLDOWN_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/musicadj/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"title\": \"Another One\",
    \"artist\": \"Queen\"
  }")

echo "Response: $COOLDOWN_RESPONSE"

if echo "$COOLDOWN_RESPONSE" | grep -q "cooldown\|Debes esperar"; then
  echo -e "${GREEN}✅ Cooldown validation working${NC}"
else
  echo -e "${YELLOW}⚠️  Cooldown might not be working (or cooldown=0)${NC}"
fi
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ E2E TEST COMPLETED SUCCESSFULLY${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary:"
echo "  - Event: $EVENT_SLUG"
echo "  - Guest ID: $GUEST_ID"
echo "  - Guest Email: $GUEST_EMAIL"
echo "  - Song Request ID: $REQUEST_ID"
echo ""
echo "Manual Testing URLs:"
echo "  - Event Landing: http://localhost:5173/e/$EVENT_SLUG"
echo "  - MUSICADJ Request: http://localhost:5173/e/$EVENT_SLUG/musicadj"
echo "  - My Requests: http://localhost:5173/e/$EVENT_SLUG/musicadj/mis-pedidos"
echo ""
echo "Guest credentials for manual testing:"
echo "  Email: $GUEST_EMAIL"
echo "  Name: $GUEST_NAME"
echo ""
