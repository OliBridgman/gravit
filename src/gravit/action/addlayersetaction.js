(function (_) {

    /**
     * Action for inserting a layer-set
     * @class GAddLayerSetAction
     * @extends GAction
     * @constructor
     */
    function GAddLayerSetAction() {
    };
    IFObject.inherit(GAddLayerSetAction, GAction);

    GAddLayerSetAction.ID = 'modify.add-layer-set';
    GAddLayerSetAction.TITLE = new IFLocale.Key(GAddLayerSetAction, "title");

    /**
     * @override
     */
    GAddLayerSetAction.prototype.getId = function () {
        return GAddLayerSetAction.ID;
    };

    /**
     * @override
     */
    GAddLayerSetAction.prototype.getTitle = function () {
        return GAddLayerSetAction.TITLE;
    };

    /**
     * @override
     */
    GAddLayerSetAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY;
    };

    /**
     * @override
     */
    GAddLayerSetAction.prototype.getGroup = function () {
        return "layer";
    };

    /**
     * @override
     */
    GAddLayerSetAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GAddLayerSetAction.prototype.execute = function () {
        var scene = gApp.getActiveDocument().getScene();
        var activePage = scene.getActivePage();

        // TODO : I18N
        IFEditor.tryRunTransaction(activePage, function () {
            var layerSet = new IFLayerSet();
            layerSet.setProperty('name', 'Layer Set ' + scene.queryCount('layerSet').toString());
            activePage.appendChild(layerSet);
        }, 'Add Layer Set');
    };

    /** @override */
    GAddLayerSetAction.prototype.toString = function () {
        return "[Object GAddLayerSetAction]";
    };

    _.GAddLayerSetAction = GAddLayerSetAction;
})(this);