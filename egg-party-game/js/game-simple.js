// 蛋仔乐园 - 最简版本
// 只包含Phaser框架 + 蛋仔显示 + 移动跳跃

// 游戏配置
const config = {
    type: Phaser.AUTO,
    parent: 'game-container',
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
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    input: {
        keyboard: true
    }
};

// 游戏变量
let player;
let platforms;
let apples = []; // 苹果数组，支持多个苹果
let winText; // 通关提示文本
let nextLevelButton; // 进入下一关按钮
let cursors;
let spaceKey;
let isGameStarted = false;
let isLevelComplete = false; // 关卡是否完成
let currentLevel = 1; // 当前关卡
let collectedApples = 0; // 已收集的苹果数量
let totalApples = 1; // 当前关卡总苹果数
let jumpCount = 0;
const maxJumps = 3;
const jumpForce1 = -400; // 第一段跳力度
const jumpForce2 = -350; // 第二段跳力度（稍低）
const jumpForce3 = -350; // 第三段跳力度（稍低）
let wasJumpKeyPressed = false; // 上一帧跳跃按键状态
let createCallCount = 0; // 记录create函数调用次数

// 预加载资源
function preload() {
    // 不需要预加载外部资源，使用图形创建
    console.log('预加载完成');
}

// 创建游戏场景
function create() {
    createCallCount++;
    console.log(`游戏场景创建 #${createCallCount}，当前关卡: ${currentLevel}`);

    // 重置关卡状态
    isLevelComplete = false;
    collectedApples = 0;
    
    // 清空之前的平台和苹果
    apples = [];
    
    // 总是创建新的平台组，避免使用可能有问题的clear方法
    platforms = this.physics.add.staticGroup();

    

    // 根据当前关卡创建不同的平台布局
    if (currentLevel === 1) {
        createLevel1(this);
    } else if (currentLevel === 2) {
        createLevel2(this);
    } else if (currentLevel === 3) {
        createLevel3(this);
    }
    
    createPlayer(this);

    // 确保所有苹果与玩家设置碰撞检测
    setupAppleCollisions(this);

    // 苹果与玩家碰撞检测
    this.physics.add.overlap(player, this.apples, collectApple, null, this);

    // 键盘控制
    cursors = this.input.keyboard.createCursorKeys();
    spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

    // 防止空格键触发浏览器默认行为（如滚动、重新加载等）
    this.input.keyboard.on('keydown-SPACE', (event) => {
        event.preventDefault();
        console.log('空格键按下，已阻止默认行为');
    });

    // 添加控制提示
    const style = {
        fontSize: '20px',
        fill: '#333',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    };

    this.add.text(400, 30, '方向键移动，上键跳跃（可二段跳）', style)
        .setOrigin(0.5, 0);

    // 游戏目标提示
    this.add.text(400, 70, '目标：跳上最高平台收集苹果 🍎', {
        fontSize: '24px',
        fill: '#FF6B00',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    })
    .setOrigin(0.5, 0);

    // 通关提示文本（初始隐藏）
    winText = this.add.text(400, 100, '🎉 通关成功！ 🎉', {
        fontSize: '48px',
        fill: '#FFD700', // 金色
        fontFamily: 'Arial',
        stroke: '#FF6B00',
        strokeThickness: 6,
        shadow: { offsetX: 2, offsetY: 2, color: '#000', blur: 4, fill: true }
    })
    .setOrigin(0.5, 0)
    .setVisible(false); // 初始隐藏

    // 游戏开始
    isGameStarted = true;
    console.log('游戏开始！');
}

// 第一关：简单关卡，1个苹果
function createLevel1(scene) {
    totalApples = 1;
    
    // 创建地面平台（使用矩形）
    const ground = scene.add.rectangle(400, 568, 800, 32, 0xA8E6CF);
    scene.physics.add.existing(ground, true);
    platforms.add(ground);

    // 创建几个空中平台
    const platform1 = scene.add.rectangle(200, 450, 128, 16, 0xA8E6CF);
    scene.physics.add.existing(platform1, true);
    platforms.add(platform1);

    const platform2 = scene.add.rectangle(600, 400, 128, 16, 0xA8E6CF);
    scene.physics.add.existing(platform2, true);
    platforms.add(platform2);

    const platform3 = scene.add.rectangle(400, 300, 128, 16, 0xA8E6CF);
    scene.physics.add.existing(platform3, true);
    platforms.add(platform3);

    // 第四个平台（最高的平台，用于放置苹果）
    const platform4 = scene.add.rectangle(100, 200, 128, 16, 0xD8A7FF); // 紫色平台
    scene.physics.add.existing(platform4, true);
    platforms.add(platform4);

    // 创建苹果
    createApple(scene, 100, 175);

    
    
    // 关卡提示
    scene.add.text(400, 70, '第一关：收集苹果 🍎', {
        fontSize: '24px',
        fill: '#FF6B00',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
}

// 第二关：复杂关卡，7个平台，3个苹果
function createLevel2(scene) {
    totalApples = 3;
    
    // 创建地面平台
    const ground = scene.add.rectangle(400, 568, 800, 32, 0xA8E6CF);
    scene.physics.add.existing(ground, true);
    platforms.add(ground);

    // 创建7个空中平台（更复杂的布局）
    const platformPositions = [
        {x: 200, y: 500, width: 100, color: 0xA8E6CF}, // 平台1
        {x: 600, y: 450, width: 100, color: 0xA8E6CF}, // 平台2
        {x: 300, y: 380, width: 120, color: 0xFFD8A8}, // 平台3
        {x: 500, y: 320, width: 100, color: 0xA8E6CF}, // 平台4
        {x: 150, y: 280, width: 80, color: 0xD8A7FF}, // 平台5
        {x: 650, y: 220, width: 100, color: 0xFFA8A8}, // 平台6
        {x: 400, y: 160, width: 120, color: 0xA8E6CF}  // 平台7
    ];

    platformPositions.forEach((pos, index) => {
        const platform = scene.add.rectangle(pos.x, pos.y, pos.width, 16, pos.color);
        scene.physics.add.existing(platform, true);
        platforms.add(platform);
    });

    // 创建3个苹果（分布在不同的平台上）
    createApple(scene, 150, 260); // 平台5上的苹果
    createApple(scene, 650, 200); // 平台6上的苹果
    createApple(scene, 400, 140); // 平台7上的苹果
    
    // 关卡提示
    scene.add.text(400, 70, '第二关：收集3个苹果 🍎🍎🍎', {
        fontSize: '24px',
        fill: '#FF6B00',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
}

// 第三关：挑战关卡，10个平台，5个苹果
function createLevel3(scene) {
    totalApples = 5;
    
    // 创建地面平台
    const ground = scene.add.rectangle(400, 568, 800, 32, 0xA8E6CF);
    scene.physics.add.existing(ground, true);
    platforms.add(ground);

    // 创建10个空中平台（更大的间距，更具挑战性）
    const platformPositions = [
        {x: 150, y: 520, width: 80, color: 0xA8E6CF},   // 平台1
        {x: 650, y: 480, width: 70, color: 0xFFD8A8},   // 平台2
        {x: 250, y: 420, width: 90, color: 0xD8A7FF},   // 平台3
        {x: 550, y: 370, width: 80, color: 0xFFA8A8},   // 平台4
        {x: 350, y: 320, width: 100, color: 0xA8E6CF},  // 平台5
        {x: 100, y: 270, width: 70, color: 0xFFD8A8},   // 平台6
        {x: 700, y: 220, width: 80, color: 0xD8A7FF},   // 平台7
        {x: 200, y: 170, width: 90, color: 0xFFA8A8},   // 平台8
        {x: 600, y: 120, width: 70, color: 0xA8E6CF},   // 平台9
        {x: 400, y: 70, width: 100, color: 0xFFD700}    // 平台10（金色，最高平台）
    ];

    platformPositions.forEach((pos, index) => {
        const platform = scene.add.rectangle(pos.x, pos.y, pos.width, 16, pos.color);
        scene.physics.add.existing(platform, true);
        platforms.add(platform);
    });

    // 创建5个苹果（分布在不同的平台上）
    createApple(scene, 150, 500);  // 平台1上的苹果
    createApple(scene, 650, 460);  // 平台2上的苹果
    createApple(scene, 350, 300);  // 平台5上的苹果
    createApple(scene, 700, 200);  // 平台7上的苹果
    createApple(scene, 400, 50);   // 平台10上的苹果（最高点）
    
    // 关卡提示
    scene.add.text(400, 70, '第三关：收集5个苹果 🍎🍎🍎🍎🍎', {
        fontSize: '24px',
        fill: '#FF6B00',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
    
    // 难度提示
    scene.add.text(400, 110, '挑战：平台间距更大，需要精准跳跃！', {
        fontSize: '18px',
        fill: '#FF0000',
        fontFamily: 'Arial',
        backgroundColor: 'rgba(255, 255, 255, 0.7)',
        padding: { x: 10, y: 5 }
    }).setOrigin(0.5, 0);
}

// 创建苹果函数
function createApple(scene, x, y) {
    const apple = scene.physics.add.sprite(x, y, null);

    // 绘制苹果（红色圆形带绿色柄）
    const appleGraphics = scene.add.graphics();

    // 绘制苹果主体（红色）
    appleGraphics.fillStyle(0xFF0000, 1); // 红色
    appleGraphics.fillCircle(20, 20, 15); // 圆形主体

    // 绘制苹果柄（绿色）
    appleGraphics.fillStyle(0x00AA00, 1); // 绿色
    appleGraphics.fillRect(19, 5, 2, 10); // 柄

    // 生成纹理
    appleGraphics.generateTexture('apple-texture', 40, 40);
    apple.setTexture('apple-texture');
    appleGraphics.destroy();

    apple.setScale(0.8);
    apple.setGravityY(0); // 苹果不受重力影响
    apple.setImmovable(true); // 苹果不可移动
    apple.body.allowGravity = false; // 确保苹果不受重力影响

    // 苹果与平台碰撞检测
    scene.physics.add.collider(apple, platforms);


    
    apples.push(apple);
    return apple;
}

// 设置苹果与玩家的碰撞检测
function setupAppleCollisions(scene) {
    if (!player || !player.body) {
        console.warn('玩家对象未准备好，无法设置苹果碰撞检测');
        return;
    }
    
    apples.forEach((apple, index) => {
        if (apple && apple.body) {
            scene.physics.add.overlap(player, apple, collectApple, null, scene);
        } else {
            console.warn(`苹果对象 ${index} 无效或未初始化`);
        }
    });
}

// 创建玩家函数
function createPlayer(scene) {
    // 创建玩家精灵
    player = scene.physics.add.sprite(500, 450, null);
    
    // 绘制可爱的蛋仔角色（圆圆身体 + 黑黑眼睛）
    const playerGraphics = scene.add.graphics();

    // 纹理中心坐标（纹理大小为40x40，中心在20,20）
    const centerX = 20;
    const centerY = 20;

    // 绘制圆圆的身体（粉色）
    playerGraphics.fillStyle(0xFF6B9D, 1); // 粉色
    playerGraphics.fillCircle(centerX, centerY, 20); // 圆形身体，圆心在纹理中心

    // 绘制黑黑的眼睛（相对于中心坐标）
    playerGraphics.fillStyle(0x000000, 1); // 黑色
    playerGraphics.fillCircle(centerX - 8, centerY - 5, 4); // 左眼
    playerGraphics.fillCircle(centerX + 8, centerY - 5, 4);  // 右眼

    // 眼睛高光（小白点，更可爱）
    playerGraphics.fillStyle(0xFFFFFF, 1); // 白色
    playerGraphics.fillCircle(centerX - 7, centerY - 6, 1); // 左眼高光
    playerGraphics.fillCircle(centerX + 9, centerY - 6, 1);  // 右眼高光

    // 绘制可爱的微笑嘴巴（弧形）
    playerGraphics.lineStyle(3, 0x000000, 1); // 黑色线条
    playerGraphics.beginPath();
    playerGraphics.arc(centerX, centerY + 5, 6, 0, Math.PI, false); // 下半圆弧，在中心下方
    playerGraphics.strokePath();

    // 使用图形作为纹理
    playerGraphics.generateTexture('egg-texture', 40, 40);
    player.setTexture('egg-texture');
    playerGraphics.destroy();

    // 设置玩家物理属性
    player.setBounce(0.2); // 设置弹跳
    player.setCollideWorldBounds(true); // 限制在边界内
    player.setScale(0.8);
    
    // 设置玩家与平台碰撞
    scene.physics.add.collider(player, platforms);
}

// 收集苹果函数
function collectApple(player, apple) {
    if (isLevelComplete) return; // 防止重复触发

    // 确保苹果对象有效
    if (!apple || !apple.body) {
        console.warn('无效的苹果对象');
        return;
    }

    // 隐藏苹果
    apple.disableBody(true, true);
    
    // 从苹果数组中移除已收集的苹果
    const appleIndex = apples.indexOf(apple);
    if (appleIndex > -1) {
        apples.splice(appleIndex, 1);
    }
    
    // 更新收集计数
    collectedApples++;
    console.log(`🍎 收集到苹果！ (${collectedApples}/${totalApples})`);

    // 检查是否收集完所有苹果
    if (collectedApples >= totalApples) {
        console.log('🎉 关卡完成！');
        
        // 显示通关提示
        if (winText) {
            let winMessage = '🎉 第一关完成！ 🎉';
            if (currentLevel === 2) {
                winMessage = '🎉 第二关完成！ 🎉';
            } else if (currentLevel === 3) {
                winMessage = '🎉 恭喜通关所有关卡！ 🎉';
            }
            winText.setText(winMessage);
            winText.setVisible(true);
            // 添加动画效果
            winText.setScale(0.5);
            winText.scene.tweens.add({
                targets: winText,
                scale: 1,
                duration: 500,
                ease: 'Back.easeOut'
            });
        }

        // 设置关卡完成状态
        isLevelComplete = true;
        
        // 显示进入下一关按钮
        if (currentLevel === 1) {
            createNextLevelButton(player.scene, 2, '进入第二关 →');
        } else if (currentLevel === 2) {
            createNextLevelButton(player.scene, 3, '进入第三关 →');
        }
    }
}

// 创建进入下一关按钮
function createNextLevelButton(scene, targetLevel, buttonText) {
    nextLevelButton = scene.add.text(400, 200, buttonText, {
        fontSize: '32px',
        fill: '#FFFFFF',
        fontFamily: 'Arial',
        backgroundColor: '#4CAF50',
        padding: { x: 20, y: 10 }
    })
    .setOrigin(0.5, 0)
    .setInteractive({ useHandCursor: true })
    .setVisible(true);
    
    // 按钮点击事件
    nextLevelButton.on('pointerdown', () => {
        console.log(`进入第${targetLevel}关`);
        currentLevel = targetLevel;
        
        // 隐藏按钮
        nextLevelButton.setVisible(false);
        
        // 重新启动游戏场景
        scene.scene.restart();
        
        // 如果restart无效，尝试使用start方法
        setTimeout(() => {
            if (currentLevel === targetLevel && scene.scene.isActive()) {
                console.log('使用start方法重新启动场景');
                scene.scene.start();
            }
        }, 100);
    });
    
    // 按钮悬停效果
    nextLevelButton.on('pointerover', () => {
        nextLevelButton.setBackgroundColor('#45a049');
    });
    
    nextLevelButton.on('pointerout', () => {
        nextLevelButton.setBackgroundColor('#4CAF50');
    });
}

// 更新游戏逻辑
function update() {
    if (!isGameStarted || !player || !player.body) return;

    // 调试：检查玩家位置
    if (player.y > 650) { // 超过屏幕底部
        console.warn(`玩家掉出屏幕底部: y=${player.y}, 可能触发重置`);
    }

    // 水平移动控制
    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.setFlipX(false);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.setFlipX(true);
    } else {
        player.setVelocityX(0);
    }

    // 重置跳跃计数（如果在地面）
    if (player.body.blocked.down || player.body.touching.down) {
        jumpCount = 0;
        // console.log('跳跃次数已重置', jumpCount);
    }


    // 二段跳控制 - 检测按键按下事件（使用状态变化检测，更可靠）
    const isJumpKeyDown = cursors.up.isDown || spaceKey.isDown;
    const jumpPressed = isJumpKeyDown && !wasJumpKeyPressed; // 按键刚按下

    // 更新上一帧状态
    wasJumpKeyPressed = isJumpKeyDown;

    // 调试：显示按键状态
    if (jumpPressed) {
        console.log('跳跃按键按下，jumpCount:', jumpCount, 'maxJumps:', maxJumps);
    }

    if (jumpPressed && jumpCount < maxJumps) {
        // 根据跳跃次数选择跳跃力度
        const jumpForce = jumpCount === 0 ? jumpForce1 :
                          jumpCount === 1 ? jumpForce2 :
                          jumpForce3;
        player.setVelocityY(jumpForce);
        jumpCount++;
        console.log('跳跃! 次数:', jumpCount, '力度:', jumpForce);
    }

    // 简单的旋转效果
    if (player.body.velocity.x !== 0) {
        player.rotation += player.body.velocity.x * 0.001;
    } else {
        player.rotation *= 0.9; // 缓慢回正
    }
}

// 页面加载完成后启动游戏
window.addEventListener('DOMContentLoaded', () => {
    console.log('初始化蛋仔乐园...');

    // 检查Phaser是否已加载
    if (typeof Phaser === 'undefined') {
        console.error('Phaser库未加载，请检查HTML文件中的Phaser引入');
        return;
    }

    // 全局防止空格键默认行为
    window.addEventListener('keydown', (event) => {
        if (event.code === 'Space' || event.key === ' ') {
            // 如果事件目标不是输入框等元素，则阻止默认行为
            if (event.target.tagName !== 'INPUT' && event.target.tagName !== 'TEXTAREA') {
                event.preventDefault();
            }
        }
    }, { passive: false });

    try {
        const game = new Phaser.Game(config);
        console.log('游戏启动完成！');
    } catch (error) {
        console.error('游戏启动失败:', error);
    }
});