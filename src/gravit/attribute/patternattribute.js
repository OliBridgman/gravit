(function (_) {

    /**
     * Pattern attribute
     * @class GPatternAttribute
     * @extends GAttribute
     * @constructor
     */
    function GPatternAttribute() {
    };
    GObject.inherit(GPatternAttribute, GAttribute);

    /**
     * @type {JQuery}
     * @private
     */
    GPatternAttribute.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GPatternAttribute.prototype._document = null;

    /**
     * @type {GAttribute}
     * @private
     */
    GPatternAttribute.prototype._attribute = null;

    /**
     * @type {Function}
     * @private
     */
    GPatternAttribute.prototype._assign = null;

    /**
     * @type {boolean}
     * @private
     */
    GPatternAttribute.prototype._isGradientUpdate = false;

    /** @override */
    GPatternAttribute.prototype.init = function (panel) {
        this._panel = panel;
        
        var _createInput = function (property) {
            var self = this;
            if (property === 'tp') {
                return $('<select></select>')
                    .css('width', '100%')
                    .attr('data-property', property)
                    .append($('<option></option>')
                        .attr('value', IFPatternAttribute.Type.Color)
                        // TODO : I18N
                        .text('Color'))
                    .append($('<option></option>')
                        .attr('value', IFPatternAttribute.Type.LinearGradient)
                        // TODO : I18N
                        .text('Linear Gradient'))
                    //.append($('<option></option>')
                    //    .attr('value', IFPatternAttribute.Type.RadialGradient)
                    //    // TODO : I18N
                    //    .text('Radial Gradient'))
                    .on('change', function () {
                        var oldType = self._attribute.getProperty('tp');
                        var newType = $(this).val();
                        if (oldType !== newType) {
                            var newValue = null;

                            if (IFPatternAttribute.isGradientType(newType)) {
                                if (!IFPatternAttribute.isGradientType(oldType)) {
                                    newValue = new GXGradient([
                                        {position: 0, color: self._attribute.getColor()},
                                        {position: 100, color: new GXColor(GXColor.Type.Black)}
                                    ]);
                                } else {
                                    newValue = self._attribute.getProperty('val');
                                }
                            } else if (newType === IFPatternAttribute.Type.Color) {
                                newValue = self._attribute.getColor();
                            }

                            self._assign(['tp', 'val'], [newType, newValue]);
                        }
                    });
            } else if (property === 'color') {
                return $('<div></div>')
                    .css('position', 'relative')
                    .append($('<input>')
                        .attr('type', 'text')
                        .attr('data-property', 'position')
                        .css('width', '5em')
                        .gAutoBlur()
                        .on('change', function () {
                            var type = self._attribute.getProperty('tp');
                            if (IFPatternAttribute.isGradientType(type)) {
                                self._assignStopInput();
                            } else {
                                throw new Error("Unsupported Type for Position.");
                            }
                        }))
                    .append($('<button></button>')
                        .addClass('g-flat')
                        .css('position', 'absolute')
                        .css('right', '5px')
                        .attr('data-property', 'color')
                        .gColorButton()
                        .on('change', function (evt, color) {
                            var type = self._attribute.getProperty('tp');
                            if (IFPatternAttribute.isGradientType(type)) {
                                self._assignStopInput();
                            } else if (type === IFPatternAttribute.Type.Color) {
                                self._assign(['val'], [color]);
                            } else {
                                throw new Error("Unsupported Type for Color.");
                            }
                        }));
            } else if (property === 'gradient') {
                return $('<div></div>')
                    .attr('data-property', 'gradient')
                    .gGradientEditor()
                    .on('selected', function () {
                        self._updateStopInput();
                    })
                    .on('change', function (evt) {
                        self._assignGradient();
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('width', '100%')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    .text('Fill:'))
                .append($('<td></td>')
                    .attr('colspan', '2')
                    .append(_createInput('tp')))
                .append($('<td></td>')
                    .css('text-align', 'right')
                    .append(_createInput('color'))))
            .append($('<tr></tr>')
                .append($('<td></td>'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('gradient'))))
            .appendTo(panel);
    };

    /** @override */
    GPatternAttribute.prototype.updateFromAttribute = function (document, attribute, assign) {
        if (this._isGradientUpdate) {
            return;
        }
        
        this._document = document;
        this._attribute = attribute;
        this._assign = assign;

        var type = attribute.getProperty('tp');

        this._panel.find('select[data-property="tp"]').val(type);

        this._panel.find('input[data-property="position"]')
            .css('visibility', IFPatternAttribute.isGradientType(type) ? '' : 'hidden');

        this._panel.find('button[data-property="color"]')
            .css('visibility', IFPatternAttribute.isGradientType(type) || type === IFPatternAttribute.Type.Color ? '' : 'hidden')
            .toggleClass('g-flat', type !== IFPatternAttribute.Type.Color)
            .gColorButton('value', type === IFPatternAttribute.Type.Color ? attribute.getProperty('val') : null)
            .prop('disabled', false);

        this._panel.find('[data-property="gradient"]')
            .css('display', IFPatternAttribute.isGradientType(type) ? '' : 'none')
            .gGradientEditor('value', IFPatternAttribute.isGradientType(type) ? attribute.getProperty('val').getStops() : null)
            .gGradientEditor('selected', IFPatternAttribute.isGradientType(type) ? 0 : -1);

        this._updateStopInput();
    };

    /** @private */
    GPatternAttribute.prototype._assignStopInput = function () {
        if (IFPatternAttribute.isGradientType(this._attribute.getProperty('tp'))) {
            var $position = this._panel.find('input[data-property="position"]');
            var $color = this._panel.find('button[data-property="color"]');
            var $gradient = this._panel.find('div[data-property="gradient"]');

            var selected = $gradient.gGradientEditor('selected');
            var stops = $gradient.gGradientEditor('value');

            var position = parseInt($position.val());
            if (isNaN(position) || position < 0 || position > 100) {
                position = stops[selected].position;
            }

            var color = $color.gColorButton('value');
            if (!color) {
                color = stops[selected].color;
            }

            $gradient.gGradientEditor('updateStop', selected, position, color);

            this._assignGradient();
        }
    };

    /** @private */
    GPatternAttribute.prototype._assignGradient = function () {
        if (IFPatternAttribute.isGradientType(this._attribute.getProperty('tp'))) {
            var $gradient = this._panel.find('div[data-property="gradient"]');

            this._isGradientUpdate = true;
            try {
                this._assign(['val'], [new GXGradient($gradient.gGradientEditor('value'))]);
            } finally {
                this._isGradientUpdate = false;
            }
        }
    };

    /** @private */
    GPatternAttribute.prototype._updateStopInput = function () {
        if (IFPatternAttribute.isGradientType(this._attribute.getProperty('tp'))) {
            var $position = this._panel.find('input[data-property="position"]');
            var $color = this._panel.find('button[data-property="color"]');
            var $gradient = this._panel.find('div[data-property="gradient"]');

            var selected = $gradient.gGradientEditor('selected');
            var stops = $gradient.gGradientEditor('value');

            $position
                .prop('disabled', selected < 0)
                .val(stops && selected >= 0 ? stops[selected].position : '');

            $color
                .prop('disabled', selected < 0)
                .gColorButton('value', stops && selected >= 0 ? stops[selected].color : null);
        }
    };

    /** @override */
    GPatternAttribute.prototype.toString = function () {
        return "[Object GPatternAttribute]";
    };

    _.GPatternAttribute = GPatternAttribute;
})(this);