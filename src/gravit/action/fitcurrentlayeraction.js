(function (_) {

    /**
     * Action for fitting the current layer into the current view
     * @class GFitCurrentLayerAction
     * @extends GUIAction
     * @constructor
     */
    function GFitCurrentLayerAction() {
    };
    IFObject.inherit(GFitCurrentLayerAction, GUIAction);

    GFitCurrentLayerAction.ID = 'view.zoom.fit-current-layer';
    GFitCurrentLayerAction.TITLE = new IFLocale.Key(GFitCurrentLayerAction, "title");

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getId = function () {
        return GFitCurrentLayerAction.ID;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getTitle = function () {
        return GFitCurrentLayerAction.TITLE;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var activeLayer = document ? document.getEditor().getCurrentLayer() : null;

        return (activeLayer && activeLayer.getPaintBBox() && !activeLayer.getPaintBBox().isEmpty());
    };

    /**
     * @override
     */
    GFitCurrentLayerAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getActiveWindow().getView().zoomAll(document.getEditor().getCurrentLayer().getPaintBBox(), false);
    };

    /** @override */
    GFitCurrentLayerAction.prototype.toString = function () {
        return "[Object GFitCurrentLayerAction]";
    };

    _.GFitCurrentLayerAction = GFitCurrentLayerAction;
})(this);