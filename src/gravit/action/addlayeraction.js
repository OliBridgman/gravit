(function (_) {

    /**
     * Action for inserting a layer
     * @class GAddLayerAction
     * @extends GUIAction
     * @constructor
     */
    function GAddLayerAction() {
    };
    IFObject.inherit(GAddLayerAction, GUIAction);

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
        var editor = gApp.getActiveDocument().getEditor();
        var scene = editor.getScene();
        var target = scene.getActiveLayer() || scene.getActivePage();
        var layer = new IFLayer();
        layer.setProperties([
            'name'
        ], [
            // TODO : I18N
            'Layer ' + scene.queryCount('layer').toString()
        ]);

        editor.beginTransaction();
        try {
            target.appendChild(layer);
            scene.setActiveLayer(layer);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Add Layer');
        }
    };

    /** @override */
    GAddLayerAction.prototype.toString = function () {
        return "[Object GAddLayerAction]";
    };

    _.GAddLayerAction = GAddLayerAction;
})(this);