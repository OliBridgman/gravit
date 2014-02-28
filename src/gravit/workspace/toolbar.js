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
                .addClass('section')
                .attr('data-section', 'left')
                .append($('<div></div>')
                    .addClass('actions')
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', gLocale.get(GInsertPagesAction.TITLE))
                        .append($('<span></span>')
                            .addClass('fa fa-file-o'))
                        .on('click', function () {
                            gApp.executeAction(GInsertPagesAction.ID);
                        }))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Add Layer')
                        .append($('<span></span>')
                            .addClass('fa fa-folder-o'))
                        .on('click', function () {
                            gApp.executeAction(GInsertLayerAction.ID);
                        })))
                .append($('<div></div>')
                    .append($('<select></select>')
                        .addClass('hierarchy'))))
            .append($('<div></div>')
                .addClass('section')
                .attr('data-section', 'center')
                .append($('<div></div>')
                    .addClass('toolpanel'))
                .append($('<div></div>')
                    .addClass('colors')
                    .append($('<button>FILL</button>')
                        .gColorButton()
                        .on('change', function (evt, color) {
                            gApp.getActiveDocument().getEditor().setCurrentColor(GXEditor.CurrentColorType.Fill, color);
                        }))
                    .append($('<button>STROKE</button>')
                        .gColorButton()
                        .on('change', function (evt, color) {
                            gApp.getActiveDocument().getEditor().setCurrentColor(GXEditor.CurrentColorType.Contour, color);
                        }))))
            .append($('<div></div>')
                .addClass('section')
                .attr('data-section', 'right'));

        this._toolTypeToButtonMap = {};
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
        var left = this._htmlElement.find('[data-section="left"]');
        var center = this._htmlElement.find('[data-section="center"]');
        var right = this._htmlElement.find('[data-section="right"]');

        var sidebarWidth = gApp.getPart(EXApplication.Part.Sidebar).outerWidth();
        var windowsWidth = gApp.getPart(EXApplication.Part.Windows).outerWidth();
        var palettesWidth = gApp.getPart(EXApplication.Part.Palettes).outerWidth();

        left.width(sidebarWidth);

        center.css('left', sidebarWidth.toString() + 'px');
        center.width(windowsWidth);

        right.css('left', (sidebarWidth + windowsWidth).toString() + 'px');
        right.width(palettesWidth);
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
                break;
            case EXApplication.DocumentEvent.Type.Deactivated:
                this._unregisterDocument(event.document);
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

        this._updateHierachy(scene);

        // Subscribe to structural changes
        scene.addEventListener(GXNode.AfterInsertEvent, this._insertEvent, this);
        scene.addEventListener(GXNode.AfterRemoveEvent, this._removeEvent, this);
        scene.addEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent, this);
    };

    /**
     * @param {EXDocument} document
     * @private
     */
    GToolbar.prototype._unregisterDocument = function (document) {
        var scene = document.getScene();

        // Unsubscribe from structural changes
        scene.removeEventListener(GXNode.AfterInsertEvent, this._insertEvent);
        scene.removeEventListener(GXNode.AfterRemoveEvent, this._removeEvent);
        scene.removeEventListener(GXNode.AfterPropertiesChangeEvent, this._propertiesChangeEvent);

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

    _.GToolbar = GToolbar;
})(this);
