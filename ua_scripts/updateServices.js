
const fs = require('fs');
const servicesPath = "./portal/umweltatlas/resources/services-internet.json"
const servicesLocal = JSON.parse(fs.readFileSync(servicesPath, "utf8"));
let newServices = []

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


