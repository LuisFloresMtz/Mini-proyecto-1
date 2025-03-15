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
    this.health = 3;
    this.score = score;
    this.dashTimer = 0;
    this.itemCounter = 0;
    this.shooting = false;
    this.bullets = scene.physics.add.group();
    this.lastDirection = "right";

    // Ajustar tamaño del cuerpo del jugador si es necesario
    this.body.setSize(this.width * 0.8, this.height * 0.9);
  }

  collcectSpecial(item) {
    item.disableBody(true, true);
    this.scene.score += 100;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.scene.timerText.destroy();
    if (this.scene.score >= 500) this.scene.nextStage = true;
  }

  collectStar(star) {
    star.disableBody(true, true);
    this.scene.score += 10;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.itemCounter++;
    if (this.scene.score >= 50) this.scene.nextStage = true;
    //Aparicion del item especial una vez agarró 10 items normales
    if (this.itemCounter == 10) {
      this.itemCounter = 0;
      let item =
        this.scene.specials.children.entries[Phaser.Math.Between(0, 1)];
      item.enableBody(true, item.x, item.y, true, true);
      //Aparece en pantalla contador para agarrar el especial
      let counter = 5;
      let timerText = this.scene.add.text(300, 300, "5", {
        fontSize: "32px",
        fill: "#ffffff",
      });
      this.scene.timerText = timerText;
      //Agrega un temporizador para obtener el objeto
      this.scene.time.addEvent({
        delay: 1000,
        callback: () => {
          counter--;
          timerText.setText(counter);
        },
        repeat: 4,
      });

      setTimeout(() => {
        item.disableBody(true, true);
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

  hitBomb() {
    this.scene.physics.pause();
    this.setTint(0xff0000);
    this.anims.play("turn");
    this.scene.gameOver = true;
  }

  run(side) {
    const speed = 200;
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
      this.bossMusic.stop();
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

    this.scene.score = 0;

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

  preload() {
    this.load.spritesheet("fireball", "assets/fireball.png", {
      frameWidth: 57,
      frameHeight: 57,
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
    this.nextStage = false;
    this.gameOver = false;
    if (data.reset) {
      this.score = 0;
    }
  }

  preload() {
    this.load.audio("level1-music", "assets/music/level1-music.mp3");
    this.load.image("sky", "assets/sky.gif");
    this.load.image("ground", "assets/platform.jpg");
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
    this.lava.setScale(1, 2);
    this.lava.displayWidth = width * 2;
    this.lava.setTint(0xff0000);
    this.lava.refreshBody();

    //-------------------------------PLATAFORMAS------------------------------------
    this.platforms = this.physics.add.staticGroup();

    //Suelo
    this.platforms
      .create(width / 2, 600, "ground")
      .setScale(2.5)
      .refreshBody();

    //Plataformas flotantes
    this.platforms.create(width - 400, 400, "ground");
    this.platforms.create(400, 400, "ground");
    this.platforms
      .create(width - 500, 220, "ground")
      .setScale(0.5, 0.75)
      .refreshBody();
    this.platforms.create(500, 220, "ground").setScale(0.5, 0.75).refreshBody();

    //Plataformas movibles
    this.mobilePlatforms = this.physics.add.staticGroup();
    //this.mobilePlatform = this.physics.add.staticSprite(width / 2, 300, "ground");
    this.mobilePlatforms
      .create(width - 100, 125, "ground")
      .setScale(0.25, 0.5)
      .refreshBody();
    this.mobilePlatforms
      .create(100, 125, "ground")
      .setScale(0.25, 0.5)
      .refreshBody();
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
        },
      });
    });

    //---------------------------JUGADOR---------------------------------
    this.player = new Player(this, width / 2, 450, "rick", "Luis", 0);
    this.cursors = this.input.keyboard.createCursorKeys();

    //---------------------------KEYBINDS------------------------------------
    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );

    //--------------------------PUNTUACIÓN-----------------------------------
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#FFFF",
    });

    //-----------------------------------ANIMACIONES----------------------------------
    createAnimations("rick", this);

    //-------------------------------CONSUMIBLES---------------------------------
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 6,
      setXY: { x: 12, y: 0, stepX: width / 7 },
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
      function () {
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
      (player, bomb) => player.hitBomb(),
      null,
      this
    );
    this.physics.add.collider(
      this.player,
      this.lava,
      (player) => player.hitBomb(),
      null,
      this
    );
  }

  update() {
    // Reproducir la música de fondo
    if (!this.level1Music) {
      this.level1Music = this.sound.add("level1-music", { loop: true });
      this.level1Music.play();
    }

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

    if (this.nextStage) {
      // Detener la música
      if (this.level1Music) {
        this.level1Music.stop();
      }
      return this.scene.start("Scene2", {
        score: this.score,
        player: this.player,
      });
    }

    playerMovement(this.player, this.cursors, this.shootKey, "rick");

    //this.updateBackgroundPosition();

    // this.enemies.children.iterate((enemy) => {
    //   if (enemy) {
    //     enemy.move();
    //   }
    // });
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
    super({ key: "Scene2" });
    this.levelWidth = width * 2;
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
    if (this.score >= 50) {
      this.nextStage = true;
    }
  }

  init(data) {
    this.gameOver = false;
    if (data.reset) {
      this.score = 0;
    }
  }

  preload() {
    this.load.audio("level2-music", "assets/music/level2-music.mp3");
    this.load.image("sky", "assets/sky.gif");
    this.load.image("ground", "assets/platform.jpg");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
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
      let enemy = new Enemy(this, x, 0, "enemy"); // Crear instancia de Enemy
      this.enemies.add(enemy); // Agregar manualmente al grupo
    }

    this.enemies.children.iterate((enemy) => {
      if (enemy) {
        enemy.setCollideWorldBounds(true);
        enemy.setVelocityX(Phaser.Math.Between(-200, 200));
      }
    });

    //-----------------------------------ANIMACIONES----------------------------------
    createAnimations("rick", this);

    //----------------------------KEYBINDS-------------------------------
    this.cursors = this.input.keyboard.createCursorKeys();
    this.shootKey = this.input.keyboard.addKey(
      Phaser.Input.Keyboard.KeyCodes.X
    );

    //--------------------------PUNTUACIÓN-----------------------------------
    this.scoreText = this.add
      .text(16, 16, "Score: 0", {
        fontSize: "32px",
        fill: "#FFFF",
      })
      .setScrollFactor(0);

    //-------------------------------PLATAFORMAS--------------------------------
    this.platforms = this.physics.add.staticGroup();

    // Suelo
    this.platforms
      .create(0, 568, "ground")
      .setOrigin(0, 0)
      .setScale((width * 2) / 400, 2)
      .refreshBody();

    // Plataformas flotantes
    this.platforms
      .create(width * 2 * 0.2, height * 0.7, "ground")
      .setScale(1.2, 1)
      .refreshBody();
    this.platforms
      .create(width * 2 * 0.3, height * 0.3, "ground")
      .setScale(0.8, 1)
      .refreshBody();
    this.platforms
      .create(width * 2 * 0.45, height * 0.55, "ground")
      .setScale(1.3, 1)
      .refreshBody();
    this.platforms
      .create(width * 2 * 0.62, height * 0.3, "ground")
      .setScale(0.8, 1)
      .refreshBody();
    this.platforms
      .create(width * 2 * 0.65, height * 0.7, "ground")
      .setScale(0.6, 1)
      .refreshBody();
    this.platforms
      .create(width * 2 * 0.8, height * 0.55, "ground")
      .setScale(1.2, 1)
      .refreshBody();

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
    // Reproducir la música de fondo
    if (!this.level2Music) {
      this.level2Music = this.sound.add("level2-music", { loop: true });
      this.level2Music.play();
    }
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

    if (this.nextStage) {
      // Detener la música
      if (this.level2Music) {
        this.level2Music.stop();
      }
      return this.scene.start("FinalBossScene", {
        score: this.score,
        player: this.player,
      });
    }

    playerMovement(this.player, this.cursors, this.shootKey, "rick");

    //this.updateBackgroundPosition();
    //Falta rreglar esto
    try {
      this.enemies.children.iterate((enemy) => {
        if (enemy) {
          enemy.move();
        }
      });
    } catch (error) {
      console.log(error);
    }
  }
}

class FinalBossScene extends Phaser.Scene {
  constructor() {
    super({ key: "FinalBossScene" });
  }

  preload() {
    // Cargar la musica de fondo
    this.load.audio("bossMusic", "assets/music/boss-music.mp3");

    this.load.image("ground", "assets/platform.jpg");
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
    // Reproducir la música de fondo
    if (!this.bossMusic) {
      this.bossMusic = this.sound.add("bossMusic", { loop: true });
      this.bossMusic.play();
    }

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
        if (this.boss.health <= 0) {
          this.bossMusic.stop();
          this.scene.start("GameOverScene", { reset: true });
        }
        bullet.destroy();
      }
    );

    this.physics.add.collider(
      this.boss.fireballs,
      this.player,
      (player, fireball) => {
        player.receiveDamage(1);
        if (this.player.health <= 0) {
          this.bossMusic.stop();
          this.scene.start("GameOverScene", { reset: true });
        }
        fireball.destroy();
      }
    );
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
    if (cursors.shift.isDown && player.body.onFloor()) {
      player.run("left");
    }
    if (shootKey.isDown) {
      player.shoot("left");
    }
    player.lastDirection = "left";
  } else if (cursors.right.isDown) {
    player.setVelocityX(160);
    player.anims.play(`right${name}`, true);
    // Correr si esta en el suelo
    if (cursors.shift.isDown && player.body.onFloor()) {
      player.run("right");
    }

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
  scene: [MainScene, Scene2, GameOverScene, FinalBossScene],
};

const game = new Phaser.Game(config);
