# Broncodeherstel

## Receptlinks, eigen accounts en collecties — 20 november 2026

Uitbreiding voorbereid op `fix/collections-private-recipe-sharing-20261120`; database-addities toegepast en gecontroleerd. WhatsApp deelt nu een MBD-appreceptlink met fotometadata; eigen accounts/een-recept-deellinks zijn gescheiden van de bestaande openbare hoofdcatalogus. Collecties wissen achtergebleven zoekfilters met behoud van allergieën. Socialcontroles vereisen bewuste opslag en bewijs van verwijdering; geen automatische bronwijzigingen. Actuele catalogus: 702, alle bestaande recepten/nummers te behouden. Todoist-kwartaalherinnering vanaf 1 januari 2027 aangemaakt; ChatGPT-limiet verhinderde een extra ChatGPT-taak. Publicatie en productiebrowserverificatie volgen hieronder na uitvoering. Details: `docs/recipe-links-and-accounts-20261120.md`. Deze linkdeling vervangt het eerdere volledige WhatsApp-tekstconcept.


## WhatsApp delen gepubliceerd — 19 november 2026

Productie `798665b` / READY `dpl_GZ5uHtxPmkwa1LCCQ8b9ST6UZdYo`, dezelfde receptenapp. Delen via WhatsApp op receptkaart, details en weekmenu maakt een volledig tekstconcept met social vóór website. Geen contactkeuze of automatische verzending; privévelden blijven weg. Mobiele actierij loopt nu over meerdere regels. 36 unit-/routetests, TypeScript en zes productie-browsercontroles op desktop/telefoonformaat geslaagd, inclusief openen van een afgevangen WhatsApp-conceptlink. Geen echte berichten verstuurd of fysieke WhatsApp-app getest. Alle 700 catalogusrecords vóór/na identiek. PR #6; zie `docs/whatsapp-sharing-20261119.md`.

## 129 van 134 sociallinks hersteld — 19 november 2026

Alle 134 onderzocht; 122 oorspronkelijke links uit Stashcook-exports plus 7 bestaande Notion-inhoudsbronnen hersteld, inclusief MDB-0323. Vijf open: 0675/0676 (originele screenshot/schermopname nodig), 0687/0688/0689 (screenshots niet opgeslagen, Notion 404). Catalogussynchronisatie bewaart nu beide bronsoorten. Productie `7a737a4` / READY `dpl_DkMY2VkY27zRjeANrd4mGx5e4rts`; PR #5. 700 nummers/recepten behouden, uitsluitend 129 ontbrekende linkvelden aangevuld; foto’s/ingrediënten/porties/bestaande bronvelden en 12 reserveringen ongewijzigd. Herladen en echte live synchronisatie van de 129 links getest op desktop en telefoonformaat. Bij 0323 blijft inhoudelijke vergelijking van social (12 cups) en website (24 cups) open. Details en herstelback-up: `docs/social-source-recovery-20261119.md`. Oudere meldingen hieronder dat de social van 0323 niet gevonden is, zijn achterhaald.

## Bronlinks en socialvolgorde hersteld — 19 november 2026

Productie `b977018` / `dpl_9LN9MTe7gmtqQetdyz56uUk9Es1Y` READY in dezelfde app. Weekmenukeuzes, zoekresultaten, bibliotheek en receptdetails tonen sociallinks eerst en websites apart; Recept bekijken wijzigt de planning niet. MDB-0323 heeft geen bekende exacte social-URL, ook niet in het historische bronregister: zichtbaar als ontbrekend, geen URL verzonnen. Alle 700 catalogusrecords volledig ongewijzigd. Details: `docs/weekmenu-source-links-20261119.md`.

## Actuele weekmenu-uitbreiding — 19 november 2026

Productie `86395d3`, READY-deployment `dpl_B1oK4hqJXAQktZmVwMCYk8wHBq9b`. Categorieën, persoonlijke sterrenfilters en veilige portieomrekening live getest op desktop en telefoonformaat. Recept 0323 blijft 24 cups; geen automatische interpretatie als personen. Alle 700 catalogusrecords ongewijzigd. Zie `docs/weekmenu-filters-portions-20261119.md` voor back-up, rollback, tests en beperkingen.

## Actuele opslagreparatie — 19 november 2026

Productie is `a35abee` / `dpl_HgL5U26wuu4Rka2yTCYfEoCBAhdJ`. De gerichte claimroute herstelt de twee eerder openstaande opslagrisico's. Tien echte geïsoleerde PostgreSQL-integratietests, 28 unit-/routetests, 14 browserregressies en beide productie-browsertests slagen. Alle 700 catalogusrecords, 12 reserveringen en drie databasefuncties blijven ongewijzigd. Geen migratie of rotatie. Zie `docs/atomic-save-recovery-20261119.md`; oudere blokkade- en TODO-statussen hieronder zijn historisch.

## Nieuwe actuele uitbreiding — 16 november 2026

Bronnen & QR-controle is gepubliceerd in de bestaande receptenapp, productiecommit `d37e75f`, deployment `dpl_BzapRZdWdExPR4yA3ZUtm2aWaQVd`. Volledige gegevensinventarisatie, lokale controleopslag, back-up/rollback en onderscheid tussen geslaagde lokale integratietests en geblokkeerde rechtstreekse productie-browsertest staan in `docs/source-qr-workspace-20261116.md`. Alle 689 catalogusrecords en bestaande MDB-nummers zijn ongewijzigd. Oudere bronherstelvermeldingen hieronder zijn historisch.

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
- Laatste functionele afbouwcode is nieuwer dan de eerder gedocumenteerde herstelstatus; zie `PROJECT_STATUS.md` onder “LAATSTE FUNCTIONELE AFBOUWRONDE — 28-10-2026 · v36”.
- De tijdelijke 13e API-route veroorzaakte één previewfout door Vercels Hobby-limiet van maximaal 12 serverfuncties. Dit is opgelost: de foto-koppeling zit nu in `/api/notion/photo` en de extra route is verwijderd; actuele routecount is 12. De gerepareerde head kan nu alleen nog niet opnieuw worden gebouwd door de aparte Vercel Hobby-daglimiet (>100 deployments/24 uur).
- Geen oude productie- of previewdeployment promoveren als vervanging voor de huidige branch-head; eerst de actuele head bouwen en testen zodra het quotum vrij is.
