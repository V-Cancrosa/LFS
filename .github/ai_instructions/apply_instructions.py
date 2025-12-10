#!/usr/bin/env python3
import os
import subprocess
from pathlib import Path
import sys
import shutil

ROOT = Path('.').resolve()
INS_PATH = ROOT / '.github' / 'ai_instructions' / 'instruction.txt'
BRANCH = "ai/auto-changes"

def run(cmd, check=True, capture=False):
    if capture:
        return subprocess.run(cmd, shell=True, check=check, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    else:
        return subprocess.run(cmd, shell=True, check=check)

def git(*args):
    cmd = "git " + " ".join(args)
    return run(cmd)

def ensure_repo_clean():
    res = run("git status --porcelain", check=False, capture=True)
    if res.stdout.strip():
        print("UWAGA: repo nie jest czyste (zmiany lokalne). Workflow i tak spróbuje działać.")

def apply_replace(parts):
    if len(parts) != 3:
        print("BŁĄD: replace wymaga 3 części: path|old|new")
        return False
    path_s, old, new = parts
    target = ROOT / path_s
    if not target.exists():
        print(f"Plik nie istnieje: {target}")
        return False
    text = target.read_text(encoding='utf-8')
    if old not in text:
        print(f"Tekst do zastąpienia nie znaleziony w {target}")
    text = text.replace(old, new)
    target.write_text(text, encoding='utf-8')
    print(f"Zastąpiono w {target}")
    return True

def apply_create(parts):
    if len(parts) != 2:
        print("BŁĄD: create wymaga 2 części: path|content")
        return False
    path_s, content = parts
    target = ROOT / path_s
    target.parent.mkdir(parents=True, exist_ok=True)
    if target.exists():
        print(f"Plik już istnieje: {target}. Nadpisuję.")
    target.write_text(content, encoding='utf-8')
    print(f"Utworzono {target}")
    return True

def apply_append(parts):
    if len(parts) != 2:
        print("BŁĄD: append wymaga 2 części: path|content")
        return False
    path_s, content = parts
    target = ROOT / path_s
    if not target.exists():
        print(f"Plik nie istnieje: {target}. Tworzę nowy.")
        target.parent.mkdir(parents=True, exist_ok=True)
    with open(target, 'a', encoding='utf-8') as f:
        f.write(content)
    print(f"Dopisano do {target}")
    return True

def apply_delete(parts):
    if len(parts) != 1:
        print("BŁĄD: delete wymaga 1 części: path")
        return False
    path_s = parts[0]
    target = ROOT / path_s
    if not target.exists():
        print(f"Plik nie istnieje: {target}")
        return False
    if target.is_dir():
        shutil.rmtree(target)
        print(f"Usunięto katalog {target}")
    else:
        target.unlink()
        print(f"Usunięto plik {target}")
    return True

def parse_line(line):
    line = line.strip()
    if not line or line.startswith("#"):
        return None
    if ":" not in line:
        print("Nieprawidłowa linia:", line)
        return None
    cmd, rest = line.split(":", 1)
    cmd = cmd.strip().lower()
    rest = rest.strip()
    parts = rest.split("|")
    return cmd, parts

def main():
    if not INS_PATH.exists():
        print("Brak pliku instrukcji:", INS_PATH)
        return 0

    ensure_repo_clean()
    raw = INS_PATH.read_text(encoding='utf-8')
    lines = raw.splitlines()
    applied_any = False

    for ln in lines:
        parsed = parse_line(ln)
        if not parsed:
            continue
        cmd, parts = parsed
        print("Wykonuję:", cmd, parts)
        ok = False
        if cmd == "replace":
            ok = apply_replace(parts)
        elif cmd == "create":
            ok = apply_create(parts)
        elif cmd == "append":
            ok = apply_append(parts)
        elif cmd == "delete":
            ok = apply_delete(parts)
        else:
            print("Nieznana komenda:", cmd)
        applied_any = applied_any or ok

    if not applied_any:
        print("Brak zmian do commita.")
        return 0

    try:
        git(f'checkout -B {BRANCH}')
        git('add -A')
        git('commit -m "AI-applied changes from instruction.txt"')
        print("Stworzono commit i branch:", BRANCH)
    except subprocess.CalledProcessError as e:
        print("BŁĄD podczas commita:", e)
        return 1

    return 0

if __name__ == "__main__":
    sys.exit(main())
