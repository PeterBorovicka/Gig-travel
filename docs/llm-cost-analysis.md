# LLM Cost Analysis — Gig Travel AI Assistant

**Date:** March 2026  
**Decision:** Adopt a remote LLM (OpenAI GPT-4o-mini) for the new AI Travel Assistant feature.

---

## 1. Context & Motivation

Gig Travel is an event-discovery and booking platform that currently relies entirely on structured database lookups and filter-based search. Users must know in advance what city, genre, or artist they want.

Adding an AI Travel Assistant unlocks natural-language UX:

- "Find me a rock concert in London with a hotel under £200/night."
- "What's happening in Berlin in July?"
- "Which hotel is closest to Madison Square Garden?"

This moves the app from a static catalogue to a personalised trip-planning experience — a meaningful competitive differentiator.

---

## 2. Options Evaluated

### Option A — No LLM (status quo)
Filter-based UI only. Works today but offers no natural-language experience.

| Criteria | Score |
|---|---|
| Cost | ✅ £0/month |
| Time to value | ✅ Zero |
| User experience uplift | ❌ None |
| Differentiation | ❌ None |

**Verdict:** Baseline. Does not address the feature requirement.

---

### Option B — Remote LLM API

Managed inference via a cloud provider. No GPU infrastructure required.

#### B1 — OpenAI GPT-4o-mini (recommended)

| Metric | Value |
|---|---|
| Input token price | $0.15 / 1M tokens |
| Output token price | $0.60 / 1M tokens |
| Typical request size | ~800 tokens input (system prompt + history) + ~300 tokens output |
| Daily requests (estimated) | 500 |
| Monthly token usage | 500 × 1,100 tokens × 30 days ≈ **16.5M tokens** |
| Estimated monthly cost | ~$2.48 input + ~$2.97 output ≈ **~$5.50/month** |
| Latency (p50) | ~600 ms |
| Setup effort | 1–2 hours |
| Infrastructure ops | None |

#### B2 — OpenAI GPT-4o

| Metric | Value |
|---|---|
| Input token price | $2.50 / 1M tokens |
| Output token price | $10.00 / 1M tokens |
| Estimated monthly cost (same traffic) | ~$41 input + ~$49.50 output ≈ **~$90/month** |
| Improvement over GPT-4o-mini | Marginal for this use-case |

For recommending events and hotels from a short structured list, GPT-4o-mini produces identical quality at 1/16th the cost.

#### B3 — Anthropic Claude 3.5 Haiku

| Metric | Value |
|---|---|
| Input token price | $0.80 / 1M tokens |
| Output token price | $4.00 / 1M tokens |
| Estimated monthly cost (same traffic) | ~$13 input + ~$19.80 output ≈ **~$33/month** |
| Notes | Higher cost than GPT-4o-mini, no measurable quality gain for this task |

---

### Option C — Self-hosted Open-Source Model

Deploy an open-weight model on dedicated GPU compute.

#### C1 — Llama 3.1 8B (via Ollama / vLLM on AWS EC2)

| Metric | Value |
|---|---|
| Recommended instance | AWS `g4dn.xlarge` (1× NVIDIA T4, 16 GB VRAM) |
| On-demand hourly price | $0.526/hour |
| Monthly cost (24/7) | **~$379/month** |
| Throughput | ~80–150 tokens/second → ~2–4 requests/second |
| Model quality (reasoning) | Good, but weaker than GPT-4o-mini on instruction-following |
| Setup effort | 2–5 days (Docker, model download, API wrapper, monitoring) |
| Ops overhead | Ongoing (security patches, GPU health, scaling) |
| Data privacy | ✅ Fully on-premises |
| Break-even vs GPT-4o-mini | ~69× more traffic than current estimate |

#### C2 — Mistral 7B (same infrastructure)

| Metric | Value |
|---|---|
| Monthly cost (same instance) | **~$379/month** |
| Model quality | Similar to Llama 3.1 8B |
| Notes | No cost benefit over C1 |

---

## 3. Side-by-Side Comparison

| | Status Quo | **GPT-4o-mini** | GPT-4o | Claude 3.5 Haiku | Self-hosted (Llama 3.1 8B) |
|---|---|---|---|---|---|
| Monthly cost (500 req/day) | $0 | **~$5.50** | ~$90 | ~$33 | ~$379 |
| Setup time | — | **1–2 hrs** | 1–2 hrs | 1–2 hrs | 2–5 days |
| Ops overhead | None | **None** | None | None | High |
| Latency (p50) | <50 ms | **~600 ms** | ~800 ms | ~700 ms | ~400 ms |
| Output quality (this task) | N/A | **Good** | Excellent | Good | Adequate |
| Data leaves your infra | N/A | Yes | Yes | Yes | **No** |
| Break-even at scale | — | **>34k req/day** | >480 req/day | >6k req/day | Baseline |

> **Break-even calculation:** Self-hosted becomes cheaper than GPT-4o-mini when monthly token cost exceeds ~$379, i.e., approximately 34,000 requests/day at current usage patterns.

---

## 4. Recommendation

**Use Option B1 — OpenAI GPT-4o-mini.**

Rationale:

1. **Cost-efficiency at current scale.** At ~500 requests/day, GPT-4o-mini costs under $6/month. Self-hosting the equivalent on GPU infrastructure costs >$379/month — a 69× cost premium for no benefit at this scale.

2. **Negligible quality gap.** The assistant's task is constrained: it must select relevant events and accommodations from a short (≤20 item) list and compose a friendly recommendation. GPT-4o-mini handles this reliably. The incremental quality improvement of GPT-4o does not justify a 16× price increase.

3. **Zero infrastructure overhead.** No GPU procurement, Docker setup, model updates, or reliability engineering. The team can ship in a day and focus on product features.

4. **Scalability ceiling is far away.** The app would need to grow to ~34,000 AI requests per day before self-hosting becomes financially rational. At that scale, a dedicated infrastructure team would also be available.

5. **Revisit at scale.** If daily AI requests exceed ~10,000, revisit the self-hosted option or negotiate OpenAI volume pricing. At >34,000 requests/day, a fine-tuned open-source model on dedicated GPU becomes the better choice.

---

## 5. Implementation Summary

The AI Travel Assistant is implemented as:

| Component | Details |
|---|---|
| **API endpoint** | `POST /api/ai/chat` (Express route) |
| **Model** | `gpt-4o-mini` via OpenAI Node.js SDK |
| **Context injection** | System prompt includes live events + accommodations fetched from SQLite |
| **History support** | Up to 10 previous messages passed per request |
| **Token budget** | 500 output tokens max per response |
| **Configuration** | `OPENAI_API_KEY` environment variable |
| **Graceful degradation** | Returns HTTP 503 with helpful message if key not set |
| **Frontend** | Dedicated `/assistant` page with chat UI, suggested prompts, dark theme |

### Cost Controls

- Maximum 500 output tokens per response caps per-request cost at ~$0.0003.
- The existing global rate limiter (100 req / 15 min / IP) applies to the chat endpoint.
- History is capped at the last 10 turns to prevent unbounded token growth in long sessions.

---

## 6. Future Considerations

| When | Action |
|---|---|
| >10k AI req/day | Evaluate OpenAI Batch API for non-realtime features (50% cheaper) |
| >34k AI req/day | Evaluate self-hosted Llama 3.1 70B on A10G / fine-tuned 8B model |
| Data privacy requirement added | Migrate to self-hosted or Azure OpenAI (data stays in region) |
| Multilingual users grow | Evaluate models with stronger multilingual support |
