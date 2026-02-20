// 蛋仔乐园 - 玩家角色控制
// 玩家类定义和控制逻辑

class EggPlayer {
    constructor(scene, x, y) {
        this.scene = scene;
        this.sprite = null;
        this.speed = 160;
        this.jumpForce = -400;
        this.isJumping = false;
        this.facingRight = true;
        this.isAlive = true;

        // 创建玩家精灵
        this.create(x, y);
    }

    create(x, y) {
        // 创建玩家精灵（使用临时图形）
        this.sprite = this.scene.physics.add.sprite(x, y, 'player');
        this.sprite.setBounce(0.2);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.body.setSize(50, 50);
        this.sprite.setScale(0.8);

        // 添加玩家动画
        this.createAnimations();

        // 初始播放空闲动画
        this.sprite.anims.play('idle');

        console.log('玩家角色创建完成');
    }

    createAnimations() {
        // 创建玩家动画
        if (!this.scene.anims.exists('idle')) {
            this.scene.anims.create({
                key: 'idle',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('walk')) {
            this.scene.anims.create({
                key: 'walk',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 10,
                repeat: -1
            });
        }

        if (!this.scene.anims.exists('jump')) {
            this.scene.anims.create({
                key: 'jump',
                frames: [{ key: 'player', frame: 0 }],
                frameRate: 10,
                repeat: -1
            });
        }
    }

    update(input) {
        if (!this.isAlive || !this.sprite.body) return;

        let velocityX = 0;

        // 处理输入
        if (input.left) {
            velocityX = -this.speed;
            this.facingRight = false;
        } else if (input.right) {
            velocityX = this.speed;
            this.facingRight = true;
        }

        // 应用水平速度
        this.sprite.setVelocityX(velocityX);

        // 处理跳跃
        if (input.jump && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(this.jumpForce);
            this.isJumping = true;
            this.sprite.anims.play('jump', true);
        }

        // 更新动画状态
        this.updateAnimation(velocityX);
    }

    updateAnimation(velocityX) {
        if (!this.sprite.body) return;

        // 根据速度播放动画
        if (this.sprite.body.touching.down) {
            if (velocityX !== 0) {
                this.sprite.anims.play('walk', true);
                // 根据方向翻转精灵
                this.sprite.setFlipX(!this.facingRight);
            } else {
                this.sprite.anims.play('idle', true);
            }
        } else {
            this.sprite.anims.play('jump', true);
        }

        // 根据速度旋转（滚动效果）
        if (velocityX !== 0) {
            this.sprite.rotation += velocityX * 0.001;
        } else {
            // 缓慢回正
            this.sprite.rotation *= 0.9;
        }

        // 防止旋转过度
        if (Math.abs(this.sprite.rotation) > 0.5) {
            this.sprite.rotation = Phaser.Math.Clamp(this.sprite.rotation, -0.5, 0.5);
        }
    }

    // 处理虚拟摇杆输入
    handleJoystickInput(joystickX) {
        if (!this.isAlive) return;

        const velocityX = joystickX * this.speed;
        this.sprite.setVelocityX(velocityX);

        // 更新方向
        if (joystickX > 0) {
            this.facingRight = true;
        } else if (joystickX < 0) {
            this.facingRight = false;
        }

        // 更新动画
        this.updateAnimation(velocityX);
    }

    // 处理跳跃按钮
    handleJumpButton(pressed) {
        if (pressed && this.sprite.body.touching.down) {
            this.sprite.setVelocityY(this.jumpForce);
            this.isJumping = true;
            this.sprite.anims.play('jump', true);
        }
    }

    // 玩家受伤
    takeDamage() {
        if (!this.isAlive) return;

        // 受伤效果：闪烁和击退
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: { from: 0.5, to: 1 },
            duration: 300,
            repeat: 5,
            yoyo: true
        });

        // 击退效果
        this.sprite.setVelocityY(-200);
        this.sprite.setVelocityX(this.facingRight ? -100 : 100);

        console.log('玩家受伤');
    }

    // 玩家死亡
    die() {
        if (!this.isAlive) return;

        this.isAlive = false;
        this.sprite.setTint(0xff0000);
        this.sprite.setVelocity(0, -300);
        this.sprite.setCollideWorldBounds(false);

        // 死亡动画
        this.scene.tweens.add({
            targets: this.sprite,
            alpha: 0,
            scale: 0.5,
            rotation: Math.PI * 2,
            duration: 1000,
            onComplete: () => {
                if (this.sprite) {
                    this.sprite.destroy();
                }
            }
        });

        console.log('玩家死亡');
    }

    // 重置玩家
    reset(x, y) {
        this.isAlive = true;
        this.sprite.setPosition(x, y);
        this.sprite.clearTint();
        this.sprite.setAlpha(1);
        this.sprite.setScale(0.8);
        this.sprite.setRotation(0);
        this.sprite.setCollideWorldBounds(true);
        this.sprite.anims.play('idle');
    }

    // 获取玩家位置
    getPosition() {
        return {
            x: this.sprite.x,
            y: this.sprite.y
        };
    }

    // 设置玩家位置
    setPosition(x, y) {
        if (this.sprite) {
            this.sprite.setPosition(x, y);
        }
    }

    // 获取精灵引用
    getSprite() {
        return this.sprite;
    }
}

// 输入管理器类
class InputManager {
    constructor() {
        this.keys = {
            left: false,
            right: false,
            up: false,
            space: false
        };

        this.joystick = {
            x: 0,
            y: 0
        };

        this.jumpButton = false;
        this.actionButton = false;
    }

    // 初始化键盘输入
    initKeyboard(scene) {
        scene.input.keyboard.on('keydown-LEFT', () => { this.keys.left = true; });
        scene.input.keyboard.on('keyup-LEFT', () => { this.keys.left = false; });

        scene.input.keyboard.on('keydown-RIGHT', () => { this.keys.right = true; });
        scene.input.keyboard.on('keyup-RIGHT', () => { this.keys.right = false; });

        scene.input.keyboard.on('keydown-UP', () => { this.keys.up = true; });
        scene.input.keyboard.on('keyup-UP', () => { this.keys.up = false; });

        scene.input.keyboard.on('keydown-SPACE', () => { this.keys.space = true; });
        scene.input.keyboard.on('keyup-SPACE', () => { this.keys.space = false; });

        console.log('键盘输入初始化完成');
    }

    // 更新虚拟摇杆输入
    updateJoystick(x, y) {
        this.joystick.x = x;
        this.joystick.y = y;
    }

    // 更新按钮输入
    updateJumpButton(pressed) {
        this.jumpButton = pressed;
    }

    updateActionButton(pressed) {
        this.actionButton = pressed;
    }

    // 获取当前输入状态
    getInput() {
        return {
            left: this.keys.left || this.joystick.x < -0.1,
            right: this.keys.right || this.joystick.x > 0.1,
            jump: this.keys.up || this.keys.space || this.jumpButton,
            action: this.actionButton
        };
    }

    // 重置所有输入
    reset() {
        this.keys.left = false;
        this.keys.right = false;
        this.keys.up = false;
        this.keys.space = false;
        this.joystick.x = 0;
        this.joystick.y = 0;
        this.jumpButton = false;
        this.actionButton = false;
    }
}

// 导出类
window.EggPlayer = EggPlayer;
window.InputManager = InputManager;