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
- Neben den Layerinformationen wird die Umweltatlas-Seite des Datensatzes (``uaInfoURL``) in einem iframe über die volle Höhe der Seitenleiste angezeigt (siehe unten).

### Umweltatlas-iframe in den Layerinformationen

Sobald die Layerinformationen zu einem Layer mit ``uaInfoURL`` geöffnet werden, teilt sich die Seitenleiste in zwei Spalten: links die Layerinformationen, rechts ein iframe mit der Umweltatlas-Seite des Datensatzes. Die Seitenleiste wird dafür automatisch verbreitert und beim Schließen wieder auf die vorherige Breite zurückgesetzt. Auf mobilen Geräten wird das iframe nicht angezeigt, da die Seitenleiste dort bereits den ganzen Bildschirm einnimmt.

Konfiguriert wird das in [./portal/umweltatlas/config.js](./portal/umweltatlas/config.js):

```js
layerInformation: {
    uaInfoFrame: {
        enabled: true,     // auf false setzen, um das iframe abzuschalten
        menuWidth: "70%",  // Breite der Seitenleiste, solange das iframe sichtbar ist
        proxyPrefix: "https://www.berlin.de"  // siehe unten, ohne diese Zeile wird direkt von berlin.de geladen
    }
}
```

#### Warum ein Proxy nötig ist

www.berlin.de sendet den HTTP-Header ``X-Frame-Options: sameorigin``. Der Browser vergleicht dabei die vollständige Origin (Schema + Host + Port) der einbettenden Seite. ``localhost:9001`` und ``gdi.berlin.de`` sind andere Origins als ``www.berlin.de``, das Einbetten wird also verweigert. Das lässt sich im Frontend nicht abschalten.

Der Ausweg: die Seite nicht mehr von einer fremden Origin laden, sondern über die **eigene** Origin ausliefern. Ein Reverse Proxy leitet ``/umweltatlas`` an ``https://www.berlin.de/umweltatlas`` weiter. Die Seite im iframe hat dann dieselbe Origin wie das Portal und ``sameorigin`` ist erfüllt — ohne Änderung auf Seiten von berlin.de und ohne den Header zu entfernen.

``proxyPrefix`` sorgt dafür, dass die Komponente aus der absoluten ``uaInfoURL`` einen Pfad auf der eigenen Origin macht:

```
https://www.berlin.de/umweltatlas/wasser/...   ->   /umweltatlas/wasser/...
```

Der Pfad muss dabei dem Pfad auf berlin.de entsprechen, damit die relativen Bilder und Links der Seite weiterhin funktionieren. CSS und JavaScript der Seite liegen auf absoluten URLs (``//www.berlin.de/i9f/...``) und werden ohnehin direkt von berlin.de geladen.

#### Lokale Entwicklung

Der Webpack-Dev-Server übernimmt den Proxy. Der Eintrag steht in [./devtools/proxyconf_example.json](./devtools/proxyconf_example.json) und wird automatisch verwendet:

```json
"/umweltatlas": {
    "target": "https://www.berlin.de",
    "changeOrigin": true,
    "secure": true
}
```

Wer eine eigene ``devtools/proxyconf.json`` angelegt hat (diese Datei ist in ``.gitignore``), muss den Eintrag dort ergänzen, da die Beispieldatei dann nicht mehr geladen wird.

#### Produktion

Unter ``https://gdi.berlin.de/viewer/umweltatlas/karten/`` muss dieselbe Weiterleitung auf dem Server eingerichtet werden:

```
https://gdi.berlin.de/umweltatlas/*   ->   https://www.berlin.de/umweltatlas/*
```

Das ist eine Server-Konfiguration und muss beim Betreiber von gdi.berlin.de angefragt werden. Alternativ kann berlin.de das Einbetten direkt erlauben, mit

```
Content-Security-Policy: frame-ancestors 'self' https://gdi.berlin.de
```

anstelle von ``X-Frame-Options: sameorigin``.

Solange es keinen Proxy gibt, kann ``proxyPrefix`` weggelassen werden. Die Komponente erkennt dann, dass das Einbetten verweigert wurde, und zeigt statt des iframes einen Hinweis mit einem Link, der die Seite in einem neuen Tab öffnet.

#### Welcher Teil der Seite angezeigt wird

Im iframe wird nicht die komplette Umweltatlas-Seite gezeigt, sondern nur der Hauptinhalt ``#layout-grid__area--maincontent`` und davon nur die ersten beiden ``<section>``-Elemente:

1. „Zusammenfassung“
2. der Hinweis, ob die Inhalte des Jahrgangs aktuell oder historisch sind

Weggelassen werden damit die berlin.de-Navigation, Kopf- und Fußbereich, die Sprungmarken sowie die dritte Section („Navigation“, eine Linkliste) und die Kontaktblöcke — diese Informationen stehen bereits in den Layerinformationen daneben. In der Praxis schrumpft die Seite dadurch von rund 31.000 auf etwa 2.000 Zeichen Text.

Das passiert in ``trimInfoFrameDocument`` in [LayerInformation.vue](./src/modules/layerInformation/components/LayerInformation.vue), nachdem das iframe geladen wurde.

**Das funktioniert nur mit Proxy.** Nur wenn die Seite über die eigene Origin ausgeliefert wird, darf JavaScript das Dokument im iframe verändern. Wird die Seite irgendwann direkt von berlin.de eingebettet (z. B. weil dort ``frame-ancestors`` gesetzt wurde), ist das Dokument fremd und wird vom Browser geschützt — dann erscheint die vollständige Umweltatlas-Seite inklusive berlin.de-Navigation.

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









