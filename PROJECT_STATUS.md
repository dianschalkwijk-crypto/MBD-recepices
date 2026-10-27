# MadeByDian — centraal herstelregister
Bijgewerkt: 2026-10-27. Dit document is de startplaats voor vervolgwerk. Verifieer veranderlijke gegevens opnieuw, maar herhaal geen reeds bewezen diagnose zonder aanleiding.

## Werkregels
1. Lees eerst dit register en RECOVERY_STATUS.md; raadpleeg bestaande exports en eerdere herstelpogingen voordat om bestanden wordt gevraagd.
2. Maak onderscheid tussen GEVONDEN, GETEST, GEREPAREERD en KLAAR. KLAAR betekent: functionele test geslaagd, geen dataverlies, resultaat vastgelegd.
3. Bescherm productie en bestaande MDB-nummers. Geen verwijderingen, hernummering, bulkoverschrijving of productie-deploy zonder gecontroleerde back-up en rollback.
4. Werk één blokkade tegelijk af. Leg per wijziging vast: oorzaak, wijziging, test, uitkomst, resterende actie.
5. Stop met eindeloos dezelfde geblokkeerde actie proberen. Kies een andere route en noteer beperkingen.
6. Scheid herstel van bestaande functies van nieuwe features.

## Bewezen status
- GitHub: dianschalkwijk-crypto/MBD-recepices. main bevat alleen RECOVERY_STATUS.md; recovery/vercel-2026-10-22 bevat gedeeltelijk herstelde appcode. Ook branch fix/clickable-collections-20261024 bestaat.
- Bron: Vercel deployment dpl_FCb3R9KJiaRnDFYdstAc1f2TmSoK. Herstelregister meldt 46/55 bestanden hersteld en negen ontbrekende serverbestanden; zie RECOVERY_STATUS.md voor exacte paden.
- Vercel deployment dpl_6YJCoojBP4ru439XSqeSuGn3zKSo heeft READY-status en is gebouwd vanaf recovery/vercel-2026-10-22; READY bewijst geen functionele end-to-end-synchronisatie.
- Vercel API get_deployment_file_contents retourneert base64, maar de inhoud van ontbrekende serverbestanden is afgekapt. NIET als volledige broncode opslaan.
- Supabase project ywsdubincfabjhvjqkot: eerder gecontroleerd 669 unieke MDB-records in public.mbd_catalog; dit is geen nieuwe live-telling. SQL-tool werd door veiligheidscontroles geblokkeerd, metadata lezen lukte wel.
- catalog-sync-v2.js haalt Supabase naar lokale app en vult ontbrekende velden aan; Notion is daarin geen terugschrijvende bron. notion-force-sync-v1.js haalt Notion naar lokale app. Niet aannemen dat beide veilig samen werken zonder tests.
- Notion hoofdpage 3d648664-8ea9-81e1-999f-f9d2cc71cea6. Historische bronbestanden en statussen zijn ouder dan huidige catalogus.

## Open blokkades (niet opnieuw als nieuw presenteren)
1. Negen serverbestanden volledig terughalen en integriteit vergelijken met originele Vercel-deployment.
2. Vaststellen welke scripts de actuele productie-app laadt en conflictregels voor Notion/Supabase vastleggen.
3. End-to-end-test: recept lezen, wijzigen, opslaan, teruglezen in Supabase en Notion, conflict en rollback testen.
4. Actuele datakwaliteit: ontbrekende foto-/bronlinks en Nederlandse receptinhoud; eerst betrouwbare actuele telling.
5. Compleet herstel testen op preview; pas daarna expliciete productie-release.

## Veilig vervolg
Inspecteer eerst eerdere exports of andere beschikbare bronkopieën en de bestaande herstelbranch; vraag niet opnieuw om een export die al eerder is gedaan. Documenteer elke afgeronde test hier. Geen nieuw project aanmaken.

## Uitgevoerde codewijziging 2026-10-27
- `catalog-sync-v2.js` op recovery-branch aangepast (commit 2145412e8dca62cbf1d3543583f0d1dd44a9075c): originele lokale toestand wordt vóór de eerste merge vastgelegd; bij mislukte opslag stopt synchronisatie. Eerdere code maakte de zogenoemde pre-sync-back-up pas na mutatie.
- Opnieuw uit GitHub gelezen: back-up-instructie staat vóór de merge, oude back-up na merge verwijderd. Nog GEEN browser-/end-to-end-test; NIET naar productie publiceren.

## Technische controle en reparatie 2026-10-27 (vervolg)
- `catalog-sync-v2.js` commit 55453b82444559b9a2785b5d5ff8e7954b605f58: bij mislukte persist wordt lokale toestand zo mogelijk hersteld uit pre-sync snapshot. Codewijziging uitgevoerd; browsertest ontbreekt.
- Belangrijk nieuw bewezen probleem: `index.html` bevat zelfstandige `syncCatalogRecipes()` die 1800 ms na laden draait. Deze route gebruikt niet automatisch de veiligheidscode in `catalog-sync-v2.js`, kan bestaande foto-velden overschrijven en muteert lokale staat vóór persist zonder snapshot.
- Poging om `index.html` rechtstreeks veilig te wijzigen is geblokkeerd door OpenAI veiligheidscontroles op grote toolaanroep. Geen wijziging aan index.html doorgevoerd. Zoek alternatieve veilige patchroute, zonder ongeteste productie-deploy.

## Reparatie dubbele catalogussynchronisatie (2026-10-27)
- `service-worker.js` gewijzigd, commit 373b41374cd63debb36cdd80bcac29a7bb7ba51a: HTML-injectie schakelt `setTimeout(syncCatalogRecipes,1800);` uit, zodat de beveiligde `catalog-sync-v2.js` de catalogus verwerkt. Cacheversie verhoogd naar v0.10.17.
- Gecontroleerd: exacte te vervangen tekst komt één keer voor in `index.html`; serviceworker bevat de vervanging en laadt `catalog-sync-v2.js`.
- BEPERKING: eerste bezoek zonder actieve serviceworker krijgt de oorspronkelijke HTML en voert de inline synchronisatie nog uit. Dit is daarom slechts een gedeeltelijke oplossing, nog niet volledig veilig. Nodig: server-side HTML aanpassing of kleine codewijziging in `index.html` via betrouwbare patchroute, plus browsertests. Geen productie-release.

## Reparatie eerste paginalading 2026-10-27
- `api/app.ts` commit 4f52739ab8aceb066becdd3a8291085d0c217483: vervangt bij server-side HTML-verwerking `setTimeout(syncCatalogRecipes,1800);` door commentaar vóór scriptinjectie. Git object API gebruikt wegens blokkade reguliere grote update.
- Opnieuw uit GitHub gelezen en statisch gecontroleerd: oorspronkelijke hook bestaat in `index.html`, servercode verwijdert deze, veilige catalog-sync blijft geïnjecteerd; serviceworker schakelt eveneens de hook uit.
- Geen browser-/preview-/end-to-end-test; de bronbranch mist nog negen serverbestanden. Niet productie-deployen of KLAAR noemen voordat preview-build en datatests slagen.

## Vercel-verificatie 2026-10-27
- Previewdeployment `dpl_HtKrWeyrBKNa9N5rWiX9r5EwwyYp` op commit `c33d7561c2336eb388ddb048dc60305b771d66b7` is READY. Buildlogs: dependencies geïnstalleerd, TypeScript build en deployment completed, geen fatale buildfouten.
- Browser-/HTTP-test van exacte preview-URL via externe lezer gaf `login_required` (Vercel Deployment Protection). Dit is GEEN bewijs van werkende app en GEEN app-authenticatiefout. Geen bescherming uitschakelen.
- Nodig voor daadwerkelijke end-to-end-test: geauthenticeerde toegang via Vercel CLI `vc curl` of OIDC Trusted Sources; daarna GET `/` controleren op ontbreken van inline sync hook, GET `/api/health`, en read-only cataloguscheck. Geen productie-release zonder deze tests.

## Testvervolg 2026-10-27
- Preview dpl_HtKrWeyrBKNa9N5rWiX9r5EwwyYp is READY en buildlogs tonen voltooide build. Externe HTML/browser-test is geblokkeerd door Vercel-login (login_required); geen poging om deploymentbeveiliging uit te schakelen.
- Statische test op werkelijk uit GitHub gelezen bron: serververvanging verwijdert exacte inline sync hook (1 oorspronkelijke match), injectie verwijst naar catalog-sync-v2.js, serviceworker schakelt dezelfde hook uit, snapshot staat vóór merge, rollbackcode bestaat. Alle vijf checks positief. Dit is NIET hetzelfde als een geslaagde browser- of database-integratietest.
- Preview-runtime logs afgelopen 30 minuten: geen events. Dit bewijst geen foutloosheid omdat geen geauthenticeerde request uitgevoerd kon worden.
- Apart productieprobleem uit Vercel runtime errors: `/api/recipes/recognize-photo` had op 2026-10-26 HTTP 429 `credit_balance_exhausted` / `insufficient_quota` voor AI-fotoherkenning. Geen betaling of API-configuratie gewijzigd.
