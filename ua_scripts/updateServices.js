
const fs = require('fs');
const servicesPath = "./portal/umweltatlas/resources/services-internet.json"
const servicesLocal = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

const configPath = "./portal/umweltatlas/config.json"
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const configFolders = config.layerConfig

let servicesGeoportal = undefined

let newServices = []

function getAllIds(input) {
    let ids = [];

    function traverse(item) {
        if (Array.isArray(item)) {
            // If the item is an array, traverse each element
            item.forEach(traverse);
        } else if (item && typeof item === "object") {
            // If the item is an object, check for an "id" property
            if ("id" in item) {
                ids.push(item.id);
            }
            // Recursively traverse its properties
            Object.values(item).forEach(traverse);
        }
    }

    traverse(input);
    return ids;
}


function removeDuplicates(array) {
    const seenIds = new Set();
    return array.filter(item => {
        if (seenIds.has(item.id)) {
            return false;
        } else {
            seenIds.add(item.id);
            return true;
        }
    });
}

function findObjectByIds(objects, targetId) {
    // Use the find method to locate the first object whose 'id' matches the targetId exactly
    return objects.find(object => object.id === targetId);
}

async function fetchProcessAndWriteData() {
    try {
        const response = await fetch('https://gdi.berlin.de/viewer/_shared/resources/services-internet.json');
        servicesGeoportal = await response.json();

        servicesLocal.forEach((el) => {
            const dataToKeep = {
                ...(el?.uaInfoURL && { uaInfoURL: el.uaInfoURL }),
                ...(el?.uaDownload && { uaDownload: el.uaDownload }),
                ...(el?.uaContact && { uaContact: el.uaContact }),
            };

            const newServiceData = findObjectByIds(servicesGeoportal, el.id);
            if(newServiceData?.layerAttribution){
                delete newServiceData.layerAttribution
            }
        
            // add an exception for this layer. Do not update the name 
            if(el.id === "basemap_raster_grau"){                
                newServiceData.name = "Hintergrundkarte (grau)"
                newServiceData.name_lang = "Hintergrundkarte (Web Raster Grau)"
            }

            if (!newServiceData) {
                newServices.push(el);
            } else {
                newServices.push({
                    ...newServiceData,
                    ...dataToKeep,
                });
            }

        });

        // check if there are new layers in the config and add them if they are missing
        const allIdsFromConfig = getAllIds(configFolders)
        allIdsFromConfig.forEach(id => {
            
            const newServiceData = findObjectByIds(servicesLocal, id);
            if(!newServiceData){
                const newServiceData = findObjectByIds(servicesGeoportal, id);
            
                if(newServiceData && newServiceData?.layerAttribution){
                    if(newServiceData?.layerAttribution){
                        delete newServiceData.layerAttribution
                    }
                    newServices.push(newServiceData)
                    console.log('added new service from config.json to services-internet.json: ',id);
                }
            }
        });
        
        newServices = removeDuplicates(newServices)

        // remove ids from services which are not used any longer
        newServices = newServices.filter(s => {
            const isExactMatch = allIdsFromConfig.some(id => id.trim().toLowerCase() === s.id.trim().toLowerCase());
            if (!isExactMatch) {
                console.log('removed following unused service: ', s.id);
                return false; // Exclude this item
            }
            return true; // Keep this item
        });

        // write the datato the umweltatlas portal
        fs.writeFile(
            servicesPath,
            JSON.stringify(newServices, null, 2),
            (err) => {
                console.log("Services updated and written to: " + servicesPath);
            }
        );


    } catch (error) {
        console.error('Error:', error);
    }
}

fetchProcessAndWriteData();


