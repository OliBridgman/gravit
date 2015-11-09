(function (_) {

    /**
     * Action for inserting a layer
     * @class GAddLayerAction
     * @extends GAction
     * @constructor
     */
    function GAddLayerAction() {
    };
    GObject.inherit(GAddLayerAction, GAction);

    GAddLayerAction.ID = 'modify.add-layer';
    GAddLayerAction.TITLE = new GLocale.Key(GAddLayerAction, "title");

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
        return GApplication.CATEGORY_MODIFY_LAYER;
    };

    /**
     * @override
     */
    GAddLayerAction.prototype.getGroup = function () {
        return "structure/modify";
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

        // TODO : I18N
        GEditor.tryRunTransaction(scene, function () {
            var layer = new GLayer();
            layer.setProperty('name', 'Layer ' + scene.queryCount('layer').toString());
            scene.appendChild(layer);
            scene.setActiveLayer(layer);
        }, ifLocale.get(this.getTitle()));
    };

    /** @override */
    GAddLayerAction.prototype.toString = function () {
        return "[Object GAddLayerAction]";
    };

    _.GAddLayerAction = GAddLayerAction;
})(this);