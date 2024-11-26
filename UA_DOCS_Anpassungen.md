# Umweltatlas auf einem Server einrichten

In dem Ordner [./dist/](dist) befinden sich die Ordner [./dist/mastercode](mastercode) und [./dist/umweltatlas](umweltatlas). Diese Ordner an den gewünschten Speicherort auf dem Server kopieren.

Das Masterportal kann anschließend über den Unterordner /umweltatlas aufgerufen werden.

Beispiel: www.mein-umweltatlas.de/umweltatlas


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


# Mögliche Verbesserungen

Wenn die Daten geladen werden, zeigt das Masterportal in der Browserkonsole eine Liste von Layern an, die mehrmals in den Ordner vorkommen. Wenn möglich sollten die Duplikate entfernt werden. 
Hier gibt es eine Liste dazu:

[./portal/umweltatlas/warningList.md](./portal/umweltatlas/warningList.md)