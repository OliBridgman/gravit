(function (_) {
    /**
     * Gravit Core Module
     * @class GravitModule
     * @constructor
     * @extends EXModule
     */
    function GravitModule() {
    }
    IFObject.inherit(GravitModule, EXModule);

    /** @override */
    GravitModule.prototype.init = function () {
        // Register default palettes
        gravit.palettes.push(
            new EXColorMixerPalette(),
            new EXColorMatcherPalette(),
            new EXColorTrendsPalette(),
            new EXPropertiesPalette()
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
            new EXAnalogousMatcher(),
            new EXComplementaryMatcher(),
            new EXImagePaletteMatcher()
        );

        // Register default properties
        gravit.properties.push(
            new EXDimensionsProperties(),
            new GAttributeProperties(),
            new GDocumentProperties(),
            new EXPolygonProperties(),
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
                openActions.push(new EXOpenAction(storage, !hasDefaultOpen));
                hasDefaultOpen = true;

                if (storage.isSaving()) {
                    saveAsActions.push(new EXSaveAsAction(storage, !hasDefaultSave));
                    hasDefaultSave = true;
                }
            }
        }

        // Collect all import and export filters and add actions for 'em
        var importActions = [];
        var exportActions = [];

        for (var i = 0; i < gravit.importers.length; ++i) {
            importActions.push(new EXImportAction(gravit.importers[i]));
        }
        for (var i = 0; i < gravit.exporters.length; ++i) {
            exportActions.push(new EXExportAction(gravit.exporters[i]));
        }

        // Collect all palettes and add actions for 'em
        var paletteShowActions = [];
        for (var i = 0; i < gravit.palettes.length; ++i) {
            paletteShowActions.push(new EXShowPaletteAction(gravit.palettes[i]));
        }

        // TODO : If there's only one storage available,
        // don't put open/saveAs actions in sub-categories file.open/file.saveAs

        return [].concat(
            // File
            new EXNewAction(),
            openActions,

            new EXSaveAction(),
            saveAsActions,
            new EXSaveAllAction(),

            importActions,
            exportActions,

            new EXCloseAction(),
            new EXCloseAllAction(),

            // Edit
            new EXUndoAction(),
            new EXRedoAction(),

            new GCutAction(),
            new GCopyAction(),
            new GPasteAction(),
            new GPasteInsideAction(),
            new EXDeleteAction(),

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
            new EXOriginalViewAction(),
            new EXFitSelectionAction(),
            new EXFitCurrentPageAction(),
            new EXFitCurrentLayerAction(),
            new EXFitAllAction(),
            new EXMagnificationAction(6, null),
            new EXMagnificationAction(12, null),
            new EXMagnificationAction(25, null),
            new EXMagnificationAction(50, [IFKey.Constant.META, '5']),
            new EXMagnificationAction(100, [IFKey.Constant.META, '1']),
            new EXMagnificationAction(200, [IFKey.Constant.META, '2']),
            new EXMagnificationAction(400, [IFKey.Constant.META, '4']),
            new EXMagnificationAction(800, [IFKey.Constant.META, '8']),
            new EXZoomInAction(),
            new EXZoomOutAction(),

            new EXPaintModeAction(IFScenePaintConfiguration.PaintMode.Full),
            new EXPaintModeAction(IFScenePaintConfiguration.PaintMode.Fast),
            new EXPaintModeAction(IFScenePaintConfiguration.PaintMode.Outline),
            new EXPaintModeAction(IFScenePaintConfiguration.PaintMode.Output),

            new EXPixelPreviewAction(),

            new EXShowRulersAction(),

            // Window
            new EXNewWindowAction(),
            paletteShowActions,

            // Help
            new EXShortcutMapAction(),
            new GWelcomeAction()
        );
    };

    /** @override */
    GravitModule.prototype.toString = function () {
        return '[Module Gravit]';
    };

    gravit.modules.push(new GravitModule());
})(this);
