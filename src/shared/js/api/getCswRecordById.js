import axios from "axios";

/**
 * @typedef {Object} MetadataContact
 * @property {String} [name] - Organization name.
 * @property {String[]} [positionName] - Position names.
 * @property {String} [individualName] - Individual person name.
 * @property {String} [street] - Street / delivery point.
 * @property {String} [postalCode] - Postal code.
 * @property {String} [city] - City.
 * @property {String} [country] - Country.
 * @property {String} [phone] - Phone number.
 * @property {String} [email] - Email address.
 */

/**
 * API to get metadata from csw.
 * @module shared/js/api/getCswRecordById
 */

/**
 * Gets the record by Id.
 * @param {String} url csw-url.
 * @param {String} mdid id of the dataset.
 * @returns {Object} record of the metadata or null if no record was found.
 */
function getRecordById (url, mdid) {
    const urlObject = new URL(url),
        params = new URLSearchParams({
            service: "CSW",
            request: "GetRecordById",
            version: "2.0.2",
            elementSetName: "full",
            outputSchema: "http://www.isotc211.org/2005/gmd",
            id: mdid
        });

    urlObject.search = params.toString();

    return axios.get(urlObject.href)
        .then(response => {
            if (response?.data) {
                return getMetadata(response.data);
            }

            return null;
        })
        .catch(error => {
            console.error("Error while loading metadata via GetRecordById:", error);
            return null;
        });
}

/**
 * Returns the metadata (title, abstract, constraints, frequence, dates and contact).
 * @param {Object} json The metadata.
 * @returns {Object} The metadata.
 */
function getMetadata (json) {
    const title = parseTitle(json),
        constraints = parseConstraints(json),
        frequency = parseFrequenzy(json),
        abstractText = parseAbstract(json),
        downloadLinks = parseDownloadLinks(json),
        pointOfContact = parseContactByRole(json, "pointOfContact"),
        publisher = parseContactByRole(json, "publisher"),
        owner = parseContactByRole(json, "owner"),
        dateRevision = parseDate(json, "revision"),
        datePublication = parseDate(json, "publication");

    return {
        title,
        constraints,
        frequency,
        abstract: abstractText,
        downloadLinks,
        pointOfContact,
        publisher,
        owner,
        dateRevision,
        datePublication
    };
}

/**
 * Gets the identification metadata.
 * @param {Object} json The metadata.
 * @returns {Object} The identification metadata.
 */
function getMdIdentification (json) {
    return json?.["gmd:MD_Metadata"]?.["gmd:identificationInfo"]?.["gmd:MD_DataIdentification"]
        || json?.["gmd:MD_Metadata"]?.["gmd:identificationInfo"]?.["srv:SV_ServiceIdentification"];
}

/**
 * Gets the title of the metadata.
 * @param {Object} json The metadata.
 * @returns {String} The title.
 */
function parseTitle (json) {
    const title = getMdIdentification(json)?.["gmd:citation"]?.["gmd:CI_Citation"]?.["gmd:title"]?.["gco:CharacterString"];

    return typeof title === "string" ? title : null;
}

/**
 * Gets the constraints of the metadata.
 * @param {Object} json The metadata.
 * @returns {String} The constraints.
 */
function parseConstraints (json) {
    const constraints = getMdIdentification(json)?.["gmd:resourceConstraints"];

    if (constraints) {
        const useLimitation = constraints["gmd:MD_LegalConstraints"]?.["gmd:useLimitation"]?.["gco:CharacterString"];

        if (typeof useLimitation === "string") {
            return useLimitation;
        }
    }
    return null;
}

/**
 * Gets the abstract of the metadata.
 * @param {Object} json The metadata.
 * @returns {String} The abstract.
 */
function parseAbstract (json) {
    const abstractValue = getMdIdentification(json)?.["gmd:abstract"]?.["gco:CharacterString"];

    if (typeof abstractValue === "string") {
        return abstractValue;
    }
    return null;
}

/**
 * Gets the frequenzy of the metadata.
 * @param {Object} json The metadata.
 * @returns {String} The frequenzy.
 */
function parseFrequenzy (json) {
    const frequency = getMdIdentification(json)?.["gmd:resourceMaintenance"]?.["gmd:MD_MaintenanceInformation"]?.["gmd:maintenanceAndUpdateFrequency"]?.["gmd:MD_MaintenanceFrequencyCode"];

    if (typeof frequency === "object" && typeof frequency.$?.codeListValue === "string") {
        return frequency.$.codeListValue;
    }
    return null;
}

/**
 * Gets the date of the metadata.
 * @param {Object} json The metadata.
 * @param {String} type The type of date (revision, publication, creation).
 * @returns {String} The date.
 */
function parseDate (json, type) {
    const dateNodes = getMdIdentification(json)?.["gmd:citation"]?.["gmd:CI_Citation"]?.["gmd:date"];

    let dateValue = null;

    if (Array.isArray(dateNodes)) {
        dateNodes.forEach(dateNode => {
            const ciDate = dateNode?.["gmd:CI_Date"],
                dateType = ciDate?.["gmd:dateType"]?.["gmd:CI_DateTypeCode"];

            if (dateType?.$?.codeListValue === type) {
                const dateStr = ciDate?.["gmd:date"]?.["gco:Date"];

                if (typeof dateStr === "string") {
                    dateValue = dateStr;
                }
            }
        });
    }

    return dateValue;
}

/**
 * Gets the download links of the metadata.
 * @param {Object} json The metadata.
 * @returns {Object[]} The download links.
 */
function parseDownloadLinks (json) {
    const distributionInfo = json?.["gmd:MD_Metadata"]?.["gmd:distributionInfo"]?.["gmd:MD_Distribution"],
        transferOptions = distributionInfo?.["gmd:transferOptions"],
        downloads = [];

    if (!transferOptions) {
        return null;
    }

    const handleTransferOption = option => {
        const onLine = option?.["gmd:MD_DigitalTransferOptions"]?.["gmd:onLine"];

        if (Array.isArray(onLine)) {
            onLine.forEach(o => {
                const url = o?.["gmd:CI_OnlineResource"]?.["gmd:linkage"]?.["gmd:URL"],
                    name = o?.["gmd:CI_OnlineResource"]?.["gmd:name"]?.["gco:CharacterString"];

                if (typeof url === "string" && typeof name === "string") {
                    downloads.push({
                        linkName: name,
                        link: url
                    });
                }
            });
        }
    };

    if (Array.isArray(transferOptions)) {
        transferOptions.forEach(handleTransferOption);
    }
    else {
        handleTransferOption(transferOptions);
    }

    return downloads.length > 0 ? downloads : null;
}

/**
 * Gets role of a contact entry.
 * @param {Object} contact The contact entry.
 * @returns {String|null} The role or null.
 */
function getRoleOfContact (contact) {
    const roleCode = contact?.["gmd:CI_ResponsibleParty"]?.["gmd:role"]?.["gmd:CI_RoleCode"];

    return roleCode?.$?.codeListValue || null;
}

/**
 * Parses all contacts with a given role into an array of contact objects.
 *
 * @param {Object} json The metadata.
 * @param {String} role The role to filter ("pointOfContact", "publisher", "owner").
 * @returns {MetadataContact[]} Array of contacts (may be empty).
 */
function parseContactByRole (json, role) {
    const mdIdentification = getMdIdentification(json),
        pointOfContacts = mdIdentification?.["gmd:pointOfContact"];

    if (!pointOfContacts) {
        return [];
    }

    const contacts = [];

    const pushContact = ciResponsibleParty => {
        if (!ciResponsibleParty) {
            return;
        }

        const getText = node => node?.["gco:CharacterString"] || null,
            individualName = getText(ciResponsibleParty["gmd:individualName"]),
            orgName = getText(ciResponsibleParty["gmd:organisationName"]),
            positionName = getText(ciResponsibleParty["gmd:positionName"]),
            contactInfo = ciResponsibleParty["gmd:contactInfo"]?.["gmd:CI_Contact"],
            address = contactInfo?.["gmd:address"]?.["gmd:CI_Address"],
            phone = contactInfo?.["gmd:phone"]?.["gmd:CI_Telephone"]?.["gmd:voice"]?.["gco:CharacterString"] || "",
            street = address?.["gmd:deliveryPoint"]?.["gco:CharacterString"] || "",
            postalCode = address?.["gmd:postalCode"]?.["gco:CharacterString"] || "",
            city = address?.["gmd:city"]?.["gco:CharacterString"] || "",
            country = address?.["gmd:country"]?.["gco:CharacterString"] || "",
            email = address?.["gmd:electronicMailAddress"]?.["gco:CharacterString"] || "";

        // Don't add completely empty contacts
        if (!individualName && !orgName && !email && !phone) {
            return;
        }

        contacts.push({
            individualName: individualName || undefined,
            name: orgName || undefined,
            positionName: positionName ? [positionName] : [],
            street,
            postalCode,
            city,
            country,
            phone,
            email
        });
    };

    const handleEntry = pocEntry => {
        if (!pocEntry?.["gmd:CI_ResponsibleParty"]) {
            return;
        }

        if (getRoleOfContact(pocEntry) === role) {
            pushContact(pocEntry["gmd:CI_ResponsibleParty"]);
        }
    };

    if (Array.isArray(pointOfContacts)) {
        pointOfContacts.forEach(handleEntry);
    }
    else {
        handleEntry(pointOfContacts);
    }

    return contacts;
}

export default {
    getRecordById
};
