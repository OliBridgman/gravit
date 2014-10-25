(function (_) {
    /**
     * A menu item
     * @param {Number} type the type of the menu item.
     * Defaults to GMenuItem.Type.Item
     * @class GMenuItem
     * @extends GEventTarget
     * @constructor
     * @see GMenuItem.Type
     * @version 1.0
     */
    function GMenuItem(type) {
        this._htmlElement = $("<li></li>").addClass('g-menu-item');

        this._type = type ? type : GMenuItem.Type.Item;

        if (this._type === GMenuItem.Type.Divider) {
            this._htmlElement.addClass('g-menu-item-divider');
        } else {
            this._htmlElement
                .append($('<span></span>')
                    .addClass('g-menu-item-icon')
                    .css('display', 'none'))
                .append($('<span></span>')
                    .addClass('g-menu-item-caption'))
                .append($('<span></span>')
                    .addClass('g-menu-item-shortcut')
                    .css('display', 'none'))
                .append($('<span></span>')
                    .addClass('g-menu-item-tail'));

            if (this._type === GMenuItem.Type.Menu) {
                this._htmlElement.addClass('g-menu-item-menu');
                this.setMenu(new GMenu(this));
            }
        }

        this._htmlElement.on("mouseover", this._mouseOver.bind(this));
        this._htmlElement.on("mouseout", this._mouseOut.bind(this));
        this._htmlElement.on("mousedown", this._mouseDown.bind(this));
        this._htmlElement.on("mouseup", this._mouseUp.bind(this));
    }

    GObject.inherit(GMenuItem, GEventTarget);

    /**
     * The type of a menu item
     * @type {{}}
     * @version 1.0
     */
    GMenuItem.Type = {
        /**
         * A regular item which can be checked and clicked / executed
         * @type {Number}
         * @version 1.0
         */
        Item: 0,
        /**
         * An item representing a submenu item, can not be checked or executed
         * @type {Number}
         * @version 1.0
         */
        Menu: 1,

        /**
         * A divider item, can not be checked or executed or captioned
         * @type {Number}
         * @version 1.0
         */
        Divider: 2
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GMenuItem.EnterEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item is entered
     * @class GMenuItem.EnterEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenuItem.EnterEvent = function () {
    };
    GObject.inherit(GMenuItem.EnterEvent, GEvent);

    /** @override */
    GMenuItem.EnterEvent.prototype.toString = function () {
        return "[Object GMenuItem.EnterEvent]";
    };

    GMenuItem.ENTER_EVENT = new GMenuItem.EnterEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenuItem.LeaveEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item is left
     * @class GMenuItem.LeaveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenuItem.LeaveEvent = function () {
    };
    GObject.inherit(GMenuItem.LeaveEvent, GEvent);

    /** @override */
    GMenuItem.LeaveEvent.prototype.toString = function () {
        return "[Object GMenuItem.LeaveEvent]";
    };

    GMenuItem.LEAVE_EVENT = new GMenuItem.LeaveEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenuItem.ActivateEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item was activated
     * @class GMenuItem.ActivateEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenuItem.ActivateEvent = function () {
    };
    GObject.inherit(GMenuItem.ActivateEvent, GEvent);

    /** @override */
    GMenuItem.ActivateEvent.prototype.toString = function () {
        return "[Object GMenuItem.ActivateEvent]";
    };

    GMenuItem.ACTIVATE_EVENT = new GMenuItem.ActivateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenuItem.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item should be updated (before it is shown)
     * @class GMenuItem.UpdateEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GMenuItem.UpdateEvent = function () {
    };
    GObject.inherit(GMenuItem.UpdateEvent, GEvent);

    /** @override */
    GMenuItem.UpdateEvent.prototype.toString = function () {
        return "[Object GMenuItem.UpdateEvent]";
    };

    GMenuItem.UPDATE_EVENT = new GMenuItem.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GMenuItem Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GMenu}
     * @private
     */
    GMenuItem.prototype._parent = null;

    /**
     * @type {Number}
     * @private
     */
    GMenuItem.prototype._type = null;
    /**
     * @type {GMenu}
     * @private
     */
    GMenuItem.prototype._menu = null;

    /**
     * @type {String|JQuery}
     * @private
     */
    GMenuItem.prototype._icon = null;

    /**
     * @type {GLocale.Key|String}
     * @private
     */
    GMenuItem.prototype._caption = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GMenuItem.prototype._shortcutHint = null;

    /**
     * @type {GAction}
     * @private
     */
    GMenuItem.prototype._action = null;

    /**
     * @type {*}
     * @private
     */
    GMenuItem.prototype._data = null;

    /**
     * @return {GMenu}
     * @version 1.0
     */
    GMenuItem.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * @returns {Number} the item's type
     * @see GMenuItem.Type
     * @version 1.0
     */
    GMenuItem.prototype.getType = function () {
        return this._type;
    };

    /**
     * @returns {Stringg|JQuery} the item's icon
     */
    GMenuItem.prototype.getIcon = function () {
        return this._icon;
    };

    /**
     * Assign the item's icon which may be an icon class
     * or a JQuery Html-Element
     * @param {Stringg|JQuery} icon the icon or null for none
     */
    GMenuItem.prototype.setIcon = function (icon) {
        if (icon !== this._icon) {
            this._icon = icon;
            var iconElement = this._htmlElement.find('.g-menu-item-icon');
            iconElement.empty();
            if (this._icon) {
                if (typeof this._icon === 'string') {
                    iconElement.append($('<i></i>')
                        .addClass(icon));
                } else {
                    iconElement.append(this._icon);
                }
                iconElement.css('display', '');
            } else {
                iconElement.css('display', 'none');
            }
        }
    };

    /**
     * @returns {GLocale.Key|String} the item's caption
     * @version 1.0
     */
    GMenuItem.prototype.getCaption = function () {
        return this._caption;
    };

    /**
     * Assigns the item's the caption
     * @param {GLocale.Key|String} caption
     * @version 1.0
     */
    GMenuItem.prototype.setCaption = function (caption) {
        if (caption !== this._caption) {
            this._caption = caption;
            var captionElement = this._htmlElement.find('.g-menu-item-caption');
            captionElement.empty();

            if (!this._caption || this._caption instanceof GLocale.Key || typeof this._caption === 'string') {
                captionElement.text(this._caption ? ifLocale.get(this._caption) : "");
            } else {
                captionElement.append(this._caption);
            }
        }
    };

    /**
     * @returns {Array<*>} the item's shortcut hint
     */
    GMenuItem.prototype.getShortcutHint = function () {
        return this._shortcutHint;
    };

    /**
     * Assigns the item's shortcut hint
     * @param {Array<*>} hint the shortcut hint
     * @version 1.0
     */
    GMenuItem.prototype.setShortcutHint = function (hint) {
        this._shortcutHint = hint;
        var shortcutElement = this._htmlElement.find('.g-menu-item-shortcut');
        if (this._shortcutHint && this._shortcutHint.length > 0) {
            shortcutElement.text(GKey.shortcutToString(hint));
            shortcutElement.css('display', '');
        } else {
            shortcutElement.empty();
            shortcutElement.css('display', 'none');
        }
    };

    /**
     * @returns {GAction} the item's action
     */
    GMenuItem.prototype.getAction = function () {
        return this._action;
    };

    /**
     * Assign an action to this menu item or remove it
     * @param {GAction} action
     */
    GMenuItem.prototype.setAction = function (action) {
        if (action !== this._action) {
            if (this._action) {
                // Remove shortcut if any was set
                var shortcut = action.getShortcut();
                if (shortcut && shortcut === this.getShortcutHint()) {
                    this.setShortcutHint(null);
                }
            }

            this._action = action;

            if (this._action) {
                // Check if there's a shortcut for the item and set if any
                var shortcut = action.getShortcut();
                if (shortcut) {
                    this.setShortcutHint(shortcut);
                }

                this.setCaption(this._action.getTitle());
                this.setEnabled(this._action.isEnabled() === true);
            }
        }
    };

    /**
     * @returns {Boolean} whether the item is checked or not
     * @version 1.0
     */
    GMenuItem.prototype.isChecked = function () {
        return this._htmlElement.hasClass('g-menu-item-checked');
    };

    /**
     * Assign whether the item is checked or not (no effect if not checkable)
     * @param {Boolean} checked
     * @version 1.0
     */
    GMenuItem.prototype.setChecked = function (checked) {
        if (checked != this.isChecked()) {
            if (checked) {
                this._htmlElement.addClass("g-menu-item-checked");
            } else {
                this._htmlElement.removeClass("g-menu-item-checked");
            }
        }
    };

    /**
     * @returns {Boolean} whether the item is enabled or not
     * @version 1.0
     */
    GMenuItem.prototype.isEnabled = function () {
        return !this._htmlElement.hasClass('g-disabled');
    };

    /**
     * Assign whether the item is enabled or not
     * @param {Boolean} enabled
     * @version 1.0
     */
    GMenuItem.prototype.setEnabled = function (enabled) {
        if (enabled != this.isEnabled()) {
            if (enabled) {
                this._htmlElement.removeClass("g-disabled");
            } else {
                this._htmlElement.addClass("g-disabled");
            }
        }
    };

    /**
     * @returns {*} the item's custom data
     */
    GMenuItem.prototype.getData = function () {
        return this._data;
    };

    /**
     * Assigns custom data to the item
     * @param {*} data
     */
    GMenuItem.prototype.setData = function (data) {
        this._data = data;
    };

    /**
     * Checks and returns whether this item is a root item or not
     * @return {boolean}
     */
    GMenuItem.prototype.isRootItem = function () {
        return this._parent && this._parent instanceof GMenu &&
            this._parent._parent != null && !(this._parent._parent instanceof GMenuItem);
    };

    /**
     * Checks and returns whether this item is a a root item of a menubar or not
     * @return {boolean}
     */
    GMenuItem.prototype.isRootMenuBarItem = function () {
        return this.isRootItem() && this._parent._parent instanceof GMenuBar;
    };

    /**
     * This will go up and return the menu bar or null if there's none
     * @return {GMenuBar}
     */
    GMenuItem.prototype.getMenuBar = function () {
        if (this.isRootMenuBarItem()) {
            return this._parent._parent;
        }
        return null;
    };

    /**
     * @return {GMenu} the submenu of this item if supported
     * @version 1.0
     */
    GMenuItem.prototype.getMenu = function () {
        return this._menu;
    };

    /**
     * Assign the submenu for this item if it is a menu item
     * @param {GMenu} menu
     */
    GMenuItem.prototype.setMenu = function (menu) {
        if (menu && menu !== this._menu && this._type === GMenuItem.Type.Menu) {
            this._menu = menu;
            this._menu._parent = this;
            this._menu.addEventListener(GMenu.OPEN_EVENT, this._menuOpen.bind(this));
            this._menu.addEventListener(GMenu.CLOSE_EVENT, this._menuClose.bind(this));
        }
    };

    /**
     * Called before the menu item is shown to update it's status
     * @version 1.0
     */
    GMenuItem.prototype.update = function () {
        // If we have an action, it may have changed so update here
        if (this._action) {
            this.setCaption(this._action.getTitle());
            this.setEnabled(this._action.isEnabled());
            this.setChecked(this._action.isChecked());
        }

        if (this.hasEventListeners(GMenuItem.UpdateEvent)) {
            this.trigger(GMenuItem.UPDATE_EVENT);
        }
    };

    /** @private */
    GMenuItem.prototype._mouseOver = function (evt) {
        // Close all sub-menus of our parent
        if (this._parent && this._parent instanceof GMenu && !this.isRootItem()) {
            this._parent.closeMenus();
        }

        if (!this.isEnabled()) {
            return;
        }

        // Check whether to open sub-menu on hover which is the case if
        // a) We're on Desktop-Device
        // b) Are a Sub-Menu Item
        // c) Are not a Root-Item
        //      - or -
        //    Are a root item and part of a menu-bar which' menu is opened
        if (this._type == GMenuItem.Type.Menu &&
            GSystem.hardware === GSystem.Hardware.Desktop &&
            (!this.isRootItem() || (this.isRootMenuBarItem() && this.getMenuBar().isActive()))) {
            this._openMenu();
        }

        // Handle events for others than dividers
        if (this._type != GMenuItem.Type.Divider) {
            this._htmlElement.addClass("g-hover");

            if (this.hasEventListeners(GMenuItem.EnterEvent)) {
                this.trigger(GMenuItem.ENTER_EVENT);
            }
        }
    };

    /** @private */
    GMenuItem.prototype._mouseOut = function (evt) {
        if (!this.isEnabled()) {
            return;
        }

        if (this._type != GMenuItem.Type.Divider) {
            this._htmlElement.removeClass("g-hover");

            if (this.hasEventListeners(GMenuItem.LeaveEvent)) {
                this.trigger(GMenuItem.LEAVE_EVENT);
            }
        }
    };

    /** @private */
    GMenuItem.prototype._mouseDown = function (evt) {
        if (!this.isEnabled()) {
            return;
        }

        if (evt.button == GMouseEvent.BUTTON_LEFT) {
            // Stop propagation and default handling to not run into our global menu handlers
            evt.stopPropagation();
            evt.preventDefault();

            // Open Sub-Menu if we're a Sub-Item and on Root or not on Desktop which doesn't have mouse-over
            if (this._type === GMenuItem.Type.Menu && (this.isRootItem() || GSystem.hardware !== GSystem.Hardware.Desktop)) {
                // Toggle our menu
                if (this._htmlElement.hasClass('g-active')) {
                    this.getMenu().close();
                } else {
                    this._openMenu();
                }
            }
        }
    };

    /** @private */
    GMenuItem.prototype._mouseUp = function (evt) {
        // Stop propagation and default handling to not run into our global menu handlers
        evt.stopPropagation();
        evt.preventDefault();

        if (!this.isRootMenuBarItem()) {
            // Simulate a virtual 'mouse-out', first as that'll never occurr
            // otherwise as we're removing the menu from the DOM
            this._mouseOut(evt);
        }

        if (this._type == GMenuItem.Type.Item) {
            if (this._action && this._action.isAvailable() && this._action.isEnabled()) {
                this._action.execute();
            }

            if (this.isEnabled()) {
                if (this.hasEventListeners(GMenuItem.ActivateEvent)) {
                    this.trigger(GMenuItem.ACTIVATE_EVENT);
                }

                if (this._parent && this._parent.hasEventListeners(GMenu.ActivateEvent)) {
                    this._parent.trigger(new GMenu.ActivateEvent(this));
                }

                GMenu.triggerGlobalActivation(this);
            }
        }

        if (!this.isRootMenuBarItem()) {
            // Reset the active menu closing everything
            GMenu.setActiveMenu(null);
        }
    };

    /** @private */
    GMenuItem.prototype._openMenu = function () {
        this.getMenu().open(this._htmlElement,
            this.isRootItem() ? GMenu.Position.Center : GMenu.Position.Right_Bottom,
            this.isRootItem() ? GMenu.Position.Right_Bottom : GMenu.Position.Center);
    };

    /** @private */
    GMenuItem.prototype._menuOpen = function () {
        this._htmlElement.addClass('g-active');

        if (this.isRootItem()) {
            this._parent._parent._htmlElement.addClass('g-active');
        }
    };

    /** @private */
    GMenuItem.prototype._menuClose = function () {
        this._htmlElement.removeClass('g-active');

        if (this.isRootItem()) {
            this._parent._parent._htmlElement.removeClass('g-active');
        }
    };

    /** @override */
    GMenuItem.prototype.toString = function () {
        return "[Object GMenuItem]";
    };

    _.GMenuItem = GMenuItem;
})(this);