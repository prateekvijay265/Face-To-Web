# Design System — Face-to-Web Discovery & Blockchain Verification

**Version:** 1.0  
**Design direction:** Cyber-forensics / intelligence dashboard / trustworthy verification.

---

# 1. Design Objective

The interface should communicate:

```text
SEARCH → EVIDENCE → CRYPTOGRAPHIC PROOF
```

It should feel:
- technical
- precise
- modern
- trustworthy
- investigative
- restrained

It must NOT look like:
- a social-media clone
- a gambling dashboard
- a flashy crypto trading platform
- a surveillance advertisement

---

# 2. Visual Concept

Primary metaphor:

**Digital evidence workstation**

Visual language:
- dark interface
- thin borders
- monospace technical labels
- large readable status indicators
- subtle grid/background texture
- cards representing pipeline stages
- transaction/evidence IDs presented as technical artifacts

---

# 3. Color Tokens

Use CSS variables so the entire palette can be changed centrally.

```css
:root {
  --bg: #080a0d;
  --surface: #0e1217;
  --surface-2: #151a21;
  --border: #26303a;

  --text: #f2f5f7;
  --muted: #8d99a6;

  --accent: #7c5cff;
  --accent-soft: #a997ff;

  --success: #35d07f;
  --warning: #f0b429;
  --danger: #ff5c6c;
  --info: #42b9ff;
}
```

Do not scatter raw colors throughout components.

---

# 4. Typography

### Primary UI
Use:
- Inter
- Geist
- or another clean sans-serif

### Technical data
Use:
- JetBrains Mono
- IBM Plex Mono
- or system monospace

Hierarchy:

```text
H1: 40–56px
H2: 28–36px
H3: 20–24px
Body: 14–16px
Metadata: 12–13px
Hash/transaction: 12–14px monospace
```

Avoid excessive all-caps.

Use uppercase primarily for:
- pipeline labels
- status tags
- technical metadata

---

# 5. Layout

Desktop:
- maximum width approximately 1400px
- 24–32px outer padding
- 16–24px card gaps

Mobile:
- single column
- horizontally scrollable technical IDs
- stacked pipeline stages

Grid:

```text
┌─────────────────────────────────────┐
│ Header                              │
├─────────────────────────────────────┤
│ Pipeline status                     │
├───────────────────┬─────────────────┤
│ Face input        │ Search results  │
├───────────────────┴─────────────────┤
│ Evidence                            │
├─────────────────────────────────────┤
│ Blockchain + verification           │
└─────────────────────────────────────┘
```

---

# 6. Pipeline Component

Display five major stages:

```text
FACE
  ↓
SEARCH
  ↓
EVIDENCE
  ↓
BLOCKCHAIN
  ↓
VERIFY
```

Each stage has:

```text
icon
label
status
duration
short result
```

States:

### Idle
Muted border.

### Processing
Accent border + subtle animation.

### Success
Success indicator.

### Warning
Warning indicator.

### Error
Danger indicator.

Never use color alone to communicate status. Include text/icons.

---

# 7. Upload Card

Content:

```text
INPUT FACE
Upload a permitted test image

[ Drag & Drop ]

Supported: JPG PNG WEBP
Maximum size: configurable
```

After upload:

```text
FACE DETECTED
1 face
Embedding generated
```

Do not display the raw embedding.

---

# 8. Search Results

Each result card:

```text
MATCH #01

[thumbnail]

SOURCE
example.com

CONFIDENCE
94.7%

URL
https://...

[Inspect Evidence]
```

The UI must distinguish:
- provider confidence
- application's own confidence
- no confidence available

Never show `94.7%` if the provider didn't actually supply or calculate that score.

---

# 9. Evidence Card

Show:

```text
EVIDENCE RECORD

Source URL
Canonical URL
Retrieved
Content type

IMAGE SHA-256
9f86d081884c...

EVIDENCE SHA-256
abc123...

Canonicalization
v1.0
```

Use copy buttons for long hashes.

---

# 10. Blockchain Card

Show:

```text
BLOCKCHAIN RECORD

Network
Ethereum Sepolia

Chain ID
11155111

Contract
0x...

Transaction
0x...

Block
...

Status
CONFIRMED
```

Transaction IDs must be rendered in monospace.

If possible, provide an external explorer link.

---

# 11. Verification Card

This is the visual climax.

### Verified

```text
✓ VERIFIED

Current fingerprint
=
On-chain fingerprint

CONTENT INTEGRITY CONFIRMED
```

### Tampered

```text
✕ HASH MISMATCH

Current fingerprint
≠
On-chain fingerprint

CONTENT HAS CHANGED
```

### Unavailable

```text
! VERIFICATION UNAVAILABLE

The source could not be retrieved.
```

Do not call unavailable content "tampered."

---

# 12. Motion

Use restrained motion.

Allowed:
- 150–250ms card transitions
- subtle stage progress
- hash reveal animation
- transaction confirmation pulse

Avoid:
- excessive neon effects
- constant blinking
- distracting particle systems
- fake "hacking" animations

Motion should reinforce state, not create noise.

---

# 13. Accessibility

Requirements:
- WCAG-conscious contrast
- keyboard navigation
- visible focus states
- alt text for meaningful images
- status communicated via text
- reduced-motion support

Do not rely solely on:
- red = failure
- green = success

Use explicit labels.

---

# 14. Empty States

### No search result

```text
NO PUBLIC MATCH FOUND

The search completed successfully but returned
no sufficiently confident public result.
```

### Search error

```text
SEARCH FAILED

The external search service could not complete
the request. Try again later.
```

### Blockchain unavailable

```text
BLOCKCHAIN UNAVAILABLE

Evidence was generated locally, but the
on-chain registration could not be completed.
```

---

# 15. Responsive Behavior

At <= 768px:
- stack cards
- reduce heading size
- allow hash wrapping
- keep primary CTA full width
- keep pipeline visible
- use horizontal scroll for transaction IDs if necessary

At <= 480px:
- reduce padding
- collapse secondary metadata
- keep verification status prominent

---

# 16. Design Anti-Patterns

Do not:
- hide errors
- display fake success
- use fake terminal logs
- label every result "verified"
- expose private keys
- display raw face embeddings
- use excessive gradients
- use tiny unreadable text for hashes

The design must make the system more trustworthy, not merely more impressive.
