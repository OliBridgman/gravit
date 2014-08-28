(function (_) {

    /**
     * Transform Panel
     * @class GTransformPanel
     * @extends GPanel
     * @constructor
     */
    function GTransformPanel() {
        GPanel.call(this);
        this._transformPanels = [];
    }

    IFObject.inherit(GTransformPanel, GPanel);

    GTransformPanel.ID = "transform";
    GTransformPanel.TITLE = new IFLocale.Key(GTransformPanel, "title");

    /**
     * @type {JQuery}
     * @private
     */
    GTransformPanel.prototype._htmlElement = null;

    /**
     * The transformer panels
     * @type {Array<{{panel: JQuery, transformer: GTransformer}}>}
     * @private
     */
    GTransformPanel.prototype._transformPanels = null;

    /**
     * @type {GDocument}
     * @private
     */
    GTransformPanel.prototype._document = null;

    /**
     * @type {Array<IFElement>}
     * @private
     */
    GTransformPanel.prototype._elements = null;

    /** @override */
    GTransformPanel.prototype.getId = function () {
        return GTransformPanel.ID;
    };

    /** @override */
    GTransformPanel.prototype.getTitle = function () {
        return GTransformPanel.TITLE;
    };

    /** @override */
    GTransformPanel.prototype.init = function (htmlElement, controls) {
        GPanel.prototype.init.call(this, htmlElement, controls);

        this._htmlElement = htmlElement;

        var transformPanels = $('<div></div>')
            .addClass('transform-panels')
            .appendTo(this._htmlElement);

        var _addTransformPanel = function (transformer) {
            // Create panel
            var panel = $('<div></div>')
                .css('display', 'none')
                .addClass('transform-panel-content');

            // Init transformer
            transformer.init(panel);

            // Append panel
            panel.appendTo(transformPanels);

            this._transformPanels.push({
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
    GTransformPanel.prototype._documentEvent = function (event) {
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
    GTransformPanel.prototype._updateFromSelection = function () {
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
    GTransformPanel.prototype._updateTransformPanels = function () {
        for (var i = 0; i < this._transformPanels.length; ++i) {
            var transformPanel = this._transformPanels[i];
            var available = !this._elements || this._elements.length === 0 ?
                false : transformPanel.transformer.update(this._document, this._elements);

            if (available) {
                transformPanel.panel.css('display', '');
            } else {
                transformPanel.panel.css('display', 'none');
            }
        }
    };

    /** @override */
    GTransformPanel.prototype.toString = function () {
        return "[Object GTransformPanel]";
    };

    _.GTransformPanel = GTransformPanel;
})(this);