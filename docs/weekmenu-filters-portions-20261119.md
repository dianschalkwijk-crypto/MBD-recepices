# Weekmenu: categorieën, persoonlijke sterren en personen

Uitbreiding in de bestaande receptenapp. Basis: productie a35abee; rollback dpl_HgL5U26wuu4Rka2yTCYfEoCBAhdJ. Herstelbare codeback-up: /workspace/scratch/mbd-before-weekmenu-20261119.bundle (geverifieerd). Read-only catalogusback-up: /workspace/scratch/mbd-before-weekmenu-catalog-20261119.json, 700 records. Geen database- of receptmutaties, geen nummering, foto- of bronwijzigingen.

- Per dag aanpasbare categorie/collectie, met maandag soep als bestaande suggestie. Alle beschikbare collecties blijven te kiezen. Categorie openen toont alle passende recepten; zoeken vernauwt die lijst.
- Persoon Mama/Jake/Mace/Gast en filter alle / 4–5 / 5 / zonder sterren. Gebruikt bestaande persoonlijke beoordelingen uit de receptdetails. Geen beoordeling verzonnen. Filters wijzigen opgeslagen gerechten niet automatisch.
- Alle drie bestaande menuvoorstelknoppen gebruiken dezelfde categorie-, sterren-, allergie- en eetvoorkeurregels. Geen stille terugval buiten de gekozen categorie. Dagen zonder resultaat behouden hun keuze met melding.
- Standaard vier personen, aanpasbaar globaal en per dag. Bekende bronpersonen worden alleen voor weergave/boodschappen omgerekend. Originele ingrediënten en bronporties blijven intact. Breuken, decimalen en hoeveelheden zonder spatie worden ondersteund; onduidelijke aantallen blijven ongewijzigd met zichtbare controle-instructie.
- MDB-0323 vermeldt **24 cups**, niet 24 personen. Stuks/cups en onduidelijke bereiken mogen nooit als personen gelden. De app vraagt expliciete bronpersonen voordat omrekening mogelijk is. De lokale invulling is geen wijziging aan het recept.
- Planninginstellingen en aanvullende bronpersonen blijven in deze browser. Geen nieuwe cloudsynchronisatie. Bestaande archivering van dagporties blijft aanwezig.
- Oud change-eventscript beperkt tot echte receptkeuzes; anders onderschepte het categorie- en sterrenfilters. Oude generator in voorkeuren verwijderd: die kon de nieuwe filter-/allergieregels omzeilen.

Validatie vóór publicatie: 31 unit-/routetests en TypeScript geslaagd; 16 browsercontroles geslaagd (desktop en iPhone-schermformaat), waaronder de nieuwe categorie-/Mama-/portie-/herlaad-/boodschappentest en alle drie generatoren. Twee live-source-tests in deze lokale run bewust overgeslagen; afzonderlijke productiecontrole volgt. Geen fysieke Safari-test.
