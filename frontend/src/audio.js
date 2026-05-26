import { VoiceAnonymizer } from './anonymizer.js'

const SAMPLE_RATE = 16000
const BUFFER_SIZE = 512
const INIT_DELAY  = 0.08   // 80ms jitter buffer
const ANON_PITCH  = 0.79   // ~4 semitones down + formant preserved

export class VoiceEngine {
  constructor({ onChunk }) {
    this._onChunk      = onChunk
    this._ctx          = null
    this._stream       = null
    this._processor    = null
    this._muted        = false
    this._anonymized   = true
    this._nextPlayTime = 0
    this._anon         = new VoiceAnonymizer(ANON_PITCH)
  }

  async start() {
    this._stream = await _getUserMedia()
    this._ctx = new AudioContext({ sampleRate: SAMPLE_RATE })

    const source    = this._ctx.createMediaStreamSource(this._stream)
    const processor = this._ctx.createScriptProcessor(BUFFER_SIZE, 1, 1)

    processor.onaudioprocess = (e) => {
      if (this._muted) return
      const input = e.inputBuffer.getChannelData(0)
      const frame = this._anonymized
        ? this._anon.process(input)
        : input
      this._onChunk(_toInt16Buffer(frame))
    }

    source.connect(processor)
    processor.connect(this._ctx.destination)
    this._processor = processor
  }

  receive(bufOrView) {
    if (!this._ctx) return
    const float32 = _fromInt16Buffer(bufOrView)
    const buf     = this._ctx.createBuffer(1, float32.length, SAMPLE_RATE)
    buf.getChannelData(0).set(float32)

    const now = this._ctx.currentTime
    if (this._nextPlayTime < now) this._nextPlayTime = now + INIT_DELAY

    const src = this._ctx.createBufferSource()
    src.buffer = buf
    src.connect(this._ctx.destination)
    src.start(this._nextPlayTime)
    this._nextPlayTime += buf.duration
  }

  setAnonymized(v) { this._anonymized = v }
  setMuted(v)      { this._muted = v }

  stop() {
    this._processor?.disconnect()
    this._stream?.getTracks().forEach(t => t.stop())
    this._ctx?.close()
    this._ctx          = null
    this._nextPlayTime = 0
  }
}

async function _getUserMedia() {
  const constraints = [
    { audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 } },
    { audio: { channelCount: 1 } },
    { audio: true },
  ]
  let lastErr
  for (const c of constraints) {
    try {
      console.log('[audio] getUserMedia attempt', JSON.stringify(c))
      const stream = await navigator.mediaDevices.getUserMedia(c)
      console.log('[audio] getUserMedia success')
      return stream
    } catch (err) {
      console.warn('[audio] getUserMedia failed:', err.name, err.message)
      lastErr = err
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') throw err
    }
  }
  throw lastErr
}

function _toInt16Buffer(float32) {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s  = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16.buffer
}

function _fromInt16Buffer(buf) {
  const ab    = buf instanceof ArrayBuffer
    ? buf
    : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const int16   = new Int16Array(ab)
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
  }
  return float32
}
