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
     * Array<GImport>
     */
    importers: [],

    /**
     * Array<GExport>
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
     * Array<{{instance: IFTool, title: String, group: String, keys: Array<String>}, icon: String}>
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

// This function needs to be called by the shell when it is finished
function gShellFinished() {
    // TODO : FIX THIS, FOR NEW WE ALWAYS CREATE NEW DOC ON EACH RUN
    setTimeout(function () {
        gApp.executeAction(GNewAction.ID);
    }, 0);
}

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