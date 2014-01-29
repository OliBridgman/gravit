(function (_) {
    /**
     * The base for a tool
     * @class GXTool
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GXTool() {
    }

    GObject.inherit(GXTool, GObject);

    // -----------------------------------------------------------------------------------------------------------------
    // GXTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The manager creating and owning this tool
     * @type {GXToolManager}
     * @private
     */
    GXTool.prototype._manager = null;

    /**
     * The current docuument the tool is activated on, may be null for none
     * @type {GXScene}
     * @private
     */
    GXTool.prototype._scene = null;

    /**
     * The current view the tool is activated on, may be null for none
     * @type {GXSceneView}
     * @private
     */
    GXTool.prototype._view = null;

    /**
     * The current view layer the tool is activated on, may be null for none
     * @type {GXSceneViewLayer}
     * @private
     */
    GXTool.prototype._layer = null;

    /**
     * The current graphic editor the tool is activated on, may be null for none
     * @type {GXEditor}
     * @private
     */
    GXTool.prototype._editor = null;

    /**
     * The current editor view layer the tool is activated on, may be null for none
     * @type {GXSceneViewLayer}
     * @private
     */
    GXTool.prototype._editorLayer = null;

    /**
     * Should return a group for the tool (maybe null)
     * @returns {String}
     */
    GXTool.prototype.getGroup = function () {
        return null;
    };

    /**
     * Should return a complete svg-based icon including a valid viewBox
     * @returns {String}
     */
    GXTool.prototype.getIcon = function () {
        return null;
    };

    /**
     * Should return a hint for this tool (maybe null)
     * @returns {GUIHint}
     * @version 1.0
     */
    GXTool.prototype.getHint = function () {
        var hint = new GUIHint().addKey(GUIKey.Constant.ESCAPE, new GLocale.Key(GXTool, "shortcut.esc"));
        var activationChars = this.getActivationCharacters();
        if (activationChars) {
            var hintShortcuts = [];
            for (var i = 0; i < activationChars.length; ++i) {
                hintShortcuts.push([activationChars[i]]);
            }
            hint.setShortcuts(hintShortcuts);
        }
        return hint;
    };

    /**
     * Should return the shortcut character code(s)
     * to activate this tool or null for none
     * @returns {Array<String>}
     * @version 1.0
     */
    GXTool.prototype.getActivationCharacters = function () {
        return null;
    };

    /**
     * Should return the current cursor for this tool.
     * If you need to update the cursor, simply call updateCursor()
     * @returns {String}
     * @see GUICursor
     * @version 1.0
     */
    GXTool.prototype.getCursor = function () {
        return GUICursor.Default;
    };

    /**
     * Called when this tool got activated for a given view
     * @param {GXSceneView} view the view the tool got activated for
     * @param {GXSceneViewLayer} layer the layer the tool got activated for
     * @version 1.0
     */
    GXTool.prototype.activate = function (view, layer) {
        this._scene = view ? view.getScene() : null;
        this._view = view;
        this._layer = layer;
        this._editor = GXEditor.getEditor(view.getScene());
        if (this._editor == null) {
            throw new Error("Scene does not link to a graphic editor.");
        }
        this._editorLayer = view.getLayer(GXEditorView.Layer.Editor);
    };

    /**
     * Called when this tool got deactivated for it's current view
     * @param {GXSceneView} view the view the tool got deactivated for
     * @param {GXSceneViewLayer} layer the layer the tool got activated for
     * @version 1.0
     */
    GXTool.prototype.deactivate = function (view, layer) {
        if (view.getScene() != this._scene || view != this._view || layer != this._layer) {
            throw new Error("Not supposed to happen");
        }
        this._scene = null;
        this._view = null;
        this._layer = null;
        this._editor = null;
        this._editorLayer = null;
    };

    /**
     * Should return whether the tool can currently be
     * safely deactivated by calling it's deactivate()
     * function or not (i.e. while drawing)
     * @return {Boolean}
     * @version 1.0
     */
    GXTool.prototype.isDeactivatable = function () {
        // Always deactivable by default
        return true;
    };

    /**
     * Called whenever this tool should immediately cancel
     * any action it currently is doing. If there's nothing to
     * cancel, the tool should ignore this call.
     * @version 1.0
     */
    GXTool.prototype.cancel = function () {
        // NO-OP
    };

    /**
     * Called when this tool should paint itself.
     * @param {GXPaintContext} context
     * @version 1.0
     */
    GXTool.prototype.paint = function (context) {
        // NO-OP
    };

    /**
     * Descendant classes should call this to update their cursor
     * @version 1.0
     */
    GXTool.prototype.updateCursor = function () {
        if (this._manager && this == this._manager.getActiveTool()) {
            this._manager._updateActiveToolCursor();
        }
    };

    /**
     * Descendant classes should call this to invalidate and
     * request a repaint of a certain area
     * @param {GRect} [area] the area of invalidation, if not provided
     * or null, invalidates the whole area
     * @version 1.0
     */
    GXTool.prototype.invalidateArea = function (area) {
        if (this._manager && this == this._manager.getActiveTool()) {
            this._manager._invalidateActiveToolArea(area);
        }
    };

    /** override */
    GXTool.prototype.toString = function () {
        return "[Object GXTool]";
    };

    _.GXTool = GXTool;
})(this);