export type Variant = {
  model: string
  subtitle: string
  highlights: string[]
  specs: [string, string][]
}

export type Category = {
  id: number
  name: string
  slug: string
  description: string
  parent_id: number | null
  sort_order: number
}

export type Product = {
  id: number
  title: string
  slug: string
  excerpt: string
  description: string
  main_image_url: string
  gallery_urls: string[]
  contact_email: string
  certifications: string
  tags: string[]
  variants: Variant[]
  published: boolean
  sort_order: number
  category_ids: number[]
}

export type SiteSettings = {
  sales_email: string
  sales_phone: string
  support_email: string
  support_phone: string
  address: string
  hero_slides: string[]
  about_images: string[]
  contact_bg: string
}

export const defaultSettings: SiteSettings = {
  sales_email: 'sales@vulplink.com',
  sales_phone: '+1 (800) 000-0000',
  support_email: 'support@vulplink.com',
  support_phone: '+1 (800) 000-0001',
  address: '123 Business District, Suite 100',
  hero_slides: [],
  about_images: [],
  contact_bg: '',
}
