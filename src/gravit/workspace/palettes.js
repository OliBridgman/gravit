(function (_) {
    /**
     * The global palettes class
     * @class GPalettes
     * @constructor
     */
    function GPalettes(htmlElement) {
        this._htmlElement = htmlElement;
        this._palettesInfo = [];
        this._groupsInfo = [];
        this._collapseIcon = $('<span class="fa fa-stack collapse-icon"><span class="fa fa-stack-1x fa-angle-up"></span><span class="fa fa-stack-1x fa-angle-down"></span></span>');
    };

    /**
     * @type {JQuery}
     * @private
     */
    GPalettes.prototype._htmlElement = null;

    /**
     * @type {Array<{{palette: GPalette, panel: JQuery}}>}
     * @private
     */
    GPalettes.prototype._palettesInfo = null;

    /**
     * @type {Array<{{expanded: Boolean, activePalette: String, palettes: [], container: JQuery}}>}
     * @private
     */
    GPalettes.prototype._groupsInfo = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPalettes.prototype._collapseIcon = null;

    /**
     * Group an array of palettes together
     * @param {Array<GPalette>} palettes
     */
    GPalettes.prototype.groupPalettes = function (palettes) {
        // Detach palettes, first
        for (var i = 0; i < palettes.length; ++i) {
            this._detachPaletteFromGroup(palettes[i].getId());
        }

        // Initiate a new group for them
        var group = this._addGroupInfo();

        // Attach palettes to the group
        for (var i = 0; i < palettes.length; ++i) {
            this._attachPaletteToGroup(group, palettes[i].getId());
        }
    };

    /**
     * Returns whether a given palette is active or not. Note that this
     * will also return false if the palette's group is not visible
     * or not expanded
     * @param {String} paletteId
     * @return {Boolean}
     */
    GPalettes.prototype.isPaletteActive = function (paletteId) {
        var groupInfo = this._getGroupInfoForPalette(paletteId);
        if (groupInfo) {
            return groupInfo.activePalette === paletteId && groupInfo.visible && groupInfo.expanded;
        }
        return false;
    };

    /**
     * Assigns whether a given palette is active or not within it's group.
     * Note that when the palette should be activated then the system
     * will ensure that a) the sidebar is visible b) the palette is visible
     * and c) the palette's group is expanded
     * @param {String} paletteId
     */
    GPalettes.prototype.setPaletteActive = function (paletteId) {
        var groupInfo = this._getGroupInfoForPalette(paletteId);

        if (groupInfo && (groupInfo.activePalette !== paletteId || !active || !groupInfo.visible || !groupInfo.expanded)) {
            var paletteInfo = this._getPaletteInfo(paletteId);

            // Assign active palette
            groupInfo.activePalette = paletteId;

            // Iterate each tab and mark active/non-active
            groupInfo.container.find('.palette-group-tabs > button').each(function (index, element) {
                var el = $(element);
                if (el.attr('data-palette-id') === paletteId) {
                    el.addClass('g-active');
                } else {
                    el.removeClass('g-active');
                }
            }.bind(this));

            // Iterate each panel and mark visible/hidden
            groupInfo.container.find('.palette-group-panels > div').each(function (index, element) {
                var el = $(element);
                if (el.attr('data-palette-id') === paletteId) {
                    el.css('display', '');
                } else {
                    el.css('display', 'none');
                }
            });

            // Empty and re-assign controls
            var controls = groupInfo.container.find('.palette-group-controls');
            controls.children().detach();
            controls.append(paletteInfo.controls);

            if (!groupInfo.expanded) {
                this._setGroupExpanded(groupInfo, true);
            } else {
                this._layoutPalettes();
            }
        }
    };

    /**
     * Returns whether a given palette is enabled or not.
     * @param {String} paletteId
     * @return {Boolean}
     */
    GPalettes.prototype.isPaletteEnabled = function (paletteId) {
        var paletteInfo = this._getPaletteInfo(paletteId);
        if (paletteInfo) {
            return paletteInfo.panel.find('.panel-disabled-overlay').length == 0;
        }
        return false;
    };

    /**
     * Enable or disable a palette
     * @param {String} paletteId
     * @param {Boolean} enabled
     */
    GPalettes.prototype.setPaletteEnabled = function (paletteId, enabled) {
        var paletteInfo = this._getPaletteInfo(paletteId);
        if (paletteInfo) {
            if (enabled) {
                paletteInfo.panel.find('.g-disabled-overlay').remove();
                paletteInfo.panel.removeClass('g-disabled');
            } else {
                var overlay = paletteInfo.panel.find('.g-disabled-overlay');

                if (overlay.length === 0) {
                    overlay = $('<div></div>')
                        .addClass('g-disabled-overlay')
                        .appendTo(paletteInfo.panel);
                }

                paletteInfo.panel.addClass('g-disabled');
            }
        }
    };

    /**
     * Called from the workspace to initialize
     */
    GPalettes.prototype.init = function () {
        /** Array<Array<GPalette>> */
        var grouppedPalettes = [];

        // Add all palettes first and collect their grouping
        var lastGroup = null;
        var lastPalettes = null;
        for (var i = 0; i < gravit.palettes.length; ++i) {
            var palette = gravit.palettes[i];

            this._addPaletteInfo(palette);

            var group = palette.getGroup();
            if (!group) {
                group = palette.getId();
            }

            if (!lastGroup || lastGroup !== group) {
                if (lastPalettes) {
                    grouppedPalettes.push(lastPalettes);
                }
                lastPalettes = [];
                lastGroup = group;
            }

            lastPalettes.push(palette);
        }

        if (lastPalettes) {
            grouppedPalettes.push(lastPalettes);
        }

        // Group palettes now which'll create our groups
        for (var i = 0; i < grouppedPalettes.length; ++i) {
            this.groupPalettes(grouppedPalettes[i]);

            // Active first palette by default
            this.setPaletteActive(grouppedPalettes[i][0].getId(), true);

            // Update enabled status if palettes
            for (var k = 0; k < grouppedPalettes[i].length; ++k) {
                var palette = grouppedPalettes[i][k];
                this.setPaletteEnabled(palette.getId(), palette.isEnabled());
            }
        }
    };

    /**
     * Called from the workspace to relayout
     */
    GPalettes.prototype.relayout = function () {
        this._layoutPalettes();
    };

    GPalettes.prototype._addPaletteInfo = function (palette) {
        // Create panel
        var panel = $('<div></div>')
            .attr('data-palette-id', palette.getId())
            .addClass('palette-panel')
            .addClass('palette-' + palette.getId())
            .css('display', 'none');

        var controls = $('<div></div>');

        // Let palette init itself on panel
        palette.init(panel, controls);

        //
        // Initiate our palette info object and add it to our array
        //
        var paletteInfo = {
            palette: palette,
            panel: panel,
            controls: controls
        };
        this._palettesInfo.push(paletteInfo);

        // Add update listener to palette
        palette.addEventListener(GView.UpdateEvent, function () {
            this.setPaletteEnabled(palette.getId(), palette.isEnabled());
            // TODO : Update title, shortcut, etc.
        }.bind(this));

        return paletteInfo;
    };

    GPalettes.prototype._getPaletteInfo = function (paletteId) {
        for (var i = 0; i < this._palettesInfo.length; ++i) {
            if (this._palettesInfo[i].palette.getId() === paletteId) {
                return this._palettesInfo[i];
            }
        }
        return null;
    };

    GPalettes.prototype._detachPaletteFromGroup = function (paletteId) {
        var group = this._getGroupInfoForPalette(paletteId);
        var paletteInfo = this._getPaletteInfo(paletteId);

        if (group && paletteInfo) {
            // Remove Tab & Panel
            group.container.find('.palette-group-tabs > button[data-palette-id="' + paletteId + '"]').remove();

            // Important: only detach, not remove our panel as it will be re-used!!
            group.container.find('.palette-group-panels > div[data-palette-id="' + paletteId + '"]').detach();

            // Remove from palettes
            group.palettes.slice(group.palettes.indexOf(paletteId));
        }
    };

    GPalettes.prototype._attachPaletteToGroup = function (groupInfo, paletteId) {
        var paletteInfo = this._getPaletteInfo(paletteId);

        if (paletteInfo) {
            var tabsContainer = groupInfo.container.find('.palette-group-tabs');
            var panelsContainer = groupInfo.container.find('.palette-group-panels');

            // Add Tab & Panel
            tabsContainer.append($('<button></button>')
                .attr('data-palette-id', paletteInfo.palette.getId())
                .text(ifLocale.get(paletteInfo.palette.getTitle()))
                .on('click', function () {
                    // If palette already is active, change collapse state instead
                    if (this.isPaletteActive(paletteInfo.palette.getId())) {
                        this._setGroupExpanded(groupInfo, !groupInfo.expanded);
                    } else {
                        this.setPaletteActive(paletteInfo.palette.getId(), true);
                    }
                }.bind(this))
                .prepend(this._collapseIcon.clone()));

            panelsContainer.append(paletteInfo.panel);

            // Add to palettes
            groupInfo.palettes.push(paletteId);
        }
    };

    GPalettes.prototype._addGroupInfo = function () {
        var groupInfo = {
            expanded: true,
            visible: true,
            activePalette: null,
            palettes: []
        };

        groupInfo.container = $('<div></div>')
            .addClass('palette-group')
            .append($('<div></div>')
                .addClass('palette-group-header')
                .append($('<div></div>')
                    .addClass('palette-group-tabs'))
                .append($('<div></div>')
                    .addClass('palette-group-controls')))
            .append($('<div></div>')
                .addClass('palette-group-panels'))
            .appendTo(this._htmlElement);

        this._groupsInfo.push(groupInfo);

        return groupInfo;
    };

    GPalettes.prototype._getGroupInfoForPalette = function (paletteId) {
        for (var i = 0; i < this._groupsInfo.length; ++i) {
            if (this._groupsInfo[i].palettes.indexOf(paletteId) >= 0) {
                return this._groupsInfo[i];
            }
        }
        return null;
    };

    GPalettes.prototype._setGroupExpanded = function (groupInfo, expanded) {
        if (expanded !== groupInfo.expanded) {
            groupInfo.expanded = expanded;

            if (groupInfo.expanded) {
                groupInfo.container.css('height', '');
                groupInfo.container.removeClass('collapsed-palette');
            } else {
                var header = groupInfo.container.find('.palette-group-header');
                groupInfo.container.height(header.outerHeight());
                groupInfo.container.addClass('collapsed-palette');
            }

            this._layoutPalettes();
        }
    };

    GPalettes.prototype._layoutPalettes = function () {
        // Calculate our remaining space and collect all palettes
        var availSpace = this._htmlElement.height();
        var autosizePalettes = 0;
        var activePalettesInfo = [];
        for (var i = 0; i < this._groupsInfo.length; ++i) {
            var groupInfo = this._groupsInfo[i];
            availSpace -= groupInfo.container.find('.palette-group-header').outerHeight();

            if (groupInfo.expanded && groupInfo.activePalette) {
                for (var j = 0; j < this._palettesInfo.length; ++j) {
                    var paletteInfo = this._palettesInfo[j];
                    if (paletteInfo.palette.getId() === groupInfo.activePalette) {
                        if (paletteInfo.palette.isAutoSize()) {
                            autosizePalettes++;
                        } else {
                            availSpace -= paletteInfo.panel.outerHeight();
                        }
                        activePalettesInfo.push(paletteInfo);
                    }
                }
            }
        }

        var spacePerPalette = 0;
        if (availSpace > 0 && autosizePalettes > 0) {
            // TODO: Fix this -- 3px removal for css border-bottom
            availSpace -= (activePalettesInfo.length+1) * 3;

            spacePerPalette = availSpace / autosizePalettes;
        }

        // Resize if necessary
        for (var i = 0; i < activePalettesInfo.length; ++i) {
            var paletteInfo = activePalettesInfo[i];
            if (spacePerPalette > 0 && paletteInfo.palette.isAutoSize()) {
                paletteInfo.savedHeight = paletteInfo.panel.css('height');
                paletteInfo.panel.css('height', spacePerPalette.toString() + 'px');
            } else {
                paletteInfo.panel.css('height', paletteInfo.savedHeight);
            }
        }
    };

    _.GPalettes = GPalettes;
})(this);