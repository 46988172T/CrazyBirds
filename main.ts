/// <reference path="phaser/phaser.d.ts"/
window.onload = () => {
    new CrazyBirds();
};

class CrazyBirds extends Phaser.Game{
    enemies:Phaser.Group;
    player:Player;

    tilemap:Phaser.Tilemap;
    plataformas:Phaser.TilemapLayer;
    lava:Phaser.TilemapLayer;
    suelo:Phaser.TilemapLayer;
    agua:Phaser.TilemapLayer;
    decoracion:Phaser.TilemapLayer;

    cursors:Phaser.CursorKeys;

    miraDerecha:boolean = false;
    miraIzquierda:boolean = false;
    colisionando:boolean = false;

    scoreText:Phaser.Text;
    livesText:Phaser.Text;

    TEXT_MARGIN = 5;
    PLAYER_DRAG = 300;
    PLAYER_VELOCITY_X = 300;
    PLAYER_ACCELERATION_Y = -300;
    ENEMY_VELOCITY_X = 300;
    ENEMY_ACCELERATION_Y = -50;

    constructor() {
        super(1024, 768, Phaser.CANVAS, 'gameDiv');

        this.state.add('main', mainState);
        this.state.start('main');
    }
}

class mainState extends Phaser.State {
    game:CrazyBirds;

    preload():void {
        super.preload();
        this.load.image('fondo', 'assets/fondo.jpg');
        this.load.tilemap('tilemap', 'assets/juego.json', null, Phaser.Tilemap.TILED_JSON);
        this.load.image('tiles', 'assets/minecraft.png');
        this.load.spritesheet('bird', 'assets/bird.png', 34, 24, 6);
        this.load.spritesheet('birdYellow', 'assets/birdYellow.png', 34, 24, 6);

        this.game.physics.startSystem(Phaser.Physics.ARCADE);
        this.game.cursors = this.input.keyboard.createCursorKeys();
    }

    create():void {
        super.create();
        this.createMap()
    }

    createMap(){
        /*Elementos de mapa*/
            this.game.tilemap = this.game.add.tilemap('tilemap');
            this.game.tilemap.addTilesetImage('minecraft', 'tiles');


            this.game.plataformas = this.game.tilemap.createLayer('Plataformas');
            this.game.physics.enable(this.game.plataformas, Phaser.Physics.ARCADE);
            this.game.tilemap.setCollisionBetween(7, 17, true, 'Plataformas');

            this.game.decoracion = this.game.tilemap.createLayer('Decoracion');

            this.game.suelo = this.game.tilemap.createLayer('Suelo');
            this.game.physics.enable(this.game.suelo, Phaser.Physics.ARCADE);
            this.game.tilemap.setCollisionBetween(3, 4, true, 'Suelo');

            this.game.lava = this.game.tilemap.createLayer('Lava');
            this.game.physics.enable(this.game.lava, Phaser.Physics.ARCADE);
            //this.game.tilemap.setCollisionBetween(238, 239, true, 'Lava');

            this.game.agua = this.game.tilemap.createLayer('Agua');
            this.game.physics.enable(this.game.agua, Phaser.Physics.ARCADE);
            //this.game.tilemap.setCollisionBetween(178, null, true, 'Agua');
    }
    

    update():void {
        super.update()

    }


    gameOver(){
        this.restart();
    }

    restart(){

    }
}


interface Publisher{ //publicador
    suscribe(displayStats);
    notify();
}
class Player extends Phaser.Sprite implements Publisher{
    game:CrazyBirds;
    score:number;
    lives = 10;
    displayStats:DisplayStats;

    constructor(score:number, game:CrazyBirds, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture,
                frame:string|number){
        super(game, x, y, key, frame);
        this.game = game;
        this.score=score;
        this.health = this.lives;

        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.body.collideWorldBounds = true;
        this.checkWorldBounds = true;
        this.body.allowGravity = true;
        this.anchor.setTo(0.5,0.5);
        this.body.drag.setTo(this.game.PLAYER_DRAG, this.game.PLAYER_DRAG);
        this.animations.add('bird',[0,1,2],20,true);
        this.animations.play('bird');

        this.displayStats = new DisplayStats(this);
    }

    suscribe(displayStats:DisplayStats){
        this.displayStats = displayStats;
    }

    notify(){
        this.displayStats.updateStats(this.getScore(), this.getLives());
    }

    getScore():number{
        return this.score;
    }

    getLives():number{
        return this.lives;
    }
}

interface Observer{ //observer
    updateStats(points:number, lives:number);
}

class DisplayStats implements Observer { //display
    game:CrazyBirds;
    points:number;
    lives:number;
    player:Player;

    constructor(player:Player) {
        this.player = player;
        this.player.suscribe(this);
        this.game = this.player.game;
        this.points = this.player.score;
        this.lives = this.player.lives;
    }

    public displayData() {
        this.game.scoreText.setText('Puntuación: ' + this.points);
        this.game.livesText.setText('Vidas: ' + this.lives);
    }

    updateStats(points:number, lives:number) {
        this.points = points;
        this.lives = lives;
        this.displayData();
    }
}

class Enemy extends Phaser.Sprite {
    game:CrazyBirds;
    VELOCITY_X:number;
    ACCELERATION_Y = this.game.ENEMY_ACCELERATION_Y;
    direction:number;

    constructor(game:CrazyBirds, x:number, y:number, key:string|Phaser.RenderTexture|Phaser.BitmapData|PIXI.Texture,
                frame:string|number){
        super(game, x, y, key, frame);
        this.game = game;
        this.health=1;
        this.anchor.setTo(0.5,0.5);
        this.checkWorldBounds = true;

        this.animations.add('birdYellow',[0,1,2],20,true);
        this.animations.play('birdYellow');
    }

    update(){
        super.update();
        this.VELOCITY_X = this.game.ENEMY_VELOCITY_X;
        this.events.onOutOfBounds.add(this.resetEnemy, this);
        this.game.physics.arcade.velocityFromAngle(this.angle, this.VELOCITY_X, this.body.velocity);
    }

    resetEnemy(enemy:Phaser.Sprite) {
        enemy.rotation = this.game.physics.arcade.angleBetween(enemy, this.game.player);
    }
}
