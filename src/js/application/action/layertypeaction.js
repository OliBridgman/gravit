(function (_) {

    /**
     * Action for setting the type of the active layer
     * @class GLayerTypeAction
     * @extends GAction
     * @constructor
     */
    function GLayerTypeAction(layerType) {
        this._layerType = layerType;
    };
    GObject.inherit(GLayerTypeAction, GAction);

    GLayerTypeAction.ID = 'modify.layer-type';
    GLayerTypeAction.TITLE = new GLocale.Key(GLayerTypeAction, 'title');

    /**
     * @type {GLayer.Type}
     * @private
     */
    GLayerTypeAction.prototype._layerType = null;

    /**
     * @override
     */
    GLayerTypeAction.prototype.getId = function () {
        return GLayerTypeAction.ID + '.' + this._layerType;
    };

    /**
     * @override
     */
    GLayerTypeAction.prototype.getTitle = function () {
        return ifLocale.get(GLayerTypeAction.TITLE).replace('%name%',
            ifLocale.get(GLayer.TypeName[this._layerType]));
    };

    /**
     * @override
     */
    GLayerTypeAction.prototype.getCategory = function () {
        return GApplication.CATEGORY_MODIFY_LAYER;
    };

    /** @override */
    GLayerTypeAction.prototype.getGroup = function () {
        return "structure/type";
    };

    /** @override */
    GLayerTypeAction.prototype.isCheckable = function () {
        return true;
    };

    /**
     * @override
     */
    GLayerTypeAction.prototype.isChecked = function () {
        var activeLayer = gApp.getActiveDocument() ? gApp.getActiveDocument().getScene().getActiveLayer() : null;
        if (activeLayer) {
            return activeLayer.getProperty('tp') === this._layerType;
        }
        return false;
    };

    /**
     * @override
     */
    GLayerTypeAction.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /**
     * @override
     */
    GLayerTypeAction.prototype.execute = function () {
        var activeLayer = gApp.getActiveDocument() ? gApp.getActiveDocument().getScene().getActiveLayer() : null;
        if (activeLayer) {
            activeLayer.setProperty('tp', this._layerType);
        }
    };

    /** @override */
    GLayerTypeAction.prototype.toString = function () {
        return "[Object GLayerTypeAction]";
    };

    _.GLayerTypeAction = GLayerTypeAction;
})(this);