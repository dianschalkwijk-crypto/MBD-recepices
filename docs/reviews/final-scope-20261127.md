# MadeByDian – definitieve eindcontrole, synchronisatie en publicatie

Ga verder binnen het bestaande MadeByDian-project. Bouw geen nieuwe app en begin niet opnieuw met de reeds uitgevoerde werkzaamheden.

## 1. Bestaande omgeving

- GitHub: `dianschalkwijk-crypto/MBD-recepices`
- Supabase-project: `ywsdubincfabjhvjqkot`
- Hoofdtabel: `public.mbd_catalog`
- Productieomgeving: https://madebydian-recipes-dian.vercel.app/
- Bestaande Notion-receptendatabase behouden.

## 2. Laatst bevestigde stand

- 838 recepten in totaal.
- 204 inhoudelijk goedgekeurd.
- 611 geslaagd voor automatische structuurcontrole, maar nog niet definitief inhoudelijk gecontroleerd.
- 23 uitzonderingen die extra inhoudelijke controle nodig hebben.
- 18 identieke dubbele recepten gemarkeerd met `duplicateOf` en `duplicateStatus`.
- 74 recepten in de Gourmet-collectie volgens de laatst bekende stand.

Controleer deze aantallen eerst rechtstreeks in Supabase. Gebruik de actuele database als uitgangspunt.

## 3. Definitieve receptencontrole

Werk alle resterende recepten zelfstandig af in grote batches.

Controleer per recept:

- Titel en MDB-nummer.
- Volledigheid van ingrediënten.
- Hoeveelheden en eenheden.
- Aantal personen.
- Volledige, logische bereidingswijze.
- Bereidingstijd en temperatuur.
- Overeenstemming tussen ingrediënten en bereidingswijze.
- Voedselveiligheid.
- Collecties en categorieën.
- Bronlink.
- Receptfoto.
- Nutri-Score, indien beschikbaar of verantwoord te schatten.

### Afspraken

- Standaard recepten omrekenen naar vier personen.
- Mealprep, kruidenmixen, sauzen en recepten met een vaste opbrengst mogen grotere hoeveelheden behouden.
- Ontbrekende hoeveelheden en bereidingstijden zelfstandig logisch aanvullen.
- Geschatte gegevens herkenbaar markeren.
- Originele gegevens bewaren in `originalRecipeBeforeReconstruction`.
- Volledige Allerhande-recepten zelfstandig goedkeuren.
- Geen bronverificatie claimen als de originele bron niet daadwerkelijk toegankelijk of gecontroleerd is.
- Reeds goedgekeurde recepten niet opnieuw ter goedkeuring voorleggen.
- Controleer eerder aangevulde recepten op eventuele technische fouten.
- Geen melk- of notenallergie veronderstellen.
- Geen nieuwe MDB-nummers aan bestaande recepten toekennen.

## 4. Dubbelen definitief oplossen

Controleer de 18 reeds gemarkeerde identieke dubbelen.

Bekende groepen:

- MDB-0652 t/m MDB-0665.
- MDB-0647 t/m MDB-0649.
- MDB-0666 en MDB-0667.
- MDB-0668 en MDB-0669.
- MDB-0670 en MDB-0671.

Controleer daarnaast recepten met verschillende titels maar dezelfde inhoud.

Behoud bij samenvoeging:

- Oorspronkelijk MDB-nummer.
- Foto's.
- Bronlinks.
- Beoordelingen per persoon.
- Collecties.
- Favorieten.
- Menuhistorie.
- Boodschappenlijstkoppelingen.

Archiveer verwijderde dubbelen veilig. Hergebruik vrijgekomen nummers niet.

Controleer ook MDB-0694, het controletestrecept, en zorg dat dit niet als normaal recept zichtbaar blijft.

## 5. Gourmet-collectie afronden

Behoud alle bestaande Gourmet-recepten en controleer de daadwerkelijke geschiktheid voor gourmetplaat of pannetjes.

De 31 speciaal ontwikkelde AI-gourmetrecepten hebben:

- MDB-0812 t/m MDB-0842.
- Aanvullende nummers MBDG-001 t/m MBDG-031.

Behoud beide nummers.

Controleer en voltooi:

- Gourmet als zichtbare collectie.
- Basisgourmet.
- Budgetproofgourmet.
- Kindergourmet.
- Culinair gourmet.
- Recepten afzonderlijk selecteren en verwijderen uit een menu zonder ze uit de catalogus te verwijderen.
- Voorbereidingsplanning verdeeld over drie dagen, maximaal 30 minuten actieve voorbereiding per dag.
- Afvinkbare voorbereidingstaken.
- Samengevoegde boodschappenlijst.
- Producten die al in huis zijn kunnen uitvinken.
- Optionele knop voor actuele AH-prijzen en totaalprijs, uitsluitend op verzoek.
- Koppeling met bestaande weekboodschappenlijst.
- Gourmetmenu's opslaan op datum.
- Eerdere menu's opnieuw gebruiken en aanpassen.
- A4-printversie met receptfoto's.

### Beoordelingen

Afzonderlijke beoordelingen voor Mama, Jake, Mace, Opa, Oma en Gast.

- 3 sterren: opnieuw aanbieden.
- 4 sterren: vaker maken.
- 5 sterren: favoriet.

Zorg dat beoordelingen en menuhistorie ook tussen apparaten synchroniseren.

Gebruik de bestaande Space-pagina als aanvullende referentie:
https://chatgpt.com/space/page_0eeb1e8839108191970550646b5c8f23

## 6. Receptfoto's

Controleer welke foto's daadwerkelijk beschikbaar zijn.

Voor ontbrekende Gourmet-foto's mogen AI-receptfoto's worden gebruikt.

Fotostijl:

- Realistische huisgemaakte gerechten.
- Natuurlijk daglicht.
- Rustige, lichte achtergronden.
- Verschillende borden en ondergronden.
- Geen onnodige groene garnering.
- Geen ingrediënten toevoegen die niet in het recept voorkomen.
- AI-beelden herkenbaar labelen.
- Bestaande originele foto's behouden.

Controleer dat iedere foto bij het juiste MDB-nummer hoort. Markeer een foto pas als aanwezig wanneer deze daadwerkelijk is opgeslagen en bereikbaar is.

## 7. Synchronisatie

Synchroniseer alle wijzigingen tussen:

- Supabase.
- Notion.
- De live MadeByDian-receptenapp.

Voorkom dat oudere gegevens nieuwe correcties overschrijven.

Controleer specifiek of bestaande recepten in de app ook gewijzigde ingrediënten, bereidingen, foto's en collecties ontvangen, en niet alleen ontbrekende velden worden aangevuld.

Behoud bestaande gebruikersgegevens en functionaliteiten.

## 8. Testen en publiceren

Voer technische en functionele controles uit:

- Database-integriteit.
- Unieke MDB-nummers.
- Receptinhoud.
- Dubbelen.
- Foto's.
- Collecties.
- Zoekfunctie en filters.
- Beoordelingen.
- Gourmetplanner.
- Boodschappenlijst.
- Synchronisatie.
- Mobiele weergave.
- Printweergave.

Voer beschikbare automatische tests, typechecks en browsertests uit.

Publiceer de definitieve versie op het bestaande Vercel-productieproject en controleer de live omgeving daadwerkelijk.

## 9. Werkwijze

Werk zelfstandig door in grote batches. Stop niet na iedere batch om toestemming te vragen.

Ik geef toestemming om ontbrekende receptinformatie logisch aan te vullen, technische fouten te herstellen en de hierboven beschreven wijzigingen te publiceren.

Vraag alleen om mijn hulp als een essentiële blokkade niet zelfstandig opgelost kan worden. Werk ondertussen alle andere onderdelen verder af.

Sla voortgang duurzaam op, zodat werkzaamheden bij een onderbreking hervat kunnen worden zonder opnieuw te beginnen.

## 10. Definitieve oplevering

Geef na afronding één overzicht met:

- Totaal aantal actieve recepten.
- Aantal volledig gecontroleerde recepten.
- Aantal veilig gearchiveerde dubbelen.
- Aantal recepten met geschatte gegevens.
- Aantal recepten met originele foto's.
- Aantal recepten met AI-foto's.
- Aantal ontbrekende foto's.
- Aantal Gourmet-recepten.
- Synchronisatiestatus per omgeving.
- Testresultaten.
- Productielink.
- Eventuele werkelijk resterende blokkades.

Meld onderdelen uitsluitend als afgerond wanneer dit daadwerkelijk gecontroleerd is.

Doel: één volledig afgewerkte, betrouwbare en gesynchroniseerde MadeByDian-receptenapp, zonder dat ik telkens opnieuw dezelfde recepten hoef door te nemen.