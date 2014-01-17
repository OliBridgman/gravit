(function (_) {

    /**
     * Action for showing a specific window
     * @param {EXWindow} window
     * @class EXShowWindowAction
     * @extends GUIAction
     * @constructor
     */
    function EXShowWindowAction(window) {
        this._id = gUtil.uuid();
        this._window = window;
    };
    GObject.inherit(EXShowWindowAction, GUIAction);

    /**
     * @type {String}
     * @private
     */
    EXShowWindowAction.prototype._id = null;

    /**
     * @type {EXWindow}
     * @private
     */
    EXShowWindowAction.prototype._window = null;

    /**
     * @override
     */
    EXShowWindowAction.prototype.getId = function () {
        return this._id;
    };

    /**
     * @override
     */
    EXShowWindowAction.prototype.getTitle = function () {
        return this._window.getTitle();
    };

    /**
     * @override
     */
    EXShowWindowAction.prototype.getCategory = function () {
        return GUIApplication.CATEGORY_WINDOW;
    };

    /**
     * @override
     */
    EXShowWindowAction.prototype.getGroup = function () {
        return "window";
    };

    /**
     * @override
     */
    EXShowWindowAction.prototype.isChecked = function () {
        return this._window === gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXShowWindowAction.prototype.execute = function (args) {
        gApp.getWindows().activateWindow(this._window);
    };

    /** @override */
    EXShowWindowAction.prototype.toString = function () {
        return "[Object EXShowWindowAction]";
    };

    _.EXShowWindowAction = EXShowWindowAction;
})(this);