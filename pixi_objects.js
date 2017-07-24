/* jshint strict: true */
/* jshint browser: true */
/* globals PIXI, player, groundLevel, g, v, renderer, gameVars, snd, explosion */
'use strict';

var enemy = new PIXI.Sprite(PIXI.Texture.EMPTY);
enemy.revive = function() {
  this.anchor.set(0.5, 1);
  this.texture = monsterTextures[gameVars.monsterN];
  this.health = 2; // new property
  this.startPos = new PIXI.Point(renderer.width + 64, groundLevel); // new property
  this.position.set(this.startPos.x, this.startPos.y);
  this.targetPos = new PIXI.Point(); // new property
};
enemy.calculateJump = function() {
  this.t = 0; // new property
  this.startPos = new PIXI.Point(this.x, this.y);
  var aTR = question.product * Math.PI / 180;
  this.targetPos.set(player.x + v * v * Math.sin(aTR * 2) / g, groundLevel);
  this.speed = Math.sqrt(Math.abs(this.targetPos.x - this.startPos.x) * g);
  if (this.x > this.targetPos.x) {
    this.angle = Math.PI - Math.PI / 4;
  } else {
    this.angle = Math.PI / 4;
  }
};
enemy.update = function() {
  // движение по траектории, пока не коснется земли
  this.x = this.startPos.x + this.speed * this.t * Math.cos(this.angle);
  this.y = this.startPos.y - (this.speed * this.t * Math.sin(this.angle) - g * this.t * this.t / 2);
  this.t += 0.1; //frameTime * 0.006;
  this.scale.y = 1 + (groundLevel - this.y) / 300;
  if (this.y > groundLevel) {
    document.getElementById('drop').play()
    this.position.set(this.targetPos.x, this.targetPos.y);
    this.scale.y = 1;
    changeStateTo(stateIdle);
  }
};
enemy.hit = function(pos) {
  if (question.solved) {
    this.health--;
    effects.addText(      
      '+' + question.scoreResult.toString(),
      new PIXI.Point(this.x, this.y - this.height * 1.5), 0.01, 1.25, -0.005);
    scoreText.text = 'Счет:  ' + gameVars.score;
    if (this.health > 0) {
      document.getElementById('pain').play();
    } else { //  monster death
      document.getElementById('death').play();
      this.y -= this.height / 2;
      effects.add(this.texture, this.position, 0.01, 1.15, 0);      
      gameVars.monsterN++; // !!!!! не больше числа текстур!
      gameVars.monsterN %= 5;
      enemy.revive();
    }
  } else {
    document.getElementById('miss').play();
    effects.addText(
      missScreams[Math.floor(Math.random() * missScreams.length)],
      new PIXI.Point(this.x, this.y - this.height * 1.5), 0.01, 1.25, -0.005);
  }
};
//===========================================================================================

var bullets = new PIXI.Container();
bullets.load = function(count, owner) {
  var bulletGraph = new PIXI.Graphics();
  bulletGraph.beginFill(0x220000, 1);
  bulletGraph.drawCircle(0, 0, 4);
  bulletGraph.endFill();
  var bulletTexture = bulletGraph.generateTexture(renderer);
  for (var i = 0; i < count; i++) {
    var bullet = new PIXI.Sprite(bulletTexture);
    bullet.owner = owner; // new property, PIXI.Sprite
    bullet.anchor.set(0.5, 0.5);
    bullet.x = owner.x - 34;
    bullet.y = owner.y - 26 - this.children.length * 14;
    this.addChildAt(bullet, 0);
  }
};
bullets.fire = function(startAngle, startSpeed) {
  var b0 = this.children[0];
  b0.position.set(b0.owner.x, b0.owner.y);
  b0.startPos = new PIXI.Point(b0.owner.x, b0.owner.y); // new property
  b0.angle = startAngle; // new property
  b0.speed = startSpeed; // new property
  b0.t = 0; // new property  
  document.getElementById('shot').play()
};
bullets.flyTo = function(level) {
  var b0 = this.children[0];
  b0.t += 0.1; //frameTime * 0.007;
  b0.x = b0.startPos.x + b0.speed * b0.t * Math.cos(b0.angle);
  b0.y = b0.startPos.y - (b0.speed * b0.t * Math.sin(b0.angle) - g * b0.t * b0.t / 2);
  effects.add(b0.texture, b0.position, 0.1, 0, 0.1); 
  if (b0.y > level) {
    document.getElementById('explosion').play();
    effects.add(b0.texture, b0.position, 0.04, 0, 0.25);  
    effects.add(b0.texture, b0.position, 0.06, 0, 0.5);   
    this.removeChild(b0);
    return b0.position;
  }
};
//===========================================================================================

var effects = new PIXI.Container();
effects.add = function(texture, pos, fadeSpeed, liftSpeed, scaleSpeed) {
  var fade = new PIXI.Sprite(texture);
  fade.fadeSpeed = fadeSpeed; // добавляемые к PIXI.Sprite свойства
  fade.liftSpeed = liftSpeed; // добавляемые к PIXI.Sprite свойства
  fade.scaleSpeed = scaleSpeed; // добавляемые к PIXI.Sprite свойства    
  fade.anchor.set(0.5, 0.5);
  fade.position.set(pos.x, pos.y);
  this.addChild(fade);
};
effects.addText = function(text, pos, fadeSpeed, liftSpeed, scaleSpeed) {
  var fade = new PIXI.Text(text);
  fade.fadeSpeed = fadeSpeed; // добавляемые к PIXI.Sprite свойства
  fade.liftSpeed = liftSpeed; // добавляемые к PIXI.Sprite свойства
  fade.scaleSpeed = scaleSpeed; // добавляемые к PIXI.Sprite свойства  
  fade.anchor.set(0.5, 0.5);
  fade.position.set(pos.x, pos.y);
  this.addChild(fade);
};
effects.update = function() {
  this.children.forEach(function(sprite) {
    sprite.alpha -= sprite.fadeSpeed;
    sprite.y -= sprite.liftSpeed;
    sprite.scale.x += sprite.scaleSpeed;
    sprite.scale.y += sprite.scaleSpeed;
  });
  this.children = this.children.filter(function(sprite) {
    return sprite.alpha > 0;
  });
};
//===========================================================================================

var angleMeter = new PIXI.Container();
angleMeter.create = function() {
  this.r = groundLevel * 0.8;
  var canvas = document.createElement("canvas");
  canvas.width = this.r + 30;
  canvas.height = this.r + 30;
  var ctx = canvas.getContext("2d");
  ctx.beginPath();
  ctx.arc(0, canvas.height, this.r, Math.PI * 1.5, Math.PI * 2);
  for (var i = 1; i < 18; i++) {
    var x1 = Math.cos(i * Math.PI / 36) * this.r;
    var y1 = canvas.height - Math.sin(i * Math.PI / 36) * this.r;
    var x2 = Math.cos(i * Math.PI / 36) * (this.r + 8);
    var y2 = canvas.height - Math.sin(i * Math.PI / 36) * (this.r + 8);
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
  }
  for (var i = 1; i < 9; i++) {
    var x1 = Math.cos(i * Math.PI / 18) * (this.r - 20);
    var y1 = canvas.height - Math.sin(i * Math.PI / 18) * (this.r - 20);
    var x2 = Math.cos(i * Math.PI / 18) * (this.r - 5);
    var y2 = canvas.height - Math.sin(i * Math.PI / 18) * (this.r - 5);
    var x3 = Math.cos(i * Math.PI / 18) * (this.r + 16);
    var y3 = canvas.height - Math.sin(i * Math.PI / 18) * (this.r + 16);
    ctx.moveTo(x2, y2);
    ctx.lineTo(x3, y3);
    ctx.font = "22px sans-serif";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(Math.round(i * 10).toString(), x1, y1);
  }
  ctx.strokeStyle = 'green';
  ctx.stroke();
  var arcSprite = new PIXI.Sprite(PIXI.Texture.fromCanvas(canvas));
  arcSprite.position.set(player.x, player.y - canvas.height);
  arcSprite.alpha = 0.5;
  this.addChild(arcSprite);

  this.pointer = new PIXI.Graphics();
  this.pointer.position.set(player.x, player.y);
  this.addChild(this.pointer);
  this.visible = false;
};
angleMeter.update = function() {
  this.pointer.clear();
  this.pointer.beginFill('MediumSlateBlue', 0.1);
  this.pointer.moveTo(0, 0);
  this.pointer.lineTo(this.r, 0);
  this.pointer.arc(0, 0, this.r, 0, -aR, true);
  this.pointer.endFill();
};
