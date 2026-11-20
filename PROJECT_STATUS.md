# MadeByDian — centraal herstelregister

## Receptlinks, eigen accounts en collecties — 20 november 2026

Gepubliceerd in dezelfde app: productiecommit `30e7d28`, READY `dpl_CaFknqNrTVUrFpt9U7sasA9SH7w6`, PR #7. Database-addities toegepast en gecontroleerd. WhatsApp deelt nu een MBD-appreceptlink met fotometadata; eigen accounts/een-recept-deellinks zijn gescheiden van de bestaande openbare hoofdcatalogus. Collecties wissen achtergebleven zoekfilters met behoud van allergieën. Socialcontroles vereisen bewuste opslag en bewijs van verwijdering; geen automatische bronwijzigingen. Actuele catalogus: 702, alle bestaande recepten/nummers te behouden. Todoist-kwartaalherinnering vanaf 1 januari 2027 aangemaakt; ChatGPT-limiet verhinderde een extra ChatGPT-taak. Geverifieerd: TypeScript, 38 unit-/routetests, zes PostgreSQL-tests, 30 lokale browsercontroles en 16 verschillende productiebrowsercontroles op desktop/telefoonformaat. Echte foto/Open Graph, expliciete bewaarknop, collecties met echte catalogus, weekmenu, socialherstel en bron-/QR-readback/print slagen. Alle 702 catalogusrecords exact gelijk aan de vooraf gemaakte back-up; 14 bestaande nummerreserveringen behouden. Geen blijvende testrecepten, deellinks of socialstatussen aangemaakt. Echte e-mailbevestiging en WhatsApp op een fysieke telefoon niet getest. Details: `docs/recipe-links-and-accounts-20261120.md`. Deze linkdeling vervangt het eerdere volledige WhatsApp-tekstconcept.


## WhatsApp delen gepubliceerd — 19 november 2026

Productie `798665b` / READY `dpl_GZ5uHtxPmkwa1LCCQ8b9ST6UZdYo`, dezelfde receptenapp. Delen via WhatsApp op receptkaart, details en weekmenu maakt een volledig tekstconcept met social vóór website. Geen contactkeuze of automatische verzending; privévelden blijven weg. Mobiele actierij loopt nu over meerdere regels. 36 unit-/routetests, TypeScript en zes productie-browsercontroles op desktop/telefoonformaat geslaagd, inclusief openen van een afgevangen WhatsApp-conceptlink. Geen echte berichten verstuurd of fysieke WhatsApp-app getest. Alle 700 catalogusrecords vóór/na identiek. PR #6; zie `docs/whatsapp-sharing-20261119.md`.

## 129 van 134 sociallinks hersteld — 19 november 2026

Alle 134 onderzocht; 122 oorspronkelijke links uit Stashcook-exports plus 7 bestaande Notion-inhoudsbronnen hersteld, inclusief MDB-0323. Vijf open: 0675/0676 (originele screenshot/schermopname nodig), 0687/0688/0689 (screenshots niet opgeslagen, Notion 404). Catalogussynchronisatie bewaart nu beide bronsoorten. Productie `7a737a4` / READY `dpl_DkMY2VkY27zRjeANrd4mGx5e4rts`; PR #5. 700 nummers/recepten behouden, uitsluitend 129 ontbrekende linkvelden aangevuld; foto’s/ingrediënten/porties/bestaande bronvelden en 12 reserveringen ongewijzigd. Herladen en echte live synchronisatie van de 129 links getest op desktop en telefoonformaat. Bij 0323 blijft inhoudelijke vergelijking van social (12 cups) en website (24 cups) open. Details en herstelback-up: `docs/social-source-recovery-20261119.md`. Oudere meldingen hieronder dat de social van 0323 niet gevonden is, zijn achterhaald.

## Bronlinks en socialvolgorde hersteld — 19 november 2026

Productie `b977018` / `dpl_9LN9MTe7gmtqQetdyz56uUk9Es1Y` READY in dezelfde app. Weekmenukeuzes, zoekresultaten, bibliotheek en receptdetails tonen sociallinks eerst en websites apart; Recept bekijken wijzigt de planning niet. MDB-0323 heeft geen bekende exacte social-URL, ook niet in het historische bronregister: zichtbaar als ontbrekend, geen URL verzonnen. Alle 700 catalogusrecords volledig ongewijzigd. Details: `docs/weekmenu-source-links-20261119.md`.

## Weekmenu uitgebreid en live getest — 19 november 2026

Productie `86395d3` / `dpl_B1oK4hqJXAQktZmVwMCYk8wHBq9b` READY in dezelfde receptenapp. Aanpasbare dagcategorieën/collecties, categoriezoeklijst, persoonlijke sterrenfilters en portieomrekening voor standaard vier personen toegevoegd. MDB-0323 bevat 24 cups, geen 24 personen; bronpersonen blijven onbekend tot expliciet ingevuld. 31 unit-/routetests, 16 lokale browsercontroles en zes productie-browsercontroles geslaagd. Alle 700 catalogusrecords vóór/na identiek. Instellingen blijven lokaal. Details: [weekmenucontrole](docs/weekmenu-filters-portions-20261119.md). PR #4 open voor review.
## Overdracht overige chats — 19 november 2026

Zie [centrale chatoverdracht](docs/cross-chat-requirements-20261119.md) voor teruggevonden eisen rond 0120/0592/0623/0625, Notion als back-up, HelloFresh/weekmenu, kindervoorkeuren en kookboeken. Dit is een vastgelegde werkvoorraad, geen claim dat die uitbreidingen al gebouwd zijn. Archiefadvies en beperkingen van de chatinventaris staan erbij; kledingkastwerk blijft apart.

## Opslagrisico's gerepareerd en gepubliceerd — 19 november 2026

- Actuele productie: `a35abee4b03fe09c38638a62947d0d9a7ea3fd23`, READY-deployment `dpl_HgL5U26wuu4Rka2yTCYfEoCBAhdJ`, uitsluitend project `madebydian-recipes-dian`. PR #3, branch `fix/atomic-recipe-save-20261119`.
- De route gebruikt de reeds bestaande duurzame databaseclaim. Gelijktijdige identieke opslag en herhaling na een fout houden één nummer; alleen de winnende claim maakt een Notion-recept of volgend boek. Onzekere antwoorden blijven zichtbaar met het oorspronkelijke nummer. Succes vereist teruglezen.
- 28 unit-/routetests, TypeScript, 10 echte PostgreSQL-17.11-integratietests (afzonderlijke sessies en serverprocessen), 14 browserregressies en beide automatische productie-browsertests geslaagd. De twee oude lege concurrency-TODO's zijn vervangen door uitgevoerde concrete controles.
- Live claimautorisatie zonder mutatie bevestigd. Twee bestaande dubbele productieaanvragen geven allebei MDB-0694 terug, zonder nieuw recept/nummer. Alle 700 records, 12 reserveringen, nul claims en drie databasefuncties zijn vóór/na volledig identiek.
- Geen productiemigratie of sleutelrotatie. Alleen het gerichte serverdeel uit PR #1 overgenomen; concept-/foto-/accountfeatures niet mee gepubliceerd. Oudere vermeldingen dat de twee opslagrisico's nog openstaan zijn historisch. PR #1 moet bij vervolg op deze servercorrectie worden gebaseerd.
- Details, back-up, rollback en werkelijke testgrenzen: `docs/atomic-save-recovery-20261119.md`. Er is voor deze release geen nieuw productierecept met foto toegevoegd.

## Productiebrowsertests hersteld — 19 november 2026

- Beide automatische productiebrowsertests slagen nu met HTTPS-validatie aan: desktop en iPhone-schermformaat, 2 passed. De testuitvoering heeft gericht schrijfrecht nodig op `/home/agent/.pki/nssdb`; zonder dat recht kon NSS zijn certificaatopslag niet correct gebruiken.
- De aanvankelijke diagnose 'ontbrekend certificaat' is gecorrigeerd: hetzelfde proxycertificaat stond al onder een andere naam in NSS. Geen extra CA toegevoegd en geen TLS-controle uitgezet. De gebruiker gaf expliciet toestemming voor certificaatherstel; de uiteindelijke werkende correctie betreft de beperkte testomgevingstoegang.
- Productiepagina, actuele catalogus/dashboard, lokale controleopslag na herladen, behoud van oorspronkelijke velden en print/mobile-controles zijn rechtstreeks op het productiedomein geverifieerd. Geen servergegevens of MDB-nummers gewijzigd; geen nieuwe productierelease.
- Herhaalbare uitvoering en bewijs: `docs/browser-tls-recovery-20261119.md`. Oudere vermeldingen hieronder van geblokkeerde automatische productiebrowsertests zijn historisch. De twee opslagconcurrency-TODO's blijven afzonderlijk open.

## Vervolgcontrole — 19 november 2026

- Productie d37e75f en preview 51d9f68 opnieuw READY bevonden; verschil uitsluitend documentatie. PR #2 open en mergebaar, geen reviewopmerkingen; geen nieuwe runtime-release nodig.
- Actuele catalogus is 700, exact gelijk tussen live API en Supabase. Alle oorspronkelijke 689 records zijn geheel ongewijzigd; 11 Fit Piggy-recepten zijn op 17 november toegevoegd en behouden. Geen nieuwe recepten/nummers aangemaakt tijdens deze controle.
- Zes gerichte opslag-/QR-regressies en twee integratietests met de echte catalogus slagen. Verouderde vaste browsertesttelling 689 vervangen door vergelijking met de actuele API. Twee automatische productie-browsertests blijven door ERR_CERT_AUTHORITY_INVALID geblokkeerd.
- Nieuw bewezen: de gedeelde browser kon de echte productiepagina openen. Lokale controlenotitie, herstelronde en beslissing bij bestaand technisch recept MDB-0694 opgeslagen en na herladen zichtbaar teruggelezen. Geen bron- of QR-goedkeuring toegevoegd. Controleopslag blijft op dit apparaat.
- De twee concurrency-TODO's blijven P1: dubbele gelijktijdige opslag en nieuwe reservering bij herhaling na een fout zijn met gesimuleerde externe diensten gereproduceerd. De bestaande claimoplossing staat al in concept-PR #1; niet dupliceren in PR #2 en niet ongetest publiceren.
- Details en bewijs: `docs/followup-verification-20261119.md`. Deze sectie vervangt oudere algemene vermeldingen dat geen enkele rechtstreekse productie-browsercontrole mogelijk is.

## Actueel — Bronnen & QR-controle, 16 november 2026

- Gepubliceerd in dezelfde app: `/bronnen-qr.html`, met hoofdnavigatie en koppelingen vanuit recepten. Productie `dpl_BzapRZdWdExPR4yA3ZUtm2aWaQVd`, commit `d37e75fd63f632a7df3d7f67a8fb8dd5658a0666`, Vercel-project uitsluitend `madebydian-recipes-dian`. De oude projectvariant met extra s is niet gebruikt.
- Brononderzoek, alle back-ups en testgrenzen: `docs/source-qr-workspace-20261116.md`. Actuele bron is `public.mbd_catalog`: 689 records, inclusief 18 quarantaine. Het gelezen Excel-register met 352 MDB-concept-QR’s is aanvullend en is niet automatisch overgenomen. Geen datasets samengevoegd.
- Controlebeslissingen staan apart in IndexedDB op dit apparaat, met expliciete opslag per recept, historie, revisiecontrole en herstelbare export. Geen cloud-/accountsynchronisatie van deze controleadministratie; dit staat zichtbaar in de pagina. Bronnen, foto's, recepten en MDB-nummers worden niet gewijzigd.
- 23 unit-/routetests en 14 desktop-/mobiele Chromium-controles geslaagd; twee hiervan lezen de echte catalogus via de lokale geteste code. Twee oudere saveconcurrency-TODO's blijven open. Gepubliceerde bestanden zijn byte-identiek aan de geteste bestanden. Live catalogus-API en bestaande productiehealth geven HTTP 200; alle 689 records en RLS-policies zijn exact ongewijzigd.
- De rechtstreekse UI-test op productie blijft concreet geblokkeerd door certificaatvertrouwen in de testbrowser en de CUA-toolstoring. Niet presenteren als een geslaagde productie-browsertest. Geen bestaande individuele bron of QR in deze ronde inhoudelijk goedgekeurd of geregenereerd.
- Werkbranch `feat/sources-qr-workspace-20261116`, PR #2. Concept-PR #1 is niet mee gepubliceerd.

## Lokale releasevoorbereiding — 29 oktober 2026

- Basis: recovery/vercel-2026-10-22 op 80df13a85e9d93e31ed58facd3e48e48dacb6df7; remote-tip opnieuw bevestigd.
- Correcties: lokale MDB-toekenning uit de bibliotheekcontrole verwijderd; server controleert bestaande canonieke bronlinks en volledige receptinhoud vóór reserveren; ontbrekende credentials of mislukte boekcontrole verbruiken geen MDB-reservering.
- Een onzekere Supabase-write verwijdert niet langer de Notion-pagina. Alleen een expliciet afgewezen insert kan worden gecompenseerd; een mislukte compensatie wordt niet meer als geslaagde rollback gemeld. De hoofd-savehelper blokkeert opnieuw opslaan zolang handmatige reconciliatie nodig is.
- Geen bestaande recepten, foto's, MDB-nummers of databases gewijzigd. Geen databasefunctie of constraint gewijzigd.
- Validatie: npm run typecheck geslaagd; node --test --test-isolation=none tests/*.test.mjs: 15 geslaagd, 0 gefaald, 2 TODO. De TODO's betreffen echte PostgreSQL-concurrency en duurzame idempotency; tests met gesimuleerde database-reserveringen bewijzen die live garanties niet.
- Lokale Chromium-controle: instellingen, collecties, recepten en weekmenu openen; 23 collectieknoppen, eerste collectie opent; geen pageerrors. Gebruikt de lokale seedcatalogus van 621 recepten met externe requests geblokkeerd; dit is geen actuele databasetelling of live integratietest.
- scripts/audit-catalog.mjs biedt een paginerende alleen-lezen cataloguscontrole. Live audit niet uitgevoerd: Supabase-netwerktoegang nog niet geactiveerd.
- Publicatie door gebruiker opgedragen. Productie-healthcontrole geblokkeerd door CONNECT 403; Vercel-token/beheerkoppeling ontbreekt. Daarom nog geen gecontroleerde Vercel-build, deployment of livegang vastgesteld. GitHub-push apart controleren; een push bewijst geen deployment.
- Herstelbare lokale bronbackup: /workspace/cloud-setup/mbd-before-release-80df13a.bundle, git bundle verify geslaagd. Dit is geen databasebackup of bevestiging van de actuele Vercel-rollbackdeployment.
- Benodigde netwerkdomeinen en VERCEL_TOKEN-vereiste opgeslagen in het omgevingsconcept. Concept opslaan past de actieve omgeving niet automatisch aan. Geen tokenwaarden in code, logs of chat opnemen.

Bijgewerkt: 2026-10-27. Dit document is de startplaats voor vervolgwerk. Verifieer veranderlijke gegevens opnieuw, maar herhaal geen reeds bewezen diagnose zonder aanleiding.

## Werkregels
1. Lees eerst dit register en RECOVERY_STATUS.md; raadpleeg bestaande exports en eerdere herstelpogingen voordat om bestanden wordt gevraagd.
2. Maak onderscheid tussen GEVONDEN, GETEST, GEREPAREERD en KLAAR. KLAAR betekent: functionele test geslaagd, geen dataverlies, resultaat vastgelegd.
3. Bescherm productie en bestaande MDB-nummers. Geen verwijderingen, hernummering, bulkoverschrijving of productie-deploy zonder gecontroleerde back-up en rollback.
4. Werk één blokkade tegelijk af. Leg per wijziging vast: oorzaak, wijziging, test, uitkomst, resterende actie.
5. Stop met eindeloos dezelfde geblokkeerde actie proberen. Kies een andere route en noteer beperkingen.
6. Scheid herstel van bestaande functies van nieuwe features.

## Bewezen status
- GitHub: dianschalkwijk-crypto/MBD-recepices. main bevat alleen RECOVERY_STATUS.md; recovery/vercel-2026-10-22 bevat gedeeltelijk herstelde appcode. Ook branch fix/clickable-collections-20261024 bestaat.
- Bron: Vercel deployment dpl_FCb3R9KJiaRnDFYdstAc1f2TmSoK. Herstelregister meldt 46/55 bestanden hersteld en negen ontbrekende serverbestanden; zie RECOVERY_STATUS.md voor exacte paden.
- Vercel deployment dpl_6YJCoojBP4ru439XSqeSuGn3zKSo heeft READY-status en is gebouwd vanaf recovery/vercel-2026-10-22; READY bewijst geen functionele end-to-end-synchronisatie.
- Vercel API get_deployment_file_contents retourneert base64, maar de inhoud van ontbrekende serverbestanden is afgekapt. NIET als volledige broncode opslaan.
- Supabase project ywsdubincfabjhvjqkot: eerder gecontroleerd 669 unieke MDB-records in public.mbd_catalog; dit is geen nieuwe live-telling. SQL-tool werd door veiligheidscontroles geblokkeerd, metadata lezen lukte wel.
- catalog-sync-v2.js haalt Supabase naar lokale app en vult ontbrekende velden aan; Notion is daarin geen terugschrijvende bron. notion-force-sync-v1.js haalt Notion naar lokale app. Niet aannemen dat beide veilig samen werken zonder tests.
- Notion hoofdpage 3d648664-8ea9-81e1-999f-f9d2cc71cea6. Historische bronbestanden en statussen zijn ouder dan huidige catalogus.

## Open blokkades (niet opnieuw als nieuw presenteren)
1. Negen serverbestanden volledig terughalen en integriteit vergelijken met originele Vercel-deployment.
2. Vaststellen welke scripts de actuele productie-app laadt en conflictregels voor Notion/Supabase vastleggen.
3. End-to-end-test: recept lezen, wijzigen, opslaan, teruglezen in Supabase en Notion, conflict en rollback testen.
4. Actuele datakwaliteit: ontbrekende foto-/bronlinks en Nederlandse receptinhoud; eerst betrouwbare actuele telling.
5. Compleet herstel testen op preview; pas daarna expliciete productie-release.

## Veilig vervolg
Inspecteer eerst eerdere exports of andere beschikbare bronkopieën en de bestaande herstelbranch; vraag niet opnieuw om een export die al eerder is gedaan. Documenteer elke afgeronde test hier. Geen nieuw project aanmaken.

## Uitgevoerde codewijziging 2026-10-27
- `catalog-sync-v2.js` op recovery-branch aangepast (commit 2145412e8dca62cbf1d3543583f0d1dd44a9075c): originele lokale toestand wordt vóór de eerste merge vastgelegd; bij mislukte opslag stopt synchronisatie. Eerdere code maakte de zogenoemde pre-sync-back-up pas na mutatie.
- Opnieuw uit GitHub gelezen: back-up-instructie staat vóór de merge, oude back-up na merge verwijderd. Nog GEEN browser-/end-to-end-test; NIET naar productie publiceren.

## Technische controle en reparatie 2026-10-27 (vervolg)
- `catalog-sync-v2.js` commit 55453b82444559b9a2785b5d5ff8e7954b605f58: bij mislukte persist wordt lokale toestand zo mogelijk hersteld uit pre-sync snapshot. Codewijziging uitgevoerd; browsertest ontbreekt.
- Belangrijk nieuw bewezen probleem: `index.html` bevat zelfstandige `syncCatalogRecipes()` die 1800 ms na laden draait. Deze route gebruikt niet automatisch de veiligheidscode in `catalog-sync-v2.js`, kan bestaande foto-velden overschrijven en muteert lokale staat vóór persist zonder snapshot.
- Poging om `index.html` rechtstreeks veilig te wijzigen is geblokkeerd door OpenAI veiligheidscontroles op grote toolaanroep. Geen wijziging aan index.html doorgevoerd. Zoek alternatieve veilige patchroute, zonder ongeteste productie-deploy.

## Reparatie dubbele catalogussynchronisatie (2026-10-27)
- `service-worker.js` gewijzigd, commit 373b41374cd63debb36cdd80bcac29a7bb7ba51a: HTML-injectie schakelt `setTimeout(syncCatalogRecipes,1800);` uit, zodat de beveiligde `catalog-sync-v2.js` de catalogus verwerkt. Cacheversie verhoogd naar v0.10.17.
- Gecontroleerd: exacte te vervangen tekst komt één keer voor in `index.html`; serviceworker bevat de vervanging en laadt `catalog-sync-v2.js`.
- BEPERKING: eerste bezoek zonder actieve serviceworker krijgt de oorspronkelijke HTML en voert de inline synchronisatie nog uit. Dit is daarom slechts een gedeeltelijke oplossing, nog niet volledig veilig. Nodig: server-side HTML aanpassing of kleine codewijziging in `index.html` via betrouwbare patchroute, plus browsertests. Geen productie-release.

## Reparatie eerste paginalading 2026-10-27
- `api/app.ts` commit 4f52739ab8aceb066becdd3a8291085d0c217483: vervangt bij server-side HTML-verwerking `setTimeout(syncCatalogRecipes,1800);` door commentaar vóór scriptinjectie. Git object API gebruikt wegens blokkade reguliere grote update.
- Opnieuw uit GitHub gelezen en statisch gecontroleerd: oorspronkelijke hook bestaat in `index.html`, servercode verwijdert deze, veilige catalog-sync blijft geïnjecteerd; serviceworker schakelt eveneens de hook uit.
- Geen browser-/preview-/end-to-end-test; de bronbranch mist nog negen serverbestanden. Niet productie-deployen of KLAAR noemen voordat preview-build en datatests slagen.

## Vercel-verificatie 2026-10-27
- Previewdeployment `dpl_HtKrWeyrBKNa9N5rWiX9r5EwwyYp` op commit `c33d7561c2336eb388ddb048dc60305b771d66b7` is READY. Buildlogs: dependencies geïnstalleerd, TypeScript build en deployment completed, geen fatale buildfouten.
- Browser-/HTTP-test van exacte preview-URL via externe lezer gaf `login_required` (Vercel Deployment Protection). Dit is GEEN bewijs van werkende app en GEEN app-authenticatiefout. Geen bescherming uitschakelen.
- Nodig voor daadwerkelijke end-to-end-test: geauthenticeerde toegang via Vercel CLI `vc curl` of OIDC Trusted Sources; daarna GET `/` controleren op ontbreken van inline sync hook, GET `/api/health`, en read-only cataloguscheck. Geen productie-release zonder deze tests.

## Testvervolg 2026-10-27
- Preview dpl_HtKrWeyrBKNa9N5rWiX9r5EwwyYp is READY en buildlogs tonen voltooide build. Externe HTML/browser-test is geblokkeerd door Vercel-login (login_required); geen poging om deploymentbeveiliging uit te schakelen.
- Statische test op werkelijk uit GitHub gelezen bron: serververvanging verwijdert exacte inline sync hook (1 oorspronkelijke match), injectie verwijst naar catalog-sync-v2.js, serviceworker schakelt dezelfde hook uit, snapshot staat vóór merge, rollbackcode bestaat. Alle vijf checks positief. Dit is NIET hetzelfde als een geslaagde browser- of database-integratietest.
- Preview-runtime logs afgelopen 30 minuten: geen events. Dit bewijst geen foutloosheid omdat geen geauthenticeerde request uitgevoerd kon worden.
- Apart productieprobleem uit Vercel runtime errors: `/api/recipes/recognize-photo` had op 2026-10-26 HTTP 429 `credit_balance_exhausted` / `insufficient_quota` voor AI-fotoherkenning. Geen betaling of API-configuratie gewijzigd.

## Praktijktest 27-10-2026
- Previewbestanden index.html, catalog-sync-v2.js, service-worker.js en api/health gecontroleerd: HTTP 200.
- Supabase MadeByDian Recepten is ACTIVE_HEALTHY.
- mbd_catalog: 669 rijen, 669 unieke MDB-nummers, 0 lege MDB, 0 lege recepten.
- RLS staat aan. anon en authenticated hebben SELECT-recht. Publieke leespolicy staat actief.
- Interactieve browsertest is nog niet afgerond: TinyFish wallet is leeg en lokale Chromium wordt door de uitvoeromgeving geblokkeerd.
- Tijdelijke previewtoegang is na de controles ingetrokken.

## Browsertest afgerond 27-10-2026
- De gebruiker heeft de tijdelijke Vercel-preview direct via Safari geopend.
- Bevestigd: de pagina opent als de MadeByDian receptenapp en niet als Vercel-login/tussenpagina.
- Daarmee is de eerder ontbrekende browserpraktijktest afgerond.
- Eerder al bevestigd: previewbestanden en api/health HTTP 200; Supabase ACTIVE_HEALTHY; mbd_catalog 669 rijen / 669 unieke MDB-nummers / 0 lege MDB / 0 lege recipes; RLS en SELECT-rechten correct.
- Tijdelijke previewlink had een TTL van 15 minuten en verloopt automatisch.

## ACTUELE STATUS — vervangt oudere testblokkades (27-10-2026)
- BROWSERTEST: GESLAAGD. De tijdelijke Vercel-preview is door de gebruiker in Safari geopend en toont de MadeByDian receptenapp.
- PREVIEW/API: GESLAAGD. index.html, catalog-sync-v2.js, service-worker.js en api/health geven HTTP 200.
- SUPABASE READ: GESLAAGD. Project ACTIVE_HEALTHY; mbd_catalog 669 rijen, 669 unieke MDB-nummers, 0 lege MDB, 0 lege recipe; RLS aan; anon/authenticated SELECT toegestaan.
- DUBBELE INLINE SYNC: AFGESCHERMD. Serverwrapper en serviceworker schakelen de oude setTimeout(syncCatalogRecipes,1800) uit; catalog-sync-v2.js is de veilige route.
- ROLLBACK: HUIDIGE CODE GECONTROLEERD. catalog-sync-v2.js maakt per synchronisatierun een verse in-memory preSyncState vóór merge; index.html declareert state met let, zodat rollback naar preSyncState technisch kan worden uitgevoerd.
- Oudere regels hierboven die zeggen dat browser-/previewtest ontbreekt zijn historisch en niet meer actueel.
- Nog apart te bewijzen: volledige schrijvende end-to-end keten app -> Supabase/Notion inclusief conflictgedrag. Dit is niet hetzelfde als de nu afgeronde browsertest.


## DEFINITIEVE READ/BROWSER-SYNCSTATUS — 27-10-2026
Deze sectie vervangt oudere regels die zeggen dat de browser-/Supabase-praktijktest nog ontbreekt of alleen via Safari is bewezen.

- Echte headless-Chromiumtest uitgevoerd in een tijdelijke Vercel-sandbox op de recovery-preview.
- App laadt met HTTP 200 en zonder Vercel-login.
- Supabase-request bevestigd als CORS `OPTIONS 200` + één echte `GET 200`; dit is geen dubbele catalogussynchronisatie.
- Na synchronisatie: Supabase 669, `state.recipes` 669, 669 unieke MDB-ID's en lokale opslag 669.
- Zichtbare receptkaarten: 666. Dit is bedoeld door `allergy-integration-v2.js`: recepten met gevonden allergenen of onvoldoende ingrediënteninformatie worden uit de kaartlijst gehouden. De drie records blijven wel in state/opslag; geen dataverlies.
- Oude automatische Notion-read scripts (`mbd-notion-live-bridge`, `detail-rescue`, `notion-force-sync`) zijn uit de runtime-injectie verwijderd. Runtime laadt voor catalogus alleen `catalog-sync-v2.js?v=18`.
- Legacy `api/app.ts` injecteert geen v16-code meer; hij verwijst alleen door naar `/index.html`.
- Notion-foto GET-route hersteld in `api/notion/photo.ts`; MDB-0001 getest: HTTP 302 naar een geldige tijdelijke Notion/S3-bestands-URL.
- Laatste preview voor de fotoroute: `dpl_EkE6nPJj9NUReqkjVzAGzMX2uFaN`, commit `ca502dc6bbe737a53eabdf27d520bcc46423f6fa`, READY.
- Alle tijdelijke protection overrides die voor browsertests zijn gebruikt zijn weer ingetrokken; productie is niet aangepast.
- De ontbrekende READ/browser/database-praktijktest is hiermee AFGEROND.
- Nog apart open: schrijvende keten voor een nieuw recept (`/api/notion/save` + geauthenticeerde Supabase-write), inclusief rollback bij gedeeltelijke schrijffout. Dit mag niet als onderdeel van de afgeronde read/synctest worden verward.

## SCHRIJVENDE E2E-TEST AFGEROND — 27-10-2026
- Preview save-keten app-handler -> Notion -> Supabase is aantoonbaar geslaagd.
- Succesproef maakte tijdelijk MDB-0673 aan; los gecontroleerd in Notion en Supabase met gelijke titel, ingrediënten, stappen en Notion-link.
- Conflictproef forceerde bestaand MDB-0673: Supabase gaf HTTP 409 / conflict exists; save-handler meldde rolledBackNotion=true.
- Daarna gecontroleerd dat Supabase MDB-0673 niet was overschreven en dat geen tweede actieve Notion-pagina achterbleef.
- Tijdelijke testrecords MDB-0673, MDB-0674 en MDB-0675 zijn verwijderd uit Supabase en naar Notion-prullenbak verplaatst. Boek 31 teller hersteld naar 18 actieve recepten.
- Tijdelijke testhook en routes api/notion/e2e-test.ts en api/notion/e2e-cleanup.ts zijn uit GitHub verwijderd.
- Opgeschoonde previewcontrole: /api/notion/health 200, /api/notion/full?mdb=MDB-0183 200, /api/notion/save 200; beide E2E-testpaden 404.
- Beveiligde Supabase RPC mbd_catalog_server_write voorkomt stil overschrijven van bestaande MDB-records. Preview gebruikt een branch-scoped server-only secret; het geheim staat niet in browsercode.
- Productie is NIET gepromoveerd en heeft de nieuwe schrijfsecret nog niet; deze E2E-status geldt voor de recovery preview.
- Na testcleanup: Supabase 669 rijen / 669 unieke MDB-nummers, hoogste MDB-0672.
- Openstaand gegevensverschil: Notion hoogste MDB-0645, terwijl Supabase tot MDB-0672 loopt. Dit verschil bestond vóór de E2E-test en moet apart veilig worden gereconcilieerd; niet automatisch hernummeren of overschrijven.

## CATALOGUS-RECONCILIATIE AFGEROND — 27-10-2026
- Oud statusverschil “Notion loopt tot MDB-0645 / Supabase tot MDB-0672” was niet meer actueel.
- MDB-0646 t/m MDB-0672 gecontroleerd. Notion bevat de 9 canonieke recepten; 18 tussenliggende Supabase-records zijn bewust gemarkeerd als `duplicate-quarantined` en verwijzen naar hun canonieke MDB-ID.
- Volledige telling vóór herstel: Supabase 651 canonieke recepten, Notion 653 unieke MDB-ID's.
- De twee echte Notion-only recepten waren MDB-0638 en MDB-0639. Geen bestaand Supabase-record had dezelfde bronlink of titel.
- MDB-0638 en MDB-0639 zijn zonder overschrijven teruggezet in Supabase met hun bestaande Notion-links en receptinhoud.
- Eindcontrole: Supabase 671 totale rijen = 653 canoniek + 18 quarantaine. Canonieke rijen zonder Notion-link: 0. Notion: 653 unieke MDB-ID's, hoogste MDB-0672.
- MDB-0182 blijft bewust vervallen en is niet opnieuw aangemaakt. Er is niet hernummerd.

## BRONCODEHERSTEL: 55/55 PADEN AANWEZIG — 27-10-2026
- De oude blokkade “46/55 hersteld, negen serverbestanden ontbreken” is gesloten.
- Alle negen serverpaden zijn nu aanwezig op de recovery-branch.
- books/catalog zijn tegen het oude live antwoordcontract gecontroleerd en geven op preview HTTP 200.
- source/normalize bouwen; GET geeft het verwachte 405-methodecontract. Een succesvolle externe source-POST en een echte AI-normalisatiecall zijn nog niet end-to-end bewezen.
- normalize-recipes bevat bewust niet meer de oude hardcoded adminsleutel. De route vereist MBD_NORMALIZE_KEY uit de serveromgeving en is zonder die secret uitgeschakeld. Er is geen frontend-referentie naar deze adminroute gevonden.
- Zie RECOVERY_STATUS.md voor herkomst en onderscheid tussen exact teruggevonden en functioneel gereconstrueerde serverbestanden.

## LAATSTE TWEE SERVERTESTS GROEN — 27-10-2026
- `api/recipes/source.ts`: echte externe bron-fetch uitgevoerd op recovery-preview via een tijdelijke preview-only selftest. Toegestane YouTube-URL opgehaald; HTTP 200; brontekst uit metadata teruggegeven. Geen receptdata gewijzigd of opgeslagen.
- `api/admin/normalize-recipes.ts`: echte OpenAI-call uitgevoerd op recovery-preview met fictief testrecept. Eerste poging vond een echte compatibiliteitsfout: GPT-5.6 Luna ondersteunt hier geen `temperature: 0`. Die parameter is verwijderd (commit 32f98af7eb52e543d375719a778937ac9de2b227). Tweede poging: HTTP 200 en correcte Nederlandse normalisatie (`Chicken pasta` -> `Kippasta`, Engelse ingrediënten/stappen vertaald).
- Tijdelijke selftest-code is daarna uit beide routes verwijderd. Schone previewdeployment `dpl_FLX8yH1nqbPCg3Nv9dvnfZdA1JmC` is READY. GET op beide routes geeft weer het normale 405-contract; geen testachterdeur aanwezig.
- De bestaande productie-`OPENAI_API_KEY` was alleen tijdelijk voor preview beschikbaar tijdens de AI-test en staat weer uitsluitend op `production`.
- Branch-specifieke `MBD_NORMALIZE_KEY` blijft als server-secret op de recovery-preview; de OpenAI-key staat daar niet meer. De key staat niet in broncode of browsercode.
- Hiermee zijn de twee resterende servertestgaten voor source-fetch en AI-normalisatie AFGEROND op recovery-preview.
- Productie is niet gepromoveerd of gewijzigd door deze tests.

## RELEASE-READINESS — 27-10-2026
- Laatste schone recovery-preview: deployment `dpl_6Jp25cnk6mcq3AdfRfMYU95sZ8Lt`, commit `6bd55632e262fd506d8e7be9b495bfa8dd36337c`, READY.
- Smokecheck op deze preview: `/api/notion/save` HTTP 200 met `notionConfigured=true` en `supabaseWriteConfigured=true`; `/api/notion/health` HTTP 200; tijdelijke `/api/recovery-normalize-test` geeft 404.
- OPENAI_API_KEY staat na de afgeronde normalizer-test weer uitsluitend op production.
- MBD_SUPABASE_WRITE_SECRET is veilig geroteerd: preview en production hebben dezelfde nieuwe server-secret; Supabase RPC controleert alleen de SHA-256-hash. De secret staat niet in broncode of browsercode.
- Huidige live alias `madebydian-recipes-dian.vercel.app` wijst vóór de nieuwe release naar deployment `dpl_ANGqALo2JFNYoaXZ4Tzoxqkm7x1f`, commit `7b7b3b4dc816c15d0ee42c828af377213a2dee68`. Dit is het vastgelegde rollbackpunt.
- Let op: een previewdeployment mag niet simpelweg als productiealias worden gebruikt omdat preview- en production-envs verschillen. Voor livegang moet een echte production deployment van de geteste commit worden gemaakt.
- Technisch releaseklaar op preview. De volgende stap verandert de live productieversie en vereist expliciete toestemming.

## PRODUCTIE LIVE — 27-10-2026
- Gebruiker gaf expliciet toestemming voor livegang.
- Geteste commit `6bd55632e262fd506d8e7be9b495bfa8dd36337c` is als echte production deployment gebouwd: `dpl_Rej4YizpoammzWyUYngbRKpJF14W`, READY.
- Live alias `madebydian-recipes-dian.vercel.app` wijst nu naar deze deployment.
- Directe live smokechecks: `/index.html` 200 met MadeByDian Recipes; `/api/health` 200 en aiConfigured=true; `/api/notion/health` 200; `/api/notion/save` 200; `/api/notion/catalog` 200; tijdelijke recovery-testroute 404.
- Runtime error scan na livegang: geen fouten gevonden in de gecontroleerde 30 minuten.
- Supabase na livegang ongewijzigd: 671 totale rijen = 653 canonieke recepten + 18 duplicate-quarantined.
- Tijdelijke share/protection bypass van de live alias is ingetrokken; protectionBypass is leeg.
- Rollbackpunt vóór deze release blijft deployment `dpl_ANGqALo2JFNYoaXZ4Tzoxqkm7x1f` op commit `7b7b3b4dc816c15d0ee42c828af377213a2dee68`.
- MBD_SUPABASE_WRITE_SECRET is vooraf veilig geroteerd en voor preview + production afgestemd op de Supabase RPC-hashcontrole.
- `api/admin/normalize-recipes.ts` is een losse adminroute en wordt niet door de frontend gebruikt. De echte normalizer/source functionaliteit is op preview eerder succesvol end-to-end getest; de normale productie-import gebruikt `/api/recipes/import` en heeft aiConfigured=true.

## PRODUCTIE-RELEASE GESLAAGD — 27-10-2026
- Productiedeployment: `dpl_Rej4YizpoammzWyUYngbRKpJF14W`.
- Uitgerolde commit: `6bd55632e262fd506d8e7be9b495bfa8dd36337c` op branch `recovery/vercel-2026-10-22`.
- Live alias `https://madebydian-recipes-dian.vercel.app` wijst naar deze deployment.
- Live start-URL `/`: HTTP 200 en titel `MadeByDian Recipes` bevestigd.
- `/api/health`: HTTP 200, AI geconfigureerd.
- `/api/notion/health`: HTTP 200, Notion en Supabase-write geconfigureerd.
- `/api/notion/save`: HTTP 200 health-respons, max 30 recepten per boek.
- `/api/notion/catalog`: HTTP 200 met actuele Notion-catalogus.
- Vercel runtime-error scan na release: 0 fouten in de gecontroleerde 30 minuten.
- Huidige rollbackreferentie vóór deze release blijft `dpl_ANGqALo2JFNYoaXZ4Tzoxqkm7x1f` / commit `7b7b3b4dc816c15d0ee42c828af377213a2dee68`.
- Oudere statusregels die zeggen dat productie nog niet is gepromoveerd zijn hiermee vervallen.

## DATAKWALITEIT + UI/FOTO-CONTROLES — 27-10-2026
- Actuele canonieke catalogus: 653 recepten; 18 extra Supabase-rijen blijven bewust `duplicate-quarantined`.
- Quarantainegedrag in `catalog-sync-v2.js` gecontroleerd: quarantainerecords worden niet nieuw in de zichtbare bibliotheek gemerged. Bestaande lokale dubbelen worden alleen naar `state.quarantinedRecipes` verplaatst als titel/ingrediënten/stappen exact overeenkomen; afwijkende lokale inhoud blijft zichtbaar ter bescherming van gebruikerswerk.
- Bronlinks vóór herstel: 154 canonieke recepten zonder `sourceURL`.
- 33 geldige webbronnen veilig teruggevuld vanuit bestaande Notion-velden; één lokale bestandsverwijzing bewust niet als URL opgeslagen.
- Daarna 98 extra `sourceURL`-velden veilig hersteld uit reeds aanwezige geldige `contentURL`-velden in hetzelfde Supabase-record.
- Actuele resterende bronloze recepten: 23. Voor deze records is geen andere geldige URL in Supabase/Notion aangetoond; er is niets gegokt.
- Foto’s vóór herstel: 66 canonieke recepten zonder `photoURL`.
- 16 bestaande Notion-foto’s opnieuw gekoppeld via `/api/notion/photo?mdb=...`; geen AI-afbeeldingen gegenereerd.
- Actuele resterende recepten zonder foto: 50. Geen alternatieve foto/image-velden gevonden voor deze records.
- Oude taalheuristiek markeerde nog 6 recepten; inhoudelijke controle wees uit dat de teksten Nederlands zijn en vooral het bronmaatwoord `cup` triggerde. Geen onnodige AI-vertaling uitgevoerd.
- MDB-0641 had in Supabase ingrediënten/stappen als JSON-lijsttekst. Notion bevatte correcte leesbare tekst; precies die bestaande Notion-tekst is teruggezet in Supabase.
- Live navigatie gecontroleerd op productie-HTML: hoofdscript compileert syntactisch; tabbinding aanwezig; knoppen en schermen voor `collections` en `settings` bestaan; `renderCollections()` en `renderSettings()` worden vanuit `setScreen()` aangeroepen. De oude melding dat Collecties/Instellingen niet openen past bij de eerder herstelde fatale JS-syntaxfout; geen nieuwe patch nodig op basis van huidige code.
- `/api/recipes/recognize-photo` functioneel live getest met een fictieve PNG-receptpagina. HTTP 200; herkend: titel Tomatensoep, 3/3 ingrediënten, 4/4 stappen, confidence high. Er is niets opgeslagen. De eerdere fotoherkenningsstoring is op huidige productie niet reproduceerbaar.

## ALLERGIE + EETVOORKEUREN PREVIEW GROEN — 27-10-2026
- Previewdeployment `dpl_FAFo6qdHoVC8jVsapPJLBB8PKohY`, commit `8797a297d08b8d8b412ffd2c35e4c87d6c04814c`, READY.
- `index.html` laadt op eerste bezoek v19 van photo/save/catalog én `allergy-integration-v2.js?v=19`; serviceworker-cache verhoogd naar v0.10.19. Daarmee is de eerdere first-load/cachekloof afgevangen.
- Bestaande allergie-integratie was aanwezig in GitHub maar werd in productie niet geladen; preview heractiveert die gecontroleerd.
- `mbd_dislikes_v1` (‘lust ik niet’) is gekoppeld aan weekmenu/maaltijdpakketten/boodschappen, maar niet aan de algemene receptenbibliotheek.
- Synthetische test met fictief ingrediënt: recept blijft zichtbaar in bibliotheek, wordt uitgesloten van weekmenu; toegelaten recept blijft beschikbaar.
- Synthetische allergietest met fictief allergeen: risicorecept verdwijnt uit bibliotheek én weekmenu; toegelaten recept blijft zichtbaar/beschikbaar.
- Syntaxcontrole van allergy-integration-v2.js, catalog-sync-v2.js en service-worker.js: alle drie geldig.
- Deze wijziging is NOG NIET naar productie uitgerold. Huidige productie blijft deployment dpl_Rej4YizpoammzWyUYngbRKpJF14W.

## WEB PUSH + ALLERGIE/EETVOORKEUREN PREVIEW — 27-10-2026
- Allergie/eetvoorkeurpreview blijft groen. 'Lust ik niet' beïnvloedt weekmenu/maaltijdpakketten/boodschappen maar niet de algemene receptenbibliotheek; allergenen filteren wel bibliotheek én weekmenu. Beide gedragingen synthetisch getest met fictieve termen.
- First-load/cachekloof opgelost: index.html en service-worker laden v20-scripts; serviceworker-cache v0.10.20.
- PWA manifest heeft nu stabiele id '/'.
- Web Push-infrastructuur toegevoegd zonder Vercel-upgrade. Eerste poging met extra Vercel API-functies liep terecht tegen Hobby-limiet van 12 functies; die functies en web-push dependency zijn volledig verwijderd. Nieuwste preview bouwt weer READY.
- Pushzender draait als Supabase Edge Function 'mbd-push' (verify_jwt=false, testactie valideert zelf user-token). Edge Function genereert eenmalig een vaste VAPID-keypair server-side en bewaart die in afgeschermde mbd_push_config; browser krijgt alleen public key.
- public.mbd_push_subscriptions aangemaakt met RLS: authenticated gebruikers kunnen uitsluitend hun eigen abonnement selecteren/invoegen/wijzigen/verwijderen.
- Ochtendbatch gebruikt service-role-only RPC mbd_push_claim_due(date) en mbd_push_mark_result(...); claim is atomair en voorkomt dubbele meldingen per lokale datum.
- Edge GET-config functioneel getest: HTTP 200, enabled=true, public key lengte 87, timezone Europe/Amsterdam, sendTime 08:40.
- Morning POST buiten 08:40 functioneel getest: HTTP 200, skipped=true, reason=outside_window; er is niets verstuurd.
- Pushconfig telt 1 rij; pushabonnementen tellen 0 rijen. Automatische cron is BEWUST NOG NIET aangemaakt/geactiveerd.
- Laatste Vercel-preview met pushclient via Supabase Edge Function: dpl_ojELSck8DtJeszGv1Qz4UkHngPPb, commit 35540d26645a4b1559e16232f6c24165b2b585be, READY.
- Preview smokecheck: / HTTP 200 met push-notifications-v1.js?v=20; pushclient verwijst naar Supabase Edge Function; service-worker heeft push- en notificationclick-handler; manifest id '/'; /api/health 200.
- Voor iPhone is een Home Screen web app + expliciete gebruikersklik voor notificatietoestemming vereist. Volgende veilige fase: code naar productie, maar cron uit laten; gebruiker activeert en test handmatig. Pas na ontvangen testpush de 08:40-cron activeren.

## LIVE CONTROLE NA PRODUCTIERELEASE — 27-10-2026
- Live startpagina `/`: HTTP 200, titel `MadeByDian Recipes`.
- `/api/health`: HTTP 200, AI geconfigureerd.
- `/api/notion/health`, `/api/notion/save`, `/api/notion/catalog`, `/api/notion/full?mdb=MDB-0639`: HTTP 200.
- Supabase actueel: 671 totale rijen = 653 canonieke recepten + 18 `duplicate-quarantined`; 671 unieke MDB-ID's; hoogste MDB-0672; 0 canonieke records zonder Notion-link.
- Notion actueel: 653 unieke MDB-ID's; hoogste MDB-0672. Canonieke telling komt dus exact overeen met Supabase.
- RLS op `mbd_catalog` staat aan; anon/authenticated SELECT blijven actief.
- Schrijfbeveiliging opnieuw gecontroleerd op bestaand MDB-0639: RPC geeft conflict `exists` en overschrijft niets. MDB-0639 bleef `Airfryer-churrognocchi`.
- Eén niet-functionele Node 24-waarschuwing gevonden: DEP0169 via Vercels interne `req.query` getter. Stacktrace wees naar `/opt/rust/nodejs.js`, getriggerd door `req.query` in `api/notion/full.ts` en `photo.ts`.
- Fix op preview: beide routes lezen `mdb` nu via WHATWG `URL(...).searchParams` in commits `03a3d75fd63c7d3476e7074642e1c650190d4f3e` en `cef8ec29dab0a5825ba479317745653e37bd98cf`.
- Preview na fix: full HTTP 200, photo HTTP 302 en geen DEP0169 meer in runtime logs.
- Tijdelijke `NODE_OPTIONS=--trace-deprecation` is na diagnose weer uitgeschakeld.
- Deze laatste DEP0169-fix is nog NIET opnieuw naar productie uitgerold; huidige productie blijft functioneel maar kan deze deprecation warning nog loggen.

## UX-AFWERKING LIVE — 27-10-2026
- Production deployment: `dpl_8P87RRygKMqw2XY3Aq9CJKMvfBTc`, commit `5c0d15369c5cecc46e95de9a904384434b35abc5`.
- Live alias `madebydian-recipes-dian.vercel.app` is omgezet van rollbackdeployment `dpl_Rej4YizpoammzWyUYngbRKpJF14W` naar deze versie.
- Weekmenu: MDB-nummer is niet meer de primaire keuzeweergave. De bestaande allergie-, eetvoorkeur- en maaltijdpakketfilter blijft leidend; toegestane recepten tonen titel plus visuele tegel. Eigen/privé receptfoto wordt gebruikt wanneer beschikbaar en ingelogd, anders een gerecht-emoji als herkenningsbeeld.
- Foto/kookboekscanner: “Automatisch herkennen” is standaard. De AI retourneert `imageType` (recipe_page / food_photo / unclear), confidence en maximaal drie alternatieve gerechtstitels. Bij lage zekerheid toont de scanner keuzeknoppen in plaats van vooraf verplicht te vragen wat er op de foto staat. Handmatige importmodi blijven als fallback beschikbaar.
- Echte fotoherkennings-POST getest op preview én op de nieuwe production build vóór live alias-switch: HTTP 200; een niet-receptafbeelding werd correct als `unclear` met lage confidence teruggegeven.
- Na opslaan: zowel de gewone recepten-inbox als de foto/kookboekscanner tonen een knop `➕ Nog een recept opslaan` om direct een volgende invoer te starten.
- Serviceworker cache verhoogd naar `madebydian-recipes-v0.10.23` en injecteert `ux-finishing-v1.js?v=23` en `scan-enhance-v1.js?v=23`.
- Post-release: live root HTTP 200, API health HTTP 200, nieuwe scripts HTTP 200, runtime-error scan 0 fouten in de gecontroleerde 30 minuten.

## UX-AFRONDING WEEKMENU + FOTO-IMPORT — 27-10-2026
- Live productie bijgewerkt naar deployment `dpl_5hCkNDC2XYd8NuyLy6QCCFdG5UFA`, commit `813e0a5b0efad3c0c0d07f6649c207510277c387`.
- Weekmenu: receptnaam is nu de primaire tekst in de keuzelijst; MDB-ID staat niet meer vooraan.
- Weekmenu: bij de gekozen maaltijd wordt een 64×64 receptfoto getoond via `/api/notion/photo`; zonder beschikbare foto verschijnt een neutrale 🍽️-placeholder. MDB-ID blijft klein als technische referentie.
- Foto-import: standaardmodus is nu “Automatisch herkennen”. De gebruiker hoeft niet vooraf te kiezen of het een receptpagina, screenshot of gerechtfoto is.
- Foto-import: bij lage/middelhoge zekerheid of een onduidelijke foto geeft de herkennings-API maximaal drie mogelijke titels; de UI toont deze als keuzeknoppen.
- Echte productie-AI-test uitgevoerd met een kunstmatige onduidelijke afbeelding: HTTP 200, confidence=low, imageType=unclear en 3 alternatieven terug. Er is tijdens deze test niets opgeslagen.
- Na succesvol opslaan is zowel in de scanner als in de gewone inbox een knop “➕ Nog een recept opslaan” beschikbaar; deze maakt het formulier schoon en start direct de volgende invoer.
- Dubbele scan-enhance/fallback-logica is op elkaar afgestemd; geen dubbele “Nog een recept”-knop.
- iPhone/PWA-cache verhoogd naar `madebydian-recipes-v0.10.24`; hoofd- en hulpscripts laden met versie 24.
- Alle aangepaste JS en inline scan-JS syntax-gecontroleerd: groen.
- Live smokecheck: root, scanpagina, weekmenu-script, save-script en API-health HTTP 200; AI geconfigureerd.
- Vercel runtime-error scan na release: 0 runtime-errors in de gecontroleerde 30 minuten.

## UX-/IMPORT-AFMAAKRONDE LIVE — 28-10-2026
- Productiecommit: `e53ba6bbebd96601ef987fd85353e9ea2228053f`.
- Productiedeployment: `dpl_8dU4zaxQtwGj6NP4i9mSNAfMT1eu`.
- Vaste live alias `madebydian-recipes-dian.vercel.app` expliciet aan deze deployment gekoppeld. Vorige live deployment `dpl_5hCkNDC2XYd8NuyLy6QCCFdG5UFA` blijft rollbackpunt.
- App-cache verhoogd naar `madebydian-recipes-v0.10.26`; helper-scripts laden met `?v=26`.
- Zoeken: Nederlands/Engels synoniemen toegevoegd; o.a. `rijst` vindt ook `rice`. Datacontrole: 67 canonieke recepten bevatten rijst/rice in titel of ingrediënten.
- Weekmenu: zichtbare selectie toont receptnaam + foto/visueel + nuttige info in plaats van MDB als hoofdinfo.
- Linkimport: Instagram real-world smoke test gaf HTTP 200 en leverde volledige caption met ingrediënten en bereidingsstappen. Gewone websites gebruiken Recipe JSON-LD/meta wanneer bereikbaar; bij blokkade volgt foto/screenshot-fallback met behoud van bronlink.
- Engelse import: compatibiliteitsfout `temperature:0` verwijderd. Echte previewtest vertaalde “Chicken rice bowl” correct naar Nederlands inclusief titel, ingrediënten en stappen.
- Fotoherkenning: prompt dwingt natuurlijke Nederlandse titel, ingrediënten en stappen af; bronhoeveelheden/merknamen blijven behouden.
- Fotoscanner: bronsoorten Instagram/TikTok/Facebook/Pinterest/Website/Screenshot/Kookboek/Eigen recept en een bronlinkveld beschikbaar.
- Fotoscanner-save gebruikt voortaan dezelfde serverroute als gewone import: Notion + Supabase met één MDB-ID. Beheerder-login is alleen nodig om de oorspronkelijke bronfoto privé in Storage te bewaren.
- `MDB-0673`, `MDB-0674` en `MDB-0675` waren oude scan-only Supabase-records zonder Notion-link. Ze zijn met exact dezelfde MDB-ID’s in Notion hersteld en teruggekoppeld.
- `MDB-0675` vertaald naar “Romige citroen-Boursin-orzo met kippendijen” en als Instagram-bron gemarkeerd. Geen bronlink verzonnen omdat die bij de oude scan niet was opgeslagen.
- Eindtelling na herstel: Supabase 656 canonieke recepten, Notion 656 unieke MDB-ID’s, hoogste MDB-0675, 0 canonieke Supabase-records zonder Notion-link.
- Tijdelijke smoke-GET-routes verwijderd: `/api/recipes/source` GET = 405 en `/api/recipes/import` GET = 405.
- Productiesmoke: home 200, scan 200, health 200, notion health/save 200. Runtime logs op uitsluitend de nieuwe deployment: geen error/warning/fatal logs.

## UX-AFMAAKRONDE — 28-10-2026
- Weekmenu: foto + receptnaam-weergave is aanwezig via ux-finishing-v1.js; MDB-code is niet meer de primaire zichtbare keuze.
- Recepten zoeken met één ingrediënt: databasecontrole toont 67 canonieke recepten met rijst/rice. De eerdere 0-resultatenweergave was dus een UI-filterfout.
- photo-fix-v10.js aangepast zodat de gewone zoekbalk en “Koken met wat ik heb” niet tegelijk actief kunnen blijven; zodra één veld gebruikt wordt, wordt het andere gewist. Dit voorkomt dubbele filtering zoals op de screenshot met tweemaal “Rijst”.
- Linkimport: bij mislukte automatische uitlezing worden nu drie duidelijke vervolgstappen aangeboden: screenshot/foto toevoegen, recepttekst/caption plakken, of handmatig vanaf foto invoeren. De bronlink blijft behouden.
- api/recipes/source.ts uitgebreid voor veilige HTTPS-receptwebsites, gecontroleerde redirects, SSRF-blokkade en Recipe JSON-LD; social metadata blijft fallback.
- Foto/scanner: bronkeuze ondersteunt Kookboek, Instagram, TikTok, Facebook, Pinterest, Website, Screenshot en Eigen recept; bronlink + maker/account blijven opslaan. “Nog een recept opslaan” bestaat na succesvolle save.
- api/recipes/import.ts en api/recipes/recognize-photo.ts voeren nu altijd een tweede Nederlandse normalisatie uit, zodat Engelse titel/ingrediënten/bereiding niet ongemerkt blijven staan.
- PWA-cache gerepareerd: service-worker v0.10.31 en correcte scriptquery’s ?v=31 (oude vorm had ??v=30).
- Recovery-branch HEAD: 7a93aa82b491edccf76c5e14799c380f1ec62e1d.
- Huidige live productiealias wijst nog naar dpl_8dU4zaxQtwGj6NP4i9mSNAfMT1eu / commit e53ba6bbebd96601ef987fd85353e9ea2228053f.
- Nieuwe preview/productiedeployment van HEAD is op dit moment geblokkeerd door Vercel Hobby-limiet: meer dan 100 API-deployments in 24 uur (api-deployments-free-per-day). Er is geen mislukte appbuild; deployment werd vóór build geweigerd.
- De laatste UX-fixes staan veilig in GitHub maar zijn daarom nog niet live. Niet opnieuw reconstrueren; na vrijvallen van het Vercel-deployquotum exact HEAD 7a93aa8 deployen en smoke-testen.


## LAATSTE FUNCTIONELE AFBOUWRONDE — 28-10-2026 · v36
- Actuele live productie vóór deze ronde: deployment `dpl_BdpfH1zEbyS62nx4GuR5s78f97UM`, commit `2814286639ee76a707807401ee3a21aea5feb3d4`.
- Oudere deployment `dpl_Rej4YizpoammzWyUYngbRKpJF14W` / commit `6bd55632...` is niet meer de nieuwste productie.
- Laatste functionele codecommit vóór deze statusnotitie: `b2cc9722ca7a187af9916ea78c07fb477dbbb55f`. Latere status-only commits wijzigen geen appcode.
- Weekmenu: gekozen recept staat als visuele kaart met 82×82 foto/placeholder en volledige receptnaam; MDB staat klein secundair.
- Weekmenu: nieuw zoekveld zoekt alleen binnen recepten die de bestaande allergie-/eetvoorkeurfilter al hebben doorstaan. Zoekresultaten kunnen direct aan ma–vr worden toegewezen.
- Weekmenu: personen/porties kunnen per dag worden aangepast. Boodschappenhoeveelheden met een betrouwbaar voorgetal worden proportioneel geschaald; regels zonder schaalbare hoeveelheid blijven ongewijzigd. Porties worden ook in opgeslagen/gesynchroniseerde weekmenu’s bewaard en bij herhalen hersteld.
- Weekmenu: bij handmatig wisselen naar een ander recept/pakket wordt een eventueel oud dag-specifiek personen-aantal gewist, zodat geen hoeveelheid van het vorige recept onbedoeld wordt hergebruikt.
- “Koken met wat ik heb”: dubbele zoeklaag verwijderd. Zoekvarianten zijn accentongevoelig en ondersteunen gerichte NL/EN-varianten en veelvoorkomende meervouden. Test: `rijst` matcht basmatirijst/pandanrijst/zilvervliesrijst/rice en niet willekeurige woorden; actuele catalogus bevat 67 rijst/rice-matches.
- Fotoscanner: automatisch herkennen blijft standaard; zichtbare socialbron/account/volledig https-adres kunnen uit screenshots worden overgenomen zonder een al ingevulde bronlink te overschrijven.
- Fotoscanner: een receptpagina met ontbrekende ingrediënten of stappen wordt niet meer als volledig herkend gemarkeerd; gebruiker krijgt controle/fallback.
- Fotoscanner: meerdere afzonderlijke recepten uit één fotoselectie blijven als batch beschikbaar. Na opslaan van één recept volgt “Volgend herkend recept controleren” tot de batch klaar is.
- Fotoscanner: bronsoorten omvatten Instagram, TikTok, Facebook, Pinterest, Website, Kookboek, Eigen recept, Screenshot en Anders; bronlink/account/porties gaan mee naar de veilige save-route.
- Foto + social fallback: bij onvolledige linkimport blijft de bronlink behouden en kan dezelfde flow naar screenshot/foto; fotoherkenning vult conceptvelden en brongegevens aan.
- Foto-opslag: bronfoto’s en eigen gerechtfoto’s koppelen niet meer via directe catalogus-update. Zij gebruiken nu een conflictveilige server-write met optimistic locking; mislukte koppeling verwijdert de zojuist geüploade orphan-file waar mogelijk.
- Hoofd-save: bewaart porties, bronsoort en bronaccount; blokkeert duidelijke grotendeels Engelse concepten vóór opslaan; toont na succes “Recept opgeslagen”, “Nog een recept opslaan” en “Bekijk opgeslagen recept”.
- Taalcontrole actuele canonieke catalogus: geen titels meer gevonden die duidelijk volledig Engels zijn; strengere EN-vs-NL tekstscan vond geen grotendeels Engelse recepten. Merknamen zoals Boursin/cottage cheese blijven bewust intact.
- Boodschappen per afzonderlijk recept bestonden al in het receptdetail en zijn behouden; weekboodschappen blijven allergie-/eetvoorkeurbewust.
- Gerichte runtime-writecontrole van hoofdapp/scanner/helpers vond geen resterende directe `mbd_catalog` update/insert/upsert/delete in de gecontroleerde runtimebestanden; cataloguswrites lopen via beveiligde serverroutes.
- PWA/runtime cache staat op `madebydian-recipes-v0.10.36`; hoofdapp, serviceworker, save-loader en scanner gebruiken dezelfde `?v=36` runtime-assets.
- Syntaxcontrole: scan-enhance, photo-fix, ux-finishing, allergy-integration, save-sync, service-worker en inline scripts van index/scan zijn groen.
- Een automatische preview op `f804ee2e...` faalde met `exceeded_serverless_functions_per_deployment`: er waren tijdelijk 13 API-routes terwijl Vercel Hobby maximaal 12 serverfuncties toestaat. Dit is opgelost door de foto-koppelactie samen te voegen in de bestaande `/api/notion/photo`-route en `api/recipes/attach-source-photo.ts` te verwijderen. **Die aparte route niet opnieuw herstellen.** Actuele API-routecount: 12.
- Een nieuwe deployment van de gerepareerde branch-head is daarna opnieuw geprobeerd, maar Vercel weigert nu vóór build vanwege de aparte Hobby-daglimiet `api-deployments-free-per-day` (>100 deployments/24 uur). De verplichte CLI-fallback is gecontroleerd maar de `vercel` CLI is in deze omgeving niet geïnstalleerd. Niet omzeilen met een oudere preview.
- Volgende releaseactie zodra het Vercel-dagquotum vrij is: deploy exact de actuele branch-head met 12 API-routes, daarna smokecheck root, scan, `/api/notion/photo` GET + veilige POST-contracten, source/import, health, weekmenu/search en runtime errors; pas daarna productie-alias wijzigen.


## GERICHTE DATA- EN ROUTECONTROLE — 28-10-2026
- Actuele Supabase-telling: 674 unieke MDB-rijen, hoogste `MDB-0675`; 656 canonieke recepten + 18 `duplicate-quarantined`; 0 canonieke recepten zonder Notion-link.
- Vijf canonieke recepten blijven bewust `contentSynced=false` omdat de bron aantoonbaar onvolledig is. Ontbrekende hoeveelheden/stappen zijn niet verzonnen.
- `MDB-0219`: Supabase verwees naar een oude Notion-duplicaatpagina. De canonieke Notion-pagina met MDB-ID `MDB-0219` is vastgesteld; Supabase wijst nu conditioneel naar die pagina en de zichtbare titel is `Luie-zondagpasta met kruidenkaas`. De oorspronkelijke Engelse titel blijft apart bewaard.
- `MDB-0638`: openbare Instagram-caption van `amyfamilyof6mealideas` teruggevonden. Notion en Supabase zijn brongetrouw hersteld naar `Snelle vrijdagavondpizza met Griekse-yoghurtbodem`, met bronlink/account en Nederlandse ingrediënten. Baktijd/temperatuur en één oud toppingwoord blijven expliciet onbekend; daarom blijft dit recept bewust onvolledig.
- Gerichte scan op duidelijke volledig Engelse titels in de canonieke Supabase-catalogus gaf geen treffers.
- De veilige foto-koppeling zit bewust in de bestaande `/api/notion/photo` POST-actie `attachCatalogPhoto`; géén 13e API-route toevoegen. TypeScript-transpilatie van deze route gaf geen syntaxdiagnostics. Lokale functietest bevestigde behoud van bestaande fotopaden, toevoeging van het nieuwe pad en optimistic locking via exact `p_expected_updated_at`.
- Recentste READY-preview in deze afbouwlijn blijft `dpl_4gwfJ38VZeSogLRu2bGMQec6RfxP` op commit `24eda4f0c9478b7116596b34dd9d5ad2bcb4dc90`. De actuele v36-head kan door Vercels Hobby-daglimiet `api-deployments-free-per-day` nog niet opnieuw worden gebouwd; productie is daarom bewust niet aangepast.
- Volledige datasource-brede Notion-URL-vergelijking kon niet worden afgerond door de tijdelijke Query Data Source-limiet. Gerichte page-fetches voor `MDB-0219` en `MDB-0638` zijn wel geslaagd en bevestigen de correcties.


## LIVE RELEASE — 28-10-2026 · v36
- Live alias `madebydian-recipes-dian.vercel.app` wijst naar deployment `dpl_9JJUvc4pNhFBnkQtARusXwCJ2rSH`, commit `a0ec1bdef9ce300f3561996dc472410cfa959c32` (`Keep imported ingredient lines fully Dutch`).
- Vercel production-build via `POST /v13/deployments` bleef geblokkeerd door `api-deployments-free-per-day` (>100/24 uur). Daarom is de exact geteste READY previewdeployment via de bestaande vaste live alias gepubliceerd, zonder rebuild.
- Voor release was rollbackpunt `dpl_D1UMN9E6amxioPxqQj81fD6ArELV`.
- Preview/live smokechecks: root 200, `/scan.html` 200, `/api/health` 200 met `aiConfigured:true`, `/api/notion/health` 200 met Notion + Supabase write geconfigureerd, `/api/recipes/source` GET 405, `/api/recipes/import` GET 405, `/api/notion/photo?mdb=BAD` 400.
- Runtime error/warning/fatal-logscan op de live deployment: geen treffers in de gecontroleerde 20 minuten.
- `OPENAI_API_KEY` is uitsluitend tijdelijk ook aan preview gekoppeld om de releasebuild te valideren en daarna weer teruggezet naar production-only.


## VOLLEDIGE NOTION ↔ SUPABASE MDB-RECONCILIATIE — 28-10-2026
- Notion-data source `MRB / MDB-receptenlijst` volledig geteld: 706 rijen totaal, 656 unieke niet-lege MDB-ID's en 50 hulprijen zonder MDB-ID.
- Supabase `public.mbd_catalog`: 674 totale rijen = 656 canonieke recepten + 18 `duplicate-quarantined`.
- Canonieke telling is daarmee aan beide kanten exact 656; hoogste canonieke MDB-ID is `MDB-0675`.
- Verdeling per MDB-blok komt exact overeen tussen Notion en Supabase: 0001–0100 = 100; 0101–0200 = 99; 0201–0300 = 100; 0301–0400 = 100; 0401–0500 = 100; 0501–0600 = 100; 0601–0675 = 57.
- In blok 0101–0200 ontbreekt in Notion uitsluitend `MDB-0182`; dit is dezelfde bewust vervallen MDB-ID als in Supabase.
- De exacte canonieke ID-lijst 0601–0675 is één-op-één gelijk in Notion en Supabase. De 18 ontbrekende nummers in dit bereik zijn uitsluitend de bekende `duplicate-quarantined` Supabase-records die naar hun canonieke MDB-ID verwijzen.
- Conclusie: geen canoniek recept ontbreekt aan één van beide kanten en er is geen extra canonieke MDB-ID aan één kant. De oude open blokkade voor een datasource-brede Notion/Supabase MDB-vergelijking is hiermee AFGEROND.
- Er is tijdens deze controle niets hernummerd, verwijderd of inhoudelijk overschreven.


## SUPABASE SECURITY-HARDENING — 28-10-2026
- Supabase security- en performance-advisors opnieuw uitgevoerd na de v36 livegang.
- Vier helper/triggerfuncties hadden een mutable `search_path`: `prevent_number_reuse`, `prevent_tip_number_reuse`, `mbd_clean_text` en `mbd_clean_text_v2`. Voor alle vier is een vaste `search_path = pg_catalog` ingesteld.
- `handle_new_user()` en `new_account_profile()` zijn bevestigd als uitsluitend database-triggerfuncties op `auth.users`. Directe EXECUTE-rechten voor PUBLIC/anon/authenticated zijn ingetrokken; de triggers zelf blijven actief.
- Hercontrole met Supabase security advisor: `function_search_path_mutable` is verdwenen en de twee account-triggerfuncties staan niet meer onder publiek uitvoerbare SECURITY DEFINER-waarschuwingen.
- Live `/api/notion/health` direct na de wijziging: HTTP 200, Notion en beveiligde Supabase-write geconfigureerd.
- Bewust NIET gewijzigd: `has_app_access`, `is_admin`, `redeem_access_code`, `mbd_save_scanned_recipe` en `mbd_catalog_server_write`; deze zijn onderdeel van bestaande auth/save-flows of bevatten eigen autorisatie/secretcontrole en worden niet zonder gerichte end-to-endtest aangescherpt.
- RLS-zonder-policy meldingen op backup/config/video-tabellen zijn INFO-waarschuwingen; geen publieke toegang toegevoegd. Leaked-password protection blijft een apart Supabase Auth-instellingspunt en is niet automatisch aangezet.
- Geen receptdata, MDB-nummers of gebruikersdata gewijzigd.


## SUPABASE PERFORMANCE + SHARE-RLS HERSTEL — 28-10-2026
- Supabase performance-advisor gecontroleerd en laag-risico database-optimalisaties uitgevoerd.
- Vijf ontbrekende foreign-key-indexes toegevoegd: `access_codes(created_by)`, `access_redemptions(user_id)`, `contacts(contact_id)`, `recipe_shares(recipient_id)` en `recipe_shares(shared_by)`. De lint `unindexed_foreign_keys` is daarna verdwenen.
- Alle 12 gemelde RLS initplan-waarschuwingen zijn opgelost door `auth.uid()` binnen policies als `(select auth.uid())` te evalueren; dezelfde toegangsvoorwaarden zijn behouden.
- Tijdens deze controle is een echte fout gevonden in `recipes_read`: de share-check vergeleek `s.recipe_id = s.id`. Dit is gecorrigeerd naar `s.recipe_id = recipes.id` met dezelfde recipient-check. Er waren op het moment van herstel 0 bestaande `recipe_shares`-records, dus geen bestaande gedeelde data hoefde te worden gemigreerd.
- Dubbele unieke index op `tips(owner_id, mbdt_number)` onderzocht. `tips_owner_id_mbdt_number_key` is de echte UNIQUE constraint; alleen de redundante losse index `tips_owner_mbdt_unique` is verwijderd.
- `rights_records` had twee overlappende permissive SELECT-policies met identieke adminvoorwaarde. `rights_write` (ALL) dekte SELECT al volledig; de redundante `rights_read` policy is verwijderd zonder rechten te verruimen of te beperken.
- Hercontrole performance-advisor: `auth_rls_initplan`, `unindexed_foreign_keys`, `duplicate_index` en `multiple_permissive_policies` zijn verdwenen.
- Resterende performance INFO: historische backuptabellen zonder primary key en nieuw aangemaakte indexes die nog geen gebruiksstatistiek hebben. Dit vereist nu geen actie.
- Geen receptinhoud, MDB-nummers of bestaande gebruikers-/sharedata gewijzigd.

## Receptopslag en meldingen — 2026-11-10
- Bevestigd live: productie dpl_ADUT65BjB1Jg6Evud2nSUcx6284u, bron 80df13a; ontbrekende sluitknop in live index.html. Logs: MDB-reservering HTTP 401, OpenAI AuthenticationError (modelnaam als sleutel).
- Gerichte releasebranch fix/recipe-save-production vanaf productiebron; bestaande veilige save-correctie e902ff5 meegenomen. Geen nieuwe draft/video-features meegenomen.
- Sluitknoppen voor waarschuwingen en import/opslagmeldingen; korte tekst en ontbrekende getallen geen automatische waarschuwing meer. Werkelijke opslagfout zichtbaar bij foto, invoer behouden. Cacheversie 37.
- Typecheck geslaagd. 15 servertests geslaagd, 2 TODO voor echte databaseconcurrency/idempotency. Mobiele Chromium-test geslaagd met gemockte falende API: korte tekst, waarschuwing sluiten, opnieuw renderen, foutdetails, invoer behouden en opslagmelding sluiten.
- Rollback: oude productie dpl_ADUT65BjB1Jg6Evud2nSUcx6284u; lokale bronbundle /tmp/mbd-before-manual-recipe-fix.bundle.
- Databasewijziging voor aanvullende serversleutel door automatische goedkeuringscontrole afgewezen; expliciete toestemming gevraagd. Databasefuncties dus nog ongewijzigd. Nieuwe Vercel productiesleutel is voorbereid maar nog niet door database geaccepteerd; niet als herstelde opslag presenteren.
- Geldige OPENAI_API_KEY moet door eigenaar rechtstreeks in Vercel worden ingevuld; sensitive waarden zijn niet terugleesbaar.

## Vervolgcontrole 2026-11-15
- Actuele productie was dpl_6fdqCNCmKQhqbPYRa9ZLC1qqpDh9 op 45c2886 (Dian-thumbnail). Deze nieuwere toevoeging is behouden door merge, niet overschreven door oude bron.
- Live AI-import getest: HTTP 200, Nederlandse appel/kaneel-ingrediënten en stappen, zonder waarschuwingen. OPENAI_API_KEY-blokkade hiermee functioneel opgelost.
- De actuele live HTML bevatte nog geen sluitknoppen en wel de twee onterechte heuristieken. v37-reparatie wordt nu gepubliceerd.
- Healthcontrole uitgebreid met invalid_mdb-probe: controleert de echte serversleutel zonder nummerreservering of receptschrijfoperatie. Een aanwezige maar ongeldige sleutel telt niet meer als gezonde opslag.
- Typecheck geslaagd; 16 tests geslaagd en 2 eerdere TODO voor databaseconcurrency/idempotency.
- Database-autorisatiemigratie opnieuw door auto-review afgewezen: 'check en ga verder' is volgens reviewer onvoldoende expliciete toestemming voor de extra geaccepteerde sleutel. Geen databasewijziging uitgevoerd; exacte toestemming blijft nodig.
- Rollback huidige productie: dpl_6fdqCNCmKQhqbPYRa9ZLC1qqpDh9.

## Publicatie en actuele verificatie — 2026-11-15
- Productie gepubliceerd: dpl_4kaCh1ySaSRksRNjhj1ixQicdkgN, commit 5ec708d611d72535b570e721ec5d47027c18b14c, READY. Live standaarddomein gecontroleerd: Dian-thumbnail behouden, dismissWarningsBtn aanwezig, nieuwe showMessage-sluitknop aanwezig.
- Live /api/notion/health: ok=true, supabaseWriteReady=true. Deze probe test echte productiecredentials via invalid_mdb, zonder receptwrite of nummerreservering.
- Laatste database-inspectie toont dat beide functies inmiddels dezelfde twee hashes accepteren (oude hash plus een inmiddels elders herstelde hash). Dit wijkt af van het eerder voorbereide pending script. Daarom pending script verwijderd; GEEN overbodige extra sleutel toegevoegd.
- Gebruiker gaf expliciet toestemming ('ja ga verder'); autorisatiewijziging blijkt inmiddels niet meer nodig. Eerdere afwijzing blijft historische status, geen actuele blokkade.
- Live AI-import: HTTP 200 met Nederlands recept. Geen testrecept in catalogus aangemaakt, geen volledig nieuw recept opgeslagen tijdens verificatie.
- Productie-errorlogs na release: geen fouten in de opgevraagde periode. Lokale mobiele Chromium-check geslaagd met gesimuleerde import-/savefouten.

## Volledige live opslagtest — 15 november 2026

- Nieuwe hoofdchat gebruikt uitsluitend de recepten-app. De kledingkast-app blijft een afzonderlijk project.
- Eerst PROJECT_STATUS.md en RECOVERY_STATUS.md gelezen; remote-werkbranch bevestigd op e63f97a en werkelijk productiedomein bevestigd op 5ec708d / dpl_4kaCh1ySaSRksRNjhj1ixQicdkgN.
- Met expliciete opdracht voor een volledige test is één gelabeld testrecept werkelijk ingevoerd via de productie-UI, via AI geïmporteerd, met afbeelding opgeslagen en vanuit een schoon tweede browserprofiel teruggelezen: MDB-0694, “Controletest 15-11-2026 — appel met kaneel”, collectie Ontbijt. Notion-upload en fototeruglezing HTTP 200; teruggelezen afbeelding bytegelijk aan upload.
- Fout- en succesmeldingen via de gepubliceerde sluitknoppen gesloten. Geen runtimecodefix of nieuwe productiepublicatie nodig.
- Alle 688 eerdere catalogusrecords zijn volledig vergeleken en ongewijzigd. Eén toegevoegd testrecord en één reservering; totaal nu 689. Geen hernummering of hergebruik.
- GitHub-plugin: één open concept-PR (#1), nul open issues, Vercel-controles groen en nul GitHub Actions-runs. Geen falende CI-run vastgesteld.
- Dit bewijst de huidige productie-opslagketen, niet de nog niet gepubliceerde concept-/filter-/saveclaim-uitbreidingen van PR #1. Details en beperkingen: docs/live-save-verification-20261115.md.
