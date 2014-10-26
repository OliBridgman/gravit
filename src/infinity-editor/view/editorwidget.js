(function (_) {
    /**
     * GEditorWidget is a widget to render and edit a scene
     * @param {GEditor} [editor] the editor this view is bound too, defaults to null
     * @class GEditorWidget
     * @extends GSceneWidget
     * @constructor
     * @version 1.0
     */
    function GEditorWidget(editor) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = editor.getScene();
        this._editor = editor;
        this._viewConfiguration = new GEditorPaintConfiguration(); // !!overwrite

        GSceneWidget.apply(this, args);

        // Register drop events on our view
        $(this._htmlElement)
            .on('dragenter', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
            })
            .on('dragover', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
                evt.originalEvent.dataTransfer.dropEffect = 'move';
            })
            .on('drop', function (evt) {
                var event = evt.originalEvent;
                event.preventDefault();
                event.stopPropagation();
                var client = GWidget.convertClientPositionFromMousePosition(this._htmlElement, event);
                this._handleDrop(client, event.dataTransfer);
                return false;
            }.bind(this));
    }

    GObject.inherit(GEditorWidget, GSceneWidget);

    /**
     * @type {GEditor}
     * @private
     */
    GEditorWidget.prototype._editor = null;

    /**
     * @type {GEditorToolStage}
     * @private
     */
    GEditorWidget.prototype._toolStage = null;

    /**
     * Return the editor this view is rendering
     * @returns {GEditor}
     */
    GEditorWidget.prototype.getEditor = function () {
        return this._editor;
    };

    /**
     * Return the editor's tool stage
     * @returns {GEditorToolStage}
     */
    GEditorWidget.prototype.getToolStage = function () {
        return this._toolStage;
    };

    /** @override */
    GEditorWidget.prototype._initStages = function () {
        this.addStage(new GEditorBackStage(this));
        this.addStage(new GSceneStage(this));
        this.addStage(new GEditorFrontStage(this));
        this.addStage(new GEditorSceneStage(this));
        this._toolStage = this.addStage(new GEditorToolStage(this));
    };

    /** @override */
    GEditorWidget.prototype._updateViewTransforms = function () {
        GSceneWidget.prototype._updateViewTransforms.call(this);
        this._editor.updateInlineEditorForView(this);
    };

    /**
     * Handle a drop on the editor
     * @param {GPoint} position screen coordinates position
     * @param {DataTransfer} dataTransfer the dataTransfer object
     * @private
     */
    GEditorWidget.prototype._handleDrop = function (position, dataTransfer) {
        // Convert position into scene coordinates
        var scenePosition = this.getViewTransform().mapPoint(position);

        // First we'll check for a file-drop
        if (dataTransfer.files && dataTransfer.files.length > 0) {
            if (this._editor.hasEventListeners(GEditor.FileDropEvent)) {
                for (var i = 0; i < dataTransfer.files.length; ++i) {
                    this._editor.trigger(new GEditor.FileDropEvent(dataTransfer.files[i], scenePosition));
                }
            }
        } else if (dataTransfer.items && dataTransfer.items.length > 0) {
            // Iterate items and find an appropriate drag type
            for (var i = 0; i < dataTransfer.items.length; ++i) {
                var item = dataTransfer.items[i];
                var type = null;
                var source = null;

                if (item.type === GPattern.MIME_TYPE) {
                    type = GElementEditor.DropType.Pattern;
                    source = dataTransfer.getData(GPattern.MIME_TYPE);
                    source = source && source !== "" ? GPattern.deserialize(source) : null;
                } else if (item.type === GNode.MIME_TYPE) {
                    type = GElementEditor.DropType.Node;
                    source = dataTransfer.getData(GNode.MIME_TYPE);
                    source = source && source !== "" ? GNode.deserialize(source) : null;
                } else if (item.type === 'text/plain') {
                    type = GElementEditor.DropType.Text;
                    source = dataTransfer.getData('text/plain');
                }

                // If we've extracted a type, then try to let an editor handle it now
                if (type !== null) {
                    // Try to gather a stacked hit list underneath drop position
                    var stackedHits = this._scene.hitTest(position, this.getWorldTransform(), null, true, -1, this._scene.getProperty('pickDist'), true);

                    // If we had have one or more hits, iterate them
                    var acceptedDrop = false;
                    if (stackedHits && stackedHits.length > 0) {
                        for (var j = 0; j < stackedHits.length; ++j) {
                            var hit = stackedHits[j];
                            // Create a temporary editor for the hit element which gets not attached
                            var editor = GElementEditor.createEditor(hit.element);
                            if (editor && editor.acceptDrop(scenePosition, type, source, hit.data)) {
                                // Drop was accepted so we're done here
                                acceptedDrop = true;
                                break;
                            }
                        }
                    }

                    // If drop was not yet accepted, try to do some custom handling here depending on type
                    if (!acceptedDrop) {
                        if (type === GElementEditor.DropType.Node && source instanceof GElement) {
                            // Move the element to the drop-position
                            var elBBox = source.getGeometryBBox();
                            source.transform(new GTransform(1, 0, 0, 1,
                                scenePosition.getX() - (elBBox ? elBBox.getX() : 0), scenePosition.getY() - (elBBox ? elBBox.getY() : 0)))

                            // Insert element and select it
                            this._editor.insertElements([source]);
                            acceptedDrop = true;
                        }
                    }
                }
            }
        }
    };

    /** @override */
    GEditorWidget.prototype.toString = function () {
        return "[Object GEditorWidget]";
    };

    _.GEditorWidget = GEditorWidget;

})(this);