import {createStore} from "vuex";
import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import sinon from "sinon";

import SearchBarResultListTopicTreeItemComponent from "../../../components/SearchBarResultListTopicTreeItem.vue";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/searchBar/components/SearchBarResultListTopicTreeItem.vue", () => {
    let addSelectedSearchResultsSpy,
        removeSelectedSearchResultsSpy,
        selectedSearchResults,
        store,
        wrapper;

    const searchResults = [
        {
            category: "Straße",
            id: "BeidemNeuenKrahnStraße",
            index: 0,
            name: "Bei dem Neuen Krahn",
            searchInterfaceId: "gazetteer",
            displayedInfo: "",
            icon: "bi-signpost",
            imagePath: "",
            toolTip: "toolTipAvailable",
            events: {
            }

        },
        {
            category: "Adresse",
            id: "BeidemNeuenKrahn2Adresse",
            index: 1,
            name: "Bei dem Neuen Krahn 2",
            searchInterfaceId: "gazetteer",
            displayedInfo: "",
            icon: "bi-signpost",
            imagePath: "",
            toolTip: undefined,
            events: {
            }
        }
    ];

    beforeEach(() => {
        addSelectedSearchResultsSpy = sinon.spy();
        removeSelectedSearchResultsSpy = sinon.spy();
        selectedSearchResults = [];

        store = createStore({
            namespaces: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        SearchBar: {
                            namespaced: true,
                            getters: {
                                selectedSearchResults: () => selectedSearchResults
                            },
                            mutations: {
                                addSelectedSearchResults: addSelectedSearchResultsSpy,
                                removeSelectedSearchResults: removeSelectedSearchResultsSpy
                            }
                        }
                    }
                }
            }
        });
    });

    afterEach(() => {
        sinon.restore();
    });

    describe("render elements", () => {
        it("should render result list topic tree item", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            expect(wrapper.find("#search-bar-result-list-topic-tree-item-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("span#search-bar-result-list-topic-tree-item-checkbox-BeidemNeuenKrahnStraße").exists()).to.be.true;
            expect(wrapper.find("label.search-bar-result-list-topic-tree-item-label").exists()).to.be.true;
            expect(wrapper.find("label.search-bar-result-list-topic-tree-item-label > span").exists()).to.be.true;
            expect(wrapper.find("label.search-bar-result-list-topic-tree-item-label > span").text()).to.equals("Bei dem Neuen Krahn");
        });
    });

    describe("addOrRemoveLayer", () => {
        it("should add a layer to selectedSearchResults", () => {
            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(addSelectedSearchResultsSpy.calledOnce).to.be.true;
            expect(addSelectedSearchResultsSpy.firstCall.args[0]).to.deep.equals({});
            expect(addSelectedSearchResultsSpy.firstCall.args[1]).to.deep.equals({
                category: "Straße",
                id: "BeidemNeuenKrahnStraße",
                index: 0,
                name: "Bei dem Neuen Krahn",
                searchInterfaceId: "gazetteer",
                displayedInfo: "",
                icon: "bi-signpost",
                imagePath: "",
                toolTip: "toolTipAvailable",
                events: {}
            });
            expect(removeSelectedSearchResultsSpy.notCalled).to.be.true;
        });

        it("should remove a layer from selectedSearchResults", () => {
            selectedSearchResults = [searchResults[0]];

            wrapper = shallowMount(SearchBarResultListTopicTreeItemComponent, {
                global: {
                    plugins: [store]
                },
                propsData: {
                    searchResult: searchResults[0]
                }
            });

            wrapper.vm.addOrRemoveLayer();

            expect(removeSelectedSearchResultsSpy.calledOnce).to.be.true;
            expect(removeSelectedSearchResultsSpy.firstCall.args[0]).to.deep.equals({});
            expect(removeSelectedSearchResultsSpy.firstCall.args[1]).to.deep.equals({
                category: "Straße",
                id: "BeidemNeuenKrahnStraße",
                index: 0,
                name: "Bei dem Neuen Krahn",
                searchInterfaceId: "gazetteer",
                displayedInfo: "",
                icon: "bi-signpost",
                imagePath: "",
                toolTip: "toolTipAvailable",
                events: {}
            });
            expect(addSelectedSearchResultsSpy.notCalled).to.be.true;
        });
    });
});