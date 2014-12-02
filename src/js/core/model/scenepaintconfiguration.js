(function (_) {
    /**
     * A paint configuration for model painting
     * @class GScenePaintConfiguration
     * @constructor
     * @extends GPaintConfiguration
     */
    function GScenePaintConfiguration() {
    }

    GObject.inherit(GScenePaintConfiguration, GPaintConfiguration);

    /**
     * The paint mode of painting
     * @enum
     */
    GScenePaintConfiguration.PaintMode = {
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
     * Localized names for GScenePaintConfiguration.PaintMode
     */
    GScenePaintConfiguration.PaintModeName = {
        'F': new GLocale.Key(GScenePaintConfiguration, 'paint.full'),
        'S': new GLocale.Key(GScenePaintConfiguration, 'paint.fast'),
        'L': new GLocale.Key(GScenePaintConfiguration, 'paint.outline'),
        'O': new GLocale.Key(GScenePaintConfiguration, 'paint.output')
    };

    /**
     * The current paint mode
     * @type {GScenePaintConfiguration.PaintMode}
     */
    GScenePaintConfiguration.prototype.paintMode = GScenePaintConfiguration.PaintMode.Fast;

    /**
     * Whether to paint in pixel mode or not
     * @type {Boolean}
     */
    GScenePaintConfiguration.prototype.pixelMode = false;

    /**
     * Whether to clip to page bounds or not
     * @type {Boolean}
     */
    GScenePaintConfiguration.prototype.clipToPage = false;

    /**
     * Whether to show guides or not
     * @type {Boolean}
     */
    GScenePaintConfiguration.prototype.guides = true;

    /**
     * Whether to show slices or not
     * @type {Boolean}
     */
    GScenePaintConfiguration.prototype.slices = true;

    /**
     * Whether to show annotations or not (guides, slices, margins, etc.)
     * @type {Boolean}
     */
    GScenePaintConfiguration.prototype.annotations = true;

    /**
     * A clip area defining the area of paint for the scene
     * @type {GRect}
     */
    GScenePaintConfiguration.prototype.clipArea = null;

    /**
     * Checks and returns whether to paint outlined or not
     * @param {GPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GScenePaintConfiguration.prototype.isOutline = function (context) {
        if (this.paintMode === GScenePaintConfiguration.PaintMode.Outline) {
            return true;
        }
        if (context && context.isOutline()) {
            return true;
        }
        return false;
    };

    /**
     * Checks and returns whether to paint annotations or not
     * @param {GPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GScenePaintConfiguration.prototype.isAnnotationsVisible = function (context) {
        if (!this.annotations || this.paintMode === GScenePaintConfiguration.PaintMode.Output) {
            return false;
        }
        return true;
    };

    /**
     * Checks and returns whether to paint guides or not
     * @param {GPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GScenePaintConfiguration.prototype.isGuidesVisible = function (context) {
        if (!this.guides || !this.isAnnotationsVisible()) {
            return false;
        }
        return true;
    };

    /**
     * Checks and returns whether to paint slices or not
     * @param {GPaintContext} [context] optional context
     * to include when checking
     * @returns {boolean}
     */
    GScenePaintConfiguration.prototype.isSlicesVisible = function (context) {
        if (!this.slices || !this.isAnnotationsVisible()) {
            return false;
        }
        return true;
    };

    /**
     * Tests and returns whether to clip to page or not
     * @param context
     */
    GScenePaintConfiguration.prototype.isClipToPage = function (context) {
        return (this.clipToPage || this.paintMode === GScenePaintConfiguration.PaintMode.Output);
    };

    /** @override */
    GScenePaintConfiguration.prototype.toString = function () {
        return "[Object GScenePaintConfiguration]";
    };

    _.GScenePaintConfiguration = GScenePaintConfiguration;
})(this);