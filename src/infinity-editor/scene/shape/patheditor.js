(function (_) {
    /**
     * An editor for a path
     * @param {IFPath} path the path this editor works on
     * @class IFPathEditor
     * @extends IFPathBaseEditor
     * @constructor
     */
    function IFPathEditor(path) {
        IFPathBaseEditor.call(this, path);

        // Add all selected anchor points into our part selection if there're any
        var selectedAnchorPoints = path.getAnchorPoints().queryAll(':selected');
        for (var i = 0; i < selectedAnchorPoints.length; ++i) {
            if (!this._partSelection) {
                this._partSelection = [];
            }
            this._partSelection.push({type: IFPathEditor.PartType.Point, point: selectedAnchorPoints[i]});
        }
    };
    IFObject.inherit(IFPathEditor, IFPathBaseEditor);
    IFElementEditor.exports(IFPathEditor, IFPath);

    /**
     * Type of path an editor part
     * @enum
     */
    IFPathEditor.PartType = {
        Segment: 1,
        Point: 2,
        LeftHandle: 3,
        RightHandle: 4,
        LeftShoulder: 5,
        RightShoulder: 6
    };

    /**
     * Type of additional data of segment part
     * @enum
     */
    IFPathEditor.SegmentData = {
        HitRes: 1,
        Handles: 2
    };

    // -----------------------------------------------------------------------------------------------------------------
    // IFPathEditor Class
    // -----------------------------------------------------------------------------------------------------------------
    /**
     * Mapping of source point indices (key) to preview point indices (value)
     * @type {*}
     * @private
     */
    IFPathEditor.prototype._sourceIndexToPreviewIndex = null;

    /**
     * Indicates if path extension is expected to be continued by path tools
     * @type {Boolean}
     * @private
     */
    IFPathEditor.prototype._activeExtedingMode = false;

    /**
     * Returns if path editor is in path actively axtending mode
     * @returns {Boolean}
     */
    IFPathEditor.prototype.isActiveExtendingMode = function () {
        return this._activeExtedingMode;
    };

    /**
     * Sets the value of _activeExtedingMode flag
     * @param {Boolean} activeFlag - value to set
     */
    IFPathEditor.prototype.setActiveExtendingMode = function (activeFlag) {
        this._activeExtedingMode = activeFlag;
    };

    /** @override */
    IFPathEditor.prototype.getBBox = function (transform) {
        var bbox = IFPathBaseEditor.prototype.getBBox.call(this, transform);
        if (this._showAnnotations()) {

            // Pre-multiply internal transformation if any
            // (though it should not be set for path)
            if (this._transform) {
                transform = this._transform.multiplied(transform);
            }

            var _addToBBox = function (other) {
                if (other && !other.isEmpty()) {
                    bbox = bbox ? bbox.united(other) : other;
                }
            };

            this._iteratePoints(true, function (args) {
                // Handles
                if (args.leftHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftHandlePosition, true));
                }
                if (args.rightHandlePosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightHandlePosition, true));
                }

                // Shoulders
                if (args.leftShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.leftShoulderPosition, true));
                }
                if (args.rightShoulderPosition) {
                    _addToBBox(this._getAnnotationBBox(transform, args.rightShoulderPosition, true));
                }

                // Point
                _addToBBox(this._getAnnotationBBox(transform, args.position, true));
            }.bind(this));

            return bbox;
        } else {
            return bbox;
        }
    };


    /** @override */
    IFPathEditor.prototype.movePart = function (partId, partData, position, viewToWorldTransform, guides, shift, option) {
        this.requestInvalidation();
        this._createPathPreviewIfNecessary(partId.point);

        switch (partId.type) {
            case IFPathEditor.PartType.LeftHandle:
                this._movePreviewPointCoordinates(partId.point, 'hlx', 'hly', position, viewToWorldTransform, shift, guides);
                break;
            case IFPathEditor.PartType.RightHandle:
                this._movePreviewPointCoordinates(partId.point, 'hrx', 'hry', position, viewToWorldTransform, shift, guides);
                break;
            case IFPathEditor.PartType.LeftShoulder:
            case IFPathEditor.PartType.RightShoulder:
                var newPos = viewToWorldTransform.mapPoint(position);
                this._movePreviewPointShoulders(partId, newPos, shift);
                break;
        }

        this.requestInvalidation();
    };

    /** @override */
    IFPathEditor.prototype.resetPartMove = function (partId, partData) {
        this.releasePathPreview();
        this.requestInvalidation();
    };

    /** @override */
    IFPathEditor.prototype.applyPartMove = function (partId, partData) {
        switch (partId.type) {
            case IFPathEditor.PartType.LeftHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hlx', 'hly', 'ah']);
                break;
            case IFPathEditor.PartType.RightHandle:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['hrx', 'hry', 'ah']);
                break;
            case IFPathEditor.PartType.LeftShoulder:
            case IFPathEditor.PartType.RightShoulder:
                this._assignPreviewPointPropertiesToSourcePoint(partId.point, ['cl', 'cr']);
                break;
        }
        this.resetPartMove(partId, partData);
    };

    /** @override */
    IFPathEditor.prototype.transform = function (transform, partId, partData) {
        if (this._partSelection && this._partSelection.length > 0) {
            this.requestInvalidation();
            this._createPathPreviewIfNecessary();

            // If current partId is a segment, move segment and other selected points
            // like freehand does, otherwise move all selected points
            // including the ones from segments

            // Iterate selection and transform all anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var selectedPartId = this._partSelection[i];

                if (selectedPartId.type === IFPathEditor.PartType.Point) {
                    var selectedPoint = selectedPartId.point;
                    this._transformPreviewPointCoordinates(selectedPoint, 'x', 'y', transform);

                    // Make sure to transform handles as well if not auto-handles are set
                    if (!selectedPoint.getProperty('ah')) {
                        if (selectedPoint.getProperty('hlx') != null && selectedPoint.getProperty('hly') != null) {
                            this._transformPreviewPointCoordinates(selectedPoint, 'hlx', 'hly', transform);
                        }
                        if (selectedPoint.getProperty('hrx') != null && selectedPoint.getProperty('hry') != null) {
                            this._transformPreviewPointCoordinates(selectedPoint, 'hrx', 'hry', transform);
                        }
                    }
                } else if (selectedPartId.type === IFPathEditor.PartType.Segment && partId &&
                        this._partIdAreEqual(selectedPartId, partId) &&
                        partData.type == IFPathEditor.SegmentData.Handles) {

                    var apLeftPreview = this.getPathPointPreview(selectedPartId.apLeft);
                    var apRightPreview = this.getPathPointPreview(selectedPartId.apRight);
                    var dPt = transform.getTranslation();
                    var apL = new IFPoint(apLeftPreview.getProperty('x'), apLeftPreview.getProperty('y'));
                    var apR = new IFPoint(apRightPreview.getProperty('x'), apRightPreview.getProperty('y'));

                    if (!partData.fixedHDirLpt && !partData.fixedHDirRpt) {
                        // TODO: honor internal path transform here
                        var newTransform = transform.translated(
                            -dPt.getX() + dPt.getX() * partData.cL, -dPt.getY() + dPt.getY() * partData.cL);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                        var newTransform = transform.translated(
                            -dPt.getX() + dPt.getX() * partData.cR, -dPt.getY() + dPt.getY() * partData.cR);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                    } else if (partData.fixedHDirLpt && partData.fixedHDirRpt) {
                        var dx = dPt.getX();
                        var dy = dPt.getY();

                        var prPt = ifMath.getVectorProjection(apL.getX(), apL.getY(),
                            partData.apLhr.getX(), partData.apLhr.getY(), apL.getX() + dx, apL.getY() + dy);

                        var prDPt = prPt.subtract(apL);
                        var newTransform = transform.translated(-dPt.getX() + prDPt.getX() * partData.cL,
                            -dPt.getY() + prDPt.getY() * partData.cL);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                        var prPt = ifMath.getVectorProjection(apR.getX(), apR.getY(),
                            partData.apRhl.getX(), partData.apRhl.getY(), apR.getX() + dx, apR.getY() + dy);

                        var prDPt = prPt.subtract(apR);
                        var newTransform = transform.translated(-dPt.getX() + prDPt.getX() * partData.cR,
                            -dPt.getY() + prDPt.getY() * partData.cR);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                    } else {
                        // For one new handle and one existed:
                        //      Exact policy of FreeHand looks to be buggy and is not defined, lets try this:
                        // 1. Convert second-order Bezier curve into third-order Bezier curve so that zero
                        //      zero movement don't change the curve :
                        //      CP0 = QP0, CP1 = QP0 + 2/3*(QP1 - QP0), CP2 = QP2 - 2/3*(QP1 - QP2), CP3 = QP2
                        // 2. Make the projection of movement into existing handle with the coefficient 1 / (a1 + a2)
                        //       to the pre-existing handle (let's consider CP1)
                        //       for curve CP = (1-t)^3*CP0 + 3*(1-t)^2*t*CP1 + 3*(1-t)*t^2*CP2 + t^3*CP3 =
                        //       = a0*CP0 + a1*CP1 + a2*CP2 + a3*CP3
                        //       CP1' = CP1 + 1/(a1+a2)*pr_CP1(dx, dy)
                        // 3. Then the second handle should go into:
                        //       CP2' = CP2 +
                        //  + (1/a2 * dx - a1/(a2*(a1 + a2)) * pr_CP1x, 1/a2 * dy - a1/(a2*(a1 + a2)) * pr_CP1y)

                        // Setting the described way CP1' and CP2' will make what is needed: CP' = CP + (dx, dy)

                        var dx = dPt.getX();
                        var dy = dPt.getY();
                        var tmpC = 1 / (partData.cL + partData.cR);

                        if (partData.fixedHDirLpt && !partData.fixedHDirRpt) {
                            var prPt = ifMath.getVectorProjection(apL.getX(), apL.getY(),
                                partData.apLhr.getX(), partData.apLhr.getY(),
                                apL.getX() + dx, apL.getY() + dy);
                            var prDPt = prPt.subtract(apL);

                            var dh1x = tmpC * prDPt.getX();
                            var dh1y = tmpC * prDPt.getY();
                            var dh2x = dx / partData.cR - partData.cL / partData.cR * dh1x;
                            var dh2y = dy / partData.cR - partData.cL / partData.cR * dh1y;
                        } else { // !partData.fixedHDirLpt && partData.fixedHDirRpt
                            var prPt = ifMath.getVectorProjection(apR.getX(), apR.getY(),
                                partData.apRhl.getX(), partData.apRhl.getY(),
                                apR.getX() + dx, apR.getY() + dy);
                            var prDPt = prPt.subtract(apR);
                            var dh2x = tmpC * prDPt.getX();
                            var dh2y = tmpC * prDPt.getY();
                            var dh1x = dx / partData.cL - partData.cR / partData.cL * dh2x;
                            var dh1y = dy / partData.cL - partData.cR / partData.cL * dh2y;
                        }
                        var newTransform = transform.translated(-dPt.getX() + dh1x, -dPt.getY() + dh1y);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apLeft, 'hrx', 'hry', newTransform, partData.apLhr);

                        var newTransform = transform.translated(-dPt.getX() + dh2x, -dPt.getY() + dh2y);

                        this._transformPreviewPointCoordinates(
                            selectedPartId.apRight, 'hlx', 'hly', newTransform, partData.apRhl);
                    }
                }
            }

            this.requestInvalidation();
        } else {
            IFPathBaseEditor.prototype.transform.call(this, transform, partId, partData);
        }
    };

    /** @override */
    IFPathEditor.prototype.resetTransform = function () {
        this.releasePathPreview();
        IFPathBaseEditor.prototype.resetTransform.call(this);
    };

    /** @override */
    IFPathEditor.prototype.canApplyTransform = function () {
        return this._partSelection && this._partSelection.length > 0 ||
            this._transform && !this._transform.isIdentity();
    };

    /** @override */
    IFPathEditor.prototype.applyTransform = function (element) {
        if (this._partSelection && this._partSelection.length > 0) {
            this._element._beginBlockEvents([IFElement.GeometryChangeEvent]);
            var newSelection = [];
            // Iterate selection and apply changes in preview anchor points
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                if (part.type === IFPathEditor.PartType.Point) {
                    if (i == this._partSelection.length - 1) {
                        this._element._endBlockEvents([IFElement.GeometryChangeEvent]);
                    }
                    this._transferPreviewProperties(part.point, element);
                    newSelection.push(part);
                } else if (part.type === IFPathEditor.PartType.Segment) {
                    this._transferPreviewProperties(part.apLeft, element);
                    if (i == this._partSelection.length - 1) {
                        this._element._endBlockEvents([IFElement.GeometryChangeEvent]);
                    }
                    this._transferPreviewProperties(part.apRight, element);
                    // Update now _partSelection to contain segment end points instead of segment itself
                    newSelection.push({type: IFPathEditor.PartType.Point, point: part.apLeft});
                    newSelection.push({type: IFPathEditor.PartType.Point, point: part.apRight});
                }
            }
            this.requestInvalidation();
            this.resetTransform();
            this.updatePartSelection(false, newSelection);
        } else {
            IFPathBaseEditor.prototype.applyTransform.call(this, element);
        }
    };

    /** @override */
    IFPathEditor.prototype.subSelectDragStartAction = function (partInfo) {
        if (partInfo.editor !== this) {
            return null;
        }

        // When Path point is started to be moved with subselect, the options are:
        // 1. If a point has styled corner type:
        // a) User drags and cu is true -> both handles moved to the _same_ value
        // b) User drags and cu is false -> move only the selected corner/shoulder length
        // c) User drags and cu is false but user holds shift -> move both corner / shoulder lengths but NOT to
        // the same value but instead, add delta value to both from original movement so their unit length stays the same.
        // 2. Otherwise:
        // a) if a point was not selected - it gets selected and drag it
        // b) if a point was selected and didn't have right handle - create right handle
        // c) if a point was selected and had the right handle, but not the left handle - create the left handle
        // d) if a point was selected and had both handles - drag the point together with other selected points

        var newPartInfo = partInfo;
        if (!partInfo.isolated && partInfo.id.type == IFPathEditor.PartType.Point) {
            var aPt = partInfo.id.point;
            var idType = IFPathEditor.PartType.Point;
            var aPtType = aPt.getProperty('tp');

            if (IFPathBase.isCornerType(aPtType) &&
                    this._element.getAnchorPoints().getPreviousPoint(aPt) != null &&
                    this._element.getAnchorPoints().getNextPoint(aPt) != null) {

                var cl = aPt.getProperty('cl');
                var cr = aPt.getProperty('cr');

                var pickDist = this._element.getScene().getProperty('pickDist');
                if (cr == null || cr < pickDist * 2) {
                    idType = IFPathEditor.PartType.RightShoulder;
                } else if (cl == null || cl < pickDist * 2) {
                    idType = IFPathEditor.PartType.LeftShoulder;
                }
            }

            if (idType != IFPathEditor.PartType.Point) {
                cl = cl != null ? cl : pickDist;
                cr = cr != null ? cr : pickDist;
                this.requestInvalidation();
                this._createPathPreviewIfNecessary(aPt);
                var previewPoint = this.getPathPointPreview(aPt);
                if (!previewPoint) {   // might be some error
                    newPartInfo = null;
                } else {
                    previewPoint.setProperties(['cl', 'cr'], [cl, cr]);

                    var isolated = true; // all is isolated except points
                    var selectable = false; // only point is selectable
                    newPartInfo = new IFElementEditor.PartInfo(
                        this, {type: idType, point: aPt}, null, isolated, selectable);
                }
            } else {
                var hlx = aPt.getProperty('hlx');
                var hly = aPt.getProperty('hly');
                var hrx = aPt.getProperty('hrx');
                var hry = aPt.getProperty('hry');
                // check option a)
                if (!partInfo.data.apSelected || !aPt.hasFlag(IFNode.Flag.Selected)) {
                    // anchor point should be already selected, but it was not so at the moment of getting the part info

                    if (!aPt.hasFlag(IFNode.Flag.Selected)) { // might be some error, select a point
                        this.selectOnePoint(aPt);
                    }
                    newPartInfo = new IFElementEditor.PartInfo(
                        this, {type: IFPathEditor.PartType.Point, point: aPt}, {apSelected: true}, isolated, selectable);
                } else if (hlx === null || hly === null || hrx === null || hry === null) { // option b) or c)
                    this.requestInvalidation();
                    this._createPathPreviewIfNecessary(aPt);
                    var previewPoint = this.getPathPointPreview(aPt);
                    if (!previewPoint) {   // might be some error
                        newPartInfo = null;
                    } else {
                        var partType = null;
                        var isolated = true; // all is isolated except points
                        var selectable = false; // only point is selectable

                        if (hrx === null || hry === null) {
                            // option b)
                            partType = IFPathEditor.PartType.RightHandle;
                            previewPoint.setProperties(
                                ['ah', 'hrx', 'hry'], [false, aPt.getProperty('x'), aPt.getProperty('y')]);
                        } else { // hlx === null || hly === null
                            // option c)
                            partType = IFPathEditor.PartType.LeftHandle;
                            previewPoint.setProperties(
                                ['ah', 'hlx', 'hly'], [false, aPt.getProperty('x'), aPt.getProperty('y')]);
                        }

                        newPartInfo = new IFElementEditor.PartInfo(
                            this, {type: partType, point: aPt}, {apSelected: true}, isolated, selectable);

                        this.updatePartSelection(true, [newPartInfo.id]);
                    }
                } // else option d) - NOOP
            }
        } else if (partInfo.id.type == IFPathEditor.PartType.Segment) {
            var pathHitResult = partInfo.data.hitRes;
            var apLeft = partInfo.id.apLeft;
            var apRight = partInfo.id.apRight;
            if (apLeft && apRight) {
                this.requestInvalidation();
                this._createPathPreviewIfNecessary();
                var apLeftPreview = this.getPathPointPreview(apLeft);
                var apRightPreview = this.getPathPointPreview(apRight);
                if (!apLeftPreview || !apRightPreview) {   // might be some error
                    newPartInfo = null;
                } else {
                    var apLeftX = apLeft.getProperty('x');
                    var apLeftY = apLeft.getProperty('y');
                    var apRightX = apRight.getProperty('x');
                    var apRightY = apRight.getProperty('y');

                    if ((apLeft.getProperty('hrx') === null || apLeft.getProperty('hry') === null) &&
                        (apRight.getProperty('hlx') === null || apRight.getProperty('hly') === null)) {

                        // When Path segment is drag with SubSelect Tool:
                        // If handles are newly created:
                        //      both handles should have the overall length 2/3 from segment length
                        //      a mouse point should divide the distance between handle points in the same proportion as between segment ends
                        //      after movement starts handle end points move synchronously
                        //      after movement starts mouse position defines a point through which should go curve tangent line,
                        // which oriented the same as original segment
                        // To get newly created handles:
                        //      for catch point between handles y position: hdy = dy (mouse) * 4 / 3
                        //      for catch point between handles x position: hdx = dx * 4 / 3

                        var handlesDx = (apRightX - apLeftX) / 3;
                        var handlesDy = (apRightY - apLeftY) / 3;
                        var leftHDx = handlesDx * pathHitResult.slope;
                        var rightHDx = handlesDx - leftHDx;
                        var leftHDy = handlesDy * pathHitResult.slope;
                        var rightHDy = handlesDy - leftHDy;
                        var hrx = pathHitResult.x - leftHDx;
                        var hry = pathHitResult.y - leftHDy;

                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'],
                            [false, pathHitResult.x - leftHDx, pathHitResult.y - leftHDy]);

                        var hlx = pathHitResult.x + rightHDx;
                        var hly = pathHitResult.y + rightHDy;
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'],
                            [false, pathHitResult.x + rightHDx, pathHitResult.y + rightHDy]);
                        this.requestInvalidation();

                        newPartInfo = new IFElementEditor.PartInfo(
                            this, {type: IFPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: IFPathEditor.SegmentData.Handles,
                                cL: 4 / 3, apLhr: new IFPoint(hrx, hry), fixedHDirLpt: false,
                                cR: 4 / 3, apRhl: new IFPoint(hlx, hly), fixedHDirRpt: false},
                            null, false, true);

                    } else if (apLeft.getProperty('hrx') === null || apLeft.getProperty('hry') === null) {
                        // For one new handle and one existed:
                        //      Exact policy of FreeHand looks to be buggy and is not defined, lets try this:
                        // 1. Convert second-order Bezier curve into third-order Bezier curve so that zero
                        //      zero movement don't change the curve :
                        //      CP0 = QP0, CP1 = QP0 + 2/3*(QP1 - QP0), CP2 = QP2 + 2/3*(QP1 - QP2), CP3 = QP2
                        // 2. Make the projection of movement into existing handle with the coefficient 1 / (a1 + a2)
                        //       to the pre-existing handle (let's consider CP1)
                        //       for curve CP = (1-t)^3*CP0 + 3*(1-t)^2*t*CP1 + 3*(1-t)*t^2*CP2 + t^3*CP3 =
                        //       = a0*CP0 + a1*CP1 + a2*CP2 + a3*CP3
                        //       CP1' = CP1 + 1/(a1+a2)*pr_CP1(dx, dy)
                        // 3. Then the second handle should go into:
                        //       CP2' = CP2 + (1/a2 * dx - a1/(a2*(a1 + a2)) * pr_CP1x, 1/a2 * dy - a1/(a2*(a1 + a2)) * pr_CP1y)
                        // Setting the described way CP1' and CP2' will make what is needed: CP' = CP + (dx, dy)

                        var hlx = apRightPreview.getProperty('hlx');
                        var hly = apRightPreview.getProperty('hly');
                        var hrx = apLeftX + 2 / 3 * (hlx - apLeftX);
                        var hry = apLeftY + 2 / 3 * (hly - apLeftY);
                        hlx = apRightX + 2 / 3 * (hlx - apRightX);
                        hly = apRightY + 2 / 3 * (hly - apRightY);
                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'], [false, hrx, hry]);
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'], [false, hlx, hly]);
                        this.requestInvalidation();

                        newPartInfo = new IFElementEditor.PartInfo(
                            this, {type: IFPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: IFPathEditor.SegmentData.Handles,
                                cL: 3 * (1 - pathHitResult.slope) * (1 - pathHitResult.slope) * pathHitResult.slope,
                                apLhr: new IFPoint(hrx, hry), fixedHDirLpt: false,
                                cR: 3 * pathHitResult.slope * pathHitResult.slope * (1 - pathHitResult.slope),
                                apRhl: new IFPoint(hlx, hly), fixedHDirRpt: true},
                            false, true);
                    } else if (apRight.getProperty('hlx') === null || apRight.getProperty('hly') === null) {
                        var hrx = apLeftPreview.getProperty('hrx');
                        var hry = apLeftPreview.getProperty('hry');
                        var hlx = apRightX + 2 / 3 * (hrx - apRightX);
                        var hly = apRightY + 2 / 3 * (hry - apRightY);
                        hrx = apLeftX + 2 / 3 * (hrx - apLeftX);
                        hry = apLeftY + 2 / 3 * (hry - apLeftY);
                        apLeftPreview.setProperties(['ah', 'hrx', 'hry'], [false, hrx, hry]);
                        apRightPreview.setProperties(['ah', 'hlx', 'hly'], [false, hlx, hly]);
                        this.requestInvalidation();

                        newPartInfo = new IFElementEditor.PartInfo(
                            this, {type: IFPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: IFPathEditor.SegmentData.Handles,
                                cL: 3 * (1 - pathHitResult.slope) * (1 - pathHitResult.slope) * pathHitResult.slope,
                                apLhr: new IFPoint(hrx, hry), fixedHDirLpt: true,
                                cR: 3 * pathHitResult.slope * pathHitResult.slope * (1 - pathHitResult.slope),
                                apRhl: new IFPoint(hlx, hly), fixedHDirRpt: false},
                            false, true);
                    } else { // both handles exist
                        // If both handles existed before, their orientation remains
                        apLeftPreview.setProperty('ah', false);
                        apRightPreview.setProperty('ah', false);
                        this.requestInvalidation();
                        var hrx = apLeftPreview.getProperty('hrx');
                        var hry = apLeftPreview.getProperty('hry');
                        var hlx = apRightPreview.getProperty('hlx');
                        var hly = apRightPreview.getProperty('hly');

                        newPartInfo = new IFElementEditor.PartInfo(
                            this, {type: IFPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                            {type: IFPathEditor.SegmentData.Handles,
                                cL: 3 * (1 - pathHitResult.slope),
                                apLhr: new IFPoint(hrx, hry), fixedHDirLpt: true,
                                cR: 3 * pathHitResult.slope,
                                apRhl: new IFPoint(hlx, hly), fixedHDirRpt: true},
                            false, true);
                    }
                }
            } else {
                newPartInfo = null;
            }
        }

        return newPartInfo;
    };

    /** @override */
    IFPathEditor.prototype._attach = function () {
        var scene = this._element.getScene();
        if (scene != null) {
            scene.addEventListener(IFElement.GeometryChangeEvent, this._geometryChange, this);
        }
    };

    /** @override */
    IFPathEditor.prototype._detach = function () {
        // Ensure to de-select all selected anchor points when detaching
        for (var anchorPoint = this._element.getAnchorPoints().getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            anchorPoint.removeFlag(IFNode.Flag.Selected);
        }

        var scene = this._element.getScene();
        if (scene != null) {
            scene.removeEventListener(IFElement.GeometryChangeEvent, this._geometryChange);
        }

        IFPathBaseEditor.prototype._detach.call(this);
    };

    /**
     * Hit-test anchor point's annotation
     * @param {IFPathBase.AnchorPoint} anchorPt - anchor point to hit-test
     * @param {IFPoint} location
     * @param {IFTransform} [transform] a transformation to apply to anchor point's coordinates before hit-testing,
     * defaults to null
     * @param {Number} [tolerance] optional tolerance for hit testing, defaults to zero
     * @returns {boolean} the result of hit-test
     */
    IFPathEditor.prototype.hitAnchorPoint = function (anchorPt, location, transform, tolerance) {
        if (anchorPt) {
            var transformToApply = this._element.getTransform();
            if (transform) {
                transformToApply = transformToApply ? transformToApply.multiplied(transform) : transform;
            }

            return this._getAnnotationBBox(
                    transformToApply, new IFPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y')), true)
                .expanded(tolerance, tolerance, tolerance, tolerance)
                .containsPoint(location);
        }
        return false;
    };

    /**
     * Calculates and returns IFPoint in scene coordinates, corresponding to the given anchor point
     * @param {IFPathBase.AnchorPoint} anchorPt - the given anchor point
     * @returns {IFPoint}
     */
    IFPathEditor.prototype.getPointCoord = function (anchorPt) {
        var pt = null;

        if (anchorPt.getPath() == this._element || this._elementPreview && anchorPt.getPath() == this._elementPreview) {
            var element = this._element;
            if (this._elementPreview && anchorPt.getPath() == this._elementPreview) {
                element = this._elementPreview;
            }
            var xPos = anchorPt.getProperty('x');
            var yPos = anchorPt.getProperty('y');
            pt = new IFPoint(xPos, yPos);
            var transform = element.getTransform();
            if (transform) {
                pt = transform.mapPoint(pt);
            }
        }

        return pt;
    };

    /** @override */
    IFPathEditor.prototype._getPartInfoAt = function (location, transform, tolerance) {
        if (this._showAnnotations()) {
            var _isInAnnotationBBox = function (position, smallAnnotation) {
                if (position) {
                    return this._getAnnotationBBox(transform, position, smallAnnotation)
                        .expanded(tolerance, tolerance, tolerance, tolerance).containsPoint(location);
                } else {
                    return false;
                }
            }.bind(this);

            var result = null;

            this._iteratePoints(false, function (args) {
                var partType = null;
                var isolated = true; // all is isolated except points
                var selectable = false; // only point is selectable

                if (_isInAnnotationBBox(args.rightHandlePosition, true)) {
                    partType = IFPathEditor.PartType.RightHandle;
                } else if (_isInAnnotationBBox(args.leftHandlePosition, true)) {
                    partType = IFPathEditor.PartType.LeftHandle;
                } else if (_isInAnnotationBBox(args.rightShoulderPosition, true)) {
                    partType = IFPathEditor.PartType.RightShoulder;
                } else if (_isInAnnotationBBox(args.leftShoulderPosition, true)) {
                    partType = IFPathEditor.PartType.LeftShoulder;
                } else if (_isInAnnotationBBox(args.position, true)) {
                    partType = IFPathEditor.PartType.Point;
                    isolated = false;
                    selectable = true;
                }

                if (partType) {
                    result = new IFElementEditor.PartInfo(
                        this, {type: partType, point: args.anchorPoint},
                        {apSelected: args.anchorPoint.hasFlag(IFNode.Flag.Selected)}, isolated, selectable);
                    return true;
                }
            }.bind(this));

            if (result) {
                return result;
            } else if (this.hasFlag(IFElementEditor.Flag.Detail)) {
                // In detail mode we're able to select segments so hit test for one here
                var pathHitResult = this._element.pathHitTest(location, transform, false, this._element.getScene().getProperty('pickDist'));
                if (pathHitResult) {
                    var hitRes = pathHitResult.data;
                    var apLeft = this._element.getAnchorPoints().getChildByIndex(hitRes.segment - 1);
                    var apRight = apLeft ? this._element.getAnchorPoints().getNextPoint(apLeft) : null;
                    return new IFElementEditor.PartInfo(
                        this, {type: IFPathEditor.PartType.Segment, point: null, apLeft: apLeft, apRight: apRight},
                        {type: IFPathEditor.SegmentData.HitRes, hitRes: pathHitResult.data}, false, true);
                }
                return null;
            }
        }

        return null;
    };

    /** @override */
    IFPathEditor.prototype._postPaint = function (transform, context) {
        IFPathBaseEditor.prototype._postPaint.call(this, transform, context);
        if (this._showAnnotations()) {
            this._iteratePoints(true, function (args) {
                // Paint handle(s)
                if (args.leftHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.leftHandlePosition);
                }
                if (args.rightHandlePosition) {
                    this._paintHandle(transform, context, args.position, args.rightHandlePosition);
                }

                // Paint shoulders
                if (args.leftShoulderPosition) {
                    this._paintAnnotation(context, transform, args.leftShoulderPosition, IFElementEditor.Annotation.Diamond, false, true);
                }
                if (args.rightShoulderPosition) {
                    this._paintAnnotation(context, transform, args.rightShoulderPosition, IFElementEditor.Annotation.Diamond, false, true);
                }

                // Paint point annotation
                this._paintAnnotation(context, transform, args.position, args.annotation, args.anchorPoint.hasFlag(IFNode.Flag.Selected), true);
            }.bind(this));
        }
    };

    /** @override */
    IFPathEditor.prototype._partIdAreEqual = function (a, b) {
        var eqs = (a.type === b.type);
        if (eqs && a.type == IFPathEditor.PartType.Point) {
            eqs = (a.point === b.point);
        } else if (eqs && a.type == IFPathEditor.PartType.Segment) {
            eqs = (a.apLeft === b.apLeft && a.apRight == b.apRight);
        }
        return eqs;
    };

    /** @override */
    IFPathEditor.prototype._updatePartSelection = function (selection) {
        this.requestInvalidation();

        var newSelection = this._filterSelection(selection);

        // Iterate existing selection if any and deselect all anchor points
        // that are no longer in the new selection
        if (this._partSelection) {
            for (var i = 0; i < this._partSelection.length; ++i) {
                var part = this._partSelection[i];
                var isInNewSelection = false;

                if (newSelection) {
                    for (var k = 0; k < newSelection.length; ++k) {
                        if (newSelection[k].point === part.point && part.point ||
                            part.type == IFPathEditor.PartType.Segment && part.type == newSelection[k].type &&
                                part.apLeft == newSelection[k].apLeft && part.apRight == newSelection[k].apRight) {
                            isInNewSelection = true;
                            break;
                        }
                    }
                }

                if (!isInNewSelection) {
                    if (part.point) {
                        part.point.removeFlag(IFNode.Flag.Selected);
                    } else if (part.type == IFPathEditor.PartType.Segment) {
                        part.apLeft.removeFlag(IFNode.Flag.Selected);
                        part.apRight.removeFlag(IFNode.Flag.Selected);
                    }
                }
            }
        }

        // Iterate new selection if any and select all anchor points
        if (newSelection) {
            for (var i = 0; i < newSelection.length; ++i) {
                var part = newSelection[i];
                if (part.point) {
                    part.point.setFlag(IFNode.Flag.Selected);
                } else if (part.type == IFPathEditor.PartType.Segment) {
                    part.apLeft.setFlag(IFNode.Flag.Selected);
                    part.apRight.setFlag(IFNode.Flag.Selected);
                }
            }
        }

        this._partSelection = newSelection;
        this.requestInvalidation();
    };

    /**
     * Paint a handle
     * @param {IFTransform} transform
     * @param {IFPaintContext} context
     * @param {IFPoint} from
     * @param {IFPoint} to
     * @private
     */
    IFPathEditor.prototype._paintHandle = function (transform, context, from, to) {
        var lineFrom = from;
        var lineTo = to;
        if (transform) {
            lineFrom = transform.mapPoint(from);
            lineTo = transform.mapPoint(to);
        }
        context.canvas.strokeLine(lineFrom.getX(), lineFrom.getY(), lineTo.getX(), lineTo.getY(), 1, context.selectionOutlineColor);
        this._paintAnnotation(context, transform, to, IFElementEditor.Annotation.Circle, false, true);
    };

    /**
     * Iterate all point annotations
     * @param {Boolean} paintElement whether to take the paint element for iteration
     * or not (which will then take the source element}
     * @param {Function(args: {{type: IFPathBase.AnchorPoint.Type|IFPathBase.CornerType, anchorPoint: IFPathBase.AnchorPoint,
     * position: IFPoint, annotation: IFElementEditor.Annotation, leftHandlePosition: IFPoint, rightHandlePosition: IFPoint,
     * leftShoulderPosition: IFPoint, rightShoulderPosition: IFPoint)}})} iterator may return true for stopping iteration
     * @private
     */
    IFPathEditor.prototype._iteratePoints = function (paintElement, iterator) {
        var element = paintElement ? this.getPaintElement() : this._element;
        var anchorPoints = element.getAnchorPoints();
        var transform = element.getTransform();

        for (var anchorPoint = anchorPoints.getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            var previousPt = anchorPoints.getPreviousPoint(anchorPoint);
            var nextPt = anchorPoints.getNextPoint(anchorPoint);
            var type = anchorPoint.getProperty('tp');
            var position = new IFPoint(anchorPoint.getProperty('x'), anchorPoint.getProperty('y'));

            var itArgs = {
                type: type,
                anchorPoint: anchorPoint,
                position: position,
                annotation: IFElementEditor.Annotation.Rectangle,
                leftHandlePosition: null,
                rightHandlePosition: null,
                leftShoulderPosition: null,
                rightShoulderPosition: null
            };

            if (anchorPoint.hasFlag(IFNode.Flag.Selected)) {
                if (type === IFPathBase.AnchorPoint.Type.Connector) {
                    itArgs.annotation = IFElementEditor.Annotation.Diamond;
                } else if (type === IFPathBase.AnchorPoint.Type.Symmetric || type === IFPathBase.AnchorPoint.Type.Mirror) {
                    itArgs.annotation = IFElementEditor.Annotation.Circle;
                }
            }

            if (anchorPoint.hasFlag(IFNode.Flag.Selected) || (previousPt && previousPt.hasFlag(IFNode.Flag.Selected))) {
                var pt = new IFPoint(anchorPoint.getProperty('hlx'), anchorPoint.getProperty('hly'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.leftHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(IFNode.Flag.Selected) || (nextPt && nextPt.hasFlag(IFNode.Flag.Selected))) {
                var pt = new IFPoint(anchorPoint.getProperty('hrx'), anchorPoint.getProperty('hry'));
                if (pt.getX() !== null && pt.getY() !== null) {
                    itArgs.rightHandlePosition = pt;
                }
            }

            if (anchorPoint.hasFlag(IFNode.Flag.Selected) &&
                type !== IFPathBase.AnchorPoint.Type.Asymmetric &&
                type !== IFPathBase.AnchorPoint.Type.Symmetric &&
                type !== IFPathBase.AnchorPoint.Type.Mirror &&
                type !== IFPathBase.AnchorPoint.Type.Connector) {

                var cl = anchorPoint.getProperty('cl');
                if (cl && previousPt) {
                    var pt = anchorPoint.getLeftShoulderPoint(true);
                    if (pt && pt.getX() !== null && pt.getY() !== null) {
                        itArgs.leftShoulderPosition = pt;
                    }
                }

                var cr = anchorPoint.getProperty('cr');
                if (cr && nextPt) {
                    var pt = anchorPoint.getRightShoulderPoint(true);
                    if (pt && pt.getX() !== null && pt.getY() !== null) {
                        itArgs.rightShoulderPosition = pt;
                    }
                }
            }

            if (transform) {
                var newPosition = transform.mapPoint(itArgs.position);

                if (itArgs.leftHandlePosition) {
                    itArgs.leftHandlePosition = transform.mapPoint(itArgs.leftHandlePosition);
                }

                if (itArgs.rightHandlePosition) {
                    itArgs.rightHandlePosition = transform.mapPoint(itArgs.rightHandlePosition);
                }

                // TODO: discuss
                // We do not apply this transform to shoulders when generating vertices, so should not apply here
                // directly, instead we should re-generate shoulders for modified anchor points,
                // as when generating vertices.
                // As the applied transform is an element's internal transform, which is the same for all points,
                // let's use the following workaround here
                if (itArgs.leftShoulderPosition) {
                    itArgs.leftShoulderPosition =
                        //transform.mapPoint(itArgs.leftShoulderPosition); // incorrect!
                        //itArgs.leftShoulderPosition.subtract(itArgs.position).add(newPosition); // also incorrect!
                        anchorPoint.getLeftShoulderPointTransformed(transform, true);
                }

                if (itArgs.rightShoulderPosition) {
                    itArgs.rightShoulderPosition =
                        //transform.mapPoint(itArgs.rightShoulderPosition);
                        //itArgs.rightShoulderPosition.subtract(itArgs.position).add(newPosition);
                        anchorPoint.getRightShoulderPointTransformed(transform, true);
                }

                itArgs.position = newPosition;
            }

            if (iterator(itArgs) === true) {
                break;
            }
        }
    };

    /**
     * Returns path preview
     * @param {Boolean} full - indicates if full path preview is needed
     * @param {IFPathBase.AnchorPoint} selectedAnchorPoint - the point for which preview is needed; may be null
     * @returns {IFPath}
     */
    IFPathEditor.prototype.getPathPreview = function (full, selectedAnchorPoint) {
        this.requestInvalidation();
        if (full) {
            this.extendPreviewToFull();
        } else {
            this._createPathPreviewIfNecessary(selectedAnchorPoint);
        }
        this.requestInvalidation();
        return this._elementPreview;
    };

    /**
     * Returns path reference
     * @returns {IFPath}
     */
    IFPathEditor.prototype.getPath = function () {
        return this._element;
    };

    /**
     * Indicates how many points and which are selected
     * @enum
     */
    IFPathEditor.PointsSelectionType = {
        No: 'N',
        First: 'F',
        Last: 'L',
        Middle: 'M',
        Several: 'S'
    };

    /**
     * Checks how many points and which are selected
     * @returns {IFPathEditor.PointsSelectionType}
     */
    IFPathEditor.prototype.getPointsSelectionType = function () {
        var selType = IFPathEditor.PointsSelectionType.No;
        if (this._partSelection) {
            if (this._partSelection.length > 1) {
                selType = IFPathEditor.PointsSelectionType.Several;
            } else if (this._partSelection[0].point.hasFlag(IFNode.Flag.Selected)) {
                var pt = this._partSelection[0].point;
                if (pt === this._element.getAnchorPoints().getLastChild()) {
                    selType = IFPathEditor.PointsSelectionType.Last;
                } else if (pt === this._element.getAnchorPoints().getFirstChild()) {
                    selType = IFPathEditor.PointsSelectionType.First;
                } else {
                    selType = IFPathEditor.PointsSelectionType.Middle;
                }
            }
        }

        return selType;
    };

    /**
     * Updates _partSelection with one selected point
     * @param {IFPathBase.AnchorPoint} anchorPt - a point to select
     */
    IFPathEditor.prototype.selectOnePoint = function (anchorPt) {
        this.updatePartSelection(false, [
            {type: IFPathEditor.PartType.Point, point: anchorPt}
        ]);
    };

    /** override */
    IFPathEditor.prototype.isPartSelectionUnderCollisionAllowed = function () {
        return true;
    };

    /** override */
    IFPathEditor.prototype.updatePartSelectionUnderCollision = function (toggle, collisionArea) {
        var anchorPoints = this._element.getAnchorPoints();
        var transform = this._element.getTransform();
        var partsToUpdate = [];
        for (var anchorPoint = anchorPoints.getFirstChild(); anchorPoint != null; anchorPoint = anchorPoint.getNext()) {
            var position = new IFPoint(anchorPoint.getProperty('x'), anchorPoint.getProperty('y'));
            position = transform ? transform.mapPoint(position) : position;
            if (ifVertexInfo.hitTest(position.getX(), position.getY(), collisionArea, 0, true)) {
                partsToUpdate.push({type: IFPathEditor.PartType.Point, point: anchorPoint});
            }
        }
        if (partsToUpdate && !this._element.hasFlag(IFNode.Flag.Selected)) {
            this._element.setFlag(IFNode.Flag.Selected);
        }
        this.updatePartSelection(toggle, partsToUpdate);

        return (this._partSelection && this._partSelection.length);
    };

    /** override */
    IFPathEditor.prototype.isDeletePartsAllowed = function () {
        var res = false;
        if (this._partSelection && this._partSelection.length) {
            var numPtsSelected = 0;
            for (var i = 0; i < this._partSelection.length; ++i) {
                if (this._partSelection[i].type == IFPathEditor.PartType.Point) {
                    ++numPtsSelected;
                }
            }
            var numPts = 0;
            for (var anchorPt = this._element.getAnchorPoints().getFirstChild();
                    anchorPt != null; anchorPt = anchorPt.getNext(), ++numPts) { }

            if (numPts > numPtsSelected) {
                res = true;
            }
        }
        return res;
    };

    /** override */
    IFPathEditor.prototype.deletePartsSelected = function () {
        if (this._partSelection) {
            var anchorPts = this._element.getAnchorPoints();
            for (var i = 0; i < this._partSelection.length; ++i) {
                if (this._partSelection[i].type == IFPathEditor.PartType.Point) {
                    anchorPts.removeChild(this._partSelection[i].point);
                }
            }
            this._partSelection = null;
        }
    };

    /** override */
    IFPathEditor.prototype.isAlignPartsAllowed = function () {
        var res = false;
        if (this._partSelection && this._partSelection.length) {
            for (var i = 0; i < this._partSelection.length && !res; ++i) {
                if (this._partSelection[i].type == IFPathEditor.PartType.Point) {
                    res = true;
                }
            }
        }
        return res;
    };

    /** override */
    IFPathEditor.prototype.alignParts = function (alignType, posX, posY) {
        if (this._partSelection && this._partSelection.length) {
            var pathTransform = this._element.getTransform();
            this._element._beginBlockEvents([IFElement.GeometryChangeEvent]);
            for (var i = 0; i < this._partSelection.length; ++i) {
                if (i == this._partSelection.length - 1) {
                    this._element._endBlockEvents([IFElement.GeometryChangeEvent]);
                }
                if (this._partSelection[i].type === IFPathEditor.PartType.Point) {
                    var anchorPt = this._partSelection[i].point;
                    var sourcePos = new IFPoint(anchorPt.getProperty('x'), anchorPt.getProperty('y'));
                    if (pathTransform) {
                        sourcePos = pathTransform.mapPoint(sourcePos);
                    }
                    var newPos =
                        new IFPoint(posX !== null ? posX : sourcePos.getX(), posY !== null ? posY : sourcePos.getY());

                    this.movePoint(anchorPt, newPos);
                }
            }
        }
    };

    /**
     * Changes indices of preview points to some value. Useful when new points are added into preview,
     * when these points are not in main path yet
     * @param {Number} shiftVal - preview indices shift value
     * @param {Number} shiftFrom - update indices starting from shiftFrom source path index. May be null, then 0 is used
     * @param {Number} shiftTo - update indices up to shiftTo source path index. May be null,
     * then indices will be updated up to table end
     */
    IFPathEditor.prototype.shiftPreviewTable = function (shiftVal, shiftFrom, shiftTo) {
        shiftFrom = shiftFrom != null ? shiftFrom : 0;
        shiftTo = shiftTo != null ? shiftTo : this._sourceIndexToPreviewIndex.length - 1;
        for (var i = shiftFrom; i < shiftTo; ++i) {
            this._sourceIndexToPreviewIndex[i] += shiftVal;
        }
    };

    /**
     * Used to extend preview to full path, when partial preview is getting not enough in some cases
     */
    IFPathEditor.prototype.extendPreviewToFull = function () {
        this._createPathPreviewIfNecessary();
        var sourceAnchorPoints = this._element.getAnchorPoints();
        var previewAnchorPoints = this._elementPreview.getAnchorPoints();
        var firstPreviewPtOrig = previewAnchorPoints.getFirstChild();
        var ap = sourceAnchorPoints.getFirstChild();
        var idx = 0;
        var hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
        var previewIdx = hasPreview ? this._sourceIndexToPreviewIndex[idx] : 0;


        previewAnchorPoints._beginBlockChanges([
            IFNode._Change.BeforeChildInsert,
            IFNode._Change.AfterChildInsert
        ]);

        try {
            while (!hasPreview && ap) {
                var previewAnchorPoint = new IFPathBase.AnchorPoint();
                previewAnchorPoint.transferProperties(ap, [IFPathBase.AnchorPoint.GeometryProperties]);
                if (ap.hasFlag(IFNode.Flag.Selected)) {
                    previewAnchorPoint.setFlag(IFNode.Flag.Selected);
                }

                previewAnchorPoints.insertChild(previewAnchorPoint, firstPreviewPtOrig);
                this._sourceIndexToPreviewIndex[idx] = previewIdx;
                ap = ap.getNext();
                ++idx;
                ++previewIdx;
                hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
            }

            var num = idx - 0;
            while (hasPreview && ap) {
                this._sourceIndexToPreviewIndex[idx] += num;
                previewIdx = this._sourceIndexToPreviewIndex[idx];
                ap = ap.getNext();
                ++idx;
                hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
            }
            ++previewIdx;

            while (!hasPreview && ap) {
                var previewAnchorPoint = new IFPathBase.AnchorPoint();
                previewAnchorPoint.transferProperties(ap, [IFPathBase.AnchorPoint.GeometryProperties]);
                if (ap.hasFlag(IFNode.Flag.Selected)) {
                    previewAnchorPoint.setFlag(IFNode.Flag.Selected);
                }

                previewAnchorPoints.appendChild(previewAnchorPoint);
                this._sourceIndexToPreviewIndex[idx] = previewIdx;
                ap = ap.getNext();
                ++idx;
                ++previewIdx;
                hasPreview = (this._sourceIndexToPreviewIndex[idx] != null);
            }
        } finally {
            previewAnchorPoints._endBlockChanges([
                IFNode._Change.BeforeChildInsert,
                IFNode._Change.AfterChildInsert
            ]);
        }

        // There may be one more hasPreview block, but it should not be updated in this case,
        // as this is the beginning of preview
        this._elementPreview.transferProperties(this._element, [IFShape.GeometryProperties, IFPath.GeometryProperties]);
    };

    /**
     * Constrains position against base point with the step aliquot to 45% from scene constraint property
     * @param {IFPoint} position - original position to be constrained in view coordinates
     * @param {IFTransform} worldToViewTransform - current scene transformation
     * @param sourcePoint - a base point
     * @returns {IFPoint} - new constrained position
     */
    IFPathEditor.prototype.constrainPosition = function (position, worldToViewTransform, sourcePoint) {
        var basePt = new IFPoint(sourcePoint.getProperty('x'), sourcePoint.getProperty('y'));
        var transformToApply = this._element.getTransform();
        transformToApply = transformToApply ? transformToApply.multiplied(worldToViewTransform) : worldToViewTransform;

        basePt = transformToApply.mapPoint(basePt);
        var constrPt = ifMath.convertToConstrain(
            basePt.getX(), basePt.getY(), position.getX(), position.getY(),
            this._element.getScene().getProperty('crConstraint'));

        return constrPt;
    };

    /**
     * Create path preview if not yet existent.
     * @param {IFPathBase.AnchorPoint} [selectedAnchorPoint] if provided then this point
     * will be taken as the only selected one, if this is not provided, the selected
     * anchor points will be taken from the source path. Defaults to null if not provided.
     * @return {IFPath} the path preview
     * @private
     */
    IFPathEditor.prototype._createPathPreviewIfNecessary = function (selectedAnchorPoint) {
        if (!this._elementPreview) {
            this._sourceIndexToPreviewIndex = {};

            this._elementPreview = new IFPath();
            this._elementPreview.transferProperties(this._element, [IFShape.GeometryProperties, IFPath.GeometryProperties]);

            var _anchorPointIsSelected = function (anchorPoint) {
                return (selectedAnchorPoint && anchorPoint === selectedAnchorPoint) || (!selectedAnchorPoint && anchorPoint.hasFlag(IFNode.Flag.Selected));
            };

            var sourceAnchorPoints = this._element.getAnchorPoints();
            var previewAnchorPoints = this._elementPreview.getAnchorPoints();

            // Create our anchor points. We'll ensure to only create the piece of the path
            // that includes selected anchor points so for most of the time we'll be working
            // on an optimized path preview that doesn't require whole redrawing of the path
            // TODO: make later on support for multiple pieces of the path as in FreeHand
            var firstSelPoint = null;
            var lastSelPoint = null;
            var prevPt, nextPt;
            var relPt;
            for (var anchorPoint = sourceAnchorPoints.getFirstChild();
                 anchorPoint != null && (!firstSelPoint || !lastSelPoint);
                 anchorPoint = anchorPoint.getNext()) {

                prevPt = sourceAnchorPoints.getPreviousPoint(anchorPoint);
                nextPt = sourceAnchorPoints.getNextPoint(anchorPoint);

                if (!firstSelPoint) {
                    if (!prevPt && _anchorPointIsSelected(anchorPoint)) {
                        firstSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && nextPt && _anchorPointIsSelected(nextPt)) {
                            // relPt may be == anchorPoint or == prevPt depending on properties of these points
                            relPt = sourceAnchorPoints.getFirstRelatedPoint(nextPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                (!sourceAnchorPoints.getPreviousPoint(relPt) || !_anchorPointIsSelected(sourceAnchorPoints.getPreviousPoint(relPt)))) {
                                firstSelPoint = relPt;
                            }
                        }
                    }
                }

                if (!lastSelPoint) {
                    if (!nextPt && _anchorPointIsSelected(anchorPoint)) {
                        lastSelPoint = anchorPoint;
                    } else {
                        if (!_anchorPointIsSelected(anchorPoint) && prevPt && _anchorPointIsSelected(prevPt)) {
                            // relPt may be == anchorPoint or == nextPt depending on properties of these points
                            relPt = sourceAnchorPoints.getLastRelatedPoint(prevPt);
                            if (!_anchorPointIsSelected(relPt) &&
                                (!sourceAnchorPoints.getNextPoint(relPt) || !_anchorPointIsSelected(sourceAnchorPoints.getNextPoint(relPt)))) {

                                lastSelPoint = relPt;
                            }
                        }
                    }
                }
            }

            if (firstSelPoint && !lastSelPoint ||
                !firstSelPoint && lastSelPoint ||
                firstSelPoint && lastSelPoint && firstSelPoint === lastSelPoint) {

                firstSelPoint = null;
                lastSelPoint = null;
            }

            // Ensure no selected points between lastSelPoint and firstSelPoint
            if (firstSelPoint && lastSelPoint) {
                var noSelected = true;
                // we can start from lastSelPoint and continue until path end or firstSelPoint for both
                // open and closed paths, as for open path there will be no selected points before the firstSelPoint
                // due to the way how we calculated firstSelPoint
                for (var anchorPoint = sourceAnchorPoints.getNextPoint(lastSelPoint);
                     anchorPoint && anchorPoint != firstSelPoint && noSelected;
                     anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint)) {
                    if (_anchorPointIsSelected(anchorPoint)) {
                        noSelected = false;
                        firstSelPoint = null;
                        lastSelPoint = null;
                    }
                }
            }

            // If there're no valid selection points then take the whole path instead
            firstSelPoint = firstSelPoint ? firstSelPoint : sourceAnchorPoints.getFirstChild();
            var finished = false;
            var anchorPoint = firstSelPoint;

            previewAnchorPoints._beginBlockChanges([
                IFNode._Change.BeforeChildInsert,
                IFNode._Change.AfterChildInsert
            ]);
            try {
                while (!finished) {
                    var previewAnchorPoint = new IFPathBase.AnchorPoint();
                    previewAnchorPoint.transferProperties(anchorPoint, [IFPathBase.AnchorPoint.GeometryProperties]);
                    if (_anchorPointIsSelected(anchorPoint)) {
                        previewAnchorPoint.setFlag(IFNode.Flag.Selected);
                    }

                    previewAnchorPoints.appendChild(previewAnchorPoint);

                    // Add index mappings
                    var sourceIndex = sourceAnchorPoints.getIndexOfChild(anchorPoint);
                    var previewIndex = previewAnchorPoints.getIndexOfChild(previewAnchorPoint);
                    this._sourceIndexToPreviewIndex[sourceIndex] = previewIndex;

                    if (anchorPoint == lastSelPoint) {
                        finished = true;
                    }
                    anchorPoint = sourceAnchorPoints.getNextPoint(anchorPoint);
                    if (!anchorPoint || anchorPoint == firstSelPoint) {
                        finished = true;
                    }
                }
            } finally {
                previewAnchorPoints._endBlockChanges([
                    IFNode._Change.BeforeChildInsert,
                    IFNode._Change.AfterChildInsert
                ]);
            }

            this._elementPreview.transferProperties(this._element, [IFShape.GeometryProperties, IFPath.GeometryProperties]);
            if (firstSelPoint.getProperty('ah') || lastSelPoint && lastSelPoint.getProperty('ah')) {
                this.extendPreviewToFull();
            } else {
                // Don't make the path closed if we've created a partial preview only
                if (this._elementPreview.getProperty('closed') && lastSelPoint) {
                    this._elementPreview.setProperty('closed', false);
                }
            }
        }
        return this._elementPreview;
    };

    /**
     * Release a path preview if there was any
     * @private
     */
    IFPathEditor.prototype.releasePathPreview = function () {
        this._elementPreview = null;
        this._sourceIndexToPreviewIndex = null;
    };

    /**
     * Returns a mapping of a source point to it's preview point
     * @param {IFPathBase.AnchorPoint} sourcePoint
     */
    IFPathEditor.prototype.getPathPointPreview = function (sourcePoint) {
        var sourceIndex = sourcePoint.getParent().getIndexOfChild(sourcePoint);
        if (!this._sourceIndexToPreviewIndex) {
            this.extendPreviewToFull();
        } else if (this._sourceIndexToPreviewIndex[sourceIndex] == null) {
            this._createPathPreviewIfNecessary(sourcePoint);
        }
        this.requestInvalidation();
        var previewIndex = this._sourceIndexToPreviewIndex[sourceIndex];
        return this._elementPreview.getAnchorPoints().getChildByIndex(previewIndex);
    };

    /**
     * Returns the combined transformation of the path internal transformation with the supplied
     * @param {IFTransform}transform
     * @returns {IFTransform}
     */
    IFPathEditor.prototype.getTransformFromNative = function (transform) {
        var transformToNewPos = this._element.getTransform();
        if (transform) {
            transformToNewPos = transformToNewPos ? transformToNewPos.multiplied(transform) : transform;
        }
        if (!transformToNewPos) {
            transformToNewPos = new IFTransform();
        }
        return transformToNewPos;
    };

    /**
     * Moves single anchor point to a new position. The anchor point should not necessary have source point.
     * This function may be used for both preview or original path points. If the original path has a transform,
     * then it is used without any concern, if preview or original path point is moving.
     * @param {IFPathBase.AnchorPoint} anchorPoint - an anchor point to move to new position
     * @param {IFPoint} newPosition - new point's position
     * @param {IFTransform} transform - transformation to be applied to path points to make their coordinate system
     * the same in which new position is specified (usually worldToViewTransform)
     * @param {IFPathBase.AnchorPoint} origPoint - if present, this anchor point is used as a source point instead of
     * anchor point itself. Useful when dragging an existing point to not lose it's handles accuracy.
     */
    IFPathEditor.prototype.movePoint = function (anchorPoint, newPosition, transform, origPoint) {
        var transformToNewPos = this.getTransformFromNative(transform);
        var transformToNative = transformToNewPos.inverted();

        var newNativePos = transformToNative.mapPoint(newPosition);

        if (anchorPoint.getProperty('ah')) {
            anchorPoint.setProperties(['x', 'y'], [newNativePos.getX(), newNativePos.getY()]);
        } else {
            var srcPt = origPoint ? origPoint : anchorPoint;
            var hlx = srcPt.getProperty('hlx');
            var hly = srcPt.getProperty('hly');
            var hrx = srcPt.getProperty('hrx');
            var hry = srcPt.getProperty('hry');
            if (hlx != null && hly != null || hrx != null && hry != null) {
                var origPos = transformToNewPos.mapPoint(
                    new IFPoint(srcPt.getProperty('x'), srcPt.getProperty('y')));
                var dx = newPosition.getX() - origPos.getX();
                var dy = newPosition.getY() - origPos.getY();

                if (hlx != null && hly != null) {
                    var pt = transformToNative.mapPoint(
                        transformToNewPos.mapPoint(new IFPoint(hlx, hly)).translated(dx, dy));
                    hlx = pt.getX();
                    hly = pt.getY();
                }
                if (hrx != null && hry != null) {
                    var pt = transformToNative.mapPoint(
                        transformToNewPos.mapPoint(new IFPoint(hrx, hry)).translated(dx, dy));
                    hrx = pt.getX();
                    hry = pt.getY();
                }
            }
            anchorPoint.setProperties(['x', 'y', 'hlx', 'hly', 'hrx', 'hry'],
                [newNativePos.getX(), newNativePos.getY(), hlx, hly, hrx, hry]);
        }
    };

    /**
     * Move coordinate properties of a preview point
     * @param {IFPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {IFPoint} position - a destination position in view coordinates
     * @param {IFTransform} viewToWorldTransform - the transformation to apply to destination position
     * @param {Boolean} ratio
     * @private
     */
    IFPathEditor.prototype._movePreviewPointCoordinates = function (sourcePoint, xProperty, yProperty,
                                                                    position, viewToWorldTransform, ratio, guides) {
        var newPos = position;
        if (ratio) {
            var worldToViewTransform = viewToWorldTransform.inverted();
            newPos = this.constrainPosition(position, worldToViewTransform, sourcePoint);
        }
        newPos = viewToWorldTransform.mapPoint(newPos);
        // Don't perform handles mapping for now
        /*
        guides.beginMap();
        newPos = guides.mapPoint(newPos);
        */
        var pathTransform = this._element.getTransform();
        var sourcePosition = new IFPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));

        if (pathTransform) {
            sourcePosition = pathTransform.mapPoint(sourcePosition);
        }

        this._transformPreviewPointCoordinates(sourcePoint, xProperty, yProperty,
            new IFTransform(1, 0, 0, 1, newPos.getX() - sourcePosition.getX(), newPos.getY() - sourcePosition.getY()));

        //guides.finishMap();
    };

    /**
     * Transform coordinate properties of a preview point
     * @param {IFPathBase.AnchorPoint} sourcePoint
     * @param {String} xProperty
     * @param {String} yProperty
     * @param {IFTransform} transform
     * @param {IFPoint} sourcePos if present, used for source position
     * @private
     */
    IFPathEditor.prototype._transformPreviewPointCoordinates = function (sourcePoint, xProperty, yProperty, transform, sourcePos) {
        var pathTransform = this._element.getTransform();

        var previewPoint = this.getPathPointPreview(sourcePoint);
        if (previewPoint) {
            if (sourcePos) {
                var sourcePosition = sourcePos;
            } else {
                // Map source point with transformation and apply it to preview point
                var sourcePosition = new IFPoint(sourcePoint.getProperty(xProperty), sourcePoint.getProperty(yProperty));
            }

            var transformToApply = transform;
            if (pathTransform) {
                transformToApply = transform.multiplied(pathTransform.inverted());
                transformToApply = pathTransform.multiplied(transformToApply);
            }
            var previewPosition = transformToApply.mapPoint(sourcePosition);

            var propertiesToSet = [xProperty, yProperty];
            var valuesToSet = [previewPosition.getX(), previewPosition.getY()];

            // If we're modifying handle coordinates then set auto-handles to false
            if (xProperty === 'hlx' || xProperty === 'hrx' || yProperty === 'hly' || yProperty === 'hry') {
                propertiesToSet.push('ah');
                valuesToSet.push(false);
            }

            // Assign properties now
            previewPoint.setProperties(propertiesToSet, valuesToSet);
        }
    };

    /**
     * Calculates and set the new values of shoulders making the projection of new mouse position to shoulder vector
     * @param {{type: partType, point: args.anchorPoint}} partId
     * @param {IFPoint} position - destination position
     * @param {Boolean} ratio - if true, modify both shoulders the same way
     * @private
     */
    IFPathEditor.prototype._movePreviewPointShoulders = function (partId, position, ratio) {
        var pathTransform = this._element.getTransform();
        var sourcePosition = new IFPoint(partId.point.getProperty('x'), partId.point.getProperty('y'));

        var shoulderLimitPt;
        if (partId.type == IFPathEditor.PartType.LeftShoulder) {
            shoulderLimitPt = partId.point.getLeftShoulderLimitPoint();
        } else { // right shoulder
            shoulderLimitPt = partId.point.getRightShoulderLimitPoint();
        }

        if (pathTransform) {
            sourcePosition = pathTransform.mapPoint(sourcePosition);
            shoulderLimitPt = pathTransform.mapPoint(shoulderLimitPt);
        }

        var newShoulderPt = ifMath.getVectorProjection(sourcePosition.getX(), sourcePosition.getY(),
            shoulderLimitPt.getX(), shoulderLimitPt.getY(), position.getX(), position.getY(), true);

        var newVal = ifMath.ptDist(newShoulderPt.getX(), newShoulderPt.getY(),
            sourcePosition.getX(), sourcePosition.getY());

        var previewPoint = this.getPathPointPreview(partId.point);

        // We do not apply pathTransform to shoulders when generating vertices,
        // assign new value directly to previewPoint without any further transforms
        if (ratio) {
            if (this.hasFlag(IFElementEditor.Flag.Detail) && previewPoint.getProperty('cu') != true) {
                var oldLVal = partId.point.getProperty('cl');
                oldLVal = oldLVal != null ? oldLVal : 0;
                var oldRVal = partId.point.getProperty('cr');
                oldRVal = oldRVal != null ? oldLVal : 0;
                if (partId.type == IFPathEditor.PartType.LeftShoulder) {
                    var delta = newVal - oldLVal;
                    var newRVal = oldRVal - delta;
                    newRVal = newRVal > 0 ? newRVal : 0;
                    previewPoint.setProperties(['cl', 'cr'], [newVal, newRVal]);
                } else { // right shoulder
                    var delta = newVal - oldRVal;
                    var newLVal = oldLVal - delta;
                    newLVal = newLVal > 0 ? newLVal : 0;
                    previewPoint.setProperties(['cl', 'cr'], [newLVal, newVal]);
                }
            } else {
                previewPoint.setProperties(['cl', 'cr'], [newVal, newVal]);
            }
        } else if (partId.type == IFPathEditor.PartType.LeftShoulder) {
            previewPoint.setProperty('cl', newVal);
        } else { // right shoulder
            previewPoint.setProperty('cr', newVal);
        }
    };

    /**
     * Assign a given set of preview point to source point
     * @param {IFPathBase.AnchorPoint} sourcePoint
     * @param {Array<String>} properties
     * @private
     */
    IFPathEditor.prototype._assignPreviewPointPropertiesToSourcePoint = function (sourcePoint, properties) {
        var previewPoint = this.getPathPointPreview(sourcePoint);
        if (previewPoint) {
            // Simply assign preview position back to source
            sourcePoint.setProperties(properties, previewPoint.getProperties(properties));
        }
    };

    /**
     * Assign all geometry properties of preview point to corresponding point of an element
     * @param {IFPathBase.AnchorPoint} point - a point to use for finding preview point
     * @param {IFElement} element the element to which point to apply the transformation,
     * might be different than the one this editor works on. This will be never null.
     * @private
     */
    IFPathEditor.prototype._transferPreviewProperties = function (point, element) {
        // Work with indices as element might not be ourself
        var mySourceIndex = this._element.getAnchorPoints().getIndexOfChild(point);
        var elSourcePoint = element.getAnchorPoints().getChildByIndex(mySourceIndex);
        var previewPoint = this.getPathPointPreview(elSourcePoint);
        if (previewPoint) {
            elSourcePoint.transferProperties(previewPoint, [IFPathBase.AnchorPoint.GeometryProperties]);
        }
    };

    /**
     * Filters selection to not include separatly points, which are already included as some segment end-points
     * @param {Array<*>} selection the part selection to be filtered
     * @returns {Array<*>} the new filtered selection
     * @private
     */
    IFPathEditor.prototype._filterSelection = function (selection) {
        if (!selection) {
            return null;
        }
        var newSelection = [];
        var isInNewSelection;
        for (var i = 0; i < selection.length; ++i) {
            if (selection[i].type != IFPathEditor.PartType.Point) {
                newSelection.push(selection[i]);
            } else {
                isInNewSelection = true;
                for (var k = 0; k < selection.length; ++k) {
                    if (selection[k].type == IFPathEditor.PartType.Segment &&
                        (selection[i].point == selection[k].apLeft || selection[i].point == selection[k].apRight)) {

                        isInNewSelection = false;
                        break;
                    }
                }
                if (isInNewSelection) {
                    newSelection.push(selection[i]);
                }
            }
        }
        return newSelection;
    };

    /**
     * If the path is updated (may be way around of this path editor), handle this by updating preview
     * @param {IFElement.GeometryChangeEvent} evt
     * @private
     */
    IFPathEditor.prototype._geometryChange = function (evt) {
        if (evt.type == IFElement.GeometryChangeEvent.Type.After && evt.element == this._element) {
            if (this._elementPreview) {
                this.releasePathPreview();
                this.requestInvalidation();
            }
        }
    };

    /** @override */
    IFPathEditor.prototype.toString = function () {
        return "[Object IFPathEditor]";
    };

    _.IFPathEditor = IFPathEditor;
})(this);