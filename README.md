# CompIntel

CompIntel is a compensation comparison platform built around one principle:
levels matter more than job titles. It provides a searchable compensation
explorer, company profiles, and a side-by-side comparison tool.

## Quick start

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

Useful checks:

```bash
npm run lint
npm run build
```

The app uses a deterministic in-memory dataset, so no environment variables or
database are required.

## Routes

- `/` - Searchable, filterable, sortable compensation explorer.
- `/companies` - Company directory with aggregate compensation data.
- `/companies/[slug]` - Company detail page with level breakdowns and reports.
- `/compare` - Compare two or three companies across compensation metrics.

The API routes under `/api` expose filtered compensation entries, company
aggregates, company details, and comparison data.

## Architecture

```text
src/
	app/          Next.js pages and API routes
	components/   Explorer, comparison, cards, and charts
	lib/          Dataset, query, and formatting helpers
	types/        Shared compensation domain types
```

Data is generated in `src/lib/data.ts`, normalized once, and served through
thin API routes. Query parsing, filtering, sorting, and pagination live in
`src/lib/query.ts`, keeping UI components independent of the data source.

## Data model

Each compensation entry retains the original company level label while also
using a standardized level band such as Entry, Mid, Senior, Staff, or
Principal. Cross-company comparisons aggregate by the standardized band.
Bonus and stock values default to zero, and total compensation is calculated
once when entries are generated.

See [RESEARCH.md](./RESEARCH.md) for the research and feature comparison that
informed the implementation.

