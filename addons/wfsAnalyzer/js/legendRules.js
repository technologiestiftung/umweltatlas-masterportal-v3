/**
 * Turns the legend of a WMS into the classes the map draws, so the analysis can
 * count what the user actually sees.
 *
 * A thematic map is a classification, not an attribute: the density map of
 * Berlin is drawn in classes like `ew_ha > '0' AND ew_ha <= '4'`, a range that
 * exists nowhere as a column. Those filters are valid CQL exactly as the legend
 * writes them - verified against the service, quoted numbers included - so the
 * legend can be handed to the WFS unchanged.
 * @module addons/wfsAnalyzer/js/legendRules
 */

import {readRuleColor, repairEncoding} from "./legendColors";

/**
 * Reads the classes a legend describes.
 *
 * Rules without a filter are skipped: they paint everything and describe no
 * class of their own. The label comes from `title`, which the services almost
 * never set, and otherwise from `name`, which carries exactly the text of the
 * printed legend - "1 - 4", "5 - 30" for a range, a bare code like "10" where
 * the map is styled by one.
 *
 * A filter that repeats yields one class, not several: a style may draw the
 * same features again for a hatching or an outline, and each of those is a rule
 * of its own. `bodengesellschaften2020` has 133 rules over 78 distinct filters;
 * counting all of them would ask the service the same question twice and show
 * empty rows for the repeats.
 * @param {Object|String} legend the parsed legend or its raw text.
 * @returns {Object[]} the classes as {label, filter, color}.
 */
export function parseLegendClasses (legend) {
    let document = legend;

    if (typeof legend === "string") {
        try {
            document = JSON.parse(legend);
        }
        catch (error) {
            return [];
        }
    }

    const entries = Array.isArray(document?.Legend) ? document.Legend : [],
        byFilter = new Map();

    entries
        .flatMap((entry) => Array.isArray(entry?.rules) ? entry.rules : [])
        .map((rule) => ({
            label: repairEncoding(String(rule?.title || rule?.name || "").trim()),
            filter: repairEncoding(stripBrackets(rule?.filter)),
            color: readRuleColor(rule)
        }))
        .filter((legendClass) => legendClass.filter !== "" && legendClass.label !== "")
        .forEach((legendClass) => {
            const seen = byFilter.get(legendClass.filter);

            // The first rule wins, but a colour is worth taking from a later
            // one: the fill may come after an outline that has none.
            if (!seen) {
                byFilter.set(legendClass.filter, legendClass);
            }
            else if (seen.color === "" && legendClass.color !== "") {
                seen.color = legendClass.color;
            }
        });

    return [...byFilter.values()];
}

/**
 * The legend writes its filters in brackets: `[woz = '10']`. Everything inside
 * is CQL as it stands.
 * @param {*} filter the filter of a rule.
 * @returns {String} the bare expression.
 */
function stripBrackets (filter) {
    const text = String(filter ?? "").trim();

    return text.startsWith("[") && text.endsWith("]")
        ? text.slice(1, -1).trim()
        : text;
}

/**
 * The equality and null tests a filter makes, per column.
 * @param {String} filter the filter of a class.
 * @returns {Map<String, Object>} the tests as {values, isNull}.
 */
function testsOf (filter) {
    const tests = new Map(),
        text = String(filter ?? "");

    /**
     * @param {String} attribute name of the column.
     * @returns {Object} the tests recorded for it so far.
     */
    function get (attribute) {
        if (!tests.has(attribute)) {
            tests.set(attribute, {values: new Set(), notValues: new Set(), isNull: false});
        }
        return tests.get(attribute);
    }

    for (const [, attribute, operator, quoted, bare] of
        text.matchAll(/(\w+)\s*(<>|<=|>=|=|<|>)\s*(?:'([^']*)'|([\w.]+))/g)) {
        if (operator === "=") {
            get(attribute).values.add(quoted ?? bare);
        }
        if (operator === "<>") {
            get(attribute).notValues.add(quoted ?? bare);
        }
    }
    for (const [, attribute, not] of text.matchAll(/(\w+)\s+IS\s+(NOT\s+)?NULL/gi)) {
        if (!not) {
            get(attribute).isNull = true;
        }
    }

    return tests;
}

/**
 * Whether two classes can be shown to never match the same feature.
 *
 * Conservative on purpose: it only says yes where one column settles it - two
 * different values, or a value against a null test. Anything it cannot prove
 * counts as a possible overlap.
 * @param {String} filterA the first filter.
 * @param {String} filterB the second filter.
 * @returns {Boolean} true if the two cannot overlap.
 */
export function cannotOverlap (filterA, filterB) {
    const testsB = testsOf(filterB);

    for (const [attribute, a] of testsOf(filterA)) {
        const b = testsB.get(attribute);

        if (!b) {
            continue;
        }
        if (a.values.size > 0 && b.values.size > 0 &&
            [...a.values].every((value) => !b.values.has(value))) {
            return true;
        }
        if ((a.isNull && b.values.size > 0) || (b.isNull && a.values.size > 0)) {
            return true;
        }
        // "grz <> '110'" and "grz = '110'" are the two halves of one split.
        if ([...b.values].some((value) => a.notValues.has(value)) ||
            [...a.values].some((value) => b.notValues.has(value))) {
            return true;
        }
    }

    return false;
}

/**
 * Makes the classes mutually exclusive, the way the map resolves them.
 *
 * Rules of a style are all drawn, in order, so a feature matching several of
 * them shows the colour of the last one. Counting them as they stand would
 * count such a feature more than once: the 23 rules of
 * `d_reale_nutzung_vegetationsbedeckung_2021` matched 28 286 times for 26 397
 * features. Excluding every later rule brings the sum to exactly 26 397.
 *
 * Only rules that could actually overlap are excluded. That keeps the filters
 * short, and it matters more than it looks: the gateway in front of the service
 * rejects a filter that puts `IS NULL` after a quoted value, so a needless
 * `NOT (woz IS NULL AND …)` appended to `woz = '10'` would have the request
 * blocked outright.
 * @param {Object[]} classes the classes as parsed.
 * @returns {Object[]} the classes with an exclusive `filter`.
 */
export function buildExclusiveFilters (classes) {
    return classes.map((legendClass, index) => {
        const later = classes.slice(index + 1)
            .filter((other) => !cannotOverlap(legendClass.filter, other.filter))
            .map((other) => `NOT (${other.filter})`);

        return {
            ...legendClass,
            filter: [`(${legendClass.filter})`, ...later].join(" AND ")
        };
    });
}

/**
 * Combines two CQL filters, either of which may be empty.
 * @param {String} filterA the first filter.
 * @param {String} filterB the second filter.
 * @returns {String} the combined filter.
 */
export function combineFilters (filterA, filterB) {
    return [filterA, filterB]
        .filter((filter) => typeof filter === "string" && filter.trim() !== "")
        .map((filter) => `(${filter})`)
        .join(" AND ");
}

/**
 * The attribute a class filters on, if it filters on exactly one by equality.
 *
 * Only then can a bare code be traded for readable text, so this is what
 * decides whether the plain-text lookup is attempted at all.
 * @param {String} filter the filter of a class.
 * @returns {Object|null} the equality as {attribute, value}.
 */
export function readEquality (filter) {
    const match = (/^\s*(\w+)\s*=\s*'?([^'()]*?)'?\s*$/).exec(String(filter ?? ""));

    return match ? {attribute: match[1], value: match[2]} : null;
}
