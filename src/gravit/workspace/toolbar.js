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
                .addClass('section sidebars'))
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
        // Add sidebars
        if (gravit.sidebars && gravit.sidebars.length > 0) {
            var sidebarsSection = this._htmlElement.find('.sidebars');

            for (var i = 0; i < gravit.sidebars.length; ++i) {
                var sidebar = gravit.sidebars[i];

                $('<button></button>')
                    .append($(sidebar.getIcon()))
                    .attr('title', ifLocale.get(sidebar.getTitle()))
                    .attr('data-sidebar-id', sidebar.getId())
                    .on('click', function () {
                        var btn = $(this);
                        var isActive = btn.hasClass('g-active');

                        sidebarsSection.find('button').each(function (index, element) {
                            $(element).removeClass('g-active');
                        });

                        if (isActive) {
                            gApp.getSidebars().setActiveSidebar(null);
                            gApp.setPartVisible(GApplication.Part.Sidebars, false);
                        } else {
                            gApp.getSidebars().setActiveSidebar(btn.attr('data-sidebar-id'));
                            gApp.setPartVisible(GApplication.Part.Sidebars, true);
                            btn.addClass('g-active');
                        }
                    })
                    .appendTo(sidebarsSection);
            }
        }

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
            var title = ifLocale.get(tool.title);
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
