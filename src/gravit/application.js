(function (_) {
    /**
     * The global application class
     * @class GApplication
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GApplication() {
        this._actions = [];
        this._toolManager = new IFToolManager();
        this._documents = [];
        this._windowMenuMap = [];

        document.addEventListener("touchstart", this._touchHandler, true);
        document.addEventListener("touchmove", this._touchHandler, true);
        document.addEventListener("touchend", this._touchHandler, true);
        document.addEventListener("touchcancel", this._touchHandler, true);

        // This is a hack to focus our active window
        // whenever a key is hit down (in capture phase) and
        // if not an editable element is active!
        document.addEventListener('keydown', function (evt) {
            var activeWindow = this._windows.getActiveWindow();
            if (activeWindow && (!document.activeElement || !$(document.activeElement).is(":editable"))) {
                activeWindow.getView().focus();
            }
        }.bind(this), false);

        // Prevent context-menu globally except for editable elements
        document.addEventListener('contextmenu', function (evt) {
            if (!$(evt.target).is(':editable')) {
                evt.preventDefault();
                return false;
            } else {
                // Stop propagation to let browser handle the event
                evt.stopPropagation();
                return true;
            }
        }, true);
    };
    IFObject.inherit(GApplication, GEventTarget);

    // Constants for pre-defined action categories
    GApplication.CATEGORY_FILE = new IFLocale.Key(GApplication, "category.file");
    GApplication.CATEGORY_FILE_OPEN = new IFLocale.Key(GApplication, "category.file.open");
    GApplication.CATEGORY_FILE_SAVEAS = new IFLocale.Key(GApplication, "category.file.saveas");
    GApplication.CATEGORY_FILE_IMPORT = new IFLocale.Key(GApplication, "category.file.import");
    GApplication.CATEGORY_FILE_EXPORT = new IFLocale.Key(GApplication, "category.file.export");
    GApplication.CATEGORY_EDIT = new IFLocale.Key(GApplication, "category.edit");
    GApplication.CATEGORY_MODIFY = new IFLocale.Key(GApplication, "category.modify");
    GApplication.CATEGORY_MODIFY_ARRANGE = new IFLocale.Key(GApplication, "category.modify.arrange");
    GApplication.CATEGORY_MODIFY_ALIGN = new IFLocale.Key(GApplication, "category.modify.align");
    GApplication.CATEGORY_MODIFY_TRANSFORM = new IFLocale.Key(GApplication, "category.modify.transform");
    GApplication.CATEGORY_MODIFY_PAGE = new IFLocale.Key(GApplication, "category.modify.page");
    GApplication.CATEGORY_MODIFY_LAYER = new IFLocale.Key(GApplication, "category.modify.layer");
    GApplication.CATEGORY_VIEW = new IFLocale.Key(GApplication, "category.view");
    GApplication.CATEGORY_VIEW_MAGNIFICATION = new IFLocale.Key(GApplication, "category.view.magnification");
    GApplication.CATEGORY_WINDOW = new IFLocale.Key(GApplication, "category.window");
    GApplication.CATEGORY_HELP = new IFLocale.Key(GApplication, "category.help");

    // Constants for pre-defined tool categories
    GApplication.TOOL_CATEGORY_SELECT = new IFLocale.Key(GApplication, "tool-category.select");
    GApplication.TOOL_CATEGORY_IMAGE = new IFLocale.Key(GApplication, "tool-category.image");
    GApplication.TOOL_CATEGORY_VECTOR = new IFLocale.Key(GApplication, "tool-category.vector");
    GApplication.TOOL_CATEGORY_WEB = new IFLocale.Key(GApplication, "tool-category.web");
    GApplication.TOOL_CATEGORY_COLOR = new IFLocale.Key(GApplication, "tool-category.color");
    GApplication.TOOL_CATEGORY_VIEW = new IFLocale.Key(GApplication, "tool-category.view");

    /**
     * Visual parts of the application
     */
    GApplication.Part = {
        Header: {
            id: "header"
        },
        Toolbar: {
            id: "toolbar"
        },
        Sidebars: {
            id: "sidebars"
        },
        Windows: {
            id: "windows"
        },
        Palettes: {
            id: "palettes"
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GApplication.DocumentEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a document event occurrs
     * @class GApplication.DocumentEvent
     * @extends GEvent
     * @constructor
     */
    GApplication.DocumentEvent = function (type, document) {
        this.type = type;
        this.document = document;
    };
    IFObject.inherit(GApplication.DocumentEvent, GEvent);

    /**
     * Enumeration of view event types
     * @enum
     */
    GApplication.DocumentEvent.Type = {
        Added: 0,
        Removed: 1,
        Deactivated: 10,
        Activated: 11,
        UrlUpdated: 12
    };

    /**
     * @type {GApplication.DocumentEvent.Type}
     */
    GApplication.DocumentEvent.prototype.type = null;

    /**
     * The affected document
     * @type {GDocument}
     */
    GApplication.DocumentEvent.prototype.document = null;

    /** @override */
    GApplication.DocumentEvent.prototype.toString = function () {
        return "[Object GApplication.DocumentEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GApplication Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {boolean}
     * @private
     */
    GApplication.prototype._initialized = false;

    /**
     * @type {IFToolManager}
     * @private
     */
    GApplication.prototype._toolManager = null;

    /**
     * @type {number}
     * @private
     */
    GApplication.prototype._documentUntitledCount = 0;

    /**
     * @type {Array<GDocument>}
     * @private
     */
    GApplication.prototype._documents = null;

    /**
     * @type {GDocument}
     * @private
     */
    GApplication.prototype._activeDocument = null;

    /**
     * @type {JQuery}
     * @private
     */
    GApplication.prototype._view = null;

    /**
     * @type {GHeader}
     * @private
     */
    GApplication.prototype._header = null;

    /**
     * @type {GToolbar}
     * @private
     */
    GApplication.prototype._toolbar = null;

    /**
     * @type {GSidebars}
     * @private
     */
    GApplication.prototype._sidebars = null;

    /**
     * @type {GWindows}
     * @private
     */
    GApplication.prototype._windows = null;

    /**
     * @type {GPalettes}
     * @private
     */
    GApplication.prototype._palettes = null;

    /**
     * @type {Number}
     * @private
     */
    GApplication.prototype._resizeTimerId = null;


    /**
     * Array of registered actions
     * @type {Array<GAction>}
     * @private
     */
    GApplication.prototype._actions = null;

    /**
     * Application window shell menu
     * @type {*}
     * @private
     */
    GApplication.prototype._windowMenu = null;

    /**
     * @type {Array<{window: GWindow, item: *}>}
     * @private
     */
    GApplication.prototype._windowMenuMap = null;

    /**
     * @returns {IFToolManager}
     */
    GApplication.prototype.getToolManager = function () {
        return this._toolManager;
    };

    /**
     * Returns a list of all opened documents
     * @return {Array<GDocument>}
     */
    GApplication.prototype.getDocuments = function () {
        return this._documents;
    };

    /**
     * Returns the currently active document
     * @return {GDocument}
     */
    GApplication.prototype.getActiveDocument = function () {
        return this._activeDocument ? this._activeDocument : null;
    };

    /**
     * Return access to the header
     * @returns {GHeader}
     */
    GApplication.prototype.getHeader = function () {
        return this._header;
    };

    /**
     * Return access to the toolbar
     * @returns {GToolbar}
     */
    GApplication.prototype.getToolbar = function () {
        return this._toolbar;
    };

    /**
     * Return access to the sidebars
     * @returns {GSidebars}
     */
    GApplication.prototype.getSidebars = function () {
        return this._sidebars;
    };

    /**
     * Return access to the window container
     * @returns {GWindows}
     */
    GApplication.prototype.getWindows = function () {
        return this._windows;
    };

    /**
     * Return access to the palettes container
     * @returns {GPalettes}
     */
    GApplication.prototype.getPalettes = function () {
        return this._palettes;
    };

    /**
     * Checks if a given part is visible or not
     * @param {GApplication.Part} part the part to check for
     * @returns {boolean} true if part is visible, false if not
     */
    GApplication.prototype.isPartVisible = function (part) {
        return this.getPart(part).css('display') !== 'none';
    };

    /**
     * Make a given part visible or not
     * @param {GApplication.Part} part the part
     * @param visible whether to make the part visible or not
     */
    GApplication.prototype.setPartVisible = function (part, visible) {
        if (visible != this.isPartVisible(part)) {
            this.getPart(part).css('display', (visible ? 'block' : 'none'));
        }
    };

    /**
     * Return reference to a given part
     * @param {GApplication.Part} part
     * @returns {JQuery}
     */
    GApplication.prototype.getPart = function (part) {
        return this._view.find('#' + part.id);
    };

    /**
     * Get a list of all registered actions
     * @return {Array<GAction>} list of registered actions
     */
    GApplication.prototype.getActions = function () {
        return this._actions;
    };

    /**
     * Get an action instance by it's given id
     * @param {String} id
     */
    GApplication.prototype.getAction = function (id) {
        for (var i = 0; i < this._actions.length; ++i) {
            if (this._actions[i].getId() === id) {
                return this._actions[i];
            }
        }
        return null;
    };

    /**
     * Returns the storage for a given url by it's protocol
     * @param {String} url
     * @return {GStorage}
     */
    GApplication.prototype.getStorage = function (url) {
        var protocol = new URI(url).protocol();
        if (protocol && protocol.length) {
            for (var i = 0; i < gravit.storages.length; ++i) {
                if (gravit.storages[i].getProtocol() === protocol) {
                    return gravit.storages[i];
                }
            }
        }
        return null;
    };

    /**
     * Create a new document and add it
     */
    GApplication.prototype.createNewDocument = function () {
        // Create scene, add it and call add page to insert a default page
        var scene = new IFScene();
        scene.setProperty('unit', IFLength.Unit.PX);
        var document = this.addDocument(scene);
        document.createNewPage(true/*no-undo*/);
    };

    /**
     * Add a new document and open up a window for it
     * and mark the view as being active
     * @param {IFScene} scene the scene to add the document from it
     * @param {String} [temporaryTitle] optional temporary title to be used
     * for the document if no url is assigned, defaults to null to use
     * the default naming scheme
     */
    GApplication.prototype.addDocument = function (scene, temporaryTitle) {
        // TODO : I18N
        var document = new GDocument(scene, null, temporaryTitle ? temporaryTitle : 'Untitled-' + (++this._documentUntitledCount).toString());
        this._addDocument(document);
        return document;
    };

    /**
     * Open a document and open up a window for it
     * and mark the view as being active
     * @param {String} url the url to open the document from
     */
    GApplication.prototype.openDocument = function (url) {
        // Iterate all documents first and look if the given
        // url is already opened and if so, activate the
        // document's last view
        var documentAlreadyOpened = false;
        for (var i = 0; i < this._documents.length; ++i) {
            var document = this._documents[i];
            if (document.getUrl() === url) {
                this.activateDocument(document);
                documentAlreadyOpened = true;
            }
        }

        if (!documentAlreadyOpened) {
            var storage = this.getStorage(url);
            if (storage) {
                storage.load(url, true, function (data, name) {
                    var scene = new IFScene();
                    var document = new GDocument(scene, url, name);
                    try {
                        var source = pako.inflate(new Uint8Array(data), { to: 'string' });
                        var blob = JSON.parse(source);
                        if (!scene.restore(blob)) {
                            throw new Error('Failure.');
                        }
                    } catch (e) {
                        document.close();
                        scene = null;
                        document = null;
                        console.log(e);
                        alert('An error has ocurred while trying to open the document.');
                    }

                    if (document) {
                        this._addDocument(document);
                    }
                }.bind(this));
            }
        }
    };

    /**
     * Prompt to save a document under a new target
     * @param {GStorage} storage
     * @param {GDocument} [document] the document to save as, if
     * not provided takes the currently active one
     */
    GApplication.prototype.saveDocumentAs = function (storage, document) {
        var document = document || this.getActiveDocument();

        if (document) {
            // TODO : Set first parameter 'reference'
            storage.savePrompt(null, document.getTitle(), 'gravit', function (url) {
                document.setUrl(url)
                document.save();

                // Update all view window menu items
                var windows = document.getWindows();
                for (var i = 0; i < windows.length; ++i) {
                    this._updateWindowMenuItem(windows[i]);
                }

                // Trigger event
                if (this.hasEventListeners(GApplication.DocumentEvent)) {
                    this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.UrlUpdated, this));
                }
            }.bind(this));
        }
    };

    /**
     * Mark a given document as being the active one and activates
     * the first window for the document as well
     * @param {GDocument} document may be null to only deactivate the current one
     * @param {boolean} [noWindowActivation] optional param that, if set, avoids
     * activating the corresponding window when the document gets activated
     */
    GApplication.prototype.activateDocument = function (document, noWindowActivation) {
        if (document != this._activeDocument) {
            // Deactivate previous one if any
            if (this._activeDocument) {
                if (this._activeDocument) {
                    this._activeDocument.deactivate();

                    if (this.hasEventListeners(GApplication.DocumentEvent)) {
                        this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.Deactivated, this._activeDocument));
                    }
                }

                this._activeDocument = null;
            }

            // Activate new one if any
            if (document) {
                // Activate lastly activated window of document
                if (!noWindowActivation) {
                    this._windows.activateWindow(document.getActiveWindow());
                }

                document.activate();

                // Now assign the active document
                this._activeDocument = document;

                if (this.hasEventListeners(GApplication.DocumentEvent)) {
                    this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.Activated, document));
                }
            }
        }
    };

    /**
     * Closes and removes a document and all of it's views
     * @param {GDocument} document
     */
    GApplication.prototype.closeDocument = function (document) {
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

            // Release document
            document.release();

            // Remove and trigger event
            this._documents.splice(this._documents.indexOf(document), 1);

            if (this.hasEventListeners(GApplication.DocumentEvent)) {
                this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.Removed, document));
            }
        }
    };

    /**
     * Execute a given action
     * @param {String} id id of the action to execute
     * @param {*} [args] optional args to be supplied to the action
     * @return {*} the result of the action if any
     */
    GApplication.prototype.executeAction = function (id, args) {
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
    GApplication.prototype.init = function () {
        var body = $('body');

        // Iterate modules and let each one initialize
        for (var i = 0; i < gravit.modules.length; ++i) {
            var module = gravit.modules[i];
            console.log("Init module <" + module.toString() + ">");
            module.init();
        }

        this._view = $("<div></div>")
            .attr('id', 'workspace')
            .css('display', 'none')
            .prependTo(body);

        // Windows-Part
        var windowsPart = $("<div></div>")
            .attr('id', GApplication.Part.Windows.id)
            .appendTo(this._view);

        this._windows = new GWindows(windowsPart);

        // Header-Part
        var headerPart = $("<div></div>")
            .attr('id', GApplication.Part.Header.id)
            .appendTo(this._view);

        this._header = new GHeader(headerPart);

        // Toolbar-Part
        var toolbarPart = $("<div></div>")
            .attr('id', GApplication.Part.Toolbar.id)
            .appendTo(this._view);

        this._toolbar = new GToolbar(toolbarPart);

        // Sidebars-Part
        var sidebarsPart = $("<div></div>")
            .attr('id', GApplication.Part.Sidebars.id)
            .appendTo(this._view);

        this._sidebars = new GSidebars(sidebarsPart);

        // Palettes-Part
        var palettesPart = $("<div></div>")
            .attr('id', GApplication.Part.Palettes.id)
            .appendTo(this._view);

        this._palettes = new GPalettes(palettesPart);

        // Append the corresponding hardware class to our body
        switch (ifSystem.hardware) {
            case IFSystem.Hardware.Desktop:
                body.addClass('g-desktop');
                break;
            case IFSystem.Hardware.Tablet:
                body.addClass('g-touch');
                body.addClass('g-tablet');
                break;
            case IFSystem.Hardware.Phone:
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

        // Add all available tools to toolmanager and register
        // their activation character(s) if any as shortcuts
        if (gravit.tools) {
            var _createToolActivateAction = function (instance) {
                return function () {
                    this._toolManager.activateTool(instance);
                }.bind(this);
            }.bind(this);

            for (var i = 0; i < gravit.tools.length; ++i) {
                var tool = gravit.tools[i];

                // Register tool instance
                this._toolManager.addTool(tool.instance);

                // Register activation characters
                if (tool.keys && tool.keys.length > 0) {
                    var action = _createToolActivateAction(tool.instance);
                    for (var c = 0; c < tool.keys.length; ++c) {
                        this.registerShortcut([tool.keys[c]], action);
                    }
                }
            }
        }

        this._header.init();
        this._toolbar.init();
        this._sidebars.init();
        this._windows.init();
        this._palettes.init();

        // Hide sidebars by default - TODO : Load & save view configuration here
        this.setPartVisible(GApplication.Part.Sidebars, false);

        // Make workspace visible & make initial layout
        this._view.css('display', '');

        // Mark initialized
        this._initialized = true;

        // Subscribe to window events
        this._windows.addEventListener(GWindows.WindowEvent, this._windowEvent, this);
    };

    /**
     * Called to relayout the application
     */
    GApplication.prototype.relayout = function () {
        if (!this._initialized) {
            // ignore
            return;
        }

        setTimeout(function () {
            var topOffset = 0;
            var leftOffset = 0;
            var rightOffset = 0;
            var bottomOffset = 0;

            var headerPart = this.getPart(GApplication.Part.Header);
            topOffset += this.isPartVisible(GApplication.Part.Header) ? headerPart.outerHeight() : 0;

            var toolbarPart = this.getPart(GApplication.Part.Toolbar);
            toolbarPart.css('top', topOffset.toString() + 'px');
            toolbarPart.height(this._view.height() - topOffset);
            leftOffset += this.isPartVisible(GApplication.Part.Toolbar) ? toolbarPart.outerWidth() : 0;

            var sidebarsPart = this.getPart(GApplication.Part.Sidebars);
            sidebarsPart.css('top', topOffset.toString() + 'px');
            sidebarsPart.css('left', (this.isPartVisible(GApplication.Part.Toolbar) ? toolbarPart.outerWidth() : 0).toString() + 'px');
            sidebarsPart.height(this._view.height() - topOffset);
            leftOffset += this.isPartVisible(GApplication.Part.Sidebars) ? sidebarsPart.outerWidth() : 0;

            var palettesPart = this.getPart(GApplication.Part.Palettes);
            palettesPart.css('top', topOffset.toString() + 'px');
            palettesPart.height(this._view.height() - topOffset);
            rightOffset += this.isPartVisible(GApplication.Part.Palettes) ? palettesPart.outerWidth() : 0;

            this._header.relayout();
            this._toolbar.relayout();
            this._sidebars.relayout();
            this._windows.relayout([leftOffset, topOffset, rightOffset, bottomOffset]);
            this._palettes.relayout();
        }.bind(this), 0);
    };

    /**
     * Register a shortcut that'll execute a given function
     * @param {Array<*>} shortcut the shortcut for the action
     * @param {Function} action an action to be executed when the
     * shortcut is called
     */
    GApplication.prototype.registerShortcut = function (shortcut, action) {
        Mousetrap.bind(this._shortcutToMouseTrapShortcut(shortcut), function () {
            action();
            return false;
        }.bind(this));
    };

    /**
     * Add a new document
     * @param {GDocument} document
     * @private
     */
    GApplication.prototype._addDocument = function (document) {
        // Send an event
        if (this.hasEventListeners(GApplication.DocumentEvent)) {
            this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.Added, document));
        }

        // Add a window for the document making it activated by default
        this._windows.addWindow(document);
    };

    /**
     * Create the main menu based on actions
     * @param {Array<GAction>} actions
     * @private
     */
    GApplication.prototype._createMainMenu = function () {
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

            var category = ifLocale.get(action.getCategory());
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
                            windowMenu: GApplication.CATEGORY_WINDOW === action.getCategory() &&
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
                item.item = gShell.addMenuItem(parentMenu, ifLocale.get(item.action.getTitle()), item.action.isCheckable(), item.action.getShortcut(),
                    function () {
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
                        gShell.updateMenuItem(item.item, ifLocale.get(item.action.getTitle()),
                            item.action.isEnabled(), item.action.isCheckable() ? item.action.isChecked() : false);
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
     * @param {GWindows.WindowEvent} evt
     * @private
     */
    GApplication.prototype._windowEvent = function (evt) {
        switch (evt.type) {
            case GWindows.WindowEvent.Type.Added:
                this._addWindowMenuItem(evt.window);
                break;
            case GWindows.WindowEvent.Type.Removed:
                this._removeWindowMenuItem(evt.window);
                break;
            case GWindows.WindowEvent.Type.Activated:
                this._updateWindowMenuItem(evt.window);
                this._toolManager.setView(evt.window.getView());
                break;
            case GWindows.WindowEvent.Type.Deactivated:
                this._updateWindowMenuItem(evt.window);
                this._toolManager.setView(null);
                break;
            default:
                break;
        }
    };

    /**
     * @param {GWindow} window
     * @private
     */
    GApplication.prototype._addWindowMenuItem = function (window) {
        this._windowMenuMap.push({
            window: window,
            item: gShell.addMenuItem(this._windowMenu, window.getTitle(), true, null, function () {
                this._windows.activateWindow(window);
            }.bind(this))
        });
        this._updateWindowMenuItem(window);
    };

    /**
     * @param {GWindow} window
     * @private
     */
    GApplication.prototype._removeWindowMenuItem = function (window) {
        for (var i = 0; i < this._windowMenuMap.length; ++i) {
            var map = this._windowMenuMap[i];
            if (map.window === window) {
                gShell.removeMenuItem(this._windowMenu, map.item);
                this._windowMenuMap.splice(i, 1);
                break;
            }
        }
        this._updateTitle();
    };

    /**
     * @param {GWindow} window
     * @private
     */
    GApplication.prototype._updateWindowMenuItem = function (window) {
        for (var i = 0; i < this._windowMenuMap.length; ++i) {
            var map = this._windowMenuMap[i];
            if (map.window === window) {
                gShell.updateMenuItem(map.item, map.window.getTitle(), true, map.window === this._windows.getActiveWindow());
                break;
            }
        }
        this._updateTitle();
    };

    GApplication.prototype._updateTitle = function () {
        var title = 'Gravit';
        var window = this.getWindows().getActiveWindow();
        if (window) {
            title += ' - ' + window.getTitle();
        }
        document.title = title;
    }

    /**
     * Handle touch events by converting them into mouse events and stopping
     * every further propagation to guarantee mouse events not being fired twice
     * @private
     */
    GApplication.prototype._touchHandler = function (event) {
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
     * Convert internal key into a mousetrap-compatible key
     * @param {Array<*>} shortcut
     * @returns {String}
     */
    GApplication.prototype._shortcutToMouseTrapShortcut = function (shortcut) {
        var result = "";
        for (var i = 0; i < shortcut.length; ++i) {
            if (i > 0) {
                result += "+";
            }

            var key = shortcut[i];
            if (typeof key == 'number') {
                switch (key) {
                    case IFKey.Constant.META:
                        result += "meta";
                        break;
                    case IFKey.Constant.OPTION:
                        result += "option";
                        break;
                    case IFKey.Constant.REMOVE:
                        result += "del";
                        break;
                    case IFKey.Constant.SPACE:
                        result += "space";
                        break;
                    case IFKey.Constant.ENTER:
                        result += "enter";
                        break;
                    case IFKey.Constant.TAB:
                        result += "tab";
                        break;
                    case IFKey.Constant.BACKSPACE:
                        result += "backspace";
                        break;
                    case IFKey.Constant.CONTROL:
                        result += "ctrl";
                        break;
                    case IFKey.Constant.SHIFT:
                        result += "shift";
                        break;
                    case IFKey.Constant.ALT:
                        result += "alt";
                        break;
                    case IFKey.Constant.LEFT:
                        result += "left";
                        break;
                    case IFKey.Constant.UP:
                        result += "up";
                        break;
                    case IFKey.Constant.RIGHT:
                        result += "right";
                        break;
                    case IFKey.Constant.DOWN:
                        result += "down";
                        break;
                    case IFKey.Constant.PAGE_UP:
                        result += "pageup";
                        break;
                    case IFKey.Constant.PAGE_DOWN:
                        result += "pagedown";
                        break;
                    case IFKey.Constant.HOME:
                        result += "home";
                        break;
                    case IFKey.Constant.END:
                        result += "end";
                        break;
                    case IFKey.Constant.INSERT:
                        result += "ins";
                        break;
                    case IFKey.Constant.DELETE:
                        result += "del";
                        break;
                    case IFKey.Constant.COMMAND:
                        result += "meta";
                        break;
                    case IFKey.Constant.F1:
                        result += "f1";
                        break;
                    case IFKey.Constant.F2:
                        result += "f2";
                        break;
                    case IFKey.Constant.F3:
                        result += "f3";
                        break;
                    case IFKey.Constant.F4:
                        result += "f4";
                        break;
                    case IFKey.Constant.F5:
                        result += "f5";
                        break;
                    case IFKey.Constant.F6:
                        result += "f6";
                        break;
                    case IFKey.Constant.F7:
                        result += "f7";
                        break;
                    case IFKey.Constant.F8:
                        result += "f8";
                        break;
                    case IFKey.Constant.F9:
                        result += "f9";
                        break;
                    case IFKey.Constant.F10:
                        result += "f10";
                        break;
                    case IFKey.Constant.F11:
                        result += "f11";
                        break;
                    case IFKey.Constant.F12:
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

    _.GApplication = GApplication;
})(this);
