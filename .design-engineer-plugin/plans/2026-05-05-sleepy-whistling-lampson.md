# Design Engineer Plugin – Setup Complete, Begin Review

## Context

The user invoked `/design-engineer:launch` on the StellarFlux project (existing TypeScript/Next.js codebase, 18 shipped components). They chose:
- **Goal**: Review my project
- **Mode**: Guided

## What was set up

- `.design-engineer-plugin/config.yaml` created with project_type=existing, mode=guided, goal=review
- Plugin folder scaffolded: `.design-engineer-plugin/memory/`, `plans/`, `prototype/`, `temporary/`
- `.gitignore` updated with plugin artifact patterns
- No off-repo references (user confirmed repo is the full picture)

## Next: Run ux-full-review skill (guided mode)

The `ux-full-review` skill runs a 5-area Product Assessment Checklist:

1. **Understand User Behaviors** – empathy, motivations, abilities, prompts, story
2. **Find the Gaps (Bias Audit)** – Identify, Analyze, Design, Document
3. **Create Delightful Journeys** – journey element analysis
4. **Communicate Product Decisions** – business alignment, stakeholder story
5. **Create Ethical and Humane Products** – Regret Test, Black Mirror Test, Humane Principles

### Execution plan (ux-full-review Step 0)

1. Announce the 8-step execution plan to the user
2. Ask if user is familiar with the Product Assessment Checklist (conditional teaching)
3. Step 1: Ask assessment scope (full / specific area / pre-launch / post-launch audit)
4. Step 2: Gather context (product name, target user, value prop, existing docs)
5. Steps 3–7: Work through each area one at a time in guided mode — present findings, wait for user input
6. Step 8: Ask output format preference, save report to `.design-engineer-plugin/design/reviews/product-assessment.md`

### Key files

- Skill instructions: `/Users/yarem/.claude/plugins/cache/design-engineer-plugin/design-engineer/6.0.0/skills/ux-full-review/SKILL.md`
- Config: `.design-engineer-plugin/config.yaml`
- Output target: `.design-engineer-plugin/design/reviews/product-assessment.md`

## Verification

After the review is complete, the file `.design-engineer-plugin/design/reviews/product-assessment.md` should exist with the full assessment. The user reviews findings area by area (guided mode) before the report is finalized.
