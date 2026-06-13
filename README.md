# Is It Vaulted?

A lightweight single-page app for Warframe players to quickly check whether Prime items are currently vaulted or unvaulted. Data is scraped from the Warframe wiki at build time and auto-updated weekly via GitHub Actions.

## Tech Stack

- **Vue 3** (Composition API, `<script setup>`)
- **Vite 8**
- **Fuse.js** – client-side fuzzy search
- **Cheerio** – build-time wiki scraping
- **GitHub Actions** – weekly auto-deploy
