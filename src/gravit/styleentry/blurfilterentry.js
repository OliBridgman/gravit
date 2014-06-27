(function (_) {

    /**
     * Blur filter style entry handler
     * @class GBlurFilterEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GBlurFilterEntry() {
    }

    IFObject.inherit(GBlurFilterEntry, GStyleEntry);

    /** @override */
    GBlurFilterEntry.prototype.getEntryClass = function () {
        return IFBlurFilter;
    };

    /** @override */
    GBlurFilterEntry.prototype.getEntryName = function () {
        // TODO : I18N
        return 'Blur';
    };

    /** @override */
    GBlurFilterEntry.prototype.createContent = function (entry) {
        // TODO
        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    // TODO : I18N
                    .text('Blur'))
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
                        .attr('data-property', 'r'))));
    };

    /** @override */
    GBlurFilterEntry.prototype.updateContent = function (content, entry) {
        content.find('[data-property="r"]').val(entry.getProperty('r'));
    };

    /** @override */
    GBlurFilterEntry.prototype.toString = function () {
        return "[Object GBlurFilterEntry]";
    };

    _.GBlurFilterEntry = GBlurFilterEntry;
})(this);