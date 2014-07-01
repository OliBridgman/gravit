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
    GBlurFilterEntry.prototype.createContent = function (scene, assign, revert) {
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
                        .attr('data-property', 'r')
                        .on('input', function (evt) {
                            var $this = $(this);
                            $this.parents('.g-form').find('[data-property="r"]:not([type="range"])').val($this.val());
                            assign();
                        })))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'r')
                        .on('change', function (evt) {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number' && value >= 0) {
                                assign();
                            } else {
                                revert();
                            }
                        }))));
    };

    /** @override */
    GBlurFilterEntry.prototype.updateProperties = function (content, entry, scene) {
        content.find('[data-property="r"]').val(scene.pointToString(entry.getProperty('r')));
    };

    /** @override */
    GBlurFilterEntry.prototype.assignProperties = function (content, entry, scene) {
        entry.setProperties(['r'], [scene.stringToPoint(content.find('[data-property="r"]:not([type="range"])').val())]);
    };

    /** @override */
    GBlurFilterEntry.prototype.toString = function () {
        return "[Object GBlurFilterEntry]";
    };

    _.GBlurFilterEntry = GBlurFilterEntry;
})(this);