# Mandatory Research — Compensation Platform Landscape

Analysis of the reference platforms named in the brief, done before implementation
to inform which features CompIntel should prioritize.

## Key observations

**Levels.fyi** (primary reference) is built around the core principle the brief
calls out explicitly: *levels matter more than job titles*. Its strongest asset is
a normalized level-mapping across companies (e.g. Google L5 ≈ Meta E5 ≈ Amazon
SDE-3) so comparisons are apples-to-apples instead of comparing raw, inconsistent
job titles. Its UI leans heavily on large sortable/filterable tables and per-company
pages with a level-by-level compensation curve chart. This is the single biggest
idea CompIntel borrows: `LevelBand` is a first-class field in the schema, separate
from the company-specific label (`levelLabel`), specifically so cross-company
comparison logic never has to parse or guess at title strings.

**6figr** targets the Indian market specifically (unlike Levels.fyi, which is
US-centric) and self-reported data skews toward Indian tech hubs — Bangalore,
Hyderabad, Pune, Gurgaon. It also splits compensation into base/bonus/stock rather
than a single number, which more accurately reflects how Indian tech comp is
structured (stock valuation matters a lot at senior+ levels). CompIntel's dataset
schema mirrors this three-way split.

**AmbitionBox** trades comparison precision for breadth — it covers far more
companies (including non-tech) but with much thinner data per company, and no
strong level-normalization layer, so its numbers are harder to compare across
companies with different title conventions.

**Glassdoor** is the broadest and most title-driven of the four — searchable by
raw job title rather than level, which is exactly the failure mode the brief
identifies ("this is NOT a salary listing website... levels matter more than job
titles"). It was useful mainly as a negative example: a large flat listing without
a normalization layer is easy to browse but hard to actually compare on.

## Feature comparison sheet

| Feature | Levels.fyi | 6figr | AmbitionBox | Glassdoor | Build? |
|---|---|---|---|---|---|
| Level-normalized comparison (not just titles) | Yes — core feature | Partial | No | No | **Yes** — `LevelBand` schema field |
| Searchable/filterable salary table | Yes | Yes | Yes | Yes | **Yes** — `/` explorer |
| Company detail page with level breakdown | Yes | Partial | Yes (thin) | Yes (thin) | **Yes** — `/companies/[slug]` |
| Side-by-side company comparison | Limited | No | No | No | **Yes** — `/compare` |
| Base/bonus/stock split (not one number) | Yes | Yes | No | Partial | **Yes** — dataset schema |
| India-specific location filtering | No | Yes | Yes | Partial | **Yes** — location filter |
| Visual comp-by-level chart | Yes | No | No | No | **Yes** — `BarChart` on company + compare pages |
| Company name deduplication/normalization | Yes (curated) | Unclear | No (visible dupes) | No (visible dupes) | **Yes** — `normalizeCompanyName()` |
| Authentication/user accounts | Yes | Yes | Yes | Yes | **No** — out of scope for this MVP; not requested for Track B frontend, and adding it would dilute focus on the comparison/normalization features that are actually being evaluated |
| Salary submission form | Yes | Yes | Yes | Yes | **No** — same reasoning; the brief provides a generated dataset rather than requiring live ingestion UI |
| Reviews / culture ratings | No | Partial | Yes | Yes | **No** — out of scope, not a compensation-comparison feature |

## Decision

Built 4 features extremely well rather than attempting all of the above shallowly,
per the brief's explicit instruction ("we care more about clean architecture,
reliable systems, extensibility... than excessive features"):

1. **Compensation Explorer** — searchable, filterable, sortable, paginated table
2. **Company pages** — aggregate stats + level-by-level breakdown chart
3. **Compare tool** — 2–3 company side-by-side, including per-level averages
4. **Data normalization layer** — canonical company names, default-to-zero for
   missing bonus/stock, level-band standardization — the thing every reference
   platform except Levels.fyi visibly gets wrong
