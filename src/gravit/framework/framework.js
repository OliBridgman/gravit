(function (_) {
    /**
     * Gravit Framework Module
     * @class FrameworkModule
     * @constructor
     * @extends GModule
     */
    function FrameworkModule() {
    }

    IFObject.inherit(FrameworkModule, GModule);

    /** @override */
    FrameworkModule.prototype.init = function () {
        // Register default exporters
        gravit.exporters.push(
            new GImageExporter()
        );

        // Register default palettes
        gravit.palettes.push(
            new GLayersPalette(),
            new GPagesPalette(),
            new GAlignPalette(),
            new GTransformPalette(),
            new GExportPalette(),
            new GStylesPalette(),
            new GSwatchesPalette()
        );

        // Register default panels
        gravit.panels.push(
            new GPropertiesPanel()
        );

        // Register default sidebars
        gravit.sidebars.push(
            new GDocumentSidebar()
        );

        // Register default tools
        // TODO : I18N
        gravit.tools.push(
            {
                instance: new IFPointerTool(),
                title: 'Pointer',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'select',
                keys: ['V', '0'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z"/>\n</svg>'
            },
            {
                instance: new IFLassoTool(),
                title: 'Lasso',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'select',
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M18.5,27c-3.7,0-4.7,2.9-5.5,5.2c-0.7,2-1.2,3.2-2.5,3.2c-0.8,0-1.5-0.3-2.1-0.8\n\tc-0.4-0.4-0.7-0.9-0.9-1.5c0.6-0.4,1-1,1-1.7c0-0.2,0-0.4-0.1-0.6c0.8-0.5,1.7-1.2,2.5-2c3.5-3.5,4.6-7.6,2.7-9.5\n\tc-0.6-0.6-1.5-0.9-2.4-0.9c-2.1,0-4.7,1.3-7,3.6c-3.5,3.5-4.6,7.6-2.7,9.5c0.6,0.6,1.5,0.9,2.4,0.9c0.3,0,0.6,0,0.9-0.1\n\tc0.3,0.6,1,1.1,1.8,1.1c0,0,0,0,0,0c0.3,0.7,0.6,1.4,1.2,1.9c0.7,0.7,1.7,1.1,2.8,1.1c2.2,0,2.8-2,3.5-4c0.8-2.3,1.6-4.6,4.5-4.6\n\tC18.5,28,18.5,27,18.5,27z M2.1,30.9c-0.9-0.9-0.6-2.4-0.4-3.2c0.5-1.6,1.5-3.4,3.1-4.9c2-2,4.5-3.3,6.3-3.3c0.7,0,1.3,0.2,1.7,0.6\n\tc0.4,0.4,0.6,1,0.6,1.7c0,1.9-1.3,4.3-3.3,6.3c-0.7,0.7-1.5,1.4-2.3,1.9c-0.4-0.3-0.8-0.5-1.4-0.5c-1.1,0-2,0.9-2,1.9\n\tc-0.2,0-0.4,0.1-0.7,0.1C3.1,31.5,2.5,31.3,2.1,30.9z"/>\n</svg>'
            },
            {
                instance: new IFSubSelectTool(),
                title: 'Subselect',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'select2',
                keys: ['A', '1'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z M7.5,27.5l-3,4.5V20.5l9,7H7.5z"/>\n</svg>'
            },
            {
                instance: new IFPageTool(),
                title: 'Page',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'select3',
                keys: ['D'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M15.5,18.5v10h-1v-9h-7v3h-3v10h3v1h-4v-12l3-3H15.5z M8.5,25.5v11l3.5-4h5.5L8.5,25.5z"/>\n</svg>'
            },
            {
                instance: new IFLayerTool(),
                title: 'Layer',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'select3',
                keys: ['L'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="-2.5 -.5 18 18" width="18px" height="18px">\n<path stroke="none" d="M0.5,8.5 L0.5,10.5 L4.5,10.5 L4.5,8.5 L0.5,8.5 Z M10.5,8.5 L10.5,10.5 L12.5,10.5 L12.5,8.5 L10.5,8.5 Z M9.5,8.5 L9.5,9.5 L10.5,9.5 L10.5,8.5 L9.5,8.5 Z M0.5,0.5 L0.5,2.5 L12.5,2.5 L12.5,0.5 L0.5,0.5 Z M0.5,4.5 L0.5,6.5 L12.5,6.5 L12.5,4.5 L0.5,4.5 Z M5.5,7.5 L5.5,18.5 L9,14.5 L14.5,14.5 L5.5,7.5 Z"></path>\n</svg>'
            },
            {
                instance: new IFTransformTool(),
                title: 'Transform',
                category: GApplication.TOOL_CATEGORY_SELECT,
                group: 'transform',
                keys: ['Q'],
                // todo : get a real svg icon here
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.5,32.5H12l-3.5,4v-11L17.5,32.5z M3.5,18.5h-3v3h1v-2h2V18.5z M15.5,18.5v1h2v2h1v-3H15.5z M1.5,35.5v-2h-1v3h3v-1H1.5z M6.4,33.5H3.5v-12h12v7h1v-8h-14v14h3.9V33.5z"/>\n</svg>'
            },
            {
                instance: new IFLineTool(),
                title: 'Line',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'line',
                keys: ['N'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<rect stroke="none" x="9" y="15.3" transform="matrix(0.7069 0.7074 -0.7074 0.7069 22.2372 1.3418)" width="1" height="24.5"/>\n</svg>'
            },
            {
                instance: new IFPenTool(),
                title: 'Pen',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'path',
                keys: ['P'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M9.2,21.3l0.7,0.7l-6.5,3.6c0,0-0.5,3.1-1.4,5.7c-0.8,2.2-2.1,3.6-1.4,4.3c0,0,0,0,0.7,0.7\n\tc0.7,0.7,2.1-0.6,4.3-1.4c2.5-0.9,5.6-1.4,5.6-1.4l3.7-6.4l0.7,0.7l2.9-2.1l-7.1-7.1L9.2,21.3z M4.2,26.4l6.5-3.6l3.6,3.6l-3.7,6.4\n\tc-4.8,0.5-8.5,2.8-8.5,2.8l3.2-3.2c0.8,0.5,1.8,0.3,2.4-0.3c0.8-0.8,0.8-2,0-2.8c-0.8-0.8-2-0.8-2.8,0c-0.7,0.7-0.8,1.7-0.4,2.5\n\tl-3.2,3.2C1.4,34.9,3.7,31.2,4.2,26.4z"/>\n</svg>'
            },
            {
                instance: new IFBezigonTool(),
                title: 'Bezigon',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'path',
                keys: ['B', '8'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path d="M7.8,29.3c-1.8-1.7,4.4-10.8,4.4-10.8l1.3,1.2c-1.3,1.5-2.5,3.6-3.1,4.7c-1,1.8-1.1,2.7-1.1,2.7l6-5.7l3.1,3\n\tC18.5,24.5,9.5,30.7,7.8,29.3z M18.5,33c0,0.8-0.7,1.5-1.5,1.5c-0.7,0-1.2-0.4-1.4-1H7.5v3h-7v-7h3v-8.1c-0.6-0.2-1-0.8-1-1.4\n\tc0-0.8,0.7-1.5,1.5-1.5s1.5,0.7,1.5,1.5c0,0.7-0.4,1.2-1,1.4v8.1h3v3h8.1c0.2-0.6,0.8-1,1.4-1C17.8,31.5,18.5,32.2,18.5,33z\n\t M6.5,30.5h-5v5h5V30.5z" stroke="none"/>\n</svg>'
            },
            {
                instance: new IFRectangleTool(),
                title: 'Rectangle',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'shape',
                keys: ['R'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.5,20.5v14h-16v-14H17.5 M18.5,19.5h-18v16h18v-15V19.5L18.5,19.5z"/>\n</svg>'
            },
            {
                instance: new IFEllipseTool(),
                title: 'Ellipse',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'shape2',
                keys: ['E', '3'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<ellipse style="fill:none; stroke: inherit" cx="9.5" cy="27.5" rx="8.5" ry="7.5"/>\n</svg>'
            },
            {
                instance: new IFPolygonTool(),
                title: 'Polygon',
                category: GApplication.TOOL_CATEGORY_VECTOR,
                group: 'shape2',
                keys: ['G'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M13.4,20.5l3.9,7l-3.9,7H5.6l-3.9-7l3.9-7H13.4 M14,19.5H5l-4.5,8l4.5,8h9l4.5-8L14,19.5L14,19.5z"/>\n</svg>'
            },
            {
                instance: new IFTextTool(),
                title: 'Text',
                category: GApplication.TOOL_CATEGORY_OTHER,
                group: 'text',
                keys: ['T'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg">\n<text style="stroke:none; fill: inherit; font-family: Arial; font-size: 18px; text-anchor: middle" x="9" y="15">T</text>\n</svg>'
            },
            {
                instance: new IFSliceTool(),
                title: 'Slice',
                category: GApplication.TOOL_CATEGORY_OTHER,
                group: 'slice',
                keys: ['K'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M14.8,19.3L2.6,33.4c-0.2,0.3-0.1,0.7,0.1,0.9c0.2,0.2,0.6,0.3,0.9,0.1c0,0,7.9-4.9,8-5.1l6.4-7.4l0,0 c0.8-0.9,0.5-2.2-0.3-2.9C16.9,18.3,15.6,18.3,14.8,19.3z M17,21l-6.3,7.4l-1.1-0.9l6.4-7.4c0.4-0.5,1-0.2,1-0.1 C17.2,20.2,17.2,20.7,17,21z M15.5,27.5v9h-15v-13v0h8v1h-7v11h13v-8H15.5z"/>\n</svg>'
            },
            {
                instance: new IFZoomTool(),
                title: 'Zoom',
                category: GApplication.TOOL_CATEGORY_VIEW,
                group: 'zoom',
                keys: ['Z'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M17.9,34L15,31.2c1-1.3,1.5-2.9,1.5-4.7c0-4.4-3.6-8.1-8-8.1c-4.4,0-8.1,3.6-8.1,8.1c0,4.4,3.6,8,8.1,8\n\tc1.8,0,3.4-0.6,4.7-1.5l2.8,2.8c0.7,0.7,1.7,0.8,2.2,0.3C18.7,35.7,18.6,34.7,17.9,34z M1.6,26.5c0-3.8,3.1-6.9,6.9-6.9s7,3.1,7,6.9\n\ts-3.1,7-7,7S1.6,30.3,1.6,26.5z"/>\n</svg>'
            },
            {
                instance: new IFHandTool(),
                title: 'Hand',
                category: GApplication.TOOL_CATEGORY_VIEW,
                group: 'hand',
                keys: ['H'],
                icon: '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M13.7,22.6C10.3,19,7.9,19,7,19.2l-0.4-0.4c-0.1,0-0.5-0.3-1.1-0.3c-0.4,0-0.7,0.1-1,0.4\n\tC4.2,19,4.1,19.2,4,19.4c-0.6-0.3-1.3-0.3-1.8,0.2c-0.3,0.3-0.5,0.7-0.5,1.1c0,0.1,0,0.3,0.1,0.4c-0.2,0.1-0.5,0.2-0.7,0.4\n\tc-0.9,0.7-0.5,1.7-0.2,2.3c2.7,2.6,5.6,5.8,6.1,7c-0.5-0.2-1.4-0.9-1.9-1.4c-1.7-1.4-2.8-2.2-3.6-1.7c-0.6,0.3-0.7,0.8-0.8,1.1\n\tc-0.4,1.5,3.4,5.2,3.6,5.4c1.2,1.3,8.9,2.4,8.9,2.4c0.1,0,0.2,0,0.3-0.1l4.8-3.3c0.1-0.1,0.2-0.2,0.2-0.4\n\tC18.5,32.5,18.7,27.8,13.7,22.6z M13.1,35.5L13.1,35.5c-2.9-0.4-7.4-1.3-8.1-2.1c0,0-0.1-0.1-0.2-0.2c-2.6-2.7-3.6-4.1-3.1-4.6\n\tc0.1-0.1,0.2-0.1,0.4-0.1c0.5,0,1.4,0.7,2.1,1.3L4.4,30c1,0.8,2.1,1.6,2.8,1.6c0.2,0,0.4-0.1,0.5-0.2c0.1-0.1,0.1-0.2,0.1-0.3\n\tc0-1.3-3.2-5.1-6.3-8c-0.2-0.3-0.3-0.7,0-1C1.8,22,2,21.9,2.2,21.9c0.2,0,0.3,0.1,0.4,0.1l4.5,4.3c0.2,0.1,0.4,0.1,0.6,0\n\tc0.1-0.1,0.1-0.1,0.1-0.2c0-0.1-0.1-0.3-0.1-0.3l-4.5-4.3c0,0-0.5-0.4-0.5-0.9c0-0.2,0.1-0.3,0.2-0.4c0.1-0.1,0.3-0.2,0.4-0.2\n\tc0.4,0,0.9,0.4,1.1,0.7L9,25.2c0.2,0.1,0.4,0.1,0.6,0c0.1-0.1,0.1-0.1,0.1-0.2c0-0.1-0.1-0.3-0.1-0.3l-4.6-4.4\n\tc-0.1-0.1-0.1-0.4,0.1-0.6c0.1-0.1,0.3-0.2,0.5-0.2c0.2,0,0.4,0.1,0.4,0.2h0l5,4.3c0.2,0.1,0.4,0.1,0.6,0c0.1-0.1,0.1-0.2,0.1-0.3\n\tc0-0.1-0.1-0.2-0.1-0.3L7.8,20l0.5,0.1c1,0.2,2.6,0.9,4.7,3.1c4,4.2,4.5,8.1,4.5,9.2l0,0.1L13.1,35.5z"/>\n</svg>'
            }
        );

        // Register default color matcher
        gravit.colorMatchers.push(
            new GAnalogousMatcher(),
            new GComplementaryMatcher()
        );

        // Register default properties
        gravit.properties.push(
            // first
            new GInfoProperties(),

            // middle
            new GPolygonProperties(),
            new GPathProperties(),
            new GRectangleProperties(),
            new GEllipseProperties(),
            new GTextProperties(),
            new GImageProperties(),
            new GSliceProperties(),
            new GPageProperties(),

            // last
            new GFillBorderProperties(),
            new GEffectProperties(),
            new GStyleProperties()
        );

        // Register default actions
        gravit.actions.push(
            // File
            new GNewAction(),
            new GOpenAction(),

            new GSaveAction(),
            new GSaveAsAction(),
            new GSaveAllAction(),

            new GPlaceImageAction(),

            new GCloseAction(),
            new GCloseAllAction(),

            // Edit
            new GUndoAction(),
            new GRedoAction(),

            new GCutAction(),
            new GCopyAction(),
            new GPasteAction(),
            new GDeleteAction(),

            new GPasteInPlaceAction(),
            new GPasteInsideAction(),
            new GPasteStyleAction(),

            new GDuplicateAction(),
            new GCloneAction(),

            new GSelectAllAction(),
            new GInvertSelectionAction(),

            // Modify
            new GArrangeAction(GArrangeAction.Type.SendToFront),
            new GArrangeAction(GArrangeAction.Type.BringForward),
            new GArrangeAction(GArrangeAction.Type.SendBackward),
            new GArrangeAction(GArrangeAction.Type.SendToBack),

            new GAlignAction(GAlignAction.Type.AlignLeft),
            new GAlignAction(GAlignAction.Type.AlignCenter),
            new GAlignAction(GAlignAction.Type.AlignRight),
            new GAlignAction(GAlignAction.Type.AlignJustifyHorizontal),
            new GAlignAction(GAlignAction.Type.AlignTop),
            new GAlignAction(GAlignAction.Type.AlignMiddle),
            new GAlignAction(GAlignAction.Type.AlignBottom),
            new GAlignAction(GAlignAction.Type.AlignJustifyVertical),

            new GDistributeAction(GDistributeAction.Type.Horizontal),
            new GDistributeAction(GDistributeAction.Type.Vertical),

            new GSnapUnitAction(GSnapUnitAction.Type.FullUnit),
            new GSnapUnitAction(GSnapUnitAction.Type.HalfUnit),

            new GTransformAction(GTransformAction.Type.Rotate45Left),
            new GTransformAction(GTransformAction.Type.Rotate90Left),
            new GTransformAction(GTransformAction.Type.Rotate180Left),
            new GTransformAction(GTransformAction.Type.Rotate45Right),
            new GTransformAction(GTransformAction.Type.Rotate90Right),
            new GTransformAction(GTransformAction.Type.Rotate180Right),
            new GTransformAction(GTransformAction.Type.FlipVertical),
            new GTransformAction(GTransformAction.Type.FlipHorizontal),

            new GGroupAction(),
            new GUngroupAction(),

            new GConvertToPathAction(),
            new GSliceFromSelectionAction(),

            new GAddPageAction(),
            new GDeletePageAction(),

            new GAddLayerAction(),
            new GDeleteLayerAction(),

            new GLayerTypeAction(IFLayer.Type.Output),
            new GLayerTypeAction(IFLayer.Type.Draft),
            new GLayerTypeAction(IFLayer.Type.Guide),


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
            new GShowAllPagesAction(),

            new GShowGridAction(),
            new GShowRulersAction(),

            // Window
            new GNewWindowAction()
        );
    };

    /** @override */
    FrameworkModule.prototype.toString = function () {
        return '[Module Gravit]';
    };

    gravit.modules.push(new FrameworkModule());
})(this);
