(function (_) {
    /**
     * A menu implementation
     * @param {GMenuItem|GMenuBar} parent parent if not a standalone menu
     * @class GMenu
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GMenu(parent) {
        this._parent = parent;
        this._htmlElement = $("<ul></ul>").addClass('g-menu');
        this._htmlElement.on("mouseover", this._mouseOver.bind(this));
        this._htmlElement.on("mouseout", this._mouseOut.bind(this));
    };

    IFObject.inherit(GMenu, GEventTarget);

    /**
     * A position a menu can be opened at
     * @enum
     */
    GMenu.Position = {
        Left_Top: 0,
        Center: 1,
        Right_Bottom: 2
    };

    /**
     * Global, active menu
     * @type {GMenu}
     * @private
     */
    GMenu._activeMenu = null;

    /**
     * Array of tracked mouse locations
     * @type {Array<{{x:Number, y: Number}}>}
     * @private
     */
    GMenu._activeMenuMouseLocations = null;

    /**
     * Get the globally, active menu
     * @returns {GMenu}
     */
    GMenu.getActiveMenu = function () {
        return GMenu._activeMenu;
    };

    /**
     * Assign the globally, active menu, closing any active one, first
     * @param {GMenu} menu if null, only closes
     */
    GMenu.setActiveMenu = function (menu, noCloseCall) {
        // Close any active menu, first
        if (this._activeMenu) {
            if (!noCloseCall) {
                this._activeMenu.close();
            }

            this._activeMenu = null;

            // Remove global menu listeners
            document.removeEventListener("mousemove", GMenu._activeMenuMouseMoveListener);
            document.removeEventListener("mousedown", GMenu._activeMenuMouseUpDownListener);
            document.removeEventListener("mouseup", GMenu._activeMenuMouseUpDownListener);
            document.removeEventListener("keyup", GMenu._activeMenuKeyDownListener);
        }

        this._activeMenu = menu;

        // Assign a new, active menu if any
        if (this._activeMenu) {
            // Register menu listeners
            document.addEventListener("mousemove", GMenu._activeMenuMouseMoveListener);
            document.addEventListener("mousedown", GMenu._activeMenuMouseUpDownListener);
            // Mouse down close listener needs slight timeout to not hit the 'click' event and
            // immediately close any active menu after mouse up
            setTimeout(function () {
                document.addEventListener("mouseup", GMenu._activeMenuMouseUpDownListener);
            }, 250);
            document.addEventListener("keyup", GMenu._activeMenuKeyDownListener);
        }
    };

    /**
     * Method listening on document mouse move for tracking
     * the last mouse locations
     * @param evt
     * @private
     */
    GMenu._activeMenuMouseMoveListener = function (evt) {
        if (!GMenu._activeMenuMouseLocations) {
            GMenu._activeMenuMouseLocations = [];
        }

        GMenu._activeMenuMouseLocations.push({
            x: evt.pageX,
            y: evt.pageY
        });

        if (GMenu._activeMenuMouseLocations.length > 3) {
            GMenu._activeMenuMouseLocations.shift();
        }
    };

    /**
     * Method listening on document mouse down/up and simply
     * closes the active menu if any
     * @param evt
     * @private
     */
    GMenu._activeMenuMouseUpDownListener = function (evt) {
        GMenu.setActiveMenu(null);
    };

    /**
     * Method listening on document key event and closes
     * the active menu if any when the ESC is hit
     * @param evt
     * @private
     */
    GMenu._activeMenuKeyDownListener = function (evt) {
        if (evt.keyCode == 27) {
            GMenu.setActiveMenu(null);
        }
    };

    /**
     * Creates a menu out of the registered actions
     * @param {Array<GAction>} actions array of actions to create a menu of
     * @param {GMenu} targetMenu the menu to create the action structure into
     */
    GMenu.createActionMenu = function (actions, targetMenu) {
        // TODO : Order given actions by category & group

        var itemToGroupArray = [];

        var _getGroupForItem = function (item) {
            for (var i = 0; i < itemToGroupArray.length; ++i) {
                if (itemToGroupArray[i].item === item) {
                    return itemToGroupArray[i].group;
                }
            }
        };

        var _addItemGroupAndDivider = function (menu, item, group) {
            if (menu.getItemCount() > 0) {
                var lastGroup = _getGroupForItem(menu.getItem(menu.getItemCount() - 1));
                if (lastGroup !== group) {
                    menu.addItem(new GMenuItem(GMenuItem.Type.Divider));
                }
            }
            itemToGroupArray.push({
                item: item,
                group: group
            });
        };

        for (var i = 0; i < actions.length; ++i) {
            var action = actions[i];

            if (!action.isAvailable()) {
                continue;
            }

            var category = ifLocale.get(action.getCategory());
            var group = action.getGroup();
            var categories = category ? category.split('/') : null;
            var groups = group ? [""].concat(group.split('/')) : null;

            if (groups && categories && categories.length !== groups.length - 1) {
                throw new Error("Number of categories different thant number of groups.");
            }

            // Build up our structure by iterating our categories
            var currentMenu = targetMenu;
            if (categories) {
                for (var k = 0; k < categories.length; ++k) {
                    var category = categories[k];
                    var group = groups ? groups[k] : null;
                    var item = currentMenu.findItem(category);
                    if (!item) {
                        item = new GMenuItem(GMenuItem.Type.Menu);
                        item.setCaption(category);
                        _addItemGroupAndDivider(currentMenu, item, group);

                        currentMenu.addItem(item);
                    }
                    currentMenu = item.getMenu();
                }
            }

            // Add our action item now
            var actionItem = new GMenuItem();
            actionItem.setAction(action);
            _addItemGroupAndDivider(currentMenu, actionItem, groups ? groups[groups.length - 1] : null);

            currentMenu.addItem(actionItem);
        }
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GMenu.OpenEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a (standalone) menu is opened
     * @class GMenu.OpenEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenu.OpenEvent = function () {
    };
    IFObject.inherit(GMenu.OpenEvent, GEvent);

    /** @override */
    GMenu.OpenEvent.prototype.toString = function () {
        return "[Object GMenu.OpenEvent]";
    };

    GMenu.OPEN_EVENT = new GMenu.OpenEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenu.CloseEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a (standalone) menu is closed
     * @class GMenu.CloseEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenu.CloseEvent = function () {
    };
    IFObject.inherit(GMenu.CloseEvent, GEvent);

    /** @override */
    GMenu.CloseEvent.prototype.toString = function () {
        return "[Object GMenu.CloseEvent]";
    };

    GMenu.CLOSE_EVENT = new GMenu.CloseEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenu Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {GMenuItem|GMenuBar}
     * @private
     */
    GMenu.prototype._parent = null;

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GMenu.prototype._htmlElement = null;

    /**
     * @type {Array<GMenuItem>}
     * @private
     */
    GMenu.prototype._items = null;

    /**
     * @type {boolean}
     * @private
     */
    GMenu.prototype._hovered = false;

    /**
     * @returns {GMenuItem|GMenuBar}
     */
    GMenu.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * Checks and returns whether the mouse is currently
     * over this menu including sub menus if desired
     * @param {boolean} recursive if true, considers
     * also any sub-menu hovering as effective, otherwise
     * only takes into account this menu
     */
    GMenu.prototype.isHovered = function (recursive) {
        if (this._hovered) {
            return true;
        }
        else if (!recursive) {
            return false;
        } else {
            for (var i = 0; i < this.getItemCount(); ++i) {
                var item = this.getItem(i);
                if (item instanceof GMenuItem && item.getType() === GMenuItem.Type.Menu) {
                    if (item.getMenu().isHovered(true)) {
                        return true;
                    }
                }
            }
            return false;
        }
    };

    /**
     * Checks whether this menu is a root menu or not which
     * is the case if the parent is either null or anything
     * else than another GMenuItem
     * @returns {boolean}
     */
    GMenu.prototype.isRootMenu = function () {
        return !this._parent || !(this._parent instanceof GMenuItem);
    };

    /**
     * Checks if this is a sub-menu or not
     * @returns {boolean}
     */
    GMenu.prototype.isSubMenu = function () {
        if (this._parent && this._parent instanceof GMenuItem) {
            return !this._parent.isRootItem();
        }
        return false;
    };

    /**
     * Creates and appends a divider and returns it
     * @returns {GMenuItem}
     */
    GMenu.prototype.createAddDivider = function () {
        return this.createInsertDivider(this.getItemCount());
    };

    /**
     * Creates and inserts a divider and returns it
     * @param index
     * @returns {GMenuItem}
     */
    GMenu.prototype.createInsertDivider = function (index) {
        var newItem = new GMenuItem(GMenuItem.Type.Divider);
        this.insertItem(index, newItem);
        return newItem;
    };

    /**
     * Creates and appends a menu item and returns it
     * @param caption
     * @param activate
     * @param enter
     * @param leave
     * @returns {GMenuItem}
     */
    GMenu.prototype.createAddItem = function (caption, activate, enter, leave) {
        return this.createInsertItem(this.getItemCount(), caption, activate, enter, leave);
    };

    /**
     * Creates and inserts a menu item and returns it
     * @param index
     * @param caption
     * @param activate
     * @param enter
     * @param leave
     * @returns {GMenuItem}
     */
    GMenu.prototype.createInsertItem = function (index, caption, activate, enter, leave) {
        var newItem = new GMenuItem();
        newItem.setCaption(caption);

        if (activate) {
            newItem.addEventListener(GMenuItem.ActivateEvent, activate);
        }

        if (enter) {
            newItem.addEventListener(GMenuItem.EnterEvent, enter);
        }

        if (leave) {
            newItem.addEventListener(GMenuItem.LeaveEvent, leave);
        }

        this.insertItem(index, newItem);

        return newItem;
    };

    /**
     * Add a menu item to this menu
     * @param {GMenuItem} item
     * @returns {Number} index of newly inserted item
     * @version 1.0
     */
    GMenu.prototype.addItem = function (item) {
        return this.insertItem(this.getItemCount(), item);
    };

    /**
     * Insert a menu item into this menu
     * @param {Number} index the index to insert before, if equal
     * to length, inserts at end
     * @param {GMenuItem} item
     * @returns {Number} index of newly inserted item
     * @version 1.0
     */
    GMenu.prototype.insertItem = function (index, item) {
        if (this._items == null) {
            this._items = [];
        }

        if (index + 1 < this._items.length) {
            this._items.splice(index, 0, item);
            this._items[index + 1]._htmlElement.before(item._htmlElement);
        } else {
            this._items.push(item);
            this._htmlElement.append(item._htmlElement);
        }

        item._parent = this;
    };

    /**
     * Remove an item at a given index
     * @param {Number} index
     * @version 1.0
     */
    GMenu.prototype.removeItem = function (index) {
        if (index >= 0 && index < this.getItemCount()) {
            this._items[index]._parent = null;
            this._items[index]._htmlElement.detach();
            this._items.splice(index, 1);
        }
    };

    /**
     * Removes all items of this menu
     */
    GMenu.prototype.clearItems = function () {
        if (this._items) {
            for (var i = 0; i < this._items.length; ++i) {
                this._items[i]._parent = null;
                this._items[i]._htmlElement.detach();
            }
            this._items = [];
        }
    };

    /**
     * Get a menu item by it's index
     * @param {Number} index the index to look for
     * @return {GMenuItem} the menu item or null if index is invalid
     */
    GMenu.prototype.getItem = function (index) {
        if (index >= 0 && index < this.getItemCount()) {
            return this._items[index];
        }
        return null;
    };

    /**
     * @returns {Number} the number of items in this menu
     * @version 1.0
     */
    GMenu.prototype.getItemCount = function () {
        return this._items ? this._items.length : 0;
    };

    /**
     * Get the index for an item
     * @param {GMenuItem} item the item to get an index for
     * @return {Number} index of the item or -1 if not found
     * @version 1.0
     */
    GMenu.prototype.indexOf = function (item) {
        return this._items ? this._items.indexOf(item) : -1;
    };

    /**
     * Find a menu item by its caption
     * @param {String} caption the caption to find
     * @return {GMenuItem} the menu item or null if not found
     */
    GMenu.prototype.findItem = function (caption) {
        for (var i = 0; i < this.getItemCount(); ++i) {
            var item = this.getItem(i);
            if (caption == item.getCaption()) {
                return item;
            }
        }
        return null;
    };

    /**
     * Called to update the status of all direct children of this menu
     * @version 1.0
     */
    GMenu.prototype.update = function () {
        for (var i = 0; i < this.getItemCount(); ++i) {
            var item = this.getItem(i);
            item.update();
        }
    };

    /**
     * Returns whether this menu is open or not
     * @return {Boolean}
     */
    GMenu.prototype.isOpen = function () {
        return !!this._htmlElement.parent().length;
    };

    /**
     * Open the menu at a given reference which can be
     * either an absolute point or a jquery html element
     * @param {JQuery|{{x: Number, y: Number}}} reference the reference element or point to open at
     * @param {GMenu.Position|Number} horzPosition the horizontal position to open at
     * @param {GMenu.Position|Number} vertPosition the vertical position to open at
     */
    GMenu.prototype.open = function (reference, horzPosition, vertPosition) {
        horzPosition = typeof horzPosition === 'number' ? horzPosition : GMenu.Position.Center;
        vertPosition = typeof vertPosition === 'number' ? vertPosition : GMenu.Position.Center;

        if (!this.isOpen()) {
            // Do an initial update on the menu
            this.update();

            // Attach it to the DOM
            this._htmlElement.appendTo($("body"));

            // If this is not a sub-menu, then mark this
            // as being the global active menu
            if (!this.isSubMenu()) {
                GMenu.setActiveMenu(this);
            }

            // Send open event
            this.trigger(GMenu.OPEN_EVENT);
        }

        if (this._htmlElement.parent().is("body")) {
            // Gather our menu's extents
            var menuWidth = this._htmlElement.outerWidth();
            var menuHeight = this._htmlElement.outerHeight();

            // Gather window's extents
            var windowWidth = $(window).width();
            var windowHeight = $(window).height();

            // Try to figure show rectangle
            var rect = {x: 0, y: 0, width: 0, height: 0};
            if (typeof reference.x === 'number' && typeof reference.y === 'number') {
                rect.x = reference.x;
                rect.y = reference.y;
            } else {
                var refOffset = reference.offset();
                rect.x = refOffset.left;
                rect.y = refOffset.top;
                rect.width = reference.outerWidth();
                rect.height = reference.outerHeight();
            }

            // Now find the right x,y position according to rect and position
            var x = 0;
            switch (horzPosition) {
                case GMenu.Position.Left_Top:
                    x = rect.x - menuWidth;
                    break;
                case GMenu.Position.Center:
                    x = rect.x;
                    break;
                case GMenu.Position.Right_Bottom:
                    x = rect.x + rect.width;
                    break;
            }

            var y = 0;
            switch (vertPosition) {
                case GMenu.Position.Left_Top:
                    y = rect.y - menuHeight;
                    break;
                case GMenu.Position.Center:
                    y = rect.y;
                    break;
                case GMenu.Position.Right_Bottom:
                    y = rect.y + rect.height;
                    break;
            }

            // Correct position to not float outside visible area
            if (x < 0) {
                x = 0;
            }
            if (x + menuWidth >= windowWidth) {
                x = windowWidth - menuWidth;
            }
            if (y < 0) {
                y = 0;
            }
            if (y + menuHeight >= windowHeight) {
                y = windowHeight - menuHeight;
            }

            // Finally position our menu and set the position classes
            this._htmlElement.css('left', x);
            this._htmlElement.css('top', y);

            switch (horzPosition) {
                case GMenu.Position.Left_Top:
                    this._htmlElement.addClass('g-menu-left');
                    break;
                case GMenu.Position.Right_Bottom:
                    this._htmlElement.addClass('g-menu-right');
                    break;
            }

            switch (vertPosition) {
                case GMenu.Position.Left_Top:
                    this._htmlElement.addClass('g-menu-top');
                    break;
                case GMenu.Position.Right_Bottom:
                    this._htmlElement.addClass('g-menu-bottom');
                    break;
            }
        }
    };

    /**
     * Close the menu if it is opened and closeable
     */
    GMenu.prototype.close = function () {
        if (this.isOpen() && this._htmlElement.parent().is("body")) {
            this.closeMenus();

            // Remove our orientation classes
            this._htmlElement.removeClass('g-menu-left g-menu-right g-menu-top g-menu-bottom');

            // Simply detach our element
            this._htmlElement.detach();

            // If this is the active menu, remove it now
            if (this === GMenu._activeMenu) {
                GMenu.setActiveMenu(null, true);
            }

            // Send close event
            this.trigger(GMenu.CLOSE_EVENT);
        }
    };

    /**
     * Close all sub menus
     */
    GMenu.prototype.closeMenus = function () {
        for (var i = 0; i < this.getItemCount(); ++i) {
            var item = this.getItem(i);
            if (item instanceof GMenuItem && item.getType() === GMenuItem.Type.Menu) {
                item.getMenu().close();
            }
        }
    };

    GMenu.prototype._mouseOver = function (evt) {
        this._hovered = true;
    };

    GMenu.prototype._mouseOut = function (evt) {
        this._hovered = false;

        if (this.isSubMenu()) {
            setTimeout(function () {
                if (!this.isHovered(true)) {
                    this.closeMenus();
                }
            }.bind(this), 150);
        }
    };

    _.GMenu = GMenu;
})(this);
