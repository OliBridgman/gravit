(function (_) {
    /**
     * A paint configuration for model painting
     * @class GXScenePaintConfiguration
     * @constructor
     * @extends GXPaintConfiguration
     */
    function GXScenePaintConfiguration() {
    }

    GObject.inherit(GXScenePaintConfiguration, GXPaintConfiguration);

    /**
     * The paint mode of painting
     * @enum
     */
    GXScenePaintConfiguration.PaintMode = {
        /**
         * Full painting in highest quality
         * including annotations
         */
        Full: 'F',

        /**
         * Fast painting in lower quality,
         * including annotations
         */
        Fast: 'S',

        /**
         * Outline painting
         * including annotations
         */
        Outline: 'L',

        /**
         * Full painting in highest quality
         * excluding annotations and clipping
         * to paper
         */
        Output: 'O'
    };

    /**
     * Localized names for GXScenePaintConfiguration.PaintMode
     */
    GXScenePaintConfiguration.PaintModeName = {
        'F': new GLocale.Key(GXScenePaintConfiguration, 'paint.full'),
        'S': new GLocale.Key(GXScenePaintConfiguration, 'paint.fast'),
        'L': new GLocale.Key(GXScenePaintConfiguration, 'paint.outline'),
        'O': new GLocale.Key(GXScenePaintConfiguration, 'paint.output')
    };

    /**
     * The current paint mode
     * @type {GXScenePaintConfiguration.PaintMode}
     */
    GXScenePaintConfiguration.prototype.paintMode = GXScenePaintConfiguration.PaintMode.Full;

    /**
     * Whether to render in pixel mode or not
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.pixelMode = false;

    /**
     * Whether to render single page only or not (will also not paint page decorations)
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.singlePageMode = false;

    /**
     * Whether to show guides or not
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.guides = true;

    /**
     * Whether to show annotations or not (guides, margins, etc.)
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.annotations = true;

    /**
     * Whether to show page-margin or not
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.pageMargin = true;

    /**
     * Whether to show page-gutter or not
     * @type {Boolean}
     */
    GXScenePaintConfiguration.prototype.pageGutter = true;

    /**
     * The transparent color
     * @type {Number}
     */
    GXScenePaintConfiguration.prototype.transparentColor = gColor.build(223, 223, 223);

    /**
     * The pasteboard color
     * @type {Number}
     */
    GXScenePaintConfiguration.prototype.pasteboardColor = gColor.build(176, 176, 176);

    /**
     * The page margin color
     * @type {Number}
     */
    GXScenePaintConfiguration.prototype.pageMarginColor = gColor.build(255, 0, 255, 128);

    /**
     * The gutter color
     * @type {Number}
     */
    GXScenePaintConfiguration.prototype.pageGutterColor = gColor.build(255, 0, 0);

    /**
     * Checks and returns whether to paint outlined or not
     * @param {GXPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GXScenePaintConfiguration.prototype.isOutline = function (context) {
        if (this.paintMode === GXScenePaintConfiguration.PaintMode.Outline) {
            return true;
        }
        if (context && context.isOutline()) {
            return context.isOutline();
        }
        return false;
    };

    /**
     * Checks and returns whether to paint annotations or not
     * @param {GXPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GXScenePaintConfiguration.prototype.isAnnotationsVisible = function (context) {
        if (!this.annotations || this.paintMode === GXScenePaintConfiguration.PaintMode.Output) {
            return false;
        }
        return true;
    };

    /**
     * Checks and returns whether to paint guides or not
     * @param {GXPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GXScenePaintConfiguration.prototype.isGuidesVisible = function (context) {
        if (!this.guides || !this.isAnnotationsVisible()) {
            return false;
        }
        return true;
    };

    /**
     * Checks and returns whether to paint page margins or not
     * @param {GXPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GXScenePaintConfiguration.prototype.isPageMarginVisible = function (context) {
        if (!this.pageMargin || !this.isAnnotationsVisible()) {
            return false;
        }
        return true;
    };

    /**
     * Checks and returns whether to paint page gutter or not
     * @param {GXPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GXScenePaintConfiguration.prototype.isPageGutterVisible = function (context) {
        if (!this.pageGutter || !this.isAnnotationsVisible()) {
            return false;
        }
        return true;
    };

    /** @override */
    GXScenePaintConfiguration.prototype.toString = function () {
        return "[Object GXScenePaintConfiguration]";
    };

    _.GXScenePaintConfiguration = GXScenePaintConfiguration;
})(this);