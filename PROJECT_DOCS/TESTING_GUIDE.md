# 🧪 End-to-End Testing Manual - AgroDex
## Preparing for the Hedera Hello Future: Ascension Hackathon 2025 Demo Video

---

## 📋 **Prerequisites before testing**

### ✅ Technical checks
- [ ] Backend started (`cd backend && npm start`)
- [ ] Frontend started (`pnpm dev`)
- [ ] Environment variables configured (`.env` backend + frontend)
- [ ] HashPack Wallet installed and configured on testnet
- [ ] Testnet account with HBAR (minimum 5 HBAR for testing)
- [ ] Stable internet connection
- [ ] Modern browser (Chrome/Firefox recommended)

### 📸 Preparing test data
- [ ] 3-5 photos of Indonesian agricultural products (coffee, cocoa, mangoes, etc.)
- [ ] Good quality photos (min 800x600px)
- [ ] Realistic producer names
- [ ] Authentic Indonesian locations (Ghana, Kenya, Ivory Coast, etc.)

---

## 🎯 **PHASE 1: Authentication & Profile**

### Test 1.1: Connection with HashPack
**Objective**: Verify Hedera wallet integration

**Steps**:

1. Open the application (`http://localhost:5173`)
2. Click on "Connect with HashPack"
3. Approve the connection in HashPack
4. Verify that the account address is displayed in the navbar

**Success Criteria**:
- ✅ HashPack popup opens correctly
- ✅ Connection successful without errors
- ✅ Account ID displayed in the navbar (format: 0.0.xxxxx)
- ✅ Automatic redirection to the homepage

**Points to note for the demo:**

- Connection time (should be < 5 seconds)
- Smoothness of the user experience

---

### Test 1.2: User Profile
**Objective:**: Verify profile management

**Steps:**

1. Navigate to "Profile" in the navbar
2. Complete the form:

- Name: "Kofi Mensah"

- Email: "kofi@agrodex.indonesia"

- Role: "Producer"

- Location: "Kumasi, Ghana"

3. Save the profile

4. Refresh the page
5. Verify that the data persists

**Success criteria:**

- ✅ Form displays correctly
- ✅ Successful saving with a confirmation message
- ✅ Data persists after refreshing
- ✅ No errors in the console

---

## 🌾 **PHASE 2: Batch Registration**

### Test 2.1: Basic Registration
**Objective:** Create an agricultural batch with AI

**Steps:**

1. Navigate to "Register a Batch"
2. Fill out the form:

- **Batch Name:** "Premium Arabica Coffee - January 2025 Harvest"

- **Product Type:** "Coffee"

- **Quantity:** "500"

- **Unit:** "kg"

- **Producer:** "Green Coffee Cooperative - Abidjan"

- **Location:** "Abidjan, Ivory Coast"

- **Harvest Date:** Select a recent date
3. **Upload a photo** of coffee beans
4. Wait for the AI ​​analysis (15-30 seconds)
5. Check the AI ​​feedback Generated
6. Submit the form

**Success Criteria**:
- ✅ Image upload works (preview visible)
- ✅ AI analysis returns relevant feedback in French
- ✅ Success message displayed
- ✅ Hedera Topic ID returned (format: 0.0.xxxxx)
- ✅ No network or server errors

**Critical points for the demo**:
- **AI feedback quality**: Must mention quality, freshness, and authenticity
- **Response time**: < 30 seconds total
- **Clear success message** with visible Topic ID

---

### Test 2.2: Field Validation
**Objective**: Verify the robustness of the form

**Steps**:

1. Try submitting the form empty
2. Fill in only a few fields
3. Try without a photo
4. Try with a photo that is too large (> 5MB)

**Success Criteria**:
- ✅ Clear error messages for missing fields
- ✅ Client-side validation works
- ✅ Upload error handling
- ✅ Appropriate user feedback

---

### Test 2.3: Realistic Indonesian Use Case
**Objective**: Test with authentic data

**Create 3 different batches**:

**Batch 1 - Cocoa from Ghana**:

- Name: "Certified Organic Cocoa - Ashanti Region"
- Type: "Cocoa"
- Quantity: 1000 kg
- Producer: "Kuapa Kokoo Cooperative"
- Location: "Kumasi, Ghana"
- Photo: Cocoa beans

**Batch 2 - Mangoes from Kenya**:

- Name: "Kent Export Quality Mangoes"
- Type: "Fruit"
- Quantity: 300 kg
- Producer: "Mwangi Farms"

- Location: Machakos, Kenya

- Photo: Ripe mangoes

**Batch 3 - Ethiopian Tea**:

- Name: "Organic Green Tea - Highlands"

- Type: "Tea"

- Quantity: 200 kg
- Producer: "Ethiopian Tea Growers"

- Location: Addis Ababa, Ethiopia

- Photo: Tea leaves

**Success Criteria**:

- ✅ All 3 batches successfully created
- ✅ Different Topic IDs for each batch
- ✅ Relevant AI feedback for each product
- ✅ Data stored correctly

---

## 🔗 **PHASE 3: NFT Tokenization (HTS)**

### Test 3.1: Batch Tokenization
**Objective**: Create a Hedera NFT for traceability

**Steps**:

1. Navigate Go to "Tokenize a batch"

2. Select a previously created batch (e.g., Arabica Coffee)
3. Fill in the NFT metadata:

- **Token Name**: "AGRI-CAFE-001"

- **Symbol**: "CAFE"

- **Description**: "Trace NFT"
"Ability for Premium Arabica Coffee"

4. Click on "Create NFT"
5. Approve the transaction in HashPack
6. Wait for confirmation (30-60 seconds)

**Success Criteria**:
- ✅ Form pre-filled with batch data
- ✅ HashPack transaction opens correctly
- ✅ NFT created successfully
- ✅ Token ID returned (format: 0.0.xxxxx)
- ✅ Confirmation message with link to HashScan
- ✅ Cost in HBAR displayed

**Critical Points for the Demo**:

- **Show the transaction on HashScan** (explore Hedera)
- **Explain the immutability** of the NFT
- **Highlight blockchain traceability**

---

### Test 3.2: Verification on HashScan
**Objective**: Prove the record Blockchain

**Steps**:

1. Copy the Token ID of the created NFT
2. Open HashScan testnet: `https://hashscan.io/testnet`
3. Search for the Token ID
4. Verify the metadata
5. Verify the owner (your account ID)

**Success Criteria**:
- ✅ NFT visible on HashScan
- ✅ Correct metadata
- ✅ Correct owner
- ✅ Visible creation timestamp

---

## ✅ **PHASE 4: Verification of Origin**

### Test 4.1: Verification by Topic ID
**Objective**: Trace the history of a batch

**Steps**:

1. Navigate to "Verify a Batch"
2. Enter the Topic ID of a created batch
3. Click "Verify"
4. Review the results :

- Batch Information
- HCS Event History
- AI Origin Summary
- Traceability Timeline

**Success Criteria**:
- ✅ Batch data displayed correctly
- ✅ Complete HCS history
- ✅ AI summary generated in French
- ✅ Clear and readable timeline
- ✅ All steps visible (creation, tokenization if applicable)

**Critical Points for the Demo**:
- **AI Origin Summary**: Must be clear, professional, and reassuring
- **Total Transparency**: Show all steps
- **Immutability**: Explain that the data cannot be modified

---

### Test 4.2: Verification by Token ID
**Objective**: Verify via NFT

**Steps**:
1. Use the Token ID from a created NFT

2. Verify the origin
3. Compare with the Topic data ID

**Success Criteria**:
- ✅ Consistent data between Topic and Token
- ✅ Visible link between HCS and HTS
- ✅ Complete AI summary

---

### Test 4.3: AI Buyer Questions
**Objective**: Test the AI ​​assistant for buyers

**Steps**:

1. On the batch verification page
2. Ask questions in the AI ​​chat:

- "Is this coffee organic?"

- "How fresh is the product?"

- "Can I trust this producer?"

- "What certifications does it have?"

3. Check the AI ​​responses

**Success Criteria**:
- ✅ Relevant and contextual responses
- ✅ Responses in French
- ✅ Response time < 10 seconds
- ✅ Responses based on batch data

---

## 🌍 **PHASE 5: User Experience & Performance**

### Test 5.1: Navigation & Responsiveness
**Objective**: Verify the overall UX

**Steps**:

1. Test the navbar on desktop
2. Test the hamburger menu on mobile (DevTools)
3. Navigate between all pages
4. Verify transitions
5. Test dropdowns

**Success Criteria**:
- ✅ Smooth navigation
- ✅ Responsive on mobile/tablet/desktop
- ✅ Working hamburger menu
- ✅ No visual bugs
- ✅ Loading time < 3 seconds

---

### Test 5.2: Error Handling
**Objective**: Verify robustness

**Scenarios to test**:
1. Disconnect the backend → Verify error messages
2. Reject a HashPack transaction → Verify error handling
3. Image upload Invalid → Check validation
4. Topic ID does not exist → Check clear message

**Success Criteria**:
- ✅ Clear error messages in French
- ✅ No application crashes
- ✅ Ability to retry
- ✅ Appropriate user feedback

---

### Test 5.3: Performance & Response Time
**Objective**: Measure speed

**Metrics to note**:
- ⏱️ HashPack connection time: _____ seconds
- ⏱️ AI analysis time (image): _____ seconds
- ⏱️ HCS topic creation time: _____ seconds
- ⏱️ NFT creation time: _____ seconds
- ⏱️ Verification time: _____ seconds
- ⏱️ AI chat response time: _____ seconds

**Objectives**:

- Connection: < 5s
- AI Analysis: < 30s
- HCS Topic: < 10s
- NFT: < 60s
- Verification: < 5s
- AI Chat: < 10s

## ✅ **Final Validation**

Before declaring tests complete:

- [ ] All PHASE 1-5 tests successfully passed
- [ ] At least 3 batches created with realistic data
- [ ] At least 1 tokenized NFT verified on HashScan
- [ ] Provenance verification successfully tested
- [ ] AI chat tested with relevant questions
- [ ] Performance measured and acceptable
- [ ] No critical errors in the console
- [ ] Video script prepared and rehearsed
- [ ] Final checklist completed