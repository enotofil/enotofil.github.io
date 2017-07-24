'use strict';

function changeStateTo(newState) {
  newState.init();
  currentState = newState;
};


var stateStart = {
  menuText: PIXI.Text,
  init: function() {
    gameVars.reset();
    bestText.text = 'Рекорд:  ' + bestScore;
    scoreText.text = 'Счет:  ' + gameVars.score;
    bigText.text = 'ТАБЛИЦА УМНОЖЕНИЯ';
    this.menuText = new PIXI.Text('Выбери сложность:\n\nЛегко          Сложно', {
      font: 'bold 40px arial',
      fill: 'MediumSlateBlue',
      dropShadow: true,
      dropShadowDistance: 3,
      align: 'center'
    });
    this.menuText.anchor.set(0.5, 0.5);
    this.menuText.position.set(renderer.width * 0.5, renderer.height * 0.56);
    stage.addChild(this.menuText);
  },
  update: function() {
    // просто ждем клик мыши
  },
  onMouseDown: function(event) {
    var pos = event.data.getLocalPosition(stage);
    if (pos.x < (sky.width / 2)) {
      option.setEasy();
    } else {
      option.setHard();;
    }
    console.log('Starting new game at <' + option.name + '>');
    stage.removeChild(this.menuText);
    bullets.load(gameVars.questions, player);
    enemy.revive();
    changeStateTo(stateMonsterJump);
  }
};


var stateMonsterJump = {
  init: function() {
    question.create();
    enemy.calculateJump();
    bigText.visible = false;
    //angleText.visible = false;
  },
  update: function() {
    // движение по траектории, пока не коснется земли
    enemy.update();
  },
  onMouseDown: function(event) {
    // не требуется
  }
};


var stateIdle = {
  init: function() {
    bigText.visible = true;
    angleText.visible = true;
    angleMeter.visible = true;
    this.startTime = Date.now();
  },
  update: function() {
      /*
    var nowTime = Date.now();
    gameVars.thinkTime += nowTime - this.prevTime;
    this.prevTime = nowTime;*/
  },
  onMouseDown: function(event) {
    aG = Math.max(aG, minAngle);
    aG = Math.min(aG, maxAngle);    
    if (aG === question.product) {
      question.solved = true;
      question.scoreResult = option.hitScore;
      gameVars.solvedCount++;      
      var timeLeft = maxThinkTime - (Date.now() - this.startTime);
      if (timeLeft > 0) {   // бонус за быстроту      
          question.scoreResult += Math.ceil(timeLeft / 1000);
      }              
    }    
    gameVars.score += question.scoreResult;
    console.log('%d x %d = %d, fired: %d, %d to score',
      question.mult1, question.mult2, question.product, aG, question.scoreResult);
    changeStateTo(stateBulletMove);
    angleText.visible = false;    
  }
};


var stateBulletMove = {
  init: function() {
    angleMeter.visible = false;
    bullets.fire(aR, v);
  },
  update: function() {
    // движение по траектории, пока не коснется земли
    var hitPos = bullets.flyTo(groundLevel);
    if (hitPos) {
      enemy.hit(hitPos);
      if (bullets.children.length === 0) changeStateTo(stateGameOver);
      else changeStateTo(stateMonsterJump);
    }
  },
  onMouseDown: function(event) {
    // не требуется
  }
};


var stateGameOver = {
  init: function() {
    document.getElementById('complete').play();    
    bestScore = Math.max(gameVars.score, bestScore);    
    set_cookie('bestScore', bestScore); // сохраняем в куки
    bigText.visible = true;
    bigText.text = 'Счёт:  ' + gameVars.score;
    bigText.anchor.set(0.5, 0.5);
    this.statsText = new PIXI.Text('Правильных ответов:\n' +
      gameVars.solvedCount + ' из ' + gameVars.questions, {
        font: 'bold 38px arial',
        fill: 'MediumSlateBlue',
        dropShadow: true,
        dropShadowDistance: 3,
        align: 'center'
      });
    this.statsText.anchor.set(0.5, 0.5);
    this.statsText.position.set(renderer.width * 0.5, renderer.height * 0.55);
    stage.addChild(this.statsText);
  },
  update: function() {},
  onMouseDown: function(event) {
    stage.removeChild(this.statsText);
    changeStateTo(stateStart);
  }
};
