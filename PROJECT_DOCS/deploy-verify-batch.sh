#!/bin/bash

# Complete deployment script for verify-batch
# Run after configuring secrets

set -e

echo "🚀 Deploying verify-batch"
echo ""

# Verify that secrets are configured
echo "📋 Step 1: Checking secrets"
echo "Make sure you have configured the following secrets:"
echo " - SUPABASE_URL"
echo " - SUPABASE_SERVICE_ROLE_KEY"
echo ""
echo "To configure secrets:"
echo " supabase secrets set SUPABASE_URL=\"https://udnpbqtvbnepicwyubnm.supabase.co\""
echo " supabase secrets set SUPABASE_SERVICE_ROLE_KEY=\"<your_service_role_key>\""
echo ""
read -p "Are the secrets configured?" (y/n) " -n 1 -r
echo ""
if [[ ! $REPLY =~ ^[Yy]$ ]]
then

echo "❌ Configure secrets before continuing"
exit 1
fi

# Deploy the function
echo "📦 Step 2: Deploy the function"
supabase functions deploy verify-batch

echo ""
echo "✅ Deployment complete!"
echo ""
echo "📊 Next steps:"
echo " 1. Check the logs: supabase functions logs verify-batch --follow"
echo " 2. Test with curl: ./test-verify-complete.sh"
echo " 3. Test with SDK: tsx test-verify-sdk.ts"
echo " 4. Test from the interface: /verify/0.0.7160982/1"