(function (_) {

    /**
     * Action for setting a specific magnfication on current view
     * @class GMagnificationAction
     * @extends GAction
     * @constructor
     */
    function GMagnificationAction(magnification, shortcut) {
        this._magnification = magnification;
        this._shortcut = shortcut;
    };
    IFObject.inherit(GMagnificationAction, GAction);

    GMagnificationAction.ID = 'view.magnification';

    /**
     * @type {Number}
     * @private
     */
    GMagnificationAction.prototype._magnification = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    GMagnificationAction.prototype._shortcut = null;

    /**
     * @override
     */
    GMagnificationAction.prototype.getId = function () {
        return GMagnificationAction.ID + '.' + this._magnification.toString();
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.getTitle = function () {
        return this._magnification.toString() + '%';
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW_MAGNIFICATION;
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.getGroup = function () {
        return "zoom/magnification-level";
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.getShortcut = function () {
        return this._shortcut;
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.isEnabled = function () {
        return !!gApp.getWindows().getActiveWindow();
    };

    /**
     * @override
     */
    GMagnificationAction.prototype.execute = function () {
        var view = gApp.getWindows().getActiveWindow().getView();
        var newZoom = this._magnification / 100.0;
        var zoomPoint = view.getViewTransform().mapPoint(new IFPoint(view.getWidth() / 2.0, view.getHeight() / 2.0));
        view.zoomAt(zoomPoint, newZoom);
    };

    /** @override */
    GMagnificationAction.prototype.toString = function () {
        return "[Object GMagnificationAction]";
    };

    _.GMagnificationAction = GMagnificationAction;
})(this);