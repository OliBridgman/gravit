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
    };

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GPalettes.prototype._htmlElement = null;

    /**
     * @type {Array<{{palette: GPalette, panel: JQuery, menu: GUIMenu}}>}
     * @private
     */
    GPalettes.prototype._palettesInfo = null;

    /**
     * @type {Array<{{expanded: Boolean, visible: Boolean, activePalette: String, palettes: []}}>}
     * @private
     */
    GPalettes.prototype._groupsInfo = null;

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
     * @param {Boolean} active whether to activate or deactivate
     */
    GPalettes.prototype.setPaletteActive = function (paletteId, active) {
        var groupInfo = this._getGroupInfoForPalette(paletteId);

        if (groupInfo && (groupInfo.activePalette !== paletteId || !active || !groupInfo.visible || !groupInfo.expanded)) {
            if (!active) {
                // Simply hide our group and be done w/ it
                this._setGroupVisible(groupInfo, false);
            } else {
                var paletteInfo = this._getPaletteInfo(paletteId);

                // Assign active palette
                groupInfo.activePalette = paletteId;

                // Iterate each tab and mark active/non-active
                groupInfo.container.find('.palette-group-tabs > button').each(function () {
                    var el = $(this);
                    if (el.attr('data-palette-id') === paletteId) {
                        el.addClass('g-active');
                    } else {
                        el.removeClass('g-active');
                    }
                });

                // Iterate each panel and mark visible/hidden
                groupInfo.container.find('.palette-group-panels > div').each(function () {
                    var el = $(this);
                    if (el.attr('data-palette-id') === paletteId) {
                        el.css('display', '');
                    } else {
                        el.css('display', 'none');
                    }
                });

                // Assign palette menu
                groupInfo.menuButton.setMenu(paletteInfo.menu);

                // Toggle menu button visibility depending on menu items
                groupInfo.menuButton._htmlElement.css('visibility', paletteInfo.menu.getItemCount() === 0 ? 'hidden' : 'visible');
                groupInfo.menuButton._item._htmlElement.addClass('g-flat');

                // Group needs to be visible and expanded
                this._setGroupVisible(groupInfo, true);
                this._setGroupExpanded(groupInfo, true);
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
            var overlay = paletteInfo.panel.find('.panel-disabled-overlay');

            if (enabled && overlay.length > 0) {
                overlay.remove();
            } else if (!enabled && overlay.length === 0) {
                overlay = $('<div></div>')
                    .addClass('panel-disabled-overlay')
                    .appendTo(paletteInfo.panel);
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
        // NO-OP
    };
    GPalettes.prototype._addPaletteInfo = function (palette) {
        // Create panel and menu
        var panel = $('<div></div>')
            .attr('data-palette-id', palette.getId())
            .addClass('palette-panel')
            .addClass('palette-' + palette.getId())
            .css('display', 'none');
        var menu = new GUIMenu();

        // Let palette init itself on panel and menu
        palette.init(panel, menu);

        //
        // Add default actions to menu
        //
        // TODO : Properly support below actions
        /*
         if (menu.getItemCount() > 0) {
         menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));
         }

         var groupWithItem = new GUIMenuItem(GUIMenuItem.Type.Menu);
         menu.addItem(groupWithItem);
         // TODO : I18N
         groupWithItem.setCaption('Group ' + ifLocale.get(palette.getTitle()) + ' with');
         groupWithItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
         // Clear all sub-items and re-add possible palettes to group with
         });

         var moveGroupUpItem = new GUIMenuItem();
         menu.addItem(moveGroupUpItem);
         // TODO : I18N
         moveGroupUpItem.setCaption('Move Group Up');
         moveGroupUpItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
         alert('TODO : Move Group Up');
         });

         var moveGroupDownItem = new GUIMenuItem();
         menu.addItem(moveGroupDownItem);
         // TODO : I18N
         moveGroupDownItem.setCaption('Move Group Down');
         moveGroupDownItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
         alert('TODO : Move Group Down');
         });

         var pinGroupItem = new GUIMenuItem();
         menu.addItem(pinGroupItem);
         // TODO : I18N
         pinGroupItem.setCaption('Pin Group');
         pinGroupItem.setIcon('fa fa-thumb-tack');
         pinGroupItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
         alert('TODO : Pin Group');
         });

         menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));

         var closePanelItem = new GUIMenuItem();
         menu.addItem(closePanelItem);
         // TODO : I18N
         closePanelItem.setCaption('Close Group');
         closePanelItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
         alert('TODO : Close Group');
         });
         */

        //
        // Initiate our palette info object and add it to our array
        //
        var paletteInfo = {
            palette: palette,
            panel: panel,
            menu: menu
        };
        this._palettesInfo.push(paletteInfo);

        // Add update listener to palette
        palette.addEventListener(GPalette.UpdateEvent, function () {
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
                }.bind(this)));

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
            palettes: [],
            menuButton: new GUIMenuButton()
        };

        groupInfo.menuButton.setIcon($('<span></span>')
            .addClass('fa fa-chevron-down'));

        groupInfo.container = $('<div></div>')
            .addClass('palette-group')
            .append($('<div></div>')
                .addClass('palette-group-header')
                .append($('<div></div>')
                    .addClass('palette-group-collapse')
                    .append($('<button></button>')
                        .append($('<span></span>')
                            .addClass('fa fa-angle-double-down'))
                        .on('click', function () {
                            this._setGroupExpanded(groupInfo, !groupInfo.expanded);
                        }.bind(this))))
                .append($('<div></div>')
                    .addClass('palette-group-tabs'))
                .append(groupInfo.menuButton._htmlElement))
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

            var buttonSpan = groupInfo.container.find('.palette-group-collapse > button > span');

            if (groupInfo.expanded) {
                groupInfo.container.css('height', '');
                groupInfo.container.removeClass('collapsed-palette');
                buttonSpan.attr('class', 'fa  fa-angle-double-down');
            } else {
                var header = groupInfo.container.find('.palette-group-header');
                groupInfo.container.height(header.outerHeight());
                groupInfo.container.addClass('collapsed-palette');
                buttonSpan.attr('class', 'fa  fa-angle-double-right');
            }
        }
    };

    GPalettes.prototype._setGroupVisible = function (groupInfo, visible) {
        if (visible !== groupInfo.visible) {
            groupInfo.visible = visible;

            if (groupInfo.visible) {
                groupInfo.container.css('display', '');
            } else {
                groupInfo.container.css('display', 'none');
            }
        }
    };

    _.GPalettes = GPalettes;
})(this);