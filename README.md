# Lueur de l’Âtre — V9

Deze versie is voorbereid voor GitHub Pages + Supabase.

## Bestandsstructuur
- `index.html` — publieke website
- `admin/index.html` — eigenaar/admin-dashboard
- `admin.html` — dezelfde admin als losse pagina (compatibiliteit)
- `admin.css` / `admin.js` — admin styling en logica
- `config.js` — Supabase project URL + publishable key
- `script.js` / `style.css` — publieke website
- `supabase-production.sql` — productie-RLS/database script

## GitHub Pages
Gebruik in GitHub: Settings → Pages → Deploy from a branch → `main` → `/ (root)`.

Upload de INHOUD van deze map naar de repository-root. De map `admin` moet als map behouden blijven.

Na publicatie:
- Website: `https://<github-gebruikersnaam>.github.io/<repository>/`
- Admin: `https://<github-gebruikersnaam>.github.io/<repository>/admin/`

## Supabase
Voer `supabase-production.sql` uit in Supabase SQL Editor. Gebruik nooit een `sb_secret_...` of service-role key in de browser.

Admin-login: het Supabase-gebruikersaccount dat in `admin.js` als eigenaar is ingesteld.
