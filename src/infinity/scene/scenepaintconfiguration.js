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

    /** @override */
    GXScenePaintConfiguration.prototype.toString = function () {
        return "[Object GXScenePaintConfiguration]";
    };

    _.GXScenePaintConfiguration = GXScenePaintConfiguration;
})(this);