(function (_) {
    /**
     * IFEditorView is a widget to render and edit a scene
     * @param {IFEditor} [editor] the editor this view is bound too, defaults to null
     * @class IFEditorView
     * @extends IFView
     * @constructor
     * @version 1.0
     */
    function IFEditorView(editor) {
        var args = Array.prototype.slice.call(arguments);
        args[0] = editor.getScene();
        this._editor = editor;
        this._viewConfiguration = new IFEditorPaintConfiguration(); // !!overwrite

        IFView.apply(this, args);

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
                var client = GUIWidget.convertClientPositionFromMousePosition(this._htmlElement, event);
                this._handleDrop(client, event.dataTransfer);
                return false;
            }.bind(this));
    }

    IFObject.inherit(IFEditorView, IFView);

    /**
     * @type {IFEditor}
     * @private
     */
    IFEditorView.prototype._editor = null;

    /**
     * @type {IFEditorToolStage}
     * @private
     */
    IFEditorView.prototype._toolStage = null;

    /**
     * Return the editor this view is rendering
     * @returns {IFEditor}
     */
    IFEditorView.prototype.getEditor = function () {
        return this._editor;
    };

    /**
     * Return the editor's tool stage
     * @returns {IFEditorToolStage}
     */
    IFEditorView.prototype.getToolStage = function () {
        return this._toolStage;
    };

    /** @override */
    IFEditorView.prototype._initStages = function () {
        this.addStage(new IFEditorBackStage(this));
        this.addStage(new IFSceneStage(this));
        this.addStage(new IFEditorFrontStage(this));
        this.addStage(new IFEditorSceneStage(this));
        this._toolStage = this.addStage(new IFEditorToolStage(this));
    };

    /** @override */
    IFEditorView.prototype._updateViewTransforms = function () {
        IFView.prototype._updateViewTransforms.call(this);
        this._editor.updateInlineEditorForView(this);
    };

    /**
     * Handle a drop on the editor
     * @param {IFPoint} position screen coordinates position
     * @param {DataTransfer} dataTransfer the dataTransfer object
     * @private
     */
    IFEditorView.prototype._handleDrop = function (position, dataTransfer) {
        // Convert position into scene coordinates
        var scenePosition = this.getViewTransform().mapPoint(position);

        // First we'll check for a file-drop
        if (dataTransfer.files && dataTransfer.files.length > 0) {
            var imageType = /image.*/;

            for (var i = 0; i < dataTransfer.files.length; ++i) {
                var file = dataTransfer.files[i];
                var name = file.name;
                if (name.lastIndexOf('.') > 0) {
                    name = name.substr(0, name.lastIndexOf('.'));
                }

                // Check for image files
                if (file.type.match(imageType)) {
                    var reader = new FileReader();
                    reader.onload = function (event) {
                        var image = new IFImage();
                        image.setProperties(['name', 'url', 'trf'],
                            [name, event.target.result, new IFTransform(1, 0, 0, 1, scenePosition.getX(), scenePosition.getY())]);
                        this._editor.insertElements([image]);
                    }.bind(this)
                    reader.readAsDataURL(file);
                }

                // TODO : Check for infinity files and other types?
            }
        } else if (dataTransfer.items && dataTransfer.items.length > 0) {
            // Iterate items and find an appropriate drag type
            for (var i = 0; i < dataTransfer.items.length; ++i) {
                var item = dataTransfer.items[i];
                var type = null;
                var source = null;

                if (item.type === IFPattern.MIME_TYPE) {
                    type = IFElementEditor.DropType.Pattern;
                    source = dataTransfer.getData(IFPattern.MIME_TYPE);
                    source = source && source !== "" ? IFPattern.parsePattern(source) : null;
                } else if (item.type === IFNode.MIME_TYPE) {
                    type = IFElementEditor.DropType.Node;
                    source = dataTransfer.getData(IFNode.MIME_TYPE);
                    source = source && source !== "" ? IFNode.deserialize(source) : null;
                } else if (item.type === 'text/plain') {
                    type = IFElementEditor.DropType.Text;
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
                            var editor = IFElementEditor.createEditor(hit.element);
                            if (editor && editor.acceptDrop(scenePosition, type, source, hit.data)) {
                                // Drop was accepted so we're done here
                                acceptedDrop = true;
                                break;
                            }
                        }
                    }

                    // If drop was not yet accepted, try to do some custom handling here depending on type
                    if (!acceptedDrop) {
                        if (type === IFElementEditor.DropType.Node && source instanceof IFElement) {
                            // Move the element to the drop-position
                            var elBBox = source.getGeometryBBox();
                            source.transform(new IFTransform(1, 0, 0, 1,
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
    IFEditorView.prototype.toString = function () {
        return "[Object IFEditorView]";
    };

    _.IFEditorView = IFEditorView;

})(this);