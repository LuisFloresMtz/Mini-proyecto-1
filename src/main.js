const width = window.innerWidth;
const height = window.innerHeight;

class Player extends Phaser.Physics.Arcade.Sprite {
  constructor(scene, x, y, texture, nombre = "Jugador", score = 0) {
    super(scene, x, y, texture);

    scene.add.existing(this);
    scene.physics.add.existing(this);

    this.setBounce(0);
    this.setCollideWorldBounds(true);

    this.nombre = nombre;
    this.score = score;
    this.dashTimer = 0;
  }

  collectStar(star) {
    star.disableBody(true, true);
    this.scene.score += 10;
    this.scene.scoreText.setText("Score: " + this.scene.score);

    if (this.scene.stars.countActive(true) === 0) {
      this.scene.stars.children.iterate((child) => {
        child.enableBody(true, Phaser.Math.Between(0, width), 0, true, true);
        console.log(width);
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

  dash(side) {
    if (this.dashTimer === 0) {
      if (side === "left") this.x -= 50;
      else if (side === "right") this.x += 50;

      this.dashTimer = 1;
      setTimeout(() => (this.dashTimer = 0), 2000);
    }
  }
}

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

  preload() {
    this.load.image("sky", "assets/sky.png");
    this.load.image("ground", "assets/platform.png");
    this.load.image("star", "assets/star.png");
    this.load.image("bomb", "assets/bomb.png");
    this.load.spritesheet("dude", "assets/dude.png", {
      frameWidth: 32,
      frameHeight: 48,
    });
  }

  create() {
    this.add
      .image(0, 0, "sky")
      .setOrigin(0, 0)
      .setScale(width / 800, height / 600);

    this.platforms = this.physics.add.staticGroup(); //Crea el grupo de plataformas
    //Añade cada plataforma en su respectiva posición
    this.platforms.create(width/2, 568, "ground").setScale(2.5).refreshBody();
    this.platforms.create(width - 350, 400, "ground");
    this.platforms.create(350, 400, "ground");
    this.platforms.create(width - 300, 220, "ground");
    this.platforms.create(300, 220, "ground");
    
    //Creación de lava
    this.lava = this.physics.add.staticSprite(0, 600, "ground");
    this.lava.setScale(1,2);
    this.lava.displayWidth = width * 2;
    this.lava.setTint(0xff0000);
    this.lava.refreshBody();

    //Plataforma movible
    this.mobilePlatform = this.physics.add.staticSprite(width / 2, 300, "ground");
    this.mobilePlatform.setScale(0.25,0.5).refreshBody();
    this.tweens.add({
      targets: this.mobilePlatform,
      y: 50,
      duration: 3000,
      yoyo: true,
      repeat: -1,
      ease: "Linear",
      onUpdate: () => { 
        this.mobilePlatform.refreshBody();
    }
    });
    
    
    this.player = new Player(this, width/2, 450, "dude");

  //   this.physics.add.collider(this.player, this.mobilePlatform, function (player, mobilePlatform) {
  //     player.setVelocityY(0); // Evita que el jugador rebote raro
  //     player.y = mobilePlatform.y; // Mantiene al jugador sobre la plataforma
  // }, null, this);
  
    
    this.anims.create({
      key: "left",
      frames: this.anims.generateFrameNumbers("dude", { start: 0, end: 3 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.anims.create({
      key: "turn",
      frames: [{ key: "dude", frame: 4 }],
      frameRate: 20,
    });
    
    this.anims.create({
      key: "right",
      frames: this.anims.generateFrameNumbers("dude", { start: 5, end: 8 }),
      frameRate: 10,
      repeat: -1,
    });
    
    this.cursors = this.input.keyboard.createCursorKeys();
    
    // this.stars = this.physics.add.group({
    //   key: "star",
    //   repeat: 6,
    //   setXY: { x: 12, y: 0, stepX: width/7 },
    // });
    
    // this.stars.children.iterate((child) => {
    //   child.setBounce(1);
    //   child.setCollideWorldBounds(true);
    //   child.setVelocity(Phaser.Math.Between(-200, 200), 40);
    // });
    
    this.bombs = this.physics.add.group();
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
    
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
    this.physics.add.collider(this.player, this.platforms);
    //this.physics.add.collider(this.stars, this.platforms);
    this.physics.add.collider(this.bombs, this.platforms);
    // this.physics.add.overlap(
    //   this.player,
    //   this.stars,
    //   (player, star) => player.collectStar(star),
    //   null,
    //   this
    // );
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

    if (this.cursors.left.isDown) {
      this.player.setVelocityX(-160);
      this.player.anims.play("left", true);
      if (this.cursors.shift.isDown) this.player.dash("left");
    } else if (this.cursors.right.isDown) {
      this.player.setVelocityX(160);
      this.player.anims.play("right", true);
      if (this.cursors.shift.isDown) this.player.dash("right");
    } else {
      this.player.setVelocityX(0);
      this.player.anims.play("turn");
    }

    if (this.cursors.up.isDown && this.player.body.touching.down) {
      this.player.setVelocityY(-330);
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

const config = {
  type: Phaser.AUTO,
  width: width,
  height: height,
  physics: {
    default: "arcade",
    arcade: {
      gravity: { y: 300 },
      debug: false,
    },
  },
  scene: [MainScene, GameOverScene],
};

const game = new Phaser.Game(config);
