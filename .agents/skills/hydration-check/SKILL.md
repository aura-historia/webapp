---
name: hydration-check
description: Check if changes made affect hydration in any way
---

# Hydration check

Use this skill whenever work affects components that adhere to user preferences or language settings

## Pre-rendering

- pre-rendering should only be enabled for pages that serve >90% static content, disable it otherwise
- if pre-rendering is enabled, defer any dynamic content to the client
- if any user preferences are used - except language – defer rendering of this (sub)-component to the client to avoid hydration errors
- keep the list of pre-rendered pages updated after adding new pages

## Verification

- since our page is hosted on cloudflare, verify that hydration works on wrangler environments
- use wrangler dev --remote to test hydration effectively
- things working on the dev server are not guaranteed to also work on wrangler
