// 蛋仔乐园 - 游戏主逻辑
// Phaser 3 游戏配置和场景管理

// 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-canvas',
    width: 800,
    height: 600,
    backgroundColor: '#87CEEB',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 800 },
            debug: false
        }
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 800,
        height: 600
    },
    dom: {
        createContainer: true
    }
};

// 全局游戏变量
let game;
let player;
let platforms;
let stars;
let cursors;
let score = 0;
let scoreText;
let isMobile = false;
let virtualJoystick = { x: 0, y: 0 };
let isJumping = false;

// 游戏状态
const GameState = {
    PRELOAD: 0,
    PLAYING: 1,
    PAUSED: 2,
    GAME_OVER: 3
};
let gameState = GameState.PRELOAD;

// 初始化游戏
function initGame() {
    game = new Phaser.Game(config);
    detectMobile();
    setupEventListeners();
}

// 检测移动设备
function detectMobile() {
    isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
    console.log('移动设备检测:', isMobile ? '是移动设备' : '不是移动设备');
}

// 设置事件监听器
function setupEventListeners() {
    // 虚拟摇杆事件
    const joystickBase = document.querySelector('.virtual-joystick-container');
    const joystickHandle = document.querySelector('.virtual-joystick-handle');

    if (joystickBase && joystickHandle) {
        let isTouching = false;

        joystickBase.addEventListener('touchstart', (e) => {
            e.preventDefault();
            isTouching = true;
            updateJoystick(e, joystickHandle, joystickBase);
        });

        joystickBase.addEventListener('touchmove', (e) => {
            if (isTouching) {
                e.preventDefault();
                updateJoystick(e, joystickHandle, joystickBase);
            }
        });

        joystickBase.addEventListener('touchend', () => {
            isTouching = false;
            resetJoystick(joystickHandle);
        });

        // 鼠标事件（桌面调试用）
        joystickBase.addEventListener('mousedown', (e) => {
            e.preventDefault();
            isTouching = true;
            updateJoystick(e, joystickHandle, joystickBase);
        });

        document.addEventListener('mousemove', (e) => {
            if (isTouching) {
                updateJoystick(e, joystickHandle, joystickBase);
            }
        });

        document.addEventListener('mouseup', () => {
            isTouching = false;
            resetJoystick(joystickHandle);
        });
    }

    // 跳跃按钮事件
    const jumpButton = document.querySelector('.action-button:nth-child(1)');
    if (jumpButton) {
        jumpButton.addEventListener('touchstart', (e) => {
            e.preventDefault();
            startJump();
        });

        jumpButton.addEventListener('touchend', (e) => {
            e.preventDefault();
            endJump();
        });

        jumpButton.addEventListener('mousedown', (e) => {
            e.preventDefault();
            startJump();
        });

        jumpButton.addEventListener('mouseup', (e) => {
            e.preventDefault();
            endJump();
        });

        jumpButton.addEventListener('mouseleave', () => {
            endJump();
        });
    }

    // 暂停按钮事件
    const pauseButton = document.querySelector('.pause-button');
    if (pauseButton) {
        pauseButton.addEventListener('click', togglePause);
    }

    // 开始按钮事件
    const startButton = document.querySelector('.menu-button');
    if (startButton) {
        startButton.addEventListener('click', startGame);
    }
}

// 更新虚拟摇杆
function updateJoystick(event, handle, base) {
    const rect = base.getBoundingClientRect();
    let clientX, clientY;

    if (event.touches) {
        clientX = event.touches[0].clientX;
        clientY = event.touches[0].clientY;
    } else {
        clientX = event.clientX;
        clientY = event.clientY;
    }

    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // 计算距离和角度
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    const maxDistance = rect.width / 2 - handle.offsetWidth / 2;
    const clampedDistance = Math.min(distance, maxDistance);

    if (distance > 0) {
        const angle = Math.atan2(deltaY, deltaX);
        const handleX = Math.cos(angle) * clampedDistance;
        const handleY = Math.sin(angle) * clampedDistance;

        // 更新手柄位置
        handle.style.transform = `translate(${handleX}px, ${handleY}px)`;

        // 计算虚拟摇杆输入（-1 到 1）
        virtualJoystick.x = handleX / maxDistance;
        virtualJoystick.y = handleY / maxDistance;
    }
}

// 重置虚拟摇杆
function resetJoystick(handle) {
    handle.style.transform = 'translate(0, 0)';
    virtualJoystick.x = 0;
    virtualJoystick.y = 0;
}

// 开始跳跃
function startJump() {
    isJumping = true;
}

// 结束跳跃
function endJump() {
    isJumping = false;
}

// 切换暂停状态
function togglePause() {
    if (gameState === GameState.PLAYING) {
        game.scene.pause();
        gameState = GameState.PAUSED;
        showPauseMenu();
    } else if (gameState === GameState.PAUSED) {
        game.scene.resume();
        gameState = GameState.PLAYING;
        hidePauseMenu();
    }
}

// 显示暂停菜单
function showPauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.style.display = 'block';
    }
}

// 隐藏暂停菜单
function hidePauseMenu() {
    const pauseMenu = document.getElementById('pause-menu');
    if (pauseMenu) {
        pauseMenu.style.display = 'none';
    }
}

// 开始游戏
function startGame() {
    const startMenu = document.querySelector('.start-menu');
    if (startMenu) {
        startMenu.style.display = 'none';
    }
    gameState = GameState.PLAYING;
}

// Phaser 场景函数

function preload() {
    // 加载蛋仔角色精灵（临时使用图形）
    this.load.image('player', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjQiIGhlaWdodD0iNjQiIHZpZXdCb3g9IjAgMCA2NCA2NCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPGNpcmNsZSBjeD0iMzIiIGN5PSIzMiIgcj0iMzAiIGZpbGw9IiNGRjZDQkQiLz4KPGNpcmNsZSBjeD0iMjIiIGN5PSIyNCIgcj0iNCIgZmlsbD0iIzMzMzMzMyIvPgo8Y2lyY2xlIGN4PSI0MiIgY3k9IjI0IiByPSI0IiBmaWxsPSIjMzMzMzMzIi8+CjxwYXRoIGQ9Ik0yNCA0MEM0MCA0MCA0MCA0MCA0MCA0MCIgc3Ryb2tlPSIjMzMzMzMzIiBzdHJva2Utd2lkdGg9IjQiIHN0cm9rZS1saW5lY2FwPSJyb3VuZCIgc3Ryb2tlLWxpbmVqb2luPSJyb3VuZCIvPgo8L3N2Zz4K');

    // 加载平台图像
    this.load.image('platform', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjU2IiBoZWlnaHQ9IjMyIiB2aWV3Qm94PSIwIDAgMjU2IDMyIiBmaWxsPSJub25lIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPgo8cmVjdCB3aWR0aD0iMjU2IiBoZWlnaHQ9IjMyIiByeD0iOCIgZmlsbD0iI0E4RTZDRiIvPgo8L3N2Zz4K');

    // 加载星星图像
    this.load.image('star', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIiIGhlaWdodD0iMzIiIHZpZXdCb3g9IjAgMCAzMiAzMiIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KPHBhdGggZD0iTTE2IDJMMjAgMTJIMzBMMjIgMTlMMjYgMjhMMTYgMjJMNiAyOEwxMCAxOUwyIDEySDEyTDE2IDJaIiBmaWxsPSIjRkZEMTY2Ii8+Cjwvc3ZnPgo=');

    // 加载背景图像
    this.load.image('sky', 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iODAwIiBoZWlnaHQ9IjYwMCIgdmlld0JveD0iMCAwIDgwMCA2MDAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSI4MDAiIGhlaWdodD0iNjAwIiBmaWxsPSJ1cmwoI2dyYWQpIi8+CjxkZWZzPgo8bGluZWFyR3JhZGllbnQgaWQ9ImdyYWQiIHgxPSIwIiB5MT0iMCIgeDI9IjAiIHkyPSI2MDAiPgo8c3RvcCBvZmZzZXQ9IjAiIHN0b3AtY29sb3I9IiM4N0NFQkIiLz4KPHN0b3Agb2Zmc2V0PSIzMCUiIHN0b3AtY29sb3I9IiM5OEQ4RTgiLz4KPHN0b3Agb2Zmc2V0PSIxMDAlIiBzdG9wLWNsb3I9IiNCMEU2RkYiLz4KPC9saW5lYXJHcmFkaWVudD4KPC9kZWZzPgo8L3N2Zz4K');

    console.log('资源加载完成');
}

function create() {
    // 添加背景
    this.add.image(400, 300, 'sky').setDisplaySize(800, 600);

    // 创建平台组
    platforms = this.physics.add.staticGroup();

    // 创建地面平台
    platforms.create(400, 568, 'platform').setScale(2, 1).refreshBody();

    // 创建空中平台
    platforms.create(200, 450, 'platform').setScale(0.5, 1).refreshBody();
    platforms.create(600, 400, 'platform').setScale(0.5, 1).refreshBody();
    platforms.create(400, 300, 'platform').setScale(0.5, 1).refreshBody();
    platforms.create(100, 250, 'platform').setScale(0.4, 1).refreshBody();
    platforms.create(700, 200, 'platform').setScale(0.4, 1).refreshBody();

    // 创建玩家
    player = this.physics.add.sprite(100, 450, 'player');
    player.setBounce(0.2);
    player.setCollideWorldBounds(true);
    player.body.setSize(50, 50);
    player.setScale(0.8);

    // 创建星星组
    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 0, stepX: 70 }
    });

    stars.children.iterate((child) => {
        child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        child.setScale(0.7);
    });

    // 设置碰撞
    this.physics.add.collider(player, platforms);
    this.physics.add.collider(stars, platforms);

    // 星星收集事件
    this.physics.add.overlap(player, stars, collectStar, null, this);

    // 键盘控制
    cursors = this.input.keyboard.createCursorKeys();

    // 分数文本
    scoreText = this.add.text(16, 16, '分数: 0', {
        fontSize: '32px',
        fill: '#333',
        fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
        stroke: '#fff',
        strokeThickness: 4
    });

    // 控制提示
    const controlsText = this.add.text(400, 16, isMobile ? '使用虚拟摇杆和按钮控制' : '使用方向键和空格键控制', {
        fontSize: '24px',
        fill: '#333',
        fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
        stroke: '#fff',
        strokeThickness: 3
    }).setOrigin(0.5, 0);

    // 游戏状态设置为准备开始
    gameState = GameState.PLAYING;
    console.log('游戏场景创建完成');
}

function update() {
    if (gameState !== GameState.PLAYING) return;

    let velocityX = 0;

    // 移动控制
    if (isMobile) {
        // 虚拟摇杆控制
        velocityX = virtualJoystick.x * 200;

        // 跳跃控制
        if (isJumping && player.body.touching.down) {
            player.setVelocityY(-400);
        }
    } else {
        // 键盘控制
        if (cursors.left.isDown) {
            velocityX = -160;
        } else if (cursors.right.isDown) {
            velocityX = 160;
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-400);
        }
    }

    // 应用速度
    player.setVelocityX(velocityX);

    // 简单动画：根据速度旋转
    if (velocityX !== 0) {
        player.rotation += velocityX * 0.001;
    } else {
        // 缓慢回正
        player.rotation *= 0.9;
    }

    // 防止旋转过度
    if (Math.abs(player.rotation) > 0.5) {
        player.rotation = Phaser.Math.Clamp(player.rotation, -0.5, 0.5);
    }
}

// 收集星星函数
function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('分数: ' + score);

    // 更新网页上的分数显示
    const scoreElement = document.querySelector('.stat-value');
    if (scoreElement) {
        scoreElement.textContent = score;
    }

    // 如果所有星星都被收集，重新生成
    if (stars.countActive(true) === 0) {
        stars.children.iterate((child) => {
            child.enableBody(true, child.x, 0, true, true);
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });
    }
}

// 页面加载完成后初始化游戏
window.addEventListener('DOMContentLoaded', () => {
    // 隐藏开始菜单（如果存在）
    const startMenu = document.querySelector('.start-menu');
    if (startMenu) {
        startMenu.style.display = 'flex';
    }

    // 初始化游戏
    initGame();

    console.log('蛋仔乐园游戏初始化完成！');
});

// 导出全局变量（用于调试）
window.EggPartyGame = {
    game,
    player,
    score,
    togglePause,
    startGame
};