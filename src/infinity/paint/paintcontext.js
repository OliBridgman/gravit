(function (_) {
    /**
     * A class representing a context for painting
     * @class IFPaintContext
     * @constructor
     */
    function IFPaintContext() {
        this.outlineColors = [];
    }

    /**
     * The configuration for this context
     * @type {IFPaintConfiguration}
     */
    IFPaintContext.prototype.configuration = null;

    /**
     * The canvas this context is working on
     * @type IFPaintCanvas
     * @version 1.0
     */
    IFPaintContext.prototype.canvas = null;

    /**
     * A dirty list matcher if painting dirty, may be null
     * @type IFDirtyList.Matcher
     * @version 1.0
     */
    IFPaintContext.prototype.dirtyMatcher = null;

    /**
     * An array of outline colors. If this has
     * entries, then painting should take place
     * as wireframe only and taking the last
     * outline color entry of this array
     * @type {null}
     */
    IFPaintContext.prototype.outlineColors = null;

    /**
     * The current outline color for the selection
     * @type Number
     * @version 1.0
     */
    IFPaintContext.prototype.selectionOutlineColor = gColor.selectionOutline;

    /**
     * The current outline color for the highlight
     * @type Number
     * @version 1.0
     */
    IFPaintContext.prototype.highlightOutlineColor = gColor.highlightOutline;

    /**
     * Returns whether the paint context is in outline/wireframe mode or not
     * @return {boolean}
     */
    IFPaintContext.prototype.isOutline = function () {
        return this.outlineColors && this.outlineColors.length > 0;
    };

    /**
     * Returns the current outline/wireframe color defaulting to black
     * @returns {Number}
     */
    IFPaintContext.prototype.getOutlineColor = function () {
        if (this.outlineColors && this.outlineColors.length > 0) {
            return this.outlineColors[this.outlineColors.length - 1];
        } else {
            // TODO : Take this from configuration, instead?
            return gColor.build(0, 0, 0);
        }
    };

    /** @override */
    IFPaintContext.prototype.toString = function () {
        return "[Object IFPaintContext]";
    };

    _.IFPaintContext = IFPaintContext;
})(this);