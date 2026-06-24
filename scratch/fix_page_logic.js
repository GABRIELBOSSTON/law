const fs = require('fs');
let code = fs.readFileSync('d:/law/nusantara-law-hub/app/page.tsx', 'utf8');

if (!code.includes('const [menuOpen, setMenuOpen] = useState(false);')) {
  // Add state hooks
  const hooksStr = `
  const [menuOpen, setMenuOpen] = useState(false);
  const [formStatus, setFormStatus] = useState<'idle' | 'sending' | 'sent'>('idle');

  const closeMobileMenu = () => setMenuOpen(false);

  const submitForm = () => {
    setFormStatus('sending');
    setTimeout(() => {
      setFormStatus('sent');
      // Clear inputs manually if needed, or if we had a form ref
      setTimeout(() => {
        setFormStatus('idle');
      }, 3000);
    }, 1500);
  };
`;

  code = code.replace(/export default function Home\(\) \{/, `export default function Home() {\n${hooksStr}`);

  // Insert mobile menu right after <div className="cursor-ring"></div>
  const mobileMenuStr = `
      <div className={\`mobile-menu \${menuOpen ? 'open' : ''}\`}>
        <a href="#home" onClick={closeMobileMenu}>Home</a>
        <a href="#about" onClick={closeMobileMenu}>About</a>
        <a href="#logo-section" onClick={closeMobileMenu}>Our Logo</a>
        <a href="#team" onClick={closeMobileMenu}>Our Team</a>
        <a href="#contract" onClick={closeMobileMenu}>Legal Contract</a>
        <a href="#contact" onClick={closeMobileMenu}>Contact Us</a>
      </div>
`;
  code = code.replace(/<div className="cursor-ring"><\/div>/, `<div className="cursor-ring"></div>\n${mobileMenuStr}`);

  // Update hamburger button
  code = code.replace(
    /<button className="hamburger" id="hamburger" onClick=\{\(\) => \{\}\} aria-label="Toggle menu">/,
    `<button className={\`hamburger \${menuOpen ? 'active' : ''}\`} onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">`
  );

  // Update submit button
  code = code.replace(
    /<button className="btn-submit" onClick=\{\(\) => \{\}\}><span>Send Message<\/span><\/button>/,
    `<button 
        className="btn-submit" 
        onClick={submitForm}
        style={{
          pointerEvents: formStatus === 'sending' ? 'none' : 'auto',
          background: formStatus === 'sent' ? 'var(--gold)' : '',
          color: formStatus === 'sent' ? '#000' : ''
        }}
      >
        <span>
          {formStatus === 'idle' && 'Send Message'}
          {formStatus === 'sending' && 'Sending...'}
          {formStatus === 'sent' && 'Message Sent'}
        </span>
      </button>`
  );

  // Fix the backTop missing visibility scroll logic (I see it was partially lost from index.html or not implemented yet)
  // Let's add scroll event listener to state for backTop
  const scrollLogicStr = `
  const [showBackTop, setShowBackTop] = useState(false);
  useEffect(() => {
    const handleScroll = () => {
      setShowBackTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);
`;
  code = code.replace(/const \[menuOpen, setMenuOpen\] = useState\(false\);/, `${scrollLogicStr}\n  const [menuOpen, setMenuOpen] = useState(false);`);

  // add backTop button before nav
  const backTopStr = `
      <a href="#home" className={\`back-top \${showBackTop ? 'visible' : ''}\`} aria-label="Back to top">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
      </a>
`;
  code = code.replace(/<nav id="navbar">/, `${backTopStr}\n      <nav id="navbar">`);

  // Ensure useState is imported
  if (!code.includes('import { useEffect, useState }')) {
    code = code.replace(/import \{ useEffect \} from "react";/, `import { useEffect, useState } from "react";`);
  }

  fs.writeFileSync('d:/law/nusantara-law-hub/app/page.tsx', code);
  console.log('Fixed page.tsx React logic');
}
