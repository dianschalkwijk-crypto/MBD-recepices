# Recepten delen via WhatsApp

In de bestaande app staat Delen via WhatsApp op de receptkaart, in de receptdetails en bij weekmenukeuzes/-zoekresultaten. De link opent WhatsApp met een concept: titel, bestaand MDB-nummer, bronporties/tijd, volledige beschikbare ingrediënten en bereiding, bekende sociallinks vóór websites. De gebruiker kiest ontvanger en verzendt zelf; de app kiest geen contact en verstuurt geen bericht.

De gedeelde tekst neemt de oorspronkelijke receptporties over. Een weekmenuschaling verandert de gedeelde broninhoud niet. Onbekende informatie wordt niet verzonnen. Privé-Notionlinks, accountgegevens, private fotopaden, sterren en persoonlijke notities worden niet meegestuurd. Geen receptmutaties of databasewijzigingen. Geen foto meegestuurd in deze tekstdeelactie.

Gebruikt de standaard `https://wa.me/?text=...`-link met correct geëncodeerde tekst, zonder telefoonnummer. Link opent apart met noopener/noreferrer. Bron- en websitelinks blijven afzonderlijk klikbaar. De gebruiker kan het concept in WhatsApp aanpassen.

Back-up: `/workspace/scratch/mbd-before-whatsapp-20261119.bundle`; catalogus vóór release `/workspace/scratch/mbd-before-whatsapp-catalog-20261119.json`. Rollback: bestaande productie 7a737a4 / dpl_DkMY2VkY27zRjeANrd4mGx5e4rts. Geen gegevensrollback nodig omdat de functie alleen een deelconcept maakt.

Verificatie vóór publicatie: 36 unit-/routetests, TypeScript en de gerichte desktop-/iPhone-schermformaatbrowsercontroles geslaagd. Tests controleren behoud van Nederlandse tekens, emoji, regeleinden, volledige recepttekst, exacte bronlinks en hun volgorde, afwezigheid van privévelden en afwezigheid van ontvanger. Browsercontrole test alle drie plaatsen en dat delen de bibliotheek niet wijzigt. Op beide schermformaten is het klikken/openen van de WhatsApp-conceptlink getest met een afgevangen testbestemming: geen echt bericht. De overgang naar een geïnstalleerde fysieke WhatsApp-app en daadwerkelijke verzending zijn niet getest.

De extra actie legde een bestaande mobiele layoutbeperking bloot: de receptacties stonden op één vaste rij. Acties lopen nu over meerdere regels; links krijgen dezelfde begrensde knoplijnen als buttons. Horizontale overflow en onbereikbare knoppen op smalle schermen zijn daarmee in de browsertest verholpen.
