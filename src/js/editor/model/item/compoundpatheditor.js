(function (_) {
    /**
     * An editor for a compound path
     * @param {GCompoundPath} compoundPath the compound path this editor works on
     * @class GCompoundPathEditor
     * @extends GElementEditor
     * @constructor
     */
    function GCompoundPathEditor(compoundPath) {
        GShapeEditor.call(this, compoundPath);
    };
    GObject.inherit(GCompoundPathEditor, GShapeEditor);
    GElementEditor.exports(GCompoundPathEditor, GCompoundPath);

    /** @override */
    GCompoundPathEditor.prototype.transform = function (transform, partId, partData) {
        if (partId && GUtil.dictionaryContainsValue(GPathEditor.PartType, partId.type)) {
            for (var i = 0; i < this._editors.length; ++i) {
                var ed = this._editors[i];
                if (ed.getPartSelection()) {
                    ed.transform(transform, partId, partData);
                }
            }
        } else {
            GShapeEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    GCompoundPathEditor.prototype._setTransform = function (transform) {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            ed._setTransform(transform);
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.resetTransform = function () {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            ed.resetTransform();
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.canApplyTransform = function () {
        var canApply = false;
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            canApply = canApply || ed.canApplyTransform();
        }
        return canApply;
    };

    /** @override */
    GCompoundPathEditor.prototype.applyTransform = function (element) {
        for (var i = 0; i < this._editors.length; ++i) {
            var ed = this._editors[i];
            if (ed.canApplyTransform()) {
                ed.applyTransform(ed._element);
            }
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.getBBox = function (transform) {
        var result = GShapeEditor.prototype.getBBox.call(this, transform);
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            var targetTransform = transform;

            // Pre-multiply internal transformation if any
            if (this._transform) {
                targetTransform = this._transform.multiplied(transform);
            }
            for (var i = 0; i < this._editors.length; ++i) {
                var childBBox = this._editors[i].getBBox(targetTransform);
                if (childBBox && !childBBox.isEmpty()) {
                    result = result ? result.united(childBBox) : childBBox;
                }
            }
        }

        return result;
    };

    /** @override */
    GCompoundPathEditor.prototype._attach = function () {
        var scene = this._element.getScene();
        if (scene != null) {
            scene.addEventListener(GElement.GeometryChangeEvent, this._geometryChange, this);
        }
    };

    /** @override */
    GCompoundPathEditor.prototype._detach = function () {
        // Ensure to de-select all selected anchor points when detaching
        for (var anchorPath = this._element.getAnchorPaths().getFirstChild(); anchorPath != null; anchorPath = anchorPath.getNext()) {
            anchorPath.removeFlag(GNode.Flag.Selected);
        }

        var scene = this._element.getScene();
        if (scene != null) {
            scene.removeEventListener(GElement.GeometryChangeEvent, this._geometryChange);
        }

        GShapeEditor.prototype._detach.call(this);
    };

    /** @override */
    GCompoundPathEditor.prototype.getPartInfoAt = function (location, transform, acceptor, tolerance) {
        var res = GShapeEditor.prototype.getPartInfoAt.call(this, location, transform, acceptor, tolerance);
        if (res) {
            if (!res.data) {
                res.data = {};
            }
            res.data.ownerEditor = this;
            return res;
        }
        return null;
    };

    /** @override */
    GCompoundPathEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        var res = null;
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.openEditor(pt);
            res = pathEditor._getPartInfoAt(location, transform, tolerance);
            if (res) {
                if (!res.data) {
                    res.data = {};
                }
                res.data.ownerEditor = this;
                return res;
            }
        }
        return null;
    };

    /** @override */
    GCompoundPathEditor.prototype._prePaint = function (transform, context) {
        if (this.hasFlag(GElementEditor.Flag.Selected) || this.hasFlag(GElementEditor.Flag.Highlighted)) {
            var element = this.getPaintElement();

            // Work in transformed coordinates to avoid scaling outline
            var transformer = new GVertexTransformer(element, transform);
            context.canvas.putVertices(new GVertexPixelAligner(transformer));

            // Paint either outlined or highlighted (highlighted has a higher precedence)
            context.canvas.strokeVertices(this.hasFlag(GElementEditor.Flag.Highlighted) ? context.highlightOutlineColor : context.selectionOutlineColor, 1);

            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = GElementEditor.openEditor(pt);
                pathEditor._prePaint(transform, context);
            }
        }
    };

    /** @override */
    GCompoundPathEditor.prototype._postPaint = function (transform, context) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.openEditor(pt);
            pathEditor._postPaint(transform, context);
        }
    };

    /** @override */
    GCompoundPathEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a.type === b.type);
        if (eqs && a.type == GPathEditor.PartType.Point) {
            eqs = (a.point === b.point);
        } else if (eqs && a.type == GPathEditor.PartType.Segment) {
            eqs = (a.apLeft === b.apLeft && a.apRight == b.apRight);
        }
        return eqs;
    };

    /** @override */
    GCompoundPathEditor.prototype.updatePartSelection = function (toggle, selection) {
        // This editor should not have any parts selected
        if (this._partSelection) {
            this._partSelection = null;
        }
        if (!selection && this.hasFlag(GElementEditor.Flag.Selected)) {
            for (var i = 0; i < this._editors.length; ++i) {
                this._editors[i].updatePartSelection(toggle, null);
            }
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.updateOwnedPartsSelection = function (toggle, partInfosToSelect) {
        if (partInfosToSelect && partInfosToSelect.length) {
            var lastPartInfo = null;
            for (var i = 0; i < partInfosToSelect.length; ++i) {
                var partInfo = partInfosToSelect[i];
                if (partInfo.data.ownerEditor === this) {
                    if (toggle) {
                        partInfo.editor.updatePartSelection(toggle, [partInfo.id]);
                    } else {
                        lastPartInfo = partInfo;
                    }
                }
            }
            if (lastPartInfo) {
                this.updatePartSelection(false);
                lastPartInfo.editor.updatePartSelection(false, [lastPartInfo.id]);
            }
        }
    };

    /** override */
    GCompoundPathEditor.prototype.isPartSelectionUnderCollisionAllowed = function () {
        return true;
    };

    /** override */
    GCompoundPathEditor.prototype.updatePartSelectionUnderCollision = function (toggle, collisionArea) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.openEditor(pt);
            pathEditor.updatePartSelectionUnderCollision(toggle, collisionArea);
        }
    };

    /** override */
    GCompoundPathEditor.prototype.isDeletePartsAllowed = function () {
        var res = false;
        if (this.hasFlag(GElementEditor.Flag.Selected)) {
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null && !res; pt = pt.getNext()) {
                var pathEditor = GElementEditor.openEditor(pt);
                res = pathEditor.isDeletePartsAllowed();
            }
        }
        return res;
    };

    /** override */
    GCompoundPathEditor.prototype.deletePartsSelected = function () {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.openEditor(pt);
            if (pathEditor.isDeletePartsAllowed()) {
                pathEditor.deletePartsSelected();
            }
        }
    };

    /** override */
    GCompoundPathEditor.prototype.isAlignPartsAllowed = function () {
        var res = false;
        if (this.hasFlag(GElementEditor.Flag.Selected)) {
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null && !res; pt = pt.getNext()) {
                var pathEditor = GElementEditor.openEditor(pt);
                res = pathEditor.isAlignPartsAllowed();
            }
        }
        return res;
    };

    /** override */
    GCompoundPathEditor.prototype.alignParts = function (alignType, posX, posY) {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.openEditor(pt);
            if (pathEditor.isAlignPartsAllowed()) {
                pathEditor.alignParts(alignType, posX, posY);
            }
        }
    };

    /**
     * If the path is updated (may be way around of this path editor), handle this by updating preview
     * @param {GElement.GeometryChangeEvent} evt
     * @private
     */
    GCompoundPathEditor.prototype._geometryChange = function (evt) {
        if (evt.type == GElement.GeometryChangeEvent.Type.Before || evt.type == GElement.GeometryChangeEvent.Type.After) {
            var invalidate = evt.element == this._element;
            if (!invalidate && evt.element instanceof GPath) {
                for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null && !invalidate; pt = pt.getNext()) {
                    if (pt == evt.element) {
                        invalidate = true;
                    }
                }
            }
            if (invalidate) {
                if (evt.type == GElement.GeometryChangeEvent.Type.After) {
                    this.releasePathPreview();
                }
                this.requestInvalidation();
            }
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.setFlag = function (flag) {
        if ((this._flags & flag) == 0) {
            this.requestInvalidation();
            this._flags = this._flags | flag;
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = GElementEditor.openEditor(pt);
                pathEditor.setFlag(flag);
            }
            this.requestInvalidation();
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.removeFlag = function (flag) {
        if ((this._flags & flag) != 0) {
            this.requestInvalidation();
            this._flags = this._flags & ~flag;
            for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
                var pathEditor = GElementEditor.openEditor(pt);
                pathEditor.removeFlag(flag);
            }
            this.requestInvalidation();
        }
    };

    GCompoundPathEditor.prototype.releasePathPreview = function () {
        for (var pt = this._element.getAnchorPaths().getFirstChild(); pt != null; pt = pt.getNext()) {
            var pathEditor = GElementEditor.getEditor(pt);
            if (pathEditor) {
                pathEditor.releasePathPreview();
            }
        }
    };

    /** @override */
    GCompoundPathEditor.prototype.toString = function () {
        return "[Object GCompoundPathEditor]";
    };

    _.GCompoundPathEditor = GCompoundPathEditor;
})(this);
