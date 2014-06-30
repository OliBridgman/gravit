(function (_) {

    /**
     * Fill paint style entry handler
     * @class GFillPaintEntry
     * @extends GAreaPaintEntry
     * @constructor
     */
    function GFillPaintEntry() {
        GAreaPaintEntry.call(this);
    }
    IFObject.inherit(GFillPaintEntry, GAreaPaintEntry);

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
    GFillPaintEntry.prototype.createContent = function (scene, assign, revert) {
        return GAreaPaintEntry.prototype.createContent.call(this, scene, assign, revert);
    };

    /** @override */
    GFillPaintEntry.prototype.updateProperties = function (content, entry, scene) {
        GAreaPaintEntry.prototype.updateProperties.call(this, content, entry, scene);
        // TODO
    };

    /** @override */
    GFillPaintEntry.prototype.toString = function () {
        return "[Object GFillPaintEntry]";
    };

    _.GFillPaintEntry = GFillPaintEntry;
})(this);