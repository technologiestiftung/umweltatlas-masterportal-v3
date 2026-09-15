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
(`typ: "WMS"`) — the map only ever requests rendered images, never features.
Whether a WFS also exists for the same dataset is not recorded on the layer
itself; it has to be discovered through the layer's metadata record:

```
layer.datasets[0] = {md_id, csw_url}
        │
        ▼
CSW GetRecordById (csw_url + md_id)
        │  → list of gmd:CI_OnlineResource entries (WMS, WFS, ATOM, PDF, …)
        ▼
WFS candidate URL(s)
        │
        ▼
WFS GetCapabilities
        │  → FeatureTypeList
        ▼
Does a FeatureType match this layer?  → yes: analysable / no: blocked
```

A metadata record can bundle a whole family of services (e.g. the various
`ua_boden_*` soil layers all point at the same record and list 11 WFS
entries), so finding *a* WFS in the metadata is not sufficient — the tool also
fetches the WFS's own capabilities and confirms it actually serves a
`FeatureType` for the selected layer before declaring it analysable.

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
        // Attributes that hold a precomputed area in square metres.
        areaAttributes: ["flalle", "flaeche", "shape_area", /* … */],
        // Warn above this many features.
        maxFeatures: 50000,
        // Categories shown in the charts before the rest is pooled as "other".
        maxChartCategories: 12,
        // Maximum number of filter values offered (and collected).
        maxFilterValues: 50,
        // Outlines drawn when an area is selected.
        boundaries: [{file: "bezirke", matchProperty: "namgem"}],
        // Per-layer defaults, matched on the EXACT layer id.
        presets: [
            {
                layerId: "ua_flaechennutzung:a_reale_nutzung_bebaute_flaechen_2021",
                filterAttribute: "bezirk",
                areaAttribute: "flalle",
                mode: "area",              // optional, "count" | "area"
                analyseAttribute: "woz_name"  // optional
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
* A preset never starts an analysis and never loads the filter values — the
  expensive requests stay behind the user's own click.

Suggested attributes that the selected layer actually has are listed in a
"Vorschläge" option group, all remaining attributes follow in a second group —
so the suggestions are a shortcut, never a restriction.

## The outline on the map

Selecting an area draws its boundary on the map. The geometry comes from a file
bundled with the add-on (`geodata/<file>.json`, EPSG:4326), and `boundaries`
says which property of that file carries the value:

```js
boundaries: [{file: "bezirke", matchProperty: "namgem"}]
```

**The lookup is by value, not by attribute name.** There is deliberately no list
of WFS attribute names to keep in sync: the value of the area selection is
looked up in `matchProperty`, and that is self-selecting. `bezirk` yields
"Mitte", "Pankow" … which `namgem` holds (12/12); `bez` yields the codes "01",
"02" … which it does not hold, so nothing is drawn - the right outcome.

Matching against *every* property instead would be actively wrong: the code
`bez = "11"` also appears as `lan = "11"` (the Land code), which would highlight
an arbitrary district.

The file is loaded through a dynamic `import()`, so its ~700 KB sit in their own
chunk and are only fetched once an area is actually picked. It must be a `.json`
file - webpack 4 handles `.json` natively but has no loader for `.geojson`, and
`addons/` is not copied into `dist/` (only `portal/<name>/` is, see
`devtools/tasks/buildFunctions.js:44`), so a runtime fetch from the add-on
folder would not work.

Drawing reuses the core: `Maps/placingPolygonMarker` (which replaces the
previous marker by itself) and `Maps/removePolygonMarker` on close. No styling
code is needed - this portal already defines `defaultMapMarkerPolygon` in
`portal/umweltatlas/resources/style_v3.json` as a red outline with a fully
transparent fill.

Adding another level later is one more entry, e.g.
`{file: "ortsteile", matchProperty: "nam"}`; the files are tried in order and
the first one that knows the value wins.

## Files

```
wfsAnalyzer/
├── index.js                        entry point (component + store + locales)
├── components/
│   ├── WfsAnalyzer.vue             layer picker, WFS check, analysis form
│   ├── AnalysisBarChart.vue        horizontal bars (plain elements)
│   ├── AnalysisPieChart.vue        pie (hand-built inline SVG arcs)
│   └── AnalysisTable.vue           full table incl. totals row
├── geodata/
│   └── bezirke.json                district outlines, EPSG:4326 (lazy chunk)
├── js/
│   ├── boundaryGeometry.js         outline lookup + reprojection
│   ├── wfsLookup.js                CSW → WFS discovery and confirmation
│   ├── wfsAnalysis.js              WFS requests + aggregation
│   ├── analysisConfig.js           defaults + presets, merged with Config.wfsAnalyzer
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

**No charting library is used** — the bar chart is sized `<div>`s, the pie
chart is inline SVG `<path>` arcs computed in the component, and the palette
lives in `js/formatResult.js`.

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
Bereich          [Ganzer Bereich ▾]  → bei "Bezirk": [Mitte        ]
Auswerten        [Bitte Attribut wählen ▾]
Ergebnis als     [ Anzahl ][ Fläche ]
▸ Weitere Filter (optional)
26.397 Objekte werden ausgewertet
[ Analyse starten ]
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
* `tests/unit/js/boundaryGeometry.spec.js` — outline lookup, including the
  `bez`/`lan` false positive that value matching avoids.
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
