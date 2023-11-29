>**[Return to the Masterportal documentation](doc.md)**

[TOC]

# config.js

The `config.js` contains Masterportal configuration not directly related to UI or layers. For example, paths to other configuration files belong here. This file is usually placed next to the `index.html` and `config.json` files.

In the following, all configuration options are described. For all configuration options of type `object`, further nested options are linked and described in detail after the main table. You may also refer to **[this config.js example file](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src_3_0_0/dev_vue/portal/basic/config.js)**.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|alerting|no|**[alerting](#markdown-header-alerting)**||Overrides the alert module's default values.||

***

## alerting
Overrides the alert module's default values.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|fetchBroadcastUrl|no|String|`false`|The alerting module will initially use a linked configuration file from this URL, if set.|
|initialAlerts|no|**[initialAlerts](#markdown-header-alertinginitialAlerts)**||Alerts that are displayed when the portal is started|
|localStorageDisplayedAlertsKey|no|String|`"displayedAlerts"`|Arbitrary key used to store information regarding the alerting module in the browser's local storage.|

***

### alerting.initialAlerts
Alerts that are displayed when the portal is started.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|category|no|String|"Info"|Header text and, at the same time, reference value for grouping alerts of the same *category*.|
|confirmText|no|String|"mark as read"|Text of a clickable link to indicate the alert has been read. Only required when `mustBeConfirmed` is set to `true`.|
|content|yes|String|""|Message. May contain HTML.|
|displayFrom|no|Boolean/String|false|Time from which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|displayUntil|no|Boolean/String|false|Time to which the alert may be displayed. When set to `false`, no limitation is applied. Format: "YYYY-MM-DD HH-II-SS"|
|multipleAlert|no|Boolean|false|Flag indicating whether the alert should be added to the current alert list (true) or is shown as a single alert (false)|
|mustBeConfirmed|no|Boolean|false|Flag indicating whether the alert requires a manual read confirmation.|
|once|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once.|
|onceInSession|no|Boolean|false|If `false`, this alert may be shown on each visit. If `true`, it's only shown once in the current session.|
|reConfirmText|no|String|"show this message again"|Text for showing the alert again.|
|title|no|String|""|Title of an alert.|

***
