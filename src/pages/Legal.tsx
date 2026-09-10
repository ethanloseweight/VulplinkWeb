import { Link } from 'react-router-dom'
import { useSiteData } from '../context/SiteData'

const content = {
  privacy: { title:<><span>Privacy </span><em>Policy</em></>, sections:[
    ['1. Information We Collect','We collect information you provide directly to us, such as when you fill out a contact or enquiry form on our website. This may include your name, email address, company name, phone number and the content of your message.'],
    ['2. How We Use Your Information','We use the information we collect to respond to your enquiries and provide customer support, send you product information or quotations you have requested, improve our website and services, and comply with applicable laws and regulations.'],
    ['3. Cookies','Our website uses cookies to enhance your browsing experience. Cookies are small files stored on your device that help us understand how visitors interact with our site.'],
    ['4. Data Security','We implement appropriate technical and organisational measures to protect your personal information against unauthorised access, alteration, disclosure or destruction. However, no method of transmission over the internet is 100% secure.'],
    ['5. Third-Party Links','Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of those websites.'],
    ['6. Your Rights','Depending on your location, you may have certain rights regarding your personal data, including the right to access, correct or delete the information we hold about you.'],
    ['7. Changes to This Policy','We may update this Privacy Policy from time to time. We will notify you of any significant changes by posting the new policy on this page with an updated date.'],
  ]},
  terms: { title:<><span>Terms </span><em>of Use</em></>, sections:[
    ['1. Acceptance of Terms','By accessing and using the Vulplink website, you accept and agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use our website.'],
    ['2. Use of the Website','This website is provided for informational purposes about Vulplink products and services. You may use this website for lawful purposes only.'],
    ['3. Intellectual Property','All content on this website, including text, images, product descriptions, logos and design elements, is the property of Vulplink or its content suppliers and is protected by applicable intellectual property laws.'],
    ['4. Product Information','Product specifications, images and descriptions are provided for general reference only. Vulplink reserves the right to modify product specifications without notice.'],
    ['5. Disclaimer of Warranties','This website is provided on an “as is” basis without any warranties of any kind, either express or implied.'],
    ['6. Limitation of Liability','To the fullest extent permitted by law, Vulplink shall not be liable for indirect, incidental, special or consequential damages arising from your use of this website.'],
    ['7. Changes to Terms','We reserve the right to modify these Terms of Use at any time. Continued use of the website following changes constitutes acceptance.'],
  ]},
  cookies: { title:<><span>Cookie </span><em>Policy</em></>, sections:[
    ['1. What Are Cookies','Cookies are small text files placed on your device when you visit a website. They are widely used to make websites work more efficiently and provide information to website owners.'],
    ['2. How We Use Cookies','Vulplink uses essential cookies for core operation, analytics cookies to understand site usage, and preference cookies to remember choices you make.'],
    ['3. Third-Party Cookies','Some cookies may be set by third-party services appearing on our pages. We recommend reviewing the relevant third-party privacy information.'],
    ['4. Managing Cookies','You can control and manage cookies through our Cookie Settings button or your browser preferences. Refusing cookies may affect some parts of the website.'],
    ['5. Changes to This Policy','We may update this Cookie Policy from time to time to reflect changes in technology or legal requirements.'],
  ]},
}

export function Legal({kind}:{kind:keyof typeof content}) {
  const { settings }=useSiteData(); const page=content[kind]
  return <><section className="page-hero" style={{paddingBottom:40}}><div className="page-hero-bg"/><div className="slabel">Legal</div><h1>{page.title}</h1><p>Last updated: September 2026</p></section><div className="legal-page-wrap"><div className="legal-content">{page.sections.map(([title,copy])=><div className="legal-section" key={title}><h2>{title}</h2><p>{copy}{title.startsWith('3. Cookies')&&<> For more information, see our <Link to="/cookie-policy">Cookie Policy</Link>.</>}</p></div>)}<div className="legal-section"><h2>{kind==='terms'?'8. Contact':kind==='privacy'?'8. Contact Us':'6. Contact Us'}</h2><p>For questions regarding this policy, contact us at <a href={`mailto:${settings.sales_email}`}>{settings.sales_email}</a>.</p></div></div></div></>
}
