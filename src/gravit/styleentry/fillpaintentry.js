(function (_) {

    /**
     * Fill paint style entry handler
     * @class GFillPaintEntry
     * @extends GPatternPaintEntry
     * @constructor
     */
    function GFillPaintEntry() {
        GPatternPaintEntry.call(this);
    }
    IFObject.inherit(GFillPaintEntry, GPatternPaintEntry);

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
        return GPatternPaintEntry.prototype.createContent.call(this, scene, assign, revert);
    };

    /** @override */
    GFillPaintEntry.prototype.updateProperties = function (content, entry, scene) {
        GPatternPaintEntry.prototype.updateProperties.call(this, content, entry, scene);
        // TODO
    };

    /** @override */
    GFillPaintEntry.prototype.assignProperties = function (content, entry, scene) {
        var properties = [];
        var values = [];
        this._getPropertiesToAssign(content, entry, scene, properties, values);
        entry.setProperties(properties, values);
    };

    /** @override */
    GFillPaintEntry.prototype.toString = function () {
        return "[Object GFillPaintEntry]";
    };

    _.GFillPaintEntry = GFillPaintEntry;
})(this);