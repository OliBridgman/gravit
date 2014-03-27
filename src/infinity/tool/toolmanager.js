(function (_) {
    /**
     * The manager for tools
     * @class GXToolManager
     * @extends GObject
     * @mixes GEventTarget
     * @constructor
     * @version 1.0
     */
    function GXToolManager() {
        this._tools = [];
        this._typeIdToIndexMap = {};
        this._paintLink = this._paint.bind(this);
    }

    GObject.inheritAndMix(GXToolManager, GObject, [GEventTarget]);

    // -----------------------------------------------------------------------------------------------------------------
    // GXToolManager.ToolChangedEvent Event
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * An event for tool activation/deactivation
     * @param {GXTool} previousTool previous tool instance, may be null for no previous tool
     * @param {GXTool} newTool new tool instance, may be null for deactivation only
     * @class GXToolManager.ToolChangedEvent
     * @extends GEvent
     * @constructor
     * @version 1.0
     */
    GXToolManager.ToolChangedEvent = function (previousTool, newTool) {
        this.previousTool = previousTool;
        this.newTool = newTool;
    };
    GObject.inherit(GXToolManager.ToolChangedEvent, GEvent);

    /** @type GXTool */
    GXToolManager.ToolChangedEvent.prototype.previousTool = null;
    /** @type GXTool */
    GXToolManager.ToolChangedEvent.prototype.newTool = null;

    /** @override */
    GXToolManager.ToolChangedEvent.prototype.toString = function () {
        return "[Event GXToolManager.ToolChangedEvent]";
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GXToolManager Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<GXTool>}
     * @private
     */
    GXToolManager.prototype._tools = null;

    /**
     * @type {Object}
     * @private
     */
    GXToolManager.prototype._typeIdToIndexMap = null;

    /**
     * @type {GXTool}
     * @private
     */
    GXToolManager.prototype._activeTool = null;

    /**
     * @type {GXSceneView}
     * @private
     */
    GXToolManager.prototype._view = null;

    /**
     * @type {GXSceneViewLayer}
     * @private
     */
    GXToolManager.prototype._viewLayer = null;

    /**
     * @type {GXTool}
     * @private
     */
    GXToolManager.prototype._temporaryActiveTool = null;

    /**
     * @type {boolean}
     * @private
     */
    GXToolManager.prototype._temporarySubselect = false;

    /**
     * Add a new tool at the end of this manager. Note that the tool
     * will automatically be activated if the manager does not yet have an active one.
     * @param {GXTool} tool the tool to add
     * @version 1.0
     */
    GXToolManager.prototype.addTool = function (tool) {
        if (tool._manager) {
            throw new Error('Tool is already registered');
        }

        var group = tool.getGroup();

        // Find the right insertion position if we have a group
        var hasInsertedTool = false;
        if (group) {
            for (var i = this._tools.length - 1; i >= 0; --i) {
                if (group === this._tools[i].getGroup()) {
                    if (i + 1 == this._tools.length) {
                        this._tools.push(tool);
                    } else {
                        this._tools.splice(i, 0, tool);
                    }
                    hasInsertedTool = true;
                    break;
                }
            }
        }

        if (!hasInsertedTool) {
            this._tools.push(tool);
        }

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
    GXToolManager.prototype.hasTool = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(GObject.getTypeId(tool));
    };

    /**
     * @returns {Number} the total count of tools in this manager
     */
    GXToolManager.prototype.getToolCount = function () {
        return this._tools.length;
    };

    /**
     * @param {Function} tool the tool class to get an index for
     * @returns {Number} the index of the tool class or -1 if there's none
     */
    GXToolManager.prototype.indexOf = function (tool) {
        return this._typeIdToIndexMap.hasOwnProperty(GObject.getTypeId(tool)) ?
            this._typeIdToIndexMap[GObject.getTypeId(tool)] : -1;
    };

    /**
     * @param {Number} index the tool-index to get an instance for
     * @returns {GXTool} the tool or null if index is out of range
     */
    GXToolManager.prototype.getTool = function (index) {
        return index >= 0 && index < this._tools.length ? this._tools[index] : null;
    };

    /**
     * @return {GXTool} the active tool or null for none
     */
    GXToolManager.prototype.getActiveTool = function () {
        return this._activeTool;
    };

    /**
     * @returns {GXTool} the temporary active tool if any
     */
    GXToolManager.prototype.getTemporaryActiveTool = function () {
        return this._temporaryActiveTool;
    };

    /**
     * Activate a tool
     * @param {Function|GXTool} tool the tool class or instance to get activate
     * @return {Boolean} true if activated, false if not
     */
    GXToolManager.prototype.activateTool = function (tool) {
        if (!this._temporaryActiveTool) {
            return this._activateTool(tool);
        }
        return false;
    };

    /**
     * Assign the view this tool manager is operating on
     * @param {GXSceneView} view the view this tool manager
     * is operating on, may also be null to remove all views
     */
    GXToolManager.prototype.setView = function (view) {
        if (view != this._view) {

            if (this._view) {
                // Remove active tool
                this._removeActiveToolFromView();
                // Remove ourself from the view tool layer's paint
                this._viewLayer.paint = null;
                // Unregister ourself from global modifiers change event
                gPlatform.removeEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged);
            }

            this._view = view;

            this._viewLayer = view && view.getLayer(GXEditorView.Layer.Tool);

            if (this._view) {
                // Add active tool
                this._addActiveToolToView();
                // Assign ourself to the view tool layer's paint
                this._viewLayer.paint = this._paintLink;
                // Register ourself to global modifiers change event
                gPlatform.addEventListener(GUIPlatform.ModifiersChangedEvent, this._modifiersChanged, this);
            }
        }
    };

    /**
     * @private
     */
    GXToolManager.prototype._activateTool = function (tool) {
        // Stop here if current tool is not deactivatable
        if (this._activeTool && !this._activeTool.isDeactivatable()) {
            return false;
        }

        if (!(tool instanceof GXTool)) {
            tool = this.getTool(this.indexOf(tool));
        }

        if (tool != this._activeTool) {
            this._removeActiveToolFromView();
            var oldTool = this._activeTool;
            this._activeTool = tool;
            this._addActiveToolToView();

            if (this.hasEventListeners(GXToolManager.ToolChangedEvent)) {
                this.trigger(new GXToolManager.ToolChangedEvent(oldTool, tool));
            }

            return true;
        }
        return false;
    };

    /**
     * @private
     */
    GXToolManager.prototype._addActiveToolToView = function () {
        if (this._activeTool && this._view) {
            // Let tool activate on the view
            this._activeTool.activate(this._view, this._viewLayer);

            // Update view's cursor
            this._updateActiveToolCursor();
        }
    };

    /**
     * @private
     */
    GXToolManager.prototype._removeActiveToolFromView = function () {
        if (this._activeTool && this._view) {
            // Let tool deactivate on the view
            this._activeTool.deactivate(this._view, this._viewLayer);

            // remove any cursor from the view
            this._viewLayer.setCursor(null);
        }
    };

    /**
     * Enforce a cursor update for the current view and tool.
     * This is usually called from the tools
     * @private
     */
    GXToolManager.prototype._updateActiveToolCursor = function () {
        if (this._activeTool && this._view) {
            this._viewLayer.setCursor(this._activeTool.getCursor());
        }
    };

    /**
     * Invalidate and request a repaint of active tool area
     * @param {GRect} [area] the area of invalidation, if not provided
     * or null, invalidates the whole area
     * @private
     */
    GXToolManager.prototype._invalidateActiveToolArea = function (area) {
        if (this._activeTool && this._view) {
            this._viewLayer.invalidate(area);
        }
    };

    /**
     * Called when this toolmanager should paint itself.
     * @param {GXPaintContext} context
     * @version 1.0
     */
    GXToolManager.prototype._paint = function (context) {
        if (this._activeTool) {
            this._activeTool.paint(context);
        }
    };

    /**
     * @private
     */
    GXToolManager.prototype._updateTemporaryTool = function () {
        var pointerToolInstance = this.getTool(this.indexOf(GXPointerTool));
        var subselectToolInstance = this.getTool(this.indexOf(GXSubSelectTool));
        var handToolInstance = this.getTool(this.indexOf(GXHandTool));
        var zoomToolInstance = this.getTool(this.indexOf(GXZoomTool));

        var temporaryTool = null;

        //
        // Pointer Tool is active when:
        // .) Meta-Key is hold
        // .) Space-Key is *not* hold
        // .) The active tool is not the pointer tool
        // .) The temporary tool is not the pointer tool
        //
        if (gPlatform.modifiers.metaKey && !gPlatform.modifiers.spaceKey &&
            this._activeTool !== pointerToolInstance && this._temporaryActiveTool !== pointerToolInstance) {
            // Meta key switches to pointer tool
            temporaryTool = pointerToolInstance;
        }

        //
        // Subselect Tool is active when:
        // .) Option Key is hold
        // .) The active tool is the pointer tool or the temporaryTool is the pointer tool or the temporary active tool is the pointer tool
        //
        if (gPlatform.modifiers.optionKey && (temporaryTool === pointerToolInstance || this._activeTool instanceof GXPointerTool || this._temporaryActiveTool === pointerToolInstance)) {
            temporaryTool = subselectToolInstance;
        }

        //
        // Hand Tool is active when:
        //
        // .) Space Key is hold
        // .) The active tool is the hand tool
        // .) The temporary tool is not the hand tool
        //
        if (gPlatform.modifiers.spaceKey && this._activeTool !== handToolInstance && this._temporaryActiveTool !== handToolInstance) {
            temporaryTool = handToolInstance;
        }

        //
        // Zoom Tool is active when:
        // .) Meta Key is hold
        // .) The active tool is the hand tool or the temporaryTool is the hand tool
        //
        if (gPlatform.modifiers.metaKey && (temporaryTool === handToolInstance || this._activeTool instanceof GXHandTool)) {
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
    GXToolManager.prototype._modifiersChanged = function (event) {
        // Update temporary tool
        this._updateTemporaryTool();
        /*

         if (event.changed.spaceKey && this.hasTool(GXPointerTool)) {
         this.activateTool(GXHandTool);
         }

         // React on certain modifiers key changes for temporary tool switching
         if (event.changed.metaKey && this.hasTool(GXPointerTool)) {
         // Meta-Key switches to Pointer Tool and back
         if (!gPlatform.modifiers.metaKey) {
         // Releasing meta key must check to re-activate a previous tool if any
         if (this._temporaryActiveTool) {
         this.activateTool(this._temporaryActiveTool);
         this._temporaryActiveTool = null;
         }
         } else if (!this._activeTool || !(this._activeTool instanceof GXPointerTool)) {
         var oldTool = this._activeTool;

         // Ensure to either activate pointer or subselect tool
         if (gPlatform.modifiers.optionKey && this.hasTool(GXSubSelectTool)) {
         if (this.activateTool(GXSubSelectTool)) {
         this._temporaryActiveTool = oldTool;
         this._temporarySubselect = true;
         }
         } else {
         if (this.activateTool(GXPointerTool)) {
         this._temporaryActiveTool = oldTool;
         }
         }
         }
         }

         if (event.changed.optionKey && this.hasTool(GXPointerTool) && this.hasTool(GXSubSelectTool)) {
         // Option key switches between Pointer-Tool and Subselect-Tool
         if (!gPlatform.modifiers.optionKey) {
         // Releasing option key must check to re-activate pointer tool
         if (this._temporarySubselect && this._activeTool instanceof GXSubSelectTool) {
         this.activateTool(GXPointerTool);
         }
         this._temporarySubselect = false;
         } else if (this._activeTool && this._activeTool instanceof GXPointerTool) {
         if (this.activateTool(GXSubSelectTool)) {
         this._temporarySubselect = true;
         }
         }
         }
         */
    };

    /** override */
    GXToolManager.prototype.toString = function () {
        return "[Object GXToolManager]";
    };

    _.GXToolManager = GXToolManager;
})(this);