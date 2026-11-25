# Eigen AH-kookboeken — 21 november 2026

De bestaande receptenapp krijgt een eigen AH-reeks: **AH – Allerhande · Deel 1**, maximaal 30 recepten per deel. Daarna kiest de AH-bulkimport een volgend deel. Een recept houdt zijn MDB-nummer en kan daarnaast in meerdere thematische collecties blijven staan.

## Selectie en behoud

Zeven actieve catalogusrecepten hebben AH als geregistreerde oorspronkelijke bron: 0164, 0230, 0232, 0271, 0275 (AH België), 0307 en 0709. Deze bestaande pagina's zijn in Notion gekoppeld aan hetzelfde eigen AH-kookboek, zonder nieuwe receptpagina's te maken. Vijf recepten met een oorspronkelijke socialbron en slechts een aanvullende AH-inhoudsbron (0006, 0017, 0074, 0104, 0349) zijn niet verplaatst; een inhoudsbron is geen bewijs van een oorspronkelijke bron.

Nieuw Notion-kookboek `41f48664-8ea9-81f2-88d6-e23abf166394`, **AH – Allerhande · Deel 1**, globale boekindex **41** (het eerst vrije nummer na bestaande boeken 1–40). Dit is geen MDB-nummerwijziging. De zeven bestaande MDB's blijven exact gelijk. De oude boekmetadata is per recept vastgelegd in `ahPreviousBook`. Alleen boekvelden/koppelingen en de daarvan afgeleide boektellers zijn gewijzigd; titels, foto's, ingrediënten, bereiding, bronlinks, collecties en persoonlijke velden blijven behouden. Oude themaboeken en lege voorbereide boeken zijn niet verwijderd/hernoemd. De telling van bestaande Notion-boeken is afgeleid van hun werkelijke relaties; die kunnen ook historische duplicaatpagina's bevatten.

Vooraf herstelbare back-ups onder `/workspace/scratch/mbd-before-ah-books-*20261121*`: volledige Git-bundle (geverifieerd), volledige catalogus, oorspronkelijke Notion-boekrelaties, boekoverzicht en nummerreserveringen. Het concrete patchplan staat in `mbd-ah-books-change-plan-20261121.json`. Supabase-wijzigingen zijn conditioneel op de oorspronkelijke `updated_at` uitgevoerd, in één transactie voor de geselecteerde zeven records. Er is niets samengevoegd of hernummerd.

## Gedrag

De app toont zowel de verzameling **AH – Allerhande** als het afzonderlijke deel, naast bestaande collecties. De oorspronkelijke collectielijsten zijn niet herschreven. Catalogussynchronisatie neemt alleen de aparte boekmetadata over; een afwijkende expliciete lokale boekkeuze blijft als controleconflict behouden. AH-imports kiezen alleen de AH-reeks, bewaren hun deel bij een wijziging en gebruiken de actuele Notion-relaties voor de capaciteit. Een onzekere boekaanmaak wordt niet blind herhaald. De bestaande databaselease serialiseert de AH-bulkimport. Gewone imports slaan AH-boeken over en een nieuw gewoon boek krijgt een vrij nummer boven de reeds bestaande boeknummers. MDB-reserveringen blijven via de bestaande atomische functie verlopen.

## Verificatie

TypeScript, vijftig unit-/routetests, zeven AH-pipelinetests en tien echte PostgreSQL-tests van de bestaande atomische opslag slagen. Aanvullende tests bewijzen: AH versus gewone import, doorgaan naar Deel 2 bij dertig recepten, geen verplaatsing bij het bewerken van een bestaand vol deel, stoppen bij dubbelzinnige delen/onzekere aanmaak, behoud van lokale inhoud en thema's, en mobiele weergave. Volledige browsercontrole en publicatie volgen hieronder na uitvoering.

## Publicatie en daadwerkelijke controle

Productiecommit `44602804be816eda7c352e247c2ec7ceb942f250`, READY `dpl_EXJBfGR4K2u4R4bFgg72nd8ziESQ`, PR #9. Live in dezelfde app via **Collecties → AH – Allerhande · Deel 1**. De latere vastleggingscommit bevat uitsluitend documentatie.

48 lokale browsercontroles en achttien echte productie-browsercontroles geslaagd, elk op desktop en telefoonformaat. De productietest begon met een geïsoleerde oude lokale boekindeling en bevestigde dat alle zeven recepten dezelfde MDB/titel/ingrediënten/stappen/bronlinks/fotoreferenties behouden, het eigen AH-boek zichtbaar is, de originele foto bij 0709 werkelijk laadt en de indeling na herladen terugkomt. Ook weekmenu, receptdelen, socialherstel en bron-/QR-opslag/herladen/print opnieuw geverifieerd. Geen certificaatcontrole uitgeschakeld; de lokale browser vertrouwt de CA van de testomgeving. De vervolgdelen zijn geïsoleerd getest, geen dertig kunstmatige productierecepten toegevoegd.

Volledige catalogusvergelijking: alle 697 niet-geselecteerde records inclusief `updated_at` geheel identiek; voor de zeven geselecteerde records alleen boekvelden en de bijbehorende herstelmetadata veranderd. Ingrediënten, bereiding, titels, foto's, bronlinks, bestaande collecties en persoonlijke velden exact gelijk. Totaal **704** records, **686 actief**, **18 apart gehouden duplicaten**; alle **16 nummerreserveringen** volledig gelijk (hash en aantal vergeleken). De Notion-koppelingen en boekteller van Deel 1 zijn teruggelezen: precies zeven bestaande pagina's. Geen nieuwe receptpagina's of MDB-nummers gemaakt. Runtime-error/fatal-scan van de deployment gaf geen records.

Herstelbestanden en de concrete selectie/patch staan onder `/workspace/scratch/mbd-*ah-books-*20261121*`. Deze taak verandert de eerdere AH-toegangsbeperking niet: AH blokkeert ophalen vanaf Vercel; eigen bronexport/HTML blijft de veilige importroute. Persoonlijke favorieten en onbekende bronnen zijn niet automatisch samengevoegd of aangevuld.
