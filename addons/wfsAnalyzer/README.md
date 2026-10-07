# wfsAnalyzer

Masterportal tool add-on for the Umweltatlas Berlin. Lets the user pick one of
the layers currently active in the map, verifies that the layer is also
published as a WFS, and then analyses one of its attributes — either by
counting features or by summing their area. The result is shown as a bar
chart, a pie chart and a table.

Typical questions it answers:

* *How is space used in Friedrichshain-Kreuzberg?* → layer "Reale Nutzung",
  filter `bezirk = Friedrichshain-Kreuzberg`, analyse `nutzung`, by **area**.
* *How many trees are there in Berlin-Mitte?* → a tree layer, filter
  `bezirk = Mitte`, analyse e.g. the species attribute, by **count**.

## Why the WFS check comes first

Every layer in `resources/services-internet.json` is configured as a **WMS**
(`typ: "WMS"`) — the map only ever requests rendered images, never features. So
before anything can be analysed, the feature type behind the layer has to be
identified.

**The layer's own service is asked first.** It names the service that draws it,
and GeoServer answers every OWS request on every one of its endpoints — the same
address with `service=WFS` returns the feature types:

```
layer.url  ──  ?service=WFS&request=GetCapabilities ──▶  FeatureTypeList
                                                              │
               exactly one type matches the layer?  ──────────┤
                 yes → analysable                             │
                 no  → the catalogue gets its turn            │
                 several → blocked, nothing is picked
```

Matching is by name and is **not a heuristic**: the qualified name decides
(`ua_flurabstand_1995:a_flurabstand_1995` is both the layer id and the feature
type name), and the short WMS layer name only serves as a fallback *within that
one service*, where it is unique. Measured across the six services with the most
feature types — up to 56 types serving 64 layers — **223 of 257 layers were
identified by their qualified name alone and not one name was ambiguous**. The
34 without a match have no counterpart at all: raster layers (`*_raster_*`,
`temperaturmittel_e_r_*`) and geometries that are simply not published for
download (`*_plr2009`).

Where two feature types would fit equally well, none is chosen. Picking one
would be a guess.

**The metadata record is the fallback**, for portals that publish their download
service somewhere else entirely:

```
layer.datasets[0] = {md_id, csw_url}
        │
        ▼
CSW GetRecordById  →  every WFS listed in the record
        │
        ▼
ranked by service name, at most 4 probed, a match still required
```

That route is a last resort for a reason: a record describes a **dataset**, not
a layer, and may list a download service per sibling — the record behind
`ua_boden_ph_2015` names **nine**, eight of which belong to other soil
parameters. Choosing among them means guessing, which is exactly what asking the
layer's own service avoids. For the soil layers the lookup now takes **one
request instead of a CSW round-trip plus up to four capabilities probes**.

## What is analysed: the classes of the map

A thematic map is a **classification**, not an attribute. The density map of
Berlin is drawn in classes like `ew_ha > '0' AND ew_ha <= '4'` — a range that
exists nowhere as a column. So the add-on takes the classes from the legend of
the WMS and counts those:

```
GetLegendGraphic&format=application/json
        │  rules: {name: "1 - 4", filter: "[ew_ha > '0' AND ew_ha <= '4']", symbolizers: […]}
        ▼
one class per rule  ─ label from title ?? name, colour from the symbolizer
        │
        ▼
one WFS request per class:  resultType=hits&CQL_FILTER=<rule> AND <area selection>
```

The filters are handed to the WFS **exactly as the legend writes them**, quoted
numbers and all — verified against the service: `ew_ha > '0' AND ew_ha <= '4'`
returns the same 872 features as the unquoted form.

**Later rules win, because the map draws them on top.** Rules can overlap: the
23 rules of `d_reale_nutzung_vegetationsbedeckung_2021` matched 28 286 times for
26 397 features, since the map colours built-up areas by `woz` and green ones by
`grz`. Each class is therefore asked as `rule AND NOT(every later rule)`, which
brings the sum to exactly 26 397 — the same resolution the renderer applies.

**What no rule matches is not drawn**, and not counted either. It is reported
below the result instead: for `ua_einwohnerdichte_2016` that is 10 645 of
25 352 features.

**Rules are not classes.** A style may draw the same features again for a
hatching or an outline, and each of those is a rule of its own:
`bodengesellschaften2020` has 133 rules over **78 distinct filters**. One class
per filter, and a colour is taken from whichever of them has one.

Costs: one `resultType=hits` per class, about 800 bytes, all of them at once —
22 classes in 197 ms, 78 classes in 416 ms. An area analysis fetches the area
column per class, which is the same volume as one unfiltered query, split up.
Legends larger than `maxLegendRules` (150) are not offered;
`ua_kanalisation_2005` has 242 rules.

**The legend is read as bytes, not as text**, and repaired string by string.
The services declare `application/json`, which means UTF-8, and answer in
whatever they please: the rare-soils legend writes "mäßig" in Latin-1, and read
as UTF-8 it turns to garbage — since the value of a rule is also its filter, the
request built from it then matches **nothing**, 0 features instead of 1301.

Worse, one document may hold both. `a_reale_nutzung_bebaute_flaechen_2021` writes
its layer title in Latin-1 and its rule names in UTF-8, so whichever encoding the
document is read in, half of it comes out wrong — "Grün- und Freifläche" turns
into "GrÃ¼n- und FreiflÃ¤che". The body is therefore decoded strictly as UTF-8
with a fallback to Latin-1, and every label and filter is then repaired on its
own: turned back into bytes and decoded strictly as UTF-8 again, which succeeds
exactly where the string was UTF-8 read as Latin-1 and fails where it really was
Latin-1.

### Why one request per class

Loading the needed columns once and classifying in the browser would be one
request instead of eleven — or seventy-eight. Measured against the service, it is
worse on every count:

| | one request per class | everything at once, locally |
|---|---|---|
| count, 11 classes, all of Berlin | **9 KB** | 5.80 MB |
| count, 78 classes, all of Berlin | **61 KB**, 360 ms | 4.95 MB, 650 ms |
| area, 11 classes, all of Berlin | **5.54 MB**, 363 ms | 6.11 MB, **2040 ms** |
| area, 11 classes, one district | 0.31 MB, 56 ms | 0.34 MB, 85 ms |

Two reasons that are easy to get wrong:

* **Locally is more data, not less.** Beside the area column, the columns the
  rules filter on would have to travel per feature (`woz`, `grz`) — 10 % on top.
* **Locally is slower.** The per-class requests run in parallel; one large
  download arrives serially. 363 ms against 2040 ms.

And the service evaluates the legend with its own CQL semantics. Doing it here
would mean rebuilding them — numeric comparisons against quoted literals
(`ew_ha > '0'`), null handling in `woz IS NULL AND grz <> '110'`, the type of
every column. Each divergence would be a silently wrong chart.

The many requests are tiny and go out together: 78 of them took 360 ms.

### Two classes, one name

Codes may share a plain-text name: `bodengesellschaften2020` has 78 classes but
67 names. What the map draws alike cannot be told apart on the map, so those
classes become one row. Where the colours differ they stay separate and the code
is appended, so the table does not show the same text twice:

```
Regosol + Pararendzina + Hortisol               5285   20,6 %   (four codes, one colour)
Lockersyrosem + Regosol + Pararendzina (2500)   2175    8,5 %
Lockersyrosem + Regosol + Pararendzina (2540)   2142    8,4 %
```

Merging happens when the result is shown, not when it is measured, because the
readable names arrive on their own schedule. The table therefore sorts **after**
merging: adding two classes up moves the row past others.

**Bare codes are traded for readable text.** Where the legend names classes "10"
and "21", the column the rule filters on may have a plain-text sibling —
`woz` → `woz_name`, `typ` → `typklar`, `bgs_neu` → `bgs_neu_bez`. The suffixes
are configurable (`nameSuffixes`), they are tried in order, and each code costs
one small request. This runs alongside the form, and the labels are resolved when
the result is shown, so a slow lookup never delays anything.

Choosing an attribute under **"Erweitert"** switches the analysis back to the
single-attribute mode described below.

## The analysis, and why it is cheap

No geometries are ever downloaded, and nothing is loaded until the user asks
for it. Four request shapes are used, each the smallest one that answers the
question:

| Step | Request | What travels |
|---|---|---|
| Attribute list | `DescribeFeatureType` | the schema only (~7 KB) |
| "How much data is this?" | `GetFeature&resultType=hits` | `numberMatched`, zero features |
| Analysis by **count** | `GetPropertyValue&valueReference=<attr>` | one property per feature |
| Analysis by **area** | `GetFeature&propertyName=<attr>,<area>&outputFormat=application/json` | two properties per feature, no geometry |

The area analysis deliberately uses an existing **area attribute** (`flalle`,
`flaeche`, …) instead of the geometry, so the polygons never have to be
transferred or measured client-side.

**"Fläche" is offered only where such a column is named** — in `areaAttributes`
or in a preset. A numeric column is no evidence of an area: measured across 26
layers of this portal, 15 had no configured area column, and what their numbers
held was `importid` ("Schlüssel"), `x` ("X-Koordinate ETRS89"), `dtv`
("Durchschnittliche tägliche Verkehrsstärke") or a percentage. Offering those as
an area produced a silent, wrong sum — and with a single candidate the select is
not even shown. For a layer without a named area column the **"Fläche" button is
greyed out rather than hidden**, with a line underneath saying why: a control
that vanishes leaves the user looking for it, and one that is greyed out without
a reason is worse. To give such a layer an area analysis, add its column to
`areaAttributes`.

Because the hits query is free, the feature count is refreshed after every
change of the filter and shown before the analysis is started. Above
`maxFeatures` the user gets a warning but may still proceed.

Concrete example — "Reale Nutzung und Vegetationsbedeckung 2021", filtered to
one district (791 of 26 397 features): the count analysis transfers ~150 KB,
the area analysis ~380 KB. The same layer's geometries would be tens of MB.

## Configuration (`config.js`)

Attribute-name **suggestions** live in the portal's `config.js` so they can be
extended without touching the add-on. Every key is optional and falls back to
the defaults in `js/analysisConfig.js`.

```js
const Config = {
    addons: ["wfsAnalyzer"],
    wfsAnalyzer: {
        // Suggested attributes for restricting an analysis spatially.
        // The user can still pick ANY other attribute of the layer.
        filterAttributes: ["bezirk", "bez", "ortsteil", "plr_name", /* … */],
        // Attributes that hold a precomputed area in square metres. A layer
        // without one of them cannot be analysed by area - see below.
        areaAttributes: ["flalle", "flaeche", "shape_area", /* … */],
        // Warn above this many features.
        maxFeatures: 50000,
        // Categories shown in the charts before the rest is pooled as "other".
        maxChartCategories: 12,
        // Maximum number of filter values offered (and collected).
        maxFilterValues: 50,
        // Take the chart colours from the map legend (see below). Off by
        // default; switch it on per layer in a preset.
        autoColor: false,
        // Legend entries up to which the map's classes are offered, and up to
        // which the code-to-name lookup is attempted.
        maxLegendRules: 40,
        // How a plain-text column is named next to the column holding the code:
        // woz -> woz_name, typ -> typklar, bgs_neu -> bgs_neu_bez.
        nameSuffixes: ["_name", "klar", "_bez"],
        // How the analysed area is shown: "highlight" fills it, "border"
        // outlines it. Hex colour only - anything else falls back.
        areaStyle: "highlight",
        areaColor: "#E2001A",
        // 0 to 1; without it each style keeps its own (0.4 / 1 / 0.45).
        areaOpacity: 0.4,
        // Per-layer defaults, matched on the EXACT layer id.
        presets: [
            {
                layerId: "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
                filterAttribute: "bezirk",
                areaAttribute: "flalle",
                mode: "area",                 // optional, "count" | "area"
                analyseAttribute: "woz_name", // optional
                autoColor: true               // optional, overrides the global switch
            }
        ]
    }
};
```

### Presets

A preset prefills the form when its layer is selected. Only `layerId` is
required; every other field is optional.

* **Matched on the exact layer id**, not the name shown in the dropdown — that
  label comes from `config.json` (e.g. "ab 2021 - Reale Nutzung der bebauten
  Flächen 2021 (Flächennutzung)") and would be brittle to match on. If two
  presets name the same layer, the first wins.
* **Use the technical attribute names** (`bezirk`, `flalle`), not the readable
  ones. Matching ignores case, and the layer's own spelling is what gets stored,
  because that raw name is what goes into the WFS request.
* **A field that does not fit the layer is skipped** with a `console.warn` naming
  the layer and the value — a missing attribute, a non-numeric `areaAttribute`,
  or `mode: "area"` on a layer with no area attribute. The tool stays usable.
* Presets are **re-applied every time the layer is selected**, so returning to a
  layer resets it to the preset rather than to what was last picked by hand.
  That is why a preset's `analyseAttribute` leaves only itself in the select —
  a choice made by hand would only last until the next switch. The select stays,
  as everywhere else in this form, but switched off and without the arrow that
  would promise a choice — and without the empty option that would unset what is
  set. A preset naming an attribute the layer does not have changes nothing: the
  full list stays, and the select works as usual.
* A preset never starts an analysis and never loads the filter values — the
  expensive requests stay behind the user's own click.

Suggested attributes that the selected layer actually has are listed in a
"Vorschläge" option group, all remaining attributes follow in a second group —
so the suggestions are a shortcut, never a restriction.

## Files

```
wfsAnalyzer/
├── index.js                        entry point (component + store + locales)
├── components/
│   ├── WfsAnalyzer.vue             layer picker, WFS check, analysis form
│   ├── FilterValueInput.vue        value picker, list or free text
│   ├── AnalysisPieChart.vue        pie (hand-built inline SVG arcs)
│   └── AnalysisTable.vue           full table incl. bars and totals row
├── js/
│   ├── wfsLookup.js                CSW → WFS discovery and confirmation
│   ├── wfsAnalysis.js              WFS requests + aggregation
│   ├── analysisConfig.js           defaults + presets, merged with Config.wfsAnalyzer
│   ├── legendColors.js             WMS legend → colour per attribute value
│   ├── areaHighlight.js            SLD and WMS params for the analysed area
│   ├── areaLayer.js                the area as a map layer
│   ├── areaExtent.js               extent of the area, read out of a probe image
│   ├── exportCsv.js                CSV of the result table
│   └── formatResult.js             units, number formatting, colours, grouping
├── store/
│   ├── stateWfsAnalyzer.js
│   ├── gettersWfsAnalyzer.js
│   ├── mutationsWfsAnalyzer.js
│   ├── actionsWfsAnalyzer.js
│   └── indexWfsAnalyzer.js         namespaced as Modules/WfsAnalyzer
├── locales/{de,en}/additional.json
└── tests/unit/...
```

**No charting library is used** — the bars in the table are sized `<div>`s, the
pie chart is inline SVG `<path>` arcs computed in the component, and the palette
lives in `js/formatResult.js`.

## Chart colours from the map legend (`autoColor`)

By default the charts use a neutral grey palette, because inventing colours next
to a coloured map is worse than saying nothing. Where the layer is styled per
value, though, the real colours can be had: GeoServer answers
`GetLegendGraphic&format=application/json` with a rule per value, carrying both
the fill colour and a filter naming attribute and value:

```json
{"filter": "[woz = '10']", "symbolizers": [{"Polygon": {"fill": "#FFCC65"}}]}
```

`js/legendColors.js` turns those rules into `{woz: {"10": "#FFCC65", …}}`. Rules
that describe a range rather than one value (class breaks) are skipped, and any
failure — no JSON legend, a broken response, a timeout — quietly leaves the
charts grey.

Two ways the legend can describe the analysed attribute:

* **Direct** — the attribute being analysed is the one the map is styled by
  (`woz`, `kak_stufe`). The category labels *are* the legend's values.
* **Via the `_name` bridge** — the map is styled by a code (`woz`) while the
  analysis runs on its readable sibling (`woz_name`). The codes then have to be
  translated, which costs one tiny request per legend entry
  (`propertyName=woz_name&count=1&CQL_FILTER=woz='10'`, ~300 bytes). This is
  done once per layer and attribute and capped by `maxLegendRules` — above it
  the charts stay grey rather than firing off hundreds of requests
  (`ua_kanalisation_2005` has 242 rules).

`_name` is not a universal convention; it holds in the Flächennutzung family,
which is where it is needed. Everything else falls through to grey.

The lookup runs alongside the analysis and never blocks it — a slow or missing
legend delays nothing, it only means no colours. Categories the legend says
nothing about, including the pooled "Sonstige", keep the neutral palette.

Because it costs a request and only pays off for per-value styling, `autoColor`
is **off globally** and switched on per layer in a preset.

## Showing the analysed area on the map

Picking an area ("Bereich") restricts the analysis, but nothing on the map said
what the numbers referred to. Choosing a value now highlights that area and
moves the map to it. Without an area selection nothing is drawn — the analysis
then covers the whole layer, and a highlight of everything points at nothing.

The same WMS that serves the layer draws the highlight, filtered by the analysis'
own area filter, so what is shown is exactly what is counted:

```
GetMap&CQL_FILTER=bezirk='Mitte'&SLD_BODY=<flat colour>&format_options=antialias:none
```

* **`SLD_BODY`** replaces the layer's cartography with one flat colour. Without
  it the overlay would be drawn in the layer's own style and lie invisibly on
  top of the layer already showing.
* **Three styles**, set as `areaStyle` in `config.js`, in the colour `areaColor`:

  | | was gezeichnet wird | Bezirksansicht 1200×1080 |
  |---|---|---|
  | `mask` | Schleier über alles andere, der Bereich bleibt frei | 119 KB |
  | `highlight` | Fläche eingefärbt, Karte scheint durch (Deckkraft 0.4) | 119 KB |
  | `border` | nur Umrisse, voll deckend | 184 KB |

  `mask` dreht die Darstellung im **Filter** um: Gezeichnet wird `NOT (<Bereich>)`,
  also alles außer dem Bereich, halbdurchsichtig über der Karte. Damit bleibt es
  eine gewöhnliche Kartenebene — kein Canvas-Kunststück, kein Worker.

  Zwei Wege dahin waren falsch, beide der Vollständigkeit halber:

  * Einen Schleier auf die Karten-Leinwand malen und den Bereich mit
    `destination-out` ausschneiden entfernt alles, was vorher auf dieselbe
    Leinwand gezeichnet wurde — **auch die Karte**. Der gewählte Bezirk kam
    schneeweiß heraus.
  * Das Bild des Bereichs über `ol/source/Raster` umkehren rendert im Portal
    gar nichts.

  Was außerhalb des Layers liegt, behält seine Farben: Dort sind keine Daten,
  die zu dämpfen wären, und den Basiskarten-Hintergrund des Umlands zu
  verschleiern sagt nichts aus.

  Bei `mask` ist `areaColor` die Farbe des **Schleiers**, nicht die des
  Bereichs: ein ruhiges Dunkel passt hier, wo für `highlight` ein Signalton
  richtig war.

* **Wie kräftig**, als `areaOpacity` zwischen 0 und 1. Ohne Angabe behält jeder
  Stil seinen eigenen Wert — 0.4 für `highlight`, 1 für `border`, 0.45 für
  `mask`. Werte außerhalb von 0 bis 1 werden verworfen: `45` ist eher eine
  verrutschte Prozentangabe als eine Absicht, und das Ergebnis wäre eine
  übermalte Karte.

### Where to move the map

The service offers no cheap extent: `resultType=hits` and `count=0` answer
without a bounding box, and the `bbox` of a GeoJSON response only covers the
features it actually delivers — a megabyte for one district.

So the extent is read out of a picture. `js/areaExtent.js` requests the area at
300 pixels wide — always **filled**, whatever the map shows: that image is
measured, not looked at, and an outline would leave its inside blank and takes the outermost non-transparent pixels,
in **two passes**: first across the whole layer, then across what that found.
Measured for `bezirk='Mitte'`:

| | Bild | Auflösung | Abweichung |
|---|---|---|---|
| Pass 1 | 2.7 KB | 160 m/px | ≤ 430 m |
| Pass 2 | 5.4 KB | 34 m/px | ≤ 66 m |

Two requests, 8 KB, and the result never falls short of the true extent — the
error is always outward, so nothing gets clipped off the view.

The extent of the layer that pass 1 needs costs nothing: it is the
`ows:WGS84BoundingBox` of the feature type, already in the capabilities the
availability check fetches, transformed into the map's projection.

**One trap worth knowing:** this service reads the `bbox` **easting first**, even
in WMS 1.3.0, where the axis order of EPSG:25833 would put northing first. A
swapped extent is not rejected — it comes back as a silently empty image.

### Readable attribute names

The dropdowns do not show raw column names. `DescribeFeatureType` documents each
attribute in `<xsd:annotation><xsd:documentation>`, and `parseAttributes` keeps
that as `title`, so the selects read `Flächengröße [m²] (flalle)` or
`Bezirksname (bezirk)`. The option value stays the technical name, since that is
what `CQL_FILTER`, `valueReference` and `propertyName` need.

Coverage is good but not guaranteed — on the Flächennutzung layers 22 of 23
attributes are documented — so `title` falls back to the raw name where a service
documents nothing. Nothing else in the Masterportal reads these annotations; the
usual label channel (`gfiAttributes` as an object) is `"showAll"` for every
Umweltatlas layer and therefore carries no labels.

The `js/` modules are free of Vue and Vuex, and the request functions are
split from the parsing/aggregation ones (`parseAttributes`,
`parsePropertyValues`, `parseNumberMatched`, `aggregateCounts`,
`aggregateAreas`), so all of the logic is unit-testable without a network.

## Workflow in the UI

```
Layer            [ab 2021 – Reale Nutzung … ▾]   (ⓘ Warum fehlen Layer?)
Bereich          [Keine Einschränkung ▾]  → bei "Bezirk": [Mitte        ]
Auswerten        [Bitte Attribut wählen ▾]
Ergebnis als     [ Anzahl ][ Fläche ]
▸ Weitere Filter (optional)
26.397 Objekte werden ausgewertet
[ Auswertung starten ]
```

The form is meant to be read as a sequence of decisions, so anything that only
explained how the tool is built was removed rather than reworded. The rule
applied throughout: **a help text stays only if it changes what the user does.**
What is left are the feature count, the "more than N features" warning, the
"list is incomplete" warning and the reason a layer cannot be analysed - each
one changes a decision. The WMS/WFS background moved behind the
"Warum fehlen Layer?" info toggle.

Several steps decide for the user instead of asking:

| Situation | Behaviour |
|---|---|
| Exactly one layer active | selected automatically |
| Value field focused | values are fetched then, no button |
| One attribute could hold the area | chosen silently, the select is not shown |
| No attribute could hold the area | "Fläche" is not offered at all |
| Preset configured for the layer | area, attribute and mode prefilled |

**Bereich** offers the configured `filterAttributes` the layer actually has, by
their readable name ("Bezirksname"), because here the user is picking a place,
not a column. **Auswerten** and **Weitere Filter** show `Titel (technischer
Name)`, because there the technical name is what ends up in the request and is
worth seeing. Both filters are combined with `AND`.

## Loading the filter values

WFS has no `DISTINCT`, so the values offered under "Wert" have to be derived.
Two ways are used, in order:

1. **The whole column in one request** (`GetPropertyValue`), deduplicated in the
   browser. One request, and the response compresses extremely well (73x for a
   2.6 MB column).
2. **One value at a time**, if that request fails. Sorted ascending, one feature,
   everything greater than the value read before:

   ```
   GetPropertyValue&valueReference=bezirk&sortBy=bezirk&count=1
                   &CQL_FILTER=bezirk>'Mitte'   ->  "Neukölln"
   ```

   Each response is a few hundred bytes, which is what makes this work where the
   bulk request does not. Measured on the Flächennutzung layer: all 12 districts
   in 13 requests and 3.9 KB, against 2.5 MB and an HTTP 502 for the bulk request.

The fallback is needed because the GDI Berlin service answers the bulk request
with **HTTP 502** for some attributes of large layers — reproducibly for `bezirk`
and `bez` on `d_reale_nutzung_vegetationsbedeckung_2021` (26 397 features), while
`nutzung` and `typ` on the very same layer succeed. It is not transient: it
reproduces on every attempt, and only for large responses.

Both paths stop at `maxFilterValues` (default 50). An attribute can have as many
distinct values as there are features, and the stepwise path costs one request
per value, so the limit bounds both the list and the wait. When it is reached the
user gets a **warning that the list is incomplete** — the value field is a
free-text input with the list as suggestions, so an unlisted value can always be
typed.

If both paths fail, that is not treated as an analysis error: a hint appears
saying the value has to be typed, and filtering works exactly as before.

### A note on parsing

Reading a whole column means walking tens of thousands of XML elements.
`parsePropertyValues` looks the element up by local name
(`getElementsByTagNameNS("*", attribute)`) rather than scanning every element in
the document — measured 4.2x faster on a 2.6 MB response, with identical output.

## Adding more analyses

`analyseByCount` / `analyseByArea` in `js/wfsAnalysis.js` both return the same
shape, so a further mode mainly means another aggregation:

```js
{unit: "count" | "area", total: Number,
 categories: [{label: String, value: Number, share: Number}]}
```

`getters.canAnalyse` gates the start button, and `getters.isAnalysable` gates
the whole analysis section — keep new work behind them so it can never run
against a layer without a confirmed WFS.

## Registration

```js
// portal/umweltatlas/config.js
addons: ["wfsAnalyzer"],
```

```json
// portal/umweltatlas/config.json — secondaryMenu.sections
{ "type": "wfsAnalyzer" }
```

```json
// addons/addonsConf.json
{ "wfsAnalyzer": { "type": "tool" } }
```

## Testing

```
npm test                                    # whole repo, includes this add-on
npx mochapack --recursive --webpack-config devtools/webpack.test.js \
  --file devtools/tests/setupUnitTests.js \
  "./addons/wfsAnalyzer/**/*.spec.js"       # this add-on only
```

* `tests/unit/js/wfsLookup.spec.js` — CSW/WFS discovery and feature-type matching.
* `tests/unit/js/wfsAnalysis.spec.js` — URL and CQL building, schema/response
  parsing, count and area aggregation.
* `tests/unit/js/formatResult.spec.js` — units, number formatting, chart grouping.
* `tests/unit/js/analysisConfig.spec.js` — preset normalisation and config merging.
  `tests/unit/js/wfsAnalysis.spec.js` also covers `fetchDistinctValues`: the bulk
  path, the stepwise fallback, the CQL it steps with, and both truncation cases.
* `tests/unit/store/actionsWfsAnalyzer.spec.js` — `preselectAttributes`: preset
  application, case-insensitive matching, and every rejection path.
* `tests/unit/components/WfsAnalyzer.spec.js` — the workflow: layer dropdown,
  check states, analysis form, all three result views.

The logic was additionally verified against the **live** GDI Berlin services
during development, including the two use cases above (Friedrichshain-Kreuzberg
= 16.15 km², `Wohnnutzung` 34.8 % by area but 40.7 % by count), the 11-WFS
`ua_boden_*` bundle, a WMTS basemap with no WFS at all, and the 502 behaviour
described above.
