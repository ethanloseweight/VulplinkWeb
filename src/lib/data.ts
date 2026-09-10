import { supabase, supabaseConfigured } from './supabase'
import { defaultSettings, type Category, type Product, type SiteSettings } from '../types'

export async function getCategories(): Promise<Category[]> {
  if (!supabaseConfigured) return []
  const { data, error } = await supabase.from('categories').select('*').order('sort_order').order('name')
  if (error) throw error
  return data || []
}

export async function getProducts(includeDrafts = false): Promise<Product[]> {
  if (!supabaseConfigured) return []
  let query = supabase.from('products').select('*, product_categories(category_id)').order('sort_order').order('title')
  if (!includeDrafts) query = query.eq('published', true)
  const { data, error } = await query
  if (error) throw error
  return (data || []).map(({ product_categories, ...product }) => ({
    ...product,
    gallery_urls: product.gallery_urls || [],
    tags: product.tags || [],
    variants: product.variants || [],
    category_ids: (product_categories || []).map((row: { category_id: number }) => row.category_id),
  })) as Product[]
}

export async function getProduct(slug: string): Promise<Product | null> {
  const products = await getProducts()
  return products.find((product) => product.slug === slug) || null
}

export async function getSettings(): Promise<SiteSettings> {
  if (!supabaseConfigured) return defaultSettings
  const { data, error } = await supabase.from('site_settings').select('key,value')
  if (error) throw error
  const values = Object.fromEntries((data || []).map((row) => [row.key, row.value]))
  return {
    ...defaultSettings,
    ...values,
    hero_slides: values.hero_slides || [],
    about_images: values.about_images || [],
  }
}

export async function saveProduct(product: Partial<Product>) {
  const { category_ids = [], ...payload } = product
  const { data, error } = await supabase.from('products').upsert(payload).select().single()
  if (error) throw error
  await supabase.from('product_categories').delete().eq('product_id', data.id)
  if (category_ids.length) {
    const { error: joinError } = await supabase.from('product_categories').insert(
      category_ids.map((category_id) => ({ product_id: data.id, category_id })),
    )
    if (joinError) throw joinError
  }
  return data
}
