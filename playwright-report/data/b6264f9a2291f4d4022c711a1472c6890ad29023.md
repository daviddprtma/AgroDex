# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: login.spec.ts >> Authentication Flows >> should display landing page correctly
- Location: e2e/login.spec.ts:4:3

# Error details

```
Error: expect(locator).toBeVisible() failed

Locator: getByText('AgroDex', { exact: true })
Expected: visible
Error: strict mode violation: getByText('AgroDex', { exact: true }) resolved to 3 elements:
    1) <div data-component-name="div" data-component-id="src/pages/Landing.tsx:71:20" class="flex items-center gap-2 font-semibold text-sm text-white">…</div> aka locator('div').filter({ hasText: /^AgroDex$/ })
    2) <h1 data-component-name="h1" class="text-3xl font-extrabold" data-component-id="src/pages/Landing.tsx:112:32">AgroDex</h1> aka locator('h1')
    3) <h2 data-component-name="h2" class="text-xl font-extrabold text-emerald-600" data-component-id="src/pages/Landing.tsx:447:28">AgroDex</h2> aka getByRole('contentinfo').getByRole('heading', { name: 'AgroDex' })

Call log:
  - Expect "toBeVisible" with timeout 5000ms
  - waiting for getByText('AgroDex', { exact: true })

```

# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - region "Notifications (F8)":
      - list
    - generic [ref=e3]:
      - generic [ref=e5]:
        - generic [ref=e6]: AgroDex
        - generic [ref=e8]:
          - button "Home" [ref=e9] [cursor=pointer]
          - button "Problem" [ref=e10] [cursor=pointer]
          - button "Solution" [ref=e11] [cursor=pointer]
          - button "Process" [ref=e12] [cursor=pointer]
          - button "AI Risk" [ref=e13] [cursor=pointer]
          - button "Impact" [ref=e14] [cursor=pointer]
          - button "Join" [ref=e15] [cursor=pointer]
        - link "Sign Up" [ref=e16] [cursor=pointer]:
          - /url: /register
          - button "Sign Up" [ref=e17]:
            - text: Sign Up
            - img
      - generic [ref=e19]:
        - generic [ref=e20]:
          - generic [ref=e21]:
            - img [ref=e22]
            - generic [ref=e23]:
              - heading "AgroDex" [level=1] [ref=e24]
              - paragraph [ref=e25]: AI + Blockchain Food Traceability
          - heading "Stop Food Fraud with Hedera + AI" [level=2] [ref=e26]
          - paragraph [ref=e27]: AgroDex creates a transparent agricultural supply chain using blockchain, AI auditing, and NFT-based batch identity.
          - generic [ref=e28]:
            - link "Get Started" [ref=e29] [cursor=pointer]:
              - /url: /register
              - button "Get Started" [ref=e30]:
                - text: Get Started
                - img
            - link "Live Demo" [ref=e31] [cursor=pointer]:
              - /url: /verify
              - button "Live Demo" [ref=e32]:
                - text: Live Demo
                - img
        - img "Farmer in Indonesia" [ref=e33]
      - generic [ref=e34]:
        - heading "The Problem" [level=2] [ref=e35]
        - paragraph [ref=e36]: Food fraud in agricultural supply chains destroys trust between farmers, distributors, and consumers, resulting in billions in losses and making product quality difficult to verify.
        - generic [ref=e37]:
          - generic [ref=e38]:
            - img [ref=e40]
            - heading "Lack of Traceability" [level=3] [ref=e42]
            - paragraph [ref=e43]: Agricultural products pass through multiple intermediaries with little to no reliable record of their origin or journey.
          - generic [ref=e44]:
            - img [ref=e46]
            - heading "Farmer Disadvantage" [level=3] [ref=e48]
            - paragraph [ref=e49]: Authentic farmers struggle to prove premium quality, making it difficult to earn fair value for certified produce.
          - generic [ref=e50]:
            - img [ref=e52]
            - heading "Consumer Distrust" [level=3] [ref=e54]
            - paragraph [ref=e55]: Buyers cannot independently verify authenticity, certifications, or whether products have been tampered with.
      - generic [ref=e56]:
        - heading "Hedera + AI Powered Solution" [level=2] [ref=e57]
        - paragraph [ref=e58]: AgroDex builds a verifiable digital twin for every agricultural batch using blockchain immutability and AI auditing.
        - generic [ref=e59]:
          - generic [ref=e60]:
            - img [ref=e62]
            - heading "Hedera HCS" [level=3] [ref=e64]
            - paragraph [ref=e65]: Every farming event is permanently committed to an immutable consensus log, tamper-proof from origin.
          - generic [ref=e66]:
            - img [ref=e68]
            - heading "HTS NFTs" [level=3] [ref=e70]
            - paragraph [ref=e71]: Each batch becomes a certifiable token tied to its origin history and quality data on-chain.
          - generic [ref=e72]:
            - img [ref=e74]
            - heading "Mirror Node Verification" [level=3] [ref=e76]
            - paragraph [ref=e77]: Real-time replay of supply chain history for remote auditors, regulators, and buyers.
      - generic [ref=e78]:
        - paragraph [ref=e79]: How It Works
        - heading "From farm to verified in 3 steps" [level=2] [ref=e80]
        - paragraph [ref=e81]: A simple, deterministic system that turns agricultural products into verifiable digital assets.
        - generic [ref=e85]:
          - generic [ref=e86]:
            - generic [ref=e87]: "01"
            - heading "Register Batch" [level=3] [ref=e88]
            - paragraph [ref=e89]: Farmer logs crop data, images, and provenance details into the AgroDex platform.
          - generic [ref=e90]:
            - generic [ref=e91]: "02"
            - heading "Mint NFT" [level=3] [ref=e92]
            - paragraph [ref=e93]: A unique HTS NFT is minted on Hedera, anchoring the batch to an immutable identity.
          - generic [ref=e94]:
            - generic [ref=e95]: "03"
            - heading "Verify via QR" [level=3] [ref=e96]
            - paragraph [ref=e97]: Any buyer or auditor scans the QR code to instantly validate the full provenance chain.
      - generic [ref=e98]:
        - heading "AI Risk Intelligence Engine" [level=2] [ref=e99]
        - paragraph [ref=e100]: A deterministic fraud detection system powered by structured signals + AI explanation layer.
        - generic [ref=e101]:
          - generic [ref=e102]:
            - heading "Deterministic Scoring" [level=3] [ref=e103]
            - paragraph [ref=e104]: 7 rule-based fraud detectors generate a transparent 0–100 risk score.
          - generic [ref=e105]:
            - heading "Gemini Explanation Layer" [level=3] [ref=e106]
            - paragraph [ref=e107]: AI explains fraud signals in human-readable audit-ready reports.
          - generic [ref=e108]:
            - heading "Risk Classification" [level=3] [ref=e109]
            - paragraph [ref=e110]: SAFE → CRITICAL grading system for instant decision making.
          - generic [ref=e111]:
            - heading "Fraud Signal Detectors" [level=3] [ref=e112]
            - generic [ref=e113]:
              - generic [ref=e114]: Yield anomaly (±2σ)
              - generic [ref=e115]: Missing lifecycle events
              - generic [ref=e116]: Duplicate metadata
              - generic [ref=e117]: High batch frequency
              - generic [ref=e118]: Multiple NFT mint attempts
              - generic [ref=e119]: Regional outliers
              - generic [ref=e120]: Suspicious farmer history
      - generic [ref=e122]:
        - heading "Start building trust in food systems" [level=2] [ref=e123]
        - paragraph [ref=e124]: Join AgroDex and make every agricultural product verifiable, transparent, and fraud-resistant.
        - link "Create Account" [ref=e125] [cursor=pointer]:
          - /url: /register
          - button "Create Account" [ref=e126]
      - contentinfo [ref=e127]:
        - generic [ref=e129]:
          - generic [ref=e130]:
            - heading "AgroDex" [level=2] [ref=e131]
            - paragraph [ref=e132]: AI + Blockchain powered agricultural traceability platform built on Hedera Hashgraph.
          - generic [ref=e133]:
            - heading "Project" [level=3] [ref=e134]
            - list [ref=e135]:
              - listitem [ref=e136]:
                - link "Home" [ref=e137] [cursor=pointer]:
                  - /url: "#hero"
              - listitem [ref=e138]:
                - link "Solution" [ref=e139] [cursor=pointer]:
                  - /url: "#solution"
              - listitem [ref=e140]:
                - link "AI Engine" [ref=e141] [cursor=pointer]:
                  - /url: "#fraud"
              - listitem [ref=e142]:
                - link "Impact" [ref=e143] [cursor=pointer]:
                  - /url: "#impact"
          - generic [ref=e144]:
            - heading "Links" [level=3] [ref=e145]
            - generic [ref=e146]:
              - link "GitHub Repository" [ref=e147] [cursor=pointer]:
                - /url: https://github.com/daviddprtma/AgroDex
                - img [ref=e148]
                - text: GitHub Repository
                - img [ref=e151]
              - link "Live Demo" [ref=e155] [cursor=pointer]:
                - /url: /verify
                - img [ref=e156]
                - text: Live Demo
          - generic [ref=e159]:
            - heading "Contact" [level=3] [ref=e160]
            - generic [ref=e161]:
              - generic [ref=e162]:
                - img [ref=e163]
                - generic [ref=e166]: agrodex.team@gmail.com
              - generic [ref=e167]: Built for Hedera Hackathon • SSOC 2026
    - button "Scroll to top":
      - img
  - img [ref=e170]
```

# Test source

```ts
  1  | import { test, expect } from '@playwright/test';
  2  | 
  3  | test.describe('Authentication Flows', () => {
  4  |   test('should display landing page correctly', async ({ page }) => {
  5  |     await page.goto('/');
  6  |     
  7  |     // Check if main title exists
> 8  |     await expect(page.getByText('AgroDex', { exact: true })).toBeVisible();
     |                                                              ^ Error: expect(locator).toBeVisible() failed
  9  |     await expect(page.getByText('Securing Indonesia')).toBeVisible();
  10 |     
  11 |     // Check if login buttons are present
  12 |     await expect(page.getByRole('button', { name: /Login as Farmer/i })).toBeVisible();
  13 |     await expect(page.getByRole('button', { name: /Login as Auditor/i })).toBeVisible();
  14 |   });
  15 | 
  16 |   test('should navigate to login page when clicking Farmer login', async ({ page }) => {
  17 |     await page.goto('/');
  18 |     
  19 |     await page.getByRole('button', { name: /Login as Farmer/i }).click();
  20 |     await expect(page).toHaveURL(/.*\/login/);
  21 |     await expect(page.getByRole('heading', { name: /Welcome back/i })).toBeVisible();
  22 |   });
  23 | });
  24 | 
```