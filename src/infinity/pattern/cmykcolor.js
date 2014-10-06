(function (_) {
    /**
     * A class representing a CMYK Color
     * @param {CMYK} cmyk
     * @class IFCMYKColor
     * @extends IFColor
     * @constructor
     */
    function IFCMYKColor(cmyk) {
        IFColor.call(this, cmyk);
    }

    IFPattern.inherit('Y', IFCMYKColor, IFColor);

    /** @override */
    IFCMYKColor.prototype.toString = function () {
        return "[Object IFCMYKColor]";
    };

    _.IFCMYKColor = IFCMYKColor;
})(this);