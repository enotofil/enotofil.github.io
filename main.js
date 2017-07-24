/* jshint browser: true */

var renderer = PIXI.autoDetectRenderer(1024, 600, {
    backgroundColor: 0x1099bb
});
document.getElementById('game').appendChild(renderer.view);
var stats = new Stats();
document.getElementById('game').appendChild(stats.domElement);

var stage = new PIXI.Container();

var option = {};
option.setEasy = function() {
    this.min = 9;
    this.max = 36;
    this.name = 'легко';
    this.hitScore = 10;
};
option.setHard = function() {
    this.min = 27;
    this.max = 81;
    this.name = 'сложно';
    this.hitScore = 11;
};

var gameVars = {};
gameVars.reset = function() {
    this.questions = 10;
    this.score = 0;
    this.answers = [];
    this.solvedCount = 0;
    this.monsterN = 0;
};
gameVars.reset();

var bestScore = parseInt(get_cookie('bestScore'));
if (!bestScore) bestScore = 0;

var missScreams = ['промазал', 'мимо', 'не задел', 'не попал'];

var currentState = stateStart;

var player, gun, sky, tilingGround;
var monsterTextures = [];
var angleText, bigText, bestText, scoreText, easyText, hardText;
var g = 10;
var v = 96;
var maxAngle = 81;
var minAngle = 9;
var groundLevel = 568;
var aG = 0;
var aR = 0;
var maxThinkTime = 10000;

var question = {};
question.create = function() {
    this.solved = false;
    this.scoreResult = 0; 
    do {
        this.mult1 = Math.floor(Math.random() * 8) + 2;
        this.mult2 = Math.floor(Math.random() * 8) + 2;
        this.product = this.mult1 * this.mult2;
    } while (
        this.product < option.min ||
        this.product > option.max ||
        gameVars.answers.indexOf(this.product) >= 0);

    gameVars.answers.push(this.product);
    bigText.text = this.mult1 + " x " + this.mult2;
    gameVars.prevAngle = this.product;
}


window.onload = function() {
    var texSky = new PIXI.Texture(new PIXI.BaseTexture(document.getElementById('sky')));
    sky = new PIXI.Sprite(texSky);
    sky.width = renderer.width;
    sky.height = groundLevel;
    sky.interactive = true;
    sky.on('mousedown', onDown);
    sky.on('mousemove', onMouseMove);

    var texPlayer = new PIXI.Texture(new PIXI.BaseTexture(document.getElementById('player')));
    player = new PIXI.Sprite(texPlayer);
    player.anchor.set(0.5, 1);
    player.position.set(48, groundLevel);

    var texGun = new PIXI.Texture(new PIXI.BaseTexture(document.getElementById('gun')));
    gun = new PIXI.Sprite(texGun);
    gun.anchor.set(-0.1, 0.5);
    gun.position.set(player.x, player.y);
    gun.rotation = -Math.PI / 4;

    var monsterSheet = new PIXI.BaseTexture(document.getElementById('monsters'));
    for (var i = 0; i < 5; i++) {
        var frame = new PIXI.Rectangle(i * 64, 0, 64, 64);
        monsterTextures[i] = new PIXI.Texture(monsterSheet, frame);
    }

    var texGround = new PIXI.Texture(new PIXI.BaseTexture(document.getElementById('ground')));
    tilingGround = new PIXI.extras.TilingSprite(texGround, renderer.width, 32);
    tilingGround.position.y = groundLevel;

    bigText = new PIXI.Text('Этого ты видеть не должен', {
        font: 'bold 64px arial',
        fill: 'MediumSlateBlue',
        dropShadow: true,
        dropShadowDistance: 3
    });
    bigText.position.set(renderer.width * 0.5, renderer.height * 0.33);
    bigText.anchor.set(0.5, 0.5);

    angleText = new PIXI.Text('Этого ты видеть не должен', {
        font: 'bold 32px arial',
        fill: 'DarkSlateBlue'
    });
    angleText.visible = false;

    bestText = new PIXI.Text('Этого ты видеть не должен', {
        font: 'normal 16px arial'
    });
    bestText.anchor.x = 1;
    bestText.position.set(renderer.width - 16, 10);
    
    scoreText = new PIXI.Text('Этого ты видеть не должен', {
        font: 'normal 16px arial'
    });    
    scoreText.position.set(16, 10);

    angleMeter.create();

    document.body.removeChild(document.getElementById('texture'));

    stage.addChild(sky);
    stage.addChild(angleMeter);
    stage.addChild(bullets);
    stage.addChild(effects);
    stage.addChild(gun);
    stage.addChild(player);
    stage.addChild(enemy);
    stage.addChild(tilingGround);
    stage.addChild(bigText);
    stage.addChild(angleText);
    stage.addChild(bestText);
    stage.addChild(scoreText);

    changeStateTo(stateStart);
    animate(); // start main loop
}

//=======================================================================
function animate() {
    stats.begin();

    currentState.update();
    effects.update();

    renderer.render(stage);
    requestAnimationFrame(animate);

    stats.end();
}

function onDown(mouseData) {
    currentState.onMouseDown(mouseData);
}

function onMouseMove(event) {
    // поворот пушки
    var pos = event.data.getLocalPosition(player);
    aR = Math.atan(-pos.y / pos.x);
    aG = Math.round(aR * 180 / Math.PI);
    if (pos.x <= 0)
        aG = maxAngle;
    if (pos.y >= 0)
        aG = minAngle;
    aG = Math.max(aG, minAngle);
    aG = Math.min(aG, maxAngle);
    aR = aG * Math.PI / 180; // корректируем до целого значения в градусах
    angleText.text = aG.toString();
    angleText.anchor.set(0.5, 0.5);
    angleText.x = player.x + (angleMeter.r + 32) * Math.cos(aR);
    angleText.y = player.y - (angleMeter.r + 32) * Math.sin(aR);
    gun.rotation = -aR;
    angleMeter.update();
}


function set_cookie(name, value) {
    var expires = new Date();
    expires.setFullYear(expires.getFullYear() + 3); // на 3 года
    var cookie_string = name + "=" + escape(value) + "; expires=" + expires.toGMTString();
    document.cookie = cookie_string;
}

function get_cookie(cookie_name) {
    var results = document.cookie.match('(^|;) ?' + cookie_name + '=([^;]*)(;|$)');
    if (results) {
        return (unescape(results[2]));
    } else {
        return null;
    }
}
