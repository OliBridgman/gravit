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

    // Register default storages
    gExpress.storages.push(
        new GFileStorage(),
        new GAPIStorage()
    );

    // Register default imports-filters
    gExpress.importers.push(
        new GXFreehandImport()
    );

    // Register default export-filters
    gExpress.exporters.push(
        new GXPDFExport()
    );

    // Register default palettes
    gExpress.palettes.push(
        new EXColorMixerPalette(),
        new EXColorMatcherPalette(),
        new EXColorTrendsPalette(),
        new EXPropertiesPalette(),
        new EXPagesPalette(),
        new EXLayersPalette()
    );

    // Register default tools
    gExpress.tools.push(
        new GXPointerTool(),
        new GXSubSelectTool(),
        new GXPageTool(),
        new GXLassoTool(),
        new GXRectSelectTool(),
        new GXEllipseSelectTool(),
        //new GXPenTool(),
        //new GXBezigonTool(),
        new GXLineTool(),
        new GXRectangleTool(),
        new GXEllipseTool(),
        new GXPolygonTool(),
        new GXZoomTool(),
        new GXHandTool()
    );

    // Register default color matcher
    gExpress.colorMatchers.push(
        new EXAnalogousMatcher(),
        new EXComplementaryMatcher(),
        new EXImagePaletteMatcher()
    );

    // Register default properties
    gExpress.properties.push(
        new EXDimensionsProperties(),
        new EXPolygonProperties()
    );

    // TODO : Register and add all module scripts here

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
        console.log("Init module <" + module.getName() + ">");
        module.init();
    }

    // Init application now
    gApp.init();

    // Finally remove our loading screen and get started
    $("#gravit-loader").remove();
});