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
    styleEntries: [],

    /**
     * Array<GTransformer>
     */
    transformers: []
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
});

// -- FONTS --


//
// TODO : Remove / handle default fonts somewhere else!?
//

// Open Sans
ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Light, 'font/OpenSans-Light.ttf');
ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Light, 'font/OpenSans-LightItalic.ttf');
ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/OpenSans-Regular.ttf');
ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Regular, 'font/OpenSans-Italic.ttf');
ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/OpenSans-Semibold.ttf');
ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.SemiBold, 'font/OpenSans-SemiboldItalic.ttf');
ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/OpenSans-Bold.ttf');
ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.Bold, 'font/OpenSans-BoldItalic.ttf');
ifFont.addType('Open Sans', IFFont.Style.Normal, IFFont.Weight.ExtraBold, 'font/OpenSans-ExtraBold.ttf');
ifFont.addType('Open Sans', IFFont.Style.Italic, IFFont.Weight.ExtraBold, 'font/OpenSans-ExtraBoldItalic.ttf');

// Source Sans Pro
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.ExtraLight, 'font/SourceSansPro-ExtraLight.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.ExtraLight, 'font/SourceSansPro-ExtraLightIt.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Light, 'font/SourceSansPro-Light.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Light, 'font/SourceSansPro-LightIt.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/SourceSansPro-Regular.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Regular, 'font/SourceSansPro-It.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/SourceSansPro-Semibold.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.SemiBold, 'font/SourceSansPro-SemiboldIt.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/SourceSansPro-Bold.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Bold, 'font/SourceSansPro-BoldIt.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Normal, IFFont.Weight.Heavy, 'font/SourceSansPro-Black.ttf');
ifFont.addType('Source Sans Pro', IFFont.Style.Italic, IFFont.Weight.Heavy, 'font/SourceSansPro-BlackIt.ttf');


// Source Code Pro
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.ExtraLight, 'font/SourceCodePro-ExtraLight.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Light, 'font/SourceCodePro-Light.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Regular, 'font/SourceCodePro-Regular.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Medium, 'font/SourceCodePro-Medium.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.SemiBold, 'font/SourceCodePro-Semibold.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Bold, 'font/SourceCodePro-Bold.ttf');
ifFont.addType('Source Code Pro', IFFont.Style.Normal, IFFont.Weight.Heavy, 'font/SourceCodePro-Black.ttf');