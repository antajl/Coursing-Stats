/**
 * Pure helpers for SEO prerender (Phase B).
 * Clone Vite SPA shell → path-specific HTML with real meta + crawlable #root body.
 *
 * Modularized into:
 *  - html-shell.ts (DOM/meta shell manipulations, 404, neutral SPA)
 *  - entities/hub-seo.ts (Hub pages, FAQ, Guide, Schema.org)
 *  - entities/dog-seo.ts (Dog profile meta and HTML)
 *  - entities/event-seo.ts (Competition, Exhibition, Donino meta)
 *  - entities/judge-seo.ts (Sport & Show Judges meta)
 */

export * from './html-shell.js'
export * from './entities/hub-seo.js'
export * from './entities/dog-seo.js'
export * from './entities/event-seo.js'
export * from './entities/judge-seo.js'
