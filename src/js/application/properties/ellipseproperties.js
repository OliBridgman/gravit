(function (_) {

    /**
     * Ellipse properties panel
     * @class GEllipseProperties
     * @extends GProperties
     * @constructor
     */
    function GEllipseProperties() {
        this._ellipses = [];
    };
    GObject.inherit(GEllipseProperties, GProperties);

    /**
     * @type {JQuery}
     * @private
     */
    GEllipseProperties.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GEllipseProperties.prototype._document = null;

    /**
     * @type {Array<GEllipse>}
     * @private
     */
    GEllipseProperties.prototype._ellipses = null;

    /** @override */
    GEllipseProperties.prototype.init = function (panel) {
        this._panel = panel;

        var _createInput = function (property) {
            var self = this;
            if (property === 'etp') {
                return $('<select></select>')
                    .attr('data-property', 'etp')
                    .append($('<option></option>')
                        .attr('value', GEllipse.Type.Arc)
                        // TODO : I18N
                        .text('Arc'))
                    .append($('<option></option>')
                        .attr('value', GEllipse.Type.Chord)
                        // TODO : I18N
                        .text('Chord'))
                    .append($('<option></option>')
                        .attr('value', GEllipse.Type.Pie)
                        // TODO : I18N
                        .text('Pie'))
                    .on('change', function () {
                        self._assignProperty(property, $(this).val());
                    });
            } else if (property === 'sa' || property === 'ea') {
                return $('<input>')
                    .attr('type', 'text')
                    .attr('data-property', property)
                    .on('change', function () {
                        var angle = GLength.parseEquationValue($(this).val());
                        if (angle !== null) {
                            angle = GMath.normalizeAngleRadians(GMath.toRadians(angle));
                            self._assignProperty(property, GMath.PI2 - angle);
                        } else {
                            self._updateProperties();
                        }
                    });
            } else {
                throw new Error('Unknown input property: ' + property);
            }
        }.bind(this);

        panel
            .css('width', '127px')
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '5px',
                    'left': '5px'
                })
                .append(_createInput('etp')
                    .css('width', '114px')))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '5px'
                })
                .html('<span class="fa fa-stop" style="font-size:11px;transform:rotate(45deg)"></span>')
                .append(_createInput('sa')
                    .css({
                        'margin-left': '5px',
                        'width': '38px'
                    })))
            .append($('<label></label>')
                .css({
                    'position': 'absolute',
                    'top': '30px',
                    'left': '66px'
                })
                .html('<span class="fa fa-circle"></span>')
                .append(_createInput('ea')
                    .css({
                        'margin-left': '3px',
                        'width': '38px'
                    })));
    };

    /** @override */
    GEllipseProperties.prototype.update = function (document, elements) {
        if (this._document) {
            this._document.getScene().removeEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange);
            this._document = null;
        }

        // Collect all ellipse elements
        this._ellipses = [];
        for (var i = 0; i < elements.length; ++i) {
            if (elements[i] instanceof GEllipse) {
                this._ellipses.push(elements[i]);
            }
        }

        if (this._ellipses.length === elements.length) {
            this._document = document;
            this._document.getScene().addEventListener(GNode.AfterPropertiesChangeEvent, this._afterPropertiesChange, this);
            this._updateProperties();
            return true;
        } else {
            return false;
        }
    };

    /**
     * @param {GNode.AfterPropertiesChangeEvent} event
     * @private
     */
    GEllipseProperties.prototype._afterPropertiesChange = function (event) {
        // If properties of first ellipse has changed then update ourself
        if (this._ellipses.length > 0 && this._ellipses[0] === event.node) {
            this._updateProperties();
        }
    };

    /**
     * @private
     */
    GEllipseProperties.prototype._updateProperties = function () {
        // We'll always read properties of first ellipse
        var ellipse = this._ellipses[0];
        this._panel.find('select[data-property="etp"]').val(ellipse.getProperty('etp'));
        this._panel.find('input[data-property="sa"]').val(
            GUtil.formatNumber(GMath.toDegrees(GMath.PI2 - ellipse.getProperty('sa')), 2));
        this._panel.find('input[data-property="ea"]').val(
            GUtil.formatNumber(GMath.toDegrees(GMath.PI2 - ellipse.getProperty('ea')), 2));
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