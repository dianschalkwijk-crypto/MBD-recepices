# MadeByDian — uitvoering masteropdracht 25 november 2026

Dit is de vervolguitlevering op de bestaande keukenuitbreiding van PR #17 en beeld-/AH-correctie van PR #18. Geen nieuwe app, repository of Supabase-project.

## Fase A — gecontroleerd en veiliggesteld

- Actuele basis: main `35c1fce`, bestaande Vercel-productie `madebydian-recipes-dian` en Supabase `ywsdubincfabjhvjqkot`.
- Productie bevat 805 catalogusrecords; de eerdere apparaatrestauratie van drie bestaande MDB's is behouden. De AH-collectie herkent 95 oorspronkelijke AH-imports. De bestaande privéproductcatalogus bevat 103 vaste producten.
- Openstaande historische PR's opnieuw geïnspecteerd. Hun gepubliceerde recept-/collectie-/opslagfuncties zitten al in main; geen tweede implementatie of automatische hermerge van oude concepten.
- Git-bundle vóór de wijzigingen en privéback-up van keukenstatus, actiehistorie, weekmenu's en sterren. De volledige receptmomentopname is apart bewaard. Geen persoonlijke boodschappen of bestelgeschiedenis in GitHub.
- Geen database- of RLS-migratie nodig: de bestaande eigenaargebonden keukenopslag, append-only acties en bestaande week_menus ondersteunen deze extra koppelingen. Bestaande gegevens worden bij uitrol niet herschreven.

## Fase B — hergebruik en aanvulling

| Onderdeel | Bestaand en hergebruikt | Aanvulling in deze versie |
|---|---|---|
| Dagelijkse inspiratie | Vier ideeën, lokale kalenderdag, echte bronfoto's, voorkeuren/sterren | Exacte actieve minuten waar bekend naast de tijdscategorie; onbekend blijft onbekend |
| Weekmenu | Zeven dagen, zes eetmomenten, drie hoofdmaaltijden, vrijblijvende gezinsregels, verplaatsen/vervangen/herhalen | Bewust gekozen gerechten leveren direct één herleidbare boodschappenbron. Verplaatsen met gewijzigde porties past dezelfde bron aan. Ongeziene wijzigingen vanaf een ander apparaat worden geweigerd |
| Mealprep | Maandag/donderdag lunch en snack, keuze uit bestaande recepten, diepvriesactie | Ingrediënten, porties en bronstappen inline. Gecombineerde voorbereiding en tijdraming per dag in plaats van de hele week. Bekende brontotalen bruikbaar zonder ontbrekende wachttijden als nul te verzinnen. Print van gekozen dag met bronstappen en bewaaradvies |
| Eén boodschappenlijst | Bestaande vaste catalogus, handmatige selectie, imports, productkeuzes | Menugerechten en mealprep automatisch samen; herhaald toevoegen blijft dezelfde bron. Expliciete verpakkingskeuze, uitsluitend compatibele eenheden; één productregel. Plus/min bepaalt het gewenste totaal. Nul behoudt het vaste product. Onbekende verpakkingen worden niet geraden |
| Bestellen en kopen | Geen schijn-AH-bestelling; kopiëren/openen is geen bevestiging | Geselecteerd, besteld en ontvangen/gekocht apart. Geen voorraad bij een bestelbevestiging. Geannuleerde, nog niet ontvangen appbestelling komt één keer terug op de lijst, met behoud van latere keuzes en oorspronkelijke verpakking |
| Diepvries en voorraad | Batches, datums, lade, reserveren, gebruik bevestigen, correcties en historie | Vanuit recepten en vaste boodschappen naar voorraad. Bestaande product-ID en verpakking blijven gekoppeld. Correctie vanaf een verouderd scherm kan geen verbruik overschrijven. Woensdag houdt ook bij diepvriesvoorstellen rekening met het bestaande sterrenfilter |
| Foto en ingrediënten zoeken | Bestaande AI-service met accountcontrole; voorstellen eerst corrigeren; zoeken met ingrediënten | Fotovoorbeeld en technische verkleining voor grotere telefoonfoto's. Herkende voorraadnamen blijven na annuleren als concept bewaard; hervatten mogelijk. Zonder bevestiging geen voorraad |
| Collecties, sterren en alternatieven | Bestaande collecties en beoordelingen van Mama/Jake/Mace; zoeken/snelkeuze; optionele algemene gezondheidsaanwijzingen | Behouden. Geen nieuwe beoordelingen, collectieherindeling of automatische productvervanging |
| Accounts en opslag | Bestaande aanmelding, RLS en transactie-RPC met revisies en idempotentie | Alleen werkelijk gewijzigde productvelden opsturen. Conflicterende wijzigingen niet overschrijven. Niet-opgeslagen acties blijven zichtbaar; bewust herhalen of laten vervallen. Netwerkverlies na een echte opslag veroorzaakt geen dubbel product |

### Reken- en gegevensregels

Gram/kg en milliliter/liter worden alleen binnen dezelfde maateenheid omgerekend. Lepels, gewichten en stuks worden niet door elkaar geschat. Letterlijk bekende multipacks en dubbele verpakkingsvermeldingen worden ondersteund. Een gewijzigde verpakking maakt een eerdere ingrediëntkoppeling ongeldig en zichtbaar controleerbaar. Bij annulering wordt de oude verpakking behouden wanneer de huidige productverpakking verschilt.

Persoonsporties worden met de bestaande helpers geschaald. Muffins, mealprep-batches en andere stuksopbrengsten blijven de oorspronkelijke batch wanneer persoonsporties niet aantoonbaar bekend zijn. Receptinhoud zelf verandert niet.

## Fase C — betekenisvolle verificatie

- `tests/kitchen-core.test.mjs`, `tests/kitchen-connections.test.mjs` en `tests/kitchen-api.test.mjs`: dagwissel, drie hoofdmaaltijden, optionele snacks, herleidbare bronnen, automatische combinatie, verpakkingen, handmatig nul, annulering/ontvangst, onbekende eenheden, allergie-/sterrenfilters, voorraad 4→3, dubbel gebruik, annuleren en concrete revisieconflicten.
- `tests/integration/kitchen.test.mjs`: echte geïsoleerde PostgreSQL 17; migratie herhaalbaar, bestaande RPC, nieuwe boodschappen-/productacties teruglezen, twee concurrerende transacties, RLS ander account, anon geweigerd, append-only historie, geen negatieve voorraad en geen verweesde reservering.
- `tests/browser/kitchen-connections.spec.mjs`: menu → mealprep → boodschappen → vaste verpakking → handmatig totaal → voorraad → herladen. Maandag/donderdag apart en print. Foto is corrigeerbaar voorstel; annuleren bewaart concept. Besteld/ontvangen/geannuleerd onderscheiden.
- `tests/browser/kitchen-devices.spec.mjs`: twee aparte browsercontexten, verloren antwoord na opslag, herhaling zonder duplicaat, zichtbare synchronisatie, gelijktijdige aantallen, samenvoegen van verschillende velden en blokkeren van hetzelfde verouderde veld.
- Bestaande browserregressies voor receptopslag, bronnen/QR, collecties, sterren, weekmenu, AH en delen behouden; desktop en iPhone-schermformaat.

De browser-AI-antwoorden en aangemelde testgebruikers zijn synthetisch; SQL-transacties draaien echt maar geïsoleerd. Dat is geen bewijs van een echte persoonlijke AI-herkenning of twee fysieke apparaten. Productiecontroles gebruiken uitsluitend een geïsoleerde lokale testmodus en read-only endpoints; geen nepbestelling, testrecept of voorraadafboeking in productie.

## Fase D — één publicatie en open grenzen

Eén ontwikkelbranch en gecombineerde PR voor deze vervolguitlevering. Vercel-preview vóór samenvoegen, daarna één automatische productie-uitrol van main. Concrete preview/deployment-ID's en live-uitkomsten worden vastgelegd bij de PR.

Directe AH-accountoverdracht blijft bewust uitgesteld: er is geen bevestigde ondersteunde partnerkoppeling. Het kopieer-/zoekalternatief werkt zonder bestellingen te suggereren. Een echte AH-order wordt in AH afgerond; alleen de gebruiker bevestigt de juiste status in MadeByDian.

Originele AH-schermopnames en de volledige halfjaarhistorie zijn niet opnieuw beschikbaar. De reeds geïmporteerde 103 aangeleverde producten blijven behouden; onbekende gegevens blijven controlepunten. Specifieke onbekende bewaartermijnen, tijden, bronfoto's en receptinhoud worden niet verzonnen. Bronadvies en algemene Voedingscentrum-instructies blijven herkenbaar apart. Echte persoonlijke fotoherkenning, een fysiek iPhone/Safari-apparaat en een echte AH-bestelling vereisen een praktijktest met de betreffende accounttoegang.
