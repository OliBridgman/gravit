(function (_) {
    /**
     * A canvas scene
     * @class GCanvas
     * @extends GScene
     * @constructor
     */
    function GCanvas(workspace) {
        GScene.call(this, workspace);
    };
    GNode.inherit("canvas", GCanvas, GScene);

    _.GCanvas = GCanvas;
})(this);