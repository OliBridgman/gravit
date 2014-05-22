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
     * Array<EXPalette>
     */
    palettes: [],

    /**
     * Array<IFTool>
     */
    tools: [],

    /**
     * Array<EXColorMatcher>
     */
    colorMatchers: [],

    /**
     * Array<EXProperties>
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
    rangy.init();
    gApp.init();
    gShell.finishLoad();
});