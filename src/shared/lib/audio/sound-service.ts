import { ref } from 'vue'

const STORAGE_KEY_MUTED = 'lern_sound_muted'

/**
 * Web Audio Синтезатор микроэффектов для LERN Platform
 * Генерирует кристально чистые процедурные звуки без необходимости подгружать внешние файлы
 */
class SoundService {
  private ctx: AudioContext | null = null
  public isMuted = ref<boolean>(false)
  private masterVolume = 0.35

  constructor() {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem(STORAGE_KEY_MUTED)
      if (saved !== null) {
        this.isMuted.value = saved === 'true'
      }
    }
  }

  /**
   * Инициализация или разблокировка AudioContext при первом пользовательском жесте
   */
  private getContext(): AudioContext | null {
    if (typeof window === 'undefined') return null

    if (!this.ctx) {
      const AudioCtx = window.AudioContext || (window as any).webkitAudioContext
      if (AudioCtx) {
        this.ctx = new AudioCtx()
      }
    }

    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {})
    }

    return this.ctx
  }

  /**
   * Переключение беззвучного режима
   */
  public toggleMute(): boolean {
    this.isMuted.value = !this.isMuted.value
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_MUTED, String(this.isMuted.value))
    }
    // Если включили звук, сыграем легкий подтверждающий щелчок
    if (!this.isMuted.value) {
      this.playFlip()
    }
    return this.isMuted.value
  }

  /**
   * Установка громкости (от 0 до 1)
   */
  public setVolume(vol: number): void {
    this.masterVolume = Math.max(0, Math.min(1, vol))
  }

  /**
   * 1. Тактильный щелчок / шелест переворота карточки (3D Flip)
   * Мягкий деревянно-пергаментный щелчок с быстрым спадом частоты
   */
  public playFlip(): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()
    const filter = ctx.createBiquadFilter()

    osc.type = 'triangle'
    // Быстрое скольжение частоты для эффекта тактильного щелчка
    osc.frequency.setValueAtTime(380, now)
    osc.frequency.exponentialRampToValueAtTime(140, now + 0.05)

    filter.type = 'lowpass'
    filter.frequency.setValueAtTime(800, now)

    const vol = this.masterVolume * 0.4
    gain.gain.setValueAtTime(vol, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.06)

    osc.connect(filter)
    filter.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.07)
  }

  /**
   * 2. Подсказка (Hint ping)
   * Легкий кристальный стеклянный звук
   */
  public playHint(): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'sine'
    osc.frequency.setValueAtTime(740, now) // F#5
    osc.frequency.exponentialRampToValueAtTime(880, now + 0.1) // A5

    const vol = this.masterVolume * 0.3
    gain.gain.setValueAtTime(vol, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  /**
   * 3. «Знаю!» / Успех (Success Chime & Combo)
   * Восходящее мажорное созвучие, становящееся ярче при высоком комбо
   */
  public playSuccess(combo: number = 0): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const pitchMultiplier = 1 + Math.min(0.3, combo * 0.05)

    // Две основные ноты C5 -> G5 (или три ноты при комбо)
    const notes = [
      { freq: 523.25 * pitchMultiplier, delay: 0 },
      { freq: 659.25 * pitchMultiplier, delay: 0.06 },
      { freq: 783.99 * pitchMultiplier, delay: 0.12 },
    ]

    notes.forEach((n) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(n.freq, now + n.delay)

      const vol = this.masterVolume * 0.35
      gain.gain.setValueAtTime(0.001, now + n.delay)
      gain.gain.linearRampToValueAtTime(vol, now + n.delay + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + 0.25)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + n.delay)
      osc.stop(now + n.delay + 0.28)
    })
  }

  /**
   * 4. «Сомневаюсь» (Doubt tone)
   * Мягкий теплый двухтоновый перелив
   */
  public playDoubt(): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const notes = [
      { freq: 440, delay: 0 }, // A4
      { freq: 554.37, delay: 0.07 }, // C#5
    ]

    notes.forEach((n) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(n.freq, now + n.delay)

      const vol = this.masterVolume * 0.25
      gain.gain.setValueAtTime(0.001, now + n.delay)
      gain.gain.linearRampToValueAtTime(vol, now + n.delay + 0.015)
      gain.gain.exponentialRampToValueAtTime(0.001, now + n.delay + 0.2)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + n.delay)
      osc.stop(now + n.delay + 0.22)
    })
  }

  /**
   * 5. «Повторить» (Repeat tone)
   * Мягкий приглушенный нисходящий тон (возврат в колоду)
   */
  public playRepeat(): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    const osc = ctx.createOscillator()
    const gain = ctx.createGain()

    osc.type = 'triangle'
    osc.frequency.setValueAtTime(220, now) // A3
    osc.frequency.exponentialRampToValueAtTime(146.83, now + 0.12) // D3

    const vol = this.masterVolume * 0.28
    gain.gain.setValueAtTime(vol, now)
    gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18)

    osc.connect(gain)
    gain.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + 0.2)
  }

  /**
   * 6. Победный перезвон (Victory Chime)
   * Восхитительный кристальный каскад нот в финале завершенной тренировки
   */
  public playVictoryChime(): void {
    if (this.isMuted.value) return
    const ctx = this.getContext()
    if (!ctx) return

    const now = ctx.currentTime
    // Каскад мажорных тонов: C5 -> E5 -> G5 -> B5 -> C6
    const chord = [
      { freq: 523.25, delay: 0 },
      { freq: 659.25, delay: 0.1 },
      { freq: 783.99, delay: 0.2 },
      { freq: 987.77, delay: 0.3 },
      { freq: 1046.5, delay: 0.42, longDecay: true },
    ]

    chord.forEach((note) => {
      const osc = ctx.createOscillator()
      const gain = ctx.createGain()

      osc.type = 'sine'
      osc.frequency.setValueAtTime(note.freq, now + note.delay)

      const vol = this.masterVolume * 0.32
      const decayDuration = note.longDecay ? 0.9 : 0.35

      gain.gain.setValueAtTime(0.001, now + note.delay)
      gain.gain.linearRampToValueAtTime(vol, now + note.delay + 0.02)
      gain.gain.exponentialRampToValueAtTime(0.001, now + note.delay + decayDuration)

      osc.connect(gain)
      gain.connect(ctx.destination)

      osc.start(now + note.delay)
      osc.stop(now + note.delay + decayDuration + 0.05)
    })
  }
}

export const soundService = new SoundService()
