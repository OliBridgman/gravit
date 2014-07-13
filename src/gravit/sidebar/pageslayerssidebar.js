(function (_) {

    /**
     * The pages & layers sidebar
     * @class GPagesLayersSidebar
     * @extends GSidebar
     * @constructor
     */
    function GPagesLayersSidebar() {
        GSidebar.call(this);
    }

    IFObject.inherit(GPagesLayersSidebar, GSidebar);

    GPagesLayersSidebar.ID = "pages-layers";
    GPagesLayersSidebar.TITLE = new IFLocale.Key(GPagesLayersSidebar, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pagesPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._pageDeleteControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layersPanel = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerAddControl = null;

    /**
     * @type {JQuery}
     * @private
     */
    GPagesLayersSidebar.prototype._layerDeleteControl = null;

    /** @override */
    GPagesLayersSidebar.prototype.getId = function () {
        return GPagesLayersSidebar.ID;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getTitle = function () {
        return GPagesLayersSidebar.TITLE;
    };

    /** @override */
    GPagesLayersSidebar.prototype.getIcon = function () {
        return '<span class="fa fa-fw fa-bars"></span>';
    };

    /** @override */
    GPagesLayersSidebar.prototype.init = function (htmlElement) {
        GSidebar.prototype.init.call(this, htmlElement);

        // -- Pages --
        this._pagesPanel = $('<div></div>')
            .addClass('pages');

        this._pageAddControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-plus')
                // TODO : I18N
                .attr('title', 'Add Page')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._pageDeleteControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-trash-o')
                // TODO : I18N
                .attr('title', 'Delete Selected Page')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Pages',
                content: this._pagesPanel,
                controls: [
                    this._pageAddControl,
                    this._pageDeleteControl
                ]
            })
            .appendTo(htmlElement);

        // -- Layers --
        this._layersPanel = $('<div></div>')
            .addClass('layers');

        this._layerAddControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-plus')
                // TODO : I18N
                .attr('title', 'Add Layer')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        this._layerDeleteControl =
            $('<button></button>')
                .addClass('fa fa-fw fa-trash-o')
                // TODO : I18N
                .attr('title', 'Delete Selected Layer')
                .on('click', function () {
                    /* TODO
                     var swatch = this._swatchPanel.gSwatchPanel('value');
                     var editor = this._document.getEditor();
                     editor.beginTransaction();
                     try {
                     swatch.getParent().removeChild(swatch);
                     } finally {
                     editor.commitTransaction('Delete Swatch');
                     }*/
                }.bind(this));

        $('<div></div>')
            .gPanel({
                // TODO : I18N
                title: 'Layers',
                content: this._layersPanel,
                controls: [
                    this._layerAddControl,
                    this._layerDeleteControl
                ]
            })
            .appendTo(htmlElement);
    };

    /** @override */
    GPagesLayersSidebar.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var scene = this._document.getScene();
            // this._stylePanel.gStylePanel('attach', scene.getStyleCollection());
            // this._swatchPanel.gSwatchPanel('attach', scene.getSwatchCollection());
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var scene = this._document.getScene();
            // this._stylePanel.gStylePanel('detach');
            // this._swatchPanel.gSwatchPanel('detach');
        }
    };

    /** @override */
    GPagesLayersSidebar.prototype.toString = function () {
        return "[Object GPagesLayersSidebar]";
    };

    _.GPagesLayersSidebar = GPagesLayersSidebar;
})(this);