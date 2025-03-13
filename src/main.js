const width = window.innerWidth;
const height = window.innerHeight;

// Player

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, nombre = "Luis", score = 0) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.nombre = nombre;
    this.score = score;
    this.shooting = false;
    this.bullets = scene.physics.add.group();

    // Ajustar tamaño del cuerpo del jugador si es necesario
    this.body.setSize(this.width * 0.8, this.height * 0.9);
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

    this.setBounce(0.2);
    this.setCollideWorldBounds(true);

    this.body.setSize(this.width * 0.8, this.height * 0.9);

    this.speed = 100; // Velocidad del enemigo
  }

  move() {
    const player = this.scene.player;
    if (player.x < this.x) {
      this.setVelocityX(-this.speed);
      this.anims.play("leftM", true);
    } else {
      this.setVelocityX(this.speed);
      this.anims.play("rightM", true);
    }

    // Saltar

    if (
      (this.body.touching.down || this.body.blocked.down) &&
      player.y < this.y
    ) {
      this.setVelocityY(-300);
    }
  }
}

class FinalBoss extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture = "boss") {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setCollideWorldBounds(true);
    this.health = 100;
    this.setScale(2);

    // 🔹 Asegurar que las animaciones existen antes de jugarlas
    this.scene.events.once("createAnimations", this.initAnimations, this);
  }

  initAnimations() {
    this.anims.play("turnB");
  }

  update() {
    if (!this.scene.player) return;

    const player = this.scene.player;
    const speed = 80;
    const distance = Phaser.Math.Distance.Between(
      this.x,
      this.y,
      player.x,
      player.y
    );

    // 🔹 Seguir al jugador solo si está cerca
    if (distance < 300) {
      this.scene.physics.moveToObject(this, player, speed);
    }

    // 🔹 Cambiar animación según la dirección
    if (this.x < player.x) {
      this.anims.play("rightB", true);
    } else if (this.x > player.x) {
      this.anims.play("leftB", true);
    }
  }
}

// Scenes

class MainScene extends Phaser.Scene {
  constructor() {
    super({ key: "MainScene" });
    this.score = 0;
  }

  init(data) {
    this.gameOver = false;
    if (data.reset) {
      this.score = 0;
    }
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

  preload() {
    this.load.image("sky", "assets/sky.gif");
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
    this.load.spritesheet("boss", "assets/boss.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
  }

  create() {
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;

    console.log(this.textures.list);

    this.background = this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setDisplaySize(screenWidth * 2, screenHeight);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(6).refreshBody();
    this.platforms.create(400, 568, "ground").setScale(6).refreshBody();
    this.platforms.create(600, 400, "ground");
    this.platforms.create(50, 250, "ground");
    this.platforms.create(750, 220, "ground");

    this.player = new Player(this, 100, 450, "rick", "Luis", 0);

    this.enemies = this.physics.add.group();

    for (let i = 0; i < 12; i++) {
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

    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#000",
    });

    this.physics.add.collider(this.enemies, this.platforms);
    this.physics.add.collider(this.player, this.enemies, (player, enemy) => {
      this.gameOver = true;
      this.scene.start("FinalBossScene", { score: this.score });
    });

    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(
      this.player.bullets,
      this.enemies,
      (bullet, enemy) => {
        this.hitBullet(bullet, enemy);
      }
    );

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

    this.cursors = this.input.keyboard.createCursorKeys();

    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );
  }

  update() {
    if (this.gameOver) {
      try {
        let scores = JSON.parse(localStorage.getItem("scores")) || [];

        if (this.player.nombre) {
          const existingScore = scores.find(
            (entry) => entry.nombre === this.player.nombre
          );
          if (this.player.nombre) {
            const existingScore = scores.find(
              (entry) => entry.nombre === this.player.nombre
            );

            if (!existingScore) {
              scores.push({ nombre: this.player.nombre, score: this.score });
            } else if (this.score > existingScore.score) {
              existingScore.score = this.score;
            }
            if (!existingScore) {
              scores.push({ nombre: this.player.nombre, score: this.score });
            } else if (this.score > existingScore.score) {
              existingScore.score = this.score;
            }

            scores.sort((a, b) => b.score - a.score);
            localStorage.setItem("scores", JSON.stringify(scores));
          }
          scores.sort((a, b) => b.score - a.score);
          localStorage.setItem("scores", JSON.stringify(scores));
        }
      } catch (error) {
        console.error("Error al guardar los puntajes:", error);
      }
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
    }
    this.updateBackgroundPosition();

    this.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.move();
      }
    });
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

class FinalBossScene extends Phaser.Scene {
  constructor() {
    super({ key: "FinalBossScene" });
  }

  init(data) {
    this.score = data.score || 0;
  }

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.image("fireBoss", "assets/fireBoss.png");

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
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;

    console.log(this.textures.list);

    this.background = this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setDisplaySize(screenWidth * 2, screenHeight);

    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 580, "ground").setScale(4).refreshBody();

    this.player = this.physics.add.sprite(400, 500, "rick");
    this.player.setCollideWorldBounds(true);
    this.physics.add.collider(this.player, this.platforms);

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

    this.createAnimations();

    this.boss = new FinalBoss(this, 200, 450, "boss");

    this.events.emit("createAnimations");

    this.bossProjectiles = this.physics.add.group();

    this.physics.add.collider(this.player, this.platforms);
    this.physics.add.collider(this.boss, this.platforms);

    this.physics.add.overlap(
      this.player,
      this.bossProjectiles,
      this.hitPlayer,
      null,
      this
    );

    this.time.addEvent({
      delay: 3000,
      callback: () => this.bossAttack(),
      loop: true,
    });
  }

  update() {
    if (this.boss) {
      this.boss.update();
    }
  }

  createAnimations() {
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

  bossAttack() {
    if (!this.boss.active) return;

    const fireball = this.bossProjectiles.create(
      this.boss.x,
      this.boss.y,
      "fireBoss"
    );

    fireball.setVelocityX(this.boss.x < this.player.x ? 200 : -200);
    fireball.setGravityY(-300);
  }

  hitPlayer(player, projectile) {
    projectile.destroy();
    console.log("¡El jugador ha sido golpeado!");
  }
}

// Game

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
  scene: [MainScene, FinalBossScene],
};

const game = new Phaser.Game(config);
