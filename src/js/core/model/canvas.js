(function (_) {
    /**
     * A canvas scene
     * @class GCanvas
     * @extends GScene
     * @constructor
     */
    function GCanvas(workspace) {
        GScene.call(this, workspace);
        this._setDefaultProperties(GCanvas.MetaProperties);
    };
    GNode.inherit("canvas", GCanvas, GScene);

    /**
     * The meta properties of a canvas and their defaults
     */
    GCanvas.MetaProperties = {
        /** The horizontal grid size */
        gx: 10,
        /** The vertical grid size */
        gy: 10,
        /** Whether the grid is active or not */
        ga: false
    };

    /** @override */
    GCanvas.prototype._handleChange = function (change, args) {
        if (change === GNode._Change.Store) {
            this.storeProperties(args, GCanvas.MetaProperties);
        } else if (change === GNode._Change.Restore) {
            this.restoreProperties(args, GCanvas.MetaProperties);
        }

        GScene.prototype._handleChange.call(this, change, args);
    };

    _.GCanvas = GCanvas;
})(this);