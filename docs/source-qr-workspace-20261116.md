# Bronnen & QR-controle — 16 november 2026

## Gegevensonderzoek

- De alias `madebydian-recipes-dian.vercel.app` wees vóór deze uitbreiding naar `5ec708d611d72535b570e721ec5d47027c18b14c`, deployment `dpl_4kaCh1ySaSRksRNjhj1ixQicdkgN`. Deze productiecode is de basis van de uitbreiding; concept-PR #1 wordt niet mee uitgerold.
- Actief Vercel-project: `madebydian-recipes-dian`, `prj_FO4Pfsods8VF5GXvJryxbE5odmgG`, team `team_f5NfMwqj0l6k2LXrosZMM6cz`. Het project `madebydian-recipes-dians` heeft een afzonderlijke oude READY-deployment `dpl_GxxepMSz53S1cjyDQaf5MR6ed8ff` en bedient het opgegeven live domein niet.
- Supabase: `MadeByDian Recepten`, project `ywsdubincfabjhvjqkot`, ACTIVE_HEALTHY. `public.mbd_catalog` bevat 689 records: 671 buiten quarantaine en 18 `duplicate-quarantined`. Geen normalisatie of samenvoeging. De bestaande save-/synchronisatiecode gebruikt deze catalogus met Notion als gekoppelde receptinhoud. Dat daadwerkelijke gebruik en de bestaande MDB-koppelingen zijn de reden om de live catalogus te kiezen, niet het hoogste aantal of een bestandsnaam.
- 44 catalogusrecords hebben geen van de vier verwijzingen `sourceURL`, `originalSourceURL`, `contentURL`, `originalSourceRef`. 638 hebben een niet-lege `sourceURL`, 124 een niet-lege `originalSourceURL`, 305 een niet-lege `contentURL`. Dit zijn bestaande velden, geen nieuwe inhoudelijke goedkeuringen. Vier JSON-recepten missen een intern MDB-veld; de bestaande tabelsleutel blijft behouden.
- `public.recipes` en `public.mbd_import_drafts` bevatten bij de controle nul records. De bestaande accountbeveiliging en alle RLS-policies blijven ongewijzigd. De app gebruikt daarnaast browserlokale recepten en, in de nog niet gepubliceerde conceptbranch, lokale conceptopslag. Die datasets worden in de werkruimte afzonderlijk gelezen. Accountgebonden concepten worden niet buiten hun accountworkflow getoond. Recepten op andere apparaten zijn niet toegankelijk vanuit deze omgeving.
- Bestaande controles: `bibliotheek-controle.html` inspecteert lokale nummers, dubbele bronnen en onvolledige inhoud; `bulk-controle.html` vergelijkt geplakte links met de lokale bibliotheek. Geen van beide bood deze blijvende controleadministratie of QR-afbeeldingsdecodeercontrole.

## Aanvullende bestanden

Dropbox-bestand `MadeByDian_QR-en-bronregister_alle_352_recepten.xlsx`, ID `id:0xTHKQWNy7UAAAAAAAH9SA`, gevonden onder `/MadeByDian/Recepten & kookboeken/Masterbibliotheken/`. De nu toegankelijke kopie heeft client-/serverwijzigingsdatum 13 september 2026, niet de eerder genoemde 3 september. De tekstinhoud is daadwerkelijk gelezen.

Het bestand heeft 352 QR-rijen en 352 bronrijen. Alle 352 QR-inhouden zijn uitsluitend hun bestaande MDB-ID; definitieve URL's zijn volgens het register leeg. Alle 352 ID's bestaan nog in de huidige catalogus. 252 registertitels verschillen letterlijk van de huidige catalogustitel; dat is geen bewijs van een ander gerecht. Oude bronstatuslabels: 108 'Exacte originele link hersteld', 182 'Platform bekend; exacte link nog niet hersteld', 62 'Lokaal bronbestand'. Die labels en de kolomnaam 'Gevalideerde inhoudslink' worden niet als nu uitgevoerde verificatie behandeld. De extractie bewijst niet dat de ingebedde QR-afbeeldingen zelf correct decoderen; bestaande afbeeldingen moeten afzonderlijk worden getest.

Het register is historisch/aanvullend, niet automatisch geïmporteerd. De genoemde telling van 684 is historisch. Andere gevonden masterbestanden voor social media zijn geen aangetoonde receptenmaster. Lokale `pinterest-books-23-29.json` en ingebedde seedrecepten zijn aanvullende appbestanden, niet de actuele servercatalogus.

## Uitbreiding en veiligheidsgrenzen

- `/bronnen-qr.html` is een onderdeel in dezelfde repository en app, bereikbaar via hoofdnavigatie en bij recepten met een bestaand MDB-nummer.
- De bestaande `/api/notion/catalog` krijgt alleen een GET-variant `?sourceReview=1` voor de openbare Supabase-catalogus. De standaard Notion-route behoudt zijn contract. De nieuwe variant gebruikt uitsluitend de bestaande publishable key en openbare RLS-leestoegang, geen service-role of schrijfsleutel. Alle serverpagina's worden gelezen; onvolledige of dubbele resultaten geven een fout. Geen extra Vercel-serverfunctie.
- De browser krijgt de catalogus via dezelfde app-origin. Tijdens de lokale integratietest bleek de directe browserverbinding naar Supabase een certificaatketenfout te geven. Het bestaande serverpad met normale TLS-verificatie biedt een betrouwbare leesroute; certificaatcontrole is nergens uitgeschakeld. De lokale Node-testserver gebruikt de reeds geconfigureerde netwerkproxy via `NODE_USE_ENV_PROXY=1`.
- Originele velden zijn alleen-lezen. Exacte originele URL, gevalideerde bron en vervanging zijn afzonderlijke, aanvankelijk lege controlevelden. Exact-origineel en vervanging vereisen onderbouwing. Geen bron wordt automatisch vervangen.
- Controleadministratie staat in eigen IndexedDB-database op dit apparaat. Expliciete opslag per recept, transacties, revisiecontrole tussen vensters, teruglezen, versiegeschiedenis, export en bewuste herstelkeuze per recept. Geen cloud-/accountsynchronisatie van controles; dit staat prominent in de UI. Exportbestanden kunnen privénotities bevatten en moeten privé worden bewaard.
- Databases, sleutels, recepten, foto's en MDB-nummers worden niet geschreven. De oorspronkelijke browserbibliotheek wordt niet gewijzigd. Catalogus, lokale recepten en lokale concepten hebben verschillende controlesleutels. Dubbele/onstabiele lokale sleutels blokkeren opslaan.
- QR-decodeerwerk gebeurt lokaal met de gepinde jsQR 1.4.0, inclusief licentie. Geen afbeelding wordt geüpload en geen QR wordt gegenereerd. Decodeerbaarheid, exacte vergelijking met een bewust ingevulde doel-URL en de inhoudelijke bestemming zijn afzonderlijke controles. Placeholder, mismatch, onleesbaar, afgeschermd en verkeerd recept kunnen niet als geslaagd worden opgeslagen. Bestemmingsgoedkeuring blijft een expliciete menselijke waarneming, geen automatische inhoudelijke webvalidatie.
- Een gewijzigde receptversie maakt eerdere goedkeuring ongeldig. Filters, dashboard, voortgang per herstelronde en print gebruiken opgeslagen controles en de gekozen dataset. Print vermeldt expliciet dat onopgeslagen formulierwijzigingen niet zijn opgenomen.

## Back-up en rollback

- Volledige Git-bundle: `/workspace/scratch/mbd-code-before-source-workspace-20261116.bundle`, `git bundle verify` geslaagd.
- Gegevenssnapshot: `/workspace/scratch/mbd-before-source-workspace-20261116.json`, mode 600; volledige catalogus, accountrecepten, concepten, reserveringen en beleidsdefinities. SHA-256: `9791e487c3d682d27cc303048e80d29d30c3b3705057f0bf6b382351e7656bca`.
- Gelezen registerextractie blijft buiten Git onder `/workspace/scratch/mbd-historical-qr-register-20261116.json`.
- Terug naar bovenstaande productie-deployment publiceert de eerdere code; geen databaseterugzetting is nodig, want er is geen schema-/datawijziging. Lokale controleadministratie blijft apart bestaan en kan via export worden veiliggesteld.

## Validatie vóór publicatie

- 23 unit-/routetests geslaagd; 2 reeds bestaande TODO's over gelijktijdige productie-receptopslag blijven TODO, geen geslaagde tests.
- TypeScript, JavaScript-syntax en `git diff --check` geslaagd. Productieafhankelijkheden: `npm audit --omit=dev --audit-level=high` zonder kwetsbaarheden.
- 14 Playwright-controles geslaagd op desktop en iPhone-schermformaat in Chromium. Geen fysieke iPhone/Safari-test.
- Daarvan lezen twee tests de echte 689 serverrecords zonder netwerkstubs, vergelijken dashboardtellingen 689/44/689/689/689 en 18 quarantainerecords, slaan uitsluitend een lokale technische controlenotitie bij bestaand MDB-0694 op in geïsoleerde browserprofielen en lezen die na herladen terug. Geen inhoudelijke bron wordt daarmee goedgekeurd. Deze profielen zijn niet de gebruikersbrowser.
- Overige regressies gebruiken gecontroleerde fixtures: alle filters en herstelrondes, originele velden, QR-decodeerbaarheid/placeholder/mismatch/onleesbaar, inhoudelijk correcte testbestemming, afscherming, aparte vervangingskeuze, exacte-origineelbewijs, geblokkeerde opslag, netwerkuitval zonder oude masterfallback, twee vensters/revisieconflict, export/herstel/geschiedenis, mobiel zonder horizontale overloop en printselectie.

Productiepublicatie en controles op de definitieve live versie worden hieronder afzonderlijk vastgelegd zodra uitgevoerd. Geen individuele bestaande bron of QR is in deze ronde inhoudelijk goedgekeurd, vervangen of geregenereerd.
