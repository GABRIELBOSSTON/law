const fs = require('fs');

const code = `"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function Articles() {
  const [activeArticleId, setActiveArticleId] = useState<string | null>(null);
  const [articles, setArticles] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Fetch dynamic articles
    fetch('/api/articles')
      .then(res => res.json())
      .then(data => {
        setArticles(data);
        setLoading(false);
      })
      .catch(err => {
        console.error("Failed to fetch articles", err);
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    // Custom cursor logic
    const cursor = document.querySelector(".cursor") as HTMLElement;
    const ring = document.querySelector(".cursor-ring") as HTMLElement;
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1 });

    document.querySelectorAll('.reveal').forEach((el) => observer.observe(el));

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
      observer.disconnect();
      document.removeEventListener("mousemove", moveCursor);
    };
  }, [articles]); // Re-run observer when articles load

  const openModal = (id: string) => {
    setActiveArticleId(id);
    document.body.style.overflow = 'hidden';
  };

  const closeModal = () => {
    setActiveArticleId(null);
    document.body.style.overflow = '';
  };

  const activeArticle = activeArticleId ? articles.find(a => a.id === activeArticleId) : null;
  const featuredArticle = articles.length > 0 ? articles[0] : null;

  return (
    <>
      <div className="cursor" id="cursor"></div>
      <div className="cursor-ring" id="cursorRing"></div>
      <a href="#" className="back-top" id="backTop" aria-label="Back to top">
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="18 15 12 9 6 15"/></svg>
      </a>

      <nav id="navbar" className="scrolled">
        <Link href="/#home" className="nav-logo">Nusantara <span>Law Hub</span></Link>
        <ul className="nav-links">
          <li><Link href="/#home">Home</Link></li>
          <li><Link href="/#about">About</Link></li>
          <li><Link href="/articles" className="active">Articles</Link></li>
          <li><Link href="/admin/login" style={{ fontSize: '9px', opacity: 0.7 }}>Admin Login</Link></li>
        </ul>
      </nav>

      {/* ─── FILTER BAR ─── */}
      <div className="filter-section" id="filterSection">
        <div className="filter-inner">
          <div className="filter-left">
            <h1 className="filter-heading">Legal <em>Articles</em> & Insights</h1>
            <div className="filter-tabs" id="filterTabs">
              <button className="filter-tab active" data-cat="all">All</button>
              <button className="filter-tab" data-cat="contracts">Contracts</button>
              <button className="filter-tab" data-cat="ip">Intellectual Property</button>
              <button className="filter-tab" data-cat="collab">Collaboration</button>
              <button className="filter-tab" data-cat="business">Business</button>
              <button className="filter-tab" data-cat="rights">Rights & Obligations</button>
            </div>
          </div>
          <div className="search-box">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
            <input type="text" placeholder="Search articles..." id="searchInput" autoComplete="off" />
          </div>
        </div>
      </div>

      {/* ─── MAIN ARTICLES ─── */}
      <section className="articles-section">
        
        {loading ? (
          <div style={{ textAlign: 'center', padding: '100px', color: 'var(--gold)' }}>Loading articles...</div>
        ) : (
          <>
            {/* FEATURED */}
            {featuredArticle && (
              <div className="featured-article reveal" onClick={() => openModal(featuredArticle.id)} role="button" tabIndex={0}>
                <div className="featured-img">
                  {featuredArticle.imageUrl ? (
                    <img src={featuredArticle.imageUrl} alt={featuredArticle.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                  ) : (
                    <div className="featured-img-inner bg1">
                      <div className="img-glyph">§</div>
                      <div className="img-icon-wrap">
                        <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.2"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
                      </div>
                    </div>
                  )}
                  <div className="feat-badge">Featured</div>
                </div>
                <div className="featured-content">
                  <div className="article-meta">
                    <span className="article-cat">{featuredArticle.category}</span>
                    <span className="article-date">{featuredArticle.date}</span>
                    <span className="article-read-time">{featuredArticle.readTime}</span>
                  </div>
                  <h2 dangerouslySetInnerHTML={{ __html: featuredArticle.title }}></h2>
                  <p dangerouslySetInnerHTML={{ __html: featuredArticle.lead }}></p>
                  <button className="read-link" onClick={() => openModal(featuredArticle.id)}>
                    Read Full Article
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>
                  </button>
                </div>
              </div>
            )}

            {/* MAIN LAYOUT + SIDEBAR */}
            <div className="articles-layout">
              <div className="articles-main">
                <div className="sec-label reveal"><span>Latest Articles</span></div>
                <div className="articles-grid" id="articlesGrid">
                  {articles.slice(1).map((article, index) => (
                    <div key={article.id} className={\`article-card reveal reveal-d\${(index % 3) + 1}\`} data-cat={article.category} onClick={() => openModal(article.id)} role="button" tabIndex={0}>
                      <div className="card-img">
                        {article.imageUrl ? (
                          <img src={article.imageUrl} alt={article.title} style={{width: '100%', height: '100%', objectFit: 'cover'}} />
                        ) : (
                          <div className={\`card-img-inner bg\${(index % 6) + 1}\`}>
                            <div className="card-glyph">{article.category.charAt(0)}</div>
                          </div>
                        )}
                      </div>
                      <div className="card-content">
                        <div className="article-meta">
                          <span className="article-cat">{article.category}</span>
                          <span className="article-date">{article.date}</span>
                          <span className="article-read-time">{article.readTime}</span>
                        </div>
                        <h3 dangerouslySetInnerHTML={{ __html: article.title }}></h3>
                        <p dangerouslySetInnerHTML={{ __html: article.lead }}></p>
                        <button className="read-link">Read Article <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg></button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* SIDEBAR */}
              <div className="articles-sidebar">
                <div className="sidebar-widget reveal">
                  <h3>Popular Topics</h3>
                  <div className="topic-tags">
                    {Array.from(new Set(articles.flatMap(a => a.tags || []))).slice(0, 10).map((tag, i) => (
                      <span key={i} className="topic-tag">{tag}</span>
                    ))}
                  </div>
                </div>
                <div className="sidebar-widget reveal reveal-d1" style={{marginTop: "40px"}}>
                  <h3>Need Custom Contract?</h3>
                  <p style={{fontSize: "13px", color: "var(--text-muted)", lineHeight: 1.6, marginBottom: "20px"}}>Our team can help draft specific agreements tailored to your project.</p>
                  <Link href="/#contact" className="read-link" style={{color: "var(--gold)"}}>Contact Us</Link>
                </div>
              </div>
            </div>
          </>
        )}
      </section>

      <footer>
        <div className="footer-bottom" style={{padding: "40px 60px", background: "var(--dark-2)", borderTop: "1px solid rgba(201,168,76,0.1)", display: "flex", justifyContent: "space-between", fontSize: "12px", color: "var(--text-muted)"}}>
          <p>© 2025 <span>Nusantara Law Hub</span>. Student Academic Project.</p>
          <p>Jababeka Education Park · Cikarang Utara · West Java</p>
        </div>
      </footer>

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
                <span className="modal-cat" style={{color: "var(--gold)"}}>{activeArticle.category}</span>
                <span className="modal-date" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.date}</span>
                <span className="modal-read" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.readTime}</span>
                <span className="modal-author" style={{color: "var(--text-muted)", fontSize: "12px"}}>{activeArticle.author}</span>
              </div>

              <h1 className="modal-title" style={{fontFamily: "'Cormorant Garamond', serif", fontSize: "48px", marginBottom: "20px"}} dangerouslySetInnerHTML={{ __html: activeArticle.title }}></h1>
              
              <div className="modal-lead" style={{fontStyle: "italic", color: "var(--text-muted)", marginBottom: "30px"}} dangerouslySetInnerHTML={{ __html: activeArticle.lead }}></div>

              {activeArticle.imageUrl && (
                <div style={{marginBottom: "30px", width: "100%", maxHeight: "400px", overflow: "hidden", borderRadius: "8px"}}>
                  <img src={activeArticle.imageUrl} alt="Article Image" style={{width: "100%", height: "100%", objectFit: "cover"}} />
                </div>
              )}

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

fs.writeFileSync('d:/law/nusantara-law-hub/app/articles/page.tsx', code);
