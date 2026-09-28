/* Ściągi do „Fallout: Equestria RPG System – Core Rulebook” v1.22.
 * Numery stron odpowiadają stronom PDF (są takie same jak numeracja w druku).
 * Treść to skróty i streszczenia po polsku; pełne zasady są w podręczniku pod podanymi stronami.
 */
'use strict';

const FOE_BOOKMARKS = [
  [6, 'Rzuty i MFD'], [12, 'Karta postaci'], [21, 'Rasy'], [49, 'Atrybuty'], [53, 'Karty szczęścia'],
  [58, 'Umiejętności'], [67, 'Przywary'], [99, 'Cechy'], [127, 'Perki'], [150, 'Ekwipunek'],
  [187, 'Broń'], [241, 'Magia i lot'], [435, 'Walka'], [443, 'Lokacje trafień'], [452, 'Osłona i uniki'],
  [462, 'Rany'], [471, 'Podsumowanie walki'], [483, 'Promieniowanie'], [490, 'Bestiariusz'],
  [602, 'Przewodnik MG'], [618, 'Losowe spotkania'], [628, 'Pogoda i światło'], [632, 'Tabela MFD'],
];

const FOE_REFERENCE = [
  {
    title: 'Ściąga: rzuty i MFD', tags: ['zasady', 'ściąga'], pinned: true,
    body: `Podstawa systemu: rzut **k100** (dwie k10, „d%”). **Rzucasz nisko**: sukces, gdy wynik ≤ Target Number (TN). [[str:6]]

## Jak policzyć TN
- **Atrybut:** wartość × 10 (np. PER 6 → 60). Tak samo przy rzucie „bez umiejętności”. [[str:63]]
- **Umiejętność:** ranga + ½ × (atrybut × 10), czyli ranga + 5 × atrybut. [[str:13]]
- **Inny MFD:** ⌊TN × MFD⌋, a potem premie (+) i kary (−), np. −25 za 25% osłony. [[str:7]]
- Test w aplikacji: zakładka 🎲 Kości → „Test k100”, albo kliknij atrybut lub umiejętność na karcie NPC.

## Modyfikator trudności (MFD)
| MFD | Trudność | Przykłady z podręcznika |
|---|---|---|
| 2 | bardzo łatwe | rozmowa z przyjaznym NPC, śrut z przyłożenia |
| 1½ | łatwe | tropienie niezdarnego kucyka, przemknięcie obok śpiących strażników |
| 1 | normalne | trafienie odsłoniętego celu w zasięgu, łatwy zamek lub terminal |
| ¾ | trudne | przeciętny zamek lub terminal, uczciwa cena u neutralnego kupca |
| ½ | bardzo trudne | trudny zamek lub terminal, strzał do pilota vertibucka z SATS |
| ¼ | frustrujące | strzał na ślepo zza barykady, bardzo trudny zamek |
| 1/10 | niezwykle trudne | złożenie Pip-Bucka z pamięci |

„Krok MFD” to przesunięcie o jeden wiersz tabeli (np. z 1 na ¾). Rzeczy „prawie niemożliwe” zostaw na krytyczny sukces. [[str:6]] · gotowa tabela przeliczeń: [[str:632]]

## Krytyki [[str:8]]
- **1–5:** krytyczny sukces · **96–100:** krytyczna porażka (np. zacięcie broni). Skutki ustala MG.
- Perki i karty szczęścia mogą poszerzać te zakresy. → [[Ściąga: karty szczęścia]]

## Rzuty przeciwstawne [[str:9]]
Obie strony rzucają i podają **najtrudniejszy osiągnięty MFD**. Wygrywa trudniejszy (1/10 bije ¼). Przy remisie obaj rzucają ponownie. Krytyczny sukces może wyrównać tylko drugi krytyczny sukces. Aplikacja podaje osiągnięty MFD przy każdym teście.

## Skradanie [[str:60]]
Wynik MFD z percepcji strażnika staje się MFD skradającego się (remis wygrywa strażnik). Bez rzutu strażnika:

| Strażnik | MFD skradania |
|---|---|
| śpi, ślepy, obezwładniony | 2 |
| zmęczony lub rozproszony | 1½ |
| znudzony | 1 |
| skupiony | ¾ |
| uważny | ½ |
| w pogotowiu | ¼ |
| wysoki alarm, wie o tobie | tylko krytyk |

Oświetlenie i pogoda: → [[Pogoda i oświetlenie]]`,
  },
  {
    title: 'Ściąga: walka', tags: ['zasady', 'ściąga', 'walka'], pinned: true,
    body: `Rozdział 7: [[str:435]] · lista akcji: [[str:471]]

## Runda
- Runda trwa 6 s. Każdy ma **2 akcje**. Krótka wypowiedź jest darmowa. [[str:435]]
- **Inicjatywa:** k100 ± do wartości AGI MFD ¼ (⌊AGI × 10 / 4⌋); gracz wybiera znak przed ogłoszeniem wyniku. **Niższy wynik działa pierwszy.** Remis rozstrzyga wyższa AGI. [[str:436]]
  - Opcja: ta sama cyfra dziesiątek oznacza akcje jednoczesne.
- **Zaskoczenie:** atakujący mają rundę z 1 akcją; nieświadomy cel to atak z zaskoczenia (krytyk). [[str:436]]

## Ruch [[str:437]]
- 2,5 × AGI ft na akcję (w dół do 5); bieg (obie akcje) ×3; akcja inna niż ruch zmniejsza dystans o połowę.
- **Szarża:** 2 akcje, min. 15 ft w linii prostej, kończy się atakiem wręcz; rogiem +3k6.
- Skradanie: ½ ruchu [[str:438]] · lot [[str:440]] · przeciążenie [[str:440]]

## Trafienie [[str:441]]
- Rzut umiejętnością broni; nieruchomy, odsłonięty cel = MFD 1; domyślnie celujesz w tułów.
- **SATS:** aktywacja kosztuje 1 akcję; pula 40 + 5 × AGI, odnawia 5 na rundę. Pozwala ignorować kary sytuacyjne (dym, mgła, strzał w zwarciu), ale nie kary za dystans.

| Strzał celowany | Kara | Efekt |
|---|---|---|
| głowa | 2 kroki | obrażenia ×1,5 |
| nogi / ręce / skrzydła | 1 krok | ręce: szansa rozbrojenia |
| róg | 3 kroki | przerywa magię |
| oko / serce | 4 kroki | dodatkowe obrażenia |
| znaczek | 2 kroki | |
| juki | 1 krok | utrata lub zniszczenie przedmiotu |

Pełna tabela: [[str:443]] · losowe lokacje (opcja): [[str:449]] · wybuchy i obszar: [[str:451]]

## Obrona [[str:452]]
Zużywa następną akcję postaci, więc można jej użyć, zanim postać wykona swój ruch.
- **Unik:** rzut AGI; osiągnięty MFD staje się MFD potrzebnym do trafienia do końca rundy. [[str:453]]
- **Blok kończyną:** walka bez broni (MFD o krok łatwiejszy); obrażenia od ataku wręcz ×½.
- **Blok przedmiotem:** walka wręcz MFD ¾; zablokowany atak nie zadaje obrażeń.
- **Padnij:** +10 DT przeciw wybuchom; wstanie wymaga AGI MFD ¾.
- **Osłona:** strzelający dostaje karę równą procentowi zasłonięcia. Tabele: [[str:454]]

## Inne
- Przeładowanie i strzał w jednej akcji: −1 krok MFD. [[str:451]]
- **Krytyk:** mnożnik z kolumny „Crit” broni. Wybuchy nie zadają krytyków. Atak z zaskoczenia to automatyczny krytyk (min. ×2). [[str:456]] [[str:457]]
- **Powalenie:** wstanie wymaga AGI MFD ¾ (porażka = wstaje, ale traci akcję). Bezpośrednie trafienie wybuchem powala. [[str:457]]
- Degradacja broni (opcja): [[str:458]] · strach i groza: [[str:467]]

## Duże walki (dla MG) [[str:605]]
- Statyści („mooks”) giną po END ran, bez liczenia lokacji. Stosuj ich, gdy wrogów jest 3× więcej niż graczy. [[str:606]]
- Inicjatywa grupowa: grupy po 4–6 statystów plus silniejszy przeciwnik z własną inicjatywą. [[str:609]]

Rany i śmierć: → [[Ściąga: rany, pancerz i śmierć]]`,
  },
  {
    title: 'Ściąga: rany, pancerz i śmierć', tags: ['zasady', 'ściąga', 'walka'],
    body: `W tym systemie **nie ma punktów życia**. Są rany zadawane w konkretne lokacje ciała. [[str:462]]

## Liczenie obrażeń [[str:462]]
1. Obrażenia broni + premie (STR, umiejętność, perki).
2. Mnożniki (krytyk, głowa ×1,5…) **sumuje się**, maks. ×10.
3. Odejmij **DT** pancerza w trafionej lokacji (broń przeciwpancerna ignoruje część DT).
4. Podziel przez **obrażenia na ranę** celu, w dół → tyle ran trafia w lokację.

Tracker walki robi kroki 3–4 za Ciebie: wpisz obrażenia w pole „obr.”.

## Obrażenia na ranę [[str:15]]
10 na 1. poziomie, +1 co 3 poziomy (od 3.), maks. 20. Duże kucyki: 12. Przywary Pipsqueak/Young: 8 lub 6.

## Pancerz [[str:460]]
- Z kilku warstw liczy się tylko **najwyższe DT**. Naturalne DT (np. z perków) się dodaje.
- Degradacja (opcja): trafienie mocniejsze niż DT obniża DT o 1; przy DT 0 pancerz ulega zniszczeniu.
- Wybuchy działają osobno na każdą odsłoniętą lokację. [[str:461]]

## Skutki ran [[str:462]]
| Rany w lokacji | Skutek |
|---|---|
| ½ END | **okaleczenie**: −1 krok MFD do związanych rzutów; noga do ruchu: −25% prędkości |
| END w głowę lub tułów | **śmierć** [[str:465]] |
| END w kończynę | utrata kończyny |
| razem ≥ 4 × END (gracze, ważni NPC) | przy każdej akcji END MFD ¾, inaczej utrata przytomności [[str:463]] |

- Okaleczone skrzydła: lot MFD ¼, inaczej postać spada. Okaleczony jednorożec: MFD ¼, żeby utrzymać zaklęcia.
- Obrażenia nieśmiercionośne ogłuszają zamiast zabijać: 2k4 h nieprzytomności + 1k4 h za każdą ranę ponad END. [[str:463]]

## Leczenie miksturą (wg Medycyny) [[str:59]]
| Medycyna | Usuwa ran |
|---|---|
| 0 lub mniej | 1 |
| 1–25 | [[r:1k4]] |
| 26–49 | [[r:1k6+1]] |
| 50–74 | [[r:1k8+2]] |
| 75–99 | [[r:1k10+3]] |
| 100 | [[r:1k12+4]] |

Powrót do zdrowia: [[str:181]] · krwawienie: [[str:579]] · trucizna i ogień: [[str:466]] · promieniowanie: [[str:483]] · skażenie (taint): [[str:485]]`,
  },
  {
    title: 'Ściąga: karty szczęścia', tags: ['zasady', 'ściąga'],
    body: `Zasada opcjonalna, zalecana przez autora („Live by Luck”). [[str:53]]

## Ile kart
- **Gracz:** na początku sesji ⌈LUCK / 2⌉ + 2, min. 3 (jedyne zaokrąglanie w górę w systemie). Karty nie przechodzą na kolejne sesje.
- **MG:** 1 na gracza, +1 za każdego alikorna, psa piekielnego, towarzysza-zwierzę i ghula, +2 za każdego ghula z Canterlotu. Ważny złoczyńca może dostać własną pulę.
- Gracze mogą oddawać sobie karty: za każdą przekazaną kartę trzeba dodatkowo wydać jedną.
- MG może wydać kartę (dając po jednej każdemu graczowi), żeby zmienić bieg wydarzeń.

## Użycie [[str:54]]
- **Przerzut porażki:** 1 karta. Każdy przerzut poszerza zakres krytyków o 5% (1–10 i 91–100, potem 1–15 i 86–100…) do 50%.
- **Zniwelowanie krytycznej porażki:** karta + test LUCK × 10. Sukces zamienia ją w zwykłą porażkę, krytyczny sukces w sukces. Krytyczna porażka oznacza, że nie można już wydawać kart na ten rzut.
- **Przed rzutem:** karta poprawia wynik; limit 5 kart na rzut. Dokładną wartość sprawdź na [[str:54]] (tekst podaje „−5 od wyniku, tj. premia +10”).`,
  },
  {
    title: 'Tworzenie postaci', tags: ['zasady', 'ściąga', 'postacie'],
    body: `Rozdział 2: [[str:11]] · objaśnienie karty postaci: [[str:12]] · przykładowe postacie: [[str:395]]

## Kroki
1. **Rasa** [[str:21]]: +1 do atrybutu rasowego (niektóre rasy +2). Kucyki [[str:24]], gryfy [[str:27]], zebry [[str:28]], rasy alternatywne [[str:29]].
2. **Atrybuty** [[str:49]]: każdy zaczyna od 1; 35 punktów tworzenia (7 z nich idzie na te startowe jedynki). 5 to przeciętna wartość.
3. **Umiejętności** [[str:58]]: ranga startowa = 2 + 2 × atrybut + ½ LUCK (w dół), min. 5. Trzy **umiejętności wiodące** dostają +15 i zwykle wiążą się ze znaczkiem. [[str:62]]
4. **Przywary** (Hindrances) [[str:67]] dają dodatkowe punkty tworzenia.
5. **Cechy** (Traits) [[str:99]] kosztują punkty tworzenia.

W aplikacji: wpisz S.P.E.C.I.A.L. w bloku statystyk postaci i kliknij **„+ umiejętności”**. Rangi startowe policzą się same; pamiętaj o +15 dla umiejętności wiodących.

## Wartości pochodne (liczone automatycznie na karcie)
- **SATS:** 40 + 5 × AGI [[str:15]]
- **Ruch:** 2,5 × AGI ft (w dół do 5), skradanie ½ ruchu, lot lub kopanie 5 × AGI [[str:13]]
- **Udźwig:** 100 + 10 × STR; broń maks. 2 × STR wagi [[str:150]]
- **Obrażenia na ranę:** 10 na 1. poziomie [[str:15]]
- **Karty szczęścia:** ⌈LUCK / 2⌉ + 2, min. 3 [[str:53]]

## Rozwój
Punkty umiejętności [[str:126]] · perk co poziom od 2. [[str:127]] · perki z zadań [[str:147]] · książki podnoszą umiejętności [[str:208]]

Umiejętności i ich atrybuty: → [[Umiejętności i atrybuty]]`,
  },
  {
    title: 'Umiejętności i atrybuty', tags: ['zasady', 'ściąga', 'postacie'],
    body: `TN umiejętności przy MFD 1 = **ranga + 5 × atrybut**. Rangi nie przekraczają 100. [[str:58]]

| Umiejętność | W podręczniku | Atrybut | Uwagi |
|---|---|---|---|
| Walka wręcz | Melee | S | premia do obrażeń STR ×1…×5 wg rangi |
| Kopanie | Dig | S | rasowa (psy piaskowe, psy piekielne); też wspinaczka |
| Broń energetyczna | Energy Weapons | P | +ranga/10 do obrażeń |
| Materiały wybuchowe | Explosives | P | poniżej 26 rang tylko 25% obrażeń; też rzucanie |
| Otwieranie zamków | Lockpicking | P | zwykle wymaga narzędzi |
| Ciężka broń | Big Guns | E | +ranga/10 do obrażeń |
| Przetrwanie | Survival | E | jedzenie, tropienie, składniki zebr |
| Walka bez broni | Unarmed | E | kopyta, róg, skrzydła, szpony |
| Handel | Mercantile | C | ceny, wycena, rzadkie towary |
| Perswazja | Speechcraft | C | tylko wobec NPC! karma daje ±1 co 10 pkt |
| Magia | Magic | I (zebry: C) | rasowa; rzuca się dwa razy: rzucenie i wycelowanie |
| Medycyna | Medicine | I | leczenie ran, trucizny |
| Naprawa | Repair | I | naprawa, modyfikacje, budowa |
| Nauka | Science | I | terminale, roboty, technologia magiczna |
| Latanie | Flight | A | rasowa; manewry powietrzne [[str:379]] |
| Lekka broń | Small Guns | A | +ranga/10 do obrażeń |
| Skradanie | Sneak | A | też kradzież kieszonkowa |

Opis umiejętności: [[str:58]]–[[str:62]] · rzut bez umiejętności (atrybut × 10): [[str:63]] · pomoc innego gracza: [[str:64]]

## Atrybuty S.P.E.C.I.A.L. [[str:49]]
| | Atrybut | Wpływa na |
|---|---|---|
| S | Siła | udźwig, obrażenia wręcz, Walka wręcz |
| P | Percepcja | zasięg wykrywania (5 × PER ft), broń energetyczna, wybuchy, zamki |
| E | Wytrzymałość | liczba ran, odporność na truciznę i promieniowanie, Ciężka broń, Przetrwanie, Walka bez broni |
| C | Charyzma | Handel, Perswazja |
| I | Inteligencja | Medycyna, Naprawa, Nauka, magia jednorożców |
| A | Zwinność | ruch, SATS, Lekka broń, Skradanie, Latanie |
| L | Szczęście | rangi startowe wszystkich umiejętności, karty szczęścia |

Tymczasowa zmiana atrybutu zmienia powiązane umiejętności o 5 × różnicę. [[str:17]]`,
  },
  {
    title: 'Losowe spotkania (k100)', tags: ['zasady', 'ściąga', 'pustkowia'],
    body: `Rzuć: [[r:k100|Losowe spotkanie]] i odczytaj wynik z tabeli. Oryginał: [[str:618]]–[[str:620]]

| k100 | Zdarzenie |
|---|---|
| 1 | Karawana kupiecka |
| 2 | Konwój łowców niewolników (3+ łowców, 3+ niewolników) |
| 3 | Osadnicy |
| 4 | Handlarz: różności, chemia, amunicja |
| 5 | Zasadzka rabusiów (raiders) |
| 6 | Radskorpion |
| 7 | Wędrujący spritebot |
| 8 | Ukryte wejście do tunelu |
| 9 | Wykryty sygnał lokalnej radiostacji |
| 10 | Myśliwi |
| 11 | Nomadzi |
| 12 | Łowcy zbiegłych niewolników |
| 13 | Patrol Stalowych Strażników |
| 14 | Patrol Strażników Applejack |
| 15 | Klucz alikornów |
| 16 | Kultyści Jedności |
| 17 | Wędrujący Protectapony |
| 18 | Zbiegli niewolnicy |
| 19–20 | Olbrzymie insekty (karaluchy, radskorpiony, bloatsprite'y, mrówki) |
| 21 | Yao Guai |
| 22 | Zniszczony przedwojenny konwój wojskowy |
| 23 | Handlarz chemią |
| 24 | Handlarz bronią |
| 25 | Handlarz pancerzami |
| 26 | Handlarz żywnością |
| 27 | Odległy wybuch (może jakaś walka) |
| 28 | Dzikie ghule |
| 29 | Najemnicy |
| 30 | Zwiadowcy psów piekielnych |
| 31 | Patrol lokalnego gangu |
| 32 | Zwiadowcy lokalnego plemienia |
| 33 | Drogę blokuje gruz; trzeba obejść |
| 34 | Mała osada |
| 35 | Obóz rabusiów |
| 36 | Trwająca potyczka (dwie frakcje albo frakcja kontra stwory) |
| 37 | Kupcy lub zwiadowcy Korpusu Ochotniczego Enklawy |
| 38 | Ciała w płytkim grobie (losowa broń i pancerz) |
| 39 | Wędrowny śpiewak |
| 40 | Opuszczony bunkier |
| 41 | Właz kanałowy |
| 42 | Oddział wojenny plemienia lub gangu (2–4 wrogów) |
| 43 | Rośliny zarodnikowe |
| 44 | Średnie zwierzę (gekon, kojot, pies), pojedyncze |
| 45–46 | Średnie zwierzęta, stado |
| 47 | Przewrócony wóz: beczki skażenia (Ministerstwo Nauk Tajemnych) |
| 48 | Przewrócony wóz: beczki materiału radioaktywnego (zebrze glify) |
| 49–50 | Małe zwierzęta (kretoszczury, małe gekony) |
| 51 | Kucyki-farmerzy |
| 52 | Bandyci |
| 53 | Zasadzka bandytów |
| 54 | Gnijące ciała po bitwie (losowa broń) |
| 55 | Kucyk uwięziony w zardzewiałym pancerzu wspomaganym |
| 56 | Wysypisko toksycznych odpadów |
| 57 | Zakapturzony strażnik mostu nad przepaścią |
| 58 | Rozbity wagon kolejowy |
| 59 | Rozbity dom na kołach |
| 60 | Mały prowizoryczny pomnik |
| 61 | Przewrócony podniebny wóz |
| 62 | Zezowaty alikorn (pstryka w nos i odlatuje do góry nogami) |
| 63 | Oddział najemnych zabójców |
| 64 | Patrol lokalnej frakcji: przyjazny |
| 65 | Patrol lokalnej frakcji: wrogi |
| 66 | Patrol lokalnej frakcji: neutralny |
| 67 | Łowcy-kanibale |
| 68 | Rozbójnik z nienaładowaną bronią |
| 69 | Zbiegły niewolnik w uzbrojonej obroży-bombie |
| 70 | Szkielety |
| 71 | Pole minowe |
| 72 | Wędrowiec umierający z pragnienia |
| 73 | Konwój ze znaczkiem Celestii („Celestial Frag Grenades”) |
| 74 | Tłum ziemskich kucyków palących „czarownice” |
| 75 | Skamieniały pies (Seymour) |
| 76 | Psy piaskowe lub piekielne grające w pokera |
| 77 | Spritebot Obserwatora |
| 78 | Źrebak w masce gazowej („Are you my mummy?”) |
| 79 | Losowa audycja radiowa |
| 80 | Graffiti „Zebra Eunt Domus” i puszka farby obok |
| 81 | Lodówka z martwym kucykiem w kapeluszu i z biczem |
| 82 | Pies prowadzi drużynę do zbieracza uwięzionego w studni |
| 83 | Piekielne Babcie (trzy staruszki z wałkami w skórzanych kurtkach) |
| 84 | Zebrza radiolatarnia (szkielet jeźdźca smoka lub komandosa) |
| 85 | Alikorn-filozof |
| 86 | Vertibuck |
| 87 | Patrol Enklawy |
| 88 | Samotny pies (pech: trwale połowa LUCK jednego z graczy) |
| 89 | Wyschnięte koryto rzeki z na wpół zakopanym jachtem |
| 90 | Napromieniowane jezioro lub staw |
| 91 | Nadciąga gęsta mgła. Rzuć jeszcze raz: [[r:k100]] |
| 92 | Zepsute roboty |
| 93 | Automatyczne systemy obronne |
| 94 | Robot-wartownik (może kilka) |
| 95 | Na wpół zakopany wóz Sparkle Coli |
| 96 | Gigantyczny ślad stopy lub kopyta |
| 97 | Nietypowa budka policyjna |
| 98 | Stado brahminów |
| 99 | Pnącza Killing Joke |
| 100 | Krater po meteorycie (może Star Blaster) |`,
  },
  {
    title: 'Pogoda i oświetlenie', tags: ['zasady', 'ściąga', 'pustkowia'],
    body: `Modyfikatory do trafienia, percepcji i skradania. [[str:628]] · percepcja [[str:49]] · skradanie [[str:60]]

## Pogoda
| Pogoda | Trafienie / percepcja | Skradanie | Widoczność |
|---|---|---|---|
| Słonecznie | +1 MFD | −2 MFD | 15 × PER ft |
| Częściowe zachmurzenie | – | −1 MFD | 10 × PER |
| Pochmurno (standard) | – | – | 10 × PER |
| Mżawka | −5 | +1 MFD | 10 × PER |
| Burza z deszczem | −1 MFD | +1 MFD | 5 × PER |
| Tajfun / huragan | −3 MFD | +2 MFD | 5 × PER |
| Grad | −2 MFD | +1 MFD | 5 × PER |
| Śnieżyca | −1 MFD | +1 MFD | 5 × PER |
| Zamieć | −3 MFD | +2 MFD | 2 × PER |
| Silny wiatr | −1 MFD (tylko trafienie) | – | 10 × PER |
| Mgiełka | −5 | +1 MFD | 5 × PER |
| Mgła / chmury / dym | −1 MFD | – | 5 × PER |
| Magiczna mgła | −2 MFD | +1 MFD | 3 × PER |
| Zaćmienie | −1 MFD | +2 MFD | 3 × PER |
| Burza pyłowa | −2 MFD | +1 MFD | 3 × PER |
| Burza piaskowa | −3 MFD | +3 MFD | 1 × PER |

## Oświetlenie
| Światło | Przykład | Trafienie / percepcja | Skradanie | Widoczność |
|---|---|---|---|---|
| Jasne | słońce ponad chmurami, reflektory | +1 MFD | −2 MFD | 15 × PER |
| Dobre | światło Pip-Bucka, zasilane budynki | – | −1 MFD | 10 × PER |
| Pochmurne | Pustkowia za dnia | – | – | 10 × PER |
| Przyćmione | ruiny z oknami, latarnia, ognisko | −5 | +1 MFD | 5 × PER |
| Ciemność | jaskinie, piwnice, noc na Pustkowiach | −1 MFD | +2 MFD | 2 × PER |

„+1 MFD” to krok w stronę łatwiejszego stopnia, „−1 MFD” w stronę trudniejszego. „−5” to kara do rzutu.`,
  },
  {
    title: 'Indeks bestiariusza', tags: ['zasady', 'bestiariusz'],
    body: `Statystyki stworów są w podręczniku („My Little Monster Manual”, [[str:490]]). Kliknij nazwę, żeby otworzyć jej stronę. Własny stwór: szablon na [[str:576]].

Żeby mieć stwora w trackerze walki, utwórz wpis w kategorii Bestiariusz, przepisz END, DT i AGI z podręcznika i kliknij „⚔ Do walki”.

## Owady i pajęczaki
[[str:490|Giant Ant (żołnierz, robotnica)]] · [[str:491|Fire Ant]] · [[str:492|Radscorpion]] · [[str:493|Giant Radscorpion]] · [[str:494|Albino Radscorpion]] · [[str:495|Momma Radscorpion]] · [[str:501|Applebugs]] · [[str:506|Scorposprites]] · [[str:517|Radroach, Bloatsprite, Fillydelphian Parasprite]]

## Rośliny
[[str:496|Spore Shooter (Floater)]] · [[str:499|Moss Ponies]] · [[str:500|Needle Pines, Taint Weepers]] · [[str:501|Delicious Fruit Trees]] · [[str:502|Zapapple Bombers]] · [[str:503|Barricade Bark]] · [[str:504|Killing Joke]]

## Potwory i zwierzęta
[[str:497|Centaur]] · [[str:498|Manticore]] · [[str:505|Nightstalkers]] · [[str:507|Timberwolves]] · [[str:508|Dog]] · [[str:509|Cyberdog]] · [[str:510|W-1N0N4]] · [[str:511|Brahmin]] · [[str:512|Balefire Phoenix]] · [[str:513|Ankha]] · [[str:514|Qetzal]] · [[str:515|Mole Rat]] · [[str:516|Yao Guai]] · [[str:528|Mirelurk]] · [[str:529|Mirelurk Hunter]] · [[str:530|Mirelurk King]] · [[str:531|Radigator]] · [[str:532|Hydra]]

## Zebry, Strażnicy, plemiona
- Zebry-niedobitki: [[str:518|Technicians]] · [[str:519|Soldiers]] · [[str:520|Hunters]]
- Stalowi Strażnicy / Strażnicy Applejack: [[str:521|Scribe]] · [[str:522|Initiate]] · [[str:523|Knight]] · [[str:524|Paladin]] · [[str:525|Star Paladin]]
- Plemiona: [[str:526|Warrior]] · [[str:527|Chieftain]]

## Roboty i automaty
[[str:533|Automated Turrets (Gun, Magical Beam, Magical Pulse)]] · [[str:534|Heavy Turrets]] · [[str:535|Ponitron]] · [[str:536|Protectapony]] · [[str:537|Robronco]] · [[str:538|Sentry Bot]] · [[str:539|Mister Gutsy, Mister Handy]] · [[str:540|Spritebots]]

## Kucyki z Pustkowi
- Cywile: [[str:541|Wasteland Merchant]] · [[str:542|Caravan Guard]] · [[str:543|Settlement Militia]] · [[str:544|Crusaders]]
- Rabusie: [[str:545|Raider Grunt]] · [[str:546|Raider Lieutenant]] · [[str:547|Raider Boss]] · [[str:548|Raider Warlord]] · [[str:549|Plague Raiders]]
- Łowcy niewolników: [[str:550|Slave]] · [[str:551|Slaver Grunt]] · [[str:552|Slaver Lieutenant]] · [[str:553|Smooth Talker]] · [[str:554|Visionary]] · [[str:555|Slaver Boss]]
- Najemnicy: [[str:556|Talon Mercs]] · [[str:557|Pony Mercenaries]] · [[str:558|Mercenary Lieutenants]] · [[str:559|Stern / Gawdyna Grimfeathers]]
- [[str:560|Enclave Soldiers]]

## Ghule
[[str:561|Ferals]] · [[str:562|Glowing pOne]] · [[str:563|Reavers]] · [[str:564|Canterlot Ghouls]] · [[str:565|Canterlot Ghoul Zebra]] · [[str:567|Canterlot Ghoul Foals]] · [[str:568|The Lost Herd]]

## Alikorny, psy piekielne, podmieńcy
[[str:569|Alicorns]] · [[str:570|Blue / Green / Purple]] · [[str:571|Rad-Soaked]] · [[str:572|Hellhound Sniper]] · [[str:573|Hellhound Guard]] · [[str:574|Hellhound Digger]] · [[str:575|Changelings]]`,
  },
];
