# Herstelronde oorspronkelijke sociallinks — 134 records

Opdracht: alle 134 catalogusrecords met socialplatform maar zonder aanklikbare social-URL onderzoeken; bestaande recepten/nummers/foto's/bronvelden behouden. Geen koppeling op alleen titel, bereikbaarheid of vergelijkbaar recept.

## Resultaat gegevensonderzoek

- Alle 134 met actuele catalogus en oude bronbestanden vergeleken; 131 bijbehorende Notion-pagina's volledig gelezen. MDB-0687/0688/0689 geven 404 via zowel de app-query als de Notion-plugin; ontbreken/toegang is daarmee een concrete resterende blokkade, geen bewijs van verwijdering.
- Bronregister Excel inclusief werkelijke hyperlinks; bronregister-PDF (414 linkannotaties), MBR en MRB; Dropbox Instagram/TikTok-master origineel en v14; Google socialmasters v43/v44; Excel v33/v46/v47 inclusief hyperlinks; 72 Git-commits met één unieke seedreceptenversie; drie relevante vindbare chats onderzocht. Oudere/gearchiveerde ChatGPT-chats zijn vanuit deze cloudtaak niet te inventariseren. Google/Dropbox-bestanden zijn alleen gelezen, niet gewijzigd of samengevoegd.
- Zeven koppelingen bewezen via bestaande Notion-inhoudsbron, expliciete verwijzing naar het verzamelrecept én dezelfde social-URL en recepttekst in dat verzamelrecept. Alleen ontbrekend `contentURL` aangevuld; `sourceURL`, `originalSourceRef` en alle andere receptvelden ongewijzigd. Niet als nieuwe bron-/QR-goedkeuring gemarkeerd.
- 127 blijven open: 124 zonder voldoende bewijs en 3 niet toegankelijke Notion-pagina's. Er zijn 21 voorlopige zoekkandidaten in het lokale corpus; ze zijn ONBEWEZEN en niet in de recepten verwerkt. Lage/irrelevante tekstmatches zijn niet als kandidaten aangeboden.
- MDB-0323 blijft onbekend: Notion-status van 6 oktober vermeldt expliciet dat oorspronkelijke social niet bewezen is. Een gevonden saved post over 12 cups bewijst de bron van het huidige 24-cupsrecept niet. Bestaande kandidaten bij 0131/0327 niet gepromoveerd.

| Hersteld | Bestaand verzamelrecept | Social-URL |
|---|---|---|
| 0627, 0628, 0629 | MDB-0457 | https://www.instagram.com/reel/C-PKfjjo36E/ |
| 0630 | MDB-0471 | https://www.instagram.com/reel/C442EIgI5Ny/ |
| 0631, 0632, 0633 | MDB-0507 | https://www.instagram.com/reel/C3esVPcIjGr/ |

Per record: [controlelijst](audits/social-source-recovery-134-20261119.json). Geen oorspronkelijke link verzonnen. Voor de 127 open records is de volgende veilige stap terugvinden van originele gedeelde URL/export/screenshot met herleidbare receptinhoud; een gelijkende social is geen herstelbewijs.

## Back-up en gegevensbehoud

Werkmap `/workspace/scratch/social-recovery-20261119` bevat bronbestanden, volledige Notion-leesresultaten, vóór/na databaseback-ups, concreet herstelplan en SQL. `database-before.json` SHA256: c34a4495252da282106c19ac6483a70293777c675f377acdf4960be34850d9d7. Codebackup `code-before.bundle`.

Herstel uitgevoerd in één transactie met vergelijking van alle oorspronkelijke JSON-velden; als niet exact zeven ongewijzigde records beschikbaar waren, zou alles worden teruggedraaid. Nacontrole: 700 identieke MDB's, uitsluitend contentURL van de zeven gekozen records toegevoegd, overige 693 records volledig identiek, alle overige velden van de zeven identiek en 12 reserveringen ongewijzigd. Geen schemawijziging, sleutelrotatie of nummers uitgegeven.

Rollback gegevens: alleen toegevoegd contentURL verwijderen bij dezelfde zeven records, uitsluitend na vergelijking met de bewaarde na-toestand om latere gebruikerswijzigingen te beschermen. De databaseback-up bevat de volledige vóór-toestand. Niet alle recept-JSON blind overschrijven.

## Appcorrectie

De bestaande catalogussynchronisatie nam contentURL/originalSourceURL/originalSourceRef en andere aparte linkvelden niet mee bij aanvullen of toevoegen van recepten. Ze worden nu meegenomen wanneer lokaal leeg; bestaande lokale waarden blijven behouden. Daarmee blijven social én website beschikbaar na synchronisatie/herladen. Late voorkeurintegratie wacht op DOMContentLoaded zodat de rechtstreeks geladen actuele scripts eerst kunnen initialiseren.

Lokale verificatie: 34 unit-/routetests, TypeScript en twee desktop/telefoon-planningsbrowsertests geslaagd. Gerichte sync-test bewijst aanvullen van beide bronvelden, behoud van lokale links/inhoud/nummer/weekkeuze en toevoegen van een nieuw catalogusrecord zonder verlies van bronvelden. Dit is geen nieuw productierecept. Live-verificatie van de bestaande browserbibliotheek volgt na de release.
