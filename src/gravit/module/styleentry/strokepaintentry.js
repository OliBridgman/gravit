(function (_) {

    /**
     * Stroke paint style entry handler
     * @class GStrokePaintEntry
     * @extends GAreaPaintEntry
     * @constructor
     */
    function GStrokePaintEntry() {
        GAreaPaintEntry.call(this);
    }
    IFObject.inherit(GStrokePaintEntry, GAreaPaintEntry);

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
    GStrokePaintEntry.prototype.createContent = function (scene, assign, revert) {
        var content = GAreaPaintEntry.prototype.createContent.call(this, scene, assign, revert);

        $('<div></div>')
            .attr('data-element', 'stroke-settings')
            .css('display', 'none')
            .append($('<div></div>')
                .append($('<select></select>')
                    .attr('data-property', 'slc')
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineCap.Butt)
                        // TODO : I18N
                        .text('Butt'))
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineCap.Round)
                        // TODO : I18N
                        .text('Round'))
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineCap.Square)
                        // TODO : I18N
                        .text('Square'))
                    .on('change', function (evt) {
                        assign();
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Caption')))
            .append($('<div></div>')
                .append($('<select></select>')
                    .attr('data-property', 'slj')
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineJoin.Miter)
                        // TODO : I18N
                        .text('Miter'))
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineJoin.Bevel)
                        // TODO : I18N
                        .text('Bevel'))
                    .append($('<option></option>')
                        .attr('value', IFPaintCanvas.LineJoin.Round)
                        // TODO : I18N
                        .text('Round'))
                    .on('change', function (evt) {
                        assign();
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Join')))
            .append($('<div></div>')
                .append($('<input>')
                    .css('width', '5em')
                    .attr('data-property', 'slm')
                    .on('change', function (evt) {
                        var value = scene.stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value >= 0) {
                            assign();
                        } else {
                            revert();
                        }
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Miter')))
            .prependTo(content);

        $('<div></div>')
            .append($('<div></div>')
                .append($('<input>')
                    .attr('data-property', 'sw')
                    .css('width', '5em')
                    .on('change', function (evt) {
                        var value = scene.stringToPoint($(this).val());
                        if (value !== null && typeof value === 'number' && value > 0) {
                            assign();
                        } else {
                            revert();
                        }
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Stroke')))
            .append($('<div></div>')
                .append($('<select></select>')
                    .attr('data-property', 'sa')
                    .append($('<option></option>')
                        .attr('value', IFStrokePaint.Alignment.Center)
                        // TODO : I18N
                        .text('Center'))
                    .append($('<option></option>')
                        .attr('value', IFStrokePaint.Alignment.Inside)
                        // TODO : I18N
                        .text('Inside'))
                    .append($('<option></option>')
                        .attr('value', IFStrokePaint.Alignment.Outside)
                        // TODO : I18N
                        .text('Outside'))
                    .on('change', function (evt) {
                        assign();
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('Align')))
            .append($('<div></div>')
                .css('width', '100%')
                .css('text-align', 'right')
                .append($('<button></button>')
                    .attr('data-element', 'more')
                    .on('click', function (evt) {
                        var $this = $(this);
                        var active = $this.hasClass('g-active');
                        $this.toggleClass('g-active', !active);
                        $this.closest('.g-form').find('[data-element="stroke-settings"]')
                            .css('display', active ? 'none' : '');
                    })
                    .append($('<span></span>')
                        .addClass('fa fa-cog')))
                .append($('<label>&nbsp;</label>')))
            .prependTo(content);

        return content;
    };

    /** @override */
    GStrokePaintEntry.prototype.updateProperties = function (content, entry, scene) {
        GAreaPaintEntry.prototype.updateProperties.call(this, content, entry, scene);
        content.find('[data-property="sw"]').val(scene.pointToString(entry.getProperty('sw')));
        content.find('[data-property="sa"]').val(entry.getProperty('sa'));
        content.find('[data-property="slc"]').val(entry.getProperty('slc'));
        content.find('[data-property="slj"]').val(entry.getProperty('slj'));
        content.find('[data-property="slm"]').val(scene.pointToString(entry.getProperty('slm')));
    };

    /** @override */
    GStrokePaintEntry.prototype._getPropertiesToAssign = function (content, entry, scene, properties, values) {
        GAreaPaintEntry.prototype._getPropertiesToAssign.call(this, content, entry, scene, properties, values);

        properties.push(
            'sw',
            'sa',
            'slc',
            'slj',
            'slm'
        );

        values.push(
            scene.stringToPoint(content.find('[data-property="sw"]').val()),
            content.find('[data-property="sa"]').val(),
            content.find('[data-property="slc"]').val(),
            content.find('[data-property="slj"]').val(),
            scene.stringToPoint(content.find('[data-property="slm"]').val())
        );
    };

    /** @override */
    GStrokePaintEntry.prototype.toString = function () {
        return "[Object GStrokePaintEntry]";
    };

    _.GStrokePaintEntry = GStrokePaintEntry;
})(this);