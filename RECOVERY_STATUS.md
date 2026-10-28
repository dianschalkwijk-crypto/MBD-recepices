# Broncodeherstel

Brondeployment: dpl_FCb3R9KJiaRnDFYdstAc1f2TmSoK.

## Actuele status — 27 oktober 2026

Alle 55 oorspronkelijke bronpaden zijn nu vertegenwoordigd op branch `recovery/vercel-2026-10-22`.

- De 46 eerder herstelde statische/configuratiebestanden zijn vanuit de immutable Vercel-deployment teruggehaald; voor de eerder gecontroleerde statische bestanden kwamen de SHA-1 hashes overeen met de Vercel-bronlijst.
- De negen oorspronkelijk ontbrekende serverpaden zijn nu allemaal aanwezig:
  - `api/admin/normalize-recipes.ts`
  - `api/notion/books.ts`
  - `api/notion/catalog.ts`
  - `api/notion/full.ts`
  - `api/notion/health.ts`
  - `api/notion/photo.ts`
  - `api/notion/save.ts`
  - `api/recipes/import.ts`
  - `api/recipes/source.ts`

## Herkomst serverbestanden

De Vercel-connector kapt de broninhoud van serverbestanden af. Daarom geldt niet voor alle negen dat ze byte-voor-byte identiek aan de oude deployment zijn.

- `api/recipes/import.ts`: eerder volledig hersteld en aanwezig.
- `api/notion/full.ts`, `health.ts`, `photo.ts`, `save.ts`: opnieuw opgebouwd en functioneel getest tegen de recovery-preview en huidige Notion/Supabase-data.
- `api/notion/books.ts` en `catalog.ts`: opnieuw opgebouwd uit de zichtbare oude bronprefix plus het live antwoordcontract van de originele deployment. Recovery-preview geeft HTTP 200 en dezelfde veldstructuur/live data.
- `api/recipes/source.ts`: opnieuw opgebouwd uit de vrijwel volledige oude bronprefix, met dezelfde social-host allowlist en veilige fetchbeperkingen. Build en methodecontract gecontroleerd; succesvolle externe POST-fetch is nog niet afzonderlijk end-to-end bewezen.
- `api/admin/normalize-recipes.ts`: veilig opnieuw opgebouwd. De oude hardcoded beheersleutel is bewust niet teruggezet. De route vereist nu `MBD_NORMALIZE_KEY` uit de serveromgeving en blijft uitgeschakeld zolang die niet is geconfigureerd. Er is geen frontend-afhankelijkheid van deze route gevonden.

## Belangrijk

“Alle 55 paden aanwezig” betekent niet dat ieder gereconstrueerd serverbestand byte-identiek is aan de oude bron. Functionele tests en het centrale `PROJECT_STATUS.md` zijn leidend voor de releasebeslissing. Productie is nog niet vanuit deze recovery-branch gepromoveerd.

## Functionele servertests afgerond — 27 oktober 2026
- `api/recipes/source.ts`: externe toegestane bron-fetch in preview succesvol getest (HTTP 200).
- `api/admin/normalize-recipes.ts`: echte OpenAI-normalisatie in preview succesvol getest (HTTP 200) na verwijderen van niet-ondersteunde `temperature: 0` voor GPT-5.6 Luna.
- Tijdelijke selftest-logica is weer verwijderd; schone preview bouwt READY en beide routes hebben weer hun normale methodebeveiliging.


## Afbakening na herstel — 28 oktober 2026
- Broncodeherstel zelf niet opnieuw uitvoeren: de huidige werkzaamheden zijn functionele UX-/veiligheidsafbouw op dezelfde recovery-branch.
- Laatste functionele afbouwcode is nieuwer dan de eerder gedocumenteerde herstelstatus; zie `PROJECT_STATUS.md` onder “LAATSTE FUNCTIONELE AFBOUWRONDE — 28-10-2026 · v35”.
- De tijdelijke 13e API-route veroorzaakte één previewfout door Vercels Hobby-limiet van maximaal 12 serverfuncties. Dit is opgelost: de foto-koppeling zit nu in `/api/notion/photo` en de extra route is verwijderd; actuele routecount is 12. De gerepareerde head kan nu alleen nog niet opnieuw worden gebouwd door de aparte Vercel Hobby-daglimiet (>100 deployments/24 uur).
- Geen oude productie- of previewdeployment promoveren als vervanging voor de huidige branch-head; eerst de actuele head bouwen en testen zodra het quotum vrij is.
