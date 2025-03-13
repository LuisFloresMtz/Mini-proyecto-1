

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
    this.itemCounter = 0;
  }

  collcectSpecial(item) {
    item.disableBody(true,true);
    this.scene.score += 100;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.scene.timerText.destroy();
  }

  collectStar(star) {
    star.disableBody(true, true);
    this.scene.score += 10;
    this.scene.scoreText.setText("Score: " + this.scene.score);
    this.itemCounter++;

    //Aparicion del item especial una vez agarró 10 items normales
    if(this.itemCounter == 5) {
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
    this.player = new Player(this, width/2, 450, "dude");
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
      
      //Creación de lava
      this.lava = this.physics.add.staticSprite(0, 600, "ground");
      this.lava.setScale(1,2);
      this.lava.displayWidth = width * 2;
      this.lava.setTint(0xff0000);
      this.lava.refreshBody();
      
      this.platforms = this.physics.add.staticGroup(); //Crea el grupo de plataformas
      //Añade cada plataforma en su respectiva posición
      this.platforms.create(width/2, 600, "ground").setScale(2.5).refreshBody();
      this.platforms.create(width - 400, 400, "ground");
      this.platforms.create(400, 400, "ground");
      this.platforms.create(width - 500, 220, "ground").setScale(0.5, 0.75).refreshBody();
      this.platforms.create(500, 220, "ground").setScale(0.5, 0.75).refreshBody();
      
      
      //Plataforma movible
      this.mobilePlatforms = this.physics.add.staticGroup(); //Crea el grupo de plataformas movibles
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
    
    
    //this.player = new Player(this, width/2, 450, "dude");
    
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
    
    //Creación de consumibles
    this.stars = this.physics.add.group({
      key: "star",
      repeat: 6,
      setXY: { x: 12, y: 0, stepX: width/7 },
    });
    
    //Agregar fisicas a los consumibles
    this.stars.children.iterate((child) => {
      child.setBounce(1);
      child.setCollideWorldBounds(true);
      child.setVelocity(Phaser.Math.Between(-200, 200), 40);
    });

    
    this.bombs = this.physics.add.group(); //Crea bombas
    this.scoreText = this.add.text(16, 16, "Score: 0", {
      fontSize: "32px",
      fill: "#000",
    });
    
    //Creacion de consumible especial
    this.specials = this.physics.add.staticGroup();
    this.specials.create(width - 100, 110, "star").setTint(0xff0000);
    this.specials.create(100, 110, "star").setTint(0xff0000);
    this.specials.children.iterate((child) => {
      child.disableBody(true, true);
    });

    
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

class Scene2 extends Phaser.Scene {
  constructor() {
    super({key: "Scene2"});
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

  }

  update() {

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
