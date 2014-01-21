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
 * @type {EXSidebar}
 */
var gSidebar = null;

// Bootstrapping when the DOM is ready
$(document).ready(function () {
    // Initialize loader
    $('<div></div>')
        .attr('id', 'gravit-loader')
        .append($('<div></div>')
            .append($('<div>')
                .addClass('icon'))
            .append($('<div></div>')
                .html('&nbsp;'))
            .append($('<img>')
                .addClass('loader')))
        .appendTo($('body'));

    // Initialize Application
    gApp = new EXApplication();
});


// Init when everything is finally loaded
$(window).load(function () {
    // Pre-init application
    gApp.preInit();
    gSidebar = gApp.getSidebar();

    // Iterate modules and let each one initialize
    for (var i = 0; i < gExpress.modules.length; ++i) {
        var module = gExpress.modules[i];
        console.log("Init module <" + module.toString() + ">");
        module.init();
    }

    // Init application now
    gApp.init();

    // Finally remove our loading screen and get started
    $("#gravit-loader").remove();

    if (gshell) {
        gshell.openShell();
    }
});