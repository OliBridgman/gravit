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
     * The current editor view the tool is activated on, may be null for none
     * @type {GXEditorView}
     * @private
     */
    GXTool.prototype._view = null;

    /**
     * The current graphic editor the tool is activated on, may be null for none
     * @type {GXEditor}
     * @private
     */
    GXTool.prototype._editor = null;

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
     * @param {GXEditorView} view the editor view the tool got activated for
     */
    GXTool.prototype.activate = function (view) {
        this._scene = view ? view.getScene() : null;
        this._view = view;
        this._editor = view.getEditor();
    };

    /**
     * Called when this tool got deactivated for it's current view
     * @param {GXEditorView} view the editor view the tool got deactivated for
     */
    GXTool.prototype.deactivate = function (view) {
        if (view.getScene() != this._scene || view != this._view) {
            throw new Error("Not supposed to happen");
        }
        this._scene = null;
        this._view = null;
        this._editor = null;
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