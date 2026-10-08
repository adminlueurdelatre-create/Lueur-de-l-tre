# Lueur de l’Âtre — V8 Production

Deze versie is voorbereid op een echte website met Supabase.

## Wat werkt
- Publieke website leest menu, openingsuren, foto's en contactgegevens uit Supabase.
- Eigenaar logt in via Supabase Auth.
- Alleen `admin.lueurdelatre@gmail.com` mag CMS-gegevens wijzigen via RLS.
- Menu, prijzen, beschrijvingen, vegetarisch, allergenen en publicatie worden beheerd vanuit Owner Dashboard.
- Openingsuren en uitzonderlijke sluitingen worden beheerd vanuit Owner Dashboard.
- Foto's worden geüpload naar Supabase Storage.
- Reservatieaanvragen worden rechtstreeks opgeslagen in `reservations`.
- Status van reservaties kan door de eigenaar worden gewijzigd.
- Publieke website valt terug op demo-inhoud als Supabase tijdelijk niet bereikbaar is.

## Eenmalige Supabase stap
1. Open Supabase → SQL Editor.
2. Open `supabase-production.sql` uit deze zip.
3. Run het volledige bestand.
4. Controleer in Authentication → Users dat `admin.lueurdelatre@gmail.com` bestaat.
5. Gebruik het wachtwoord van dat account om in te loggen via `/admin/`.

## Belangrijk
`config.js` bevat alleen de browser-veilige publishable key. Zet NOOIT een `sb_secret_...` of service-role key in de website.

## Website publiceren
Alle bestanden kunnen op een statische host zoals GitHub Pages, Netlify of Vercel worden gezet. De map `admin/` geeft de eigenaar een nette `/admin/` URL.

## Domein
Koppel later `lueurdelatre.be` aan de gekozen host. Supabase blijft de backend voor database, authenticatie en foto's.
