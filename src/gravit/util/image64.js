(function (_) {

    /**
     * Converts a given image or url into a base64-encoded png image data url
     * @param {String|Image|HTMLImageelement} imageOrUrl
     * @param {Function} done the callback function called when done with the
     * only parameter being the data url string
     */
    _.image64 = function (imageOrUrl, done) {
        if (typeof imageOrUrl === 'string') {
            var image = new Image();
            image.src = imageOrUrl;
            image.onload = function () {
                image64(image, done);
            }
        } else {
            var canvas = document.createElement("canvas");
            canvas.width = imageOrUrl.naturalWidth;
            canvas.height = imageOrUrl.naturalHeight;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(imageOrUrl, 0, 0);

            done(canvas.toDataURL("image/png"));
        }
    };

}(this));