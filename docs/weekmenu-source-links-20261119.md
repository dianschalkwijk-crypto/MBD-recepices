# Bronlinks bij weekmenukeuzes herstellen

De categorieresultaten en algemene weekmenuzoekresultaten boden geen afzonderlijke bronlinks; de titel van het gekozen gerecht opende de keuzelijst. Daardoor kon de gebruiker de bron niet rechtstreeks inspecteren vóór de keuze.

Toegevoegd op alle drie plekken: Recept bekijken (bestaande receptdetails, zonder de planning te veranderen), afzonderlijke oorspronkelijke bron/bron/inhoudsbron in een nieuw tabblad. Bronvelden blijven ongewijzigd. Dubbele exacte URL's worden één keer getoond; onveilige schema's en URL's met credentials worden niet aanklikbaar. Ontbrekende bron wordt expliciet gemeld. Geen impliciete bronvalidatie of vervanging.

Herstelbare codeback-up: `/workspace/scratch/mbd-before-weekmenu-links-20261119.bundle`. Geen databasewijziging. Rollback naar productiecommit 86395d3, deployment dpl_B1oK4hqJXAQktZmVwMCYk8wHBq9b.

Lokale verificatie: vijf planning-unittests, TypeScript en desktop/telefoon-browsertest geslaagd. Werkelijk klikken op bron opent de exacte URL in een apart tabblad; receptdetails openen/sluiten verandert het gekozen gerecht niet. Algemene zoekresultaten, categorieresultaten en gekozen gerecht hebben eigen acties buiten de dropdownoverlay.

## Aanvulling: social eerst, website apart

Gebruikerscorrectie: overal beide bekende linktypen kunnen openen, met social eerst. Gemeenschappelijke linkweergave nu ook toegepast op bibliotheekkaarten en receptdetails. Label wordt bepaald door de werkelijke hostname, niet door het veld `sourceURL` of platformlabel. Websites heten Website bekijken; sociallinks Social bekijken. Canonieke duplicaten met uitsluitend een extra eindslash worden eenmaal getoond; opgeslagen URL blijft exact intact.

MDB-0323: actuele catalogus én historische seed verwijzen uitsluitend naar Annika Eats. Het historische QR-/bronregister noemt Instagram, maar zegt expliciet “Platform bekend; exacte link nog niet hersteld”. Daarom geen sociallink ingevuld of een soortgelijke reel als origineel gepresenteerd. De interface meldt Sociallink niet bekend; de bekende website blijft te openen. Dit inhoudelijke herstelpunt blijft open.

Productie: `b977018b367f6467477fc9ee6aae2647673c6def`, READY `dpl_9LN9MTe7gmtqQetdyz56uUk9Es1Y`. Catalogus na release: `/workspace/scratch/mbd-after-social-first-catalog-20261119.json`; alle 700 records volledig gelijk aan de back-up vóór bronlinkherstel. Publicatie verandert uitsluitend weergave en navigatie.

Vier controles op het productiedomein geslaagd: echte catalogus/MDB-0323 en geïsoleerde filter-/bronklik-/detail-/bibliotheektest, beide op desktop en iPhone-schermformaat. Social opent vóór de website; beide exact juiste href en een afzonderlijk tabblad. Recept bekijken verandert geen weekkeuze. Bij 0323 blijft de ontbrekende sociallink expliciet zichtbaar en wordt de identieke website niet dubbel getoond. Geen inhoudelijke bron- of QR-goedkeuring en geen fysieke Safari-test.
