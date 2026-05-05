# Product Assessment: StellarFlux
**Date:** 2026-05-05  
**Scope:** Full 5-area assessment  
**Mode:** Guided  
**Assessor:** Design Engineer Plugin — ux-full-review

---

## Assessment Summary

- **Product:** StellarFlux — thematic risk monitoring platform for Autonomy Capital
- **Primary user:** Risk analysts (buy-side, experienced, high domain fluency)
- **Core job:** Catch risk before it becomes a loss — early warning system
- **Areas assessed:** All 5 (User Behaviors, Bias Audit, Delightful Journeys, Communicate Decisions, Ethical & Humane)
- **Overall readiness:** Needs work on trust mechanics and exit experience
- **Prior deliverables referenced:** None — this is the first formal design assessment

---

## Action Plan — Prioritized

### Priority 1: Fix Now (Trust & Reliability)

These three issues could cause a bad decision or erode analyst trust in the system.

**1. Move pipeline run status above the action queue in morning brief**
- *Problem:* Run summary (themes ran, feeds completed) is shown last. Analysts act on KILL signals before knowing if the data was complete.
- *Risk:* Analyst makes a high-stakes call on a signal from a partial pipeline run.
- *Fix:* Show a compact pipeline status indicator above the action queue — "6/6 themes ran · Last run 02:14 · All feeds healthy." Conditionally show a warning banner if any theme or feed failed.
- *Skill:* Implement directly — layout change in `OverviewContent.tsx`

**2. Add severity context to alert detail panel**
- *Problem:* Alerts show raw z-scores and sigma deviations with no frame of reference. "2.3σ" has no meaning without a baseline.
- *Risk:* Analysts can't calibrate urgency from the number alone, leading to either over-reaction or under-reaction.
- *Fix:* Add a single context line: "2.3σ — above 2.0σ threshold · Highest reading in 30 days." Pull from historical data or set a static threshold annotation.
- *Skill:* Implement directly — detail panel in `AlertsClient.tsx`

**3. Add post-acted timestamp confirmation**
- *Problem:* After marking an alert as `acted`, there is no visual confirmation that the decision was logged. The state just changes.
- *Risk:* Analysts feel unconfirmed; accountability model has no proof-of-work moment.
- *Fix:* After clicking "Mark Acted," show a brief inline confirmation: "Acted · Logged 09:14 AM" with the local timestamp. This is immutable — no undo on `acted`.
- *Skill:* Implement directly — state machine in `AlertsClient.tsx`

---

### Priority 2: Fix Soon (UX & Workflow Quality)

These improve the daily experience but don't block reliable use.

**4. Specify sort order within filtered alert views**
- *Problem:* Alerts within "Action Required" are grouped by Today/Yesterday, with no specified secondary sort. A critical alert could sit below a warning-level alert that fired earlier.
- *Fix:* Within each date group, sort by severity (critical → warning → info), then by time descending. Make this explicit in the filter header: "Sorted by severity."
- *Skill:* Implement directly — sort logic in `AlertsClient.tsx`

**5. Design the "all clear" morning brief empty state**
- *Problem:* If there's nothing in the action queue, it's unclear whether that means "all clear" or "something broke." A blank section creates anxiety.
- *Fix:* Design a deliberate empty state with a confidence signal: "No actions required · All 6 themes ran cleanly overnight · Last run 02:14." Visually distinct from a loading or error state.
- *Skill:* Implement directly — conditional render in `OverviewContent.tsx`

**6. Add trend context to morning brief action items**
- *Problem:* The action queue shows a KILL signal but not whether the risk has been building for days or appeared overnight. These require very different responses.
- *Fix:* Add a trend tag to each action item: "Building since Mon" or "Overnight spike" or "Crossed threshold 3x this week." This can be derived from the alert history.
- *Skill:* Implement directly — morning brief action card component

---

### Priority 3: Roadmap (Growth & Scale)

These become important as the team or tool scope expands.

**7. Signal dispute mechanism**
- *Problem:* Analysts can acknowledge and act, but cannot disagree with a signal. As trust in the system grows, there's no feedback loop for incorrect signals.
- *Fix:* Add a "Flag this signal" action to the detail panel — distinct from acknowledge/act — that logs analyst disagreement without closing the alert. Feed this back to the pipeline team.
- *Why now-ish:* If a systematic calibration error occurs, this is the only mechanism to catch it before it compounds.

**8. Theme-level filtering in alerts**
- *Problem:* All analysts see all alerts across all 6 themes. In a multi-analyst team, each analyst may own specific themes.
- *Fix:* Add theme filter chips to the alert feed. Default to "All" but let analysts set a personal default.
- *When:* When team size > 1 analyst

**9. Historical performance metrics**
- *Problem:* No way to evaluate whether StellarFlux is working — how many signals were caught early vs. late, average time-to-act, which themes produce the most actionable signals.
- *Fix:* Add a simple analytics layer — even a weekly digest email or an internal "How we did" card on Friday's morning brief.
- *When:* Before any internal review or ROI conversation with leadership

**10. User interviews — validate behavioral assumptions**
- *Problem:* The entire product is built on inferred analyst behavior (catching risk is the job, morning brief as entry point, trust in quantitative signals). None of this has been validated with real analyst sessions.
- *Fix:* Run 3–5 contextual interviews with analysts (30 min, task-based, observe morning routine). Use `ux-behavior-mapping` and `ux-story-panels` skills to structure the output.
- *When:* Before scaling beyond the current team or adding features

---

## Area Status Summary

| Area | Status | Key Gap |
|------|--------|---------|
| 1. User Behaviors | Inferred — not validated | No user interviews; behavioral model is assumed |
| 2. Bias Audit | Partial — 3 structural issues | Run status placement, sort order, post-acted closure |
| 3. Delightful Journeys | Entry strong, exit weak | No closure after "acted"; trust gap at the Jump |
| 4. Communicate Decisions | Analyst-ready, stakeholder-blind | Vocabulary and depth correct for analysts; opaque above |
| 5. Ethics | Watchpoints identified | Data completeness visibility; no signal dispute mechanism |

---

## Recommended Next Skill

Run `ux-behavior-mapping` after the first analyst interview session to formalize the behavioral model. For development work, implement Priority 1 items directly — they require no additional research.

---

*Assessment saved by Design Engineer Plugin · ux-full-review · 2026-05-05*
