
/**
 * Checks if a value is an html.
 * @param {string} value The value to check.
 * @example ```<tag/>```
 * @returns {boolean} True if the input is an html.
 */
 export function isHTML (value) {
    const regExp = new RegExp(/^<\/?[a-z][\s\S]*>$/i);

    return regExp.test(value);
}

export default {isHTML};
