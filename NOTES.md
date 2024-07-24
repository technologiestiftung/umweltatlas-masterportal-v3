## Update Masterportal Code

Go to Actions on Github and run _Sync Bitbucket dev_vue to GitHub_
This will update the branch _bitbucket_dev_vue_ by pulling the code from https://bitbucket.org/geowerkstatt-hamburg/masterportal.git from the "main" branch called _dev_vue_.
Now you can merge the _bitbucket_dev_vue_ branch with the _main_ branch.

nvm use v20.12.2

## Migration Logs

npm run migrateConfig source=old_v2_portal/umweltatlas dest=portal/umweltatlas

> masterportal@3.0.0 migrateConfig
> node devtools/tasks/migrator/migrate.js source=old_v2_portal/umweltatlas dest=portal/umweltatlas

sourcePath= old_v2_portal/umweltatlas
destPath= portal/umweltatlas

############################# migrate #############################

--- ATTENTION ---
this version will not migrate the following tools: compareFeatures, saveSelection, quickHelp, addLayerRemotely, bauforum, boris, commuterFlows, cosi, fileImportAddon, formular, geoAnalyze, gfiOnAddress, hochWasserPrint, mietenspiegelFormular, modeler3D, oktagonKartenportal, quickResponseCode, refugeeHomes, resetTree, schoolRoutePlanning, sessionTool, showParcelGFI, tacticalMark, valuationPrint, verkehrsfunctions, vpiDashboard, vueAddon, wholeCityList, staticlinks, vcOblique, coord, styleWMS, addWMS

## removed deprecated tools are not migrated: searchByCoord, supplyCoord, parcelSearch, extendedFilter, wfsFeatureFilter

source: /Users/hns/hack/projects/umweltatlas-masterportal-v3/old_v2_portal/umweltatlas/config.json
destination: /Users/hns/hack/projects/umweltatlas-masterportal-v3/portal/umweltatlas/config.json

map parameters from config.js
mapView
portalFooter
controls
--- HINT: fill controls into expandable, to expand and collapse controlbar.
--- HINT: use control 'startModule' to start tool by control-icon.
tree
mainMenu
title
searchbar entry bkg
--- HINT: bkg removed deprecated property zoomToResult, configure resultEvents instead.
searchbar entry visibleVector
searchbar entry topicTree
searchbar entry visibleWfs
tools
legend
newDatasets
portalTitle
shareView
contact
news
about
--- HINT: about 'metaUrl' and 'metaId' have to be filled by user.
--- HINT: add nested folders to menu containing menu entries by using type 'folder'.
--- HINT: display HTML or excute action or open url by using type 'customMenuElement'.
secondaryMenu
tools
fileImport
measure
draw_old
coordToolkit
layerSlider
layerConfig
Baselayer
Fachdaten
ATTENTION - TODO for User --- remove from config.js by yourself: footer, defaultToolId, gfiWindow, scaleLine, tree.layerIDsToIgnore, tree.layerIDsToStyle, tree.metaIDsToMerge, tree.metaIDsToIgnore

SUCCESSFULLY MIGRATED: /Users/hns/hack/projects/umweltatlas-masterportal-v3/portal/umweltatlas
ATTENTION --- Removing of loader and logo in index.html failed! Must be done by user.
