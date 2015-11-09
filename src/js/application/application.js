(function (_) {
    var LOADER_CODE = '<div style="position: absolute; left: 0px; top: 0px; right: 0px; bottom: 0px; background: rgb(213, 223, 0);">\n    <style type="text/css">\n        .spinner {\n            width: 120px;\n            height: 120px;\n            position: absolute;\n            top: 50%;\n            left: 50%;\n            margin: -80px 0 0 -60px;\n            text-align: center;\n            -webkit-animation: rotate 2.0s infinite linear;\n            animation: rotate 2.0s infinite linear;\n        }\n\n        .spinner-dot1, .spinner-dot2 {\n            width: 60%;\n            height: 60%;\n            display: inline-block;\n            position: absolute;\n            top: 0;\n            background-color: rgb(229, 71, 97);\n            border-radius: 100%;\n            -webkit-animation: bounce 2.0s infinite ease-in-out;\n            animation: bounce 2.0s infinite ease-in-out;\n        }\n\n        .spinner-dot1 {\n            top: auto;\n            bottom: 0px;\n            -webkit-animation-delay: -1.0s;\n            animation-delay: -1.0s;\n        }\n\n        @-webkit-keyframes rotate { 100% { -webkit-transform: rotate(360deg) }}\n        @keyframes rotate { 100% { transform: rotate(360deg); -webkit-transform: rotate(360deg) }}\n\n        @-webkit-keyframes bounce {\n            0%, 100% { -webkit-transform: scale(0.0) }\n            50% { -webkit-transform: scale(1.0) }\n        }\n\n        @keyframes bounce {\n            0%, 100% {\n                transform: scale(0.0);\n                -webkit-transform: scale(0.0);\n            } 50% {\n                  transform: scale(1.0);\n                  -webkit-transform: scale(1.0);\n              }\n        }\n    </style>\n    <div class="spinner">\n        <div class="spinner-dot1"></div>\n        <div class="spinner-dot2"></div>\n    </div>\n</div>';

    var FONTS = [
        {
            family: 'Open Sans',
            category: GFont.Category.Serif,
            substitutes: [
                {style: GFont.Style.Normal, weight: GFont.Weight.Light, url: 'assets/application/font/OpenSans-Light.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Light, url: 'assets/application/font/OpenSans-LightItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.Regular, url: 'assets/application/font/OpenSans-Regular.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Regular, url: 'assets/application/font/OpenSans-Italic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.SemiBold, url: 'assets/application/font/OpenSans-Semibold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.SemiBold, url: 'assets/application/font/OpenSans-SemiboldItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.Bold, url: 'assets/application/font/OpenSans-Bold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.Bold, url: 'assets/application/font/OpenSans-BoldItalic.ttf'},
                {style: GFont.Style.Normal, weight: GFont.Weight.ExtraBold, url: 'assets/application/font/OpenSans-ExtraBold.ttf'},
                {style: GFont.Style.Italic, weight: GFont.Weight.ExtraBold, url: 'assets/application/font/OpenSans-ExtraBoldItalic.ttf'}
            ]
        },
        {
            family: 'Source Sans Pro',
            category: GFont.Category.Serif,
            substitutes: [
                {style: GFont.Style.Normal, weight: GFont.Weight.Regular, url: 'assets/application/font/SourceSansPro-Regular.ttf'}
            ]
        }
    ];

    /**
     * The global application class
     * @class GApplication
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GApplication() {
        this._actions = [];
        this._toolManager = new GToolManager();
        this._projects = [];
        this._documents = [];

        document.addEventListener("touchstart", this._touchHandler, true);
        document.addEventListener("touchmove", this._touchHandler, true);
        document.addEventListener("touchend", this._touchHandler, true);
        document.addEventListener("touchcancel", this._touchHandler, true);

        // This is a hack to focus our active window
        // whenever a key is hit down (in capture phase) and
        // if not an editable element is active!
        document.addEventListener('keydown', function (evt) {
            if (document.activeElement && $(document.activeElement).is(":button") &&
                (event.keyCode == 13 || event.keyCode == 32)) {

                // By default Enter and Space keys fire up 'onclick' mouse event for active element
                // We use this trick to disable this default behavior for panel buttons,
                // which have been just pressed and released before Space or Enter has been pressed
                event.preventDefault();
                document.activeElement.blur();
            }

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
    GObject.inherit(GApplication, GEventTarget);

    // Constants for pre-defined action categories
    GApplication.CATEGORY_FILE = new GLocale.Key(GApplication, "category.file");
    GApplication.CATEGORY_EDIT = new GLocale.Key(GApplication, "category.edit");
    GApplication.CATEGORY_MODIFY = new GLocale.Key(GApplication, "category.modify");
    GApplication.CATEGORY_MODIFY_ARRANGE = new GLocale.Key(GApplication, "category.modify.arrange");
    GApplication.CATEGORY_MODIFY_ALIGN = new GLocale.Key(GApplication, "category.modify.align");
    GApplication.CATEGORY_MODIFY_TRANSFORM = new GLocale.Key(GApplication, "category.modify.transform");
    GApplication.CATEGORY_MODIFY_PATH = new GLocale.Key(GApplication, "category.modify.path");
    GApplication.CATEGORY_MODIFY_LAYER = new GLocale.Key(GApplication, "category.modify.layer");
    GApplication.CATEGORY_VIEW = new GLocale.Key(GApplication, "category.view");
    GApplication.CATEGORY_VIEW_MAGNIFICATION = new GLocale.Key(GApplication, "category.view.magnification");
    GApplication.CATEGORY_HELP = new GLocale.Key(GApplication, "category.help");

    // Constants for pre-defined tool categories
    GApplication.TOOL_CATEGORY_SELECT = new GLocale.Key(GApplication, "tool-category.select");
    GApplication.TOOL_CATEGORY_IMAGE = new GLocale.Key(GApplication, "tool-category.image");
    GApplication.TOOL_CATEGORY_VECTOR = new GLocale.Key(GApplication, "tool-category.vector");
    GApplication.TOOL_CATEGORY_OTHER = new GLocale.Key(GApplication, "tool-category.other");
    GApplication.TOOL_CATEGORY_COLOR = new GLocale.Key(GApplication, "tool-category.color");
    GApplication.TOOL_CATEGORY_VIEW = new GLocale.Key(GApplication, "tool-category.view");

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
        Panels: {
            id: "panels"
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
    // GApplication.ProjectEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event whenever a project event occurrs
     * @class GApplication.ProjectEvent
     * @extends GEvent
     * @constructor
     */
    GApplication.ProjectEvent = function (type, project) {
        this.type = type;
        this.project = project;
    };
    GObject.inherit(GApplication.ProjectEvent, GEvent);

    /**
     * Enumeration of project event types
     * @enum
     */
    GApplication.ProjectEvent.Type = {
        Added: 0,
        Removed: 1,
        Deactivated: 10,
        Activated: 11
    };

    /**
     * @type {GApplication.ProjectEvent.Type}
     */
    GApplication.ProjectEvent.prototype.type = null;

    /**
     * The affected project
     * @type {Project}
     */
    GApplication.ProjectEvent.prototype.project = null;

    /** @override */
    GApplication.ProjectEvent.prototype.toString = function () {
        return "[Object GApplication.ProjectEvent]";
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
    GObject.inherit(GApplication.DocumentEvent, GEvent);

    /**
     * Enumeration of document event types
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
     * @type {JQuery}
     * @private
     */
    GApplication.prototype._loader = null;

    /**
     * @type {boolean}
     * @private
     */
    GApplication.prototype._initialized = false;

    /**
     * @type {GToolManager}
     * @private
     */
    GApplication.prototype._toolManager = null;

    /**
     * @type {Array<GProject>}
     * @private
     */
    GApplication.prototype._projects = null;

    /**
     * @type {GProject}
     * @private
     */
    GApplication.prototype._activeProject = null;

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
     * @type {GPanels}
     * @private
     */
    GApplication.prototype._panels = null;

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
     * Source document title
     * @type {String}
     * @private
     */
    GApplication.prototype._sourceTitle = null;

    /**
     * @returns {GToolManager}
     */
    GApplication.prototype.getToolManager = function () {
        return this._toolManager;
    };

    /**
     * Returns a list of all opened projects
     * @return {Array<GProject>}
     */
    GApplication.prototype.getProjects = function () {
        return this._projects;
    };

    /**
     * Returns the currently active project
     * @return {GProject}
     */
    GApplication.prototype.getActiveProject = function () {
        return this._activeProject ? this._activeProject : null;
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
     * Return access to the panels
     * @returns {GPanels}
     */
    GApplication.prototype.getPanels = function () {
        return this._panels;
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
            this.relayout();
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
     * Add a new project and mark it as being active
     * @param {GProject} project the project to add
     */
    GApplication.prototype.addProject = function (project) {
        // Add the project
        this._projects.push(project);

        // Send an event
        if (this.hasEventListeners(GApplication.ProjectEvent)) {
            this.trigger(new GApplication.ProjectEvent(GApplication.ProjectEvent.Type.Added, project));
        }

        // Mark it being active
        this.activateProject(project);
    };

    /**
     * Activates a project
     * @param {GProject} project the project to be activated, maybe
     * null to deactivate the current project
     */
    GApplication.prototype.activateProject = function (project) {
        if (project != this._activeProject) {
            // Deactivate previous one if any
            if (this._activeProject) {
                if (this._activeProject) {
                    this._activeProject.deactivate();

                    if (this.hasEventListeners(GApplication.ProjectEvent)) {
                        this.trigger(new GApplication.ProjectEvent(GApplication.ProjectEvent.Type.Deactivated, this._activeProject));
                    }
                }

                this._activeProject = null;
            }

            // Activate new one if any
            if (project) {
                project.activate();

                // Now assign the active project
                this._activeProject = project;

                if (this.hasEventListeners(GApplication.ProjectEvent)) {
                    this.trigger(new GApplication.ProjectEvent(GApplication.ProjectEvent.Type.Activated, project));
                }
            }
        }
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
     * Tries to find the best matching storage for the given parameters
     * @param {Boolean} prompt if true, the storage must support prompting
     * @param {Boolean} save if true, the storage must support saving
     * @param {String} [extension] if set, the storage must support the given
     * extension (ignored if directory is true), defaults to null which ignores this
     * @param {Boolean} [directory] if true, the storage must support directories,
     * defaults to false
     * @param {GStorage} [preferredStorage] if provided, will prefer this storage
     * when it fills all requirements. Defaults to null.
     */
    GApplication.prototype.getMatchingStorage = function (prompt, save, extension, directory, preferredStorage) {
        var storages = [];

        // Put preferred storage on top if any
        if (preferredStorage) {
            storages.push(preferredStorage);
        }

        // Add all storages to check
        for (var i = 0; i < gravit.storages.length; ++i) {
            var storage = gravit.storages[i];
            if (storage !== preferredStorage) {
                storages.push(storage);
            }
        }

        // Now iterate and find the best candidate if any
        for (var i = 0; i < storages.length; ++i) {
            var storage = storages[i];

            if (prompt && !storage.isPrompting()) {
                continue;
            }

            if (save && !storage.isSaving()) {
                continue;
            }

            if (extension && extension !== '') {
                var extensions = storage.getExtensions();
                if (extensions && extensions.length && extensions.indexOf(extension) < 0) {
                    continue;
                }
            }

            if (directory && !storage.isDirectory()) {
                continue;
            }

            return storage;
        }

        return null;
    };

    /**
     * Add a new document and open up a window for it
     * and mark the view as being active
     * @param {GScene} scene the scene to add the document from it
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
                    var _readDocument = function (source) {
                        var scene = new GScene();
                        var document = new GDocument(scene, url, name);
                        try {
                            var blob = JSON.parse(source);

                            if (!blob) {
                                throw new Error('Unable to parse JSON.');
                            }

                            GNode.restoreInstance(blob, scene);
                        } catch (e) {
                            document.release();
                            scene = null;
                            document = null;
                            console.log(e);
                            vex.dialog.alert('An error has ocurred while trying to open the document.');
                        }

                        if (document) {
                            this._addDocument(document);
                        }
                    }.bind(this);


                    var uint8Array = new Uint8Array(data);

                    // Test for gzip
                    if (uint8Array[0] === 0x1F && uint8Array[1] === 0x8B && uint8Array[2] === 0x08) {
                        var source = pako.ungzip(uint8Array, {to: 'string'});
                        _readDocument(source);
                    } else {
                        // Assume plain string
                        var f = new FileReader();
                        f.onload = function (e) {
                            _readDocument(e.target.result);
                        }
                        f.readAsText(new Blob([data]));
                    }
                }.bind(this));
            }
        }
    };

    /**
     * Prompt to open a document
     * @param {GStorage} storage
     */
    GApplication.prototype.openDocumentFrom = function (storage) {
        var url = gApp.getActiveDocument() ? gApp.getActiveDocument().getUrl() : null;
        storage.openResourcePrompt(url && url !== '' ? url : null, ['gravit'], function (url) {
            gApp.openDocument(url);
        });
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
            storage.saveResourcePrompt(null, document.getTitle(), 'gravit', function (url) {
                document.setUrl(url)
                document.save();

                // Trigger event
                if (this.hasEventListeners(GApplication.DocumentEvent)) {
                    this.trigger(new GApplication.DocumentEvent(GApplication.DocumentEvent.Type.UrlUpdated, document));
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
        var windows = document.getWindows().length;
        if (windows.length) {
            // Document has windows so remove them first which
            // will then trigger this function again
            while (windows.length > 0) {
                windows.closeWindow(windows[0]);
            }
        } else {
            // Remove active document if this is the active one
            if (document === this.getActiveDocument()) {
                this.activateDocument(null);
            }

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
     * Checks whether a given action can be executed or not
     * @param {String} id id of the action to check
     * @param {*} [args] optional args to be supplied to the action
     * @return {Boolean}
     */
    GApplication.prototype.canExecuteAction = function (id, args) {
        var actionInstance = this.getAction(id);

        if (actionInstance) {
            return actionInstance.isAvailable() && actionInstance.isEnabled.apply(actionInstance, args);
        }

        return false;
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
     * Called to prepare the app
     */
    GApplication.prototype.prepare = function () {
        this._loader = $(LOADER_CODE)
            .appendTo($('body'));
    };

    /**
     * Called to initialize the application
     * @return {*} a promise when the app is initialized
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

        // Panels-Part
        var panelsPart = $("<div></div>")
            .attr('id', GApplication.Part.Panels.id)
            .appendTo(this._view);

        this._panels = new GPanels(panelsPart);

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
        switch (GSystem.hardware) {
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

            this._windows.relayout();

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
        this._panels.init();
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

        // Font stuff
        var fontPromises = [];

        for (var i = 0; i < FONTS.length; ++i) {
            var font = FONTS[i];
            for (var k = 0; k < font.substitutes.length; ++k) {
                var substitute = font.substitutes[k];
                fontPromises.push(ifFont.addType(font.family, substitute.style, substitute.weight, substitute.url, font.category));
            }
        }

        return $.when.apply($, fontPromises);
    };

    /**
     * Called to start the app
     */
    GApplication.prototype.start = function () {
        this._loader.remove();
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
            // hack: remove 3px for border-top style
            toolbarPart.height(this._view.height() - topOffset - 3);
            leftOffset += this.isPartVisible(GApplication.Part.Toolbar) ? toolbarPart.outerWidth() : 0;

            var sidebarsPart = this.getPart(GApplication.Part.Sidebars);
            sidebarsPart.css('top', topOffset.toString() + 'px');
            sidebarsPart.css('left', leftOffset.toString() + 'px');
            sidebarsPart.height(this._view.height() - topOffset);
            leftOffset += this.isPartVisible(GApplication.Part.Sidebars) ? sidebarsPart.outerWidth() : 0;

            var palettesPart = this.getPart(GApplication.Part.Palettes);
            palettesPart.css('top', topOffset.toString() + 'px');
            palettesPart.height(this._view.height() - topOffset);
            rightOffset += this.isPartVisible(GApplication.Part.Palettes) ? palettesPart.outerWidth() : 0;

            var panelsPart = this.getPart(GApplication.Part.Panels);
            panelsPart.css('left', leftOffset.toString() + 'px');
            panelsPart.css('width', (this._view.width() - leftOffset - rightOffset).toString() + 'px');
            bottomOffset += this.isPartVisible(GApplication.Part.Panels) ? panelsPart.outerHeight() : 0;

            this._header.relayout();
            this._toolbar.relayout();
            this._panels.relayout();
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
        var window = this._windows.addWindow(document);
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
                            items: []
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
                item.separator = gHost.addMenuSeparator(parentMenu);
            } else if (item.type === 'item') {
                item.item = gHost.addMenuItem(parentMenu, ifLocale.get(item.action.getTitle()), item.action.isCheckable(), item.action.getShortcut(),
                    function () {
                        this.executeAction(item.action.getId());
                    }.bind(this));
            }
        }.bind(this);

        // Initiate our menu structure now using our shell
        var _createMenu = function (tree, parentMenu) {
            var menu = gHost.addMenu(parentMenu, tree.caption, function () {
                for (var i = 0; i < tree.items.length; ++i) {
                    var item = tree.items[i];
                    if (item.type === 'item') {
                        gHost.updateMenuItem(item.item, ifLocale.get(item.action.getTitle()),
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
        }
    };

    /**
     * @param {GWindows.WindowEvent} evt
     * @private
     */
    GApplication.prototype._windowEvent = function (evt) {
        switch (evt.type) {
            case GWindows.WindowEvent.Type.Added:
            case GWindows.WindowEvent.Type.Removed:
                this._updateTitle();
                break;
            case GWindows.WindowEvent.Type.Activated:
                this._toolManager.setView(evt.window.getView());
                this._updateTitle();
                break;
            case GWindows.WindowEvent.Type.Deactivated:
                this._toolManager.setView(null);
                this._updateTitle();
                break;
            default:
                break;
        }
    };

    /** @private */
    GApplication.prototype._updateTitle = function () {
        if (!this._sourceTitle) {
            this._sourceTitle = document.title;
        }

        var title = this._sourceTitle;

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
                    case GKey.Constant.META:
                        result += "meta";
                        break;
                    case GKey.Constant.OPTION:
                        result += "option";
                        break;
                    case GKey.Constant.REMOVE:
                        result += "del";
                        break;
                    case GKey.Constant.SPACE:
                        result += "space";
                        break;
                    case GKey.Constant.ENTER:
                        result += "enter";
                        break;
                    case GKey.Constant.TAB:
                        result += "tab";
                        break;
                    case GKey.Constant.BACKSPACE:
                        result += "backspace";
                        break;
                    case GKey.Constant.CONTROL:
                        result += "ctrl";
                        break;
                    case GKey.Constant.SHIFT:
                        result += "shift";
                        break;
                    case GKey.Constant.ALT:
                        result += "alt";
                        break;
                    case GKey.Constant.LEFT:
                        result += "left";
                        break;
                    case GKey.Constant.UP:
                        result += "up";
                        break;
                    case GKey.Constant.RIGHT:
                        result += "right";
                        break;
                    case GKey.Constant.DOWN:
                        result += "down";
                        break;
                    case GKey.Constant.PAGE_UP:
                        result += "pageup";
                        break;
                    case GKey.Constant.PAGE_DOWN:
                        result += "pagedown";
                        break;
                    case GKey.Constant.HOME:
                        result += "home";
                        break;
                    case GKey.Constant.END:
                        result += "end";
                        break;
                    case GKey.Constant.INSERT:
                        result += "ins";
                        break;
                    case GKey.Constant.DELETE:
                        result += "del";
                        break;
                    case GKey.Constant.COMMAND:
                        result += "meta";
                        break;
                    case GKey.Constant.F1:
                        result += "f1";
                        break;
                    case GKey.Constant.F2:
                        result += "f2";
                        break;
                    case GKey.Constant.F3:
                        result += "f3";
                        break;
                    case GKey.Constant.F4:
                        result += "f4";
                        break;
                    case GKey.Constant.F5:
                        result += "f5";
                        break;
                    case GKey.Constant.F6:
                        result += "f6";
                        break;
                    case GKey.Constant.F7:
                        result += "f7";
                        break;
                    case GKey.Constant.F8:
                        result += "f8";
                        break;
                    case GKey.Constant.F9:
                        result += "f9";
                        break;
                    case GKey.Constant.F10:
                        result += "f10";
                        break;
                    case GKey.Constant.F11:
                        result += "f11";
                        break;
                    case GKey.Constant.F12:
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
    _.gApp = new GApplication();
})(this);
