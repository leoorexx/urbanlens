// A11y-Basis-Pass (WCAG/EN 301 549): Fokus-Ringe, Kontrast, Tastatur, aria, lang
const fs=require('fs');
const P='index.html';
let h=fs.readFileSync(P,'utf8');let n=0;
function rep(a,b,all){const c=h.split(a).length-1;if(!c){console.error('MISS: '+a.slice(0,70));process.exitCode=1;return;}h=h.split(a).join(b);n+=c;}

// 1 · Sichtbare Fokus-Ringe + weniger Bewegung auf Wunsch
rep('*{box-sizing:border-box;margin:0;padding:0}',
`*{box-sizing:border-box;margin:0;padding:0}
:focus-visible{outline:2px solid #1a1a2e;outline-offset:2px;border-radius:4px}
.tool-primary:focus-visible,.bf-go:focus-visible{outline-color:var(--accent)}
@media (prefers-reduced-motion:reduce){*,*::before,*::after{animation:none!important;transition:none!important}}`);

// 2 · Kontrast: muted-Grau auf 4.5:1, kein Weiß auf Akzent-Gelb
rep('--text:#1a1a2e;--text2:#374151;--muted:#9ca3af;','--text:#1a1a2e;--text2:#374151;--muted:#6b7280;');
rep('#baseToggle button.on{background:var(--accent);color:#fff}','#baseToggle button.on{background:var(--accent);color:#1a1a2e}');
rep('.msw.on{background:var(--accent);color:#fff;border-color:var(--accent)}','.msw.on{background:var(--accent);color:#1a1a2e;border-color:var(--accent)}');

// 3 · Dokumentsprache folgt der UI-Sprache
rep('function setLang(l){ try{','function setLang(l){ try{document.documentElement.lang=l;}catch(e){} try{');

// 4 · Tastaturpfad: Listen-Zeilen fokussier- und aktivierbar
rep('return`<div class="sti${selected===n?\' active\':\'\'}" data-area="${n}">',
    'return`<div class="sti${selected===n?\' active\':\'\'}" data-area="${n}" tabindex="0" role="button" onkeydown="if(event.key===\'Enter\')this.click()">');
rep('<div class="ms-item" onclick="missionCase(${i})">','<div class="ms-item" tabindex="0" role="button" onkeydown="if(event.key===\'Enter\')this.click()" onclick="missionCase(${i})">');
rep('<div class="ms-item" onclick="streetCase(${i})">','<div class="ms-item" tabindex="0" role="button" onkeydown="if(event.key===\'Enter\')this.click()" onclick="streetCase(${i})">');
rep('<div class="lrow','<div tabindex="0" role="button" onkeydown="if(event.key===\'Enter\')this.click()" class="lrow');

// 5 · aria-Labels: Panel-Schließen (alle in JS-Templates → mT verfügbar), Grabber
rep('class="ap-x" onclick=','class="ap-x" aria-label="${mT(\'Schließen\',\'Close\',\'Sluiten\')}" onclick=');
rep('<div class="sheet-grab" onclick="toggleSheet()" title="Liste auf-/zuklappen"><span></span></div>',
    '<div class="sheet-grab" onclick="toggleSheet()" onkeydown="if(event.key===\'Enter\')this.click()" tabindex="0" role="button" aria-label="Stadtteil-Liste auf- oder zuklappen" title="Liste auf-/zuklappen"><span></span></div>');

fs.writeFileSync(P,h);
console.log('OK — '+n+' Ersetzungen');
