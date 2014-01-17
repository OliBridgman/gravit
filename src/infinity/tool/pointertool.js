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
    GXPointerTool.prototype.getImageClass = function () {
        return 'g-tool-pointer';
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