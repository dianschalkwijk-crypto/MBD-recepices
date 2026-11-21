# Herstel oorspronkelijke collecties — 21 november 2026

De opdracht was één AH-collectie toe te voegen voor nieuwe AH-imports. De uitbreiding ging te ver: alle opgeslagen labels werden collectieknoppen (ook automatisch opgeslagen sociallabels en trefwoorden) en zes oudere recepten kregen een AH-boekrelatie. Dit herstel draait die neveneffecten terug.

- De oorspronkelijke vaste themacollecties, HelloFresh en de eerder gevraagde actieve-tijdsfilters blijven; alleen AH komt erbij. Geen automatische nieuwe knoppen uit bronplatform, trefwoorden, lijstjes of kookboekdelen. Dit geldt ook voor het weekmenufilter.
- Geen AH-detectie meer uit oude bronlinks of alleen boeknamen. AH gebruikt de expliciete nieuwe AH-importmetadata. Alle bestaande themalidmaatschappen blijven intact.
- De oude browsercode die Instagram/Insta/TikTok/Pinterest automatisch in receptcollecties schreef, is uitgeschakeld. Bestaande opgeslagen labels worden niet massaal verwijderd, maar veroorzaken geen knoppen.
- Zes oudere boekrelaties hersteld uit de oorspronkelijke back-up: MDB-0164 Gezin 2, 0230 Borrel 4, 0232 Easy oven / traybake 9, 0271 en 0275 Pasta 20, 0307 Vegetarisch 11. In Supabase én de eerder gemigreerde Notion-pagina's. MDB-0709 blijft in AH-boek 41. Boektellingen teruggelezen en bijgewerkt.
- Een gerichte herstelmarkering werkt oude lokale AH-boekkopieën bij. Een afwijkende, bewust gekozen lokale boeknaam wordt behouden. De in de catalogus verouderde Notion-link van 0232 verwijst naar een reeds apart gehouden duplicaat; het herstel gebruikt de op MDB-ID geverifieerde actieve pagina. De duplicaatpagina kreeg dezelfde oorspronkelijke boek-9-relatie, zonder inhoud/MDB-ID te wijzigen.

Back-up vóór herstel: `/workspace/scratch/mbd-before-category-restore-20261121.bundle`, volledige catalogus `mbd-before-category-restore-20261121.json`, Notion-relaties `mbd-before-category-restore-notion-20261121.json`; exact herstelplan `mbd-category-restore-plan-20261121.json`. Oudere inhoudsback-up `mbd-before-ah-books-catalog-20261121.json` bepaalt de oorspronkelijke boekvelden.

Datavergelijking: 704 records behouden. De overige 698 records exact ongewijzigd. Bij de zes herstelde recepten is het volledige recept exact gelijk aan vóór de AH-boekverplaatsing, plus uitsluitend een gerichte boekherstelmarkering. Alle collectielijsten, ingrediënten, stappen, foto's, bronlinks en MDB-nummers zijn ongewijzigd. Geen nieuwe nummers gereserveerd of recepten geïmporteerd.

Validatie: TypeScript, 54 unit-/routetests en 52 lokale browsercontroles op desktop en telefoonformaat geslaagd. Oude browserboekkopieën worden hersteld, afwijkende bewuste lokale boekkeuzes behouden, themalidmaatschappen na herladen intact, uitsluitend oorspronkelijke vaste knoppen + AH + drie eerder gevraagde tijdsfilters. Productiecontrole volgt na publicatie.
