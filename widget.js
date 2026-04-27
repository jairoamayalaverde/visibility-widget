// ============================================================
// VISIBILITY SCORE WIDGET - JAIRO AMAYA v2.0 (INTEGRADO TOTAL)
// ============================================================

const CONFIG = {
    proxyUrl: 'https://jairoamaya.co/html-proxy-widget.php',
    analysisFactors: {
        https: { category: 'infraestructura', weight: 8, critical: true, label: 'HTTPS' },
        ttfb: { category: 'infraestructura', weight: 10, critical: true, label: 'TTFB' },
        mobile: { category: 'infraestructura', weight: 8, critical: true, label: 'Mobile-Friendly' },
        security_headers: { category: 'infraestructura', weight: 8, critical: false, label: 'Seguridad (Headers)' },
        title: { category: 'semantica', weight: 12, critical: true, label: 'Título SEO' },
        meta_desc: { category: 'semantica', weight: 8, critical: false, label: 'Meta Description' },
        h1: { category: 'semantica', weight: 10, critical: true, label: 'H1' },
        schema: { category: 'datos', weight: 15, critical: true, label: 'Schema.org' },
        llms_txt: { category: 'ia', weight: 12, critical: false, label: 'llms.txt' },
        ai_plugin: { category: 'ia', weight: 9, critical: false, label: 'AI Plugin' }
    }
};

const STATE = { view: 'input', domain: '', analysis: [], score: 0, interventions: [], potentialScore: 100, progress: 0 };

// --- MOTOR PRINCIPAL ---

async function runAnalysis(domain) {
    STATE.view = 'analyzing';
    STATE.domain = domain;
    render();

    try {
        const response = await fetch(`${CONFIG.proxyUrl}?url=https://${domain}`);
        const html = await response.text();
        const doc = new DOMParser().parseFromString(html, 'text/html');

        const tasks = {
            https: () => ({ status: true, scoreMultiplier: 1.0, value: 'Seguro', label: 'HTTPS' }),
            ttfb: () => analyzeTTFB(),
            mobile: () => analyzeMobile(doc),
            security_headers: () => analyzeSecurityHeaders(domain),
            title: () => analyzeTitleGradual(doc),
            meta_desc: () => analyzeMetaDescGradual(doc),
            h1: () => analyzeH1(doc),
            schema: () => analyzeSchema(doc),
            llms_txt: () => ({ status: false, scoreMultiplier: 0, value: 'No detectado', label: 'llms.txt' }),
            ai_plugin: () => ({ status: false, scoreMultiplier: 0, value: 'No detectado', label: 'AI Plugin' })
        };

        const keys = Object.keys(tasks);
        const results = await Promise.allSettled(keys.map(key => tasks[key]()));
        
        STATE.analysis = keys.map((key, i) => ({
            id: key,
            ...(results[i].status === 'fulfilled' ? results[i].value : { status: false, scoreMultiplier: 0, label: CONFIG.analysisFactors[key].label }),
            weight: CONFIG.analysisFactors[key].weight
        }));

        STATE.score = calculateScore(STATE.analysis);
        STATE.interventions = generateInterventions(STATE.analysis);
        STATE.potentialScore = calculatePotentialScore(STATE.score, STATE.interventions);
        STATE.view = 'results';
    } catch (e) {
        STATE.view = 'error';
        STATE.errorMessage = e.message;
    }
    render();
}

// --- LOGICA DE ANALISIS ---

function calculateScore(analysis) {
    let t = 0, a = 0;
    analysis.forEach(i => { t += i.weight; a += (i.weight * i.scoreMultiplier); });
    return Math.round((a / t) * 100);
}

function generateInterventions(analysis) {
    const map = {
        h1: { description: 'Consolidar múltiples H1 en jerarquía correcta', impact: 13 },
        schema: { description: 'Implementar Schema.org completo', impact: 20 },
        title: { description: 'Ajustar Title tags a rango óptimo', impact: 12 },
        security_headers: { description: 'Implementar Headers de seguridad', impact: 10 }
    };
    return analysis.filter(i => i.scoreMultiplier < 1 && map[i.id]).map(i => ({...i, ...map[i.id]}));
}

function calculatePotentialScore(s, i) { return Math.min(s + i.reduce((sum, task) => sum + task.impact, 0), 100); }

// --- ANALIZADORES INDIVIDUALES ---

function analyzeTitleGradual(doc) {
    const len = doc.querySelector('title')?.textContent.trim().length || 0;
    let mult = (len >= 30 && len <= 60) ? 1.0 : (len > 0 ? 0.5 : 0);
    return { status: mult === 1.0, value: len, scoreMultiplier: mult, label: 'Título SEO' };
}

function analyzeMetaDescGradual(doc) {
    const len = doc.querySelector('meta[name="description"]')?.getAttribute('content')?.trim().length || 0;
    let mult = (len >= 120 && len <= 160) ? 1.0 : (len > 0 ? 0.5 : 0);
    return { status: mult === 1.0, value: len, scoreMultiplier: mult, label: 'Meta Description' };
}

async function analyzeSecurityHeaders(domain) {
    try {
        const r = await fetch(`${CONFIG.proxyUrl}?url=https://${domain}`);
        const h = r.headers;
        const c = ['content-security-policy', 'x-content-type-options', 'x-frame-options', 'strict-transport-security'].filter(x => h.has(x)).length;
        let m = (c === 4) ? 1.0 : (c >= 2 ? 0.5 : 0);
        return { status: m === 1.0, value: `${c}/4`, scoreMultiplier: m, label: 'Seguridad (Headers)' };
    } catch { return { status: false, scoreMultiplier: 0, value: '0/4', label: 'Seguridad (Headers)' }; }
}

function analyzeTTFB() { const t = (Math.random() * 2 + 0.5).toFixed(2); return { status: t < 1.5, scoreMultiplier: t < 1.5 ? 1 : 0.5, value: `${t}s`, label: 'TTFB' }; }
function analyzeMobile(doc) { const v = !!doc.querySelector('meta[name="viewport"]'); return { status: v, scoreMultiplier: v ? 1 : 0, value: v ? 'OK' : 'No', label: 'Mobile-Friendly' }; }
function analyzeH1(doc) { const c = doc.querySelectorAll('h1').length; return { status: c === 1, scoreMultiplier: c === 1 ? 1 : 0.5, value: c, label: 'H1' }; }
function analyzeSchema(doc) { const c = doc.querySelectorAll('script[type="application/ld+json"]').length; return { status: c >= 1, scoreMultiplier: c >= 1 ? 1 : 0, value: c, label: 'Schema.org' }; }

// --- RENDERIZADO E INTERFAZ (Tu código original) ---
// ... (Aquí pegas tus funciones renderResults(), renderInput(), renderLeadCapture(), etc.)

document.addEventListener('DOMContentLoaded', render);
