(function (_) {

    /**
     * The shared style class
     * @class IFSharedStyle
     * @extends IFStyle
     * @mixes IFNode.Container
     * @mixes IFNode.Reference
     * @constructor
     */
    function IFSharedStyle() {
        IFStyle.call(this);
        this._setDefaultProperties(IFSharedStyle.MetaProperties);
    }

    IFNode.inheritAndMix('sharedStyle', IFSharedStyle, IFStyle, [IFNode.Container, IFNode.Reference]);

    /**
     * The meta properties of a shared style with their default values
     */
    IFSharedStyle.MetaProperties = {
        name: null
    };

    /** @override */
    IFSharedStyle.prototype.prepareGeometryChange = function () {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link instanceof IFStyle) {
                    link.prepareGeometryChange();
                }
            });
        }
        IFStyle.prototype.prepareGeometryChange.call(this);
    };

    /** @override */
    IFSharedStyle.prototype.finishGeometryChange = function () {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link instanceof IFStyle) {
                    link.finishGeometryChange();
                }
            });
        }
        IFStyle.prototype.finishGeometryChange.call(this);
    };

    /** @override */
    IFSharedStyle.prototype.visualChange = function () {
        var scene = this.getScene();
        if (scene) {
            scene.visitLinks(this, function (link) {
                if (link instanceof IFStyle) {
                    link.visualChange();
                }
            });
        }
        IFStyle.prototype.visualChange.call(this);
    };

    /** @override */
    IFSharedStyle.prototype.store = function (blob) {
        if (IFStyle.prototype.store.call(this, blob)) {
            this.storeProperties(blob, IFSharedStyle.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFSharedStyle.prototype.restore = function (blob) {
        if (IFStyle.prototype.restore.call(this, blob)) {
            this.restoreProperties(blob, IFSharedStyle.MetaProperties);
            return true;
        }
        return false;
    };

    /** @override */
    IFSharedStyle.prototype.validateInsertion = function (parent, reference) {
        return parent instanceof IFScene.StyleCollection;
    };

    /** @override */
    IFSharedStyle.prototype.toString = function () {
        return "[IFSharedStyle]";
    };

    _.IFSharedStyle = IFSharedStyle;
})(this);