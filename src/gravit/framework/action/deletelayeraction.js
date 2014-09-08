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
        return GApplication.CATEGORY_MODIFY_LAYER;
    };

    /**
     * @override
     */
    GDeleteLayerAction.prototype.getGroup = function () {
        return "structure/modify";
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

        // Figure other layer either previous or next one or parent
        var otherLayer = null;

        for (var node = layer.getPrevious(); node !== null; node = node.getPrevious()) {
            if (node instanceof IFLayer) {
                otherLayer = node;
                break;
            }
        }

        if (!otherLayer) {
            for (var node = layer.getNext(); node !== null; node = node.getNext()) {
                if (node instanceof IFLayer) {
                    otherLayer = node;
                    break;
                }
            }
        }

        if (!otherLayer && layer.getParent() instanceof IFLayer) {
            otherLayer = layer.getParent();
        }

        // If there's no other layer, stop here as we need at least one layer in the scene
        if (!otherLayer) {
            // TODO : I18N
            alert('Unable to delete - the page needs to contain at least one layer.');
            return;
        }

        // If layer is active, de-activate it first and activate the other one
        if (layer.hasFlag(IFNode.Flag.Active)) {
            scene.setActiveLayer(otherLayer);
        }

        // Finally we can remove the layer
        // TODO : I18N
        IFEditor.tryRunTransaction(scene, function () {
            layer.getParent().removeChild(layer);
        }, ifLocale.get(this.getTitle()));
    };

    /** @override */
    GDeleteLayerAction.prototype.toString = function () {
        return "[Object GDeleteLayerAction]";
    };

    _.GDeleteLayerAction = GDeleteLayerAction;
})(this);