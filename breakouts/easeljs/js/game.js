(function() {

  var text, stage;

  var load = function() {
    // Avoids boring typing 
    var getAudioFiles = function() {
      var filesNames = [
        'brickDeath', 'countDownBlip', 'powerdown', 'powerup', 'recover'
      ];
      var extensions = ['.mp3', '.ogg', '.wav'];
      var result = [];

      filesNames.forEach(function(file) {
        extensions.forEach(function(extension) {
          result.push(
            { id: file + extension, src: 'assets/sfx/' + file + extension }
          );
        });
      });

      return result;
    };

    var manifest = [
      { id:"tiles", src:"assets/tiles.png" },
      { id:"logo", src:"assets/logo.png" }
    ].concat(getAudioFiles());

    var preloader = new createjs.PreloadJS();

    preloader.onProgress = function(event) {
      console.log("Loading...", Math.floor(event.loaded*100));
    };

    preloader.onComplete = function(event) {
      console.log("Complete", event);
    };

    preloader.loadManifest(manifest);
  };

  var init = function() {

    stage = new createjs.Stage('stage');

    text = new createjs.Text("Breakout", "Arial 50px", '#333');

    stage.addChild(text);

    text.x = 50;
    text.y = 50;

    createjs.Ticker.addListener(tick);
    createjs.Ticker.useRAF = true;
    createjs.Ticker.setFPS(60);
  };

  var tick = function(elapsedTime) {

    stage.update();
  };

  window.addEventListener('load', load);

})();