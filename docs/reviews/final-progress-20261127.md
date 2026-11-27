# Eindcontrole MadeByDian — werkregister 27 november 2026

## Opdracht en bescherming

Zie [volledige opdracht](final-scope-20261127.md). Werk door in dezelfde app, Supabase en Notion-database. Basis main b82829e; ontwikkelbranch feat/final-review-20261127. Git-bundle, volledige catalogusmomentopname en privéback-up van beoordelingen, weekmenu's, keukenstatus en gourmetarchief staan buiten GitHub. Geen productie-schemawijzigingen gepland. Geen persoonlijke bestelhistorie of accountgegevens opnemen in de repository.

## Feitelijke uitgangsstand

838 catalogusrecords, 204 reviewStatus=approved, 611 niet-goedgekeurde structure_passed, 18 exacte dubbelarchieven, één controletest. Dat levert 819 normale actieve records en vier overige inhoudelijke uitzonderingen op. De 74 Gourmet-recepten omvatten alle 31 combinaties MDB-0812–0842 / MBDG-001–031. Een goedgekeurde inhoudsstatus is geen bewijs van bereikbare foto of geverifieerde oorspronkelijke bron.

Alle 18 gemarkeerde dubbelen zijn opnieuw op ingrediënten en stappen vergeleken met hun hoofdrecept. Gelijk bevonden; oude nummers, bron-/beeldvelden en archiefinhoud behouden. Geen nummers vrijgegeven of opnieuw gebruikt. MDB-0694 is gearchiveerd als controletest; geen recept verwijderd.

## Uitgevoerd

- De 31 AI-gourmetrecepten hadden geen Notion-tegenhanger. Na duplicaatcontrole toegevoegd aan de bestaande database en gekoppeld onder dezelfde MDB's. Beide nummers behouden.
- Bereiding van die 31 uitgewerkt met herkenbare AI-herkomst, oorspronkelijke versies in originalRecipeBeforeReconstruction. Hoeveelheden behouden als proeverijonderdelen. Veiligheidsadvies gekoppeld aan Voedingscentrum; bronverificatie niet geclaimd.
- MDB-0457: drie deelrecepten als oorspronkelijke batches aangeduid. MDB-0458: ontbrekende saladehoeveelheden als AI-schatting aangevuld; twee afzonderlijke batches behouden. MDB-0645: bekende éénpersoonsbasis maal vier, overige hoeveelheden herkenbaar geschat. Notion-synchronisatie volgt dezelfde inhoud.
- Technisch: bestaande gourmetsterren gebruiken de centrale mbd_person_ratings-keten; geen tweede beoordelingssysteem. Oude lokale gourmetsterren worden alleen op bewuste keuze geïmporteerd, zonder bestaande scores te vervangen. Opa/Oma toegevoegd aan gewone receptdetails.
- Gourmetmenu-opslag bewaart ongesynchroniseerde lokale concepten. Een update gebruikt updated_at als conflictcontrole; een elders gewijzigd menu wordt niet overschreven.
- Gerechten met relatieve Notion-foto's tonen nu ook in Gourmet. AI-label en foutafhandeling toegevoegd.
- Voorbereidingsplanning blijft per dag maximaal 30 geschatte actieve minuten. Werk dat niet veilig past wordt als oningepland getoond, niet naar een te vroege bewaartijd verschoven. Minder gerechten of extra hulp blijft nodig als het menu te groot is.
- Bestaande ingevulde receptvelden ontvangen online correcties. Oude lokale afwijkingen worden bewaard; latere lokale wijzigingen krijgen een zichtbare conflictkeuze. Favorieten en persoonlijke notities worden niet overschreven. Testrecepten en exacte dubbelarchieven blijven buiten de normale bibliotheek.
- De controleteller onderscheidt de hele catalogus van de oude controlewerkset en inhoudelijke goedkeuring van structuurcontrole.

## Verificatie en verdere uitvoering

93 unit-tests, TypeScript en 78 browserregressies geslaagd voordat de laatste extra synchronisatieproef werd toegevoegd. De gerichte synchronisatie-/gourmet-/collectieproeven slagen op desktop en iPhone-formaat. Definitieve aantallen en preview/live-resultaten volgen bij de PR.

Foto-audit over de 819 actieve records: 273 beelden in de browser geladen en 117 aanvullende beelden met volledige HTTP-bestandsinhoud bevestigd. Bij 429 records stond geen foto of een expliciete ontbrekend-markering. Een browserfout alleen bleek geen bewijs van een verdwenen foto; alle 117 foutgevallen waren daarna bereikbaar. De nieuw gegenereerde gourmetbeelden worden pas als aanwezig opgeslagen nadat Notion-upload en SHA-256-readback via de live foto-URL overeenkomen. Foto's worden niet op basis van alleen een URL als gecontroleerd gemarkeerd.

De eerste AI-foto (MDB-0812) is al fysiek opgeslagen en exact teruggelezen. De overige generatie/uploadresultaten staan hervatbaar in de privéwerkmap; geen successen verzinnen of bestanden hergenereren die al succesvol opgeslagen zijn.

Nog niet afronden als volledig: de 611 structuurchecks zijn geen nieuwe inhoudelijke broncontrole. Ontbrekende of afgeschermde oorspronkelijke bronnen, MDB-0686 bronconflict, de ontbrekende avocado-broodjesidentiteit en ontbrekende foto's blijven afzonderlijke controlepunten. Bestaande goedgekeurde recepten niet opnieuw aan de gebruiker voorleggen. De opdracht is pas compleet wanneer alle relevante inhoud, beelden, synchronisatie en live gedrag aantoonbaar zijn gecontroleerd.

## Aanvulling na gegevens- en beeldcontrole

Alle 31 AI-gourmetfoto's zijn gegenereerd, visueel naast hun MDB/titel geïnspecteerd, in Notion opgeslagen en via de live foto-URL met identieke SHA-256 teruggelezen. Bestaande originele foto's zijn niet vervangen. Voor alle 31 zijn beide nummers, originele tekstmomentopname en Notion-koppeling aanwezig.

Nog één exact dubbel aangetroffen: MDB-0455 en MDB-0039 hebben dezelfde ingrediënten, bereiding en bron. MDB-0039 blijft hoofdrecept; collecties samengevoegd en aanvullende fotoverwijzing behouden. MDB-0455 blijft als archiefrecord bestaan. Geen beoordelingen bij deze twee records aangetroffen; privégegevens niet herschreven. De client bewaart favorietmarkeringen en kan oude archiefdetails nog openen.

Vier aanvullende AH-inhouden gecontroleerd met daadwerkelijk toegankelijke bronpagina's: 0017, 0104, 0164 en 0230. Bami naar vier personen omgerekend; chili-olie en eiersalade blijven een oorspronkelijke batch. De ontbrekende verwerking van sjalot in de eiersalade is zichtbaar als logische AI-aanvulling toegevoegd. Zalm Wellington 0349 heeft op dezelfde AH-URL nu een andere vulling; die variant is nadrukkelijk niet over de bewaarde champignonversie heen gezet.

Actueel: 838 records = 818 actief + 19 veilige dubbelarchieven + 1 controletest. 208 inhoudelijk goedgekeurd volgens opgeslagen status, 606 uitsluitend structuurcontrole en 4 overige inhoudelijke uitzonderingen. Dat is geen volledige bron-/beeldgoedkeuring van alle 818. De broncontrole kent aantoonbare versieconflicten en niet-toegankelijke bronnen.

42 catalogusrecords zijn in deze ronde aangepast, 796 overige recepten byte-inhoudelijk ongewijzigd. Geen MDB verloren of opnieuw toegewezen. Voorbereiding is in veilige deelhandelingen gesplitst: droog afmeten en schoon materiaal klaarzetten kan eerder, rauwe/gekoelde onderdelen op de laatste dag; maximaal 30 geschatte actieve minuten per dag, overloop blijft expliciet oningepland.

De opnieuw uitgevoerde PostgreSQL-test is niet voltooid: Docker kon door schijfruimtegebrek geen geïsoleerde container starten. Alleen een opnieuw downloadbare npm-cache is verwijderd om ruimte terug te krijgen. De bestaande productie-RLS is read-only nagekeken en niet gewijzigd. Dit is geen nieuwe geslaagde database-integratietest.
