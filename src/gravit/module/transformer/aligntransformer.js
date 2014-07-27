(function (_) {

    /**
     * Align transform panel
     * @class GAlignTransformer
     * @extends GTransformer
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
                    .text('Align To:'))
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
                        // TODO : I18N
                        .attr('title', 'Align Left')
                        .attr('data-align', GAlignAction.Type.AlignLeft)
                        .addClass('fa fa-align-left'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Center')
                        .attr('data-align', GAlignAction.Type.AlignCenter)
                        .addClass('fa fa-align-center'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Right')
                        .attr('data-align', GAlignAction.Type.AlignRight)
                        .addClass('fa fa-align-right'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Equal Spaces')
                        .attr('data-align', GAlignAction.Type.DistributeHorizontal)
                        .addClass('fa fa-align-justify fa-rotate-270')
                        .css('margin-left', '7px'))))
            .append($('<tr></tr>')
                .append($('<td></td>')
                    .addClass('label')
                    // TODO : I18N
                    .text('Vertical:'))
                .append($('<td></td>')
                    .attr('colspan', '3')
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Top')
                        .attr('data-align', GAlignAction.Type.AlignTop)
                        .addClass('fa fa-align-right fa-rotate-270'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Middle')
                        .attr('data-align', GAlignAction.Type.AlignMiddle)
                        .addClass('fa fa-align-center fa-rotate-270'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Align Bottom')
                        .attr('data-align', GAlignAction.Type.AlignBottom)
                        .addClass('fa fa-align-left fa-rotate-270'))
                    .append($('<button></button>')
                        // TODO : I18N
                        .attr('title', 'Equal Spaces')
                        .attr('data-align', GAlignAction.Type.DistributeVertical)
                        .addClass('fa fa-align-justify')
                        .css('margin-left', '7px'))))
            .appendTo(panel);

        var alignHandler = function (evt) {
            this._align($(evt.target).attr('data-align'))
        }.bind(this);

        this._panel.find('button[data-align]').each(function (index, element) {
            $(element).on('click', alignHandler);
        })
    };

    /** @override */
    GAlignTransformer.prototype.update = function (document, elements) {
        this._document = document;
        this._elements = elements;
        return true;
    };

    /**
     * @param {GAlignAction.Type} type
     * @private
     */
    GAlignTransformer.prototype._align = function (type) {
        // Gather our reference box depending on the selection, first
        var referenceBox = null;
        var elements = this._elements.slice();
        var scene = this._document.getScene();
        var activePage = scene.getActivePage();
        var activeLayer = scene.getActiveLayer();

        switch (this._panel.find('select[data-option="align-to"]').val()) {
            case GAlignTransformer._AlignTo.Layer:
                referenceBox = activeLayer.getPaintBBox();
                break;
            case GAlignTransformer._AlignTo.Page:
                referenceBox = activePage.getGeometryBBox();
                break;
            case GAlignTransformer._AlignTo.PageMargins:
                referenceBox = activePage.getGeometryBBox().expanded(
                    -activePage.getProperty('ml'),
                    -activePage.getProperty('mt'),
                    -activePage.getProperty('mr'),
                    -activePage.getProperty('mb'));
                break;
            case GAlignTransformer._AlignTo.FirstElement:
                referenceBox = elements[0];
                elements.splice(0);
                break;
            case GAlignTransformer._AlignTo.LastElement:
                referenceBox = elements[elements.length - 1];
                elements.splice(elements.length - 1);
                break;
        }

        if (elements.length > 0) {
            var geometry = this._panel.find('select[data-option="align-on"]').val() === GAlignTransformer._AlignOn.Geometry;

            // Execute align action now
            gApp.executeAction(GAlignAction.ID + '.' + type, [elements, geometry, referenceBox]);
        }
    };

    /** @override */
    GAlignTransformer.prototype.toString = function () {
        return "[Object GAlignTransformer]";
    };

    _.GAlignTransformer = GAlignTransformer;
})(this);