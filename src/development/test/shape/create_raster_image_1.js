(function() {
    function test(scene, page, view) {
        // TODO : Create and size on whole page
        var image = new IFImage();
        image.setProperties(['src'], ['/assets/icon/icon_144x144.png']);

        var style = new IFStyle();
        //style.appendChild(new IFStrokeStyle());
        style.appendChild(new IFBlurFilter());
        var shadow = new IFShadowEffect();
        style.appendChild(shadow);

        image.getStyleSet().appendChild(style);



        page.appendChild(image);
    }

    gDevelopment.tests.push({
        title: 'Create Raster Image #1',
        category: 'Shape',
        test: test
    });

})();