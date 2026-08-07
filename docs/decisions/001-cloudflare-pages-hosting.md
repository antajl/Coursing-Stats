# ADR-001: Cloudflare Pages Hosting

**Status:** Accepted  
**Date:** 2025-01-01  
**Context:** Initial architecture decision

## Context

Coursing Stats needed a hosting solution for the frontend that provides:
- Global CDN for fast worldwide access
- Simple deployment workflow
- SSL/HTTPS by default
- Support for React/Vite applications
- Cost-effective solution for a hobby project

## Decision

**Chose Cloudflare Pages** for frontend hosting over alternatives like Vercel, Netlify, or traditional VPS.

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
