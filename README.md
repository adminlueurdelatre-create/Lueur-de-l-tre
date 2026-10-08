# Lueur de l’Âtre — Website V3 Premium

Open `index.html` in a browser to preview the site.

## Included
- Luxury French restaurant visual direction
- LDA monogram treatment
- Real Pexels concept photography
- Animated ember/fire details
- Scroll reveal animations
- Responsive mobile navigation
- Luxury menu cards, vegetarian option and allergen section
- Reservation form placeholder

## Important
The restaurant address, telephone, opening hours and final menu prices are intentionally placeholders until the real business details are known.

The photography is concept imagery from Pexels. Replace it with your own professional restaurant photography when Lueur de l’Âtre opens.


## V4 WOW entrance
De homepage opent met een cinematografische intro voor Lueur de l’Âtre:
- LDA-monogram verschijnt vanuit een warme vuur-gloed
- elegante licht- en emberanimaties
- slogan en naam verschijnen stap voor stap
- knop “Entrer dans la maison”
- intro wordt na één bezoek per browsersessie onthouden
- `prefers-reduced-motion` wordt gerespecteerd


## V6 — Live booking ready
The reservation UI is designed to accept a real booking provider/widget. The current demo safely falls back to a prepared email request because a provider account and restaurant-specific booking ID are required for genuine real-time availability. The UI includes date, party size, time-slot selection, guest details, dietary preferences and special requests.


# V7 Owner CMS

V7 adds `admin.html` + `admin.css` + `admin.js` and a production-oriented `supabase.sql`.

## Owner features
- Owner login screen
- Dashboard overview
- Menu and prices
- Opening hours
- Special closures
- Photo gallery upload UI
- Reservation management
- Contact details
- Supabase configuration screen

## Important security note
The included login is a local demonstration only. Do NOT use a client-side password as production authentication. For production, create the owner account in Supabase Auth and connect the UI to Supabase using the publishable key. Supabase Auth provides JWT-based authentication and integrates with Row Level Security; Storage also supports RLS policies. Never expose a service/secret key in the browser.

## Production setup
1. Create a Supabase project.
2. Create your owner account in Authentication.
3. Run `supabase.sql` in the SQL Editor.
4. Copy `config.example.js` to `config.js` and add your project URL + publishable key.
5. Connect `admin.js` to `@supabase/supabase-js` for Auth/CRUD/Storage.
6. Replace the demo localStorage data with database calls.
