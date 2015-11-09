(function (_) {
    var SVG_CHESSBOARD_CSS_URL = 'url("data:image/svg+xml;base64,' +
        btoa('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="white"/><rect width="4" height="4" fill="#CDCDCD"/><rect x="4" y="4" width="4" height="4" fill="#CDCDCD"/></svg>') +
        '")';

    /**
     * A base class for patterns like color, gradients, etc.
     * @mixin GGradient
     * @constructor
     */
    function GPattern() {
    }

    /**
     * Pattern's mime-type
     * @type {string}
     */
    GPattern.MIME_TYPE = "application/infinity+pattern";

    GPattern.inherit = function (identifier, patternClass, patternSuperClass) {
        GObject.inherit(patternClass, patternSuperClass ? patternSuperClass : GPattern);
        GPattern._idClassMap[identifier] = patternClass;
    };

    GPattern._idClassMap = {};

    GPattern.smartCreate = function (patternClass, templatePattern) {
        if (!patternClass) {
            return null;
        } else if (patternClass === GBackground) {
            return new GBackground();
        } else if (patternClass === GGradient) {
            var stops = [
                {opacity: 1, position: 0},
                {opacity: 1, position: 1.0},
                {color: GRGBColor.WHITE, position: 0},
                {color: GRGBColor.BLACK, position: 1.0}];

            if (templatePattern instanceof GColor && !GUtil.equals(templatePattern.toScreen(), stops[3].color.toScreen())) {
                stops[2].color = templatePattern;
            }

            return new GLinearGradient(stops);
        } else if (patternClass === GColor) {
            if (templatePattern instanceof GGradient) {
                var stops = templatePattern.getStops();
                for (var i = 0; i < stops.length; ++i) {
                    if (stops[i].hasOwnProperty('color')) {
                        return stops[i].color;
                    }
                }
            }

            return new GRGBColor();
        } else {
            throw new Error('Unknown pattern class.');
        }
    };

    /**
     * Convert a pattern into a CSS-Compatible background string
     * @param {GPattern} pattern
     * @param {Number} [opacity] optional opacity (0..1), defaults to 1
     * @returns {*}
     */
    GPattern.asCSSBackground = function (pattern, opacity) {
        opacity = typeof opacity === 'number' ? opacity : 1;
        var result = SVG_CHESSBOARD_CSS_URL;
        if (pattern) {
            result = pattern.asCSSBackground(opacity) + ',' + result;
        }
        return result;
    };

    /**
     * Serialize a pattern
     * @param {GPattern} pattern
     * @returns {String}
     */
    GPattern.serialize = function (pattern) {
        if (pattern) {
            for (var id in GPattern._idClassMap) {
                if (pattern.constructor === GPattern._idClassMap[id]) {
                    return id + '#' + pattern.serialize();
                }
            }

            throw new Error('Unregistered Pattern Class.');
        }
        return null;
    };

    /**
     * Deserialize a pattern string
     * @param {String} string
     * @returns {GPattern}
     */
    GPattern.deserialize = function (string) {
        if (string) {
            var hash = string.indexOf('#');
            if (hash > 0) {
                var id = string.substr(0, hash);
                if (id && id.length > 0) {
                    var clazz = GPattern._idClassMap[id];
                    if (!clazz) {
                        throw new Error('Unregistered Pattern Class.');
                    }

                    var pattern = new clazz();
                    pattern.deserialize(string.substr(hash + 1));
                    return pattern;
                }
            }
        }
        return null;
    };

    /**
     * Called to convert this pattern into a css compatible background
     * @param {Number} opacity
     * @returns {string}
     */
    GPattern.prototype.asCSSBackground = function (opacity) {
        throw new Error('Not Supported');
    };

    /**
     * Called to serialize the pattern into a string
     * @return {String} the serialized string
     */
    GPattern.prototype.serialize = function () {
        return '';
    };

    /**
     * Called to deserialize the pattern from a string
     * @param {String} string the string to deserialize the pattern from
     */
    GPattern.prototype.deserialize = function (string) {
        // NO-OP
    };

    /**
     * Should return a clone of this pattern
     * @return {GPattern}
     */
    GPattern.prototype.clone = function () {
        throw new Error('Not Supported');
    };

    _.GPattern = GPattern;
})(this);