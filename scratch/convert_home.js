const fs = require('fs');
let html = fs.readFileSync('d:/law/index.html', 'utf8');

// Extract the body content between nav and footer (inclusive)
const bodyMatch = html.match(/<nav[\s\S]*?<footer[\s\S]*?<\/footer>/i);
if (bodyMatch) {
  let content = bodyMatch[0];

  // Basic React replacements
  content = content.replace(/class=/g, 'className=');
  content = content.replace(/for=/g, 'htmlFor=');
  content = content.replace(/onclick=/g, 'onClick=');
  content = content.replace(/tabindex=/g, 'tabIndex=');
  content = content.replace(/stroke-width=/g, 'strokeWidth=');
  content = content.replace(/stroke-linecap=/g, 'strokeLinecap=');
  content = content.replace(/stroke-linejoin=/g, 'strokeLinejoin=');
  content = content.replace(/fill-rule=/g, 'fillRule=');
  content = content.replace(/clip-rule=/g, 'clipRule=');

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

  const finalCode = `"use client";

import { useEffect } from "react";

export default function Home() {
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

  return (
    <>
      <div className="cursor"></div>
      <div className="cursor-ring"></div>
      ${content}
    </>
  );
}
`;

  fs.writeFileSync('d:/law/nusantara-law-hub/app/page.tsx', finalCode);
  console.log('Successfully converted page.tsx');
} else {
  console.log('Could not find nav and footer in index.html');
}
