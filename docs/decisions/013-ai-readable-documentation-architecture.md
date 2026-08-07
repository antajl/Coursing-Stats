# ADR-013: AI-Readable Documentation Architecture

## Status
Accepted

## Navigation update (2026-08-06)

Current agent documentation is **`docs/MAP.md` + `docs/sheets/` + `docs/decisions/`**.  
The 2026-08-05 `canonical/` / `working/` / `wiki/` layout described below was later collapsed into sheets; treat migration lists as historical.

## Date
2026-08-05

## Context

The CoursingStats project had significant documentation redundancy and structure issues:
- 4 duplicate AI guide files across different locations
- 4 duplicate Git instruction files
- 2 duplicate security documentation files
- 3 data architecture files scattered across locations
- 3 shows documentation files with overlapping content
- Reorganization proposal and summary files mixed with active documentation
- No AI-optimized navigation or semantic indexing
- ADR system existed but lacked AI-optimized entry points

The documentation structure was human-centric and not optimized for AI agent consumption, making it difficult for AI agents to:
- Find relevant documentation quickly
- Understand project-specific terminology
- Navigate semantic relationships between documents
- Distinguish between canonical and temporary documentation
- Follow AI-optimized writing principles

## Decision

Implement an AI-Readable documentation architecture based on reopt Handbook principles:

### 1. Directory Structure
```
docs/
├── manifest.yaml              # AI-Readable configuration
├── index/                     # Semantic navigation
│   ├── topics.yaml           # Topic-based document index
│   ├── glossary.yaml         # Project terminology
│   ├── relations.yaml        # Document relationships
│   └── status.yaml           # Document status tracking
├── canonical/                 # Permanent documentation
│   ├── architecture/         # High-level architecture
│   ├── decisions/            # Architecture Decision Records (ADRs)
│   ├── api/                  # API contracts and reference
│   ├── guides/               # Step-by-step guides
│   └── rules/                # Project rules and conventions
├── working/                   # Temporary documentation
│   ├── analysis/             # Current investigations
│   ├── proposals/            # Future decisions under discussion
│   └── tasks/                # Short-term task tracking
├── wiki/                      # Auto-generated technical reference
├── site/                      # Site documentation (existing)
└── bot/                       # Bot documentation (existing)
```

### 2. AI-Readable Writing Rules
- **Structure:** Use frontmatter with metadata (lastmod, confidence, related_docs)
- **Density:** Maximize project-specific insight per consumed token
- **Declarative:** Use specific constraints, not recommendations
- **Navigable:** Link to related documents via index/relations.yaml
- **Executable:** Define completion criteria for procedures

### 3. Confidence Levels
- **stable:** Canonical documentation, single source of truth
- **review:** Validated but may need updates
- **draft:** Work in progress, not yet validated

### 4. AI Entry Points
- **Primary:** AGENTS.md (root file, redesigned for AI optimization)
- **Manifest:** docs/manifest.yaml (identity and rules)
- **Navigation:** docs/index/topics.yaml (semantic discovery)
- **Glossary:** docs/index/glossary.yaml (terminology)
- **Relations:** docs/index/relations.yaml (document relationships)

### 5. Content Consolidation
- **AI Guides:** 4 files → 1 canonical (docs/canonical/rules/AGENTS.md)
- **Git Instructions:** 4 files → 1 canonical (docs/canonical/rules/GIT-WORKFLOW.md)
- **Security:** 2 files → 1 canonical (docs/sheets/10-security.md)
- **Data Architecture:** 3 files → canonical locations
- **Shows:** 3 files → canonical locations
- **Reorganization files:** Moved to docs/working/proposals/

### 6. MCP Integration
- Integrate Codebase Memory MCP for semantic code search
- Document knowledge graph usage in docs/canonical/architecture/KNOWLEDGE-GRAPH.md
- Provide reindex triggers and best practices

### 7. Automation
- Document validation and quality checks in docs/canonical/rules/DOCUMENTATION-AUTOMATION.md
- Define quality gates for documentation changes
- Establish maintenance schedule (quarterly, monthly, as needed)

## Alternatives Considered

### Option 1: Keep existing structure
- **Pros:** No migration effort, familiar to humans
- **Cons:** Redundant content, no AI optimization, difficult navigation
- **Rejected:** AI agent productivity significantly impacted by poor documentation structure

### Option 2: Minimal reorganization
- **Pros:** Less effort than full reorganization
- **Cons:** Still has redundancy, no AI-optimized navigation
- **Rejected:** Doesn't address core AI agent issues

### Option 3: External documentation platform
- **Pros:** Professional documentation hosting
- **Cons:** External dependency, harder to maintain, not Git-native
- **Rejected:** Documentation should live in repo with code for version control

## Consequences

### Positive
- AI agents can navigate documentation efficiently using semantic search
- Single source of truth for each topic eliminates confusion
- Clear distinction between canonical and temporary documentation
- AI-optimized entry points improve agent productivity
- Automated validation ensures documentation quality
- Migration tracking in relations.yaml prevents lost knowledge

### Negative
- Migration effort required to consolidate content
- Team needs to learn new documentation structure
- Some breaking changes in documentation paths
- Need to maintain index/ YAML files alongside documentation

### Neutral
- Existing site/ and bot/ documentation preserved (not redundant)
- Wiki documentation remains auto-generated
- ADR system enhanced but structure unchanged

## Migration Tracking

All migrations tracked in docs/index/relations.yaml:

### Completed Migrations
- docs/00-AI-GUIDE.md → docs/canonical/rules/AGENTS.md (deleted)
- docs/bot/00-AI-GUIDE.md → docs/canonical/rules/AGENTS.md (deleted)
- docs/ai/AGENTS.md → docs/canonical/rules/AGENTS.md (deleted)
- docs/ai/CLAUDE.md → docs/canonical/rules/AGENTS.md (deleted)
- docs/git/* → docs/canonical/rules/GIT-WORKFLOW.md (deleted)
- docs/SECURITY-* → docs/sheets/10-security.md (deleted)
- docs/sheets/02-data-pipeline.md → docs/sheets/02-data-pipeline.md
- docs/sheets/04-shows.md → docs/sheets/04-shows.md
- docs/sheets/04-shows.md → docs/sheets/04-shows.md (deleted duplicate)
- docs/DOCS-REORGANIZATION-* → docs/working/proposals/
- docs/site/05-API-REFERENCE.md → docs/canonical/api/API-REFERENCE.md
- docs/00-AI-IMPROVEMENTS.md → docs/working/analysis/00-AI-IMPROVEMENTS.md
- docs/00-QUICK-START.md → docs/canonical/rules/00-QUICK-START.md
- docs/IMPLEMENTATION-SUMMARY.md → docs/working/analysis/IMPLEMENTATION-SUMMARY.md
- docs/ai/SKILL-SELECTION.md → docs/canonical/rules/SKILL-SELECTION.md
- docs/ai/TELEGRAM_BOT_BEST_PRACTICES_2026.md → docs/working/analysis/TELEGRAM_BOT_BEST_PRACTICES_2026.md
- docs/ai/ → directory removed (content migrated)

## Done When Criteria

- [x] manifest.yaml created with AI-Readable configuration
- [x] index/ structure created (topics.yaml, glossary.yaml, relations.yaml, status.yaml)
- [x] canonical/ and working/ directories established
- [x] Content consolidation completed (AI guides, Git, security, data, shows)
- [x] Reorganization files moved to working/proposals/
- [x] README files deduplicated and updated
- [x] Root AGENTS.md redesigned for AI optimization
- [x] API reference moved to canonical/api/
- [x] ADR system verified (12 ADRs in canonical/decisions/)
- [x] Knowledge graph integration documented
- [x] Documentation automation documented
- [x] Maintenance schedule established
- [x] ADR-013 created documenting this decision

## Related Documentation

**Current (2026-08-06):**
- docs/MAP.md — agent router
- docs/sheets/ — cheatsheets 00–12
- docs/decisions/ — ADRs (this file)
- AGENTS.md — root entry

**Historical (2026-08-05 layout, removed):**
- docs/canonical/*, docs/working/*, docs/wiki/*, docs/site/*, docs/bot/* (see git history)

**Related ADRs:**
- ADR-001: Cloudflare Pages hosting (infrastructure foundation)
- ADR-002: React Query for data fetching (data fetching pattern)
- ADR-003: SQLite + JSON indexes (data architecture foundation)
