(function (_) {

    /**
     * Action for setting a specific magnfication on current view
     * @class EXMagnificationAction
     * @extends GUIAction
     * @constructor
     */
    function EXMagnificationAction(magnification, shortcut) {
        this._magnification = magnification;
        this._shortcut = shortcut;
    };
    IFObject.inherit(EXMagnificationAction, GUIAction);

    EXMagnificationAction.ID = 'view.magnification';

    /**
     * @type {Number}
     * @private
     */
    EXMagnificationAction.prototype._magnification = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    EXMagnificationAction.prototype._shortcut = null;

    /**
     * @override
     */
    EXMagnificationAction.prototype.getId = function () {
        return EXMagnificationAction.ID + '.' + this._magnification.toString();
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.getTitle = function () {
        return this._magnification.toString() + '%';
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.getGroup = function () {
        return "zoom/magnification-level";
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.getShortcut = function () {
        return this._shortcut;
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    EXMagnificationAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = this._magnification / 100.0;
        var zoomPoint = view.getViewTransform().mapPoint(new GPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    EXMagnificationAction.prototype.toString = function () {
        return "[Object EXMagnificationAction]";
    };

    _.EXMagnificationAction = EXMagnificationAction;
})(this);