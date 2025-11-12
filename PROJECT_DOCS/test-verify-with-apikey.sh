#!/bin/bash

# Test verify-batch with apikey (required even with verify_jwt = false)
# Replace YOUR_ANON_KEY with your Supabase anon key

PROJECT_REF="udnpbqtvbnepicwyubnm"
ANON_KEY="YOUR_ANON_KEY"
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/verify-batch"

echo "🧪 Test 1: OPTIONS (CORS preflight)"
curl -i -X OPTIONS "$FUNCTION_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, apikey"

echo -e "\n\n🧪 Test 2: POST avec apikey et données valides"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{
    "tokenId": "0.0.5184926",
    "serialNumber": "1"
  }'

echo -e "\n\n🧪 Test 3: POST avec apikey et données manquantes"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "apikey: $ANON_KEY" \
  -d '{}'

echo -e "\n\n✅ Tests complete"
echo "Check HTTP status codes:"
echo " - OPTIONS should return 200"
echo " - Valid POST should return 200 or 404 (depending on whether the NFT exists)"
echo " - Invalid POST should return 400"
