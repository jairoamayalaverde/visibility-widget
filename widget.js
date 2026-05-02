// ============================================================
// LINKEDIN VISIBILITY SCORE WIDGET v2.0
// Motor con detección de nivel por sensores + pesos dinámicos
// Formula: VS = 0.30·AT(level) + 0.30·AC + 0.40·CV
// ============================================================

const CONFIG = {

    // ── PESOS DINÁMICOS AT POR NIVEL ─────────────────────────
    // La clave del nuevo motor: los pesos de AT cambian según
    // el nivel detectado. Alguien en Nivel 1 no es penalizado
    // por no tener framework (AF=0). En Nivel 4, AF domina.
    authorityWeights: {
        1: { pv: 0.70, cl: 0.30, af: 0.00 }, // Foco: claridad básica
        2: { pv: 0.55, cl: 0.30, af: 0.15 }, // Foco: posicionamiento
        3: { pv: 0.45, cl: 0.30, af: 0.25 }, // Foco: diferenciación
        4: { pv: 0.40, cl: 0.25, af: 0.35 }  // Foco: dominio de sistema
    },

    dimensionWeights: { AT: 0.30, AC: 0.30, CV: 0.40 },

    // ── SENSORES DE NIVEL ────────────────────────────────────
    levelSensors: {
        1: {
            name: 'EXPLORACIÓN',
            color: '#6b7280',
            desc: 'Existes en LinkedIn, pero el sistema no sabe qué hacer contigo.',
            positiveSignals: [],
            negativeSignals: ['pv_headline', 'ac_frecuencia', 'pv_about'],
            threshold: 2
        },
        2: {
            name: 'POSICIONAMIENTO',
            color: '#f59e0b',
            desc: 'Ya no eres invisible… pero todavía no eres la opción clara.',
            positiveSignals: ['cl_nicho', 'ac_frecuencia'],
            negativeSignals: ['af_framework'],
            threshold: 2
        },
        3: {
            name: 'DIFERENCIACIÓN',
            color: '#3b82f6',
            desc: 'Tienes un sistema propio. Ahora necesitas que domine.',
            positiveSignals: ['af_framework', 'ac_answer_blocks', 'cv_featured'],
            negativeSignals: [],
            threshold: 2
        },
        4: {
            name: 'AUTORIDAD',
            color: '#10b981',
            desc: 'El sistema te reconoce. Eres la opción obvia en tu categoría.',
            positiveSignals: ['af_framework', 'af_recomendaciones', 'cv_oferta', 'cv_social_proof', 'cl_nicho'],
            negativeSignals: [],
            threshold: 4
        }
    },

    // ── TRIGGERS ESPECIALES ──────────────────────────────────
    triggers: {
        efectoGeneralista: {
            condition: (level, scores) => level === 2 && scores.AF < 20,
            penalty: 22,
            id: 'efecto_generalista',
            title: 'Efecto Generalista detectado',
            message: 'Estás diciendo varias cosas correctas… pero ninguna domina lo suficiente. No es falta de valor, es falta de jerarquía.'
        }
    },

    // ── FACTORES DEL QUIZ ────────────────────────────────────
    factors: {
        // AUTORIDAD — Pilar PV
        pv_headline: {
            dimension: 'AT', pillar: 'PV', weight: 20, critical: true,
            label: 'Headline orientado a resultado',
            question: '¿Tu headline comunica el resultado que generas, no solo tu cargo?',
            hint: 'Ej: "Ayudo a consultores a conseguir clientes con LinkedIn" vs "Consultor de Marketing"',
            sensor_for: [1]
        },
        pv_about: {
            dimension: 'AT', pillar: 'PV', weight: 18, critical: true,
            label: 'About como propuesta de valor',
            question: '¿Tu About habla de a quién ayudas y qué logran contigo?',
            hint: 'Estructura ideal: Problema → Solución → Tu método → CTA',
            sensor_for: [1]
        },
        pv_resultado: {
            dimension: 'AT', pillar: 'PV', weight: 14, critical: false,
            label: 'Resultados cuantificables',
            question: '¿Mencionas resultados concretos (números, % o impacto) en tu experiencia?',
            hint: 'Ej: "Generé 3x más leads en 6 meses para 12 clientes del sector salud"'
        },
        // AUTORIDAD — Pilar CL
        cl_nicho: {
            dimension: 'AT', pillar: 'CL', weight: 14, critical: true,
            label: 'Nicho dominante claro',
            question: '¿Tu perfil deja claro a quién sirves específicamente?',
            hint: 'Nicho = sector + tipo de persona + problema concreto',
            sensor_for: [2, 4]
        },
        cl_consistencia: {
            dimension: 'AT', pillar: 'CL', weight: 12, critical: false,
            label: 'Consistencia de mensaje',
            question: '¿Headline, About y experiencia dicen lo mismo sobre tu propuesta?',
            hint: 'Si alguien lee solo tu headline y luego tu About, ¿recibe el mismo mensaje?'
        },
        // AUTORIDAD — Pilar AF
        af_framework: {
            dimension: 'AT', pillar: 'AF', weight: 16, critical: false,
            label: 'Metodología o framework propio',
            question: '¿Tienes un sistema, método o framework con nombre propio?',
            hint: 'Ej: "Método VISTA", "Sistema 3C". No importa si es simple, importa que tenga nombre.',
            sensor_for: [2, 3, 4]
        },
        af_recomendaciones: {
            dimension: 'AT', pillar: 'AF', weight: 10, critical: false,
            label: 'Recomendaciones que validan tu método',
            question: '¿Tus recomendaciones mencionan resultados específicos o tu metodología?',
            hint: 'No basta con "gran profesional". Busca: "Gracias a su método X, logramos Y"',
            sensor_for: [4]
        },
        // ALCANCE
        ac_frecuencia: {
            dimension: 'AC', pillar: 'AC', weight: 16, critical: true,
            label: 'Frecuencia de publicación',
            question: '¿Publicas contenido en LinkedIn al menos 1 vez por semana?',
            hint: 'Consistencia > viralidad. El algoritmo premia la regularidad.',
            sensor_for: [1, 2]
        },
        ac_formato: {
            dimension: 'AC', pillar: 'AC', weight: 10, critical: false,
            label: 'Variedad de formatos',
            question: '¿Usas múltiples formatos? (texto, carruseles, video, documentos)',
            hint: 'Los carruseles y documentos tienen mayor alcance orgánico.'
        },
        ac_engagement: {
            dimension: 'AC', pillar: 'AC', weight: 12, critical: false,
            label: 'Engagement real',
            question: '¿Tus publicaciones generan comentarios y conversaciones?',
            hint: 'Los comentarios valen 4× más que los likes en el algoritmo de LinkedIn.'
        },
        ac_answer_blocks: {
            dimension: 'AC', pillar: 'AC', weight: 14, critical: true,
            label: 'Contenido tipo "Answer Block"',
            question: '¿Tu contenido responde preguntas específicas que busca tu audiencia?',
            hint: 'Ej: "¿Cómo consigo clientes con LinkedIn?" — respuesta directa, sin rodeos.',
            sensor_for: [3]
        },
        ac_hashtags: {
            dimension: 'AC', pillar: 'AC', weight: 6, critical: false,
            label: 'Hashtags de nicho específicos',
            question: '¿Usas 2-5 hashtags específicos de tu sector (no genéricos)?',
            hint: 'Evita #marketing #negocios. Prefiere #SEOparaEcommerce #ConsultoríaB2B.'
        },
        // CONVERSIÓN
        cv_cta: {
            dimension: 'CV', pillar: 'CV', weight: 20, critical: true,
            label: 'CTA claro en el About',
            question: '¿Tu About termina con un llamado a la acción con siguiente paso claro?',
            hint: 'Ej: "¿Quieres saber tu score? Escríbeme DM con la palabra SCORE"'
        },
        cv_oferta: {
            dimension: 'CV', pillar: 'CV', weight: 18, critical: true,
            label: 'Oferta explícita y contrateable',
            question: '¿Está claro qué pueden contratar contigo y cómo empezar?',
            hint: 'Tu perfil debe responder: "¿Qué haces, para quién y cómo te contrato?"',
            sensor_for: [4]
        },
        cv_featured: {
            dimension: 'CV', pillar: 'CV', weight: 12, critical: false,
            label: 'Sección Destacados activa',
            question: '¿Usas Destacados con activos propios (PDF, web, caso de éxito)?',
            hint: 'Es tu vitrina principal. Un lead magnet aquí puede duplicar conversión.',
            sensor_for: [3]
        },
        cv_contacto: {
            dimension: 'CV', pillar: 'CV', weight: 8, critical: false,
            label: 'Datos de contacto accesibles',
            question: '¿Tu email, web o calendario están visibles en tu perfil?',
            hint: 'Activa Creator Mode para añadir un botón de contacto personalizado.'
        },
        cv_social_proof: {
            dimension: 'CV', pillar: 'CV', weight: 10, critical: false,
            label: 'Prueba social visible',
            question: '¿Hay casos de éxito o validaciones externas fáciles de ver?',
            hint: 'Formato: situación inicial → acción → resultado medible.',
            sensor_for: [4]
        }
    },

    actions: {
        pv_headline:       'Reescribe: "[Verbo resultado] + [nicho] + [sin que]". Ej: "Multiplico clientes para consultores B2B sin depender de referidos"',
        pv_about:          'Reestructura en 4 bloques: (1) Problema de tu cliente, (2) Por qué ocurre, (3) Cómo lo resuelves, (4) CTA concreto',
        pv_resultado:      'Añade a tus 3 últimas experiencias una métrica real. Aunque sea pequeña.',
        cl_nicho:          'Escribe esta frase y ponla en tu headline: "Ayudo a [tipo de persona] a [resultado] sin [objeción principal]"',
        cl_consistencia:   'Lee headline → About → primera experiencia. Si el mensaje cambia, tienes inconsistencia. Unifica.',
        af_framework:      'Dale nombre a lo que ya haces. Si tienes un proceso, llámalo "Método [Nombre]" o "Sistema [Inicial]"',
        af_recomendaciones:'Contacta a 3 clientes y pide que mencionen un resultado específico y tu método en su recomendación',
        ac_frecuencia:     'Bloquea cada lunes 45 minutos para publicar. Una publicación consistente vale más que diez esporádicas',
        ac_formato:        'Esta semana: convierte tu mejor texto en un carrusel de 5-7 slides. Máximo alcance orgánico.',
        ac_engagement:     'Termina cada post con una pregunta que tenga respuesta de una palabra. Reduce la fricción al comentar.',
        ac_answer_blocks:  'Escribe un post que empiece: "La pregunta que más me hacen sobre [tu tema] es..." y respóndela directamente',
        ac_hashtags:       'Usa exactamente 3 hashtags: 1 muy específico de nicho, 1 intermedio, 1 amplio. Nunca más de 5.',
        cv_cta:            'Última línea del About: "Si quieres [resultado concreto], escríbeme DM con la palabra [PALABRA]"',
        cv_oferta:         'Añade en Servicios o en About: qué ofreces, para quién, y la siguiente acción para contratarte',
        cv_featured:       'Fija en Destacados: un PDF de valor gratuito, tu web, y tu mejor caso de éxito (en ese orden)',
        cv_contacto:       'Activa Creator Mode → añade enlace → pon tu Calendly o email directo',
        cv_social_proof:   'Solicita 1 testimonio en formato: "Antes tenía X. Con [Tu nombre] logramos Y en Z tiempo"'
    }
};

// ============================================================
// STATE
// ============================================================

const STATE = {
    view: 'input',
    profileUrl: '',
    currentQuestion: 0,
    answers: {},
    allFactors: [],
    detectedLevel: null,
    scores: { AT: 0, AC: 0, CV: 0, VS: 0, PV: 0, CL: 0, AF: 0, VS_base: 0 },
    triggersActivated: [],
    interventions: [],
    potentialScore: 0,
    nextLevelGap: [],
    errorMessage: ''
};

// ============================================================
// BOOT
// ============================================================

function initFactors() {
    STATE.allFactors = Object.entries(CONFIG.factors).map(([id, f]) => ({ id, ...f }));
}

// ============================================================
// RENDER ENGINE
// ============================================================

function render() {
    const app = document.getElementById('app');
    switch (STATE.view) {
        case 'input':     app.innerHTML = renderInput();     attachInputListeners();   break;
        case 'quiz':      app.innerHTML = renderQuiz();      attachQuizListeners();    break;
        case 'analyzing': app.innerHTML = renderAnalyzing(); break;
        case 'results':   app.innerHTML = renderResults();   attachResultsListeners(); break;
        case 'success':   app.innerHTML = renderSuccess();   break;
        case 'error':     app.innerHTML = renderError();     attachErrorListeners();   break;
    }
    notifyParentHeight();
}

// ── INPUT ────────────────────────────────────────────────────

function renderInput() {
    return `
        <div class="input-box">
            <div class="input-icon">⚡</div>
            <label>Tu perfil de LinkedIn</label>
            <input type="text" id="profile-input"
                placeholder="linkedin.com/in/tu-perfil"
                value="${STATE.profileUrl}" autocomplete="off" />
            <p class="input-hint">
                17 factores · 4 niveles de madurez · ~3 minutos<br>
                El motor detecta tu nivel antes de calcular tu score.
            </p>
            <button class="analyze-btn" id="analyze-btn">Analizar mi visibilidad ahora</button>
            <div class="trust-row">
                <span>🔒 Sin acceso a tu cuenta</span>
                <span>·</span>
                <span>Motor determinístico</span>
                <span>·</span>
                <span>Pesos dinámicos por nivel</span>
            </div>
        </div>
    `;
}

function attachInputListeners() {
    document.getElementById('profile-input').addEventListener('keypress', e => { if (e.key === 'Enter') startQuiz(); });
    document.getElementById('analyze-btn').addEventListener('click', startQuiz);
}

function startQuiz() {
    let url = document.getElementById('profile-input').value.trim();
    if (!url) { showInputError('Ingresa tu URL de LinkedIn'); return; }
    if (!url.includes('linkedin')) url = 'linkedin.com/in/' + url.replace(/^@/, '');
    STATE.profileUrl = url;
    STATE.currentQuestion = 0;
    STATE.answers = {};
    STATE.view = 'quiz';
    render();
}

function showInputError(msg) {
    document.querySelector('.input-error')?.remove();
    const err = document.createElement('p');
    err.className = 'input-error';
    err.textContent = msg;
    document.getElementById('profile-input').after(err);
}

// ── QUIZ ─────────────────────────────────────────────────────

function renderQuiz() {
    const factor = STATE.allFactors[STATE.currentQuestion];
    const total = STATE.allFactors.length;
    const progress = Math.round((STATE.currentQuestion / total) * 100);
    const dimColors = { AT: '#7c3aed', AC: '#0891b2', CV: '#dc2626' };
    const dimLabels = { AT: 'Autoridad', AC: 'Alcance', CV: 'Conversión' };
    const pillarNames = { PV: 'Propuesta de valor', CL: 'Posicionamiento', AF: 'Aceleradores', AC: 'Alcance', CV: 'Conversión' };

    return `
        <div class="quiz-container">
            <div class="quiz-progress">
                <div class="quiz-progress-track">
                    <div class="quiz-progress-fill" style="width:${progress}%"></div>
                </div>
                <div class="quiz-progress-label">
                    <span>${STATE.currentQuestion + 1} / ${total}</span>
                    <span>${total - STATE.currentQuestion} restantes</span>
                </div>
            </div>
            <div class="quiz-meta">
                <span class="dimension-badge" style="color:${dimColors[factor.dimension]};border-color:${dimColors[factor.dimension]}44;background:${dimColors[factor.dimension]}11">
                    ${dimLabels[factor.dimension]}
                </span>
                <span class="pillar-label">${pillarNames[factor.pillar]} · ${factor.weight}pts</span>
                ${factor.critical ? '<span class="critical-badge">CRÍTICO</span>' : ''}
            </div>
            <div class="quiz-question">
                <div class="question-number">P${STATE.currentQuestion + 1}</div>
                <h2>${factor.label}</h2>
                <p class="question-detail">${factor.question}</p>
                ${factor.hint ? `<p class="question-hint">💡 ${factor.hint}</p>` : ''}
            </div>
            <div class="quiz-answers">
                <button class="answer-btn answer-yes" data-answer="true">
                    <span class="answer-icon">✓</span>
                    <span class="answer-text">Sí, lo tengo</span>
                </button>
                <button class="answer-btn answer-no" data-answer="false">
                    <span class="answer-icon">✗</span>
                    <span class="answer-text">No / Parcialmente</span>
                </button>
            </div>
            <div class="quiz-profile-ref">Analizando: <span>${STATE.profileUrl}</span></div>
        </div>
    `;
}

function attachQuizListeners() {
    document.querySelectorAll('.answer-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const answer = btn.dataset.answer === 'true';
            STATE.answers[STATE.allFactors[STATE.currentQuestion].id] = answer;
            btn.classList.add('selected');
            setTimeout(() => {
                STATE.currentQuestion++;
                if (STATE.currentQuestion >= STATE.allFactors.length) {
                    STATE.view = 'analyzing';
                    render();
                    setTimeout(runScoring, 600);
                } else {
                    render();
                }
            }, 220);
        });
    });
}

// ── ANALYZING ────────────────────────────────────────────────

function renderAnalyzing() {
    const steps = [
        'Detectando nivel de madurez...',
        'Aplicando pesos dinámicos AT...',
        'Calculando Alcance (AC)...',
        'Calculando Conversión (CV)...',
        'Evaluando triggers de ajuste...',
        'Generando plan de intervención...'
    ];
    return `
        <div class="loading-state">
            <div class="spinner"></div>
            <div class="loading-text" id="loading-text">${steps[0]}</div>
            <div class="loading-domain">${STATE.profileUrl}</div>
            <div class="loading-steps">
                ${steps.map((s, i) => `
                    <div class="loading-step" id="step-${i}">
                        <span class="step-dot"></span><span>${s}</span>
                    </div>`).join('')}
            </div>
        </div>
    `;
}

async function runScoring() {
    const stepTexts = [
        'Detectando nivel de madurez...',
        'Aplicando pesos dinámicos AT...',
        'Calculando Alcance (AC)...',
        'Calculando Conversión (CV)...',
        'Evaluando triggers de ajuste...',
        'Generando plan de intervención...'
    ];
    for (let i = 0; i < stepTexts.length; i++) {
        const txt = document.getElementById('loading-text');
        const step = document.getElementById(`step-${i}`);
        if (txt) txt.textContent = stepTexts[i];
        if (step) step.classList.add('active');
        await delay(380);
        if (i === 0) STATE.detectedLevel = detectLevel();
        if (i === 1) calculateScores();
        if (i === 4) evaluateTriggers();
        if (i === 5) {
            STATE.interventions = generateInterventions();
            STATE.potentialScore = calculatePotentialScore();
            STATE.nextLevelGap = getNextLevelGap();
        }
        if (step) step.classList.add('done');
    }
    await delay(250);
    STATE.view = 'results';
    render();
}

function delay(ms) { return new Promise(r => setTimeout(r, ms)); }

// ============================================================
// MOTOR DE SCORING v2
// ============================================================

function detectLevel() {
    // Intentar clasificar desde el nivel más alto al más bajo
    for (let lvl = 4; lvl >= 1; lvl--) {
        const sensor = CONFIG.levelSensors[lvl];
        if (sensor.positiveSignals.length === 0) {
            // Nivel 1: se detecta por ausencia
            const negCount = sensor.negativeSignals.filter(id => !STATE.answers[id]).length;
            if (negCount >= sensor.threshold) return lvl;
        } else {
            // Niveles 2-4: se detectan por presencia
            const posCount = sensor.positiveSignals.filter(id => STATE.answers[id]).length;
            if (posCount >= sensor.threshold) return lvl;
        }
    }
    return 1;
}

function calculateScores() {
    const level = STATE.detectedLevel;
    const w = CONFIG.authorityWeights[level];

    const pvFactors = STATE.allFactors.filter(f => f.dimension === 'AT' && f.pillar === 'PV');
    const clFactors = STATE.allFactors.filter(f => f.dimension === 'AT' && f.pillar === 'CL');
    const afFactors = STATE.allFactors.filter(f => f.dimension === 'AT' && f.pillar === 'AF');

    const PV = rawScore(pvFactors);
    const CL = rawScore(clFactors);
    const AF = rawScore(afFactors);
    const AT = Math.round(PV * w.pv + CL * w.cl + AF * w.af);

    const AC = Math.round(rawScore(STATE.allFactors.filter(f => f.dimension === 'AC')));
    const CV = Math.round(rawScore(STATE.allFactors.filter(f => f.dimension === 'CV')));
    const VS_base = Math.round(AT * 0.30 + AC * 0.30 + CV * 0.40);

    STATE.scores = { AT, AC, CV, VS: VS_base, PV: Math.round(PV), CL: Math.round(CL), AF: Math.round(AF), VS_base };
}

function rawScore(factors) {
    if (!factors.length) return 0;
    let total = 0, achieved = 0;
    factors.forEach(f => { total += f.weight; if (STATE.answers[f.id]) achieved += f.weight; });
    return total > 0 ? (achieved / total) * 100 : 0;
}

function evaluateTriggers() {
    STATE.triggersActivated = [];
    Object.entries(CONFIG.triggers).forEach(([key, trigger]) => {
        if (trigger.condition(STATE.detectedLevel, STATE.scores)) {
            STATE.triggersActivated.push({ key, ...trigger });
            STATE.scores.VS = Math.max(0, STATE.scores.VS - trigger.penalty);
        }
    });
}

function generateInterventions() {
    const dimW = { CV: 0.40, AT: 0.30, AC: 0.30 };
    const w = CONFIG.authorityWeights[STATE.detectedLevel];
    return STATE.allFactors
        .filter(f => !STATE.answers[f.id])
        .map(f => {
            const pillarMult = f.dimension === 'AT'
                ? (f.pillar === 'PV' ? w.pv : f.pillar === 'CL' ? w.cl : w.af)
                : 1;
            return { ...f, impact: Math.round(f.weight * dimW[f.dimension] * pillarMult * 3.5) };
        })
        .sort((a, b) => {
            if (a.critical && !b.critical) return -1;
            if (!a.critical && b.critical) return 1;
            return b.impact - a.impact;
        })
        .slice(0, 5)
        .map(f => ({
            id: f.id, label: f.label, dimension: f.dimension,
            pillar: f.pillar, critical: f.critical, impact: f.impact,
            action: CONFIG.actions[f.id] || 'Optimizar este factor en tu perfil'
        }));
}

function calculatePotentialScore() {
    const triggerRecovery = STATE.triggersActivated.reduce((s, t) => s + t.penalty, 0);
    const gain = STATE.interventions.reduce((s, t) => s + t.impact, 0);
    return Math.min(STATE.scores.VS + triggerRecovery + gain, 100);
}

function getNextLevelGap() {
    if (STATE.detectedLevel >= 4) return [];
    const nextSensor = CONFIG.levelSensors[STATE.detectedLevel + 1];
    return nextSensor.positiveSignals
        .filter(id => !STATE.answers[id])
        .map(id => ({ id, label: CONFIG.factors[id]?.label || id, action: CONFIG.actions[id] || '' }));
}

// ============================================================
// RENDER RESULTS
// ============================================================

function renderResults() {
    return `
        ${renderScoreAndBreakdown()}
        ${STATE.triggersActivated.length ? renderTriggers() : ''}
        ${renderNextLevelGap()}
        ${renderInterventions()}
        ${renderLeadCapture()}
    `;
}

// ── SECCIÓN UNIFICADA: score VS + nivel + 3 dimensiones ──────
function renderScoreAndBreakdown() {
    const { VS, AT, AC, CV, PV, CL, AF } = STATE.scores;
    const level = STATE.detectedLevel;
    const m = CONFIG.levelSensors[level];
    const w = CONFIG.authorityWeights[level];
    const passCount = Object.values(STATE.answers).filter(Boolean).length;
    const failCount = STATE.allFactors.length - passCount;

    return `
        <div class="score-breakdown-card">
            <div class="sbc-top">
                <div class="sbc-score-col">
                    <div class="sbc-vs-label">VISIBILITY SCORE</div>
                    <div class="sbc-vs-number">${VS}<span class="sbc-vs-max">/100</span></div>
                    <div class="sbc-level-badge" style="color:${m.color};border-color:${m.color}44;background:${m.color}12">
                        N${level} · ${m.name}
                    </div>
                    <p class="sbc-level-desc">${m.desc}</p>
                    <div class="sbc-dots">
                        ${[1,2,3,4].map(l => `
                            <div class="sbc-dot ${l <= level ? 'sbc-dot--on' : ''}"
                                 style="${l <= level ? `background:${m.color};border-color:${m.color}` : ''}">
                                ${l}
                            </div>`).join('')}
                    </div>
                </div>
                <div class="sbc-dims-col">
                    ${compactDimCard('AT','Autoridad', AT,'#7c3aed','30%', [
                        {name:`PV ×${w.pv}`, score:PV},
                        {name:`CL ×${w.cl}`, score:CL},
                        {name:`AF ×${w.af}`, score:AF}
                    ])}
                    ${compactDimCard('AC','Alcance',    AC,'#0891b2','30%',[])}
                    ${compactDimCard('CV','Conversión', CV,'#dc2626','40%',[])}
                </div>
            </div>
            <div class="sbc-meta">
                <div class="sbc-meta-item">
                    <span class="sbc-meta-val sbc-good">${passCount}</span>
                    <span class="sbc-meta-label">Factores OK</span>
                </div>
                <div class="sbc-meta-divider"></div>
                <div class="sbc-meta-item">
                    <span class="sbc-meta-val sbc-bad">${failCount}</span>
                    <span class="sbc-meta-label">A mejorar</span>
                </div>
                <div class="sbc-meta-divider"></div>
                <div class="sbc-meta-item">
                    <span class="sbc-meta-val sbc-potential">${STATE.potentialScore}</span>
                    <span class="sbc-meta-label">Score potencial</span>
                </div>
                <div class="sbc-meta-divider"></div>
                <div class="sbc-meta-item sbc-meta-profile">
                    <span class="sbc-meta-label">Perfil analizado</span>
                    <span class="sbc-meta-url">${STATE.profileUrl}</span>
                </div>
            </div>
        </div>
    `;
}

function compactDimCard(key, name, score, color, vsWeight, subpillars) {
    const passed = STATE.allFactors.filter(f => f.dimension === key && STATE.answers[f.id]).length;
    const total  = STATE.allFactors.filter(f => f.dimension === key).length;
    const statusLabel = score >= 75 ? 'Sólido' : score >= 50 ? 'Mejorable' : 'Crítico';
    const statusColor = score >= 75 ? '#10b981' : score >= 50 ? '#f59e0b' : '#ef4444';

    return `
        <div class="cdc" style="--cdc-color:${color}">
            <div class="cdc-header">
                <span class="cdc-key" style="color:${color}">${key}</span>
                <span class="cdc-name">${name}</span>
                <span class="cdc-weight">${vsWeight}</span>
            </div>
            <div class="cdc-score-row">
                <span class="cdc-score" style="color:${color}">${score}</span>
                <span class="cdc-status" style="color:${statusColor}">${statusLabel}</span>
                <span class="cdc-ok">${passed}/${total}</span>
            </div>
            <div class="cdc-bar-track">
                <div class="cdc-bar-fill" style="width:${score}%;background:${color}"></div>
            </div>
            ${subpillars.length ? `
                <div class="cdc-subpillars">
                    ${subpillars.map(sp => `
                        <div class="cdc-sp-row">
                            <span class="cdc-sp-name">${sp.name}</span>
                            <div class="cdc-sp-track">
                                <div class="cdc-sp-fill" style="width:${sp.score}%;background:${color}55"></div>
                            </div>
                            <span class="cdc-sp-val">${sp.score}</span>
                        </div>`).join('')}
                </div>` : ''}
        </div>`;
}

function renderTriggers() {
    return STATE.triggersActivated.map(t => `
        <div class="trigger-alert">
            <div class="trigger-header">
                <span class="trigger-icon">⚠</span>
                <span class="trigger-title">${t.title}</span>
                <span class="trigger-penalty">−${t.penalty} pts</span>
            </div>
            <p class="trigger-message">${t.message}</p>
        </div>`).join('');
}

function renderNextLevelGap() {
    const level = STATE.detectedLevel;
    if (level >= 4 || !STATE.nextLevelGap.length) return '';
    const nextM = CONFIG.levelSensors[level + 1];

    return `
        <div class="gap-section">
            <div class="gap-header">
                <h3 class="section-title">Para subir a Nivel ${level + 1} · ${nextM.name}</h3>
                <p class="gap-desc">Señales que el sistema todavía no detecta en tu perfil:</p>
            </div>
            <div class="gap-list">
                ${STATE.nextLevelGap.map(g => `
                    <div class="gap-item">
                        <span class="gap-dot" style="background:${nextM.color}"></span>
                        <div>
                            <div class="gap-label">${g.label}</div>
                            <div class="gap-action">${g.action}</div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
}

function renderInterventions() {
    const dimLabels = { AT:'Autoridad', AC:'Alcance', CV:'Conversión' };
    const dimColors = { AT:'#7c3aed', AC:'#0891b2', CV:'#dc2626' };

    return `
        <div class="interventions-section">
            <div class="interventions-header">
                <h3 class="section-title">Plan de intervención</h3>
                <div class="interventions-meta">Potencial: <strong>${STATE.potentialScore}/100</strong></div>
            </div>
            <div class="interventions-list">
                ${STATE.interventions.map((t, i) => `
                    <div class="intervention-item ${t.critical ? 'is-critical' : ''}">
                        <div class="intervention-num">${String(i+1).padStart(2,'0')}</div>
                        <div class="intervention-body">
                            <div class="intervention-top">
                                <span class="int-dim-badge" style="color:${dimColors[t.dimension]};border-color:${dimColors[t.dimension]}44">${dimLabels[t.dimension]}</span>
                                ${t.critical ? '<span class="int-critical-badge">CRÍTICO</span>' : ''}
                                <span class="int-impact">+${t.impact} pts</span>
                            </div>
                            <div class="intervention-label">${t.label}</div>
                            <div class="intervention-action">${t.action}</div>
                        </div>
                    </div>`).join('')}
            </div>
        </div>`;
}

// ============================================================
// LEAD CAPTURE — personalizado por nivel y triggers
// ============================================================

// Contenido dinámico según el nivel detectado
const LEAD_CONTENT = {
    1: {
        urgency:   'Tu perfil está en modo invisible.',
        headline:  'El sistema no sabe qué hacer contigo todavía.',
        sub:       'Lo primero no es más contenido. Es estructura. Recibe el diagnóstico completo con el plan exacto para que el algoritmo empiece a trabajar a tu favor.',
        cta:       'Quiero salir de la invisibilidad',
        items: [
            'Diagnóstico de los 17 factores con score individual',
            'Plantilla de headline orientado a resultado (lista para copiar)',
            'Estructura de About en 4 bloques con ejemplos de tu nicho',
            'Checklist de activación: 7 cambios en 7 días'
        ]
    },
    2: {
        urgency:   'Estás cerca. Pero "cerca" no convierte.',
        headline:  'Tu perfil informa. Aún no vende.',
        sub:       'Tienes nicho y actividad. Lo que falta es jerarquía. Recibe el plan para consolidar tu mensaje en una sola promesa que domine.',
        cta:       'Quiero que mi perfil empiece a vender',
        items: [
            'Diagnóstico completo + detección del Efecto Generalista',
            'Framework para nombrar y estructurar tu metodología propia',
            'Plantilla de About con Answer Block integrado',
            'Plan de contenido de 4 semanas para construir autoridad'
        ]
    },
    3: {
        urgency:   'Tu sistema existe. Pocos lo ven todavía.',
        headline:  'Tienes diferenciación. Falta dominancia.',
        sub:       'Ya tienes framework y estructura. El siguiente paso es que tu nombre se convierta en sinónimo de tu categoría. Recibe el roadmap para el salto al Nivel 4.',
        cta:       'Quiero dominar mi categoría',
        items: [
            'Diagnóstico de brechas entre Nivel 3 y Nivel 4',
            'Estrategia de Answer Blocks para ser citado por la IA',
            'Sistema de prueba social: cómo solicitar recomendaciones que validen tu método',
            'Auditoría de la sección Destacados como landing page'
        ]
    },
    4: {
        urgency:   'Nivel 4 alcanzado. Hora de sistematizar.',
        headline:  'Eres la opción obvia. Ahora escálalo.',
        sub:       'Estás en el percentil superior. Recibe el análisis de los puntos donde aún hay margen de optimización y la estrategia para mantener la autoridad.',
        cta:       'Quiero el análisis de optimización',
        items: [
            'Reporte completo con benchmarks de Nivel 4',
            'Identificación de gaps residuales en AT, AC y CV',
            'Estrategia de contenido para mantener dominio de categoría',
            'Protocolo de actualización trimestral del perfil'
        ]
    }
};

function renderLeadCapture() {
    const level   = STATE.detectedLevel;
    const m       = CONFIG.levelSensors[level];
    const content = LEAD_CONTENT[level];
    const VS      = STATE.scores.VS;
    const hasGeneralista = STATE.triggersActivated.some(t => t.key === 'efectoGeneralista');

    // Override de contenido si el Efecto Generalista está activo
    const headline = hasGeneralista
        ? 'Ninguna de tus promesas domina todavía.'
        : content.headline;
    const sub = hasGeneralista
        ? 'El diagnóstico detectó el Efecto Generalista en tu perfil. Recibe el plan exacto para eliminar el ruido y hacer que una sola promesa gane.'
        : content.sub;
    const cta = hasGeneralista
        ? 'Quiero eliminar el Efecto Generalista'
        : content.cta;

    return `
        <div class="lead-capture">

            <!-- Urgency strip -->
            <div class="lc-urgency" style="border-color:${m.color}33;color:${m.color}">
                ${content.urgency}
            </div>

            <!-- Header -->
            <div class="lc-header">
                <h2 class="lc-headline">${headline}</h2>
                <p class="lc-sub">${sub}</p>
            </div>

            <!-- Score preview (lo que recibirán en el reporte) -->
            <div class="lc-preview">
                <div class="lc-preview-score">
                    <span class="lc-preview-num" style="color:${m.color}">${VS}</span>
                    <div class="lc-preview-meta">
                        <span class="lc-preview-label">Tu score actual</span>
                        <span class="lc-preview-potential">Potencial: ${STATE.potentialScore}/100</span>
                    </div>
                </div>
                <div class="lc-preview-arrow">→</div>
                <div class="lc-preview-items">
                    ${content.items.map(item => `
                        <div class="lc-item">
                            <span class="lc-item-check" style="color:${m.color}">✓</span>
                            <span>${item}</span>
                        </div>`).join('')}
                </div>
            </div>

            <!-- Form -->
            <form class="lead-form" id="lead-form">
                <div class="form-row">
                    <input type="text"  id="name-input"  placeholder="Tu nombre" required />
                    <input type="email" id="email-input" placeholder="tu@email.com" required />
                </div>
                <button type="submit" class="submit-btn lc-btn" style="background:${m.color}">
                    ${cta}
                </button>
                <div class="privacy-note">🔒 Sin spam. Solo tu diagnóstico y plan de acción personalizado.</div>
            </form>

            <!-- Social proof micro -->
            <div class="lc-social">
                <span class="lc-social-dot"></span>
                <span>Diagnóstico enviado en menos de 5 minutos</span>
            </div>
        </div>`;
}

function renderSuccess() {
    const level = STATE.detectedLevel;
    const m = CONFIG.levelSensors[level];
    const nextLevel = Math.min(level + 1, 4);
    const nextM = CONFIG.levelSensors[nextLevel];

    return `
        <div class="success-message">
            <div class="success-icon" style="background:${m.color}">✓</div>
            <h2>¡Reporte en camino!</h2>
            <p>Tu diagnóstico de Nivel ${level} · <strong style="color:${m.color}">${m.name}</strong> está siendo generado.</p>
            <p style="margin-top:12px;color:var(--muted)">Revisa tu bandeja en los próximos minutos.</p>

            ${level < 4 ? `
                <div class="success-next">
                    <div class="success-next-label">Tu próximo objetivo</div>
                    <div class="success-next-level" style="color:${nextM.color}">
                        Nivel ${nextLevel} · ${nextM.name}
                    </div>
                    <div class="success-next-desc">${nextM.desc}</div>
                </div>` : ''}

            <p class="success-hint">¿No lo ves? Revisa spam o promociones.</p>
        </div>`;
}

function attachResultsListeners() {
    document.getElementById('lead-form')?.addEventListener('submit', handleLeadSubmit);
}

function renderSuccess() {
    return `
        <div class="success-message">
            <div class="success-icon">✓</div>
            <h2>¡Reporte en camino!</h2>
            <p>Revisa tu bandeja en los próximos minutos.</p>
            <p class="success-hint">¿No lo ves? Revisa spam o promociones.</p>
        </div>`;
}

function renderError() {
    return `
        <div class="error-message">
            <h3>⚠ Algo salió mal</h3>
            <p>${STATE.errorMessage || 'Error inesperado. Intenta de nuevo.'}</p>
            <button class="retry-btn" id="retry-btn">Reintentar</button>
        </div>`;
}

function attachErrorListeners() {
    document.getElementById('retry-btn')?.addEventListener('click', () => { STATE.view = 'input'; render(); });
}

async function handleLeadSubmit(e) {
    e.preventDefault();
    const name  = document.getElementById('name-input').value.trim();
    const email = document.getElementById('email-input').value.trim();
    if (!name || !email) { alert('Completa todos los campos'); return; }

    const leadData = {
        name, email,
        profileUrl: STATE.profileUrl,
        detectedLevel: STATE.detectedLevel,
        scores: STATE.scores,
        triggersActivated: STATE.triggersActivated.map(t => t.key),
        answers: STATE.answers,
        interventions: STATE.interventions,
        potentialScore: STATE.potentialScore,
        timestamp: new Date().toISOString()
    };

    console.log('Lead capturado:', leadData);
    // TODO: await fetch('/api/leads', { method:'POST', ... body: JSON.stringify(leadData) });

    if (typeof gtag !== 'undefined') {
        gtag('event', 'generate_lead', { event_category: 'Lead', event_label: 'LinkedIn Visibility v2', value: STATE.scores.VS });
    }

    STATE.view = 'success';
    render();
}

function notifyParentHeight() {
    if (window.parent !== window) {
        window.parent.postMessage({ type: 'linkedin-visibility-resize', height: document.body.scrollHeight }, '*');
    }
}

// ── BOOT ─────────────────────────────────────────────────────
initFactors();
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', render);
} else {
    render();
}
