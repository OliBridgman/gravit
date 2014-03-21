(function (_) {
    /**
     * The global toolbar class
     * @class GToolbar
     * @constructor
     */
    function GToolbar(htmlElement) {
        this._htmlElement = htmlElement;
        htmlElement
            .append($('<div></div>')
                .addClass('section sidebars')
                .append($('<button></button>')
                    //.prop('disabled', true)
                    .addClass('g-active')
                    .append($('<span></span>')
                        .addClass('fa fa-files-o')
                        // TODO : I18N
                        .attr('title', 'Pages')))
                .append($('<button></button>')
                    .prop('disabled', true)
                    .append($('<span></span>')
                        .addClass('fa fa-leaf')
                        // TODO : I18N
                        .attr('title', 'Components')))
                .append($('<button></button>')
                    .prop('disabled', true)
                    .append($('<span></span>')
                        .addClass('fa fa-sitemap')
                        // TODO : I18N
                        .attr('title', 'Structure'))))
            .append($('<div></div>')
                .addClass('section toolpanel'))
            .append($('<div></div>')
                .addClass('section')
                .append($('<button></button>')
                    .attr('data-color-button', 'area')
                    // TODO : I18N
                    .attr('title', 'Area Color')
                    .append($('<span></span>'))
                    .gColorButton({
                        swatch: false,
                        dropdown: false,
                        clearColor: true
                    })
                    .on('change', function (evt, color) {
                        this._assignCurrentColor(GXEditor.CurrentColorType.Area, color);
                    }.bind(this)))
                .append($('<button></button>')
                    .attr('data-color-button', 'contour')
                    // TODO : I18N
                    .attr('title', 'Contour Color')
                    .append($('<span></span>'))
                    .gColorButton({
                        swatch: false,
                        dropdown: false,
                        clearColor: true
                    })
                    .on('change', function (evt, color) {
                        this._assignCurrentColor(GXEditor.CurrentColorType.Contour, color);
                    }.bind(this))));

        this._toolTypeToButtonMap = {};

        this._updateColorButtons();
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GToolbar.prototype._htmlElement = null;

    /**
     * Map of Tool -> Button Html Element
     * @type {Object}
     * @private
     */
    GToolbar.prototype._toolTypeToButtonMap = null;

    /**
     * Called from the workspace to initialize
     */
    GToolbar.prototype.init = function () {
        // Init and add tools
        var toolpanel = this._htmlElement.find('.toolpanel');
        var _addToolButton = function (toolInstance) {
            var button = $("<button></button>")
                .attr('class', toolInstance == gApp.getToolManager().getActiveTool() ? 'g-active' : '')
                .append($(toolInstance.getIcon()).attr('width', '18px').attr('height', '18px'))
                .appendTo(toolpanel)
                .on('click', function () {
                    gApp.getToolManager().activateTool(toolInstance);
                }.bind(this));

            // Concat/read the tool's title
            var hint = toolInstance.getHint();
            if (hint) {
                var title = gLocale.get(hint.getTitle());
                if (!title || title === "") {
                    return null;
                }

                var shortcuts = hint.getShortcuts();
                if (shortcuts) {
                    for (var i = 0; i < shortcuts.length; ++i) {
                        if (i == 0) {
                            title += " (";
                        } else {
                            title += ", ";
                        }
                        title += guiKey.shortcutToString(shortcuts[i]);
                    }
                    title += ")";
                }

                button.attr('title', title);
            }

            this._toolTypeToButtonMap[GObject.getTypeId(toolInstance)] = button;
        }.bind(this);

        // Append all tools now
        var lastGroup = null;
        for (var i = 0; i < gApp.getToolManager().getToolCount(); ++i) {
            var toolInstance = gApp.getToolManager().getTool(i);
            var group = toolInstance.getGroup();
            if (group != lastGroup) {
                if (i > 0) {
                    // Add a divider, first
                    toolpanel.append(
                        $("<div></div>")
                            .addClass('divider'));
                }
                lastGroup = group;
            }
            _addToolButton(toolInstance);
        }

        // Subscribe to some events
        gApp.addEventListener(EXApplication.DocumentEvent, this._documentEvent, this);
        gApp.getToolManager().addEventListener(GXToolManager.ToolChangedEvent, this._toolChanged, this);
    };

    /**
     * Called from the workspace to relayout
     */
    GToolbar.prototype.relayout = function () {
        // NO-OP
    };

    /**
     * Called whenever the active tool has been changed
     * @param event
     * @private
     */
    GToolbar.prototype._toolChanged = function (event) {
        if (event.previousTool && this._toolTypeToButtonMap[GObject.getTypeId(event.previousTool)]) {
            this._toolTypeToButtonMap[GObject.getTypeId(event.previousTool)].removeClass('g-active');
        }
        if (event.newTool && this._toolTypeToButtonMap[GObject.getTypeId(event.newTool)]) {
            this._toolTypeToButtonMap[GObject.getTypeId(event.newTool)].addClass('g-active');
        }
    };

    /**
     * @param {EXApplication.DocumentEvent} event
     * @private
     */
    GToolbar.prototype._documentEvent = function (event) {
        switch (event.type) {
            case EXApplication.DocumentEvent.Type.Activated:
                this._registerDocument(event.document);
                this._updateColorButtons();
                break;
            case EXApplication.DocumentEvent.Type.Deactivated:
                this._unregisterDocument(event.document);
                this._updateColorButtons();
                break;
            case EXApplication.DocumentEvent.Type.Removed:
                this._updateColorButtons();
                break;

            default:
                break;
        }
    };

    /**
     * @param {EXDocument} document
     * @private
     */
    GToolbar.prototype._registerDocument = function (document) {
        var scene = document.getScene();
        var editor = document.getEditor();

        this._updateHierachy(scene);

        // Subscribe to scene changes
        scene.addEventListener(GXNode.AfterInsertEvent, this._insertEvent, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._removeEvent, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent, this);

        // Subscribe to editor changes
        editor.addEventListener(GXEditor.SelectionChangedEvent, this._selectionChangedEvent, this);
    };

    /**
     * @param {EXDocument} document
     * @private
     */
    GToolbar.prototype._unregisterDocument = function (document) {
        var scene = document.getScene();
        var editor = document.getEditor();

        // Unsubscribe from scene changes
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);

        // Unsubscribe from editor changes
        editor.removeEventListener(GXEditor.SelectionChangedEvent, this._selectionChangedEvent);

        this._updateHierachy(null);
    };

    /**
     * @param {GXNode} node
     * @private
     */
    GToolbar.prototype._isHierarchyNode = function (node) {
        return (node instanceof GXPage) ||
            (node instanceof GXLayer && node.getParent() instanceof GXScene);
    };

    /**
     * @param {GXNode.AfterInsertEvent} event
     * @private
     */
    GToolbar.prototype._insertEvent = function (event) {
        if (this._isHierarchyNode(event.node)) {
            this._updateHierachy(event.node.getScene())
        }
    };

    /**
     * @param {GXNode.AfterRemoveEvent} event
     * @private
     */
    GToolbar.prototype._removeEvent = function (event) {
        if (this._isHierarchyNode(event.node)) {
            this._updateHierachy(event.node.getScene())
        }
    };

    /**
     * @param {GXNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GToolbar.prototype._propertiesChangeEvent = function (event) {
        if (this._isHierarchyNode(event.node) && event.properties.indexOf('name') >= 0) {
            this._updateHierachy(event.node.getScene())
        }
    };

    /**
     * @param {GXEditor.SelectionChangedEvent} event
     * @private
     */
    GToolbar.prototype._selectionChangedEvent = function (event) {
        this._updateColorButtons();
    };

    /**
     * @param {EXDocument} document
     * @private
     */
    GToolbar.prototype._updateHierachy = function (scene) {
        var select = this._htmlElement.find('select.hierarchy');
        select.empty();

        if (!scene) {
            // done here, there's no scene at all
            return;
        }

        // Add special marker
        select.append($('<option></option>')
            .data('type', 'all')
            // TODO : I18N
            .text('- Everything -'));
        select.append($('<option></option>')
            .data('type', 'all-pages')
            // TODO : I18N
            .text('- Only Pages -'));
        select.append($('<option></option>')
            .data('type', 'all-shared-layers')
            // TODO : I18N
            .text('- Only Shared Layers -'));

        // Append categories
        var pagesCategory = $('<optgroup></optgroup>')
            // TODO : I18N
            .attr('label', 'Pages')
            .appendTo(select);
        var masterPagesCategory = $('<optgroup></optgroup>')
            // TODO : I18N
            .attr('label', 'Master Pages')
            .appendTo(select);
        var sharedLayersCategory = $('<optgroup></optgroup>')
            // TODO : I18N
            .attr('label', 'Shared Layers')
            .appendTo(select);
        var symbolsCategory = $('<optgroup></optgroup>')
            // TODO : I18N
            .attr('label', 'Symbols')
            .appendTo(select);

        // Iterate scene
        for (var child = scene.getFirstChild(); child !== null; child = child.getNext()) {
            var targetCategory = null;

            if (child instanceof GXPage) {
                // TODO : Support for master pages
                targetCategory = pagesCategory;
            } else if (child instanceof GXLayer) {
                targetCategory = sharedLayersCategory;
            }

            if (targetCategory) {
                $('<option></option>')
                    .data('item', child)
                    .text(child.getItemName())
                    .appendTo(targetCategory);
            }
        }
    };

    /**
     * @private
     */
    GToolbar.prototype._updateColorButtons = function () {
        var areaButton = this._htmlElement.find('[data-color-button="area"]');
        var contourButton = this._htmlElement.find('[data-color-button="contour"]');

        var editor = gApp.getActiveDocument() ? gApp.getActiveDocument().getEditor() : null;

        areaButton.prop('disabled', !editor);
        contourButton.prop('disabled', !editor);

        if (editor) {
            var selection = editor.getSelection();

            var areaColor = editor.getCurrentColor(GXEditor.CurrentColorType.Area);
            var contourColor = editor.getCurrentColor(GXEditor.CurrentColorType.Contour);

            // If there's a selection, take area and contour color from it.
            // If selection is more than one, set both to null
            if (selection) {
                areaColor = null;
                contourColor = null;

                if (selection.length === 1 && selection[0].hasMixin(GXElement.Style)) {
                    var style = selection[0].getStyle(false);
                    if (style) {
                        areaColor = style.getAreaColor();
                        contourColor = style.getContourColor();
                    }
                }
            }

            areaButton.gColorButton('value', areaColor);
            contourButton.gColorButton('value', contourColor);

            areaButton.find('> span:first-child')
                .css('color', areaColor ? areaColor.asCSSString() : '')
                .attr('class', 'fa fa-' + (areaColor ? 'circle' : 'ban'));

            contourButton.find('> span:first-child')
                .css('color', contourColor ? contourColor.asCSSString() : '')
                .attr('class', 'fa fa-' + (contourColor ? 'circle-o' : 'ban'));
        }
    };

    /**
     * @private
     */
    GToolbar.prototype._assignCurrentColor = function (type, color) {
        var editor = gApp.getActiveDocument().getEditor();
        var selection = editor.getSelection();

        if (selection && selection.length > 0) {
            // If there's a selection then assign color to selection instead
            editor.beginTransaction();
            try {
                for (var i = 0; i < selection.length; ++i) {
                    var element = selection[i];
                    var style = element.getStyle(!!color);
                    if (style) {
                        if (type === GXEditor.CurrentColorType.Area) {
                            style.setAreaColor(color);
                        } else if (type === GXEditor.CurrentColorType.Contour) {
                            style.setContourColor(color);
                        }
                    }
                }
            } finally {
                // TODO : I18N
                editor.commitTransaction('Apply Color');
            }
        } else {
            // Otherwise without selection assign the current color
            editor.setCurrentColor(type, color);
        }

        this._updateColorButtons();
    };

    _.GToolbar = GToolbar;
})(this);
