import { createClient } from '@supabase/supabase-js';

// Configuration Supabase
const SUPABASE_URL = 'https://udnpbqtvbnepicwyubnm.supabase.co';
const SUPABASE_ANON_KEY = 'YOUR_ANON_KEY'; // Replace with your anon key

const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

async function testVerifyBatch() {
  console.log('🧪 Test verify-batch SDK\n');

  // Test 1: Existing NFT
  console.log('Test 1: Existing NFT (0.0.7160982 #1)');
  const { data: data1, error: error1 } = await supabase.functions.invoke('verify-batch', {
    body: { 
      tokenId: '0.0.7160982', 
      serialNumber: 1 
    }
  });

  if (error1) {
    console.error('❌ Error:', error1);
  } else {
    console.log('✅ Success:', {
      verified: data1.success,
      tokenId: data1.tokenId,
      serialNumber: data1.serialNumber,
      status: data1.status
    });
  }

  console.log('\n---\n');

  // Test 2: Non-existent NFT
  console.log('Test 2: Non-existent NFT (0.0.9999999 #999)');
  const { data: data2, error: error2 } = await supabase.functions.invoke('verify-batch', {
    body: { 
      tokenId: '0.0.9999999', 
      serialNumber: 999 
    }
  });

  if (error2) {
    console.error('❌ Error (attendu):', error2.message);
  } else {
    console.log('✅ Response:', data2);
  }

  console.log('\n---\n');

  // Test 3: Invalid payload
  console.log('Test 3: Invalid payload (empty)');
  const { data: data3, error: error3 } = await supabase.functions.invoke('verify-batch', {
    body: {}
  });

  if (error3) {
    console.error('❌ Error (attendu):', error3.message);
  } else {
    console.log('✅ Response:', data3);
  }

  console.log('\n✅ Tests SDK terminés');
}

testVerifyBatch().catch(console.error);
