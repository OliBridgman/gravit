(function (_) {

    /**
     * Stroke paint style entry handler
     * @class GStrokePaintEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GStrokePaintEntry() {
    }
    IFObject.inherit(GStrokePaintEntry, GStyleEntry);

    /** @override */
    GStrokePaintEntry.prototype.getEntryClass = function () {
        return IFStrokePaint;
    };

    /** @override */
    GStrokePaintEntry.prototype.getEntryName = function () {
        // TODO : I18N
        return 'Stroke';
    };

    /** @override */
    GStrokePaintEntry.prototype.createContent = function (entry) {
        // TODO
        return $('<div></div>').text('STROKE CONTENTS');
    };

    /** @override */
    GStrokePaintEntry.prototype.updateContent = function (content, entry) {
        // TODO
    };

    /** @override */
    GStrokePaintEntry.prototype.toString = function () {
        return "[Object GStrokePaintEntry]";
    };

    _.GStrokePaintEntry = GStrokePaintEntry;
})(this);