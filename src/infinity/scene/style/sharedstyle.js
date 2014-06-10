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
    }

    IFNode.inheritAndMix('sharedStyle', IFSharedStyle, IFStyle, [IFNode.Container, IFNode.Reference]);

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
    };

    /** @override */
    IFSharedStyle.prototype.toString = function () {
        return "[IFSharedStyle]";
    };

    _.IFSharedStyle = IFSharedStyle;
})(this);