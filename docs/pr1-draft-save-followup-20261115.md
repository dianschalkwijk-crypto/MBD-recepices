# PR #1 — conceptwisseling tijdens opslaan

## Gevonden probleem

In de conceptpreview gebruikte de savehelper `currentDraft`, `editingDraftId`, de geselecteerde collecties en fotostatus ook nadat een netwerkverzoek was gestart. Als de gebruiker ondertussen een ander concept opende, konden de opgeslagen MDB-status en afsluiting op dat tweede concept terechtkomen. Dezelfde afhankelijkheid gaf een foutpad bij accountwisseling. Dit is gereproduceerd met een vertraagd antwoord: de eerste regressietest faalde doordat het tweede concept onterecht werd gesloten.

## Correctie

- Een opslagpoging legt het concept-ID, de receptgegevens, collecties en foto vast vóór het verzoek. Een terugkerend antwoord werkt uitsluitend de bewaarde status van dit oorspronkelijke concept bij.
- Een tweede geopend concept wordt niet afgesloten, verwijderd of gemarkeerd met het MDB-nummer van de eerste opslagpoging.
- Invoer van het verstuurde concept blijft tijdens het verzoek vergrendeld; een ander geopend concept kan worden bewerkt. De tweede opslagknop blijft geblokkeerd totdat de lopende poging is afgerond.
- Fotovoorbeelden volgen het geopende concept. Een vertraagde fotoconversie werkt het oorspronkelijke concept bij en zet zijn afbeelding niet in een ander concept.
- Bij accountwisseling blijft het resultaat bij de oorspronkelijke eigenaar; het wordt niet naar het nieuwe account gesynchroniseerd.
- Cacheversie verhoogd naar v39 zodat de gewijzigde savehelper en offline scripts samen worden geladen.

## Validatie

- De gerichte test faalde vóór de correctie en slaagt erna.
- 26 unit-/routetests geslaagd; TypeScript- en JavaScript-syntaxcontroles geslaagd.
- 22 browsertests geslaagd, verdeeld over desktop en iPhone-schermformaat in Chromium. Daaronder: wisselen van concept tijdens succesvolle of onzekere opslag, behoud van de foto en collecties van de eerste aanvraag en accountwisseling tijdens het verzoek.
- Deze regressietests gebruiken lokale cloudstubs. Ze schrijven geen recepten of nummers naar productie.

## Publicatiegrens

Deze correctie hoort bij concept-PR #1 op branch `fix/recipe-save-drafts-20261115`. Zij is alleen voor de preview voorbereid; productie blijft op `5ec708d` / `dpl_4kaCh1ySaSRksRNjhj1ixQicdkgN`. Deze ronde wijzigt geen databasefunctie, sleutel, bestaand recept of MDB-nummer.

De eerder uitgevoerde werkelijke productietest met `MDB-0694` blijft beschreven op werkbranch `fix/recipe-save-production` in `docs/live-save-verification-20261115.md`. De hier aangepaste conceptcode is een afzonderlijke uitbreiding en wordt niet als al live getest gepresenteerd. De overige eerder vermelde testgrenzen van PR #1 blijven bestaan, waaronder echte ingelogde conceptsync tussen apparaten.
