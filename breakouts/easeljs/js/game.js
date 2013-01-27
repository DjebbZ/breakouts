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
                Game.currentLevel.setupEvents();

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
     * Ball class
     * @param {Number} x initial x position
     * @param {Number} y initial y position
     */
    var Ball = function(x, y) {
        this.initialize(x, y);
    };

    // setup inheritance
    Ball.prototype = new createjs.BitmapAnimation();

    // Save parent initialize method
    Ball.prototype.BitmapAnimation_initalize = Ball.prototype.initialize;

    Ball.prototype.initialize = function(x, y) {
        this.BitmapAnimation_initalize(Game.spriteSheets.ball);
        this.x = x;
        this.y = y;

        this.gotoAndStop('ball');
    };

    /**
     * Brick class
     * @param {Number} x     initial x position
     * @param {Number} y     initial y position
     * @param {String} color initial SpriteSheet animation
     */
    var Brick = function(x, y, color) {
        this.initialize(x, y, color);
    };

    Brick.prototype = new createjs.BitmapAnimation();

    Brick.prototype.BitmapAnimation_initalize = Brick.prototype.initialize;

    Brick.prototype.initialize = function(x, y, color) {
        this.BitmapAnimation_initalize(Game.spriteSheets.bricks);
        this.x = x;
        this.y = y;
        this.color = color;
        this.gotoAndStop(color);
    };

    var Paddle = function(x, y) {
        this.initialize(x, y);
    };

    Paddle.prototype = new createjs.BitmapAnimation();

    Paddle.prototype.BitmapAnimation_initalize = Paddle.prototype.initialize;

    Paddle.prototype.initialize = function(x, y) {
        this.BitmapAnimation_initalize(Game.spriteSheets.paddle);
        this.x = x;
        this.y = y;

        this.normalWidth = 48;
        this.smallWidth = 32;
        this.width = this.normalWidth;

        /**
         * Next horizontal position
         * @type {Number}
         */
        this.vX = null;
        this.gotoAndStop('normal');
    };

    /**
     * Ensure mouse moves
     * @param  {[type]} mouseX [description]
     * @return {[type]}        [description]
     */
    Paddle.prototype.calculateMoveFrom = function(mouseX) {
        this.vX = mouseX - this.width/2;
    };

    /**
     * Properties calculated on every tick
     */
    Paddle.prototype.onTick = function() {
        this.x = this.vX;
    };

    /**
     * Level class. Represents a level in the game.
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
        var ball = new Ball(50, 250);
        Game.stage.addChild(ball);
        this.balls.push(ball);

        // Adding bricks to the stage
        Level.levelsMap[this.levelNumber].forEach(function(brickInfo) {
            var brick = new Brick(brickInfo.x, brickInfo.y, brickInfo.color);
            Game.stage.addChild(brick);
            this.bricks.push(brick);
        }, this);

        // Adding the paddle
        var paddle = new Paddle((Game.stage.canvas.width / 2 - 32), 368);
        Game.stage.addChild(paddle);
        this.paddle = paddle;

        return this;
    };

    Level.prototype.setupEvents = function() {
        var level = this;
        Game.stage.onMouseMove = function(mouseEvent) {
            console.log('mouse moved');
            level.paddle.calculateMoveFrom(mouseEvent.stageX);
        };
    };

    window.addEventListener('load', Game.initialize);

})();