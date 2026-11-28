# Publication discovery and reporting-register workflow

## Authority and purpose

This contract is maintained in the NSF_Grant_Reports project at contracts/publication-intake-workflow.md. The website repository carries a matching copy at docs/publication-intake-workflow.md. Update both copies when the workflow changes. This is the operational handoff, not a second paper list.

- Website catalog: discovery and public bibliographic metadata, maintained by realjblanchet/joseblanchet.com.
- Private grant-review feed: machine-readable discovery, official NSF relationships, and reminders, maintained by realjblanchet/blanchet-grant-register. Its award links are evidence inputs, not final reporting assignments.
- Reporting authority: /Users/jblanche/Documents/NSF_Grant_Reports/portfolio/product-ledger.json, including allocation_review.next_cycle_queue.
- Single working sheet: /Users/jblanche/Documents/NSF_Grant_Reports/outputs/publication-register/Publication Register.xlsx. It is generated from the ledger, with guarded import of the PI's edits.
- Individual report input and submission-response records control the exact sponsor text and verified submission state.

## Automated handoff

1. The website's scheduled/manual publication synchronizer collects and validates its complete source catalog before publishing data/publications.json. Failed or partial fetches must not replace valid catalog data.
2. The private weekly review consumes that catalog. Its machine-readable audit includes the complete catalog and all current/prior-calendar-year records, including papers already linked to awards. The reminder's unlinked subset is separate. Do not truncate these data arrays to a display limit.
3. The Codex publication-intake reviewer runs every six hours in the NSF_Grant_Reports context. This is polling, not an instantaneous GitHub event. It checks both source updates and workflow failures; only changed source content needs another reconciliation. Direct catalog intake covers a manual website update that has not yet reached the private weekly audit. Local automated execution requires the Codex host to be available and authenticated to GitHub.
4. Save the exact source snapshot, timestamp, hash, record counts, reconciliation, reviewed decisions, and application receipt under portfolio/staging/grant-register/. These are evidence snapshots, not independent queues.
5. Reconcile every recent source row against BOTH canonical products and pending next-cycle candidates. Match stable DOI/arXiv identifiers and recorded aliases first, then titles and source URLs. A changed title or publication DOI may represent an existing paper. Verify ambiguous identities against author and primary publisher/arXiv records; never merge merely related papers.
6. A reviewed application plan names every unresolved source record, its disposition and evidence, and the exact ledger/source hashes. Apply only after checking for pending spreadsheet edits. Import valid PI edits first; conflicting edits stop application without overwriting either version.
7. Link verified versions to existing products, retaining identifiers and evidence. Do not downgrade a published/accepted record because an upstream source still calls it a preprint. Add genuinely new discoveries once to the canonical next-cycle queue under the PI's standing future-cycle direction. A queue row is discovery intake, not proof of funding acknowledgment or a grant allocation.
8. Preserve settled grant assignments, prior-report history, explicit carryovers, exclusions, and current report selections. Funding, substantive period work, grant fit and sponsor eligibility require their own evidence. No automatic sponsor submission, grant reassignment, or inferred acknowledgment.
9. Validate the ledger, rebuild the SAME workbook, verify counts and representative rendering, and record successful completion. Reapplying a source/decision must not duplicate entries. A ledger/source hash conflict requires fresh reconciliation.

## Routine commands

Run from /Users/jblanche/Documents/NSF_Grant_Reports:

    python3 scripts/sync_publication_register.py check
    python3 scripts/import_grant_register_feed.py
    python3 scripts/import_grant_register_feed.py --website-catalog

Inspect the resulting reconciliation and primary evidence. Produce the reviewed plan described by scripts/apply_publication_intake.py; consult its --help for the application command. Never blindly promote the importer's new-candidate label.

After reviewed application:

    python3 scripts/validate_portfolio.py portfolio/product-ledger.json --mode draft
    /Users/jblanche/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node scripts/build_publication_register.mjs
    python3 scripts/sync_publication_register.py check

## Scope and freshness

Routine discovery covers the current and previous calendar years without an item cap. The full career catalog remains available for catch-up and older publication-version checks; it is not automatically copied wholesale into an annual-report inventory. Neither a successful workflow nor a fresh timestamp proves a new scientific product or correct funding attribution.

Report separate counts for source records, existing products, queued candidates, verified version updates, unresolved identities and new candidates. Track source freshness independently from the last successful register application. If coverage validation, authentication, source collection or workbook synchronization fails, report the exact blocked stage and retain the last valid state.

## Historical files

Old Word/Scholar lists, allocation workbooks, merged ledgers and dated reviews are historical/source evidence. They cannot override the canonical ledger's later decisions. Clearly mark superseded human-readable summaries; keep evidence and source identifiers intact rather than deleting them.
