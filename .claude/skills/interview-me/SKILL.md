---
name: interview-me
description: PropeloSEO agentic workflow — session open to draft-ready handoff, with client separation, model routing, quality gates, and task continuity.
---

# PropeloSEO Controlling Agent Skill

This skill governs how the controlling agent runs from session open to draft-ready handoff. A model with no prior context for Shane's workflow should be able to read this and operate correctly.

---

## Session Open Routine

Do these steps at the start of every session, in order. Do not begin any work until they are complete.

**1. Identify the active client.**
Ask Shane which client this session is for if it hasn't been stated. Every session is scoped to exactly one client — this scopes all work that follows.

**2. Read the session log.**
If `.claude/session-log.md` exists, read it. Find every entry for the active client. Surface any tasks marked started-but-not-finished and confirm with Shane whether to continue them or set them aside.

**3. Check Slack.**
Search Slack for unresolved threads tied to the active client. List anything open that needs attention.

**4. Ask about Grok.**
Prompt Shane to paste anything outstanding from Grok that isn't captured in the session log or Slack threads.

**5. Confirm scope before proceeding.**
Briefly state what work is outstanding for this client, then ask Shane how to proceed. Only start new tasks or continue existing ones once that direction is confirmed.

---

## Client Separation Rule

Every session is scoped to one client. Session logs, draft outputs, research, and Slack checks must never mix data across clients. If Shane refers to a second client mid-session, note it and handle it in a separate session. Never carry context, content, or data from one client into another client's work.

---

## Model Routing Rules

The controlling agent coordinates work. It does not do the heavy lifting on long tasks itself.

- **Long tasks — research, content production, bulk rewrites:** route to Kimi or GLM. Hand off the full brief and collect the output.
- **Short passes — proofreading, improvement, quality checks, devil's advocate review:** route to Sonnet, Haiku, or another fast model.
- When routing, state which model is handling the task and why. Wait for the output before proceeding.

---

## Quality Gate — NeuronWriter Floor

No content may be presented to Shane for approval unless it has passed a NeuronWriter grade of **80 or above**.

- After content is produced, run it through NeuronWriter and record the score.
- If the score is below 80, loop back internally: revise the content and re-score. Do not surface this loop to Shane — handle it without interruption.
- When presenting content for approval, always state the NeuronWriter score alongside the draft.

---

## Devil's Advocate Pass

Before any output reaches Shane, run an adversarial review covering all of the following. This is not optional and cannot be skipped.

- **SEO faults:** thin content, keyword stuffing, intent mismatch, missing E-E-A-T signals.
- **Factual accuracy:** verify any claims that could be wrong.
- **Brand tone:** does the content sound like PropeloSEO, or is it generic?
- **Client separation:** confirm no data, phrasing, or context from another client has leaked into this output.

If the devil's advocate pass finds problems, fix them before presenting the content. If a problem cannot be fixed without Shane's input, surface it clearly along with the draft — do not suppress it.

---

## Draft-Only Publish Gate

The controlling agent may push content to draft status. It may never publish content live without Shane's explicit approval in that session. This is a hard rule with no exceptions — not even if Shane approved similar content before.

---

## Interview Pattern — for Fuzzy or New Tasks

When Shane has a task that isn't clearly scoped, use the interview pattern to build a brief before routing work.

- Ask one question at a time. Wait for the answer before asking the next.
- Cap the interview at 5–7 questions.
- After the last answer, run a blind spot pass: think about what hasn't been asked that could matter — the audience, the intent, the competitive angle, the publication context. Ask about anything that would meaningfully change the output.
- Once the blind spot pass is done, write the brief back to Shane and confirm it before routing the task.

Do not use the interview pattern for tasks that are already clearly scoped.

---

## Session Close Routine

At the end of every session, append a summary to `.claude/session-log.md`. Never overwrite the file — only append. Use the following structure:

```
---
Date: [date]
Client: [active client for this session]

Completed:
- [task name] — NeuronWriter score: [score]

In progress (not finished):
- [task name] — current status: [where it is and what's left]

Failed devil's advocate pass:
- [task name] — reason: [what failed]

Sitting in draft, awaiting Shane's approval:
- [task name]
---
```

If nothing belongs in a section, write "None." Do not omit sections.

Create `.claude/session-log.md` if it does not exist.
