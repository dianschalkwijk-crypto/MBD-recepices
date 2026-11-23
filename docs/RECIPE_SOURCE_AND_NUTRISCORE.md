# MadeByDian — receptbron en scores

## Geverifieerde database (2026-11-23)
- Supabase project: `MadeByDian Recepten`
- Project ref: `ywsdubincfabjhvjqkot`
- Hoofdtabel: `public.mbd_catalog`
- Receptpayload: `recipe` (JSONB)
- `public.recipes` is leeg en mag niet als bewijs voor ontbrekende recepten worden gebruikt.
- 803 records in `mbd_catalog` op controledatum; dit is geen garantie voor 803 zichtbare, unieke recepten.

## Veiligheidsregels
- Controleer productie-app configuratie en daadwerkelijke leesbron voordat er geschreven wordt.
- Maak back-up en controleer bestaande MBD-nummers, duplicaten en record-ID's voor iedere bulkmutatie.
- Geen automatische overschrijving, verwijdering of hernummering.
- Gebruik voor berekende receptscores een blauwe achtergrond en label `Berekende receptscore (niet officieel)`; voor geverifieerde officiële productscores wit.
- Geen A-E toekennen zonder voldoende kwantitatieve voedingsdata en gedocumenteerde methode; bij onvoldoende data `Nog te berekenen`.
- Nutri-Score is een officieel voedingsmiddelenlabel; een berekende score voor een zelfgemaakt recept is niet officieel.

## Audit op 2026-11-23
- `mbd_catalog`: 803 records
- `recipe.nutrition` als JSON-object: 0
- `recipe.nutriScore`: 0
- `recipe.ingredients` als niet-lege JSON-array: 9
- Veel voedingsinformatie staat als vrije tekst en vereist parsing, broncontrole en berekening per 100 g vóór scoretoekenning.

## Vervolg
1. Productie-leesbron verifiëren.
2. Recepten inventariseren op volledigheid en benodigde voedingswaarden (energie, suikers, verzadigd vet, zout/natrium, vezels, eiwit, groente/fruit/peulvruchten en relevante categorie).
3. Bereken uitsluitend onderbouwde scores, registreer methode, datum en herkomst en toon onderscheid in app. Sync daarna gecontroleerd met Notion.