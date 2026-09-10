import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useSiteData } from '../context/SiteData'

const fallbacks = [
  { name:'4-in-1 KVM Switch', count:'9', title:'Control multiple computers, one desk', desc:'Our 4-in-1 KVM switch range lets you control multiple computers from a single keyboard, mouse and monitor. Available in VGA, Cat5 and HDMI/DVI/DP variants, with ruggedised options for demanding environments.', feats:['VGA KVM 4-in-1 series','Cat5 KVM 4-in-1 series','HDMI / DVI / DP KVM series','Reinforced enclosure variants'] },
  { name:'Video Extender 1620', count:'25+', title:'Long-distance signal extension', desc:'The EX and FX series extend HDMI, DVI and DisplayPort signals over a single Cat cable or fibre — ideal for conference rooms, surveillance systems and broadcast installations.', feats:['EX series: copper Cat cable','FX series: fibre optic','HDMI / DVI / DP / VGA support','Range up to 500m+'] },
  { name:'Video Extender 1630', count:'7', title:'4K ultra-high-definition extension', desc:'The 1630 series delivers 4K UHD video transmission with HDMI and DisplayPort inputs, designed for broadcast and enterprise AV applications where uncompressed quality is non-negotiable.', feats:['EX4630 / FX4630 series','4K@30Hz support','HDMI / DisplayPort','FEX fibre variant available'] },
  { name:'Video Extender HDbaseT', count:'9', title:'Professional HDbaseT transmission', desc:'Leveraging HDbaseT technology, this series transmits HD video, audio, power and control signals simultaneously over a single Cat5e/Cat6 cable — the go-to choice for professional AV integration.', feats:['Video + Audio + Power over one cable','DY-EX / DY-FX series','Matrix switching support','Up to 100m on Cat6'] },
  { name:'Video Splitter', count:'18', title:'One source, multiple displays', desc:'The SP series distributes a single video source to multiple displays simultaneously. Supporting DVI, HDMI, DisplayPort and VGA, it is widely used in digital signage, video walls and multi-monitor setups.', feats:['1×2 to 1×16 output configurations','SP102 / SP104 / SP108 series','Dual-channel variants available','1080p and 4K support'] },
  { name:'Video Switcher', count:'19', title:'Seamless multi-source switching', desc:'The SW series provides smooth switching between multiple video sources, supporting DVI, HDMI and DisplayPort. Suitable for live broadcast, boardrooms and command-and-control centres.', feats:['SW41 to SW21601 series','Remote switching support','DUA dual-user variants','Up to 16 inputs × 1 output'] },
]

export function Home() {
  const { categories, products, settings } = useSiteData()
  const content = settings.content
  const [active, setActive] = useState(0)
  const [hero, setHero] = useState(0)
  const [about, setAbout] = useState(0)
  const topCategories = categories.filter((category) => !category.parent_id).slice(0, 6)
  const items = useMemo(() => topCategories.length ? topCategories.map((category, index) => ({
    ...fallbacks[index], id:category.id, slug:category.slug, name:category.name,
    count:String(products.filter((product) => product.category_ids.includes(category.id)).length),
    desc:category.description || fallbacks[index]?.desc || `Explore the ${category.name} range, engineered for performance and reliability.`,
    title:fallbacks[index]?.title || category.name, feats:fallbacks[index]?.feats || [],
  })) : fallbacks, [topCategories, products])

  useEffect(() => { if (settings.hero_slides.length < 2) return; const id = window.setInterval(() => setHero((value) => (value + 1) % settings.hero_slides.length), 4000); return () => clearInterval(id) }, [settings.hero_slides.length])
  useEffect(() => { if (settings.about_images.length < 2) return; const id = window.setInterval(() => setAbout((value) => (value + 1) % settings.about_images.length), 3000); return () => clearInterval(id) }, [settings.about_images.length])

  return <>
    <section className={`hero ${settings.hero_slides.length ? 'hero-has-slides' : ''}`} aria-label="Hero">
      {settings.hero_slides.length ? <div className="hero-slideshow" aria-hidden="true">{settings.hero_slides.map((url, index) => <div key={url} className={`hero-slide ${hero === index ? 'active' : ''}`} style={{ backgroundImage:`url(${url})` }}/>) }<div className="hero-slide-overlay"/></div> : <div className="hero-bg" aria-hidden="true"/>}
      <div className="hero-grid" aria-hidden="true"/>
      <div className="hero-content"><div className="hero-eyebrow"><span className="slabel">{content.home_hero_eyebrow}</span></div><h1 className="hero-headline">{content.home_hero_title}</h1><p className="hero-sub">{content.home_hero_subtitle}</p><div className="hero-actions"><Link to="/product" className="btn-primary">Explore Products</Link><Link to="/contact" className="btn-ghost">Get in Touch</Link></div></div>
      <div className="hero-scroll" aria-hidden="true"><span>Scroll</span><div className="scroll-line"/></div>
    </section>

    <section className="section" id="products-overview"><div className="section-header centered reveal"><div className="slabel">{content.home_products_eyebrow}</div><h2 className="section-title">{content.home_products_title}</h2><p className="section-desc">{content.home_products_description}</p></div>
      <div className="prod-layout reveal d2"><div className="prod-list" role="list">{items.map((item, index) => <div className={`prod-list-item ${active === index ? 'active' : ''}`} role="listitem" tabIndex={0} key={item.name} onMouseEnter={() => setActive(index)} onFocus={() => setActive(index)}><div><div className="prod-list-name">{item.name}</div><div className="prod-list-num">{item.count} Products</div></div><div className="prod-list-arrow"><Arrow/></div></div>)}</div>
        <div className="prod-panel">{items.map((item, index) => <div className={`prod-panel-item ${active === index ? 'active' : ''}`} style={{ position: active === index ? 'relative' : 'absolute' }} key={item.name}><div className="pp-bg-num">{String(index + 1).padStart(2,'0')}</div><div><div className="pp-tag">{item.name}</div><h3 className="pp-title">{item.title}</h3><p className="pp-desc">{item.desc}</p><ul className="pp-features">{item.feats.map((feature) => <li className="pp-feat" key={feature}>{feature}</li>)}</ul></div><div className="pp-bottom"><span className="pp-count">{item.count} products in this category</span><Link to={'slug' in item ? `/product?category=${String(item.slug)}` : '/product'} className="pp-cta">Browse Products →</Link></div></div>)}</div>
      </div><div style={{ textAlign:'center', marginTop:'2.5rem' }} className="reveal"><Link to="/product" className="btn-ghost">View All Products</Link></div>
    </section>

    <section className="section" id="about"><div className="about-grid"><div className="reveal-left"><div className="slabel">Our Story</div><h2 className="section-title">Built on expertise, driven by <em style={{ color:'var(--crl)' }}>innovation</em></h2><div className="about-body"><p>Vulplink is a video transmission equipment manufacturer with over a decade of industry experience. We specialise in KVM switches, video extenders, video splitters and video switchers — products trusted across broadcast, medical, industrial control and enterprise AV environments.</p><p>Our 30-strong R&amp;D team invests 40% of annual revenue back into research and development, ensuring our technology remains at the forefront of the industry. From VGA to HDMI, DisplayPort and HDbaseT, we engineer solutions that keep pace with the latest standards.</p><p>Backed by over ten registered design and utility model patents, every Vulplink product is the result of original, in-house engineering — no third-party dependencies, no compromises on quality.</p></div><div className="about-stats">{[['10+','Years in Business'],['30','R&D Engineers'],['40%','Revenue into R&D'],['10+','Patents Held']].map(([number,label], index) => <div className={`stat-item reveal d${index+1}`} key={label}><div className="stat-number">{number}</div><div className="stat-label">{label}</div></div>)}</div></div>
        <div className="reveal-right" style={{ position:'relative' }}><div className="about-accent"/><div className="about-visual" style={{ background:'#000', overflow:'hidden', position:'relative' }}>{settings.about_images.length ? <div className="about-slideshow">{settings.about_images.map((url,index) => <div className={`about-slide ${about === index ? 'active' : ''}`} style={{ backgroundImage:`url(${url})` }} key={url}/>)}</div> : <><svg width="54" height="54" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth=".7"><rect x="3" y="3" width="18" height="18" rx="1"/><path d="M3 9h18M9 21V9"/></svg><p className="visual-placeholder">Upload photos in Admin → Site Settings</p></>}<span className="about-visual-label">Vulplink</span></div></div>
      </div></section>

    <section className="section-dark" id="why-us"><div className="section-header centered reveal"><div className="slabel">{content.home_strengths_eyebrow}</div><h2 className="section-title">{content.home_strengths_title}</h2></div><div className="strength-grid">{[
      ['Proprietary Patent Technology','With over ten registered design and utility model patents, our core technology is entirely developed in-house. Every product reflects years of accumulated expertise — stable, reliable, and built without reliance on third-party IP.'],
      ['Sustained R&D Investment','We reinvest 40% of annual revenue into research and development, supported by a dedicated 30-person engineering team. This commitment keeps our product range aligned with the latest video transmission standards and customer demands.'],
      ['Over a Decade of Experience','More than ten years in the video transmission industry has given us deep expertise across broadcast, medical, industrial control and enterprise AV. We understand the real-world demands of each application — and we engineer our products accordingly.'],
    ].map(([title,copy], index) => <div className={`reveal d${index+1} strength-card`} key={title}><div className="strength-icon">◇</div><h3>{title}</h3><p>{copy}</p></div>)}</div></section>

    <section className="section-dark" id="contact-strip"><div className="contact-strip-inner"><ContactStrip title="Looking for the right solution?" label="Sales & Enquiries" copy="Our sales team knows every product line inside out. Tell us your application and we'll recommend the best fit — no obligation, just expert guidance." email={settings.sales_email} phone={settings.sales_phone}/><div className="contact-strip-divider"/><ContactStrip title="We stand behind every product" label="After-Sales Support" copy="Dedicated after-sales support for all Vulplink products. Fast response times, certified technicians, and a team that takes ownership of every issue." email={settings.support_email} phone={settings.support_phone}/></div></section>
  </>
}

function ContactStrip({title,label,copy,email,phone}:{title:string;label:string;copy:string;email:string;phone:string}) { return <div className="contact-strip-item reveal-left"><div className="slabel">{label}</div><h4>{title}</h4><p>{copy}</p><div className="contact-strip-links"><a href={`mailto:${email}`}>{email}</a><a href={`tel:${phone}`}>{phone}</a></div></div> }
function Arrow(){ return <svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg> }
