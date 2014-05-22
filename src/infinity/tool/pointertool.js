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

    GObject.inherit(IFPointerTool, IFSelectTool);

    /** @override */
    IFPointerTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    IFPointerTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z"/>\n</svg>\n';
    };

    /** @override */
    IFPointerTool.prototype.getHint = function () {
        return IFSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(IFPointerTool, "title"));
    };

    /** @override */
    IFPointerTool.prototype.getActivationCharacters = function () {
        return ['V', '0'];
    };

    /** override */
    IFPointerTool.prototype.toString = function () {
        return "[Object IFPointerTool]";
    };

    _.IFPointerTool = IFPointerTool;
})(this);