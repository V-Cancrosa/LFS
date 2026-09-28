# Fallout: Equestria — Panel Mistrza Gry

Lokalne narzędzie dla MG do planowania i prowadzenia kampanii Fallout: Equestria.
Wszystkie materiały kampanii są w jednym miejscu i można się między nimi przeklikiwać jak w wiki.
Obok masz kości, tracker walki, brudnopis sesji i podręcznik PDF.

## Uruchomienie

1. Skopiuj folder `foe-gm` na swój komputer.
2. Otwórz `index.html` dwuklikiem, najlepiej w Chrome, Edge albo Firefoksie.

Nie trzeba nic instalować ani mieć internetu. Za pierwszym razem zobaczysz przykładową kampanię.
Możesz ją obejrzeć, a potem na pulpicie wybrać **Ustawienia → Nowa, pusta kampania**.

## Co jest w środku

| Element | Do czego |
|---|---|
| **Wpisy** | Kampania / wątki, Sesje, Lokacje, NPC, Frakcje, Postacie graczy, Bestiariusz, Przedmioty, Zasady, Notatki |
| **Linki `[[...]]`** | `[[Rusty Bolt]]` prowadzi do innego wpisu. Czerwony link oznacza, że wpisu jeszcze nie ma; kliknięcie go tworzy. |
| **„Wspomniane w”** | Na dole każdego wpisu widać, które wpisy do niego linkują. |
| **Należy do** | Hierarchia wpisów, np. sesja → przygoda, pomieszczenie → lokacja. Daje okruszki i listę wpisów podrzędnych. |
| **Blok statystyk** | S.P.E.C.I.A.L., HP, AP, DT, Sekwencja. Pola można dowolnie dodawać, usuwać i zmieniać ich nazwy. |
| **Listy zadań** | `- [ ] scena`. Odhaczasz je w trakcie sesji; pulpit pokazuje, co jeszcze zostało. |
| **Kości** | k4–k100, wyrażenia (`2k6+3`, `3d10`), test k100 ≤ umiejętność, historia rzutów. |
| **Walka** | Inicjatywa, rundy, HP z paskiem, obrażenia/leczenie (`-7` / `+5`), notatki o stanach. Przycisk „⚔ Do walki” na karcie NPC dodaje go od razu z HP i Sekwencją. |
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
