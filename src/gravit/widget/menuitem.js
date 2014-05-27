(function (_) {
    /**
     * A menu item
     * @param {Number} type the type of the menu item.
     * Defaults to GUIMenuItem.Type.Item
     * @class GUIMenuItem
     * @extends GEventTarget
     * @constructor
     * @see GUIMenuItem.Type
     * @version 1.0
     */
    function GUIMenuItem(type) {
        this._htmlElement = $("<li></li>").addClass('g-menu-item');

        this._type = type ? type : GUIMenuItem.Type.Item;

        if (this._type === GUIMenuItem.Type.Divider) {
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

            if (this._type === GUIMenuItem.Type.Menu) {
                this._htmlElement.addClass('g-menu-item-menu');
                this.setMenu(new GUIMenu(this));
            }
        }

        this._htmlElement.on("mouseover", this._mouseOver.bind(this));
        this._htmlElement.on("mouseout", this._mouseOut.bind(this));
        this._htmlElement.on("mousedown", this._mouseDown.bind(this));
        this._htmlElement.on("mouseup", this._mouseUp.bind(this));
    }

    IFObject.inherit(GUIMenuItem, GEventTarget);

    /**
     * The type of a menu item
     * @type {{}}
     * @version 1.0
     */
    GUIMenuItem.Type = {
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
    // GUIMenuItem.EnterEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item is entered
     * @class GUIMenuItem.EnterEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenuItem.EnterEvent = function () {
    };
    IFObject.inherit(GUIMenuItem.EnterEvent, GEvent);

    /** @override */
    GUIMenuItem.EnterEvent.prototype.toString = function () {
        return "[Object GUIMenuItem.EnterEvent]";
    };

    GUIMenuItem.ENTER_EVENT = new GUIMenuItem.EnterEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenuItem.LeaveEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item is left
     * @class GUIMenuItem.LeaveEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenuItem.LeaveEvent = function () {
    };
    IFObject.inherit(GUIMenuItem.LeaveEvent, GEvent);

    /** @override */
    GUIMenuItem.LeaveEvent.prototype.toString = function () {
        return "[Object GUIMenuItem.LeaveEvent]";
    };

    GUIMenuItem.LEAVE_EVENT = new GUIMenuItem.LeaveEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenuItem.ActivateEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item was activated
     * @class GUIMenuItem.ActivateEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenuItem.ActivateEvent = function () {
    };
    IFObject.inherit(GUIMenuItem.ActivateEvent, GEvent);

    /** @override */
    GUIMenuItem.ActivateEvent.prototype.toString = function () {
        return "[Object GUIMenuItem.ActivateEvent]";
    };

    GUIMenuItem.ACTIVATE_EVENT = new GUIMenuItem.ActivateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenuItem.UpdateEvent Event
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * An event whenever a menu item should be updated (before it is shown)
     * @class GUIMenuItem.UpdateEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GUIMenuItem.UpdateEvent = function () {
    };
    IFObject.inherit(GUIMenuItem.UpdateEvent, GEvent);

    /** @override */
    GUIMenuItem.UpdateEvent.prototype.toString = function () {
        return "[Object GUIMenuItem.UpdateEvent]";
    };

    GUIMenuItem.UPDATE_EVENT = new GUIMenuItem.UpdateEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // GUIMenuItem Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {GUIMenu}
     * @private
     */
    GUIMenuItem.prototype._parent = null;

    /**
     * @type {Number}
     * @private
     */
    GUIMenuItem.prototype._type = null;
    /**
     * @type {GUIMenu}
     * @private
     */
    GUIMenuItem.prototype._menu = null;

    /**
     * @type {String|JQuery}
     * @private
     */
    GUIMenuItem.prototype._icon = null;

    /**
     * @type {IFLocale.Key|String}
     * @private
     */
    GUIMenuItem.prototype._caption = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GUIMenuItem.prototype._shortcutHint = null;

    /**
     * @type {GUIAction}
     * @private
     */
    GUIMenuItem.prototype._action = null;

    /**
     * @return {GUIMenu}
     * @version 1.0
     */
    GUIMenuItem.prototype.getParent = function () {
        return this._parent;
    };

    /**
     * @returns {Number} the item's type
     * @see GUIMenuItem.Type
     * @version 1.0
     */
    GUIMenuItem.prototype.getType = function () {
        return this._type;
    };

    /**
     * @returns {Stringg|JQuery} the item's icon
     */
    GUIMenuItem.prototype.getIcon = function () {
        return this._icon;
    };

    /**
     * Assign the item's icon which may be an icon class
     * or a JQuery Html-Element
     * @param {Stringg|JQuery} icon the icon or null for none
     */
    GUIMenuItem.prototype.setIcon = function (icon) {
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
     * @returns {IFLocale.Key|String} the item's caption
     * @version 1.0
     */
    GUIMenuItem.prototype.getCaption = function () {
        return this._caption;
    };

    /**
     * Assigns the item's the caption
     * @param {IFLocale.Key|String} caption
     * @version 1.0
     */
    GUIMenuItem.prototype.setCaption = function (caption) {
        if (caption !== this._caption) {
            this._caption = caption;
            var captionElement = this._htmlElement.find('.g-menu-item-caption');
            captionElement.empty();

            if (!this._caption || this._caption instanceof IFLocale.Key || typeof this._caption === 'string') {
                captionElement.text(this._caption ? ifLocale.get(this._caption) : "");
            } else {
                captionElement.append(this._caption);
            }
        }
    };

    /**
     * @returns {Array<*>} the item's shortcut hint
     */
    GUIMenuItem.prototype.getShortcutHint = function () {
        return this._shortcutHint;
    };

    /**
     * Assigns the item's shortcut hint
     * @param {Array<*>} hint the shortcut hint
     * @version 1.0
     */
    GUIMenuItem.prototype.setShortcutHint = function (hint) {
        this._shortcutHint = hint;
        var shortcutElement = this._htmlElement.find('.g-menu-item-shortcut');
        if (this._shortcutHint && this._shortcutHint.length > 0) {
            shortcutElement.text(ifKey.shortcutToString(hint));
            shortcutElement.css('display', '');
        } else {
            shortcutElement.empty();
            shortcutElement.css('display', 'none');
        }
    };

    /**
     * @returns {GUIAction} the item's action
     */
    GUIMenuItem.prototype.getAction = function () {
        return this._action;
    };

    /**
     * Assign an action to this menu item or remove it
     * @param {GUIAction} action
     */
    GUIMenuItem.prototype.setAction = function (action) {
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
    GUIMenuItem.prototype.isChecked = function () {
        return this._htmlElement.hasClass('g-menu-item-checked');
    };

    /**
     * Assign whether the item is checked or not (no effect if not checkable)
     * @param {Boolean} checked
     * @version 1.0
     */
    GUIMenuItem.prototype.setChecked = function (checked) {
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
    GUIMenuItem.prototype.isEnabled = function () {
        return !this._htmlElement.hasClass('g-disabled');
    };

    /**
     * Assign whether the item is enabled or not
     * @param {Boolean} enabled
     * @version 1.0
     */
    GUIMenuItem.prototype.setEnabled = function (enabled) {
        if (enabled != this.isEnabled()) {
            if (enabled) {
                this._htmlElement.removeClass("g-disabled");
            } else {
                this._htmlElement.addClass("g-disabled");
            }
        }
    };

    /**
     * Checks and returns whether this item is a root item or not
     * @return {boolean}
     */
    GUIMenuItem.prototype.isRootItem = function () {
        return this._parent && this._parent instanceof GUIMenu &&
            this._parent._parent != null && !(this._parent._parent instanceof GUIMenuItem);
    };

    /**
     * Checks and returns whether this item is a a root item of a menubar or not
     * @return {boolean}
     */
    GUIMenuItem.prototype.isRootMenuBarItem = function () {
        return this.isRootItem() && this._parent._parent instanceof GUIMenuBar;
    };

    /**
     * This will go up and return the menu bar or null if there's none
     * @return {GUIMenuBar}
     */
    GUIMenuItem.prototype.getMenuBar = function () {
        if (this.isRootMenuBarItem()) {
            return this._parent._parent;
        }
        return null;
    };

    /**
     * @return {GUIMenu} the submenu of this item if supported
     * @version 1.0
     */
    GUIMenuItem.prototype.getMenu = function () {
        return this._menu;
    };

    /**
     * Assign the submenu for this item if it is a menu item
     * @param {GUIMenu} menu
     */
    GUIMenuItem.prototype.setMenu = function (menu) {
        if (menu && menu !== this._menu && this._type === GUIMenuItem.Type.Menu) {
            this._menu = menu;
            this._menu._parent = this;
            this._menu.addEventListener(GUIMenu.OPEN_EVENT, this._menuOpen.bind(this));
            this._menu.addEventListener(GUIMenu.CLOSE_EVENT, this._menuClose.bind(this));
        }
    };

    /**
     * Called before the menu item is shown to update it's status
     * @version 1.0
     */
    GUIMenuItem.prototype.update = function () {
        // If we have an action, it may have changed so update here
        if (this._action) {
            this.setCaption(this._action.getTitle());
            this.setEnabled(this._action.isEnabled());
            this.setChecked(this._action.isChecked());
        }

        if (this.hasEventListeners(GUIMenuItem.UpdateEvent)) {
            this.trigger(GUIMenuItem.UPDATE_EVENT);
        }
    };

    /** @override */
    GUIMenuItem.prototype.toString = function () {
        return "[Object GUIMenuItem]";
    };

    GUIMenuItem.prototype._mouseOver = function (evt) {
        // Close all sub-menus of our parent
        if (this._parent && this._parent instanceof GUIMenu && !this.isRootItem()) {
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
        if (this._type == GUIMenuItem.Type.Menu &&
            ifSystem.hardware === IFSystem.Hardware.Desktop &&
            (!this.isRootItem() || (this.isRootMenuBarItem() && this.getMenuBar().isActive()))) {
            this._openMenu();
        }

        // Handle events for others than dividers
        if (this._type != GUIMenuItem.Type.Divider) {
            this._htmlElement.addClass("g-hover");

            if (this.hasEventListeners(GUIMenuItem.EnterEvent)) {
                this.trigger(GUIMenuItem.ENTER_EVENT);
            }
        }
    };

    GUIMenuItem.prototype._mouseOut = function (evt) {
        if (!this.isEnabled()) {
            return;
        }

        if (this._type != GUIMenuItem.Type.Divider) {
            this._htmlElement.removeClass("g-hover");

            if (this.hasEventListeners(GUIMenuItem.LeaveEvent)) {
                this.trigger(GUIMenuItem.LEAVE_EVENT);
            }
        }
    };

    GUIMenuItem.prototype._mouseDown = function (evt) {
        if (!this.isEnabled()) {
            return;
        }

        if (evt.button == GUIMouseEvent.BUTTON_LEFT) {
            // Stop propagation and default handling to not run into our global menu handlers
            evt.stopPropagation();
            evt.preventDefault();

            // Open Sub-Menu if we're a Sub-Item and on Root or not on Desktop which doesn't have mouse-over
            if (this._type === GUIMenuItem.Type.Menu && (this.isRootItem() || ifSystem.hardware !== IFSystem.Hardware.Desktop)) {
                // Toggle our menu
                if (this._htmlElement.hasClass('g-active')) {
                    this.getMenu().close();
                } else {
                    this._openMenu();
                }
            }
        }
    };

    GUIMenuItem.prototype._mouseUp = function (evt) {
        // Stop propagation and default handling to not run into our global menu handlers
        evt.stopPropagation();
        evt.preventDefault();

        // Close active menu if we're not a sub-menu-item
        if (this._type !== GUIMenuItem.Type.Menu) {
            // Simulate a virtual 'mouse-out', first as that'll never occurr
            // otherwise as we're removing the menu from the DOM
            this._mouseOut(evt);

            // Reset the active menu closing everything
            GUIMenu.setActiveMenu(null);
        }

        if (this._type == GUIMenuItem.Type.Item) {
            if (this._action && this._action.isAvailable() && this._action.isEnabled()) {
                this._action.execute();
            }

            if (this.isEnabled() && this.hasEventListeners(GUIMenuItem.ActivateEvent)) {
                this.trigger(GUIMenuItem.ACTIVATE_EVENT);
            }
        }
    };

    GUIMenuItem.prototype._openMenu = function () {
        this.getMenu().open(this._htmlElement,
            this.isRootItem() ? GUIMenu.Position.Center : GUIMenu.Position.Right_Bottom,
            this.isRootItem() ? GUIMenu.Position.Right_Bottom : GUIMenu.Position.Center);
    };

    GUIMenuItem.prototype._menuOpen = function () {
        this._htmlElement.addClass('g-active');

        if (this.isRootItem()) {
            this._parent._parent._htmlElement.addClass('g-active');
        }
    };

    GUIMenuItem.prototype._menuClose = function () {
        this._htmlElement.removeClass('g-active');

        if (this.isRootItem()) {
            this._parent._parent._htmlElement.removeClass('g-active');
        }
    };

    _.GUIMenuItem = GUIMenuItem;
})(this);