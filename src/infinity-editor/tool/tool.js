(function (_) {
    /**
     * The base for a tool
     * @class GTool
     * @extends GObject
     * @constructor
     * @version 1.0
     */
    function GTool() {
    }

    GObject.inherit(GTool, GObject);

    // -----------------------------------------------------------------------------------------------------------------
    // GTool Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * The manager creating and owning this tool
     * @type {GToolManager}
     * @private
     */
    GTool.prototype._manager = null;

    /**
     * The current docuument the tool is activated on, may be null for none
     * @type {GScene}
     * @private
     */
    GTool.prototype._scene = null;

    /**
     * The current editor view the tool is activated on, may be null for none
     * @type {GEditorView}
     * @private
     */
    GTool.prototype._view = null;

    /**
     * The current graphic editor the tool is activated on, may be null for none
     * @type {GEditor}
     * @private
     */
    GTool.prototype._editor = null;

    /**
     * Should return the current cursor for this tool.
     * If you need to update the cursor, simply call updateCursor()
     * @returns {String}
     * @see GCursor
     * @version 1.0
     */
    GTool.prototype.getCursor = function () {
        return GCursor.Default;
    };

    /**
     * Called when this tool got activated for a given view
     * @param {GEditorView} view the editor view the tool got activated for
     */
    GTool.prototype.activate = function (view) {
        this._scene = view ? view.getScene() : null;
        this._view = view;
        this._editor = view.getEditor();
    };

    /**
     * Called when this tool got deactivated for it's current view
     * @param {GEditorView} view the editor view the tool got deactivated for
     */
    GTool.prototype.deactivate = function (view) {
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
    GTool.prototype.isDeactivatable = function () {
        // Always deactivable by default
        return true;
    };

    /**
     * Called when this tool should paint itself.
     * @param {GPaintContext} context
     * @version 1.0
     */
    GTool.prototype.paint = function (context) {
        // NO-OP
    };

    /**
     * Descendant classes should call this to update their cursor
     * @version 1.0
     */
    GTool.prototype.updateCursor = function () {
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
    GTool.prototype.invalidateArea = function (area) {
        if (this._manager && this == this._manager.getActiveTool()) {
            this._manager._invalidateActiveToolArea(area);
        }
    };

    /**
     * This may return to supress context menu because
     * the tool handles right clicking differently
     */
    GTool.prototype.catchesContextMenu = function () {
        return false;
    };

    /** override */
    GTool.prototype.toString = function () {
        return "[Object GTool]";
    };

    _.GTool = GTool;
})(this);