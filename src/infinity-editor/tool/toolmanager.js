(function (_) {
    /**
     * The manager for tools
     * @class GToolManager
     * @extends GObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function GToolManager() {
        this._tools = [];
        this._typeIdToIndexMap = {};
        this._paintLink = this._paint.bind(this);
    }

    GObject.inheritAndMix(GToolManager, GObject, [GEventTarget]);

    // -----------------------------------------------------------------------------------------------------------------
    // GToolManager.ToolChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for tool activation/deactivation
     * @param {GTool} previousTool previous tool instance, may be null for no previous tool
     * @param {GTool} newTool new tool instance, may be null for deactivation only
     * @class GToolManager.ToolChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GToolManager.ToolChangedEvent = function (previousTool, newTool) {
        this.previousTool = previousTool;
        this.newTool = newTool;
    };
    GObject.inherit(GToolManager.ToolChangedEvent, GEvent);

    /** @type GTool */
    GToolManager.ToolChangedEvent.prototype.previousTool = null;
    /** @type GTool */
    GToolManager.ToolChangedEvent.prototype.newTool = null;

    /** @override */
    GToolManager.ToolChangedEvent.prototype.toString = function () {
        return "[Event GToolManager.ToolChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GToolManager Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<GTool>}
     * @private
     */
    GToolManager.prototype._tools = null;

    /**
     * @type {Object}
     * @private
     */
    GToolManager.prototype._typeIdToIndexMap = null;

    /**
     * @type {GTool}
     * @private
     */
    GToolManager.prototype._activeTool = null;

    /**
     * @type {GEditorView}
     * @private
     */
    GToolManager.prototype._view = null;

    /**
     * @type {GStage}
     * @private
     */
    GToolManager.prototype._viewStage = null;

    /**
     * @type {GTool}
     * @private
     */
    GToolManager.prototype._temporaryActiveTool = null;

    /**
     * @type {boolean}
     * @private
     */
    GToolManager.prototype._temporarySubselect = false;

    /**
     * Add a new tool at the end of this manager. Note that the tool
     * will automatically be activated if the manager does not yet have an active one.
     * @param {GTool} tool the tool to add
     * @version 1.0
     */
    GToolManager.prototype.addTool = function (tool) {
        if (tool._manager) {
            throw new Error('Tool is already registered');
        }

        this._tools.push(tool);

        tool._manager = this;

        // Invalidate type index map
        this._typeIdToIndexMap = {};
        for (var i = 0; i < this._tools.length; ++i) {
            var tool = this._tools[i];
            this._typeIdToIndexMap[GObject.getTypeId(tool)] = i;
        }

        if (!this._activeTool) {
            this.activateTool(tool);
        }
    };

    /**
     * Checks whether the manager has a certain tool class available
     * @param {Function} tool the tool class to check for
     * @return {Boolean} true if available, false if not
     * @version 1.0
     */
    GToolManager.prototype.hasTool = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(GObject.getTypeId(tool));
    };

    /**
     * @returns {Number} the total count of tools in this manager
     */
    GToolManager.prototype.getToolCount = function () {
        return this._tools.length;
    };

    /**
     * @param {Function} tool the tool class to get an index for
     * @returns {Number} the index of the tool class or -1 if there's none
     */
    GToolManager.prototype.indexOf = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(GObject.getTypeId(tool)) ?
            this._typeIdToIndexMap[GObject.getTypeId(tool)] : -1;
    };

    /**
     * @param {Number} index the tool-index to get an instance for
     * @returns {GTool} the tool or null if index is out of range
     */
    GToolManager.prototype.getTool = function (index) {
        return index >= 0 && index < this._tools.length ? this._tools[index] : null;
    };

    /**
     * @return {GTool} the active tool or null for none
     */
    GToolManager.prototype.getActiveTool = function () {
        return this._activeTool;
    };

    /**
     * @returns {GTool} the temporary active tool if any
     */
    GToolManager.prototype.getTemporaryActiveTool = function () {
        return this._temporaryActiveTool;
    };

    /**
     * Activate a tool
     * @param {Function|GTool} tool the tool class or instance to get activate
     * @return {Boolean} true if activated, false if not
     */
    GToolManager.prototype.activateTool = function (tool) {
        if (!this._temporaryActiveTool) {
            return this._activateTool(tool);
        }
        return false;
    };

    /**
     * Assign the view this tool manager is operating on
     * @param {GEditorView} view the editor view this tool manager
     * is operating on, may also be null to remove all views
     */
    GToolManager.prototype.setView = function (view) {
        if (view != this._view) {

            if (this._view) {
                // Remove active tool
                this._removeActiveToolFromView();
                // Remove ourself from the view tool layer's paint
                this._viewStage.paint = null;
                // Unregister ourself from global modifiers change event
                ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
            }

            this._view = view;

            this._viewStage = view ? view.getToolStage() : null;

            if (this._view) {
                // Add active tool
                this._addActiveToolToView();
                // Assign ourself to the view tool layer's paint
                this._viewStage.paint = this._paintLink;
                // Register ourself to global modifiers change event
                ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
            }
        }
    };

    /**
     * @private
     */
    GToolManager.prototype._activateTool = function (tool) {
        // Stop here if current tool is not deactivatable
        if (this._activeTool && !this._activeTool.isDeactivatable()) {
            return false;
        }

        if (!(tool instanceof GTool)) {
            tool = this.getTool(this.indexOf(tool));
        }

        if (tool != this._activeTool) {
            this._removeActiveToolFromView();

            var oldTool = this._activeTool;
            this._activeTool = tool;

            if (this.hasEventListeners(GToolManager.ToolChangedEvent)) {
                this.trigger(new GToolManager.ToolChangedEvent(oldTool, tool));
            }

            this._addActiveToolToView();

            return true;
        }
        return false;
    };

    /**
     * @private
     */
    GToolManager.prototype._addActiveToolToView = function () {
        if (this._activeTool && this._view) {
            // Let tool activate on the view
            this._activeTool.activate(this._view);

            // Update view's cursor
            this._updateActiveToolCursor();
        }
    };

    /**
     * @private
     */
    GToolManager.prototype._removeActiveToolFromView = function () {
        if (this._activeTool && this._view) {
            // Let tool deactivate on the view
            this._activeTool.deactivate(this._view);

            // remove any cursor from the view
            this._view.setCursor(null);

            // Let editor on view if any finish inline editing
            this._view.getEditor().closeInlineEditor();
        }
    };

    /**
     * Enforce a cursor update for the current view and tool.
     * This is usually called from the tools
     * @private
     */
    GToolManager.prototype._updateActiveToolCursor = function () {
        if (this._activeTool && this._view) {
            this._view.setCursor(this._activeTool.getCursor());
        }
    };

    /**
     * Invalidate and request a repaint of active tool area
     * @param {GRect} [area] the area of invalidation, if not provided
     * or null, invalidates the whole area
     * @private
     */
    GToolManager.prototype._invalidateActiveToolArea = function (area) {
        if (this._activeTool && this._view) {
            this._viewStage.invalidate(area);
        }
    };

    /**
     * Called when this toolmanager should paint itself.
     * @param {GPaintContext} context
     * @version 1.0
     */
    GToolManager.prototype._paint = function (context) {
        if (this._activeTool) {
            this._activeTool.paint(context);
        }
    };

    /**
     * @private
     */
    GToolManager.prototype._updateTemporaryTool = function () {
        // Don't allow temporary tool switching when our editor is in inline editor mode
        if (this._view.getEditor().isInlineEditing()) {
            return;
        }

        var pointerToolInstance = this.getTool(this.indexOf(GPointerTool));
        var subselectToolInstance = this.getTool(this.indexOf(GSubSelectTool));
        var handToolInstance = this.getTool(this.indexOf(GHandTool));
        var zoomToolInstance = this.getTool(this.indexOf(GZoomTool));

        var temporaryTool = null;

        //
        // Pointer Tool is active when:
        // .) Meta-Key is hold
        // .) Space-Key is *not* hold
        // .) The active tool is not the pointer tool
        // .) The temporary tool is not the pointer tool
        //
        if (ifPlatform.modifiers.metaKey && !ifPlatform.modifiers.spaceKey &&
            this._activeTool !== pointerToolInstance && this._temporaryActiveTool !== pointerToolInstance) {
            // Meta key switches to pointer tool
            temporaryTool = pointerToolInstance;
        }

        //
        // Subselect Tool is active when:
        // .) Option Key is hold
        // .) The active tool is the pointer tool or the temporaryTool is the pointer tool or the temporary active tool is the pointer tool
        //
        if (ifPlatform.modifiers.optionKey && (temporaryTool === pointerToolInstance || this._activeTool instanceof GPointerTool || this._temporaryActiveTool === pointerToolInstance)) {
            temporaryTool = subselectToolInstance;
        }

        //
        // Hand Tool is active when:
        //
        // .) Space Key is hold
        // .) The active tool may be and may be not the hand tool as the _updateTemporaryTool may be called due to other
        // modifiers
        // .) The temporary tool is not the hand tool
        //
        if (ifPlatform.modifiers.spaceKey && this._temporaryActiveTool !== handToolInstance) {
            temporaryTool = handToolInstance;
        }

        //
        // Zoom Tool is active when:
        // .) Meta Key is hold
        // .) The active tool is the hand tool or the temporaryTool is the hand tool
        //
        if (ifPlatform.modifiers.metaKey && (temporaryTool === handToolInstance || this._activeTool instanceof GHandTool)) {
            temporaryTool = zoomToolInstance;
        }

        // If not having a temporary tool then activte previous tool if any
        if (!temporaryTool && this._temporaryActiveTool) {
            if (this._activateTool(this._temporaryActiveTool)) {
                this._temporaryActiveTool = null;
            }
        } else if (temporaryTool && temporaryTool !== this._activeTool) {
            var previousActiveTool = this._activeTool;
            if (this._activateTool(temporaryTool)) {
                if (!this._temporaryActiveTool) {
                    this._temporaryActiveTool = previousActiveTool;
                }
            }
        }
    };

    /**
     * @param {GUIPlatform.ModifiersChangedEvent} event
     * @private
     */
    GToolManager.prototype._modifiersChanged = function (event) {
        // Update temporary tool
        this._updateTemporaryTool();
    };

    /** override */
    GToolManager.prototype.toString = function () {
        return "[Object GToolManager]";
    };

    _.GToolManager = GToolManager;
})(this);