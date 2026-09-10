import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

type Consent = { essential: true; analytics: boolean; prefs: boolean; decided: true }

export function CookieConsent() {
  const [visible, setVisible] = useState(false)
  const [manage, setManage] = useState(false)
  const [analytics, setAnalytics] = useState(true)
  const [prefs, setPrefs] = useState(true)

  useEffect(() => {
    const open = () => { setVisible(true); setManage(false) }
    window.addEventListener('vl:cookie-open', open)
    if (!localStorage.getItem('vl_cookie_consent')) setTimeout(open, 80)
    return () => window.removeEventListener('vl:cookie-open', open)
  }, [])

  const save = (consent: Consent) => {
    localStorage.setItem('vl_cookie_consent', JSON.stringify(consent))
    document.cookie = `vl_cookie_consent=${encodeURIComponent(JSON.stringify(consent))}; Max-Age=31536000; Path=/; SameSite=Lax`
    setVisible(false)
  }

  return <div className={`cookie-banner ${visible ? 'visible' : ''}`} style={!visible ? { pointerEvents: 'none' } : undefined} role="dialog" aria-label="Cookie consent" aria-live="polite">
    <div className="cookie-banner-inner">
      <div className="cookie-banner-left"><div className="cookie-banner-icon" aria-hidden="true"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1"><path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2z"/><circle cx="8.5" cy="10.5" r="1"/><circle cx="14" cy="8" r="1"/><circle cx="15" cy="14" r="1"/></svg></div><div className="cookie-banner-text"><p className="cookie-banner-title">We use cookies</p><p className="cookie-banner-desc">We use cookies to enhance your browsing experience and analyse site traffic. By clicking <strong>Accept All</strong>, you consent to our use of cookies. <Link to="/cookie-policy" className="cookie-link">Learn more</Link></p></div></div>
      <div className="cookie-banner-actions"><button className="cookie-btn cookie-btn-manage" onClick={() => setManage(!manage)} aria-expanded={manage}>Manage Preferences</button><button className="cookie-btn cookie-btn-reject" onClick={() => save({ essential:true, analytics:false, prefs:false, decided:true })}>Reject Non-Essential</button><button className="cookie-btn cookie-btn-accept" onClick={() => save({ essential:true, analytics:true, prefs:true, decided:true })}>Accept All</button></div>
    </div>
    <div className="cookie-manage-panel" hidden={!manage}><div className="cookie-manage-inner"><p className="cookie-manage-intro">Choose which cookies you allow. Essential cookies cannot be disabled as they are required for the site to function.</p><div className="cookie-toggle-list">
      <CookieRow name="Essential Cookies" desc="Required for the website to function. Cannot be disabled." locked />
      <CookieRow name="Analytics Cookies" desc="Help us understand how visitors interact with our site." checked={analytics} onChange={setAnalytics} />
      <CookieRow name="Preference Cookies" desc="Remember your settings and personalise your experience." checked={prefs} onChange={setPrefs} />
    </div><div className="cookie-manage-footer"><button className="cookie-btn cookie-btn-save" onClick={() => save({ essential:true, analytics, prefs, decided:true })}>Save Preferences</button></div></div></div>
  </div>
}

function CookieRow({ name, desc, locked, checked, onChange }: { name:string; desc:string; locked?:boolean; checked?:boolean; onChange?:(v:boolean)=>void }) {
  return <div className="cookie-toggle-row"><div className="cookie-toggle-info"><span className="cookie-toggle-name">{name}</span><span className="cookie-toggle-desc">{desc}</span></div>{locked ? <span className="cookie-toggle-always">Always On</span> : <label className="cookie-switch"><input type="checkbox" checked={checked} onChange={(e) => onChange?.(e.target.checked)}/><span className="cookie-switch-track"/></label>}</div>
}
