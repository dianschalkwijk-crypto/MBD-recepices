# Herstelronde oorspronkelijke sociallinks — 134 records

**Resultaat: 129 hersteld, 5 open.** Onderzoek en herstel in de bestaande receptenapp, zonder recepten/nummers/foto's of bestaande bronvelden te vervangen. Per record: [volledig controlebestand](audits/social-source-recovery-134-20261119.json).

## Wat is hersteld

1. **122 oorspronkelijke sociallinks uit Stashcook-exports van 28 juli.** Alle 59 toegankelijke tekstexports uit `/2026/Stashcook` gelezen: 487 titel-URL-vermeldingen, 430 unieke titels. De koppeling gebruikt de oorspronkelijke opgeslagen titel plus de bestaande MDB-seed/indexalias en hetzelfde platform. Voor 119 is de titel exact; 0019 en 0279 zijn expliciet gecontroleerde vertaal-/titelvarianten. Bij 0176 wezen twee oorspronkelijke TikTok-kortlinks na navolgen op dezelfde video-ID 7534745851265174806. Alleen nieuw `socialURL` toegevoegd. Opgeslagen URL inclusief beschikbare trackingtekst exact behouden. Geen fuzzy titelmatch als origineel gebruikt.
2. **Zeven bestaande Notion-socialbronnen bij 0627–0633.** Bestaande inhoudsbron, expliciete verwijzing naar verzamelrecept én dezelfde social-URL met recepttekst in dat verzamelrecept gecontroleerd. Alleen ontbrekend `contentURL` aangevuld. Niet als nieuwe bron-/QR-goedkeuring gemarkeerd.

| Notion-herstel | Bestaand verzamelrecept | Social-URL |
|---|---|---|
| 0627, 0628, 0629 | MDB-0457 | https://www.instagram.com/reel/C-PKfjjo36E/ |
| 0630 | MDB-0471 | https://www.instagram.com/reel/C442EIgI5Ny/ |
| 0631, 0632, 0633 | MDB-0507 | https://www.instagram.com/reel/C3esVPcIjGr/ |

**MDB-0323:** de oorspronkelijke opgeslagen Instagram-link is https://www.instagram.com/reel/DWrZs52DbJN/?igsh=MWJ4bDN5amg3aW03Yg== — direct aangetroffen met “Sushi cups uit de oven” in twee oorspronkelijke Stashcook-exports. Eerdere bronregisters en Notion hadden deze koppeling nog als onbewezen staan; die documenten bleken onvolledig. De Instagram-mastercaption noemt 12 cups; huidige website-inhoud 24 cups. Sociallink is hersteld, ingrediënten en porties zijn bewust niet veranderd. De inhoudelijke vergelijking blijft open. Oude kandidaten bij 0131/0327 zijn behouden en niet gepromoveerd; een andere oorspronkelijke sociallink kwam uit de directe Stashcook-export.

## Vijf concrete open punten

| MDB | Recept | Ontbrekend bewijs / blokkade |
|---|---|---|
| 0675 | Romige citroen-Boursin-orzo met kippendijen | Oorspronkelijke Instagram-screenshot van 28 oktober; exacte post/maker ontbreekt. Openbare zoekkandidaat is geen bewezen origineel. |
| 0676 | Eiwitrijke kaneelwafel | Schermopname van 28 oktober noemt @manon_weltman; exacte reel-ID ontbreekt. |
| 0687 | Yoghurt bark met aardbei en banaan | Gebruikersscreenshots 4 november niet als bronfoto in app opgeslagen; gekoppelde Notion-pagina geeft 404 via app-query én plugin. |
| 0688 | Mini bananenbroodjes | Dezelfde screenshot-/Notion-toegangsblokkade. |
| 0689 | Krokante chocolade-rijstcakecups | Dezelfde screenshot-/Notion-toegangsblokkade. |

Geen bron verzonnen of een vergelijkbaar recept als oorspronkelijke bron toegevoegd. Voor deze vijf is de ontbrekende toegang tot originele screenshots/schermopname of exacte gedeelde URL nodig. Oudere/gearchiveerde ChatGPT-chats zijn vanuit deze cloudtaak niet te inventariseren; drie relevante vindbare chats wel gelezen. Niet alle historische chats of foto-/videobijlagen konden worden onderzocht.

## Onderzochte bronnen

Alle 134 met actuele catalogus vergeleken; 131 Notion-pagina's volledig gelezen. Bronregister Excel inclusief hyperlinkvelden; bronregister-PDF met 414 linkannotaties, MBR en MRB; Dropbox Instagram/TikTok-master origineel/v14; Google socialmasters v43/v44; Excel v33/v46/v47 inclusief hyperlinks; 72 Git-commits met één unieke seedreceptenversie; 59 Stashcook-tekstexports en de vindbare relevante chats. Bronnenbestanden alleen gelezen, niet veranderd of als datasets samengevoegd. Titelzoekkandidaten uit de eerste ronde zijn door sterkere oorspronkelijke exportbewijzen vervangen of onbewezen gelaten.

## Back-up en gegevensbehoud

Werkmap `/workspace/scratch/social-recovery-20261119` bevat originele bronbestanden, volledige Notion-leesresultaten, vóór/na databaseback-ups, de twee concrete herstelplannen en SQL. `database-before.json` SHA256: c34a4495252da282106c19ac6483a70293777c675f377acdf4960be34850d9d7. Codebackup `code-before.bundle`. `database-before-stash.json` bewaart de toestand tussen beide rondes; definitieve na-toestand `database-after-stash.json`.

Beide herstelrondes uitgevoerd in afzonderlijke transacties met vergelijking van ALLE oorspronkelijke recept-JSON. Bij niet exact zeven respectievelijk 122 ongewijzigde records zou de gehele ronde terugdraaien. Nacontrole: 700 identieke MDB's; uitsluitend 7 contentURL en 122 socialURL toegevoegd; andere 571 records volledig identiek; alle overige velden van de 129 identiek; 12 reserveringen ongewijzigd. Geen schemawijziging, sleutelrotatie, nieuwe recepten of nummers.

Rollback gegevens: alleen het in die ronde toegevoegde linkveld verwijderen bij de benoemde records, na vergelijking met de bewaarde na-toestand om latere gebruikerswijzigingen te beschermen. Volledige vóór-toestand aanwezig; nooit blind alle recept-JSON overschrijven. Runtime-rollback vóór synchronisatiecorrectie: b977018 / dpl_9LN9MTe7gmtqQetdyz56uUk9Es1Y.

## Appcorrectie en publicatie

De bestaande catalogussynchronisatie nam contentURL/originalSourceURL/originalSourceRef/socialURL en andere aparte linkvelden niet mee. Die worden nu aangevuld wanneer lokaal leeg; bestaande lokale waarden blijven behouden. Hierdoor blijven social én website beschikbaar na synchronisatie en herladen. Late voorkeurintegratie wacht op DOMContentLoaded zodat de rechtstreeks geladen actuele scripts eerst initialiseren.

Gepubliceerd: **7a737a4dfbae238494786fa6e2b9a13764d0da6d**, READY-deployment **dpl_DkMY2VkY27zRjeANrd4mGx5e4rts**, project `madebydian-recipes-dian`, normaal appdomein bevestigd. PR #5 voor review, niet gemerged. Latere commits wijzigen uitsluitend audit/documentatie/tests.

Verificatie: 34 unit-/routetests, TypeScript en twee lokale desktop/telefoon-planningscontroles geslaagd. Na eerste ronde zes productie-browsercontroles geslaagd; na Stashcook-herstel vier gerichte productie-browsercontroles geslaagd op desktop en iPhone-schermformaat, inclusief echte catalogussynchronisatie naar een oude bibliotheek zonder de 129 herstelde links, opnieuw openen en behoud van oorspronkelijke bronverwijzingen, website en porties van 0323. Geen receptwrites vanuit de browsercontroles. Herstelbewijs is geen algemene inhoudelijke goedkeuring of bereikbaarheidstest van alle 129 externe posts; afgeschermde/verwijderde posts niet automatisch als kapot beoordeeld. Geen QR-regeneratie of QR-goedkeuring; geen fysieke Safari-test.
