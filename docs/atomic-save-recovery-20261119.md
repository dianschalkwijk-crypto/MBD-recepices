# Dubbele opslag en onzekere herhaling — 19 november 2026

## Probleem en gerichte correctie

De oude productieroute controleerde de catalogus en reserveerde daarna los een MDB-nummer. Twee identieke aanvragen konden allebei vóór de eerste insert een lege zoekuitkomst krijgen. Na een fout vóór definitieve opslag kreeg een herhaling opnieuw een nummer. Beide fouten zijn eerder met gesimuleerde diensten gereproduceerd.

Deze correctie neemt uitsluitend de opslagclaim en terugleescontrole uit concept-PR #1 over, bovenop de huidige Bronnen & QR-productiecode. Geen volledige samenvoeging van concept-, filter-, foto- of accountsynchronisatiefuncties.

- De server gebruikt de al bestaande `mbd_claim_recipe_save`: een hash van volledige receptinhoud en, indien aanwezig, de canonieke bron. De database controleert en reserveert in dezelfde transactie onder de bestaande advisory lock.
- Alleen de aanvraag met status `claimed` mag een Notion-recept maken. `processing` en `stored` wijzen naar hetzelfde bestaande nummer en maken geen tweede pagina of reservering.
- Bij onzekere opslag of een verloren Notion-antwoord blijft het oorspronkelijke nummer bekend; het antwoord vraagt om controle en blokkeert automatisch opnieuw uploaden in de bestaande app.
- Een geslaagde insert wordt pas als succes gemeld na teruglezen van de volledige receptidentiteit en Notion-koppeling.
- Boekgegevens worden vóór de claim alleen gelezen. Een vol boek sluiten of een volgend boek maken gebeurt pas voor de winnende claim. Dit voorkomt dubbele boeken door dezelfde gelijktijdige aanvraag.
- Titel, ingrediënten en stappen zijn verplicht vóór reserveren. Bestaande bron-, foto- en collectieopslag blijft behouden.

Een onzekere aanvraag wordt bewust niet automatisch vrijgegeven: mogelijk is de externe pagina al aangemaakt. De veilige uitkomst is hetzelfde nummer met een controlemelding, niet een verborgen tweede upload.

## Bestaande database, geen migratie of sleutelrotatie

De claimfunctie, private aanvraagtabel en de geaccepteerde serversleutels waren al voorbereid op 15 november. De actuele definities van claim, reservering en cataloguswrite zijn opnieuw uitsluitend gelezen. Deze release wijzigt geen databasefunctie, tabel, rol, policy of sleutel. Alle bestaande allocatorroutes delen advisory-locknummer 6452026.

Vóór-snapshot: `/workspace/scratch/mbd-before-concurrency-fix-20261119.json`, mode 600. Deze bevat alle 700 catalogusrecords, 12 bestaande reserveringen, nul claims, kolommen/constraints en de drie functie-/rechtenbeschrijvingen. SHA-256 `9c8f7ae40dae2a9682d5cc91391440f11436ee6f017eda19bc7d8f4c27da065c`.

Rollbackcode vóór publicatie: productie `d37e75f`, deployment `dpl_BzapRZdWdExPR4yA3ZUtm2aWaQVd`. Bij terugkeer geen reserveringen of claims verwijderen en geen nummers hergebruiken. Teruggaan naar de oude route brengt de twee bekende racevoorwaarden terug; daarom alleen bij een echte releasefout terugrollen.

## Echte PostgreSQL-integratie, volledig buiten productie

De test gebruikt een eigen tijdelijke Docker-container zonder netwerk (`--network none`), zonder gepubliceerde poorten en zonder productierecepten. PostgreSQL **17.11**, image vastgepind op `postgres@sha256:ff87138949ad9a46f32ff23bd6852b52ce024a13dffe9b4087be98292cdd3b4f`.

`tests/fixtures/atomic-save-schema.sql` bevat kopieën van de actuele drie productiefuncties. Alleen de geaccepteerde credentialhashes worden vervangen door één openbare testcredential. De fixture is nadrukkelijk geen productiemigratie. De tabeltypen, relevante constraints, RLS en roltoegang worden nagebouwd.

De HTTP-bridge in de test vervangt Notion door een gecontroleerde fixture. Reservering, claim en cataloguswrite gaan daadwerkelijk naar PostgreSQL, via afzonderlijke verbindingen. Serveraanvragen draaien in afzonderlijke Node-processen. Geen testverzoek kan het echte Supabase- of Notion-netwerk bereiken.

Tien geslaagde integratietests:

1. Twaalf overlappende PostgreSQL-sessies: één claim, één reservering, hetzelfde nummer.
2. Andere inhoud met dezelfde bron: één claim; werkelijk verschillende bronnen/inhoud: verschillende nummers.
3. Acht afzonderlijke serverprocessen: één aangemaakt Notion-testrecept en één nieuwe echte PostgreSQL-catalogusrij.
4. Fout vóór databasecommit: herhaling houdt het nummer en maakt geen tweede Notion-testpagina.
5. Vol kookboek en zes identieke gelijktijdige aanvragen: één volgend boek, één recept.
6. Verloren antwoord ná echte commit: herhaling herkent hetzelfde opgeslagen recept.
7. Terugleesfout: geen verwijdering van het mogelijk opgeslagen recept en geen nieuwe claim.
8. Foute credential/identiteit: geen mutatie; private claims ontoegankelijk voor anon.
9. Verloren Notion-aanmaakantwoord: controlemelding met oorspronkelijk nummer, geen tweede pagina.
10. Niet-muterende deploymentcontrole: autorisatie geverifieerd zonder nummer, claim of pagina.

Reproduceerbaar na het beschikbaar maken van de gepinde image: `npm run test:storage-integration`. De tijdelijke container wordt na de suite gestopt en automatisch verwijderd. De twee eerdere lege concurrency-TODO's zijn vervangen door concrete regressies en deze echte database-integratie, niet als geslaagd hernoemd zonder uitvoering.

## Overige verificatie

- 28 unit-/routetests en TypeScriptcontrole geslaagd.
- 14 desktop-/mobiele browserregressies geslaagd, waaronder twee nieuwe controles van de bestaande UI: een onzekere claim behoudt de invoer, toont het oorspronkelijke MDB-nummer en blokkeert opnieuw verzenden. Externe antwoorden in deze UI-tests zijn fixtures.
- De twee opt-in productiebrowsertests draaien afzonderlijk na release, met de eerder herstelde NSS-toegang. Zij zijn niet inbegrepen in de 14 lokale browserregressies.
- Voorbereid op een afzonderlijke herstelbranch. Publicatie en daadwerkelijke liveverificatie worden hieronder na uitvoering vastgelegd.

## Grenzen

Deze tests bewijzen de huidige PostgreSQL-functies en de gerichte serverroute onder echte gelijktijdigheid in de geïsoleerde omgeving. Notion-netwerkfouten zijn gecontroleerd gesimuleerd; er wordt hiervoor geen nieuw productierecept aangemaakt. De livecontrole gebruikt niet-muterende autorisatie en herhaalde aanvragen voor een al bestaand technisch recept. De huidige productiecatalogus wordt vóór en na de release volledig vergeleken.

## Gepubliceerd en live gecontroleerd

- Productiecommit `a35abee4b03fe09c38638a62947d0d9a7ea3fd23`, deployment `dpl_HgL5U26wuu4Rka2yTCYfEoCBAhdJ`, target production, READY. De vaste alias `madebydian-recipes-dian.vercel.app` is hieraan toegewezen. Het project met extra s is niet gebruikt.
- `/api/notion/save?verify=1`: HTTP 200, `writeAuthorized: true`, `notionReadable: true`, `mutationPerformed: false`. Dit controleert nu de werkelijk gebruikte claimfunctie, zonder een nummer te reserveren.
- Twee gelijktijdige echte POST-aanvragen met de exacte inhoud van het bestaande technische recept MDB-0694: allebei HTTP 409 `duplicate_recipe`, hetzelfde MDB-0694. Geen nieuw nummer, Notion-pagina of recept gemaakt.
- Beide automatische productie-browsertests slagen met TLS-validatie en de eerder vastgelegde beperkte NSS-toegang: desktop en iPhone-schermformaat, **2 passed (12,7 s)**. Productiecatalogus, lokale controleopslag/herladen, originele velden en print/selectie gecontroleerd.
- Volledige na-snapshot vergeleken met de vóór-snapshot: alle **700 catalogusrecords**, alle **12 reserveringen**, nul claims en alle drie volledige functie-/rechtenbeschrijvingen zijn exact gelijk. Geen productiedatabase, sleutel of bestaande receptdata gewijzigd.
- Bewijs buiten Git: `/workspace/scratch/mbd-atomic-live-result-20261119.json`, `mbd-atomic-live-check-20261119.py`, `mbd-after-concurrency-fix-20261119.json` (de gegevenssnapshot mode 600). De live testscriptcode controleert eerst aanwezigheid van exact het bekende recept voordat een bestaande dubbele aanvraag wordt verstuurd.
- De twee oorspronkelijke opslag-TODO's zijn hiermee gericht afgedekt door echte geïsoleerde PostgreSQL-integratietests en de gepubliceerde claimroute. Dit is geen claim dat nieuwe productie-opslag met Notion-foto opnieuw is getest: daarvoor is geen nieuw productierecept toegevoegd. De eerdere live foto-opslagproef blijft afzonderlijk bewijs van de bestaande fotoketen.

PR #3 bevat de gerichte reparatie. Concept-PR #1 blijft een afzonderlijke verzameling concept-/fotofuncties; zijn oudere servervariant mag de verbeterde claim-/boek-/onzekerheidsafhandeling niet overschrijven. Bij verder werk aan PR #1 eerst op deze actuele productiecode baseren.
