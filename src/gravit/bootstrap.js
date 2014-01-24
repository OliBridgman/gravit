var gExpress = {
    /**
     * Array<GModule>
     */
    modules: [],

    /**
     * Array<GStorage>
     */
    storages: [],

    /**
     * Array<GXImport>
     */
    importers: [],

    /**
     * Array<GXExport>
     */
    exporters: [],

    /**
     * Array<EXction>
     */
    actions: [],

    /**
     * Array<GPalette>
     */
    palettes: [],

    /**
     * Array<GTool>
     */
    tools: [],

    /**
     * Array<EXColorMatcher>
     */
    colorMatchers: [],

    /**
     * Array<EXProperties>
     */
    properties: []
};

/**
 * @type {GShell}
 */
var gShell = null;

/**
 * @type {EXApplication}
 */
var gApp = null;

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    if (!gShell) {
        throw new Error("Shell needs to be initialized, first.");
    }

    gApp = new EXApplication();
    gShell.prepareLoad();
});


// Init when everything is finally loaded
$(window).load(function () {
    gApp.init();
    gShell.finishLoad();
});