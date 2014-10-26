var gravit = {
    /**
     * Array<GModule>
     */
    modules: [],

    /**
     * Array<GStorage>
     */
    storages: [],

    /**
     * Array<GExporter>
     */
    exporters: [],

    /**
     * Array<GAction>
     */
    actions: [],

    /**
     * Array<GPalette>
     */
    palettes: [],

    /**
     * Array<GSidebar>
     */
    sidebars: [],

    /**
     * Array<GPanel>
     */
    panels: [],

    /**
     * Array<{{instance: GTool, title: String|GLocale.Key, group: String, keys: Array<String>}, icon: String}>
     */
    tools: [],

    /**
     * Array<GProperties>
     */
    properties: []
};

$(window).load(function () {
    // Init rangy
    rangy.init();
});