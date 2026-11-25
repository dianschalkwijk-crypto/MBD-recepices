# Automatische productiebrowser hersteld — 19 november 2026

De twee rechtstreekse productie-browsertests slagen nu met normale HTTPS-validatie: desktop en iPhone-schermformaat, **2 passed (13,6 s)**. Dit vervangt de eerdere certificaatblokkade als actuele teststatus. Geen fysieke iPhone/Safari-test geclaimd.

## Diagnose en correctie

De systeemverbinding verifieert de door de omgevingsproxy aangeboden certificaatketen al correct. De eerste diagnose 'ontbrekend proxycertificaat in NSS' was onjuist: het certificaat uit `/usr/local/share/ca-certificates/environment-proxy-ca.crt` staat al in NSS onder de naam `OpenAI-nebula-dns`. SHA-256: `C71B4D1E9D7775C538C688AB10CEA9CE417D7312E89838F9D15FF73256CD7FC3`.

Na expliciete gebruikerstoestemming is een import onder een nieuwe naam geprobeerd. NSS herkent het bestaande certificaat; er is geen nieuwe certificaatautoriteit toegevoegd. De certificatenlijst en vertrouwensattributen vóór en na de herstelactie zijn gelijk. De databasebytes zelf kunnen door NSS-administratie veranderen; die worden niet als bewijs van een ongewijzigd bestand gepresenteerd.

De standaard afgeschermde testuitvoering laat de NSS-map alleen lezen. Dezelfde tests, browserconfiguratie en live URL slagen zodra de testuitvoering gericht schrijfrecht krijgt op **uitsluitend `/home/agent/.pki/nssdb`**. Dat is de werkende aanpassing. NSS moet zijn lokale certificaatdatabase kunnen openen/beheren. De beperkte runtime heeft verder geen nieuwe toegang tot browserprofielen of andere gebruikersbestanden gekregen.

Geen `ignoreHTTPSErrors`, `--ignore-certificate-errors`, aangepaste servercertificaten, uitgeschakelde TLS-controle of wijzigingen aan Vercel, recepten of database gebruikt. De aanvraag met aanvullend bestandsrecht is na de expliciete toestemming geaccepteerd; eerdere pogingen zonder dat recht bleven de certificaatfout geven.

## Herhaalbaar uitvoeren in Codex

Voer de volgende projectopdracht uit met de exec-instelling `sandbox_permissions: with_additional_permissions` en alleen `additional_permissions.file_system.write: ["/home/agent/.pki/nssdb"]`. Alleen de shellopdracht herhalen zonder dit recht kan de oorspronkelijke blokkade opnieuw geven. Geen HOME-variabele aanpassen en geen certificaatimport herhalen.

```sh
NODE_USE_ENV_PROXY=1 \
MBD_LIVE_SOURCE_TEST=1 \
MBD_LIVE_URL=https://madebydian-recipes-dian.vercel.app \
PLAYWRIGHT_BROWSERS_PATH=/tmp/mbd-playwright \
npx --cache /tmp/mbd-npm-cache playwright test source-live
```

Dit is een instelling van deze testomgeving, geen vereiste voor apparaten van gebruikers. De productieruntime blijft ongewijzigd op d37e75f.

## Wat daadwerkelijk is gecontroleerd

- De echte productiepagina wordt met geldige TLS geladen.
- De werkruimte leest de echte actuele catalogus en vergelijkt het dashboard met het API-antwoord.
- In geïsoleerde testbrowserprofielen wordt alleen lokale controlemetadata bij het bestaande technische recept MDB-0694 opgeslagen en na herladen teruggelezen.
- Nummer en oorspronkelijke bronvelden blijven gelijk; print voor het geselecteerde recept en mobiele breedte worden gecontroleerd.
- De tests constateren geen niet-GET-netwerkverzoeken. Er zijn geen recepten of MDB-reserveringen aangemaakt en geen bron-/QR-goedkeuringen in de servercatalogus gezet.

Bewijs: de twee geslaagde Playwright-resultaten en `/workspace/scratch/mbd-source-live-desktop.png`, `mbd-source-live-iphone-size.png`. Back-up vóór de toegestane importpoging: `mbd-browser-cert9-before-20261119.db`; lijsten `mbd-browser-trust-before-20261119.txt` en `mbd-browser-trust-after-20261119.txt` zijn exact gelijk.

Dit herstel lost uitsluitend de testbrowserblokkade op. De twee afzonderlijke opslagconcurrency-TODO's blijven open en zijn niet als opgelost gepresenteerd.
