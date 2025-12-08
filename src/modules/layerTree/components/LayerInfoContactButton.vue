<script>
import {mapActions, mapGetters} from "vuex";
import FlatButton from "../../../shared/modules/buttons/components/FlatButton.vue";

/**
 * Button to open contact module with specific email parameters relating to layer information
 * @module modules/layerTree/components/LayerInfoContactButton
 */
export default {
    name: "LayerInfoContactButton",
    components: {
        FlatButton
    },
    props: {
        /** current layer name */
        layerName: {
            type: String,
            required: true
        },
        /** component in which the contact button is in */
        previousComponent: {
            type: String,
            required: true
        }
    },
    computed: {
        ...mapGetters(["isModuleAvailable"]),
        ...mapGetters("Modules/LayerInformation", [
            "layerInfo",
            "pointOfContact",
            "publisher"
        ]),
        ...mapGetters("Modules/LayerTree", ["menuSide"]),
        ...mapGetters("Modules/Contact", {contactType: "type", contactName: "name"}),
        ...mapGetters("Modules/BaselayerSwitcher", [
            "topBaselayerId"
        ]),
        /**
         * Returns a single contact object to use in the contact module.
         * If pointOfContact / publisher are arrays, the first entry is used.
         * @returns {Object|null} Contact details.
         */
        contact () {
            const primary = Array.isArray(this.pointOfContact)
                ? this.pointOfContact[0]
                : this.pointOfContact;

            const fallback = Array.isArray(this.publisher)
                ? this.publisher[0]
                : this.publisher;

            return primary || fallback || null;
        },
        /**
         * Returns true if the contact module is configured in either of the menus.
         * @returns {Boolean} True if contact module is configured.
         */
        contactConfigured () {
            return this.isModuleAvailable(this.contactType);
        },
        /**
         * Returns info message to be given to the contact module.
         * @returns {String} info message.
         */
        infoMessage () {
            return this.$t("common:modules.layerInformation.contactInfoMessage") + this.layerName;
        },
        /**
         * Returns the mail subject containing the name of the layer to be given to the contact module.
         * @returns {String} info message.
         */
        mailSubject () {
            return this.$t("common:modules.layerInformation.mailSubject") + this.layerName;
        },
        /**
         * Returns the text containing the URL of the portal to be given to the contact module.
         * @returns {String} info message.
         */
        mailOriginHint () {
            const layerInfo = `{"layerInfo":{"id":"${this.layerInfo.id}"}}`;

            return this.$t("common:modules.layerInformation.mailOriginHint") + " <br>" +
                encodeURI(
                    window.location.href.toString().split("#")[0] +
                    `?MENU={"main":{"currentComponent":"layerInformation","attributes":${layerInfo}}}` +
                    `&LAYERS=[{"id":"${this.layerInfo.id}","visibility":true},{"id":"${this.topBaselayerId}","visibility":true}]`
                );
        }
    },
    methods: {
        ...mapActions("Menu", ["changeCurrentComponent"]),
        /**
         * Opens the contact module in the same menu where contact button is in.
         * @returns {void}
         */
        openContactModule () {
            if (!this.contact) {
                return;
            }

            const props = {
                name: this.$t(this.contactName),
                to: [
                    {
                        email: this.contact.email,
                        name: this.contact.name || this.contact.individualName || ""
                    }
                ],
                infoMessage: this.infoMessage,
                includeSystemInfo: false,
                subject: this.mailSubject,
                mailOriginHint: this.mailOriginHint,
                withTicketNo: false,
                noConfigProps: true,
                previousComponent: this.previousComponent,
                layerName: this.layerName
            };

            this.changeCurrentComponent({type: this.contactType, side: this.menuSide, props: props});
        }
    }
};
</script>

<template lang="html">
    <div
        id="'layer-component-sub-menu-contact-button' + layerName"
    >
        <FlatButton
            v-if="contactConfigured && contact"
            class="mb-3 openContactButton"
            :interaction="openContactModule"
            :text="$t('common:modules.about.contactButton')"
            icon="bi-envelope"
            :customclass="'btn-light'"
            :title="$t('common:modules.about.contactButton')"
        />
    </div>
</template>
