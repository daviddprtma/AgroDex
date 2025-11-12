# Tests pour verify-batch Edge Function

## Overview

Tests have been created to detect and correct the bug of the missing Authorization header during calls to the Edge function. `verify-batch`.

## Test structure

### 1. Unit tests (`src/lib/__tests__/api.test.ts`)

Unit tests for the function `verifyBatch` with mocks:

- ✅ Verification of parameters passed to `supabase.functions.invoke`
- ✅ Automatic Authorization header management by the Supabase client
- ✅ Handling of 401 Unauthorized errors
- ✅ Handling of network errors
- ✅ Parsing of structured error responses from the Edge Function

### 2. Integration tests (`src/lib/__tests__/integration/verify-batch.integration.test.ts`)

Integration tests with the real Supabase endpoint:

- ✅ Verification of 401 return without Authorization header
- ✅ Verification of automatic inclusion of the Authorization header with an active session
- ✅ CORS preflight test (OPTIONS)
- ✅ Validation of the response data structure

## Executing the tests

```bash
# Exécuter tous les tests
pnpm test

# Exécuter les tests avec interface UI
pnpm test:ui

# Exécuter les tests avec couverture de code
pnpm test:coverage
```

## Expected results

### Unit Tests
- All tests must pass
- Confirm that the code correctly calls `supabase.functions.invoke`
- Verify proper error handling

### Integration Tests
- **Without session**: Expected 401 error (normal)
- **With session**: No 401 error related to authorization
- **CORS**: Correct headers on OPTIONS request

## Bug fix

The main bug is that the Supabase client must have an active session to automatically send the Authorization header.

### Recommended Solution:

1. **Check the connection status before calling verify-batch**:

```typescript
const { data: { session } } = await supabase.auth.getSession();

if (!session) {
  throw new Error('You must be logged in to check a batch');
}

// Now the call will automatically include the Authorization header
const result = await verifyBatch(tokenId, serialNumber);
```

2. **Or modify the Edge function to accept anonymous requests** (if appropriate):

In `supabase/functions/verify-batch/index.ts`, use the `anon` key instead of forwarding the Authorization header:

```typescript
// Instead of:

const authHeader = req.headers.get('Authorization');

const supabaseClient = createClient(

Deno.env.get('SUPABASE_URL') ?? '',

Deno.env.get('SUPABASE_ANON_KEY') ?? '',

{ global: { headers: { Authorization: authHeader! } } }
);

// Use:
const supabaseClient = createClient(

Deno.env.get('SUPABASE_URL') ?? '',

Deno.env.get('SUPABASE_ANON_KEY') ?? ''
);

```

## Next Steps

1. ✅ Create tests
2. ⏳ Decide on the strategy: authenticated or anonymous requests
3. ⏳ Implement the fix in the frontend or backend code
4. ⏳ Verify that all tests pass
5. ⏳ Test manually in the browser

## Important Notes

- The Supabase JS client **automatically** includes the Authorization header when a session exists
- No need to manually pass the header in `functions.invoke()`
- The Edge function must decide whether to accept anonymous or authenticated requests only