> Gepubliceerd en live geverifieerd 24 november 2026: productie `bd0059a`, deployment `dpl_9zZdFbwHXKPPe5taLNfr2z8vUEBZ` READY. Vijf goedgekeurde portiecorrecties en zes AI-beelden opgeslagen; 784 actieve recepten behouden. Zie [definitief publicatieverslag](docs/reviews/release-20261124.md). Eerdere statusregels hieronder zijn historisch.

> Vervolg 24 november 2026: gebruiker heeft portiecorrecties en publicatie goedgekeurd. Zie [publicatieverslag](docs/reviews/release-20261124.md) voor de laatste stand; de eerder afgewezen vijf correcties zijn inmiddels opgeslagen en teruggelezen.

> Actuele controle 24 november 2026: zie [receptencontrole](docs/reviews/recipes-20261124.md). Dataherstel teruggelezen; code uitsluitend lokaal voorbereid, geen merge/push/deploy. Vijf portievoorstellen wachten op expliciete toestemming. Oudere status hieronder is historisch.

# Broncodeherstel

## Vervolgcontrole — 22 november 2026

Gepubliceerd: productie `70d0f58`, READY `dpl_FFVQznwAQVGMmhpcvFLzoNKumAu4`, PR #12. AH-herimport behoudt oudere recepten volledig, ook bij bestaande Notion-duplicaten; geen verplaatsing naar AH of nieuw nummer. Tien echte PostgreSQL-opslagtests opnieuw geslaagd: oude concurrency-TODO’s zijn al opgelost. Socialherstel 129/134 al uitgevoerd; vijf bronnen missen nog bewijs. 54 unit-/routetests, 11 AH-pipelinetests, 20 gerichte lokale en 24 productie-browsercontroles geslaagd. Alle 705 volledige catalogusrecords exact ongewijzigd; 687 actief, 18 apart gehouden duplicaten. MDB-0710 was vóór deze controle toegevoegd; alle 704 eerdere records gelijk aan gisteren. Actuele grenzen en bewijs: `docs/followup-20261122.md`.

## Herstel oorspronkelijke collecties — 21 november 2026

Gepubliceerd: productie `d2ea7a5`, READY `dpl_7FxSiwthJve7oKcZm3DRiGaq6Lkd`, PR #11. AH uitsluitend voor nieuw geïmporteerde recepten; zes te breed aangepaste oudere boekrelaties teruggezet in Supabase en Notion. Oorspronkelijke vaste themacollecties hersteld; geen dynamische social-/trefwoordtegels. Bestaande receptcollecties en inhoud ongewijzigd. Zie `docs/collection-restore-20261121.md`. Dit vervangt de brede indeling uit PR #9 en #10. Oude automatische Pinterest-herimport en lokale nummertoekenning uitgeschakeld. TypeScript, 54 unit-/routetests, 52 lokale browsercontroles plus vier gerichte herimportcontroles en 12 definitieve productie-browsercontroles geslaagd. Alle oorspronkelijke thematellingen na herladen geverifieerd, AH alleen 0709.

## Eén AH-collectie — 21 november 2026

Gepubliceerd: productie `75acb66`, READY `dpl_AbjzHsuWf66MtMUVvRU7nzoLeCzu`, PR #10. Eén AH-keuze zoals HelloFresh; geen losse AH-brontrefwoorden/favorieten/boekdelen in collecties of weekmenufilter. Eigen AH-kookboeken behouden. Bestaande bronmetadata niet verwijderd. Alle 704 catalogusrecords exact ongewijzigd. Back-up en verificatie in `docs/ah-single-collection-20261121.md`. TypeScript, 54 unit-/routetests, 7 pipelinetests, 50 lokale en 10 productie-browsercontroles geslaagd. Ook herladen met actieve serviceworker gecontroleerd.

## Eigen AH-kookboeken — 21 november 2026

Gepubliceerd: productie `4460280`, READY `dpl_EXJBfGR4K2u4R4bFgg72nd8ziESQ`, PR #9. Eigen Notion-kookboek **AH – Allerhande · Deel 1** aangemaakt (boekindex 41), met zeven bestaande oorspronkelijke AH-recepten: 0164, 0230, 0232, 0271, 0275, 0307, 0709. Alleen boekmetadata/koppelingen aangepast; oorspronkelijke mapping bewaard, MDB's en inhoud behouden. Vijf alleen-aanvullende AH-inhoudsbronnen niet verplaatst. Maximaal 30 per deel bij AH-bulkimport, gewone imports blijven buiten AH. Herstelback-ups vooraf gemaakt. Gecontroleerd in productie op desktop en telefoonformaat: zeven AH-recepten in eigen boek, oude lokale boeklabels bijgewerkt, thema’s en bronvelden behouden na herladen, originele foto van 0709 laadt. 50 unit-/routetests, 7 AH-pipelinetests, 10 echte PostgreSQL-opslagtests, 48 lokale en 18 productie-browsercontroles geslaagd. Totaal blijft 704 records / 686 actief / 18 apart gehouden duplicaten. Alle 16 nummerreserveringen identiek; overige 697 records geheel identiek; bij de zeven alleen boekmetadata veranderd. Zie `docs/ah-cookbooks-20261121.md`.


## Allerhande bulkimport — 20 november 2026

Gepubliceerd in dezelfde app: productie `b4c3122`, READY `dpl_9sWvcPNUSzbMK6CQky1VYKRtinC5`, PR #8. Actuele catalogus 704 / 16 reserveringen. Alleen bestaand MDB-0709 uit de originele AH-bron gesynchroniseerd naar Supabase en één Notion-pagina in de bewezen bestaande boek-32-koppeling. MDB-0709 is na echte desktop- en telefoonformaatcontrole voltooid vastgelegd: juiste bron, 12 ingrediëntenregels, alle 9 stappen, juiste bestaande boek-32-relatie, Notion-foto en daadwerkelijk geladen originele 1224×900-foto. Actief 15 / oven 45 / totaal 60 minuten, juiste tijdscollectie. Alle overige 703 catalogusrecords en alle 16 nummerreserveringen exact gelijk aan back-up. Herstelback-up vooraf gemaakt. Dashboard met hervatbare links/titels, beelden, bron-/duplicaatcontrole, persoonlijke lijstjes en afzonderlijke actieve/oven-/wachttijden toegevoegd. AH schermt direct ophalen vanaf Vercel af (foto HTTP 403, ook gewone/canonieke receptpagina niet bereikbaar). Originele AH-browserexport / opgeslagen AH-HTML is daarom als veilige route toegevoegd; geen cookies/wachtwoorden geëxporteerd. Een volledige persoonlijke favorietenlijst is niet opgehaald. 44 unit-/routetests, 4 PostgreSQL-tests, 7 pipelinetests, 46 lokale browsercontroles en 16 productie-browsercontroles slagen. Details en testgrenzen: `docs/allerhande-bulk-import-20261120.md`.


## Receptlinks, eigen accounts en collecties — 20 november 2026

Gepubliceerd in dezelfde app: productiecommit `30e7d28`, READY `dpl_CaFknqNrTVUrFpt9U7sasA9SH7w6`, PR #7. Database-addities toegepast en gecontroleerd. WhatsApp deelt nu een MBD-appreceptlink met fotometadata; eigen accounts/een-recept-deellinks zijn gescheiden van de bestaande openbare hoofdcatalogus. Collecties wissen achtergebleven zoekfilters met behoud van allergieën. Socialcontroles vereisen bewuste opslag en bewijs van verwijdering; geen automatische bronwijzigingen. Actuele catalogus: 702, alle bestaande recepten/nummers te behouden. Todoist-kwartaalherinnering vanaf 1 januari 2027 aangemaakt; ChatGPT-limiet verhinderde een extra ChatGPT-taak. Geverifieerd: TypeScript, 38 unit-/routetests, zes PostgreSQL-tests, 30 lokale browsercontroles en 16 verschillende productiebrowsercontroles op desktop/telefoonformaat. Echte foto/Open Graph, expliciete bewaarknop, collecties met echte catalogus, weekmenu, socialherstel en bron-/QR-readback/print slagen. Alle 702 catalogusrecords exact gelijk aan de vooraf gemaakte back-up; 14 bestaande nummerreserveringen behouden. Geen blijvende testrecepten, deellinks of socialstatussen aangemaakt. Echte e-mailbevestiging en WhatsApp op een fysieke telefoon niet getest. Details: `docs/recipe-links-and-accounts-20261120.md`. Deze linkdeling vervangt het eerdere volledige WhatsApp-tekstconcept.


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
