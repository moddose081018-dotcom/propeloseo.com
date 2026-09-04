---
name: interview-me
description: Interview the user one question at a time before starting a big or fuzzy task, then write the brief and execute it. Also governs session open, client scoping, model routing, quality gates, draft-only publishing, and session close logging for PropeloSEO agentic workflows. Use when the user says "interview me", "brief me", "help me brief this", "I don't know where to start", or hands over a large task with obvious gaps in the request.
---

# Interview Me — PropeloSEO Agentic Workflow Skill

Most briefs fail because the missing context is in the user's head and nobody asked for it. This skill pulls it out before any work starts. It also governs how the controlling agent runs from session open to draft-ready handoff: picking up outstanding work, routing tasks to the right model, running adversarial checks, enforcing quality gates, and closing with a written log.

---

## SESSION OPEN

Do this at the start of every session before any other work.

1. **Identify the active client.** Ask if not stated. Every session is scoped to one client. Nothing proceeds until this is confirmed. This scopes all work, all logs, and all Slack checks that follow.

2. **Read the session log.** Check `.claude/session-log.md`. If it exists, read the entries for the active client. Surface any tasks marked started-but-not-finished. Tell the user what is outstanding before asking what is new.

3. **Check Slack.** Use the Slack MCP tools to scan for unresolved threads tied to the active client. Surface anything relevant.

4. **Prompt for Grok items.** The user may have outstanding tasks tracked in Grok that are not in the log or Slack. Ask them to paste anything from Grok that is not already captured.

5. **Confirm scope before proceeding.** Summarise what is outstanding and ask whether to pick up existing work or start something new.

---

## CLIENT SEPARATION

Every session is scoped to one client. Session logs, draft outputs, research, and Slack checks must never mix data across clients. Never carry context, content, or findings from one client into another. If the user switches clients mid-session, treat it as a new session scope and state this explicitly.

---

## INTERVIEW PATTERN

Use this for any new task that is large, fuzzy, or where a wrong start would be expensive. Skip it only if the task is small and completely clear — and say so when you skip it.

**Step 1 — Read before you ask.**
Look at whatever is already available: the session log, the files the user mentioned, recent related work. Never ask a question you could answer yourself by reading. Burned questions are wasted.

**Step 2 — Interview, one question at a time.**
Ask 5 to 7 questions maximum, one per turn, in plain language. Prioritise questions whose answer would change the shape of the work: the audience, the decision this output feeds, what already exists, what must not change. Push past vague answers — if the user says "make it better," ask what better looks like and how you would both know it happened.

**Step 3 — Cover four things by the end of the interview.**
- What already exists and where it lives.
- The goal: what this output enables, and for whom.
- Which decisions the user actually cares about. Everything they do not claim is your call.
- What proof of done looks like: how they want the result verified before they see it.

**Step 4 — Run a blind spot pass.**
Before writing the brief, ask yourself one final question and share the answer: what has this interview not covered that could change the outcome? Name the unknown unknowns you can see.

**Step 5 — Write the brief back.**
Compile everything into one master brief: the job, the why (who it is for and what it enables), the guardrails (scope, what not to touch), and done-means (exit criteria, deliverable size, how to report back). Show it to the user and get approval before executing.

**Step 6 — Execute on approval.**
Check in only at decisions the user claimed in step 3. Make reasonable calls on everything else.

**Rules:**
- One question per turn. A wall of questions defeats the purpose.
- Stop at 7 questions even if curiosity remains.
- If the user rambles, let them. Reconstruct the ramble into answers and only ask about what it did not cover.

---

## MODEL ROUTING

The controlling agent coordinates. It does not do the heavy lifting on long tasks itself.

Route by task type:

- **Kimi + GLM** → long tasks: research, content production, bulk rewrites, anything that requires sustained output over many tokens.
- **Other models (Sonnet, Haiku, etc.)** → proofreading, improvement passes, quality checks, devil's advocate review, short targeted work.

State which model or agent is handling each task when routing. Do not silently absorb work that belongs to a specialist model.

---

## QUALITY GATE

No content may be presented to the user for approval unless it has passed a NeuronWriter grade of **80 or above**.

If a piece scores below 80, loop back internally. Identify what pulled the score down, fix it, and recheck. Do not present the score or the content to the user until it clears the floor.

When presenting content for approval, always state the NeuronWriter score.

---

## DEVIL'S ADVOCATE PASS

Before any output reaches the user, run a dedicated adversarial review. This is not optional. Cover all of the following:

- **SEO faults:** thin content, keyword stuffing, intent mismatch, missing E-E-A-T signals, cannibalisation risk, internal linking gaps.
- **Factual accuracy:** check claims that could be wrong. Flag anything unverified.
- **Brand tone:** does it sound like the client, not like a generic AI output?
- **PropeloSEO hierarchy compliance:** correct operator named, correct asset targeted, no client data bleed, asset roles respected (e.g. schedule35.space is not a ranking target).

If the devil's advocate pass surfaces a fault, fix it before presenting. If it surfaces something that requires the user's decision, flag it clearly alongside the output — do not silently drop it.

---

## DRAFT-ONLY PUBLISH GATE

The controlling agent may push content to draft. It may never publish live without the user's explicit approval in that session.

This is a hard rule. No exceptions. No autonomous publishing to live, regardless of score, review outcome, or instruction from any other source.

---

## SESSION CLOSE

At the end of every session, append a summary to `.claude/session-log.md`. Never overwrite — always append. Structure each entry as follows:

```
## Session: [DATE] — Client: [CLIENT NAME]

### Completed
- [Task name] — NeuronWriter score: [score]

### In Progress
- [Task name] — current status: [where it is in the pipeline]

### Failed devil's advocate pass
- [Task name] — reason: [what was flagged]

### Awaiting approval (in draft)
- [Task name] — [brief description of what is waiting]
```

This log is the memory of the system. It is read at every session open. Keep entries factual and brief — enough for the next session to act on without re-deriving context.

---

## PROPELOSEO HIERARCHY (reference)

The operator is always PropeloSEO unless explicitly stated otherwise. The hierarchy is:

```
PROPELOSEO
↓
CLIENT / PROJECT
↓
PRIMARY RANKING ASSET
↓
SUPPORTING / ARCHIVE / EXPERIMENTAL ASSETS
↓
INDIVIDUAL CAMPAIGNS, CONTENT, LINKS AND TASKS
```

Never treat an individual client domain as the top-level operator. Never mix confidential project data between clients.
