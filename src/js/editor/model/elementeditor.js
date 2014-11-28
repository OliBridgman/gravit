(function (_) {
    /**
     * The base for an element editor
     * @param {GElement} element the element this editor works on
     * @class GElementEditor
     * @extends GObject
     * @constructor
     */
    function GElementEditor(element) {
        this._element = element;
    };
    GObject.inherit(GElementEditor, GObject);

    GElementEditor._Editors = {};

    GElementEditor.exports = function (editorClass, nodeClass) {
        GElementEditor._Editors[GObject.getTypeId(nodeClass)] = editorClass;
    };

    /**
     * Options for element editor
     */
    GElementEditor.OPTIONS = {
        /**
         * The regular size of an annotation
         * @type Number
         */
        annotationSizeRegular: 6,

        /**
         * The small size of an annotation
         * @type Number
         */
        annotationSizeSmall: 4,

        /**
         * The size of the center cross
         * @type Number
         */
        centerCrossSize: 4
    };

    GElementEditor.Flag = {
        /**
         * The editor is in selected status
         * @type Number
         * @version 1.0
         */
        Selected: 1 << 0,

        /**
         * The editor is in highlighted status
         * @type Number
         * @version 1.0
         */
        Highlighted: 1 << 1,

        /**
         * The editor is in detail status
         * @type Number
         * @version 1.0
         */
        Detail: 1 << 2,

        /**
         * The editor is in outline status
         * @type Number
         * @version 1.0
         */
        Outline: 1 << 3
    };

    /**
     * Type of an annotation
     * TODO: remove this extra enum
     * @enum
     */
    GElementEditor.Annotation = {
        Rectangle: ifAnnotation.AnnotType.Rectangle,
        Circle: ifAnnotation.AnnotType.Circle,
        Diamond: ifAnnotation.AnnotType.Diamond
    };

    /**
     * Type of a drop
     * @enum
     */
    GElementEditor.DropType = {
        /**
         * A pattern is dropped, the type is GPattern
         */
        Pattern: 0,

        /**
         * A text is dropped, the type is String
         */
        Text: 1,

        /**
         * A node is dropped, the type is GNode
         */
        Node: 2
    };

    /**
     * Returns any opened/attached editor on a element if it has any
     * @param {GElement} element the element to get an open editor for
     * @returns {GElementEditor} the editor opened on the element or null for none
     * @version 1.0
     */
    GElementEditor.getEditor = function (element) {
        return element.__editor__ ? element.__editor__ : null;
    };

    /**
     * Create and returns a new editor instance for a given element
     * @param {GElement} element the element to create an editor for
     * @return {GElementEditor} a newly created element editor or null for none
     * @version 1.0
     */
    GElementEditor.createEditor = function (element) {
        var editorClass = GElementEditor._Editors[GObject.getTypeId(element)];
        if (editorClass) {
            return new editorClass(element);
        }
        return null;
    };

    /**
     * Opens and attaches an editor to a given element. Note that this will
     * also iterate up all parents and create their editors as well. Note
     * that only registered editors are opened. If the element already has
     * an editor, this call will be a NO-OP
     * @param {GElement} element the element to open an editor on
     * @returns {GElementEditor} the opened editor instance or null for none
     * @version 1.0
     */
    GElementEditor.openEditor = function (element) {
        if (!element._scene) {
            throw new Error("Node is not attached to create an editor for.");
        }
        if (GElementEditor.getEditor(element) != null) {
            // editor already attached
            return GElementEditor.getEditor(element);
        }
        var editor = GElementEditor.createEditor(element);
        if (!editor) {
            return null;
        }

        // If we have a parent then create the parent's editor as well
        // and attach our new editor to it. Note that we'll iterate our
        // hierarchy up until we've found a valid editor parent. This
        // might overjump nodes in tree that do not have an editor.
        for (var parentNode = element.getParent(); parentNode !== null; parentNode = parentNode.getParent()) {
            var parentEditor = GElementEditor.getEditor(parentNode);
            if (!parentEditor) {
                parentEditor = GElementEditor.openEditor(parentNode);
            }
            if (parentEditor) {
                // Figure the right insertion point using element comparison
                var referenceEditor = null;
                for (var nextNode = element.getNext(); nextNode != null; nextNode = nextNode.getNext()) {
                    var nextEditor = GElementEditor.getEditor(nextNode);
                    if (nextEditor) {
                        referenceEditor = nextEditor;
                        break;
                    }
                }

                parentEditor.insertEditor(editor, referenceEditor);

                // Done here, found a parent editor
                break;
            }
        }

        // Attach editor to element now and return it
        editor._attach();
        element.__editor__ = editor;

        return editor;
    };

    /**
     * Close an editor on a given element if it has any. Note that
     * this will also correctly remove the editor instance from
     * any parent editors the element may have as well as it will
     * close all sub editors of the element. Note that only registered
     * editors will be closed, others will be kept intact and require
     * a manual close / removal.
     * @param {GElement} element the element to close the editor on
     * @version 1.0
     */
    GElementEditor.closeEditor = function (element) {
        var elementEditor = GElementEditor.getEditor(element);
        if (elementEditor) {
            // Return if editor is not registered
            var editorClass = GElementEditor._Editors[GObject.getTypeId(element)];
            if (!editorClass) {
                return;
            }

            // Close all child editors if any, first
            var editors = elementEditor.getEditors();
            if (editors) {
                for (var i = 0; i < editors.length; ++i) {
                    GElementEditor.closeEditor(editors[i].getElement());
                }
            }

            // Remove from any parent editor now
            if (elementEditor.getParentEditor()) {
                elementEditor.getParentEditor().removeEditor(elementEditor);
            }

            // Let editor know about detachment
            elementEditor._detach();

            // Finally detach and be done
            delete element.__editor__;
        }
    };

    // -----------------------------------------------------------------------------------------------------------------
    // GElementEditor.PartInfo Class
    // -----------------------------------------------------------------------------------------------------------------

    /**
     * Part of an editor
     * @param {GElementEditor} editor the owning editor of the part
     * @param {*} id id of the part, specific to editor
     * @param {*} [data] data of the part, specific to editor
     * @param {Boolean} isolated whether the part is isolated or not
     * @param {Boolean} selectable whether the part is selectable or not
     * @constructor
     * @class GElementEditor.PartInfo
     */
    GElementEditor.PartInfo = function (editor, id, data, isolated, selectable) {
        this.editor = editor;
        this.id = id;
        this.data = data;
        this.isolated = isolated;
        this.selectable = selectable;
    };

    /**
     * The id of the part, specific to editor
     * @type {*}
     */
    GElementEditor.PartInfo.prototype.id = null;

    /**
     * The data of the part, specific to editor
     * @type {*}
     */
    GElementEditor.PartInfo.prototype.data = null;

    /**
     * The owning editor of the part
     * @type {GElementEditor}
     */
    GElementEditor.PartInfo.prototype.editor = null;

    /**
     * Whether the part is isolated or not
     * @type {Boolean}
     */
    GElementEditor.PartInfo.prototype.isolated = null;

    /**
     * Whether the part is selectable or not
     * @type {Boolean}
     */
    GElementEditor.PartInfo.prototype.selectable = null;

    // -----------------------------------------------------------------------------------------------------------------
    // GElementEditor Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * @type {Number}
     * @private
     */
    GElementEditor.prototype._flags = 0;

    /**
     * @type {GElement}
     * @private
     */
    GElementEditor.prototype._element = null;

    /**
     * @type {GElement}
     * @private
     */
    GElementEditor.prototype._elementPreview = null;

    /**
     * Current transformation to be applied to the element in world coordinates
     * @type {GTransform}
     * @private
     */
    GElementEditor.prototype._transform = null;

    /**
     * @type {GElementEditor}
     * @private
     */
    GElementEditor.prototype._parentEditor = null;

    /**
     * @type {Array<GElementEditor>}
     * @private
     */
    GElementEditor.prototype._editors = null;

    /**
     * @type {Array<*>}
     * @private
     */
    GElementEditor.prototype._partSelection = null;

    /**
     * Checks whether this node editor has a certain flag setup
     * @param {Number} flag
     * @returns {Boolean}
     * @see GElementEditor.Flag
     * @version 1.0
     */
    GElementEditor.prototype.hasFlag = function (flag) {
        return (this._flags & flag) != 0;
    };

    /**
     * Set a flag on this node editor
     * @param {Number} flag the flag to set
     * @see GElementEditor.Flag
     * @version 1.0
     */
    GElementEditor.prototype.setFlag = function (flag) {
        if ((this._flags & flag) == 0) {
            this.requestInvalidation();
            this._flags = this._flags | flag;
            this.requestInvalidation();
        }
    };

    /**
     * Remove a flag from this node editor
     * @param {Number} flag the flag to remove
     * @see GElementEditor.Flag
     * @version 1.0
     */
    GElementEditor.prototype.removeFlag = function (flag) {
        if ((this._flags & flag) != 0) {
            this.requestInvalidation();
            this._flags = this._flags & ~flag;
            this.requestInvalidation();
        }
    };

    /**
     * Return the underlying element this editor is working on
     * @returns {GElement}
     */
    GElementEditor.prototype.getElement = function () {
        return this._element;
    };

    /**
     * Return the underlying element this editor is painting
     * @returns {GElement}
     */
    GElementEditor.prototype.getPaintElement = function () {
        return this._elementPreview ? this._elementPreview : this._element;
    };

    /**
     * Return the parent editor for this editor if any
     * @returns {GElementEditor}
     * @version 1.0
     */
    GElementEditor.prototype.getParentEditor = function () {
        return this._parentEditor;
    };

    /**
     * Return the sub editors if any
     * @returns {Array<GElementEditor>} the sub editors array or null for none
     * @version 1.0
     */
    GElementEditor.prototype.getEditors = function () {
        return this._editors;
    };

    /**
     * Called to append a sub editor to this one
     * @param {GElementEditor} editor the editor to append
     * @version 1.0
     */
    GElementEditor.prototype.appendEditor = function (editor) {
        this.insertEditor(editor, null);
    };

    /**
     * Called to insert a sub editor to this one
     * @param {GElementEditor} editor the editor to insert
     * @param {GElementEditor} referenceEditor the editor to insert before or
     * null to append at the end
     * @version 1.0
     */
    GElementEditor.prototype.insertEditor = function (editor, referenceEditor) {
        var index = this._editors ? this._editors.length : 0;
        if (referenceEditor) {
            index = this._editors.indexOf(referenceEditor);
            if (index < 0) {
                throw new Error("Unknown reference editor.");
            }
        }

        if (editor._parentEditor != null) {
            throw new Error("Editor already appended.");
        }

        if (!this._editors) {
            this._editors = [];
        }

        if (index >= this._editors.length) {
            this._editors.push(editor);
        } else {
            this._editors.splice(index, 0, editor);
        }

        editor._parentEditor = this;
    };

    /**
     * Called to remove a sub editor from this one
     * @param {GElementEditor} editor the editor to remove
     * @version 1.0
     */
    GElementEditor.prototype.removeEditor = function (editor) {
        var index = this._editors.indexOf(editor);
        if (index < 0) {
            throw new Error("Unknown editor.");
        }

        this._editors.splice(index, 1);
        editor._parentEditor = null;
    };

    /**
     * Accept a visitor
     * @param {Function} visitor a visitor function called for each visit retrieving the current
     * node editor as first parameter. The function may return a boolean value indicating whether to
     * return visiting (true) or whether to cancel visiting (false). Not returning anything or
     * returning anything else than a Boolean will be ignored.
     * This defaults to false.
     * @return {Boolean} result of visiting (false = canceled, true = went through)
     * @version 1.0
     */
    GElementEditor.prototype.accept = function (visitor) {
        if (visitor.call(null, this) === false) {
            return false;
        }

        if (this._editors) {
            for (var i = 0; i < this._editors.length; ++i) {
                if (this._editors[i].accept(visitor) === false) {
                    return false;
                }
            }
        }

        return true;
    };

    /**
     * Returns if a given part-id of this editor is selected or not
     * @param {*} partId
     * @return {Boolean}
     */
    GElementEditor.prototype.isPartSelected = function (partId) {
        return this._indexOfPartId(this._partSelection, partId) >= 0;
    };

    /**
     * Get all selected parts
     * @returns {Array<*>}
     */
    GElementEditor.prototype.getPartSelection = function () {
        return this._partSelection;
    };

    /**
     * Update the selected parts
     * @param {Boolean} toggle whether to toggle selection (true) or overwrite it (false)
     * @param {Array<*>} selection the new part selection to be assigned
     */
    GElementEditor.prototype.updatePartSelection = function (toggle, selection) {
        if (this.hasFlag(GElementEditor.Flag.Selected)) {
            var newSelection = null;

            if (!toggle || !this._partSelection) {
                newSelection = selection && selection.length > 0 ? selection.slice() : null;
            } else {
                if (selection) {
                    newSelection = [];

                    // Add all non-duplicates of previous selection
                    for (var i = 0; i < this._partSelection.length; ++i) {
                        if (this._indexOfPartId(selection, this._partSelection[i]) < 0) {
                            newSelection.push(this._partSelection[i]);
                        }
                    }

                    // Add all new ones
                    for (var i = 0; i < selection.length; ++i) {
                        if (this._indexOfPartId(this._partSelection, selection[i]) < 0) {
                            newSelection.push(selection[i]);
                        }
                    }

                    if (newSelection.length === 0) {
                        newSelection = null;
                    }
                }
            }

            if (!GUtil.equals(newSelection, this._partSelection, false)) {
                this._updatePartSelection(newSelection);
            }
        }
    };

    /**
     * Update the selected parts in some component editor
     * @param {Boolean} toggle whether to toggle selection (true) or overwrite it (false)
     * @param {Array<GElementEditor.partInfo>} partInfosToSelect the partInfos for new parts selection to be assigned
     */
    GElementEditor.prototype.updateOwnedPartsSelection = function (toggle, partInfosToSelect) {
        if (partInfosToSelect) {
            var selection = [];
            for (var i = 0; i < partInfosToSelect.length; ++i) {
                var partInfo = partInfosToSelect[i];
                if (partInfo.data.ownerEditor === this) {
                    selection.push(partInfo.id);
                }
            }
            if (selection.length) {
                this.updatePartSelection(toggle, selection);
            }
        }
    };

    /**
     * If parts selection allowed based on collision area
     * @returns {Boolean} true is allowed
     */
    GElementEditor.prototype.isPartSelectionUnderCollisionAllowed = function () {
        return false;
    };

    /**
     * Update the parts selection based on collision area
     * @param {boolean} toggle if true then this will merge/united the
     * current selection parts with the new selected parts, otherwise the current selection parts
     * will be replaced with the new selected parts
     * @param {GVertexSource} collisionArea
     * @return {Boolean} true if some parts were selected, false otherwise
     */
    GElementEditor.prototype.updatePartSelectionUnderCollision = function (toggle, collisionArea) {
        return false;
    };

    /**
     * Returns true if deletion of selected parts from element is allowed, and some parts are selected
     * @returns {Boolean}
     */
    GElementEditor.prototype.isDeletePartsAllowed = function () {
        return false;
    };

    /**
     * Delete the selected parts from element. Should be called only after prior check with isDeletePartsAllowed()
     */
    GElementEditor.prototype.deletePartsSelected = function () {
        // NO-OP
    };

    /**
     * Returns true if aligning of selected parts from element is allowed, and some parts are selected
     * @returns {Boolean}
     */
    GElementEditor.prototype.isAlignPartsAllowed = function () {
        return false;
    };

    /**
     * Align the selected parts of the element. Should be called only after prior check with isAlignPartsAllowed()
     * @param {GAlignAction.Type} alignType
     * @param {Number} posX - the X coordinate of the position to align to, or null if no vertical alignment
     * @param {Number} posY - the Y coordinate of the position to align to, or null if no horizontal alignment
     */
    GElementEditor.prototype.alignParts = function (alignType, posX, posY) {
        // NO-OP
    };

    /**
     * Called whenever information about a part at a given location shall be returned
     * @param {GPoint} location the location to get a part for in view coordinates
     * @param {GTransform} transform the current transformation of the view
     * @param {Function} [acceptor] optional callback function getting called
     * for a part and receiving the current editor as it's only parameter.
     * The function should return true to accept the editor or false for not.
     * @param {Number} [tolerance] optional tolerance for testing the location.
     * If not provided defaults to zero.
     * @returns {GElementEditor.PartInfo} null if no part is available or a valid part info
     */
    GElementEditor.prototype.getPartInfoAt = function (location, transform, acceptor, tolerance) {
        tolerance = tolerance || 0;

        // Iterate sub editors, first
        if (this._editors && this._editors.length) {
            for (var i = this._editors.length - 1; i >= 0; --i) {
                var result = this._editors[i].getPartInfoAt(location, transform, acceptor, tolerance);
                if (result) {
                    return result;
                }
            }
        }

        if (acceptor && acceptor.call(null, this) !== true) {
            return null;
        }

        // Try to hit test our editor now
        var bbox = this.getBBox(transform);
        if (bbox && !bbox.isEmpty()) {
            if (bbox.containsPoint(location)) {
                var result = this._getPartInfoAt(location, transform, tolerance);
                if (result) {
                    return result;
                }
            }
        }

        return null;
    };

    /**
     * Called whenever this editor should paint itself
     * @param {GTransform} transform the transformation of the scene
     * @param {GPaintContext} context
     */
    GElementEditor.prototype.paint = function (transform, context) {
        // Paint children editors if any
        this._paintChildren(transform, context);
    };

    /**
     * Called whenever this editor should return it's bbox.
     * Note that this should never return a compound bbox like
     * unioning all children but only the bbox of this one
     * specific editor. If the editor doesn't have a real bbox
     * like a group, null should be returned. The return bbox includes
     * the bbox margin already if any.
     * @param {GTransform} transform the transformation of the scene
     * @return {GRect} the bbox in view coordinates
     */
    GElementEditor.prototype.getBBox = function (transform) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }

            var bbox = this.getPaintElement().getGeometryBBox();
            if (bbox && !bbox.isEmpty()) {
                var expand = this.getBBoxMargin();
                bbox = targetTransform.mapRect(bbox)
                    .expanded(expand, expand, expand, expand);

                if (this.hasFlag(GElementEditor.Flag.Detail)) {
                    var customBBox = this.getCustomBBox(targetTransform, false);
                    if (customBBox) {
                        bbox = bbox.united(customBBox);
                    }
                }
            }

            return bbox;
        } else {
            return null;
        }
    };

    /**
     * Returns the bbox' margin added to each side to cover
     * the entire editor area. Returns by default 1 for 1-pixel
     * accuracy covering
     * @return {Number}
     */
    GElementEditor.prototype.getBBoxMargin = function () {
        return 1;
    };

    /**
     * Returns bbox based on visible additional elements like annotations or center cross
     * @param {GTransform} transform - the transformation to apply to points
     * before calculating additional visible elements {usually world to view transformation}
     * @param {Boolean} includeEditorTransform - shows if editor internal transformation should be applied
     * @return {GRect} the bbox in view coordinates
     */
    GElementEditor.prototype.getCustomBBox = function (transform, includeEditorTransform) {
        return null;
    };

    /**
     * Called to request an invalidation of this editor.
     * This will actually request an invalidation which will then
     * return back to this editor and ask it for providing
     * the actual invalidation area
     * @param {*} [args] optional arguments which will be passed
     * to this editor's invalidate callback.
     * If no arguments are passed, the editor will by default
     * return the bounding box of itself if it has any
     * @see invalidate
     */
    GElementEditor.prototype.requestInvalidation = function (args) {
        GEditor.getEditor(this._element.getScene()).requestInvalidation(this, args);
    };

    /**
     * Callback after an invalidation request
     * @param {GTransform} transform the transformation of the scene
     * @param {*} args optional args passed to the initial requestInvalidation
     * call. Maybe null which indicates to return this editor's bbox if any
     * @return {GRect} the transformed area to be invalidated or null for none
     */
    GElementEditor.prototype.invalidate = function (transform, args) {
        // Default handling for no arguments
        if (!args) {
            return this.getBBox(transform);
        }
        return null;
    };

    /**
     * Called whenever a part of this editor shell be moved
     * @param {*} partId the id of the editor part to be moved
     * @param {*} partData the data of the editor part to be moved
     * @param {GPoint} position the new position in view coordinates
     * the part should be moved to
     * @param {GTransform} viewToWorldTransform - the transformation to apply to position
     * @param {GGuides} guides to snap is needed
     * @param {Boolean} shift whether shift key is hold or not
     * @param {Boolean} option whether option key is hold or not
     */
    GElementEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        // Set outline flag and/or invalidate by default for each move
        if (!this.hasFlag(GElementEditor.Flag.Outline)) {
            this.setFlag(GElementEditor.Flag.Outline);
        } else {
            this.requestInvalidation();
        }
    };
    /**
     * Called whenever a move of a part shell be reset
     * @param {*} partId the id of the editor part that was moved
     * @param {*} partData the data of the editor part that was moved
     */
    GElementEditor.prototype.resetPartMove = function (partId, partData) {
        // Some resets by default
        this._elementPreview = null;
        this.removeFlag(GElementEditor.Flag.Outline);
    };

    /**
     * Called whenever a move of a part shell be applied
     * @param {*} partId the id of the editor part that was moved
     * @param {*} partData the data of the editor part that was moved
     */
    GElementEditor.prototype.applyPartMove = function (partId, partData) {
        // Some resets by default
        this._elementPreview = null;
        this.removeFlag(GElementEditor.Flag.Outline);
    };

    /**
     * Called whenever this editor shell be transformed
     * @param {GTransform} transform the transformation to be used
     * @param {*} [partId] optional id of part that initiated the transform
     * @param {*} [partData] optional data of part that initialized the transform
     */
    GElementEditor.prototype.transform = function (transform, partId, partData) {
        this._setTransform(transform);
    };

    /**
     * Called whenever the transformation of the editor shell be reset
     */
    GElementEditor.prototype.resetTransform = function () {
        this._elementPreview = null;

        // Invalidate on reset no matter what
        this.requestInvalidation();

        this._transform = null;

        // Remove outline
        this.removeFlag(GElementEditor.Flag.Outline);
    };

    /**
     * Called to test whether the current transformation of this editor
     * can be applied to the element
     * @return {Boolean} true if the transformation can be applied,
     * false if not
     */
    GElementEditor.prototype.canApplyTransform = function () {
        var element = this.getElement();

        // By default, transformation can only be applied if it is valid,
        // the element supports transforming and the element is not locked
        return this._transform && !this._transform.isIdentity() &&
            element.hasMixin(GElement.Transform) && !element.hasFlag(GElement.Flag.Locked);
    };

    /**
     * Called whenever the transformation of the editor shell be applied.
     * Note that the caller might decide that the transformation shall be
     * applied to another element and not the one the editor is currently
     * working on. However, it is guaranteed that in this case, the element
     * to apply the transformation instead is an exact clone of the element
     * this editor is currently working on.
     * @param {GElement} element the element to apply the transformation
     * to which might be different than the one this editor works on. This
     * will be never null.
     */
    GElementEditor.prototype.applyTransform = function (element) {
        if (!this._transform.isIdentity()) {
            // By default we'll simply transfer the transformation to the element
            element.transform(this._transform);
        }
        this.resetTransform();
    };

    /**
     * Called whenever something has been dropped on this editor.
     * If the editor is able to handle it, it should return true
     * to prevent any further handling.
     * @param {GPoint} position the drop position in scene coordinates
     * @param {GElementEditor.DropType} type
     * @param {*} source the drop source, the type depends on type
     * @param {*} hitData the GElement.HitResultInfo.data that was gathered
     * when hitting the element for this editor, might be null
     */
    GElementEditor.prototype.acceptDrop = function (position, type, source, hitData) {
        // By default, we'll ask all children editors, first
        if (this._editors) {
            for (var i = 0; i < this._editors.length; ++i) {
                if (this._editors[i].acceptDrop(position, type, source, hitData) === true) {
                    return true;
                }
            }
        }

        // Dropping a style on stylable elements will be handled as well
        if (type === GElementEditor.DropType.Node && source && source instanceof GStyle && this._element.hasMixin(GElement.Stylable)) {
            var editor = GEditor.getEditor(this._element.getScene());
            editor.beginTransaction();
            try {
                this._element.assignFrom(source);
                this._element.setProperty('sref', source.getProperty('_sdf') !== null ? null : source.getReferenceId());
            } finally {
                // TODO : I18N
                editor.commitTransaction('Drag Style');
            }
            return true;
        }

        return false;
    };

    /**
     * Called whenever a newly inserted element should become
     * some default setup
     */
    GElementEditor.prototype.initialSetup = function () {
        // NO-OP
    };

    /**
     * Called to check whether this editor can do some inline editing
     * @returns {boolean}
     */
    GElementEditor.prototype.canInlineEdit = function () {
        return false;
    };

    /**
     * Called to check whether this editor currently is in inline edit mode
     * @returns {boolean}
     */
    GElementEditor.prototype.isInlineEdit = function () {
        return false;
    };

    /**
     * Called to let the editor do some inline editing
     * @param {GEditorWidget} view the view the inline editing should
     * take place within
     * @param {HTMLElement} container the container any editor element
     * should be attached to relative to the view
     */
    GElementEditor.prototype.beginInlineEdit = function (view, container) {
        throw new Error('Not Supported.');
    };

    /**
     * Called whenever something in the view has changed and the inline
     * editor should adjust itself. This will also called immediately
     * after the beginInlineEdit call.
     * @param {GEditorWidget} view the view the inline editing takes place
     * @param {GPoint} [position] optional position in screen cordinates,
     * defaults to null
     */
    GElementEditor.prototype.adjustInlineEditForView = function (view, position) {
        throw new Error('Not Supported.');
    };

    /**
     * Called to finish inline editing. This is called within a transaction
     * and should not only close any inline editor but also apply any changes.
     * @return {String} optional human readable text of the editing action description
     */
    GElementEditor.prototype.finishInlineEdit = function () {
        throw new Error('Not Supported.');
    };

    /**
     * Allow each editor to perform the needed actions when drag is started in SubSelect Tool
     * @param {GElementEditor.PartInfo} partInfo - the part info under mouse
     * @returns {GElementEditor.PartInfo} - updated part info under mouse
     */
    GElementEditor.prototype.subSelectDragStartAction = function (partInfo) {
        var newPartInfo = null;

        // By default, we'll ask all children editors, first
        if (this._editors) {
            for (var i = 0; i < this._editors.length; ++i) {
                newPartInfo = this._editors[i].subSelectDragStartAction(partInfo);
                if (newPartInfo) {
                    return newPartInfo;
                }
            }
        }

        if (partInfo.editor === this) {
            newPartInfo = partInfo;
        }

        return newPartInfo;
    };


    GElementEditor.prototype.validateSelectionChange = function () {
        return true;
    };

    /**
     * Called when this editor is attached to the node
     */
    GElementEditor.prototype._attach = function () {
        // NO-OP
    };

    /**
     * Called when this editor is detached from the node
     */
    GElementEditor.prototype._detach = function () {
        // NO-OP
    };

    /**
     * Paint all sub editors if any
     * @param {GPaintContext} context
     * @private
     */
    GElementEditor.prototype._paintChildren = function (transform, context) {
        if (this._editors) {
            for (var i = 0; i < this._editors.length; ++i) {
                var editor = this._editors[i];
                if (editor instanceof GElementEditor) {
                    editor.paint(transform, context);
                }
            }
        }
    };

    /**
     * Called whenever a part should be returned at a given location.
     * Note that the caller is responsible for testing the bbox of this
     * editor for faster lookup as well as the caller is responsible for
     * iterating any sub editors as well.
     * @param {GPoint} location the location to get a part for in view coordinates
     * @param {GTransform} transform - the current transformation of the scene {worldToViewTransform}
     * @param {Number} tolerance tolerance for testing the location
     * @returns {*} null if no part is available or an editor-specific part
     */
    GElementEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        return null;
    };

    /**
     * Compare two part ids. If part ids of the editor are complex then
     * the editor descendant should override this with a custom comparison.
     * @param {*} a
     * @param {*} b
     * @returns {boolean}
     * @private
     */
    GElementEditor.prototype._partIdAreEqual = function (a, b) {
        return a === b;
    };

    /**
     * Get index of part-id within an array using the _partIdAreEqual function
     * @param {Array<*>} array
     * @param {*} partId
     * @returns {Number}
     * @private
     */
    GElementEditor.prototype._indexOfPartId = function (array, partId) {
        if (array && array.length > 0) {
            for (var i = 0; i < array.length; ++i) {
                if (this._partIdAreEqual(array[i], partId)) {
                    return i;
                }
            }
        }
        return -1;
    };

    /**
     * Called whenever the part selection should be udpated
     * @param {Array<*>} selection the new part selection
     * @private
     */
    GElementEditor.prototype._updatePartSelection = function (selection) {
        this.requestInvalidation();
        this._partSelection = selection;
        this.requestInvalidation();
    };

    /**
     * Paint an annotation
     * @param {GPaintContext} context the paint context to paint on
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {GElementEditor.Annotation} annotation the annotation to be painted
     * @param {Boolean} [selected] whether the annotation should be painted
     * selected or not. Defaults to false.
     * @param {Boolean} [small] if true, paints the annotation in small size,
     * otherwise in default size
     */
    GElementEditor.prototype._paintAnnotation = function (context, transform, center, annotation, selected, small) {
        var size = small ? GElementEditor.OPTIONS.annotationSizeSmall : GElementEditor.OPTIONS.annotationSizeRegular;
        ifAnnotation.paintAnnotation(context, transform, center, annotation, selected, size);
    };

    /**
     * Get bbox of an annotation
     * @param {GTransform} transform the current transformation in use
     * @param {GPoint} center the center point of the annotation
     * @param {Boolean} [small] whether to paint small annotation or not
     */
    GElementEditor.prototype._getAnnotationBBox = function (transform, center, small) {
        var size = small ? GElementEditor.OPTIONS.annotationSizeSmall : GElementEditor.OPTIONS.annotationSizeRegular;
        return ifAnnotation.getAnnotationBBox(transform, center, size);
    };

    /**
     * @returns {Boolean}
     * @private
     */
    GElementEditor.prototype._showAnnotations = function () {
        return this.hasFlag(GElementEditor.Flag.Selected) && !this.hasFlag(GElementEditor.Flag.Outline);
    };

    /**
     * Assign editor transformation and invalidate
     * @param {GTransform} transform
     * @private
     */
    GElementEditor.prototype._setTransform = function (transform) {
        // By default we'll simply assign the transformation
        if (!GTransform.equals(this._transform, transform)) {
            if (!this.hasFlag(GElementEditor.Flag.Outline)) {
                this.setFlag(GElementEditor.Flag.Outline);
            } else {
                this.requestInvalidation();
            }

            this._transform = transform;
            this.requestInvalidation();
        }
    };

    /** @override */
    GElementEditor.prototype.toString = function () {
        return "[Object GElementEditor]";
    };

    _.GElementEditor = GElementEditor;
})(this);