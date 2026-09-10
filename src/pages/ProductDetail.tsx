import DOMPurify from 'dompurify'
import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import { useSiteData } from '../context/SiteData'

export function ProductDetail() {
  const { slug } = useParams()
  const { products, categories, settings, loading } = useSiteData()
  const product = products.find((item) => item.slug === slug)
  const [imageIndex, setImageIndex] = useState(0)
  const [variantIndex, setVariantIndex] = useState(0)
  const [tab, setTab] = useState('overview')
  if (loading) return <div className="status-page">Loading product…</div>
  if (!product) return <div className="status-page"><h1>Product not found</h1><Link to="/product" className="btn-primary">Back to Products</Link></div>
  const category = categories.find((item) => product.category_ids.includes(item.id))
  const images = [product.main_image_url, ...product.gallery_urls].filter(Boolean)
  const variant = product.variants[variantIndex] || { model:'',subtitle:'',highlights:[],specs:[] }
  const overview = product.description || product.excerpt
  return <div className="product-single-wrap">
    <nav className="product-single-nav"><Link to="/product">Products</Link>{category && <><span className="sep">/</span><Link to={`/product?category=${category.slug}`}>{category.name}</Link></>}<span className="sep">/</span><strong className="cur">{product.title}</strong></nav>
    <div className="product-hero-section"><div className="product-image-showcase"><div className="product-main-image">{images[imageIndex] ? <img src={images[imageIndex]} alt={product.title}/> : <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}</div>{images.length>1 && <div className="product-thumbnails">{images.map((image,index)=><button className={`product-thumb ${imageIndex===index?'active':''}`} onMouseEnter={()=>setImageIndex(index)} onClick={()=>setImageIndex(index)} key={image}><img src={image} alt=""/></button>)}</div>}</div>
      <div className="product-info-panel">{category && <div className="product-category-tag">{category.name}</div>}<h1 className="product-title">{product.title}</h1>{variant.subtitle && <p className="product-subtitle">{variant.subtitle}</p>}{product.excerpt && <p className="product-excerpt">{product.excerpt}</p>}{variant.highlights.length>0 && <ul className="product-highlights">{variant.highlights.filter(Boolean).map((highlight)=><li className="highlight-item" key={highlight}>{highlight}</li>)}</ul>}
        {product.variants.length>1 && <div className="variant-switcher"><div className="variant-switcher-label">Select Model</div><div className="variant-tabs">{product.variants.map((item,index)=><button className={`variant-tab ${variantIndex===index?'active':''}`} onClick={()=>setVariantIndex(index)} key={`${item.model}-${index}`}>{item.model}</button>)}</div></div>}
        <a className="btn-primary" href={`mailto:${product.contact_email || settings.sales_email}?subject=${encodeURIComponent(`Enquiry: ${product.title}${variant.model?` — ${variant.model}`:''}`)}`}>Enquire About This Product</a>
      </div>
    </div>
    <div className="product-details-wrap"><div className="spec-tabs" role="tablist">{[['overview','Overview'],['specifications','Specifications'],['certifications','Certifications']].map(([id,label])=><button className={`spec-tab ${tab===id?'active':''}`} onClick={()=>setTab(id)} key={id}>{label}</button>)}</div>
      {tab==='overview' && <div className="spec-panel active"><div className="product-description-body" dangerouslySetInnerHTML={{__html:DOMPurify.sanitize(overview)}}/></div>}
      {tab==='specifications' && <div className="spec-panel active"><div className="spec-table" id="variant-spec-rows">{variant.specs.filter(([k,v])=>k||v).length ? variant.specs.filter(([k,v])=>k||v).map(([key,value],index)=><div className="spec-row" key={`${key}-${index}`}><span className="spec-key">{key}</span><span className="spec-val">{value}</span></div>) : <p>Specifications available upon request.</p>}</div></div>}
      {tab==='certifications' && <div className="spec-panel active"><p>{product.certifications || 'Certification information available upon request.'}</p></div>}
    </div>
  </div>
}
