/*/ <reference path="phaser/phaser.d.ts"/*/
import Sound = Phaser.Sound;
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


    burn:Phaser.Sound;
    damage:Phaser.Sound;
    drown:Phaser.Sound;
    jump:Phaser.Sound;

    cursors:Phaser.CursorKeys;

    miraDerecha:boolean = false;
    miraIzquierda:boolean = false;
    colisionando:boolean = false;

    counter:number = 0;

    timer = new Phaser.Timer(this);

    scoreText:Phaser.Text;
    livesText:Phaser.Text;
    stateText:Phaser.Text;

    TEXT_MARGIN = 5;
    PLAYER_DRAG = 300;
    PLAYER_VELOCITY_X = 300;
    PLAYER_ACCELERATION_Y = -300;
    ENEMY_VELOCITY_X = 150;
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
        this.game.physics.arcade.gravity.y = 800;
        this.game.cursors = this.input.keyboard.createCursorKeys();

        this.load.audio('jump', 'assets/jump.wav');
        this.load.audio('drown', 'assets/drown.wav');
        this.load.audio('burn', 'assets/burn.wav');
        this.load.audio('damage', 'assets/damage.wav');
    }

    create():void {
        super.create();
        var fondo;
        fondo = this.add.image(0, 0, 'fondo');

        this.createEnemies();
        this.createPlayer();
        this.createMap();
        this.crono();
        this.createTexts();
        this.createAudio();
    }

    createAudio(){
        this.game.burn = this.game.add.audio('burn');
        this.game.drown = this.game.add.audio('drown')
        this.game.damage = this.game.add.audio('damage')
        this.game.jump = this.game.add.audio('jump')
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
        this.game.tilemap.setCollisionBetween(238, 239, true, 'Lava');

        this.game.agua = this.game.tilemap.createLayer('Agua');
        this.game.physics.enable(this.game.agua, Phaser.Physics.ARCADE);
        this.game.tilemap.setCollisionBetween(0, 178, true, 'Agua');
    }

    /*PLAYER*/
    createPlayer(){
        var nouJugador = new Player(0, this.game, 500, 200, 'bird', 0);
        this.game.player = this.add.existing(nouJugador);

        this.game.player.body.collideWorldBounds = true;
        this.game.player.checkWorldBounds = true;
        this.game.player.anchor.setTo(0.5,0.5);

    }

    /*MOVIMIENTOS DEL PLAYER*/
    volarRight(){
        this.game.player.animations.add('bird',[0,1,2],20,true);
        this.game.player.animations.play('bird');

    }

    volarLeft(){
        this.game.player.animations.add('bird',[3,4,5],20,true);
        this.game.player.animations.play('bird');
    }

    upPlayer(){
        this.game.colisionando = false;
        this.game.jump.play();
        this.game.player.body.velocity.y= this.game.PLAYER_ACCELERATION_Y;
        if(this.game.miraDerecha){
            this.volarRight();
        }else if (this.game.miraIzquierda){
            this.volarLeft();
        }
    }

    movePlayer(){
        if (this.game.cursors.left.isDown) {
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.game.player.body.velocity.x = -this.game.PLAYER_VELOCITY_X;
            this.game.miraDerecha = false;
            this.game.miraIzquierda = true;
        }else if (this.game.cursors.right.isDown) {
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.game.player.body.velocity.x = this.game.PLAYER_VELOCITY_X;
            this.game.miraIzquierda = false;
            this.game.miraDerecha = true;

        }else {
            this.game.player.body.velocity.x = 0;
        }

        if(this.game.cursors.right.isDown && this.game.colisionando){
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.game.miraIzquierda = false;
            this.game.miraDerecha = true;
            this.game.player.frame = 1

        }else if(this.game.cursors.left.isDown && this.game.colisionando){
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.game.miraDerecha = false;
            this.game.miraIzquierda = true;
            this.game.player.frame = 4

        }else if(this.game.miraDerecha && !this.game.colisionando){
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.volarRight();

        }else if(this.game.miraIzquierda && !this.game.colisionando){
            console.log(this.game.miraIzquierda+ "+" +this.game.miraDerecha);
            this.volarLeft();
        }

        this.game.input.onTap.addOnce(this.upPlayer,this);
    }

    /*ENEMIGOS*/
    createEnemies(){
        this.game.enemies = this.add.group();
        for (var i=0; i<20;i++){
            var enemy = new Enemy(this.game, Math.floor(Math.random()*1024),Math.floor(Math.random()*570),
                'birdYellow', 0);
            this.game.add.existing(enemy);
            this.game.enemies.add(enemy)
        }

    }

    resetEnemy(enemy:Phaser.Sprite) {
        enemy.rotation = this.game.physics.arcade.angleBetween(enemy, this.game.player);
    }


    /*TEXTOS*/
    createTexts() {

        var width = this.scale.bounds.width;
        var height = this.scale.bounds.height;
        //Text que indica la puntuació del player
        this.game.scoreText = this.game.add.text(this.game.TEXT_MARGIN, this.game.TEXT_MARGIN, 'Puntuación: ' + this.game.player.getScore(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.scoreText.fixedToCamera = true;

        this.game.livesText = this.game.add.text(900, this.game.TEXT_MARGIN, 'Vidas: ' + this.game.player.getLives(), {
            font: "30px Arial",
            fill: "#ffffff"
        });
        this.game.livesText.fixedToCamera = true;


        this.game.stateText = this.add.text(width / 2, height / 2, '', {font: '75px Arial', fill: '#000000'});
        this.game.stateText.anchor.setTo(0.5, 0.5);
        this.game.stateText.fixedToCamera = true;
    }

    crono(){
        this.game.timer.loop(Phaser.Timer.SECOND, this.updateTimer, this);
        this.game.timer.start();
    }

    updateTimer(){
        this.game.counter++;
    }

    /*COLISIONES Y EVENTOS*/
    colisionNormal(){
        this.game.colisionando = true;
    }

    colisiones(){
        this.physics.arcade.collide(this.game.player, this.game.plataformas, this.colisionNormal, null, this);
        this.physics.arcade.collide(this.game.player, this.game.suelo, this.colisionNormal, null, this);
        this.physics.arcade.collide(this.game.player, this.game.agua, this.playerTouchesAgua, null, this);
        this.physics.arcade.collide(this.game.player, this.game.lava, this.playerTouchesLava, null, this);

        this.physics.arcade.collide(this.game.player, this.game.enemies, this.playerTouchesEnemy, null, this);
        this.physics.arcade.collide(this.game.enemies, this.game.enemies, this.resetEnemy, null, this);
        this.physics.arcade.collide(this.game.enemies, this.game.plataformas);
        this.physics.arcade.collide(this.game.enemies, this.game.suelo);
        this.physics.arcade.collide(this.game.enemies, this.game.agua);
        this.physics.arcade.collide(this.game.enemies, this.game.lava, this.enemyTouchesLava, null, this);
    }

    playerTouchesEnemy(player:Player, enemy:Enemy){
        console.log(this.game.player.health);
        this.game.damage.play();
        enemy.kill();
        this.blink(player);
        this.game.player.lives -= 1;
        this.game.player.notify();

        if (this.game.player.lives == 0){
            this.gameOver()
        }
    }

    playerTouchesLava(player:Player,lava:Phaser.TilemapLayer){
        this.game.burn.play();
        this.blink(player);
        this.gameOverLava();
    }

    playerTouchesAgua(player:Player,agua:Phaser.TilemapLayer){
        this.game.drown.play();
        this.blink(player);
        this.gameOverAgua();
    }

    enemyTouchesLava(enemy:Enemy, lava:Phaser.TilemapLayer){
        this.game.burn.play();
        this.blink(enemy);
        enemy.kill();

    }
    enemyTouchesAgua(enemy:Enemy,agua:Phaser.TilemapLayer){
        this.game.drown.play();
        this.blink(enemy);
        enemy.kill();
    }

    /*TWEENS Y MUSICA*/
    blink(sprite:Phaser.Sprite) {
        var tween = this.add.tween(sprite)
            .to({alpha: 0.5}, 100, Phaser.Easing.Bounce.Out)
            .to({alpha: 1.0}, 100, Phaser.Easing.Bounce.Out);

        tween.repeat(5);
        tween.start();
    }


    /*UPDATE*/
    update():void {
        super.update();
        this.movePlayer();
        this.colisiones();
        this.updateTimer();
    }

    /*FIN DEL JUEGO Y RESTART*/
    gameOver(){
        console.log("gameover");
        this.game.timer.pause();
        this.game.player.kill();
        this.game.stateText.setText(" LOS PAJAROS LOCOS \n ACABARON CONTIGO! \n Has aguantado vivo "+this.game.counter+" \n vueltas.\n Click para empezar otra vez!");
        this.game.stateText.visible = true;
        this.game.counter = 0;
        this.input.onTap.addOnce(this.restart, this);
    }

    gameOverLava(){
        console.log("gameoverlava");
        this.game.timer.pause();
        this.game.player.kill();
        this.game.stateText.setText(" TE QUEMASTE!! \n Has aguantado vivo "+this.game.counter+"\n vueltas. \n Click para empezar otra vez!");
        this.game.stateText.visible = true;
        this.game.counter = 0;
        this.input.onTap.addOnce(this.restart, this);
    }

    gameOverAgua(){
        console.log("gameoveragua");
        this.game.timer.pause();
        this.game.player.kill();
        this.game.stateText.setText(" LOS PÁJAROS NO NADAN!! \n Has aguantado vivo "+this.game.counter+" \n vueltas.\n Click para empezar otra vez!");
        this.game.stateText.visible = true;
        this.game.counter = 0;
        this.input.onTap.addOnce(this.restart, this);
    }

    restart(){
        this.game.state.restart();
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
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.score=score;
        this.health = this.lives;
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
        this.game.physics.enable(this, Phaser.Physics.ARCADE);
        this.health=1;
        this.checkWorldBounds = true;
        this.anchor.setTo(0.5,0.5);
        this.VELOCITY_X = this.game.ENEMY_VELOCITY_X;
        this.body.velocity.setTo(this.VELOCITY_X);

        this.animations.add('birdYellow',[0,1,2],20,true);
        this.animations.play('birdYellow');
    }

    update(){
        super.update();
        this.events.onOutOfBounds.add(this.resetEnemy, this);
        this.game.physics.arcade.velocityFromAngle(this.angle, this.VELOCITY_X, this.body.velocity);
    }

    resetEnemy(enemy:Phaser.Sprite) {
        enemy.rotation = this.game.physics.arcade.angleBetween(enemy, this.game.player);
    }
}
