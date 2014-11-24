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

/**
 * @type {GHost}
 */
var gHost = null;

/**
 * @type {GApplication}
 */
var gApp = null;

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    if (!gHost) {
        throw new Error("Host needs to be initialized, first.");
    }

    if (!gApp) {
        throw new Error("App needs to be initialized, first.");
    }

    // Let app prepare
    gApp.prepare();

    // Let host init
    gHost.init();
});

$(window).load(function () {
    // Init rangy
    rangy.init();

    // Init app
    gApp.init()
        .always(function () {
            // Let host start
            gHost.start();

            // Layout our app
            gApp.relayout();

            // Let app start
            gApp.start();
        });
});