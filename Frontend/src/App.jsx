import { useEffect, useRef, useState } from 'react'
import QRCode from 'qrcode'

function App() {
  const [content, setContent] = useState('')
  const [logo, setLogo] = useState('')
  const [qr, setQr] = useState('')
  const [error, setError] = useState('')
  const [format, setFormat] = useState('png')
  const [resolution, setResolution] = useState('2048')
  const [qrColor, setQrColor] = useState('#17212b')
  const [logoSize, setLogoSize] = useState('17')
  const fileRef = useRef(null)

  useEffect(() => {
    let active = true
    if (!content.trim()) return () => { active = false }
    QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H', margin: 2, width: 640,
      color: { dark: qrColor, light: '#ffffff' },
    }).then((url) => {
      if (active) { setQr(url); setError('') }
    }).catch(() => { if (active) setError('This content is too long to fit in a QR code.') })
    return () => { active = false }
  }, [content, qrColor])

  const updateContent = (value) => {
    setContent(value)
    if (!value.trim()) {
      setQr('')
      setError('')
    }
  }

  const selectLogo = (event) => {
    const file = event.target.files?.[0]
    if (!file) return
    if (!file.type.startsWith('image/')) { setError('Choose an image file.'); return }
    if (file.size > 5 * 1024 * 1024) { setError('Choose an image under 5 MB.'); return }
    const reader = new FileReader()
    reader.onload = () => setLogo(String(reader.result))
    reader.onerror = () => setError('Could not read that image. Try another file.')
    reader.readAsDataURL(file)
    event.target.value = ''
  }

  const download = async () => {
    if (!qr || !content.trim()) return
    const filename = 'qr-code'
    if (format === 'svg') {
      const svg = await QRCode.toString(content, {
        type: 'svg', errorCorrectionLevel: 'H', margin: 2,
        color: { dark: qrColor, light: '#ffffff' },
      })
      const logoPercent = Number(logoSize)
      const outerPercent = logoPercent + 4
      const outerOffset = (100 - outerPercent) / 2
      const imageOffset = (100 - logoPercent) / 2
      const withLogo = logo ? svg.replace('</svg>', `<rect x="${outerOffset}%" y="${outerOffset}%" width="${outerPercent}%" height="${outerPercent}%" rx="2%" fill="#ffffff"/><image href="${logo}" x="${imageOffset}%" y="${imageOffset}%" width="${logoPercent}%" height="${logoPercent}%" preserveAspectRatio="xMidYMid meet"/></svg>`) : svg
      const url = URL.createObjectURL(new Blob([withLogo], { type: 'image/svg+xml;charset=utf-8' }))
      const anchor = document.createElement('a')
      anchor.download = `${filename}.svg`
      anchor.href = url
      anchor.click()
      setTimeout(() => URL.revokeObjectURL(url), 1000)
      return
    }
    const size = Number(resolution)
    const imageUrl = await QRCode.toDataURL(content, {
      errorCorrectionLevel: 'H', margin: 2, width: size,
      color: { dark: qrColor, light: '#ffffff' },
    })
    const image = new Image()
    image.src = imageUrl
    await new Promise((resolve, reject) => { image.onload = resolve; image.onerror = reject })
    const canvas = document.createElement('canvas')
    canvas.width = size
    canvas.height = size
    const context = canvas.getContext('2d')
    if (format === 'jpeg') {
      context.fillStyle = '#ffffff'
      context.fillRect(0, 0, size, size)
    }
    context.drawImage(image, 0, 0, size, size)
    if (logo) {
      const mark = new Image()
      mark.src = logo
      await new Promise((resolve, reject) => { mark.onload = resolve; mark.onerror = reject })
      const markSize = size * (Number(logoSize) / 100)
      const inset = size * 0.019
      const outerSize = markSize + inset * 2
      const left = (size - outerSize) / 2
      context.fillStyle = '#ffffff'
      context.beginPath()
      context.roundRect(left, left, outerSize, outerSize, size * 0.028)
      context.fill()
      context.drawImage(mark, left + inset, left + inset, markSize, markSize)
    }
    const mime = format === 'jpeg' ? 'image/jpeg' : `image/${format}`
    const anchor = document.createElement('a')
    anchor.download = `${filename}.${format}`
    anchor.href = canvas.toDataURL(mime, 0.98)
    anchor.click()
  }

  return (
    <main className="app-shell">
      <header className="topbar">
        <a className="brand" href="#top" aria-label="QR Code Generator home">
          <span className="brand-mark"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 4h6v6H4zM14 4h6v6h-6zM4 14h6v6H4zM14 14h2v2h-2zM18 14h2v6h-2zM14 18h2v2h-2z" /></svg></span>
          <span>QR code generator</span>
        </a>
      </header>

      <section className="generator" id="top">
        <div className="form-panel">
          <h1>Create a QR code</h1>
          <p className="intro">Paste a link or enter text to get started.</p>

          <label className="field-label" htmlFor="qr-content">LINK OR TEXT</label>
          <div className="textarea-wrap">
            <textarea id="qr-content" value={content} onChange={(event) => updateContent(event.target.value)} placeholder="https://example.com or enter text" maxLength={2900} />
            <span className="character-count">{content.length} / 2,900</span>
          </div>

          <div className="logo-section">
            <div className="logo-label-row"><label className="field-label" htmlFor="logo-upload">CENTER LOGO <span>(OPTIONAL)</span></label>{logo && <button className="text-button" onClick={() => setLogo('')}>Remove</button>}</div>
            <input ref={fileRef} id="logo-upload" className="visually-hidden" type="file" accept="image/*" onChange={selectLogo} />
            <button className="logo-picker" onClick={() => fileRef.current?.click()}>
              {logo ? <img src={logo} alt="Selected logo" className="uploaded-logo" /> : <span className="upload-plus" aria-hidden="true">+</span>}
              <span>{logo ? 'Change logo' : 'Add a logo'}</span><small>Image file | up to 5 MB</small>
            </button>
          </div>

          <details className="download-options">
            <summary>Download options <span>| {format.toUpperCase()}{format !== 'svg' ? `, ${resolution}px` : ', vector'}</span></summary>
            <div className="export-controls">
              <label>FORMAT<select value={format} onChange={(event) => setFormat(event.target.value)}><option value="png">PNG | lossless</option><option value="svg">SVG | vector</option><option value="jpeg">JPEG | high quality</option><option value="webp">WebP | high quality</option></select></label>
              {format !== 'svg' && <label>SIZE<select value={resolution} onChange={(event) => setResolution(event.target.value)}><option value="640">640 x 640</option><option value="1280">1280 x 1280</option><option value="2048">2048 x 2048</option><option value="4096">4096 x 4096</option></select></label>}
              <label className="color-control" htmlFor="qr-color">QR COLOR<input id="qr-color" type="color" value={qrColor} onChange={(event) => setQrColor(event.target.value)} /></label>
              {logo && <label className="range-control" htmlFor="logo-size">LOGO SIZE <output>{logoSize}%</output><input id="logo-size" type="range" min="10" max="24" step="1" value={logoSize} onChange={(event) => setLogoSize(event.target.value)} /></label>}
            </div>
          </details>

          {error && <p className="error-message" role="status">{error}</p>}
          <button className="download-button" onClick={download} disabled={!qr || Boolean(error)}><span>Download QR code</span><span aria-hidden="true">Download</span></button>
          <p className="privacy-note">Generated in your browser | No expiration or redirects</p>
        </div>

        <aside className="preview-card" aria-label="QR code preview">
          <div className="preview-heading">PREVIEW</div>
          <div className="qr-stage">
            {qr ? <div className="qr-image-wrap"><img className="qr-image" src={qr} alt="QR code preview" />{logo && <img className="qr-logo" src={logo} alt="" style={{ width: `${logoSize}%`, height: `${logoSize}%` }} />}</div> : <div className="qr-empty">Your QR code will appear here</div>}
          </div>
        </aside>
      </section>

      <footer className="site-footer">
        Developed by <a href="https://www.kryvazent.com/" target="_blank" rel="noreferrer">Kryvazent</a>
      </footer>
    </main>
  )
}

export default App
