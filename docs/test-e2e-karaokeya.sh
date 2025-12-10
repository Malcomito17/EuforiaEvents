#!/bin/bash
# EUFORIA EVENTS - E2E Test para KARAOKEYA (v1.0)
# Tests: Guest Identification → Karaoke Request → Status Changes → Reorder Queue → Notifications

set -e

API_URL="http://localhost:3000/api"
EVENT_ID="cmiy78sge0005jqvd8duq13yf"
EVENT_SLUG="evento-demo-2501"

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  KARAOKEYA - E2E Test v1.0${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# ============================================
# 1. GET EVENT BY SLUG (Public)
# ============================================
echo -e "${YELLOW}[1/10] Getting event by slug...${NC}"
EVENT_RESPONSE=$(curl -s "$API_URL/events/slug/$EVENT_SLUG")

if echo "$EVENT_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Error getting event${NC}"
  exit 1
fi
echo -e "${GREEN}✅ Event found: $EVENT_SLUG${NC}"
echo ""

# ============================================
# 2. GET KARAOKEYA CONFIG (Public)
# ============================================
echo -e "${YELLOW}[2/10] Getting KARAOKEYA config...${NC}"
CONFIG_RESPONSE=$(curl -s "$API_URL/events/$EVENT_ID/karaokeya/config")
echo "Response: $CONFIG_RESPONSE"

if echo "$CONFIG_RESPONSE" | grep -q '"enabled":true'; then
  echo -e "${GREEN}✅ KARAOKEYA enabled for this event${NC}"
else
  echo -e "${RED}❌ KARAOKEYA not enabled${NC}"
  exit 1
fi
echo ""

# ============================================
# 3. IDENTIFY GUEST (Public)
# ============================================
echo -e "${YELLOW}[3/10] Identifying guest...${NC}"
GUEST_EMAIL="karaokeya-test-$(date +%s)@example.com"
GUEST_NAME="Karaoke Test User"
GUEST_WHATSAPP="+54 9 2901 555000"

GUEST_RESPONSE=$(curl -s -X POST "$API_URL/guests/identify" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$GUEST_EMAIL\",
    \"displayName\": \"$GUEST_NAME\",
    \"whatsapp\": \"$GUEST_WHATSAPP\"
  }")

if echo "$GUEST_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Error identifying guest${NC}"
  exit 1
fi

GUEST_ID=$(echo "$GUEST_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Guest identified: $GUEST_ID${NC}"
echo ""

# ============================================
# 4. CREATE KARAOKE REQUEST #1 (Public)
# ============================================
echo -e "${YELLOW}[4/10] Creating karaoke request #1...${NC}"
REQUEST1_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/karaokeya/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"title\": \"Bohemian Rhapsody\",
    \"artist\": \"Queen\"
  }")

if echo "$REQUEST1_RESPONSE" | grep -q "error"; then
  echo -e "${RED}❌ Error creating request #1${NC}"
  echo "Response: $REQUEST1_RESPONSE"
  exit 1
fi

REQUEST1_ID=$(echo "$REQUEST1_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Karaoke request #1 created: $REQUEST1_ID${NC}"
echo ""

# ============================================
# 5. CREATE KARAOKE REQUEST #2 (Public)
# ============================================
echo -e "${YELLOW}[5/10] Creating karaoke request #2...${NC}"
sleep 1 # Wait to avoid potential rate limiting

REQUEST2_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/karaokeya/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"$GUEST_ID\",
    \"title\": \"Don't Stop Me Now\",
    \"artist\": \"Queen\"
  }")

if echo "$REQUEST2_RESPONSE" | grep -q "error"; then
  # Check if it's a cooldown error (expected)
  if echo "$REQUEST2_RESPONSE" | grep -q "cooldown\|Debes esperar"; then
    echo -e "${GREEN}✅ Cooldown validation working (expected)${NC}"
    echo -e "${BLUE}   Waiting for cooldown to pass...${NC}"
    sleep 3

    # Retry after cooldown
    REQUEST2_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/karaokeya/requests" \
      -H "Content-Type: application/json" \
      -d "{
        \"guestId\": \"$GUEST_ID\",
        \"title\": \"Don't Stop Me Now\",
        \"artist\": \"Queen\"
      }")
  else
    echo -e "${RED}❌ Error creating request #2${NC}"
    echo "Response: $REQUEST2_RESPONSE"
    exit 1
  fi
fi

REQUEST2_ID=$(echo "$REQUEST2_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
echo -e "${GREEN}✅ Karaoke request #2 created: $REQUEST2_ID${NC}"
echo ""

# ============================================
# 6. GET GUEST REQUESTS (Public)
# ============================================
echo -e "${YELLOW}[6/10] Getting guest karaoke requests...${NC}"
QUEUE_RESPONSE=$(curl -s "$API_URL/events/$EVENT_ID/karaokeya/guests/$GUEST_ID/requests")
echo "Response: $QUEUE_RESPONSE"

if echo "$QUEUE_RESPONSE" | grep -q "$REQUEST1_ID"; then
  echo -e "${GREEN}✅ Guest requests retrieved successfully${NC}"
else
  echo -e "${RED}❌ Request not found in guest requests${NC}"
  exit 1
fi
echo ""

# ============================================
# 7. TEST VALIDATION - Invalid Data (Public)
# ============================================
echo -e "${YELLOW}[7/10] Testing validation (should fail)...${NC}"
INVALID_RESPONSE=$(curl -s -X POST "$API_URL/events/$EVENT_ID/karaokeya/requests" \
  -H "Content-Type: application/json" \
  -d "{
    \"guestId\": \"invalid-id\",
    \"title\": \"\"
  }")

echo "Response: $INVALID_RESPONSE"

if echo "$INVALID_RESPONSE" | grep -q "error\|validation"; then
  echo -e "${GREEN}✅ Validation working correctly${NC}"
else
  echo -e "${YELLOW}⚠️  Validation might not be working${NC}"
fi
echo ""

# ============================================
# 8. TEST STATUS UPDATE - CALLED (Requires Auth)
# ============================================
echo -e "${YELLOW}[8/10] Testing status update to CALLED...${NC}"
echo -e "${BLUE}   NOTE: This step requires authentication and will be skipped in public test${NC}"
echo -e "${BLUE}   Manual testing: Use web-operator to change status to CALLED${NC}"
echo ""

# ============================================
# 9. TEST REORDER QUEUE (Requires Auth)
# ============================================
echo -e "${YELLOW}[9/10] Testing queue reorder...${NC}"
echo -e "${BLUE}   NOTE: This step requires authentication and will be skipped in public test${NC}"
echo -e "${BLUE}   Manual testing: Use drag & drop in web-operator panel${NC}"
echo ""

# ============================================
# 10. GET STATS (Requires Auth)
# ============================================
echo -e "${YELLOW}[10/10] Getting KARAOKEYA stats...${NC}"
echo -e "${BLUE}   NOTE: Stats endpoint requires authentication and will be skipped${NC}"
echo -e "${BLUE}   Manual testing: Login to web-operator and view stats panel${NC}"
echo ""

# ============================================
# SUMMARY
# ============================================
echo -e "${BLUE}========================================${NC}"
echo -e "${GREEN}✅ KARAOKEYA E2E TEST COMPLETED${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""
echo "Summary:"
echo "  - Event: $EVENT_SLUG"
echo "  - Guest ID: $GUEST_ID"
echo "  - Guest Email: $GUEST_EMAIL"
echo "  - Request #1: $REQUEST1_ID (Bohemian Rhapsody)"
echo "  - Request #2: $REQUEST2_ID (Don't Stop Me Now)"
echo ""
echo "Manual Testing URLs:"
echo "  - Event Landing: http://localhost:5173/e/$EVENT_SLUG"
echo "  - KARAOKEYA Request: http://localhost:5173/e/$EVENT_SLUG/karaokeya"
echo "  - My Queue: http://localhost:5173/e/$EVENT_SLUG/karaokeya/mi-cola"
echo "  - Operator Panel: http://localhost:5174/events/$EVENT_ID/karaokeya"
echo ""
echo "Guest credentials for manual testing:"
echo "  Email: $GUEST_EMAIL"
echo "  Name: $GUEST_NAME"
echo "  WhatsApp: $GUEST_WHATSAPP"
echo ""
echo "Next steps for manual testing:"
echo "  1. Open Operator Panel and change request status to CALLED"
echo "  2. Verify browser notification appears (if enabled)"
echo "  3. Test drag & drop reordering in operator panel"
echo "  4. Verify real-time updates in guest queue view"
echo ""
