
class MiauAudioEngine {
  private sounds: Record<string, HTMLAudioElement> = {};
  private audioPath = './audio/'; 
  private unlocked = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.init();
    }
  }

  private async init() {
    // Tentamos carregar os sons preferidos do Mestre
    await Promise.all([
      this.loadSound('btClick', ['Btclick.wav', 'Btclick.mp3', 'BtClick.wav', 'btclick.wav']),
      this.loadSound('mouseClick', ['Click.wav', 'Click.mp3', 'click.wav', 'clic.wav', 'Clic.wav'])
    ]);
  }

  private async loadSound(key: string, filenames: string[]) {
    for (const filename of filenames) {
      try {
        const audio = new Audio(`${this.audioPath}${filename}`);
        audio.preload = 'auto';
        
        // Usamos uma verificação mais robusta que o oncanplaythrough
        const success = await new Promise((resolve) => {
          const timeout = setTimeout(() => resolve(false), 1500);
          
          audio.oncanplaythrough = () => {
            clearTimeout(timeout);
            resolve(true);
          };
          
          audio.onerror = () => {
            clearTimeout(timeout);
            resolve(false);
          };

          // Força o carregamento
          audio.load();
        });

        if (success) {
          this.sounds[key] = audio;
          console.debug(`[MiauAudio] Som carregado com sucesso: ${filename}`);
          return; // Sai do loop se carregar um
        }
      } catch (e) {
        continue; 
      }
    }
    console.debug(`[MiauAudio] Usando fallback sintético para: ${key}`);
  }

  // Desbloqueia o áudio no primeiro clique do usuário (exigência do browser)
  public async unlock() {
    if (this.unlocked) return;
    
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }
      this.unlocked = true;
      console.debug('[MiauAudio] Sistema de áudio desbloqueado pelo Mestre.');
    } catch (e) {
      console.warn('[MiauAudio] Falha ao desbloquear áudio:', e);
    }
  }

  private play(key: string) {
    const audio = this.sounds[key];
    if (audio) {
      audio.currentTime = 0;
      audio.play().catch(() => {
        // Se falhar (autoplay), tentamos o fallback
        this.playFallbackBeep(key === 'btClick' ? 600 : 400);
      });
    } else {
      this.playFallbackBeep(key === 'btClick' ? 600 : 400);
    }
  }

  public playBtClick() {
    this.play('btClick');
  }

  public playMouseClick() {
    this.play('mouseClick');
  }

  private playFallbackBeep(freq: number) {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(100, ctx.currentTime + 0.1);
      gain.gain.setValueAtTime(0.05, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.1);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.1);
    } catch (e) { }
  }
}

export const miauAudio = new MiauAudioEngine();
