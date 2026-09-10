import { lazy, StrictMode, Suspense } from 'react'
import { createRoot } from 'react-dom/client'
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import { Layout } from './components/Layout'
import { SiteDataProvider } from './context/SiteData'
import { Home } from './pages/Home'
import { Products } from './pages/Products'
import { ProductDetail } from './pages/ProductDetail'
import { Contact } from './pages/Contact'
import { Legal } from './pages/Legal'
import './styles/theme.css'
import './styles/migration.css'

const Admin = lazy(() => import('./pages/Admin').then((module) => ({ default: module.Admin })))

function PublicWebsite() {
  return <Layout><Routes><Route path="/" element={<Home/>}/><Route path="/product" element={<Products/>}/><Route path="/product/:slug" element={<ProductDetail/>}/><Route path="/contact" element={<Contact/>}/><Route path="/privacy-policy" element={<Legal kind="privacy"/>}/><Route path="/terms-of-use" element={<Legal kind="terms"/>}/><Route path="/cookie-policy" element={<Legal kind="cookies"/>}/><Route path="*" element={<div className="status-page"><h1>Page not found</h1></div>}/></Routes></Layout>
}

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <SiteDataProvider>
        <Suspense fallback={<div className="status-page">Loading…</div>}>
          <Routes>
            <Route path="/admin/*" element={<Admin/>}/>
            <Route path="*" element={<PublicWebsite/>}/>
          </Routes>
        </Suspense>
      </SiteDataProvider>
    </BrowserRouter>
  </StrictMode>,
)
