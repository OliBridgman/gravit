(function (_) {
    /**
     * The pointer selection tool
     * @class IFPointerTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
    function IFPointerTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFPointerTool, IFSelectTool);

    /** override */
    IFPointerTool.prototype.toString = function () {
        return "[Object IFPointerTool]";
    };

    _.IFPointerTool = IFPointerTool;
})(this);