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
    GOffsetVEffectEntry.prototype.createContent = function (scene, assign, revert) {
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
                        .attr('data-property', 'r')
                        .on('change', function (evt) {
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
                        })))
                .append($('<div></div>')
                    .append($('<select></select>')
                        .attr('data-property', 'tp')
                        .append($('<option></option>')
                            .attr('value', IFOffsetVEffect.OffsetType.Inset)
                            // TODO: I18N
                            .text('Inset'))
                        .append($('<option></option>')
                            .attr('value', IFOffsetVEffect.OffsetType.Outset)
                            // TODO: I18N
                            .text('Outset'))
                        .append($('<option></option>')
                            .attr('value', IFOffsetVEffect.OffsetType.Both)
                            // TODO: I18N
                            .text('Both'))
                        .on('change', function (evt) {
                            assign();
                        }))));
    };

    /** @override */
    GOffsetVEffectEntry.prototype.updateProperties = function (content, entry, scene) {
        content.find('[data-property="r"]').val(scene.pointToString(entry.getProperty('r')));
        content.find('[data-property="tp"]').val(entry.getProperty('tp'));
    };

    /** @override */
    GOffsetVEffectEntry.prototype.assignProperties = function (content, entry, scene) {
        entry.setProperties(['r', 'tp'], [
            scene.stringToPoint(content.find('[data-property="r"]:not([type="range"])').val()),
            content.find('[data-property="tp"]').val()
        ]);
    };

    /** @override */
    GOffsetVEffectEntry.prototype.toString = function () {
        return "[Object GOffsetVEffectEntry]";
    };

    _.GOffsetVEffectEntry = GOffsetVEffectEntry;
})(this);