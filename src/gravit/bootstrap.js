var gravit = {
    /**
     * Array<GModule>
     */
    modules: [],

    /**
     * Array<IFStorage>
     */
    storages: [],

    /**
     * Array<IFImport>
     */
    importers: [],

    /**
     * Array<IFExport>
     */
    exporters: [],

    /**
     * Array<GUIAction>
     */
    actions: [],

    /**
     * Array<GPalette>
     */
    palettes: [],

    /**
     * Array<IFTool>
     */
    tools: [],

    /**
     * Array<GColorMatcher>
     */
    colorMatchers: [],

    /**
     * Array<GProperties>
     */
    properties: [],

    /**
     * Array<GAttribute>
     */
    attributes: []
};

/**
 * @type {GShell}
 */
var gShell = null;

/**
 * @type {GApplication}
 */
var gApp = null;

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    if (!gShell) {
        throw new Error("Shell needs to be initialized, first.");
    }

    gApp = new GApplication();
    gShell.prepareLoad();
});


// Init when everything is finally loaded
$(window).load(function () {
    rangy.init();
    gApp.init();
    gShell.finishLoad();
});