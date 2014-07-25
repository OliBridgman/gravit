(function (_) {

    /**
     * Align transform panel
     * @class GAlignTransformer
     * @extends GProperties
     * @constructor
     */
    function GAlignTransformer() {
        this._elements = [];
    };
    IFObject.inherit(GAlignTransformer, GTransformer);

    /** @enum */
    GAlignTransformer._AlignTo = {
        Selection: 'selection',
        Layer: 'layer',
        Page: 'page',
        PageMargins: 'page-margins',
        FirstElement: 'first-element',
        LastElement: 'last-element'
    };

    /** @enum */
    GAlignTransformer._AlignOn = {
        Geometry: 'geometry',
        Painted: 'painted'
    };

    /**
     * @type {JQuery}
     * @private
     */
    GAlignTransformer.prototype._panel = null;

    /**
     * @type {GDocument}
     * @private
     */
    GAlignTransformer.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GAlignTransformer.prototype._elements = null;

    /** @override */
    GAlignTransformer.prototype.getCategory = function () {
        // TODO : I18N
        return 'Alignment';
    };

    /** @override */
    GAlignTransformer.prototype.init = function (panel, controls) {
        this._panel = panel;

        $('<table></table>')
            .addClass('g-form')
            .css('margin', '0px auto')
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Reference:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<select></select>')
                        .attr('data-option', 'align-to')
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Selection)
                            // TODO : I18N
                            .text('Selection'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Layer)
                            // TODO : I18N
                            .text('Active Layer'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.Page)
                            // TODO : I18N
                            .text('Active Page'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.PageMargins)
                            // TODO : I18N
                            .text('Active Page Margins'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.FirstElement)
                            // TODO : I18N
                            .text('First Selected Element'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignTo.LastElement)
                            // TODO : I18N
                            .text('Last Selected Element')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Align On:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<select></select>')
                        .attr('data-option', 'align-on')
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignOn.Geometry)
                            // TODO : I18N
                            .text('Geometry'))
                        .append($('<option></option>')
                            .attr('value', GAlignTransformer._AlignOn.Painted)
                            // TODO : I18N
                            .text('Painted')))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .attr('colspan', 4)
                    .append($('<hr>'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Horizontal:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<button></button>')
                        .addClass('fa fa-align-left g-flat'))
                    .append($('<button></button>')
                        .addClass('fa fa-align-center g-flat'))
                    .append($('<button></button>')
                        .addClass('fa fa-align-right g-flat'))
                    .append($('<button></button>')
                        .addClass('fa fa-align-justify g-flat')
                        .css('margin-left', '7px'))))
            .appendTo(panel);
    };

    /** @override */
    GAlignTransformer.prototype.update = function (document, elements) {
        this._elements = elements;
        return true;
    };

    /** @override */
    GAlignTransformer.prototype.toString = function () {
        return "[Object GAlignTransformer]";
    };

    _.GAlignTransformer = GAlignTransformer;
})(this);