# Quick-Start Guide

This guide describes how to set up the Masterportal on your server and how to configure it to become your custom portal.

## Host an example application on your server

1. To set up your portal, please download the **[last stable version from Bitbucket](https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/examples.zip)** by clicking the link provided.

2. To publish your portal (e.g. to the Internet) it's required to host the portal with a web server. For this purpose, move the ZIP file to your web server (e.g. to the `htdocs` folder of an Apache server) and unpack the archive.

3. The folder `examples` holds the following file and folder structure:

    - Basic/
        - resources/
            - img/
                - ...
            - rest-services-internet.json
            - services-internet.json
            - style_v3.json
        - config.js
        - config.json
        - index.html
    - mastercode/
        - [version]/
            - css/
                - masterportal.css
            - img/
                - tools
                    - draw
                        - ... (svg files used by the draw tool)
                - Logo_Masterportal.svg
                - ajax-loader.gif
                - mapMarker.svg
            - js/
                - masterportal.js
            - locales/

    The folder *Basic* comes with an example application providing the portal-specific configuration files **[config.js](../User/Portal-Config/config.js.md)**, **[config.json](../User/Portal-Config/config.json.md)**, and the index.html.

    Also contained is the folder *resources* providing the global configuration files **[services.json](../User/Global-Config/services.json.md)**, **[rest-services.json](../User/Global-Config/rest-services.json.md)**, and **[style.json](../User/Global-Config/style.json.md)**, as well as the required images (folder *img*) of this portal instance.

     The folder *mastercode* contains the compressed JavaScript and CSS files of the Masterportal. Here, the folder *img* holds the logo and svg files used in the draw tool.

4. You may decide to change the name of the folder *examples*. Should you decide to do so, also change "examples" to your new folder name in the URLs that follow. The portal should now be available by following this link.
    - https://[web-server-name]/examples/Basic/index.html

## Configure example application

By following these steps you can modify the example application to become your custom portal:

1. If need be, change the global configuration files in the folder *resources* to add aerial view images of other regions, to add icons, to modify existing icons, and so on.

2. Please subsequently duplicate the folder *Basic* and rename it to your portal name, e.g. *my_portal*.

3. You may now modify the configuration files **[config.js](../User/Portal-Config/config.js.md)** and **[config.json](../User/Portal-Config/config.json.md)** within this new folder *my_portal*. For example, you may define which layers are to appear in the layer tree, configure the tools required, customize the baselayers, change the display name of the portal, and so on. For all options, please refer to the full documentation of the **[config.js](../User/Portal-Config/config.js.md)** and **[config.json](../User/Portal-Config/config.json.md)** files.

4. Your new portal may now be opened by navigating to the URL:
    - https://[web-server-name]/examples/my_portal/index.html
