(function () {

    var stage;

    function load() {

        var manifest = [{
            id: "tiles",
            src: "assets/tiles.png"
        }, {
            id: "logo",
            src: "assets/logo.png"
        }, {
            id: "background",
            src: "assets/bg_prerendered.png"
        }].concat(getAudioFiles());

        stage = new createjs.Stage('stage');
        var loadingIndicator = new createjs.Text("Loading 0%", "30px Arial", '#000');

        stage.addChild(loadingIndicator);

        loadingIndicator.x = stage.canvas.width/2 - loadingIndicator.getMeasuredWidth()/2;
        loadingIndicator.y = stage.canvas.height/2 - loadingIndicator.getMeasuredHeight()/2;

        createjs.Ticker.addListener(tick);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(60);

        var preloader = new createjs.PreloadJS();

        preloader.onProgress = handleProgress;

        preloader.onComplete = handleComplete;

        preloader.loadManifest(manifest);

        // Avoids boring typing 
        function getAudioFiles() {
            var filesNames = ['brickDeath', 'countDownBlip', 'powerdown', 'powerup', 'recover'];
            var extensions = ['.mp3', '.ogg', '.wav'];
            var result = [];

            filesNames.forEach(function (file) {
                extensions.forEach(function (extension) {
                    result.push({
                        id: file + extension,
                        src: 'assets/sfx/' + file + extension
                    });
                });
            });

            return result;
        };

        function handleProgress(event) {
            loadingIndicator.text = "Loading " + Math.floor(event.loaded * 100) + "%";
        }

        function handleComplete(event) {
        }

    };

    function init() {



    };

    function tick(elapsedTime) {

        stage.update();
    };

    window.addEventListener('load', load);

})();