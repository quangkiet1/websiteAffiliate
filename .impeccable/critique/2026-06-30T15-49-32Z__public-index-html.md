---
target: index.html
total_score: 27
p0_count: 0
p1_count: 2
timestamp: 2026-06-30T15-49-32Z
slug: public-index-html
---
Method: degraded (single-context, sub-agent tool unavailable in this session)

## Design Health Score

| # | Heuristic | Score | Key Issue |
|---|-----------|-------|-----------|
| 1 | Visibility of System Status | 3 | Good progress indicators and closeable alerts. |
| 2 | Match System / Real World | 3 | Clear e-commerce and affiliate marketing language. |
| 3 | User Control and Freedom | 3 | Standard navigation; promo bar can be dismissed. |
| 4 | Consistency and Standards | 3 | Consistent use of CTA buttons (`btn-magnetic`). |
| 5 | Error Prevention | 2 | Only links, no inline forms to prevent errors. |
| 6 | Recognition Rather Than Recall | 4 | Well-chunked sections (3 pricing tiers, 4 steps). |
| 7 | Flexibility and Efficiency | 2 | Standard page scroll, no keyboard shortcuts. |
| 8 | Aesthetic and Minimalist Design | 2 | Visual noise from promo bar, floating CTA, scroll bar, and wobble cards. |
| 9 | Error Recovery | 3 | N/A (no forms), but clear contact information provided. |
| 10 | Help and Documentation | 2 | Missing an FAQ section for common service questions. |
| **Total** | | **27/40** | **[Acceptable]** |

## Anti-Patterns Verdict

**AI Slop Verdict**: Yes, there are several AI generation tells.
- **Eyebrow text overload**: `LÝ DO CHỌN V-GROW`, `Quy trình hợp tác`, `Khách hàng nói gì`, `Giải pháp của V-Grow` are all tracked-out uppercase eyebrows above headings. This is a common AI scaffolding pattern.
- **Numbered markers**: `01`, `02`, `03`, `04` in the process section. While this is a sequence, paired with the eyebrows it feels like an AI template.
- **Overstuffed motion**: The page uses `wobble-card`, `card-glow-enhanced`, a trust marquee, floating cards, and scroll progress bars all at once, creating a cluttered "everything animated" feel.

**Detector Scan**:
- **Em-dash overuse** (6 instances).
- **Numbered section markers** (Sequence 01, 02, 03, 04).

## Overall Impression
The page is functional and covers all necessary business points, but it feels visually loud and heavily relies on AI-template tropes. Stripping away the decorative excess (eyebrows, over-animation) would make the brand feel more confident and professional.

## What's Working
- **Clear Value Proposition**: The hero section clearly communicates what V-Grow does (bán sản phẩm qua Affiliate & Livestream).
- **Pricing Clarity**: The 3-tier pricing cards are easy to understand with clear pricing and GMV percentages.

## Priority Issues
- **[P1] Visual Clutter / Motion Overload**
  - **Why it matters**: Too many animations (marquee, wobble cards, glowing borders, floating elements, scroll bar) distract from the actual content and can cause performance/accessibility issues.
  - **Fix**: Tone down the decorative motion. Remove the wobble effect on static cards and the scroll progress bar. Keep motion intentional (e.g., subtle hover states).
  - **Suggested command**: `$impeccable quieter`
- **[P1] AI Grammar (Eyebrows & Numbers)**
  - **Why it matters**: Repeating the eyebrow + heading pattern in every section makes the design feel like a generic template rather than a premium agency site.
  - **Fix**: Remove the eyebrow text above headings. Use varied typographic rhythm for sections.
  - **Suggested command**: `$impeccable typeset`
- **[P2] Redundant CTAs**
  - **Why it matters**: Having a Promo bar, Header CTA, Floating CTA, and inline CTAs all screaming "Đặt lịch hẹn" feels aggressive and desperate.
  - **Fix**: Remove the floating CTA on desktop, or remove the promo bar. Let the content drive the conversion naturally.
  - **Suggested command**: `$impeccable distill`

## Persona Red Flags

**Casey (Distracted Mobile User)**:
- The combination of a sticky header, promo bar, and floating CTA could consume 30% of the screen real estate on mobile devices, making reading difficult.

**Sam (Accessibility-Dependent User)**:
- Highly animated elements like the `wobble-card` and `trust-marquee` might lack `prefers-reduced-motion` fallbacks, causing motion sickness.
- Em-dashes might be read awkwardly by screen readers compared to proper punctuation.

## Minor Observations
- The "Khách hàng nói gì" (Testimonials) section uses generic placeholder avatars (NL, TH, PM).
- Missing an FAQ section for common objections (e.g., "What if the GMV target isn't met?").

## Questions to Consider
- Does the brand need to shout with so many CTAs, or can it rely on "expert confidence" to let users book when ready?
- What if the pricing cards didn't "wobble" but instead felt solid and grounded?
