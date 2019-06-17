        const FPS = 30; 
        const GAME_LIVES=3;
        const STONE_JAG = 0.4; 
        const STONE_NUM = 2; 
        const STONE_SIZE = 100; 
        const STONE_SPD = 50; 
        const STONE_VERT = 10;
        const STONES_PTS_LARGE = 20;
        const STONES_PTS_MED = 50;
        const STONES_PTS_SML = 100; 
        const CANNON_BLINK_DUR = 0.1; 
        const CANNON_EXPLODE_DUR = 0.3; 
        const LASER_EXPLODE_DUR = 0.3;
        const CANNON_INV_DUR = 3; 
        const CANNON_SIZE = 30;
        const CANNON_THRUST = 5; 
        const CANNON_TURN_SPD = 360; 
        const SHOW_BOUNDING = false; 
        const SHOW_CENTRE_DOT = false; 
        const LASER_MAX = 10000000000000000;
        const LASER_SPD = 500;
        const TEXT_FADE_TIME = 2.5;
        const TEXT_SIZE = 700;
        const SAVE_KEY_SCOE = "highscore";

        /** @type {HTMLCanvasElement} */
        var canv = document.getElementById("gameCanvas");
        var ctx = canv.getContext("2d");


        var level,lives,stones,cannon,score,scoreHigh,text1,textAlpha;
        newGame();
       
        var cannon = newCannon();
        var background = new Image();
        background.src = 'background.gif'

      
        var stones = [];
        createStones();


        document.addEventListener("keydown", keyDown);
        document.addEventListener("keyup", keyUp);

        // set up the game loop
        setInterval(update, 1000 / FPS);

        function createStones() {

            stones = [];
            var x, y;
            for (var i = 0; i < STONE_NUM + level; i++) {
                // random astestone location (not touching spacecannon)
                do {
                    x = Math.floor(Math.random() * canv.width);
                    y = Math.floor(Math.random() * canv.height);
                } while (distBetweenPoints(cannon.x, cannon.y, x, y) < STONE_SIZE * 2 + cannon.r);
                stones.push(newStone(x, y, Math.ceil(STONE_SIZE/2)));
            }
        }


        function destroyStone(index){

            var x= stones[index].x;
            var y= stones[index].y;
            var r= stones[index].r;

            if(r==Math.ceil(STONE_SIZE/2)){
                stones.push(newStone(x,y,Math.ceil(STONE_SIZE/4)));
                stones.push(newStone(x,y,Math.ceil(STONE_SIZE/4)));
                score+=STONES_PTS_LARGE;

            }

            else if(r==Math.ceil(STONE_SIZE/4)){

                stones.push(newStone(x,y,Math.ceil(STONE_SIZE/8)));
                stones.push(newStone(x,y,Math.ceil(STONE_SIZE/8)));
                score+=STONES_PTS_MED;
            } else{
                score+=STONES_PTS_SML;

            }

            if(score>scoreHigh){
                scoreHigh=score;
                localStorage.setItem(SAVE_KEY_SCOE, scoreHigh);
            }

            stones.splice(index,1);

            if(stones.length==0){
                level++;
                newLevel();
            }

        }

        function distBetweenPoints(x1, y1, x2, y2) {
            return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
        }

        function drawCannon(x,y,a){
            ctx.strokeStyle = "white";
                    ctx.lineWidth = CANNON_SIZE / 20;
                    ctx.beginPath();
                    ctx.moveTo( // nose of the cannon
                        x + 4 / 3 * cannon.r * Math.cos(a),
                        y - 4 / 3 * cannon.r * Math.sin(a)
                    );
                    ctx.lineTo( // rear left
                        x - cannon.r * (2 / 3 * Math.cos(a) + Math.sin(a)),
                        y + cannon.r * (2 / 3 * Math.sin(a) - Math.cos(a))
                    );
                    ctx.lineTo( // rear right
                        x - cannon.r * (2 / 3 * Math.cos(a) - Math.sin(a)),
                        y + cannon.r * (2 / 3 * Math.sin(a) + Math.cos(a))
                    );
                    ctx.closePath();
                    ctx.stroke();
        }

        function explodeCannon() {
            cannon.explodeTime = Math.ceil(CANNON_EXPLODE_DUR * FPS);
        }

        

       function keyDown(/** @type {KeyboardEvent} */ ev) {

        if(cannon.dead){
            return;
        }
            switch(ev.keyCode) {
                case 37: // left arrow (rotate cannon left)
                    shootLaser();
                  
                    cannon.x -= 10;
                    break;
                case 39: // right arrow (rotate cannon right)
                    shootLaser();
                    
                    cannon.x+= 10;
                    break;
            }
        }

        function keyUp(/** @type {KeyboardEvent} */ ev) {

            if(cannon.dead){
                return;
            }
            switch(ev.keyCode) {
                case 37: // left arrow (stop rotating left)
                    shootLaser();
                    
                 
                case 39: // right arrow (stop rotating right)
                     shootLaser();
                    
                
            }
        }

        function newStone(x, y, r) {
             
            var levelMult = 1 + 0.1 * level;
            var stone = {
                x: Math.random()* canv.width ,
                y: 0,
                xv: 0,
                yv: Math.random()* STONE_SPD/FPS * 3,
                a: Math.random() * Math.PI * 2, // in radians
                r: r,
                offs: [],
                vert: Math.floor(Math.random() * (STONE_VERT + 1) + STONE_VERT / 2)
            };

            // populate the offsets array
            for (var i = 0; i < stone.vert; i++) {
                stone.offs.push(Math.random() * STONE_JAG * 2 + 1 - STONE_JAG);
            }

            return stone;
        }



         function newGame(){
            level=0;
            lives = GAME_LIVES;
            score=0;

            var scoreStr = localStorage.getItem(SAVE_KEY_SCOE);
            if(scoreStr == null){
                scoreHigh=0;
            }
            else{
                scoreHigh = parseInt(scoreStr);
            }
            cannon = newCannon();
            newLevel();
            
            }

            function newLevel(){
                text = "Level " + (level+1);
                textAlpha = 1.0;
                createStones();
            }


        function newCannon() {
            return {
                 x: canv.width/2,
                y: canv.height-20,
                a: 90 / 180 * Math.PI,
                r: CANNON_SIZE / 2,
                blinkNum: Math.ceil(CANNON_INV_DUR / CANNON_BLINK_DUR),
                blinkTime: Math.ceil(CANNON_BLINK_DUR * FPS),
                explodeTime: 0,
                lasers: [],
                rot: 0,
                thrusting: false,
                canShoot : true,
                dead: false,
                thrust: {
                    x: 0,
                    y: 0
                }
            }
        }

        function shootLaser(){
        if(cannon.canShoot && cannon.lasers.length<LASER_MAX){
           cannon.lasers.push({
                x:cannon.x + 4 / 3 * cannon.r * Math.cos(cannon.a),
                y:cannon.y - 4 / 3 * cannon.r * Math.sin(cannon.a),
                xv: LASER_SPD*Math.cos(cannon.a)/FPS,
                yv: -LASER_SPD*Math.sin(cannon.a)/FPS,
                dist:0,
                explodeTime: 0

           });
        }

        
        }

        function gameOver(){
            cannon.dead = true;
            text = "GameOver";
            textAlpha=1.0;
            
            newGame();

        }

        function update() {
            var blinkOn = cannon.blinkNum % 2 == 0;
            var exploding = cannon.explodeTime > 0;

            // draw space
            ctx.fillStyle = "black";
            ctx.drawImage(background,0,0);

            // draw the astestones
            var a, r, x, y, offs, vert;
            for (var i = 0; i < stones.length; i++) {
                ctx.fillStyle="slategrey";
                ctx.strokeStyle = "slategrey";
                ctx.lineWidth = CANNON_SIZE / 20;

                // get the astestone properties
                a = stones[i].a;
                r = stones[i].r;
                x = stones[i].x;
                y = stones[i].y;
                offs = stones[i].offs;
                vert = stones[i].vert;
                
                // draw the path
                ctx.beginPath();
                ctx.moveTo(
                    x + r * offs[0] * Math.cos(a),
                    y + r * offs[0] * Math.sin(a)
                );

                // draw the polygon
                for (var j = 1; j < vert; j++) {
                    ctx.lineTo(
                        x + r * offs[j] * Math.cos(a + j * Math.PI * 2 / vert),
                        y + r * offs[j] * Math.sin(a + j * Math.PI * 2 / vert)
                    );
                }
                ctx.closePath();
                ctx.fill();
                ctx.stroke();

                // show astestone's collision circle
                if (SHOW_BOUNDING) {
                    ctx.strokeStyle = "lime";
                    ctx.beginPath();
                    ctx.arc(x, y, r, 0, Math.PI * 2, false);
                    ctx.stroke();
                }
            }
            
            
            if (!exploding) {
                if (blinkOn && !cannon.dead) {
                    drawCannon(cannon.x,cannon.y,cannon.a);
                }

                // handle blinking
                if (cannon.blinkNum > 0) {

                    // reduce the blink time
                    cannon.blinkTime--;

                    // reduce the blink num
                    if (cannon.blinkTime == 0) {
                        cannon.blinkTime = Math.ceil(CANNON_BLINK_DUR * FPS);
                        cannon.blinkNum--;
                    }
                }
            } else {
               
                ctx.fillStyle = "darkred";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r * 1.7, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "red";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r * 1.4, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "orange";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r * 1.1, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "yellow";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r * 0.8, 0, Math.PI * 2, false);
                ctx.fill();
                ctx.fillStyle = "white";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r * 0.5, 0, Math.PI * 2, false);
                ctx.fill();
            }

          
            if (SHOW_BOUNDING) {
                ctx.strokeStyle = "lime";
                ctx.beginPath();
                ctx.arc(cannon.x, cannon.y, cannon.r, 0, Math.PI * 2, false);
                ctx.stroke();
            }
            
        
            if (SHOW_CENTRE_DOT) {
                ctx.fillStyle = "red";
                ctx.fillRect(cannon.x - 1, cannon.y - 1, 2, 2);
            }


            for(var i=0;i<cannon.lasers.length;i++){
                ctx.fillStyle="red";
                ctx.beginPath();
                ctx.arc(cannon.lasers[i].x,cannon.lasers[i].y,CANNON_SIZE/15,0,Math.PI*2,false);

                ctx.fill();
            }


            if(textAlpha>=0){

                ctx.fillStyle = "rgba(255,255,255," + textAlpha + ")";
                ctx.font = "large-caps" + "10px sans-serif";
                ctx.textAlign="center";
                ctx.fillText(text,canv.width/2,canv.height/2);
                textAlpha -=(1.0/TEXT_FADE_TIME/FPS);

            } else if(cannon.dead){
                newGame();
            }

            for( var i=0; i< lives; i++){
                drawCannon(CANNON_SIZE + i*CANNON_SIZE*1.2, CANNON_SIZE,0.5*Math.PI);

            }


            ctx.textAlign = "right";
            ctx. fillStyle = "white";
            ctx.font = "30px sans-serif";
            ctx.fillText(score, canv.width - CANNON_SIZE/2,CANNON_SIZE);

            ctx.textAlign = "center";
            ctx. fillStyle = "white";
            ctx.font = "large-caps" + "30px sans-serif";
            ctx.fillText("HIGH: " + scoreHigh, canv.width/2, CANNON_SIZE);


            var ax,ay,lx,ly;

            for(var i=stones.length-1;i>=0;i--){
                ax=stones[i].x;
                ay=stones[i].y;
                ar=stones[i].r;

                for(var j=cannon.lasers.length - 1;j>=0;j--){

                    lx=cannon.lasers[j].x;
                    ly=cannon.lasers[j].y;

                    if(cannon.lasers[j].explodeTime == 0 &&distBetweenPoints(ax,ay,lx,ly)<ar){

                        cannon.lasers.splice(j,1);

                        destroyStone(i);
                        cannon.lasers[j].explodeTime=Math.ceil(LASER_EXPLODE_DUR*FPS);
                        break;

                    }
                }
            }

           
            if (!exploding) {

                
                if (cannon.blinkNum == 0 && !cannon.dead) {
                    for (var i = 0; i < stones.length; i++) {
                        if (distBetweenPoints(cannon.x, cannon.y, stones[i].x, stones[i].y) < cannon.r + stones[i].r) {
                            explodeCannon();
                            destroyStone(i);
                            break;
                        }
                    }
                }


                
                cannon.x += cannon.thrust.x;
                cannon.y += cannon.thrust.y;
            } else {
                
                cannon.explodeTime--;

                
                if (cannon.explodeTime == 0) {
                   
                    lives--;
                    if(lives==0){
                        gameOver();
                    }
                    else{
                         cannon = newCannon();
                    }
                }
            }

           
             if (cannon.x < 30 - cannon.r) {
                cannon.x = cannon.r;
            } else if (cannon.x > canv.width + cannon.r) {
                cannon.x =canv.width-20;
            }
            if (cannon.y < 0 - cannon.r) {
                cannon.y = canv.height + cannon.r;
            } else if (cannon.y > canv.height + cannon.r) {
                cannon.y = 0 - cannon.r;
            }



            for(var i=0;i<cannon.lasers.length;i++){

               
                cannon.lasers[i].x += cannon.lasers[i].xv;
                cannon.lasers[i].y += cannon.lasers[i].yv;

                 }
            

            for (var i = 0; i < stones.length; i++) {
                stones[i].x += stones[i].xv;
                stones[i].y += stones[i].yv;

                if(stones[i].y>canv.height){
                    explodeCannon();

                    destroyStone(i);
                    lives--;
                     if(lives==0){
                        gameOver();
                    }
                    continue;
                            }         
        
            }
        }