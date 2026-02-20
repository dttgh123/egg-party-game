// 蛋仔乐园 - 关卡管理系统
// 关卡数据、加载和管理

// 关卡数据定义
const LevelData = {
    // 训练关卡
    '1-1': {
        id: '1-1',
        name: '新手训练营',
        description: '学习基础移动和跳跃',
        difficulty: 1,
        timeLimit: 120, // 秒
        starRequirements: [10, 20, 30], // 1星、2星、3星需要的分数
        layout: {
            // 平台定义: [x, y, width, height, type]
            platforms: [
                [400, 568, 800, 32, 'ground'], // 地面
                [200, 450, 128, 16, 'normal'],
                [600, 400, 128, 16, 'normal'],
                [400, 300, 128, 16, 'normal'],
                [100, 250, 96, 16, 'normal'],
                [700, 200, 96, 16, 'normal']
            ],
            // 星星位置: [x, y]
            stars: [
                [100, 400], [200, 400], [300, 400], [400, 400], [500, 400],
                [600, 400], [700, 400], [100, 200], [200, 200], [300, 200],
                [400, 200], [500, 200]
            ],
            // 起点位置
            start: [100, 450],
            // 终点位置
            end: [700, 150],
            // 障碍物: [x, y, width, height, type]
            obstacles: [],
            // 弹跳床: [x, y, power]
            trampolines: [
                [300, 530, 1.5]
            ]
        },
        background: 'sky',
        music: 'bgm_level1'
    },

    // 彩虹乐园
    '1-2': {
        id: '1-2',
        name: '彩虹乐园',
        description: '跳跃彩色平台，收集彩虹星星',
        difficulty: 2,
        timeLimit: 150,
        starRequirements: [15, 25, 35],
        layout: {
            platforms: [
                [400, 568, 800, 32, 'ground'],
                [150, 480, 96, 16, 'color1'],
                [350, 420, 96, 16, 'color2'],
                [550, 380, 96, 16, 'color3'],
                [250, 320, 96, 16, 'color4'],
                [450, 260, 96, 16, 'color5'],
                [650, 200, 96, 16, 'color6']
            ],
            stars: [
                [150, 440], [350, 380], [550, 340], [250, 280],
                [450, 220], [650, 160], [300, 500], [500, 460]
            ],
            start: [100, 500],
            end: [650, 160],
            obstacles: [
                [300, 530, 64, 16, 'moving_h'],
                [500, 450, 64, 16, 'moving_v']
            ],
            trampolines: [
                [200, 530, 1.8],
                [400, 450, 2.0]
            ]
        },
        background: 'sky_colorful',
        music: 'bgm_level2'
    },

    // 弹跳山谷
    '1-3': {
        id: '1-3',
        name: '弹跳山谷',
        description: '利用弹跳床穿越山谷',
        difficulty: 3,
        timeLimit: 180,
        starRequirements: [20, 30, 40],
        layout: {
            platforms: [
                [400, 568, 800, 32, 'ground'],
                [100, 450, 64, 16, 'normal'],
                [300, 380, 64, 16, 'normal'],
                [500, 310, 64, 16, 'normal'],
                [700, 240, 64, 16, 'normal'],
                [200, 180, 64, 16, 'normal'],
                [600, 120, 64, 16, 'normal']
            ],
            stars: [
                [100, 410], [300, 340], [500, 270], [700, 200],
                [200, 140], [600, 80], [400, 500], [150, 300]
            ],
            start: [100, 410],
            end: [600, 80],
            obstacles: [],
            trampolines: [
                [100, 530, 2.0],
                [300, 530, 2.2],
                [500, 530, 2.5],
                [700, 530, 2.8]
            ]
        },
        background: 'sky_mountain',
        music: 'bgm_level3'
    }
};

// 关卡管理器类
class LevelManager {
    constructor(scene) {
        this.scene = scene;
        this.currentLevel = null;
        this.levelObjects = {
            platforms: null,
            stars: null,
            obstacles: null,
            trampolines: null
        };
        this.playerStart = { x: 100, y: 450 };
        this.playerEnd = { x: 700, y: 150 };
    }

    // 加载关卡
    loadLevel(levelId) {
        console.log(`加载关卡: ${levelId}`);

        // 获取关卡数据
        const levelData = LevelData[levelId];
        if (!levelData) {
            console.error(`关卡 ${levelId} 不存在`);
            return false;
        }

        this.currentLevel = levelData;

        // 清理之前的关卡对象
        this.clearLevel();

        // 创建关卡对象
        this.createLevelObjects(levelData.layout);

        // 设置起点终点
        this.playerStart = {
            x: levelData.layout.start[0],
            y: levelData.layout.start[1]
        };

        this.playerEnd = {
            x: levelData.layout.end[0],
            y: levelData.layout.end[1]
        };

        // 设置背景
        if (levelData.background) {
            this.scene.add.image(400, 300, levelData.background).setDisplaySize(800, 600);
        }

        console.log(`关卡 ${levelData.name} 加载完成`);
        return true;
    }

    // 创建关卡对象
    createLevelObjects(layout) {
        // 创建平台组
        this.levelObjects.platforms = this.scene.physics.add.staticGroup();

        layout.platforms.forEach(platformData => {
            const [x, y, width, height, type] = platformData;
            let platform;

            if (type === 'ground') {
                // 地面平台
                platform = this.levelObjects.platforms.create(x, y, 'platform')
                    .setScale(width / 256, height / 32)
                    .refreshBody();
            } else {
                // 普通平台
                platform = this.levelObjects.platforms.create(x, y, 'platform')
                    .setScale(width / 256, height / 32)
                    .refreshBody();

                // 根据类型设置颜色
                if (type.startsWith('color')) {
                    const colorIndex = parseInt(type.replace('color', ''));
                    const colors = [0xFF6B9D, 0x6BCEFF, 0xFFD166, 0x7AE582, 0x9B5DE5, 0x00BBF9];
                    if (colorIndex <= colors.length) {
                        platform.setTint(colors[colorIndex - 1]);
                    }
                }
            }
        });

        // 创建星星组
        this.levelObjects.stars = this.scene.physics.add.group({
            key: 'star',
            repeat: layout.stars.length - 1,
            setXY: { x: 0, y: 0 }
        });

        // 设置星星位置
        layout.stars.forEach((starPos, index) => {
            const star = this.levelObjects.stars.getChildren()[index];
            if (star) {
                star.setPosition(starPos[0], starPos[1]);
                star.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
                star.setScale(0.7);
                star.setVisible(true);
                star.setActive(true);
            }
        });

        // 创建弹跳床（如果有）
        if (layout.trampolines && layout.trampolines.length > 0) {
            this.levelObjects.trampolines = this.scene.physics.add.staticGroup();

            layout.trampolines.forEach(trampolineData => {
                const [x, y, power] = trampolineData;
                // 创建弹跳床（使用临时图形）
                const trampoline = this.scene.add.rectangle(x, y, 64, 16, 0xFFD166, 0.8);
                this.scene.physics.add.existing(trampoline, true);
                trampoline.power = power || 1.5;

                // 添加弹跳效果
                trampoline.setInteractive();
                trampoline.on('collide', (body1, body2) => {
                    if (body1.gameObject === trampoline || body2.gameObject === trampoline) {
                        const playerBody = (body1.gameObject === trampoline) ? body2 : body1;
                        if (playerBody.gameObject && playerBody.gameObject.texture) {
                            const bounceForce = -500 * trampoline.power;
                            playerBody.setVelocityY(bounceForce);

                            // 弹跳动画
                            this.scene.tweens.add({
                                targets: trampoline,
                                scaleY: 0.8,
                                duration: 200,
                                yoyo: true
                            });
                        }
                    }
                });

                this.levelObjects.trampolines.add(trampoline);
            });
        }

        console.log(`关卡对象创建完成: ${layout.platforms.length}个平台, ${layout.stars.length}个星星`);
    }

    // 清理关卡对象
    clearLevel() {
        Object.values(this.levelObjects).forEach(group => {
            if (group) {
                if (Array.isArray(group)) {
                    group.forEach(obj => {
                        if (obj && obj.destroy) obj.destroy();
                    });
                } else if (group.destroy) {
                    group.destroy(true);
                }
            }
        });

        // 重置对象
        this.levelObjects = {
            platforms: null,
            stars: null,
            obstacles: null,
            trampolines: null
        };

        console.log('关卡对象已清理');
    }

    // 获取当前关卡数据
    getCurrentLevel() {
        return this.currentLevel;
    }

    // 获取关卡对象
    getLevelObjects() {
        return this.levelObjects;
    }

    // 获取玩家起点
    getPlayerStart() {
        return this.playerStart;
    }

    // 获取玩家终点
    getPlayerEnd() {
        return this.playerEnd;
    }

    // 检查玩家是否到达终点
    checkPlayerAtEnd(player) {
        if (!player || !this.playerEnd) return false;

        const playerPos = player.getPosition();
        const distance = Phaser.Math.Distance.Between(
            playerPos.x, playerPos.y,
            this.playerEnd.x, this.playerEnd.y
        );

        return distance < 50;
    }

    // 获取剩余星星数量
    getRemainingStars() {
        if (!this.levelObjects.stars) return 0;
        return this.levelObjects.stars.countActive(true);
    }

    // 获取关卡进度（0-1）
    getProgress() {
        if (!this.currentLevel || !this.levelObjects.stars) return 0;

        const totalStars = this.currentLevel.layout.stars.length;
        const collectedStars = totalStars - this.getRemainingStars();
        return collectedStars / totalStars;
    }

    // 保存关卡进度
    saveProgress(score, stars) {
        const levelId = this.currentLevel.id;
        const savedData = JSON.parse(localStorage.getItem('eggPartyProgress') || '{}');

        // 更新最高分和星星
        if (!savedData[levelId] || score > savedData[levelId].score) {
            savedData[levelId] = {
                score: score,
                stars: stars,
                unlocked: true
            };

            localStorage.setItem('eggPartyProgress', JSON.stringify(savedData));
            console.log(`关卡 ${levelId} 进度已保存: 分数=${score}, 星星=${stars}`);
            return true;
        }

        return false;
    }

    // 获取关卡进度
    getSavedProgress(levelId) {
        const savedData = JSON.parse(localStorage.getItem('eggPartyProgress') || '{}');
        return savedData[levelId] || null;
    }

    // 解锁下一关
    unlockNextLevel(currentLevelId) {
        const levelIds = Object.keys(LevelData);
        const currentIndex = levelIds.indexOf(currentLevelId);

        if (currentIndex >= 0 && currentIndex < levelIds.length - 1) {
            const nextLevelId = levelIds[currentIndex + 1];
            const savedData = JSON.parse(localStorage.getItem('eggPartyProgress') || '{}');

            if (!savedData[nextLevelId]) {
                savedData[nextLevelId] = {
                    score: 0,
                    stars: 0,
                    unlocked: true
                };

                localStorage.setItem('eggPartyProgress', JSON.stringify(savedData));
                console.log(`下一关 ${nextLevelId} 已解锁`);
                return nextLevelId;
            }
        }

        return null;
    }
}

// 关卡选择器类
class LevelSelector {
    constructor(scene) {
        this.scene = scene;
        this.levels = LevelData;
        this.unlockedLevels = this.getUnlockedLevels();
    }

    // 获取已解锁的关卡
    getUnlockedLevels() {
        const savedData = JSON.parse(localStorage.getItem('eggPartyProgress') || '{}');
        const unlocked = ['1-1']; // 第一关默认解锁

        Object.keys(this.levels).forEach(levelId => {
            if (levelId !== '1-1' && savedData[levelId] && savedData[levelId].unlocked) {
                unlocked.push(levelId);
            }
        });

        return unlocked;
    }

    // 创建关卡选择界面
    createSelectionUI(x, y) {
        const container = this.scene.add.container(x, y);

        // 标题
        const title = this.scene.add.text(0, -250, '选择关卡', {
            fontSize: '48px',
            fill: '#333',
            fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
            stroke: '#fff',
            strokeThickness: 4
        }).setOrigin(0.5);

        container.add(title);

        // 关卡网格
        const gridX = -200;
        const gridY = -150;
        const spacing = 150;

        Object.values(this.levels).forEach((level, index) => {
            const row = Math.floor(index / 3);
            const col = index % 3;

            const posX = gridX + col * spacing;
            const posY = gridY + row * spacing;

            // 检查是否解锁
            const isUnlocked = this.unlockedLevels.includes(level.id);
            const savedProgress = this.getLevelProgress(level.id);

            // 创建关卡按钮
            const button = this.createLevelButton(posX, posY, level, isUnlocked, savedProgress);
            container.add(button);
        });

        return container;
    }

    // 创建关卡按钮
    createLevelButton(x, y, levelData, isUnlocked, savedProgress) {
        const buttonGroup = this.scene.add.container(x, y);

        // 按钮背景
        const buttonBg = this.scene.add.circle(0, 0, 50, isUnlocked ? 0xFFFFFF : 0xCCCCCC);
        buttonBg.setStrokeStyle(4, isUnlocked ? 0x6BCEFF : 0x999999);

        // 关卡编号
        const levelText = this.scene.add.text(0, -15, levelData.id, {
            fontSize: '24px',
            fill: isUnlocked ? '#333' : '#999',
            fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 关卡名称
        const nameText = this.scene.add.text(0, 15, levelData.name, {
            fontSize: '16px',
            fill: isUnlocked ? '#666' : '#999',
            fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑'
        }).setOrigin(0.5);

        // 星星显示（如果有关卡进度）
        let starsDisplay = null;
        if (savedProgress && savedProgress.stars > 0) {
            starsDisplay = this.scene.add.text(0, 40, '⭐'.repeat(savedProgress.stars), {
                fontSize: '20px',
                fill: '#FFD166'
            }).setOrigin(0.5);
        }

        buttonGroup.add([buttonBg, levelText, nameText]);
        if (starsDisplay) buttonGroup.add(starsDisplay);

        // 添加交互（如果解锁）
        if (isUnlocked) {
            buttonBg.setInteractive({ useHandCursor: true });

            // 悬停效果
            buttonBg.on('pointerover', () => {
                buttonBg.setFillStyle(0xF0F8FF);
                buttonBg.setStrokeStyle(4, 0xFF6B9D);
            });

            buttonBg.on('pointerout', () => {
                buttonBg.setFillStyle(0xFFFFFF);
                buttonBg.setStrokeStyle(4, 0x6BCEFF);
            });

            // 点击事件
            buttonBg.on('pointerdown', () => {
                this.scene.events.emit('levelSelected', levelData.id);
            });
        } else {
            // 未解锁显示锁图标
            const lockIcon = this.scene.add.text(0, 0, '🔒', {
                fontSize: '30px'
            }).setOrigin(0.5);
            buttonGroup.add(lockIcon);
        }

        return buttonGroup;
    }

    // 获取关卡进度
    getLevelProgress(levelId) {
        const savedData = JSON.parse(localStorage.getItem('eggPartyProgress') || '{}');
        return savedData[levelId] || null;
    }

    // 更新解锁状态
    updateUnlockedLevels() {
        this.unlockedLevels = this.getUnlockedLevels();
    }
}

// 导出类
window.LevelData = LevelData;
window.LevelManager = LevelManager;
window.LevelSelector = LevelSelector;