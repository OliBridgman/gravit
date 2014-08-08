(function (_) {

    /**
     * Transform Palette
     * @class GTransformPalette
     * @extends GPalette
     * @constructor
     */
    function GTransformPalette() {
        GPalette.call(this);
        this._transformPanels = [];
    }

    IFObject.inherit(GTransformPalette, GPalette);

    GTransformPalette.ID = "transform";
    GTransformPalette.TITLE = new IFLocale.Key(GTransformPalette, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GTransformPalette.prototype._htmlElement = null;

    /**
     * The transformer panels
     * @type {Array<{{category: JQuery, panel: JQuery, transformer: GTransformer}}>}
     * @private
     */
    GTransformPalette.prototype._transformPanels = null;

    /**
     * @type {GDocument}
     * @private
     */
    GTransformPalette.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GTransformPalette.prototype._elements = null;

    /** @override */
    GTransformPalette.prototype.getId = function () {
        return GTransformPalette.ID;
    };

    /** @override */
    GTransformPalette.prototype.getTitle = function () {
        return GTransformPalette.TITLE;
    };

    /** @override */
    GTransformPalette.prototype.getGroup = function () {
        return "properties";
    };

    /** @override */
    GTransformPalette.prototype.isEnabled = function () {
        return !!gApp.getActiveDocument();
    };

    /** @override */
    GTransformPalette.prototype.init = function (htmlElement, controls) {
        GPalette.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        var propertiesPanels = $('<div></div>')
            .addClass('transform-panels')
            .appendTo(this._htmlElement);

        var _addTransformPanel = function (transformer) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .attr('data-available', 'false')
                .addClass('transform-panel-content');

            // Append category
            var category = $('<div></div>')
                .addClass('transform-panel-category')
                .css('display', 'none')
                .attr('data-expanded', 'true')
                .append($('<div></div>')
                    .addClass('title')
                    .append($('<i></i>')
                        .addClass('fa fa-angle-down'))
                    .append($('<span></span>')
                        .text(ifLocale.get(transformer.getCategory())))
                    .on('click', function () {
                        if (panel.attr('data-available') === 'true') {
                            var category = $(this).parents('.transform-panel-category');
                            var icon = category.find('i.fa');
                            if (panel.css('display') !== 'none') {
                                panel.css('display', 'none');
                                icon.attr('class', 'fa fa-angle-right');
                                category.attr('data-expanded', 'false');
                            } else {
                                panel.css('display', '');
                                icon.attr('class', 'fa fa-angle-down');
                                category.attr('data-expanded', 'true');
                            }
                        }
                    }))
                .append($('<div></div>')
                    .addClass('controls'))
                .appendTo(propertiesPanels);

            // Init transformer
            transformer.init(panel, category.find('.controls'));

            // Append panel
            panel.appendTo(propertiesPanels);

            this._transformPanels.push({
                category: category,
                panel: panel,
                transformer: transformer
            })
        }.bind(this);

        // Initialize our transform panels
        for (var i = 0; i < gravit.transformers.length; ++i) {
            _addTransformPanel(gravit.transformers[i]);
        }
    };

    /** @override */
    GTransformPalette.prototype._documentEvent = function (event) {
        if (event.type === GApplication.DocumentEvent.Type.Activated) {
            this._document = event.document;
            var editor = this._document.getEditor();

            editor.addEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._updateFromSelection();

            this.trigger(GPalette.UPDATE_EVENT);
        } else if (event.type === GApplication.DocumentEvent.Type.Deactivated) {
            var editor = this._document.getEditor();

            // Unsubscribe from the editor's events
            editor.removeEventListener(IFEditor.SelectionChangedEvent, this._updateFromSelection, this);

            this._document = null;
            this._elements = null;

            this._updateTransformPanels();

            this.trigger(GPalette.UPDATE_EVENT);
        }
    };

    /**
     * @private
     */
    GTransformPalette.prototype._updateFromSelection = function () {
        this._elements = null;
        
        var selection = this._document.getEditor().getSelection();
        
        // Filter elements by transformables
        if (selection) {
            for (var i = 0; i < selection.length; ++i) {
                if (selection[i].hasMixin(IFElement.Transform)) {
                    if (!this._elements) {
                        this._elements = [];
                    }
                    this._elements.push(selection[i]);
                }
            }
        }

        this._updateTransformPanels();
    };

    /** @private */
    GTransformPalette.prototype._updateTransformPanels = function () {
        var lastVisibleTransformPanel = null;
        for (var i = 0; i < this._transformPanels.length; ++i) {
            var transformPanel = this._transformPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : transformPanel.transformer.update(this._document, this._elements);

            transformPanel.panel.removeClass('last-visible');
            if (available) {
                transformPanel.category.css('display', '');

                if (transformPanel.category.attr('data-expanded') == 'true') {
                    transformPanel.panel.css('display', '');
                }

                transformPanel.panel.attr('data-available', 'true');

                lastVisibleTransformPanel = transformPanel;
            } else {
                transformPanel.category.css('display', 'none');
                transformPanel.panel.css('display', 'none');
                transformPanel.panel.attr('data-available', 'false');
            }
        }

        if (lastVisibleTransformPanel) {
            lastVisibleTransformPanel.panel.addClass('last-visible');
        }
    };

    /** @override */
    GTransformPalette.prototype.toString = function () {
        return "[Object GTransformPalette]";
    };

    _.GTransformPalette = GTransformPalette;
})(this);