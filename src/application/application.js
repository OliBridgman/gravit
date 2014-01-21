(function (_) {
    /**
     * The global application class
     * @class EXApplication
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function EXApplication() {
        document.addEventListener("touchstart", this._touchHandler, true);
        document.addEventListener("touchmove", this._touchHandler, true);
        document.addEventListener("touchend", this._touchHandler, true);
        document.addEventListener("touchcancel", this._touchHandler, true);

        this._actions = [];
        this._shortcuts = {};
        this._menu = new GUIMenu();
        this._toolManager = new GXToolManager();
        this._documents = [];
        this._shortcutMap = new GUIShortcutsDialog();

        // This is a hack to focus our active window
        // whenever a key is hit down (in capture phase) and
        // if not an input element is active!
        document.addEventListener('keydown', function (evt) {
            var activeWindow = this._windows.getActiveWindow();
            if (activeWindow && (!document.activeElement || !$(document.activeElement).is("input,select,textArea"))) {
                activeWindow.getView().focus();
            }
        }.bind(this), true);

        // Set default global color to white
        this._globalColor = new GXColor(GXColor.Type.White);
    };
    GObject.inherit(EXApplication, GEventTarget);

    // Constants for pre-defined action categories
    EXApplication.CATEGORY_WINDOW = new GLocale.Key(EXApplication, "category.window");
    EXApplication.CATEGORY_FILE = new GLocale.Key(EXApplication, "category.file");
    EXApplication.CATEGORY_FILE_OPEN = new GLocale.Key(EXApplication, "category.file.open");
    EXApplication.CATEGORY_FILE_SAVEAS = new GLocale.Key(EXApplication, "category.file.saveas");
    EXApplication.CATEGORY_FILE_IMPORT = new GLocale.Key(EXApplication, "category.file.import");
    EXApplication.CATEGORY_FILE_EXPORT = new GLocale.Key(EXApplication, "category.file.export");
    EXApplication.CATEGORY_EDIT = new GLocale.Key(EXApplication, "category.edit");
    EXApplication.CATEGORY_VIEW = new GLocale.Key(EXApplication, "category.view");
    EXApplication.CATEGORY_VIEW_MAGNIFICATION = new GLocale.Key(EXApplication, "category.view.magnification");
    EXApplication.CATEGORY_HELP = new GLocale.Key(EXApplication, "category.help");

    /**
     * Visual parts of the application
     */
    EXApplication.Part = {
        Header: {
            id: "header"
        },
        Navigation: {
            id: "navigation"
        },
        Sidebar: {
            id: "sidebar"
        },
        Windows: {
            id: "windows"
        },
        Toolpanel: {
            id: "toolpanel"
        },
        Welcome: {
            id: "welcome"
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXApplication.DocumentEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a document event occurrs
     * @class EXApplication.DocumentEvent
     * @extends GEvent
     * @constructor
     */
    EXApplication.DocumentEvent = function (type, document) {
        this.type = type;
        this.document = document;
    };
    GObject.inherit(EXApplication.DocumentEvent, GEvent);

    /**
     * Enumeration of view event types
     * @enum
     */
    EXApplication.DocumentEvent.Type = {
        Added: 0,
        Removed: 1,
        Deactivated: 10,
        Activated: 11,
        BlobUpdated: 12
    };

    /**
     * @type {EXApplication.DocumentEvent.Type}
     */
    EXApplication.DocumentEvent.prototype.type = null;

    /**
     * The affected document
     * @type {GXScene}
     */
    EXApplication.DocumentEvent.prototype.document = null;

    /** @override */
    EXApplication.DocumentEvent.prototype.toString = function () {
        return "[Object EXApplication.DocumentEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // EXApplication.GlobalColorChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever the global color has changed
     * @class EXApplication.GlobalColorChangedEvent
     * @extends GEvent
     * @constructor
     */
    EXApplication.GlobalColorChangedEvent = function () {
    }
    GObject.inherit(EXApplication.GlobalColorChangedEvent, GEvent);

    /** @override */
    EXApplication.GlobalColorChangedEvent.prototype.toString = function () {
        return "[Object EXApplication.GlobalColorChangedEvent]";
    };

    EXApplication.GLOBAL_COLOR_CHANGED_EVENT = new EXApplication.GlobalColorChangedEvent();

    // -----------------------------------------------------------------------------------------------------------------
    // EXApplication Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {boolean}
     * @private
     */
    EXApplication.prototype._initialized = false;

    /**
     * @type {GXToolManager}
     * @private
     */
    EXApplication.prototype._toolManager = null;

    /**
     * @type {number}
     * @private
     */
    EXApplication.prototype._documentUntitledCount = 0;

    /**
     * @type {Array<EXDocument>}
     * @private
     */
    EXApplication.prototype._documents = null;

    /**
     * @type {EXDocument}
     * @private
     */
    EXApplication.prototype._activeDocument = null;

    /**
     * @type {JQuery}
     * @private
     */
    EXApplication.prototype._view = null;

    /**
     * @type {EXNavigation}
     * @private
     */
    EXApplication.prototype._navigation = null;

    /**
     * @type {EXSidebar}
     * @private
     */
    EXApplication.prototype._sidebar = null;

    /**
     * @type {EXWindows}
     * @private
     */
    EXApplication.prototype._windows = null;

    /**
     * @type {EXWelcome}
     * @private
     */
    EXApplication.prototype._welcome = null;

    /**
     * @type {EXToolpanel}
     * @private
     */
    EXApplication.prototype._toolpanel = null;

    /**
     * @type {GUIShortcutsDialog}
     * @private
     */
    EXApplication.prototype._shortcutMap = null;

    /**
     * @type {GXColor}
     * @private
     */
    EXApplication.prototype._globalColor = null;

    /**
     * @type {Number}
     * @private
     */
    EXApplication.prototype._resizeTimerId = null;

    /**
     * @type {GUIProgressDialog}
     * @private
     */
    EXApplication.prototype._progressDialog = null;


    /**
     * Array of registered actions
     * @type {Array<GUIAction>}
     * @private
     */
    EXApplication.prototype._actions = null;

    /**
     * Mapping of actions to shortcuts
     * @type {{}}
     * @private
     */
    EXApplication.prototype._shortcuts = null;

    /**
     * Application menu
     * @type {GUIMenu}
     * @private
     */
    EXApplication.prototype._menu = null;

    /**
     * @returns {GXToolManager}
     */
    EXApplication.prototype.getToolManager = function () {
        return this._toolManager;
    };

    /**
     * Returns a list of all opened documents
     * @return {Array<EXDocument>}
     */
    EXApplication.prototype.getDocuments = function () {
        return this._documents;
    };

    /**
     * Returns the currently active document
     * @return {EXDocument}
     */
    EXApplication.prototype.getActiveDocument = function () {
        return this._activeDocument ? this._activeDocument : null;
    };

    /**
     * Return access to the sidebar
     * @returns {EXSidebar}
     */
    EXApplication.prototype.getSidebar = function () {
        return this._sidebar;
    };

    /**
     * Return access to the window container
     * @returns {EXWindows}
     */
    EXApplication.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Return access to the tools panel
     * @returns {EXToolpanel}
     */
    EXApplication.prototype.getToolpanel = function () {
        return this._toolpanel;
    };

    /**
     * @returns {GUIShortcutsDialog}
     */
    EXApplication.prototype.getShortcutMap = function () {
        return this._shortcutMap;
    };

    /**
     * @return {GXColor}
     */
    EXApplication.prototype.getGlobalColor = function () {
        return this._globalColor;
    };

    /**
     * @param {GXColor} color
     */
    EXApplication.prototype.setGlobalColor = function (color) {
        if (!GXColor.equals(color, this._globalColor)) {
            this._globalColor = color;

            // Trigger update event
            if (this.hasEventListeners(EXApplication.GlobalColorChangedEvent)) {
                this.trigger(EXApplication.GLOBAL_COLOR_CHANGED_EVENT);
            }
        }
    };

    /**
     * Checks if a given part is visible or not
     * @param {EXApplication.Part} part the part to check for
     * @returns {boolean} true if part is visible, false if not
     */
    EXApplication.prototype.isPartVisible = function (part) {
        return this.getPart(part).css('display') !== 'none';
    };

    /**
     * Make a given part visible or not
     * @param {EXApplication.Part} part the part
     * @param visible whether to make the part visible or not
     */
    EXApplication.prototype.setPartVisible = function (part, visible) {
        if (visible != this.isPartVisible(part)) {
            this.getPart(part).css('display', (visible ? 'block' : 'none'));
            this._updatedPartVisibilities();
        }
    };

    /**
     * Return reference to a given part
     * @param {EXApplication.Part} part
     * @returns {JQuery}
     */
    EXApplication.prototype.getPart = function (part) {
        return this._view.find('#' + part.id);
    };

    /**
     * Get a list of all registered actions
     * @return {Array<GUIAction>} list of registered actions
     */
    EXApplication.prototype.getActions = function () {
        return this._actions;
    };

    /**
     * Get the application menu
     * @return {GUIMenu}
     */
    EXApplication.prototype.getMenu = function () {
        return this._menu;
    };

    /**
     * Get a list of currently all available, registered actions
     * @return {Array<GUIAction>} list of registered and available actions
     */
    EXApplication.prototype.getAvailableActions = function () {
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
    EXApplication.prototype.getAction = function (id) {
        for (var i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].getId() === id) {
                return this._actions[i];
            }
        }
        return null;
    };

    /**
     * Show a file chooser dialog and call the done function
     * when the call was successfull and a file was chosen
     * @param {Function} done the callback called when one or
     * more files have been chosen. If multiple is not true,
     * a File reference will be send, otherwise an Array of files
     * @param {Boolean} multiple whether to allow multiple file
     * selection, defaults to false
     */
    EXApplication.prototype.openFile = function (done, multiple) {
        var fileChooserInput = $('#appFileChooser');

        if (fileChooserInput.length === 0) {
            // Add a hidden file input for quick file choosing
            fileChooserInput = $('<input>')
                .attr('type', 'file')
                .attr('id', 'appFileChooser')
                .css({
                    'display': 'block',
                    'position': 'absolute',
                    'top': '0px',
                    'left': '0px',
                    'visibility': 'hidden',
                    'width': '0',
                    'height': '0'
                })
                .appendTo($("body"));
        }

        fileChooserInput.off();

        fileChooserInput.attr('multiple', multiple ? 'true' : null);

        fileChooserInput.on('change', function (evt) {
            done(multiple ? evt.target.files : evt.target.files[0]);
        });

        fileChooserInput.click();
    };

    /**
     * Add a new document and open up a window for it
     * and mark the view as being active
     * @param {GXScene|GBlob} source the source to be added, either a scene
     * or a blob to read the document from
     * @param {String} [temporaryTitle] optional temporary title to be used
     * for the document if no blob is assigned, defaults to null to use
     * the default naming scheme
     */
    EXApplication.prototype.addDocument = function (source, temporaryTitle) {
        if (source instanceof GBlob) {
            // Iterate all documents first and look if the given
            // blob is already opened and if so, activate the
            // document's last view
            var documentAlreadyOpened = false;
            for (var i = 0; i < this._documents.length; ++i) {
                var document = this._documents[i];
                if (document.blob === source) {
                    this.activateDocument(document);
                    documentAlreadyOpened = true;
                }
            }

            if (!documentAlreadyOpened) {
                source.restore(function (data) {
                    var document = null;
                    try {
                        var scene = GXNode.deserialize(data);

                        if (!scene) {
                            throw new Error('Failure.');
                        }
                    } catch (e) {
                        alert('An error has ocurred while trying to open the document.');
                    }

                    if (document) {
                        this._addDocument(scene, source);
                    }
                }.bind(this));
            }
        } else {
            this._addDocument(source, null, temporaryTitle);
        }
    };

    /**
     * Mark a given document as being the active one and activates
     * the first window for the document as well
     * @param {EXDocument} document may be null to only deactivate the current one
     * @param {boolean} [noWindowActivation] optional param that, if set, avoids
     * activating the corresponding window when the document gets activated
     */
    EXApplication.prototype.activateDocument = function (document, noWindowActivation) {
        if (document != this._activeDocument) {
            // Deactivate previous one if any
            if (this._activeDocument) {
                if (this._activeDocument && this.hasEventListeners(EXApplication.DocumentEvent)) {
                    this.trigger(new EXApplication.DocumentEvent(EXApplication.DocumentEvent.Type.Deactivated, this._activeDocument));
                }

                this._activeDocument = null;
            }

            // Activate new one if any
            if (document) {
                // Activate lastly activated window of document
                if (!noWindowActivation) {
                    this._windows.activateWindow(document.getActiveWindow());
                }

                // Now assign the active document
                this._activeDocument = document;

                if (this.hasEventListeners(EXApplication.DocumentEvent)) {
                    this.trigger(new EXApplication.DocumentEvent(EXApplication.DocumentEvent.Type.Activated, document));
                }
            }
        }
    };

    /**
     * Closes and removes a document and all of it's views
     * @param {EXDocument} document
     */
    EXApplication.prototype.closeDocument = function (document) {
        if (document._windows.length) {
            // Document has windows so remove them first which
            // will then trigger this function again
            while (document._windows.length > 0) {
                this._windows.closeWindow(document._windows[0]);
            }
        } else {
            // Remove active document if this is the active one
            if (document === this.getActiveDocument()) {
                this.activateDocument(null);
            }

            // Release document editor
            document.getEditor().close();

            // Remove and trigger event
            this._documents.splice(this._documents.indexOf(document), 1);

            if (this.hasEventListeners(EXApplication.DocumentEvent)) {
                this.trigger(new EXApplication.DocumentEvent(EXApplication.DocumentEvent.Type.Removed, document));
            }

            // Show or hide screen depending if documents are available or not
            this.setPartVisible(EXApplication.Part.Welcome, this._documents.length === 0);
        }
    };

    /**
     * Execute a given action
     * @param {String} id id of the action to execute
     * @param {*} args optional args to be supplied to the action
     * @return {*} the result of the action if any
     */
    EXApplication.prototype.executeAction = function (id, args) {
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
    EXApplication.prototype.addWindowAction = function (action) {
        if (gSystem.shell === GSystem.Shell.Application) {
            //gshell.addDocument(gLocale.get(action.getTitle()));
        } else {
            var windowItem = this._menu.findItem(gLocale.get(EXApplication.CATEGORY_WINDOW));

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
    EXApplication.prototype.removeWindowAction = function (action) {
        var windowItem = this._menu.findItem(gLocale.get(EXApplication.CATEGORY_WINDOW));
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
    EXApplication.prototype.getShortcut = function (id) {
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
    EXApplication.prototype.setShortcut = function (id, shortcut) {
        // Remove any previous shortcut
        if (this._shortcuts.hasOwnProperty(id)) {
            if (gSystem.shell == GSystem.Shell.Application) {
                // TODO : Is this supposed to work in AppShell ?
                //appshell.app.setMenuItemShortcut(id.toString(), null, "");
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
                //appshell.app.setMenuItemShortcut(id, this._shortcutToAppShellShortcut(shortcut), "");
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
    EXApplication.prototype.createAndRegisterHttpProcess = function (processTitle) {
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
    EXApplication.prototype.registerProgress = function (progress) {
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

    EXApplication.prototype.preInit = function () {
        // Create our parts
        var body = $('body');

        this._view = $("<div></div>")
            .attr('id', 'application')
            .prependTo(body);

        // Windows-Part
        var windowsPart = $("<div></div>")
            .attr('id', EXApplication.Part.Windows.id)
            .appendTo(this._view);

        this._windows = new EXWindows(windowsPart);

        // Welcome-Part
        var welcomePart = $("<div></div>")
            .attr('id', EXApplication.Part.Welcome.id)
            .appendTo(this._view);

        this._welcome = new EXWelcome(welcomePart);

        // Toolpanel-Part
        var toolpanelPart = $("<div></div>")
            .attr('id', EXApplication.Part.Toolpanel.id)
            .appendTo(this._view);

        this._toolpanel = new EXToolpanel(toolpanelPart);

        // Sidebar-Part
        var sidebarPart = $("<div></div>")
            .attr('id', EXApplication.Part.Sidebar.id)
            .appendTo(this._view);

        this._sidebar = new EXSidebar(sidebarPart);

        // Header won't be available for AppShell
        if (gSystem.shell !== GSystem.Shell.Application) {
            // Header-Part
            var headerPart = $("<div></div>")
                .attr('id', EXApplication.Part.Header.id)
                .appendTo(this._view);

            // Navigation-Part
            var navigationPart = $("<div></div>")
                .attr('id', EXApplication.Part.Navigation.id)
                .appendTo(headerPart);
            this._navigation = new EXNavigation(navigationPart);
        }
    };

    /**
     * Called to initialize the application
     */
    EXApplication.prototype.init = function () {
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

        // TODO : Order our available palettes by group
        // TODO : Order our available tools by group

        // -- Register Actions
        this._registerActions(gExpress.actions);

        // Add all available tools to toolmanager
        if (gExpress.tools) {
            for (var i = 0; i < gExpress.tools.length; ++i) {
                this._toolManager.addTool(gExpress.tools[i]);
            }
        }

        // Initialize parts
        if (this._navigation) {
            this._navigation.init();
        }

        this._sidebar.init();
        this._windows.init();
        this._welcome.init();
        this._toolpanel.init();

        // Mark initialized
        this._initialized = true;

        // Manual call to update part visibilities
        this._updatedPartVisibilities();

        // Initialize our shortcut maps with available actions
        var shortcutMaps = [
            GUIShortcutsDialog.createMapFromAvailableActions(),
            {
                // TODO: I18N
                title: 'Tools',
                map: []
            }
        ];

        // Add tools to shorcut maps
        var toolCount = this._toolManager.getToolCount();
        for (var i = 0; i < toolCount; ++i) {
            var toolInstance = this._toolManager.getTool(i);
            var toolHint = toolInstance.getHint() ? toolInstance.getHint() : null;
            if (toolHint) {
                shortcutMaps[1].map.push(toolHint);
            }
        }

        this._shortcutMap.setMaps(shortcutMaps);

        // Subscribe to window events
        this._windows.addEventListener(EXWindows.WindowEvent, this._windowEvent, this);
    };

    /**
     * Called to relayout the application
     */
    EXApplication.prototype.relayout = function () {
        if (!this._initialized) {
            // ignore
            return;
        }

        setTimeout(function () {
            var headerPart = this.getPart(EXApplication.Part.Header);
            var headerHeight = headerPart.length > 0 ? headerPart.outerHeight() : 0;

            // Sidebar
            var sidebarPart = this.getPart(EXApplication.Part.Sidebar);
            sidebarPart.height(this._view.height());

            // Windows
            var windowsPart = this.getPart(EXApplication.Part.Windows);
            windowsPart.width(this._view.width() - (this.isPartVisible(EXApplication.Part.Sidebar) ? sidebarPart.outerWidth() : 0));
            windowsPart.height(this._view.height());

            // Welcome
            var welcomePart = this.getPart(EXApplication.Part.Welcome);
            welcomePart.width(this._view.width() - (this.isPartVisible(EXApplication.Part.Sidebar) ? sidebarPart.outerWidth() : 0));
            welcomePart.height(this._view.height() - headerHeight);
            welcomePart.css('top', headerHeight.toString() + 'px');

            // Toolpanel
            var toolpanelPart = this.getPart(EXApplication.Part.Toolpanel);
            toolpanelPart.css('right', (this.isPartVisible(EXApplication.Part.Sidebar) ? sidebarPart.outerWidth() : 0) + 'px');

            // Let parts know about relayout
            if (this._navigation) {
                this._navigation.relayout();
            }

            this._sidebar.relayout();
            this._windows.relayout([0, headerHeight, 0, 0]);
            this._welcome.relayout();
            this._toolpanel.relayout();
        }.bind(this), 0);
    };

    /**
     * Part visibilities have been changed
     */
    EXApplication.prototype._updatedPartVisibilities = function () {
        // Update layout as part visibilities have changed
        this.relayout();
    };


    /**
     * Add a new document
     * @param {GXScene} scene
     * @param {GBlob} blob
     * @param {String} [temporaryTitle]
     * @private
     */
    EXApplication.prototype._addDocument = function (scene, blob, temporaryTitle) {
        // Initiate a new document instance
        // TODO : I18N
        var document = new EXDocument(scene, blob, temporaryTitle ? temporaryTitle : 'Untitled-' + (++this._documentUntitledCount).toString());

        // Send an event
        if (this.hasEventListeners(EXApplication.DocumentEvent)) {
            this.trigger(new EXApplication.DocumentEvent(EXApplication.DocumentEvent.Type.Added, document));
        }

        // Add a window for the document making it activated by default
        this._windows.addWindow(document);

        // Hide welcome screen as we have a document now
        this.setPartVisible(EXApplication.Part.Welcome, false);

        // Fit to size by default
        // TODO : Check if blob contains user view settings and use that one instead
        this.executeAction(EXFitAllAction.ID);
    };

    /**
     * Register one or more actions. Note that if the current shell is
     * set to GSystem.Shell.Application then this will also create the
     * corresponding menu bar entries on the according system! This
     * should only be called ONCE on startup!
     * @param {Array<GUIAction>} actions list of actions to be registered
     * @private
     */
    EXApplication.prototype._registerActions = function (actions) {
        // Add all actions, first
        for (var i = 0; i < actions.length; ++i) {
            this._actions.push(actions[i]);
        }

        // Initialize our application menu with the given actions
        GUIMenu.createActionMenu(this.getAvailableActions(), this._menu);

        // Handle platform specific stuff now
        if (gSystem.shell === GSystem.Shell.Application) {
            var _updateShellMenu = function (menu, mappings) {
                menu.update();
                for (var i = 0; i < mappings.length; ++i) {
                    var mapping = mappings[i];
                    mapping.shellItem.text = gLocale.get(mapping.item.getCaption());
                    if (mapping.item.isChecked()) {
                        mapping.shellItem.checkable = true;
                        mapping.shellItem.checked = true;
                    } else {
                        mapping.shellItem.checked = false;
                    }
                    mapping.shellItem.enabled = mapping.item.isEnabled();
                }
            };

            var _addShellMenuItem = function (shellMenu, menuItem) {
                var shellItem = gshell.addMenuItem(shellMenu);
                shellItem.triggered.connect(function () {
                    this.executeAction(menuItem.getAction().getId());
                }.bind(this));
                return shellItem;
            }.bind(this);

            var _addShellMenu = function (shellParentMenu, menuItem) {
                var menu = menuItem.getMenu();
                var shellMappings = [];
                var shellMenu = gshell.addMenu(shellParentMenu, gLocale.get(menuItem.getCaption()));
                shellMenu.aboutToShow.connect(function () {
                    _updateShellMenu(menu, shellMappings);
                });

                for (var i = 0; i < menu.getItemCount(); ++i) {
                    var item = menu.getItem(i);
                    switch (item.getType()) {
                        case GUIMenuItem.Type.Menu:
                            _addShellMenu(shellMenu, item);
                            break;
                        case GUIMenuItem.Type.Item:
                            shellMappings.push({
                                item: item,
                                shellItem: _addShellMenuItem(shellMenu, item)
                            });
                            break;
                        case GUIMenuItem.Type.Divider:
                            gshell.addMenuSeparator(shellMenu);
                            break;
                    }
                }
            };

            for (var i = 0; i < this._menu.getItemCount(); ++i) {
                _addShellMenu(null, this._menu.getItem(i));
            }
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
     * @param {EXWindows.WindowEvent} evt
     * @private
     */
    EXApplication.prototype._windowEvent = function (evt) {
        switch (evt.type) {
            case EXWindows.WindowEvent.Type.Added:
                // Register a new window show action and attach it to the window
                evt.window.__action_ = new EXShowWindowAction(evt.window);
                this.addWindowAction(evt.window.__action_);
                break;
            case EXWindows.WindowEvent.Type.Removed:
                this.removeWindowAction(evt.window.__action_);
                break;
            case EXWindows.WindowEvent.Type.Activated:
                this._toolManager.setView(evt.window.getView());
                break;
            case EXWindows.WindowEvent.Type.Deactivated:
                this._toolManager.setView(null);
                break;
            default:
                break;
        }
    };

    /**
     * Handle touch events by converting them into mouse events and stopping
     * every further propagation to guarantee mouse events not being fired twice
     * @private
     */
    EXApplication.prototype._touchHandler = function (event) {
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
    EXApplication.prototype._getMenuItemForAction = function (id) {
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
    EXApplication.prototype._shortcutToAppShellShortcut = function (shortcut) {
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
    EXApplication.prototype._shortcutToMouseTrapShortcut = function (shortcut) {
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

    _.EXApplication = EXApplication;
    _.gApp = null; // initialized by client
})(this);
