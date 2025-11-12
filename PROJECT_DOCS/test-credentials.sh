#!/bin/bash
# Quick test for Hedera credentials

export SUPABASE_URL="https://udnpbqtvbnepicwyubnm.supabase.co"
export ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnBicXR2Ym5lcGljd3l1Ym5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAxMjUsImV4cCI6MjA3Nzc5NjEyNX0.TAA7bxPqhDuO-8O6DHNazHo67n0kh7PmyH6aiyepUmQ"

echo "Testing Hedera Credentials..."
curl -X POST "${SUPABASE_URL}/functions/v1/test-hedera-credentials" \
  -H "apikey: ${ANON_KEY}" \
  -H "Authorization: Bearer ${ANON_KEY}" \
  -H "Content-Type: application/json" | jq .
