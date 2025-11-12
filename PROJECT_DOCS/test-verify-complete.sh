#!/bin/bash

# Full test of verify-batch after fix
# Replace ANON_KEY with your Supabase anon key

PROJECT_REF="udnpbqtvbnepicwyubnm"
FUNCTION_URL="https://${PROJECT_REF}.supabase.co/functions/v1/verify-batch"
ANON_KEY="YOUR_ANON_KEY" # Replace with your anon key

echo "🧪 Test 1: OPTIONS (CORS preflight)"
curl -i -X OPTIONS "$FUNCTION_URL" \
  -H "Access-Control-Request-Method: POST" \
  -H "Access-Control-Request-Headers: Content-Type, Authorization"

echo -e "\n\n🧪 Test 2: POST valide (NFT existant)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "tokenId": "0.0.7160982",
    "serialNumber": "1"
  }'

echo -e "\n\n🧪 Test 3: POST valide (NFT inexistant)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{
    "tokenId": "0.0.9999999",
    "serialNumber": "999"
  }'

echo -e "\n\n🧪 Test 4: POST invalide (payload vide)"
curl -i -X POST "$FUNCTION_URL" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ANON_KEY" \
  -d '{}'

echo -e "\n\n✅ Tests completed"
echo ""
echo "Expected results:"
echo " Test 1 (OPTIONS) → 200"
echo " Test 2 (NFT exists) → 200 with full data"
echo " Test 3 (NFT does not exist) → 404 with {verified: false}"
echo " Test 4 (empty payload) → 400 with {stage: 'validation'}"