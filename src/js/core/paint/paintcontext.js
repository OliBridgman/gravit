(function (_) {
    /**
     * A class representing a context for painting
     * @class GPaintContext
     * @constructor
     */
    function GPaintContext() {
        this.outlineColors = [];
        this.canvasStack = [];
    }

    /**
     * The configuration for this context
     * @type {GPaintConfiguration}
     */
    GPaintContext.prototype.configuration = null;

    /**
     * The canvas this context is working on
     * @type GPaintCanvas
     * @version 1.0
     */
    GPaintContext.prototype.canvas = null;

    /**
     * A stack of canvases
     * @type {Array<GPaintCanvas>}
     */
    GPaintContext.prototype.canvasStack = null;

    /**
     * A dirty list matcher if painting dirty, may be null
     * @type GDirtyList.Matcher
     * @version 1.0
     */
    GPaintContext.prototype.dirtyMatcher = null;

    /**
     * An array of outline colors. If this has
     * entries, then painting should take place
     * as wireframe only and taking the last
     * outline color entry of this array
     * @type {Array<GColor>}
     */
    GPaintContext.prototype.outlineColors = null;

    /**
     * The current outline color for the selection
     * @type GColor
     */
    GPaintContext.prototype.selectionOutlineColor = new GRGBColor([0, 168, 255]);

    /**
     * The current outline color for the highlight
     * @type GColor
     */
    GPaintContext.prototype.highlightOutlineColor = new GRGBColor([255, 0, 0]);

    /**
     * The current outline color for the guides
     * @type GColor
     */
    GPaintContext.prototype.guideOutlineColor = new GRGBColor([46, 204, 64]);

    /**
     * Returns whether the paint context is in outline/wireframe mode or not
     * @return {boolean}
     */
    GPaintContext.prototype.isOutline = function () {
        return this.outlineColors && this.outlineColors.length > 0;
    };

    /**
     * Returns the current outline/wireframe color defaulting to black
     * @returns {GColor}
     */
    GPaintContext.prototype.getOutlineColor = function () {
        if (this.outlineColors && this.outlineColors.length > 0) {
            return this.outlineColors[this.outlineColors.length - 1];
        } else {
            // TODO : Take this from configuration, instead?
            return GRGBColor.BLACK;
        }
    };

    /**
     * Return the root canvas
     * @returns {GPaintCanvas}
     */
    GPaintContext.prototype.getRootCanvas = function () {
        return this.canvasStack.length > 0 ? this.canvasStack[0] : this.canvas;
    };

    /**
     * Puts a new canvas to be the active one and pushes the previously
     * active one into the canvas stack and returns the previously active one
     * @param {GPaintCanvas} canvas
     * @return {GPaintCanvas}
     */
    GPaintContext.prototype.pushCanvas = function (canvas) {
        var oldCanvas = this.canvas;
        this.canvasStack.push(this.canvas);
        this.canvas = canvas;
        return oldCanvas;
    };

    /**
     * Pop the active canvas making the previous one from the stack the active one
     */
    GPaintContext.prototype.popCanvas = function () {
        if (this.canvasStack.length <= 0) {
            throw new Error('Invalid call, stack length is zero.');
        }

        this.canvas = this.canvasStack.pop();
    };

    /** @override */
    GPaintContext.prototype.toString = function () {
        return "[Object GPaintContext]";
    };

    _.GPaintContext = GPaintContext;
})(this);