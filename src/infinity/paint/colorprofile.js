(function (_) {
    /**
     * A class representing a color profile
     * @class IFColorProfile
     * @constructor
     */
    function IFColorProfile() {
    }

    /**
     * @type {IFColorSpace}
     * @private
     */
    IFColorProfile.prototype._colorSpace = null;

    /**
     * @type {IFColorSpace}
     * @private
     */
    IFColorProfile.prototype._pcsSpace = null;

    /**
     * @type {Array<Number>}
     * @private
     */
    IFColorProfile.prototype._illumination = null;

    /**
     * TODO
     */
    IFColorProfile.convertColor = function (color) {
        // Handle special color types first
        if (color.getType() === IFColor.Type.White) {
            // TODO : Convert white reference point
        } else if (color.getType() === IFColor.Type.Black) {
            // TODO : Convert black reference point
        } else {
            if (color.getSpace() !== this._colorSpace) {
                throw new Error('Color space is different than profile color space.');
            }

            // Convert color into PCS
            var pcs = null;
            switch (this._pcsSpace) {
                case IFColorProfile.Space.RGB:
                    pcs = color.asRGB();
                    pcs[0] = pcs[0] / 255.0;
                    pcs[1] = pcs[1] / 255.0;
                    pcs[2] = pcs[2] / 255.0;
                    break;
                case IFColorProfile.Space.CMYK:
                    pcs = color.asCMYK();
                    pcs[0] = pcs[0] / 100.0;
                    pcs[1] = pcs[1] / 100.0;
                    pcs[2] = pcs[2] / 100.0;
                    pcs[3] = pcs[3] / 100.0;
                    break;
                case IFColorProfile.Space.LAB:
                    pcs = color.asLAB(this._illumination);
                    break;
                case IFColorProfile.Space.XYZ:
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
    IFColorProfile.prototype.toString = function () {
        return "[Object IFColorProfile]";
    };

    _.IFColorProfile = IFColorProfile;
})(this);