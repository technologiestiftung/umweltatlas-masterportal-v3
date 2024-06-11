import {config, shallowMount} from "@vue/test-utils";
import {expect} from "chai";
import {createStore} from "vuex";
import StatisticDashboardFilter from "../../../components/StatisticDashboardFilter.vue";
import indexStatisticDashboard from "../../../store/indexStatisticDashboard";
import sinon from "sinon";

config.global.mocks.$t = key => key;

describe("src_3_0_0/modules/statiscticDashboard/components/StatisticDashboardFilter.vue", () => {
    const timeStepsFilter = [
            "Die letzten 5 Jahre",
            "Die letzten 10 Jahre",
            "Alle Jahre"
        ],
        regions = [
            {value: "Harburg", label: "Harburg"},
            {value: "Lübeck", label: "Lübeck"},
            {value: "Schwerin", label: "Schwerin"},
            {value: ["Harburg", "Lübeck", "Schwerin"], label: "Alle Gebiete"}
        ];

    let store;

    beforeEach(() => {
        store = createStore({
            namespaced: true,
            modules: {
                Modules: {
                    namespaced: true,
                    modules: {
                        StatisticDashboard: indexStatisticDashboard
                    }
                }
            }
        });
    });

    afterEach(sinon.restore);

    describe("Component DOM", () => {
        it("should exist", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.exists()).to.be.true;
        });
        it("should render filtercontainer", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".filtercontainer").exists()).to.be.true;
        });
        it("should render dropdown for category", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#categoryfilter").exists()).to.be.true;
        });
        it("should render dropdown for area", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#areafilter").exists()).to.be.true;
        });
        it("should render dropdown for time", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#timefilter").exists()).to.be.true;
        });
        it("should render dropdownButton for statistics", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("button").exists()).to.be.true;
        });

        it("should not render button if no statistic is selected", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.false;
        });

        it("should not render reset button if no statistic is selected", () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            expect(wrapper.find("#reset-button").exists()).to.be.false;
        });

        it("should render one button if one statistic is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});

            expect(wrapper.find(".btn-outline-secondary").exists()).to.be.true;
        });

        it("should render more-button if more than five statistics are selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat0": {name: "1234"}, "stat1": {name: "1234"}, "stat2": {name: "1234"}, "stat3": {name: "1234"}, "stat4": {name: "1234"}, "stat5": {name: "1234"}});

            expect(wrapper.find("#more-button").exists()).to.be.true;
        });

        it("should not render more-button if less than five statistics are selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat0": {name: "1234"}});

            expect(wrapper.find("#more-button").exists()).to.be.false;
        });

        it("should render reset button if statistic is selected", async () => {
            const wrapper = shallowMount(StatisticDashboardFilter, {
                propsData: {
                    categories: [],
                    timeStepsFilter,
                    regions,
                    areCategoriesGrouped: false
                },
                global: {
                    plugins: [store]
                }
            });

            await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});

            expect(wrapper.find("#reset-button").exists()).to.be.true;
        });
    });
    describe("Computed", () => {
        describe("areStatisticsSelected", () => {
            it("should return true", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});
                expect(wrapper.vm.areStatisticsSelected).to.be.true;

            });
        });
        describe("selectedCategoryName", () => {
            it("should return an empty string", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.selectedCategoriesName).to.be.an("string").that.is.empty;

            });
            it("should return the name of the selected category", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories({name: "Kategorie 1"});
                expect(wrapper.vm.selectedCategoriesName).to.be.equal("Kategorie 1");

            });
        });
        describe("countSelectedStatistics", () => {
            it("should return true, if the number of selected statistics are more than five", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat0": {name: "1234"}, "stat1": {name: "1234"}, "stat2": {name: "1234"}, "stat3": {name: "1234"}, "stat4": {name: "1234"}, "stat5": {name: "1234"}});
                expect(wrapper.vm.countSelectedStatistics).to.be.true;

            });
        });
    });

    describe("Watchers", () => {
        describe("selectedCategory", () => {
            it("should emit 'resetStatistics' and 'changeCategory' with the name of", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                wrapper.vm.setSelectedCategories({name: "Kategorie 1"});
                await wrapper.vm.$nextTick();
                expect(wrapper.emitted()).to.have.all.keys(["resetStatistics", "changeCategory"]);
                expect(wrapper.emitted().changeCategory).to.deep.equal([["Kategorie 1"]]);
            });
        });
    });

    describe("Methods", () => {
        describe("allFilterSettingsSelected", () => {
            it("should return 1 if all given values are not empty", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected({name: "name"}, [2], [3])).to.be.equals(1);

            });
            it("should return false if the first given value is not an object", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                expect(wrapper.vm.allFilterSettingsSelected(undefined, [2], [3])).to.be.false;

            });
        });

        describe("toggleStatistic", () => {
            it("should add a statistic if it is not already selected", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});

                wrapper.vm.toggleStatistic({name: "5678"}, wrapper.vm.selectedStatistics, "stat2");
                expect(wrapper.vm.selectedStatistics).to.deep.equals({"stat1": {name: "1234"}, "stat2": {name: "5678"}});

            });
            it("should remove a statistic if it is already selected", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});

                wrapper.vm.toggleStatistic({name: "1234"}, wrapper.vm.selectedStatistics, "stat1");
                expect(wrapper.vm.selectedStatistics).to.deep.equals({});

            });
        });
        describe("removeStatistic", () => {
            it("should remove statistic if the name existed", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}, "stat2": {name: "5678"}});

                wrapper.vm.removeStatistic(wrapper.vm.selectedStatistics, "stat1");
                expect(wrapper.vm.selectedStatistics).to.deep.equals({"stat2": {name: "5678"}});

            });
            it("should remove the statistic and call resetStatistics if it is the last one", () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                        propsData: {
                            categories: [],
                            timeStepsFilter,
                            regions,
                            areCategoriesGrouped: false
                        },
                        global: {
                            plugins: [store]
                        }
                    }),
                    spyResetStatistics = sinon.spy(wrapper.vm, "resetStatistics");

                store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}});

                wrapper.vm.removeStatistic(wrapper.vm.selectedStatistics, "stat1");
                expect(wrapper.vm.selectedStatistics).to.deep.equals({});
                expect(spyResetStatistics.calledOnce).to.be.true;

            });
        });
        describe("resetStatistics", () => {
            it("should remove all statistics and emit reset", async () => {
                const wrapper = shallowMount(StatisticDashboardFilter, {
                    propsData: {
                        categories: [],
                        timeStepsFilter,
                        regions,
                        areCategoriesGrouped: false
                    },
                    global: {
                        plugins: [store]
                    }
                });

                await store.commit("Modules/StatisticDashboard/setSelectedStatistics", {"stat1": {name: "1234"}, "stat2": {name: "5678"}});

                wrapper.vm.resetStatistics();
                expect(wrapper.vm.selectedStatistics).to.deep.equals({});
                expect(wrapper.emitted()).to.have.all.keys(["resetStatistics"]);

            });
        });
    });
});
