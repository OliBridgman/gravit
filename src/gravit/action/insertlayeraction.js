(function (_) {

    /**
     * Action for inserting a layer
     * @class GInsertLayerAction
     * @extends GUIAction
     * @constructor
     */
    function GInsertLayerAction() {
    };
    GObject.inherit(GInsertLayerAction, GUIAction);

    GInsertLayerAction.ID = 'modify.insert-layer';
    GInsertLayerAction.TITLE = new GLocale.Key(GInsertLayerAction, "title");

    /**
     * @override
     */
    GInsertLayerAction.prototype.getId = function () {
        return GInsertLayerAction.ID;
    };

    /**
     * @override
     */
    GInsertLayerAction.prototype.getTitle = function () {
        return GInsertLayerAction.TITLE;
    };

    /**
     * @override
     */
    GInsertLayerAction.prototype.getCategory = function () {
        return EXApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GInsertLayerAction.prototype.getGroup = function () {
        return "insert";
    };

    /**
     * @override
     */
    GInsertLayerAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GInsertLayerAction.prototype.execute = function () {
        var editor = gApp.getActiveDocument().getEditor();
        var scene = editor.getScene();
        var target = editor.getCurrentLayer() || editor.getCurrentLayer() || editor.getScene();
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
            editor.setCurrentLayer(layer);
        } finally {
            // TODO : I18N
            editor.commitTransaction('Insert Layer');
        }
    };

    /** @override */
    GInsertLayerAction.prototype.toString = function () {
        return "[Object GInsertLayerAction]";
    };

    _.GInsertLayerAction = GInsertLayerAction;
})(this);