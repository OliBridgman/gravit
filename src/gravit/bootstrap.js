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
     * Array<GSidebar>
     */
    sidebars: [],

    /**
     * Array<{{instance: IFTool, title: String|IFLocale.Key, group: String, keys: Array<String>}, icon: String}>
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
     * Array<GStyleEntry>
     */
    styleEntries: []
};

/**
 * @type {GShell}
 */
var gShell = null;

/**
 * @type {GApplication}
 */
var gApp = null;

var gAPIUrl = null;

// This function needs to be called by the shell when it is finished
function gShellFinished() {
    // TODO : FIX THIS, FOR NEW WE ALWAYS CREATE NEW DOC ON EACH RUN
    setTimeout(function () {
        console.log('NEW DOC');
        gApp.executeAction(GNewAction.ID);
    }, 250);

    /*
    // Verify account

    var gravitUser = window.localStorage ? window.localStorage.getItem('gravit.user') : null;
    if (!window.gAPI && !gravitUser) {
        alert('Please go online to load your account settings.');
    } else if (window.gAPI) {
        gAPI.init(gAPIUrl);
        
        // Update user information
        gAPI.runWithUser(function () {
            // TODO : Synchronize user account now
            console.log('Synchronize user ' + gAPI.user.id);
        });
    }
    */
}

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    if (!gShell) {
        throw new Error("Shell needs to be initialized, first.");
    }

    /*
    // Load GAPI Script
    if (gShell.isDevelopment()) {
        gAPIUrl = 'http://localhost:3000/';
    } else {
        gAPIUrl = 'http://api.gravit.io/';
    }
    $('<script></script>')
        .attr('src', gAPIUrl + 'gapi.js')
        .appendTo($('body'));
*/
    // Initialize ourself now
    gApp = new GApplication();
    gShell.prepareLoad();
});


// Init when everything is finally loaded
$(window).load(function () {
    rangy.init();
    gApp.init();
    gShell.finishLoad();

    console.log('FINISH_LOAD');
});