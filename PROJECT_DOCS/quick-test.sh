#!/bin/bash

# Quick test script with hardcoded values
# Use this for quick testing without .env file

export SUPABASE_URL="https://udnpbqtvbnepicwyubnm.supabase.co"
export SUPABASE_ANON_KEY="=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InVkbnBicXR2Ym5lcGljd3l1Ym5tIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjIyMjAxMjUsImV4cCI6MjA3Nzc5NjEyNX0.TAA7bxPqhDuO-8O6DHNazHo67n0kh7PmyH6aiyepUmQ"

# Run the test script
./test-register-ui.sh "$@"
