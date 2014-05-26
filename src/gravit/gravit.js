(function (_) {
    /**
     * Gravit Core Module
     * @class GravitModule
     * @constructor
     * @extends GModule
     */
    function GravitModule() {
    }
    IFObject.inherit(GravitModule, GModule);

    /** @override */
    GravitModule.prototype.init = function () {
        // Register default palettes
        gravit.palettes.push(
            new GPropertiesPalette(),
            new GColorMixerPalette(),
            new GColorMatcherPalette(),
            new GColorTrendsPalette()
        );

        // Register default tools
        gravit.tools.push(
            new IFPointerTool(),
            new IFSubSelectTool(),
            new IFPageTool(),
            new IFLassoTool(),
            new IFPenTool(),
            new IFBezigonTool(),
            new IFLineTool(),
            new IFRectangleTool(),
            new IFEllipseTool(),
            new IFPolygonTool(),
            new IFTextTool(),
            new IFZoomTool(),
            new IFHandTool()
        );

        // Register default color matcher
        gravit.colorMatchers.push(
            new GAnalogousMatcher(),
            new GComplementaryMatcher(),
            new GImagePaletteMatcher()
        );

        // Register default properties
        gravit.properties.push(
            new GDimensionsProperties(),
            new GAttributeProperties(),
            new GDocumentProperties(),
            new GPolygonProperties(),
            new GPathProperties(),
            new GRectangleProperties(),
            new GEllipseProperties(),
            new GTextProperties(),
            new GPageProperties()
        );

        // Register default attributes
        gravit.attributes.push(
            new GStrokeAttribute(),
            new GFillAttribute(),
            new GShadowAttribute(),
            new GBlurAttribute()
        );

        // Register default actions
        gravit.actions = gravit.actions.concat(this._createDefaultActions());
    };

    /**
     * @returns {Array<GAction>}
     * @private
     */
    GravitModule.prototype._createDefaultActions = function () {
        // Collect all storages and create our open
        // and saveAs actions out of it here
        var openActions = [];
        var saveAsActions = [];

        var hasDefaultOpen = false;
        var hasDefaultSave = false;
        for (var i = 0; i < gravit.storages.length; ++i) {
            var storage = gravit.storages[i];
            if (storage.isAvailable() && storage.isPrompting()) {
                openActions.push(new GOpenAction(storage, !hasDefaultOpen));
                hasDefaultOpen = true;

                if (storage.isSaving()) {
                    saveAsActions.push(new GSaveAsAction(storage, !hasDefaultSave));
                    hasDefaultSave = true;
                }
            }
        }

        // Collect all import and export filters and add actions for 'em
        var importActions = [];
        var exportActions = [];

        for (var i = 0; i < gravit.importers.length; ++i) {
            importActions.push(new GImportAction(gravit.importers[i]));
        }
        for (var i = 0; i < gravit.exporters.length; ++i) {
            exportActions.push(new GExportAction(gravit.exporters[i]));
        }

        // Collect all palettes and add actions for 'em
        var paletteShowActions = [];
        for (var i = 0; i < gravit.palettes.length; ++i) {
            paletteShowActions.push(new GShowPaletteAction(gravit.palettes[i]));
        }

        // TODO : If there's only one storage available,
        // don't put open/saveAs actions in sub-categories file.open/file.saveAs

        return [].concat(
            // File
            new GNewAction(),
            openActions,

            new GSaveAction(),
            saveAsActions,
            new GSaveAllAction(),

            importActions,
            exportActions,

            new GCloseAction(),
            new GCloseAllAction(),

            // Edit
            new GUndoAction(),
            new GRedoAction(),

            new GCutAction(),
            new GCopyAction(),
            new GPasteAction(),
            new GPasteInsideAction(),
            new GDeleteAction(),

            new GCopyAttributesAction(),
            new GPasteAttributesAction(),

            new GDuplicateAction(),
            new GCloneAction(),

            // Modify
            new GGroupAction(),
            new GUngroupAction(),

            new GInsertPagesAction(),
            new GInsertLayerAction(),

            // View
            new GOriginalViewAction(),
            new GFitSelectionAction(),
            new GFitCurrentPageAction(),
            new GFitCurrentLayerAction(),
            new GFitAllAction(),
            new GMagnificationAction(6, null),
            new GMagnificationAction(12, null),
            new GMagnificationAction(25, null),
            new GMagnificationAction(50, [IFKey.Constant.META, '5']),
            new GMagnificationAction(100, [IFKey.Constant.META, '1']),
            new GMagnificationAction(200, [IFKey.Constant.META, '2']),
            new GMagnificationAction(400, [IFKey.Constant.META, '4']),
            new GMagnificationAction(800, [IFKey.Constant.META, '8']),
            new GZoomInAction(),
            new GZoomOutAction(),

            new GPaintModeAction(IFScenePaintConfiguration.PaintMode.Full),
            new GPaintModeAction(IFScenePaintConfiguration.PaintMode.Fast),
            new GPaintModeAction(IFScenePaintConfiguration.PaintMode.Outline),
            new GPaintModeAction(IFScenePaintConfiguration.PaintMode.Output),

            new GPixelPreviewAction(),

            new GShowRulersAction(),

            // Window
            new GNewWindowAction(),
            paletteShowActions,

            // Help
            new GShortcutMapAction(),
            new GWelcomeAction()
        );
    };

    /** @override */
    GravitModule.prototype.toString = function () {
        return '[Module Gravit]';
    };

    gravit.modules.push(new GravitModule());
})(this);
