# Umweltatlas auf einem Server einrichten

In dem Ordner [./dist/](dist) befinden sich die Ordner [./dist/mastercode](mastercode) und [./dist/umweltatlas](umweltatlas). Diese Ordner an den gewünschten Speicherort auf dem Server kopieren.

Das Masterportal kann anschließend über den Unterordner /umweltatlas aufgerufen werden.

Beispiel: www.mein-umweltatlas.de/umweltatlas

# Änderung über Github vornehmen

1. Zur gewünschten Datei navigieren.
  Zum Beispiel: [./portal/umweltatlas/config.json](./portal/umweltatlas/config.json)

1. Datei bearbeiten.
  Klicken Sie oben rechts auf das Stift-Symbol (Tooltip: "Edit this file"), um die Datei editierbar zu machen.

1. Anpassungen vornehmen.
  Ändern Sie den Inhalt der Datei wie gewünscht. Achten Sie besonders darauf, dass alle öffnenden Zeichen wie ", {, oder ( korrekt geschlossen werden, um Syntaxfehler zu vermeiden.

1. Änderungen speichern.
  Klicken Sie auf den grünen Button "Commit changes".

1. Änderung beschreiben.
  Im erscheinenden Popup-Fenster geben Sie in der "Commit message" eine kurze Beschreibung der vorgenommenen Änderung ein. Bestätigen Sie anschließend mit "Commit changes".

1. Änderungen überprüfen.
  Die Änderungen sind nun übernommen. Sie können die Historie und Details der Änderungen unter [https://github.com/technologiestiftung/umweltatlas-masterportal-v3/commits/main](https://github.com/technologiestiftung/umweltatlas-masterportal-v3/commits/main) einsehen.


# Services automatisch aktualisieren

Wenn ein neuer Layer mit einer id hinzugefügt wurde, die noch nicht in den Services enthalten, aber im Berliner Geoportal verfügbar ist, kann der Service automatisch über ein **GitHub Actions-Skript** hinzugefügt werden.

1. Skript ausführen.
  Zu dem Skript *Update Services* navigieren [https://github.com/technologiestiftung/umweltatlas-masterportal-v3/actions/workflows/update_services.yml](https://github.com/technologiestiftung/umweltatlas-masterportal-v3/actions/workflows/update_services.yml). Oben rechts den Button *Run workflow* klicken und noch mal bestätigen. 

1. Änderungen überprüfen.
  Nach etwa einer Minute sollte das Skript ausgeführt worden sein und die Änderungen im Code vorgenommen haben. Die genauen Änderungen können in der Commit-Historie eingesehen werden: [https://github.com/technologiestiftung/umweltatlas-masterportal-v3/commits/main](https://github.com/technologiestiftung/umweltatlas-masterportal-v3/commits/main)

# Services

Die Geoportal services-internet.json befindet sich hier:
[https://gdi.berlin.de/viewer/_shared/resources/services-internet.json](https://gdi.berlin.de/viewer/_shared/resources/services-internet.json)

Die des Umweltatlas hier:
[./portal/umweltatlas/resources/services-internet.json](./portal/umweltatlas/resources/services-internet.json)

# Anpassen vornehmen 

Anpassungen können durch Änderungen in JSON-Dateien vorgenommen werden. Nach den Anpassungen müssen die Dateien einfach überschrieben und die Anwendung im Browser neu geladen werden. Es empfiehlt sich, die Dateien in einem Programm zu öffnen, das .json-Dateien lesen kann (z. B. Visual Studio Code). Ein einfaches Textprogramm, das die Daten nicht umformatiert, genügt ebenfalls.

## Konfigurationen

Anpassungen, wie Ordnerstruktur und Basemaps am Masterportal können hier geändert werden:

[./portal/umweltatlas/config.json](./portal/umweltatlas/config.json)


## Services update

Anpassungen an den Services können hier gemacht werden:

[./portal/umweltatlas/resources/services-internet.json](./portal/umweltatlas/resources/services-internet.json)

Auf dem Github-Repository gibt es auch eine *Github Action*. Diese ermöglicht das automatische Update der Datei services-internet.json mit den Services aus dem [Geoportal](https://gdi.berlin.de/viewer/main/#url).

## UI-Text ändern

In der folgenden Datei befinden sich alle Texte des Interfaces.

[./locales/de/common.json](./locales/de/common.json)


## Neuigkeiten 

Hier können Neuigkeiten eintragen werden:

[./portal/umweltatlas/resources/newsFeedPortalAlerts.json](./portal/umweltatlas/resources/newsFeedPortalAlerts.json)

Die Einstellungsoptionen sind hier dokumentiert:

[./docs/Dev/vueComponents/Alerting.md](./docs/Dev/vueComponents/Alerting.md)


# Mögliche Verbesserungen

Wenn die Daten geladen werden, zeigt das Masterportal in der Browserkonsole eine Liste von Layern an, die mehrmals in den Ordner vorkommen. Wenn möglich sollten die Duplikate entfernt werden. 
Hier gibt es eine Liste dazu:

[./portal/umweltatlas/warningList.md](./portal/umweltatlas/warningList.md)
