(function (_) {
    /**
     * A undo/redo list implementation
     * @class GUndoList
     * @extends GObject
     * @constructor
     */
    function GUndoList() {
        this._undoActions = [];
        this._redoActions = [];
    };
    GObject.inherit(GUndoList, GObject);

    /**
     * Maximal number of entries kept before cutting
     * @type {number}
     * @version 1.0
     */
    GUndoList.MAX_ENTRIES = 100;

    // -----------------------------------------------------------------------------------------------------------------
    // GUndoList.Action Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * A single undo/redo action
     * @param {Function} redo redo command
     * @param {Function} undo undo command
     * @param {String} title a title for the command
     * @class GUndoList.Action
     * @constructor
     * @version 1.0
     */
    GUndoList.Action = function (redo, undo, title) {
        this.redo = redo;
        this.undo = undo;
        this.title = title;
    };

    /**
     * Called to redo the action
     * @type {Function}
     * @version 1.0
     */
    GUndoList.Action.prototype.redo = null;

    /**
     * Called to undo the executed action
     * @type {Function}
     * @version 1.0
     */
    GUndoList.Action.prototype.undo = null;

    /**
     * The title for the undo action
     * @type {String}
     * @version 1.0
     */
    GUndoList.Action.prototype.title = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GUndoList Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * @type {Array<GUndoList.Action>}
     * @private
     */
    GUndoList.prototype._undoActions = null;

    /**
     * @type {Array<GUndoList.Action>}
     * @private
     */
    GUndoList.prototype._redoActions = null;

    /**
     * Check whether this list has one or more undo actions available
     * @return {Boolean} true if at least one undo action is available, false if not
     * @version 1.0
     */
    GUndoList.prototype.hasUndo = function () {
        return this._undoActions.length > 0
    };

    /**
     * Check whether this list has one or more redo actions available
     * @return {Boolean} true if at least one redo action is available, false if not
     * @version 1.0
     */
    GUndoList.prototype.hasRedo = function () {
        return this._redoActions.length > 0;
    };

    /**
     * @return {Number} the number of available undo actions
     * @version 1.0
     */
    GUndoList.prototype.getUndoCount = function () {
        return this._undoActions.length;
    };

    /**
     * @return {Number} the number of available redo actions
     * @version 1.0
     */
    GUndoList.prototype.getRedoCount = function () {
        return this._redoActions.length;
    };

    /**
     * Undo a certain number of steps
     * @param {Number} [steps] the number of steps to undo, defaults to 1
     */
    GUndoList.prototype.undo = function (steps) {
        steps = Math.min(steps || 1, this._undoActions.length);
        do {
            // Get command and shift it from undo list
            var cmd = this._undoActions.pop();

            // Move command into redo list
            this._redoActions.push(cmd);

            // Execute undo action of command
            cmd.undo.call(cmd);
        } while (--steps);
    };

    /**
     * Redo a certain number of steps
     * @param {Number} [steps] the number of steps to redo, defaults to 1
     */
    GUndoList.prototype.redo = function (steps) {
        steps = Math.min(steps || 1, this._redoActions.length);
        do {
            // Get command and shift it from redo list
            var cmd = this._redoActions.pop();

            // Move command into undo list
            this._undoActions.push(cmd);

            // Execute redo action of command
            cmd.redo.call(cmd);
        } while (--steps);
    };

    /**
     * Add an undo action to this list
     * @param {GUndoList.Action} action the action to be added
     * @version 1.0
     */
    GUndoList.prototype.addAction = function (action) {
        // TODO : Group support
        this._undoActions.push(action);
    };

    /** @override */
    GUndoList.prototype.toString = function () {
        return "[Object GUndoList]";
    };

    _.GUndoList = GUndoList;
})(this);