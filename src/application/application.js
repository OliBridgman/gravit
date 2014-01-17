(function (_) {
    /**
     * The global application class
     * @class GUIApplication
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GUIApplication() {
        document.addEventListener("touchstart", this._touchHandler, true);
        document.addEventListener("touchmove", this._touchHandler, true);
        document.addEventListener("touchend", this._touchHandler, true);
        document.addEventListener("touchcancel", this._touchHandler, true);

        this._actions = [];
        this._shortcuts = {};
        this._menu = new GUIMenu();

        if (gSystem.shell === GSystem.Shell.Application) {
            appshell.shellAPI = {};
            appshell.shellAPI.executeCommand = function (command) {
                if (command == 'help.about') {
                    // TODO : About handling
                    alert('ABOUT');
                } else if (command === 'app.before_menupopup') {
                    // TODO : This sucks, is there a way to figure out
                    // *which* submenu was opened to only update those actions???
                    for (var i = 0; i < this._actions.length; ++i) {
                        var action = this._actions[i];
                        appshell.app.setMenuItemState(action.getId(), action.isEnabled() ? true : false, action.isChecked() ? true : false, function () {
                        });
                    }
                } else if (typeof command === 'string') {
                    this.executeAction(command);
                }
            }.bind(this)
        }
    };
    GObject.inherit(GUIApplication, GEventTarget);

    // Special action categories
    GUIApplication.CATEGORY_WINDOW = new GLocale.Key(GUIApplication, "category.window");

    /**
     * @type {Number}
     * @private
     */
    GUIApplication.prototype._resizeTimerId = null;

    /**
     * @type {GUIProgressDialog}
     * @private
     */
    GUIApplication.prototype._progressDialog = null;


    /**
     * Array of registered actions
     * @type {Array<GUIAction>}
     * @private
     */
    GUIApplication.prototype._actions = null;

    /**
     * Mapping of actions to shortcuts
     * @type {{}}
     * @private
     */
    GUIApplication.prototype._shortcuts = null;

    /**
     * Application menu
     * @type {GUIMenu}
     * @private
     */
    GUIApplication.prototype._menu = null;

    /**
     * Get a list of all registered actions
     * @return {Array<GUIAction>} list of registered actions
     */
    GUIApplication.prototype.getActions = function () {
        return this._actions;
    };

    /**
     * Get the application menu
     * @return {GUIMenu}
     */
    GUIApplication.prototype.getMenu = function () {
        return this._menu;
    };

    /**
     * Get a list of currently all available, registered actions
     * @return {Array<GUIAction>} list of registered and available actions
     */
    GUIApplication.prototype.getAvailableActions = function () {
        var result = [];
        for (var i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].isAvailable()) {
                result.push(this._actions[i]);
            }
        }
        return result;
    };

    /**
     * Get an action instance by it's given id
     * @param {String} id
     */
    GUIApplication.prototype.getAction = function (id) {
        for (var i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].getId() === id) {
                return this._actions[i];
            }
        }
        return null;
    };


    /**
     * Register one or more actions. Note that if the current shell is
     * set to GSystem.Shell.Application then this will also create the
     * corresponding menu bar entries on the according system! This
     * should only be called ONCE on startup!
     * @param {Array<GUIAction>} actions list of actions to be registered
     */
    GUIApplication.prototype.registerActions = function (actions) {
        // Add all actions, first
        for (var i = 0; i < actions.length; ++i) {
            this._actions.push(actions[i]);
        }

        // Initialize our application menu with the given actions
        GUIMenu.createActionMenu(this.getAvailableActions(), this._menu);

        // Handle platform specific stuff now
        if (gSystem.shell === GSystem.Shell.Application) {
            // Iterate our gui menu and register our bracket menu recursively
            // TODO : Remove prefix when submenus are supported
            var _menuDividerIDCount = 0;
            var _registerBracketMenus = function (parentId, menu, prefix) {
                for (var i = 0; i < menu.getItemCount(); ++i) {
                    var item = menu.getItem(i);
                    switch (item.getType()) {
                        case GUIMenuItem.Type.Menu:
                            // TODO : Get this fixed as soon as sub-menus are supported in App-Shell!!!
                            if (parentId === '') {
                                appshell.app.addMenu(gLocale.get(item.getCaption()), 'menu' + i.toString(), '', '', function () {
                                });
                                _registerBracketMenus('menu' + i.toString(), item.getMenu(), prefix);
                            } else {
                                _registerBracketMenus(parentId, item.getMenu(), prefix + gLocale.get(item.getCaption()) + '/');
                            }
                            break;
                        case GUIMenuItem.Type.Item:
                            appshell.app.addMenuItem(parentId, prefix + gLocale.get(item.getCaption()), item.getAction().getId(), '', '', '', '', function () {
                            });
                            break;
                        case GUIMenuItem.Type.Divider:
                            // TODO : Fix when submenus are supported
                            appshell.app.addMenuItem(parentId, '---', "appshell-menuDivider-" + _menuDividerIDCount++, '', '', '', '', function () {
                            });
                            break;
                    }
                }
            }.bind(this);
            _registerBracketMenus('', this._menu, '');
        }

        // Finally register the shortcuts
        for (var i = 0; i < actions.length; ++i) {
            var shortcut = actions[i].getShortcut();
            if (shortcut) {
                this.setShortcut(actions[i].getId(), shortcut);
            }
        }
    };

    /**
     * Execute a given action
     * @param {String} id id of the action to execute
     * @param {*} args optional args to be supplied to the action
     * @return {*} the result of the action if any
     */
    GUIApplication.prototype.executeAction = function (id, args) {
        var actionInstance = this.getAction(id);

        if (!actionInstance) {
            throw new Error("Unable to execute action '" + id + "' - not registered.");
        }

        if (actionInstance.isAvailable() && actionInstance.isEnabled.apply(actionInstance, args)) {
            var result = actionInstance.execute.apply(actionInstance, args);
            if (typeof result !== 'undefined') {
                return result;
            }
            return true;
        }

        return false;
    };

    /**
     * Registers a special "window" action that is used for
     * activating a given window. This will actually not register
     * the action but instead, will add it only to the main menu bar
     * @param {GUIAction} action
     */
    GUIApplication.prototype.addWindowAction = function (action) {
        if (gSystem.shell === GSystem.Shell.Application) {
            // TODO : Add support for AppShell

            alert('TODO : Implement addWindowAction');
        } else {
            var windowItem = this._menu.findItem(gLocale.get(GUIApplication.CATEGORY_WINDOW));

            if (!windowItem) {
                windowItem = new GUIMenuItem(GUIMenuItem.Type.Menu);
                this._menu.addItem(windowItem);
            }

            // Add after last separator or add last separator if none yet
            var hasSeparator = false;
            var itemCount = windowItem.getMenu().getItemCount();
            for (var i = 0; i < itemCount; ++i) {
                var item = windowItem.getMenu().getItem(i);
                if (item.getType() === GUIMenuItem.Type.Divider) {
                    if (i + 1 === itemCount || windowItem.getMenu().getItem(i + 1).__window_) {
                        hasSeparator = true;
                        break;
                    }
                }
            }

            if (!hasSeparator) {
                windowItem.getMenu().addItem(new GUIMenuItem(GUIMenuItem.Type.Divider));
            }

            var actionItem = new GUIMenuItem();
            actionItem.setAction(action);
            actionItem.__window_ = true;
            windowItem.getMenu().addItem(actionItem);
        }
    };

    /**
     * Removes a special "window" action that was used for
     * activating a given window.
     * @param {GUIAction} action
     */
    GUIApplication.prototype.removeWindowAction = function (action) {
        var windowItem = this._menu.findItem(gLocale.get(GUIApplication.CATEGORY_WINDOW));
        if (windowItem && windowItem.getMenu()) {
            for (var i = 0; i < windowItem.getMenu().getItemCount(); ++i) {
                if (windowItem.getMenu().getItem(i).getAction() === action) {
                    windowItem.getMenu().removeItem(i);
                    break;
                }
            }
        }
    };

    /**
     * Get the registered shortcut for a given action
     * @param {String} the action's id
     * @return {Array<Number>} shortcuts or null for none
     */
    GUIApplication.prototype.getShortcut = function (id) {
        if (this._shortcuts.hasOwnProperty(id)) {
            return this._shortcuts[id];
        }
        return null;
    };

    /**
     * Set the shortcut for a given action
     * @param {String} id the id of the action
     * @param {Array<Number>} shortcut may be null to remove the shortcut
     */
    GUIApplication.prototype.setShortcut = function (id, shortcut) {
        // Remove any previous shortcut
        if (this._shortcuts.hasOwnProperty(id)) {
            if (gSystem.shell == GSystem.Shell.Application) {
                // TODO : Is this supposed to work in AppShell ?
                appshell.app.setMenuItemShortcut(id.toString(), null, "");
            } else if (gSystem.hardware === GSystem.Hardware.Desktop) {
                var menuItem = this._getMenuItemForAction(id);
                if (menuItem) {
                    menuItem.setShortcutHint(null);
                }

                Mousetrap.unbind(this._shortcutToMouseTrapShortcut(this._shortcuts[id]));
            }

            delete this._shortcuts[id];
        }

        // Assign new shortcut if any
        if (shortcut) {
            this._shortcuts[id] = shortcut;

            if (gSystem.shell == GSystem.Shell.Application) {
                appshell.app.setMenuItemShortcut(id, this._shortcutToAppShellShortcut(shortcut), "");
            } else if (gSystem.hardware === GSystem.Hardware.Desktop) {
                var menuItem = this._getMenuItemForAction(id);
                if (menuItem) {
                    menuItem.setShortcutHint(shortcut);
                }

                Mousetrap.bind([this._shortcutToMouseTrapShortcut(shortcut)], function (e) {
                    e.preventDefault();
                    this.executeAction(id);
                    return false;
                }.bind(this));
            }
        }
    };

    /**
     * Create and register a new HTTP-Process
     * @param {GLocale.Key|String} [processTitle] optional title for the process
     * @return {{xhr: XMLHttpRequest, progress: GUIProgress}}
     */
    GUIApplication.prototype.createAndRegisterHttpProcess = function (processTitle) {
        var xhr = new XMLHttpRequest();
        var progress = new GUIProgress(xhr, 'x-amz-meta-content-length');

        if (processTitle) {
            progress.setTitle(processTitle);
        }

        this.registerProgress(progress);
        return {
            xhr: xhr,
            progress: progress
        }
    };

    /**
     * Register a progress, showing the progress dialog
     * if not yet visible
     * @param {GUIProgress} progress
     */
    GUIApplication.prototype.registerProgress = function (progress) {
        if (this._progressDialog == null) {
            this._progressDialog = new GUIProgressDialog();
            this._progressDialog.setCloseMode(GUIProgressDialog.CloseMode.AutoWhenAllFinished);
            this._progressDialog.addEventListener(GUIModal.CloseEvent, function () {
                this._progressDialog = null;
            }.bind(this));
            this._progressDialog.open();
        }
        this._progressDialog.addProgress(progress);
    };

    /**
     * Called to initialize the application
     */
    GUIApplication.prototype.init = function () {
        var body = $("body");

        // Prevent context-menu globally except for input elements
        body.on("contextmenu", function (evt) {
            if (!$(evt.target).is(':input')) {
                evt.preventDefault();
                return false;
            }
            return true;
        });

        body.addClass('gravit');

        // Append the corresponding hardware class to our body
        switch (gSystem.hardware) {
            case GSystem.Hardware.Desktop:
                body.addClass('g-desktop');
                break;
            case GSystem.Hardware.Tablet:
                body.addClass('g-touch');
                body.addClass('g-tablet');
                break;
            case GSystem.Hardware.Phone:
                body.addClass('g-touch');
                body.addClass('g-phone');
                break;
        }

        // Append the corresponding shell class to our body
        switch (gSystem.shell) {
            case GSystem.Hardware.Browser:
                body.addClass('g-browser');
                break;
            case GSystem.Hardware.Application:
                body.addClass('g-application');
                break;
            case GSystem.Hardware.Cordova:
                body.addClass('g-cordova');
                break;
        }

        // Subscribe to window resize to relayout
        $(window).resize(function () {
            if (this._resizeTimerId != null) {
                clearTimeout(this._resizeTimerId);
                this._resizeTimerId = null;
            }

            this._resizeTimerId = setTimeout(function () {
                this.relayout();
                this._resizeTimerId = null;
            }.bind(this), 200);
        }.bind(this));
    };

    /**
     * Called to relayout the application
     */
    GUIApplication.prototype.relayout = function () {
        // NO-OP
    };


    /*
     * Handle touch events by converting them into mouse events and stopping
     * every further propagation to guarantee mouse events not being fired twice
     * @private
     */
    GUIApplication.prototype._touchHandler = function (event) {
        // allow default multi-touch gestures to work
        if (event.touches.length > 1) {
            return;
        }

        function dispatchEventFromTouch(eventType, touch) {
            var simulatedEvent = document.createEvent("MouseEvent");
            simulatedEvent.initMouseEvent(eventType, true, true, window, 1,
                touch.screenX, touch.screenY,
                touch.clientX, touch.clientY, false,
                false, false, false, 0/*left*/, null);

            touch.target.dispatchEvent(simulatedEvent);
        };

        var touch = event.changedTouches[0];
        switch (event.type) {
            case "touchstart":
                dispatchEventFromTouch("mousedown", touch);
                break;
            case "touchmove":
                dispatchEventFromTouch("mousemove", touch);
                break;
            case "touchend":
                dispatchEventFromTouch("mouseup", touch);
                dispatchEventFromTouch("click", touch);
                break;
            default:
                return;
        }

        // Prevent any further processing
        event.preventDefault();
        event.stopPropagation();
    };

    /**
     * Get a menu item of global menu bar from given action id
     * @param {String} id id of action to get a menu-item for
     * @private
     */
    GUIApplication.prototype._getMenuItemForAction = function (id) {
        var _getItem = function (menu) {
            for (var i = 0; i < menu.getItemCount(); ++i) {
                var item = menu.getItem(i);
                if (item.getAction() && item.getAction().getId() === id) {
                    return item;
                }
                if (item.getType() === GUIMenuItem.Type.Menu) {
                    item = _getItem(item.getMenu());
                    if (item) {
                        return item;
                    }
                }
            }
            return null;
        };

        return _getItem(this._menu);
    };

    /**
     * Convert internal key into a AppShell-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     * @private
     */
    GUIApplication.prototype._shortcutToAppShellShortcut = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "-";
            }

            var key = shortcut[i];
            if (typeof key == 'number') {
                switch (key) {
                    case GUIKey.Constant.META:
                        result += gSystem.operatingSystem === GSystem.OperatingSystem.OSX_IOS ? "Cmd" : "Ctrl";
                        break;
                    case GUIKey.Constant.OPTION:
                        result += "Alt";
                        break;
                    case GUIKey.Constant.REMOVE:
                        result += "Delete";
                        break;
                    case GUIKey.Constant.SPACE:
                        result += "Space";
                        break;
                    case GUIKey.Constant.ENTER:
                        result += "Enter";
                        break;
                    case GUIKey.Constant.TAB:
                        result += "Tab";
                        break;
                    case GUIKey.Constant.BACKSPACE:
                        result += "Backspace";
                        break;
                    case GUIKey.Constant.CONTROL:
                        result += "Ctrl";
                        break;
                    case GUIKey.Constant.SHIFT:
                        result += "Shift";
                        break;
                    case GUIKey.Constant.ALT:
                        result += "Alt";
                        break;
                    case GUIKey.Constant.LEFT:
                        result += "Left";
                        break;
                    case GUIKey.Constant.UP:
                        result += "Up";
                        break;
                    case GUIKey.Constant.RIGHT:
                        result += "Right";
                        break;
                    case GUIKey.Constant.DOWN:
                        result += "Down";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.PAGE_UP:
                        result += "Pageup";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.PAGE_DOWN:
                        result += "Pagedown";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.HOME:
                        result += "Home";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.END:
                        result += "End";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.INSERT:
                        result += "Ins";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.DELETE:
                        result += "Del";
                        break;
                    // TODO : Get the correct shortcut code
                    case GUIKey.Constant.ESCAPE:
                        result += "Esc";
                        break;
                    case GUIKey.Constant.COMMAND:
                        result += "Cmd";
                        break;
                    case GUIKey.Constant.F1:
                        result += "F1";
                        break;
                    case GUIKey.Constant.F2:
                        result += "F2";
                        break;
                    case GUIKey.Constant.F3:
                        result += "F3";
                        break;
                    case GUIKey.Constant.F4:
                        result += "F4";
                        break;
                    case GUIKey.Constant.F5:
                        result += "F5";
                        break;
                    case GUIKey.Constant.F6:
                        result += "F6";
                        break;
                    case GUIKey.Constant.F7:
                        result += "F7";
                        break;
                    case GUIKey.Constant.F8:
                        result += "F8";
                        break;
                    case GUIKey.Constant.F9:
                        result += "F9";
                        break;
                    case GUIKey.Constant.F10:
                        result += "F10";
                        break;
                    case GUIKey.Constant.F11:
                        result += "F11";
                        break;
                    case GUIKey.Constant.F12:
                        result += "F12";
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result += key.toUpperCase();
            }
        }
        return result;
    };

    /**
     * Convert internal key into a mousetrap-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     * @private
     */
    GUIApplication.prototype._shortcutToMouseTrapShortcut = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "+";
            }

            var key = shortcut[i];
            if (typeof key == 'number') {
                switch (key) {
                    case GUIKey.Constant.META:
                        result += "meta";
                        break;
                    case GUIKey.Constant.OPTION:
                        result += "option";
                        break;
                    case GUIKey.Constant.REMOVE:
                        result += "del";
                        break;
                    case GUIKey.Constant.SPACE:
                        result += "space";
                        break;
                    case GUIKey.Constant.ENTER:
                        result += "enter";
                        break;
                    case GUIKey.Constant.TAB:
                        result += "tab";
                        break;
                    case GUIKey.Constant.BACKSPACE:
                        result += "backspace";
                        break;
                    case GUIKey.Constant.CONTROL:
                        result += "ctrl";
                        break;
                    case GUIKey.Constant.SHIFT:
                        result += "shift";
                        break;
                    case GUIKey.Constant.ALT:
                        result += "alt";
                        break;
                    case GUIKey.Constant.LEFT:
                        result += "left";
                        break;
                    case GUIKey.Constant.UP:
                        result += "up";
                        break;
                    case GUIKey.Constant.RIGHT:
                        result += "right";
                        break;
                    case GUIKey.Constant.DOWN:
                        result += "down";
                        break;
                    case GUIKey.Constant.PAGE_UP:
                        result += "pageup";
                        break;
                    case GUIKey.Constant.PAGE_DOWN:
                        result += "pagedown";
                        break;
                    case GUIKey.Constant.HOME:
                        result += "home";
                        break;
                    case GUIKey.Constant.END:
                        result += "end";
                        break;
                    case GUIKey.Constant.INSERT:
                        result += "ins";
                        break;
                    case GUIKey.Constant.DELETE:
                        result += "del";
                        break;
                    case GUIKey.Constant.ESCAPE:
                        result += "esc";
                        break;
                    case GUIKey.Constant.COMMAND:
                        result += "meta";
                        break;
                    case GUIKey.Constant.F1:
                        result += "f1";
                        break;
                    case GUIKey.Constant.F2:
                        result += "f2";
                        break;
                    case GUIKey.Constant.F3:
                        result += "f3";
                        break;
                    case GUIKey.Constant.F4:
                        result += "f4";
                        break;
                    case GUIKey.Constant.F5:
                        result += "f5";
                        break;
                    case GUIKey.Constant.F6:
                        result += "f6";
                        break;
                    case GUIKey.Constant.F7:
                        result += "f7";
                        break;
                    case GUIKey.Constant.F8:
                        result += "f8";
                        break;
                    case GUIKey.Constant.F9:
                        result += "f9";
                        break;
                    case GUIKey.Constant.F10:
                        result += "f10";
                        break;
                    case GUIKey.Constant.F11:
                        result += "f11";
                        break;
                    case GUIKey.Constant.F12:
                        result += "f12";
                        break;
                    default:
                        throw new Error("Unknown key code");
                }
            } else {
                result += key.toLowerCase();
            }
        }
        return result;
    };

    _.GUIApplication = GUIApplication;
    _.gApp = null; // initialized by client
})(this);
