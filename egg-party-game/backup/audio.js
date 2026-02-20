// 蛋仔乐园 - 音频管理系统
// 背景音乐、音效管理和音量控制

class AudioManager {
    constructor(scene) {
        this.scene = scene;
        this.sounds = {};
        this.isMuted = false;
        this.volume = {
            bgm: 0.8,
            sfx: 0.9
        };

        // 音效配置
        this.soundConfigs = {
            // 游戏音效
            jump: { volume: 0.4, rate: 1.0 },
            collect: { volume: 0.6, rate: 1.0 },
            hurt: { volume: 0.7, rate: 1.0 },
            win: { volume: 0.8, rate: 1.0 },
            lose: { volume: 0.8, rate: 1.0 },
            click: { volume: 0.5, rate: 1.0 },
            bounce: { volume: 0.5, rate: 1.0 },

            // 背景音乐
            bgm_menu: { volume: 0.6, loop: true },
            bgm_level1: { volume: 0.5, loop: true },
            bgm_level2: { volume: 0.5, loop: true },
            bgm_level3: { volume: 0.5, loop: true }
        };

        console.log('音频管理器初始化完成');
    }

    // 预加载音频
    preload() {
        console.log('开始预加载音频...');

        // 注意：在实际项目中，这里需要加载真实的音频文件
        // 由于项目限制，我们使用基础音效生成器或占位符

        // 创建基础音效（使用Web Audio API生成简单音效）
        this.createBasicSounds();

        console.log('音频预加载完成');
    }

    // 创建基础音效（在没有音频文件时使用）
    createBasicSounds() {
        // 跳跃音效 - 短促的上升音调
        this.sounds.jump = this.createBeepSound(523.25, 0.1, 'sine'); // C5

        // 收集音效 - 清脆的铃声
        this.sounds.collect = this.createBeepSound(1046.50, 0.2, 'square'); // C6

        // 受伤音效 - 低沉的音调
        this.sounds.hurt = this.createBeepSound(261.63, 0.3, 'sawtooth'); // C4

        // 胜利音效 - 上升的音阶
        this.sounds.win = this.createChordSound([523.25, 659.25, 783.99], 0.5); // C5, E5, G5

        // 失败音效 - 下降的音阶
        this.sounds.lose = this.createChordSound([783.99, 659.25, 523.25], 0.5); // G5, E5, C5

        // 点击音效 - 短促的滴答声
        this.sounds.click = this.createBeepSound(392.00, 0.05, 'sine'); // G4

        // 弹跳音效 - 有弹性的音效
        this.sounds.bounce = this.createBounceSound();

        // 背景音乐占位符
        this.sounds.bgm_menu = { play: () => console.log('播放菜单背景音乐') };
        this.sounds.bgm_level1 = { play: () => console.log('播放关卡1背景音乐') };
        this.sounds.bgm_level2 = { play: () => console.log('播放关卡2背景音乐') };
        this.sounds.bgm_level3 = { play: () => console.log('播放关卡3背景音乐') };

        console.log('基础音效创建完成');
    }

    // 创建单音音效
    createBeepSound(frequency, duration, type = 'sine') {
        return {
            play: (config = {}) => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.frequency.value = frequency;
                    oscillator.type = type;

                    const volume = this.isMuted ? 0 : (config.volume || this.soundConfigs.jump.volume) * this.volume.sfx;
                    gainNode.gain.value = volume;

                    oscillator.start();
                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);
                    oscillator.stop(audioContext.currentTime + duration);

                    // 清理
                    setTimeout(() => {
                        oscillator.disconnect();
                        gainNode.disconnect();
                    }, duration * 1000 + 100);
                } catch (error) {
                    console.warn('音频播放失败:', error);
                }
            }
        };
    }

    // 创建和弦音效
    createChordSound(frequencies, duration) {
        return {
            play: (config = {}) => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const gainNode = audioContext.createGain();

                    frequencies.forEach(freq => {
                        const oscillator = audioContext.createOscillator();
                        oscillator.connect(gainNode);
                        oscillator.frequency.value = freq;
                        oscillator.type = 'sine';
                        oscillator.start();
                        oscillator.stop(audioContext.currentTime + duration);
                    });

                    gainNode.connect(audioContext.destination);

                    const volume = this.isMuted ? 0 : (config.volume || this.soundConfigs.win.volume) * this.volume.sfx;
                    gainNode.gain.value = volume;

                    gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + duration);

                    // 清理
                    setTimeout(() => {
                        gainNode.disconnect();
                    }, duration * 1000 + 100);
                } catch (error) {
                    console.warn('和弦音效播放失败:', error);
                }
            }
        };
    }

    // 创建弹跳音效
    createBounceSound() {
        return {
            play: (config = {}) => {
                try {
                    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
                    const oscillator = audioContext.createOscillator();
                    const gainNode = audioContext.createGain();

                    oscillator.connect(gainNode);
                    gainNode.connect(audioContext.destination);

                    oscillator.type = 'sine';

                    // 模拟弹跳效果：频率快速下降
                    const now = audioContext.currentTime;
                    oscillator.frequency.setValueAtTime(600, now);
                    oscillator.frequency.exponentialRampToValueAtTime(200, now + 0.3);

                    const volume = this.isMuted ? 0 : (config.volume || this.soundConfigs.bounce.volume) * this.volume.sfx;
                    gainNode.gain.setValueAtTime(volume, now);
                    gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

                    oscillator.start();
                    oscillator.stop(now + 0.3);

                    // 清理
                    setTimeout(() => {
                        oscillator.disconnect();
                        gainNode.disconnect();
                    }, 400);
                } catch (error) {
                    console.warn('弹跳音效播放失败:', error);
                }
            }
        };
    }

    // 播放音效
    playSound(key, config = {}) {
        if (!this.sounds[key]) {
            console.warn(`音效 ${key} 不存在`);
            return;
        }

        // 合并配置
        const soundConfig = { ...this.soundConfigs[key], ...config };

        try {
            this.sounds[key].play(soundConfig);
            console.log(`播放音效: ${key}`);
        } catch (error) {
            console.warn(`播放音效 ${key} 失败:`, error);
        }
    }

    // 播放背景音乐
    playBGM(key, config = {}) {
        if (!this.sounds[key]) {
            console.warn(`背景音乐 ${key} 不存在`);
            return;
        }

        // 停止当前背景音乐
        this.stopBGM();

        // 合并配置
        const bgmConfig = { ...this.soundConfigs[key], ...config };

        try {
            this.sounds[key].play(bgmConfig);
            this.currentBGM = key;
            console.log(`播放背景音乐: ${key}`);
        } catch (error) {
            console.warn(`播放背景音乐 ${key} 失败:`, error);
        }
    }

    // 停止背景音乐
    stopBGM() {
        if (this.currentBGM && this.sounds[this.currentBGM] && this.sounds[this.currentBGM].stop) {
            try {
                this.sounds[this.currentBGM].stop();
                console.log(`停止背景音乐: ${this.currentBGM}`);
            } catch (error) {
                console.warn(`停止背景音乐失败:`, error);
            }
        }
        this.currentBGM = null;
    }

    // 设置音量
    setVolume(type, value) {
        if (type === 'bgm') {
            this.volume.bgm = Math.max(0, Math.min(1, value));
            console.log(`背景音乐音量设置为: ${this.volume.bgm}`);
        } else if (type === 'sfx') {
            this.volume.sfx = Math.max(0, Math.min(1, value));
            console.log(`音效音量设置为: ${this.volume.sfx}`);
        }
    }

    // 静音/取消静音
    toggleMute() {
        this.isMuted = !this.isMuted;
        console.log(`音频 ${this.isMuted ? '已静音' : '取消静音'}`);

        // 更新UI显示
        if (typeof window.updateMuteDisplay === 'function') {
            window.updateMuteDisplay(this.isMuted);
        }

        return this.isMuted;
    }

    // 设置静音状态
    setMute(muted) {
        this.isMuted = !!muted;
        console.log(`音频静音状态设置为: ${this.isMuted}`);
        return this.isMuted;
    }

    // 保存音量设置到本地存储
    saveSettings() {
        const settings = {
            volume: this.volume,
            isMuted: this.isMuted,
            lastSaved: Date.now()
        };

        try {
            localStorage.setItem('eggPartyAudioSettings', JSON.stringify(settings));
            console.log('音频设置已保存到本地存储');
        } catch (error) {
            console.warn('保存音频设置失败:', error);
        }
    }

    // 从本地存储加载音量设置
    loadSettings() {
        try {
            const saved = localStorage.getItem('eggPartyAudioSettings');
            if (saved) {
                const settings = JSON.parse(saved);
                this.volume = settings.volume || this.volume;
                this.isMuted = settings.isMuted || false;
                console.log('音频设置已从本地存储加载');
            }
        } catch (error) {
            console.warn('加载音频设置失败:', error);
        }
    }

    // 播放跳跃音效
    playJump() {
        this.playSound('jump');
    }

    // 播放收集音效
    playCollect() {
        this.playSound('collect');
    }

    // 播放受伤音效
    playHurt() {
        this.playSound('hurt');
    }

    // 播放胜利音效
    playWin() {
        this.playSound('win');
    }

    // 播放失败音效
    playLose() {
        this.playSound('lose');
    }

    // 播放点击音效
    playClick() {
        this.playSound('click');
    }

    // 播放弹跳音效
    playBounce() {
        this.playSound('bounce');
    }

    // 播放菜单背景音乐
    playMenuBGM() {
        this.playBGM('bgm_menu');
    }

    // 播放关卡背景音乐
    playLevelBGM(levelNumber = 1) {
        const bgmKey = `bgm_level${levelNumber}`;
        this.playBGM(bgmKey);
    }

    // 停止所有声音
    stopAll() {
        this.stopBGM();
        console.log('所有声音已停止');
    }

    // 销毁资源
    destroy() {
        this.stopAll();
        this.sounds = {};
        console.log('音频管理器资源已销毁');
    }
}

// 全局音频管理器实例
let audioManagerInstance = null;

// 获取或创建音频管理器实例
function getAudioManager(scene) {
    if (!audioManagerInstance) {
        audioManagerInstance = new AudioManager(scene);
    }
    return audioManagerInstance;
}

// 导出类
window.AudioManager = AudioManager;
window.getAudioManager = getAudioManager;

// 全局音频控制函数
window.audioControl = {
    toggleMute: () => {
        if (audioManagerInstance) {
            return audioManagerInstance.toggleMute();
        }
        return false;
    },

    setVolume: (type, value) => {
        if (audioManagerInstance) {
            audioManagerInstance.setVolume(type, value);
            audioManagerInstance.saveSettings();
        }
    },

    playJump: () => {
        if (audioManagerInstance) {
            audioManagerInstance.playJump();
        }
    },

    playCollect: () => {
        if (audioManagerInstance) {
            audioManagerInstance.playCollect();
        }
    }
};