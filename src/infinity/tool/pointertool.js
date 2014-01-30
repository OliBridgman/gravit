(function (_) {
    /**
     * The pointer selection tool
     * @class GXPointerTool
     * @extends GXSelectTool
     * @constructor
     * @version 1.0
     */
    function GXPointerTool() {
        GXSelectTool.call(this);
    };

    GObject.inherit(GXPointerTool, GXSelectTool);

    /** @override */
    GXPointerTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXPointerTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M3.5,18.5v18l5-7h9L3.5,18.5z"/>\n</svg>\n';
    };

    /** @override */
    GXPointerTool.prototype.getHint = function () {
        return GXSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXPointerTool, "title"));
    };

    /** @override */
    GXPointerTool.prototype.getActivationCharacters = function () {
        return ['V', '0'];
    };

    /** override */
    GXPointerTool.prototype.toString = function () {
        return "[Object GXPointerTool]";
    };

    _.GXPointerTool = GXPointerTool;
})(this);