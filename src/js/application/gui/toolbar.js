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
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GToolbar.prototype._htmlElement = null;

    /**
     * @type {Array<{{group: String, tools: Array}}>}
     * @private
     */
    GToolbar.prototype._groupedTools = null;

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

        // Group tools together, first
        this._groupedTools = [];
        for (var i = 0; i < gravit.tools.length; ++i) {
            var tool = gravit.tools[i];
            var foundGroup = false;
            for (var k = 0; k < this._groupedTools.length; ++k) {
                if (this._groupedTools[k].group === tool.group) {
                    this._groupedTools[k].tools.push(tool);
                    foundGroup = true;
                }
            }

            if (!foundGroup) {
                this._groupedTools.push({
                    group: tool.group,
                    tools: [tool]
                });
            }
        }


        // Append all tool groups as buttons now
        var lastCategory = null;
        for (var i = 0; i < this._groupedTools.length; ++i) {
            var group = this._groupedTools[i].group;
            var tools = this._groupedTools[i].tools;
            var mainTool = tools[0];

            var category = ifLocale.get(mainTool.category);
            if (category != lastCategory) {
                // Add a divider, first
                if (lastCategory !== null) {
                    $('<hr>')
                        .appendTo(toolpanel);
                }
                lastCategory = category;
            }

            // Append our group button now
            var button = $("<button></button>")
                .attr('data-group', group)
                .appendTo(toolpanel);

            // Add menu logic if there're multiple tools on the group
            if (tools.length > 1) {
                // TODO
            }

            // Assign the main tool to the group button
            this._updateGroupTool(mainTool.instance);
        }

        // Subscribe to some events
        gApp.getToolManager().addEventListener(GToolManager.ToolChangedEvent, this._toolChanged, this);
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
        if (event.previousTool) {
            this._updateGroupTool(event.previousTool);
        }

        if (event.newTool) {
            this._updateGroupTool(event.newTool);
        }
    };

    /** @orivate */
    GToolbar.prototype._updateGroupTool = function (toolInstance) {
        var toolInfo = this._getToolInfo(toolInstance);

        // Collect all group tools
        var groupTools = [];
        for (var i = 0; i < this._groupedTools.length; ++i) {
            if (this._groupedTools[i].group === toolInfo.group) {
                groupTools = this._groupedTools[i].tools.slice();
            }
        }

        var groupButton = this._htmlElement
            .find('.toolpanel button[data-group="' + toolInfo.group + '"]');

        groupButton
            .empty()
            .toggleClass('g-active', toolInstance == gApp.getToolManager().getActiveTool())
            .attr('title', this._getToolTitle(toolInfo))
            .append($(toolInfo.icon).attr('width', '18px').attr('height', '18px'))
            .off('mousedown')
            .on('mousedown', function (evt) {
                gApp.getToolManager().activateTool(toolInstance);

                if (groupTools.length > 1) {
                    var overlayTimeout = setTimeout(function () {
                        var panel = $('<div></div>')
                            .gOverlay({
                                releaseOnClose: true
                            });

                        var _addSubToolButton = function (toolInfo) {
                            $("<button></button>")
                                .addClass('toolbar-tool-button')
                                .append($('<span></span>')
                                    .addClass('fa fa-check fa-fw')
                                    .css('visibility', toolInfo.instance !== gApp.getToolManager().getActiveTool() ? 'hidden' : ''))
                                .append($(toolInfo.icon).attr('width', '18px').attr('height', '18px'))
                                .append($('<span></span>')
                                    .html('&nbsp;' + this._getToolTitle(toolInfo)))
                                .on('mouseenter', function () {
                                    $(this).addClass('g-hover');
                                })
                                .on('mouseleave', function () {
                                    $(this).removeClass('g-hover');
                                })
                                .on('mouseup', function () {
                                    gApp.getToolManager().activateTool(toolInfo.instance);
                                    panel.gOverlay('close');
                                })
                                .on('click', function () {
                                    if (gApp.getToolManager().getActiveTool() !== toolInfo.instance) {
                                        gApp.getToolManager().activateTool(toolInfo.instance);
                                        panel.gOverlay('close');
                                    }
                                })
                                .appendTo(panel);
                        }.bind(this);

                        for (var i = 0; i < groupTools.length; ++i) {
                            _addSubToolButton(groupTools[i]);
                        }

                        panel.gOverlay('open', groupButton);
                    }.bind(this), 250);

                    groupButton
                        .off('mouseup')
                        .on('mouseup', function (evt) {
                            clearTimeout(overlayTimeout);
                            overlayTimeout = null;
                        })
                }
            }.bind(this));

        if (groupTools.length > 1) {
            groupButton.append($('<span></span>')
                .addClass('fa fa-caret-down'));
        }
    };

    /** @private */
    GToolbar.prototype._getToolTitle = function (toolInfo) {
        var title = ifLocale.get(toolInfo.title);

        if (toolInfo.keys && toolInfo.keys.length > 0) {
            for (var i = 0; i < toolInfo.keys.length; ++i) {
                if (i == 0) {
                    title += " (";
                } else {
                    title += ", ";
                }
                title += toolInfo.keys[i];
            }
            title += ")";
        }

        return title;
    };

    /** @private */
    GToolbar.prototype._getToolInfo = function (toolInstance) {
        for (var i = 0; i < gravit.tools.length; ++i) {
            if (gravit.tools[i].instance === toolInstance) {
                return gravit.tools[i];
            }
        }
        return null;
    };

    _.GToolbar = GToolbar;
})(this);
