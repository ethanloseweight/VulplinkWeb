import { useEffect, useState, type ReactNode } from 'react'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useSiteData } from '../context/SiteData'
import { CookieConsent } from './CookieConsent'

export function Layout({ children }: { children: ReactNode }) {
  const { categories, products, settings } = useSiteData()
  const [menuOpen, setMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [drop, setDrop] = useState('')
  const location = useLocation()
  const topCategories = categories.filter((c) => !c.parent_id).slice(0, 10)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    setMenuOpen(false)
    setDrop('')
    window.scrollTo(0, 0)
    const els = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale')
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible')
          observer.unobserve(entry.target)
        }
      })
    }, { threshold: 0.08, rootMargin: '0px 0px -30px 0px' })
    els.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [location.pathname])

  const categoryCount = (id: number) => products.filter((p) => {
    const childIds = categories.filter((c) => c.parent_id === id).map((c) => c.id)
    return p.category_ids.some((catId) => catId === id || childIds.includes(catId))
  }).length

  return <>
    <header className={`site-header ${scrolled ? 'scrolled' : ''}`} id="site-header">
      <Link className="site-logo" to="/">VULP<span>LINK</span></Link>
      <nav className={`site-nav ${menuOpen ? 'open' : ''}`} id="site-nav" aria-label="Primary">
        <NavLink to="/" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Home</NavLink>
        <div className={`nav-dropdown-wrap ${drop === 'products' ? 'open' : ''}`}>
          <NavLink to="/product" className={({ isActive }) => `nav-link nav-has-dropdown ${isActive ? 'active' : ''}`}
            onClick={(event) => { if (window.innerWidth <= 768) { event.preventDefault(); setDrop(drop === 'products' ? '' : 'products') } }}>
            Products <Chevron />
          </NavLink>
          <div className="nav-dropdown">
            <Link to="/product" className="nav-dropdown-all">All Products</Link>
            {topCategories.length ? topCategories.map((category) =>
              <Link to={`/product?category=${category.slug}`} className="nav-dropdown-item" key={category.id}>
                <span className="nav-dropdown-name">{category.name}</span>
                <span className="nav-dropdown-count">{categoryCount(category.id)}</span>
              </Link>) : <Link to="/product" className="nav-dropdown-item"><span className="nav-dropdown-name">Browse All</span></Link>}
          </div>
        </div>
        <NavLink to="/contact" className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}>Contact</NavLink>
        <div className={`nav-dropdown-wrap ${drop === 'legal' ? 'open' : ''}`}>
          <button className="nav-link nav-has-dropdown nav-button" onClick={() => setDrop(drop === 'legal' ? '' : 'legal')}>Legal <Chevron /></button>
          <div className="nav-dropdown">
            <Link to="/privacy-policy" className="nav-dropdown-item"><span className="nav-dropdown-name">Privacy Policy</span></Link>
            <Link to="/terms-of-use" className="nav-dropdown-item"><span className="nav-dropdown-name">Terms of Use</span></Link>
            <Link to="/cookie-policy" className="nav-dropdown-item"><span className="nav-dropdown-name">Cookie Policy</span></Link>
          </div>
        </div>
      </nav>
      <button className="menu-toggle" aria-label="Toggle navigation" aria-expanded={menuOpen} onClick={() => setMenuOpen(!menuOpen)}>
        <span style={menuOpen ? { transform: 'translateY(6px) rotate(45deg)' } : undefined}/>
        <span style={menuOpen ? { opacity: 0 } : undefined}/>
        <span style={menuOpen ? { transform: 'translateY(-6px) rotate(-45deg)' } : undefined}/>
      </button>
    </header>
    {children}
    <footer className="site-footer">
      <div className="footer-inner">
        <div className="footer-top">
          <div className="reveal"><Link className="footer-logo" to="/">VULP<span>LINK</span></Link><p className="footer-tagline">Precision engineered solutions for demanding environments.</p></div>
          <FooterColumn title="Navigation" links={[["Home","/"],["Products","/product"],["Contact","/contact"]]} />
          <div className="footer-col reveal d2"><h5>Contact</h5><ul><li><a href={`mailto:${settings.sales_email}`}>{settings.sales_email}</a></li><li><a href={`tel:${settings.sales_phone}`}>{settings.sales_phone}</a></li><li><a href={`mailto:${settings.support_email}`}>{settings.support_email}</a></li></ul></div>
          <FooterColumn title="Legal" links={[["Privacy Policy","/privacy-policy"],["Terms of Use","/terms-of-use"],["Cookie Policy","/cookie-policy"]]} />
        </div>
        <div className="footer-bottom"><span>© {new Date().getFullYear()} Vulplink. All rights reserved.</span><button className="cookie-reopen-btn" onClick={() => window.dispatchEvent(new Event('vl:cookie-open'))}>Cookie Settings</button></div>
      </div>
    </footer>
    <CookieConsent />
  </>
}

function FooterColumn({ title, links }: { title: string; links: string[][] }) {
  return <div className="footer-col reveal d1"><h5>{title}</h5><ul>{links.map(([label, href]) => <li key={href}><Link to={href}>{label}</Link></li>)}</ul></div>
}

function Chevron() {
  return <svg className="nav-chevron" viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9l6 6 6-6"/></svg>
}
