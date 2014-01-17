(function (_) {

    /**
     * Action for reseting the current view to the original view
     * @class EXOriginalViewAction
     * @extends GUIAction
     * @constructor
     */
    function EXOriginalViewAction() {
    };
    GObject.inherit(EXOriginalViewAction, GUIAction);

    EXOriginalViewAction.ID = 'view.zoom.original';
    EXOriginalViewAction.TITLE = new GLocale.Key(EXOriginalViewAction, "title");

    /**
     * @override
     */
    EXOriginalViewAction.prototype.getId = function () {
        return EXOriginalViewAction.ID;
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.getTitle = function () {
        return EXOriginalViewAction.TITLE;
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.getShortcut = function () {
        return [GUIKey.Constant.META, '0'];
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    EXOriginalViewAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        var paintBBox = document.getScene().getPaintBBox();
        document.getActiveWindow().getView().zoomAtCenter(paintBBox && !paintBBox.isEmpty() ? paintBBox.getSide(GRect.Side.CENTER) : new GPoint(0, 0), 1.0);
    };

    /** @override */
    EXOriginalViewAction.prototype.toString = function () {
        return "[Object EXOriginalViewAction]";
    };

    _.EXOriginalViewAction = EXOriginalViewAction;
})(this);