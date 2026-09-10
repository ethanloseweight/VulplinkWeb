import { useState, type FormEvent } from 'react'
import { useSiteData } from '../context/SiteData'

type Status = { ok:boolean; text:string } | null

export function Contact() {
  const { products, categories, settings } = useSiteData()
  return <>
    <section className="page-hero contact-hero" style={settings.contact_bg ? {position:'relative',overflow:'hidden'} : undefined}>{settings.contact_bg ? <><div className="contact-hero-bg-img" style={{position:'absolute',inset:0,zIndex:0,backgroundImage:`url(${settings.contact_bg})`,backgroundSize:'cover',backgroundPosition:'center',opacity:.55}}/><div className="contact-overlay"/></> : <div className="page-hero-bg"/>}<div className="contact-hero-content"><div className="slabel">{settings.content.contact_eyebrow}</div><h1>{settings.content.contact_title}</h1><p>{settings.content.contact_description}</p></div></section>
    <section className="section contact-section"><div className="contact-page-wrap"><div className="contact-two-col">
      <ContactColumn type="sales" kicker="Purchasing" title="Sales & Enquiries" desc="Looking for a product or need a custom quote? Our sales team handles new orders, bulk enquiries, distributor partnerships, and product consultations." email={settings.sales_email} phone={settings.sales_phone} hours={[['Monday – Friday','09:00 – 18:00'],['Saturday','10:00 – 14:00'],['Sunday','Closed']]}>
        <ContactForm kind="sales" products={products.map((product)=>({value:product.title,label:`${product.title}${product.variants[0]?.subtitle?` — ${product.variants[0].subtitle}`:''}`,category:categories.find((c)=>product.category_ids.includes(c.id))?.name||'Products'}))}/>
      </ContactColumn>
      <ContactColumn type="support" kicker="After-Sales" title="Technical Support" desc="Already a Vulplink customer? Our support team handles installation guidance, troubleshooting, warranty claims, spare parts, and all post-purchase assistance." email={settings.support_email} phone={settings.support_phone} hours={[['Monday – Friday','08:00 – 20:00'],['Saturday','09:00 – 17:00'],['Sunday / Public Holiday','Emergency Only']]}>
        <ContactForm kind="support" products={[]}/>
      </ContactColumn>
    </div></div></section>
  </>
}

function ContactColumn({type,kicker,title,desc,email,phone,hours,children}:{type:string;kicker:string;title:string;desc:string;email:string;phone:string;hours:string[][];children:React.ReactNode}) {
  return <div className={`contact-col ${type} reveal-left`}><div className="contact-col-icon">{type==='sales'?'◇':'?'}</div><div className="contact-col-type">{kicker}</div><h2 className="contact-col-title">{title}</h2><p className="contact-col-desc">{desc}</p><div className="contact-methods"><div className="contact-method"><div><div className="contact-method-label">Email</div><div className="contact-method-value"><a href={`mailto:${email}`}>{email}</a></div></div></div><div className="contact-method"><div><div className="contact-method-label">Phone</div><div className="contact-method-value"><a href={`tel:${phone}`}>{phone}</a></div></div></div>{type==='support'&&<div className="contact-method"><div><div className="contact-method-label">Response Time</div><div className="contact-method-value">Within 24 business hours</div></div></div>}</div><div className="contact-hours"><div className="contact-hours-title">{type==='sales'?'Sales':'Support'} Hours</div>{hours.map(([day,time])=><div className="hours-row" key={day}><span className="hours-day">{day}</span><span className="hours-time">{time}</span></div>)}</div>{children}</div>
}

function ContactForm({kind,products}:{kind:'sales'|'support';products:{value:string;label:string;category:string}[]}) {
  const [status,setStatus]=useState<Status>(null)
  const [sending,setSending]=useState(false)
  async function submit(event:FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSending(true); setStatus(null)
    const form=new FormData(event.currentTarget); const payload=Object.fromEntries(form.entries())
    try { const response=await fetch('/contact/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({kind,...payload})}); const result=await response.json() as {message?:string}; if(!response.ok) throw new Error(result.message||'Unable to send your message.'); setStatus({ok:true,text:result.message||'Thank you. Your message has been sent successfully.'}); event.currentTarget.reset() } catch(error){ setStatus({ok:false,text:error instanceof Error?error.message:'Network error. Please try again.'}) } finally { setSending(false) }
  }
  return <form className="contact-form" onSubmit={submit}><div className="contact-form-title">{kind==='sales'?'Quick Enquiry':'Submit a Support Request'}</div>{status&&<div className={`form-message ${status.ok?'success':'error'}`}>{status.text}</div>}<Field name="name" label="Your Name *" required placeholder="John Smith"/><Field name="email" label="Email Address *" type="email" required placeholder="john@company.com"/>{kind==='sales'?<><Field name="company" label="Company" placeholder="Company Name"/><div className="form-group"><label className="form-label">Product of Interest</label><select className="form-input form-select" name="product"><option value="">— Select a product (optional) —</option>{products.map((product)=><option value={product.value} key={product.value}>{product.label}</option>)}<option>Other / General Enquiry</option></select></div><TextArea name="message" label="Message" placeholder="Tell us about your requirements…"/></>:<><Field name="order_number" label="Order / Serial Number" placeholder="e.g. VL-20240001"/><div className="form-group"><label className="form-label">Issue Type</label><select className="form-input form-select" name="issue_type"><option value="">Select an issue type</option>{['Installation Assistance','Product Malfunction','Warranty Claim','Spare Parts Request','Documentation Request','Other'].map((value)=><option key={value}>{value}</option>)}</select></div><TextArea name="message" label="Describe Your Issue" placeholder="Please provide as much detail as possible…"/></>}<button className={`btn-submit ${kind==='support'?'support':''}`} disabled={sending}>{sending?'Sending…':kind==='sales'?'Send Enquiry':'Submit Support Request'}</button></form>
}
function Field({name,label,placeholder,type='text',required=false}:{name:string;label:string;placeholder:string;type?:string;required?:boolean}){return <div className="form-group"><label className="form-label" htmlFor={name}>{label}</label><input className="form-input" id={name} name={name} placeholder={placeholder} type={type} required={required}/></div>}
function TextArea({name,label,placeholder}:{name:string;label:string;placeholder:string}){return <div className="form-group"><label className="form-label" htmlFor={name}>{label}</label><textarea className="form-textarea" id={name} name={name} placeholder={placeholder}/></div>}
