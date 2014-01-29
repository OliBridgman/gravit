(function (_) {
    /**
     * The page tool
     * @class GXPageTool
     * @extends GXSelectTool
     * @constructor
     * @version 1.0
     */
    function GXPageTool() {
        GXSelectTool.call(this);
    };

    GObject.inherit(GXPageTool, GXSelectTool);

    /**
     * @type {String}
     * @private
     */
    GXPageTool.prototype._oldSelectQuery = null;

    /** @override */
    GXPageTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXPageTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M14.5,21.5v7h-1v-6h-6v2h-2v8h4v1h-5v-9l3-3H14.5z M10.5,27.5l0,7l2-3h4L10.5,27.5z"/>\n</svg>\n';
    };

    /** @override */
    GXPageTool.prototype.getHint = function () {
        return GXSelectTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXPageTool, "title"));
    };

    /** @override */
    GXPageTool.prototype.getActivationCharacters = function () {
        return ['D'];
    };

    /** @override */
    GXPageTool.prototype.activate = function (view, layer) {
        GXSelectTool.prototype.activate.call(this, view, layer);

        // Set editor selection query exclusively to pages
        this._oldSelectQuery = this._editor.getSelectQuery();
        this._editor.setSelectQuery('page');
    };

    /** @override */
    GXPageTool.prototype.deactivate = function (view, layer) {
        // Reset editor selection query to saved value
        this._editor.setSelectQuery(this._oldSelectQuery);
        this._oldSelectQuery = null;

        GXSelectTool.prototype.deactivate.call(this, view, layer);
    };

    /** @override */
    GXPageTool.prototype._isSelectable = function (node) {
        return node instanceof GXPage;
    };

    /** override */
    GXPageTool.prototype.toString = function () {
        return "[Object GXPageTool]";
    };

    _.GXPageTool = GXPageTool;
})(this);