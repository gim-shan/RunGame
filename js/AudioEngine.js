class AudioEngine {
    constructor() {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        this.ctx = new AudioContext();
        
        this.masterGain = this.ctx.createGain();
        this.masterGain.gain.value = 0.3; 
        this.masterGain.connect(this.ctx.destination);
        
        this.isInitialized = false;
        this.isPlayingMusic = false;
        this.musicInterval = null;
    }

    init() {
        if (!this.isInitialized) {
            this.ctx.resume();
            this.isInitialized = true;
        }
    }

    playJump() {
        if (!this.isInitialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        let time = this.ctx.currentTime;
        
        osc.type = 'square'; 
        osc.frequency.setValueAtTime(150, time);
        osc.frequency.exponentialRampToValueAtTime(400, time + 0.1);
        
        gain.gain.setValueAtTime(0.1, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.15);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.15);
    }

    // --- NEW: DASH SOUND ---
    playDash() {
        if (!this.isInitialized) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();
        let time = this.ctx.currentTime;
        
        osc.type = 'sawtooth'; 
        // High frequency dropping fast creates a "pew!" laser/dash sound
        osc.frequency.setValueAtTime(800, time);
        osc.frequency.exponentialRampToValueAtTime(100, time + 0.2);
        
        gain.gain.setValueAtTime(0.15, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        osc.connect(gain);
        gain.connect(this.masterGain);
        osc.start(time);
        osc.stop(time + 0.2);
    }

    // --- NEW: OBSTACLE SMASH SOUND ---
    playBreak() {
        if (!this.isInitialized) return;
        let time = this.ctx.currentTime;
        
        const bufferSize = this.ctx.sampleRate * 0.2; 
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
            data[i] = Math.random() * 2 - 1; 
        }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'highpass'; // Highpass makes it sound like shattering glass/data
        filter.frequency.setValueAtTime(1000, time);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.3, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.2);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }

    playPowerUp() {
        if (!this.isInitialized) return;
        let time = this.ctx.currentTime;
        const notes = [523.25, 659.25, 783.99, 1046.50]; 
        
        notes.forEach((freq, i) => {
            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            osc.type = 'sine'; 
            osc.frequency.value = freq;
            
            let noteTime = time + (i * 0.08); 
            gain.gain.setValueAtTime(0.15, noteTime);
            gain.gain.exponentialRampToValueAtTime(0.01, noteTime + 0.3);
            
            osc.connect(gain);
            gain.connect(this.masterGain);
            osc.start(noteTime);
            osc.stop(noteTime + 0.3);
        });
    }

    playCrash() {
        if (!this.isInitialized) return;
        let time = this.ctx.currentTime;
        const bufferSize = this.ctx.sampleRate * 0.5; 
        const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
        const data = buffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) { data[i] = Math.random() * 2 - 1; }
        
        const noise = this.ctx.createBufferSource();
        noise.buffer = buffer;
        
        const filter = this.ctx.createBiquadFilter();
        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1000, time);
        filter.frequency.exponentialRampToValueAtTime(100, time + 0.4);
        
        const gain = this.ctx.createGain();
        gain.gain.setValueAtTime(0.5, time);
        gain.gain.exponentialRampToValueAtTime(0.01, time + 0.4);
        
        noise.connect(filter);
        filter.connect(gain);
        gain.connect(this.masterGain);
        noise.start(time);
    }

    startMusic() {
        if (!this.isInitialized || this.isPlayingMusic) return;
        this.isPlayingMusic = true;
        let step = 0;
        const bassNotes = [55.00, 55.00, 65.41, 49.00]; 

        this.musicInterval = setInterval(() => {
            if(this.ctx.state !== 'running') return;
            let time = this.ctx.currentTime;
            
            let osc = this.ctx.createOscillator();
            let gain = this.ctx.createGain();
            let filter = this.ctx.createBiquadFilter();
            
            osc.type = 'sawtooth';
            osc.frequency.value = bassNotes[step % 4];
            
            filter.type = 'lowpass';
            filter.frequency.setValueAtTime(200, time);
            filter.frequency.exponentialRampToValueAtTime(1500, time + 0.05);
            filter.frequency.exponentialRampToValueAtTime(100, time + 0.2);

            gain.gain.setValueAtTime(0.15, time);
            gain.gain.exponentialRampToValueAtTime(0.001, time + 0.2);

            osc.connect(filter);
            filter.connect(gain);
            gain.connect(this.masterGain);
            
            osc.start(time);
            osc.stop(time + 0.2);

            if (step % 2 === 0) {
                let kickOsc = this.ctx.createOscillator();
                let kickGain = this.ctx.createGain();
                kickOsc.frequency.setValueAtTime(150, time);
                kickOsc.frequency.exponentialRampToValueAtTime(0.01, time + 0.1);
                kickGain.gain.setValueAtTime(0.4, time);
                kickGain.gain.exponentialRampToValueAtTime(0.01, time + 0.1);
                kickOsc.connect(kickGain);
                kickGain.connect(this.masterGain);
                kickOsc.start(time);
                kickOsc.stop(time + 0.1);
            }
            step++;
        }, 220); 
    }

    stopMusic() {
        this.isPlayingMusic = false;
        clearInterval(this.musicInterval);
    }
}