(function (_) {

    /**
     * Action for fitting the current layer into the current view
     * @class EXFitCurrentLayerAction
     * @extends GUIAction
     * @constructor
     */
    function EXFitCurrentLayerAction() {
    };
    IFObject.inherit(EXFitCurrentLayerAction, GUIAction);

    EXFitCurrentLayerAction.ID = 'view.zoom.fit-current-layer';
    EXFitCurrentLayerAction.TITLE = new IFLocale.Key(EXFitCurrentLayerAction, "title");

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.getId = function () {
        return EXFitCurrentLayerAction.ID;
    };

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.getTitle = function () {
        return EXFitCurrentLayerAction.TITLE;
    };

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_VIEW;
    };

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.getGroup = function () {
        return "zoom";
    };

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.isEnabled = function () {
        var document = gApp.getActiveDocument();
        var activeLayer = document ? document.getEditor().getCurrentLayer() : null;

        return (activeLayer && activeLayer.getPaintBBox() && !activeLayer.getPaintBBox().isEmpty());
    };

    /**
     * @override
     */
    EXFitCurrentLayerAction.prototype.execute = function () {
        var document = gApp.getActiveDocument();
        document.getActiveWindow().getView().zoomAll(document.getEditor().getCurrentLayer().getPaintBBox(), false);
    };

    /** @override */
    EXFitCurrentLayerAction.prototype.toString = function () {
        return "[Object EXFitCurrentLayerAction]";
    };

    _.EXFitCurrentLayerAction = EXFitCurrentLayerAction;
})(this);