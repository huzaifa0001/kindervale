(() => {
  'use strict';

  const scriptBase = new URL('.', document.currentScript?.src || location.href);
  const basePath = scriptBase.pathname.endsWith('/') ? scriptBase.pathname : `${scriptBase.pathname}/`;
  const dataUrl = new URL('data/site.json', scriptBase).href;
  const $ = (selector, parent = document) => parent.querySelector(selector);
  const $$ = (selector, parent = document) => Array.from(parent.querySelectorAll(selector));
  const escape = (value) => String(value).replace(/[&<>'"]/g, c => ({'&':'&amp;','<':'<','>':'>',"'":'&#39;','"':'"'}[c]));
  const homePath = basePath;
  const routePath = (path = location.pathname) => {
    const base = homePath.replace(/\/$/, '');
    const normalized = path.replace(/\/$/, '') || '/';
    if (base && normalized === base) return '/';
    if (base && normalized.startsWith(`${base}/`)) return normalized.slice(base.length) || '/';
    return normalized;
  };
  let activeObserver;
  let lastHomeScroll = Number(sessionStorage.getItem('kindervale:lastHomeScroll') || 0);
  let currentAdmissionSource = 'General Admissions';

  fetch(dataUrl).then(response => {
    if (!response.ok) throw new Error('Unable to load site content');
    return response.json();
  }).then(async data => {
    start(data);
  }).catch(error => console.error(error));

  function start(data) {
    const site = $('#site');
    injectStyles();
    const logo = () => `<img class="kv-birds" src="${data.images.logo}" alt="Kindervale Preschool" style="width:100%;height:100%;object-fit:contain" width="48" height="48">`;
    const logoLockup = () => `<div class="logo"><div class="mark">${logo()}</div><div>KINDERVALE<small>PRESCHOOL</small></div></div>`;
    const image = (entry, extra = '') => `<img src="${entry.src}" alt="${escape(entry.title)}" loading="lazy" decoding="async" ${extra}>`;
    const hashLink = (hash, label, className = '') => `<a href="${homePath}${hash}" data-scroll-target="${hash.slice(1)}" class="${className}">${escape(label)}</a>`;
    const navSections = [
      ['about', 'About Us'],
      ['curriculum', 'Curriculum'],
      ['levels', 'Our Levels'],
      ['team', 'Our Team'],
      ['facilities', 'School Facilities'],
      ['admissions', 'Admissions'],
      ['fees', 'Fee Structure'],
      ['consultancy', 'Consultancy'],
      ['founder', "Founder's Career Profile"]
    ];
    const sectionIds = navSections.map(([id]) => id).filter(id => id !== 'home');
    const pageTitle = path => path === '/' ? 'Kindervale Preschool | DHA-II Islamabad' : `${path.split('/').filter(Boolean).map(part => part.replaceAll('-', ' ')).map(part => part[0].toUpperCase() + part.slice(1)).join(' | ')} | Kindervale Preschool`;

    /* ─── Styles Injection ─── */
    function injectStyles() {
      if ($('#kv-base-styles')) return;
      const s = document.createElement('style');
      s.id = 'kv-base-styles';
      s.textContent = `
        html,body{max-width:100%;overflow-x:hidden}img,svg{max-width:100%}body.modal-open{overflow:hidden}.nav-toggle{display:none}
        .playful-band{position:relative;overflow:hidden;background:linear-gradient(180deg,#eaf4fb,#fbfcfd);padding:34px 0 16px}
        .playful-band::before,.playful-band::after{content:"";position:absolute;border-radius:999px;opacity:.45;pointer-events:none}
        .playful-band::before{width:120px;height:120px;background:#fff3dd;left:7%;top:8px}
        .playful-band::after{width:92px;height:92px;background:#fdecf1;right:9%;bottom:-28px}
        .rolling-gallery{display:flex;width:max-content;gap:22px;animation:rollGallery 36s linear infinite;will-change:transform}
        .rolling-gallery:hover{animation-play-state:paused}
        .rolling-item{flex:0 0 clamp(150px,20vw,245px);aspect-ratio:1;border-radius:999px;padding:6px;background:conic-gradient(from 180deg,var(--yellow),#fff,var(--teal),#fdecf1,var(--yellow));box-shadow:0 12px 28px rgba(46,90,117,.16)}
        .rolling-item img{width:100%;height:100%;border-radius:inherit;object-fit:cover;border:4px solid #fff;display:block}
        #about .container{max-width:1120px}
        #about .sec-head{display:none}
        #about .about-layout{display:grid;grid-template-columns:minmax(340px,.92fr) minmax(360px,1fr);gap:clamp(62px,8vw,110px);align-items:start;min-height:430px}
        #about .about-images{display:grid;grid-template-rows:repeat(2,188px);row-gap:28px;padding-top:8px}
        #about .about-image{width:188px;height:188px;border-radius:50%;overflow:hidden;box-shadow:0 18px 38px rgba(31,66,87,.16);animation:aboutImageIn .76s ease both}
        #about .about-image img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}
        #about .about-image:first-child{justify-self:start;margin-left:clamp(24px,5vw,58px)}
        #about .about-image:nth-child(2){justify-self:end;margin-right:clamp(8px,3vw,22px);animation-delay:.12s}
        #about .about-copy{max-width:475px;color:var(--teal-dark)}
        #about .about-copy h2{font-size:clamp(30px,3.1vw,42px);line-height:1.08;color:var(--navy);font-weight:900;text-align:center;margin:0 0 34px;animation:aboutHeadingIn .68s ease both}
        #about .about-copy p{color:var(--teal-dark);font-size:17px;line-height:1.42;margin:0;animation:aboutTextIn .72s ease both}
        #about .about-copy p + p{margin-top:56px;animation-delay:.14s}
        #about .about-copy strong{font-weight:900;color:var(--teal-dark)}
        .gallery-highlights{--circle:112px;--ring:5px;display:flex;gap:24px;overflow-x:auto;overflow-y:hidden;padding:4px 2px 18px;margin-bottom:26px;scrollbar-width:thin;scroll-snap-type:x proximity;-webkit-overflow-scrolling:touch}
        .gallery-highlight{appearance:none;background:transparent;border:0;text-align:center;color:var(--navy);font:inherit;font-weight:800;cursor:pointer;min-width:128px;padding:0;display:flex;flex-direction:column;align-items:center;gap:10px;outline:0;transition:transform .22s ease,opacity .22s ease}
        .highlight-cover{width:var(--circle);height:var(--circle);border-radius:999px;padding:var(--ring);background:conic-gradient(from 210deg,var(--yellow),#ffffff,var(--teal));box-shadow:0 10px 30px rgba(31,66,87,.14);margin:0 auto;transition:transform .22s ease,box-shadow .22s ease,filter .22s ease, background .22s ease;scroll-snap-align:start;position:relative}
        .highlight-cover::after{content:"";position:absolute;inset:var(--ring);border-radius:inherit;box-shadow:inset 0 0 0 1px rgba(255,255,255,.55);pointer-events:none}
        .highlight-cover img{width:100%;height:100%;border-radius:50%;object-fit:cover;border:3px solid rgba(255,255,255,.95);display:block;transform:translateZ(0);transition:transform .22s ease,filter .22s ease,opacity .25s ease;opacity:0}
        .highlight-cover img.is-loaded{opacity:1}
        .gallery-highlight:hover .highlight-cover,.gallery-highlight:focus-visible .highlight-cover{transform:translateY(-4px) scale(1.03);box-shadow:0 16px 44px rgba(31,66,87,.22);filter:saturate(1.06)}
        .gallery-highlight:hover .highlight-cover img,.gallery-highlight:focus-visible .highlight-cover img{transform:scale(1.02)}
        .gallery-highlight:active .highlight-cover{transform:translateY(-2px) scale(1.02)}
        .gallery-highlight:focus-visible .highlight-label{text-decoration:underline}
        .highlight-label{display:block;font-size:14px;line-height:1.25;max-width:12ch}
        .gallery-note{text-align:center;color:var(--muted);margin-top:4px}
        .lightbox.gallery-viewer{grid-template-rows:auto 1fr auto;gap:14px}
        .gallery-viewer-title{color:#fff;text-align:center;font-size:18px;font-weight:800}
        .gallery-stage{display:flex;align-items:center;justify-content:center;gap:16px;width:min(1060px,96vw)}
        .gallery-stage img{max-width:min(820px,78vw);max-height:72vh;transition:transform .2s ease,opacity .25s ease;opacity:0}
        .gallery-stage img.is-loaded{opacity:1}
        .gallery-stage img.is-zoomed{transform:scale(1.35);cursor:zoom-out}
        .gallery-nav{width:46px;height:46px;border-radius:50%;border:2px solid rgba(255,255,255,.7);background:rgba(255,255,255,.12);color:#fff;font-size:34px;line-height:1;cursor:pointer;transition:transform .2s ease,background .2s ease,border-color .2s ease}
        .gallery-nav:hover{background:rgba(255,255,255,.18);transform:translateY(-1px)}
        .gallery-counter{color:#fff;font-weight:800;text-align:center}
        .admission-modal{position:fixed;inset:0;z-index:100;background:rgba(31,66,87,.86);display:grid;place-items:center;padding:28px}
        .admission-modal[hidden]{display:none}
        .admission-close{position:absolute;top:18px;right:22px;width:44px;height:44px;border-radius:50%;border:2px solid rgba(255,255,255,.7);background:rgba(255,255,255,.12);color:#fff;font-size:30px;line-height:1;cursor:pointer;transition:transform .2s ease,background .2s ease}
        .admission-close:hover{transform:scale(1.04);background:rgba(255,255,255,.18)}
        .admission-dialog{background:#fff;border-radius:var(--radius);box-shadow:var(--shadow);border:1px solid var(--line);width:min(980px,94vw);max-height:88vh;overflow:auto;padding:24px}
        .admission-form fieldset{border:1px solid var(--line);border-radius:14px;padding:18px;margin:0 0 18px}
        .admission-form legend{color:var(--navy);font-weight:800;padding:0 8px}
        .form-grid{display:grid;grid-template-columns:repeat(2,1fr);gap:14px}
        .form-field{display:flex;flex-direction:column;gap:6px}
        .form-field label,.check-field{font-size:13px;font-weight:700;color:var(--navy)}
        .form-field input,.form-field select,.form-field textarea{width:100%;border:1px solid var(--line);border-radius:12px;padding:10px 12px;font:inherit;color:var(--ink);background:#fff;transition:border-color .2s ease,box-shadow .2s ease,transform .2s ease,background .2s ease}
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus{outline:none;border-color:rgba(46,90,117,.5);box-shadow:0 0 0 4px rgba(246,180,30,.16);background:#fff}
        .form-field textarea{min-height:84px;resize:vertical}
        .form-field.has-error input,.form-field.has-error select,.form-field.has-error textarea{animation:fieldShake .22s ease}
        .photo-upload{display:grid;grid-template-columns:140px minmax(0,1fr);gap:16px;align-items:center;border:1px dashed rgba(46,90,117,.35);border-radius:16px;padding:14px;background:#fbfcfd}
        .photo-preview{width:128px;aspect-ratio:1;border-radius:16px;display:grid;place-items:center;background:#eaf4fb;color:var(--muted);font-size:13px;text-align:center;overflow:hidden;border:4px solid #fff;box-shadow:0 8px 20px rgba(46,90,117,.12)}
        .photo-preview img{width:100%;height:100%;object-fit:cover}
        .photo-help{color:var(--muted);font-size:12px;margin-top:4px}
        .check-field{display:flex;gap:8px;align-items:flex-start;margin-top:10px}
        .form-actions{display:flex;gap:12px;flex-wrap:wrap;justify-content:flex-end}
        .form-message{color:var(--teal-dark);font-weight:800;margin:0 0 14px}
        .form-message.is-error{color:#b42318}
        .form-error{color:#b42318;font-size:12px;min-height:16px}
        .form-source{margin-top:4px;color:var(--muted);font-size:13px}
        .nav{position:sticky;top:0;z-index:60;background:rgba(46,90,117,.98);backdrop-filter:blur(10px);border-bottom:1px solid rgba(255,255,255,.12);transition:background-color .25s ease,backdrop-filter .25s ease,box-shadow .25s ease,opacity .25s ease}
        .nav.is-scrolled{background:rgba(46,90,117,1);box-shadow:0 10px 28px rgba(31,66,87,.22)}
        .nav:hover{background:rgba(46,90,117,1)}
        .nav-inner{position:relative;z-index:1}
        .nav-links a{transition:color .2s ease,opacity .2s ease,transform .2s ease}
        .btn{transition:transform .18s ease,box-shadow .18s ease,background-color .18s ease,filter .18s ease}
        .card,.level,.panel{transition:transform .22s ease,box-shadow .22s ease,border-color .22s ease}
        .card:hover,.level:hover,.panel:hover{transform:translateY(-4px);box-shadow:0 16px 38px rgba(51,65,92,.12)}
        .level img,.card img,.panel img{transition:transform .28s ease,opacity .28s ease}
        .team-card{display:flex;align-items:center;gap:18px;min-height:150px}
        .team-photo{width:80px;height:80px;flex:0 0 80px;border-radius:50%;border:1px solid rgba(46,90,117,.16);background:#f1f3f5;color:#8a94a3;display:grid;place-items:center;overflow:hidden;font-size:12px;font-weight:800;text-transform:uppercase;letter-spacing:.5px}
        .team-photo img{width:100%;height:100%;display:block;object-fit:cover;border-radius:50%}
        .team-photo-placeholder{display:grid;place-items:center;width:100%;height:100%}
        .team-info{min-width:0;flex:1}
        .team-card h3,.team-card p{overflow-wrap:anywhere}
        .team-card h3{margin-bottom:8px}
        .lightbox.gallery-viewer{box-sizing:border-box}
        .gallery-stage{display:grid;grid-template-columns:46px minmax(0,1fr) 46px;align-items:center;width:min(1060px,96vw)}
        .gallery-stage img{grid-column:2;justify-self:center;max-width:min(820px,100%)}
        @keyframes fieldShake{0%{transform:translateX(0)}30%{transform:translateX(-3px)}60%{transform:translateX(3px)}100%{transform:translateX(0)}}
        @keyframes rollGallery{from{transform:translate3d(0,0,0)}to{transform:translate3d(calc(-50% - 11px),0,0)}}
        @media(max-width:1024px){.nav-inner{gap:12px}.nav-toggle{display:inline-flex;width:46px;height:46px;border:1px solid rgba(255,255,255,.24);border-radius:14px;background:rgba(255,255,255,.1);align-items:center;justify-content:center;flex-direction:column;gap:5px;cursor:pointer;flex:0 0 auto}.nav-toggle span{display:block;width:22px;height:2px;border-radius:2px;background:#fff;transition:transform .22s ease,opacity .22s ease}nav.menu-open .nav-toggle span:nth-child(1){transform:translateY(7px) rotate(45deg)}nav.menu-open .nav-toggle span:nth-child(2){opacity:0}nav.menu-open .nav-toggle span:nth-child(3){transform:translateY(-7px) rotate(-45deg)}.nav-links{position:absolute;top:100%;left:0;right:0;display:flex;flex-direction:column;align-items:stretch;gap:0;max-height:0;overflow:hidden;padding:0 22px;background:rgba(46,90,117,.98);box-shadow:0 18px 28px rgba(31,66,87,.2);white-space:normal;transition:max-height .28s ease,padding .28s ease}.nav-links a{font-size:15px;text-align:left;padding:13px 4px;border-bottom:1px solid rgba(255,255,255,.12)}.nav-links a.active{color:var(--yellow)}.nav-links .nav-cta{justify-content:center;margin-top:10px;color:#1f4257;border-bottom:0}nav.menu-open .nav-links{max-height:75vh;overflow-y:auto;padding:10px 22px 18px}}
        @media(max-width:880px){.level img{width:100%;aspect-ratio:4/3;object-fit:cover;border-radius:14px;border:4px solid rgba(255,255,255,.7);margin-bottom:16px}.form-grid{grid-template-columns:1fr}}
        @media(max-width:980px){#about .about-layout{grid-template-columns:minmax(260px,.8fr) minmax(330px,1fr);gap:42px}#about .about-images{grid-template-rows:repeat(2,160px)}#about .about-image{width:160px;height:160px}#about .about-copy p{font-size:16px}}
        @media(max-width:880px){.team-photo{width:70px;height:70px;flex-basis:70px}}
        @media(max-width:767px){.container{padding:0 16px}.nav-inner{padding:10px 16px}.logo{font-size:14px;letter-spacing:1px;min-width:0}.logo .mark{width:44px;height:44px}.logo small{letter-spacing:4px}.hero{padding:48px 0 105px}.hero-lockup{padding:0 16px}.brand-title{font-size:clamp(34px,12vw,44px);letter-spacing:5px;padding-left:5px;overflow-wrap:anywhere}.brand-sub{font-size:14px;letter-spacing:8px;padding-left:8px}.brand-tag{font-size:16px;gap:10px;line-height:1.35;flex-wrap:wrap;margin-bottom:30px}.brand-tag .ln{width:34px}.hero-cta,.form-actions{align-items:stretch;flex-direction:column}.btn{min-height:44px;justify-content:center;padding:12px 20px}.sec-head{margin-bottom:28px}.sec-head h2{font-size:28px;line-height:1.2}section.pad{padding:48px 0}.cards,.levels,.eyfs,.gallery{grid-template-columns:1fr;gap:18px}.card,.level,.panel{padding:22px}.team-card{gap:16px;min-height:126px}.team-photo{width:60px;height:60px;flex-basis:60px;font-size:11px}.rolling-gallery{gap:14px;animation-duration:28s}.rolling-item{flex-basis:132px}.photo-upload{grid-template-columns:1fr}.photo-preview{width:min(100%,180px);margin:auto}.gallery-highlights{gap:16px;--circle:92px;--ring:5px}.gallery-highlight{min-width:104px;gap:8px}.highlight-label{font-size:13px}.gallery-stage{grid-template-columns:40px minmax(0,1fr) 40px;gap:0;width:100%}.gallery-stage img{max-width:100%;max-height:68vh}.gallery-nav{width:40px;height:40px;font-size:28px}.gcircle img{width:min(68vw,220px);height:min(68vw,220px)}.strip{margin:0;padding:32px 18px;border-radius:20px}.strip h2{font-size:25px}.foot-grid{gap:20px}.admission-modal{padding:12px;align-items:start;overflow:auto}.admission-dialog{width:100%;max-height:none;margin:58px 0 12px;padding:18px;border-radius:16px}.admission-close{top:10px;right:12px}.admission-form fieldset{padding:14px}}
        /* ─── Unified Expandable System ─── */
        /* Preschool storybook redesign from About onward */
        main{background:linear-gradient(180deg,#fbfcfd 0%,#f7fbff 34%,#fffaf0 68%,#fbfcfd 100%)}
        main section.pad{position:relative;overflow:hidden;padding:86px 0;background:radial-gradient(circle at 8% 18%,rgba(246,180,30,.12) 0 52px,transparent 53px),radial-gradient(circle at 92% 12%,rgba(46,90,117,.10) 0 64px,transparent 65px),linear-gradient(180deg,rgba(255,255,255,.74),rgba(234,244,251,.62))}
        main section.pad:nth-of-type(even){background:radial-gradient(circle at 12% 80%,rgba(255,158,196,.12) 0 58px,transparent 59px),radial-gradient(circle at 88% 70%,rgba(57,194,180,.12) 0 68px,transparent 69px),linear-gradient(180deg,rgba(255,250,240,.82),rgba(255,255,255,.9))}
        main section.pad::before{content:"";position:absolute;left:0;right:0;top:0;height:22px;background:linear-gradient(135deg,transparent 25%,rgba(46,90,117,.08) 25% 50%,transparent 50% 75%,rgba(246,180,30,.12) 75%);background-size:44px 22px;opacity:.8}
        main section.pad::after{content:"✦";position:absolute;right:clamp(18px,5vw,78px);top:56px;color:rgba(246,180,30,.45);font-size:34px;animation:kvFloat 5.4s ease-in-out infinite;pointer-events:none}
        main section.pad .container{width:min(100% - 48px,1240px);margin-inline:auto}
        main section.pad .sec-head{position:relative;max-width:780px;margin:0 auto 42px;text-align:center}
        main section.pad .sec-head::after{content:"";display:block;width:min(230px,46vw);height:10px;margin:16px auto 0;border-radius:999px;background:linear-gradient(90deg,var(--yellow),#fff3dd,var(--teal),#e2f8f5)}
        main section.pad .eyebrow{display:inline-flex;align-items:center;gap:8px;border-radius:999px;background:rgba(255,255,255,.78);border:1px solid rgba(46,90,117,.12);box-shadow:0 8px 20px rgba(31,66,87,.08);padding:7px 14px;color:var(--teal-dark)}
        main section.pad .eyebrow::before{content:"★";color:var(--yellow);font-size:13px}
        main section.pad .sec-head h2{font-size:clamp(30px,4vw,48px);line-height:1.12;color:var(--navy);margin-top:14px}
        main section.pad .sec-head p{font-size:clamp(16px,1.7vw,19px);line-height:1.75;color:#5f687c;max-width:760px}
        main section.pad .cards,main section.pad .levels,main section.pad .two-col,main section.pad .eyfs,main section.pad .gallery{align-items:stretch;justify-content:center}
        main section.pad .cards{grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:26px}
        main section.pad .two-col{gap:30px}
        main section.pad .card,main section.pad .panel{position:relative;overflow:hidden;border:1px solid rgba(46,90,117,.10);border-radius:28px;background:linear-gradient(145deg,rgba(255,255,255,.96),rgba(255,253,247,.95));box-shadow:0 18px 42px rgba(31,66,87,.11);padding:30px}
        main section.pad .card::before,main section.pad .panel::before{content:"";position:absolute;inset:0 0 auto 0;height:7px;background:linear-gradient(90deg,var(--yellow),#e2f8f5,#fdecf1,var(--teal));opacity:.9}
        main section.pad .card::after,main section.pad .panel::after{content:"";position:absolute;right:18px;bottom:16px;width:46px;height:30px;border-radius:999px;background:rgba(234,244,251,.72);box-shadow:-20px 5px 0 rgba(255,243,221,.8);opacity:.7;pointer-events:none}
        main section.pad .card:hover,main section.pad .panel:hover{transform:translateY(-8px) scale(1.01);box-shadow:0 24px 54px rgba(31,66,87,.16);border-color:rgba(246,180,30,.38)}
        main section.pad .card h3,main section.pad .panel h3{color:var(--teal-dark);font-size:clamp(19px,2vw,24px);line-height:1.2}
        main section.pad .card p,main section.pad .panel p,main section.pad .panel li{color:#606a7d;font-size:16px;line-height:1.72}
        main section.pad .panel img{border-radius:24px!important;border:6px solid rgba(255,255,255,.9);box-shadow:0 18px 36px rgba(31,66,87,.16)}
        main section.pad .level{position:relative;overflow:hidden;min-height:100%;border-radius:30px;padding:26px 22px 30px;box-shadow:0 20px 44px rgba(31,66,87,.16);transition:transform .24s ease,box-shadow .24s ease,filter .24s ease}
        main section.pad .level::before{content:"";position:absolute;inset:12px;border:2px dashed rgba(255,255,255,.46);border-radius:24px;pointer-events:none}
        main section.pad .level:hover{transform:translateY(-9px) rotate(-.5deg);box-shadow:0 28px 58px rgba(31,66,87,.22);filter:saturate(1.06)}
        main section.pad .level img{border-radius:24px;border:6px solid rgba(255,255,255,.78);box-shadow:0 16px 30px rgba(31,66,87,.18)}
        main section.pad .level:hover img{transform:scale(1.035)}
        main section.pad .eyfs div{border-radius:24px;padding:22px 18px;background:linear-gradient(145deg,#fff,#f7fbff);border:1px solid rgba(46,90,117,.10);box-shadow:0 16px 34px rgba(31,66,87,.10);transition:transform .22s ease,box-shadow .22s ease}
        main section.pad .eyfs div:hover{transform:translateY(-6px);box-shadow:0 22px 44px rgba(31,66,87,.15)}
        main section.pad .gcircle{padding:12px 12px 18px;border-radius:24px;background:#fff;box-shadow:0 16px 34px rgba(31,66,87,.12);transform:rotate(-1deg);transition:transform .24s ease,box-shadow .24s ease}
        main section.pad .gcircle:nth-child(even){transform:rotate(1deg)}
        main section.pad .gcircle:hover{transform:translateY(-7px) rotate(0deg);box-shadow:0 24px 48px rgba(31,66,87,.17)}
        main section.pad .gcircle img{border-radius:22px;border:0;width:clamp(150px,20vw,220px);height:clamp(150px,20vw,220px)}
        main section.pad .strip{border-radius:34px;background:linear-gradient(135deg,var(--teal),#3a6a86 52%,#f6b41e);box-shadow:0 22px 54px rgba(31,66,87,.18)}
        main section.pad .btn,.admission-modal .btn{border-radius:999px;min-height:46px;box-shadow:0 12px 26px rgba(246,180,30,.24);transition:transform .18s ease,box-shadow .18s ease,background-color .18s ease}
        main section.pad .btn:hover,.admission-modal .btn:hover{transform:translateY(-3px) scale(1.02);box-shadow:0 18px 34px rgba(246,180,30,.34)}
        .admission-dialog{border-radius:30px;border:1px solid rgba(46,90,117,.12);box-shadow:0 26px 70px rgba(31,66,87,.22)}
        .admission-form fieldset{border-color:rgba(46,90,117,.14);border-radius:22px;background:linear-gradient(145deg,#fff,#fbfcfd)}
        .form-field input,.form-field select,.form-field textarea{border-radius:16px;border-color:rgba(46,90,117,.16)}
        .form-field input:focus,.form-field select:focus,.form-field textarea:focus{transform:translateY(-1px)}
        footer{position:relative;overflow:hidden;background:linear-gradient(145deg,#1f4257,#2e5a75);margin-top:0}
        footer::before{content:"";position:absolute;left:0;right:0;top:0;height:18px;background:linear-gradient(135deg,transparent 25%,rgba(255,255,255,.16) 25% 50%,transparent 50% 75%,rgba(246,180,30,.28) 75%);background-size:44px 18px}
        @keyframes kvFloat{0%,100%{transform:translateY(0) rotate(0deg)}50%{transform:translateY(-12px) rotate(8deg)}}
        @keyframes kvSoftBob{0%,100%{transform:translateY(0)}50%{transform:translateY(-5px)}}
        @keyframes aboutImageIn{from{opacity:0;transform:scale(.94)}to{opacity:1;transform:scale(1)}}
        @keyframes aboutHeadingIn{from{opacity:0;transform:translateY(-14px)}to{opacity:1;transform:translateY(0)}}
        @keyframes aboutTextIn{from{opacity:0;transform:translateY(18px)}to{opacity:1;transform:translateY(0)}}
        @media(max-width:980px){main section.pad{padding:68px 0}main section.pad .two-col{grid-template-columns:1fr}main section.pad .levels{grid-template-columns:repeat(2,minmax(0,1fr))}}
        @media(max-width:767px){main section.pad{padding:56px 0}main section.pad .container{width:min(100% - 32px,1240px);padding:0}main section.pad .cards,main section.pad .levels,main section.pad .eyfs,main section.pad .gallery{grid-template-columns:1fr}main section.pad .card,main section.pad .panel{border-radius:24px;padding:24px}main section.pad .sec-head{margin-bottom:30px}#about .about-layout{display:flex;flex-direction:column;align-items:center;gap:0;text-align:center;min-height:0}#about .about-images{display:contents}#about .about-copy{display:contents;max-width:none}#about .about-copy h2{order:1;margin-bottom:30px;font-size:32px}#about .about-image{width:min(66vw,190px);height:min(66vw,190px);margin:0!important}#about .about-image:first-child{order:2}#about .about-copy p:first-of-type{order:3;margin:26px auto 42px;max-width:34rem;font-size:16px;line-height:1.55}#about .about-image:nth-child(2){order:4}#about .about-copy p:nth-of-type(2){order:5;margin:26px auto 0;max-width:34rem;font-size:16px;line-height:1.55}}
        @media(prefers-reduced-motion:reduce){main section.pad::after{animation:none}#about .about-image,#about .about-copy h2,#about .about-copy p{animation:none}main section.pad .card,main section.pad .panel,main section.pad .level,main section.pad .gcircle,main section.pad .btn,.admission-modal .btn{transition:none}}
        .kv-expand{position:relative;overflow:hidden;max-height:var(--kv-expand-height,none);transition:max-height .36s cubic-bezier(.4,0,.2,1);overflow-wrap:anywhere}
        .kv-expand::after{content:"";position:absolute;left:0;right:0;bottom:0;height:3.6em;background:linear-gradient(to bottom,rgba(255,255,255,0),var(--kv-expand-bg,#fff));opacity:1;pointer-events:none;transition:opacity .22s ease}
        .kv-expand.is-expanded{overflow:visible}
        .kv-expand.is-expanded::after,.kv-expand:not(.is-collapsible)::after{opacity:0}
        .kv-expand > *:first-child{margin-top:0}
        .kv-expand > *:last-child{margin-bottom:0}
        .kv-expand-toggle{display:inline-flex;align-items:center;justify-content:center;gap:8px;min-height:44px;margin-top:8px;border:0;background:transparent;color:var(--teal-dark);font:inherit;font-weight:800;padding:8px 0 0;cursor:pointer;outline-offset:4px}
        .kv-expand-toggle::after{content:"";width:8px;height:8px;border-right:2px solid currentColor;border-bottom:2px solid currentColor;transform:rotate(45deg);transition:transform .22s ease}
        .kv-expand-toggle[aria-expanded="true"]::after{transform:rotate(225deg)}
        .kv-expand-toggle:focus-visible{border-radius:8px;outline:3px solid rgba(246,180,30,.42)}
        .card,.panel,.sec-head{min-width:0}
        .container{width:min(100% - 44px,1150px);margin:0 auto}
        @media(min-width:1366px){.container,.nav-inner{max-width:1160px}}
      `;
      document.head.appendChild(s);
    }

    function applyExpandableText(root = document) {
      const selector = '[data-expandable-text], .card p, .panel p:not(.desc), .panel ul, .sec-head p';
      const minExpandableCharacters = 520;
      const previewLines = () => {
        const width = window.innerWidth;
        if (width <= 480) return 4.5;
        if (width <= 767) return 5.5;
        if (width <= 1024) return 6.5;
        return 7.5;
      };
      const collapsedHeight = target => {
        const lineHeight = parseFloat(getComputedStyle(target).lineHeight) || 22;
        return Math.round(lineHeight * previewLines());
      };
      const measure = target => {
        const collapsed = collapsedHeight(target);
        const expanded = target.scrollHeight;
        const lineHeight = parseFloat(getComputedStyle(target).lineHeight) || 22;
        return {collapsed, expanded, collapsible: expanded > collapsed + lineHeight};
      };
      const setState = (target, expanded) => {
        const size = measure(target);
        const button = document.getElementById(target.dataset.expandButton);
        target.classList.toggle('is-collapsible', size.collapsible);
        target.classList.toggle('is-expanded', expanded && size.collapsible);
        target.style.setProperty('--kv-expand-height', size.collapsible ? `${expanded ? size.expanded : size.collapsed}px` : 'none');
        if (!button) return;
        button.hidden = !size.collapsible;
        button.textContent = expanded && size.collapsible ? 'Read Less' : 'Read More';
        button.setAttribute('aria-expanded', String(Boolean(expanded && size.collapsible)));
      };

      $$(selector, root).forEach((target, index) => {
        if (target.dataset.expandableReady || target.closest('[data-no-expand]')) return;
        if (!target.hasAttribute('data-expandable-text') && target.closest('[data-expandable-text]')) return;
        const plainText = (target.textContent || '').replace(/\s+/g, ' ').trim();
        if (plainText.length < minExpandableCharacters) return;
        const id = target.id || `kv-expand-${Date.now().toString(36)}-${index}`;
        const buttonId = `${id}-toggle`;
        const surface = target.closest('.card,.panel,.sec-head') || target;
        target.id = id;
        target.dataset.expandableReady = 'true';
        target.dataset.expandButton = buttonId;
        target.classList.add('kv-expand');
        target.style.setProperty('--kv-expand-bg', getComputedStyle(surface).backgroundColor || '#fff');
        const button = document.createElement('button');
        button.type = 'button';
        button.id = buttonId;
        button.className = 'kv-expand-toggle';
        button.textContent = 'Read More';
        button.setAttribute('aria-expanded', 'false');
        button.setAttribute('aria-controls', id);
        target.after(button);
        requestAnimationFrame(() => setState(target, false));
      });

      if (root.dataset.expandableDelegated) return;
      root.dataset.expandableDelegated = 'true';
      root.addEventListener('click', event => {
        const button = event.target.closest('.kv-expand-toggle');
        if (!button || !root.contains(button)) return;
        const target = document.getElementById(button.getAttribute('aria-controls'));
        if (!target) return;
        const expanded = button.getAttribute('aria-expanded') !== 'true';
        setState(target, expanded);
        if (!expanded) target.closest('.card,.panel,.sec-head')?.scrollIntoView({behavior: 'smooth', block: 'nearest'});
      });

      let resizeFrame = 0;
      window.addEventListener('resize', () => {
        cancelAnimationFrame(resizeFrame);
        resizeFrame = requestAnimationFrame(() => {
          $$('.kv-expand', root).forEach(target => setState(target, target.classList.contains('is-expanded')));
        });
      }, {passive: true});
    }

    function header() {
      const links = navSections.map(([id, label]) => hashLink(`#${id}`, label)).join('');
      const portal = `<a href="${data.school.portalUrl}" class="btn btn-primary nav-cta" style="color:#000">Portal</a>`;
      return `<nav aria-label="Primary navigation" style="position:fixed;top:0;right:0;left:0;z-index:60;background:rgba(46,90,117,.98);backdrop-filter:blur(10px);-webkit-backdrop-filter:blur(10px);box-shadow:0 2px 12px rgba(31,66,87,.16)"><div class="nav-inner">${logoLockup()}<button type="button" class="nav-toggle" aria-expanded="false" aria-controls="primary-menu" aria-label="Open navigation"><span></span><span></span><span></span></button><div class="nav-links" id="primary-menu">${links}${portal}</div></div></nav><div aria-hidden="true" style="height:50px"></div>`;
    }
    function hero(title = 'KINDERVALE', subtitle = 'PRESCHOOL', tag = data.school.tagline, admissionModal = false, admissionSource = 'General Admissions') {
      const admissionCta = admissionModal ? `<button type="button" class="btn btn-primary" data-open-admission data-admission-source="${escape(admissionSource)}">Admissions -></button>` : hashLink('#admissions', 'Admissions ->', 'btn btn-primary');
      return `<header class="hero" id="home"><div class="sky-layer"><div class="cloud c1"></div><div class="cloud c2"></div><div class="cloud c3"></div><div class="cloud c4"></div></div><div class="hero-lockup"><img class="hero-birds" src="${data.images.logo}" alt="" width="120" height="120"><h1 class="brand-title">${escape(title)}</h1><div class="brand-sub">${escape(subtitle)}</div><div class="brand-tag"><span class="ln"></span>${escape(tag)}<span class="ln"></span></div><div class="hero-cta">${admissionCta}${hashLink('#about', 'Explore Kindervale', 'btn btn-ghost')}</div></div><div class="wave"><svg viewBox="0 0 1440 140" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" style="width:100%;height:50px"><path fill="#d6ecf7" d="M0,70 C70,40 130,90 210,64 C300,34 350,92 450,70 C560,46 620,96 730,72 C850,46 900,98 1020,74 C1140,50 1200,96 1300,72 C1370,55 1410,78 1440,70 L1440,140 L0,140 Z"/><path fill="#eaf4fb" d="M0,95 C90,66 160,104 260,84 C370,62 430,106 560,90 C690,74 760,110 900,92 C1030,76 1110,108 1240,92 C1340,80 1400,100 1440,92 L1440,140 L0,140 Z"/></svg></div></header>`;
    }
    function section(title, eyebrow, body, id = '') { return `<section class="pad" ${id ? `id="${id}"` : ''}><div class="container"><div class="sec-head"><span class="eyebrow">${escape(eyebrow)}</span><h2>${escape(title)}</h2></div>${body}</div></section>`; }
    function textCard(title, text) { return `<article class="card"><h3>${escape(title)}</h3><p>${escape(text)}</p></article>`; }
    function teamCard(member) {
      const photo = member.photo ? `<img src="${escape(member.photo)}" alt="${escape(member.name)}" loading="lazy" decoding="async">` : '<span class="team-photo-placeholder">Photo</span>';
      return `<article class="card team-card"><div class="team-photo">${photo}</div><div class="team-info"><h3>${escape(member.role)}</h3><p>${escape(member.name)}</p></div></article>`;
    }
    function rollingImages() {
      const items = data.images.gallery.slice(0, 10);
      const repeated = [...items, ...items];
      return `<section class="playful-band" aria-label="Kindervale moments"><div class="rolling-gallery">${repeated.map(entry => `<figure class="rolling-item"><img src="${escape(entry.thumbnail || entry.src)}" alt="${escape(entry.title)}" loading="lazy" decoding="async"></figure>`).join('')}</div></section>`;
    }
    function aboutText(text) {
      return escape(text)
        .replace('Ms. Tazeen Raza', '<strong>Ms. Tazeen Raza</strong>')
        .replace("It's a celebration of childhood.", "<strong>It's a celebration of childhood.</strong>")
        .replace('well-groomed, compassionate and confident members of the community.', '<strong>well-groomed, compassionate and confident members of the community.</strong>');
    }
    function about() {
      const firstImage = data.images.gallery[0] || data.images.gallery[2] || {};
      const secondImage = data.images.gallery[11] || data.images.gallery[10] || data.images.gallery[1] || {};
      return `<section class="pad" id="about"><div class="container"><div class="about-layout"><div class="about-images"><figure class="about-image"><img src="${escape(firstImage.thumbnail || firstImage.src || data.images.logo)}" alt="${escape(firstImage.title || 'Kindervale classroom activity')}" loading="lazy" decoding="async"></figure><figure class="about-image"><img src="${escape(secondImage.thumbnail || secondImage.src || data.images.logo)}" alt="${escape(secondImage.title || 'Kindervale learning activity')}" loading="lazy" decoding="async"></figure></div><div class="about-copy"><h2>About Us</h2><p>${aboutText(data.about[0])}</p><p>${aboutText(data.about[1])}</p></div></div></div></section>`;
    }
    function missionVision() { return section('Our Purpose', 'Mission, Vision & Values', `<div class="cards" data-mobile-collapse>${textCard('Our Mission', data.mission)}${textCard('Our Vision', data.vision)}${textCard('Our Values', data.values.slice(0, 3).join(' '))}</div><div class="panel" style="margin-top:24px" data-mobile-collapse><h3>Values in practice</h3><ul>${data.values.map(value => `<li>${escape(value)}</li>`).join('')}</ul></div>`, 'mission-vision'); }
    function founder() { return section(' ', "Founder's Message", `<div class="two-col"><div class="panel" data-mobile-collapse><img src="${data.images.founder}" alt="${escape(data.founder.name)}, ${escape(data.founder.title)}" loading="lazy" decoding="async" style="width:100%;border-radius:14px;margin-bottom:16px"><h3>${escape(data.founder.name)}</h3><p class="desc">${escape(data.founder.title)}</p><div data-expandable-text>${data.founder.career.map(p => `<p style="margin-top:14px">${escape(p)}</p>`).join('')}</div></div><div class="panel founder-message" data-mobile-collapse><h3>Dear Parents,</h3><div class="founder-message-content" id="founder-message-content" data-expandable-text>${data.founder.message.map(p => `<p style="margin-bottom:14px">${escape(p)}</p>`).join('')}<p><strong>${escape(data.founder.name)}</strong></p></div></div></div>`, 'founder'); }
    function curriculum() { return section('Early Years Foundation Stage', 'Curriculum', `<div class="sec-head" data-mobile-collapse><p>${escape(data.curriculum.summary)}</p></div><div class="eyfs">${data.curriculum.areas.map((area, index) => `<div><span>${['♥','★','✦','●','◎','✿','○'][index]}</span>${escape(area)}</div>`).join('')}</div>`, 'curriculum'); }
    function levels() {
      const colours = ['#ff8a6b,#ffb199','#39c2b4,#6fd8cd','#ffd15c,#ffe08a','#8a7ff0,#afa6ff','#2e5a75,#3a6a86'];
      return section('Learning Stages for Every Age', 'Our Levels', `<div class="levels">${data.levels.map((level, i) => `<a href="${homePath}levels/${level.slug}/" data-route class="level" aria-label="Explore ${escape(level.name)}" style="background:linear-gradient(135deg,${colours[i]})"><img src="${level.image}" alt="${escape(level.imageAlt || level.name)}" loading="lazy" decoding="async"><h3>${escape(level.name)}</h3></a>`).join('')}</div><p style="text-align:center;color:var(--muted);margin-top:24px">All classes end at 12 noon on Friday.</p>`, 'levels');
    }
    function gallery() {
      const grouped = data.images.gallery.reduce((acc, entry) => {
        const category = entry.category || 'Daily Life';
        acc[category] = acc[category] || [];
        acc[category].push(entry);
        return acc;
      }, {});
      const preferred = ['Campus', 'Classrooms', 'Learning Activities', 'Outdoor Play', 'Events & Celebrations', 'Art & Creativity', 'Sports', 'Daily Life'];
      const categories = [...preferred.filter(category => grouped[category]), ...Object.keys(grouped).filter(category => !preferred.includes(category)).sort()];
      const body = `<div class="gallery-highlights" aria-label="Gallery categories">${categories.map(category => {
        const cover = grouped[category].find(entry => entry.featured) || grouped[category][0];
        return `<button type="button" class="gallery-highlight" data-gallery-category="${escape(category)}"><span class="highlight-cover"><img src="${escape(cover.thumbnail || cover.src)}" alt="" loading="lazy" decoding="async"></span><span class="highlight-label">${escape(category)}</span></button>`;
      }).join('')}</div><p class="gallery-note">Tap a highlight to view the full category.</p>`;
      return section('Life at Kindervale', 'Gallery & Events', `${body}<div class="panel"><h3>Events</h3><p>${data.events.map(escape).join(' · ')}</p></div>`, 'gallery');
    }
    function facilities() { return section('A Safe, Nurturing Setting', 'School Facilities', `<div class="cards">${data.facilities.map(item => textCard(item, '')).join('')}</div>`, 'facilities'); }
    function team() { return section('The Kindervale Team', 'Our Team', `<div class="cards">${data.team.map(member => teamCard(member)).join('')}</div>`, 'team'); }
    function fees() { return section('Fee Structure', data.fees.year, `<div class="cards">${data.fees.items.map(([label, amount]) => textCard(label, amount)).join('')}</div><div class="panel" style="margin-top:24px"><h3>Notes</h3><ol>${data.fees.notes.map(note => `<li>${escape(note)}</li>`).join('')}</ol></div>`, 'fees'); }
    function admissions() { return section('Admissions', 'Join Kindervale', `<div class="two-col"><article class="panel"><h3>Plan your visit</h3><p>${escape(data.admissions.tour)}</p><p style="margin-top:14px"><strong>Office hours</strong></p>${data.admissions.officeHours.map(item => `<p>${escape(item)}</p>`).join('')}<p style="margin-top:20px"><button type="button" class="btn btn-primary" data-open-admission>Admission Form -></button></p></article><article class="panel" data-mobile-collapse><h3>Contact us</h3><p>${escape(data.school.address)}</p><p style="margin-top:12px"><a href="tel:${data.school.phone.replace(/\s/g, '')}">${escape(data.school.phone)}</a></p><p><a href="tel:${data.school.landline.replace(/\s/g, '')}">${escape(data.school.landline)}</a></p><p><a href="mailto:${data.school.email}">${escape(data.school.email)}</a></p></article></div>`, 'admissions'); }
    function consultancy() { return section('Kindervale Consultancy', 'Consultancy', `<div class="sec-head" data-mobile-collapse><p>${escape(data.consultancy.summary)}</p></div><div class="cards">${data.consultancy.services.map(service => textCard(service[0], service[1])).join('')}</div>`, 'consultancy'); }
    function footer() { return `<footer id="contact"><div class="container"><div class="foot-grid"><div>${logoLockup()}<p style="margin-top:14px">${escape(data.school.address)}</p></div><div><h5>Contact</h5><a href="tel:${data.school.phone.replace(/\s/g, '')}">${escape(data.school.phone)}</a><a href="tel:${data.school.landline.replace(/\s/g, '')}">${escape(data.school.landline)}</a><a href="mailto:${data.school.email}">${escape(data.school.email)}</a></div><div><h5>Quick Links</h5>${hashLink('#about', 'About Us')}${hashLink('#mission-vision', 'Mission & Vision')}${hashLink('#curriculum', 'Curriculum')}${hashLink('#levels', 'Our Levels')}${hashLink('#admissions', 'Admissions')}${hashLink('#contact', 'Contact')}</div></div><div class="foot-bottom">© ${new Date().getFullYear()} Kindervale Preschool</div></div></footer>`; }
    function home() { return `${hero()}${rollingImages()}${about()}${founder()}${missionVision()}${curriculum()}${levels()}${gallery()}${facilities()}${team()}${fees()}${admissions()}${consultancy()}${footer()}${lightbox()}`; }
    function lightbox() { return `<div class="lightbox gallery-viewer" role="dialog" aria-modal="true" aria-label="Gallery image viewer" hidden><button type="button" class="lightbox-close" aria-label="Close gallery image">×</button><div class="gallery-viewer-title"></div><div class="gallery-stage"><button type="button" class="gallery-nav gallery-prev" aria-label="Previous image">‹</button><img src="" alt=""><button type="button" class="gallery-nav gallery-next" aria-label="Next image">›</button></div><p></p><div class="gallery-counter" aria-live="polite"></div></div>`; }
    function admissionModal() {
      const field = (id, label, type = 'text', required = false, attrs = '') => `<div class="form-field"><label for="${id}">${label}${required ? ' *' : ''}</label><input id="${id}" name="${id}" type="${type}" ${required ? 'required' : ''} ${attrs}><span class="form-error" data-error-for="${id}"></span></div>`;
      const area = (id, label, required = false) => `<div class="form-field"><label for="${id}">${label}${required ? ' *' : ''}</label><textarea id="${id}" name="${id}" ${required ? 'required' : ''}></textarea><span class="form-error" data-error-for="${id}"></span></div>`;
      const parentFields = (prefix, title) => `<fieldset><legend>${title}</legend><div class="form-grid">${field(`${prefix}-name`, 'Name', 'text', true)}${field(`${prefix}-nic`, 'NIC Number', 'text', true)}${field(`${prefix}-occupation`, 'Occupation')}${area(`${prefix}-postal-address`, 'Postal Address', true)}${field(`${prefix}-contact-number`, 'Contact Number', 'tel', true)}${field(`${prefix}-email-address`, 'Email Address', 'email')}</div></fieldset>`;
      const educationRow = index => `<div class="form-grid">${field(`school-${index}-name`, 'Name of School')}${field(`school-${index}-from`, 'From', 'date')}${field(`school-${index}-to`, 'To', 'date')}${area(`school-${index}-withdrawal`, 'Reason for withdrawal')}</div>`;
      return `<div class="admission-modal" role="dialog" aria-modal="true" aria-labelledby="admission-title" hidden><button type="button" class="admission-close" aria-label="Close admission form">&times;</button><div class="admission-dialog"><form class="admission-form" enctype="multipart/form-data" novalidate><h2 id="admission-title" style="color:var(--navy);margin-bottom:10px">Student Information Form</h2><p class="desc">Kindervale Preschool admission form</p><p class="form-source"></p><p class="form-message" role="status" aria-live="polite"></p><input type="hidden" id="admission-source" name="admission-source" value="General Admissions"><fieldset><legend>Student Information</legend><div class="form-grid">${field('student-name', 'Name', 'text', true)}${field('date-of-birth', 'Date of Birth', 'date', true)}${field('admitted-in', 'Admitted in', 'text', true)}${field('admitted-on', 'Admitted on', 'date')}${field('age-at-admission', 'Age (At the time of Admission)', 'text', true)}</div><div class="form-field" style="margin-top:14px"><label for="student-photo">Recent passport-size photograph</label><div class="photo-upload"><div class="photo-preview" data-photo-preview>No photo selected</div><div><input id="student-photo" name="student-photo" type="file" accept="image/jpeg,image/png,image/webp"><p class="photo-help">Accepted formats: JPG, JPEG, PNG, WEBP. Maximum size: 3 MB.</p><span class="form-error" data-error-for="student-photo"></span></div></div></div></fieldset><fieldset><legend>Education History</legend>${educationRow(1)}${educationRow(2)}</fieldset><fieldset><legend>Medical Information</legend>${area('medical-information', 'Does the child have any physical impairments, allergies or special needs? If so, kindly elaborate.')}</fieldset><div class="two-col">${parentFields('father-guardian', 'Father/Guardian')}${parentFields('mother-guardian', 'Mother/Guardian')}</div><fieldset><legend>Emergency Contact Information</legend><div class="form-grid">${field('emergency-1-name', 'Name', 'text', true)}${field('emergency-1-contact-number', 'Contact Number', 'tel', true)}${field('emergency-2-name', 'Name')}${field('emergency-2-contact-number', 'Contact Number', 'tel')}</div></fieldset><fieldset><legend>Terms and Conditions</legend><ol><li>The admission form must be completed in all respects and returned to the school office along with the required documents listed below.</li><li>The school reserves all rights to review and revise the registration fee, tuition fee and all other fees without prior notice or consent of the parents.</li><li>The security fee will only be refundable upon giving a one month notice of withdrawal in advance.</li><li>Our charges do not include the cost of school events, uniforms, stationery supplies and books.</li><li>The school may shift the premises of any branch of the school to another location for any reason and the consent of parents shall not be necessary in this regard. An advance notice will, however, be given to the parents.</li><li>The school has the absolute discretion to regulate the syllabus, curriculum course books and other teaching materials in order to provide quality education to the student. The consent of the parents is not required to make any changes in the curriculum etc.</li><li>The school reserves the right to accept or refuse registration without assigning any reason.</li><li>Parents are expected to clear all monthly dues by the 10th every month.</li></ol><label class="check-field"><input type="checkbox" name="national-id-copies"> Copies of National ID card of both the parents or guardian (Pakistani Nationals).</label><label class="check-field"><input type="checkbox" name="passport-copies"> Copies of the first two pages of passport of both the parents or guardian (Foreign Nationals).</label><label class="check-field"><input type="checkbox" name="birth-certificate"> Copy of child's birth certificate.</label><label class="check-field"><input type="checkbox" name="last-school-report"> Copies of your child's last school report - if applicable.</label><label class="check-field"><input type="checkbox" name="photographs"> Three passport size photographs of the child.</label><label class="check-field"><input type="checkbox" name="terms-agreement" required> I have carefully read and understood the above instruction / terms and hereby agree to abide by these. I also agree and undertake to give one month notice of withdrawal or one month fee in lieu thereof. *</label><span class="form-error" data-error-for="terms-agreement"></span></fieldset><fieldset><legend>Parent/Guardian Signature</legend><div class="form-grid">${field('signatory-name', 'Name', 'text', true)}${field('digital-signature', 'Signature', 'text', true, 'placeholder="Type full name as digital signature"')}${field('signature-date', 'Date', 'date', true)}</div></fieldset><fieldset><legend>For Office Use Only</legend><div class="form-grid">${field('interview-date', 'Interview Date', 'date')}${field('accepted-rejected', 'Accepted/Rejected')}${area('observations', 'Observations')}${field('registration-receipt', 'Registration Receipt #')}${field('admission-date', 'Admission Date', 'date')}${field('academic-year', 'Academic Year')}${field('interviewer-signature', "Interviewer's Signature")}${field('director-signature', "Director's Signature")}</div></fieldset><div class="form-actions"><button type="reset" class="btn btn-ghost" style="color:var(--teal-dark);border-color:var(--line)">Reset / Clear</button><button type="submit" class="btn btn-primary">Submit</button></div></form></div></div>`;
    }
    function levelPage(level) {
      const galleryItems = data.images.gallery.slice(0, 3);
      return `${hero(level.name.toUpperCase(), 'PROGRAMME', `Age ${level.age}`, true)}${section(level.name, 'Overview', `<div class="panel"><p><a href="${homePath}#levels" data-back-home class="btn btn-primary">Back to homepage</a></p></div><div class="two-col"><article class="panel"><h3>Overview</h3><p>${escape(level.overview)}</p><h3 style="margin-top:20px">Age group</h3><p>${escape(level.age)}</p><h3 style="margin-top:20px">Timings</h3><p>${escape(level.timings)}</p></article><article class="panel"><h3>Curriculum</h3><p>${escape(level.curriculum)}</p><h3 style="margin-top:20px">Learning objectives</h3><ul>${level.objectives.map(item => `<li>${escape(item)}</li>`).join('')}</ul><h3 style="margin-top:20px">Daily activities</h3><p>${level.activities.map(escape).join(' · ')}</p></article></div><div class="gallery" style="margin-top:34px">${galleryItems.map(entry => `<figure class="gcircle">${image(entry)}<figcaption>${escape(entry.title)}</figcaption></figure>`).join('')}</div><div class="strip"><div style="position:relative;z-index:2"><h2>Interested in ${escape(level.name)}?</h2><p>Book a tour or access the admission form to take the next step.</p><button type="button" class="btn btn-primary" data-open-admission>Admissions -></button></div></div>`)}${footer()}`;
    }
    function updateNavbarState() {
      const nav = $('nav');
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    function wireNavigation() {
      const nav = $('nav');
      const toggle = $('.nav-toggle');
      const menu = $('#primary-menu');
      if (!nav || !toggle || !menu) return;
      const closeMenu = () => {
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      };
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      });
      menu.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      nav.addEventListener('mouseenter', updateNavbarState);
      nav.addEventListener('mouseleave', updateNavbarState);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
      });
      updateNavbarState();
    }

    function wireAdmissionModal() {
      const modal = $('.admission-modal');
      if (!modal) return;
      const form = $('.admission-form', modal);
      const closeButton = $('.admission-close', modal);
      const resetButton = $('button[type="reset"]', modal);
      const message = $('.form-message', modal);
      const sourceField = $('#admission-source', modal);
      const sourceDisplay = $('.form-source', modal);
      const admittedInField = $('#admitted-in', modal);
      const photoInput = $('#student-photo', modal);
      const photoPreview = $('[data-photo-preview]', modal);
      const photoError = $('[data-error-for="student-photo"]', modal);
      const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxPhotoSize = 3 * 1024 * 1024;
      let opener = null;
      let photoPreviewUrl = '';
      const clearPhotoPreview = () => {
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = '';
        if (photoPreview) photoPreview.textContent = 'No photo selected';
        if (photoError) photoError.textContent = '';
      };
      const validatePhoto = () => {
        const file = photoInput?.files?.[0];
        if (!file) {
          clearPhotoPreview();
          return true;
        }
        if (!allowedPhotoTypes.includes(file.type)) {
          photoInput.value = '';
          if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
          photoPreviewUrl = '';
          if (photoPreview) photoPreview.textContent = 'No photo selected';
          if (photoError) photoError.textContent = 'Please upload a JPG, JPEG, PNG, or WEBP image.';
          return false;
        }
        if (file.size > maxPhotoSize) {
          photoInput.value = '';
          if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
          photoPreviewUrl = '';
          if (photoPreview) photoPreview.textContent = 'No photo selected';
          if (photoError) photoError.textContent = 'Please choose an image smaller than 3 MB.';
          return false;
        }
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = URL.createObjectURL(file);
        if (photoPreview) photoPreview.innerHTML = `<img src="${photoPreviewUrl}" alt="Selected student photograph preview">`;
        if (photoError) photoError.textContent = '';
        return true;
      };
      const focusable = () => $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(node => !node.disabled && node.offsetParent !== null);
      const close = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        message.textContent = '';
        opener?.focus();
      };
      const open = trigger => {
        opener = trigger;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        const source = trigger?.dataset?.admissionSource || getAdmissionSource();
        if (sourceField) sourceField.value = source || 'General Admissions';
        if (admittedInField) admittedInField.value = source === 'General Admissions' ? '' : source;
        if (sourceDisplay) sourceDisplay.textContent = `Submitted From: ${source || 'General Admissions'}`;
        requestAnimationFrame(() => $('#student-name', modal)?.focus());
      };
      $$('[data-open-admission]').forEach(button => button.addEventListener('click', () => open(button)));
      photoInput?.addEventListener('change', validatePhoto);
      closeButton.addEventListener('click', close);
      modal.addEventListener('click', event => {
        if (event.target === modal) close();
      });
      modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
        if (event.key !== 'Tab') return;
        const nodes = focusable();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = $('button[type="submit"]', modal);
        if (submitButton?.disabled) return;
        if (!form.checkValidity()) {
          message.textContent = 'Please complete the required fields before submitting.';
          message.classList.add('is-error');
          form.reportValidity();
          return;
        }
        if (!validatePhoto()) {
          message.textContent = 'Please check the selected student photograph before submitting.';
          message.classList.add('is-error');
          photoInput?.focus();
          return;
        }
        const previousText = submitButton?.textContent || '';
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.setAttribute('aria-busy', 'true');
          submitButton.textContent = 'Submitting...';
        }
        message.classList.remove('is-error');
        message.textContent = 'Submitting your admission form...';
        const payload = new FormData(form);
        payload.set('admissionSource', sourceField?.value || getAdmissionSource());
        try {
          const response = await fetch('/api/admission', {
            method: 'POST',
            body: payload
          });
          let data;
          try { data = await response.json(); } catch (e) {}
          if (!response.ok) throw new Error(data?.message || data?.error || 'Submission failed.');
          message.textContent = 'Thank you. Your admission form has been submitted successfully.';
          const submittedSource = payload.get('admissionSource') || 'General Admissions';
          form.reset();
          clearPhotoPreview();
          if (sourceDisplay) sourceDisplay.textContent = `Submitted From: ${submittedSource}`;
          $('.admission-dialog', modal).scrollTo({top: 0, behavior: 'smooth'});
        } catch (error) {
          message.classList.add('is-error');
          message.textContent = error?.message || 'We could not submit the form online. Please try again or contact the school office.';
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.textContent = previousText;
          }
        }
      });
      resetButton.addEventListener('click', () => {
        message.classList.remove('is-error');
        message.textContent = '';
        setTimeout(clearPhotoPreview, 0);
      });
    }

    function levelPage(level) {
      const galleryItems = data.images.gallery.slice(0, 3);
      return `${hero(level.name.toUpperCase(), 'PROGRAMME', `Age ${level.age}`, true, level.name)}${section(level.name, 'Overview', `<div class="panel"><p><a href="${homePath}#levels" data-back-home class="btn btn-primary">Back to homepage</a></p></div><div class="two-col"><article class="panel" data-mobile-collapse><h3>Overview</h3><p>${escape(level.overview)}</p><h3 style="margin-top:20px">Age group</h3><p>${escape(level.age)}</p><h3 style="margin-top:20px">Timings</h3><p>${escape(level.timings)}</p></article><article class="panel" data-mobile-collapse><h3>Curriculum</h3><p>${escape(level.curriculum)}</p><h3 style="margin-top:20px">Learning objectives</h3><ul>${level.objectives.map(item => `<li>${escape(item)}</li>`).join('')}</ul><h3 style="margin-top:20px">Daily activities</h3><p>${level.activities.map(escape).join(' · ')}</p></article></div><div class="gallery" style="margin-top:34px">${galleryItems.map(entry => `<figure class="gcircle">${image(entry)}<figcaption>${escape(entry.title)}</figcaption></figure>`).join('')}</div><div class="strip"><div style="position:relative;z-index:2"><h2>Interested in ${escape(level.name)}?</h2><p>Book a tour or access the admission form to take the next step.</p><button type="button" class="btn btn-primary" data-open-admission data-admission-source="${escape(level.name)}">Admissions -></button></div></div>`)}${footer()}`;
    }

    function setAdmissionSource(source = 'General Admissions') {
      currentAdmissionSource = source || 'General Admissions';
    }

    function getAdmissionSource() {
      return currentAdmissionSource || 'General Admissions';
    }

    function enhanceMedia(root = document) {
      $$('img', root).forEach(img => {
        if (img.complete) img.classList.add('is-loaded');
        else img.addEventListener('load', () => img.classList.add('is-loaded'), {once: true});
      });
    }

    function applyMobileCollapse() {
      applyExpandableText(site);
    }

    function render(path = location.pathname, options = {}) {
      if (activeObserver) activeObserver.disconnect();
      const routedPath = routePath(path);
      const clean = routedPath === '/kindervale.html' ? '/' : routedPath.replace(/\/$/, '') || '/';
      const level = data.levels.find(item => `/levels/${item.slug}` === clean);
      const content = level ? levelPage(level) : home();
      setAdmissionSource(level ? level.name : 'General Admissions');
      site.innerHTML = `${header()}<main id="main-content" tabindex="-1">${content}</main>${admissionModal()}`;
      document.title = pageTitle(level ? clean : '/');
      updateMeta(level ? clean : '/');
      wireNavigation();
      wireLightbox();
      wireAdmissionModal();
      enhanceMedia(site);
      applyMobileCollapse();
      applyExpandableText(site);
      updateNavbarState();
      if (level) {
        window.scrollTo({top: 0, behavior: options.instant ? 'auto' : 'smooth'});
        markActiveNav('');
      } else {
        setupActiveNav();
        requestAnimationFrame(() => {
          if (options.restoreScroll && lastHomeScroll) window.scrollTo({top: lastHomeScroll, behavior: 'auto'});
          else scrollToHash(location.hash || '#home', options.instant);
        });
      }
    }
    function updateMeta(path) {
      const description = `Kindervale Preschool in DHA-II Islamabad - ${data.school.tagline}. Explore programmes, admissions, curriculum and school life.`;
      document.querySelector('meta[name="description"]')?.setAttribute('content', description);
      document.querySelector('meta[property="og:title"]')?.setAttribute('content', document.title);
      document.querySelector('meta[property="og:description"]')?.setAttribute('content', description);
      document.querySelector('link[rel="canonical"]')?.setAttribute('href', `${location.origin}${path}${location.hash}`);
    }
    function scrollToHash(hash, instant = false) {
      const id = (hash || '#home').slice(1);
      const target = id === 'contact' ? $('#contact') : document.getElementById(id);
      if (!target) return;
      const navHeight = $('nav')?.offsetHeight || 0;
      const top = target.getBoundingClientRect().top + window.scrollY - navHeight - 12;
      window.scrollTo({top: Math.max(0, top), behavior: instant ? 'auto' : 'smooth'});
      markActiveNav(id);
    }
    function setupActiveNav() {
      activeObserver = new IntersectionObserver(entries => {
        const visible = entries.filter(entry => entry.isIntersecting).sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];
        if (!visible) return;
        const id = visible.target.id;
        markActiveNav(id);
        const hash = `#${id}`;
        if (!routePath().startsWith('/levels') && location.hash !== hash) history.replaceState(history.state || {}, '', `${homePath}${hash}`);
      }, {rootMargin: '-30% 0px -55% 0px', threshold: [0.05, 0.2, 0.4, 0.7]});
      ['home', ...sectionIds].forEach(id => {
        const node = id === 'contact' ? $('#contact') : document.getElementById(id);
        if (node) activeObserver.observe(node);
      });
    }
    function markActiveNav(id) {
      $$('[data-scroll-target]').forEach(anchor => {
        const active = anchor.dataset.scrollTarget === id;
        anchor.classList.toggle('active', active);
        if (active) anchor.setAttribute('aria-current', 'true');
        else anchor.removeAttribute('aria-current');
      });
    }
    function wireNavigation() {
      const nav = $('nav');
      const toggle = $('.nav-toggle');
      const menu = $('#primary-menu');
      if (!nav || !toggle || !menu) return;
      const closeMenu = () => {
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      };
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      });
      menu.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
      });
    }
    function wireAdmissionModal() {
      const modal = $('.admission-modal');
      if (!modal) return;
      const form = $('.admission-form', modal);
      const closeButton = $('.admission-close', modal);
      const resetButton = $('button[type="reset"]', modal);
      const message = $('.form-message', modal);
      let opener = null;
      const focusable = () => $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(node => !node.disabled && node.offsetParent !== null);
      const close = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        message.textContent = '';
        opener?.focus();
      };
      const open = trigger => {
        opener = trigger;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        requestAnimationFrame(() => $('#student-name', modal)?.focus());
      };
      $$('[data-open-admission]').forEach(button => button.addEventListener('click', () => open(button)));
      closeButton.addEventListener('click', close);
      modal.addEventListener('click', event => {
        if (event.target === modal) close();
      });
      modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
        if (event.key !== 'Tab') return;
        const nodes = focusable();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = $('button[type="submit"]', modal);
        if (submitButton?.disabled) return;

        if (!form.checkValidity()) {
          message.textContent = 'Please complete the required fields before submitting.';
          form.reportValidity();
          return;
        }

        const previousText = submitButton?.textContent || '';
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.setAttribute('aria-busy', 'true');
          submitButton.textContent = 'Submitting…';
        }

        message.textContent = 'Submitting your admission form...';
        const payload = Object.fromEntries(new FormData(form).entries());
        try {
          const response = await fetch('/api/admission', {
            method: 'POST',
            headers: {'Content-Type': 'application/json'},
            body: JSON.stringify(payload)
          });

          let data;
          try { data = await response.json(); } catch (e) { /* ignore */ }

          if (!response.ok) {
            const friendly = data?.error || 'Submission failed.';
            throw new Error(friendly);
          }

          message.textContent = 'Thank you. Your admission form has been submitted successfully.';
          form.reset();
          $('.admission-dialog', modal).scrollTo({top: 0, behavior: 'smooth'});
        } catch (error) {
          message.textContent = error?.message || 'We could not submit the form online. Please try again or contact the school office.';
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.textContent = previousText;
          }
        }
      });
      resetButton.addEventListener('click', () => {
        message.textContent = '';
      });
    }
    function wireLightbox() {
      const box = $('.lightbox');
      if (!box) return;
      const img = $('img', box);
      const caption = $('p', box);
      const title = $('.gallery-viewer-title', box);
      const counter = $('.gallery-counter', box);
      const prev = $('.gallery-prev', box);
      const next = $('.gallery-next', box);
      let items = [];
      let index = 0;
      let touchStart = 0;
      const show = nextIndex => {
        if (!items.length) return;
        index = (nextIndex + items.length) % items.length;
        const item = items[index];
        img.src = item.src;
        img.alt = item.title;
        caption.textContent = item.description || item.title;
        title.textContent = item.category;
        counter.textContent = `${index + 1} / ${items.length}`;
      };
      const open = (category, startIndex = 0) => {
        items = data.images.gallery.filter(entry => (entry.category || 'Daily Life') === category);
        if (!items.length) return;
        box.hidden = false;
        document.body.classList.add('modal-open');
        show(startIndex);
        $('.lightbox-close', box).focus();
      };
      $$('.gallery-highlight').forEach(button => button.addEventListener('click', () => open(button.dataset.galleryCategory)));
      $$('.gallery-open').forEach(button => button.addEventListener('click', () => {
        items = [{src: button.dataset.gallerySrc, title: button.dataset.galleryTitle, category: 'Gallery'}];
        box.hidden = false;
        document.body.classList.add('modal-open');
        show(0);
        $('.lightbox-close', box).focus();
      }));
      const close = () => {
        box.hidden = true;
        document.body.classList.remove('modal-open');
        img.removeAttribute('src');
      };
      prev.addEventListener('click', () => show(index - 1));
      next.addEventListener('click', () => show(index + 1));
      img.addEventListener('click', () => img.classList.toggle('is-zoomed'));
      box.addEventListener('touchstart', event => {
        touchStart = event.changedTouches[0].clientX;
      }, {passive: true});
      box.addEventListener('touchend', event => {
        const delta = event.changedTouches[0].clientX - touchStart;
        if (Math.abs(delta) > 45) show(index + (delta < 0 ? 1 : -1));
      }, {passive: true});
      $('.lightbox-close', box).addEventListener('click', close);
      box.addEventListener('click', event => { if (event.target === box) close(); });
      document.addEventListener('keydown', event => {
        if (box.hidden) return;
        if (event.key === 'Escape') close();
        if (event.key === 'ArrowLeft') show(index - 1);
        if (event.key === 'ArrowRight') show(index + 1);
      });
    }

    function updateNavbarState() {
      const nav = $('nav');
      if (!nav) return;
      nav.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    function wireNavigation() {
      const nav = $('nav');
      const toggle = $('.nav-toggle');
      const menu = $('#primary-menu');
      if (!nav || !toggle || !menu) return;
      const closeMenu = () => {
        nav.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
        toggle.setAttribute('aria-label', 'Open navigation');
      };
      toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('menu-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
        toggle.setAttribute('aria-label', isOpen ? 'Close navigation' : 'Open navigation');
      });
      menu.addEventListener('click', event => {
        if (event.target.closest('a')) closeMenu();
      });
      nav.addEventListener('mouseenter', updateNavbarState);
      nav.addEventListener('mouseleave', updateNavbarState);
      document.addEventListener('keydown', event => {
        if (event.key === 'Escape') closeMenu();
      });
      updateNavbarState();
    }

    function wireAdmissionModal() {
      const modal = $('.admission-modal');
      if (!modal) return;
      const form = $('.admission-form', modal);
      const closeButton = $('.admission-close', modal);
      const resetButton = $('button[type="reset"]', modal);
      const message = $('.form-message', modal);
      const sourceField = $('#admission-source', modal);
      const sourceDisplay = $('.form-source', modal);
      const admittedInField = $('#admitted-in', modal);
      const photoInput = $('#student-photo', modal);
      const photoPreview = $('[data-photo-preview]', modal);
      const photoError = $('[data-error-for="student-photo"]', modal);
      const allowedPhotoTypes = ['image/jpeg', 'image/png', 'image/webp'];
      const maxPhotoSize = 3 * 1024 * 1024;
      let opener = null;
      let photoPreviewUrl = '';
      const clearPhotoPreview = () => {
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = '';
        if (photoPreview) photoPreview.textContent = 'No photo selected';
        if (photoError) photoError.textContent = '';
      };
      const validatePhoto = () => {
        const file = photoInput?.files?.[0];
        if (!file) {
          clearPhotoPreview();
          return true;
        }
        if (!allowedPhotoTypes.includes(file.type)) {
          photoInput.value = '';
          if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
          photoPreviewUrl = '';
          if (photoPreview) photoPreview.textContent = 'No photo selected';
          if (photoError) photoError.textContent = 'Please upload a JPG, JPEG, PNG, or WEBP image.';
          return false;
        }
        if (file.size > maxPhotoSize) {
          photoInput.value = '';
          if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
          photoPreviewUrl = '';
          if (photoPreview) photoPreview.textContent = 'No photo selected';
          if (photoError) photoError.textContent = 'Please choose an image smaller than 3 MB.';
          return false;
        }
        if (photoPreviewUrl) URL.revokeObjectURL(photoPreviewUrl);
        photoPreviewUrl = URL.createObjectURL(file);
        if (photoPreview) photoPreview.innerHTML = `<img src="${photoPreviewUrl}" alt="Selected student photograph preview">`;
        if (photoError) photoError.textContent = '';
        return true;
      };
      const focusable = () => $$('button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])', modal).filter(node => !node.disabled && node.offsetParent !== null);
      const close = () => {
        modal.hidden = true;
        document.body.classList.remove('modal-open');
        message.textContent = '';
        opener?.focus();
      };
      const open = trigger => {
        opener = trigger;
        modal.hidden = false;
        document.body.classList.add('modal-open');
        const source = trigger?.dataset?.admissionSource || getAdmissionSource();
        if (sourceField) sourceField.value = source || 'General Admissions';
        if (admittedInField) admittedInField.value = source === 'General Admissions' ? '' : source;
        if (sourceDisplay) sourceDisplay.textContent = `Submitted From: ${source || 'General Admissions'}`;
        requestAnimationFrame(() => $('#student-name', modal)?.focus());
      };
      $$('[data-open-admission]').forEach(button => button.addEventListener('click', () => open(button)));
      photoInput?.addEventListener('change', validatePhoto);
      closeButton.addEventListener('click', close);
      modal.addEventListener('click', event => {
        if (event.target === modal) close();
      });
      modal.addEventListener('keydown', event => {
        if (event.key === 'Escape') close();
        if (event.key !== 'Tab') return;
        const nodes = focusable();
        if (!nodes.length) return;
        const first = nodes[0];
        const last = nodes[nodes.length - 1];
        if (event.shiftKey && document.activeElement === first) {
          event.preventDefault();
          last.focus();
        } else if (!event.shiftKey && document.activeElement === last) {
          event.preventDefault();
          first.focus();
        }
      });
      form.addEventListener('submit', async event => {
        event.preventDefault();
        const submitButton = $('button[type="submit"]', modal);
        if (submitButton?.disabled) return;
        if (!form.checkValidity()) {
          message.textContent = 'Please complete the required fields before submitting.';
          message.classList.add('is-error');
          form.reportValidity();
          return;
        }
        if (!validatePhoto()) {
          message.textContent = 'Please check the selected student photograph before submitting.';
          message.classList.add('is-error');
          photoInput?.focus();
          return;
        }
        const previousText = submitButton?.textContent || '';
        if (submitButton) {
          submitButton.disabled = true;
          submitButton.setAttribute('aria-busy', 'true');
          submitButton.textContent = 'Submitting...';
        }
        message.classList.remove('is-error');
        message.textContent = 'Submitting your admission form...';
        const payload = new FormData(form);
        payload.set('admissionSource', sourceField?.value || getAdmissionSource());
        try {
          const response = await fetch('/api/admission', {
            method: 'POST',
            body: payload
          });
          let data;
          try { data = await response.json(); } catch (e) {}
          if (!response.ok) throw new Error(data?.message || data?.error || 'Submission failed.');
          message.textContent = 'Thank you. Your admission form has been submitted successfully.';
          const submittedSource = payload.get('admissionSource') || 'General Admissions';
          form.reset();
          clearPhotoPreview();
          if (sourceDisplay) sourceDisplay.textContent = `Submitted From: ${submittedSource}`;
          $('.admission-dialog', modal).scrollTo({top: 0, behavior: 'smooth'});
        } catch (error) {
          message.classList.add('is-error');
          message.textContent = error?.message || 'We could not submit the form online. Please try again or contact the school office.';
        } finally {
          if (submitButton) {
            submitButton.disabled = false;
            submitButton.removeAttribute('aria-busy');
            submitButton.textContent = previousText;
          }
        }
      });
      resetButton.addEventListener('click', () => {
        message.classList.remove('is-error');
        message.textContent = '';
        setTimeout(clearPhotoPreview, 0);
      });
    }

    function levelPage(level) {
      const galleryItems = data.images.gallery.slice(0, 3);
      return `${hero(level.name.toUpperCase(), 'PROGRAMME', `Age ${level.age}`, true, level.name)}${section(level.name, 'Overview', `<div class="panel"><p><a href="${homePath}#levels" data-back-home class="btn btn-primary">Back to homepage</a></p></div><div class="two-col"><article class="panel" data-mobile-collapse><h3>Overview</h3><p>${escape(level.overview)}</p><h3 style="margin-top:20px">Age group</h3><p>${escape(level.age)}</p><h3 style="margin-top:20px">Timings</h3><p>${escape(level.timings)}</p></article><article class="panel" data-mobile-collapse><h3>Curriculum</h3><p>${escape(level.curriculum)}</p><h3 style="margin-top:20px">Learning objectives</h3><ul>${level.objectives.map(item => `<li>${escape(item)}</li>`).join('')}</ul><h3 style="margin-top:20px">Daily activities</h3><p>${level.activities.map(escape).join(' · ')}</p></article></div><div class="gallery" style="margin-top:34px">${galleryItems.map(entry => `<figure class="gcircle">${image(entry)}<figcaption>${escape(entry.title)}</figcaption></figure>`).join('')}</div><div class="strip"><div style="position:relative;z-index:2"><h2>Interested in ${escape(level.name)}?</h2><p>Book a tour or access the admission form to take the next step.</p><button type="button" class="btn btn-primary" data-open-admission data-admission-source="${escape(level.name)}">Admissions -></button></div></div>`)}${footer()}`;
    }

    document.addEventListener('click', event => {
      const route = event.target.closest('a[data-route]');
      const scroll = event.target.closest('a[data-scroll-target]');
      const back = event.target.closest('a[data-back-home]');
      if (event.ctrlKey || event.metaKey) return;
      if (route) {
        event.preventDefault();
        lastHomeScroll = window.scrollY;
        sessionStorage.setItem('kindervale:lastHomeScroll', String(lastHomeScroll));
        history.pushState({level: true}, '', route.getAttribute('href'));
        render();
        return;
      }
      if (back) {
        event.preventDefault();
        history.pushState({}, '', `${homePath}#levels`);
        render(location.pathname, {restoreScroll: true, instant: true});
        return;
      }
      if (scroll) {
        event.preventDefault();
        const hash = `#${scroll.dataset.scrollTarget}`;
        const clean = routePath();
        if (clean !== '/' && clean !== '/kindervale.html') {
          history.pushState({}, '', `${homePath}${hash}`);
          render(homePath, {instant: true});
        } else {
          history.pushState({}, '', `${homePath}${hash}`);
          scrollToHash(hash);
        }
      }
    });
    window.addEventListener('popstate', () => render(location.pathname, {restoreScroll: !routePath().startsWith('/levels'), instant: true}));
    window.addEventListener('scroll', updateNavbarState, {passive: true});
    window.addEventListener('resize', () => {
      updateNavbarState();
      applyMobileCollapse();
    }, {passive: true});
    window.addEventListener('beforeunload', () => {
      if (!routePath().startsWith('/levels')) sessionStorage.setItem('kindervale:lastHomeScroll', String(window.scrollY));
    });
    render(location.pathname, {instant: true});
  }
})();
