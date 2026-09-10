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
  content: ContentSettings
}

export type ContentSettings = {
  home_hero_eyebrow: string
  home_hero_title: string
  home_hero_subtitle: string
  home_products_eyebrow: string
  home_products_title: string
  home_products_description: string
  home_about_eyebrow: string
  home_about_title: string
  home_about_body: string
  home_strengths_eyebrow: string
  home_strengths_title: string
  products_eyebrow: string
  products_title: string
  products_description: string
  contact_eyebrow: string
  contact_title: string
  contact_description: string
}

export const defaultContent: ContentSettings = {
  home_hero_eyebrow: 'Vulplink',
  home_hero_title: 'Over a Decade of Video Transmission Excellence',
  home_hero_subtitle: 'Specialising in KVM switches, video extenders, splitters and switchers — engineered in-house, backed by patents, trusted by professionals worldwide.',
  home_products_eyebrow: 'Product Lines',
  home_products_title: 'A complete video transmission product range',
  home_products_description: 'Covering KVM switching, video extension, distribution and switching — hover over a category to explore the full line-up.',
  home_about_eyebrow: 'Our Story',
  home_about_title: 'Built on expertise, driven by innovation',
  home_about_body: 'Vulplink is a video transmission equipment manufacturer with over a decade of industry experience. We specialise in KVM switches, video extenders, video splitters and video switchers — products trusted across broadcast, medical, industrial control and enterprise AV environments.\n\nOur 30-strong R&D team invests 40% of annual revenue back into research and development, ensuring our technology remains at the forefront of the industry.\n\nBacked by over ten registered design and utility model patents, every Vulplink product is the result of original, in-house engineering — no third-party dependencies, no compromises on quality.',
  home_strengths_eyebrow: 'Core Strengths',
  home_strengths_title: 'Why choose Vulplink',
  products_eyebrow: 'Product Catalogue',
  products_title: 'Our Products',
  products_description: 'Filter by category, interface, resolution or transmission type.',
  contact_eyebrow: 'Get In Touch',
  contact_title: 'Contact Us',
  contact_description: 'Whether purchasing or seeking after-sales support, our dedicated teams are ready to assist.',
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
  content: defaultContent,
}
