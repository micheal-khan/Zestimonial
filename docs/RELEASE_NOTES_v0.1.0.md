## Zestimonial v0.1.0

The first public release. Zestimonial is an open source workspace to collect, review, publish and export client testimonials.

### Highlights
- **Collect** with a shareable form or personal email requests. Reminders follow up automatically after 3 and 7 days.
- **Review** every response. Claude picks a verbatim highlight and topic tags, and the highlight is dropped if it is not literally in the client's words.
- **Publish** with six widget layouts and a one-line embed, or a public Wall of Love page.
- **Export** social images for Instagram, LinkedIn/X and Stories, plus print-ready PDF cards.
- Dashboard with command palette, notifications and dark mode.

### Getting started
```bash
git clone https://github.com/micheal-khan/Zestimonial.git
cd Zestimonial
npm install
cp .env.example .env.local
npm run dev
```
Apply the SQL in `supabase/migrations/` before first run. Full setup is in the [README](https://github.com/micheal-khan/Zestimonial#getting-started).

**Requires** Node 22.13 or newer, a Supabase project, and optionally Resend and Anthropic API keys.

Full changelog: [CHANGELOG.md](https://github.com/micheal-khan/Zestimonial/blob/main/CHANGELOG.md)
