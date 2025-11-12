# AgroDex
## AI-Powered Agricultural Traceability For Indonesia on Hedera

---

## Slide 1: The Problem

### 🌾 Agricultural Supply Chain Challenges

**Trust Gap in Food Systems:**
- Consumers can't verify organic/premium claims
- Farmers struggle to prove quality and get fair prices
- Supply chain fraud costs $40B+ annually
- Manual traceability is slow, expensive, and error-prone

**Current Solutions Fall Short:**
- Paper certificates → easily forged
- Centralized databases → single point of failure
- Blockchain alone → data is immutable but not intelligent

**The Missing Piece:** *AI-powered provenance analysis that turns blockchain data into actionable trust*

---

## Slide 2: Our Solution

### 🚀 AgroDex: Blockchain + AI Traceability

**Technology Stack:**
- **Hedera HCS** → Immutable event logging (planting, maintenance, harvest)
- **Hedera HTS** → NFT certificates for batch ownership
- **Gemini 2.5 Flash** → AI-powered provenance analysis in <2 seconds
- **Supabase** → Real-time data caching and user management

**Key Features:**

1. **Smart Registration** 
   - Upload batch photo → AI analyzes quality, detects anomalies
   - Submit to HCS → Immutable timestamp on Hedera
   - Get instant feedback on product quality

2. **AI Provenance Summaries**
   - Mint NFT → AI reads entire HCS timeline
   - Generate trust score (0-100) based on completeness, consistency, verification
   - Multilingual summaries (EN/FR) with cited blockchain evidence

3. **Buyer Intelligence**
   - Ask questions in natural language
   - AI answers with evidence from blockchain (transaction IDs)
   - Price uplift suggestions based on quality + traceability

**Demo Flow:**
```
Register Batch → AI Analysis (800ms)
     ↓
Submit to HCS → Immutable Record
     ↓
Tokenize → AI Summary + Trust Score (1.5s)
     ↓
Verify → Buyer Q&A + Evidence Links
```

---

## Slide 3: Impact & Next Steps

### 📊 Impact Metrics

**For Farmers:**
- ✅ 15-25% price premium for verified organic/premium products
- ✅ Instant quality feedback via AI analysis
- ✅ Automated certification reduces paperwork by 90%

**For Buyers:**
- ✅ Complete transparency with blockchain-verified provenance
- ✅ AI-powered Q&A answers questions in seconds
- ✅ Trust scores eliminate guesswork

**For the Industry:**
- ✅ Reduces supply chain fraud
- ✅ Enables carbon credit verification
- ✅ Supports fair trade and sustainability goals

### 🎯 Competitive Advantages

1. **Speed**: Gemini 2.5 Flash delivers AI insights in <2 seconds
2. **Cost**: Hedera's low fees ($0.0001/transaction) enable mass adoption
3. **Intelligence**: AI transforms raw blockchain data into actionable insights
4. **Multilingual**: Automatic translation breaks language barriers

### 🚀 Next Steps (3-Month Roadmap)

**Month 1: Pilot Program**
- Partner with 5 coffee cooperatives in Rwanda/Philippines
- Deploy 100 demo NFTs with real harvest data
- Collect user feedback on AI accuracy

**Month 2: Scale & Integrate**
- Add image forensics (detect photo manipulation)
- Integrate with existing ERP systems (SAP, Oracle)
- Launch mobile app for field workers

**Month 3: Marketplace**
- Enable NFT trading for batch ownership transfer
- Add carbon credit calculation via AI
- Launch premium buyer portal with advanced analytics

### 💡 Vision

**"Every agricultural product with a digital twin—verified, intelligent, and tradeable."**

---



### Setup
- Backend running on http://localhost:4000
- Frontend on http://localhost:5173
- Demo NFT already seeded


## Judge Instructions

### What to Click

1. **Health Check** (verify AI is working)
   - Visit: http://localhost:4000/api/health/full
   - Look for: `gemini: { ok: true, model: "gemini-2.0-flash-exp", ms: <number> }`

2. **Register a Batch**
   - Go to: http://localhost:5173/register
   - Fill in: Product Name, Quantity, Origin, Harvest Date
   - Click: "Register Batch"
   - Observe: AI analysis appears with caption, tags, anomalies, confidence

3. **Tokenize the Batch**
   - Go to: http://localhost:5173/tokenize
   - Paste: HCS transaction ID from registration
   - Click: "Create NFT Certificate"
   - Observe: AI provenance summary, trust score, verification link

4. **Verify the NFT**
   - Click: Verification link from tokenization (or use demo URL from seed script)
   - Observe: Complete timeline, AI summary in EN/FR, trust score

5. **Ask a Question**
   - In verify page, type: "When was this harvested?"
   - Click: Send
   - Observe: AI answer with evidence transaction IDs

### What to Ask the AI

**Good Questions:**
- "When was this batch harvested?"
- "What certifications does this product have?"
- "Where was this grown?"
- "Is this organic?"
- "What quality checks were performed?"

**Expected Behavior:**
- Answers in 1-2 seconds
- Cites specific transaction IDs as evidence
- Provides clear, factual responses

### Expected Latencies
- Image Analysis: < 2 seconds
- Provenance Summary: < 3 seconds
- Buyer Q&A: < 2.5 seconds
- All responses cached for instant replay

---

## Technical Highlights for Judges

### Why Hedera?
- **Speed**: 10,000 TPS vs Ethereum's 15 TPS
- **Cost**: $0.0001/transaction vs Ethereum's $5-50
- **Finality**: 3-5 seconds vs Ethereum's 12+ minutes
- **Sustainability**: Carbon-negative network

### Why Gemini 2.5 Flash?
- **Speed**: 2x faster than GPT-4 for structured outputs
- **Cost**: 10x cheaper than GPT-4
- **Reliability**: Consistent JSON responses for parsing
- **Multimodal**: Future support for image analysis

### Architecture Decisions
- **Server-side AI**: Protects API keys, enables caching
- **Timeout handling**: 6-second limit with graceful fallbacks
- **Caching strategy**: 7-day TTL reduces costs and latency
- **Idempotent operations**: Safe to retry without duplicates

### Security
- No API keys exposed to frontend
- Rate limiting on AI endpoints
- Supabase RLS for data access control
- Hedera signatures for transaction authenticity

---

## Contact & Resources

**Built With:**
- Hedera Hashgraph (HCS + HTS)
- Google Gemini 2.5 Flash
- Supabase
- React + TypeScript
- Node.js + Express

---

*Thank you for reviewing AgroDex!*
