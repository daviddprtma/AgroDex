#!/bin/bash

SUPABASE_URL="https://udnpbqtvbnepicwyubnm.supabase.co"
ANON_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnBicXR2Ym5lcGljd3l1Ym5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAxMjUsImV4cCI6MjA3Nzc5NjEyNX0.TAA7bxPqhDuO-8O6DHNazHo67n0kh7PmyH6aiyepUmQ"

echo "=== Testing dashboard-stats ==="
curl -s -X GET "${SUPABASE_URL}/functions/v1/dashboard-stats" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" | jq '.'

echo -e "\n=== Testing dashboard-health ==="
curl -s -X GET "${SUPABASE_URL}/functions/v1/dashboard-health" \
  -H "apikey: ${ANON_KEY}" \
  -H "Content-Type: application/json" | jq '.'
