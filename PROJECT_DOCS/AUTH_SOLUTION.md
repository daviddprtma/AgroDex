# Solution: 401 Missing Authorization Header

## Identified Problem

Testing shows that: :
- ✅ **With Authorization header** : Works (200 OK)
- ❌ **Without Authorization header** : Fails (401)

This means that **`verify_jwt` is still enabled** on Supabase (despite `config.toml`).

## Solution Applied

### 1. Updated frontend (`src/lib/api.ts`)

The frontend code now automatically sends the Authorization header:

```typescript
// Get current session to include Authorization header
const { data: { session } } = await supabase.auth.getSession();

const headers: Record<string, string> = {};

// If user is logged in, include Authorization header
if (session?.access_token) {
  headers['Authorization'] = `Bearer ${session.access_token}`;
}

const { data: result, error } = await supabase.functions.invoke('register-batch', {
  body: normalizedData,
  headers
});
```

**Behavior** :
- If logged-in user → Sends `Authorization: Bearer <user_token>`
- If logged-out user → Sends only `apikey` (requires `verify_jwt = false`)

### 2. Options for anonymous access

If you want to allow access without user login, you must:

#### Option A: Disable JWT in the Supabase Dashboard (Recommended)

1. Go to **Supabase Dashboard**
2. **Edge Functions** → `register-batch` → **Settings**
3. Disable **"Verify JWT with legacy secret"**
4. Cliquer **Save**

#### Option B: Redeploy with --no-verify-jwt

```bash
supabase functions deploy register-batch --no-verify-jwt
supabase functions deploy test-hedera-credentials --no-verify-jwt
```

**Note** : The `supabase/config.toml` with `verify_jwt = false` is only applied during deployment.

## Verification Test

### Test 1: With logged-in user (now working)

```bash
# The frontend automatically sends the Authorization header if the user is logged in.
# Test from the UI after login.
```

### Test 2: Without a user (requires Option A or B above)

```bash
./quick-test.sh no-jwt
```

Should return 200 OK after disabling JWT.

## Summary

| Scenario | Authorization Header | Result |
|----------|---------------------|----------|
| Logged in user (frontend) | ✅ Sent Automatically | ✅ Works |
| Not logged-in user (frontend) | ❌ Not sent | ❌ 401 (unless JWT is disabled) |
| Test curl with header | ✅ Sent Manually | ✅ Works |
| Test curl without header | ❌ Not sent | ❌ 401 (unless JWT is disabled) |

## Next steps

1. **Test the UI** : Log in and try registering a batch file
2. **If you want anonymous access** : Apply Option A or B above
3. **Check the logs** : `supabase functions logs register-batch --limit 20`
