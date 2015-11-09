(function (_) {

    /**
     * Action for fitting everything into the current view
     * @class GFitAllAction
     * @extends GAction
     * @constructor
     */
    function GFitAllAction() {
    };
    GObject.inherit(GFitAllAction, GAction);

    GFitAllAction.ID = 'view.zoom.fit.all';
    GFitAllAction.TITLE = new GLocale.Key(GFitAllAction, "title");

    /**
     * @override
     */
    GFitAllAction.prototype.getId = function () {
        return GFitAllAction.ID;
    };

    /**
     * @override
     */
    GFitAllAction.prototype.getTitle = function () {
        return GFitAllAction.TITLE;
    };

    /**
     * @override
     */
    GFitAllAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GFitAllAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GFitAllAction.prototype.getShortcut = function () {
        return [GKey.Constant.META, 'O'];
    };

    /**
     * @override
     */
    GFitAllAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var paintBBox = document ? document.getScene().getPaintBBox() : null;
        return (paintBBox && !paintBBox.isEmpty());
    };

    /**
     * @override
     */
    GFitAllAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getActiveWindow().getView().zoomAll(document.getScene().getPaintBBox(), false);
    };

    /** @override */
    GFitAllAction.prototype.toString = function () {
        return "[Object GFitAllAction]";
    };

    _.GFitAllAction = GFitAllAction;
})(this);