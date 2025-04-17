import os
import pyperclip  # Stellt sicher, dass Sie 'pip install pyperclip' ausgeführt haben
import sys

# --- Konfiguration ---
# Fügen Sie hier die relativen Pfade zu den Ordnern hinzu, in denen *rekursiv*
# nach .ts-, .tsx- und .css-Dateien gesucht werden soll.
# Verwenden Sie Schrägstriche (/) als Pfadtrenner für bessere Kompatibilität,
# auch wenn Sie unter Windows arbeiten. Das Skript normalisiert sie.
TARGET_DIRECTORIES = [
    "apps/frontend-new/src",
    # Fügen Sie hier weitere relative Pfade hinzu
    # "pfad/zum/anderen/basis-ordner",
]
# --- Ende der Konfiguration ---

def collect_target_file_content_recursively(base_path, relative_start_dirs):
    """
    Sammelt Pfade und Inhalte von .ts-, .tsx- und .css-Dateien rekursiv
    in den angegebenen Startverzeichnissen und deren Unterverzeichnissen.

    Args:
        base_path (str): Der Basispfad (Projekt-Root), von dem aus das Skript läuft.
        relative_start_dirs (list): Eine Liste von relativen Pfaden zu den
                                     Startordnern für die rekursive Suche.

    Returns:
        tuple: Ein Tuple enthaltend:
            - list: Eine Liste von Strings, jeder formatiert als "Path: ... \n\n Content... \n\n".
            - int: Die Anzahl der erfolgreich verarbeiteten Dateien.
            - list: Eine Liste von Fehlermeldungen.
    """
    all_content_blocks = []
    processed_files_count = 0
    errors = []
    found_any_target_files = False # Flag um zu prüfen, ob überhaupt Zieldateien gefunden wurden

    # Definiere die Zieldateiendungen
    target_extensions = (".ts", ".tsx", ".css") # *** HIER IST DIE ERWEITERUNG ***

    print(f"Skript gestartet. Suche rekursiv nach {'-, '.join(ext + '-Dateien' for ext in target_extensions)} in:") # Dynamische Ausgabe
    for rel_start_dir in relative_start_dirs:
        # Normalisiere den Pfad für das aktuelle Betriebssystem
        normalized_rel_start_dir = os.path.normpath(rel_start_dir)
        abs_start_dir_path = os.path.join(base_path, normalized_rel_start_dir)
        print(f"- Startordner: {normalized_rel_start_dir}")

        if not os.path.isdir(abs_start_dir_path):
            error_msg = f"WARNUNG: Startverzeichnis nicht gefunden oder kein Verzeichnis: {normalized_rel_start_dir}"
            print(f"  {error_msg}")
            errors.append(error_msg)
            continue

        # os.walk durchläuft das Verzeichnis und alle Unterverzeichnisse
        for dirpath, dirnames, filenames in os.walk(abs_start_dir_path):
            # dirpath: Aktueller absoluter Pfad des durchlaufenen Ordners
            # dirnames: Liste der Unterordnernamen in dirpath
            # filenames: Liste der Dateinamen in dirpath

            for filename in filenames:
                # Prüfe, ob die Datei eine der Zieldateiendungen hat (Groß-/Kleinschreibung ignorieren)
                # *** HIER IST DIE ÄNDERUNG ***
                if filename.lower().endswith(target_extensions):
                    found_any_target_files = True # Mindestens eine Zieldatei gefunden
                    abs_file_path = os.path.join(dirpath, filename)

                    # Erstelle den relativen Pfad zur Datei (bezogen auf den Projekt-Root)
                    # Verwende Schrägstriche für konsistente Ausgabe wie bei "Copy Relative Path"
                    try:
                        # os.path.relpath berechnet den Pfad von base_path zu abs_file_path
                        relative_file_path = os.path.relpath(abs_file_path, base_path).replace('\\', '/')
                    except ValueError as e:
                         # Kann passieren, wenn base_path und abs_file_path auf unterschiedlichen Laufwerken unter Windows liegen
                         error_msg = f"FEHLER: Konnte relativen Pfad nicht bestimmen für: {abs_file_path} von {base_path} - {e}"
                         print(f"     {error_msg}")
                         errors.append(error_msg)
                         continue # Nächste Datei versuchen

                    print(f"  -> Verarbeite: {relative_file_path}")
                    try:
                        # Stelle sicher, dass die Datei wirklich existiert (sollte durch os.walk gegeben sein, aber sicher ist sicher)
                        if os.path.isfile(abs_file_path):
                           # Lese mit utf-8, was für TS/TSX/CSS meistens passt
                           # Bei CSS könnten manchmal andere Encodings vorkommen, aber utf-8 ist eine gute Basis
                           with open(abs_file_path, 'r', encoding='utf-8', errors='ignore') as f:
                               # errors='ignore' hinzugefügt, um bei seltenen Encoding-Problemen nicht abzubrechen
                               content = f.read()

                           # Formatiere den Eintrag für die Zwischenablage
                           file_entry = f"Path: {relative_file_path}\n\n{content}\n\n"
                           all_content_blocks.append(file_entry)
                           processed_files_count += 1
                        else:
                            # Sollte eigentlich nicht vorkommen mit os.walk
                            print(f"  -> Übersprungen (keine reguläre Datei mehr?): {relative_file_path}")

                    except Exception as e:
                        error_msg = f"FEHLER: Konnte Datei nicht lesen: {relative_file_path} - {e}"
                        print(f"     {error_msg}")
                        errors.append(error_msg)

    if not found_any_target_files and not errors:
         print(f"  -> Keine {', '.join(target_extensions)}-Dateien in den angegebenen Verzeichnissen oder deren Unterverzeichnissen gefunden.") # Geändert


    return all_content_blocks, processed_files_count, errors

def main():
    project_root = os.getcwd() # Nimmt an, dass das Skript im Projekt-Root ausgeführt wird
    print(f"Projekt-Root erkannt als: {project_root}")

    # Funktionsaufruf mit neuem Namen
    content_blocks, file_count, errors = collect_target_file_content_recursively(project_root, TARGET_DIRECTORIES)
    target_extensions_str = ", ".join(TARGET_EXTENSIONS) # Für die Meldungen unten

    print("-" * 30)

    if errors:
        print("Einige Fehler sind aufgetreten:")
        for err in errors:
            print(f"- {err}")
        print("-" * 30)


    if not content_blocks:
        # Diese Meldung wird jetzt nur angezeigt, wenn *überhaupt nichts* verarbeitet werden konnte
        print(f"Keine {target_extensions_str}-Dateien erfolgreich verarbeitet.") # Geändert
        if not errors: # Wenn keine Fehler aufgetreten sind, wurden wirklich keine Dateien gefunden
             print("Bitte überprüfen Sie die Pfade in 'TARGET_DIRECTORIES'.")
        else: # Wenn Fehler auftraten, könnten auch Berechtigungsprobleme die Ursache sein
             print(f"Mögliche Ursachen: Pfade in 'TARGET_DIRECTORIES' falsch, keine {target_extensions_str}-Dateien vorhanden oder Lesefehler.") # Geändert
        sys.exit(1) # Beendet das Skript mit einem Fehlercode


    # Füge alle gesammelten Inhalte zusammen
    # .strip() am Ende entfernt eventuell überflüssige Leerzeilen ganz am Schluss
    final_clipboard_content = "".join(content_blocks).strip()

    try:
        pyperclip.copy(final_clipboard_content)
        print(f"Erfolg! {file_count} Datei(en) wurden verarbeitet.")
        print(f"Der kombinierte Inhalt (Pfad + Code) aller gefundenen {target_extensions_str}-Dateien wurde in die Zwischenablage kopiert.") # Geändert
        # Optional: Zeige einen kleinen Teil des kopierten Inhalts zur Überprüfung
        # print("\nAnfang des Inhalts in der Zwischenablage:")
        # print(final_clipboard_content[:300] + "...")
    except pyperclip.PyperclipException as e:
        print(f"FEHLER: Konnte nicht in die Zwischenablage kopieren: {e}")
        print("Stellen Sie sicher, dass 'pyperclip' korrekt installiert ist und funktioniert.")
        print("Unter Linux benötigen Sie evtl. 'xclip' oder 'xsel' (`sudo apt-get install xclip`).")
        print("\nDer Inhalt wurde NICHT kopiert. Hier ist der Anfang des Inhalts (max 500 Zeichen):")
        print(final_clipboard_content[:500] + "...") # Zeige trotzdem einen Teil an
        sys.exit(1) # Beendet das Skript mit einem Fehlercode
    except Exception as e: # Fange andere mögliche Fehler ab
        print(f"Ein unerwarteter Fehler ist beim Kopieren aufgetreten: {e}")
        sys.exit(1)

    print("Skript beendet.")

# Globale Variable für die Meldungen in main() - muss außerhalb definiert werden
TARGET_EXTENSIONS = (".ts", ".tsx", ".css")

if __name__ == "__main__":
    main()