# Environment Variables Setup

## Required Variables

### Frontend (Vite)

The following environment variables are required for the frontend application:

```bash
VITE_API_BASE_URL=http://localhost:4000
VITE_SUPABASE_URL=[https://udnpbqtvbnepicwyubnm.supabase.co](https://udnpbqtvbnepicwyubnm.supabase.co)
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Hedera Network Choice: "testnet" or "mainnet"
VITE_HEDERA_NETWORK=testnet

# Hedera Mirror Node Endpoints
VITE_TESTNET_MIRROR_NODE_URL=[https://testnet.mirrornode.hedera.com](https://testnet.mirrornode.hedera.com)
VITE_MAINNET_MIRROR_NODE_URL=[https://mainnet-public.mirrornode.hedera.com](https://mainnet-public.mirrornode.hedera.com)

# HashPack / HashConnect Configuration
VITE_WALLETCONNECT_PROJECT_ID=your_walletconnect_project_id
