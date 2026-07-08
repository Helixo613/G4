# Presenter Script — "Attention Is All You Need"

**Format:** 4 presenters, ~3 minutes each, ~12 minutes total (leaves buffer in a 15-min slot).
**Driven by:** the simulation site in `presentation/site/` (arrow keys move between slides).
**Cue legend:**

- `[SLIDE N]` — press → to advance to slide N
- `[CLICK: ...]` — perform this interaction on the current slide
- `[HANDOFF]` — one line to pass to the next speaker

**Audience:** peers with mixed ML familiarity. Rule followed throughout: intuition first, at most one formula per section.

---

## PERSON 1 — The Hook, the Authors, the Problem (~3 min, Slides 1–2)

### [SLIDE 1 — Title & Authors]

> Quick question before we start — how many of you have used ChatGPT, Google Translate, or any AI assistant this week?
>
> (pause for hands)
>
> Every single one of those tools descends from one paper. Eight pages, published in 2017, with maybe the most confident title in machine learning history: **"Attention Is All You Need."**
>
> It came out of Google Brain and Google Research — eight authors: Vaswani, Shazeer, Parmar, Uszkoreit, Jones, Gomez, Kaiser, and Polosukhin. There's a famous footnote on this paper: it says all eight contributed **equally**, and the author order was random. That almost never happens in research — and it tells you this was a genuine team invention.
>
> They presented it at NeurIPS 2017. Today, we're not going to walk you through it with static slides. We built a **live simulation** of the ideas in this paper, and we'll explain the paper by playing with it.

### [SLIDE 2 — The Problem]

> So what problem were they solving? In 2017, machine translation was ruled by **recurrent neural networks** — RNNs and LSTMs. And RNNs have one defining habit: they read a sentence **one word at a time**, left to right, carrying a summary in their memory as they go.
>
> Watch what that looks like.
>
> **[CLICK: "Play RNN" button — tokens light up one at a time, each waiting for the previous]**
>
> See how each word has to wait for the one before it? That's problem number one: **you can't parallelize this.** GPUs are built to do thousands of things at once, and RNNs force them to work in single file. Training was painfully slow.
>
> Problem number two is worse. That memory the RNN carries? It's a fixed-size summary. By the time you reach word twenty, word one has been squeezed through twenty updates. Long-range relationships — like a pronoun referring to something way back in the sentence — just **fade**.
>
> **[CLICK: "Play Transformer" button — all tokens light up simultaneously, connections appear between all pairs]**
>
> This is the Transformer's answer: throw away recurrence entirely. Every word looks at **every other word, directly, all at the same time**. No waiting, no fading memory. One mechanism does all the work — attention.

**[HANDOFF]**
> The obvious question is: what does it actually mean for a word to "look at" another word? That's the heart of the paper, and that's what [Person 2] will show you.

---

## PERSON 2 — Self-Attention, Live (~3 min, Slide 3)

### [SLIDE 3 — Self-Attention Simulator]

> Thanks. So — attention. Here's the intuition before any math: **every word gets to ask questions of every other word, and decides who's relevant to it.**
>
> Take this sentence on screen: *"The animal didn't cross the street because it was too tired."*
>
> Quick check — what does "it" refer to? The animal, or the street?
>
> (pause)
>
> You all said "animal" instantly. But a machine has to *figure that out*. Watch what the Transformer does.
>
> **[CLICK: token "it" — arcs appear from "it" to other tokens, thickest arc to "animal"; heatmap row highlights]**
>
> Look at the arcs. The thickness is how much "it" is *attending* to each word — and the strongest connection, by far, is to **"animal"**. The model resolved the pronoun by itself, in a single step, no matter how far apart the words are.
>
> **[CLICK: "tired" → change to "wide" in the sentence toggle — arcs from "it" now shift toward "street"]**
>
> And here's the beautiful part — change "tired" to "wide": *"...because it was too wide."* Now "it" attends to **"street"**. The attention shifts with the meaning.
>
> So how is this computed? Every word gets three vectors, learned during training:
>
> **[CLICK: "Show the math" toggle — Q, K, V vectors and the formula appear]**
>
> - a **Query** — "here's what I'm looking for"
> - a **Key** — "here's what I contain"
> - a **Value** — "here's what I'll give you if you pick me"
>
> The word "it" takes its Query and compares it against every word's Key — that's just a dot product, a similarity score. The scores go through a **softmax**, which turns them into percentages that sum to one — that's exactly the heatmap row you're seeing. Then each word's Value gets blended together, weighted by those percentages.
>
> This is the one formula of our talk:
>
> **Attention(Q, K, V) = softmax(QKᵀ / √d_k) · V**
>
> The only mysterious bit is dividing by √d_k — that just keeps the scores from getting so large that softmax saturates and gradients die. A stability trick.
>
> That's it. That's the whole engine. Compare, weigh, blend.

**[HANDOFF]**
> But one attention pattern can only capture one *kind* of relationship — and language has many. [Person 3] will show you how the paper stacks this into a full architecture.

---

## PERSON 3 — Multi-Head Attention, Positions, the Full Stack (~3 min, Slide 4)

### [SLIDE 4 — Architecture Explorer]

> So we have this engine that lets words look at each other. The paper's next move: don't run it once — run it **eight times in parallel**, each with different learned weights. These are called **attention heads**.
>
> Why? Because one head can only learn one type of relationship. Watch.
>
> **[CLICK: Head selector — "Head 1" — arcs show pronoun → noun pattern]**
>
> This head has learned to track *what refers to what* — pronouns to their nouns.
>
> **[CLICK: Head selector — "Head 2" — arcs show adjacent-word / syntax pattern]**
>
> This one tracks nearby grammatical structure — words attending to their neighbors.
>
> Eight heads, eight different "experts" on relationships, and their outputs get concatenated back together. That's **multi-head attention**.
>
> Now — there's a hole in everything we've said so far. Attention compares every word with every word *simultaneously*... which means it has **no idea what order the words are in**. "Dog bites man" and "man bites dog" would look identical!
>
> The fix is **positional encoding**.
>
> **[CLICK: "Positional Encoding" tab — sinusoid waves visualization]**
>
> Before anything else happens, each word's vector gets a unique position stamp added to it — built from sine and cosine waves at different frequencies. Think of it like a barcode for position: every position in the sentence gets a distinct, smooth pattern, and the model can learn to read relative distances from it.
>
> Put it all together:
>
> **[CLICK: "Full Architecture" tab — encoder-decoder diagram, hover highlights each block]**
>
> The **encoder**, on the left: six identical layers, each just multi-head attention plus a small feed-forward network, with residual connections and layer normalization to keep training stable. It reads the input sentence and builds a rich representation.
>
> The **decoder**, on the right, generates the translation word by word. Two twists:
>
> **[CLICK: "Mask" toggle — future positions gray out in the decoder attention]**
>
> First, its self-attention is **masked** — when generating word five, it's forbidden from peeking at words six and beyond, because at inference time those don't exist yet. Second, it has a **cross-attention** layer that looks back at the encoder — that's where the translation actually consults the source sentence.
>
> Attention, positions, stack, repeat. That's the entire Transformer. No recurrence anywhere.

**[HANDOFF]**
> Simple architecture, bold title — but did it actually work? [Person 4] has the receipts.

---

## PERSON 4 — Results, Impact, Closing (~3 min, Slide 5)

### [SLIDE 5 — Results & Legacy]

> So, did throwing away recurrence pay off? Here are the numbers from the paper.
>
> **[CLICK: "Show results" — BLEU bar chart animates in]**
>
> The benchmark is machine translation, measured in BLEU score — higher means closer to human reference translations. On English-to-German, the big Transformer scored **28.4** — more than two full BLEU points above the best previous models, including entire *ensembles* of models. On English-to-French: **41.8** — a new single-model state of the art.
>
> But the score isn't even the headline. Look at the cost.
>
> **[CLICK: "Training cost" comparison — table appears]**
>
> The big model trained in **3.5 days on 8 GPUs**. The base model — which *already* beat previous state of the art — trained in about **twelve hours**. Previous top models needed weeks and orders of magnitude more compute. Remember the parallelism problem [Person 1] showed you? This is that problem, solved. Better results, at a **fraction** of the cost.
>
> And that combination — better *and* cheaper *and* scalable — is why this paper didn't just win a benchmark. It started an era.
>
> **[CLICK: "Legacy timeline" — animates from 2017 to today]**
>
> - **2018** — **BERT** takes the encoder half and transforms language understanding; it's soon inside Google Search.
> - **2018–2020** — **GPT-1, 2, 3** take the decoder half and just scale it up. GPT stands for Generative **Pre-trained Transformer** — the T is this paper.
> - **2020** — Vision Transformers show it works on images too. Later, **AlphaFold** uses attention to solve protein folding.
> - **2022** — **ChatGPT**. A Transformer decoder, scaled up, talking to a hundred million people.
> - **Today** — GPT, Gemini, Claude, Llama — essentially every frontier AI model is still, at its core, the architecture on this slide.
>
> Seven years later, we're still living inside this one idea. Eight authors bet everything on a single mechanism and put the claim right in the title.
>
> Turns out — attention really was all you need.
>
> Thank you. We're happy to take questions — and the simulation is open, so if you want to see any part again, just ask.

---

## BONUS — Live Model Demo (Q&A only, Slide 6)

> Not part of the timed 12 minutes — only pull this up if there's time left or someone asks "does this actually work, for real, right now?"

### [SLIDE 6 — Live Model Demo]

> Everything so far was a *toy* — small hand-picked numbers so the mechanism is easy to see. This last slide is not a toy. It's a real 6-layer, 12-head Transformer encoder (a MiniLM, in the BERT family) running **live in your browser**, computing genuine learned attention weights on whatever sentence you type.
>
> **[CLICK: type a sentence — reuse "The animal didn't cross the street because it was too tired," or take one from the audience]**
>
> **[CLICK: "Run real model" — one-time ~91MB download the first time, then instant on every re-run]**
>
> **[CLICK: layer buttons L1–L6, then the head dropdown — click different tokens to move the focus]**
>
> Same arcs, same heatmap you saw on Slide 3 — except now it's not us choosing the numbers. Every layer and every head looks a little different because each one really did learn something different during training, exactly like [Person 3] described. If a real sentence from the audience produces messy or surprising arcs, that's honest — real attention is noisier than our clean teaching example, and that's worth saying out loud.

**[HANDOFF]**
> That's the whole talk — from "why not RNNs" to the actual weights inside a real network, live, on your words. Happy to keep taking questions.

---

## Quick-reference: cue sheet

| # | Speaker | Slide | Interactions in order |
|---|---------|-------|----------------------|
| 1 | Person 1 | 1, 2 | Play RNN → Play Transformer |
| 2 | Person 2 | 3 | Click "it" → toggle tired/wide → Show the math |
| 3 | Person 3 | 4 | Head 1 → Head 2 → Positional Encoding tab → Full Architecture tab → Mask toggle |
| 4 | Person 4 | 5 | Show results → Training cost → Legacy timeline |
| Bonus | Any / Q&A | 6 | Type sentence → Run real model → switch layers/heads → click tokens |

## Rehearsal notes

- Target 2:45 per person spoken; the pauses and clicks absorb the rest.
- Whoever drives the laptop: advance slides only on `[SLIDE N]` cues; presenters can drive their own interactions or nominate one driver.
- If running long, the cuttable lines are: Person 1's opening hands-poll, Person 3's second head demo, Person 4's AlphaFold bullet.
- If asked "why √d_k" or "how are Q/K/V learned" in Q&A: they're linear projections (learned weight matrices) applied to each word's embedding; scaling keeps dot products in softmax's sensitive range.
- Slide 6 (live model demo) needs internet the first time it runs (~91MB one-time model download); only pull it up in Q&A, never during the timed 12 minutes. If offline or the download fails, skip it — slides 1–5 don't depend on it.
