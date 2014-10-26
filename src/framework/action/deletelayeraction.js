(function (_) {

    /**
     * Action for deleting a layer
     * @class GDeleteLayerAction
     * @extends GAction
     * @constructor
     */
    function GDeleteLayerAction() {
    };
    GObject.inherit(GDeleteLayerAction, GAction);

    GDeleteLayerAction.ID = 'modify.delete-layer';
    GDeleteLayerAction.TITLE = new GLocale.Key(GDeleteLayerAction, "title");

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
     * @param {GLayer} [layer] the layer to be removed, if null takes the active one
     * @override
     */
    GDeleteLayerAction.prototype.isEnabled = function (layer) {
        if (!layer) {
            layer = gApp.getActiveDocument() ? gApp.getActiveDocument().getScene().getActiveLayer() : null;
        }

        return !!layer;
    };

    /**
     * @param {GLayer} [layer] the layer to be removed, if null takes the active one
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
            if (node instanceof GLayer) {
                otherLayer = node;
                break;
            }
        }

        if (!otherLayer) {
            for (var node = layer.getNext(); node !== null; node = node.getNext()) {
                if (node instanceof GLayer) {
                    otherLayer = node;
                    break;
                }
            }
        }

        if (!otherLayer && layer.getParent() instanceof GLayer) {
            otherLayer = layer.getParent();
        }

        // If there's no other layer, stop here as we need at least one layer in the scene
        if (!otherLayer) {
            // TODO : I18N
            vex.dialog.alert('Unable to delete - the page needs to contain at least one layer.');
            return;
        }

        // If layer is active, de-activate it first and activate the other one
        if (layer.hasFlag(GNode.Flag.Active)) {
            scene.setActiveLayer(otherLayer);
        }

        // Finally we can remove the layer
        // TODO : I18N
        GEditor.tryRunTransaction(scene, function () {
            layer.getParent().removeChild(layer);
        }, ifLocale.get(this.getTitle()));
    };

    /** @override */
    GDeleteLayerAction.prototype.toString = function () {
        return "[Object GDeleteLayerAction]";
    };

    _.GDeleteLayerAction = GDeleteLayerAction;
})(this);