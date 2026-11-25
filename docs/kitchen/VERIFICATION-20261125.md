# Keukenuitbreiding — verificatie en publicatie

## Afbakening

Bestaande productie onderzocht: bd0059a, projectidentiteit in ../PROJECT_IDENTITY.md. De volledige broncode ontbrak op main; deze ontwikkelbranch vertrekt van de actuele app en de eerder geverifieerde documentatie. Geen receptgegevens, MDB-nummers, bronnen, afbeeldingen, sterren of collecties worden door deze uitbreiding gewijzigd.

## Back-up en herstel

Vóór wijzigingen zijn een Git-bundle van alle refs, alle 802 catalogusrecords en de betrokken bestaande menu-, archief-, voorkeuren- en beoordelingsgegevens privé opgeslagen. Back-ups en persoonlijke importbestanden staan buiten de repository. De nieuwe tabellen zijn aanvullend. Een terugkeer naar de voorgaande appcode vereist geen verwijdering van de nieuwe tabellen of gegevens. Bij problemen schrijven uitschakelen en eerst een nieuwe back-up maken; nooit recepten of nummers terugzetten op basis van een verouderde kopie.

De Supabase CLI kon in deze omgeving geen migrationbestand aanmaken vanwege de alleen-lezen homedirectory; beide beschikbare CLI-versies zijn geprobeerd. Het SQL-bestand is daarom lokaal voorbereid met de werkelijke UTC-aanmaaktijd. Toepassing gebeurt uitsluitend via de verbonden Supabase-migratietool na geïsoleerde tests. Dit is geen instructie om productie handmatig te veranderen.

## Uitgevoerde controles

- TypeScriptcontrole en domein-/API-unitcontroles.
- Echte geïsoleerde PostgreSQL 17-database: migratie tweemaal toepasbaar, transactie voor reserveren/gebruiken/annuleren, 4→3, dezelfde actie opnieuw, revisieconflict, twee concurrerende schrijvers, negatief saldo geweigerd, verweesde reservering geweigerd, eigenaar-RLS, anonieme toegang geweigerd, append-only mutatiehistorie en teruglezen.
- Browser op desktop en iPhone-formaat: dagelijkse ideeën/andere ideeën, zes eetmomenten, bewuste menuactie, voorraad, plus/min, vaste lijst bij nul, herladen en printbreedte.
- Bestaande regressies voor AH-import, bron-/QR-controle, collecties, delen en beoordelingen. De oude weekplanner blijft onder het uitklapbare archief bereikbaar; zijn test opent dit onderdeel expliciet.

## Grenzen die zichtbaar blijven

- Originele twee AH-schermopnames waren niet beschikbaar. Import gebruikt uitsluitend de door de gebruiker aangeleverde uitlezing; onbekende gegevens blijven leeg en als controlepunt zichtbaar.
- Geen bevestigde AH-partnerrechten gevonden. Geen onofficiële bestel-API gebruikt. Kopiëren/openen is nooit besteld; reset vereist expliciete bevestiging van een echte bestelling.
- Fotoherkenning vereist een aangemeld account en bestaande AI-service. Herkenning blijft een corrigeerbaar voorstel. Een schermopname wordt per zelf gekozen frame gelezen, niet stilzwijgend als compleet gecontroleerd aangemerkt.
- Alleen bekende persoonsporties worden geschaald. Batches behouden hun oorspronkelijke opbrengst. Onbekende tijden blijven onbekend; bewaarinstructies zijn algemeen en hebben een officiële bron.
- Preview schrijft niet naar productie. Browseracceptatie gebruikt synthetische lokale testgegevens; SQL-acceptatie gebruikt een geïsoleerde database. Een echte fysieke iPhone en een persoonlijke AH-bestelling zijn hiermee niet getest.

## Publicatiestatus

Preview `dpl_5GTiMU9ovnt6NHWKdhejTaG4EwSM` (0ea3f0a) is READY. In een echte browser op iPhone-formaat geladen: keuken zichtbaar, geen JavaScript-fouten, geen horizontale overloop; privé-API geeft zonder aanmelding 401 met private/no-store. 69 unit-/API-tests slagen. De regressiereeks had 60 geslaagde tests en vier fouten in verouderde testaannames (ingeklapte oude planner en een authmock met maar één callback); alle 12 betrokken tests slagen na aanpassing op beide schermformaten. De verder uitgebreide keukenacceptatie (bewuste menukeuze, mealprep, alternatieven en dubbele productimport) slaagt ook op beide formaten.

Migratie `20261125141327_household_kitchen` is via Supabase toegepast. De privé-import is volledig en veld voor veld teruggelezen. Een ander bestaand account ziet nul keukenrecords; anon heeft geen tabel-/RPC-toegang. Catalogus vóór en na: 802, fingerprint `01ff18c0896fdd7e5992daf8d46b3ebd`; sterrenfingerprint `68505877444c4d49c24ecec690a03fed`; archieven 25 en bestaande week_menus 0 blijven behouden.

Productiepublicatie volgt na het samenvoegen van de geverifieerde PR. Persoonlijke productregels blijven buiten GitHub.
