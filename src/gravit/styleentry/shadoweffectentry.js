(function (_) {

    /**
     * Shadow effect style entry handler
     * @class GShadowEffectEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GShadowEffectEntry() {
    }

    IFObject.inherit(GShadowEffectEntry, GStyleEntry);

    /** @override */
    GShadowEffectEntry.prototype.getEntryClass = function () {
        return IFShadowEffect;
    };

    /** @override */
    GShadowEffectEntry.prototype.getEntryName = function () {
        // TODO : I18N
        return 'Shadow';
    };

    /** @override */
    GShadowEffectEntry.prototype.createContent = function (entry) {
        // TODO
        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    .append($('<div></div>')
                        .css('width', '5em')
                        .addClass('g-switch')
                        .append($('<label></label>')
                            .append($('<input>')
                                .attr('type', 'checkbox')
                                .attr('data-property', 'in'))
                            .append($('<span></span>')
                                .addClass('switch')
                                .attr({
                                    // TODO : I18N
                                    'data-on': 'Inside',
                                    'data-off': 'Outside'
                                }))))
                    .append($('<label></label>')
                        // TODO : I18N
                        .text('Shadow')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'x'))
                    .append($('<label></label>')
                        .text('X')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'y'))
                    .append($('<label></label>')
                        .text('Y')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'r'))
                    .append($('<label></label>')
                        .text('Blur')))
                .append($('<div></div>')
                    .append($('<button></button>')
                        .attr('data-property', 'cls')
                        .gColorButton({
                        }))
                    .append($('<label></label>')
                        .text('Color'))));
    };

    /** @override */
    GShadowEffectEntry.prototype.updateContent = function (content, entry) {
        content.find('[data-property="r"]').val(entry.getProperty('r'));
    };

    /** @override */
    GShadowEffectEntry.prototype.toString = function () {
        return "[Object GShadowEffectEntry]";
    };

    _.GShadowEffectEntry = GShadowEffectEntry;
})(this);