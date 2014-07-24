(function (_) {

    /**
     * Action for deleting a layer
     * @class GDeleteLayerAction
     * @extends GAction
     * @constructor
     */
    function GDeleteLayerAction() {
    };
    IFObject.inherit(GDeleteLayerAction, GAction);

    GDeleteLayerAction.ID = 'modify.delete-layer';
    GDeleteLayerAction.TITLE = new IFLocale.Key(GDeleteLayerAction, "title");

    /**
     * @override
     */
    GDeleteLayerAction.prototype.getId = function () {
        return GDeleteLayerAction.ID;
    };

    /**
     * @override
     */
    GDeleteLayerAction.prototype.getTitle = function () {
        return GDeleteLayerAction.TITLE;
    };

    /**
     * @override
     */
    GDeleteLayerAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GDeleteLayerAction.prototype.getGroup = function () {
        return "layer";
    };

    /**
     * @param {IFLayer} [layer] the layer to be removed, if null takes the active one
     * @override
     */
    GDeleteLayerAction.prototype.isEnabled = function (layer) {
        if (!layer) {
            layer = gApp.getActiveDocument() ? gApp.getActiveDocument().getScene().getActiveLayer() : null;
        }

        return !!layer;
    };

    /**
     * @param {IFLayer} [layer] the layer to be removed, if null takes the active one
     * @override
     */
    GDeleteLayerAction.prototype.execute = function (layer) {
        var layer = layer || gApp.getActiveDocument().getScene().getActiveLayer();
        var scene = layer.getScene();

        if (!scene) {
            throw new Error('No scene on layer.');
        }

        // TODO : Implement
    };

    /** @override */
    GDeleteLayerAction.prototype.toString = function () {
        return "[Object GDeleteLayerAction]";
    };

    _.GDeleteLayerAction = GDeleteLayerAction;
})(this);