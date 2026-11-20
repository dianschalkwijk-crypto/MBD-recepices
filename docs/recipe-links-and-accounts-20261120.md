# Receptlinks, eigen accounts en collectieherstel — 20 november 2026

Dit bouwt voort op dezelfde app/repository en productie `798665b`; geen nieuwe losse app. De actuele leidende gegevensbron is `public.mbd_catalog` in Supabase-project `ywsdubincfabjhvjqkot`: 702 records bij de start (twee meer dan de vorige controle). De oorspronkelijke catalogus was al publiek leesbaar; deze uitbreiding maakt die bestaande bibliotheek niet met terugwerkende kracht privé.

## Gedrag

- Collecties wissen verouderde ingrediënten- en categoriefilters bij openen. Allergie-instellingen blijven gelden. Tegels onderscheiden zichtbaar en totaal; bij ontbrekende ingrediënten of allergieën staat waarom recepten verborgen zijn.
- WhatsApp-concepten bevatten titel/MDB plus `/r/MDB-xxxx`. De serverpagina toont één recept, foto en Open Graph-afbeelding, ingrediënten/bereiding en social vóór website. Geen recepttekst in het bericht en geen automatische verzending.
- `/account.html` gebruikt de bestaande accounts en toegangsbeveiliging. De beheerder maakt bewust een persoonlijke uitnodigingslink. De ontvanger maakt een eigen account en activeert bewust zijn code. Geen automatische kopie van de hoofdbibliotheek. Dian kan als beheerder recepten van gebruikers bekijken.
- Eigen recepten blijven in de bestaande RLS-beveiligde `recipes`. Een eigenaar maakt desgewenst een willekeurige UUID-deellink voor één recept (`/delen/token`) en kan deze intrekken. Een eerder bewust bewaarde kopie wordt niet gewist door intrekking.
- De ontvanger kan kijken zonder bewaren. Alleen een klik met actief account roept `mbd_save_shared_recipe` aan. Een tweede klik bewaart dezelfde kopie; geen MDB-nummer wordt gereserveerd of toegewezen. De oorspronkelijke MDB-referentie blijft behouden.
- Eigen snapshots zijn uitsluitend zichtbaar voor eigenaar/beheerder. Publieke deellinks geven een veldselectie van één expliciet gedeeld recept, geen eigenaarsgegevens of privénotities. Privéfoto's worden niet uit verborgen bestandsvelden gehaald; eigen recepten ondersteunen foto-URL's.
- `/socials-controleren.html` laat de beheerder een controle bewust opslaan en teruglezen. De lijstbadge is uitsluitend gebaseerd op een opgeslagen controle van de huidige exacte social-URL. Afgeschermd/login/tijdelijke fout is geen bewijs van verwijdering. Bestaande bronlinks blijven ongewijzigd. Er is geen automatische of bulkstatuswijziging uitgevoerd.

## Herstelbaarheid en database

Vooraf lokale herstelbare codebundle en gegevensback-ups gemaakt onder `/workspace/scratch/mbd-before-sharing-*20261120*` (alleen lokaal, niet in Git). De databaseback-up bevat catalogus, bestaande accounts, recepten, shares, toegangscodehashes en nummerreserveringen; geen authenticatiesleutels of wachtwoorden opgevraagd.

De via Supabase MCP geregistreerde additieve migraties zijn `recipe_links_saved_library_social_checks` en de bounded snapshot-functiecorrectie `preserve_all_shared_snapshot_source_fields`. `database/recipe-sharing.sql` is de geconsolideerde bron. Supabase CLI-aanmaak was niet beschikbaar; er is geen verzonnen CLI-migratietijdstempel gebruikt. Bestaande tabellen/functies voor recepten opslaan en nummerreserveringen zijn niet gewijzigd. Alle nieuwe tabellen hebben RLS; anoniem zijn alleen gecontroleerde statuskolommen en de expliciete token-opvraag beschikbaar. Schrijven van socialcontroles vereist beheerder, URL-overeenkomst en bewijs bij verwijderd. Private bewijstekst wordt niet publiek aangeboden.

## Kwartaalherinnering

ChatGPT-planning kon geen taak toevoegen vanwege de bestaande limiet van vijf actieve taken. Andere planningen zijn behouden. In Todoist is daarom één terugkerende taak aangemaakt: `6j3jHvvH8Gh383wf`, vanaf 1 januari 2027, `every 3 months @ 08:00`, met één pushherinnering. Na afronden schuift de terugkerende Todoist-taak door. Dit is een herinnering om Codex opdracht te geven; geen automatische socialaudit.

## Verificatie en grenzen

38 unit-/routetests en TypeScript geslaagd. Zes PostgreSQL-17-integratietests bewijzen eigenaarisolatie, beheerdersinzage, gebonden tokeninzage, intrekking, bewuste/idempotente adoptie, onveranderde MDB-catalogus en bewijseisen voor socialstatus. Daarnaast zijn de echte productie-RPC's voor een privé-recept en tweemaal toevoegen getest binnen een teruggedraaide transactie: dezelfde kopie-ID, geen blijvend testrecept.

Browsercontroles dekken desktop en telefoonformaat: collectie-/allergiefilters, weekmenu, eigen recept opslaan/herladen, een receptlink maken, expliciete adoptie, socialstatus opslaan/herladen en badgeonderscheid. Accountschermtests gebruiken geïsoleerde accountsimulaties; er is geen echte bevestigingsmail of uitnodiging aan een contact verstuurd. Fysieke WhatsApp-ontvangst/previewcaching is niet getest. Server-Open-Graph en echte receptfoto worden bij publicatie afzonderlijk gecontroleerd.

Vijf oorspronkelijke socials blijven onopgelost (0675, 0676, 0687, 0688, 0689): originele screenshots/schermopname ontbreken. Bij 0323 blijft de inhoudelijke vergelijking van 12 cups op social en 24 cups op de website open; geen porties/ingrediënten veranderd.
