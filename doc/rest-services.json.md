>**[Return to the Masterportal documentation](doc.md)**.

# rest-services.json

This is the file referred to by the *config.js* as `restConf`. It is read on Masterportal start-up and kept in memory. Modules may then refer to the web service definitions in it.

The file defines all web services that do not belong to OGC services like WMS and WFS; that is, all services not requested for visually representing data. See our **[master restConf file](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev/portal/basic/resources/rest-services-internet.json)** for an example.

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Unique `rest-services.json` entry ID|`"1"`|
|name|yes|String||Service name|`"CSW Summary"`|
|typ|yes|String||Service type|`"CSW"`|
|url|yes|String||Service URL|`"http://metaver.de/trefferanzeige?docuuid="`|


## Usually defined services

1. Print services
2. Metadata sources (CSW HMDK)
3. BKG geocoding service
4. Gazetteer URL
5. WPS
6. Email Services

In some scenarios different URLs are required, depending on whether requests are sent from an Intranet or the Internet. This can be solved by providing two files only differing in their service URLs. While filenames can be chosen freely, we suggest using these names:

* `rest-services-internet.json`
* `rest-services-intranet.json`

## `rest-services-internet.json` example file

```json
[
  {
    "id": "1",
    "name": "CSW HMDK Summary",
    "url": "http://metaver.de/csw?service=CSW&version=2.0.2&request=GetRecordById&typeNames=csw:Record&elementsetname=summary",
    "typ": "CSW"
  },
  {
    "id" : "2",
    "name" : "Metadata URL",
    "url" : "http://metaver.de/trefferanzeige?docuuid=",
    "typ" : "URL"
  }
]
```
## Print services

|Name|Required|Type|Default|Description|Example|
|----|--------|----|-------|-----------|-------|
|id|yes|String||Unique `rest-services.json` entry ID|`"1"`|
|name|yes|String||Service name|`"MapFishPrintService"`|
|typ|yes|String||Service type|`"Print"`|
|url|yes|String||Service URL|`"https://printbase.de/printfolder/"` or `"https://printbase.de/printfolder/print/"`|


```json
{
    "id" : "mapfish_internet",
    "name" : "MapFishPrintService",
    "typ": "Print",
    "url": "https://printbase.de/printfolder/"

}
```

## login

This module allows the user to login with an OIDC server. The retrieved access token is stored in cookies which can be used by the backend to deliver user-specific data (e.g. layers). Since the cookies are technically required to implement the login functionality, there is not corresponding cookie notice.

|Name|Required|Type|Default|Description|
|----|--------|----|-------|-----------|
|oidcAuthorizationEndpoint|yes|String||The oidc auth endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/auth".|
|oidcTokenEndpoint|yes|String||The oidc token endpoint, e.g. "https://idm.domain.de/auth/realms/REALM/protocol/openid-connect/token".|
|oidcClientId|yes|String||The oidc client, e.g. "masterportal" (must be created in your IDM, e.g. keycloak).|
|oidcScope|yes|String||The scope used for oidc, defaults to "profile email openid".|
|oidcRedirectUri|yes|String||The url to redirect the oidc process to - after login.|
|interceptorUrlRegex|yes|String||An regexp pattern that allows to specify urls the oidc token will be attached to.|

Make sure in keycloak the client is configured as follows:

```
Access Type: public
Standard Flow Enabled: ON
Valid Redirect URIs: <PORTAL URL, e.g. https://localhost/*>
Web Origins: <PORTAL HOST, e.g. https://localhost>
```

Specific ports are not allowed ports here. Especially, ports on localhost, e.g. `localhost:9001` will not work with keycloak since ports are not accepted in web origins.

In the section `OpenID Connect Compatibility Modes` activate `Use Refresh Tokens`. In the section `Advanced Settings` set `Proof Key for Code Exchange Code Challenge Method` to `S256`.

**Example:**

```json
{
  "login": {
      "oidcAuthorizationEndpoint": "https://idm.DOMAIN.de/auth/realms/REALM/protocol/openid-connect/auth",
      "oidcTokenEndpoint": "https://idm.DOMAIN.de/auth/realms/REALM/protocol/openid-connect/token",
      "oidcClientId": "masterportal",
      "oidcScope": "profile email openid",
      "oidcRedirectUri": "https://localhost/portal/basic/",
      "interceptorUrlRegex": "https?://localhost.*" // add authorization to all URLs that match the given regex
  }
}
```
