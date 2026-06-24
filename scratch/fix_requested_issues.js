const fs = require('fs');

function fixPage() {
  let code = fs.readFileSync('d:/law/nusantara-law-hub/app/page.tsx', 'utf8');

  // 1. Add FallbackImage component
  if (!code.includes('const FallbackImage')) {
    const fallbackImageCode = `
const FallbackImage = ({ src, alt, className, style }: any) => {
  const [error, setError] = useState(false);
  if (error) {
    const initials = alt ? alt.split(' ').map((n: string) => n[0]).join('').substring(0, 2).toUpperCase() : 'NL';
    return (
      <div className={className} style={{...style, display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond', serif", fontSize: '24px', fontWeight: 600, color: 'var(--gold)', background: 'linear-gradient(135deg, rgba(201,168,76,0.2), rgba(201,168,76,0.05))'}}>
        {initials}
      </div>
    );
  }
  return <img src={src} alt={alt} className={className} style={style} onError={() => setError(true)} />;
};
`;
    code = code.replace(/export default function Home\(\) \{/, fallbackImageCode + '\nexport default function Home() {');
  }

  // Replace <img ... /> with <FallbackImage ... />
  // We need to be careful with multiline tags
  code = code.replace(/<img\s+src="([^"]+)"\s+alt="([^"]+)"\s*\/>/g, '<FallbackImage src="$1" alt="$2" />');
  code = code.replace(/<img\s+src="([^"]+)"\s+alt="([^"]+)"\s+style=\{\{([^}]+)\}\}\s*\/>/g, '<FallbackImage src="$1" alt="$2" style={{$3}} />');
  code = code.replace(/<img\s+src="([^"]+)"\s+alt="([^"]+)"([^>]*)>/g, '<FallbackImage src="$1" alt="$2"$3 />');

  // 2. Add IntersectionObserver logic
  if (!code.includes('IntersectionObserver')) {
    const observerCode = `
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
`;
    // Insert inside useEffect
    code = code.replace(/const moveCursor = \(e: MouseEvent\) => \{/, observerCode + '\n    const moveCursor = (e: MouseEvent) => {');
    // Also add cleanup
    code = code.replace(/return \(\) => \{/, 'return () => {\n      observer.disconnect();');
  }

  // 3. Add Articles Link
  if (!code.includes('<Link href="/articles"')) {
    code = code.replace(/<li><a href="#about">About<\/a><\/li>/, '<li><a href="#about">About</a></li>\n    <li><Link href="/articles">Articles</Link></li>');
    code = code.replace(/<a href="#about" onClick=\{closeMobileMenu\}>About<\/a>/, '<a href="#about" onClick={closeMobileMenu}>About</a>\n        <Link href="/articles" onClick={closeMobileMenu}>Articles</Link>');
    
    // add import Link if not exists
    if (!code.includes('import Link from')) {
      code = 'import Link from "next/link";\n' + code;
    }
  }

  fs.writeFileSync('d:/law/nusantara-law-hub/app/page.tsx', code);
}

function fixArticlesPage() {
  let code = fs.readFileSync('d:/law/nusantara-law-hub/app/articles/page.tsx', 'utf8');

  // 1. Add IntersectionObserver logic
  if (!code.includes('IntersectionObserver')) {
    const observerCode = `
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));
`;
    // Insert inside useEffect
    code = code.replace(/const moveCursor = \(e: MouseEvent\) => \{/, observerCode + '\n    const moveCursor = (e: MouseEvent) => {');
    // Also add cleanup
    code = code.replace(/return \(\) => \{/, 'return () => {\n      observer.disconnect();');
  }

  // 2. Add Navbar to Articles Page
  // Looks like we need to prepend the Navbar HTML to the returned JSX, or just make sure there is a link back.
  // The user requested: "Pastikan di file src/app/articles/page.tsx juga memiliki struktur Navbar yang konsisten, agar pengguna bisa kembali ke halaman Home (<Link href="/">Home</Link>)."
  
  if (!code.includes('<nav id="navbar">')) {
    const navBarCode = `
      <nav id="navbar" className="scrolled">
        <Link href="/#home" className="nav-logo">Nusantara <span>Law Hub</span></Link>
        <ul className="nav-links">
          <li><Link href="/#home">Home</Link></li>
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/articles" className="active">Articles</Link></li>
        </ul>
      </nav>
`;
    code = code.replace(/<div className="cursor-ring"><\/div>/, `<div className="cursor-ring"></div>\n${navBarCode}`);
  }

  if (!code.includes('import Link from')) {
    code = 'import Link from "next/link";\n' + code;
  }

  fs.writeFileSync('d:/law/nusantara-law-hub/app/articles/page.tsx', code);
}

fixPage();
fixArticlesPage();
console.log("Fixes applied successfully.");
