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
        // TODO
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
                        .append($('<option></option>')
                            .attr('value', IFPatternPaint.PatternType.Gradient)
                            // TODO : I18N
                            .text('Gradient'))
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
                        .gColorButton()
                        .on('change', function (evt) {
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
                        .gGradientEditor()
                        .on('change', function (evt) {
                            assign();
                        }))))
            .append($('<div></div>')
                .attr('data-element', 'transform')
                .append($('<div></div>')
                    .append($('<input>')
                        .attr('data-property', 'tx')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var value = IFLength.parseEquationValue($(evt.target).val());
                            if (value !== null) {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label></label>')
                        .text('X')))
                .append($('<div></div>')
                    .append($('<input>')
                        .attr('data-property', 'ty')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var value = IFLength.parseEquationValue($(evt.target).val());
                            if (value !== null) {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label></label>')
                        .text('Y')))
                .append($('<div></div>')
                    .append($('<input>')
                        .attr('data-property', 'sx')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var value = IFLength.parseEquationValue($(evt.target).val());
                            if (value !== null && value !== 0.0) {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label>&#xe878;</label>')
                        .addClass('g-icon')))
                .append($('<div></div>')
                    .append($('<input>')
                        .attr('data-property', 'sy')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var value = IFLength.parseEquationValue($(evt.target).val());
                            if (value !== null && value !== 0.0) {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label>&#xead9;</label>')
                        .addClass('g-icon')))
                .append($('<div></div>')
                    .append($('<input>')
                        .attr('data-property', 'rt')
                        .css('width', '3em')
                        .on('change', function (evt) {
                            var value = IFLength.parseEquationValue($(evt.target).val());
                            if (value !== null) {
                                assign();
                            } else {
                                revert();
                            }
                        }))
                    .append($('<label>&#xe9cc;</label>')
                        .addClass('g-icon'))));
    };

    /** @override */
    GPatternPaintEntry.prototype.updateProperties = function (content, entry, scene) {
        var pattern = entry.getProperty('pat');
        var patternType = IFPatternPaint.getTypeOf(pattern);

        content.find('[data-element="type"]').val(patternType);
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

        // Transform
        if (patternType !== IFPatternPaint.PatternType.Color) {
            content.find('[data-element="transform"]').css('display', '');
            content.find('[data-property="tx"]').val(ifUtil.formatNumber(entry.getProperty('tx')));
            content.find('[data-property="ty"]').val(ifUtil.formatNumber(entry.getProperty('ty')));
            content.find('[data-property="sx"]').val(ifUtil.formatNumber(entry.getProperty('sx')));
            content.find('[data-property="sy"]').val(ifUtil.formatNumber(entry.getProperty('sy')));
            content.find('[data-property="rt"]').val(ifUtil.formatNumber(ifMath.toDegrees(entry.getProperty('rt')), 2));
        } else {
            content.find('[data-element="transform"]').css('display', 'none');
        }
    };

    GPatternPaintEntry.prototype._getPropertiesToAssign = function (content, entry, scene, properties, values) {
        properties.push(
            'pat',
            'blm',
            'opc',
            'tx',
            'ty',
            'sx',
            'sy',
            'rt'
        );

        var opacity = IFLength.parseEquationValue(content.find('[data-property="opc"]').val());

        var oldPattern = entry.getProperty('pat');
        var oldPatternType = IFPatternPaint.getTypeOf(oldPattern);

        var pattern = null;
        var patternType = content.find('[data-element="type"]').val();

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
                ]);
            } else {
                pattern = new IFGradient(content.find('.g-gradient-editor').gGradientEditor('value'));
            }
        }

        values.push(
            pattern, // pat
            content.find('[data-property="blm"]').val(), // blm
            (opacity < 0 ? 0 : opacity > 100 ? 100 : opacity) / 100.0, // opc
            patternType !== 'color' ? IFLength.parseEquationValue(content.find('[data-property="tx"]').val()) : 0, // tx
            patternType !== 'color' ? IFLength.parseEquationValue(content.find('[data-property="ty"]').val()) : 0, // ty
            patternType !== 'color' ? IFLength.parseEquationValue(content.find('[data-property="sx"]').val()) : 1, // sx
            patternType !== 'color' ? IFLength.parseEquationValue(content.find('[data-property="sy"]').val()) : 1, // sy
            patternType !== 'color' ? ifMath.normalizeAngleRadians(ifMath.toRadians(IFLength.parseEquationValue(content.find('[data-property="rt"]').val()))) : 0 // rt
        );
    };

    /** @override */
    GPatternPaintEntry.prototype.toString = function () {
        return "[Object GPatternPaintEntry]";
    };

    _.GPatternPaintEntry = GPatternPaintEntry;
})(this);