(function (_) {
    var SVG_CHESSBOARD_CSS_URL = 'url("data:image/svg+xml;base64,' +
        btoa('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="white"/><rect width="4" height="4" fill="#CDCDCD"/><rect x="4" y="4" width="4" height="4" fill="#CDCDCD"/></svg>') +
        '")';

    /**
     * A base class for patterns like color, gradients, etc.
     * @mixin IFGradient
     * @constructor
     */
    function IFPattern() {
    }

    /**
     * Pattern's mime-type
     * @type {string}
     */
    IFPattern.MIME_TYPE = "application/infinity+pattern";

    IFPattern.inherit = function (identifier, patternClass, patternSuperClass) {
        IFObject.inherit(patternClass, patternSuperClass ? patternSuperClass : IFPattern);
        IFPattern._idClassMap[identifier] = patternClass;
    };

    IFPattern._idClassMap = {};

    IFPattern.smartCreate = function (patternClass, templatePattern) {
        if (!patternClass) {
            return null;
        } else if (patternClass === IFBackground) {
            return new IFBackground();
        } else if (patternClass === IFGradient) {
            var stops = [
                {opacity: 1, position: 0},
                {opacity: 1, position: 1.0},
                {color: IFRGBColor.WHITE, position: 0},
                {color: IFRGBColor.BLACK, position: 1.0}];

            if (templatePattern instanceof IFColor && !IFUtil.equals(templatePattern.toScreen(), stops[3].color.toScreen())) {
                stops[2].color = templatePattern;
            }

            return new IFLinearGradient(stops);
        } else if (patternClass === IFColor) {
            if (templatePattern instanceof IFGradient) {
                var stops = templatePattern.getStops();
                for (var i = 0; i < stops.length; ++i) {
                    if (stops[i].hasOwnProperty('color')) {
                        return stops[i].color;
                    }
                }
            }

            return new IFRGBColor();
        } else {
            throw new Error('Unknown pattern class.');
        }
    };

    /**
     * Convert a pattern into a CSS-Compatible background string
     * @param {IFPattern} pattern
     * @param {Number} [opacity] optional opacity (0..1), defaults to 1
     * @returns {*}
     */
    IFPattern.asCSSBackground = function (pattern, opacity) {
        opacity = typeof opacity === 'number' ? opacity : 1;
        var result = SVG_CHESSBOARD_CSS_URL;
        if (pattern) {
            result = pattern.asCSSBackground(opacity) + ',' + result;
        }
        return result;
    };

    /**
     * Serialize a pattern
     * @param {IFPattern} pattern
     * @returns {String}
     */
    IFPattern.serialize = function (pattern) {
        if (pattern) {
            for (var id in IFPattern._idClassMap) {
                if (pattern.constructor === IFPattern._idClassMap[id]) {
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
     * @returns {IFPattern}
     */
    IFPattern.deserialize = function (string) {
        if (string) {
            var hash = string.indexOf('#');
            if (hash > 0) {
                var id = string.substr(0, hash);
                if (id && id.length > 0) {
                    var clazz = IFPattern._idClassMap[id];
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
    IFPattern.prototype.asCSSBackground = function (opacity) {
        throw new Error('Not Supported');
    };

    /**
     * Called to serialize the pattern into a string
     * @return {String} the serialized string
     */
    IFPattern.prototype.serialize = function () {
        return '';
    };

    /**
     * Called to deserialize the pattern from a string
     * @param {String} string the string to deserialize the pattern from
     */
    IFPattern.prototype.deserialize = function (string) {
        // NO-OP
    };

    /**
     * Should return a clone of this pattern
     * @return {IFPattern}
     */
    IFPattern.prototype.clone = function () {
        throw new Error('Not Supported');
    };

    _.IFPattern = IFPattern;
})(this);