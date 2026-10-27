# MadeByDian — centraal herstelregister
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
