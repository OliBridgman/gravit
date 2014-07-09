(function (_) {

    /**
     * Area pattern paint style entry handler
     * @class GAreaPaintEntry
     * @extends GPatternPaintEntry
     * @constructor
     */
    function GAreaPaintEntry() {
        GPatternPaintEntry.call(this);
    }

    IFObject.inherit(GAreaPaintEntry, GPatternPaintEntry);

    /** @override */
    GAreaPaintEntry.prototype.createContent = function (scene, assign, revert) {
        var content = GPatternPaintEntry.prototype.createContent.call(this, scene, assign, revert);

        $('<div></div>')
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
                    .css('width', '3em')
                    .attr('data-property', 'sx')
                    .on('change', function (evt) {
                        var value = IFLength.parseEquationValue($(evt.target).val());
                        if (value !== null && value !== 0.0) {
                            assign();
                        } else {
                            revert();
                        }
                    }))
                .append($('<label></label>')
                    // TODO : I18N
                    .text('W')))
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
                .append($('<label></label>')
                    // TODO : I18N
                    .text('H')))
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
                .append($('<label></label>')
                    .text('°')))
            .appendTo(content);

        return content;
    };

    /** @override */
    GAreaPaintEntry.prototype.updateProperties = function (content, entry, scene) {
        GPatternPaintEntry.prototype.updateProperties.call(this, content, entry, scene);

        var pattern = entry.getProperty('pat');
        var patternType = IFPatternPaint.getTypeOf(pattern);

        // Transform
        var transformContent = content.find('[data-element="transform"]');
        if (patternType !== IFPatternPaint.PatternType.Color) {
            transformContent.css('display', '');
            transformContent.find('[data-property="tx"]').val(ifUtil.formatNumber(entry.getProperty('tx') * 100));
            transformContent.find('[data-property="ty"]').val(ifUtil.formatNumber(entry.getProperty('ty') * 100));
            transformContent.find('[data-property="sx"]').val(ifUtil.formatNumber(entry.getProperty('sx') * 100));


            transformContent.find('[data-property="sy"]')
                .val(ifUtil.formatNumber(entry.getProperty('sy') * 100))
                .closest('div') // !! -->
                .css('display', pattern.getType() === IFGradient.Type.Linear ? 'none' : '');

            transformContent.find('[data-property="rt"]').val(ifUtil.formatNumber(ifMath.toDegrees(entry.getProperty('rt')), 2));
        } else {
            transformContent.css('display', 'none');
        }
    };

    /** @override */
    GAreaPaintEntry.prototype._getPropertiesToAssign = function (content, entry, scene, properties, values) {
        GPatternPaintEntry.prototype._getPropertiesToAssign.call(this, content, entry, scene, properties, values);

        properties.push(
            'tx',
            'ty',
            'sx',
            'sy',
            'rt'
        );

        var tx = IFLength.parseEquationValue(content.find('[data-property="tx"]').val());
        var ty = IFLength.parseEquationValue(content.find('[data-property="ty"]').val());
        var sx = IFLength.parseEquationValue(content.find('[data-property="sx"]').val());
        var sy = IFLength.parseEquationValue(content.find('[data-property="sy"]').val());
        var rt = IFLength.parseEquationValue(content.find('[data-property="rt"]').val());

        var tx = tx !== null ? tx / 100 : 0;
        var ty = ty !== null ? ty / 100 : 0;
        var sx = sx !== null ? sx / 100 : 1;
        var sy = sy !== null ? sy / 100 : 1;
        var rt = rt !== null ? (ifMath.normalizeAngleRadians(ifMath.toRadians(rt))) : 0;

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
            // reset transform values to default
            tx = 0;
            ty = 0;
            sx = 1;
            sy = 1;
            rt = 0;
        }
        else if (patternType === IFPatternPaint.PatternType.Gradient) {
            // Set reasonable defaults for gradient if previous was either not
            // a gradient or did have a different gradient type
            if (oldPatternType !== IFPatternPaint.PatternType.Gradient ||
                oldPattern.getType() !== patternSubType) {
                if (patternSubType === IFGradient.Type.Linear) {
                    sx = 1;
                    sy = 1;
                    tx = 0.5;
                    ty = 0.5;
                    rt = ifMath.toRadians(90);
                } else if (patternSubType === IFGradient.Type.Radial) {
                    sx = 1;
                    sy = 1;
                    tx = 0.5;
                    ty = 0.5;
                    rt = 0;
                } else {
                    // TODO : Support more
                    throw new Error('Unsupported Gradient Type');
                }
            }

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
            tx,
            ty,
            sx,
            sy,
            rt
        );
    };

    /** @override */
    GAreaPaintEntry.prototype.toString = function () {
        return "[Object GAreaPaintEntry]";
    };

    _.GAreaPaintEntry = GAreaPaintEntry;
})(this);