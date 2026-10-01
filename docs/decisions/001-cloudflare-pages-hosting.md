# ADR-001: Frontend Hosting Evolution (Cloudflare Pages → Yandex Object Storage)

**Status:** Superseded  
**Date:** 2025-01-01  
**Updated:** 2026-10-01  
**Current Production:** Yandex Object Storage (`https://storage.yandexcloud.net`) via GitHub Actions `deploy.yml`  
**Context:** Infrastructure hosting decision

## Context

CoursingStats needed a reliable static hosting and CDN solution for the frontend with:
- Fast access from Russia without VPN blocks
- Simple deployment workflow from Git
- SSL/HTTPS by default
- Cost-effective solution for a static React/Vite application

## Current Architecture (2026-10-01)

The production frontend and `/data/v1/` CDN are deployed to **Yandex Object Storage** (S3 compatible) via GitHub Actions (`.github/workflows/deploy.yml`). This ensures 100% reliable accessibility within Russia and fast CDN delivery for JSON data files.

## Initial Decision (Historical)

Initially, **Cloudflare Pages** was chosen for frontend hosting. Cloudflare Workers continue to be used exclusively for the Telegram bot (`@coursing_stats_bot`).

### Rationale

**Cloudflare Pages Advantages:**
- Free tier with generous limits
- Built-in global CDN (200+ locations)
- Automatic SSL certificates
- Direct Git integration
- Preview deployments
- Edge functions support
- Simple configuration
- Fast build times

**Rejected Alternatives:**
- **Vercel:** More expensive, overkill for this use case
- **Netlify:** Similar to Cloudflare but less intuitive UI
- **VPS:** Too much maintenance overhead for a hobby project
- **GitHub Pages:** Limited build options, no preview deployments

## Consequences

### Positive
- Free hosting with global CDN
- Simple deployment via Git push
- Preview environments for testing
- Fast worldwide performance
- Zero maintenance overhead

### Negative
- Limited to static sites (no server-side rendering)
- Build time limits on free tier
- Some advanced features require paid plan

### Implementation
- Frontend built with Vite
- Automatic deployment on push to `main` branch
- Preview deployments for pull requests
- Custom domain: coursing-stats.ru

## References

- Cloudflare Pages documentation: https://developers.cloudflare.com/pages/
- CI/CD rules: .devin/rules/ci-cd-rules.mdc
