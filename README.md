# Blanchet Lab website

This repository contains the static replacement for [joseblanchet.com](https://joseblanchet.com). It is designed to run without WordPress, a database, or a paid maintenance contract.

## What is automated

- GitHub Pages deploys every validated change to `main`.
- Publications synchronize weekly from Jose Blanchet's ORCID record and are enriched with OpenAlex metadata.
- Publication updates are tested before they are committed or deployed.
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

## Domain cutover

The first deployment uses the temporary GitHub Pages project address. Do not add a `CNAME` file or change DNS until the preview has been reviewed. At cutover, remove the `/joseblanchet.com` base path from the deployment workflow, set the production site URL to `https://joseblanchet.com`, add `public/CNAME`, and then update DNS at GoDaddy.
