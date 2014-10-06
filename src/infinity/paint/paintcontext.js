(function (_) {
    /**
     * A class representing a context for painting
     * @class IFPaintContext
     * @constructor
     */
    function IFPaintContext() {
        this.outlineColors = [];
        this.canvasStack = [];
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
     * A stack of canvases
     * @type {Array<IFPaintCanvas>}
     */
    IFPaintContext.prototype.canvasStack = null;

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
     * @type {Array<IFColor>}
     */
    IFPaintContext.prototype.outlineColors = null;

    /**
     * The current outline color for the selection
     * @type IFColor
     */
    IFPaintContext.prototype.selectionOutlineColor = new IFRGBColor([0, 168, 255]);

    /**
     * The current outline color for the highlight
     * @type IFColor
     */
    IFPaintContext.prototype.highlightOutlineColor = new IFRGBColor([255, 0, 0]);

    /**
     * The current outline color for the guides
     * @type IFColor
     */
    IFPaintContext.prototype.guideOutlineColor = new IFRGBColor([46, 204, 64]);

    /**
     * Returns whether the paint context is in outline/wireframe mode or not
     * @return {boolean}
     */
    IFPaintContext.prototype.isOutline = function () {
        return this.outlineColors && this.outlineColors.length > 0;
    };

    /**
     * Returns the current outline/wireframe color defaulting to black
     * @returns {IFColor}
     */
    IFPaintContext.prototype.getOutlineColor = function () {
        if (this.outlineColors && this.outlineColors.length > 0) {
            return this.outlineColors[this.outlineColors.length - 1];
        } else {
            // TODO : Take this from configuration, instead?
            return IFRGBColor.BLACK;
        }
    };

    /**
     * Return the root canvas
     * @returns {IFPaintCanvas}
     */
    IFPaintContext.prototype.getRootCanvas = function () {
        return this.canvasStack.length > 0 ? this.canvasStack[0] : this.canvas;
    };

    /**
     * Puts a new canvas to be the active one and pushes the previously
     * active one into the canvas stack and returns the previously active one
     * @param {IFPaintCanvas} canvas
     * @return {IFPaintCanvas}
     */
    IFPaintContext.prototype.pushCanvas = function (canvas) {
        var oldCanvas = this.canvas;
        this.canvasStack.push(this.canvas);
        this.canvas = canvas;
        return oldCanvas;
    };

    /**
     * Pop the active canvas making the previous one from the stack the active one
     */
    IFPaintContext.prototype.popCanvas = function () {
        if (this.canvasStack.length <= 0) {
            throw new Error('Invalid call, stack length is zero.');
        }

        this.canvas = this.canvasStack.pop();
    };

    /** @override */
    IFPaintContext.prototype.toString = function () {
        return "[Object IFPaintContext]";
    };

    _.IFPaintContext = IFPaintContext;
})(this);