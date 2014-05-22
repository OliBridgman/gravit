(function (_) {

    /**
     * Action for fitting everything into the current view
     * @class EXFitAllAction
     * @extends GUIAction
     * @constructor
     */
    function EXFitAllAction() {
    };
    IFObject.inherit(EXFitAllAction, GUIAction);

    EXFitAllAction.ID = 'view.zoom.fit.all';
    EXFitAllAction.TITLE = new IFLocale.Key(EXFitAllAction, "title");

    /**
     * @override
     */
    EXFitAllAction.prototype.getId = function () {
        return EXFitAllAction.ID;
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.getTitle = function () {
        return EXFitAllAction.TITLE;
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, 'O'];
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var paintBBox = document ? document.getScene().getPaintBBox() : null;
        return (paintBBox && !paintBBox.isEmpty());
    };

    /**
     * @override
     */
    EXFitAllAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getActiveWindow().getView().zoomAll(document.getScene().getPaintBBox(), false);
    };

    /** @override */
    EXFitAllAction.prototype.toString = function () {
        return "[Object EXFitAllAction]";
    };

    _.EXFitAllAction = EXFitAllAction;
})(this);