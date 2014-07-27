(function (_) {
    /**
     * The manager for tools
     * @class IFToolManager
     * @extends IFObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function IFToolManager() {
        this._tools = [];
        this._typeIdToIndexMap = {};
        this._paintLink = this._paint.bind(this);
    }

    IFObject.inheritAndMix(IFToolManager, IFObject, [GEventTarget]);

    // -----------------------------------------------------------------------------------------------------------------
    // IFToolManager.ToolChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for tool activation/deactivation
     * @param {IFTool} previousTool previous tool instance, may be null for no previous tool
     * @param {IFTool} newTool new tool instance, may be null for deactivation only
     * @class IFToolManager.ToolChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    IFToolManager.ToolChangedEvent = function (previousTool, newTool) {
        this.previousTool = previousTool;
        this.newTool = newTool;
    };
    IFObject.inherit(IFToolManager.ToolChangedEvent, GEvent);

    /** @type IFTool */
    IFToolManager.ToolChangedEvent.prototype.previousTool = null;
    /** @type IFTool */
    IFToolManager.ToolChangedEvent.prototype.newTool = null;

    /** @override */
    IFToolManager.ToolChangedEvent.prototype.toString = function () {
        return "[Event IFToolManager.ToolChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFToolManager Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<IFTool>}
     * @private
     */
    IFToolManager.prototype._tools = null;

    /**
     * @type {Object}
     * @private
     */
    IFToolManager.prototype._typeIdToIndexMap = null;

    /**
     * @type {IFTool}
     * @private
     */
    IFToolManager.prototype._activeTool = null;

    /**
     * @type {IFEditorView}
     * @private
     */
    IFToolManager.prototype._view = null;

    /**
     * @type {IFViewLayer}
     * @private
     */
    IFToolManager.prototype._viewLayer = null;

    /**
     * @type {IFTool}
     * @private
     */
    IFToolManager.prototype._temporaryActiveTool = null;

    /**
     * @type {boolean}
     * @private
     */
    IFToolManager.prototype._temporarySubselect = false;

    /**
     * Add a new tool at the end of this manager. Note that the tool
     * will automatically be activated if the manager does not yet have an active one.
     * @param {IFTool} tool the tool to add
     * @version 1.0
     */
    IFToolManager.prototype.addTool = function (tool) {
        if (tool._manager) {
            throw new Error('Tool is already registered');
        }

        this._tools.push(tool);

        tool._manager = this;

        // Invalidate type index map
        this._typeIdToIndexMap = {};
        for (var i = 0; i < this._tools.length; ++i) {
            var tool = this._tools[i];
            this._typeIdToIndexMap[IFObject.getTypeId(tool)] = i;
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
    IFToolManager.prototype.hasTool = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(IFObject.getTypeId(tool));
    };

    /**
     * @returns {Number} the total count of tools in this manager
     */
    IFToolManager.prototype.getToolCount = function () {
        return this._tools.length;
    };

    /**
     * @param {Function} tool the tool class to get an index for
     * @returns {Number} the index of the tool class or -1 if there's none
     */
    IFToolManager.prototype.indexOf = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(IFObject.getTypeId(tool)) ?
            this._typeIdToIndexMap[IFObject.getTypeId(tool)] : -1;
    };

    /**
     * @param {Number} index the tool-index to get an instance for
     * @returns {IFTool} the tool or null if index is out of range
     */
    IFToolManager.prototype.getTool = function (index) {
        return index >= 0 && index < this._tools.length ? this._tools[index] : null;
    };

    /**
     * @return {IFTool} the active tool or null for none
     */
    IFToolManager.prototype.getActiveTool = function () {
        return this._activeTool;
    };

    /**
     * @returns {IFTool} the temporary active tool if any
     */
    IFToolManager.prototype.getTemporaryActiveTool = function () {
        return this._temporaryActiveTool;
    };

    /**
     * Activate a tool
     * @param {Function|IFTool} tool the tool class or instance to get activate
     * @return {Boolean} true if activated, false if not
     */
    IFToolManager.prototype.activateTool = function (tool) {
        if (!this._temporaryActiveTool) {
            return this._activateTool(tool);
        }
        return false;
    };

    /**
     * Assign the view this tool manager is operating on
     * @param {IFEditorView} view the editor view this tool manager
     * is operating on, may also be null to remove all views
     */
    IFToolManager.prototype.setView = function (view) {
        if (view != this._view) {

            if (this._view) {
                // Remove active tool
                this._removeActiveToolFromView();
                // Remove ourself from the view tool layer's paint
                this._viewLayer.paint = null;
                // Unregister ourself from global modifiers change event
                ifPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
            }

            this._view = view;

            this._viewLayer = view ? view.getToolLayer() : null;

            if (this._view) {
                // Add active tool
                this._addActiveToolToView();
                // Assign ourself to the view tool layer's paint
                this._viewLayer.paint = this._paintLink;
                // Register ourself to global modifiers change event
                ifPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
            }
        }
    };

    /**
     * @private
     */
    IFToolManager.prototype._activateTool = function (tool) {
        // Stop here if current tool is not deactivatable
        if (this._activeTool && !this._activeTool.isDeactivatable()) {
            return false;
        }

        if (!(tool instanceof IFTool)) {
            tool = this.getTool(this.indexOf(tool));
        }

        if (tool != this._activeTool) {
            this._removeActiveToolFromView();
            var oldTool = this._activeTool;
            this._activeTool = tool;
            this._addActiveToolToView();

            if (this.hasEventListeners(IFToolManager.ToolChangedEvent)) {
                this.trigger(new IFToolManager.ToolChangedEvent(oldTool, tool));
            }

            return true;
        }
        return false;
    };

    /**
     * @private
     */
    IFToolManager.prototype._addActiveToolToView = function () {
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
    IFToolManager.prototype._removeActiveToolFromView = function () {
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
    IFToolManager.prototype._updateActiveToolCursor = function () {
        if (this._activeTool && this._view) {
            this._view.setCursor(this._activeTool.getCursor());
        }
    };

    /**
     * Invalidate and request a repaint of active tool area
     * @param {IFRect} [area] the area of invalidation, if not provided
     * or null, invalidates the whole area
     * @private
     */
    IFToolManager.prototype._invalidateActiveToolArea = function (area) {
        if (this._activeTool && this._view) {
            this._viewLayer.invalidate(area);
        }
    };

    /**
     * Called when this toolmanager should paint itself.
     * @param {IFPaintContext} context
     * @version 1.0
     */
    IFToolManager.prototype._paint = function (context) {
        if (this._activeTool) {
            this._activeTool.paint(context);
        }
    };

    /**
     * @private
     */
    IFToolManager.prototype._updateTemporaryTool = function () {
        var pointerToolInstance = this.getTool(this.indexOf(IFPointerTool));
        var subselectToolInstance = this.getTool(this.indexOf(IFSubSelectTool));
        var handToolInstance = this.getTool(this.indexOf(IFHandTool));
        var zoomToolInstance = this.getTool(this.indexOf(IFZoomTool));

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
        if (ifPlatform.modifiers.optionKey && (temporaryTool === pointerToolInstance || this._activeTool instanceof IFPointerTool || this._temporaryActiveTool === pointerToolInstance)) {
            temporaryTool = subselectToolInstance;
        }

        //
        // Hand Tool is active when:
        //
        // .) Space Key is hold
        // .) The active tool is the hand tool
        // .) The temporary tool is not the hand tool
        //
        if (ifPlatform.modifiers.spaceKey && this._activeTool !== handToolInstance && this._temporaryActiveTool !== handToolInstance) {
            temporaryTool = handToolInstance;
        }

        //
        // Zoom Tool is active when:
        // .) Meta Key is hold
        // .) The active tool is the hand tool or the temporaryTool is the hand tool
        //
        if (ifPlatform.modifiers.metaKey && (temporaryTool === handToolInstance || this._activeTool instanceof IFHandTool)) {
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
    IFToolManager.prototype._modifiersChanged = function (event) {
        // Update temporary tool
        this._updateTemporaryTool();
    };

    /** override */
    IFToolManager.prototype.toString = function () {
        return "[Object IFToolManager]";
    };

    _.IFToolManager = IFToolManager;
})(this);