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
    this.health = 3;
    this.score = score;
    this.shooting = false;
    this.bullets = scene.physics.add.group();
    this.lastDirection = "right";

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

  receiveDamage(damage) {
    this.health -= damage;

    if (this.health <= 0) {
      this.scene.gameOver = true;
      this.scene.scene.start("MainScene", { reset: true });
    }
  }

  shoot(side = "right") {
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
      this.anims.play("leftE", true);
    } else {
      this.setVelocityX(this.speed);
      this.anims.play("rightE", true);
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
    scene.physics.world.enable(this);
    this.setCollideWorldBounds(true);

    this.health = 15;
    this.fireballs = scene.physics.add.group();
  }

  receiveDamage(damage) {
    console.log(this);
    this.health -= damage;

    if (this.health <= 0) {
      this.scene.events.emit("bossDefeated");
      this.destroy();
    }
  }

  attack() {
    if (!this.active) return;

    const directionX = this.scene.player.x - this.x; // Diferencia en el eje X
    const directionY = this.scene.player.y - this.y; // Diferencia en el eje Y

    // Calcular la magnitud de la distancia
    const distance = Math.sqrt(
      directionX * directionX + directionY * directionY
    );

    // Normalizar la dirección (hacer que la magnitud sea 1)
    const velocityX = directionX / distance;
    const velocityY = directionY / distance;

    // Crear el disparo y posicionarlo
    const fireball = this.fireballs.create(this.x, this.y, "fireball");

    // Desactivar la gravedad de la bala
    fireball.body.allowGravity = false;

    // Aplicar la velocidad en la dirección del jugador
    fireball.setVelocityX(velocityX * 500); // 200 es la velocidad, puedes ajustarlo
    fireball.setVelocityY(velocityY * 200); // 200 es la velocidad, puedes ajustarlo

    // Animación del disparo
    fireball.anims.play("fireball", true);
  }

  move() {
    const amplitude = 100;
    const speed = 100;

    // Movimiento en el eje X: izquierda y derecha
    this.setVelocityX(speed);

    // Movimiento en el eje Y: patrón de movimiento vertical en zig-zag
    const sinWave = Math.sin(this.scene.time.now / 1000) * amplitude;
    this.setVelocityY(sinWave); // Aplica el movimiento en el eje Y con la onda sinusoidal

    // Cambiar la animación del boss
    if (this.body.velocity.x < 0) {
    } else if (this.body.velocity.x > 0) {
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
    this.load.spritesheet("enemy", "assets/enemigo.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
    this.load.spritesheet("rick", "assets/rick.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
    this.load.spritesheet("morty", "assets/morty.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
  }

  create() {
    const screenWidth = this.sys.game.config.width;
    const screenHeight = this.sys.game.config.height;
    this.player = new Player(this, 100, 450, "morty", "Luis", 0);
    this.player.setDepth(10);

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

    this.enemies = this.physics.add.group();

    for (let i = 0; i < 12; i++) {
      let x = 12 + i * 70;
      let enemy = new Enemy(this, x, 0, "enemy"); // Crear instancia de Enemy
      this.enemies.add(enemy); // Agregar manualmente al grupo
    }

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
    this.physics.add.collider(this.player, this.enemies, () => {
      this.gameOver = true;
      this.scene.start("FinalBossScene", { score: this.player.score });
    });

    this.physics.add.collider(this.player, this.platforms);

    this.physics.add.collider(
      this.player.bullets,
      this.enemies,
      (bullet, enemy) => {
        this.hitBullet(bullet, enemy);
      }
    );

    createAnimations("rick", this);

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

    playerMovement(this.player, this.cursors, this.shootKey, "rick");

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

  preload() {
    this.load.image("ground", "assets/platform.png");
    this.load.image("bullet", "assets/bullet.png");
    this.load.spritesheet("fireball", "assets/fireball.png", {
      frameWidth: 57,
      frameHeight: 57,
    });
    this.load.spritesheet("boss", "assets/boss.png", {
      frameWidth: 105,
      frameHeight: 112,
    });

    this.load.spritesheet("rick", "assets/rick.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
    this.load.spritesheet("morty", "assets/morty.png", {
      frameWidth: 40,
      frameHeight: 50,
    });
  }

  create() {
    // Definir los grupos y objetos
    this.platforms = this.physics.add.staticGroup();
    this.platforms.create(400, 568, "ground").setScale(6).refreshBody();

    // Crear jugador si no existe
    if (!this.player) {
      this.player = new Player(this, 100, 300, "rick", "Luis", 0);
      createAnimations("rick", this);
      this.physics.add.collider(this.player, this.platforms);
    }

    // Crear boss si no existe
    if (!this.boss) {
      this.boss = new FinalBoss(this, width, 400, "boss");
      console.log(this.boss);
      this.boss.setDepth(10);
      this.physics.add.collider(this.boss, this.platforms);
    }

    // Evento de ataque cada 3 segundos
    this.attackEvent = this.time.addEvent({
      delay: 2000,
      callback: this.boss.attack,
      callbackScope: this.boss,
      loop: true,
    });

    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );
  }

  update() {
    // Movement
    if (this.boss && this.boss.body) {
      this.boss.move();
    }

    // Player movement
    playerMovement(this.player, this.cursors, this.shootKey, "rick");

    // Colliders
    this.physics.add.collider(
      this.player.bullets,
      this.boss,
      (boss, bullet) => {
        boss.receiveDamage(1);
        bullet.destroy();
      }
    );

    this.physics.add.collider(
      this.boss.fireballs,
      this.player,
      (player, fireball) => {
        player.receiveDamage(1);
        fireball.destroy();
      }
    );
  }
}

function createAnimations(character, scene) {
  if (character === "rick") {
    scene.anims.create({
      key: "leftR",
      frames: scene.anims.generateFrameNumbers("rick", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "turnR",
      frames: [{ key: "rick", frame: 4 }],
      frameRate: 20,
    });

    scene.anims.create({
      key: "rightR",
      frames: scene.anims.generateFrameNumbers("rick", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  } else {
    scene.anims.create({
      key: "leftM",
      frames: scene.anims.generateFrameNumbers("morty", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "turnM",
      frames: [{ key: "morty", frame: 4 }],
      frameRate: 20,
    });

    scene.anims.create({
      key: "rightM",
      frames: scene.anims.generateFrameNumbers("morty", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  }
  if (scene.scene.key === "MainScene") {
    scene.anims.create({
      key: "leftE",
      frames: scene.anims.generateFrameNumbers("enemy", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "turnE",
      frames: [{ key: "enemy", frame: 4 }],
      frameRate: 20,
    });

    scene.anims.create({
      key: "rightE",
      frames: scene.anims.generateFrameNumbers("enemy", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
  } else if (scene.scene.key === "FinalBossScene") {
    scene.anims.create({
      key: "leftB",
      frames: scene.anims.generateFrameNumbers("boss", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "turnB",
      frames: [{ key: "boss", frame: 4 }],
      frameRate: 20,
    });

    scene.anims.create({
      key: "rightB",
      frames: scene.anims.generateFrameNumbers("boss", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });

    scene.anims.create({
      key: "fireball",
      frames: scene.anims.generateFrameNumbers("fireball", {
        start: 0,
        end: 3,
      }),
      frameRate: 10,
      repeat: -1,
    });
  }
}

function playerMovement(player, cursors, shootKey, character) {
  if (!player.lastDirection) {
    player.lastDirection = "right";
  }
  let name = character === "rick" ? "R" : "M";

  if (cursors.left.isDown) {
    player.setVelocityX(-160);
    player.anims.play(`left${name}`, true);
    if (shootKey.isDown) {
      player.shoot("left");
    }
    player.lastDirection = "left";
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play(`right${name}`, true);
    if (shootKey.isDown) {
      player.shoot("right");
    }
    player.lastDirection = "right";
  } else {
    player.setVelocityX(0);
    if (!shootKey.isDown) {
      player.anims.play(`turn${name}`);
    }
  }

  if (shootKey.isDown) {
    player.shoot(player.lastDirection);
  }

  if (cursors.up.isDown && player.body.onFloor()) {
    player.setVelocityY(-330);
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
