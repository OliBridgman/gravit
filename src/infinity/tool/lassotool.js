(function (_) {
    /**
     * The lasso select tool
     * @class GXLassoTool
     * @extends GXMarqueeTool
     * @constructor
     */
    function GXLassoTool() {
        GXMarqueeTool.call(this, new GXLassoTool._AreaSelector());
    };

    GObject.inherit(GXLassoTool, GXMarqueeTool);

    // -----------------------------------------------------------------------------------------------------------------
    // GXLassoTool._AreaSelector Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @class GXLassoTool._AreaSelector
     * @extends GXMarqueeTool._AreaSelector
     * @private
     */
    GXLassoTool._AreaSelector = function () {
        GXMarqueeTool._AreaSelector.call(this);
    };
    GObject.inherit(GXLassoTool._AreaSelector, GXMarqueeTool._AreaSelector);

    /**
     * @type {GPoint}
     * @private
     */
    GXLassoTool._AreaSelector.prototype._current = null;

    /** @override */
    GXLassoTool._AreaSelector.prototype.start = function (pos) {
        this._current = null;
    };

    /** @override */
    GXLassoTool._AreaSelector.prototype.move = function (pos) {
        if (this._current == null || Math.abs(pos.getX() - this._current.getX()) >= 3 || Math.abs(pos.getY() - this._current.getY()) >= 3) {
            this._vertexContainer.addVertex(this._vertexContainer.getCount() == 0 ? GXVertex.Command.Move : GXVertex.Command.Line, pos.getX(), pos.getY());
            this._current = pos;
        }
    };

    /** @override */
    GXLassoTool.prototype.getIcon = function () {
        return '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0.5 18.5 18 18">\n<path stroke="none" d="M13,31.7c-0.4,1.6-0.7,2.3-1.5,2.3c-1.5,0-2.1-1.1-2.3-2.1c0.2-0.3,0.3-0.6,0.3-0.9\n\tc0-0.1,0-0.2,0-0.3c0.7-0.4,1.3-1,2-1.6c1.3-1.3,2.3-2.9,2.7-4.3c0.5-1.6,0.3-2.9-0.6-3.7c-0.5-0.5-1.3-0.8-2.2-0.8\n\tc-1.8,0-4,1.1-5.9,3c-1.3,1.3-2.3,2.9-2.7,4.3c-0.5,1.6-0.3,2.9,0.6,3.7c0.5,0.5,1.3,0.8,2.2,0.8c0.4,0,0.8-0.1,1.3-0.2\n\tc0.3,0.3,0.7,0.6,1.2,0.6c0.1,0,0.2,0,0.3,0c0.4,1.3,1.4,2.5,3.2,2.5c1.7,0,2.1-1.6,2.5-3c0.5-1.9,0.9-3,2.5-3v-1\n\tC14,28,13.4,30.2,13,31.7z M4.1,30.6c-0.6-0.6-0.7-1.5-0.3-2.7c0.4-1.3,1.3-2.7,2.5-3.9c1.6-1.6,3.6-2.7,5.2-2.7\n\tc0.6,0,1.1,0.2,1.5,0.5c0.6,0.6,0.7,1.5,0.3,2.7c-0.4,1.3-1.3,2.7-2.5,3.9c-0.6,0.6-1.2,1-1.8,1.4c-0.3-0.2-0.6-0.4-1-0.4\n\tc-0.8,0-1.5,0.7-1.5,1.5c-0.3,0.1-0.6,0.1-0.9,0.1C5,31.1,4.5,30.9,4.1,30.6z"/>\n</svg>\n';
    };

    /** @override */
    GXLassoTool.prototype.getGroup = function () {
        return 'select';
    };

    /** @override */
    GXLassoTool.prototype.getHint = function () {
        return GXTool.prototype.getHint.call(this)
            .setTitle(new GLocale.Key(GXLassoTool, "title"));
    };

    /** @override */
    GXLassoTool.prototype.getCursor = function () {
        return GUICursor.Lasso;
    };

    /** override */
    GXLassoTool.prototype.toString = function () {
        return "[Object GXLassoTool]";
    };

    _.GXLassoTool = GXLassoTool;
})(this);