# Vervolgcontrole MadeByDian — 19 november 2026

## Actuele versie, zonder onnodige release

Productie is nog `d37e75f` / `dpl_BzapRZdWdExPR4yA3ZUtm2aWaQVd`, READY. Preview `51d9f68` / `dpl_9HwTHEqZJgG52rGgzEZoZPBgTPGa` is eveneens READY. Het verschil betreft uitsluitend PROJECT_STATUS.md, RECOVERY_STATUS.md en het verificatieverslag. Geen nieuwere runtimecorrectie gemist; geen reden om dezelfde app opnieuw te publiceren.

PR #2 staat open, niet als concept, mergebaar. Geen reviewinzendingen of reviewthreads; de Vercel-check op 51d9f68 is success. PR #1 blijft afzonderlijk concept op 1faa588 en is niet mee gepubliceerd.

## Huidige database versus de historische 689

De actuele Supabase-catalogus bevat **700 records**, exact gelijk aan de volledige live catalogus-API. Alle 689 volledige records uit de gecontroleerde back-up van 16 november zijn nog aanwezig en ongewijzigd, inclusief bijgewerkte tijdstempels, receptinhoud, fotoverwijzingen, bronvelden en MDB-sleutels. Elf Fit Piggy-recepten, MDB-0695 t/m MDB-0705, zijn op 17 november toegevoegd. Deze ronde voegt niets toe en zet die toevoegingen niet terug.

De catalogus bevat nog 18 quarantainerecords. 55 records hebben geen van de bestaande bronverwijzingen; dit is iets anders dan een nog niet bevestigde exacte oorspronkelijke URL. Accountrecepten en databaseconcepten blijven nul; de bestaande reserveringentabel bevat nu twaalf rijen, consistent met de elf latere toevoegingen plus de eerdere testreservering. Er is deze ronde geen reserverings-RPC aangeroepen.

Bewijs: `/workspace/scratch/mbd-review-20261119-database.raw.json` (mode 600) en `mbd-review-20261119-comparison.json`. Codeback-up vóór de testaanpassing: `/workspace/scratch/mbd-before-review-20261119.bundle`.

## Browser- en opslagcontroles

1. De twee gevraagde automatische browsertests op het echte productiedomein zijn opnieuw uitgevoerd. Beide worden vóór het laden van de pagina geblokkeerd door `net::ERR_CERT_AUTHORITY_INVALID`. Geen certificaatvalidatie uitgezet; deze twee tests blijven geblokkeerd, niet geslaagd.
2. Zes gerichte regressies slagen opnieuw in desktop- en iPhone-schermformaat: originele velden, opslaan/herladen, echte QR-testafbeeldingsdecodering met juiste/verkeerde/placeholderbestemming, afzonderlijke beslissingen, revisieconflict tussen vensters, historie, export en herstel. Deze tests gebruiken gecontroleerde fixtures en schrijven niet naar productie.
3. De twee integratietests met lokaal geserveerde productiecode en de echte actuele catalogus slagen met 700 records. De test is aangepast: geen verouderde vaste verwachting van 689/44/18; het dashboard wordt vergeleken met de actuele API-inhoud. `MBD_EXPECTED_CATALOG_COUNT` kan daarnaast een onafhankelijk vastgesteld aantal afdwingen (deze ronde 700). Geen runtimecode gewijzigd.
4. **Aanvullende rechtstreekse productiecontrole via de gedeelde browser is nu wél gelukt.** De eerder veronderstelde bestaande tab was niet toegankelijk; een afzonderlijke controletab op het exacte productiedomein kon worden geopend. Zichtbaar: 700 records, 55 zonder bronverwijzing, 18 in quarantaine. Bij het bestaande technische recept MDB-0694 was nog geen lokale controle opgeslagen. Daar is uitsluitend lokale metadata opgeslagen: notitie 'Technische opslagcontrole 19 november 2026. Geen inhoudelijke bron- of QR-goedkeuring.', herstelronde 'Technische controle 19 november', beslissing 'Verder onderzoeken'. De pagina bevestigt 'Opgeslagen en teruggelezen op dit apparaat · versie 1'. Na volledige herlading en opnieuw openen zijn alle drie velden zichtbaar behouden. Bronstatus blijft 'Nog te controleren', QR blijft 'QR ontbreekt' en teststatus blijft 'Nog te testen'. Er is dus geen fictieve bron- of QR-goedkeuring toegevoegd.

De eerdere algemene CUA-blokkade is niet meer absoluut: deze handmatige livecontrole via de tool is bewezen. Dat herstelt niet automatisch het certificaatvertrouwen van de aparte Playwright-runner. Geen fysieke Safari-test en geen account-/apparatensynchronisatie van de lokale controleadministratie geclaimd.

## Twee opslagconcurrency-TODO's blijven echt open

De productiecode controleert bestaande recepten en reserveert daarna een los MDB-nummer via `mbd_reserve_number`. De duurzame opslagclaim uit concept-PR #1 wordt nog niet door productie gebruikt. Daarom:

- **P1 — identieke gelijktijdige opslag:** beide aanvragen kunnen vóór opslag dezelfde lege zoekuitkomst lezen en ieder een eigen nummer reserveren. Een geïsoleerde diagnostische uitvoering van de productiehandler met volledig gesimuleerde externe diensten geeft twee HTTP-200-antwoorden, twee opgeslagen records en twee reserveringen. De gewenste assertie 'één recept' faalt.
- **P1 — herhalen na fout vóór definitieve opslag:** de eerste aanvraag krijgt een onzekere 502, de herhaling slaagt met een tweede reservering. De gewenste assertie 'dezelfde reservering' faalt in dezelfde geïsoleerde diagnose.

Script: `/workspace/scratch/mbd-save-risk-diagnostic-20261119.mjs`. Alle credentials en nummers in die diagnose zijn testwaarden en alle fetches zijn afgevangen; geen echte Notion- of databasewrites. Dit reproduceert tekortkomingen in de aanvraagvolgorde, maar is **geen** integratietest van gelijktijdige PostgreSQL-sessies. De twee bestaande TODO's blijven dus open. Niet als geslaagd omzetten en niet met een echte productie-upload belasten.

De claimoplossing en bijbehorende clientbescherming staan al in concept-PR #1. Volgende veilige stap: die bestaande oplossing afzonderlijk valideren met echte gelijktijdige sessies in een geïsoleerde testomgeving en pas daarna gericht uitrollen. Geen tweede implementatie in PR #2 en geen ongeteste samenvoeging van alle conceptfeatures.

## Uitkomst

Huidige gegevens en lokale controleopslag zijn gecontroleerd, inclusief een echte live opslag-/herlaadproef. Productie is deze ronde niet opnieuw gepubliceerd; recepten, foto's, bronlinks, schema, sleutels en MDB-nummers zijn behouden. De wijziging in PR #2 betreft alleen testactualisatie en dit verslag. Open blijven de twee aantoonbare opslagrisico's en het certificaatvertrouwen van de automatische productiebrowser.
