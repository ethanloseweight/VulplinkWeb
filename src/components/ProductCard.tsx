import { Link } from 'react-router-dom'
import type { Category, Product } from '../types'

const dimensions = {
  fn:['splitter','kvm switch','extender','lcd kvm console','switcher','switch'],
  iface:['hdmi','displayport','dp','dvi','vga','hdbaset'],
  res:['4k','1080','2k','uhd'],
  trans:['local','cat5','cat6','fiber','fibre','cat5e','hdbaset','copper'],
}

export function productDimensions(product: Product) {
  const tags = product.tags || []
  const find = (values:string[]) => tags.find((tag) => values.some((value) => tag.toLowerCase().includes(value))) || ''
  return { fn:find(dimensions.fn), iface:find(dimensions.iface), res:find(dimensions.res), trans:find(dimensions.trans) }
}

export function ProductCard({ product, categories, delay = 0 }: { product: Product; categories: Category[]; delay?: number }) {
  const dims = productDimensions(product)
  const cat = categories.find((category) => product.category_ids.includes(category.id))
  const subtitle = product.variants[0]?.subtitle || product.excerpt
  return <Link to={`/product/${product.slug}`} className="product-card" style={{ animationDelay:`${delay}ms` }}>
    <div className="product-card-image">{product.main_image_url ? <img src={product.main_image_url} alt={product.title} loading="lazy" style={{width:'100%',height:'100%',objectFit:'cover'}}/> : <svg viewBox="0 0 24 24"><rect x="3" y="3" width="18" height="18" rx="1"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>}</div>
    <div className="product-card-body">{cat && <div className="product-card-tag">{cat.name}</div>}<h3 className="product-card-title">{product.title}</h3><div className="pc-badges">{Object.values(dims).filter(Boolean).map((value) => <span className="pc-badge" key={value}>{value}</span>)}</div>{subtitle && <p className="product-card-excerpt">{subtitle}</p>}<div className="product-card-footer"><span className="product-card-cta">View Details</span><span className="product-card-arrow"><svg viewBox="0 0 24 24"><path d="M5 12h14M12 5l7 7-7 7"/></svg></span></div></div>
  </Link>
}
