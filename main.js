const gameStartRef = document.querySelector(".game-start");
const gameScoreRef = document.querySelector(".game-score");
const gameAreaRef = document.querySelector(".game-area");
const gameOverRef = document.querySelector(".game-over");
const pointsRef = gameScoreRef.querySelector(".points");

gameStartRef.addEventListener("click", onGameStart);
document.addEventListener("keydown", onKeyDown);
document.addEventListener("keyup", onKeyUp);

const keys = {};
const player = {
    x: 50,
    y: 400,
    width: 0,
    height: 0,
    lastFireBall: 0
};
const game = {
    speed: 2,
    movingSpeed: 4,
    fireBallSpeed: 6,
    fireBallInterval: 1000,
    cloudInterval: 4000,
    bugInterval: 1000
};

const scene = {
    points: 0,
    lastCloud: 0,
    lastBug: 0,
    isActive: true
}

function onGameStart(e) {
    scene.isActive = true;
    gameStartRef.classList.add("hide");

    const wizard = document.createElement("div");
    wizard.classList.add("wizard");
    wizard.style.top = player.y + "px";
    wizard.style.left = player.x + "px";

    console.log(typeof(wizard.offsetWidth))
    gameAreaRef.appendChild(wizard);
    player.height = wizard.offsetHeight;
    player.width = wizard.offsetWidth;
    window.requestAnimationFrame(gameStart);
}

function gameStart(timestamp) {
    if (scene.points && scene.points % 1500 === 0) {
        game.speed += 1;
    }

    const wizard = document.querySelector(".wizard");
    const fireBallsRef = document.querySelectorAll(".fire-ball");
    const cloudRef = document.querySelectorAll(".cloud");
    const bugsRef = document.querySelectorAll(".bug");

    let gameAreaWidth = gameAreaRef.offsetWidth;
    let gameAreaHeight = gameAreaRef.offsetHeight;
    let wizardWidth = player.width + player.x;
    let wizardHeight = player.height + player.y;
    let inAir = player.y + player.height < gameAreaHeight;

    scene.points++;
    
    if (timestamp - scene.lastCloud > game.cloudInterval + 20000 * Math.random()) {
        scene.lastCloud = timestamp;
        addCloud();
    }
    if (timestamp - scene.lastBug > game.bugInterval + 20000 * Math.random()) {
        scene.lastBug = timestamp;
        addBug();
    } 

    fireBallsRef.forEach(fireBall => {
        fireBall.x += game.speed * game.fireBallSpeed;
        fireBall.style.left = fireBall.x + "px";
        if (fireBall.x + fireBall.offsetWidth > gameAreaWidth) {
            fireBall.remove();
        }
    })

    cloudRef.forEach(cloud => {
        cloud.x -= game.speed;
        cloud.style.left = cloud.x + "px";
        
        if(cloud.x < 0) {
            cloud.remove()
        }
    })

    bugsRef.forEach(bug => {
        bug.x -= game.speed * 2;
        bug.style.left = bug.x + "px"; 

        if (bug.x + bug.offsetWidth <= 0) {
            bug.remove();
        }

        if (isCollision(wizard, bug)) {
            gameOver();
        }

        fireBallsRef.forEach(fireBall => {
            if(isCollision(bug, fireBall)) {
                bug.remove();
                fireBall.remove();
                scene.points += 50;
            }
        })
    })

    if (inAir) {
        player.y += game.speed;
    }

    if(keys.Space && timestamp - player.lastFireBall > game.fireBallInterval) {
        wizard.classList.add("wizard-fire");
        addFireBall();
        isCollision(wizard, wizard)
        player.lastFireBall = timestamp;
    } else {
        wizard.classList.remove("wizard-fire");
    }

    if (keys.ArrowUp && player.y > 0) {
        player.y -= game.speed * game.movingSpeed;
    }
    if (keys.ArrowDown && wizardHeight < gameAreaHeight) {
        player.y += game.speed * game.movingSpeed;
    }
    if (keys.ArrowLeft && player.x > 0) {
        player.x -= game.speed * game.movingSpeed;
    }
    if (keys.ArrowRight && wizardWidth < gameAreaWidth) {
        player.x += game.speed * game.movingSpeed;
    }

    wizard.style.top = player.y + "px";
    wizard.style.left = player.x + "px";
    pointsRef.textContent = scene.points;
    if(scene.isActive) {
        window.requestAnimationFrame(gameStart);
    }
    
}

function addFireBall() {
    let fireBall = document.createElement("div");
    fireBall.classList.add("fire-ball");
    fireBall.style.top = (player.y + 28) + "px";
    fireBall.x = player.x + player.width;
    fireBall.style.left = fireBall.x + "px";
    gameAreaRef.appendChild(fireBall);
}

function addCloud() {
    let cloud = document.createElement("div");
    cloud.classList.add("cloud");
    cloud.x = gameAreaRef.offsetWidth - 200;
    cloud.style.left = cloud.x + "px";
    cloud.style.top = (gameAreaRef.offsetHeight - 300) * Math.random() + "px";
    gameAreaRef.appendChild(cloud);
}

function addBug() {
    let bug = document.createElement("div");
    bug.classList.add("bug"); 
    bug.y = (gameAreaRef.offsetHeight - 60) * Math.random();
    bug.x = gameAreaRef.offsetWidth - 60
    bug.style.left = bug.x + "px";
    bug.style.top = bug.y + "px";
    gameAreaRef.appendChild(bug);
} 

function onKeyUp(e) {
    keys[e.code] = false;
}

function onKeyDown(e) {
    keys[e.code] = true;
}

function isCollision(elementA, elementB) {
    let elARect = elementA.getBoundingClientRect();
    let elBRect = elementB.getBoundingClientRect();
    return !(elARect.top > elBRect.bottom || 
        elARect.bottom < elBRect.top || 
        elARect.right < elBRect.left || 
        elARect.left > elBRect.right)
}

function gameOver() {
    scene.isActive = false;
    gameOverRef.classList.remove("hide");
    gameOverRef.addEventListener("click", loadInitScreen)
}
function loadInitScreen() {
    gameOverRef.classList.add("hide");
    gameStartRef.classList.remove("hide");
    gameAreaRef.innerHTML = "";
    pointsRef.textContent = 0;
}