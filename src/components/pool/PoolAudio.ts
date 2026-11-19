/**
 * 8-Ball Pool Pro - In-House Procedural Audio Synthesizer
 * Uses Web Audio API to synthesize acoustic cue sports sounds:
 * - Cue strike pop
 * - Phenolic resin ball-to-ball collision clack
 * - Rubber cushion bumper thud
 * - Leather pocket drop rattle
 * - Foul error tone
 * - Victory fanfare
 *
 * 100% self-contained, no external asset dependencies.
 */

class PoolAudioSynthesizer {
  private ctx: AudioContext | null = null;
  private enabled: boolean = true;

  private initContext() {
    if (typeof window === 'undefined') return null;
    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioCtx) {
        this.ctx = new AudioCtx();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public setMuted(muted: boolean) {
    this.enabled = !muted;
  }

  public isMuted(): boolean {
    return !this.enabled;
  }

  /**
   * Cue stick striking the cue ball (wood on leather and resin)
   */
  public playCueStrike(power = 0.5) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = Math.min(1.0, Math.max(0.1, power * 0.9));

      // Noise burst for leather tip contact
      const bufferSize = ctx.sampleRate * 0.04;
      const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.2));
      }

      const noise = ctx.createBufferSource();
      noise.buffer = buffer;

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.frequency.setValueAtTime(1400, now);
      filter.Q.setValueAtTime(3.0, now);

      const gain = ctx.createGain();
      gain.gain.setValueAtTime(vol * 0.7, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);

      noise.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);
      noise.start(now);

      // Low frequency body impulse
      const osc = ctx.createOscillator();
      const oscGain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(320, now);
      osc.frequency.exponentialRampToValueAtTime(80, now + 0.06);

      oscGain.gain.setValueAtTime(vol * 0.6, now);
      oscGain.gain.exponentialRampToValueAtTime(0.001, now + 0.06);

      osc.connect(oscGain);
      oscGain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.07);
    } catch {
      // Audio playback fails gracefully if blocked by autoplay policies
    }
  }

  /**
   * Hard resin ball-to-ball impact click
   */
  public playBallCollision(speed = 1.0) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const normalizedSpeed = Math.min(1.0, Math.max(0.15, speed / 15));

      // Sharp resonant click
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      // Pitch varies slightly for realism
      const pitch = 2200 + Math.random() * 400;
      osc.frequency.setValueAtTime(pitch, now);
      osc.frequency.exponentialRampToValueAtTime(1100, now + 0.025);

      gain.gain.setValueAtTime(normalizedSpeed * 0.5, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.03);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.035);
    } catch {}
  }

  /**
   * Rubber cushion bumper bounce
   */
  public playCushionBounce(speed = 1.0) {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const vol = Math.min(0.6, Math.max(0.1, speed / 18));

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(160, now);
      osc.frequency.exponentialRampToValueAtTime(60, now + 0.07);

      gain.gain.setValueAtTime(vol * 0.4, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.09);
    } catch {}
  }

  /**
   * Ball falling into pocket (leather net drop & rattle)
   */
  public playPocketDrop() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;

      // First clunk
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.type = 'sine';
      osc1.frequency.setValueAtTime(380, now);
      osc1.frequency.exponentialRampToValueAtTime(120, now + 0.12);

      gain1.gain.setValueAtTime(0.4, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.14);

      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.15);

      // Secondary rattle
      setTimeout(() => {
        if (!this.ctx) return;
        const t2 = this.ctx.currentTime;
        const osc2 = this.ctx.createOscillator();
        const gain2 = this.ctx.createGain();
        osc2.type = 'triangle';
        osc2.frequency.setValueAtTime(240, t2);
        osc2.frequency.exponentialRampToValueAtTime(80, t2 + 0.1);

        gain2.gain.setValueAtTime(0.25, t2);
        gain2.gain.exponentialRampToValueAtTime(0.001, t2 + 0.11);

        osc2.connect(gain2);
        gain2.connect(this.ctx.destination);
        osc2.start(t2);
        osc2.stop(t2 + 0.12);
      }, 70);
    } catch {}
  }

  /**
   * Scratch or foul buzzer tone
   */
  public playFoulBuzzer() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.setValueAtTime(140, now + 0.15);

      gain.gain.setValueAtTime(0.3, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(now);
      osc.stop(now + 0.38);
    } catch {}
  }

  /**
   * Victory celebration fanfare
   */
  public playVictoryFanfare() {
    if (!this.enabled) return;
    const ctx = this.initContext();
    if (!ctx) return;

    try {
      const chords = [
        { freq: 440, delay: 0 },    // A4
        { freq: 554.37, delay: 0.12 }, // C#5
        { freq: 659.25, delay: 0.24 }, // E5
        { freq: 880, delay: 0.38 },    // A5
      ];

      chords.forEach(({ freq, delay }) => {
        setTimeout(() => {
          if (!this.ctx) return;
          const t = this.ctx.currentTime;
          const osc = this.ctx.createOscillator();
          const gain = this.ctx.createGain();

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, t);

          gain.gain.setValueAtTime(0.35, t);
          gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);

          osc.connect(gain);
          gain.connect(this.ctx.destination);
          osc.start(t);
          osc.stop(t + 0.52);
        }, delay * 1000);
      });
    } catch {}
  }
}

export const poolAudio = new PoolAudioSynthesizer();
