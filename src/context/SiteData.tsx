import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { getCategories, getProducts, getSettings } from '../lib/data'
import { defaultSettings, type Category, type Product, type SiteSettings } from '../types'

type Value = {
  categories: Category[]
  products: Product[]
  settings: SiteSettings
  loading: boolean
  error: string
  reload: () => Promise<void>
}

const SiteDataContext = createContext<Value | null>(null)

export function SiteDataProvider({ children }: { children: ReactNode }) {
  const [categories, setCategories] = useState<Category[]>([])
  const [products, setProducts] = useState<Product[]>([])
  const [settings, setSettings] = useState(defaultSettings)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  const reload = async () => {
    try {
      setLoading(true)
      const [nextCategories, nextProducts, nextSettings] = await Promise.all([
        getCategories(), getProducts(), getSettings(),
      ])
      setCategories(nextCategories)
      setProducts(nextProducts)
      setSettings(nextSettings)
      setError('')
    } catch (caught) {
      setError(caught instanceof Error ? caught.message : 'Unable to load site data.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { void reload() }, [])

  return <SiteDataContext.Provider value={{ categories, products, settings, loading, error, reload }}>{children}</SiteDataContext.Provider>
}

export function useSiteData() {
  const value = useContext(SiteDataContext)
  if (!value) throw new Error('useSiteData must be used inside SiteDataProvider')
  return value
}
