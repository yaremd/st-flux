# Project Map

Living file tree of the project. Format per entry:
`path – description (≤10 words) | when to read`

Folders under `.design-engineer-plugin/design/` are created on-demand by the
skill that writes its first deliverable there. Add entries below as folders
appear; remove entries if a folder is deleted.

## .design-engineer-plugin/design/ (lazy – populated as skills run)
- foundation/ – core product definition deliverables | read at pipeline start
- research/ – research findings and analysis | read before positioning
- planning/ – MVP requirements and information architecture | read before design and dev
- exploration/ – bias audit, journey, references, story panels, image manifests | read before prototyping
- psychology/ – psychology audit results | read during design review
- reviews/ – design reviews and assessments | read for quality history
- dev/ – development preparation | read before dev phase
- features/ – per-feature spec dirs (post-launch features) | read when iterating

## .design-engineer-plugin/prototype/ (committed; HTML prototypes)
- storyboard.html, prototype.html, landing-page.html, prototype-notes.md | read before dev

## .design-engineer-plugin/plans/ (committed; implementation plans)
- <YYYY-MM-DD>-<slug>.md – active implementation plan | read by hooks
- archive/ – completed plans | reference history

## .design-engineer-plugin/temporary/ (GITIGNORED; auto-purged at phase boundaries)
- scratch/ – general throwaway | safe to delete anytime
- playwright/ – Playwright debug captures | safe to delete anytime
- intermediate/ – prep work + exploratory drafts | safe to delete anytime

## Project Root
- .design-engineer-plugin/config.yaml – plugin config and resume state | read by /design-engineer:launch
- .design-engineer-plugin/dependencies.yaml – deliverable dependency graph | read by hooks automatically
- .claude/agent-memory/design-engineer-compound-documenter/ – cross-session pipeline state (Anthropic-managed) | read for resume context
