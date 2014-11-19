(function (_) {
    /**
     * The pointer selection tool
     * @class GPointerTool
     * @extends GSelectTool
     * @constructor
     * @version 1.0
     */
    function GPointerTool() {
        GSelectTool.call(this);
    };

    GObject.inherit(GPointerTool, GSelectTool);

    /** override */
    GPointerTool.prototype.toString = function () {
        return "[Object GPointerTool]";
    };

    _.GPointerTool = GPointerTool;
})(this);