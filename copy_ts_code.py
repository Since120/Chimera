import os
import pyperclip  # Stellt sicher, dass Sie 'pip install pyperclip' ausgeführt haben
import sys

# --- Konfiguration ---
# Fügen Sie hier die relativen Pfade zu den Ordnern hinzu, in denen *rekursiv*
# nach .ts-Dateien gesucht werden soll.
# Verwenden Sie Schrägstriche (/) als Pfadtrenner für bessere Kompatibilität,
# auch wenn Sie unter Windows arbeiten. Das Skript normalisiert sie.
TARGET_DIRECTORIES = [
    "apps/backend/src",
    "apps/frontend/src",
    "apps/frontend/app",
    "packages/shared-types/src",
    "apps/frontend-new/src",


    # Fügen Sie hier weitere relative Pfade hinzu
    # "pfad/zum/anderen/basis-ordner",
]
# --- Ende der Konfiguration ---

def collect_ts_file_content_recursively(base_path, relative_start_dirs):
    """
    Sammelt Pfade und Inhalte von .ts-Dateien rekursiv in den angegebenen
    Startverzeichnissen und deren Unterverzeichnissen.

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
    found_any_ts_files = False # Flag um zu prüfen, ob überhaupt .ts Dateien gefunden wurden

    print("Skript gestartet. Suche rekursiv nach .ts-Dateien in:")
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
                # Prüfe, ob es eine .ts-Datei ist
                if filename.lower().endswith(".ts"):
                    found_any_ts_files = True # Mindestens eine .ts Datei gefunden
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
                           with open(abs_file_path, 'r', encoding='utf-8') as f:
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

    if not found_any_ts_files and not errors:
         print("  -> Keine .ts-Dateien in den angegebenen Verzeichnissen oder deren Unterverzeichnissen gefunden.")


    return all_content_blocks, processed_files_count, errors

def main():
    project_root = os.getcwd() # Nimmt an, dass das Skript im Projekt-Root ausgeführt wird
    print(f"Projekt-Root erkannt als: {project_root}")

    content_blocks, file_count, errors = collect_ts_file_content_recursively(project_root, TARGET_DIRECTORIES)

    print("-" * 30)

    if errors:
        print("Einige Fehler sind aufgetreten:")
        for err in errors:
            print(f"- {err}")
        print("-" * 30)


    if not content_blocks:
        # Diese Meldung wird jetzt nur angezeigt, wenn *überhaupt nichts* verarbeitet werden konnte
        # (entweder keine Dateien gefunden oder nur Fehler beim Lesen)
        print("Keine .ts-Dateien erfolgreich verarbeitet.")
        if not errors: # Wenn keine Fehler aufgetreten sind, wurden wirklich keine Dateien gefunden
             print("Bitte überprüfen Sie die Pfade in 'TARGET_DIRECTORIES'.")
        else: # Wenn Fehler auftraten, könnten auch Berechtigungsprobleme die Ursache sein
             print("Mögliche Ursachen: Pfade in 'TARGET_DIRECTORIES' falsch, keine .ts-Dateien vorhanden oder Lesefehler.")
        sys.exit(1) # Beendet das Skript mit einem Fehlercode


    # Füge alle gesammelten Inhalte zusammen
    # .strip() am Ende entfernt eventuell überflüssige Leerzeilen ganz am Schluss
    final_clipboard_content = "".join(content_blocks).strip()

    try:
        pyperclip.copy(final_clipboard_content)
        print(f"Erfolg! {file_count} Datei(en) wurden verarbeitet.")
        print("Der kombinierte Inhalt (Pfad + Code) aller gefundenen .ts-Dateien wurde in die Zwischenablage kopiert.")
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

if __name__ == "__main__":
    main()