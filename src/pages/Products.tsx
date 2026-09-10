import { useEffect, useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ProductCard, productDimensions } from '../components/ProductCard'
import { useSiteData } from '../context/SiteData'

export function Products() {
  const { products, categories, settings, loading, error } = useSiteData()
  const content = settings.content
  const [params] = useSearchParams()
  const initialCategory = categories.find((c) => c.slug === params.get('category'))?.id || null
  const [categoryId, setCategoryId] = useState<number | null>(initialCategory)
  const [filters, setFilters] = useState({ fn:'', iface:'', res:'', trans:'' })
  const [openParent, setOpenParent] = useState<number | null>(null)
  useEffect(() => { setCategoryId(categories.find((c) => c.slug === params.get('category'))?.id || null) }, [params, categories])

  const rows = useMemo(() => products.map((product) => ({ product, dims:productDimensions(product) })), [products])
  const options = (key:keyof typeof filters) => [...new Set(rows.map((row) => row.dims[key]).filter(Boolean))].sort()
  const children = (parentId:number) => categories.filter((category) => category.parent_id === parentId)
  const filtered = rows.filter(({ product, dims }) => {
    if (categoryId) {
      const selected = categories.find((category) => category.id === categoryId)
      const ids = selected?.parent_id ? [categoryId] : [categoryId, ...children(categoryId).map((category) => category.id)]
      if (!product.category_ids.some((id) => ids.includes(id))) return false
    }
    return Object.entries(filters).every(([key, value]) => !value || dims[key as keyof typeof filters] === value)
  })
  const selectedLabel = categories.find((category) => category.id === categoryId)?.name
  const label = [selectedLabel, ...Object.values(filters)].filter(Boolean).join(' · ') || 'All Products'
  const reset = () => { setCategoryId(null); setFilters({ fn:'',iface:'',res:'',trans:'' }); setOpenParent(null) }

  return <>
    <section className="page-hero" style={{paddingBottom:40}}><div className="page-hero-bg"/><div className="slabel">{content.products_eyebrow}</div><h1>{content.products_title}</h1><p>{content.products_description}</p></section>
    <div className="products-page-wrap">
      <aside className="products-sidebar"><div className="sidebar-section"><button className={`sidebar-all-btn ${!categoryId ? 'active' : ''}`} onClick={() => setCategoryId(null)}><span className="sidebar-all-label">All Products</span><span className="sidebar-all-count">{products.length}</span></button></div>
        <div className="sidebar-section"><div className="sidebar-section-title">Categories</div>{categories.filter((category) => !category.parent_id).map((category) => { const subs=children(category.id); const count=products.filter((p)=>p.category_ids.some((id)=>id===category.id||subs.some((s)=>s.id===id))).length; return <div className="sidebar-cat-group" key={category.id}><button className={`sidebar-cat-btn ${categoryId===category.id?'active':''} ${openParent===category.id?'open':''}`} onClick={() => { setCategoryId(category.id); setOpenParent(subs.length && openParent !== category.id ? category.id : null) }}><span className="sidebar-cat-name">{category.name}</span><span className="sidebar-cat-meta"><span className="sidebar-cat-count">{count}</span>{subs.length>0 && <span>›</span>}</span></button>{subs.length>0 && <div className={`sidebar-sub-list ${openParent===category.id?'open':''}`}>{subs.map((sub) => <button className={`sidebar-sub-btn ${categoryId===sub.id?'active':''}`} onClick={() => setCategoryId(sub.id)} key={sub.id}><span className="sidebar-sub-name">{sub.name}</span><span className="sidebar-sub-count">{products.filter((p)=>p.category_ids.includes(sub.id)).length}</span></button>)}</div>}</div>})}</div>
      </aside>
      <main className="products-main">
        <div className="pf-bar">{(['fn','iface','res','trans'] as const).map((key) => options(key).length ? <div className="pf-group" key={key}><label className="pf-label">{{fn:'Function',iface:'Interface',res:'Resolution',trans:'Transmission'}[key]}</label><select className="pf-select" value={filters[key]} onChange={(event)=>setFilters({...filters,[key]:event.target.value})}><option value="">All</option>{options(key).map((value)=><option key={value}>{value}</option>)}</select></div> : null)}<button className="pf-clear" onClick={reset}>× Clear</button></div>
        <div className="products-filter-bar"><div className="products-filter-label">{label}</div><div className="products-filter-count"><span>{filtered.length}</span> products</div></div>
        {loading && <div className="products-empty"><p>Loading products…</p></div>}
        {error && <div className="products-empty"><p>{error}</p></div>}
        {!loading && !error && <div className="product-card-grid">{filtered.map(({product},index)=><ProductCard product={product} categories={categories} delay={Math.min(index*35,280)} key={product.id}/>)}</div>}
        {!loading && !filtered.length && <div className="products-empty"><p>No products match your filters.</p><button onClick={reset} className="btn-ghost">Clear All Filters</button></div>}
      </main>
    </div>
  </>
}
