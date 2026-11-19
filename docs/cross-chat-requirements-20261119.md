# Overdracht uit andere chats — 19 november 2026

Deze overdracht bewaart teruggevonden gebruikerswensen in de bestaande receptenrepository. Vastgelegd is niet hetzelfde als gebouwd, gepubliceerd of getest. Geen recepten, nummers, bronnen of boekindelingen zijn voor deze overdracht gewijzigd. Hoofdchat: **MBD-Recepeices-Dian**.

## Afbakening en bewijs

De recente chatinventaris en de volledige beschikbare gebruikersbeurten van de onderstaande recepten-/masterchats zijn gelezen. De algemene oudere ChatGPT-historylijst was vanuit deze omgeving niet beschikbaar; daarom is dit geen garantie dat iedere historische chat is onderzocht. Historische assistentclaims zijn geen actuele verificatie.

Actuele technische basis staat bovenaan PROJECT_STATUS.md en RECOVERY_STATUS.md: bestaande Vercel-app, productie a35abee, Supabase-catalogus met 700 records. Productie-browsertests en opslagconcurrency zijn opgelost en getest. Controlebeslissingen staan nog uitsluitend in IndexedDB van de gebruikte browser. Individuele bron-/QR-inhoud is niet algemeen goedgekeurd. Een volledig nieuw recept met foto is na de laatste opslagrelease niet live toegevoegd.

## Overgenomen eisen en vervolgwerk

| Herkomst | Concrete wens | Status en veilige vervolgstap |
|---|---|---|
| Controleer PR en productie — `6afd409b-afc8-83ed-8064-0164f1bfa2db` | Verschil PR/live, twee geblokkeerde browsertests, twee opslagrisico's, catalogustelling en broncontrole nagaan. | Technische tests en opslagrisico's inmiddels afgehandeld; 700 in plaats van historische 689. PR-review/merge blijft apart van livegang. Bron-/QR-goedkeuring en opslag tussen apparaten blijven open. Geen oude blokkades opnieuw oplossen. |
| master Weekmenu chat + toevoegen — `6ac20a9d-d81c-83ed-af23-a60372b64870` | Bestaand recept kunnen hernoemen/corrigeren; MDB-0625 juiste link/recept; wijzigingen in Notion zichtbaar in app; zoekopdracht toont onterecht 0120 en mist nieuwste 0625; gedeelde links duurzaam bewaren. | Eerst gerichte reproductie en vergelijking van app, catalogus en Notion. Geen automatische tweerichtingssynchronisatie: app/Supabase leidend, Notion back-up volgens latere gebruikerswens. Niet aannemen dat de huidige 0625-link de bedoelde vervanging is. |
| Geef Instagramlink 623 — `6af83a8b-2a1c-83ed-9430-94b2e93d388a` | Originele sociallink van MDB-0623 terugvinden. | In de lokale geverifieerde databaseback-up van 19 november ontbreekt de bron nog. Exacte URL niet verzinnen of uit een vergelijkbaar recept afleiden. |
| Recept zoeken smeerkaas — `6af7f4c4-7ba8-83eb-acaa-44ab4ad1a382` | Gebruiker identificeerde smeerkaastosti als 592. | Dezelfde back-up bevat MDB-0592, titel “Eiwitrijke volkoren tosti met kipfilet”, met Instagram-bron. Inhoudelijke overeenkomst nog controleren; titel/ingrediënten niet stilzwijgend vervangen. Historische claim “database leeg” strookt niet met de huidige catalogus. |
| Receptideeën maken — `6afc3ad5-0b90-83eb-b915-caac0a6da482` | Werken in receptenapp, Notion als back-up; eerdere Google-master meenemen. | Als architectuureis vastgelegd. Google-bestand is aanvullend totdat inhoud en koppelingen zijn vastgesteld; geen automatische samenvoeging. Knutsel-/kerstlinks uit dezelfde chat horen niet in recepten. |
| Weekmenu werkruimte bouwen — `6afc3ac7-801c-83eb-a0fc-f602efca9bfd` | HelloFresh-bibliotheek en weekmenu-goedkeuring: import/invoer, foto/bron/receptinformatie, goedkeuren/afwijzen, notitie/vervolgstap; definitief en concept apart; heropenen/exporteren; filters op beoordeling/status/ontbrekende informatie; print met beeld en dagoverzicht. | Nog geen bewijs van voltooide werkruimtes. Bestaande weekmenufuncties eerst inspecteren, geen duplicaat bouwen. Deze historische opdracht vroeg expliciet om Sites; huidige receptenapp-opdracht vraagt bestaande Vercel-app. Eerst koppeling en overlap vaststellen; niet stilzwijgend twee masters of nieuwe losse apps maken. |
| Kids lekker vinden lijst — `6ab3399b-d3ec-83ed-8dfc-ee5bfdcc2f9b` | Voorkeuren onthouden: Jake pasta pesto, zalm, broccoli en Tom Kai-soep alleen camping/slager; Mace broccoli. | Gebruikersinformatie hier bewaard, nog niet als appfunctie of gevalideerde receptkoppeling opgeslagen. Geen willekeurige MDB-koppelingen maken. |
| Kookboeken controleren — `6afd4995-7be8-83eb-a234-a6b5eb2533de` | Bestaande boeken 1–30 afronden; nummers/thema's/ontwerp/indeling behouden; inhoud, hoeveelheden, bereiding, foto's, bronnen, QR, inhoudsopgave/paginering controleren; printbestanden echt testen. Nieuwe goedgekeurde recepten aan passend bestaand boek koppelen, concepten apart; geen duplicaten binnen boek; nieuw boek alleen na toestemming. Register/versie/datum/status, wijzigingssignalering en eerdere definitieve versies behouden. | Niet af. Boekenbestanden en Notion-toegang opnieuw verifiëren vóór uitvoering. Historische boek-1-naamsconflicten en boeken 31/32 eerst reconciliëren, niet hernummeren. MDB-0182 is volgens eerdere overdracht definitief vervallen: nooit hergebruiken. Werk boek voor boek; eerst inventaris/export met bewijs, dan gerichte correcties. |
| master chat 2.0 — `6afd409f-3ef4-83ed-8ed3-9e1e16b22252` | Receptenwerk overdragen naar eigen hoofdchat; kookboeken inclusief toekomstige nieuwe recepten. Algemene Notion-opschoning zonder verwijderen. | Receptendeel hierboven overgenomen. Algemene Notion-opschoning blijft buiten deze receptenopdracht; deze masterchat bevat ook andere projecten. |

### Gerichte controle uit bestaande back-up

Alleen gelezen: `/workspace/scratch/mbd-after-concurrency-fix-20261119.json`; geen nieuwe databasequery of wijziging. MDB-0120 is “Makkelijke eenpanslasagne met kip, broccoli en kaas” met bronvelden. MDB-0625 is “Ontbijtbowl top” met Instagram-link. Dat bewijst dat de records bestaan, niet dat het gemelde zoek-/synchronisatieprobleem is gerepareerd of dat hun bron inhoudelijk klopt.

## Volgorde voor uitvoering

1. Volledig nieuw recept met foto opslaan en teruglezen na de huidige release, met gecontroleerde afzonderlijke testinvoer; behoud productiegegevens.
2. Gerichte zoek-/bewerk-/synchronisatieregressies voor 0120/0625; brononderzoek 0623 en inhoudscontrole 0592. Geen bronvervanging zonder concrete keuze.
3. Bestaande weekmenu-/HelloFresh-functies en werkbestanden vergelijken; architectuur en veilige persistente beslisopslag bepalen, met behoud van concept/definitief.
4. Kookboekenregister en bestanden inventariseren en boek voor boek controleren. Geen automatische boektoewijzing of QR-regeneratie.

## Chats sluiten zonder overdrachtsverlies

Sluiten betekent hier archiveren door de gebruiker, niet verwijderen of werk als voltooid beschouwen. Er zijn geen chats automatisch gearchiveerd.

- **Controleer PR en productie**: kan worden gesloten; controlepunten en actuele afhandeling staan centraal.
- **Geef Instagramlink 623** en **Recept zoeken smeerkaas**: kunnen worden gesloten na deze overdracht; hun open inhoudelijke vragen blijven hierboven expliciet staan.
- **Weekmenu werkruimte bouwen** en **Kookboeken controleren**: eisen zijn overgenomen en kunnen vanuit de hoofdchat worden voortgezet; functies/boeken zijn nog niet klaar. Bestaande bijlagen en oorspronkelijke bestanden behouden.
- **Kids lekker vinden lijst**: de zichtbare voorkeuren zijn hierboven bewaard; sluit alleen als nieuwe voorkeuren voortaan in de hoofdchat worden gegeven.
- **master chat 2.0**, **Receptideeën maken**, **Wekelijkse MBD status**, **Social links zoeken** en kledingkast-chat: niet als zuivere receptenduplicaten sluiten. Ze bevatten andere projecten, sociale links of nog open kledinguploads. Niet in recepten verwerkt.

De hoofdchat **MBD-Recepeices-Dian** blijft het centrale vervolg voor de receptenapp.
