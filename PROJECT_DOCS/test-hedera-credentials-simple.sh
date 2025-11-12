#!/bin/bash

echo "Testing Hedera credentials with simple balance query..."
echo ""

# Get Supabase URL from .env or use default
SUPABASE_URL="https://udnpbqtvbnepicwyubnm.supabase.co"
SUPABASE_ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnBicXR2Ym5lcGljd3l1Ym5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAxMjUsImV4cCI6MjA3Nzc5NjEyNX0.TAA7bxPqhDuO-8O6DHNazHo67n0kh7PmyH6aiyepUmQ"

echo "Calling test-hedera-simple Edge Function..."
echo ""

curl -i -X POST \
  "${SUPABASE_URL}/functions/v1/test-hedera-simple" \
  -H "Content-Type: application/json" \
  -H "apikey: ${SUPABASE_ANON_KEY}" \
  -d '{}'

echo ""
echo ""
echo "Check the response above for:"
echo "1. Key parsing method (DER/ED25519/ECDSA)"
echo "2. Public key derived from private key"
echo "3. Account balance (confirms credentials work)"
echo ""
echo "If you see 'success: true', your credentials are correct!"
echo "If you see errors, check the Supabase Edge Function logs for details."
