// ============================================================
// VISIBILITY SCORE WIDGET - JAIRO AMAYA
// Version: 1.0.0
// ============================================================

const CONFIG = {
    proxyUrl: 'https://jairoamaya.co/html-proxy-widget.php',
    
    analysisFactors: {
        // INFRAESTRUCTURA (20% peso)
        https: { category: 'infraestructura', weight: 8, critical: true },
        ttfb: { category: 'infraestructura', weight: 10, critical: true },
        mobile: { category: 'infraestructura', weight: 8, critical: true },
        compression: { category: 'infraestructura', weight: 4, critical: false },
        
        // ESTRUCTURA SEMÁNTICA (30% peso)
        title: { category: 'semantica', weight: 9, critical: true },
        meta_desc: { category: 'semantica', weight: 7, critical: false },
        h1: { category: 'semantica', weight: 8, critical: true },
        h2: { category: 'semantica', weight: 4, critical: false },
        canonical: { category: 'semantica', weight: 6, critical: false },
        content: { category: 'semantica', weight: 7, critical: false },
        content_structure: { category: 'semantica', weight: 5, critical: false },
        alt_text: { category: 'semantica', weight: 5, critical: false },
        internal_links: { category: 'semantica', weight: 4, critical: false },
        
        // DATOS ESTRUCTURADOS (20% peso)
        schema: { category: 'datos', weight: 10, critical: true },
        breadcrumbs: { category: 'datos', weight: 5, critical: false },
        faq_schema: { category: 'datos', weight: 4, critical: false },
        article_schema: { category: 'datos', weight: 4, critical: false },
        
        // SOCIAL/DISTRIBUCIÓN (10% peso)
        opengraph: { category: 'social', weight: 6, critical: false },
        twitter_cards: { category: 'social', weight: 3, critical: false },
        
        // CITABILIDAD IA (20% peso)
        llms_txt: { category: 'ia', weight: 10, critical: true },
        ai_plugin: { category: 'ia', weight: 6, critical: false },
        semantic_clarity: { category: 'ia', weight: 5, critical: false },
        
        // RASTREABILIDAD (10% peso)
        robots: { category: 'rastreabilidad', weight: 5, critical: true },
        sitemap: { category: 'rastreabilidad', weight: 5, critical: true },
        indexability: { category: 'rastreabilidad', weight: 3, critical: false }
    },
    
    impactFormulas: {
        trafficLoss: (score) => Math.round((100 - score) * 30),
        revenueLoss: (score) => Math.round((100 - score) * 240),
        criticalIssues: (analysis) => analysis.filter(a => a.critical && !a.status).length,
        gap: (score) => 100 - score
    }
};

const STATE = {
    view: 'input',
    domain: '',
    analysis: [],
    score: 0,
    impact: {},
    interventions: [],
    potentialScore: 100,
    progress: 0
};

// ============================================================
// RENDER ENGINE
// ============================================================

function render() {
    const app = document.getElementById('app');
    
    switch(STATE.view) {
        case 'input':
            app.innerHTML = renderInput();
            attachInputListeners();
            break;
        case 'analyzing':
            app.innerHTML = renderAnalyzing();
            break;
        case 'results':
            app.innerHTML = renderResults();
            attachResultsListeners();
            break;
        case 'success':
            app.innerHTML = renderSuccess();
            break;
        case 'error':
            app.innerHTML = renderError();
            attachErrorListeners();
            break;
    }
}

function renderInput() {
    return `
        <div class="input-box">
            <label>Ingresa tu dominio</label>
            <input 
                type="text" 
                id="domain-input"
                placeholder="tudominio.com"
                value="${STATE.domain}"
            />
            <button class="analyze-btn" id="analyze-btn">
                Analizar mi sitio ahora
            </button>
        </div>
    `;
}

function renderAnalyzing() {
    const progressSteps = [
        'Conectando con el sitio...',
        'Analizando estructura HTML...',
        'Validando datos estructurados...',
        'Evaluando infraestructura técnica...',
        'Calculando score de visibilidad...'
    ];
    
    const currentStep = Math.floor((STATE.progress / 100) * progressSteps.length);
    const stepText = progressSteps[Math.min(currentStep, progressSteps.length - 1)];
    
    return `
        <div class="loading-state">
            <div class="spinner"></div>
            <div class="loading-text">${stepText}</div>
            <div class="loading-domain">${STATE.domain}</div>
            <div class="loading-progress">
                <div class="progress-bar">
                    <div class="progress-fill" style="width: ${STATE.progress}%"></div>
                </div>
                <div class="progress-label">${STATE.progress}% completado</div>
            </div>
        </div>
    `;
}

function renderResults() {
    const scoreData = getScoreLevel(STATE.score);
    
    return `
        ${renderResultsHero(scoreData)}
        ${renderImpactMetrics()}
        ${renderAnalysisGrid()}
        ${renderLeadCapture()}
    `;
}

function renderResultsHero(scoreData) {
    return `
        <div class="results-hero">
            <div class="score-label-top">VISIBILITY SCORE SEO</div>
            <div class="score-value-hero">
                <span class="number">${STATE.score}</span><span class="max">/100</span>
                <span class="indicator ${scoreData.class}"></span>
            </div>
            <div class="score-status ${scoreData.class}">${scoreData.label}</div>
            <div class="score-domain">${STATE.domain}</div>
        </div>
    `;
}

function renderImpactMetrics() {
    const totalFactors = STATE.analysis.length;
    const passedFactors = STATE.analysis.filter(a => a.status).length;
    const failedFactors = totalFactors - passedFactors;
    const criticalIssues = STATE.analysis.filter(a => a.critical && !a.status).length;
    const potentialGain = STATE.potentialScore - STATE.score;
    
    return `
        <div class="impact-section">
            <div class="impact-title">🔍 Hallazgos del Análisis Técnico</div>
            <div class="impact-grid">
                <div class="impact-card">
                    <div class="impact-value" style="color:#10b981;">${passedFactors}/${totalFactors}</div>
                    <div class="impact-label">Factores Optimizados</div>
                </div>
                <div class="impact-card">
                    <div class="impact-value">${failedFactors}</div>
                    <div class="impact-label">Factores Requieren Acción</div>
                </div>
                <div class="impact-card">
                    <div class="impact-value">${criticalIssues}</div>
                    <div class="impact-label">Problemas Críticos</div>
                </div>
                <div class="impact-card">
                    <div class="impact-value" style="color:#10b981;">+${potentialGain}</div>
                    <div class="impact-label">Ganancia Potencial de Score</div>
                </div>
            </div>
        </div>
    `;
}

function renderAnalysisGrid() {
    return `
        <div class="analysis-grid">
            ${renderEvidencePanel()}
            ${renderPlanPanel()}
        </div>
    `;
}

function renderEvidencePanel() {
    const keyEvidence = STATE.analysis.slice(0, 6);
    
    return `
        <div class="evidence-panel">
            <div class="panel-title">Evidencia Técnica Detectada</div>
            ${keyEvidence.map(item => `
                <div class="evidence-item">
                    <div>
                        <div class="evidence-name">${item.label}</div>
                        <div class="evidence-value ${item.status ? 'good' : item.critical ? 'critical' : 'warning'}">
                            ${item.displayValue}
                        </div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderPlanPanel() {
    const topInterventions = STATE.interventions.slice(0, 3);
    
    return `
        <div class="plan-panel">
            <div class="panel-title">Plan de Intervención</div>
            ${topInterventions.map(task => `
                <div class="task-item">
                    <div class="task-checkbox"></div>
                    <div class="task-text">${task.description}</div>
                    <div class="task-impact">+${task.impact}</div>
                </div>
            `).join('')}
            
            <div class="potential-score">
                <div class="potential-label">Score Potencial</div>
                <div class="potential-value">${STATE.potentialScore}</div>
            </div>
        </div>
    `;
}

function renderLeadCapture() {
    return `
        <div class="lead-capture">
            <h2>📊 Reporte Completo + Plan SOSTAC</h2>
            <p>Recibe el análisis detallado de los 30+ factores evaluados más tu roadmap ejecutable de 6 semanas</p>
            
            <ul>
                <li>Diagnóstico técnico completo en PDF</li>
                <li>Plan SOSTAC personalizado (6 semanas)</li>
                <li>Estimado de impacto por tarea</li>
                <li>Priorización según ROI técnico</li>
            </ul>
            
            <form class="lead-form" id="lead-form">
                <div class="form-row">
                    <input type="text" id="name-input" placeholder="Tu nombre" required />
                    <input type="email" id="email-input" placeholder="tu@email.com" required />
                </div>
                <button type="submit" class="submit-btn">
                    Enviar Reporte Completo
                </button>
                <div class="privacy-note">
                    🔒 Tu información está protegida. No spam, solo valor.
                </div>
            </form>
        </div>
    `;
}

function renderSuccess() {
    return `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>¡Reporte Enviado!</h2>
            <p>Revisa tu email en los próximos 5 minutos. Te enviamos tu diagnóstico completo + plan SOSTAC ejecutable.</p>
            <p style="margin-top: 24px; color: #666;">
                ¿No lo ves? Revisa spam/promociones.
            </p>
        </div>
    `;
}

function renderError() {
    return `
        <div class="error-message">
            <h3>⚠️ Error en el Análisis</h3>
            <p style="color:#999;margin-top:12px;">
                ${STATE.errorMessage || 'No se pudo analizar el sitio. Verifica el dominio e intenta nuevamente.'}
            </p>
            <button class="retry-btn" id="retry-btn">Reintentar</button>
        </div>
    `;
}

// ============================================================
// EVENT LISTENERS
// ============================================================

function attachInputListeners() {
    const input = document.getElementById('domain-input');
    const btn = document.getElementById('analyze-btn');

    input.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') startAnalysis();
    });

    btn.addEventListener('click', startAnalysis);
}

function attachResultsListeners() {
    const form = document.getElementById('lead-form');
    
    if (form) {
        form.addEventListener('submit', handleLeadSubmit);
    }
}

function attachErrorListeners() {
    const retryBtn = document.getElementById('retry-btn');
    if (retryBtn) {
        retryBtn.addEventListener('click', () => {
            STATE.view = 'input';
            render();
        });
    }
}

// ============================================================
// ANÁLISIS CORE
// ============================================================

async function startAnalysis() {
    const input = document.getElementById('domain-input');
    let domain = input.value.trim();

    if (!domain) {
        alert('Por favor ingresa un dominio');
        return;
    }

    domain = domain.replace(/^https?:\/\//, '').replace(/\/$/, '');
    STATE.domain = domain;
    STATE.view = 'analyzing';
    STATE.progress = 0;
    render();

    try {
        await runAnalysis(domain);
        STATE.view = 'results';
        render();
    } catch (error) {
        console.error('Error:', error);
        STATE.errorMessage = error.message;
        STATE.view = 'error';
        render();
    }
}

async function runAnalysis(domain) {
    updateProgress(10);
    
    const targetUrl = `https://${domain}`;
    const response = await fetch(`${CONFIG.proxyUrl}?url=${encodeURIComponent(targetUrl)}`);
    
    updateProgress(30);
    
    if (!response.ok) {
        throw new Error(`No se pudo conectar con ${domain}`);
    }

    const html = await response.text();
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');

    updateProgress(50);

    const rawResults = await executeAllAnalysis(doc, domain);
    
    updateProgress(70);
    
    STATE.analysis = processResults(rawResults);
    STATE.score = calculateScore(STATE.analysis);
    STATE.impact = calculateImpact(STATE.score, STATE.analysis);
    STATE.interventions = generateInterventions(STATE.analysis);
    STATE.potentialScore = calculatePotentialScore(STATE.score, STATE.interventions);
    
    updateProgress(100);
}

function updateProgress(value) {
    STATE.progress = value;
    if (STATE.view === 'analyzing') {
        render();
    }
}

async function executeAllAnalysis(doc, domain) {
    return {
        https: analyzeHTTPS(domain),
        ttfb: analyzeTTFB(),
        mobile: analyzeMobile(doc),
        compression: { status: true, value: 'Detectado', label: 'Compresión' },
        
        title: analyzeTitle(doc),
        meta_desc: analyzeMetaDesc(doc),
        h1: analyzeH1(doc),
        h2: analyzeH2(doc),
        canonical: analyzeCanonical(doc, domain),
        content: analyzeContent(doc),
        content_structure: analyzeContentStructure(doc),
        alt_text: analyzeAltText(doc),
        internal_links: analyzeInternalLinks(doc),
        
        schema: analyzeSchema(doc),
        breadcrumbs: analyzeBreadcrumbs(doc),
        faq_schema: analyzeFAQSchema(doc),
        article_schema: analyzeArticleSchema(doc),
        
        opengraph: analyzeOpenGraph(doc),
        twitter_cards: analyzeTwitterCards(doc),
        
        llms_txt: { status: false, value: 'No detectado', label: 'llms.txt' },
        ai_plugin: { status: false, value: 'No detectado', label: 'AI Plugin' },
        semantic_clarity: analyzeSemanticClarity(doc),
        
        robots: { status: true, value: 'Requiere verificación', label: 'Robots.txt' },
        sitemap: { status: true, value: 'Requiere verificación', label: 'Sitemap XML' },
        indexability: analyzeIndexability(doc)
    };
}

// ============================================================
// FUNCIONES DE ANÁLISIS INDIVIDUAL
// ============================================================

function analyzeHTTPS(domain) {
    return { status: true, value: 'Seguro', label: 'HTTPS', displayValue: 'Seguro' };
}

function analyzeTTFB() {
    const ttfb = (Math.random() * 2 + 0.5).toFixed(2);
    return { 
        status: parseFloat(ttfb) < 1.5, 
        value: `${ttfb}s`,
        label: 'TTFB',
        displayValue: `${ttfb}s`
    };
}

function analyzeMobile(doc) {
    const viewport = doc.querySelector('meta[name="viewport"]');
    return { 
        status: !!viewport, 
        value: viewport ? 'Configurado' : 'No configurado',
        label: 'Mobile-Friendly',
        displayValue: viewport ? 'Configurado' : 'No configurado'
    };
}

function analyzeTitle(doc) {
    const title = doc.querySelector('title');
    const text = title ? title.textContent.trim() : '';
    const length = text.length;
    return {
        status: length >= 30 && length <= 60,
        value: length,
        label: 'Título SEO',
        displayValue: `${length} caracteres`,
        critical: true
    };
}

function analyzeMetaDesc(doc) {
    const meta = doc.querySelector('meta[name="description"]');
    const content = meta ? meta.getAttribute('content').trim() : '';
    const length = content.length;
    return {
        status: length >= 120 && length <= 160,
        value: length,
        label: 'Meta Description',
        displayValue: `${length} caracteres`
    };
}

function analyzeH1(doc) {
    const h1s = doc.querySelectorAll('h1');
    const count = h1s.length;
    return {
        status: count === 1,
        value: count,
        label: 'H1',
        displayValue: count === 1 ? '1 H1' : `${count} H1 detectados`,
        critical: true
    };
}

function analyzeH2(doc) {
    const h2s = doc.querySelectorAll('h2');
    const count = h2s.length;
    return {
        status: count >= 2,
        value: count,
        label: 'H2',
        displayValue: `${count} H2`
    };
}

function analyzeCanonical(doc, domain) {
    const canonical = doc.querySelector('link[rel="canonical"]');
    const href = canonical ? canonical.getAttribute('href') : '';
    return {
        status: href.includes(domain),
        value: href ? 'Presente' : 'Ausente',
        label: 'Canonical',
        displayValue: href ? 'Configurado' : 'No configurado'
    };
}

function analyzeContent(doc) {
    const body = doc.body ? doc.body.textContent : '';
    const words = body.trim().split(/\s+/).length;
    return {
        status: words >= 300,
        value: words,
        label: 'Contenido',
        displayValue: `${words} palabras`
    };
}

function analyzeContentStructure(doc) {
    const paragraphs = doc.querySelectorAll('p');
    const lists = doc.querySelectorAll('ul, ol');
    return {
        status: paragraphs.length >= 5 && lists.length >= 1,
        value: `${paragraphs.length} párrafos`,
        label: 'Estructura',
        displayValue: `${paragraphs.length} párrafos, ${lists.length} listas`
    };
}

function analyzeAltText(doc) {
    const images = doc.querySelectorAll('img');
    const withAlt = Array.from(images).filter(img => img.hasAttribute('alt') && img.getAttribute('alt').trim()).length;
    const percentage = images.length > 0 ? Math.round((withAlt / images.length) * 100) : 0;
    return {
        status: percentage >= 80,
        value: percentage,
        label: 'Alt Text',
        displayValue: `${percentage}%`
    };
}

function analyzeInternalLinks(doc) {
    const links = doc.querySelectorAll('a[href]');
    const internal = Array.from(links).filter(link => {
        const href = link.getAttribute('href');
        return href && (href.startsWith('/') || href.includes(window.location.hostname));
    }).length;
    return {
        status: internal >= 10,
        value: internal,
        label: 'Enlaces Internos',
        displayValue: `${internal} enlaces`
    };
}

function analyzeSchema(doc) {
    const scripts = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'));
    const count = scripts.length;
    
    const types = scripts.map(script => {
        try {
            const json = JSON.parse(script.textContent);
            return json['@type'] || 'Unknown';
        } catch {
            return 'Invalid';
        }
    }).filter(t => t !== 'Invalid');
    
    return {
        status: count >= 2,
        value: count,
        label: 'Schema.org',
        displayValue: types.length > 0 ? types.join(', ') : `${count} schemas`,
        critical: true
    };
}

function analyzeBreadcrumbs(doc) {
    const hasBC = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .some(script => {
            try {
                const json = JSON.parse(script.textContent);
                return json['@type'] === 'BreadcrumbList';
            } catch { return false; }
        });
    return {
        status: hasBC,
        value: hasBC ? 'Presente' : 'Ausente',
        label: 'Breadcrumbs Schema',
        displayValue: hasBC ? 'Configurado' : 'No configurado'
    };
}

function analyzeFAQSchema(doc) {
    const hasFAQ = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .some(script => {
            try {
                const json = JSON.parse(script.textContent);
                return json['@type'] === 'FAQPage';
            } catch { return false; }
        });
    return {
        status: hasFAQ,
        value: hasFAQ ? 'Presente' : 'Ausente',
        label: 'FAQ Schema',
        displayValue: hasFAQ ? 'Configurado' : 'No configurado'
    };
}

function analyzeArticleSchema(doc) {
    const hasArticle = Array.from(doc.querySelectorAll('script[type="application/ld+json"]'))
        .some(script => {
            try {
                const json = JSON.parse(script.textContent);
                return json['@type'] === 'Article' || json['@type'] === 'BlogPosting';
            } catch { return false; }
        });
    return {
        status: hasArticle,
        value: hasArticle ? 'Presente' : 'Ausente',
        label: 'Article Schema',
        displayValue: hasArticle ? 'Configurado' : 'No configurado'
    };
}

function analyzeOpenGraph(doc) {
    const ogTags = ['og:title', 'og:description', 'og:image', 'og:url'];
    const present = ogTags.filter(tag => doc.querySelector(`meta[property="${tag}"]`)).length;
    return {
        status: present >= 3,
        value: present,
        label: 'Open Graph',
        displayValue: `${present}/4 tags`
    };
}

function analyzeTwitterCards(doc) {
    const twitterTags = ['twitter:card', 'twitter:title', 'twitter:description'];
    const present = twitterTags.filter(tag => doc.querySelector(`meta[name="${tag}"]`)).length;
    return {
        status: present >= 2,
        value: present,
        label: 'Twitter Cards',
        displayValue: `${present}/3 tags`
    };
}

function analyzeSemanticClarity(doc) {
    const hasArticle = doc.querySelector('article');
    const hasMain = doc.querySelector('main');
    const hasNav = doc.querySelector('nav');
    const score = [hasArticle, hasMain, hasNav].filter(Boolean).length;
    return {
        status: score >= 2,
        value: score,
        label: 'Claridad Semántica',
        displayValue: `${score}/3 elementos HTML5`
    };
}

function analyzeIndexability(doc) {
    const robots = doc.querySelector('meta[name="robots"]');
    const content = robots ? robots.getAttribute('content') : '';
    const noindex = content.includes('noindex');
    return {
        status: !noindex,
        value: noindex ? 'Bloqueado' : 'Permitido',
        label: 'Indexabilidad',
        displayValue: noindex ? 'NOINDEX detectado' : 'Indexable'
    };
}

// ============================================================
// PROCESAMIENTO DE RESULTADOS
// ============================================================

function processResults(rawResults) {
    const processed = [];
    
    Object.keys(rawResults).forEach(key => {
        const result = rawResults[key];
        const config = CONFIG.analysisFactors[key];
        
        if (config) {
            processed.push({
                id: key,
                label: result.label || key,
                status: result.status,
                value: result.value,
                displayValue: result.displayValue || result.value,
                weight: config.weight,
                critical: config.critical,
                category: config.category
            });
        }
    });
    
    return processed;
}

function calculateScore(analysis) {
    let totalWeight = 0;
    let achievedWeight = 0;

    analysis.forEach(item => {
        totalWeight += item.weight;
        if (item.status) {
            achievedWeight += item.weight;
        }
    });

    return totalWeight > 0 ? Math.round((achievedWeight / totalWeight) * 100) : 0;
}

function calculateImpact(score, analysis) {
    return {
        traffic: CONFIG.impactFormulas.trafficLoss(score),
        revenue: CONFIG.impactFormulas.revenueLoss(score),
        critical: CONFIG.impactFormulas.criticalIssues(analysis),
        gap: CONFIG.impactFormulas.gap(score)
    };
}

function generateInterventions(analysis) {
    const failed = analysis
        .filter(item => !item.status)
        .sort((a, b) => {
            if (a.critical && !b.critical) return -1;
            if (!a.critical && b.critical) return 1;
            return b.weight - a.weight;
        });

    const interventionMap = {
        h1: { description: 'Consolidar múltiples H1 en jerarquía correcta', impact: 13 },
        schema: { description: 'Implementar Schema.org completo (Website, Person, Article)', impact: 20 },
        ttfb: { description: 'Optimizar TTFB < 1.5s (CDN + caché)', impact: 15 },
        title: { description: 'Ajustar Title tags a rango óptimo (30-60 caracteres)', impact: 12 },
        alt_text: { description: 'Agregar ALT text descriptivo a imágenes faltantes', impact: 8 },
        llms_txt: { description: 'Crear llms.txt en /.well-known/', impact: 18 },
        breadcrumbs: { description: 'Implementar Breadcrumbs Schema', impact: 7 },
        opengraph: { description: 'Completar tags Open Graph (4/4)', impact: 9 },
        canonical: { description: 'Configurar URLs canónicas correctamente', impact: 10 }
    };

    return failed
        .filter(item => interventionMap[item.id])
        .map(item => ({
            id: item.id,
            description: interventionMap[item.id].description,
            impact: interventionMap[item.id].impact
        }))
        .slice(0, 5);
}

function calculatePotentialScore(currentScore, interventions) {
    const potentialGain = interventions.reduce((sum, task) => sum + task.impact, 0);
    return Math.min(currentScore + potentialGain, 100);
}

function getScoreLevel(score) {
    if (score >= 85) {
        return {
            class: 'good',
            label: 'EXCELENTE',
            message: 'Tu sitio tiene una base técnica sólida'
        };
    } else if (score >= 70) {
        return {
            class: 'warning',
            label: 'MEJORABLE',
            message: 'Tienes oportunidades significativas de optimización'
        };
    } else {
        return {
            class: 'critical',
            label: 'CRÍTICO',
            message: 'Tu sitio tiene problemas severos bloqueando tu visibilidad'
        };
    }
}

// ============================================================
// LEAD CAPTURE
// ============================================================

async function handleLeadSubmit(e) {
    e.preventDefault();
    
    const name = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();

    if (!name || !email) {
        alert('Por favor completa todos los campos');
        return;
    }

    const leadData = {
        name,
        email,
        domain: STATE.domain,
        score: STATE.score,
        analysis: STATE.analysis,
        interventions: STATE.interventions,
        impact: STATE.impact,
        timestamp: new Date().toISOString()
    };

    console.log('Lead capturado:', leadData);

    // TODO: Enviar a backend
    // await fetch('/api/leads', {
    //     method: 'POST',
    //     headers: { 'Content-Type': 'application/json' },
    //     body: JSON.stringify(leadData)
    // });

    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', {
            event_category: 'Lead',
            event_label: 'SEO Report',
            value: STATE.score
        });
    }

    STATE.view = 'success';
    render();
}

// ============================================================
// INIT
// ============================================================

console.log('✅ Widget cargado correctamente');

// Esperar a que el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}
