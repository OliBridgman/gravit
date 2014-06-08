(function (_) {
    /**
     * The global toolbar class
     * @class GToolbar
     * @constructor
     */
    function GToolbar(htmlElement) {
        this._htmlElement = htmlElement;
        htmlElement
            /*
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
                        .attr('title', 'Structure'))))*/
            .append($('<div></div>')
                .addClass('section toolpanel'));

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
        var _addToolButton = function (tool) {
            var button = $("<button></button>")
                .attr('class', tool.instance == gApp.getToolManager().getActiveTool() ? 'g-active' : '')
                .append($(tool.icon).attr('width', '18px').attr('height', '18px'))
                .appendTo(toolpanel)
                .on('click', function () {
                    gApp.getToolManager().activateTool(tool.instance);
                }.bind(this));

            // Concat/read the tool's title
            var title = tool.title;
            if (tool.keys && tool.keys.length > 0) {
                for (var i = 0; i < tool.keys.length; ++i) {
                    if (i == 0) {
                        title += " (";
                    } else {
                        title += ", ";
                    }
                    title += tool.keys[i];
                }
                title += ")";
            }
            button.attr('title', title);

            this._toolTypeToButtonMap[IFObject.getTypeId(tool.instance)] = button;
        }.bind(this);

        // Append all tools now
        var lastGroup = null;
        for (var i = 0; i < gravit.tools.length; ++i) {
            var tool = gravit.tools[i];
            if (tool.group != lastGroup) {
                if (i > 0) {
                    // Add a divider, first
                    toolpanel.append(
                        $("<div></div>")
                            .addClass('divider'));
                }
                lastGroup = tool.group;
            }
            _addToolButton(tool);
        }

        // Subscribe to some events
        gApp.getToolManager().addEventListener(IFToolManager.ToolChangedEvent, this._toolChanged, this);
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
        if (event.previousTool && this._toolTypeToButtonMap[IFObject.getTypeId(event.previousTool)]) {
            this._toolTypeToButtonMap[IFObject.getTypeId(event.previousTool)].removeClass('g-active');
        }
        if (event.newTool && this._toolTypeToButtonMap[IFObject.getTypeId(event.newTool)]) {
            this._toolTypeToButtonMap[IFObject.getTypeId(event.newTool)].addClass('g-active');
        }
    };

    _.GToolbar = GToolbar;
})(this);
