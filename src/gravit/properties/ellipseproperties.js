(function (_) {

    /**
     * Ellipse properties panel
     * @class GEllipseProperties
     * @extends EXProperties
     * @constructor
     */
    function GEllipseProperties() {
        this._ellipses = [];
    };
    GObject.inherit(GEllipseProperties, EXProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GEllipseProperties.prototype._panel = null;

    /**
     * @type {EXDocument}
     * @private
     */
    GEllipseProperties.prototype._document = null;

    /**
     * @type {Array<IFEllipse>}
     * @private
     */
    GEllipseProperties.prototype._ellipses = null;

    /** @override */
    GEllipseProperties.prototype.getCategory = function () {
        // TODO : I18N
        return 'Ellipse';
    };

    /** @override */
    GEllipseProperties.prototype.init = function (panel, controls) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'etp') {
                return $('<select></select>')
                    .attr('data-property', 'etp')
                    .css('width', '100%')
                    .append($('<option></option>')
                        .attr('value', IFEllipse.Type.Arc)
                        // TODO : I18N
                        .text('Arc'))
                    .append($('<option></option>')
                        .attr('value', IFEllipse.Type.Chord)
                        // TODO : I18N
                        .text('Chord'))
                    .append($('<option></option>')
                        .attr('value', IFEllipse.Type.Pie)
                        // TODO : I18N
                        .text('Pie'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'sa' || property === 'ea') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .css('width', '4em')
                    .gAutoBlur()
                    .on('change', function () {
                        var angle = IFLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = gMath.normalizeAngleRadians(gMath.toRadians(angle));
                            self._assignProperty(property, gMath.PI2 - angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Style:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append(_createInput('etp'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Angle:'))
                .append($('<td></td>')
                    .append(_createInput('sa')))
                .append($('<td></td>')
                    .addClass('label')
                    .html('<i class="fa fa-circle"></i>'))
                .append($('<td></td>')
                    .append(_createInput('ea'))))
            .appendTo(panel);
    };

    /** @override */
    GEllipseProperties.prototype.updateFromNode = function (document, elements, node) {
        if (this._document) {
            this._document.getScene().removeEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // We'll work on elements, only
        if (node) {
            return false;
        }

        // Collect all ellipse elements
        this._ellipses = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof IFEllipse) {
                this._ellipses.push(elements[i]);
            }
        }

        if (this._ellipses.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(IFNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {IFNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GEllipseProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first ellipse has changed then update ourself
        if (this._ellipses.length > 0 && this._ellipses[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @param {Boolean} [noBBoxCalculation] if set, do not recalculate all element's bbox.
     * Defaults to false.
     * @private
     */
    GEllipseProperties.prototype._updateProperties = function () {
        // We'll always read properties of first ellipse
        var ellipse = this._ellipses[0];
        this._panel.find('select[data-property="etp"]').val(ellipse.getProperty('etp'));
        this._panel.find('input[data-property="sa"]').val(
            gUtil.formatNumber(gMath.toDegrees(gMath.PI2 - ellipse.getProperty('sa')), 2));
        this._panel.find('input[data-property="ea"]').val(
            gUtil.formatNumber(gMath.toDegrees(gMath.PI2 - ellipse.getProperty('ea')), 2));
    };

    /**
     * @param {String} property
     * @param {*} value
     * @private
     */
    GEllipseProperties.prototype._assignProperty = function (property, value) {
        this._assignProperties([property], [value]);
    };

    /**
     * @param {Array<String>} properties
     * @param {Array<*>} values
     * @private
     */
    GEllipseProperties.prototype._assignProperties = function (properties, values) {
        var editor = this._document.getEditor();
        editor.beginTransaction();
        try {
            for (var i = 0; i < this._ellipses.length; ++i) {
                this._ellipses[i].setProperties(properties, values);
            }
        } finally {
            // TODO : I18N
            editor.commitTransaction('Modify Ellipse Properties');
        }
    };

    /** @override */
    GEllipseProperties.prototype.toString = function () {
        return "[Object GEllipseProperties]";
    };

    _.GEllipseProperties = GEllipseProperties;
})(this);