Thug = function(game, player, group){
  this.game = game;
  this.group = group;
  this.player = player;
  this.sprite = null;
  this.busy = false;
  this.health = 0;
  this.size = .5;
  this.state = 0;
  this.randomX = 0;
  this.randomY = 0;
  this.scoreText = null;
  this.lastDazedTime = new Date().getTime();
}

Thug.prototype = {
  preload: function(){

  },

  create: function(){
    // this.sprite = this.group.create(this.game.camera.x + this.game.width, this.game.rnd.between(this.game.height/2 + 50, this.game.height-100), 'dude');
    // this.sprite = this.game.add.sprite(this.game.world.randomX, this.game.world.randomY, 'dude');

    // this.sprite = this.game.add.sprite(this.game.camera.x + this.game.width, this.game.rnd.between(this.game.height/2 + 50, this.game.height-100), 'assets', 'bad_walk_01.png');
    this.sprite = this.game.add.sprite(this.game.camera.x + this.game.width + 25, this.game.rnd.between(this.game.height/2 + 50, this.game.height-100), 'assets', 'Evil_standing1.png');
    this.group.add(this.sprite);
    this.health = 15;
    this.sprite.anchor.setTo(0.5, 1);
    this.sprite.scale.setTo(this.size, this.size);

    this.game.physics.enable(this.sprite, Phaser.Physics.ARCADE);
    this.game.time.events.loop(Phaser.Timer.SECOND * 1.5, this.updateState, this);
    //
    // this.sprite.animations.add('idle', ['bad_walk_01.png'], 12, false);
    // this.sprite.animations.add('walk', ['bad_walk_01.png', 'bad_walk_02.png', 'bad_walk_03.png', 'bad_walk_04.png'], 12, false);
    // this.sprite.animations.add('run', ['bad_run_01.png', 'bad_run_02.png', 'bad_run_03.png', 'bad_run_04.png'], 12, false);
    // this.sprite.animations.add('punch', ['bad_punch_01.png', 'bad_punch_02.png', 'bad_punch_03.png', 'bad_punch_04.png'], 12, false);
    // this.sprite.animations.add('injured', ['bad_hit_01.png'], 12, false);
    this.sprite.animations.add('idle', ['Evil_standing1.png','Evil_standing2.png'], 12, false);
    this.sprite.animations.add('walk', ['Evil_walkingRight1.png','Evil_walkingRight2.png'], 12, false);
    this.sprite.animations.add('run', ['Evil_walkingRight1.png','Evil_walkingRight2.png'], 12, false);
    this.sprite.animations.add('punch', ['Evil_punchingRight.png'], 12, false);
    this.sprite.animations.add('injured', ['Evil_punchedLeft.png'], 12, false);
    this.sprite.animations.add('death', ['Evil_deadLeft.png'], 12, false);

    // injured = this.sprite.animations.add('injured', [0, 1, 2, 3, 4, 5, 6, 7], 12, false);
    // injured.onComplete.add(fucntion(){ this.animations.play('')})

    this.scoreText = this.game.add.text(32, 550, 'health: ' + this.health, { font: "20px Arial", fill: "#ffffff", align: "left" });
  },

  update: function(){
    if (this.sprite.body.velocity.x != 0){
      this.sprite.body.velocity.x *= .75;
      if(this.sprite.body.velocity.x < .005 && this.sprite.body.velocity.x > -.005){
        this.sprite.body.velocity.x = 0;
      }
    }

    if (!this.dazed()) {
      if (this.player.sprite.x < this.sprite.x){
        this.sprite.scale.x = -1 * this.size;
      } else {
        this.sprite.scale.x = this.size;
      }
      this.runState();

      this.punchHitDetection(this.sprite, this.player.sprite);
      if (this.proximityDetection(this.sprite, this.player.sprite) && (this.state == 1 || this.state == 2)) {
        this.state = 6;
      }
    }
  },

  punchHitDetection: function(badguy, player) {
    hitBox = {
      width: 50,
      thickness: 10
    };

    thisRight = badguy.x + badguy.width/2;
    thisLeft = badguy.x - badguy.width/2;
    thisFar = badguy.y - hitBox.thickness;
    thisClose = badguy.y + hitBox.thickness;

    playerRight = player.x + player.width/2;
    playerLeft = player.x - player.width/2;
    playerFar = player.y - hitBox.thickness;
    playerClose = player.y + hitBox.thickness;

    if (player.animations.currentAnim.name === 'punch' && this.inZpace(playerClose, playerFar, badguy.y)) {
      if (player.scale.x > 0) {
        if ((playerRight < thisLeft) && (playerRight + hitBox.width > thisLeft)) {
          badguy.body.velocity.y = 0;
          this.injured();
          badguy.body.velocity.x = 1000;
        }
      }
      if (player.scale.x < 0) {
        if ((playerLeft > thisRight) && (playerLeft - hitBox.width < thisRight)) {
          badguy.body.velocity.y = 0;
          this.injured();
          badguy.body.velocity.x = -1000;
        }
      }
    }
  },

  proximityDetection: function(badguy, player) {
    hitBox = {
      width: 50,
      thickness: 10,
      x: 0,
      y: 0,
    };

    thisRight = badguy.x + badguy.width/2;
    thisLeft = badguy.x - badguy.width/2;
    thisFar = badguy.y - hitBox.thickness;
    thisClose = badguy.y + hitBox.thickness;

    playerRight = player.x + player.width/2;
    playerLeft = player.x - player.width/2;
    playerFar = player.y - hitBox.thickness;
    playerClose = player.y + hitBox.thickness;

    if (this.inZpace(playerClose, playerFar, badguy.y)) {
      if ((player.x < thisLeft) && (player.x > thisLeft - hitBox.width)) {
        return true;
      } else if ((player.x > thisRight) && (player.x < thisRight + hitBox.width)) {
        return true;
      }
    }
  },

  inZpace: function(close, far, target) {
    if (target < close && target > far) {
      return true;
    }

    return false;
  },

  updateState: function(){
    if (!this.dazed()) {
      this.state = this.game.rnd.between(0,3);

      if(this.state == 3){
        this.randomX = this.game.rnd.between(25, this.game.width-25);
        this.randomY = this.game.rnd.between((this.game.height/2 + 50), (this.game.height-100));
      }
    }
  },

  dazed: function() {
    if (this.state == 4 || !this.canMove()) {
      return true;
    } else {
      return false;
    }
  },

  canMove: function() {
    return (new Date().getTime() - this.lastDazedTime) > 500;
  },

  runState: function(){
    switch (this.state) {
      case 0:
        // console.log("standing");
        this.standing();
        break;
      case 1:
        // console.log("stalking");
        this.stalk();
        break;
      case 2:
        // console.log("chasing");
        this.chase();
        break;
      case 3:
        // console.log("walking");
        this.walk();
        break;
      case 4:
        // this.dead();
        break;
      case 5:
        // console.log("injured");
        break;
      case 6:
        this.punch();
        break;
      default:
        this.standing();
        break;
    }
  },

  standing: function(time){
    this.busy = true;
    this.sprite.animations.play('idle');
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    this.busy = false;
  },

  punch: function(){
    this.busy = true;
    this.sprite.animations.play('punch');
    this.sprite.body.velocity.x = 0;
    this.sprite.body.velocity.y = 0;
    setTimeout(function(){
    this.busy = false;
    }.bind(this), 1000);
  },

  injured: function(){
    this.busy = true;
    this.state = 5;
    // this.sprite.body.velocity.x = 0;
    // this.sprite.body.velocity.y = 0;
    this.health -= 5;
    this.scoreText.text = 'health: ' + this.health;
    this.lastDazedTime = new Date().getTime();
    this.busy = false;
    this.sprite.animations.play('injured');
    if(this.health <= 0) {
      setTimeout(function(){
        this.dead();
      }.bind(this), 200);
    }
  },

  dead: function(){
    this.state = 4;
    this.busy = true;
    this.sprite.animations.play('death');
    setTimeout(function(){
      this.flash();
    }.bind(this), 1000)
    setTimeout(function(){
      this.flash();
    }.bind(this), 1500)
    setTimeout(function(){
      this.flash();
    }.bind(this), 1800)
    setTimeout(function(){
      this.flash();
    }.bind(this), 1900)
    setTimeout(function(){
      this.sprite.kill();
    }.bind(this), 2000);
  },

  flash: function(){
    this.sprite.alpha = 0;
    setTimeout(function(){
      this.sprite.alpha = 1;
    }.bind(this), 100)
  },

  stalk: function(){
    this.busy = true;
    this.sprite.animations.play('walk');
    this.game.physics.arcade.moveToObject(
      this.sprite,
      this.player.sprite,
      60,
      null
    );
    this.busy = false;
  },

  chase: function(){
    this.busy = true;
    this.sprite.animations.play('run');
    this.game.physics.arcade.moveToObject(
      this.sprite,
      this.player.sprite,
      120,
      null
    );
    this.busy = false;
  },

  walk: function(){
    this.busy = true;
    this.sprite.animations.play('walk');
    this.game.physics.arcade.moveToXY(
      this.sprite,
      this.randomX,
      this.randomY,
      60,
      null
    );
    this.busy = false;
  }
}
