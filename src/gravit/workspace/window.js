(function (_) {
    /**
     * An instance of an opened window
     * @class GWindow
     * @extends GEventTarget
     * @constructor
     * @version 1.0
     */
    function GWindow(document) {
        this._container = $('<div></div>');
        this._document = document;
        this._view = new IFEditorView(this._document.getEditor());
        this._view.setViewMargin([GWindow.VIEW_MARGIN, GWindow.VIEW_MARGIN, GWindow.VIEW_MARGIN, GWindow.VIEW_MARGIN]);
        this._container.append(this._view._htmlElement);

        // Add "hack" to focus the view on clicking
        this._container.on('mousedown', function (e) {
            this._view.focus();
        }.bind(this));

        // Catch the context menu event to show our own
        var contextMenu = this._createContextMenu();
        this._container.on("contextmenu", function (evt) {
            this._contextMenuClientPosition = new IFPoint(evt.clientX, evt.clientY);
            contextMenu.open({x: evt.pageX, y: evt.pageY});
            return true;
        }.bind(this));

    };
    IFObject.inherit(GWindow, GEventTarget);

    /**
     * Constant defining the additional margin for the view
     * @type {number}
     */
    GWindow.VIEW_MARGIN = 10;

    /**
     * The view container
     * @type {JQuery}
     * @private
     */
    GWindow.prototype._container = null;

    /**
     * The underlying document
     * @type {GDocument}
     * @private
     */
    GWindow.prototype._document = null;

    /**
     * The underlying view
     * @type {IFEditorView}
     * @private
     */
    GWindow.prototype._view = null;

    /**
     * The current clientX/clientY position triggered
     * by the contextmenu DOM-Event
     * @type {IFPoint}
     * @private
     */
    GWindow.prototype._contextMenuClientPosition = null;

    /**
     * Returns the document this window is bound to
     * @return {GDocument}
     */
    GWindow.prototype.getDocument = function () {
        return this._document;
    };

    /**
     * Returns the underlying editor view this window is bound to
     * @return {IFEditorView}
     */
    GWindow.prototype.getView = function () {
        return this._view;
    };

    /**
     * Returns the title for this window
     * @return {String}
     */
    GWindow.prototype.getTitle = function () {
        var result = this._document.getTitle();

        var index = this._document._windows.indexOf(this);
        if (index > 0) {
            result += ':' + index.toString();
        }

        return result;
    };

    /**
     * Closes this window
     */
    GWindow.prototype.close = function () {
        this._document.closeWindow(this);
    };

    /**
     * Called before this document gets activated
     */
    GWindow.prototype.activate = function () {
        // NO-OP
    };

    /**
     * Called before this document gets deactivated
     */
    GWindow.prototype.deactivate = function () {
        // Always finish inline editing of editor if any
        // when a view gets deactivated
        this._document.getEditor().closeInlineEditor();
    };

    /**
     * Creates the context menu for the view
     * @returns {GUIMenu}
     * @private
     */
    GWindow.prototype._createContextMenu = function () {
        var menu = new GUIMenu();

        // Add select menu item to select shapes underneath
        var selectItem = new GUIMenuItem(GUIMenuItem.Type.Menu);
        // TODO : I18N
        selectItem.setCaption('Select');
        selectItem.addEventListener(GUIMenuItem.UpdateEvent, function () {
            // Clear out any previous items and disable our item by default
            selectItem.getMenu().clearItems();
            selectItem.setEnabled(false);

            // Gather all element hits underneath cursor and update our menu
            var elementHits = this._document.getScene().hitTest(this._contextMenuClientPosition, this._view.getWorldTransform(), function (hit) {
                return true;
            }.bind(this), true, -1, this._document.getScene().getProperty('pickDist'), true);

            if (elementHits && elementHits.length > 0) {
                selectItem.setEnabled(true);

                // Add each hit as a menu item
                for (var i = 0; i < elementHits.length; ++i) {
                    var self = this;
                    var stackItem = new GUIMenuItem();
                    stackItem.element = elementHits[i].element;
                    stackItem.setCaption((i + 1).toString() + '. ' + elementHits[i].element.getNodeNameTranslated());
                    stackItem.addEventListener(GUIMenuItem.EnterEvent, function () {
                        this.element.setFlag(IFNode.Flag.Highlighted);
                    });
                    stackItem.addEventListener(GUIMenuItem.LeaveEvent, function () {
                        this.element.removeFlag(IFNode.Flag.Highlighted);
                    });
                    stackItem.addEventListener(GUIMenuItem.ActivateEvent, function () {
                        this.element.removeFlag(IFNode.Flag.Highlighted);
                        self._document.getEditor().updateSelection(ifPlatform.modifiers.shiftKey, [this.element]);
                    });
                    selectItem.getMenu().addItem(stackItem);
                }
            }
        }.bind(this));
        menu.addItem(selectItem);
        menu.setMenuBlocker(function () {
            var toolManager = gApp.getToolManager();
            var tool = toolManager.getActiveTool();
            if (tool instanceof IFBezigonTool || tool instanceof IFPenTool) {
                return true;
            }
            return false;
        });

        // TODO : Add more actions

        // Finally return our context menu instance
        return menu;
    };

    _.GWindow = GWindow;
})(this);
