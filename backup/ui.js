// 蛋仔乐园 - 用户界面管理
// 游戏UI元素创建和更新

class UIManager {
    constructor(scene) {
        this.scene = scene;
        this.elements = {};
        this.isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);

        // UI样式配置
        this.styles = {
            title: {
                fontSize: '48px',
                fill: '#333',
                fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
                stroke: '#fff',
                strokeThickness: 4
            },
            subtitle: {
                fontSize: '24px',
                fill: '#666',
                fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑'
            },
            button: {
                fontSize: '32px',
                fill: '#fff',
                fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
                backgroundColor: '#FF6B9D',
                padding: { x: 20, y: 10 }
            },
            stats: {
                fontSize: '28px',
                fill: '#333',
                fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
                stroke: '#fff',
                strokeThickness: 3
            },
            alert: {
                fontSize: '36px',
                fill: '#fff',
                fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
                stroke: '#000',
                strokeThickness: 6
            }
        };

        console.log('UI管理器初始化完成');
    }

    // 创建游戏HUD（抬头显示器）
    createGameHUD() {
        console.log('创建游戏HUD');

        // 分数显示
        this.elements.scoreText = this.scene.add.text(20, 20, '分数: 0', this.styles.stats);
        this.elements.scoreText.setScrollFactor(0);

        // 时间显示
        this.elements.timeText = this.scene.add.text(20, 60, '时间: 60', this.styles.stats);
        this.elements.timeText.setScrollFactor(0);

        // 星星计数
        this.elements.starsText = this.scene.add.text(20, 100, '星星: 0/0', this.styles.stats);
        this.elements.starsText.setScrollFactor(0);

        // 生命显示（心形）
        this.elements.livesContainer = this.scene.add.container(20, 140);
        this.updateLivesDisplay(3); // 初始3条命

        // 暂停按钮（仅在移动设备上显示）
        if (this.isMobile) {
            this.createPauseButton();
        }

        // 虚拟控制提示（仅桌面显示）
        if (!this.isMobile) {
            this.elements.controlsHint = this.scene.add.text(
                400, 20,
                '使用方向键移动，空格键跳跃',
                { fontSize: '20px', fill: '#fff', fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑' }
            ).setOrigin(0.5, 0).setScrollFactor(0);
        }

        console.log('游戏HUD创建完成');
    }

    // 创建暂停按钮
    createPauseButton() {
        const pauseButton = this.scene.add.rectangle(
            this.scene.sys.game.config.width - 50,
            40,
            60, 60,
            0xFFFFFF, 0.8
        ).setScrollFactor(0);

        pauseButton.setStrokeStyle(3, 0x6BCEFF);
        pauseButton.setInteractive({ useHandCursor: true });

        // 暂停图标
        const pauseIcon = this.scene.add.text(
            pauseButton.x,
            pauseButton.y,
            '⏸️',
            { fontSize: '28px' }
        ).setOrigin(0.5).setScrollFactor(0);

        // 点击事件
        pauseButton.on('pointerdown', () => {
            this.scene.events.emit('togglePause');
        });

        this.elements.pauseButton = pauseButton;
        this.elements.pauseIcon = pauseIcon;
    }

    // 更新分数显示
    updateScore(score) {
        if (this.elements.scoreText) {
            this.elements.scoreText.setText(`分数: ${score}`);
        }

        // 同时更新网页上的分数显示
        const webScoreElement = document.querySelector('.stat-value');
        if (webScoreElement) {
            webScoreElement.textContent = score;
        }
    }

    // 更新时间显示
    updateTime(seconds) {
        if (this.elements.timeText) {
            const minutes = Math.floor(seconds / 60);
            const remainingSeconds = seconds % 60;
            this.elements.timeText.setText(`时间: ${minutes}:${remainingSeconds.toString().padStart(2, '0')}`);
        }
    }

    // 更新星星计数
    updateStars(collected, total) {
        if (this.elements.starsText) {
            this.elements.starsText.setText(`星星: ${collected}/${total}`);
        }
    }

    // 更新生命显示
    updateLivesDisplay(lives) {
        if (!this.elements.livesContainer) return;

        // 清空容器
        this.elements.livesContainer.removeAll();

        // 创建心形图标
        for (let i = 0; i < 3; i++) {
            const heart = this.scene.add.text(
                i * 40, 0,
                i < lives ? '❤️' : '🤍',
                { fontSize: '32px' }
            );
            this.elements.livesContainer.add(heart);
        }
    }

    // 显示游戏开始界面
    showStartMenu() {
        console.log('显示开始菜单');

        // 创建半透明背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.7);
        bg.setScrollFactor(0);

        // 标题
        const title = this.scene.add.text(400, 150, '🥚 蛋仔乐园', this.styles.title)
            .setOrigin(0.5);

        // 副标题
        const subtitle = this.scene.add.text(400, 220, '可爱蛋仔的物理冒险派对！', this.styles.subtitle)
            .setOrigin(0.5);

        // 开始游戏按钮
        const startButton = this.createButton(400, 320, '开始游戏', 0xFF6B9D);
        startButton.on('pointerdown', () => {
            this.hideStartMenu();
            this.scene.events.emit('startGame');
        });

        // 关卡选择按钮
        const levelButton = this.createButton(400, 400, '选择关卡', 0x6BCEFF);
        levelButton.on('pointerdown', () => {
            this.scene.events.emit('showLevelSelect');
        });

        // 设置按钮
        const settingsButton = this.createButton(400, 480, '游戏设置', 0xFFD166);
        settingsButton.on('pointerdown', () => {
            this.scene.events.emit('showSettings');
        });

        // 存储UI元素
        this.elements.startMenu = {
            bg, title, subtitle,
            startButton, levelButton, settingsButton
        };

        console.log('开始菜单显示完成');
    }

    // 隐藏游戏开始界面
    hideStartMenu() {
        if (this.elements.startMenu) {
            Object.values(this.elements.startMenu).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.elements.startMenu = null;
        }
        console.log('开始菜单已隐藏');
    }

    // 显示关卡选择界面
    showLevelSelect(levelSelector) {
        console.log('显示关卡选择界面');

        // 创建半透明背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        bg.setScrollFactor(0);

        // 创建关卡选择器UI
        const levelSelectUI = levelSelector.createSelectionUI(400, 300);
        levelSelectUI.setScrollFactor(0);

        // 返回按钮
        const backButton = this.createButton(400, 520, '返回主菜单', 0x7AE582);
        backButton.on('pointerdown', () => {
            this.hideLevelSelect();
            this.showStartMenu();
        });

        // 监听关卡选择事件
        this.scene.events.once('levelSelected', (levelId) => {
            this.hideLevelSelect();
            this.scene.events.emit('levelSelected', levelId);
        });

        this.elements.levelSelect = {
            bg, levelSelectUI, backButton
        };

        console.log('关卡选择界面显示完成');
    }

    // 隐藏关卡选择界面
    hideLevelSelect() {
        if (this.elements.levelSelect) {
            Object.values(this.elements.levelSelect).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.elements.levelSelect = null;
        }
        console.log('关卡选择界面已隐藏');
    }

    // 显示暂停菜单
    showPauseMenu() {
        console.log('显示暂停菜单');

        // 创建半透明背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.8);
        bg.setScrollFactor(0);

        // 标题
        const title = this.scene.add.text(400, 200, '游戏暂停', this.styles.title)
            .setOrigin(0.5);

        // 继续按钮
        const resumeButton = this.createButton(400, 280, '继续游戏', 0x7AE582);
        resumeButton.on('pointerdown', () => {
            this.hidePauseMenu();
            this.scene.events.emit('resumeGame');
        });

        // 重新开始按钮
        const restartButton = this.createButton(400, 350, '重新开始', 0xFFD166);
        restartButton.on('pointerdown', () => {
            if (confirm('确定要重新开始吗？当前进度将会丢失。')) {
                this.scene.events.emit('restartGame');
            }
        });

        // 返回主菜单按钮
        const menuButton = this.createButton(400, 420, '返回主菜单', 0xFF6B9D);
        menuButton.on('pointerdown', () => {
            if (confirm('确定要返回主菜单吗？当前游戏进度将会丢失。')) {
                this.scene.events.emit('backToMenu');
            }
        });

        this.elements.pauseMenu = {
            bg, title, resumeButton, restartButton, menuButton
        };

        console.log('暂停菜单显示完成');
    }

    // 隐藏暂停菜单
    hidePauseMenu() {
        if (this.elements.pauseMenu) {
            Object.values(this.elements.pauseMenu).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.elements.pauseMenu = null;
        }
        console.log('暂停菜单已隐藏');
    }

    // 显示游戏结束界面
    showGameOver(score, stars, timeLeft) {
        console.log('显示游戏结束界面');

        // 创建半透明背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);
        bg.setScrollFactor(0);

        // 标题
        const title = this.scene.add.text(400, 150, '游戏结束', this.styles.title)
            .setOrigin(0.5);

        // 成绩统计
        const statsText = this.scene.add.text(400, 230,
            `最终分数: ${score}\n收集星星: ${stars}\n剩余时间: ${timeLeft}秒`,
            { fontSize: '32px', fill: '#fff', fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑', align: 'center' }
        ).setOrigin(0.5);

        // 重新开始按钮
        const restartButton = this.createButton(400, 350, '重新开始', 0xFF6B9D);
        restartButton.on('pointerdown', () => {
            this.hideGameOver();
            this.scene.events.emit('restartGame');
        });

        // 返回主菜单按钮
        const menuButton = this.createButton(400, 420, '返回主菜单', 0x6BCEFF);
        menuButton.on('pointerdown', () => {
            this.hideGameOver();
            this.scene.events.emit('backToMenu');
        });

        this.elements.gameOver = {
            bg, title, statsText, restartButton, menuButton
        };

        console.log('游戏结束界面显示完成');
    }

    // 隐藏游戏结束界面
    hideGameOver() {
        if (this.elements.gameOver) {
            Object.values(this.elements.gameOver).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.elements.gameOver = null;
        }
        console.log('游戏结束界面已隐藏');
    }

    // 显示关卡完成界面
    showLevelComplete(score, stars, timeBonus, totalScore) {
        console.log('显示关卡完成界面');

        // 创建半透明背景
        const bg = this.scene.add.rectangle(400, 300, 800, 600, 0x000000, 0.9);
        bg.setScrollFactor(0);

        // 标题
        const title = this.scene.add.text(400, 150, '关卡完成！🎉', this.styles.title)
            .setOrigin(0.5);

        // 成绩统计
        const statsText = this.scene.add.text(400, 230,
            `基础分数: ${score}\n星星奖励: ${stars * 10}\n时间奖励: ${timeBonus}\n\n总分: ${totalScore}`,
            { fontSize: '28px', fill: '#fff', fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑', align: 'center' }
        ).setOrigin(0.5);

        // 星星评级
        const starRating = this.getStarRating(stars);
        const ratingText = this.scene.add.text(400, 340,
            `评级: ${starRating}`,
            { fontSize: '36px', fill: '#FFD166', fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑' }
        ).setOrigin(0.5);

        // 下一关按钮
        const nextButton = this.createButton(400, 420, '下一关卡', 0x7AE582);
        nextButton.on('pointerdown', () => {
            this.hideLevelComplete();
            this.scene.events.emit('nextLevel');
        });

        // 重玩按钮
        const replayButton = this.createButton(400, 490, '重新挑战', 0xFFD166);
        replayButton.on('pointerdown', () => {
            this.hideLevelComplete();
            this.scene.events.emit('replayLevel');
        });

        this.elements.levelComplete = {
            bg, title, statsText, ratingText, nextButton, replayButton
        };

        console.log('关卡完成界面显示完成');
    }

    // 隐藏关卡完成界面
    hideLevelComplete() {
        if (this.elements.levelComplete) {
            Object.values(this.elements.levelComplete).forEach(element => {
                if (element && element.destroy) {
                    element.destroy();
                }
            });
            this.elements.levelComplete = null;
        }
        console.log('关卡完成界面已隐藏');
    }

    // 显示提示信息
    showMessage(text, duration = 2000) {
        const message = this.scene.add.text(400, 250, text, this.styles.alert)
            .setOrigin(0.5)
            .setScrollFactor(0);

        // 淡入淡出动画
        this.scene.tweens.add({
            targets: message,
            alpha: 0,
            y: 200,
            duration: duration,
            onComplete: () => {
                message.destroy();
            }
        });

        return message;
    }

    // 创建通用按钮
    createButton(x, y, text, color) {
        const button = this.scene.add.rectangle(x, y, 300, 70, color, 1);
        button.setStrokeStyle(4, 0xFFFFFF);

        const buttonText = this.scene.add.text(x, y, text, {
            fontSize: '28px',
            fill: '#fff',
            fontFamily: 'Comic Sans MS, Arial Rounded MT Bold, 微软雅黑',
            fontWeight: 'bold'
        }).setOrigin(0.5);

        // 添加交互
        button.setInteractive({ useHandCursor: true });

        // 悬停效果
        button.on('pointerover', () => {
            button.setFillStyle(color, 0.9);
            button.setStrokeStyle(4, 0xFFD166);
            buttonText.setScale(1.05);
        });

        button.on('pointerout', () => {
            button.setFillStyle(color, 1);
            button.setStrokeStyle(4, 0xFFFFFF);
            buttonText.setScale(1);
        });

        // 点击效果
        button.on('pointerdown', () => {
            button.setScale(0.95);
            this.scene.sound.play('click', { volume: 0.5 });
        });

        button.on('pointerup', () => {
            button.setScale(1);
        });

        return button;
    }

    // 获取星星评级
    getStarRating(stars) {
        switch(stars) {
            case 3: return '⭐⭐⭐ 完美！';
            case 2: return '⭐⭐ 优秀！';
            case 1: return '⭐ 不错！';
            default: return '继续努力！';
        }
    }

    // 清理所有UI元素
    clearAll() {
        Object.values(this.elements).forEach(element => {
            if (Array.isArray(element)) {
                element.forEach(item => {
                    if (item && item.destroy) item.destroy();
                });
            } else if (element && element.destroy) {
                element.destroy();
            }
        });
        this.elements = {};
        console.log('所有UI元素已清理');
    }
}

// 导出类
window.UIManager = UIManager;