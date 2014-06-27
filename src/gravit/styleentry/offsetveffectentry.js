(function (_) {

    /**
     * Offset vector effect style entry handler
     * @class GOffsetVEffectEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GOffsetVEffectEntry() {
    }

    IFObject.inherit(GOffsetVEffectEntry, GStyleEntry);

    /** @override */
    GOffsetVEffectEntry.prototype.getEntryClass = function () {
        return IFOffsetVEffect;
    };

    /** @override */
    GOffsetVEffectEntry.prototype.getEntryName = function () {
        // TODO : I18N
        return 'Offset';
    };

    /** @override */
    GOffsetVEffectEntry.prototype.createContent = function (entry) {
        // TODO
        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    // TODO : I18N
                    .text('Offset'))
                .append($('<div></div>')
                    .css('width', '100%')
                    .append($('<input>')
                        .css('width', '100%')
                        .attr('type', 'range')
                        .attr('min', '0')
                        .attr('max', '50')
                        .attr('data-property', 'r')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'r')))
                .append($('<div></div>')
                    .append($('<select></select>')
                        .append($('<option></option>')
                            .text('Inside'))
                        .append($('<option></option>')
                            .text('Outside'))
                        .append($('<option></option>')
                            .text('Both')))));
    };

    /** @override */
    GOffsetVEffectEntry.prototype.updateContent = function (content, entry) {
        content.find('[data-property="r"]').val(entry.getProperty('r'));
    };

    /** @override */
    GOffsetVEffectEntry.prototype.toString = function () {
        return "[Object GOffsetVEffectEntry]";
    };

    _.GOffsetVEffectEntry = GOffsetVEffectEntry;
})(this);