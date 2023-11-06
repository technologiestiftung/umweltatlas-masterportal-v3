>**[Zurück zur Dokumentation Masterportal](doc.md)**.

>Wenn diese Seite nicht korrekt dargestellt wird, nutzen Sie bitte diesen Link: **[Alternative Config.json Dokumentation](https://www.masterportal.org/files/masterportal/html-doku/doc/latest/config.json.de.html)**

[TOC]

***

# config.json

Die *config.json* enthält die gesamte Konfiguration der Portal-Oberfläche. In ihr wird geregelt welche Elemente sich wo in der Menüleiste befinden, worauf die Karte zentriert werden soll und welche Layer geladen werden sollen. Hier geht es zu einem **[Beispiel](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/portal/basic/config.json)**.
Die config.json besteht aus der **[Portalconfig](#markdown-header-Portalconfig)** und der **[Themenconfig](#markdown-header-Themenconfig)**

**Beispiel**

```json
{
   "Portalconfig": {},
   "Themenconfig": {}
}
```

***

## Portalconfig
Im Abschnitt *Portalconfig* können folgende Eigenschaften konfiguriert werden:

1. Schaltflächen auf der Kartenansicht sowie mögliche Interaktionen (*controls*)
2. Informationen zu beliebigen Layern (*getFeatureInfo*)
3. Einträge im Mainmenu sowie Vorhandenheit jeweiliger Module und deren Reihenfolge (*mainMenu*)
4. Starteinstellungen der Kartenansicht (*mapView*)
5. Anzeige eines Tooltips von Features (*mouseHover*)
6. Konfiguration der Fußzeile (*portalFooter*)
7. Einträge im Secondarymenu sowie Vorhandenheit jeweiliger Module und deren Reihenfolge (*secondaryMenu*)
8. Konfiguration der Themenauswahl (*tree*)

Es existieren die im Folgenden aufgelisteten Konfigurationen:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|baselayerSwitcher|nein|**[baselayerSwitcher](#markdown-header-portalconfigbaselayerSwitcher)**||Der baselayerSwitcher ermnöglicht ein einfaches Wechseln bzw. Auswählen einer Hintergrundkarte.|false|
|controls|nein|**[controls](#markdown-header-portalconfigcontrols)**||Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.|false|
|getFeatureInfo|nein|**[getFeatureInfo](#markdown-header-portalconfiggetFeatureInfo)**||Mit der GetFeatureInfo(gfi) lassen sich Informationen zu beliebigen Layern anzeigen. Dabei werden bei einem WMS die Daten über die GetFeatureInfo geladen. Bei Vektordaten (WFS, Sensor, GeoJSON usw.) werden die angezeigten Attribute aus den Daten selbst verwendet.|false|
|mainMenu|nein|**[menu](#markdown-header-portalconfigmenu)**||Hier können die Menüeinträge im Mainmenu und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ist identisch mit der Reihenfolge in der config.json (siehe **[Modules](#markdown-header-portalconfigmenumodules)**).|false|
|mapView|nein|**[mapView](#markdown-header-portalconfigmapview)**||Mit verschiedenen Parametern wird die Startansicht der Karte konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.|false|
|mouseHover|nein|**[mouseHover](#markdown-header-portalconfigmousehover)**||Aktiviert die MouseHover-Funktion für Vektorlayer, z.B. WFS oder GeoJSON. Für die Konfiguration pro Layer siehe **[Vector](#markdown-header-themenconfiglayervector)**.|false|
|portalFooter|nein|**[footer](#markdown-header-footer)**||Möglichkeit den Inhalt der Fußzeile des Portals zu konfigurieren.|false|
|secondaryMenu|nein|**[menu](#markdown-header-portalconfigmenu)**||Hier können die Menüeinträge im Secondarymenu und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ist identisch mit der Reihenfolge in der config.json (siehe **[Modules](#markdown-header-portalconfigmenumodules)**).|false|
|tree|nein|**[tree](#markdown-header-portalconfigtree)**||Möglichkeit um Einstellungen für den Themenbaum vorzunehmen.|false|

**Beispiel**

```json
{
    "Portalconfig": {
        "baselayerSwitcher":{},
        "controls": {},
        "getFeatureInfo": {},
        "mainMenu": {},
        "mapView": {},
        "mouseHover": {},
        "portalFooter": {},
        "secondaryMenu": {},
        "tree": {}
    }
}
```

***

### Portalconfig.baselayerSwitcher
Der baselayerSwitcher ermnöglicht ein einfaches Wechseln bzw. Auswählen eines Layers, der eine Hintergrundkarte beinhaltet (baselayer).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
active|nein|Boolean|false|Definiert, ob der baselayerSwitcher aktiv ist.|false|
activatedExpandable|nein|Boolean|false|Gibt an, ob der baselayerSwitcher aufgeklappt ist und alle verfügbaren baselayer angezeigt werden oder nur der aktive, welcher sich auf höchster Ebene befindet.|false|

**Beispiel**

```json
"baselayerSwitcher": {
      "active": true,
      "activatedExpandable": false
    }
```

***

### Portalconfig.controls
Mit den Controls kann festgelegt werden, welche Interaktionen in der Karte möglich sein sollen.

Controls können in der config.json in die Ebene "expandable" verschachtelt werden und sind somit nicht mehr in der Leiste an der Seite, sondern über den Button mit den drei Punkten aufklappbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backForward|nein|**[backForward](#markdown-header-portalconfigcontrolsbackforward)**|false|Zeigt Buttons zur Steuerung der letzten und nächsten Kartenansichten an.|false|
|expandable|nein|**[expandable](#markdown-header-portalconfigcontrols)**||Mit expandable werden Controls hinter einem Button mit drei Punkten versteckt und lassen sich bei Bedarf aufklappen.|false|
|freeze|nein|Boolean/**[freeze](#markdown-header-portalconfigcontrolsfreeze)**|false|Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll.|false|
|fullScreen|nein|Boolean/**[fullScreen](#markdown-header-portalconfigcontrolsfullscreen)**|false|Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.|false|
|orientation|nein|**[orientation](#markdown-header-portalconfigcontrolsorientation)**||Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers.|false|
|rotation|nein|**[rotation](#markdown-header-portalconfigcontrolsrotation)**|false|Control, das die aktuelle Rotation der Karte anzeigt. Per Klick kann die Maprotation wieder auf Norden gesetzt werden. Siehe auch unter `mapInteractions` in **[config.js.md](config.js.md)**.|false|
|startModule|nein|**[startModule](#markdown-header-portalconfigcontrolsstartModule)**|false|Zeigt Buttons für die konfigurierten Module an. Über diese lassen sich die jeweiligen Module öffnen und schließen.|false|
|tiltView|nein|Boolean/**[tiltView](#markdown-header-portalconfigcontrolstiltView)**|false|Zeigt zwei Buttons an, mit denen sich die Kamera in der 3D-Szene hoch- bzw. runterkippen lässt.|false|
|totalView|nein|Boolean/**[totalView](#markdown-header-portalconfigcontrolstotalView)**|false|Zeigt einen Button an, mit dem die Startansicht mit den initialen Einstellungen wiederhergestellt werden kann.|false|
|zoom|nein|Boolean/**[zoom](#markdown-header-portalconfigcontrolszoom)**|false|Legt fest, ob die Zoombuttons angezeigt werden sollen.|false|

**Beispiel**

```json
"controls": {
      "backForward": true,
      "fullScreen": true,
      "expandable": {
        "button3d": true
      }
    }
```

***

#### Portalconfig.controls.backForward
Das Attribut backForward kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons zur Steuerung der letzten und nächsten Kartenansichten mit den Defaulteinsellungen an. Ist es vom Typ Object, so gelten folgende Attribute

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconForward|nein|String|"skip-end-fill"|Über den Parameter iconForward kann ein anderes Icon für das Vorschalten der Kartenansicht verwendet werden.|false|
|iconBack|nein|String|"skip-start-fill"|Über den Parameter iconBack kann ein anderes Icon für das Zurückschalten der Kartenansicht verwendet werden.|false|

**Beispiel backForward als Object:**

```json
"backForward" : {
    "iconForward": "bi-skip-forward-fill",
    "iconBack": "bi-skip-backward-fill"
}
```

**Beispiel backForward als Boolean:**

```json
"backForward": true
```

***

#### Portalconfig.controls.button3d
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|

***

#### Portalconfig.controls.freeze
Bildschirm wird gesperrt, sodass keine Aktionen mehr in der karte ausgeführt werden können. Legt fest, ob ein "Ansicht sperren" Button angezeigt werden soll.

Das Attribut freeze kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-lock"|Über den Parameter icon kann ein anderes Icon für das Control Freeze verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

***

#### Portalconfig.controls.fullScreen
Ermöglicht dem User die Darstellung im Vollbildmodus (ohne Tabs und Adressleiste) per Klick auf den Button. Ein erneuter Klick auf den Button wechselt wieder in den normalen Modus.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconArrow|nein|String|"arrows-fullscreen"|Über den Parameter iconArrow kann ein anderes Icon für den Button zum Einschalten des Vollbildmodus verwendet werden.|false|
|iconExit|nein|String|"fullscreen-exit"|Über den Parameter iconExit kann ein anderes Icon für den Button zum beenden des Vollbildmodus verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel fullScreen als Object**

```json
"fullScreen" : {
    "iconArrow": "arrows-fullscreen",
    "iconExit": "fullscreen-exit"
},
```

**Beispiel fullScreen als Boolean**

```json
"fullScreen": true
```

***

#### Portalconfig.controls.orientation
Orientation nutzt die geolocation des Browsers zur Standortbestimmung des Nutzers. Es wird eine Liste von Features in der Umgebung des Standortes angezeigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconGeolocate|nein|String|"bi-geo-alt"|Icon das im Controls-Menü für das Control Standpunkt angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|iconGeolocatePOI|nein|String|"bi-record-circle"|Icon das im Controls-Menü für das Control "In meiner Nähe" angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|poiDistances|nein|Boolean/Integer[]|true|Bei poiDistances=true werden die Defaultwerte verwendet. Legt fest, ob "In meiner Nähe" geladen wird und zeigt eine Liste von Features in der Umgebung an. Bei Angabe eines Array werden die darin definierten Abstände in Metern angeboten. Bei Angabe von true werden diese Abstände angeboten: [500,1000,2000].|false|
|zoomMode|nein|enum["once", "always"]|"once"|Der Standort wird bestimmt und der Marker wird an- oder ausgeschaltet. Dafür ist es notwendig das Portal über **https** zu laden. Modi: *once* (Es wird einmalig auf den Standort gezoomt. ), *always* (Die Karte wird mit jedem Einschalten auf den Standort gezoomt.).|false|

**Beispiel mit poiDistances vom Typ Boolean**
```json
"orientation": {
    "iconGeolocate": "bi-geo-alt",
    "iconGeolocatePOI": "bi-record-circle",
    "zoomMode": "once",
    "poiDistances": true
}
```

**Beispiel mit poiDistances vom Typ Integer[]**
```json
"orientation": {
    "zoomMode": "once",
    "poiDistances": [500, 1000, 2000, 5000]
}
```

***

#### Portalconfig.controls.rotation
Das Attribut rotation kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist und auf true gesetzt ist, zeigt es das Rotation-Control nur an, wenn die Maprotation ungleich Norden/0 ist. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|
|----|-------------|---|-------|------------|
|showAlways|nein|Boolean|false|Ist das Attribut auf true gesetzt, wird das Control permanent angezeigt. Per default wird es nur angezeigt, wenn die Maprotation ungleich 0/Norden ist.|

**Beispiel rotation als Object:**
```json
"rotation": {
    "showAlways": true
}
```

**Beispiel rotation als Boolean:**
```json
"rotation": true
```

***

#### Portalconfig.controls.startModule
Das Attribut startModule muss vom Typ Object sein. Es wird für jedes konfigurierte Modul ein Button angezeigt, über den sich das jeweilige Modul öffen und schließen lässt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|mainMenu|nein|**[mainMenu](#markdown-header-portalconfigcontrolsstartmodulemainMenu)**[]||Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim öffnen in dem `mainMenu` dargestellt.|false|
|secondaryMenu|nein|**[secondaryMenu](#markdown-header-portalconfigcontrolsstartmodulesecondaryMenu)**[]||Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim öffnen in dem `secondaryMenu` dargestellt.|false|
|supportedDevices|nein|String|["Desktop", "Mobile", "Table"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel**

```json
"startModule": {
    "mainMenu": [
        {
            "type": "scaleSwitcher"
        }
    ],
    "secondaryMenu": [
        {
            "type": "myModule"
        }
    ]
}
```

***

##### Portalconfig.controls.startModule.mainMenu
Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim Öffnen in dem `mainMenu` dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|nein|String||Type des Modules, das als Control dargestellt und bei Click im MainMenü geöffnet werden soll.|false|

**Beispiel**

```json
"mainMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

##### Portalconfig.controls.startModule.secondaryMenu
Hier werden die Module zu denen jeweils ein Button angezeigt werden soll konfiguriert. Diese werden beim Öffnen in dem `secondaryMenu` dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|nein|String||Type des Modules, das als Control dargestellt und bei Click im SecondaryMenü geöffnet werden soll.|false|#

**Beispiel**

```json
"secondaryMenu": [
    {
        "type": "scaleSwitcher"
    }
]
```

***

#### Portalconfig.controls.tiltView
Zeigt zwei Buttons an, mit denen sich die Kamera in der 3D-Szene hoch- bzw. runterkippen lässt.

Das Attribut tiltView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|tiltDownIcon|nein|String|"bi-caret-down-square"|Über den Parameter tiltDownIcon kann ein anderes Icon für das runterkippen der Kamera verwendet werden.|false|
|tiltUpIcon|nein|String|"bi-caret-up-square"|Über den Parameter tiltUpIcon kann ein anderes Icon für das hochkippen der Kamera verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel tiltView als Object**

```json
"tiltView" : {
    "tiltDownIcon": "bi-caret-down-square",
    "tiltUpIcon": "bi-caret-up-square",
},
```

**Beispiel tiltView als Boolean**

```json
"tiltView": true
```

***

#### Portalconfig.controls.totalView
Zeigt einen Button an, mit dem die Strtansicht mit den initialen Einstellungen wiederhergestellt werden kann.

Das Attribut totalView kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es den Button an, der in den Defaulteinstellungen gesetzt ist. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-skip-backward-fill"|Über den Parameter icon kann ein anderes Icon für das Zurückschalten zur Startansicht verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel totalView als Object**

```json
"totalView" : {
    "icon": "bi-skip-forward-fill"
},
```

**Beispiel totalView als Boolean**

```json
"totalView": true
```

***

#### Portalconfig.controls.zoom
Legt fest, ob die Zoombuttons angezeigt werden sollen.

Das Attribut zoom kann vom Typ Boolean oder Object sein. Wenn es vom Typ Boolean ist, zeigt es die Buttons an, die in den Defaulteinstellungen gesetzt sind. Ist es vom Typ Object, so gelten folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|iconIn|nein|String|"bi-plus-lg"|Über den Parameter icon kann ein anderes Icon für hereinzoomen verwendet werden.|false|
|iconOut|nein|String|"bi-dash-lg"|Über den Parameter icon kann ein anderes Icon für herauszoomen verwendet werden.|false|
|supportedDevices|nein|String|["Desktop"]|Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String|["2D", "3D"]|Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|

**Beispiel zoom als Object**

```json
"zom" : {
    "iconIn": "bi-plus-lg",
    "iconOut": "bi-dash-lg"
},
```

**Beispiel zoom als Boolean**

```json
"zoom": true
```

***

### Portalconfig.getFeatureInfo
Zeigt Informationen zu einem abgefragten Feature ab, indem GetFeatureInfo-Requests oder GetFeature-Requests oder geladene Vektordaten abgefragt werden.

Bei allen GFI-Abfragen, außer dem direkten Beziehen von HTML, welches durch das Konfigurieren von `"text/html"` als `"infoFormat"` an einem WMS geschieht, wird das Zeichen "|" als Zeilenumbruch interpretiert. Es ist ebenso möglich `"\r\n"` oder `"\n"` zu verwenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|centerMapToClickPoint|nein|Boolean|false|Wenn der Parameter auf true gesetzt wird, verschiebt sich die Karte beim Klick auf ein Feature so, dass das Feature im Mittelpunkt der sichtbaren Karte liegt.|false|
|coloredHighlighting3D|nein|**[coloredHighlighting3D](#markdown-header-portalconfiggetfeatureinfocoloredhighlighting3d)**||Regeldefinitionen zum Überschreiben des Highlightings von angeklickten 3D tiles.|false|
|hideMapMarkerOnVectorHighlight|nein|Boolean|false|Wenn Wert auf true gesetzt ist, wird der MapMarker beim VectorHighlighting nicht mit angezeigt. Gilt nur für das DetachedTemplate.|false|
|highlightVectorRules|nein|**[highlightVectorRules](#markdown-header-portalconfiggetfeatureinfohighlightvectorrules)**||Regeldefinitionen zum Überschreiben des Stylings von abgefragten Vektordaten.|false|
|icon|nein|String|"bi-info-circle-fill"|CSS Klasse des Icons, das vor dem GFI im Menu angezeigt wird.|false|
|menuSide|nein|String|"secondaryMenu"|Gibt an in welchem Menü die Informationen angezeigt werden sollen.|false|
|name|nein|String|"common:modules.getFeatureInfo.name"|Name des Moduls im Menü.|false|

**Beispiel einer GetFeatureInfo Konfiguration**

```json
"getFeatureInfo": {
    "name":"Informationen abfragen",
    "icon":"bi-info-circle-fill",
    "coloredHighlighting3D": {
        "enabled": true,
        "color": "GREEN"
    },
    "highlightVectorRules": {
        "fill": {
            "color": [215, 102, 41, 0.9]
        },
        "image": {
            "scale": 1.5
        },
        "stroke": {
            "width": 4
        },
        "text": {
            "scale": 2
        }
    },
    "hideMapMarkerOnVectorHighlight": true
}
```

**Beispiel einer GetFeatureInfo Konfiguration zur Informationsabfrage von Features**

```json
"getFeatureInfo":{
    "name":"Informationen abfragen"
}
```

***

#### Portalconfig.getFeatureInfo.coloredHighlighting3D
Highlight Einstellungen von 3D Tiles.
Falls z. B. ein Gebäude per Linksklick selektiert wurde, wird es in der definierten Farbe gehighlighted.
Für mehr Informationen über die Farbmöglichkeiten: **[Color-documentation](https://cesium.com/learn/cesiumjs/ref-doc/Color.html)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|String/String[]|"RED"|Color kann als Array oder Cesium.Color definiert werden(z. B. "GREEN" für Cesium.Color.GREEN)|false|
|enabled|nein|Boolean|true|False falls coloredHighlighting3D disabled ist.|false|

**Beispiel Array**

```json
"coloredHighlighting3D": {
    "enabled": true,
    "color": [0, 255, 0, 255]
}
```

**Beispiel Cesium.Color**

```json
"coloredHighlighting3D": {
    "enabled": true,
    "color": "GREEN"
}
```

***

#### Portalconfig.getFeatureInfo.highlightVectorRules
Liste der Einstellungen zum Überschreiben von Vektorstyles bei GetFeatureInfo Abfragen.

Hinweis: Das Highlighting funktioniert nur, wenn der Layer in der config.json über eine gültige StyleId verfügt!

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfiggetfeatureinfohighlightvectorrulesfill)**||Mögliche Einstellung: `color`|false|
|image|nein|**[image](#markdown-header-portalconfiggetfeatureinfohighlightvectorrulesimage)**||Mögliche Einstellung: `scale`|false|
|stroke|nein|**[stroke](#markdown-header-portalconfiggetfeatureinfohighlightvectorrulesstroke)**||Mögliche Einstellung: `width`|false|
|text|nein|**[text](#markdown-header-portalconfiggetfeatureinfohighlightvectorrulestext)**||Mögliche Einstellung: `scale`|false|

***

##### Portalconfig.getFeatureInfo.highlightVectorRules.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

**Beispiel**

```json
"fill": {
    "color": [215, 102, 41, 0.9]
}
```

***

##### Portalconfig.getFeatureInfo.highlightVectorRules.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

**Beispiel**

```json
"image": {
    "scale": 1.5
}
```

***

##### Portalconfig.getFeatureInfo.highlightVectorRules.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

**Beispiel**

```json
"stroke": {
    "width": 4,
    "color": [215, 102, 41, 0.9]
}
```

***

##### Portalconfig.getFeatureInfo.highlightVectorRules.text
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Float|1|Mögliche Einstellung: scale|false|

**Beispiel**

```json
"text": {
    "scale": 2
}
```

***

### Portalconfig.Menu
Hier können die Menüeinträge jeweils für das MainMenu (in der Desktopansicht links) und SecondaryMenu (in der Desktopansicht rechts) und deren Anordnung konfiguriert werden. Die Reihenfolge der Module ergibt sich aus der Reihenfolge in der *Config.json*.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|expanded|nein|Boolean|false|Definiert ob das jeweilige Menü beim Starten des Portals aus- oder eingeklappt ist.|false|
|showDescription|nein|Boolean||Definiert ob eine Beschreibung zu den Modulen im jeweiligen Menü angezeigt werden soll.|false|
|searchBar|nein|**[searchBar](#markdown-header-portalconfigmenusearchbar)**||Über das Eingabefeld Suche können verschiedene Suchen gleichzeitig angefragt werden.|false|
|sections|nein|**[sections](#markdown-header-portalconfigmenusections)**[]||Unterteilung von Modulen im Menü.|false|
|title|nein|**[title](#markdown-header-portalconfigmenutitle)**||Der Titel und weitere Parameter die im Hauptmenü angezeigt werden können.|false|

***

#### Portalconfig.menu.searchBar
Konfiguration der Suchleiste. Es lassen sich verschiedene Suchdienste konfigurieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minCharacters|nein|Integer|3|Minimale Anzahl an Buchstaben, ab der die Suche startet.|false|
|placeholder|nein|String|"common:modules.searchBar.placeholder.address"|Placeholder für das Suchfeld.|false|
|searchInterfaces|nein|**[searchInterfaces](#markdown-header-portalconfigmenusearchbarsearchInterfaces)**[]||Schnittstellen zu Suchdiensten.|false|
|timeout|nein|Integer|5000|Timeout in Millisekunden für die Dienste Anfrage.|false|
|zoomLevel|nein|Integer|7|ZoomLevel, auf das die Searchbar maximal hineinzoomt.|false|

**Beispiel**

```json
{
    "searchBar" {
        "minCharacters": 3,
        "placeholder": "common:modules.searchBar.placeholder.address",
        "searchInterfaces": [
            {
                "type": "gazetteer",
                "serviceId": "6",
                "searchAddress": true,
                "searchStreets": true,
                "searchHouseNumbers": true,
                "searchDistricts": true,
                "searchParcels": true,
                "searchStreetKey": true
            }
        ],
        "timeout": 5000,
        "zoomLevel": 7
    }
}
```

***

##### Portalconfig.menu.searchBar.searchInterfaces
Definitionen der Suchschnittstellen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bkg|nein|**[bkg](#markdown-header-portalconfigmenusearchbarsearchInterfacesbkg)**||Konfiguration des BKG Suchdienstes.|false|
|elasticSearch|nein|**[elasticSearch](#markdown-header-portalconfigmenusearchbarsearchInterfaceselasticsearch)**||Konfiguration des ElasticSearch Suchdienstes.|false|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigmenusearchbarsearchInterfacesgazetteer)**||Konfiguration des Gazetteer Suchdienstes.|false|
|komootPhoton|nein|**[komootPhoton](#markdown-header-portalconfigmenusearchbarsearchInterfaceskomootphoton)**||Konfiguration des Komoot Photon Suchdienstes.|false|
|locationFinder|nein|**[locationFinder](#markdown-header-portalconfigmenusearchbarsearchInterfaceslocationfinder)**||Konfiguration des LocationFinder-Suchdienstes.|false|
|osmNominatim|nein|**[osmNominatim](#markdown-header-portalconfigmenusearchbarsearchInterfacesosmnominatim)**||Konfiguration des OpenStreetMap (OSM) Suchdienstes.|false|
|specialWFS|nein|**[specialWFS](#markdown-header-portalconfigmenusearchbarsearchInterfacesspecialwfs)**||Konfiguration des specialWFS Suchdienstes.|false|
|topicTree|nein|**[topicTree](#markdown-header-portalconfigmenusearchbarsearchInterfacestopictree)**||Konfiguration der Suche im Themenbaum.|false|
|visibleVector|nein|**[visibleVector](#markdown-header-portalconfigmenusearchbarsearchInterfacesvisiblevector)**||Konfiguration der Suche über die sichtbaren Vector Layer.|false|

**Beispiel**

```json
"searchInterfaces": [
    {
        "type": "gazetteer",
        "serviceId": "6",
        "searchAddress": true,
        "searchStreets": true,
        "searchHouseNumbers": true,
        "searchDistricts": true,
        "searchParcels": true,
        "searchStreetKey": true
    }
]
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.bkg
Konfiguration des BKG Suchdienstes

**ACHTUNG: Backend notwendig!**

**Um die eigene UUID für den BKG nicht öffentlich zu machen, sollten die URLS (hier "bkg_geosearch" und "bkg_suggest") der restServices im Proxy abgefangen und umgeleitet werden.**

**Beispielhafte Proxy Einstellung**

```
ProxyPass /bkg_geosearch http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
<Location /bkg_geosearch>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/geosearch
</Location>

ProxyPass /bkg_suggest http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
<Location /bkg_suggest>
  ProxyPassReverse http://sg.geodatenzentrum.de/gdz_geokodierung__[UUID]/suggest
</Location>
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|epsg|nein|String|"EPSG:25832"|EPSG-Code des zu verwendenden Koordinatensystems.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[454591, 5809000, 700000, 6075769]|Koordinaten-Ausdehnung innerhalb dieser der Suchalgorithmus suchen soll.|false|
|geoSearchServiceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|minScore|nein|Number|0.6|Score der die Qualität der Suchergebnisse definiert.|false|
|resultCount|nein|Integer|20|Maximale Anzahl der Suchtreffer die vom Dienst geliefert werden.|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], buttons: ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "zoomToResult", "startRouting".|false|
|type|ja|String|"bkg"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "geoSearchServiceId": "5",
    "extent": [454591, 5809000, 700000, 6075769],
    "resultCount": 10,
    "epsg": "EPSG:25832",
    "minScore": 0.6,
    "type": "bkg"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.elasticSearch
Konfiguration des Elastic Search Suchdienstes

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|hitIcon|nein|String|"bi-signpost-2-fill"|CSS Icon Klasse des Suchergebnisses. Wird vor dem Namen angezeigt.|false|
|hitMap|nein|**[hitMap](#markdown-header-portalconfigsearchbarelasticsearchhitmap)**||Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.|true|
|hitTemplate|nein|String|"default"|Template in dem die Suchergebnisse (`alle anzeigen`) angezeigt werden. Möglich sind die Werte "default" und "layer".|false|
|hitType|nein|String|"common:modules.searchbar.type.subject"|Typ des Suchergebnisses, wird in der Auswahlliste hinter dem Namen angezeigt. Nutzen Sie den Übersetzungskey aus der Übersetzungsdatei|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["addLayerToTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "addLayerToTopicTree", "setMarker", "showInTree", "showLayerInfo", "startRouting", "zoomToResult".|false|
|requestType|nein|enum["POST", "GET"]|"POST"|Art des Requests.|false|
|responseEntryPath|nein|String|""|Der Pfad in der response (JSON) zum Attribut, das die gefundenen Features enthält.|false|
|searchStringAttribute|nein|String|"searchString"|Attributname im payload für den searchString.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|type|ja|String|"elasticSearch"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

Als zusätzliches property kann `payload` hinzugefügt werden. Es muss nicht zwingend gesetzt sein, und passt zur Beschreibung von **[CustomObject](#markdown-header-datatypescustomobject)**. Per default wird es als leeres Objekt `{}` gesetzt. Das Objekt beschreibt die Payload, die mitgeschickt werden soll. Es muss das Attribut für den searchString vorhalten. Für weitere Infos zu den nutzbaren Attributen siehe **[Elasticsearch Guide](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-search.html)**. Dieses Objekt kann im Admintool nicht gepflegt werden, da dort **[CustomObject](#markdown-header-datatypescustomobject)** nicht definiert ist.

 **Beispiel**

```json
{
    "type": "elasticSearch",
    "serviceId":"elastic",
    "requestType": "GET",
    "payload": {
        "id":"query",
        "params":{
            "query_string":""
        }
    },
    "searchStringAttribute": "query_string",
    "responseEntryPath": "hits.hits",
    "hitMap": {
        "name": "_source.name",
        "id": "_source.id",
        "source": "_source"
    },
    "hitType": "common:modules.searchbar.type.subject",
    "hitIcon": "bi-list-ul"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.elasticSearch.hitMap
Mapping Objekt. Mappt die Attribute des Ergebnis Objektes auf den entsprechenden Key.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|coordinate|nein|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|id|ja|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|layerId|nein|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|name|ja|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|source|nein|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|
|toolTip|nein|String/String[]||Attribut value wird auf attribut key gemappt. Notwendig um das Ergebnis anzuzeigen.|false|

**Beispiel**

```json
"hitMap": {
    "name": "_source.name",
    "id": "_source.id",
    "source": "_source",
    "layerId": "_source.id",
    "toolTip": [
        "_source.name",
        "_source.datasets.md_name"
    ]
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.gazetteer
Konfiguration des Gazetteer Suchdienstes

**ACHTUNG: Backend notwendig!**
**Es wird eine Stored Query eines WFS mit vorgegebenen Parametern abgefragt.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|searchAddress|nein|Boolean||Gibt an, ob nach Adressen gesucht werden soll.|false|
|searchDistricts|nein|Boolean||Gibt an, ob nach Bezirken gesucht werden soll.|false|
|searchHouseNumbers|nein|Boolean||Gibt an, ob nach Straßen und Hausnummern gesucht werden soll. |false|
|searchParcels|nein|Boolean||Gibt an, ob nach Flurstücken gesucht werden soll.|false|
|searchStreetKey|nein|Boolean||Gibt an, ob nach Straßenschlüsseln gesucht werden soll.|false|
|searchStreets|nein|Boolean||Gibt an, ob nach Straßen gesucht werden soll. Vorraussetzung für **searchHouseNumbers**.|false|
|serviceId|ja|String||Id des Suchdienstes. Wird aufgelöst in der **[rest-services.json](rest-services.json.de.md)**.|false|
|showGeographicIdentifier|nein|Boolean|false|Gibt an ob das Attribut `geographicIdentifier` zur Anzeige des Suchergebnisses verwendet werden soll.|false|
|type|ja|String|"gazetteer"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "gazetteer",
    "serviceId": "6",
    "searchAddress": true,
    "searchStreets": true,
    "searchHouseNumbers": true,
    "searchDistricts": true,
    "searchParcels": true,
    "searchStreetKey": true
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.komootPhoton
Suche bei **[Komoot Photon](https://photon.komoot.io/)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|bbox|nein|string||Begrenzungsrechteck für die Suche.|false|
|lang|nein|string|"de"|Sprache für die Komoot Suche. Wirkt sich auf Sprachspezifische Ortsangaben (Zum Beispiel Ländernamen) aus.|false|
|lat|nein|Number||Breitengrad für den Suchmittelpunkt.|false|
|limit|nein|Number||Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|lon|nein|Number||Längengrad für den Suchmittelpunkt.|false|
|osm_tag|nein|string||Filterung für OSM Tags (siehe https://github.com/komoot/photon#filter-results-by-tags-and-values).|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/0d136a44a59dd3b64ec986c258763ac08603bf15/doc/rest-services.json.md)** vor.|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|type|ja|String|"komootPhoton"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "komootPhoton",
    "serviceId": "10",
    "limit": 20,
    "lang": "de",
    "lat": 52.5,
    "lon": 13.4,
    "bbox": "12.5,52.05,14.05,52.75"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.locationFinder
Konfiguration zur Suche unter Verwendung eines ESRI CH LocationFinders.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|classes|nein|**[LocationFinderClass](#markdown-header-portalconfigsearchbarlocationfinderLocationFinderClass)**||Kann Klassen (mit Eigenschaften) enthalten die berücksichtigt werden sollen. Wenn hier nichts angegeben wird, so werden alle Klassen berücksichtigt.|false|
|epsg|nein|String||Koordinatensystem (EPSG-Code), in dem das Ergebnis angefragt werden soll. Standardmäßig wird  hier der Wert von Portalconfig.mapView.epsg verwendet.|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|type|ja|String|"locationFinder"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "locationFinder",
    "serviceId": "locationFinder",
    "classes": [
        {
            "name": "Haltestelle",
            "icon": "bi-record-circle"
        },
        {
            "name": "Straßenname"
        }
    ]
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.locationFinder.LocationFinderClass
Definition von Klassen, welche als Ergebnis berücksichtigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-signpost-2-fill"|Visualisierung der Klasse durch ein Icon|false|
|name|ja|String||Name der Klasse|false|
|zoom|nein|String|"center"|Legt fest wie auf einen ausgewählten Treffer gezoomt werden soll. Wenn `center` ausgewählt ist, so wird auf die Zentrumskoordinate (`cx` und `cy`) gezoomt und ein Marker angezeigt. Im Falle von `bbox` wird auf die durch den LocationFinder angegebene BoundingBox (`xmin`, `ymin`, `xmax` und `ymax`) gezoomt. Ein Marker wird in dem Fall nicht angezeigt.|false|

**Beispiel**

```json
{
    "type": "locationFinder",
    "serviceId": "10",
    "classes": [
        {
			"name": "Haltestelle",
			"icon": "bi-record-circle"
		},
		{
			"name": "Adresse",
			"icon": "bi-house-door-fill"
		},
		{
			"name": "Straßenname",
			"zoom": "bbox"
		}
    ]
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.osmNominatim
Suche bei OpenStreetMap über Stadt, Strasse und Hausnummer. Wird nur durch Klick auf die Lupe oder Enter ausgelöst, da die Anzahl der Abfragen der OSM-Suchmaschine limitiert ist.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|classes|nein|string|[]|Kann die Klassen, für die Ergebnisse erzielt werden sollen, enthalten.|false|
|limit|nein|Number|50|Gibt die maximale Zahl der gewünschten, ungefilterten Ergebnisse an.|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["setMarker", "zoomToResult"], "onHover": ["setMarker"], "buttons": ["startRouting"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "setMarker", "startRouting", "zoomToResult".|false|
|serviceId|ja|String||Gibt die ID für die URL in der **[rest-services.json](rest-services.json.de.md)** vor.|false|
|states|nein|string|""|Kann die Namen der Bundesländer enthalten. Trenner beliebig. Eventuell auch englische Ausprägungen eintragen, da die Daten frei im OpenSourceProjekt **[OpenStreetMap](https://www.openstreetmap.org)** erfasst werden können.|false|
|type|ja|String|"gazetteer"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "osmNominatim",
    "serviceId": "10",
    "limit": 60,
    "states": "Hamburg, Nordrhein-Westfalen, Niedersachsen, Rhineland-Palatinate Rheinland-Pfalz",
    "classes": "place,highway,building,shop,historic,leisure,city,county"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.specialWFS
Konfiguration der WFS-Suchfunktion "specialWFS": fragt Features eines WFS-Dienstes ab. Der Dienst muss hierfür WFS 2.0 Anfragen zulassen.

Beispielsweise würde bei der Eingabe "Kronenmatten" der Dienst
https://geoportal.freiburg.de/geoportal_freiburg_de/wfs/stpla_bplan/wfs_mapfile/geltungsbereiche
folgende Anfrage mit einer xml FeatureCollection beantworten. Die Features der Collection werden anschließend als Suchergebnisse vorgeschlagen.

```xml
<?xml version='1.0' encoding='UTF-8'?>
<wfs:GetFeature service='WFS' xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml' traverseXlinkDepth='*' version='1.1.0'>
    <wfs:Query typeName='ms:geltungsbereiche'>
        <wfs:PropertyName>ms:planbez</wfs:PropertyName>
        <wfs:PropertyName>ms:msGeometry</wfs:PropertyName>
        <wfs:maxFeatures>20</wfs:maxFeatures>
        <ogc:Filter>
            <ogc:PropertyIsLike matchCase='false' wildCard='*' singleChar='#' escapeChar='!'>
                <ogc:PropertyName>ms:planbez</ogc:PropertyName>
                <ogc:Literal>*Kronenmatten*</ogc:Literal>
            </ogc:PropertyIsLike>
        </ogc:Filter>
    </wfs:Query>
</wfs:GetFeature>
```

Die WFS 2 query wird dabei dynamisch durch das Masterportal erstellt. Die Konfiguration einer stored query im WFS Dienst ist hierfür nicht erforderlich.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|definitions|nein|**[definition](#markdown-header-portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** *[]||Definition der speziellen WFS suchen.|false|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen. Kann in der **[definition](#markdown-header-portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|icon|nein|String|"bi-house-fill"|Default icon das in der Vorschlagsliste erscheint. Kann in der **[definition](#markdown-header-portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)**  überschrieben werden.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features. Kann in der **[definition](#markdown-header-portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|namespaces|nein|String|"xmlns:wfs='http://www.opengis.net/wfs' xmlns:ogc='http://www.opengis.net/ogc' xmlns:gml='http://www.opengis.net/gml'"|XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt). Kann in der **[definition](#markdown-header-portalconfigmenusearchbarsearchinterfacesspecialwfsdefinition)** überschrieben werden.|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["highlightFeature", "setMarker", "zoomToResult"], "onHover": ["highlightFeature", "setMarker"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "highlightFeature", "setMarker", "zoomToResult".|false|
|type|ja|String|"specialWFS"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "specialWFS",
    "definitions": [
        {
            "url": "https://geodienste_hamburg_de/MRH_WFS_Rotenburg",
            "typeName": "app:mrh_row_bplan",
            "propertyNames": ["app:name"],
            "name": "B-Plan",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        },
        {
            "url": "/geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
            "typeName": "app:prosin_imverfahren",
            "propertyNames": ["app:plan"],
            "geometryName": "app:the_geom",
            "name": "im Verfahren",
            "namespaces": "xmlns:app='http://www.deegree.org/app'"
        }
    ]
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.specialWFS.definition
Konfiguration einer Definition bei der SpecialWFS Suche

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|geometryName|nein|String|"app:geom"|Attributname der Geometrie wird benötigt um darauf zu zoomen.|false|
|icon|nein|String|"bi-house-fill"|CSS Klasse des Icons das in der Vorschlagsliste erscheint.|false|
|maxFeatures|nein|Integer|20|Maximale Anzahl an gefundenen Features.|false|
|name|nein|String||Name der Kategorie. Erscheint in der Vorschlagsliste.|false|
|namespaces|nein|String||XML Namespaces zur Abfrage von propertyNames oder geometryName (*xmlns:wfs*, *xmlns:ogc* und *xmlns:gml* werden immer genutzt).|false|
|propertyNames|nein|String[]||Array von Attributnamen. Diese Attribute werden durchsucht.|false|
|typeName|nein|String||Der Name des abzufragenden Layers innerhalb des WFS.|false|
|url|nein|String||URL des WFS. Je nach proxy-Konfiguration muss die relative url vom Server des Portals aus angegeben werden. |false|

**Beispiel**

```json
{
    "url": "https://geodienste_hamburg_de/HH_WFS_Bebauungsplaene",
    "typeName": "app:prosin_imverfahren",
    "propertyNames": ["app:plan"],
    "geometryName": "app:the_geom",
    "name": "im Verfahren"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.topicTree
Alle Layer, die im Themenbaum des Portals sind, werden durchsucht.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|hitTemplate|nein|String|"default"|Template in dem die Suchergebnisse (`alle anzeigen`) angezeigt werden. Möglich sind die Werte "default" und "layer".|false|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["activateLayerInTopicTree"], "buttons": ["showInTree", "showLayerInfo"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "activateLayerInTopicTree", "showInTree", "showLayerInfo".|false|
|type|ja|String|"topicTree"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "topicTree"
}
```

***

###### Portalconfig.menu.searchBar.searchInterfaces.visibleVector
Konfiguration der Suche über die sichtbaren VectorLayer. Bei der Layerdefinition unter "Fachdaten" muss für jeden VectorLayer, der durchsucht werden soll das Attribut "searchField" gesetzt sein. Siehe **[searchField](#markdown-header-themenconfigelementslayersvector)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resultEvents|nein|**[resultEvents](#markdown-header-portalconfigmenusearchbarsearchInterfacesresultEvents)**|{"onClick": ["openGetFeatureInfo", "setMarker", "zoomToResult"], "onHover": ["setMarker"]}|Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt. Folgende events sind möglich: "openGetFeatureInfo", "setMarker", "zoomToResult".|false|
|type|ja|String|"visibleVector"|Type der Such-Schnittstelle. Definiert welche Such-Schnittstelle konfiguriert ist.|

**Beispiel**

```json
{
    "type": "visibleVector"
}
```

***

##### Portalconfig.menu.searchBar.searchInterfaces.resultEvents
Aktionen, die ausgeführt werden, wenn eine Interaktion, z. B. ein Hover oder ein Klick, mit einem Element der Ergebnisliste erfolgt.

Folgende Events existieren. Welche Events konfiguriert werden können ist den Beschreibungen der jeweiligen Suchschnittstelle zu entnehmen:

- activateLayerInTopicTree: Aktiviert den gefunden layer im Themenbaum und in der Karte.
- addLayerToTopicTree: Fügt den gefundenen Layer zum Themenbaum und der Karte hinzu.
- highligtFeature: Hebt das Scuhergebniss auf der Karte hervor.
- openGetFeatureInfo: Öffnet die GetFeatureInfo zum Suchtreffer im Menü.
- setMarker: Es wird ein Marker in der Karte platziert.
- showInTree: Öffnet die Themenauswahl und zeigt den ausgewählten Layer an.
- showLayerInfo: Öffnet de Layerinformationen.
- startRouting: Starte das Modul Routing mit der angeklickten Adresse als Ziel.
- zoomToResult: Es wird zum Suchtreffer gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|buttons|nein|String[]||Buttons die bei jedem Suchergebiss in der Ergebnisliste angezeigt werden und bei Klick eine Aktion ausführen|false|
|onClick|nein|String[]||Aktionen die auf bei einem Klick auf Ein Suchergebniss ausgeführt werden.|false|
|onHover|nein|String[]||Aktionen die auf bei einem Hover auf Ein Suchergebniss ausgeführt werden.|false|

**Beispiel 1**

```json
"resultEvents": {
    "onClick": ["setMarker", "zoomToResult"],
    "onHover": ["setMarker"]
}
```

**Beispiel 2**

```json
"resultEvents": {
    "onClick": ["activateLayerInTopicTree"],
    "buttons": ["showInTree", "showLayerInfo"]
}
```

***

#### Portalconfig.menu.sections
Module lassen sich in Abschnitte (Sections) unterteilen. Im Menü werden Abschnitte mit einem horizontalen Strich unterteilt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addWMS|nein|**[addWMS](#markdown-header-portalconfigmenusectionsmodulesaddWMS)**||Mit diesem Modul lassen sich Layer eines WMS laden. Die Angabe erfolgt über eine URL. Es werden alle Layer des Dienstes geladen und im Themenbaum angezeigt.|true|
|bufferAnalysis|nein|**[bufferAnalysis](#markdown-header-portalconfigmenusectionsmodulesbufferAnalysis)**||In der Buffer-Analyse muss ein Quell-Layer, ein Buffer-Radius und ein Ziel-Layer ausgewählt werden. Buffer-Radien werden um die Features des Quell-Layers dargestellt. Sobald ein Ziel-Layer gewählt wurde, werden nur die Features dieses Layers hervorgehoben, welche sich außerhalb der Buffer-Radien befinden. Auch eine invertierte Anzeige ist möglich. Bei dieser werden nur die Features des Ziel-Layers innerhalb der Radien hervorgehoben.|false|
|contact|nein|**[contact](#markdown-header-portalconfigmenusectionsmodulescontact)**||Das Kontaktformular bietet dem Benutzer die Möglichkeit an das konfigurierte Postfach eine Nachricht zu senden. Es können beispielsweise Fehler oder Wünsche und Anregungen gemeldet und Screenshots können beigefügt werden.|false|
|coordToolkit|nein|**[coordToolkit](#markdown-header-portalconfigmenusectionsmodulescoordtoolkit)**||Koordinatenabfrage: Werkzeug um Koordinaten und Höhe per Maus-Klick abzufragen: Bei Klick in die Karte werden die Koordinaten in der Anzeige eingefroren und können auch direkt in die Zwischenablage kopiert werden. Koordinatensuche: Über eine Eingabemaske können das Koordinatensystem und die Koordinaten eingegeben werden. Das Werkzeug zoomt dann auf die entsprechende Koordinate und setzt einen Marker darauf. Die Koordinatensysteme werden aus der config.js bezogen.|false|
|customMenuElement|nein|**[customMenuElement](#markdown-header-portalconfigmenusectionsmodulescustommenuelement)**||Dieses Modul kann einen Link öffnen, HTML aus config.json oder einer externen Datei anzeigen oder eine Aktion ausführen. Diese Modul kann mehrfach in der config.json konfiguriert werden.|false|
|featureLister|nein|**[featureLister](#markdown-header-portalconfigmenusectionsmodulesfeaturelister)**||Listet alle Features eines Vektorlayers auf.|false|
|fileImport|nein|**[fileImport](#markdown-header-portalconfigmenusectionsmodulesfileImport)**||Import von Dateien des Typs *.kml, *.geojson und *. gpx. Über dieses Modul können solche Dateien importiert werden.|false|
|language|nein|**[language](#markdown-header-portalconfigmenusectionsmoduleslanguage)**||In diesem Modul lässt sich die Sprache des Portals umschalten.|false|
|layerClusterToggler|nein|**[layerClusterToggler](#markdown-header-portalconfigmenusectionsmoduleslayerClusterToggler)**||Mit diesem Modul lassen sich Layer in Clustern gleichzeitig aktivieren/laden und deaktivieren.|false|
|layerSlider|nein|**[layerSlider](#markdown-header-portalconfigmenusectionsmoduleslayerslider)**||Mit dem Layerslider lassen sich beliebige Dienste in einer Reihenfolge abspielen. Zum Beispiel geeignet für Luftbilder aus verschiedenen Jahrgängen.|false|
|measure|nein|**[measure](#markdown-header-portalconfigmenusectionsmodulesmeasure)**||Messwerkzeug um Flächen oder Strecken zu messen. Dabei kann zwischen den Einheiten m/km/nm bzw m²/ha/km² gewechselt werden.|false|
|news|nein|**[news](#markdown-header-portalconfigmenusectionsmodulesnews)**||Dieses Modul zeigt alle Meldungen aus der newsFeedPortalAlerts.json und der config.json des aktuellen Portals unabhängig des "gelesen" Status.|false|
|openConfig|nein|**[openConfig](#markdown-header-portalconfigmenusectionsmodulesopenConfig)**||Mit diesem Modul lässt sich eine Konfigurationsdatei (config.json) zur Laufzeit neu laden. Die Module und Karte werden an die neue Konfiguration angepasst.|false|
|print|nein|**[print](#markdown-header-portalconfigmenusectionsmodulesprint)**||Druckmodul mit dem die Karte als PDF exportiert werden kann.|false|
|routing|nein|**[routing](#markdown-header-portalconfigmenusectionsmodulesrouting)**||Routing Modul zur Erstellung von Routenplanungen und Erreichbarkeitsanalysen.|false|
|scaleSwitcher|nein|**[scaleSwitcher](#markdown-header-portalconfigmenusectionsmodulescaleSwitcher)**||Modul zum Ändern des aktuellen Maßstabs der Karte.|false|
|selectFeatures|nein|**[selectFeatures](#markdown-header-portalconfigmenusectionsmodulesselectFeatures)**||Ermöglicht Auswahl von Features durch Ziehen einer Box und Einsehen derer GFI-Attribute.|false|
|shadow|nein|**[shadow](#markdown-header-portalconfigmenusectionsmodulesshadow)**||Konfigurationsobjekt für die Schattenzeit im 3D-Modus.|false|
|shareView|nein|**[shareView](#markdown-header-portalconfigmenusectionsmodulesshareview)**||Modul, um einen Link zur aktuellen Karten-Ansicht zu teilen.|false|
|styleVT|nein|**[styleVT](#markdown-header-portalconfigmenusectionsmodulesstyleVT)**||Style-Auswahl zu VT-Diensten. Ermöglicht das Umschalten des Stylings eines Vector Tile Layers, wenn in der services.json mehrere Styles für ihn eingetragen sind.|false|
|wfst|nein|**[wfst](#markdown-header-portalconfigmenusectionsmoduleswfst)**||WFS-T Modul mit dem Features visualisiert, erstellt, aktualisiert und gelöscht werden können.|false|

***

#### Portalconfig.menu.sections.modules

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|description|nein|String||Beschreibung zu einem Modul, die im Menü angezeigt wird.|false|
|icon|nein|String||Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String||Name des Moduls im Menü.|false|
|showDescription|nein|String||Gibt an ob die Beschreibung zum Modul im Menü angezeigt werden soll.|false|
|supportedDevices|nein|String||Geräte auf denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|supportedMapModes|nein|String||Karten modi in denen das Modul verwendbar ist und im Menü angezeigt wird.|false|
|type|nein|String||Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

***

##### Portalconfig.menu.sections.modules.addWMS
Mit diesem Modul lassen sich zusätzliche WMS Layer über eine angegebene URL laden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-cloud-plus"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.addWMS.name"|Name des Moduls im Menü..|false|
|type|nein|String|"addWMS"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-cloud-plus",
    "name": "common:modules.addWMS.name",
    "type": "addWMS"
}
```

***

##### Portalconfig.menu.sections.modules.bufferAnalysis
Mit diesem Modul lassen sich die Features eines Ziel-Layers anzeigen, die sich inner- oder außerhalb einer Kreisfläche um die Features eines Quell-Layers befinden. Dabei wird die Kreisfläche, ausgehend von den Quell-Layer Features, über den Buffer-Radius definiert. Die Quell- und Ziel-Layer benötigen hierzu vektorbasierte Daten aus WFS(❗) Diensten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-arrows-angle-expand"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.bufferAnalysis.name"|Name des Moduls im Menü..|false|
|type|nein|String|"bufferAnalysis"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-arrows-angle-expand",
    "name": "common:modules.bufferAnalysis.name",
    "type": "bufferAnalysis"
}
```

***

##### Portalconfig.menu.sections.modules.contact
Mit diesem Modul, kann der Benutzer mit einem definierten Postfach Kontakt aufnehmen. Es kann eine Datei, z.B. ein Screenshot beigefügt werden.

>**ACHTUNG: Backend notwendig!**
>
>**Das Modul Contact kommuniziert mit einem SMTP-Server und ruft dort die sendmail.php auf.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|closeAfterSend|nein|Boolean|false|Kennzeichen, ob das Kontaktfenster nach erfolgreichem Versenden einer Nachricht geschlossen werden soll.|false|
|configuredFileExtensions|nein|[]||Zusätzliche Dateierweiterungen zu "png", "jpg" und "jpeg". Das Backend muss diese Dateitypen unterstützen.|false|
|contactInfo|nein|String||Weitere Informationen, welche oberhalb des Kontaktformulars angezeigt werden.|false|
|deleteAfterSend|nein|Boolean|false|Kennzeichen, ob der Inhalt des Kontaktfensters nach erfolgreichem Versenden der Nachricht gelöscht werden soll.|false|
|fileUpload|nein|Boolean|false|Kennzeichen, ob der Dateiupload verfügbar sein soll.|false|
|from|ja|**[email](#markdown-header-portalconfigmenusectionsmodulescontactemail)**[]||Absender der Email. Bitte den **[Hinweis zur Email-Sicherheit](#markdown-header-hinweis-zur-email-sicherheit)** beachten.|false|
|icon|nein|String|"bi-envelope"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|includeSystemInfo|nein|Boolean|false|Kennzeichen, ob Systeminformationen des Absenders mitgeschickt werden sollen.|false|
|locationOfCustomerService|nein|String|"de"|Land, in welchem sich der Kundensupport befindet. Wird verwendet für das Datum innerhalb der ticketId.|false|
|maxFileSize|nein|Number|1048576|Die maximale Dateigröße in bytes für hochladbare Inhalte. Standard: 1MB.|false|
|maxLines|nein|Number|5|Anzahl der Zeilen (Höhe) des Textbereiches des Formulars.|false|
|name|nein|String|"common:modules.contact.name"|Name des Moduls im Menü.|false|
|privacyPolicyLink|nein|String|"https://www.masterportal.org/datenschutz.html"|Link zur Datenschutzerklärung. Sollte gesetzt werden, wenn `showPrivacyPolicy` true ist.|false|
|serviceId|ja|String||Id des Email-Dienstes der verwendet werden soll. Wird aus der **[rest-services.json](rest-services.json.md)** bezogen.|false|
|showPrivacyPolicy|nein|Boolean|false|Kennzeichen, ob eine Checkbox angezeigt werden soll, um der Datenschutzerklärung zuzustimmen.|false|
|subject|nein|String||Der Betreff, welcher für die Email verwendet wird.|false|
|to|ja|**[email](#markdown-header-portalconfigmenusectionsmodulescontactemail)**[]||Adressat der Email. Bitte den **[Hinweis zur Email-Sicherheit](#markdown-header-hinweis-zur-email-sicherheit)** beachten.|false|
|type|nein|String|"contact"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|withTicketNo|nein|Boolean|true|Kennzeichen, ob bei erfolgreichem Versand der Anfrage eine Ticketnummer zurückgegeben werden soll.|false|
***
**Beispiel**

```json
{
    "type": "contact",
    "name": "common:menu.contact",
    "icon": "bi-envelope",
    "serviceId": "123",
    "from": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }
    ],
    "to": [
        {
            "email": "lgvgeoportal-hilfe@gv.hamburg.de",
            "name": "LGVGeoportalHilfe"
        }
    ],
    "fileUpload": true,
    "includeSystemInfo": true,
    "closeAfterSend": true,
    "deleteAfterSend": true,
    "withTicketNo": false
}
```

>Hinweis zur Email-Sicherheit

Von der ungeprüften Übernahme von *Sender (FROM)*, *Empfänger (TO)*, *Kopie (CC)* und *Blindkopie (BCC)* durch den SMTP-Server wird hiermit aus Sicherheitsgründen **ausdrücklich abgeraten**.
Vor der ungeprüften Übernahme durch den SMTP-Server der Kunden-Email als *Antwort an* (REPLY-TO) wird gewarnt.

Wir empfehlen dringend *FROM* und *TO* am SMTP-Server manuell fest einzustellen, ohne eine Möglichkeit zur externen Konfiguration anzubieten.

>Aus Sicherheitsgründen darf der vom Masterportal an den SMTP-Server geschickte *Sender (FROM)* und der *Empfänger (TO)* nicht ungeprüft vom SMTP-Server als FROM und TO für die Email verwendet werden. Ansonsten entsteht eine Lücke über die Schad-Mails mit manipuliertem FROM und TO über den SMTP-Server versendet werden. Sollte dennoch eine Konfiguration im Masterportal gewünscht sein (siehe Beispiel oben), können die Parameter *from* und *to* unter dem Vorbehalt verwendet werden, dass *from* und *to* am SMTP-Server gegen eine **Whitelist** mit erlaubten Email-Adressen geprüft und das Versenden einer Email im Falle der Angabe inkorrekter Email-Adressen unterbunden wird.

Wir empfehlen auf das automatische Setzen in *CC* (bzw. *BCC*) der Email-Adresse des Kunden zu verzichten.

>Aus Sicherheitsgründen darf der Kunde nicht automatisch als *Kopie (CC)* oder *Blindkopie (BCC)* der Email gesetzt werden. Ein solcher Automatismus wird missbraucht um durch Angabe einer Fremd-Email-Adresse Schad-Mails über den SMTP-Server zu versenden.

Wir empfehlen dringend *CC* und *BCC* am SMTP-Server manuell zu nullen.

>Es darf keine Möglichkeit geben *Kopie (CC)* oder *Blindkopie (BCC)* über das Masterportal einzustellen. Ein solches Feature wird zum Versenden von Schad-Mails über den SMTP-Server missbraucht.

Wir warnen vor der automatischen Einstellung der Kunden-Mail als *REPLY-TO*.

>Die ungeprüfte Übernahme von Daten in den Email-Header ist je nach Sicherheitsstand (bzw. Alter) des SMTP-Servers mit dem Risiko verbunden, dass im einfachsten Fall durch Injektion von *Carriage Return* und *Line Feed* in z.B. *REPLY-TO* aus der Email-Header-Zeile ausgebrochen und der Email-Header selbst manipuliert wird (Beispiel: "test@example.com\r\nBCC:target1@example.com,target2@example.com,(...),target(n)@example.com"). In einem abstrakteren Fall sind auch UTF-Attacken denkbar, bei der eigentlich harmlose UTF-16- oder UTF-32-Zeichen durch Interpretation als ANSI oder UTF-8 zu Verhaltensänderungen des Email-Headers mit einem ähnlichen Ergebnis führen.

***
###### Portalconfig.menu.sections.modules.contact.email
Email Objekt bestehend aus der Email-Adresse und dem angezeigten Namen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|email|nein|String||Die Email-Adresse.|false|
|name|nein|String||Der angezeigte Name.|false|

**Beispiel**

```json
{
    "email": "lgvgeoportal-hilfe@gv.hamburg.de",
    "name":"LGVGeoportalHilfe"
}
```

***

##### Portalconfig.menu.sections.modules.coordToolkit
Koordinaten-Werkzeug: um zusätzlich zu den 2 dimensionalen Koordinaten die Höhe über NHN anzuzeigen muß eine 'heightLayerId' eines WMS-Dienstes angegeben werden, der die Höhe liefert. Es wird das Format XML erwartet und das Attribut für die Höhen wird unter dem Wert des Parameters 'heightElementName' erwartet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|coordInfo|nein|[CoordInfo](#markdown-header-portalconfigmenusectionsmodulescoordtoolkitcoordInfo)|null|Hier kann ein Objekt mit Erläuterungen für die Koordinatenreferenzsysteme hinterlegt werden.|false|
|delimiter|nein|String|"Pipe-Symbol"|Trenner der Koordinaten beim Kopieren des Koordinatenpaares|false|
|heightElementName|nein|String||Koordinatenabfrage: Der Element-Name unter dem die Höhe in dem XML gesucht wird|false|
|heightLayerId|nein|String||Koordinatenabfrage: Id des WMS-Layers der die Höhe im XML-Format liefert. Wenn nicht definiert, dann wird keine Höhe angezeigt.|false|
|heightLayerInfo|nein|String|null|Hier kann eine Erläuterung für die Höhe hinterlegt werden.|false|
|heightValueBuilding|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Gebäude-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gebäudefläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.coordToolkit.noHeightBuilding" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|
|heightValueWater|nein|String||Koordinatenabfrage: Der Wert im unter "heightElementName" definierten Element, der für eine nicht gemessene Höhe im Wasser-Bereich vom WMS geliefert wird, es wird der internationalisierte Text "Gewässerfläche, keine Höhen vorhanden" unter dem Schlüssel "common:modules.coordToolkit.noHeightWater" in der Oberfläche angezeigt. Wenn dieses Attribut nicht angegeben wird, dann wird der Text, den das WMS liefert angezeigt.|false|

|showCopyButtons|nein|Boolean|true|Schalter um die Buttons zum Kopieren der Koordinaten anzuzeigen oder auszublenden.|false|
|type|nein|String|"coordToolkit"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|zoomLevel|nein|Number|7|Koordinatensuche: Gibt an, auf welches ZoomLevel gezoomt werden soll.|false|

**Beispiel**

```json
{
    "type": "coordToolkit",
    "heightLayerId": "19173",
    "heightElementName": "value_0",
    "heightValueWater": "-20",
    "heightValueBuilding": "200",
    "zoomLevel": 5,
    "heightLayerInfo": "Grundlage der Höheninformation ist das \"Digitalge Höhenmodell Hamburg DGM 1\".",
    "showDescription": true,
    "description": "Bestimme Koordinaten aus der Karte oder suche nach Koordinaten.",
    "coordInfo": {
        "title": "Koordinatenreferenzsystem für 2D-Lageangaben, Erläuterungen",
        "explanations": [
        "ETRS89_UTM32, EPSG 4647 (zE-N): Bezugssystem ETRS89, Abbildungsvorschrift UTM, Zone 32",
        "EPSG 25832: Erklärung..."
        ]
    }
}
```

***

###### Portalconfig.menu.sections.modules.coordToolkit.coordInfo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|explanations|nein|**[explanations](#markdown-header-portalconfigmenusectionsmodulescoordtoolkitcoordinfoexplanations)**[]||Array mit Erklärungen, aus denen eine Liste erstellt wird.|false|
|title|nein|string||Überschrift für die Erläuterungen zu den Koordinatenreferenzsystemen.|false|

***

###### Portalconfig.menu.tool.coordToolkit.coordInfo.explanations
Kann ein Array von Erläuterungen zu den Koordinatenreferenzsystemen enthalten aus denen eine Liste erstellt wird.

***

##### Portalconfig.menu.sections.modules.customMenuElement
Dieses Modul kann einen Link öffnen, HTML aus config.json oder einer externen Datei anzeigen oder eine Aktion ausführen. Diese Modul kann mehrfach in der config.json konfiguriert werden. Wenn `htmlContent` angegeben wird, dann wird `pathToContent` nicht ausgeführt und umgekehrt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|execute|nein|**[execute](#markdown-header-portalconfigmenusectionsmodulescustomMenuElementexecute)**||Aktion, die mit dem Klick auf den Menü-Eintrag ausgeführt werden soll.|true|
|htmlContent|nein|String||HTML, das in dem Modul angezeigt wird. Das HTML wird nicht validiert, die Verantwortung für die Sicherheit des HTMLs liegt beim Betreiber des Portals.|false|
|icon|nein|String|"bi-asterisk"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String||Name des Moduls im Menü.|false|
|openURL|nein|String||Url die mit dem Klick auf den Menü-Eintrag in einem neuen Tab geöffnet werden soll.|false|
|pathToContent|nein|String||Pfad zu einer Datei, die HTML enthält, das in dem Modul angezeigt wird. Das HTML wird nicht validiert, die Verantwortung für die Sicherheit des HTMLs liegt beim Betreiber des Portals.|false|
|type|ja|String|"customMenuElement"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
 {
    "type": "customMenuElement",
    "name": "Url öffnen",
    "openURL": "https://geoinfo.hamburg.de/"
 },
{
    "type": "customMenuElement",
    "name": "Url öffnen und HTML anzeigen",
    "openURL": "https://geoinfo.hamburg.de/",
    "htmlContent": "<div><h1>This is a Heading</h1><p>Es wurde eine Url geöffnet.<p/></div>"
},
{
    "type": "customMenuElement",
    "name": "HTML aus config.json und Action",
    "htmlContent": "<div><p>This is a paragraph.</p></br><a href=\"https://www.w3schools.com/\" target=\"_blank\">Visit W3Schools.com!</a></div>",
    "execute":{
        "action": "Alerting/addSingleAlert",
        "payload":  {"title":"An alle Menschen", "content": "Hallo Welt"}
    }
}
```

***

###### Portalconfig.menu.sections.modules.customMenuElement.execute
CustomMenuElement Module `execute` Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|action|ja|String||Name und ggf. Pfad der Aktion, die ausgeführt werden soll.|true|
|payload|nein|**[payload](#markdown-header-portalconfigmenusectionsmodulescustomMenuElementexecutepayload)**||Payload, der an die Aktion übergeben wird.|true|

**Beispiel**

```json
{
    "action": "Alerting/addSingleAlert",
    "payload":  {"title":"An alle Menschen", "content": "Hallo Welt"}
}
```

***

###### Portalconfig.menu.sections.modules.customMenuElement.execute.payload
CustomMenuElement Module `execute` vom `payload`. Der passende payload zu der Aktion muss angegeben werden. Hier das Beispiel des `Alerting/addSingleAlert`.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|content|ja|String||Inhalt der Meldung.|true|
|title|nein|String||Titel der Meldung.|true|

**Beispiel**

```json
{
    "title":"An alle Menschen",
    "content": "Hallo Welt"
}
```

***

##### Portalconfig.menu.sections.modules.draw

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|

***

##### Portalconfig.menu.sections.modules.featureLister
Dieses Modul kann geladene Vektordaten von WFS(❗) Layern in einer Tabelle darstellen. Alle sichtbaren Vektorlayer aus der Karte werden im ersten Reiter angezeigt. Die Features des Layers werden im zweiten Reiter der Tabelle aufgelistet. Die Anzahl der angezeigten Features ist konfigurierbar.

Sobald man den Mauszeiger über einem Feature in der Liste positioniert wird dieses in der Karte hervorgehoben. Durch Klick auf ein Feature werden dessen Attribute in einem dritten Reiter  sortierbar dargestellt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|highlightVectorRulesPointLine|nein|**[highlightVectorRulesPointLine](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointline)**||Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und einer Füllfarbe sowie eines Skalierungsfaktors für das Hervorheben von Punkten und einer Zoomstufe.|false|
|highlightVectorRulesPolygon|nein|**[highlightVectorRulesPolygon](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespolygon)**||Angabe der Füllfarbe und der Umriss-Farbe und -Strichstärke für das Hervorheben der Polygon-Features und einer Zoomstufe.|false|
|icon|nein|String|"bi-list"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|maxFeatures|nein|Integer|20|Anzahl der zu zeigenden Features. Über einen Button können weitere Features in dieser Anzahl zugeladen werden.|false|
|name|nein|String|"common:modules.featureLister.name"|Name des Moduls im Menü.|false|
|type|ja|String|"featureLister"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
"featureLister": {
    "name": "Liste",
    "icon": "bi-list",
    "maxFeatures": 10,
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 5
    },
    "highlightVectorRulesPointLine": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 5
    }
}
```

***
###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPointLine
Angabe der Umriss-Farbe und -Strichstärke für das Hervorheben von Linien und Füllfarbe, sowie Skalierungsfaktor für das Hervorheben von Punkten. Ebenfalls kann eine Zoomstufe angegeben werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointlinefill)**||Mögliche Einstellung: color|false|
|image|nein|**[image](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointlineimage)**||Mögliche Einstellung: scale|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespointlinestroke)**||Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Mögliche Einstellung: 0-9|false|

***

###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPointLine.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"fill": {
     "color": [215, 102, 41, 0.9]
     }
```

***
###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPointLine.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

```json
"stroke": {
    "width": 4 , 
    "color": [255, 0, 255, 0.9]
    }
```

***
###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPointLine.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Integer|1.5|Mögliche Einstellung: scale|false|

```json
"image": {
    "scale": 2
    }
```

***
###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPolygon
Angabe der Füll-Farbe und -Strichstärke für das Hervorheben von Polygonen sowie einer Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespolygonfill)**||Mögliche Einstellung: color|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenusectionsmodulesfeaturelisterhighlightvectorrulespolygonstroke)**||Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Mögliche Einstellung: 0-9|false|

***

###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPolygon.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

```json
"fill": { 
    "color": [215, 102, 41, 0.9] 
    }
```

***

###### Portalconfig.menu.sections.modules.featureLister.highlightVectorRulesPolygon.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

```json
"stroke": {
     "width": 4 , 
     "color": [255, 0, 255, 0.9]
     }
```

***
##### Portalconfig.menu.sections.modules.fileImport
Über dieses Modul können Dateien der Formate "*.kml", "*.geojson" und "*.gpx" importiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enableZoomToExtend|nein|Boolean|false|Legt fest, ob der Dateiname als Knopf angezeigt wird, welcher die Möglichkeit bietet, in die importierten Features hineinzuzoomen.|false|
|icon|nein|String|"bi-box-arrow-in-down"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.fileImport.name"|Name des Moduls im Menü.|false|
|type|nein|String|"fileImport"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "type": "fileImport",
    "enableZoomToExtend": true
}
```

***

##### Portalconfig.menu.sections.modules.filter

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|

***

##### Portalconfig.menu.sections.modules.language
In diesem Modul lässt sich die Sprache des Portals umschalten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-flag"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.language.name"|Name des Moduls im Menü.|false|
|type|nein|String|"language"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-flag",
    "name": "common:modules.language.name",
    "type": "language"
}
```

***

##### Portalconfig.menu.sections.modules.layerClusterToggler
Mit diesem Modul lassen sich Layer in Clustern gleichzeitig aktivieren/laden und deaktivieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-list"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIdList|ja|String[]|[]|Auflistung der layerIds, der Layer die gemeinsam an- bzw. ausgeschaltet werden sollen.|false|
|name|nein|String|"common:modules.layerClusterToggler.name"|Name des Moduls im Menü..|false|
|type|nein|String|"layerClusterToggler"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-list",
    "layerIdList": [
        "8712",,
        "8713.1",
        "8713.2",
        "8713.3"
    ],
    "name": "common:modules.layerClusterToggler.name",
    "type": "layerClusterToggler"
}
```

***

##### Portalconfig.menu.sections.modules.layerSlider
Der Layerslider ist ein Modul um verschiedene Layer in der Anwendung hintereinander an bzw. auszuschalten. Dadurch kann z.B. eine Zeitreihe verschiedener Zustände animiert werden.

Der Slider kann in der Oberfläche zwischen zwei Modi wechseln. Entweder als `"player"` mit Start/Pause/Stop-Buttons oder als `"handle"` mit einem Hebel. Bei "handle" wird die Transparenz der Layer zusätzlich mit angepasst.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-collection-play"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIds|ja|**[layerId](#markdown-header-portalconfigmenusectionsmoduleslayersliderlayerid)**[]|[]|Array von Objekten aus denen die Layerinformationen herangezogen werden.|false|
|name|nein|String|"common:modules.layerSlider.name"|Name des Moduls im Menü.|false|
|timeInterval|nein|Integer|2000|Zeitintervall in ms bis der nächste Layer angeschaltet wird.|false|
|title|nein|String|"common:modules.layerSlider.title"|Titel der im Modul vorkommt.|false|
|type|nein|String|"layerSlider"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
"layerSlider": {
    "icon": "bi-hourglass-split",
    "layerIds": [
        {
            "title": "Dienst 1",
            "layerId": "123"
        },
        {
            "title": "Dienst 2",
            "layerId": "456"
        },
        {
            "title": "Dienst 3",
            "layerId": "789"
        }
    ],
    "name": "Zeitreihe",
    "timeInterval": 2000,
    "title": "Simulation von Beispiel-WMS"
}
```

***

###### Portalconfig.menu.sections.modules.layerSlider.layerIds
Definiert einen Layer für den Layerslider.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layerId|ja|String||Id des Layers, der im Portal angezeigt werden soll. ACHTUNG: Diese LayerId muss auch in der Themenconfig konfiguriert sein!|false|
|title|ja|String||Name des Layers, wie er im Portal angezeigt werden soll.|false|

**Beispiel**

```json
{
    "layerId": "123",
    "title": "Dienst 1"
}
```

***

##### Portalconfig.menu.sections.modules.legend

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|

***

##### Portalconfig.menu.sections.modules.measure
Mit dem Messwerkzeug können Strecken und Flächen gemessen werden. Dabei werden auch die Messungenauigkeiten mit angegeben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|earthRadius|nein|Number|6378137|Erdradius in Metern. Bitte beachten Sie, dass der Erdradius in Abhängigkeit zum Bezugsellipsoiden gewählt werden sollte. Für ETRS89 (EPSG:25832) ist dies beispielsweise GRS80.|false|
|icon|nein|String|"bi-arrows-angle-expand"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|lineStringUnits|nein|String[]|["m", "km"]|Gibt an, welche Einheiten für Streckenberechnungen ausgewählt werden können. Unterstützt werden "m" (Meter), "nm" (Seemeile), "km" (Kilometer).|false|
|measurementAccuracy|nein|String|"meter"|Gibt an, wie genau das Messergebnis für "m", "nm", "m²", "ha" angezeigt wird. Die möglichen Optionen sind "decimeter" für eine Nachkommastelle. "meter" für keine Nachkommastelle. "dynamic" für eine Nachkommastelle bei Ergebnissen kleiner als 10 und keine Nachkommastelle bei Ergebnissen größer oder gleich 10 der entsprechenden Einheit.|false|
|name|nein|String|"common:modules.measure.name"|Name des Moduls im Menü.|false|
|polygonUnits|nein|String[]|["m²", "km²"]|Gibt an, welche Einheiten für Flächenberechnungen ausgewählt werden können. Unterstützt werden "m²", "ha, "km²".|false|
|type|nein|String|"measure"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "earthRadius": 6378137,
    "icon": "bi-arrows-angle-expand",
    "measurementAccuracy": "dynamic",
    "name": "common:modules.measure.name",
    "type": "measure"
}
```

***

##### Portalconfig.menu.sections.modules.news
Dieses Modul zeigt alle Meldungen aus der newsFeedPortalAlerts.json und der config.json des aktuellen Portals unabhängig des "gelesen" Status.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-newspaper"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.news.name"|Name des Moduls im Menü.|false|
|type|nein|String|"news"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-newspaper",
    "name": "common:modules.news.name",
    "type": "news"
}
```

***

##### Portalconfig.menu.sections.modules.openConfig
Mit diesem Modul lässt sich eine Konfigurationsdatei (config.json) zur Laufzeit neu laden. Die Module und Karte werden an die neue Konfiguration angepasst.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-upload"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.openConfig.name"|Name des Moduls im Menü.|false|
|type|nein|String|"openConfig"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-upload",
    "name": "common:modules.openConfig.name",
    "type": "openConfig"
}
```

***

##### Portalconfig.menu.sections.modules.print
Druckmodul. Konfigurierbar für 2 Druckdienste: den High Resolution PlotService oder MapfishPrint 3.

**ACHTUNG: Backend notwendig!**

**Es wird mit einem [Mapfish-Print3](https://mapfish.github.io/mapfish-print-doc) oder einem HighResolutionPlotService im Backend kommuniziert.**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|capabilitiesFilter|nein|**[capabilitiesFilter](#markdown-header-portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||Filterung der Capabilities vom Druckdienst. Mögliche Parameter sind layouts und outputFormats.|false|
|currentLayoutName|nein|String|"A4 Hochformat"|Legt fest, welches Layout als Standardwert beim Öffnen des Druckwerkzeuges ausgewählt sein soll. Zum Beispiel "A4 Hochformat". Wenn das angegebene Layout nicht vorhanden ist oder keins angegeben wurde, dann wird das erste Layout der Capabilities verwendet.|false|
|defaultCapabilitiesFilter|nein|**[capabilitiesFilter](#markdown-header-portalconfigmenusectionsmodulesprintcapabilitiesfilter)**||Ist für ein Attribut kein Filter in capabilitiesFilter gesetzt, wird der Wert aus diesem Objekt genommen.|false|
|dpiForPdf|nein|Number|200|Auflösung der Karte im PDF.|false|
|filename|nein|String|"report"|Dateiname des Druckergebnisses.|false|
|icon|nein|String|"bi-printer"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|isLegendSelected|nein|Boolean|false|Gibt an, ob die Checkbox, zum Legende mitdrucken, aktiviert sein soll. Wird nur angezeigt wenn der Druckdienst (Mapfish Print 3) das Drucken der Legende unterstützt.|false|
|name|nein|String|"common:modules.print.name"|Name des Moduls im Menü.|false|
|overviewmapLayerId|nein|String||Über den Parameter layerId kann ein anderer Layer für die Overviewmap verwendet werden. Wird keine Id angegeben, wird der erste Layer der ausgewählten Hintergundkarten verwendet.|false|
|printAppCapabilities|nein|String|"capabilities.json"|Pfad unter welcher die Konfiguration des Druckdienstes zu finden ist.|false|
|printAppId|nein|String|"master"|Id der print app des Druckdienstes. Dies gibt dem Druckdienst vor welche/s Template/s er zu verwenden hat.|false|
|printMapMarker|nein|Boolean|false|Wenn dieses Feld auf true gesetzt ist, werden im Bildausschnitt sichtbare MapMarker mitgedruckt. Diese überdecken ggf. interessante Druckinformationen.|false|
|printService|nein|String|"mapfish"|Flag welcher Druckdienst verwendet werden soll. Bei "plotservice" wird der High Resolution PlotService verwendet, wenn der Parameter nicht gesetzt wird, wird Mapfish 3 verwendet.|false|
|printServiceId|ja|String||Id des Druckdienstes der verwendet werden soll. Wird in der rest-services.json abgelegt.|false|
|title|nein|String|"PrintResult"|Titel des Dokuments. Erscheint als Kopfzeile.|false|
|type|nein|String|"print"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel Konfiguration mit High Resolution PlotService**

```json
"print": {
    "name": "common:modules.print.name",
    "icon": "bi-printer",
    "type": "print",
    "printServiceId": "123456",
    "filename": "Ausdruck",
    "title": "Mein Titel",
    "printService": "plotservice",
    "printAppCapabilities": "info.json",
    "layoutOrder": [
        "Default A4 hoch",
        "Default A4 quer",
        "Default A3 hoch",
        "Default A3 quer",
    ]
}
```

**Beispiel Konfiguration mit MapfishPrint3**

```json
"print": {
    "name": "Karte drucken",
    "icon": "bi-printer",
    "type": "print",
    "printServiceId": "mapfish_printservice_id",
    "printAppId": "mrh",
    "filename": "Ausdruck",
    "title": "Mein Titel"
}
```

***

###### Portalconfig.menu.sections.modules.print.capabilitiesFilter
Liste von Layouts und Formaten, welche die Antwort vom Druckdienst in der jeweiligen Kategorie filtert.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|layouts|nein|String[]||Liste von Layouts, welche in der Oberfläche angezeigt werden sollen.|false|
|outputFormats|nein|String[]||Liste von Formaten, welche in der Oberfläche angezeigt werden sollen.|false|

**Beispiel capabilitiesFilter:**

```json
"capabilitiesFilter": {
    "layouts": ["A4 Hochformat", "A3 Hochformat"],
    "outputFormats": ["PDF"]
}
```

***

##### Portalconfig.menu.sections.modules.routing
Routing-Werkzeug. Ermöglicht Nutzern das Planen von Routen zwischen mehreren Punkten mit verschiedenen Optionen. Zusätzlich gibt es noch die Funktion zur Erstellung einer Erreichbarkeitsanalyse. Beide Funktionen sind mit einer Stapelverarbeitung verfügbar, zur Abfrage mehrere Routen und Analysen. ❗ Das Werkzeug greift auf Den Routing Dienst des BKG zurück ❗.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|activeRoutingToolOption|nein|String|"DIRECTIONS"|Gibt an welches Tool geöffnet werden soll.|false|
|routingToolOptions|nein|String[]|[ ]|Gibt an welche Tools bereitgestellt werden soll. Möglich sind aktuell "DIRECTIONS" und "ISOCHRONES"|false|
|download|nein|**[download](#markdown-header-portalconfigmenusectionsmodulesroutingdownload)**||Downloadoptionen|false|
|geosearch|nein|**[geosearch](#markdown-header-portalconfigmenusectionsmodulesroutinggeosearch)**||Geosucheoptionen|false|
|geosearchReverse|nein|**[geosearchReverse](#markdown-header-portalconfigmenusectionsmodulesroutinggeosearchreverse)**||Geosuchereverseoptionen|false|
|directionsSettings|nein|**[directionsSettings](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettings)**||Routenplanungoptionen|false|
|isochronesSettings|nein|**[isochronesSettings](#markdown-header-portalconfigmenusectionsmodulesroutingisochronessettings)**||Erreichbarkeitsanalysenoptionen|false|

**Beispiel**

```json
{
    "type": "routing",
    "name": "common:modules.tools.routing",
    "icon": "bi-signpost-2-fill",
    "activeRoutingToolOption": "DIRECTONS",
    "routingToolOptions": ["DIRECTONS", "ISOCHRONES"],
    "download": {
        "filename": "",
        "format": "GEOJSON"
    },
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "BKG",
        "serviceId": "bkg_geosearch"
    },
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    },
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "styleRoute": {
            "fillColor": [255, 44, 0],
            "width": 6,
            "highlightColor": [255, 255, 255],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    },
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.download
Routing-Werkzeug Download Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fileName|nein|String|""|Default Dateiname für den Download.|false|
|format|nein|enum["GEOJSON","KML","GPX"]|"GEOJSON"|Welches Format default ausgewählt ist.|false|

**Beispiel**

```json
{
    "download": {
        "filename": "",
        "format": "GEOJSON"
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.geosearch
Routing-Werkzeug Geosuche Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|minChars|nein|Number|3|Minimum an Zeichen für die Anfrage bei dem externen Service.|false|
|limit|nein|Number|10|Maximale Anzahl an Zeichen für die Suche.|false|
|type|ja|enum["BKG","NOMINATIM","LOCATIONFINDER","KOMOOT","GAZETTEER","SPECIALWFS","ELASTIC"]|""|Welcher Typ für die Geosuche verwendet werden soll.|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|
|typeName|nein|String||Typname für die specialWfs Geosuchabfrage.|false|
|propertyNames|nein|String[]||Namen der Eigenschaften, die in die specialWfs Geosuche einbezogen werden sollen.|false|
|geometryNames|nein|String||Name des Geometriefelds für die specialWfs Geosuche.|false|
|bbox|nein|**[bbox](#markdown-header-portalconfigmenusectionsmodulesroutinggeosearchbbox)**||BBOX-Wert zugeordnet zu einem speedProfile. Koordinatensystem ist abhängig von dem verwendeten epsg-Parameter. Der verwendete geosearch Dienst muss bbox-Werte als String unterstützen.|false|
|epsg|nein|String|4326|Welcher EPSG-Code vom Service genutzt wird (z.B. 4326, 25832).|false|
|searchField|nein|String||Der Pfad zum Feld welches bei der Nutzung von Elastic Search gesucht werden soll.|false|
|sortField|nein|String||Der Pfad zum Feld welches bei der Nutzung von Elastic Search die Sortierung der Ergebnisse in aufsteigender Reihenfolge vorgibt.|false|

**Beispiel für BKG**

```json
{
    "geosearch": {
        "type": "BKG",
        "serviceId": "bkg_geosearch",
        "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
    }
}
```
**Beispiel für SPECIALWFS**

```json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "SPECIALWFS",
        "serviceId": "specialWfs_geosearch",
        "typeName": "ms:strasse_nr",
		"propertyNames": [
			"ms:LABEL_TEXT"
			],
		"geometryName": "ms:msGeometry"
    }
}
```
**Beispiel FÜR ELASTIC**

```json
{
    "geosearch": {
        "minChars": 3,
        "limit": 10,
        "type": "ELASTIC",
        "serviceId": "elastic_geosearch",
        "epsg": "25832",
        "searchField": "properties.searchField",
        "sortField": "properties.HAUSNUMMER"
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.geosearch.bbox
BBOX-Wert zugeordnet zu einem speedProfile. Koordinatensystem ist abhängig von dem verwendeten epsg-Parameter. Der verwendete geosearch Dienst muss bbox-Werte als String unterstützen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|speedProfile|nein|String||Koordinatenwerte "West,Süd,Ost,Nord"|false|

**Beispiel**

```json
{
    "bbox": {"CYCLING": "9.6,53.40,10.4,53.84"}
}
```

***

#### Portalconfig.menu.sections.modules.routing.geosearchReverse
Routing-Werkzeug Geosuche Reverse Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|distance|nein|Number|1000|Distanz zum Suchen in Meter für die Anfrage bei dem externen Service.|false|
|filter|nein|String||Zusätzliche Filter für die Suche werden an die Anfrage angehangen.|false|
|type|ja|enum["BKG","NOMINATIM","KOMOOT"]||Welcher Typ für die Geosuche verwendet werden soll.|false|
|serviceId|ja|String||Welcher Service für die Geosuche verwendet werden soll.|false|

**Beispiel**

```json
{
    "geosearchReverse": {
        "distance": 1000,
        "filter": "",
        "type": "BKG",
        "serviceId": "bkg_suggest"
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.directionsSettings
Routing-Werkzeug Routenplanung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|enum["ORS"]||Welche Art der externe Service zur Abfrage ist.|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|preference|nein|String|"RECOMMENDED"|Welche Art der Routenplanung verwendet werden soll.|false|
|customPreferences|nein|**[customPreferences](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingscustompreferences)**||Möglichkeit eigene Routenpräferenzen (zusätzlich zum BKG-Dienst) für die unterschiedlichen speedProfiles zu definieren (erfordert eigenes Backend)|false|
|customAvoidFeatures|nein|**[customAvoidFeatures](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingscustomavoidfeatures)**||Möglichkeit eigene Optionen für Verkehrswege meiden (zusätzlich zum BKG-Dienst) für die unterschiedlichen speedProfiles zu definieren (erfordert eigenes Backend)|false|
|styleRoute|nein|**[styleRoute](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingsstyleroute)**||Stylerouteoptionen|false|
|styleWaypoint|nein|**[styleWaypoint](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingsstylewaypoint)**||Stylewaypointoptionen|false|
|styleAvoidAreas|nein|**[styleAvoidAreas](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingsstyleavoidareas)**||Styleavoidareasoptionen|false|
|batchProcessing|nein|**[batchProcessing](#markdown-header-portalconfigmenusectionsmodulesroutingdirectionssettingsbatchprocessing)**||Batchprocessingoptionen|false|

**Beispiel**

```json
{
    "directionsSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "preference": "RECOMMENDED",
        "customPreferences": {
            "CYCLING": ["RECOMMENDED", "SHORTEST", "GREEN"]
        },
        "customAvoidFeatures": {
                "CYCLING": ["STEPS", "FERRIES", "UNPAVEDROADS"]
        },
        "styleRoute": {
            "fillColor": [255, 44, 0],
            "width": 6,
            "highlightColor": [255, 255, 255],
            "highlightWidth": 9,
            "partHighlightColor": [255, 255, 255],
            "partHighlightWidth": 3
        },
        "styleWaypoint": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "textFillColor": "#000",
            "textLineColor": "#fff",
            "textLineWidth": 3,
            "opacity": 0.3,
            "radius": 8
        },
        "styleAvoidAreas": {
            "lineColor": [0, 127, 255],
            "lineWidth": 2,
            "fillColor": [0, 127, 255],
            "opacity": 0.3,
            "pointRadius": 8,
            "pointLineWidth": 4
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***
#### Portalconfig.menu.sections.modules.routing.directionsSettings.customAvoidFeatures
Routing-Werkzeug Routenplanung Routen customAvoidFeatures.
Möglichkeit eigene Optionen für Verkehrswege meiden (zusätzlich zum BKG-Dienst) für speedProfiles zu definieren (erfordert eigenes Backend).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|speedProfile|nein|String[]||Welche Optionen für ´Verkehrswege meiden´ für das angegebene speedProfile verfügbar sein sollen.|false|

**Beispiel**

```json
{
    "customAvoidFeatures": {
       "CYCLING": ["STEPS", "FERRIES", "UNPAVEDROADS"],
       "CAR": ["HIGHWAYS"]
    }
}
```
***
#### Portalconfig.menu.sections.modules.routing.directionsSettings.customPreferences
Routing-Werkzeug Routenplanung Routen customPreferences.
Möglichkeit eigene Routenpräferenzen (zusätzlich zum BKG-Dienst) für speedProfiles zu definieren (erfordert eigenes Backend).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|speedProfile|nein|String[]||Welche Präferenzen für das angegebene speedProfile verfügbar sein sollen.|false|

**Beispiel**

```json
{
    "customPreferences": {
       "CYCLING": ["RECOMMENDED", "SHORTEST", "GREEN"],
       "CAR": ["RECOMMENDED", "SHORTEST", "GREEN"]
    }
}
```

***
#### Portalconfig.menu.sections.modules.routing.directionsSettings.styleRoute
Routing-Werkzeug Routenplanung Routen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fillColor|nein|Number[]|[255, 44, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|width|nein|Number|6|Wie breit die Route dargestellt werden soll.|false|
|highlightColor|nein|Number[]|[255, 255, 255]|Welche Farbe zum Highlighten verwendet werden soll.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll.|false|
|partHighlightColor|nein|Number[]|[255, 255, 255]|Welche Farbe zum highlighten verwendet werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|
|highlightWidth|nein|Number|9|Wie breit das Highlighting dargestellt werden soll, wenn nur ein Teil der Route gehighlightet wird.|false|

**Beispiel**

```json
{
    "styleRoute": {
        "fillColor": [255, 44, 0],
        "width": 6,
        "highlightColor": [255, 255, 255],
        "highlightWidth": 9,
        "partHighlightColor": [255, 255, 255],
        "partHighlightWidth": 3
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.directionsSettings.styleWaypoint
Routing-Werkzeug Routenplanung Wegpunkt Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|textFillColor|nein|String|"#000"|Welche Farbe für den Text verwendet werden soll.|false|
|textLineColor|nein|String|"#fff"|Welche Farbe für das Highlighten des Textes verwendet werden soll.|false|
|textLineWidth|nein|Number|3|Wie groß der Text dargestellt werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**

```json
{
    "styleWaypoint": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "textFillColor": "#000",
        "textLineColor": "#fff",
        "textLineWidth": 3,
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.directionsSettings.styleAvoidAreas
Routing-Werkzeug Routenplanung Sperrflächen Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Umranden verwendet werden soll.|false|
|lineWidth|nein|Number|2|Wie breit die Umrandung dargestellt werden soll.|false|
|fillColor|nein|Number[]|[0, 127, 255]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|pointRadius|nein|Number|8|Wie groß die Eckpunkte dargestellt werden sollen.|false|
|pointLineWidth|nein|Number|4|Wie groß die Umrandung der Eckpunkte dargestellt werden sollen.|false|

**Beispiel**

```json
{
    "styleAvoidAreas": {
        "lineColor": [0, 127, 255],
        "lineWidth": 2,
        "fillColor": [0, 127, 255],
        "opacity": 0.3,
        "pointRadius": 8,
        "pointLineWidth": 4
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.directionsSettings.batchProcessing
Routing-Werkzeug Routenplanung Stapelverarbeitung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|Ob die Stapelverarbeitung bereitgestellt werden soll.|false|
|active|nein|Boolean|false|Ob die Stapelverarbeitung aktiv sein soll.|false|
|limit|nein|Number|1000|Die maximale Anzahl an Zeilen in einer CSV die verarbeitet werden sollen/dürfen.|false|
|maximumConcurrentRequests|nein|Number|3|Die maximale Anzahl an Aufrufen die an externe Services parallel gemacht werden dürfen. Zu viele schränken die parallele Arbeit mit der Karte ein. Zu Wenige verlangsamt die Stapelverarbeitung. Maximal können in den Browsern 6 Requests gleichzeitig gemacht werden.|false|

**Beispiel**

```json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.isochronesSettings
Routing-Werkzeug Erreichbarkeitsanalysen Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|type|ja|enum["ORS"]||Welche Art der externe Service zur Abfrage ist.|false|
|serviceId|ja|String||Welcher Service für die Abfrage verwendet werden soll.|false|
|speedProfile|nein|String|"CAR"|Welches Geschwindigkeitsprofil verwendet werden soll.|false|
|isochronesMethodOption|nein|String|"TIME"|Welche Methode für den Abruf verwendet werden soll.|false|
|distanceValue|nein|Number|30|Welcher Distanzwert in km für den Slider verwendet werden soll.|false|
|minDistance|nein|Number|1|Welche minimale Distanz in km für den Slider verwendet werden soll.|false|
|maxDistance|nein|Number|400|Welche maximale Distanz in km für den Slider verwendet werden soll.|false|
|timeValue|nein|Number|30|Welcher Zeitwert in min für den Slider verwendet werden soll.|false|
|minTime|nein|Number|1|Welche minimale Zeit in min für den Slider verwendet werden soll.|false|
|maxTime|nein|Number|180|Welche maximale Zeit in min für den Slider verwendet werden soll.|false|
|intervalValue|nein|Number|15|Welcher Intervallwert in km/min für den Slider verwendet werden soll.|false|
|minInterval|nein|Number|1|Welches minimale Intervall in km/min für den Slider verwendet werden soll.|false|
|maxInterval|nein|Number|30|Welches maximale Intervall in km/min für den Slider verwendet werden soll.|false|
|styleCenter|nein|**[styleCenter](#markdown-header-portalconfigmenusectionsmodulesroutingisochronessettingsstylecenter)**||Stylecenteroptionen|false|
|styleIsochrones|nein|**[styleIsochrones](#markdown-header-portalconfigmenusectionsmodulesroutingisochronessettingsstyleisochrones)**||Styleisochronesoptionen|false|
|batchProcessing|nein|**[batchProcessing](#markdown-header-portalconfigmenusectionsmodulesroutingisochronessettingsbatchprocessing)**||Batchprocessingoptionen|false|

**Beispiel**

```json
{
    "isochronesSettings": {
        "type": "ORS",
        "serviceId": "bkg_ors",
        "speedProfile": "CAR",
        "isochronesMethodOption": "TIME",
        "distanceValue": 30,
        "minDistance": 1,
        "maxDistance": 400,
        "timeValue": 30,
        "minTime": 1,
        "maxTime": 180,
        "intervalValue": 15,
        "minInterval": 3,
        "maxInterval": 30,
        "styleCenter": {
            "lineColor": [255, 127, 0],
            "lineWidth": 4,
            "fillColor": [255, 127, 0],
            "opacity": 0.3,
            "radius": 8
        },
        "styleIsochrones": {
            "lineWidth": 2,
            "opacity": 0.65,
            "startColor": [66, 245, 78],
            "endColor": [245, 66, 66]
        },
        "batchProcessing": {
            "enabled": false,
            "active": false,
            "limit": 1000,
            "maximumConcurrentRequests": 3
        }
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.isochronesSettings.styleCenter
Routing-Werkzeug Erreichbarkeitsanalysen Center Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineColor|nein|Number[]|[255, 127, 0]|Welche Farbe für die Umrandung verwendet werden soll.|false|
|lineWidth|nein|Number|4|Wie breit die Umrandung des Punktes dargestellt werden soll.|false|
|fillColor|nein|Number[]|[255, 127, 0]|Welche Farbe zum Füllen verwendet werden soll.|false|
|opacity|nein|Number|0.3|Wie stark die Füllfarbe dargestellt werden soll.|false|
|radius|nein|Number|8|Wie groß der Wegpunkt dargestellt werden soll.|false|

**Beispiel**

```json
{
    "styleCenter": {
        "lineColor": [255, 127, 0],
        "lineWidth": 4,
        "fillColor": [255, 127, 0],
        "opacity": 0.3,
        "radius": 8
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.isochronesSettings.styleIsochrones
Routing-Werkzeug Erreichbarkeitsanalysen Isochrone Style Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|lineWidth|nein|Number|2|Wie breit die Umrandung der Polygone dargestellt werden soll.|false|
|opacity|nein|Number|0.65|Wie stark die Füllfarbe dargestellt werden soll.|false|
|startColor|nein|Number[]|[66, 245, 78]|Ab welcher Farbe zum Füllen interpoliert werden soll.|false|
|endColor|nein|Number[]|[245, 66, 66]|Bis zu welcher Farbe zum Füllen interpoliert werden soll.|false|

**Beispiel**

```json
{
    "styleIsochrones": {
        "lineWidth": 2,
        "opacity": 0.65,
        "startColor": [66, 245, 78],
        "endColor": [245, 66, 66]
    }
}
```

***

#### Portalconfig.menu.sections.modules.routing.isochronesSettings.batchProcessing
Routing-Werkzeug Erreichbarkeitsanalysen Stapelverarbeitung Optionen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|enabled|nein|Boolean|false|Ob die Stapelverarbeitung bereitgestellt werden soll.|false|
|active|nein|Boolean|false|Ob die Stapelverarbeitung aktiv sein soll.|false|
|limit|nein|Number|1000|Die maximale Anzahl an Zeilen in einer CSV die verarbeitet werden sollen/dürfen.|false|
|maximumConcurrentRequests|nein|Number|3|Die maximale Anzahl an Aufrufen die an externe Services parallel gemacht werden dürfen. Zu viele schränken die parallele Arbeit mit der Karte ein. Zu Wenige verlangsamt die Stapelverarbeitung. Maximal können in Browsern 6 Requests gleichzeitig gemacht werden.|false|

**Beispiel**

```json
{
    "batchProcessing": {
        "enabled": false,
        "active": false,
        "limit": 1000,
        "maximumConcurrentRequests": 3
    }
}
```

***

##### Portalconfig.menu.sections.modules.scaleSwitcher
Modul, mit dem der aktuelle Maßstab der Karte geändert werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-arrows-angle-contract"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.scaleSwitcher.name"|Name des Moduls im Menü.|false|
|type|nein|String|"scaleSwitcher"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-arrows-angle-contract",
    "name": "common:modules.scaleSwitcher.name",
    "type": "scaleSwitcher"
}
```

***

##### Portalconfig.menu.sections.modules.selectFeatures
Erlaub das auswählen von Vektor Features, indem der Nutzer auf der Karte eine Auswahlbox aufziehen kann. Features innerhalb dieser Auwahl werden mit GFI Informationen angezeigt und es ist möglich, auf ein Feature zu zoomen. Zur Nutzung werden vektorbasierte WFS(❗) Dienste benötigt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|highlightVectorRulesPointLine|nein|**[highlightVectorRulesPointLine](#markdown-header-portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespointline)**||Angabe der Linienfarbe und -breite für Linien Features und der Füllfarbe und Skalierung für Punkte. Sowie optional eine Zoomstufe.|false|
|highlightVectorRulesPolygon|nein|**[highlightVectorRulesPolygon](#markdown-header-portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespolygon)**||Angabe der Füllfarbe, Kantenfarbe und -breite für das Hervorheben von Polygon Features. Sowie optional eine Zoomstufe.|false|
|icon|nein|String|"bi-hand-index"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.selectFeatures.name"|Name des Moduls im Menü.|false|
|type|nein|String|"selectFeatures"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "type": "selectFeatures",
    "highlightVectorRulesPolygon": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 4,
            "color": [0, 0, 204, 0.9]
        },
        "zoomLevel": 5
    },
    "highlightVectorRulesPointLine": {
        "fill": {
            "color": [255, 0, 255, 0.9]
        },
        "stroke": {
            "width": 8,
            "color": [255, 0, 255, 0.9]
        },
        "image": {
            "scale": 2
        },
        "zoomLevel": 5
    }
}
```

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPointLine
Angabe der Linienfarbe und -breite für Linien Features und der Füllfarbe und Skalierung für Punkte. Sowie optional eine Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenutoolselectfeatureshighlightvectorrulespointlinefill)**||Mögliche Einstellung: color|false|
|image|nein|**[image](#markdown-header-portalconfigmenutoolselectfeatureshighlightvectorrulespointlineimage)**||Mögliche Einstellung: scale|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenutoolselectfeatureshighlightvectorrulespointlinestroke)**||Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Zoomstufe, mögliche Einstellung: 0-9|false|

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPointLine.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

**Beispiel**

```json
"fill": {
    "color": [215, 102, 41, 0.9]
}
```

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPointLine.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

**Beispiel**

```json
"stroke": {
    "width": 4 ,
    "color": [255, 0, 255, 0.9]
}
```

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPointLine.image
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|scale|nein|Integer|1.5|Mögliche Einstellung: scale|false|

**Beispiel**

```json
"image": {
    "scale": 2
    }
```

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPolygon
Angabe der Füllfarbe, Kantenfarbe und -breite für das Hervorheben von Polygon Features. Sowie optional eine Zoomstufe.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|fill|nein|**[fill](#markdown-header-portalconfigmenusectionsmodulesselectfeatureshighlightvectorrulespolygonfill)**||Mögliche Einstellung: color|false|
|stroke|nein|**[stroke](#markdown-header-portalconfigmenusectionsmoduleselectfeatureshighlightvectorrulespolygonstroke)**||Mögliche Einstellung: width|false|
|zoomLevel|nein|Integer|7|Zoomstufe, mögliche Einstellung: 0-9|false|

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPolygon.fill
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|

**Beispiel**

```json
"fill": {
    "color": [215, 102, 41, 0.9]
}
```

***

###### Portalconfig.menu.sections.modules.selectFeatures.highlightVectorRulesPolygon.stroke
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|color|nein|Float[]|[255, 255, 255, 0.5]|Mögliche Einstellung: color (RGBA)|false|
|width|nein|Integer|1|Mögliche Einstellung: width|false|

**Beispiel**

```json
"stroke": {
    "width": 4 ,
    "color": [255, 0, 255, 0.9]
}
```

***

##### Portalconfig.menu.sections.modules.shadow
Das ShadowTool bietet eine Oberfläche zur Definition einer Zeitangabe. Über Slider und Datepicker können Zeitangaben angegeben werden. Die ausgewählte Zeitangabe dient dem Rendern der Schatten aller 3D-Objekte im 3D-Modus, indem der Sonnenstand simuliert wird. Durch Ziehen des Sliders oder Auswahl eines neuen Datums wird unmittelbar ein neuer Sonnenstand simuliert. Per default startet das Tool mit der aktuellen Zeitangabe, die über Parameter überschrieben werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-lamp-fill"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|isShadowEnabled|nein|Boolean|false|Default Shadow-Wert. True um unmittelbar Shadow einzuschalten. False zum manuellen Bestätigen.|false|
|name|nein|String|"common:modules.shadow.name"|Name des Moduls im Menü.|false|
|shadowTime|nein|**[shadowTime](#markdown-header-portalconfigmenusectionsmodulesshadowshadowtime)**||Default-Zeitangabe, mit der das Shadowmodule startet. Erkennt "month", "day", "hour", "minute"|false|
|type|nein|String|"shadow"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "isShadowEnabled": true,
    "shadowTime": {
        "month": "6",
        "day": "20",
        "hour": "13",
        "minute": "0"
    },
    "type": "shadow"
}
```

***

###### Portalconfig.menu.sections.modules.shadow.shadowTime
|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|month|nein|String||Monat|false|
|day|nein|String||Tag|false|
|hour|nein|String||Stunde|false|
|minute|nein|String||Minute|false|

**Beispiel**

```json
{
    "month": "6",
    "day": "20",
    "hour": "13",
    "minute": "0"
}
```

***

##### Portalconfig.menu.sections.modules.shareView
Modul, um einen Link zur aktuellen Karten-Ansicht zu teilen. Es kann die aktuelle Ansicht als Link mit Url-Parametern, per QR-Code und als Facebook-Link geteilt werden. 

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-share"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.shareView.name"|Name des Moduls im Menü.|false|
|type|nein|String|"shareView"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-share",
    "name": "common:modules.shareView.name",
    "type": "shareView"
}
```

***

##### Portalconfig.menu.sections.modules.styleVT
Das Modul ermöglicht das Umschalten des Stylings von Vector Tile Layers(❗), sofern in der services.json mehrere Styles für die entsprechende Layer eingetragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|icon|nein|String|"bi-paint-bucket"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|name|nein|String|"common:modules.styleVT.name"|Name des Moduls im Menü.|false|
|type|nein|String|"styleVT"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|

**Beispiel**

```json
{
    "icon": "bi-paint-bucket",
    "name": "common:modules.styleVT.name",
    "type": "styleVT"
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch
Das Modul ermöglicht es einen WFS(❗) Layer abgekoppelt von der Suchleiste mittels Filter anzufragen und gegebenenfalls eine Ergebnisliste zu erstellen.
Wenn ein WFS@2.0.0 verwendet werden soll, wird erwartet, dass eine gespeicherte Anfrage (Stored Query) verwendet wird. Wenn ein WFS@1.1.0 verwendet werden soll, wird erwartet, dass der Aufbau der Anfrage mittels der Konfiguration dieses Werkzeugs grundlegend vorgegeben wird.

Es können mehrere Suchinstanzen (**[SearchInstances](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)**) definiert werden, welche durch jeweilige Dropdown-Menüs ausgewählt werden können.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|instances|ja|**[searchInstance](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)**[]||Array an `searchInstances`, welche jeweils eine Suchmaske darstellen.|false|
|zoomLevel|nein|Number|5|Gibt an, auf welche Zoomstufe (zoomLevel) gezoomt werden soll. Sollte das Feature nicht in die Zoomstufe passen, wird automatisch eine passende Zoomstufe gewählt.|false|
|resultsPerPage|nein|Number|0|In der Suchergebnisliste werden höchstens so viele Ergebnisse zugleich angezeigt. Wird diese Anzahl überschritten, bietet die Ergebnisliste eine nächste Ergebnisseite an. Beim Wert 0 werden alle Ergebisse auf einer Seite angezeigt.|false|
|multiSelect|nein|Boolean|false|Wenn `true`, können Nutzende durch Drücken von Strg oder Shift, oder über Checkboxen, mehrere Features der Ergebnisliste auswählen; beim Zoomen wird dann auf alle ausgewählten Features gezoomed.|false|

**Beispiel**

```json
{
    "wfsSearch": {
        "instances": [
            {
                "requestConfig": {
                    "layerId": "1234"
                },
                "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
                "literals": [
                    {
                        "clause": {
                            "type": "and",
                            "literals": [
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "gemarkung",
                                        "inputLabel": "Gemarkung",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Flur",
                                        "options": "flur"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance
Eine Instanz der WFS Suche, welche durch ein Dropdown Menü im Werkzeug ausgewählt werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|requestConfig|ja|**[requestConfig](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfig)**||Ein Objekt, welches hauptsächlich die Id des WFS-Dienstes (`layerId` oder `restLayerId`), welcher angefragt werden soll, beinhaltet. Wenn ein WFS@2.0.0 verwendet werden soll, muss die id der gespeicherten Anfrage (Stored Query, `storedQueryId`), also der im Dienst enthaltenen Anfrage, angegeben werden. Zudem können weitere Einstellungen hinsichtlich der Anfragen hier hinzugefügt werden.|false|
|selectSource|nein|String||Optionale Url, unter welcher eine JSON-Datei mit den verschiedenen Optionen für den Input gespeichert ist. Für eine Beispiel siehe **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]**.|false|
|suggestions|nein|**[suggestions](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancesuggestions)**||Wenn gegeben, dann wird der Service angefragt, wenn Nutzende etwas in ein Eingabefeld eingeben, um einen Vorschlag für die weitere Eingabe zu machen.|false|
|title|ja|String||Der Titel der Suche, welcher in einem Dropdown im Werkzeug dargestellt wird. Kann ein Übersetzungsschlüssel sein.|false|
|userHelp|nein|String||Informationstext hinsichtlich des Suchformulars, welches oberhalb des Formulars für die Nutzenden angezeigt werden soll. Wenn der Parameter nicht gegeben ist, dann wird die Struktur aus der Konfiguration abgeleitet. Kann ein Übersetzungsschlüssel sein. Falls der Wert explizit auf `hide` gesetzt wurde, dann wird keine Beschreibung der Struktur des Formulars angezeigt.|false|
|resultDialogTitle|nein|String||Überschrift der Ergebnisliste. Wenn dies nicht konfiguriert ist, wird der Name `WFS Suche` angezeigt. Kann ein Übersetzungsschlüssel sein.|false|
|resultList|nein|**[resultList](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceresultlist)**||Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste. Wenn keine resultList konfiguriert ist, wird beim Ausführen der Suche direkt auf das erste gefundene Feature gezoomt.|true|

**Beispiel**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Flurstücksuche",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "Gemarkung",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Flur",
                            "options": "flur"
                        }
                    }
                ]
            }
        }
    ]
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal
Ein Literal (`literal`) kann entweder eine Klausel (`clause`) als Parameter besitzen oder ein Feld (`field`). Falls beide gesetzt sind, dann wird der `clause`-Teil ignoriert.
Zu beachten ist jedoch, dass ein Feld innerhalb einer Klausel verpackt sein muss (wie in den meisten Beispielen zu sehen).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clause|ja|**[clause](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralclause)**||Definiert die Art und Weise wie mehrere `literals` miteinander angefragt werden sollen. Kann als Gruppe von `literals` angesehen werden.|true|
|field|nein|**[field](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfield)**||Repräsentation eines Auswahlfeldes für einen Servicewert für den Nutzer.|true|

**Beispiele**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "id": "0",
                "displayName": "Elbe"
            },
            {
                "id": "1",
                "displayName": "Moselle"
            },
            {
                "id": "2",
                "displayName": "Rhine"
            }
        ]
    }
}
```

***


##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.clause
Eine Klausel (`clause`) definiert die Art und Weise wie verschiedene `literals` miteinander anzufragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|type|ja|enum["and", "or"]||Die Art und Weise wie die `literals` dieser `clause` angefragt werden sollen.|false|

**Beispiel**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.field
Ein `field` repräsentiert ein Auswahlfeld für einen Wert des Services.
Es ist möglich ein Feld für mehrere Suchparameter des Dienstes zu verwenden. Um dies zu ermöglichen, muss für jeden Parameter ein Array verwendet werden, wobei jedes Element zu einem einzelnen Wert des Dienstes gehört.
Eine Konfiguration wie

```json
{
    "field": {
        "queryType": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Flurstück", "Gemarkungsnummer"]
    }
}
```

würde ein einzelnes `field` erstellen, in welchen die Nutzenden sich entscheiden können, ob sie das Eingabefeld nutzen möchten, um nach einem `Flurstück` oder nach einer `Gemarkungsnummer` zu suchen, indem sie den Wert in einem Dropdown Menü auswählen.

Falls der Parameter `options` gesetzt wurde, wird ein `select`-Feld, andernfalls ein normaler Text Input verwendet.
Falls `options` ein String ist, ist es wichtig, dass die Reihenfolge der Felder mit der Ordnung der Objekte der externen Quelle (`selectSource`) übereinstimmt.
Man nehme an, dass die Quelle wie folgt aussieht:

```json
{
    "one": {
        "foo": {
            "id": "foo_one",
            "bar": ["f1_bar_one", "f1_bar_two"]
        }
    },
    "two": {
        "foo": {
            "id": "foo_two",
            "bar": ["f2_bar_one", "f2_bar_two"]
        }
    }
}
```

In diesem Fall sollte die Reihenfolge in der Konfiguration wie folgt aussehen:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objekte",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "foo",
                    "inputLabel": "Foo",
                    "options": "foo"
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "bar",
                    "inputLabel": "Bar",
                    "options": "foo.bar"
                }
            }
        ]
    }
}
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultValue|nein|String/String[]||Wenn das Feld nicht `required` ist, wird dieser Wert beim Senden verwendet.|false|
|fieldName|ja|String/String[]||Die Id des WFS Service Parameters für den Vergleich.|false|
|inputLabel|ja|String/String[]||Label des UI Elementes. Kann ein Übersetzungsschlüssel sein.|false|
|inputPlaceholder|nein|String/String[]||Platzhalter für das UI Element. Sollte Beispieldaten enthalten. Kann ein Übersetzungsschlüssel sein.|false|
|inputTitle|nein|String/String[]||Wert, welcher beim Hovern über das UI Element angezeigt wird. Kann ein Übersetzungsschlüssel sein.|false|
|required|nein|Boolean/Boolean[]|false|Legt fest, ob das Feld ausgefüllt werden muss.|false|
|options|nein|String/**[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[]/String[]||Falls `options` ein Array (egal ob es Strings oder **[options](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**) sind, werden die gegebenen Werte für die Auswahl verwendet. Diese Optionen können entweder eine **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)** oder einfache Werte (`String` / `Number`) sein. Im zweiten Fall werden die einfachen Werte sowohl für die Id als auch für den `displayName` verwendet.  <br /> Falls `options` ein String ist, existieren verschiedene Möglichkeiten: <ul><li>Falls der String leer ist, werden die Schlüssel der **[selectSource](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)** verwendet.</li><li>Falls der String nicht leer ist, wird angenommen, dass ein anderes Feld mit `options=""` existiert; andernfalls wird das Feld deaktiviert. Es wird zudem angenommen, dass der String ein Array in **[selectSource](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)** mit weiteren Optionen repräsentiert.</li></ul> **Zu beachten**: Der Parameter `options` kann auch als multidimensionales Array **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[][] angegeben werden, welches allerdings nicht für Masterportal Admins parametrisiert werden kann. Dies findet Anwendung, wenn ein **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[] verwendet werden soll, jedoch mehrere Parameter in einem `field` hinterlegt werden sollen.|true|
|queryType|nein|enum["equal", "like"]/enum["equal", "like"][]||Wird für die Verwendung mit einem WFS@1.1.0 vorausgesetzt. Der `queryType` legt fest, wie das Feld mit dem Wert des Dienstes verglichen werden soll.|false|
|usesId|nein|Boolean/Boolean[]|false|Nur relevant, wenn der Parameter `options` gesetzt und ein leerer String (Rootelement) ist. Legt fest, ob der Schlüssel des Objektes aus der externen Quelle als Wert für die Query verwendet werden soll oder ob das Objekt eine Id gesetzt hat, welche stattdessen Anwendung finden soll.|false|

**Beispiel**

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Mosel",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhein",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.field.option
Eine auswählbare Option für einen anzufragenden Parameter.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|displayName|nein|String||Anzuzeigender Wert für die Option. Kann ein Übersetzungsschlüssel sein. Wenn der Wert nicht gesetzt ist, wird die `id` angezeigt.|false|
|fieldValue|ja|String||Wert, welcher an den Dienst gesendet werden soll.|false|

**Beispiel**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.resultList
Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste.
Mit der Angabe von `showAll` werden alle Attribute der gefundenen Feature in ihrer Ursprungsform dargestellt.
Bei Verwendung eines Objektes können die darzustellenden Attribute festgelegt werden.
Ein Schlüssel des Objektes muss eines der Attribute des Features wiedergeben, während durch den entsprechenden Wert die textliche Ausgabe dieses Attributes festgelegt wird.

**Beispiele**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig
Informationen über den WFS-Dienst, welcher angefragt werden soll.
Es muss entweder `layerId` oder `restLayerId` definiert sein. Wenn `layerId` verwendet wird, dann muss zusätzlich der Layer in der **[config.json](config.json.de.md)** konfiguriert werden.
Falls beide Parameter gesetzt wurden, dann wird `restLayerId` verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfiggazetteer)**||Legt fest, ob der verwendete WFS-Dienst ein WFS-G ist, welcher anders geparsed werden muss.|false|
|layerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[services.json](services.json.de.md)** bezogen.|false|
|likeFilter|nein|**[likeFilter](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|Die Konfiguration des Services hinsichtlich des like Filters.|true|
|maxFeatures|nein|Number/String|8|Maximale Anzahl an Features, welche der Dienst zurückgeben soll. Alternativ kann auch der String `showAll` übergeben werden, um alle Ergebnisse anzuzeigen.|false|
|restLayerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[rest-services.json](rest-services.json.de.md)** bezogen.|false|
|storedQueryId|nein|String||Die Id der gespeicherten Anfrage (Stored Query) des WFS Dienstes, welche für die Anfrage verwendet werden soll. Es wird angenommen, dass ein WFS@2.0.0 verwendet wird, falls dieses Feld gesetzt wurde.|false|

**Beispiel**

```json
{
    "requestConfig": {
        "restLayerId": "1234",
        "storedQueryId": "Flurstuecke"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig.likeFilter
Innerhalb eines Filters für einen WFS-Dienst können Werte mit einem `equal` oder einem `like` verglichen werden.
Wenn der Vergleich mit einem `like` durchgeführt werden soll, dann werden weitere Eigenschaften benötigt. Diese können sowohl im Wert, als auch in der Eigenschaftsdefinition variieren.
Es wird für die Dokumentation angenommen, dass die Eigenschaften `wildCard`, `singleChar` und `escapeChar` heißen; Variationen wie `single` und `escape` sind jedoch auch möglich und müssen dem Dienst entsprechend für den Filter angegeben werden. Die Schlüssel-Wert-Paare des hier übergebenen Objekts werden immer wie angegeben in den Request übertragen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|wildCard|ja|String|"*"|Der Wildcardwert für den like Filter.|true|
|singleChar|ja|String|"#"|Der Wert für einen einzelnen Charakter für den like Filter.|true|
|escapeChar|ja|String|"!"|Der Escape-Wert für den like Filter.|true|

**Beispiel**

In diesem Beispiel weicht der Key für `escapeChar` ab.

```json
{
    "wildCard": "*",
    "singleChar": "#",
    "escape": "!"
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig.gazetteer
Parameter, welche exklusiv für die Verwendung eines WFS-G (Gazetteer) benötigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|namespaces|ja|String/String[]||Die Namespaces des Dienstes.|false|
|memberSuffix|ja|enum["member","featureMember"]||Der Suffix des Featuretypen.|false|

**Beispiel**

```json
{
    "gazetteer": {
        "namespaces": [
            "http://www.adv-online.de/namespaces/adv/dog",
            "http://geodienste.hamburg.de/dog_gages/services/wfs_dog?SERVICE=WFS&VERSION=2.0.0&REQUEST=DescribeFeatureType&OUTPUTFORMAT=application/gml+xml;+version=3.2&TYPENAME=dog:Flurstueckskoordinaten&NAMESPACES=xmlns(dog,http://www.adv-online.de/namespaces/adv/dog)"
        ],
        "memberSuffix": "memberSuffix"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.suggestions
Konfiguration für die Vorschläge von Nutzereingaben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|featureType|nein|String||Wenn gegeben, wird die Anfrage mit diesem featureType statt dem aus der Definition des Services ausgeführt. Nur verwendbar, wenn der Dienst in der **[services.json](services.json.de.md)** definiert wurde.|false|
|length|nein|Number|3|Die Anfrage wird dann ausgelöst, wenn die Inputlänge mindestens so lang ist wie der Wert dieses Parameters.|false|

**Beispiel**

```json
{
    "wfsSearch": {
        "instances": [
            {
                "requestConfig": {
                    "layerId": "1234"
                },
                "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
                "literals": [
                    {
                        "clause": {
                            "type": "and",
                            "literals": [
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "gemarkung",
                                        "inputLabel": "Gemarkung",
                                        "options": ""
                                    }
                                },
                                {
                                    "field": {
                                        "queryType": "equal",
                                        "fieldName": "flur",
                                        "inputLabel": "Flur",
                                        "options": "flur"
                                    }
                                }
                            ]
                        }
                    }
                ]
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance
Eine Instanz der WFS Suche, welche durch ein Dropdown Menü im Werkzeug ausgewählt werden kann.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|requestConfig|ja|**[requestConfig](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfig)**||Ein Objekt, welches hauptsächlich die Id des WFS-Dienstes (`layerId` oder `restLayerId`), welcher angefragt werden soll, beinhaltet. Wenn ein WFS@2.0.0 verwendet werden soll, muss die id der gespeicherten Anfrage (Stored Query, `storedQueryId`), also der im Dienst enthaltenen Anfrage, angegeben werden. Zudem können weitere Einstellungen hinsichtlich der Anfragen hier hinzugefügt werden.|false|
|selectSource|nein|String||Optionale Url, unter welcher eine JSON-Datei mit den verschiedenen Optionen für den Input gespeichert ist. Für eine Beispiel siehe **[https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json]**.|false|
|suggestions|nein|**[suggestions](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancesuggestions)**||Wenn gegeben, dann wird der Service angefragt, wenn Nutzende etwas in ein Eingabefeld eingeben, um einen Vorschlag für die weitere Eingabe zu geben.|false|
|title|ja|String||Der Titel der Suche, welcher in einem Dropdown im Werkzeug dargestellt wird. Kann ein Übersetzungsschlüssel sein.|false|
|userHelp|nein|String||Informationstext hinsichtlich des Suchformulars, welches oberhalb des Formulars für Nuteznden angezeigt werden soll. Wenn der Parameter nicht gegeben ist, dann wird die Struktur aus der Konfiguration abgeleitet. Kann ein Übersetzungsschlüssel sein. Falls der Wert explizit auf `hide` gesetzt wurde, dann wird keine Beschreibung der Struktur des Formulars angezeigt.|false|
|resultDialogTitle|nein|String||Überschrift der Ergebnisliste. Wenn dies nicht konfiguriert ist, wird der Name `WFS Suche` angezeigt. Kann ein Übersetzungsschlüssel sein.|false|
|resultList|nein|**[resultList](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceresultlist)**||Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste. Wenn keine resultList konfiguriert ist, wird beim Ausführen der Suche direkt auf das erste gefundene Feature gezoomt.|true|

**Beispiel**

```json
{
    "requestConfig": {
        "layerId": "1234"
    },
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    },
    "selectSource": "https://geoportal-hamburg.de/lgv-config/gemarkungen_hh.json",
    "title": "Flurstücksuche",
    "literals": [
        {
            "clause": {
                "type": "and",
                "literals": [
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "gemarkung",
                            "inputLabel": "Gemarkung",
                            "options": ""
                        }
                    },
                    {
                        "field": {
                            "queryType": "equal",
                            "fieldName": "flur",
                            "inputLabel": "Flur",
                            "options": "flur"
                        }
                    }
                ]
            }
        }
    ]
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal
Ein Literal (`literal`) kann entweder eine Klausel (`clause`) als Parameter besitzen oder ein Feld (`field`). Falls beide gesetzt sind, dann wird der `clause`-Teil ignoriert.
Zu beachten ist jedoch, dass ein Feld innerhalb einer Klausel verpackt sein muss (wie in den meisten Beispielen zu sehen).

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|clause|ja|**[clause](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralclause)**||Definiert die Art und Weise wie mehrere `literals` miteinander angefragt werden sollen. Kann als Gruppe von `literals` angesehen werden.|true|
|field|nein|**[field](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfield)**||Repräsentation eines Auswahlfeldes für einen Servicewert für den Nutzer.|true|

**Beispiele**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "id": "0",
                "displayName": "Elbe"
            },
            {
                "id": "1",
                "displayName": "Moselle"
            },
            {
                "id": "2",
                "displayName": "Rhine"
            }
        ]
    }
}
```

***


##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.clause
Eine Klausel (`clause`) definiert die Art und Weise wie verschiedene `literals` miteinander anzufragen sind.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|literals|ja|**[literal](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteral)**[]||Array an `literals`.|true|
|type|ja|enum["and", "or"]||Die Art und Weise wie die `literals` dieser `clause` angefragt werden sollen.|false|

**Beispiel**

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "gemarkung",
                    "inputLabel": "Gemarkung",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "flur",
                    "inputLabel": "Flur",
                    "options": "flur"
                }
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.field
Ein `field` repräsentiert ein Auswahlfeld für einen Wert des Services.
Es ist möglich ein Feld für mehrere Suchparameter des Dienstes zu verwenden. Um dies zu ermöglichen, muss für jeden Parameter ein Array verwendet werden, wobei jedes Element zu einem einzelnen Wert des Dienstes gehört.
Eine Konfiguration wie

```json
{
    "field": {
        "queryType": ["equal", "like"],
        "fieldName": ["flst", "gmkr"],
        "inputLabel": ["Flurstück", "Gemarkungsnummer"]
    }
}
```

würde ein einzelnes `field` erstellen, in welchen die Nutzenden sich entscheiden können, ob sie das Eingabefeld nutzen möchten, um nach einem `Flurstück` oder nach einer `Gemarkungsnummer` zu suchen, indem sie den Wert in einem Dropdown Menü auswählen.

Falls der Parameter `options` gesetzt wurde, wird ein `select`-Feld, andernfalls ein normaler Text Input verwendet.
Falls `options` ein String ist, ist es wichtig, dass die Reihenfolge der Felder mit der Ordnung der Objekte der externen Quelle (`selectSource`) übereinstimmt.
Man nehme an, dass die Quelle wie folgt aussieht:

```json
{
    "one": {
        "foo": {
            "id": "foo_one",
            "bar": ["f1_bar_one", "f1_bar_two"]
        }
    },
    "two": {
        "foo": {
            "id": "foo_two",
            "bar": ["f2_bar_one", "f2_bar_two"]
        }
    }
}
```

In diesem Fall sollte die Reihenfolge in der Konfiguration wie folgt aussehen:

```json
{
    "clause": {
        "type": "and",
        "literals": [
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "objects",
                    "inputLabel": "Objekte",
                    "options": ""
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "foo",
                    "inputLabel": "Foo",
                    "options": "foo"
                }
            },
            {
                "field": {
                    "queryType": "equal",
                    "fieldName": "bar",
                    "inputLabel": "Bar",
                    "options": "foo.bar"
                }
            }
        ]
    }
}
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultValue|nein|String/String[]||Wenn das Feld nicht `required` ist, wird dieser Wert beim Senden verwendet.|false|
|fieldName|ja|String/String[]||Die Id des WFS Service Parameters für den Vergleich.|false|
|inputLabel|ja|String/String[]||Label des UI Elementes. Kann ein Übersetzungsschlüssel sein.|false|
|inputPlaceholder|nein|String/String[]||Platzhalter für das UI Element. Sollte Beispieldaten enthalten. Kann ein Übersetzungsschlüssel sein.|false|
|inputTitle|nein|String/String[]||Wert, welcher beim Hovern über das UI Element angezeigt wird. Kann ein Übersetzungsschlüssel sein.|false|
|required|nein|Boolean/Boolean[]|false|Legt fest, ob das Feld ausgefüllt werden muss.|false|
|options|nein|String/**[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[]/String[]||Falls `options` ein Array (egal ob an Strings oder **[options](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**) ist, werden die gegebenen Werte für die Auswahl verwendet. Diese Optionen können entweder eine **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)** oder einfache Werte (`String` / `Number`) sein. Im zweiten Fall werden die einfachen Werte sowohl für die Id als auch den `displayName` verwendet.  <br /> Falls `options` ein String ist, existieren verschiedene Möglichkeiten: <ul><li>Falls der String leer ist, werden die Schlüssel der **[selectSource](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)** verwendet.</li><li>Falls der String nicht leer ist, wird angenommen, dass ein anderes Feld mit `options=""` existiert; andernfalls wird das Feld deaktiviert. Es wird zudem angenommen, dass der String ein Array in **[selectSource](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstance)** mit weiteren Optionen repräsentiert.</li></ul> **Zu beachten**: Der Parameter `options` kann auch als multidimensionales Array **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[][] angegeben werden, welches allerdings nicht für Masterportal Admins parametrisiert werden kann. Dies findet Anwendung, wenn ein **[option](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstanceliteralfieldoption)**[] verwendet werden soll, jedoch mehrere Parameter in einem `field` hinterlegt werden sollen.|true|
|queryType|nein|enum["equal", "like"]/enum["equal", "like"][]||Wird für die Verwendung mit einem WFS@1.1.0 vorausgesetzt. Der `queryType` legt fest, wie das Feld mit dem Wert des Dienstes verglichen werden soll.|false|
|usesId|nein|Boolean/Boolean[]|false|Nur relevant, wenn der Parameter `options` gesetzt und ein leerer String (Rootelement) ist. Legt fest, ob der Schlüssel des Objektes aus der externen Quelle als Wert für die Query verwendet werden soll oder ob das Objekt eine Id gesetzt hat, welche stattdessen Anwendung finden soll.|false|

**Beispiel**

```json
{
    "field": {
        "queryType": "equal",
        "fieldName": "rivers",
        "inputLabel": "Flüsse",
        "options": [
            {
                "displayName": "Elbe",
                "fieldValue": "0"
            },
            {
                "displayName": "Mosel",
                "fieldValue": "1"
            },
            {
                "displayName": "Rhein",
                "fieldValue": "2"
            }
        ]
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.literal.field.option
Eine auswählbare Option für einen anzufragenden Parameter.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|displayName|nein|String||Anzuzeigender Wert für die Option. Kann ein Übersetzungsschlüssel sein. Wenn der Wert nicht gesetzt ist, wird die `id` angezeigt.|false|
|fieldValue|ja|String||Wert, welcher an den Dienst gesendet werden soll.|false|

**Beispiel**

```json
{
    "fieldValue": "elbe",
    "displayName": "Elbe"
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.resultList
Einstellungen für die Ausgabe der gefundenen Features in der Ergebnisliste.
Mit der Angabe von `showAll` werden alle Attribute der gefundenen Feature in ihrer Ursprungsform dargestellt.
Bei Verwendung eines Objektes können die darzustellenden Attribute festgelegt werden.
Ein Schlüssel des Objektes muss eines der Attribute des Features wiedergeben, während durch den entsprechenden Wert die textliche Ausgabe dieses Attributes festgelegt wird.

**Beispiele**:

```json
{
    "resultList": "showAll"
}
```

```json
{
    "resultList": {
        "schulname": "Schulname",
        "abschluss": "Abschluss"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig
Informationen über den WFS-Dienst, welcher angefragt werden soll.
Es muss entweder `layerId` oder `restLayerId` definiert sein. Wenn `layerId` verwendet wird, dann muss zusätzlich der Layer in der **[config.json](config.json.de.md)** konfiguriert werden.
Falls beide Parameter gesetzt wurden, dann wird `restLayerId` verwendet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|gazetteer|nein|**[gazetteer](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfiggazetteer)**||Legt fest, ob der verwendete WFS-Dienst ein WFS-G ist, welcher anders geparsed werden muss.|false|
|layerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[services.json](services.json.de.md)** bezogen.|false|
|likeFilter|nein|**[likeFilter](#markdown-header-portalconfigmenusectionsmoduleswfssearchsearchinstancerequestconfiglikefilter)**|{"wildCard": "*", "singleChar": "#", "escape": "!"}|Die Konfiguration des Services hinsichtlich des like Filters.|true|
|maxFeatures|nein|Number/String|8|Maximale Anzahl an Features, welche der Dienst zurückgeben soll. Alternativ kann auch der String `showAll` übergeben werden, um alle Ergebnisse anzuzeigen.|false|
|restLayerId|nein|String||Id des WFS Dienstes, welcher angefragt werden soll. Informationen werden aus der **[rest-services.json](rest-services.json.de.md)** bezogen.|false|
|storedQueryId|nein|String||Die Id der gespeicherten Anfrage (Stored Query) des WFS Dienstes, welche für die Anfrage verwendet werden soll. Es wird angenommen, dass ein WFS@2.0.0 verwendet wird, falls dieses Feld gesetzt wurde.|false|

**Beispiel**

```json
{
    "requestConfig": {
        "restLayerId": "1234",
        "storedQueryId": "Flurstuecke"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig.likeFilter
Innerhalb eines Filters für einen WFS-Dienst können Werte mit einem `equal` oder einem `like` verglichen werden.
Wenn der Vergleich mit einem `like` durchgeführt werden soll, dann werden weitere Eigenschaften benötigt. Diese können sowohl im Wert, als auch in der Eigenschaftsdefinition variieren.
Es wird für die Dokumentation angenommen, dass die Eigenschaften `wildCard`, `singleChar` und `escapeChar` heißen; Variationen wie `single` und `escape` sind jedoch auch möglich und müssen dem Dienst entsprechend für den Filter angegeben werden. Die Schlüssel-Wert-Paare des hier übergebenen Objekts werden immer wie angegeben in den Request übertragen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|wildCard|ja|String|"*"|Der Wildcardwert für den like Filter.|true|
|singleChar|ja|String|"#"|Der Wert für einen einzelnen Charakter für den like Filter.|true|
|escapeChar|ja|String|"!"|Der Escape-Wert für den like Filter.|true|

**Beispiel**

In diesem Beispiel weicht der Key für `escapeChar` ab.

```json
{
    "wildCard": "*",
    "singleChar": "#",
    "escape": "!"
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.requestConfig.gazetteer
Parameter, welche exklusiv für die Verwendung eines WFS-G (Gazetteer) benötigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|namespaces|ja|String/String[]||Die Namespaces des Dienstes.|false|
|memberSuffix|ja|enum["member","featureMember"]||Der Suffix des Featuretypen.|false|

**Beispiel**

```json
{
    "gazetteer": {
        "namespaces": [
            "http://www.adv-online.de/namespaces/adv/dog",
            "http://geodienste.hamburg.de/dog_gages/services/wfs_dog?SERVICE=WFS&VERSION=2.0.0&REQUEST=DescribeFeatureType&OUTPUTFORMAT=application/gml+xml;+version=3.2&TYPENAME=dog:Flurstueckskoordinaten&NAMESPACES=xmlns(dog,http://www.adv-online.de/namespaces/adv/dog)"
        ],
        "memberSuffix": "memberSuffix"
    }
}
```

***

##### Portalconfig.menu.sections.modules.wfsSearch.searchInstance.suggestions
Konfiguration für die Vorschläge von Nutzereingaben.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|featureType|nein|String||Wenn gegeben, wird die Anfrage mit diesem featureType statt dem aus der Definition des Services ausgeführt. Nur verwendbar, wenn der Dienst in der **[services.json](services.json.de.md)** definiert wurde.|false|
|length|nein|Number|3|Die Anfrage wird dann ausgelöst, wenn die Inputlänge mindestens so lang ist wie der Wert dieses Parameters.|false|

***

##### Portalconfig.menu.sections.modules.wfst
WFS-T Modul zur Visualisierung (*getFeature*), Erstellung (*insert*), Veränderung (*update*) und zum Löschen (*delete*) von Features eines bestehenden Web Feature Service (*WFS*), welcher Transaktionen entgegennehmen kann.
Zur Nutzung dieses Moduls muss ein WFS-T Layer mit der Version 1.1.0 bereitgestellt werden. Bitte beachten Sie **[services.json](services.json.md)** für weitere Konfigurationsinformationen.

Beim Bearbeiten eines Features / Hinzufügen von Attributen zu einem neuen Feature werden bestimmte Werte in der Nutzeroberfläche angezeigt. Die Werte und auch dessen Label stehen im direkten Zusammenhang mit den `gfiAttributes` des Dienstes. Bitte beachten Sie **[services.json](services.json.md)** für weitere Informationen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|delete|nein|[TransactionConfig](#markdown-header-portalconfigmenusectionsmoduleswfstransactiontransactionconfig)/Boolean|false|Legt fest, welche der zu `layerIds` zugehörigen Layer das Löschen von Geometrien erlauben.|false|
|icon|nein|String|"bi-globe"|Icon das im Menü vor dem Modulnamen angezeigt wird. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**|false|
|layerIds|ja|String[]||Array an Ids von in **[services.json](services.json.md)** definierten Layern.|false|
|layerSelectLabel|nein|String|"common:modules.wfst.layerSelectLabel"|Falls gegeben, wird der Wert als Label für die Layerauswahl-Select-Box verwendet. Kann ein Sprachschlüssel sein.|false|
|lineButton|nein|[TransactionConfig](#markdown-header-portalconfigmenutoolwfsttransactiontransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Linien erlauben.|false|
|name|nein|String|"common:modules.wfst.name"|Name des Moduls im Menü.|false|
|pointButton|nein|[TransactionConfig](#markdown-header-portalconfigmenutoolwfsttransactiontransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Punkten erlauben.|false|
|polygonButton|nein|[TransactionConfig](#markdown-header-portalconfigmenutoolwfsttransactiontransactionconfig)[]/Boolean|[]|Legt fest, welche der zu `layerIds` zugehörigen Layer das Hinzufügen von Polygonen erlauben.|false|
|showConfirmModal|nein|Boolean|false|Kennzeichen, ob ein modaler Dialog angezeigt werden soll.|false|
|toggleLayer|nein|Boolean|false|Legt fest, ob die Feature des ausgewählten Layers weiterhin angezeigt werden sollen, wenn neue Feature hinzugefügt werden.|false|
|type|nein|String|"wfst"|Der type des Moduls. Definiert welches Modul konfiguriert ist.|false|
|update|nein|[TransactionConfig](#markdown-header-portalconfigmenutoolwfsttransactiontransactionconfig)/Boolean|false|Legt fest, welche der zu `layerIds` zugehörigen Layer das Bearbeiten von Geometrien erlauben.|false|

**Beispiel**

```json
{
    "type": "wfst",
    "name": "common:modules.wfst.name",
    "icon": "bi-globe",
    "layerIds": ["1234", "5678", "4389"],
    "toggleLayer": true,
    "pointButton": [
        {
            "layerId":"1234",
            "caption": "Point test",
            "show": true
        },
        {
            "layerId": "5678",
            "show": true,
            "multi": true
        }
    ],
    "lineButton": false,
    "polygonButton": [
        {
            "layerId": "4389",
            "show": false
        }
    ],
    "update": [
        {
            "layerId": "4389",
            "show": true
        }
    ]
}
```
***
###### Portalconfig.menu.sections.modules.wfst.TransactionConfig
Konfiguration der verschiedenen Transaktionsmethoden für den entsprechenden Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|available|ja|Boolean|true|Legt fest, ob der entsprechende Button der Transaktionsmethode für den Layer mit der gegebenen Id nutzbar sein soll.|false|
|icon|nein|String||Bootstrap Icon zur Anzeige innerhalb des Knopfes der Transaktionsmethode. Falls kein Wert angegeben wird, wird der Standardwert der Transaktionsmethode verwendet. Zur Auswahl siehe **[Bootstrap Icons](https://icons.getbootstrap.com/)**.|false|
|layerId|ja|String||Id des Layers, für den die Transaktionsmethode konfiguriert wird.|false|
|multi|nein|Boolean|false|Legt fest, ob es sich bei den gezeichneten Geometrien um Multi-X-Geometrien handeln sollte. Bei Konfiguration für die Methoden `update` und `delete` hat der Parameter keine Auswirkung.|false|
|text|nein|String|"common:modules.wfst.interactionSelect.*"|Text des Knopfes der Transaktionsmethode. Falls kein Wert vorhanden ist, wird für `*` ein Standardwert der Transaktionsmethode verwendet. Kann ein Übersetzungsschlüssel sein.|false|

**Examples**

```json
{
    "layerId": "1234",
    "available": true,
    "text": "Point test"
}
```

```json
{
    "layerId": "5678",
    "available": true
}
```

```json
{
    "layerId": "5489",
    "multi": true
}
```
***

#### Portalconfig.menu.title
Im Menü kann der Portalname und ein Bild angezeigt werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|link|nein|String||URL der externen Seite, auf die verlinkt wird.|false|
|logo|nein|String||URL zur externen Bilddatei. Wird kein logo gesetzt, so wird nur der Titel ohne Bild dargestellt.|false|
|text|nein|String||Name des Portals.|false|
|toolTip|nein|String||Tooltip, der beim Hovern über das Portallogo angezeigt wird.|false|

**Beispiel portalTitle**

```json
"title": {
    "text": "Master",
    "logo": "https://geodienste.hamburg.de/lgv-config/img/hh-logo.png",
    "link": "https://geoinfo.hamburg.de",
    "toolTip": "Landesbetrieb Geoinformation und Vermessung"
}
```

***

### Portalconfig.mapView
Mit verschiedenen Parametern wird die Startansicht der Karte konfiguriert und der Hintergrund festgelegt, der erscheint wenn keine Karte geladen ist.

[type:Extent]: # (Datatypes.Extent)
[type:Coordinate]: # (Datatypes.Coordinate)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|backgroundImage|nein|String|"https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/doc/config.json.md#markdown-header-portalconfigmapview"|Pfad zum alternativen Hintergrund angeben.|false|
|epsg|nein|String|"EPSG:25832"|Der EPSG-Code der Projektion der Karte. Der EPSG-Code muss als namedProjection definiert sein.|false|
|extent|nein|**[Extent](#markdown-header-datatypesextent)**|[510000.0, 5850000.0, 625000.4, 6000000.0]|Der Map-Extent.|false|
|options|nein|**[option](#markdown-header-portalconfigmapviewoption)[]**|[{"resolution":66.14579761460263,"scale":250000,"zoomLevel":0}, {"resolution":26.458319045841044,"scale":100000,"zoomLevel":1}, {"resolution":15.874991427504629,"scale":60000,"zoomLevel":2}, {"resolution": 10.583327618336419,"scale":40000,"zoomLevel":3}, {"resolution":5.2916638091682096,"scale":20000,"zoomLevel":4}, {"resolution":2.6458319045841048,"scale":10000,"zoomLevel":5}, {"resolution":1.3229159522920524,"scale":5000,"zoomLevel":6}, {"resolution":0.6614579761460262,"scale":2500,"zoomLevel":7}, {"resolution":0.2645831904584105,"scale": 1000,"zoomLevel":8}, {"resolution":0.13229159522920521,"scale":500,"zoomLevel":9}]|Die initialen Maßstabsstufen und deren Auflösungen.|false|
|startCenter|nein|**[Coordinate](#markdown-header-datatypescoordinate)**|[565874, 5934140]|Die initiale Zentrumskoordinate.|false|
|startResolution|nein|Float|15.874991427504629|Die initiale Auflösung der Karte aus options. Vorzug vor startZoomLevel.|false|
|startZoomLevel|nein|Integer||Der initiale ZoomLevel aus Options. Nachrangig zu resolution.|false|
|twoFingerPan|nein|Boolean|false|Soll für mobile Geräte ein 2-Finger-Pan anstatt 1-Finger-Pan gesetzt werden?|false|

**Beispiel:**
```
#!json
"mapView": {
    "backgroundImage": "https://geodienste.hamburg.de/lgv-config/img/backgroundCanvas.jpeg",
    "startCenter": [561210, 5932600],
    "options": [
        {
            "resolution": 611.4974492763076,
            "scale": 2311167,
            "zoomLevel": 0
        },
        {
            "resolution": 305.7487246381551,
            "scale": 1155583,
            "zoomLevel": 1
        },
        {
            "resolution": 152.87436231907702,
            "scale": 577791,
            "zoomLevel": 2
        },
        {
            "resolution": 76.43718115953851,
            "scale": 288896,
            "zoomLevel": 3
        },
        {
            "resolution": 38.21859057976939,
            "scale": 144448,
            "zoomLevel": 4
        },
        {
            "resolution": 19.109295289884642,
            "scale": 72223,
            "zoomLevel": 5
        },
        {
            "resolution": 9.554647644942321,
            "scale": 36112,
            "zoomLevel": 6
        },
        {
            "resolution": 4.7773238224711605,
            "scale": 18056,
            "zoomLevel": 7
        },
        {
            "resolution": 2.3886619112355802,
            "scale": 9028,
            "zoomLevel": 8
        },
        {
            "resolution": 1.1943309556178034,
            "scale": 4514,
            "zoomLevel": 9
        },
        {
            "resolution": 0.5971654778089017,
            "scale": 2257,
            "zoomLevel": 10
        }
    ],
    "extent": [510000.0, 5850000.0, 625000.4, 6000000.0],
    "startResolution": 15.874991427504629,
    "startZoomLevel": 1,
    "epsg": "EPSG:25832"
    }
```

***
#### Portalconfig.mapView.option

Eine option definiert eine Zoomstufe. Diese muss definiert werden über die Auflösung, die Maßstabszahl und das ZoomLevel. Je höher das ZoomLevel ist, desto kleiner ist die Scale und desto näher hat man gezoomt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|resolution|ja|Number||Auflösung der definierten Zoomstufe.|false|
|scale|ja|Integer||Maßstabszahl der definierten Zoomstufe.|false|
|zoomLevel|ja|Integer||Zoomstufe der definierten Zoomstufe.|false|

**Beispiel einer mapview Option**
```
#!json
{
    "resolution": 611.4974492763076,
    "scale": 2311167,
    "zoomLevel": 0
}
```

***


***

### Portalconfig.mouseHover
Aktiviert die MouseHover-Funktion für Vektorlayer, z.B. WFS oder GeoJSON. Für die Konfiguration pro Layer siehe **[Vector](#markdown-header-themenconfigelementslayersvector)**.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|infoText|nein|String|"common:modules.mouseHover.infoText"| Text der angezeigt wird, wenn die Feature die Anzahl von `numFeaturesToShow` übersteigen.|false|
|numFeaturesToShow|nein|Integer|2|Maximale Menge an Elementinformationen pro Tooltip; bei Überschreitung informiert ein Informationstext den Benutzer über den abgeschnittenen Inhalt.|false|

**Beispiel**

```json
"mouseHover": {
    "numFeaturesToShow": 1,
    "infoText": "Beispieltext"
}
```

***

### Portalconfig.portalFooter
Möglichkeit den Inhalt der Fußzeile des Portals zu konfigurieren.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|configPaths|nein|Array|["portalConfig.portalFooter"]|Liste mit möglichen Konfigurationen, die erste die gefunden wird, wird verwendet.|false|
|scaleLine|nein|Boolean|true|Gibt an, ob der Maßstab angezeigt werden soll.|false|
|scaleLineWidth|nein|Number|2|Die Breite der Maßstabsanzeige in cm.|false|
|seperator|nein|String|`&nbsp;|&nbsp;`|Die Trennung zwischen einzelnen Links.|false|
|urls|nein|Array|[]|Urls, die im Footer angezeit werden sollen.|false|

**Beispiel**

```json
"portalFooter": {
    "urls": [
    {
        "bezeichnung": "common:modules.portalFooter.designation",
        "url": "https://geoinfo.hamburg.de/",
        "alias": "Landesbetrieb Geoinformation und Vermessung",
        "alias_mobile": "LGV Hamburg"
    },
    {
        "url": "mailto:LGVGeoPortal-Hilfe@gv.hamburg.de?subject=Kartenunstimmigkeiten%20melden&body=Zur%20weiteren%20Bearbeitung%20bitten%20wir%20Sie%20die%20nachstehenden%20Angaben%20zu%20machen.%20Bei%20Bedarf%20fügen%20Sie%20bitte%20noch%20einen%20Screenshot%20hinzu.%20Vielen%20Dank!%0A%0A1.%20Name:%0A2.%20Telefon:%0A3.%20Anliegen",
        "alias": "common:modules.portalFooter.mapDiscrepancy"
    }
    ],
    "scaleLine": true
}
```

#### Portalconfig.portalFooter.urls

Eine Url kann unterschiedlich definiert werden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|alias|ja|String||Angezeigter Name des Links in der Desktop-Ansicht.|false|
|alias_mobil|nein|String||Angezeigter Name des Links in der Mobile-Ansicht. Falls nicht angegeben, wird der Link in der Mobilen Ansicht nicht angezeigt.|false|
|bezeichnung|nein|String||Angezeigte Bezeichnung vor dem Link.|false|
|url|ja|String||Die Url für den Link.|false|

**Beispiel**

```json
{
    "bezeichnung": "common:modules.portalFooter.designation",
    "url": "https://geoinfo.hamburg.de/",
    "alias": "Landesbetrieb Geoinformation und Vermessung",
    "alias_mobile": "LGV Hamburg"
}
```

***

### Portalconfig.tree
Möglichkeit, um Einstellungen für den Themenbaum vorzunehmen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|addLayerButton|nein|Boolean|false|Wenn true, dann wird ein Button zum Hinzufügen von Layern dargestellt. Im Themenbaum werden initial nur sichtbare Layer und Layer mit der property `showInLayerTree = true` dargestellt. Wenn false, dann werden alle konfigurierten Layer im Themenbaum angezeigt. Bei dem tree.type `auto` wird immer ein Hinzufügen-Button angezeigt.|false|
|categories|nein|**[categories](#markdown-header-portalconfigtreecategories)**||Konfiguration der Kategorien aus den Metadaten. Nur für den tree.type `auto`.|false|
|highlightedFeatures|nein|**[highlightedFeatures](#markdown-header-portalconfigtreehighlightedfeatures)**||Konfiguration zusätzlich zum Highlighting von Features.|false|
|layerIDsToIgnore|nein|String[]||Liste von `services.json`-Layer-Ids, die nicht im Baum und in der Karte angezeigt werden sollen. Nur für den tree.type `auto`.|false|
|layerIDsToStyle|nein|**[layerIDsToStyle](#markdown-header-portalconfigtreelayeridstostyle)**[]||Spezielle Implementierung für einen HVV-Dienst (Hamburger Verkehrsbetriebe). Enthält Objekte zur Abfrage verschiedener Stile einer Layer-ID. Nur für den tree.type `auto`.|true|
|layerPills|nein|**[layerPills](#markdown-header-portalconfigtreelayerpills)**||Konfiguration der LayerPills.|false|
|metaIDsToIgnore|nein|String[]||Alle in der `services.json` gefundenen Layer, die diesen Meta-IDs entsprechen, werden nicht im Baum und in der Karte angezeigt. Nur für den tree.type `auto`.|false|
|metaIDsToMerge|nein|String[]||Alle in der `services.json` gefundenen Layer, die diesen Meta-IDs entsprechen, werden zu einer einzigen Layer im Baum zusammengeführt. Nur für den tree.type `auto`.|true|
|type|nein|enum["auto"]||Der Themenbaum ist in der gleichen Struktur aufgebaut wie die **[Themenconfig](#markdown-header-themenconfig)**. Wenn der Typ `auto` konfiguriert ist, werden alle Ebenen aus der [services.json](services.json.md) im Baum angeboten, strukturiert durch ihre Metadaten (Geo-Online).|false|
|validLayerTypesAutoTree|nein|enum|["WMS", "SENSORTHINGS", "TERRAIN3D", "TILESET3D", "OBLIQUE"]|Layer Typen die bei dem tree.type `auto` verwendet werden sollen.|false|

**Beispiel type auto**

```json
{
    "tree": {
        "type": "auto",
        "validLayerTypesAutoTree": ["WMS", "WFS"],
        "layerIDsToIgnore": ["1912", "1913"],
        "metaIDsToIgnore": [
            "09DE39AB-A965-45F4-B8F9-0C339A45B154"
        ],
        "metaIDsToMerge": [
            "FE4DAF57-2AF6-434D-85E3-220A20B8C0F1"
        ],
        "layerIDsToStyle": [
        {
            "id": "1935",
            "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
            "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
            "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
        },
        "categories": [
        {
          "key": "kategorie_opendata",
          "name": "common:modules.layerTree.categoryOpendata",
          "active": true
        },
        {
          "key": "kategorie_inspire",
          "name": "common:modules.layerTree.categoryInspire"
        },
        {
          "key": "kategorie_organisation",
          "name": "common:modules.layerTree.categoryOrganisation"
        }
      ]
    }
}
```

**Beispiel kein type**

```json
{
    "tree": {
        "addLayerButton": true,
        "highlightedFeatures": {
            "active": false
        },
    }
}
```

***

#### Portalconfig.tree.categories
Konfiguration der Kategorien aus den Metadaten. Nur für den tree.type `auto`.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|key|ja|String||Schlüssel der jeweiligen Kategorie in den Metadaten.|false|
|name|ja|String||Name der Kategorie.|false|
|active|nein|Boolean||Gibt an, ob diese Kategorie initial aktiv ist. Bei keiner Angabe, ist die 1. Kategorie initial aktiv.|false|

**Beispiel**

```json
 "categories": [
        {
          "key": "kategorie_opendata",
          "name": "common:modules.layerTree.categoryOpendata",
          "active": true
        },
        {
          "key": "kategorie_inspire",
          "name": "common:modules.layerTree.categoryInspire"
        },
        {
          "key": "kategorie_organisation",
          "name": "common:modules.layerTree.categoryOrganisation"
        }
      ]
```

***

#### Portalconfig.tree.highlightedFeatures
Konfiguration zusätzlich zum Highlighting von Features. Wenn mit dem Modul "Liste" oder "Features auswählen" mit "Auf dieses Feature zoomen" oder per Url-Parameter Features hervorgehoben werden, dann ist ein Layer mit diesen Features im Menü-Baum auswählbar.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob dieses Feature aktiv ist.|false|
|layerName|nein|String|"common:tree.selectedFeatures"|Name der erzeugten Layer mit den hervorgehobenen Features. Der Name enthält zusätzlich den Namen des Moduls mit dem gearbeitet wurde.|true|

**Beispiel**

```json
"highlightedFeatures": {
    "active": false,
    "layerName": "Ausgewählte Features"
},
```

***

#### Portalconfig.tree.layerIDsToStyle
Kombiniert den style von mehreren Layern, Namen  und Legenden.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|id|nein|String||a `services.json` layer's id|false|
|styles|nein|String/String[]||Zu verwendender Stil als String; wenn mehrere Stile verwendet werden sollen, werden sie in einem Array aufgeführt.|false|
|name|nein|String/String[]||Zu verwendender Name als String; wenn mehrere Namen verwendet werden sollen, werden sie in einem Array aufgelistet.|false|
|legendUrl|nein|String/String[]||URL des Legendenbildes als String ; wenn mehrere Legendenbilder verwendet werden sollen, werden ihre URLs in einem Array aufgelistet.|false|

**Beispiel:**

```json
{
    "layerIDsToStyle": [
        {
            "id": "1935",
            "styles": ["geofox_Faehre", "geofox-bahn", "geofox-bus", "geofox_BusName"],
            "name": ["Fährverbindungen", "Bahnlinien", "Buslinien", "Busliniennummern"],
            "legendURL": ["http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-faehre.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bahn.png", "http://geoportal.metropolregion.hamburg.de/legende_mrh/hvv-bus.png", "http://87.106.16.168/legende_mrh/hvv-bus.png"]
        }
    ]
}
```

***

### Portalconfig.tree.layerPills
Konfiguration, um Einstellungen für die LayerPills vorzunehmen.

Layerpills sind Buttons, die oberhalb der Karte die ausgewählten Layer anzeigen. Beim Anklicken einer LayerPill, werden die entsprechenden Layerinformationen im Menü angezeigt. Über den Schließen-Button wird der Layer abgewählt. Das Attribut LayerPills wird als Objekt angegeben und beinhaltet folgende Attribute:

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|active|nein|Boolean|false|Gibt an, ob LayerPills aktiv sind.|false|
|mobileOnly|nein|Boolean|false|Definiert, ob LayerPills nur in der mobilen Version aktiv sein sollen.|false|


**Beispiel**

```json
"layerPills": {
    "active": true,
    "mobileOnly": true
    }
```

***

## Themenconfig
Die Themenconfig definiert, welche Inhalte an welcher Stelle im Themenbaum angezeigt werden. Es können folgende Eigenschaften konfiguriert werden:

1. Layer die Hintergrundkarten beinhalten (*Baselayer*)
2. Layer die Fachdaten beinhalten (*Fachdaten*)

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|Baselayer|nein|**[Baselayer](#markdown-header-themenconfigbaselayer)**||Layer die Hintergrundkarten beinhalten.|false|
|Fachdaten|nein|**[Fachdaten](#markdown-header-themenconfigfachdaten)**||Layer die Fachdaten beinhalten.|false|

**Beispiel**

```json
{
    "Themenconfig": {
        "Baselayer": {},
        "Fachdaten": {}
    }
}
```

***

### Themenconfig.Baselayer
Hier werden Layer definiert, die als Hintergrundkarten angezeigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#markdown-header-themenconfigelements)**[]||Definition der Layer die im Themenbaum als Hintergrudnkarten angezeigt werden sollen.|false|

**Beispiel**

```json
{
    "Themenconfig": {
        "Baselayer": {}
    }
}
```

***

### Themenconfig.Fachdaten
Hier werden Layer oder Ordner mit Layern definiert, die als Fachdaten angezeigt werden sollen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#markdown-header-themenconfigelements)**[]||Definition der Layer oder Ordner die im Themenbaum als Fachdaten angezeigt werden sollen.|false|

**Beispiel**

```json
{
    "Themenconfig": {
        "Fachdaten": {}
    }
}
```

***

### Themenconfig.elements
Hier werden Layer oder Ordner definiert. Ordner können **[elements](#markdown-header-themenconfigelements)** mit Ordner oder Layern enthalten.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|elements|nein|**[elements](#markdown-header-themenconfigelements)**[]||Nächste Ebene mit Layern oder Ordnern unter dem type `folder`.|false|
|name|nein|String|""|Name des Layers oder Ordners.|false|
|type|nein|String|"layer"|Typ des Elements: "layer" für Layer oder "folder" für Ordner|false|

**Beispiel Baselayer**

```json
{
    "Themenconfig": {
        "Baselayer": {
            "elements": [
                {
                    "id": "123"
                }
            ]
        }
    }
}
```

**Beispiel Fachdaten**

```json
{
    "Themenconfig": {
        "Fachdaten": {
            "elements": [
                {
                    "id": "123",
                    "type": "layer"
                }
            ]
        }
    }
}
```

**Beispiel mit Ordnern, die Layer enthalten**
```json
{
"elements": [
        {
        "name": "Ordner Ebene 1",
        "type": "folder",
        "elements": [
                {
                "name": "Ordner Ebene 2",
                "type": "folder",
                "elements": [
                        {
                            "id": "2431"
                        },
                        {
                            "id": "2430"
                        },
                        {
                            "id": "2429"
                        },
                        {
                            "name": "Ordner Ebene 3",
                            "type": "folder",
                            "elements": [
                                {
                                    "id": "1103"
                                }
                            ]
                        }
                    ]
                }
            ]
        }
    ]
}
```
***
### Themenconfig.elements.layers
Hier werden Layer verschiedenen Typs konfiguriert. Layer können auf viele verschiedene Arten konfiguriert werden. Ein Großteil der Attribute ist in der **[services.json](services.json.de.md)** definiert, kann jedoch hier am Layer überschrieben werden.
Neben diesen Attributen gibt es auch Typ-spezifische Attribute für die verschiedenen Layer Typen.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|autoRefresh|nein|Integer||Automatischer Reload des Layers. Angabe in ms. Minimum ist 500.|false|
|id|ja|String/String[]||Id des Layers. In der **[services.json](services.json.de.md)** werden die ids aufgelöst und die notwendigen Informationen herangezogen. ACHTUNG: Hierbei ist wichtig, dass die angegebenen ids dieselbe URL ansprechen, also den selben Dienst benutzen. Bei Konfiguration eines Arrays von Ids ist die Angabe der minScale und maxScale in der services.json für jeden Layer notwendig.|false|
|isPointLayer|nein|Boolean|false|Anzeige, ob der (Vektor)-Layer nur aus Punkt-Features besteht (nur relevant für WebGL Rendering))|false|
|name|nein|String||Name des Layers.|false|
|preview|nein**[preview](#markdown-header-themenconfigelementslayerspreview)**||Vorschau für Baselayer vom Typ WMS, WMTS und VectorTile. WMS und WMTS: bei keiner Angabe, wird ein zentrierter Kartenausschnitt geladen.|false|
|renderer|nein|String|"default"|Render-Pipeline für die Darstellung ("default" oder "webgl")(nur für Vektordaten "GeoJSON", "WFS", "OAF")"webgl" ist derzeit als experimentell einzustufen.|false|
|showInLayerTree|nein|Boolean|false|Wenn true, dann wird der Layer initial im Themenbaum angezeigt. Wenn portalConfig.tree.addLayerButton nicht konfiguriert ist, dann hat dieses Attribut keinen Effekt.|false|
|transparency|nein|Integer|0|Transparenz des Layers.|false|
|type|nein|String|"layer"|Typ des Elements Layer: "layer"|false|
|urlIsVisible|nein|Boolean|true|Anzeige, ob die URL in der Layerinformation angezeigt werden soll.|false|
|visibility|nein|Boolean|false|Sichtbarkeit des Layers. Wenn true, dann wird der Layer initial im Themenbaum angezeigt.|false|

**Beispiel**
```json
{
"elements": [
          {
          "id": "2",
          "name": "Beispiel Layer",
          "typ": "WMS",
          "visibility": false
        }
    ]
}
```
**Beispiel mit einem Array von Ids**
```json
{
"elements": [
        {
            "id": ["123", "456", "789"],
            "name": "Mein Testlayer"
        }
    ]
}
```
***
#### Themenconfig.elements.layers.preview
Vorschau für Baselayer im Themenbaum, wird auch im **[BaselayerSwitcher](#markdown-header-portalconfigmenusectionsmodulesbaselayerswitcher)** verwendet.
Für die Layertypen **[VectorTile](#markdown-header-themenconfigelementslayersvectortile)**, **[WMS](#markdown-header-themenconfigelementslayersrasterwms)** und WMTS.
Beim VectorTile-Layer wird ein abgelegtes Vorschaubild angezeigt, bei WMS- und WMTS-Layern wird ein Kartenausschnitt geladen. WMS und WMTS: bei keiner Angabe, wird ein zentrierter Kartenausschnitt geladen. Eine detaillierte Beschreibung ist in der Dokumentation **[LayerPreview](./vueComponents/LayerPreview.md)**

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|center|nein|Number[]/String[]||Center-Koordinaten für die Ladeparameter des Vorschaubildes. Default ist das Zentrum der Ausdehnung der Karte.|false|
|checkable|nein|Boolean|false|Wenn `true`, dann ist das Vorschaubild als Checkbox benutzbar.|false|
|customClass|nein|String||Benutzerdefinierte css-Klasse zum Überschreiben des Stils, HINWEIS: eventuell muss '!important' verwendet werden.|false|
|radius|nein|Number|1000|Radius des extents in Metern.|false|
|src|nein|String||Nur bei typ `VectorTile`. Pfad zum Bild, das als Vorschau angezeigt werden soll.|false|
|zoomLevel|nein|Number||Zoomlevel aus dem die resolution für die Ladeparameter des Vorschaubildes bestimmt werden. Default ist der initiale zoomLevel der Karte.|false|

**Beispiel VectorTile**
```json
"preview":{
    "src": "./resources/vectorTile.png"
    }
```
**Beispiel WMS**
```json
 "preview": {
    "zoomLevel": 6,
    "center": "566245.97,5938894.79",
    "radius": 500
    }
```
***
#### Themenconfig.elements.layers.Raster
Hier werden Raster-Layer typische Attribute aufgelistet. Raster Layer sind vom Typ **[StaticImage](#markdown-header-themenconfigelementslayersrasterstaticimage)**, **[WMS](#markdown-header-themenconfigelementslayersrasterwms)**, WMSTime und WMTS.

***

##### Themenconfig.elements.layers.Raster.StaticImage
Mit StaticImage lassen sich Bilder als Layer laden und georeferenziert auf der Karte darstellen. Es werden die Formate jpeg und png unterstützt.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|extent|ja|**[Extent](#markdown-header-datatypesextent)**|[560.00, 5950.00, 560.00, 5945.00]|Gibt die Georeferenzierung des Bildes an. Als Koordinatenpaar werden im EPSG:25832 Format die Koordinate für die Bildecke oben links und unten rechts erwartet.|false|
|id|ja|String||Es muss eine eindeutige ID unter allen Layern vergeben werden.|false|
|typ|ja|String|"StaticImage"|Setzt den Layertypen auf StaticImage, welcher statische Bilder als Layer darstellen kann.|false|
|url|ja|String|"https://meinedomain.de/bild.png"|Link zu dem anzuzeigenden Bild.|false|


**Beispiel**
```json
{
    "id": "4811",
    "typ": "StaticImage",
    "url": "https://www.w3.org/Graphics/PNG/alphatest.png",
    "name": "Testing PNG File",
    "visibility": true,
    "extent": [560296.72, 5932154.22, 562496.72, 5933454.22]
}
```

***
##### Themenconfig.elements.layers.Raster.WMS
Hier werden WMS typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|name|nein|String/String[]||Name des Layers. Falls das Attribute **styles** konfiguriert wird, muss dieses Attribute als Tpy String[] konfiguriert werden.|false|
|featureCount|nein|Number|1|Anzahl der Features, die bei einer GetFeatureInfo-Abfrage zurückgegeben werden sollen.|false|
|gfiAsNewWindow|nein|**[gfiAsNewWindow](#markdown-header-themenconfigelementslayersrasterwmsgfiasnewwindow)**|null|Wird nur berücksichtigt wenn infoFormat text/html ist.|true|
|styles|nein|String[]||Werden styles angegeben, so werden diese mit an den WMS geschickt. Der Server interpretiert diese Styles und liefert die Daten entsprechend zurück.|true|

**Beispiel**
```json
{
    "id": "4711",
    "name": ["MyFirstWMSLayerName", "MySecondWMSLayerName"],
    "transparency": 0,
    "visibility": true,
    "featureCount": 2,
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "width=800,height=700"
    },
    "styles": ["firstStyle", "secondStyle"]
}
```
***
###### Themenconfig.elements.layers.Raster.WMS.gfiAsNewWindow

Der Parameter *gfiAsNewWindow* wird nur berücksichtigt wenn infoFormat text/html ist.

Mit dem Parameter *gfiAsNewWindow* lassen sich html-Inhalte Ihres WMS-Service einfach in einem eigenen Fenster oder Browser-Tab öffnen, anstatt in einem iFrame im GFI.
Um html-Inhalte in einem einfachen Standard-Fenster des Browsers zu öffnen, geben Sie für *gfiAsNewWindow* anstatt *null* ein leeres Objekt an.

Sie können nun das Verhalten des Öffnens durch den Parameter *name* beeinflussen:

**Hinweis zur SSL-Verschlüsselung**

Ist *gfiAsNewWindow* nicht bereits eingestellt, wird *gfiAsNewWindow* automatisch gesetzt (mit Standard-Einstellungen), wenn die aufzurufende Url nicht SSL-verschlüsselt ist (https).

Nicht SSL-verschlüsselter Inhalt kann im Masterportal aufgrund der *no mixed content*-policy moderner Browser nicht in einem iFrame dargestellt werden.

Bitte beachten Sie, dass automatische Weiterleitungen (z.B. per Javascript) im iFrame auf eine unsichere http-Verbindung (kein SSL) nicht automatisch erkannt und vom Browser ggf. unterbunden werden.

Stellen Sie in einem solchen Fall *gfiAsNewWindow* wie oben beschrieben manuell ein.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|ja|enum["_blank_","_self_"]|"_blank"|Bei `"_blank"` öffnet sich ein neues Browser-Fenster oder ein neuer Browser-Tab (browserabhängig) mit dem html-Inhalt. Die Erscheinung des Fensters lässt sich mithilfe des Parameters *specs* beeinflussen. Bei `"_self"` öffnet sich der html-Inhalt im aktuellen Browser-Fenster.  |true|
|specs|nein|String||Beliebig viele der folgenden Einstellungen lassen sich durch durch Komma-Separation (z.B. {"specs": "width=800,height=700"}) kombinieren. Weitere Einstellungsmöglichkeiten entnehmen Sie bitte den einschlägigen Informationen zum Thema "javascript + window.open": [https://www.w3schools.com/jsref/met_win_open.asp](https://www.w3schools.com/jsref/met_win_open.asp) (deutsch), [https://javascript.info/popup-windows](https://javascript.info/popup-windows) (englisch), [https://developer.mozilla.org/en-US/docs/Web/API/Window/open](https://developer.mozilla.org/en-US/docs/Web/API/Window/open) (englisch)|true|

Beispiel:
```json
{
    "id": "4711",
    "gfiAsNewWindow": {
        "name": "_blank",
        "specs": "toolbar=yes,scrollbars=yes,resizable=yes,top=0,left=500,width=800,height=700"
    }
}
```

***
#### Themenconfig.elements.layers.Vector
Hier werden Vector typische Attribute aufgelistet. Vector Layer sind vom Typ **[WFS](#markdown-header-themenconfigelementslayersvectorwfs)**, GeoJSON (nur in EPSG:4326), **[SensorLayer](sensorThings.de.md)** und OAF.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|additionalInfoField|nein|String|"name"|Attributname des Features für die Hitlist in der Searchbar. Ist das Attribut nicht vorhanden, wird der Layername angegeben.|false|
|clusterDistance|nein|Integer||Pixelradius. Innerhalb dieses Radius werden alle Features zu einem Feature "geclustered". ⚠️ clusterDistance bei WFS-Layern mit Polygon- oder Linien-Geometry führt dazu, dass die Features nicht angezeigt werden.|false|
|hitTolerance|nein|String||Clicktoleranz bei der ein Treffer für die GetFeatureInfo-Abfrage ausgelöst wird.|false|
|loadingStrategy|nein|String|"bbox"|Ladestrategie zum Laden der Features. Mögliche Werte sind "bbox" oder "all". **[siehe dazu](https://openlayers.org/en/latest/apidoc/module-ol_loadingstrategy.html)**.|false|
|mouseHoverField|nein|String/String[]||Attributname oder Array von Attributnamen, die angezeigt werden sollen, sobald der User mit der Maus über ein Feature hovert.|false|
|nearbyTitle|nein|String/String[]||Attributname oder Array von Attributnamen die bei der Umkreissuche in der Ergebnisliste als Titel angezeigt werden sollen.|false|
|searchField|nein|String||Attributname nach dem die Searchbar diesen Layer durchsucht.|false|
|styleGeometryType|nein|String/String[]||Geometrietypen für einen WFS-Style, falls nur bestimmte Geometrien eines Layers angezeigt werden sollen **[siehe dazu](style.json.md#markdown-header-display-rules)**.|false|
|styleId|ja|String||Id die den Style definiert. Id wird in der **[style.json](style.json.md)** aufgelöst.|false|

**Beispiel**
```json
{
"elements": [
          {
            "id": "22078",
            "name": "Bewohnerparkgebiete Hamburg",
            "typ": "WFS",
            "visibility": false,
            "styleId": "22078",
            "styleField": "bewirtschaftungsart",
            "searchField": "bwp_name",
            "mouseHoverField": [
                "bwp_name",
                "bewirtschaftungsart"
            ]
        },
        {
            "id" : "11111",
            "name" : "lokale GeoJSON",
            "url" : "portal/master/test.json",
            "typ" : "GeoJSON",
            "gfiAttributes" : "showAll",
            "layerAttribution" : "nicht vorhanden",
            "legend" : true
        }
    ]
}
```
***
##### Themenconfig.elements.layers.Vector.WFS
Attribute für die WFS Suche bei highlightFeaturesByAttribute. Für die Aufrufparameter siehe **[urlParameter](urlParameter.md)**.
```
Beispiel-Aufrufe:
?api/highlightFeaturesByAttribute=1&wfsId=1&attributeName=DK5&attributeValue=valueToSearchFor&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=1711&attributeName=name&attributeValue=Helios%20ENDO-Klinik%20Hamburg&attributeQuery=IsLike
?api/highlightFeaturesByAttribute=123&wfsId=2003&attributeName=gebietsname&attributeValue=NSG%20Zollenspieker&attributeQuery=isequal
?api/highlightFeaturesByAttribute=123&wfsId=2928&attributeName=biotop_nr&attributeValue=279&attributeQuery=isLike
```

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|escapeChar|ja|String||Das Zeichen für den escapeChar WFS parameter - z.Bsp. \||true|
|featurePrefix|ja|String||Suchprefix für den typename bei der WFS Suche - z.Bsp. app:.|true|
|singleChar|ja|String||Das Zeichen für den singleChar WFS parameter - z.Bsp. #|true|
|valueDelimiter|nein|String|"";"|Das Trennzeichen für die Werte in attributeValue bei der isIn Suche.|true|
|wildCard|ja|String||Das zu verwendende Zeichen für das Jokerzeichen - z.Bsp. %|true|

**Beispiel**

```json
{
    "id": "1",
    "visibility": false,
    "name": "Tierarten invasiv",
    "featurePrefix": "app:",
    "wildCard": "%",
    "singleChar": "#",
    "escapeChar": "!"
}
```

***
#### Themenconfig.elements.layers.VectorTile
Hier werden VectorTile typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|useMpFonts|nein|Boolean|true|Schalter um die Schriftarten/Fontstacks aus externen Style-Definitionen durch die Standard-Schriftart des Masterportals zu ersetzen, um sicherzustellen dass alle Labels dargestellt werden können. Wenn auf false gesetzt, müssen die benötigten fonts ggf. separat z.B. via '<link rel=stylesheet ...>' in index.html eingebunden werden.|false|
|vtStyles|nein|**[vtStyle](#markdown-header-themenconfigelementslayersvectortilevtstyle)**[]||Auswählbare externe Style-Definition.|false|

**Beispiel**
```json
{
  "id": "123",
  "name": "Ein Vektortilelayername",
  "epsg": "EPSG:3857",
  "url": "https://example.com/3857/tile/{z}/{y}/{x}.pbf",
  "typ": "VectorTile",
  "vtStyles": [
    {
      "id": "STYLE_1",
      "name": "Tagesansicht",
      "url": "https://example.com/3857/resources/styles/day.json",
      "defaultStyle": true
    },
    {
      "id": "STYLE_2",
      "name": "Nachtansicht",
      "url": "https://example.com/3857/resources/styles/night.json"
    }
  ],
  "preview":{
    "src": "./resources/vectorTile.png"
    }
}
```
***
#### Themenconfig.elements.layers.VectorTile.vtStyle
Style-Definition; nur für Vector Tile Layer.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|defaultStyle|nein|String||Falls hier `true` gesetzt ist, wird der Style initial ausgewählt, unabhängig von seinem Index; wenn das Feld nirgends auf `true` gesetzt ist, wird der erste Style benutzt|false|
|id|ja|String||serviceübergreifend eindeutige ID|false|
|name|ja|String||Anzeigename, z.B. für das Auswahltool|false|
|resolutions|nein|Number[]||Auflösungen für die im Styling definierten Zoom Level. Wenn nicht angegeben werden die default Resolutions aus dem ol-mapbox-style Projekt benutzt|false|
|url|ja|String||URL, von der der Style bezogen werden kann. Die verlinkte JSON muss zur [Mapbox Style Specification](https://docs.mapbox.com/mapbox-gl-js/style-spec/) passen.|false|

**Beispiel**
```json
{
    "id": "Style_1",
    "name": "Rote Linien",
    "url": "https://example.com/asdf/styles/root.json",
    "defaultStyle": true,
    "resolutions": [
        661.4579761460263,
        264.58319045841048,
        66.14579761460263,
        26.458319045841044,
        15.874991427504629,
        10.583327618336419
    ]
}
```
***
#### Themenconfig.elements.layers.Tileset
Hier werden Tileset typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|hiddenFeatures|nein|String[]|[]|Liste mit IDs, die in der Ebene versteckt werden sollen|true|
|**[cesium3DTilesetOptions](https://cesiumjs.org/Cesium/Build/Documentation/Cesium3DTileset.html)**|nein|**[cesium3DTilesetOption](#markdown-header-themenconfigelementslayerstilesetcesium3dtilesetoption)**||Cesium 3D Tileset Options, werden direkt an das Cesium Tileset Objekt durchgereicht. maximumScreenSpaceError ist z.B. für die Sichtweite relevant.|true|

**Beispiel**
```json
{
    "id": "123456",
    "name": "TilesetLayerName",
    "visibility": true,
    "hiddenFeatures": ["id1", "id2"],
    "cesium3DTilesetOptions" : {
        maximumScreenSpaceError : 6
    },
}
```
***

#### Themenconfig.elements.layers.Tileset.cesium3DTilesetOption

Todo

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|maximumScreenSpaceError|nein|Number||Der maximale Bildschirmplatzfehler, der für die Verfeinerung des Detailgrads verwendet wird. Dieser Wert trägt dazu bei, zu bestimmen, wann eine Kachel zu ihren Nachfolgern verfeinert wird, und spielt daher eine wichtige Rolle bei der Abwägung zwischen Leistung und visueller Qualität.|true|

**Beispiel**
```json
"cesium3DTilesetOptions" : {
    maximumScreenSpaceError : 6
}
```
***
#### Themenconfig.elements.layers.Terrain
Hier werden Terrain typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|**[cesiumTerrainProviderOptions](https://cesiumjs.org/Cesium/Build/Documentation/CesiumTerrainProvider.html)**|nein|**[cesiumTerrainProviderOption](#markdown-header-themenconfigelementslayersterraincesiumterrainprovideroption)**[]||Cesium TerrainProvider Options, werden direkt an den Cesium TerrainProvider durchgereicht. requestVertexNormals ist z.B. für das Shading auf der Oberfläche relevant.|true|

**Beispiel**
```json
{
    "id": "123456",
    "name": "TerrainLayerName",
    "visibility": true,
    "cesiumTerrainProviderOptions": {
        "requestVertexNormals" : true
    },
}
```
***
#### Themenconfig.elements.layers.Terrain.cesiumTerrainProviderOption
Initialisierungsoptionen für den CesiumTerrainProvider-Konstruktor.
[cesiumTerrainProviderOptions]: https://cesium.com/learn/cesiumjs/ref-doc/CesiumTerrainProvider.html

|Name|Verpflichtend|Typ|Default|Beschreibung|Expert|
|----|--------|----|-------|-----------|------|
|requestVertexNormals|nein|Boolean||Kennzeichen, das angibt, ob der Client zusätzliche Beleuchtungsinformationen vom Server anfordern soll, und zwar in Form von Normalen pro Scheitelpunkt, falls verfügbar.|true|

**Beispiel**
```json
"cesiumTerrainProviderOptions": {
    "requestVertexNormals" : true
}
```
***
#### Themenconfig.elements.layers.Entity3D
Hier werden Entities3D typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|entities|ja|**[Attribute](#markdown-header-themenconfigelementslayersentities3dentities)**[]||Liste von darzustellenden Einheiten des Layers.|false|
#### Themenconfig.elements.layers.Entity3D.entities
Hier werden Entities3D Einheiten typische Attribute aufgelistet.

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|allowPicking|nein|Boolean|true|Ob das Modell angeklickt werden darf (GFI). Beispiel: `true`|false|
|attributes|nein|**[Attribute](#markdown-header-themenconfigelementslayersentities3dentitiesattribute)**||Attribute für das Modell. Beispiel: `{"name": "test"}`|false|
|latitude|ja|Number||Breitengrad des Modell-Origins in Grad. Beispiel: `53.541831`|false|
|longitude|ja|Number||Längengrad des Modell-Origins in Grad. Beispiel: `9.917963`|false|
|height|nein|Number|0|Höhe des Modell-Origins. Beispiel: `10`|false|
|heading|nein|Number|0|Rotation des Modells in Grad. Beispiel: `0`|false|
|pitch|nein|Number|0|Neigung des Modells in Grad. Beispiel: `0`|false|
|roll|nein|Number|0|Roll des Modells in Grad. Beispiel: `0`|false|
|scale|nein|Number|1|Skalierung des Modells. Beispiel: `1`|false|
|show|nein|Boolean|true|Ob das Modell angezeigt werden soll (sollte true sein). Beispiel: `true`|false|
|url|ja|String|""|URL zu dem Modell. Beispiel: `"https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb"`|false|


**Beispiel**
```json
{
      "id": "123456",
      "name": "EntitiesLayerName",
      "visibility": true,
      "typ": "Entities3D",
      "entities": [
         {
            "url": "https://daten-hamburg.de/gdi3d/datasource-data/Simple_Building.glb",
           "attributes": {
             "name": "einfaches Haus in Planten und Blomen"
           },
           "latitude": 53.5631,
           "longitude": 9.9800,
           "height": 12,
           "heading": 0,
           "pitch": 0,
           "roll": 0,
           "scale": 5,
           "allowPicking": true,
           "show": true
         }
       ],
       "gfiAttributes" : {
         "name": "Name"
      }
  },
```

***

#### Themenconfig.elements.layers.Entity3D.entities.Attribute

|Name|Verpflichtend|Typ|default|Beschreibung|Expert|
|----|-------------|---|-------|------------|------|
|name|nein|String|""|Feld, das im GFI angezeigt werden kann.|false|

**Beispiel**
```json
{
   "name": "Fernsehturm.kmz"
}
```
***

# Datatypes
In diesem Kapitel werden die erwarteten Datentypen definiert.

## Datatypes.Coordinate

Eine Koordinate besteht aus einem Array bestehend aus zwei Zahlen. Die erste repräsentiert den Rechtswert, die zweite den Hochwert.

**Beispiel Koordinate bestehend aus Ganzzahlen(Integer)**
```
#!json
[561210, 5932600]
```

**Beispiel Koordinate bestehend aus Gleitkommazahlen(Float)**
```
#!json
[561210.1458, 5932600.12358]
```

***

## Datatypes.Extent

Ein Extent besteht aus einem Array bestehend aus vier Zahlen. Ein Extent beschreibt einen rechteckigen Gültigkeitsbereich. Dabei wird ein Rechteck aufgespannt, das durch die "linke untere" und die "rechte obere" Ecke definiert wird. Das Schema lautet [Rechtswert-Links-Unten, Hochwert-Links-Unten, Rechtswert-Rechts-Oben, Hochwert-Rechts-Oben] oder [minx, miny, maxx, maxy].

**Beispiel Extent**
```
#!json
[510000.0, 5850000.0, 625000.4, 6000000.0]
```

***
