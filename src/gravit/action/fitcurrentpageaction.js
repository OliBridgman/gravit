(function (_) {

    /**
     * Action for fitting the current page into the current view
     * @class EXFitCurrentPageAction
     * @extends GUIAction
     * @constructor
     */
    function EXFitCurrentPageAction() {
    };
    IFObject.inherit(EXFitCurrentPageAction, GUIAction);

    EXFitCurrentPageAction.ID = 'view.zoom.fit-current-page';
    EXFitCurrentPageAction.TITLE = new IFLocale.Key(EXFitCurrentPageAction, "title");

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.getId = function () {
        return EXFitCurrentPageAction.ID;
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.getTitle = function () {
        return EXFitCurrentPageAction.TITLE;
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.getShortcut = function () {
        return [IFKey.Constant.META, IFKey.Constant.SHIFT, 'W'];
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var currentPage = document ? document.getEditor().getCurrentPage() : null;

        return (currentPage && currentPage.getPaintBBox() && !currentPage.getPaintBBox().isEmpty());
    };

    /**
     * @override
     */
    EXFitCurrentPageAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getActiveWindow().getView().zoomAll(document.getEditor().getCurrentPage().getPaintBBox(), false);
    };

    /** @override */
    EXFitCurrentPageAction.prototype.toString = function () {
        return "[Object EXFitCurrentPageAction]";
    };

    _.EXFitCurrentPageAction = EXFitCurrentPageAction;
})(this);