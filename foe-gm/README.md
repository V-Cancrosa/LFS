# Fallout: Equestria — Panel Mistrza Gry

Lokalne narzędzie dla MG do planowania i prowadzenia kampanii Fallout: Equestria,
dopasowane do zasad z **Fallout: Equestria RPG System – Core Rulebook v1.22** (plik PDF w głównym folderze repozytorium).
Wszystkie materiały kampanii są w jednym miejscu i można się między nimi przeklikiwać jak w wiki.
Obok masz kości, tracker walki, brudnopis sesji i podręcznik PDF.

## Uruchomienie

1. Pobierz repozytorium (np. **Code → Download ZIP** na GitHubie) i rozpakuj.
2. Otwórz `foe-gm/index.html` dwuklikiem, najlepiej w Chrome, Edge albo Firefoksie.
3. W zakładce **📖 Podręcznik** kliknij **PDF z repo**. Otworzy się PDF leżący obok folderu `foe-gm`.
   Możesz też wybrać plik ręcznie przez **Wczytaj PDF**.

Nie trzeba nic instalować ani mieć internetu. Za pierwszym razem zobaczysz przykładową kampanię.
Możesz ją obejrzeć, a potem na pulpicie wybrać **Ustawienia → Nowa, pusta kampania**.

## Co jest w środku

| Element | Do czego |
|---|---|
| **Wpisy** | Kampania / wątki, Sesje, Lokacje, NPC, Frakcje, Postacie graczy, Bestiariusz, Przedmioty, Zasady, Notatki |
| **Linki `[[...]]`** | `[[Rusty Bolt]]` prowadzi do innego wpisu. Czerwony link oznacza, że wpisu jeszcze nie ma; kliknięcie go tworzy. |
| **„Wspomniane w”** | Na dole każdego wpisu widać, które wpisy do niego linkują. |
| **Należy do** | Hierarchia wpisów, np. sesja → przygoda, pomieszczenie → lokacja. Daje okruszki i listę wpisów podrzędnych. |
| **Blok statystyk** | S.P.E.C.I.A.L., Poziom, Rana (obrażenia na ranę), DT i umiejętności. Karta sama liczy TN (atrybut ×10, umiejętność = ranga + 5×atrybut) oraz wartości pochodne: SATS, ruch, udźwig, inicjatywę i karty szczęścia. **Kliknięcie atrybutu lub umiejętności wykonuje test.** Przycisk „+ umiejętności” w edytorze wpisuje rangi startowe. |
| **Listy zadań** | `- [ ] scena`. Odhaczasz je w trakcie sesji; pulpit pokazuje, co jeszcze zostało. |
| **Kości** | k4–k100, wyrażenia (`2k6+3`, `3d10`), historia rzutów. **Test k100 wg podręcznika:** TN × MFD (2 … 1/10) ± modyfikator, krytyki 1–5 / 96–100 i najlepszy osiągnięty MFD (do rzutów przeciwstawnych). Pod polem widać progi dla każdego MFD. |
| **Walka** | Inicjatywa k100 (niższa działa pierwsza; puste pole = automatyczny rzut). **Rany zamiast HP:** wpisujesz obrażenia, a tracker odejmuje DT i dzieli przez obrażenia na ranę. Ostrzega przy ½ END (okaleczenie) i END (śmierć). SATS odnawia się o 5 co rundę. Przycisk „⚔ Do walki” na karcie NPC przenosi END, DT i SATS. |
| **Ściągi z podręcznika** | Rzuty i MFD, walka, rany i pancerz, karty szczęścia, tworzenie postaci, umiejętności, losowe spotkania k100 (po polsku), pogoda i oświetlenie, indeks bestiariusza (~90 stworów z linkami do stron). Każda zasada ma link `[[str:N]]` do PDF. Do istniejącej kampanii dodasz je przyciskiem **„Dodaj ściągi z podręcznika”** na pulpicie. |
| **Podręcznik** | Wczytujesz PDF raz, przeglądarka go zapamiętuje. Zakładki do stron, a we wpisach link `[[str:42]]` otwiera stronę 42. |
| **Rzuty we wpisach** | `[[r:2k10+4\|Strzelba]]` to klikalny rzut, np. atak NPC. |
| **Brudnopis** | Szybkie notatki w trakcie sesji. Da się je potem zamienić we wpis sesji. |

## Skróty klawiszowe

- `Ctrl+K`: szybkie przejście do dowolnego wpisu albo utworzenie nowego
- `Alt+←` / `Alt+→`: wstecz / dalej
- `E`: edycja otwartego wpisu · `Ctrl+S`: zapis · `Esc`: anuluj
- `Ctrl+Shift+N`: nowy wpis
- `Ctrl+Enter`: następna tura w walce
- `/`: filtr listy po lewej
- W edytorze wpisz `[[`, a pojawią się podpowiedzi tytułów.

## Gdzie są dane i kopie zapasowe

- Wpisy zapisują się **automatycznie w przeglądarce** (localStorage), osobno dla każdej przeglądarki i komputera.
- PDF podręcznika trzymany jest w IndexedDB przeglądarki. Nie trafia do eksportu.
- **⭳ Eksport** zapisuje całą kampanię do pliku `.json`. Rób to regularnie, bo wyczyszczenie danych przeglądarki usunie kampanię.
  Ten sam plik wczytasz przez **⭱ Import** na innym komputerze.
- Zmiana tytułu wpisu automatycznie poprawia linki do niego w innych wpisach.

## Pliki

- `index.html`: układ strony
- `style.css`: wygląd (motywy: zielony Pip-Buck, bursztyn, niebieski, jasny)
- `app.js`: cała logika, bez zewnętrznych bibliotek
- `podrecznik.js`: ściągi i zakładki do podręcznika v1.22 (numery stron = strony PDF)
