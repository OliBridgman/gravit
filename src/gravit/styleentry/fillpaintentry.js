(function (_) {

    /**
     * Fill paint style entry handler
     * @class GFillPaintEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GFillPaintEntry() {
    }
    IFObject.inherit(GFillPaintEntry, GStyleEntry);

    /** @override */
    GFillPaintEntry.prototype.getEntryClass = function () {
        return IFFillPaint;
    };

    /** @override */
    GFillPaintEntry.prototype.getEntryName = function () {
        // TODO : I18N
        return 'Fill';
    };

    /** @override */
    GFillPaintEntry.prototype.createContent = function (entry) {
        // TODO
        return $('<div></div>')
            .append($('<select></select>')
                .gBlendMode())
            .append($('<input>')
                .css('width', '3em'))
            .append($('<div></div>')
                .css('margin-top', '5px')
                .gGradientEditor()
                .gGradientEditor('value', [
                    {
                        position: 0,
                        color: IFColor.parseCSSColor('red')
                    },
                    {
                        position: 100,
                        color: IFColor.parseCSSColor('yellow')
                    }
                ]));
    };

    /** @override */
    GFillPaintEntry.prototype.updateContent = function (content, entry) {
        // TODO
    };

    /** @override */
    GFillPaintEntry.prototype.toString = function () {
        return "[Object GFillPaintEntry]";
    };

    _.GFillPaintEntry = GFillPaintEntry;
})(this);