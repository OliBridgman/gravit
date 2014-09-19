(function () {
    gDevelopment.tests.push({
        title: 'Clone Scene',
        test: function () {
            var sceneCode = IFNode.serialize(gApp.getActiveDocument().getScene());
            var blob = JSON.parse(sceneCode);
            var scene = IFNode.restore(blob);
            gApp.addDocument(scene, 'Cloned Scene');
        }
    });
})();
