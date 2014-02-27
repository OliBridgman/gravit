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
        this._toolManager = new GXToolManager();
        this._documents = [];
        this._windowMenuMap = [];

        // This is a hack to focus our active window
        // whenever a key is hit down (in capture phase) and
        // if not an input element is active!
        document.addEventListener('keydown', function (evt) {
            var activeWindow = this._windows.getActiveWindow();
            if (activeWindow && (!document.activeElement || !$(document.activeElement).is("input,select,textArea"))) {
                activeWindow.getView().focus();
            }
        }.bind(this), false);

        // Set default global color to white
        this._globalColor = new GXColor(GXColor.Type.White);
    };
    GObject.inherit(EXApplication, GEventTarget);

    // Constants for pre-defined action categories
    EXApplication.CATEGORY_FILE = new GLocale.Key(EXApplication, "category.file");
    EXApplication.CATEGORY_FILE_OPEN = new GLocale.Key(EXApplication, "category.file.open");
    EXApplication.CATEGORY_FILE_SAVEAS = new GLocale.Key(EXApplication, "category.file.saveas");
    EXApplication.CATEGORY_FILE_IMPORT = new GLocale.Key(EXApplication, "category.file.import");
    EXApplication.CATEGORY_FILE_EXPORT = new GLocale.Key(EXApplication, "category.file.export");
    EXApplication.CATEGORY_EDIT = new GLocale.Key(EXApplication, "category.edit");
    EXApplication.CATEGORY_MODIFY = new GLocale.Key(EXApplication, "category.modify");
    EXApplication.CATEGORY_VIEW = new GLocale.Key(EXApplication, "category.view");
    EXApplication.CATEGORY_VIEW_MAGNIFICATION = new GLocale.Key(EXApplication, "category.view.magnification");
    EXApplication.CATEGORY_WINDOW = new GLocale.Key(EXApplication, "category.window");
    EXApplication.CATEGORY_HELP = new GLocale.Key(EXApplication, "category.help");

    /**
     * Visual parts of the application
     */
    EXApplication.Part = {
        Header: {
            id: "header"
        },
        Toolbar: {
            id: "toolbar"
        },
        Content: {
            id: "content"
        },
        Sidebar: {
            id: "sidebar"
        },
        Windows: {
            id: "windows"
        },
        Palettes: {
            id: "palettes"
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
     * @type {GHeader}
     * @private
     */
    EXApplication.prototype._header = null;

    /**
     * @type {GToolbar}
     * @private
     */
    EXApplication.prototype._toolbar = null;

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
     * @type {GPalettes}
     * @private
     */
    EXApplication.prototype._palettes = null;

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
     * Array of registered actions
     * @type {Array<GUIAction>}
     * @private
     */
    EXApplication.prototype._actions = null;

    /**
     * Application window shell menu
     * @type {*}
     * @private
     */
    EXApplication.prototype._windowMenu = null;

    /**
     * @type {Array<{window: EXWindow, item: *}>}
     * @private
     */
    EXApplication.prototype._windowMenuMap = null;

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
     * Return access to the header
     * @returns {GHeader}
     */
    EXApplication.prototype.getHeader = function () {
        return this._header;
    };

    /**
     * Return access to the toolbar
     * @returns {GToolbar}
     */
    EXApplication.prototype.getToolbar = function () {
        return this._toolbar;
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
     * Return access to the palettes container
     * @returns {GPalettes}
     */
    EXApplication.prototype.getPalettes = function () {
        return this._palettes;
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
                source.restore(false, 'binary', function (data) {
                    var scene = null;
                    try {
                        scene = GXNode.deserialize(data);

                        if (!scene) {
                            throw new Error('Failure.');
                        }
                    } catch (e) {
                        alert('An error has ocurred while trying to open the document.');
                    }

                    if (scene) {
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

            // Execute welcome dialog if there're no documents available
            if (this._documents.length === 0) {
                this.executeAction(GWelcomeAction.ID);
            }
        }
    };

    /**
     * Execute a given action
     * @param {String} id id of the action to execute
     * @param {*} [args] optional args to be supplied to the action
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
     * Called to initialize the application
     */
    EXApplication.prototype.init = function () {
        var body = $('body');

        // Prevent context-menu globally except for input elements
        body.on("contextmenu", function (evt) {
            if (!$(evt.target).is(':input')) {
                evt.preventDefault();
                return false;
            }
            return true;
        });

        // Iterate modules and let each one initialize
        for (var i = 0; i < gravit.modules.length; ++i) {
            var module = gravit.modules[i];
            console.log("Init module <" + module.toString() + ">");
            module.init();
        }

        this._view = $("<div></div>")
            .attr('id', 'workspace')
            .prependTo(body);

        // Header-Part
        var headerPart = $("<div></div>")
            .attr('id', EXApplication.Part.Header.id)
            .appendTo(this._view);

        this._header = new GHeader(headerPart);

        // Toolbar-Part
        var toolbarPart = $("<div></div>")
            .attr('id', EXApplication.Part.Toolbar.id)
            .appendTo(this._view);

        this._toolbar = new GToolbar(toolbarPart);

        // Content-Part
        var contentPart = $("<div></div>")
            .attr('id', EXApplication.Part.Content.id)
            .appendTo(this._view);

        // Sidebar-Part
        var sidebarPart = $("<div></div>")
            .attr('id', EXApplication.Part.Sidebar.id)
            .appendTo(contentPart);

        this._sidebar = new EXSidebar(sidebarPart);

        // Palettes-Part
        var palettesPart = $("<div></div>")
            .attr('id', EXApplication.Part.Palettes.id)
            .appendTo(contentPart);

        this._palettes = new GPalettes(palettesPart);

        // Windows-Part
        var windowsPart = $("<div></div>")
            .attr('id', EXApplication.Part.Windows.id)
            .appendTo(contentPart);

        this._windows = new EXWindows(windowsPart);

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
        this._actions = gravit.actions.slice();
        this._createMainMenu();

        // Add all available tools to toolmanager
        if (gravit.tools) {
            for (var i = 0; i < gravit.tools.length; ++i) {
                this._toolManager.addTool(gravit.tools[i]);
            }
        }

        this._header.init();
        this._toolbar.init();
        this._sidebar.init();
        this._windows.init();
        this._palettes.init();

        // Mark initialized
        this._initialized = true;

        // Manual call to update part visibilities
        this._updatedPartVisibilities();

        // Subscribe to window events
        this._windows.addEventListener(EXWindows.WindowEvent, this._windowEvent, this);

        // Execute welcome dialog if there're no documents available
        if (this._documents.length === 0) {
            this.executeAction(GWelcomeAction.ID);
        }
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
            var toolbarPart = this.getPart(EXApplication.Part.Toolbar);

            var contentPart = this.getPart(EXApplication.Part.Content);
            contentPart.height(this._view.height() - headerPart.outerHeight() - toolbarPart.outerHeight());

            this._header.relayout();
            this._toolbar.relayout();
            this._sidebar.relayout();
            this._windows.relayout();
            this._palettes.relayout();
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
    };

    /**
     * Create the main menu based on actions
     * @param {Array<GUIAction>} actions
     * @private
     */
    EXApplication.prototype._createMainMenu = function () {
        // Create our menu structure based on actions
        // TODO : Order given actions by category & group

        var itemToGroupArray = [];
        var treeRoot = {
            items: []
        };

        var _getGroupForItem = function (item) {
            for (var i = 0; i < itemToGroupArray.length; ++i) {
                if (itemToGroupArray[i].item === item) {
                    return itemToGroupArray[i].group;
                }
            }
        };

        var _addItemGroupAndDivider = function (menu, item, group) {
            if (menu.items.length > 0) {
                var lastGroup = _getGroupForItem(menu.items[menu.items.length - 1]);
                if (lastGroup !== group) {
                    menu.items.push({
                        type: 'divider'
                    });
                }
            }
            itemToGroupArray.push({
                item: item,
                group: group
            });
        };

        for (var i = 0; i < this._actions.length; ++i) {
            var action = this._actions[i];

            if (!action.isAvailable()) {
                continue;
            }

            var category = gLocale.get(action.getCategory());
            var group = action.getGroup();
            var categories = category ? category.split('/') : null;
            var groups = group ? [""].concat(group.split('/')) : null;

            if (groups && categories && categories.length !== groups.length - 1) {
                throw new Error("Number of categories different thant number of groups.");
            }

            // Build up our structure by iterating our categories
            var currentTree = treeRoot;
            if (categories) {
                for (var k = 0; k < categories.length; ++k) {
                    var category = categories[k];
                    var group = groups ? groups[k] : null;

                    var item = null;
                    for (var l = 0; l < currentTree.items.length; ++l) {
                        if (category == currentTree.items[l].caption) {
                            item = currentTree.items[l];
                        }
                    }

                    if (!item) {
                        item = {
                            type: 'menu',
                            caption: category,
                            items: [],
                            windowMenu : EXApplication.CATEGORY_WINDOW === action.getCategory() &&
                                currentTree === treeRoot
                        };
                        _addItemGroupAndDivider(currentTree, item, group);

                        currentTree.items.push(item);
                    }
                    currentTree = item;
                }
            }

            // Add our action item now
            var actionItem = {
                type: 'item',
                action: action
            };
            _addItemGroupAndDivider(currentTree, actionItem, groups ? groups[groups.length - 1] : null);

            currentTree.items.push(actionItem);
        }

        var _createMenuItem = function (item, parentMenu) {
            if (item.type === 'menu') {
                item.menu = _createMenu(item, parentMenu);
            } else if (item.type === 'divider') {
                item.separator = gShell.addMenuSeparator(parentMenu);
            } else if (item.type === 'item') {
                item.item = gShell.addMenuItem(parentMenu,function () {
                    this.executeAction(item.action.getId());
                }.bind(this));
            }
        }.bind(this);

        // Initiate our menu structure now using our shell
        var _createMenu = function (tree, parentMenu) {
            var menu = gShell.addMenu(parentMenu, tree.caption, function () {
                for (var i = 0; i < tree.items.length; ++i) {
                    var item = tree.items[i];
                    if (item.type === 'item') {
                        gShell.updateMenuItem(item.item, gLocale.get(item.action.getTitle()),
                            item.action.isEnabled(), item.action.isChecked(), item.action.getShortcut());
                    }
                }
            });

            for (var i = 0; i < tree.items.length; ++i) {
                _createMenuItem(tree.items[i], menu);
            }

            return menu;
        };

        for (var i = 0; i < treeRoot.items.length; ++i) {
            var item = treeRoot.items[i];
            var menu = _createMenu(treeRoot.items[i], null);

            // Save window menu
            if (item.windowMenu) {
                this._windowMenu = menu;

                // Make sure to append an ending divider for windows
                gShell.addMenuSeparator(this._windowMenu);
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
                this._addWindowMenuItem(evt.window);
                break;
            case EXWindows.WindowEvent.Type.Removed:
                this._removeWindowMenuItem(evt.window);
                break;
            case EXWindows.WindowEvent.Type.Activated:
                this._updateWindowMenuItem(evt.window);
                this._toolManager.setView(evt.window.getView());
                break;
            case EXWindows.WindowEvent.Type.Deactivated:
                this._updateWindowMenuItem(evt.window);
                this._toolManager.setView(null);
                break;
            default:
                break;
        }
    };

    /**
     * @param {EXWindow} window
     * @private
     */
    EXApplication.prototype._addWindowMenuItem = function (window) {
        this._windowMenuMap.push({
            window : window,
            item : gShell.addMenuItem(this._windowMenu, function () {
                this._windows.activateWindow(window);
            }.bind(this))
        });
        this._updateWindowMenuItem(window);
    };

    /**
     * @param {EXWindow} window
     * @private
     */
    EXApplication.prototype._removeWindowMenuItem = function (window) {
        for (var i = 0; i < this._windowMenuMap.length; ++i) {
            var map = this._windowMenuMap[i];
            if (map.window === window) {
                gShell.removeMenuItem(this._windowMenu, map.item);
                this._windowMenuMap.splice(i, 1);
                break;
            }
        }
    };

    /**
     * @param {EXWindow} window
     * @private
     */
    EXApplication.prototype._updateWindowMenuItem = function (window) {
        for (var i = 0; i < this._windowMenuMap.length; ++i) {
            var map = this._windowMenuMap[i];
            if (map.window === window) {
                gShell.updateMenuItem(map.item, map.window.getTitle(), true, map.window === this._windows.getActiveWindow(), null);
                break;
            }
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

    _.EXApplication = EXApplication;
})(this);
