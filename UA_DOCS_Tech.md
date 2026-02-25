# Technische Anmerkungen 

## Node Version

~~v20.12.2~~
22.19.0

## Development

``
npm run start
``

## Building

``
npm run build
``

Die Build-Dateien befinden sich nach dem Build im Verzeichnis *dist/*.

## Masterportal aufsetzten

Legen Sie den Ordner [dist](dist/) auf einem Server ab. Geben Sie dann im Browser die URL des Speicherorts der Daten ein, gefolgt vom Unterordner ``umweltatlas``.

Beispiel: https://ua-map.netlify.app/umweltatlas/

Falls Änderungen im Code vorgenommen wurden (nicht in den Konfigurations-JSONs), muss der Build-Prozess erneut ausgeführt werden.

## Masterportal-Update

Der Code wurde zuletzt mit dem Originalcode des Masterportals synchronisiert am:

``11.11.2024``

## Änderungen

Um zuküftige Merge-Konflikte zu minimieren, wurden für den Umweltatlas möglichst wenige Änderungen im Code vorgenommen. Bugs und Verbesserungsvorschläge wurden in Bitbucket gemeldet und sind hier einsehbar:

https://bitbucket.org/geowerkstatt-hamburg/masterportal/issues?reported_by=6329cce507a27ebeff131d41

Kleine Änderungen, die per CSS möglich waren, wurden in der index.html vorgenommen. Einen Überblick über alle Anpassungen bietet dieser PR-Entwurf.

https://github.com/technologiestiftung/umweltatlas-masterportal-v3/pull/4/files

Die einzelnen Änderungen im Detail:


### Build

Damit der *build* auf Netlify funktioniert, musste in der Datei [./devtools/tasks/buildFunctions.js](./devtools/tasks/buildFunctions.js) folgende Zeile geändert werden: 

``
mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))().replace(/[\s:]+/g, ""),
``

zu 

``
mastercodeVersionFolderName = require(path.resolve(rootPath, "devtools/tasks/getMastercodeVersionFolderName"))(),
``


### Setup

Die Canvas-Bibliothek (zum Ausführen von Tests) konnte nicht installiert werden und wurde deshalb aus der package.json entfernt:

``
"canvas": "^2.11.2"
``

Daher wurde auch der ``prePushHook`` entfernt.

### Einfach Änderungen in der index.html 

Um den Code möglichst wenig zu verändern, wurden CSS-Anpassungen in der index.html vorgenommen und kommentiert. Ein Lade-Spinner, der beim Laden der Seite angezeigt wird, ist ebenfalls dort implementiert.

Pfad zur Datei: [./portal/umweltatlas/index.html](./portal/umweltatlas/index.html)


### CompareMaps

Dem Vergleichstool compareMaps wurde ein zusätzlicher Infotext hinzugefügt. Außerdem werden einige Labels per CSS (aus der index.html) gekürzt, sodass statt „JAHR - Luftbild“ nur das Jahr angezeigt wird.


### LayerStartModal

Ein neues Modal namens LayerStartModal wurde hinzugefügt, das beim Starten der Anwendung erscheint. Nutzer können hier direkt ein Thema auswählen, welches dann im Themenbaum geöffnet wird.

[LayerStartModal](./src/modules/layerTree/components/LayerStartModal.vue)


### UI Texte

In der Datei [common.json](./locales/de/common.json) wurden Texte leicht angepasst, und ein neuer Key (``compareMaps.titel``) wurde hinzugefügt, um einen zusätzlichen Text im Karten-Vergleichstool anzuzeigen.

### Farben

Die Datei [variables.scss](/src/assets/css/variables.scss) wurde entsprechend den Farben des Umweltatlas angepasst, insbesondere für Buttons und Links.


### LayerInformation

Das Modul [LayerInformation.vue](./src/modules/layerInformation/components/LayerInformation.vue) wurde umfangreich überarbeitet:

- Kontaktdaten zum Umweltatlas werden zusätzlich geladen.
- Die Accordions erhielten ein neues Design.
- Es gibt nun einen PDF-Download-Link.
- Ein Link zur entsprechenden Umweltatlas-Seite des Datensatzes wurde hinzugefügt.
- Mit der neuen ``UrlInput`` Komponente werden WMS- und WFS-Links besser dargestellt.
- Unter dem Titel wurden der Pfad zur Layer hinzugefügt damit sich der Datensatz besser Verordnen läßt.  

### UrlInput Component

Zur besseren Darstellung und Nutzung der WFS- und WMS-URLs wurde eine separate Komponente namens UrlInput erstellt. URLs erscheinen dort in einem ``Input`` und können via Buttons kopiert oder geöffnent werden. 

[UrlInput.vue](./src/shared/modules/urlInput/components/UrlInput.vue)

## Automatisches Update der Services

Ein Skript ermöglicht das automatische Update der Datei services-internet.json mit den Services aus dem [Geoportal](https://gdi.berlin.de/viewer/main/#url).

``
node ./ua_scripts/updateServices
``

Hierfür gibt es auch ein Github Actions Script. 

## Daten in ``service-internet.json``

Die Services aus dem Umweltaltas enthalten zusätzliche Attribute, die aus dem Umweltaltas stammen:
- "uaInfoURL"
- "uaDownload"
- "uaContact"
Das Attribut ``layerAttribution`` wurde bei allen Services entfernt, da es dazu führt, dass ein Informationsmodal beim Öffnen der Layer erscheint.


## Masterportal-Code-Update

Es existiert eine GitHub Action, um den neuesten Masterportal-Code von [Bibucket](https://bitbucket.org/geowerkstatt-hamburg/masterportal.git) in einen Branch (*bitbucket_dev_vue*) zu importieren.









