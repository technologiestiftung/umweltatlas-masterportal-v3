
const fs = require('fs');
const servicesPath = "./portal/umweltatlas/resources/services-internet.json"
const servicesLocal = JSON.parse(fs.readFileSync(servicesPath, "utf8"));

const configPath = "./portal/umweltatlas/resources/config.json"
const config = JSON.parse(fs.readFileSync(configPath, "utf8"));
const configFolders = config.layerConfig.subjectlayer

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
    // Use the find method to locate the first object whose 'ids' array includes the targetId
    return objects.find((object) => object.id.includes(targetId));
}

async function fetchProcessAndWriteData() {
    try {
        const response = await fetch('https://gdi.berlin.de/viewer/_shared/resources/services-internet.json');
        const servicesGeoportal = await response.json();

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
        
            if (!newServiceData) {
                newServices.push(el);
            } else {
                newServices.push({
                    ...newServiceData,
                    ...dataToKeep,
                });
            }
        });


        const allIds = getAllIds(newServices)
        console.log('allIds',allIds);
        

        newServices = removeDuplicates(newServices)



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


