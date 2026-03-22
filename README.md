# Umweltatlas Berlin - Masterportal v3

This repository contains the customized version 3 of the [Masterportal](https://bitbucket.org/geowerkstatt-hamburg/masterportal) for the **[Umweltatlas Berlin](https://www.berlin.de/umweltatlas/)** (Environmental Atlas of Berlin).

The Umweltatlas is a metadata portal for spatially-referenced environmental data. This web application serves as a [map-centric entry point](https://gdi.berlin.de/viewer/umweltatlas/karten/) to interact with this data.

The Masterportal is an open-source tool-kit for creating geo web applications based on [OpenLayers](https://openlayers.org) and [Vue.js](https://vuejs.org/). This repository takes the upstream Masterportal code and applies specific customizations—like custom Vue components, heavily redesigned layer information modals, custom branding, and automated data service updates—to fit the requirements of the Umweltatlas Berlin.

## Development and Setup

**Requirements:**
- Node.js (Version `22.19.0`)

**Installation & Local Server:**
```bash
npm install
npm run start
```
The local development server will start, allowing you to preview the application at `https://localhost:9001/portal/umweltatlas/`.

**Building for Production:**
```bash
npm run build
```
The compiled files will be located in the `dist/` folder. The portal should be deployed pointing to the `dist/umweltatlas` directory.

## Documentation and Customizations

This repository contains minimal invasive changes to the upstream Masterportal code to prevent merge conflicts during future updates. Detailed information about the specific adaptations and configurations made for the Umweltatlas can be found in the following dedicated documentation files:

* 📖 **[UA_DOCS_Anpassungen.md](./UA_DOCS_Anpassungen.md)**
  Contains instructions for configuring the portal (`config.json`), managing server deployments, updating geospatial services automatically via GitHub actions, editing UI texts (`common.json`), and managing the news feed.

* ⚙️ **[UA_DOCS_Tech.md](./UA_DOCS_Tech.md)**
  Covers in-depth technical details about the build process, the exact Vue components that were introduced or modified (e.g., `LayerStartModal`, `UrlInput`, and the completely overhauled `LayerInformation`), CSS/UI adjustments, and how the codebase routinely syncs with the upstream Masterportal repository.

## Upstream Documentation

For broad, non-Umweltatlas-specific information regarding the Masterportal core framework, please refer to the official Masterportal resources:
* [Masterportal Documentation](https://www.masterportal.org/dokumentation)
* [Quick Start for Users](./docs/Setup/setup.md)
* [Developer Documentation](./docs/Dev/About.md)

---
## Credits & Data Responsibility

This application was developed by the **Technologiestiftung Berlin** on behalf of the **Senate Department for Urban Development, Building and Housing** (Senatsverwaltung für Stadtentwicklung, Bauen und Wohnen). 

All linked data is managed within the Spatial Data Infrastructure Berlin (Geodateninfrastruktur Berlin) and is under the responsibility of the Senate Department for Urban Development, Building and Housing.

---
*Based on the Masterportal Project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/)*
