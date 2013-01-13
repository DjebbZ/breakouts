(function () {

    var text, stage;

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

        var progressIndicator = document.getElementById("progress");

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
            progressIndicator.innerHTML = Math.floor(event.loaded * 100);
        }

        function handleComplete(event) {
            document.getElementById("loading").innerHTML = "Loading complete !";
        }

    };

    function init() {

        stage = new createjs.Stage('stage');

        text = new createjs.Text("Breakout", "Arial 50px", '#333');

        stage.addChild(text);

        text.x = 50;
        text.y = 50;

        createjs.Ticker.addListener(tick);
        createjs.Ticker.useRAF = true;
        createjs.Ticker.setFPS(60);
    };

    function tick(elapsedTime) {

        stage.update();
    };

    window.addEventListener('load', load);

})();