# Masterportal

The Masterportal is a tool-kit to create geo web applications based on [OpenLayers](https://openlayers.org), [Vue.js](https://vuejs.org/). The Masterportal is Open Source Software published under the [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/License.txt).

The Masterportal is a project by [Geowerkstatt Hamburg](https://www.hamburg.de/geowerkstatt/).

## MasterPortal 3.0.0

After more than two years of refactorings we can proudly present the new major Release Masterportal 3.0.0! We completely removed backbonejs and jquery, moved to vue3 and vuex4 and rewrote the application-core. We redesigned the UI to match all the different usecases and usergroups. We have nearly all modules and tools working but still some work to do. Features still to be added/moved to the new version are the following:

* New Draw Module
* Different AddOns
* Theming
* Touchtable-UI
* Performance
* etc.

To try out the new version just checkout this tag and run "npm install" and "npm start". You'll find working configs under "portal" as usual.

Please be aware of the following:

**We appreciate hints, feedback and communication of bugs! Please use the Issuetracker and tag your issue with "v3.0.0"**

## Roadmap
Our further Roadmap is to work further on 3.0.0 and to release monthly minor releases. We will release a LTS version during the third quarter of 2024. We will support and fix bugs for V2.x until end of 2024.
### Masterportal 3.x
* 04.10.2023: Release MP 3.0 beta 1
* 18.12.2023: Release MP 3.0 beta 2
* 28.06.2024: Release MP 3.0 stable
* During the third quarter of 2024: Release MP 3.0 LTS

### Support for MP 2.x and MP 3.x
* Pull requests for function enhancements in core modules in version 2 are going to be reviewed from product maintenance until 30.06.2024. (The deadline is indicative for now and should be understood as a guideline)
* Our recommendation is to start new developments on Masterportal 3.x basis as soon as possible.
* Bugs are going to be fixed for V2.x until 31.12.2024.

## User section

* [Download](https://bitbucket.org/geowerkstatt-hamburg/masterportal/downloads/)
* [Quick start for users](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/setup.md)
* [Remote interface](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/remoteInterface/remoteInterface.md)
* [User documentation](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/doc.md)
* [User documentation online](https://www.masterportal.org/dokumentation)
* [Community board (User forum and issue tracker)](https://trello.com/c/qajdXkMa/110-willkommen)

## Developer section
### Community
* [Community board (Developer forum and issue tracker)](https://trello.com/c/qajdXkMa/110-willkommen)
### Contributing
* Contributors to the Masterportal are expected to act respectfully toward others in accordance with the [CODE_OF_CONDUCT.md](./CODE_OF_CONDUCT.md) for open source projects.
* Follow our [Developer documentation](doc/devdoc.md)
* First steps in the code: [Tutorial 01: Creating a new module (Scale switcher)](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/doc/tutorial.md)

#### Pull requests
* Your pull request must have:
    * An understandable detailed description
    * If necessary a test portal or test configurations
    * A changelog entry
    * A PrePushHook with no errors
    * Hints if your contribution contains adopted external code
    * Unit tests for new functions or updated tests for bugfixes

#### Contributor License Agreement
* Your contribution will be under [MIT License](https://bitbucket.org/geowerkstatt-hamburg/masterportal/src/dev_vue/License.txt)


[![Sauce Test Status](https://app.eu-central-1.saucelabs.com/buildstatus/geodatenanwendungen_gv.hamburg.de)](https://app.eu-central-1.saucelabs.com/builds/dfd7abc54af1493091fbeef1b6b48ca6)
