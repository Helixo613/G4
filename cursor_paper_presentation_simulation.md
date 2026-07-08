# Paper presentation simulation
_Exported on 7/8/2026 at 12:30:43 GMT+5:30 from Cursor (3.9.16)_

---

**User**

I have to present the paper attention is all you need today  along wioth 3 people so total 4 people, we are thinking of presenting the paper via a simulation, like we create a simulation on the web and explain the paper via that simulation, the website for simultion will contain everything from who are the authors to everything, like how a paper is presented via a ppt we want to combine a ppt and a simulation to get the final thing, which can act as our sole source in presenting, along with it i will require a script on what each person will say in presenting the paper. 


can you help me generate a prompt i can give to codex to build something like this using all the skills like they are mentioned in the @AGENTS.md  file. 

Also determine what part what agent will do, we have 2 tasks at hand,
1) Making teh simultion
2) Making the sciript
3) Testing the simulation

We have 2 agents you and codex, i would prefer codex doing the coding, but its upto you on what is better 

---

**Cursor**

Task split clear in my head: Codex codes simulation site, I write presentation script + test simulation in browser after. Before locking plan + writing the Codex prompt, need 2 things only you know — they change script timing and site structure heavily.

**Presentation basics**

> **How long is the presentation? Script per person depends entirely on this.**
> - 10-15 minutes (~3 min/person) ✔
> - 15-20 minutes (~5 min/person)
> - 20-30 minutes (~7 min/person)
> - 30+ minutes (deep dive)

> **Who's the audience? Changes how deep the script and simulation go into math (softmax, QKV matrices, positional encoding formulas).**
> - Classmates / peers, mixed ML familiarity (Recommended) ✔
> - Technical audience — knows ML, wants depth
> - Professors / evaluators grading rigor

10-15 min, peer audience. Enough to lock the plan.

---

**User**

Implement the plan as specified, it is attached for your reference. Do NOT edit the plan file itself.

To-do's from the plan have already been created. Do not create them again. Mark them as in_progress as you work, starting with the first one. Don't stop until you have completed all the to-dos.

---

**Cursor**

Plan approved. Starting todo 1 — writing the presenter script first since the Codex prompt's slide spec must match it exactly.

Script done. Now the Codex prompt — every interaction named in the script becomes a hard requirement in the build spec, so the two can't drift apart.

Both deliverables done. Ball now in your court — run Codex.

**Changed**
- `presentation/SCRIPT.md` — full 4-person script, ~2:45 spoken per person, every line written out. [CLICK] cues, handoff lines, cue-sheet table, rehearsal notes (what to cut if running long, Q&A backup answers).
- `presentation/CODEX_PROMPT.md` — complete build spec for Codex. Vite + React, 5 slides, offline, dark projector theme, arrow-key nav. Every script cue is a hard requirement in its acceptance checklist, so site and script can't drift. Embeds AGENTS.md discipline: frontend-design skill, refero MCP, `rtk`, verification-before-completion, caveman final summary, no extra deps.

**Validated**
- Script cue sheet ↔ prompt slide spec cross-checked manually, 1:1 match. Paper facts verified against paper (8 authors, equal-contribution footnote, BLEU 28.4 / 41.8, 3.5 days / 8 GPUs).
- Nothing runnable yet — no code exists until Codex builds.

**Issues**
- None.

**Next**
1. Paste contents of `presentation/CODEX_PROMPT.md` into Codex. Tell it nothing else — file is self-contained, points it at SCRIPT.md.
2. When Codex says done, come back and say "test it" — I'll start the dev server, click through every cue in the browser, screenshot each slide, fix what's broken, and sync the script if any control names changed.

