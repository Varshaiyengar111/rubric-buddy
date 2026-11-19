# Rubric Buddy

**Mark written answers faster and more consistently, with the teacher always in charge of the final mark.**

### ▶ [Try the online demo](https://varshaiyengar111.github.io/rubric-buddy/)
No install needed. It shows the built-in example and never calls the AI.

A small AI product prototype in edtech. A teacher pastes their own rubric and a student's answer. The AI checks each rubric point, quotes the words in the answer it relied on, suggests marks, and drafts short feedback. The teacher adjusts the marks and edits the feedback.

> Portfolio demo. The example question, rubric and answer are made up.

---

## The problem

Correcting long answers is one of the most time-consuming parts of teaching. A teacher with 4 sections of 40 students can face 160 answer scripts per test. Marking gets less consistent as the pile grows, and students usually get a number with little feedback on *what* to improve.

## Who it's for

| User | What they need |
|---|---|
| **Teacher** (primary): marks written answers in science, social science or language | Faster, consistent marking against their own rubric |
| **Student**: receives the mark | Specific feedback: one thing done well, one thing to improve |
| **Parent / school**: sees results | Marks that are fair and explainable |

## Scope (v0.1)

**In scope**
- Teacher pastes the question, their rubric, and one student answer (typed)
- For each rubric point: met / partly met / not met, a quote from the answer as evidence, suggested marks, and a note when the AI is unsure
- **Evidence check**: plain code (not AI) confirms every quote really appears in the student's answer; if not, it's flagged
- **Totals check**: code re-adds the marks so the total is always right
- Teacher edits marks (total updates live) and feedback, then copies the feedback
- Free demo mode; live AI mode with an API key

**Out of scope (for now)**
- Scanning handwritten scripts
- Marking a whole class at once
- Storing student names, marks or answers (nothing is saved)
- Auto-sending marks to students or parents

## Product decisions

- **Teacher's rubric, teacher's decision.** The AI never invents criteria and never finalises a mark. Its marks appear in editable boxes, and the total is labelled "your decision".
- **Show the evidence.** Every judgement comes with the student's own words, so the teacher can agree or disagree in seconds instead of re-reading the whole answer.
- **Say when unsure.** Borderline cases ("says 'air' but not carbon dioxide") are surfaced as notes for the teacher rather than silently scored.
- **Understanding over spelling.** By default the AI ignores spelling and grammar unless the rubric asks for it, which is fairer to students writing in a second language.

## Success metrics

| Metric | Target for a pilot | How to measure |
|---|---|---|
| Time per answer | 50% faster than marking by hand | Timed sample of 20 answers each way |
| Agreement with teacher | AI suggestion within ±0.5 marks of teacher's final mark on ≥ 85% of criteria | Compare suggested vs final marks |
| Evidence accuracy | ≥ 99% of quotes found in the answer | The built-in evidence check |
| Feedback used | ≥ 60% of feedback copied with light or no edits | Edit distance between draft and copied text |
| Consistency | Lower spread in marks for similar answers vs hand marking | Re-mark test with paired answers |

**Guardrail metric:** cases where the AI was more than 1 mark away from the teacher, reviewed weekly for bias (for example against answers in simpler English).

## Try the demo

You need [Node.js](https://nodejs.org) 20.12 or newer.

```bash
npm install
npm start
```

Open http://localhost:3003, click **Use example**, then **Suggest marks**. Change a mark and watch the total update.

- **Demo mode (free):** with no key, it shows a pre-made example.
- **Live AI mode:** copy `.env.example` to `.env`, paste an [Anthropic API key](https://console.anthropic.com) after `ANTHROPIC_API_KEY=`, and restart. The key stays on the server and is never sent to the browser. `.env` is in `.gitignore`, so it is never uploaded.

**Online demo:** the version on GitHub Pages is built from the `public` page with `npm run build:pages`, which saves the built-in example into `docs/`. It has no server and no key, so it never calls the AI.

## How it works

```
Browser page  ──POST /api/run──▶  server.js  ──▶  Claude (structured JSON)
     ▲                              │
     └── suggestions + checks ◀─────┘   (evidence and totals checks run here, without AI)
```

- `task.js`: the instructions given to the AI, the output format, the checks and the demo example
- `server.js`: a tiny Node server with no framework; keeps the key server-side
- `public/index.html`: the whole user interface in one file

## What I'd do next

1. **Batch mode**: upload a class's answers as a spreadsheet and mark them in one pass, with a "most uncertain first" review queue.
2. **Handwriting**: photo of an answer script as input.
3. **Calibration**: teacher marks 5 answers first; the AI uses them as examples to match that teacher's standard.
4. **Bias audit**: compare AI-vs-teacher gaps across answer length and language level before any wider rollout.
5. **Class insights**: which rubric points most students missed, to guide re-teaching.
