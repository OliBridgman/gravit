(function (_) {
    /**
     * The page tool
     * @class IFPageTool
     * @extends IFSelectTool
     * @constructor
     * @version 1.0
     */
    function IFPageTool() {
        IFSelectTool.call(this);
    };

    IFObject.inherit(IFPageTool, IFSelectTool);

    /** @override */
    IFPageTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    IFPageTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M15.5,18.5v10h-1v-9h-7v3h-3v10h3v1h-4v-12l3-3H15.5z M8.5,25.5v11l3.5-4h5.5L8.5,25.5z"/>\n</svg>\n';
    };

    /** @override */
    IFPageTool.prototype.getHint = function () {
        return IFSelectTool.prototype.getHint.call(this)
            .setTitle(new IFLocale.Key(IFPageTool, "title"));
    };

    /** @override */
    IFPageTool.prototype.getActivationCharacters = function () {
        return ['D'];
    };

    /** @override */
    IFPageTool.prototype._getSelectableElement = function (element) {
        for (var p = element; p !== null; p = p.getParent()) {
            if (p instanceof IFPage) {
                return p;
            }
        }

        return null;
    };

    /** override */
    IFPageTool.prototype.toString = function () {
        return "[Object IFPageTool]";
    };

    _.IFPageTool = IFPageTool;
})(this);