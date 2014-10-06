(function (_) {
    /**
     * A class representing a RGB Color
     * @param {RGB} rgb
     * @class IFRGBColor
     * @extends IFColor
     * @constructor
     */
    function IFRGBColor(rgb) {
        IFColor.call(this, rgb);
    }

    IFPattern.inherit('C', IFRGBColor, IFColor);

    /** @override */
    IFRGBColor.prototype.toString = function () {
        return "[Object IFRGBColor]";
    };

    _.IFRGBColor = IFRGBColor;
})(this);