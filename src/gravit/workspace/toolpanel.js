(function (_) {
    /**
     * The global tools class
     * @class EXToolpanel
     * @constructor
     * @version 1.0
     */
    function EXToolpanel(htmlElement) {
        this._htmlElement = htmlElement;
        this._toolTypeToButtonMap = {};
    };

    /**
     * @type {JQuery}
     * @private
     */
    EXToolpanel.prototype._htmlElement = null;

    /**
     * Map of Tool -> Button Html Element
     * @type {Object}
     * @private
     */
    EXToolpanel.prototype._toolTypeToButtonMap = null;

    /**
     * Called from the workspace to initialize
     */
    EXToolpanel.prototype.init = function () {
        var _addToolButton = function (toolInstance) {
            var button = $("<button></button>")
                .attr('class', toolInstance == gApp.getToolManager().getActiveTool() ? 'g-active' : '')
                .append($('<svg version="1.1" id="Ebene_1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" x="0px" y="0px" width="18px" height="18px" viewBox="0.5 18.5 18 18" xml:space="preserve">\n    <style type="text/css">\n        \n    </style>\n    <path d="M16.4,25.6c0,0-7.3,4.9-8.6,3.7c-1.4-1.4,3.7-8.6,3.7-8.6L16.4,25.6z M15.5,32c0,0.8-0.7,1.5-1.5,1.5c-0.7,0-1.2-0.4-1.4-1\n\tH7.5v2h-5v-5h2v-5.1c-0.6-0.2-1-0.8-1-1.4c0-0.8,0.7-1.5,1.5-1.5c0.8,0,1.5,0.7,1.5,1.5c0,0.7-0.4,1.2-1,1.4v5.1h2v2h5.1\n\tc0.2-0.6,0.8-1,1.4-1C14.8,30.5,15.5,31.2,15.5,32z M6.5,30.5h-3v3h3V30.5z" style="stroke:none"/>\n<path style="fill:rgb(237, 237, 237);stroke:none" d="M13.9,23.2l-5,5c0,0-0.1-0.8,0.7-2.3c0.7-1.5,2.9-4.1,2.9-4.1L13.9,23.2z M6.5,30.5h-3v3h3V30.5z"/>\n</svg>'))
                .appendTo(this._htmlElement)
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
                    this._htmlElement.append($("<span/>").addClass('divider'));
                }
                lastGroup = group;
            }
            _addToolButton(toolInstance);
        }

        // Subscribe to the manager's tool change event
        gApp.getToolManager().addEventListener(GXToolManager.ToolChangedEvent, this._toolChanged, this);
    };

    /**
     * Called whenever the active tool has been changed
     * @param event
     * @private
     */
    EXToolpanel.prototype._toolChanged = function (event) {
        if (event.previousTool && this._toolTypeToButtonMap[GObject.getTypeId(event.previousTool)]) {
            this._toolTypeToButtonMap[GObject.getTypeId(event.previousTool)].removeClass('g-active');
        }
        if (event.newTool && this._toolTypeToButtonMap[GObject.getTypeId(event.newTool)]) {
            this._toolTypeToButtonMap[GObject.getTypeId(event.newTool)].addClass('g-active');
        }
    };

    _.EXToolpanel = EXToolpanel;
})(this);
