(function (_) {
    /**
     * A class representing a color profile
     * @class GXColorProfile
     * @constructor
     */
    function GXColorProfile() {
    }

    /**
     * @type {GXColorSpace}
     * @private
     */
    GXColorProfile.prototype._colorSpace = null;

    /**
     * @type {GXColorSpace}
     * @private
     */
    GXColorProfile.prototype._pcsSpace = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    GXColorProfile.prototype._illumination = null;

    /**
     * TODO
     */
    GXColorProfile.convertColor = function (color) {
        // Handle special color types first
        if (color.getType() === GXColor.Type.White) {
            // TODO : Convert white reference point
        } else if (color.getType() === GXColor.Type.Black) {
            // TODO : Convert black reference point
        } else {
            if (color.getSpace() !== this._colorSpace) {
                throw new Error('Color space is different than profile color space.');
            }

            // Convert color into PCS
            var pcs = null;
            switch (this._pcsSpace) {
                case GXColorProfile.Space.RGB:
                    pcs = color.asRGB();
                    pcs[0] = pcs[0] / 255.0;
                    pcs[1] = pcs[1] / 255.0;
                    pcs[2] = pcs[2] / 255.0;
                    break;
                case GXColorProfile.Space.CMYK:
                    pcs = color.asCMYK();
                    pcs[0] = pcs[0] / 100.0;
                    pcs[1] = pcs[1] / 100.0;
                    pcs[2] = pcs[2] / 100.0;
                    pcs[3] = pcs[3] / 100.0;
                    break;
                case GXColorProfile.Space.LAB:
                    pcs = color.asLAB(this._illumination);
                    break;
                case GXColorProfile.Space.XYZ:
                    pcs = color.asXYZ(this._illumination);
                    break;
                default:
                    throw new Error('Unable to convert.');
            }

            // TODO
            // Convert PCS -> COLOR_SPACE
            // RETURN CONVERTED COLOR
        }
    };

    /** @override */
    GXColorProfile.prototype.toString = function () {
        return "[Object GXColorProfile]";
    };

    _.GXColorProfile = GXColorProfile;
})(this);