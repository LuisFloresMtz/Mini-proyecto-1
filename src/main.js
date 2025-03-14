

const width = window.innerWidth;
const height = window.innerHeight;

// Player

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, nombre = "Luis", score = 0) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0);
    this.setCollideWorldBounds(true);

    this.nombre = nombre;
    this.score = score;
    this.lives = 3;
    this.dashTimer = 0;
    this.itemCounter = 0;
    this.shooting = false;
    this.bullets = scene.physics.add.group();

    // Ajustar tamaño del cuerpo del jugador si es necesario
    this.body.setSize(this.width * 0.8, this.height * 0.9);
  }

  collcectSpecial(item) {
    item.disableBody(true,true);
    this.scene.score += 100;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.scene.timerText.destroy();
    if(this.scene.score >= 500) this.scene.nextStage = true;
  }

  collectStar(star) {
    star.disableBody(true, true);
    this.scene.score += 10;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.itemCounter++;
    if(this.scene.score >= 500) this.scene.nextStage = true;
    //Aparicion del item especial una vez agarró 10 items normales
    if(this.itemCounter == 10) {
      this.itemCounter = 0;
      let item = this.scene.specials.children.entries[Phaser.Math.Between(0, 1)];
      item.enableBody(true, item.x, item.y, true, true);
      //Aparece en pantalla contador para agarrar el especial
      let counter = 5;
      let timerText = this.scene.add.text(300, 300, "5", {
        fontSize: '32px',
        fill: '#ffffff'
        }
      );
      this.scene.timerText = timerText;
      //Agrega un temporizador para obtener el objeto
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          counter--;
          timerText.setText(counter);
        },
        repeat: 4 
      });

      setTimeout(() => {
        item.disableBody(true,true);
        timerText.destroy();
      }, 6000);
    }
    
    if (this.scene.stars.countActive(true) === 0) {
      this.scene.stars.children.iterate((child) => {
        child.enableBody(true, Phaser.Math.Between(0, width), 0, true, true);
        child.setBounce(1);
        child.setCollideWorldBounds(true);
        child.setVelocity(Phaser.Math.Between(-200, 200), 40);
      });
    
      let x =
        this.x < 400
          ? Phaser.Math.Between(400, 800)
          : Phaser.Math.Between(0, 400);
      let bomb = this.scene.bombs.create(x, 16, "bomb");

      bomb.setBounce(1);
      bomb.setCollideWorldBounds(true);
      bomb.setVelocity(Phaser.Math.Between(-200, 200), 20);
      bomb.allowGravity = false;
    }
  }

  takeDamage() {
    this.scene.physics.pause();
    this.setTint(0xff0000);
    this.anims.play("turn");
    this.lives--;
    if(this.lives == 0){
      this.scene.gameOver = true;
    }
    setTimeout(() => {
      this.clearTint();
      this.scene.physics.resume();
    }, 250);
  }

  dash(side) {
    if (this.dashTimer === 0) {
      if (side === "left") this.x -= 50;
      else if (side === "right") this.x += 50;

      this.dashTimer = 1;
      setTimeout(() => (this.dashTimer = 0), 2000);
    }
  }

  run(side) {
    const speed = 160;
    if (side === "left") {
      this.setVelocityX(-speed);
    } else if (side === "right") {
      this.setVelocityX(speed);
    }
  }

  shoot(side) {
    if (this.shooting) return;

    this.shooting = true;

    let bullet = this.bullets.create(
      this.x + (side === "right" ? 10 : -10),
      this.y,
      "bullet"
    );

    bullet.setScale(0.035);
    bullet.body.allowGravity = false;
    bullet.setVelocityX(side === "right" ? 500 : -500);
    bullet.setCollideWorldBounds(true);

    // Destruir la bala si colisiona con el mundo
    bullet.body.onWorldBounds = true;
    bullet.body.world.on("worldbounds", (body) => {
      if (body.gameObject === bullet) bullet.destroy();
    });

    // Destruir la bala si choca con plataformas
    this.scene.physics.add.collider(bullet, this.scene.platforms, () => {
      bullet.destroy();
    });

    this.scene.time.delayedCall(500, () => {
      this.shooting = false;
    });
  }
}

class Bullet extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0);
    this.setCollideWorldBounds(true);
  }
}

// Enemies

class Enemy extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "morty") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.scene.score = 0;

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    // Definir tamaño del cuerpo para mejor detección de colisión
    this.body.setSize(this.width * 0.8, this.height * 0.9);
  }

  move() {
    if (this.scene.player.x < this.x) {
      this.setVelocityX(-100);
    } else if (this.scene.player.x > this.x) {
      this.setVelocityX(100);
    }

    if (this.body.velocity.x < 0) {
      this.anims.play("leftM", true);
    } else if (this.body.velocity.x > 0) {
      this.anims.play("rightM", true);
    }
  }

  hitPlayer(player, enemy) {
    this.scene.physics.pause(); // Pausa la física del juego
    player.setTint(0xff0000);

    if (player.anims.exists("turn")) {
      player.anims.play("turn");
    }
  }

  hitBullet(bullet, enemy) {
    enemy.destroy();
    bullet.destroy();

    if (typeof this.scene.score === "number") {
      this.scene.score += 10;
      this.scene.scoreText.setText("Score: " + this.scene.score);
    }
  }
}

class FinalBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "morty") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);

    this.health = 100;
    this.setScale(2);
  }
}

// Scenes

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.score = 0;
    this.pause = false;
  }

  init(data) {
    this.nextStage = false
    this.gameOver = false;
    if (data.reset) {
      this.score = 0;
    }
  }

  preload() {
    this.load.image("sky", "assets/sky.gif");
    this.load.image("ground", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("rick", "assets/rick.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
  }

  create() {
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;

    console.log(this.textures.list);

    //----------------------------------FONDO--------------------------------
    this.background = this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setScale(width / 800, height / 600);
      //.setDisplaySize(screenWidth * 2, screenHeight);

    //----------------------------------LAVA------------------------------
    this.lava = this.physics.add.staticSprite(0, 600, "ground");
    this.lava.setScale(1,2);
    this.lava.displayWidth = width * 2;
    this.lava.setTint(0xff0000);
    this.lava.refreshBody();
    
    //-------------------------------PLATAFORMAS------------------------------------
    this.platforms = this.physics.add.staticGroup(); 
    
    //Suelo
    this.platforms.create(width/2, 600, "ground").setScale(2.5).refreshBody();

    //Plataformas flotantes
    this.platforms.create(width - 400, 400, "ground");
    this.platforms.create(400, 400, "ground");
    this.platforms.create(width - 500, 220, "ground").setScale(0.5, 0.75).refreshBody();
    this.platforms.create(500, 220, "ground").setScale(0.5, 0.75).refreshBody();
    
    //Plataformas movibles
    this.mobilePlatforms = this.physics.add.staticGroup();
    //this.mobilePlatform = this.physics.add.staticSprite(width / 2, 300, "ground");
    this.mobilePlatforms.create(width - 100, 125, "ground").setScale(0.25,0.5).refreshBody();
    this.mobilePlatforms.create(100, 125, "ground").setScale(0.25,0.5).refreshBody();
    this.mobilePlatforms.children.iterate((child) => {
      this.tweens.add({
        targets: child,
        y: 300,
        duration: 3000,
        yoyo: true,
        repeat: -1,
        ease: "Linear",
        onUpdate: () => { 
          child.refreshBody();
        }
      });
    });
    
    //---------------------------JUGADOR---------------------------------
    this.player = new Player(this, width / 2, 450, "rick", "Luis", 0);
    this.cursors = this.input.keyboard.createCursorKeys();

    //---------------------------KEYBINDS------------------------------------
    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );
    this.pauseKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.ESC
    );

    //--------------------------PUNTUACIÓN-----------------------------------
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#FFFF",
    });

    //-----------------------------------ANIMACIONES----------------------------------
    this.anims.create({
      key: "leftR",
      frames: this.anims.generateFrameNumbers("rick", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "turn",
      frames: [{ key: "rick", frame: 4 }],
      frameRate: 20,
    });
    
    this.anims.create({
      key: "rightR",
      frames: this.anims.generateFrameNumbers("rick", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "leftM",
      frames: this.anims.generateFrameNumbers("morty", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rightM",
      frames: this.anims.generateFrameNumbers("morty", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    

    //-------------------------------CONSUMIBLES---------------------------------
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 6,
      setXY: { x: 12, y: 0, stepX: width/7 },
    });
    
    this.stars.children.iterate((child) => {
      child.setBounce(1);
      child.setCollideWorldBounds(true);
      child.setVelocity(Phaser.Math.Between(-200, 200), 40);
    });

    //---------------------------CONSUMIBLE ESPECIAL---------------------------
    this.specials = this.physics.add.staticGroup();
    this.specials.create(width - 100, 110, "star").setTint(0xff0000);
    this.specials.create(100, 110, "star").setTint(0xff0000);
    this.specials.children.iterate((child) => {
      child.disableBody(true, true);
    });

    
    //------------------------------BOMBAS------------------------------
    this.bombs = this.physics.add.group();
    
    //----------------------------FISICAS---------------------------------
    this.physics.add.overlap(
      this.player,
      this.specials,
      (player, special) => player.collcectSpecial(special),
      null,
      this
    );

    this.physics.add.collider(
      this.player, 
      this.mobilePlatform,
      function() {
        this.player.setVelocity(0);
        this.player.y = this.mobilePlatform.y - 30;
      },
      null,
      this  
    );
    this.physics.add.collider(this.mobilePlatforms, this.stars);
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.player, this.mobilePlatforms);
    this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    this.physics.add.overlap(
      this.player,
      this.stars,
      (player, star) => player.collectStar(star),
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.bombs,
      (player, bomb) => player.takeDamage(),
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.lava, 
      (player) => player.takeDamage(),
      null, 
      this
    );
  
  }

  update() {
    if (this.gameOver) {
      try {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        const existingScore = scores.find(
          (entry) => entry.nombre === this.player.nombre
        );

        if (!existingScore) {
          scores.push({ nombre: this.player.nombre, score: this.score });
        } else if (this.score > existingScore.score) {
          existingScore.score = this.score;
        }

        scores.sort((a, b) => b.score - a.score);

        localStorage.setItem("scores", JSON.stringify(scores));
      } catch (error) {
        console.error("Error al guardar los puntajes:", error);
      }
      console.log("Cambiando a GameOverScene");
      return this.scene.start("GameOverScene", {
        score: this.score,
        player: this.player,
      });
    }

    if(Phaser.Input.Keyboard.JustDown(this.pauseKey)) { 
      this.scene.launch("PauseScene", {scene: this.scene.key});
      this.scene.pause();
    }
    
    if(this.nextStage) {
      return this.scene.start("Scene2", {
        score: this.score,
        player: this.player,
      });
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("leftR", true);
      if (this.shootKey.isDown) this.player.shoot("left");
      if (this.cursors.shift.isDown) this.player.dash("left");
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("rightR", true);
      if (this.cursors.shift.isDown) this.player.dash("right");
      if (this.shootKey.isDown) this.player.shoot("right");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (
      this.cursors.up.isDown &&
      (this.player.body.touching.down || this.player.body.blocked.down)
    ) {
      if (
        this.cursors.up.isDown &&
        (this.player.body.touching.down || this.player.body.blocked.down)
      ) {
        this.player.setVelocityY(-330);
      }

      //this.updateBackgroundPosition();

      // this.enemies.children.iterate((enemy) => {
      //   if (enemy) {
      //     enemy.move();
      //   }
      // });
    }
  }
  updateBackgroundPosition() {
    const playerX = this.player.x;
    const screenWidth = this.sys.game.config.width;
    const backgroundWidth = this.background.displayWidth;

    const offsetX = Phaser.Math.Clamp(
      screenWidth / 2 - playerX,
      -backgroundWidth + screenWidth,
      0
    );
    this.background.setX(offsetX);
  }
}

class Scene2 extends Phaser.Scene {
  constructor() {
    super({key: "Scene2"});
    this.levelWidth = width * 2;
    this.pause = false;
  }

  hitBullet(bullet, enemy) {
    enemy.destroy();
    bullet.destroy();

    if (typeof this.score === "number") {
      this.score += 10;
      if (this.scoreText) {
        this.scoreText.setText("Score: " + this.score);
      }
    }
  }

  init(data) {
    this.gameOver = false;
    if (data.reset) {
      this.score = 0;
    }
  }

  preload() {
    this.load.image("sky", "assets/sky.gif");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet("rick", "assets/rick.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
    this.load.spritesheet("morty", "assets/morty.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
    this.load.spritesheet("boss", "assets/boss.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
  }

  create() {
    //--------------------------------FONDO------------------------------
    this.add
    .image(0, 0, "sky")
    .setOrigin(0, 0)
    .setScale(this.levelWidth / 800, height / 342);
    //.setScrollFactor(0);

    //Limites de mundo
    this.physics.world.setBounds(0, 0, this.levelWidth, height);

    
    //--------------------------------JUGADOR---------------------------------
    this.player = new Player(this, width / 2, 450, "rick", "Luis", 0);

    //------------------------------CAMARA--------------------------------------
    this.cameras.main.setBounds(0, 0, this.levelWidth, height);
    this.cameras.main.startFollow(this.player, true, 0.1, 0.1);

    //this.cameras.main.setDeadzone(0, 0);
    //this.cameras.main.centerToBounds();
    
    //-------------------------------------ENEMIGOS---------------------------
    this.enemies = this.physics.add.group();
    
    //Creación enemigos
    for (let i = 0; i < 6; i++) {
      let x = 12 + i * 70;
      let enemy = new Enemy(this, x, 0, "morty"); // Crear instancia de Enemy
      this.enemies.add(enemy); // Agregar manualmente al grupo
    }

    this.enemies.getChildren().forEach((enemy) => {
      console.log(enemy.texture.key); // Verifica el key de la textura
    });

    this.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(Phaser.Math.Between(-200, 200));
      }
    });
    
    //-----------------------------------ANIMACIONES----------------------------------
    this.anims.create({
      key: "leftR",
      frames: this.anims.generateFrameNumbers("rick", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "turn",
      frames: [{ key: "rick", frame: 4 }],
      frameRate: 20,
    });
    
    this.anims.create({
      key: "rightR",
      frames: this.anims.generateFrameNumbers("rick", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "leftM",
      frames: this.anims.generateFrameNumbers("morty", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rightM",
      frames: this.anims.generateFrameNumbers("morty", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    
    //----------------------------KEYBINDS-------------------------------
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );

    //--------------------------PUNTUACIÓN-----------------------------------
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#FFFF",
    }).setScrollFactor(0);

    //-------------------------------PLATAFORMAS--------------------------------
    this.platforms = this.physics.add.staticGroup();

    // Suelo
    this.platforms.create(0, 568, "ground").setOrigin(0,0).setScale((width * 2) / 400, 2).refreshBody();

    // Plataformas flotantes
    this.platforms.create(width * 2 * 0.2, height * 0.7, "ground").setScale(1.2, 1).refreshBody();
    this.platforms.create(width * 2 * 0.3, height * 0.3, "ground").setScale(0.8, 1).refreshBody();
    this.platforms.create(width * 2 * 0.45, height * 0.55, "ground").setScale(1.3, 1).refreshBody();
    this.platforms.create(width * 2 * 0.62, height * 0.3, "ground").setScale(0.8, 1).refreshBody();
    this.platforms.create(width * 2 * 0.65, height * 0.7, "ground").setScale(0.6, 1).refreshBody();
    this.platforms.create(width * 2 * 0.8, height * 0.55, "ground").setScale(1.2, 1).refreshBody();

    // ---------------------------------------FISICAS--------------------------------------------
    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      this.gameOver = true;
      //this.scene.start("FinalBossScene", { score: this.score });
    });
    this.physics.add.collider(
      this.player.bullets,
      this.enemies,
      (bullet, enemy) => {
        this.hitBullet(bullet, enemy);
      }
    );
  }

  update() {
    if (this.gameOver) {
      try {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];
        
        const existingScore = scores.find(
          (entry) => entry.nombre === this.player.nombre
        );

        if (!existingScore) {
          scores.push({ nombre: this.player.nombre, score: this.score });
        } else if (this.score > existingScore.score) {
          existingScore.score = this.score;
        }
        
        scores.sort((a, b) => b.score - a.score);
        
        localStorage.setItem("scores", JSON.stringify(scores));
      } catch (error) {
        console.error("Error al guardar los puntajes:", error);
      }
      console.log("Cambiando a GameOverScene");
      return this.scene.start("GameOverScene", {
        score: this.score,
        player: this.player,
      });
    }
    
    if(this.nextStage) {
      return this.scene.start("FinalBossScene", {
        score: this.score,
        player: this.player,
      });
    }
    
    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("leftR", true);
      if (this.shootKey.isDown) this.player.shoot("left");
      if (this.cursors.shift.isDown) this.player.dash("left");
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("rightR", true);
      if (this.cursors.shift.isDown) this.player.dash("right");
      if (this.shootKey.isDown) this.player.shoot("right");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }
    
    if (
      this.cursors.up.isDown &&
      (this.player.body.touching.down || this.player.body.blocked.down)
    ) {
      if (
        this.cursors.up.isDown &&
        (this.player.body.touching.down || this.player.body.blocked.down)
      ) {
        this.player.setVelocityY(-330);
      }
      
      //this.updateBackgroundPosition();
      //Falta rreglar esto
      try {

      this.enemies.children.iterate((enemy) => {
        if (enemy) {
          enemy.move();
        }
      });
    } catch(error){
      console.log(error);
    }
    }
  }
}

class FinalBossScene extends Phaser.Scene {
  constructor() {
    super({ key: "FinalBossScene" });
  }

  init(data) {
    this.score = data.score;
  }

  preload() {
    this.load.spritesheet("boss", "assets/boss.png", {
      frameWidth: 40,
      frameHeight: 50,
    });

    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet("rick", "assets/rick.png", {
      frameWidth: 40,
      frameHeight: 50,
    });

    this.load.spritesheet("morty", "assets/morty.png", {
      frameWidth: 40,
      frameHeight: 50,
    });

    this.anims.create({
      key: "leftR",
      frames: this.anims.generateFrameNumbers("rick", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turn",
      frames: [{ key: "rick", frame: 4 }],
      frameRate: 20,
    });

    this.anims.create({
      key: "rightR",
      frames: this.anims.generateFrameNumbers("rick", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "leftM",
      frames: this.anims.generateFrameNumbers("morty", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rightM",
      frames: this.anims.generateFrameNumbers("morty", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "leftB",
      frames: this.anims.generateFrameNumbers("boss", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "rightB",
      frames: this.anims.generateFrameNumbers("boss", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    this.anims.create({
      key: "turnB",
      frames: [{ key: "boss", frame: 4 }],
      frameRate: 20,
    });
  }

  create() {
    this.boss = new FinalBoss(this, 100, 450, "boss");
  }

  update() {
    if (this.gameOver) {
      try {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        const existingScore = scores.find(
          (entry) => entry.nombre === this.player.nombre
        );

        if (!existingScore) {
          scores.push({ nombre: this.player.nombre, score: this.score });
        } else if (this.score > existingScore.score) {
          existingScore.score = this.score;
        }

        scores.sort((a, b) => b.score - a.score);

        localStorage.setItem("scores", JSON.stringify(scores));
      } catch (error) {
        console.error("Error al guardar los puntajes:", error);
      }
      console.log("Cambiando a GameOverScene");
      return this.scene.start("GameOverScene", {
        score: this.score,
        player: this.player,
      });
    }

    //----------------MANEJO DE PAUSA----------------------------------------------
    if(Phaser.Input.Keyboard.JustDown(this.pauseKey)) { 
      this.scene.launch("PauseScene", {scene: this.scene.key});
      this.scene.pause();
    }

    if(this.nextStage) {
      return this.scene.start("FinalBossScene", {
        score: this.score,
        player: this.player,
      });
    }

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("leftR", true);
      if (this.shootKey.isDown) this.player.shoot("left");
      if (this.cursors.shift.isDown) this.player.run("left");
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("rightR", true);
      if (this.cursors.shift.isDown) this.player.run("right");
      if (this.shootKey.isDown) this.player.shoot("right");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (
      this.cursors.up.isDown &&
      (this.player.body.touching.down || this.player.body.blocked.down)
    ) {
      if (
        this.cursors.up.isDown &&
        (this.player.body.touching.down || this.player.body.blocked.down)
      ) {
        this.player.setVelocityY(-330);
      }

      //this.updateBackgroundPosition();

      this.enemies.children.iterate((enemy) => {
        if (enemy) {
          enemy.move();
        }
      });
    }
  }
}

class GameOverScene extends Phaser.Scene {
  constructor() {
    super({ key: "GameOverScene" });
  }

  init(data) {
    this.score = data.score || 0;
  }

  create() {
    this.add
      .text(width / 2, height / 2 - 50, "Game Over", {
        fontSize: "64px",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(width / 2, height / 2, `Score: ${this.score}`, {
        fontSize: "32px",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5, 0.5);

    this.add
      .text(width / 2, height / 2 + 100, "Press any key to restart", {
        fontSize: "24px",
        fill: "#FFFFFF",
      })
      .setOrigin(0.5, 0.5);

    this.input.keyboard.once("keydown", () => {
      this.scene.start("MainScene", { reset: true });
    });
  }
}

class PauseScene extends Phaser.Scene {
  constructor() {
      super("PauseScene");
  }

  init(data) {
    this.gameScene = data.scene;
  }

  create() {
      let div = document.createElement("div");
      div.innerHTML = 
        `
        <ul id="menu-list">
          <li class="menu-item" data-action="jugar">
           
            <span>Jugar</span>
          </li>
          <li class="menu-item" data-action="records">
            <i class="fa-solid fa-trophy menu-icon"></i>
            <span>Records</span>
          </li>
          <li class="menu-item" data-action="instrucciones">
            <i class="fa-solid fa-question menu-icon"></i>
            <span>Instrucciones</span>
          </li>
          <li class="menu-item" data-action="creditos">
            <i class="fa-solid fa-user group menu-icon"></i>
            <span>Créditos</span>
          </li>
        </ul>
      `;

      div.id = "menu-container" ;

      div.style.position = "absolute";
        div.style.top = "50%";
        div.style.left = "50%";
        div.style.transform = "translate(-50%, -50%)";
        div.style.textAlign = "center";

        document.body.appendChild(div); 

      // this.add.text(400, 200, "Juego Pausado", { fontSize: "32px", fill: "#fff" }).setOrigin(0.5);

      // this.resumeButton = this.add.text(400, 300, "Reanudar", { fontSize: "24px", fill: "#0f0" })
      //     .setOrigin(0.5)
      //     .setInteractive()
      //     .on("pointerdown", () => {
      //         this.scene.resume(this.gameScene);
      //         this.scene.stop();
      //     });

      // this.menuButton = this.add.text(400, 350, "Menú Principal", { fontSize: "24px", fill: "#f00" })
      //     .setOrigin(0.5)
      //     .setInteractive()
      //     .on("pointerdown", () => {
      //         this.scene.stop(this.gameScene);
      //         this.scene.start("MenuScene"); // Volver al menú
      // });

      this.pauseKey = this.input.keyboard.addKey(
        Phaser.Input.Keyboard.KeyCodes.ESC
      );
  }

  update() {
    if(Phaser.Input.Keyboard.JustDown(this.pauseKey)) {
      this.scene.resume(this.gameScene);
      this.scene.stop();
    }
  }
}


const config = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: true,
    },
  },
  //scene: [Scene2]
  scene: [MainScene, Scene2, GameOverScene, FinalBossScene, PauseScene],
  dom: { createContainer: true }
};

const game = new Phaser.Game(config);
