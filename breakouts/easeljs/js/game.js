(function() {

    /**
     * Main game object, start point of the Game application.
     * @type {Object}
     */
    var Game = {
        /**
         * EaselJS stage from canvas
         * @type {createjs.Stage}
         */
        stage: null,

        /**
         * Text that shows loading of the game
         * @type {createjs.Text}
         */
        loadingIndicator: null,

        /**
         * Loads and holds assets
         * @type {createjs.Preloader}
         */
        loader: null,

        /**
         * holds references to the various spriteSheets by name
         * @type {Object}
         */
        spriteSheets: {
            ball: null,
            bricks: null,
            paddle: null
        },

        /**
         * Reference to the current level
         * @type {Level}
         */
        currentLevel: null,

        /**
         * Application starter function
         */
        initialize: function() {
            Game.stage = new createjs.Stage('stage');

            Game.loadAssets();
        },

        /**
         * Load game assets and show loading indicator
         * @return {[type]} [description]
         */
        loadAssets: function() {
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

            Game.loadingIndicator = new createjs.Text("Loading 0%", "30px Arial", '#000');
            Game.loadingIndicator.x = 150;
            Game.loadingIndicator.y = 200;
            Game.stage.addChild(Game.loadingIndicator);

            Game.loader = new createjs.PreloadJS();

            Game.loader.onProgress = handleProgress;

            Game.loader.onComplete = handleComplete;

            Game.loader.loadManifest(manifest);

            /**
             * Avoids boring type
             * @return {Array} manifest for audio files
             */
            function getAudioFiles() {
                var filesNames = ['brickDeath', 'countDownBlip', 'powerdown', 'powerup', 'recover'];
                var extensions = ['.mp3', '.ogg', '.wav'];
                var result = [];

                filesNames.forEach(function(file) {
                    extensions.forEach(function(extension) {
                        result.push({
                            id: file + extension,
                            src: 'assets/sfx/' + file + extension
                        });
                    });
                });

                return result;
            }

            function handleProgress() {
                Game.loadingIndicator.text = "Loading " + Math.floor(event.loaded * 100) + "%";
                Game.stage.update();
            }

            function handleComplete() {
                Game.stage.removeAllChildren();

                Game.buildSpriteSheets();
                Game.currentLevel = new Level(1);

                Game.setupUpdateLoop();
            }
        },

        /**
         * Creates the various `createjs.SpriteSheet`s once the tiles asset
         * has been loaded.
         */
        buildSpriteSheets: function() {
            var tileImage = Game.loader.getResult("tiles").result;

            Game.spriteSheets.bricks = new createjs.SpriteSheet({
                images: [tileImage],
                frames: {
                    width: 32,
                    height: 16
                },
                animations: {
                    blue: 0,
                    blueDying: [0, 5],
                    orange: 6,
                    orangeDying: [6, 11],
                    red: 12,
                    redDying: [12, 17],
                    green: 18,
                    greenDying: [18, 23]
                }
            });

            Game.spriteSheets.ball = new createjs.SpriteSheet({
                images: [tileImage],
                frames: {
                    width: 16,
                    height: 16
                },
                animations: {
                    ball: {
                        frames: [51, 52, 53, 54, 55],
                        frequency: 2
                    }
                }
            });

            Game.spriteSheets.paddle = new createjs.SpriteSheet({
                images: [tileImage],
                frames: [
                    [0, 64, 48, 16],
                    [0, 80, 32, 16]
                ],
                animations: {
                    normal: 0,
                    small: 1
                }
            });
        },

        setupUpdateLoop: function() {
            createjs.Ticker.addListener(Game.tick);
            createjs.Ticker.useRAF = true;
            createjs.Ticker.setFPS(60);
        },

        tick: function(elapsedTime) {
          Game.stage.update();
        }
    };

    /**
     * Represents a level in the game.
     *
     * Holds references to the various graphics and display objects used
     * within this level.
     * @param {Number} levelNumber Human number (1-indexed) of the level
     */
    var Level = function(levelNumber) {
        /**
         * Zero-indexed number of the level, used in the levelMaps.
         * @type {Number}
         */
        this.levelNumber = levelNumber - 1;

        /**
         * There can be several balls at the same time.
         * A ball is an instance of createjs.BitmapAnimation.
         * @type {Array}
         */
        this.balls = [];

        /**
         * Every brick physically present in the level.
         * A brick is an instance of createjs.BitmapAnimation.
         * @type {Array}
         */
        this.bricks = [];

        /**
         * The paddle controlled by the player
         * @type {createjs.BitmapAnimation}
         */
        this.paddle = null;

        this.create();
    };

    /**
     * Map that defines the levels, i.e the color and position of each
     * brick in the level. Property made static so it doesn't eat up more
     * memory than necessary.
     * @type {Array}
     */
    Level.levelsMap = [
        [{
            color: "green",
            x: 118,
            y: 77
        }, {
            color: "orange",
            x: 150,
            y: 77
        }, {
            color: "green",
            x: 182,
            y: 77
        }, {
            color: "orange",
            x: 54,
            y: 93
        }, {
            color: "blue",
            x: 86,
            y: 93
        }, {
            color: "green",
            x: 118,
            y: 93
        }, {
            color: "green",
            x: 150,
            y: 93
        }, {
            color: "green",
            x: 182,
            y: 93
        }, {
            color: "blue",
            x: 214,
            y: 93
        }, {
            color: "orange",
            x: 246,
            y: 93
        }, {
            color: "blue",
            x: 86,
            y: 109
        }, {
            color: "blue",
            x: 118,
            y: 109
        }, {
            color: "blue",
            x: 150,
            y: 109
        }, {
            color: "blue",
            x: 182,
            y: 109
        }, {
            color: "blue",
            x: 214,
            y: 109
        }]
    ];

    /**
     * Create and displays the graphics and game objects for a level
     * @return {Level} itsel for chaining
     */
    Level.prototype.create = function() {

        // Adding a ball to the stage
        var ball = new createjs.BitmapAnimation(Game.spriteSheets.ball);
        ball.gotoAndStop("ball");
        ball.x = 50;
        ball.y = 250;
        Game.stage.addChild(ball);
        this.balls.push(ball);

        // Adding bricks to the stage
        var bricks = new createjs.BitmapAnimation(Game.spriteSheets.bricks);
        Level.levelsMap[this.levelNumber].forEach(function(brickInfo) {
            bricks.gotoAndStop(brickInfo.color);
            bricks.x = brickInfo.x;
            bricks.y = brickInfo.y;
            Game.stage.addChild(bricks);
            this.bricks.push(bricks);
            bricks = bricks.clone();
        }, this);

        // Adding the paddle
        var paddle = new createjs.BitmapAnimation(Game.spriteSheets.paddle);
        paddle.gotoAndStop("normal");
        paddle.x = Game.stage.canvas.width / 2 - 32;
        paddle.y = 368;
        Game.stage.addChild(paddle);
        this.paddle = paddle;

        return this;
    };

    window.addEventListener('load', Game.initialize);

})();