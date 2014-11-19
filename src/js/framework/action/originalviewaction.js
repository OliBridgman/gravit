(function (_) {

    /**
     * Action for reseting the current view to the original view
     * @class GOriginalViewAction
     * @extends GAction
     * @constructor
     */
    function GOriginalViewAction() {
    };
    GObject.inherit(GOriginalViewAction, GAction);

    GOriginalViewAction.ID = 'view.zoom.original';
    GOriginalViewAction.TITLE = new GLocale.Key(GOriginalViewAction, "title");

    /**
     * @override
     */
    GOriginalViewAction.prototype.getId = function () {
        return GOriginalViewAction.ID;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getTitle = function () {
        return GOriginalViewAction.TITLE;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, '0'];
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GOriginalViewAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var paintBBox = document.getScene().getPaintBBox();
        document.getActiveWindow().getView().zoomAtCenter(paintBBox && !paintBBox.isEmpty() ? paintBBox.getSide(GRect.Side.CENTER) : new GPoint(0, 0), 1.0);
    };

    /** @override */
    GOriginalViewAction.prototype.toString = function () {
        return "[Object GOriginalViewAction]";
    };

    _.GOriginalViewAction = GOriginalViewAction;
})(this);