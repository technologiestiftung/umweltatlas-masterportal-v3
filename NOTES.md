## Update Masterportal Code

Go to Actions on Github and run _Sync Bitbucket dev_vue to GitHub_
This will update the branch _bitbucket_dev_vue_ by pulling the code from https://bitbucket.org/geowerkstatt-hamburg/masterportal.git from the "main" branch called _dev_vue_.
Now you can merge the _bitbucket_dev_vue_ branch with the _main_ branch.

Merge main with bitbucket_dev_vue branch
Merge feat/add-new-portal with bitbucket_dev_vue branch
Then merge feat/add-new-portal with main

## Used Version

nvm use v20.12.2

## Migration can be done like so (not needed)

npm run migrateConfig source=old_v2_portal/umweltatlas dest=portal/umweltatlas

## canvas has to be deleted when installing

"canvas": "^2.11.2",

## removed prePushHook because it failed due to missing canvas library

    "prePushHook": "node ./node_modules/@masterportal/mpconfigparser/cli.js ./doc/config.json.md ./doc/config.json.de.md && eslint --max-warnings 0 \"./**/*.{vue,js}\" && npm run test",

# run dev

npm run start

# preview img basemap

if _tileMatrixSet_ is added then preview doesn't work
if _layerAttribution_ is added, info popup appears every time layer is added

