(function (_) {
    var cssBackgroundUrl = null;

    /**
     * A background pattern
     * @class GBackground
     * @extends GPattern
     * @constructor
     */
    function GBackground() {
    }

    GPattern.inherit('B', GBackground);

    /**
     * Compare two backgrounds for equality Also takes care of null parameters
     * @param {GBackground} left left side
     * @param {GBackground} right right side
     * @return {Boolean} true if left and right are equal (also if they're null!)
     */
    GBackground.equals = function (left, right) {
        if (!left && left === right) {
            return true;
        } else if (left && right) {
            return true;
        }
        return false;
    };

    /** @override */
    GBackground.prototype.asCSSBackground = function (opacity) {
        if (!cssBackgroundUrl) {
            cssBackgroundUrl = 'url("data:image/svg+xml;base64,' +
            btoa('<svg xmlns="http://www.w3.org/2000/svg" width="10" height="20" viewBox="0 0 5 10"><rect width="110%" x="-5%" y="-5%" height="110%" fill="#545454"/><line x1="-2" y1="1" x2="7" y2="10" stroke="#6e6e6e" stroke-width="2"/><line x1="-2" y1="6" x2="7" y2="15" stroke="#6e6e6e" stroke-width="2"/><line x1="-2" y1="-4" x2="7" y2="5" stroke="#6e6e6e" stroke-width="2"/></svg>') +
            '")';
        }
        return cssBackgroundUrl;
    };

    /** @override */
    GBackground.prototype.toString = function () {
        return "[Object GBackground]";
    };

    _.GBackground = GBackground;
})(this);