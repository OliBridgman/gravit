(function() {
    function test(scene, page, layer, view) {
        // TODO : Create and size on whole page
        var image = new GXImage();
        image.setProperties(['src'], ['/assets/icon/icon_144x144.png']);
        layer.appendChild(image);
    }

    gDevelopment.tests.push({
        title: 'Create Raster Image #1',
        category: 'Shape',
        test: test
    });

})();