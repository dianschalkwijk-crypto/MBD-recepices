# Werkelijke productie-opslag getest — 15 november 2026

Deze controle betreft uitsluitend MadeByDian Recepten, repository `dianschalkwijk-crypto/MBD-recepices`, en niet de kledingkast-app.

## Actuele bron en GitHub

- Werkbranch vóór de controle: `fix/recipe-save-production`, `e63f97a` (statuswijziging na de gepubliceerde code).
- Werkelijk gepubliceerde code: `5ec708d611d72535b570e721ec5d47027c18b14c`.
- Werkelijk productiedomein: https://madebydian-recipes-dian.vercel.app.
- Deployment: `dpl_4kaCh1ySaSRksRNjhj1ixQicdkgN`, READY. Deze controle heeft geen productiecode gepubliceerd.
- GitHub-plugin: één open concept-PR (#1), geen open issues, geen ingediende reviews of reviewthreads. Vercel-status van productie en PR-head: success.
- GitHub Actions: de repositorybrede runs-API geeft `total_count: 0`. Er zijn dus geen falende Actions-runs om te debuggen; de groene Vercel-bouwstatus is geen bewijs van een automatisch uitgevoerde opslagtest.

## Toestemming en back-up

De opdracht vraagt nu expliciet een volledige opslagtest met foto. Hiervoor is één herkenbaar gelabeld nieuw testrecept aangemaakt. Bestaande recepten, foto's en MDB-nummers mogen niet worden aangepast.

Vóór de test is de volledige catalogus met reserverings- en aanvraagadministratie veilig geëxporteerd naar `/workspace/scratch/mbd-before-live-e2e-20261115.json` (modus 600). SHA-256: `b5eef1bdc23ba6d93e6a808bc5679b44d9361e38486244a89233f93c33569930`. Baseline: 688 recepten, nul reserveringen, nul nieuwe saveclaims.

## Werkelijk uitgevoerd op productie

1. Een leeg importformulier toont een foutmelding. Die melding is met de gepubliceerde sluitknop gesloten.
2. Eigen Nederlandse testtekst is via het echte formulier naar de echte AI-import gestuurd. Antwoord: HTTP 200 met een Nederlands recept; geen gestubde cloudantwoorden gebruikt.
3. De reviewvelden zijn gecontroleerd en ingevuld: `Controletest 15-11-2026 — appel met kaneel`, auteur `Technische controletest`, één persoon, `1 appel` en `1 snuf kaneel`, drie bereidingsstappen en uitsluitend collectie `Ontbijt`.
4. Een JPEG-testafbeelding met duidelijk opschrift is via de werkelijke foto-invoer toegevoegd. Dit is een technische testafbeelding, geen echte gerechtfoto en geen verzonnen bronfoto.
5. Het formulier is precies één keer definitief opgeslagen. `/api/notion/save` gaf HTTP 200, `ok: true`, `MDB-0694` en een Notion-link terug.
6. De echte `/api/notion/photo`-upload naar Notion gaf HTTP 200 terug. De succesmelding vermeldde ook de opgeslagen foto en kon met de gepubliceerde sluitknop worden gesloten.
7. De foto is via het echte foto-endpoint met de browser teruggelezen: HTTP 200, JPEG, 9.849 bytes. SHA-256 van teruggelezen bestand en de door de app verwerkte upload zijn gelijk: `25ae68ec7868d46ebc5dca94a1bc1cf9046fb6881b79fb378456c7b3e34c9ad6`.
8. Een afzonderlijk, schoon desktopbrowserprofiel heeft de app opnieuw geladen. Daar is hetzelfde recept via zoeken geopend. Titel, ingrediënten, bereidingsstappen, collectie `Ontbijt`, MDB-nummer en zichtbare foto zijn bevestigd. Dit profiel had geen lokale opslag van de eerste invoersessie.
9. De database is volledig met de baseline vergeleken: alle 688 bestaande catalogusrecords zijn inhoudelijk ongewijzigd. Er is precies één nieuw record en één nieuwe reservering: `MDB-0694`. Totaal nu: 689 records. Er is niets hernummerd, verwijderd of bulkgewijs overschreven.

Notion-recept: https://app.notion.com/p/Controletest-15-11-2026-appel-met-kaneel-419486648ea9818bbd31eba74f7045a0.

De eerste browsercontrole gebruikte iPhone-schermformaat in Chromium; de tweede een vers desktopprofiel. Dit is geen test op een fysiek iPhone-toestel of in Safari. Er waren geen JavaScript-pageerrors in de invoersessie. Een losse requestclient kon de foto door een netwerkbeperking niet ophalen; daarna is uitsluitend het teruglezen met de echte browser herhaald, zonder opnieuw op te slaan. De browserterugleescontrole slaagde.

## Conclusie en afbakening

De voorheen ontbrekende volledige productie-opslagtest met foto is nu geslaagd. Hiervoor was geen runtimecodefix, sleutelwijziging, databasefunctiewijziging of nieuwe deployment nodig. Het testrecept blijft herkenbaar in de collectie `Ontbijt` staan; `MDB-0694` wordt niet hergebruikt.

De uitbreidingen in concept-PR https://github.com/dianschalkwijk-crypto/MBD-recepices/pull/1 zijn nog niet gepubliceerd. De zojuist geslaagde test op `5ec708d` bewijst niet dat de afwijkende saveclaim-/conceptsync-code van dat PR live is getest. Prioriteit na deze afgeronde opslagtest is gerichte review van dat PR en zijn nog open testgrenzen, niet het samen publiceren van alle wensen.

Lokale bewijsbestanden: `/workspace/scratch/mbd-live-e2e-result.json`, `mbd-live-before-save.png`, `mbd-live-saved.png` en `mbd-live-fresh-desktop-readback.png`. Deze zijn niet als repositorybronbestanden toegevoegd.
