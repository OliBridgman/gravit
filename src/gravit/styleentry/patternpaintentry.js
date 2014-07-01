(function (_) {

    /**
     * Pattern paint style entry handler
     * @class GPatternPaintEntry
     * @extends GStyleEntry
     * @constructor
     */
    function GPatternPaintEntry() {
    }

    IFObject.inherit(GPatternPaintEntry, GStyleEntry);

    var DEFAULT_GRADIENT = new IFGradient([
        {
            position: 0,
            color: IFColor.BLACK
        },
        {
            position: 100,
            color: IFColor.WHITE
        }
    ]);


    /** @override */
    GPatternPaintEntry.prototype.createContent = function (scene, assign, revert) {
        return $('<div></div>')
            .addClass('g-form')
            .append($('<div></div>')
                .append($('<div></div>')
                    .css('width', '100%')
                    .append($('<select></select>')
                        .attr('data-element', 'type')
                        .append($('<option></option>')
                            .attr('value', IFPatternPaint.PatternType.Color)
                            // TODO : I18N
                            .text('Color'))
                        .append($('<optgroup></optgroup>')
                            // TODO I18N
                            .attr('label', 'Gradient')
                        .append($('<option></option>')
                            .attr('value', IFPatternPaint.PatternType.Gradient + '#' + IFGradient.Type.Linear)
                            // TODO : I18N
                            .text('Linear'))
                        .append($('<option></option>')
                                .attr('value', IFPatternPaint.PatternType.Gradient + '#' + IFGradient.Type.Radial)
                            // TODO : I18N
                            .text('Radial')))
                        /* TODO :
                         .append($('<option></option>')
                         .attr('value', 'texture')
                         .text('Texture'))
                         .append($('<option></option>')
                         .attr('value', 'noise')
                         .text('Noise'))
                         */
                        .on('change', function (evt) {
                            assign();
                        }))
                    .append($('<button></button>')
                        .attr('data-element', 'color')
                        .gColorButton({
                            scene: scene
                        })
                        .on('colorchange', function (evt) {
                            assign();
                        })))
                .append($('<div></div>')
                    .append($('<select></select>')
                        .attr('data-property', 'blm')
                        .gBlendMode()
                        .on('change', function (evt) {
                            assign();
                        }))
                    .append($('<input>')
                        .attr('data-property', 'opc')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var opacity = IFLength.parseEquationValue($(evt.target).val());
                            if (opacity !== null) {
                                assign();
                            } else {
                                revert();
                            }
                        }))))
            .append($('<div></div>')
                .css('width', '100%')
                .attr('data-element', 'gradient')
                .append($('<div></div>')
                    .css('width', '100%')
                    .css('display', 'block')
                    .append($('<div></div>')
                        .css('width', '100%')
                        .gGradientEditor({
                            scene : scene
                        })
                        .on('change', function (evt) {
                            assign();
                        }))));
    };

    /** @override */
    GPatternPaintEntry.prototype.updateProperties = function (content, entry, scene) {
        var pattern = entry.getProperty('pat');
        var patternType = IFPatternPaint.getTypeOf(pattern);

        var patternSubType = null;
        if (patternType === IFPatternPaint.PatternType.Gradient) {
            patternSubType = pattern.getType();
        }

        content.find('[data-element="type"]').val(patternSubType ? (patternType + '#' + patternSubType) : patternType);
        content.find('[data-element="color"]')
            .gColorButton('value', patternType === IFPatternPaint.PatternType.Color ? pattern : IFColor.BLACK)
            .css('display', patternType === IFPatternPaint.PatternType.Color ? '' : 'none');
        content.find('[data-property="blm"]').val(entry.getProperty('blm'));
        content.find('[data-property="opc"]').val(ifUtil.formatNumber(entry.getProperty('opc') * 100));

        // Gradient
        if (patternType === IFPatternPaint.PatternType.Gradient) {
            content.find('[data-element="gradient"]').css('display', '');
            content.find('.g-gradient-editor').gGradientEditor('value', pattern.getStops());
        } else {
            content.find('[data-element="gradient"]').css('display', 'none');
            content.find('.g-gradient-editor').gGradientEditor('value', DEFAULT_GRADIENT.getStops());
        }
    };

    /** @override */
    GPatternPaintEntry.prototype.assignProperties = function (content, entry, scene) {
        var properties = [];
        var values = [];
        this._getPropertiesToAssign(content, entry, scene, properties, values);
        entry.setProperties(properties, values);
    };

    GPatternPaintEntry.prototype._getPropertiesToAssign = function (content, entry, scene, properties, values) {
        properties.push(
            'pat',
            'blm',
            'opc'
        );

        var opacity = IFLength.parseEquationValue(content.find('[data-property="opc"]').val());

        var oldPattern = entry.getProperty('pat');
        var oldPatternType = IFPatternPaint.getTypeOf(oldPattern);

        var pattern = null;
        var patternType = content.find('[data-element="type"]').val();
        var patternSubType = null;
        if (patternType.indexOf('#') >= 0) {
            var ptArray = patternType.split('#');
            patternType = ptArray[0];
            patternSubType = ptArray[1];
        }

        if (patternType === IFPatternPaint.PatternType.Color) {
            if (oldPatternType === IFPatternPaint.PatternType.Gradient) {
                pattern = oldPattern.getStops()[0].color;
            } else {
                pattern = content.find('[data-element="color"]').gColorButton('value');
            }
        } else if (patternType === IFPatternPaint.PatternType.Gradient) {
            if (oldPatternType === IFPatternPaint.PatternType.Color) {
                pattern = new IFGradient([
                    {
                        position: 0,
                        color: oldPattern
                    },
                    {
                        position: 100,
                        color: IFColor.WHITE
                    }
                ], patternSubType);
            } else {
                pattern = new IFGradient(content.find('.g-gradient-editor').gGradientEditor('value'), patternSubType);
            }
        }

        values.push(
            pattern, // pat
            content.find('[data-property="blm"]').val(), // blm
            (opacity < 0 ? 0 : opacity > 100 ? 100 : opacity) / 100.0 // opc
        );
    };

    /** @override */
    GPatternPaintEntry.prototype.toString = function () {
        return "[Object GPatternPaintEntry]";
    };

    _.GPatternPaintEntry = GPatternPaintEntry;
})(this);