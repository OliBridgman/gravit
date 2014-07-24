(function (_) {

    /**
     * Action for inserting a layer
     * @class GAddLayerAction
     * @extends GAction
     * @constructor
     */
    function GAddLayerAction() {
    };
    IFObject.inherit(GAddLayerAction, GAction);

    GAddLayerAction.ID = 'modify.add-layer';
    GAddLayerAction.TITLE = new IFLocale.Key(GAddLayerAction, "title");

    /**
     * @override
     */
    GAddLayerAction.prototype.getId = function () {
        return GAddLayerAction.ID;
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.getTitle = function () {
        return GAddLayerAction.TITLE;
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.getGroup = function () {
        return "layer";
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.execute = function () {
        var scene = gApp.getActiveDocument().getScene();
        var activePage = scene.getActivePage();

        // TODO : I18N
        IFEditor.tryRunTransaction(activePage, function () {
            var layer = new IFLayer();
            layer.setProperty('name', 'Layer ' + scene.queryCount('layer').toString());
            activePage.appendChild(layer);
            scene.setActiveLayer(layer);
        }, ifLocale.get(this.getTitle()));
    };

    /** @override */
    GAddLayerAction.prototype.toString = function () {
        return "[Object GAddLayerAction]";
    };

    _.GAddLayerAction = GAddLayerAction;
})(this);