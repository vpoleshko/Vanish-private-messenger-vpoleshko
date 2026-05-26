const FFT_SIZE   = 2048
const HOP_SIZE   = 512
const LIFTER     = 64    
export class VoiceAnonymizer {
  constructor(pitchFactor = 0.71) {
    this.pitch   = pitchFactor
    this._inBuf  = new Float32Array(FFT_SIZE)
    this._outBuf = new Float32Array(FFT_SIZE + HOP_SIZE)
    this._phaIn  = new Float32Array(FFT_SIZE / 2 + 1)
    this._phaOut = new Float32Array(FFT_SIZE / 2 + 1)
    this._win    = _hannWindow(FFT_SIZE)
  }

  process(input) {
    const N    = FFT_SIZE
    const hop  = HOP_SIZE
    const bins = N / 2 + 1

    this._inBuf.copyWithin(0, hop)
    this._inBuf.set(input, N - hop)

    const frame = new Float32Array(N)
    for (let i = 0; i < N; i++) frame[i] = this._inBuf[i] * this._win[i]

    const [reA, imA] = _fft(frame)

    const mag = new Float32Array(bins)
    const pha = new Float32Array(bins)
    for (let k = 0; k < bins; k++) {
      mag[k] = Math.sqrt(reA[k] ** 2 + imA[k] ** 2)
      pha[k] = Math.atan2(imA[k], reA[k])
    }

    const env = _spectralEnvelope(mag, N, LIFTER)

    const omega    = 2 * Math.PI * hop / N
    const trueFreq = new Float32Array(bins)
    for (let k = 0; k < bins; k++) {
      let dphi = pha[k] - this._phaIn[k] - k * omega
      dphi -= 2 * Math.PI * Math.round(dphi / (2 * Math.PI))
      trueFreq[k]   = k + dphi / omega
      this._phaIn[k] = pha[k]
    }

    const magOut = new Float32Array(bins)
    for (let k = 0; k < bins; k++) {
      const kNew = Math.round(k * this.pitch)
      if (kNew < bins) {
        magOut[kNew] += mag[k]
        this._phaOut[kNew] += trueFreq[k] * this.pitch * omega
      }
    }

    const envShifted = _spectralEnvelope(magOut, N, LIFTER)
    for (let k = 0; k < bins; k++) {
      if (envShifted[k] > 1e-8)
        magOut[k] = (magOut[k] / envShifted[k]) * env[Math.min(Math.round(k / this.pitch), bins - 1)]
    }

    const reS = new Float32Array(N)
    const imS = new Float32Array(N)
    for (let k = 0; k < bins; k++) {
      reS[k] = magOut[k] * Math.cos(this._phaOut[k])
      imS[k] = magOut[k] * Math.sin(this._phaOut[k])
      if (k > 0 && k < bins - 1) {
        reS[N - k] =  reS[k]
        imS[N - k] = -imS[k]
      }
    }
    const synth = _ifft(reS, imS)

    for (let i = 0; i < N; i++)
      this._outBuf[i] += synth[i] * this._win[i]

    const out = this._outBuf.slice(0, hop)

    this._outBuf.copyWithin(0, hop)
    this._outBuf.fill(0, N)

    const gain = 2 * hop / N
    for (let i = 0; i < hop; i++) out[i] *= gain

    return out
  }
}

function _spectralEnvelope(mag, N, lifter) {
  const bins = N / 2 + 1

  const logMag = new Float32Array(N)
  for (let k = 0; k < bins; k++) {
    logMag[k] = Math.log(mag[k] + 1e-8)
    if (k > 0 && k < bins - 1) logMag[N - k] = logMag[k]
  }

  const [cepRe] = _ifft_full(logMag, new Float32Array(N))

  const lifted = new Float32Array(N)
  for (let i = 0; i <= lifter; i++) lifted[i] = cepRe[i]
  for (let i = N - lifter; i < N; i++) lifted[i] = cepRe[i]

  const [envRe] = _fft(lifted)

  const env = new Float32Array(bins)
  for (let k = 0; k < bins; k++)
    env[k] = Math.exp(envRe[k] / N)

  return env
}

function _hannWindow(n) {
  const w = new Float32Array(n)
  for (let i = 0; i < n; i++)
    w[i] = 0.5 * (1 - Math.cos(2 * Math.PI * i / (n - 1)))
  return w
}

function _fftInPlace(re, im) {
  const N = re.length
  let j = 0
  for (let i = 1; i < N; i++) {
    let bit = N >> 1
    for (; j & bit; bit >>= 1) j ^= bit
    j ^= bit
    if (i < j) {
      ;[re[i], re[j]] = [re[j], re[i]]
      ;[im[i], im[j]] = [im[j], im[i]]
    }
  }
  for (let len = 2; len <= N; len <<= 1) {
    const half   = len >> 1
    const angInc = -2 * Math.PI / len
    for (let i = 0; i < N; i += len) {
      let wr = 1, wi = 0
      const wdr = Math.cos(angInc), wdi = Math.sin(angInc)
      for (let k = 0; k < half; k++) {
        const tr = wr * re[i + k + half] - wi * im[i + k + half]
        const ti = wr * im[i + k + half] + wi * re[i + k + half]
        re[i + k + half] = re[i + k] - tr
        im[i + k + half] = im[i + k] - ti
        re[i + k] += tr
        im[i + k] += ti
        ;[wr, wi] = [wr * wdr - wi * wdi, wr * wdi + wi * wdr]
      }
    }
  }
}

function _fft(input) {
  const re = new Float32Array(input)
  const im = new Float32Array(input.length)
  _fftInPlace(re, im)
  return [re, im]
}

function _ifft(reIn, imIn) {
  const N  = reIn.length
  const re = new Float32Array(reIn)
  const im = new Float32Array(N)
  for (let i = 0; i < N; i++) im[i] = -imIn[i]
  _fftInPlace(re, im)
  const out = new Float32Array(N)
  for (let i = 0; i < N; i++) out[i] = re[i] / N
  return out
}

function _ifft_full(reIn, imIn) {
  const N  = reIn.length
  const re = new Float32Array(reIn)
  const im = new Float32Array(N)
  for (let i = 0; i < N; i++) im[i] = -imIn[i]
  _fftInPlace(re, im)
  for (let i = 0; i < N; i++) { re[i] /= N; im[i] /= -N }
  return [re, im]
}
