const SAMPLE_RATE   = 16000
const BUFFER_SIZE   = 512          // 32ms per chunk
const INIT_DELAY    = 0.08         // 80ms jitter buffer

export class VoiceEngine {
  constructor({ onChunk }) {
    this._onChunk      = onChunk   // callback(base64) → send to WS
    this._ctx          = null
    this._stream       = null
    this._processor    = null
    this._muted        = false
    this._nextPlayTime = 0
  }

  async start() {
    this._stream = await navigator.mediaDevices.getUserMedia({
      audio: { echoCancellation: true, noiseSuppression: true, channelCount: 1 },
    })

    this._ctx = new AudioContext({ sampleRate: SAMPLE_RATE })

    const source    = this._ctx.createMediaStreamSource(this._stream)
    const processor = this._ctx.createScriptProcessor(BUFFER_SIZE, 1, 1)

    processor.onaudioprocess = (e) => {
      if (this._muted) return
      const float32 = e.inputBuffer.getChannelData(0)
      this._onChunk(_toInt16Buffer(float32))
    }

    source.connect(processor)
    processor.connect(this._ctx.destination)
    this._processor = processor
  }

  receive(arrayBuffer) {
    if (!this._ctx) return
    const float32 = _fromInt16Buffer(arrayBuffer)
    const buf     = this._ctx.createBuffer(1, float32.length, SAMPLE_RATE)
    buf.getChannelData(0).set(float32)

    const now = this._ctx.currentTime
    if (this._nextPlayTime < now) {
      this._nextPlayTime = now + INIT_DELAY
    }

    const src = this._ctx.createBufferSource()
    src.buffer = buf
    src.connect(this._ctx.destination)
    src.start(this._nextPlayTime)
    this._nextPlayTime += buf.duration
  }

  setMuted(v) { this._muted = v }

  stop() {
    this._processor?.disconnect()
    this._stream?.getTracks().forEach(t => t.stop())
    this._ctx?.close()
    this._ctx          = null
    this._nextPlayTime = 0
  }
}

/* ── float32 → Int16 ArrayBuffer ── */
function _toInt16Buffer(float32) {
  const int16 = new Int16Array(float32.length)
  for (let i = 0; i < float32.length; i++) {
    const s  = Math.max(-1, Math.min(1, float32[i]))
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff
  }
  return int16.buffer
}

/* ── Int16 ArrayBuffer|Uint8Array → float32 ── */
function _fromInt16Buffer(buf) {
  const ab = buf instanceof ArrayBuffer
    ? buf
    : buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength)
  const int16   = new Int16Array(ab)
  const float32 = new Float32Array(int16.length)
  for (let i = 0; i < int16.length; i++) {
    float32[i] = int16[i] / (int16[i] < 0 ? 0x8000 : 0x7fff)
  }
  return float32
}
