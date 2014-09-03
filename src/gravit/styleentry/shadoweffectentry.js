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
    GShadowEffectEntry.prototype.createContent = function (scene, assign, revert) {
        // TODO
        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    .append($('<div></div>')
                        .css('width', '4.5em')
                        .append($('<label></label>')
                            .append($('<input>')
                                .attr('type', 'checkbox')
                                .attr('data-property', 'in')
                                .on('change', function () {
                                    assign();
                                }))))
                    .append($('<label></label>')
                        // TODO : I18N
                        .text('Shadow')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'x')
                        .on('change', function (evt) {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number') {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label></label>')
                        .text('X')))
                .append($('<div></div>')
                    .append($('<input>')
                        .css('width', '3em')
                        .attr('data-property', 'y')
                        .on('change', function (evt) {
                            var value = scene.stringToPoint($(this).val());
                            if (value !== null && typeof value === 'number') {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label></label>')
                        .text('Y')))
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
                        }))
                    .append($('<label></label>')
                        .text('Blur')))
                .append($('<div></div>')
                    .append($('<button></button>')
                        .attr('data-property', 'cls')
                        .gColorButton({
                            scene: scene
                        })
                        .on('colorchange', function (evt) {
                            assign();
                        }))
                    .append($('<label></label>')
                        .text('Color'))));
    };

    /** @override */
    GShadowEffectEntry.prototype.updateProperties = function (content, entry, scene) {
        content.find('[data-property="in"]').prop('checked', entry.getProperty('in'));
        content.find('[data-property="x"]').val(scene.pointToString(entry.getProperty('x')));
        content.find('[data-property="y"]').val(scene.pointToString(entry.getProperty('y')));
        content.find('[data-property="r"]').val(scene.pointToString(entry.getProperty('r')));
        content.find('[data-property="cls"]').gColorButton('value', entry.getProperty('cls'));
    };

    /** @override */
    GShadowEffectEntry.prototype.assignProperties = function (content, entry, scene) {
        entry.setProperties(['in', 'x', 'y', 'r', 'cls'], [
            content.find('[data-property="in"]').is(':checked'),
            scene.stringToPoint(content.find('[data-property="x"]').val()),
            scene.stringToPoint(content.find('[data-property="y"]').val()),
            scene.stringToPoint(content.find('[data-property="r"]').val()),
            content.find('[data-property="cls"]').gColorButton('value')
        ]);
    };

    /** @override */
    GShadowEffectEntry.prototype.toString = function () {
        return "[Object GShadowEffectEntry]";
    };

    _.GShadowEffectEntry = GShadowEffectEntry;
})(this);