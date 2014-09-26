(function (_) {
    var SVG_CHESSBOARD_CSS_URL = 'url("data:image/svg+xml;base64,' +
        btoa('<svg xmlns="http://www.w3.org/2000/svg" width="8" height="8"><rect width="8" height="8" fill="white"/><rect width="4" height="4" fill="#CDCDCD"/><rect x="4" y="4" width="4" height="4" fill="#CDCDCD"/></svg>') +
        '")';
    var SVG_BACKGROUND_CSS_URL = 'url("data:image/svg+xml;base64,' +
        btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 5 10"><rect width="110%" x="-5%" y="-5%" height="110%" fill="#545454"/><line x1="-2" y1="1" x2="7" y2="10" stroke="#6e6e6e" stroke-width="2"/><line x1="-2" y1="6" x2="7" y2="15" stroke="#6e6e6e" stroke-width="2"/><line x1="-2" y1="-4" x2="7" y2="5" stroke="#6e6e6e" stroke-width="2"/></svg>') +
        '")';

    /**
     * A base class for patterns like color, gradients, etc.
     * @mixin IFGradient
     * @constructor
     */
    function IFPattern() {
    }

    /**
     * The type of the pattern
     * @enum
     */
    IFPattern.Type = {
        Background: 'B',
        Color: 'C',
        Gradient: 'G'
    };

    /**
     * Pattern's mime-type
     * @type {string}
     */
    IFPattern.MIME_TYPE = "application/infinity+pattern";

    // --------------------------------------------------------------------------------------------
    // IFPattern._Background Class
    // --------------------------------------------------------------------------------------------
    /**
     * @class IFPattern._Background
     * @extends IFPattern
     * @private
     */
    IFPattern._Background = function () {
    }
    IFObject.inherit(IFPattern._Background, IFPattern);

    /** @override */
    IFPattern._Background.prototype.getPatternType = function () {
        return IFPattern.Type.Background;
    };

    IFPattern.BACKGROUND = new IFPattern._Background();

    /**
     * Compares if two patterns are equal or not
     * @param {IFPattern} left
     * @param {IFPattern} right
     * @return {Boolean}
     */
    IFPattern.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            if (left instanceof IFColor && right instanceof IFColor) {
                return IFColor.equals(left, right);
            } else if (left instanceof IFGradient && right instanceof IFGradient) {
                return IFGradient.equals(left, right);
            } else if (left instanceof IFPattern && right instanceof IFPattern && left.getPatternType() === right.getPatternType() && left.getPatternType() === IFPattern.Type.Background) {
                return true;
            }
        }
        return false;
    };

    /**
     * Parse a pattern string
     * @param string
     * @returns {IFPattern}
     */
    IFPattern.parsePattern = function (string) {
        if (string && string.length > 0) {
            var type = string.charAt(0);
            string = string.substring(1);
            if (type === IFPattern.Type.Background) {
                return IFPattern.BACKGROUND;
            } else if (type === IFPattern.Type.Color) {
                return IFColor.parseColor(string);
            } else if (type === IFPattern.Type.Gradient) {
                return IFGradient.parseGradient(string);
            }
        }
        return null;
    };

    /**
     * Convert a pattern into a string
     * @param pattern
     * @returns {String}
     */
    IFPattern.asString = function (pattern) {
        if (pattern) {
            return pattern.getPatternType() + pattern.asString();
        }
        return null;
    };

    IFPattern.asCSSBackground = function (pattern) {
        var result = SVG_CHESSBOARD_CSS_URL;
        if (pattern) {
            switch (pattern.getPatternType()) {
                case IFPattern.Type.Background:
                    result = SVG_BACKGROUND_CSS_URL;
                    break;
                case IFPattern.Type.Color:
                    result = 'linear-gradient(' + pattern.asCSSString() + ', ' + pattern.asCSSString() + '), ' + result;
                    break;
                case IFPattern.Type.Gradient:
                    result = pattern.asCSSBackgroundString() + ', ' + result;
                    break;
            }
        }
        return result;
    };

    // --------------------------------------------------------------------------------------------
    // IFPattern Class
    // --------------------------------------------------------------------------------------------

    /**
     * Returns the pattern type
     * @return {IFPattern.Type}
     */
    IFPattern.prototype.getPatternType = function () {
        throw new Error('Not supported');
    };

    /**
     * @return {String}
     */
    IFPattern.prototype.asString = function () {
        return '';
    };

    _.IFPattern = IFPattern;
})(this);