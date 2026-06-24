const fs = require('fs');
let html = fs.readFileSync('d:/law/artikel.html', 'utf8');

// Extract the body content
const bodyMatch = html.match(/<\/head>\s*<body>([\s\S]*?)<script/i);
let content = bodyMatch ? bodyMatch[1] : '';

// Remove the HTML modal (we'll replace it with React state modal)
content = content.replace(/<!-- ─── ARTICLE MODAL ─── -->[\s\S]*?(?=<!-- ─── FILTER BAR ─── -->)/i, '');

// Basic React replacements
content = content.replace(/class=/g, 'className=');
content = content.replace(/for=/g, 'htmlFor=');
content = content.replace(/onclick=\"([^\"]*)\"/g, (match, fn) => {
  if (fn.includes('switchArticle')) {
    const idMatch = fn.match(/switchArticle\('([^']+)'\)/);
    if (idMatch) return `onClick={() => openModal('${idMatch[1]}')}`;
  }
  if (fn.includes('openArticle')) {
    const idMatch = fn.match(/openArticle\('([^']+)'\)/);
    if (idMatch) return `onClick={() => openModal('${idMatch[1]}')}`;
  }
  if (fn.includes('closeModal')) {
    return `onClick={closeModal}`;
  }
  return `onClick={() => {}}`;
});

content = content.replace(/tabindex=\"([^\"]*)\"/g, 'tabIndex={$1}');
content = content.replace(/autocomplete=\"([^\"]*)\"/g, 'autoComplete="$1"');

content = content.replace(/stroke-width=/g, 'strokeWidth=');
content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
content = content.replace(/fill-rule=/g, 'fillRule=');
content = content.replace(/clip-rule=/g, 'clipRule=');

// Remove onerror
content = content.replace(/onerror=\"[^\"]*\"/g, '');

// Fix unclosed tags
content = content.replace(/<img([^>]*[^\/])>/g, '<img$1 />');
content = content.replace(/<input([^>]*[^\/])>/g, '<input$1 />');
content = content.replace(/<br>/g, '<br />');
content = content.replace(/<hr>/g, '<hr />');

// Convert HTML comments to JSX comments
content = content.replace(/<!--([\s\S]*?)-->/g, '{/*$1*/}');

// Convert style="string" to style={{object}}
content = content.replace(/style="([^"]*)"/g, (match, styleStr) => {
  const parts = styleStr.split(';').filter(Boolean);
  const obj = parts.map(p => {
    const splitIndex = p.indexOf(':');
    if (splitIndex === -1) return '';
    const k = p.slice(0, splitIndex);
    const v = p.slice(splitIndex + 1);
    if (!k || !v) return '';
    let camelK = k.trim().replace(/-([a-z])/g, g => g[1].toUpperCase());
    return `${camelK}: "${v.trim().replace(/"/g, "'")}"`;
  }).filter(Boolean).join(', ');
  return `style={{${obj}}}`;
});

// Change image paths
content = content.replace(/src="([^"]*)"/g, (match, src) => {
  const fileName = src.split('/').pop();
  return `src="/images/${fileName}"`;
});

// Extract articles object
const scriptMatch = html.match(/const articles = (\{[\s\S]*?\});/);
const articlesObjStr = scriptMatch ? scriptMatch[1] : '{}';

const finalCode = `"use client";

import { useEffect, useState } from "react";

const articlesData: Record<string, any> = ${articlesObjStr};

export default function Articles() {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);

  useEffect(() => {
    // Custom cursor logic
    const cursor = document.querySelector(".cursor") as HTMLElement;
    const ring = document.querySelector(".cursor-ring") as HTMLElement;
    
    const moveCursor = (e: MouseEvent) => {
      if (cursor && ring) {
        cursor.style.left = e.clientX + "px";
        cursor.style.top = e.clientY + "px";
        ring.style.left = e.clientX + "px";
        ring.style.top = e.clientY + "px";
      }
    };

    document.addEventListener("mousemove", moveCursor);
    return () => {
      document.removeEventListener("mousemove", moveCursor);
    };
  }, []);

  const openModal = (id: string) => {
    setActiveArticleId(id);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveArticleId(null);
    document.body.style.overflow = '';
  };

  const activeArticle = activeArticleId ? articlesData[activeArticleId] : null;

  return (
    <>
      ${content}

      {/* REACT MODAL */}
      <div className={\`modal-overlay \${activeArticle ? 'open' : ''}\`}>
        <div className="modal-container">
          <button className="modal-close" onClick={closeModal}>✕</button>
          
          <button className="modal-back" onClick={closeModal}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round">
              <line x1="19" y1="12" x2="5" y2="12"></line>
              <polyline points="12 19 5 12 12 5"></polyline>
            </svg>
            Kembali
          </button>

          {activeArticle && (
            <div className="modal-content-wrapper" style={{marginTop: "20px"}}>
              <div className="modal-meta" style={{display: "flex", gap: "10px", alignItems: "center", marginBottom: "20px"}}>
                <span className="modal-cat" style={{color: "var(--gold)"}}>{activeArticle.cat}</span>
                <span className="modal-date" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.date}</span>
                <span className="modal-read" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.read}</span>
                <span className="modal-author" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.author}</span>
              </div>

              <h1 className="modal-title" style={{fontFamily: "'Cormorant Garamond', serif", fontSize: "48px", marginBottom: "20px"}} dangerouslySetInnerHTML={{ __html: activeArticle.title }}></h1>
              
              <div className="modal-lead" style={{fontStyle: "italic", color: "var(--text-muted)", marginBottom: "30px"}} dangerouslySetInnerHTML={{ __html: activeArticle.lead }}></div>

              <div className="modal-body" dangerouslySetInnerHTML={{ __html: activeArticle.body }}></div>

              <div className="modal-divider" style={{margin: "40px 0", borderTop: "1px solid rgba(201, 168, 76, 0.2)"}}>
                <span className="modal-divider-glyph">◆</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
`;

fs.writeFileSync('d:/law/nusantara-law-hub/app/articles/page.tsx', finalCode);
console.log('Successfully converted articles/page.tsx');
