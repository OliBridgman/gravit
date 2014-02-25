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
                        .attr('title', 'Add Page')
                        .append($('<span></span>')
                            .addClass('fa fa-file-o'))
                        .on('click', function () {
                            var page = new GXPage();
                            page.setProperty('title', 'Page-123');
                            gApp.getActiveDocument().getScene().getPageSet().appendChild(page);
                        }))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Add Set')
                        .append($('<span></span>')
                            .addClass('fa fa-folder-o'))
                        .on('click', function () {
                            var set_ = new GXShapeSet();
                            gApp.getActiveDocument().getEditor().getCurrentLayer().appendChild(set_);
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
                            gApp.getActiveDocument().getEditor().setCurrentColor(GXEditor.CurrentColorType.Stroke, color);
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

        // Subscribe to the manager's tool change event
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

    _.GToolbar = GToolbar;
})(this);
