(function (_) {
    /**
     * A menu implementation
     * @param {GUIMenuItem|GUIMenuBar} parent parent if not a standalone menu
     * @class GUIMenu
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GUIMenu(parent) {
        this._parent = parent;
        this._htmlElement = $("<ul></ul>").addClass('g-menu');
        this._htmlElement.on("mouseover", this._mouseOver.bind(this));
        this._htmlElement.on("mouseout", this._mouseOut.bind(this));
    };

    IFObject.inherit(GUIMenu, GEventTarget);

    /**
     * A position a menu can be opened at
     * @enum
     */
    GUIMenu.Position = {
        Left_Top: 0,
        Center: 1,
        Right_Bottom: 2
    };

    /**
     * Global, active menu
     * @type {GUIMenu}
     * @private
     */
    GUIMenu._activeMenu = null;

    /**
     * Array of tracked mouse locations
     * @type {Array<{{x:Number, y: Number}}>}
     * @private
     */
    GUIMenu._activeMenuMouseLocations = null;

    /**
     * Get the globally, active menu
     * @returns {GUIMenu}
     */
    GUIMenu.getActiveMenu = function () {
        return GUIMenu._activeMenu;
    };

    /**
     * Assign the globally, active menu, closing any active one, first
     * @param {GUIMenu} menu if null, only closes
     */
    GUIMenu.setActiveMenu = function (menu, noCloseCall) {
        // Close any active menu, first
        if (this._activeMenu) {
            if (!noCloseCall) {
                this._activeMenu.close();
            }

            this._activeMenu = null;

            // Remove global menu listeners
            document.addEventListener("mousemove", GUIMenu._activeMenuMouseMoveListener);
            document.removeEventListener("mousedown", GUIMenu._activeMenuMouseUpDownListener);
            document.removeEventListener("mouseup", GUIMenu._activeMenuMouseUpDownListener);
            document.removeEventListener("keyup", GUIMenu._activeMenuKeyDownListener);
        }

        this._activeMenu = menu;

        // Assign a new, active menu if any
        if (this._activeMenu) {
            // Register menu listeners
            document.addEventListener("mousemove", GUIMenu._activeMenuMouseMoveListener);
            document.addEventListener("mousedown", GUIMenu._activeMenuMouseUpDownListener);
            // Mouse down close listener needs slight timeout to not hit the 'click' event and
            // immediately close any active menu after mouse up
            setTimeout(function () {
                document.addEventListener("mouseup", GUIMenu._activeMenuMouseUpDownListener);
            }, 250);
            document.addEventListener("keyup", GUIMenu._activeMenuKeyDownListener);
        }
    };

    /**
     * Method listening on document mouse move for tracking
     * the last mouse locations
     * @param evt
     * @private
     */
    GUIMenu._activeMenuMouseMoveListener = function (evt) {
        if (!GUIMenu._activeMenuMouseLocations) {
            GUIMenu._activeMenuMouseLocations = [];
        }

        GUIMenu._activeMenuMouseLocations.push({
            x: evt.pageX,
            y: evt.pageY
        });

        if (GUIMenu._activeMenuMouseLocations.length > 3) {
            GUIMenu._activeMenuMouseLocations.shift();
        }
    };

    /**
     * Method listening on document mouse down/up and simply
     * closes the active menu if any
     * @param evt
     * @private
     */
    GUIMenu._activeMenuMouseUpDownListener = function (evt) {
        GUIMenu.setActiveMenu(null);
    };

    /**
     * Method listening on document key event and closes
     * the active menu if any when the ESC is hit
     * @param evt
     * @private
     */
    GUIMenu._activeMenuKeyDownListener = function (evt) {
        if (evt.keyCode == 27) {
            GUIMenu.setActiveMenu(null);
        }
    };

    /**
     * Creates a menu out of the registered actions
     * @param {Array<GAction>} actions array of actions to create a menu of
     * @param {GUIMenu} targetMenu the menu to create the action structure into
     */
    GUIMenu.createActionMenu = function (actions, targetMenu) {
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
                    menu.addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));
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
                        item = new GUIMenuItem(GUIMenuItem.Type.Menu);
                        item.setCaption(category);
                        _addItemGroupAndDivider(currentMenu, item, group);

                        currentMenu.addItem(item);
                    }
                    currentMenu = item.getMenu();
                }
            }

            // Add our action item now
            var actionItem = new GUIMenuItem();
            actionItem.setAction(action);
            _addItemGroupAndDivider(currentMenu, actionItem, groups ? groups[groups.length - 1] : null);

            currentMenu.addItem(actionItem);
        }
    };


    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenu.OpenEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a (standalone) menu is opened
     * @class GUIMenu.OpenEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenu.OpenEvent = function () {
    };
    IFObject.inherit(GUIMenu.OpenEvent, GEvent);

    /** @override */
    GUIMenu.OpenEvent.prototype.toString = function () {
        return "[Object GUIMenu.OpenEvent]";
    };

    GUIMenu.OPEN_EVENT = new GUIMenu.OpenEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenu.CloseEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a (standalone) menu is closed
     * @class GUIMenu.CloseEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenu.CloseEvent = function () {
    };
    IFObject.inherit(GUIMenu.CloseEvent, GEvent);

    /** @override */
    GUIMenu.CloseEvent.prototype.toString = function () {
        return "[Object GUIMenu.CloseEvent]";
    };

    GUIMenu.CLOSE_EVENT = new GUIMenu.CloseEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenu Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {GUIMenuItem|GUIMenuBar}
     * @private
     */
    GUIMenu.prototype._parent = null;

    /**
     * @type {HTMLDivElement}
     * @private
     */
    GUIMenu.prototype._htmlElement = null;

    /**
     * @type {Array<GUIMenuItem>}
     * @private
     */
    GUIMenu.prototype._items = null;

    /**
     * @type {boolean}
     * @private
     */
    GUIMenu.prototype._hovered = false;

    /**
     * Function to check if the menu should not be opened under current conditions
     * @type {Function} - if exists and returns true, then the menu opening should be prevented
     * @private
     */
    GUIMenu.prototype._menuBlocker = null;

    /**
     * @returns {GUIMenuItem|GUIMenuBar}
     */
    GUIMenu.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * Sets function for checking if the menu should not be opened under current conditions
     * @param {Function} menuBlocker, should return Boolean
     */
    GUIMenu.prototype.setMenuBlocker = function (menuBlocker) {
        this._menuBlocker = menuBlocker;
    };

    /**
     * Checks and returns whether the mouse is currently
     * over this menu including sub menus if desired
     * @param {boolean} recursive if true, considers
     * also any sub-menu hovering as effective, otherwise
     * only takes into account this menu
     */
    GUIMenu.prototype.isHovered = function (recursive) {
        if (this._hovered) {
            return true;
        }
        else if (!recursive) {
            return false;
        } else {
            for (var i = 0; i < this.getItemCount(); ++i) {
                var item = this.getItem(i);
                if (item instanceof GUIMenuItem && item.getType() === GUIMenuItem.Type.Menu) {
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
     * else than another GUIMenuItem
     * @returns {boolean}
     */
    GUIMenu.prototype.isRootMenu = function () {
        return !this._parent || !(this._parent instanceof GUIMenuItem);
    };

    /**
     * Checks if this is a sub-menu or not
     * @returns {boolean}
     */
    GUIMenu.prototype.isSubMenu = function () {
        if (this._parent && this._parent instanceof GUIMenuItem) {
            return !this._parent.isRootItem();
        }
        return false;
    };

    /**
     * Add a menu item to this menu
     * @param {GUIMenuItem} item
     * @returns {Number} index of newly inserted item
     * @version 1.0
     */
    GUIMenu.prototype.addItem = function (item) {
        return this.insertItem(this.getItemCount(), item);
    };

    /**
     * Insert a menu item into this menu
     * @param {Number} index the index to insert before, if equal
     * to length, inserts at end
     * @param {GUIMenuItem} item
     * @returns {Number} index of newly inserted item
     * @version 1.0
     */
    GUIMenu.prototype.insertItem = function (index, item) {
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
    GUIMenu.prototype.removeItem = function (index) {
        if (index >= 0 && index < this.getItemCount()) {
            this._items[index]._parent = null;
            this._items[index]._htmlElement.detach();
            this._items.splice(index, 1);
        }
    };

    /**
     * Removes all items of this menu
     */
    GUIMenu.prototype.clearItems = function () {
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
     * @return {GUIMenuItem} the menu item or null if index is invalid
     */
    GUIMenu.prototype.getItem = function (index) {
        if (index >= 0 && index < this.getItemCount()) {
            return this._items[index];
        }
        return null;
    };

    /**
     * @returns {Number} the number of items in this menu
     * @version 1.0
     */
    GUIMenu.prototype.getItemCount = function () {
        return this._items ? this._items.length : 0;
    };

    /**
     * Get the index for an item
     * @param {GUIMenuItem} item the item to get an index for
     * @return {Number} index of the item or -1 if not found
     * @version 1.0
     */
    GUIMenu.prototype.indexOf = function (item) {
        return this._items ? this._items.indexOf(item) : -1;
    };

    /**
     * Find a menu item by its caption
     * @param {String} caption the caption to find
     * @return {GUIMenuItem} the menu item or null if not found
     */
    GUIMenu.prototype.findItem = function (caption) {
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
    GUIMenu.prototype.update = function () {
        for (var i = 0; i < this.getItemCount(); ++i) {
            var item = this.getItem(i);
            item.update();
        }
    };

    /**
     * Open the menu at a given reference which can be
     * either an absolute point or a jquery html element
     * @param {JQuery|{{x: Number, y: Number}}} reference the reference element or point to open at
     * @param {GUIMenu.Position|Number} horzPosition the horizontal position to open at
     * @param {GUIMenu.Position|Number} vertPosition the vertical position to open at
     */
    GUIMenu.prototype.open = function (reference, horzPosition, vertPosition) {
        if (this._menuBlocker && this._menuBlocker.call(this)) {
            return;
        }

        horzPosition = typeof horzPosition === 'number' ? horzPosition : GUIMenu.Position.Center;
        vertPosition = typeof vertPosition === 'number' ? vertPosition : GUIMenu.Position.Center;

        // If our html element doesn't have a parent yet, we're opening it
        // the first time, otherwise we're just re-positioning it
        if (this._htmlElement.parent().length === 0) {
            // Do an initial update on the menu
            this.update();

            // Attach it to the DOM
            this._htmlElement.appendTo($("body"));

            // If this is not a sub-menu, then mark this
            // as being the global active menu
            if (!this.isSubMenu()) {
                GUIMenu.setActiveMenu(this);
            }

            // Send open event
            this.trigger(GUIMenu.OPEN_EVENT);
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
                case GUIMenu.Position.Left_Top:
                    x = rect.x - menuWidth;
                    break;
                case GUIMenu.Position.Center:
                    x = rect.x;
                    break;
                case GUIMenu.Position.Right_Bottom:
                    x = rect.x + rect.width;
                    break;
            }

            var y = 0;
            switch (vertPosition) {
                case GUIMenu.Position.Left_Top:
                    y = rect.y - menuHeight;
                    break;
                case GUIMenu.Position.Center:
                    y = rect.y;
                    break;
                case GUIMenu.Position.Right_Bottom:
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
                case GUIMenu.Position.Left_Top:
                    this._htmlElement.addClass('g-menu-left');
                    break;
                case GUIMenu.Position.Right_Bottom:
                    this._htmlElement.addClass('g-menu-right');
                    break;
            }

            switch (vertPosition) {
                case GUIMenu.Position.Left_Top:
                    this._htmlElement.addClass('g-menu-top');
                    break;
                case GUIMenu.Position.Right_Bottom:
                    this._htmlElement.addClass('g-menu-bottom');
                    break;
            }
        }
    };

    /**
     * Close the menu if it is opened and closeable
     */
    GUIMenu.prototype.close = function () {
        var parent = this._htmlElement.parent();
        if (parent.is("body")) {
            this.closeMenus();

            // Remove our orientation classes
            this._htmlElement.removeClass('g-menu-left g-menu-right g-menu-top g-menu-bottom');

            // Simply detach our element
            this._htmlElement.detach();

            // If this is the active menu, remove it now
            if (this === GUIMenu._activeMenu) {
                GUIMenu.setActiveMenu(null, true);
            }

            // Send close event
            this.trigger(GUIMenu.CLOSE_EVENT);
        }
    };

    /**
     * Close all sub menus
     */
    GUIMenu.prototype.closeMenus = function () {
        for (var i = 0; i < this.getItemCount(); ++i) {
            var item = this.getItem(i);
            if (item instanceof GUIMenuItem && item.getType() === GUIMenuItem.Type.Menu) {
                item.getMenu().close();
            }
        }
    };

    GUIMenu.prototype._mouseOver = function (evt) {
        this._hovered = true;
    };

    GUIMenu.prototype._mouseOut = function (evt) {
        this._hovered = false;

        if (this.isSubMenu()) {
            setTimeout(function () {
                if (!this.isHovered(true)) {
                    this.closeMenus();
                }
            }.bind(this), 150);
        }
    };

    _.GUIMenu = GUIMenu;
})(this);
