# Blanchet Lab website

This repository contains the static replacement for [joseblanchet.com](https://joseblanchet.com). It is designed to run without WordPress, a database, or a paid maintenance contract.

## What is automated

- GitHub Pages deploys every validated change to `main`.
- Publications synchronize weekly from Jose Blanchet's ORCID record and are enriched with OpenAlex metadata.
- Publication updates are tested before they are committed or deployed.
- A daily health check verifies the current domain, replacement site, publication catalog, and sharing image.
- Dependabot proposes dependency and GitHub Actions updates each week.

## Local checks

```bash
npm ci
npm test
npm run build
node scripts/verify-static.mjs
```

## Publication source

The synchronizer uses ORCID `0000-0001-5895-0912` as the authoritative author record. It preserves the prior valid dataset if an upstream service is temporarily incomplete, rejects implausibly small results, and de-duplicates records by DOI and normalized title.

## Production domain

The production site is published at `https://joseblanchet.com` through the tested GitHub Pages workflow. The apex domain points to GitHub Pages, and `www.joseblanchet.com` points directly to `realjblanchet.github.io`; GitHub redirects the `www` variant to the canonical apex domain. The downloaded WordPress package is retained separately as a rollback archive.
