// Escáner de CV & Audit de Mercado - Motor de Análisis (Privado & Local)
document.addEventListener("DOMContentLoaded", () => {

    // Configure PDF.js worker CDN link
    if (window.pdfjsLib) {
        window.pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js';
    }

    // 0. Animaciones de Desplazamiento (Scroll Reveal)
    const revealElements = document.querySelectorAll(".reveal-on-scroll");
    if ("IntersectionObserver" in window && revealElements.length > 0) {
        const revealObserver = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("active");
                    observer.unobserve(entry.target);
                }
            });
        }, {
            root: null,
            rootMargin: "0px 0px -6% 0px",
            threshold: 0.05
        });
        revealElements.forEach(el => {
            revealObserver.observe(el);
        });
    } else {
        revealElements.forEach(el => el.classList.add("active"));
    }

    // DOM Elements
    const dropzone = document.getElementById("cv-dropzone");
    const fileInput = document.getElementById("cv-file-input");
    const fileCard = document.getElementById("selected-file-card");
    const fileNameDisplay = document.getElementById("selected-file-name");
    const removeFileBtn = document.getElementById("remove-file-btn");
    const startScanBtn = document.getElementById("start-scan-btn");

    const stepUpload = document.getElementById("step-upload");
    const stepLoading = document.getElementById("step-loading");
    const stepResults = document.getElementById("step-results");

    const loadingStatus = document.getElementById("loading-status-text");
    const progressBarFill = document.getElementById("scanner-progress-fill");

    const reScanBtn = document.getElementById("re-scan-btn");

    // Modal Booking Elements
    const bookingModal = document.getElementById("booking-modal");
    const bookingCloseBtn = document.getElementById("booking-close-btn");

    // Modal Legal Elements
    const legalModal = document.getElementById("legal-modal");
    const legalCloseBtn = document.getElementById("legal-close-btn");
    const legalSuccessCloseBtn = document.getElementById("legal-success-close-btn");
    const openLegalBtn = document.getElementById("open-legal-btn");

    // Mobile Navbar Elements
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");

    let selectedFile = null;

    // ==========================================
    // 1. Navegación Móvil & Modales
    // ==========================================
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener("click", () => {
            const isActive = mobileMenuBtn.classList.toggle("active");
            navMenu.classList.toggle("active");
            document.body.style.overflow = isActive ? "hidden" : "";
        });
    }

    // Modal de Reserva (Calendly)
    document.addEventListener("click", (e) => {
        const btn = e.target.closest(".open-booking-btn");
        if (btn) {
            e.preventDefault();
            if (bookingModal) {
                bookingModal.classList.add("active");
                document.body.style.overflow = "hidden";
            }
        }
    });

    if (bookingCloseBtn && bookingModal) {
        bookingCloseBtn.addEventListener("click", () => {
            bookingModal.classList.remove("active");
            document.body.style.overflow = "";
        });
    }

    // Modal de Aviso Legal
    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.classList.add("active");
            document.body.style.overflow = "hidden";
        });
    }

    const closeLegal = () => {
        if (legalModal) {
            legalModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    };

    if (legalCloseBtn) legalCloseBtn.addEventListener("click", closeLegal);
    if (legalSuccessCloseBtn) legalSuccessCloseBtn.addEventListener("click", closeLegal);

    // Cerrar modales clickeando afuera
    window.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
            bookingModal.classList.remove("active");
            document.body.style.overflow = "";
        }
        if (e.target === legalModal) {
            legalModal.classList.remove("active");
            document.body.style.overflow = "";
        }
    });

    // ==========================================
    // 2. Controladores de Carga de Archivo (Drag & Drop)
    // ==========================================
    if (dropzone && fileInput) {
        // Clic en la zona de drop
        dropzone.addEventListener("click", () => {
            fileInput.click();
        });

        // Eventos drag
        ["dragenter", "dragover"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.add("dragover");
                dropzone.style.borderColor = "var(--primary)";
                dropzone.style.backgroundColor = "rgba(144, 181, 163, 0.12)";
            }, false);
        });

        ["dragleave", "drop"].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dropzone.classList.remove("dragover");
                dropzone.style.borderColor = "rgba(217, 135, 87, 0.45)";
                dropzone.style.backgroundColor = "rgba(253, 251, 247, 0.5)";
            }, false);
        });

        // Procesar archivo soltado
        dropzone.addEventListener("drop", (e) => {
            const dt = e.dataTransfer;
            const files = dt.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });

        // Procesar archivo seleccionado por botón explorer
        fileInput.addEventListener("change", (e) => {
            const files = e.target.files;
            if (files.length > 0) {
                handleFileSelection(files[0]);
            }
        });
    }

    const handleFileSelection = (file) => {
        if (file.type !== "application/pdf") {
            alert("Por favor, sube únicamente archivos en formato PDF.");
            return;
        }

        if (file.size > 5 * 1024 * 1024) {
            alert("El archivo excede el tamaño máximo permitido de 5MB.");
            return;
        }

        selectedFile = file;
        fileNameDisplay.textContent = file.name;
        
        // UI toggle
        dropzone.style.display = "none";
        fileCard.style.display = "flex";

        // Habilitar botón de escaneo
        startScanBtn.disabled = false;
        startScanBtn.style.opacity = "1";
        startScanBtn.style.cursor = "pointer";
    };

    if (removeFileBtn) {
        removeFileBtn.addEventListener("click", () => {
            selectedFile = null;
            fileInput.value = ""; // Clear file input
            
            // UI toggle
            fileCard.style.display = "none";
            dropzone.style.display = "flex";

            // Deshabilitar botón de escaneo
            startScanBtn.disabled = true;
            startScanBtn.style.opacity = "0.65";
            startScanBtn.style.cursor = "not-allowed";
        });
    }

    // ==========================================
    // 3. Flujo de Ejecución del Escaneo & Extracción PDF.js
    // ==========================================
    if (startScanBtn) {
        startScanBtn.addEventListener("click", () => {
            if (!selectedFile) return;

            // UI step transition
            stepUpload.style.display = "none";
            stepLoading.style.display = "block";
            window.scrollTo({ top: 100, behavior: "smooth" });

            processAndAnalyzePDF(selectedFile);
        });
    }

    const processAndAnalyzePDF = async (file) => {
        let extractedText = "";
        let pageCount = 0;

        try {
            updateLoadingStatus("Iniciando extracción del archivo PDF...", 10);
            
            const arrayBuffer = await file.arrayBuffer();
            updateLoadingStatus("Leyendo páginas y capas de texto...", 30);

            const pdf = await window.pdfjsLib.getDocument({ data: arrayBuffer }).promise;
            pageCount = pdf.numPages;

            for (let i = 1; i <= pageCount; i++) {
                updateLoadingStatus(`Extrayendo texto de la página ${i} de ${pageCount}...`, 30 + Math.floor((i / pageCount) * 20));
                const page = await pdf.getPage(i);
                const textContent = await page.getTextContent();
                const pageText = textContent.items.map(item => item.str).join(" ");
                extractedText += pageText + "\n";
            }

            updateLoadingStatus("Procesando heurísticas de ATS...", 65);
            await sleep(400); // Dar sensación de escaneo real

            updateLoadingStatus("Analizando verbos de impacto y habilidades...", 80);
            await sleep(400);

            updateLoadingStatus("Generando informe interactivo final...", 95);
            await sleep(300);

            // Ejecutar el motor de análisis
            runCVAnalysis(extractedText, pageCount);

        } catch (error) {
            console.error("Error al extraer texto del PDF:", error);
            alert("Hubo un problema al leer el archivo PDF. Asegúrate de que no esté encriptado ni dañado.");
            resetScanUI();
        }
    };

    const updateLoadingStatus = (message, percent) => {
        if (loadingStatus) loadingStatus.textContent = message;
        if (progressBarFill) progressBarFill.style.width = `${percent}%`;
    };

    const resetScanUI = () => {
        stepLoading.style.display = "none";
        stepResults.style.display = "none";
        stepUpload.style.display = "block";
        selectedFile = null;
        if (fileInput) fileInput.value = "";
        if (fileCard) fileCard.style.display = "none";
        if (dropzone) dropzone.style.display = "flex";
        if (document.getElementById("q-job-desc")) {
            document.getElementById("q-job-desc").value = "";
        }
        if (startScanBtn) {
            startScanBtn.disabled = true;
            startScanBtn.style.opacity = "0.65";
            startScanBtn.style.cursor = "not-allowed";
        }
    };

    if (reScanBtn) {
        reScanBtn.addEventListener("click", () => {
            resetScanUI();
            window.scrollTo({ top: 100, behavior: "smooth" });
        });
    }

    // Helper sleep
    const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

    // Helper showToast
    const showToast = (message) => {
        if (!document.getElementById("toast-animations")) {
            const style = document.createElement("style");
            style.id = "toast-animations";
            style.textContent = `
                @keyframes slideIn {
                    from { transform: translateY(50px); opacity: 0; }
                    to { transform: translateY(0); opacity: 1; }
                }
                @keyframes slideOut {
                    from { transform: translateY(0); opacity: 1; }
                    to { transform: translateY(50px); opacity: 0; }
                }
            `;
            document.head.appendChild(style);
        }

        const toast = document.createElement("div");
        toast.style.position = "fixed";
        toast.style.bottom = "30px";
        toast.style.right = "30px";
        toast.style.backgroundColor = "var(--primary)";
        toast.style.color = "var(--white)";
        toast.style.padding = "16px 24px";
        toast.style.borderRadius = "12px";
        toast.style.boxShadow = "0 10px 30px rgba(0,0,0,0.15)";
        toast.style.zIndex = "9999";
        toast.style.fontSize = "0.9rem";
        toast.style.fontFamily = "inherit";
        toast.style.display = "flex";
        toast.style.alignItems = "center";
        toast.style.gap = "10px";
        toast.style.border = "1px solid rgba(255,255,255,0.1)";
        toast.style.animation = "slideIn 0.3s ease-out";
        toast.innerHTML = '<i class="fa-solid fa-circle-check" style="color: var(--accent); font-size: 1.15rem;"></i> <span style="font-weight: 500;">' + message + '</span>';
        
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.style.animation = "slideOut 0.3s ease-in forwards";
            setTimeout(() => toast.remove(), 300);
        }, 4000);
    };

    // ==========================================
    // 4. Motor de Heurísticas y Análisis del CV
    // ==========================================
    const runCVAnalysis = (text, pages) => {
        // Parámetros del Formulario
        const qPhoto = document.querySelector('input[name="q-photo"]:checked').value;
        const qLang = document.getElementById("q-lang").value;
        const qDesign = document.querySelector('input[name="q-design"]:checked').value;
        const qJobDesc = document.getElementById("q-job-desc") ? document.getElementById("q-job-desc").value.trim() : "";

        // Normalizar texto
        const cleanText = text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

        // Listas de palabras clave para análisis (Inglés y Español)
        const sectionsKeywords = {
            profile: [
                "perfil", "sobre mi", "resumen", "extracto", "quien soy", "introduccion", "resumen profesional", "acerca de",
                "profile", "about me", "summary", "professional summary", "personal summary", "intro", "introduction", "about"
            ],
            experience: [
                "experiencia", "trayectoria", "laboral", "empleos", "historial", "antecedentes", "experiencia profesional", "puestos",
                "experience", "work history", "employment", "history", "professional experience", "work experience", "career", "jobs"
            ],
            education: [
                "formacion", "educacion", "estudios", "universidad", "academico", "titulos", "cursos", "posgrado",
                "education", "academic", "university", "degrees", "courses", "certifications", "training"
            ],
            skills: [
                "habilidades", "competencias", "aptitudes", "conocimientos", "skills", "tecnologias",
                "core competencies", "technologies", "expertise", "strengths"
            ]
        };

        const actionVerbs = [
            "lidere", "liderar", "gestione", "gestionar", "coordine", "coordinar", "optimice", "optimizar", 
            "diseñe", "disenar", "desarrolle", "desarrollar", "implemente", "implementar", "logre", "lograr", 
            "cree", "crear", "reduje", "reducir", "aumente", "aumentar", "automatice", "automatizar", 
            "negocie", "negociar", "planifique", "planificar", "dirigi", "dirigir", "mejore", "mejorar",
            "execute", "ejecutar", "alcance", "alcanzar", "impulse", "impulsar", "liderear",
            "led", "lead", "managed", "manage", "coordinated", "coordinate", "optimized", "optimize", 
            "designed", "design", "developed", "develop", "implemented", "implement", "achieved", "achieve", 
            "created", "create", "reduced", "reduce", "increased", "increase", "automated", "automate", 
            "negotiated", "negotiate", "planned", "plan", "directed", "direct", "improved", "improve", 
            "executed", "execute", "built", "build", "delivered", "deliver", "launched", "launch"
        ];

        const cliches = [
            "proactivo", "proactiva", "dinamico", "dinamica", "motivado", "motivada", "trabajar bajo presion", 
            "perfeccionista", "apasionado", "apasionada", "organizado", "organizada", "comunicativo", "comunicativa",
            "proactive", "dynamic", "motivated", "detail-oriented", "detail oriented", "passionate", "organized", 
            "team player", "hard worker", "results-driven", "results driven"
        ];

        // Detección de secciones
        let sectionsFound = { profile: false, experience: false, education: false, skills: false };
        for (const [section, keywords] of Object.entries(sectionsKeywords)) {
            sectionsFound[section] = keywords.some(keyword => cleanText.includes(keyword));
        }

        // Conteo de palabras y verbos
        const wordCount = text.split(/\s+/).filter(w => w.length > 0).length;
        
        let foundVerbs = [];
        actionVerbs.forEach(verb => {
            const regex = new RegExp(`\\b${verb}\\b`, 'gi');
            const matches = cleanText.match(regex);
            if (matches) foundVerbs.push({ verb, count: matches.length });
        });
        const totalVerbsCount = foundVerbs.reduce((sum, curr) => sum + curr.count, 0);

        // Detección de métricas/logros cuantitativos (números, %, USD, EUR, etc.)
        const metricsRegex = /(\d+%\s*|\b\d+\s*(?:usd|eur|millones|millions|clientes|clients|customers|ventas|sales|proyectos|projects|ahorro|savings|budget)\b|\b(?:\d{2,})\b)/gi;
        const matchesMetrics = cleanText.match(metricsRegex) || [];
        const metricsCount = matchesMetrics.length;

        // Detección de clichés
        let foundCliches = [];
        cliches.forEach(cliche => {
            if (cleanText.includes(cliche)) {
                foundCliches.push(cliche);
            }
        });

        // Verificación de contactos
        const hasEmail = /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g.test(text);
        const hasLinkedIn = cleanText.includes("linkedin");
        
        // Helper para detectar teléfonos internacionales de manera robusta
        const detectPhone = (txt) => {
            const phoneCandidates = txt.match(/(?:\+?[\d()\s.-]{8,20})/g) || [];
            for (const candidate of phoneCandidates) {
                const clean = candidate.replace(/[^\d]/g, "");
                if (clean.length >= 8 && clean.length <= 15) {
                    if (!/^(19|20)\d{6}$/.test(clean) && !/^(19|20)\d{2}(19|20)\d{2}$/.test(clean)) {
                        return true;
                    }
                }
            }
            return false;
        };
        const hasPhone = detectPhone(text);

        // ==========================================
        // CALCULO DE PUNTAJES (Dimensiones)
        // ==========================================
        
        // 1. Estructura y ATS (Secciones encontradas)
        let atsScore = 20; // Base por subir PDF
        if (sectionsFound.profile) atsScore += 20;
        if (sectionsFound.experience) atsScore += 20;
        if (sectionsFound.education) atsScore += 20;
        if (sectionsFound.skills) atsScore += 20;

        // 2. Redacción e Impacto
        let impactScore = 40; // Base
        impactScore += Math.min(totalVerbsCount * 6, 30); // Max +30 por verbos
        impactScore += Math.min(metricsCount * 10, 30); // Max +30 por métricas/números
        if (foundCliches.length > 2) impactScore -= 15; // Penalizar clichés
        impactScore = Math.max(Math.min(impactScore, 100), 10);

        // 3. Alineación e Información (Skills & Coherencia)
        let skillsScore = 30; // Base
        if (hasLinkedIn) skillsScore += 25;
        if (hasEmail) skillsScore += 20;
        if (hasPhone) skillsScore += 15;
        if (wordCount >= 350 && wordCount <= 850) skillsScore += 10;
        skillsScore = Math.min(skillsScore, 100);

        // 5. Análisis de Compatibilidad con Oferta (Si se ingresó)
        let compatibilityData = null;
        if (qJobDesc.length > 15) {
            // Lista ampliada de Stop words en español e inglés, excluyendo empresas, portales, verbos genéricos y seniorities
            const stopWords = new Set([
                "el", "la", "los", "las", "un", "una", "unos", "unas", "de", "del", "a", "al", "en", "y", "o", "u", "e", 
                "para", "por", "con", "sin", "sobre", "tras", "desde", "hasta", "hacia", "que", "se", "lo", "su", 
                "sus", "como", "mas", "es", "son", "otra", "otros", "este", "esta", "estos", "estas", "nos", "les",
                "the", "of", "and", "to", "in", "is", "for", "with", "on", "at", "by", "an", "this", "that", "it", "from", 
                "or", "as", "your", "our", "their", "are", "be", "we", "you", "i", "me", "my", "he", "she", "they",
                // Exclusiones de empresas y portales comunes
                "bairesdev", "randstad", "adecco", "manpower", "computrabajo", "workana", "linkedin", "glassdoor", 
                "indeed", "empresa", "compañia", "compañía", "cliente", "importante", "busqueda", "búsqueda", 
                "vacante", "puesto", "rol", "posición", "posicion", "contratacion", "contratación", "cv", 
                "curriculum", "hoja", "vida", "empleo", "trabajo", "selección", "seleccion", "reclutamiento",
                // Exclusiones de Seniority (analizado por separado)
                "junior", "senior", "semisenior", "ssr", "trainee", "lead", "principal", "director", "manager", 
                "coordinador", "jefe", "pasante", "practicante", "practicas", "pasantia", "asistente", "auxiliar"
            ]);

            const cleanJob = qJobDesc.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
            const jobTokens = cleanJob.match(/\b[a-z]{3,18}\b/g) || [];
            
            const wordFreq = {};
            jobTokens.forEach(token => {
                if (!stopWords.has(token)) {
                    wordFreq[token] = (wordFreq[token] || 0) + 1;
                }
            });

            const sortedKeywords = Object.keys(wordFreq).sort((a, b) => wordFreq[b] - wordFreq[a]);
            const jobKeywords = sortedKeywords.slice(0, 10); // Seleccionar las 10 principales habilidades/conceptos

            const matched = [];
            const missing = [];
            jobKeywords.forEach(kw => {
                const regex = new RegExp(`\\b${kw}\\b`, "i");
                if (regex.test(cleanText)) {
                    matched.push(kw);
                } else {
                    missing.push(kw);
                }
            });

            // --- Análisis Inteligente de Años de Experiencia ---
            let yearsRequired = null;
            // Buscar patrones de años requeridos (ej: "3 años", "5+ years", "experiencia de 2 años")
            const jobYearsRegex = /(?:experiencia|experience|requisito|minimo|minimum)?\s*(?:de|\b)\s*([1-9]|10)\s*(?:\+|mas|more|\s)*\s*(?:anos|años|years|ano|año|year)\b/i;
            const jobYearsMatch = cleanJob.match(jobYearsRegex);
            if (jobYearsMatch) {
                yearsRequired = parseInt(jobYearsMatch[1], 10);
            }

            let yearsCandidate = 0;
            let dateRangesFound = [];
            const rangeRegex = /\b(20[0-2][0-9]|19[8-9][0-9])\s*[-–—]\s*(20[0-2][0-9]|19[8-9][0-9]|presente|actualidad|present|now|hoy)\b/gi;
            let rangeMatch;
            while ((rangeMatch = rangeRegex.exec(cleanText)) !== null) {
                dateRangesFound.push({
                    startYear: parseInt(rangeMatch[1], 10),
                    endStr: rangeMatch[2],
                    index: rangeMatch.index
                });
            }

            if (dateRangesFound.length > 0) {
                // Hay bloques de experiencia con fechas en el CV
                for (let i = 0; i < dateRangesFound.length; i++) {
                    const currentRange = dateRangesFound[i];
                    const nextRange = dateRangesFound[i + 1];
                    const startIndex = currentRange.index;
                    const endIndex = nextRange ? nextRange.index : cleanText.length;
                    
                    // Extraer el bloque del puesto (máx 400 caracteres)
                    const blockText = cleanText.substring(startIndex, Math.min(startIndex + 400, endIndex));
                    
                    // Calcular duración del puesto
                    const startYear = currentRange.startYear;
                    const endYear = /^(presente|actualidad|present|now|hoy)$/i.test(currentRange.endStr) 
                        ? new Date().getFullYear() 
                        : parseInt(currentRange.endStr, 10);
                    const duration = Math.max(1, endYear - startYear);
                    
                    // Verificar relevancia del puesto comparándolo con las palabras clave principales de la vacante (jobKeywords)
                    const relevanceThreshold = jobKeywords.slice(0, 5);
                    const isRelevant = relevanceThreshold.some(kw => {
                        const kwRegex = new RegExp(`\\b${kw}\\b`, "i");
                        return kwRegex.test(blockText);
                    });
                    
                    if (isRelevant) {
                        yearsCandidate += duration;
                    }
                }
            } else {
                // Fallback si no hay rangos de fechas (estimación general del CV)
                const yearMatches = cleanText.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/g);
                if (yearMatches) {
                    const yearsList = yearMatches.map(y => parseInt(y, 10));
                    const minYear = Math.min(...yearsList);
                    const maxYear = Math.max(...yearsList);
                    const currentYear = new Date().getFullYear();
                    const endYear = maxYear < currentYear ? maxYear : currentYear;
                    const estimatedDiff = endYear - minYear;
                    if (estimatedDiff > 0 && estimatedDiff <= 25) {
                        yearsCandidate = estimatedDiff;
                    }
                }
            }

            // Evitar que la experiencia sea superior a la total en casos extraños de superposición de fechas
            const currentYear = new Date().getFullYear();
            const yearMatchesAll = cleanText.match(/\b(20[0-2][0-9]|19[8-9][0-9])\b/g);
            if (yearMatchesAll) {
                const yearsList = yearMatchesAll.map(y => parseInt(y, 10));
                const minYear = Math.min(...yearsList);
                const maxTotalCareer = Math.max(1, currentYear - minYear);
                yearsCandidate = Math.min(yearsCandidate, maxTotalCareer);
            }
            
            if (yearsCandidate === 0) {
                yearsCandidate = null; // No se detectó experiencia relevante
            }

            // --- Detector de idioma de la oferta de empleo ---
            const englishIndicators = ["the", "and", "with", "required", "experience", "skills", "role", "responsibilities", "about", "we are looking", "job description"];
            const spanishIndicators = ["de", "la", "para", "requisitos", "experiencia", "perfil", "busqueda", "búsqueda", "responsabilidades", "sobre el rol", "ofrecemos"];
            
            let englishHits = 0;
            let spanishHits = 0;
            englishIndicators.forEach(word => {
                if (cleanJob.includes(word)) englishHits++;
            });
            spanishIndicators.forEach(word => {
                if (cleanJob.includes(word)) spanishHits++;
            });
            const jobLanguageDetected = englishHits > spanishHits ? "en" : "es";

            // --- Detector de idioma del CV ---
            const englishWords = ["the", "and", "with", "experience", "skills", "education", "summary", "management", "project", "working"];
            const spanishWords = ["de", "la", "para", "experiencia", "habilidades", "educacion", "resumen", "gestion", "proyecto", "trabajando"];
            
            let cvEnglishHits = 0;
            let cvSpanishHits = 0;
            
            englishWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, "i");
                if (regex.test(cleanText)) cvEnglishHits++;
            });
            spanishWords.forEach(word => {
                const regex = new RegExp(`\\b${word}\\b`, "i");
                if (regex.test(cleanText)) cvSpanishHits++;
            });
            
            const cvLanguageDetected = cvEnglishHits > cvSpanishHits ? "en" : "es";
            const finalCvLang = (qLang === "en" || cvLanguageDetected === "en") ? "en" : "es";

            // --- Análisis de Idiomas ---
            let langRequired = "No especificado";
            let langCandidate = "-";
            let langMatch = "info";
            let langAdvice = null;

            const hasEnglishInCV = cleanText.includes("ingles") || cleanText.includes("english") || cleanText.includes("upper-intermediate") || cleanText.includes("b2") || cleanText.includes("c1") || cleanText.includes("c2") || cleanText.includes("a1") || cleanText.includes("a2") || cleanText.includes("b1") || cleanText.includes("toeic") || cleanText.includes("toefl") || cleanText.includes("ielts");

            if (jobLanguageDetected === "en") {
                langRequired = "Inglés (Oferta)";
                if (finalCvLang === "es") {
                    if (hasEnglishInCV) {
                        langCandidate = "Español (Inglés detectado)";
                        langMatch = "match";
                        langAdvice = "Detectamos que mencionas tu nivel de **Inglés** en el CV, pero el documento está redactado en **Español**. Como la oferta de empleo está en inglés, te sugerimos fuertemente subir una versión de tu CV completamente traducida al **Inglés** para superar con éxito los filtros ATS y alinearte al idioma de la vacante.";
                    } else {
                        langCandidate = "Español";
                        langMatch = "check";
                        langAdvice = "La vacante está redactada en **Inglés** pero tu currículum está redactado en **Español** y no detectamos menciones a tu nivel de inglés. Te sugerimos subir una versión de tu CV traducida al **Inglés** y detallar tu nivel para evitar ser descartado automáticamente por los filtros ATS.";
                    }
                } else {
                    langCandidate = "Inglés ✓";
                    langMatch = "match";
                }
            } else {
                if (cleanJob.includes("ingles") || cleanJob.includes("english")) {
                    langRequired = "Inglés Requerido";
                    if (cleanText.includes("ingles") || cleanText.includes("english") || cleanText.includes("upper-intermediate") || cleanText.includes("b2") || cleanText.includes("c1") || cleanText.includes("c2") || finalCvLang === "en") {
                        langCandidate = "Detectado ✓";
                        langMatch = "match";
                    } else {
                        langCandidate = "No detectado ✗";
                        langMatch = "check";
                        langAdvice = "La vacante indica que se requiere o valora el idioma **Inglés**, pero no hemos logrado detectar certificaciones ni menciones a este idioma en el texto de tu currículum. Te sugerimos añadir tu nivel de inglés si lo posees.";
                    }
                } else if (cleanJob.includes("portugues") || cleanJob.includes("portuguese")) {
                    langRequired = "Portugués";
                    if (cleanText.includes("portugues") || cleanText.includes("portuguese")) {
                        langCandidate = "Detectado ✓";
                        langMatch = "match";
                    } else {
                        langCandidate = "No detectado ✗";
                        langMatch = "check";
                    }
                }
            }

            // --- Análisis de Ubicación / Modalidad ---
            let locRequired = "No especificada";
            let locCandidate = "-";
            let locMatch = "info";

            if (cleanJob.includes("remoto") || cleanJob.includes("remote") || cleanJob.includes("home office") || cleanJob.includes("home-office")) {
                locRequired = "Remoto";
                if (cleanText.includes("remoto") || cleanText.includes("remote") || cleanText.includes("home office") || cleanText.includes("distancia")) {
                    locCandidate = "Remoto ✓";
                    locMatch = "match";
                } else {
                    locCandidate = "No detectado ✗";
                    locMatch = "check";
                }
            } else if (cleanJob.includes("hibrido") || cleanJob.includes("híbrido")) {
                locRequired = "Híbrido";
                if (cleanText.includes("hibrido") || cleanText.includes("híbrido") || cleanText.includes("remoto") || cleanText.includes("remote") || cleanText.includes("presencial")) {
                    locCandidate = "Compatible ✓";
                    locMatch = "match";
                } else {
                    locCandidate = "No detectado ✗";
                    locMatch = "check";
                }
            } else if (cleanJob.includes("presencial")) {
                locRequired = "Presencial";
                if (cleanText.includes("presencial")) {
                    locCandidate = "Presencial ✓";
                    locMatch = "match";
                } else {
                    locCandidate = "No especificado";
                    locMatch = "info";
                }
            }

            // 1. Experiencia Score
            let expScore = 100;
            if (yearsRequired !== null) {
                if (yearsCandidate !== null) {
                    expScore = yearsCandidate >= yearsRequired ? 100 : Math.round((yearsCandidate / yearsRequired) * 100);
                } else {
                    expScore = 0;
                }
            }

            // 2. Idiomas Score
            let langScore = 100;
            if (langMatch === "check") {
                langScore = 0;
            } else if (langMatch === "match") {
                langScore = 100;
            }

            // 3. Ubicación Score
            let locScore = 100;
            if (locMatch === "check") {
                locScore = 0;
            } else if (locMatch === "match") {
                locScore = 100;
            }

            // 4. Palabras Clave Score
            const totalKW = jobKeywords.length;
            const matchCount = matched.length;
            const keywordsScore = totalKW > 0 ? Math.round((matchCount / totalKW) * 100) : 0;

            // Cálculo ponderado: 25% Exp, 25% Idioma, 20% Ubicación, 30% Palabras Clave
            const affinityScore = Math.round((expScore * 0.25) + (langScore * 0.25) + (locScore * 0.20) + (keywordsScore * 0.30));

            compatibilityData = {
                score: affinityScore,
                keywordsScore: keywordsScore,
                matched: matched.slice(0, 6),
                missing: missing.slice(0, 6),
                yearsRequired: yearsRequired,
                yearsCandidate: yearsCandidate,
                langRequired: langRequired,
                langCandidate: langCandidate,
                langMatch: langMatch,
                langAdvice: langAdvice,
                locRequired: locRequired,
                locCandidate: locCandidate,
                locMatch: locMatch
            };
        }

        // 4. Diseño y Buenas Prácticas
        let designScore = 100;
        if (qDesign === "yes") designScore -= 30;
        if (pages > 2) designScore -= 25;
        if (pages === 0) designScore -= 30;
        if (qPhoto === "yes") designScore -= 10;
        designScore = Math.max(designScore, 20);

        // Puntaje general (Promedio)
        const finalScore = Math.round((atsScore + impactScore + skillsScore + designScore) / 4);

        // Renderizar los resultados en el DOM
        renderResultsUI(finalScore, atsScore, impactScore, skillsScore, designScore, {
            text,
            sectionsFound,
            wordCount,
            totalVerbsCount,
            metricsCount,
            foundCliches,
            hasEmail,
            hasLinkedIn,
            hasPhone,
            pages,
            qPhoto,
            qDesign,
            qLang,
            compatibilityData
        });
    };

    // ==========================================
    // 5. Renderizado de Resultados & Informe Infografía
    // ==========================================
    const renderResultsUI = (score, ats, impact, skills, design, data) => {
        // Ocultar loader y mostrar resultados
        stepLoading.style.display = "none";
        stepResults.style.display = "flex";
        window.scrollTo({ top: 100, behavior: "smooth" });

        // ==========================================
        // Determinación de Arquetipo y Monólogo del Seleccionador (Tono Cálido)
        // ==========================================
        let arquetipoTitle = "El Profesional Silencioso";
        let arquetipoIcon = '<i class="fa-solid fa-shield-halved"></i>';
        let arquetipoDesc = "Tienes una trayectoria valiosa y un gran camino recorrido, pero tu CV lo cuenta con timidez. ¡Es hora de lucir tus logros! Sumar números y porcentajes ayudará a que el mercado comprenda el verdadero impacto de tu trabajo.";
        let monologoText = '"Al leer tu perfil, busco conectar con tu valor único. Adjetivos comunes como \'proactivo\' o \'dinámico\' se usan tanto que pierden fuerza. Me encantaría conocer ejemplos de tus logros reales para ver tu gran potencial en acción."';

        if (data.qDesign === "yes") {
            arquetipoTitle = "El Diseñador Creativo";
            arquetipoIcon = '<i class="fa-solid fa-palette"></i>';
            arquetipoDesc = "Posees una gran sensibilidad visual y un currículum muy estético. Para asegurar que superas los filtros ATS, te sugiero simplificar la estructura a una sola columna: tu contenido merece ser leído por humanos y sistemas sin trabas.";
            monologoText = '"Tu CV tiene una estética muy bonita y cuidada. Sin embargo, ten en cuenta que los lectores automáticos (ATS) se confunden fácilmente con barras y columnas. Te sugiero un diseño limpio para asegurar que no nos perdamos nada de tu historia."';
        } else if (data.foundCliches.length > 2 || (score < 60 && data.totalVerbsCount < 4)) {
            arquetipoTitle = "El Comunicador Apasionado";
            arquetipoIcon = '<i class="fa-solid fa-pen-fancy"></i>';
            arquetipoDesc = "Redactas con mucha calidez y entusiasmo. Para dar el siguiente salto, te sugiero reemplazar adjetivos genéricos por datos concretos de tus éxitos, demostrando tu valor con hechos en lugar de descripciones comunes.";
            monologoText = '"Redactas con mucha energía, lo cual es excelente. Pero los adjetivos de relleno como \'apasionado\' o \'capacidad de trabajar bajo presión\' ocupan espacio valioso. Prefiero ver ejemplos de tus logros con métricas objetivas."';
        } else if (score >= 80) {
            arquetipoTitle = "El Candidato Estratégico";
            arquetipoIcon = '<i class="fa-solid fa-rocket"></i>';
            arquetipoDesc = "¡Felicidades! Tu currículum está en un excelente punto. Hablas el idioma del mercado de forma clara, con verbos de acción fuertes y métricas que respaldan tu talento. Estás muy cerca de tu próximo paso.";
            monologoText = '"¡Qué gusto leer este CV! La información fluye de forma muy clara, la cabecera está ordenada y los logros cuantificados facilitan muchísimo comprender el valor de tu trabajo."';
        }

        // Si no tiene LinkedIn, agregar advertencia suave al monólogo
        if (!data.hasLinkedIn && score < 80) {
            monologoText = '"Tu trayectoria es muy interesante. Me encantaría poder visitar tu perfil de LinkedIn con un solo clic en tu cabecera para conocer más sobre ti y conectar de forma directa."';
        }

        // Actualizar elementos DOM del Arquetipo y Monólogo
        const aTitle = document.getElementById("arquetipo-title");
        const aIcon = document.getElementById("arquetipo-icon");
        const aDesc = document.getElementById("arquetipo-desc");
        const mText = document.getElementById("monologo-text");

        if (aTitle) aTitle.textContent = arquetipoTitle;
        if (aIcon) aIcon.innerHTML = arquetipoIcon;
        if (aDesc) aDesc.textContent = arquetipoDesc;
        if (mText) mText.textContent = monologoText;

        // ==========================================
        // Configurar Botón "Compartir en LinkedIn"
        // ==========================================
        const shareText = `Usé el Escáner de CV para ver el nivel de compatibilidad de mi perfil con una vacante y la verdad, ¡súper útil! 🚀\n\nEsta herramienta gratuita y 100% privada analiza tu currículum frente a los requisitos de un puesto, simula lo que un reclutador ve en 6 segundos y te muestra qué palabras clave te faltan para pasar los filtros de selección.\n\nSi estás buscando empleo o pensando en un cambio, te sugiero hacer la prueba sin costo aquí:`;
        const shareUrl = "https://www.florcapeletto.com/escaner-cv.html";
        
        // Link de compartir nativo de LinkedIn (Share Intent)
        const linkedinShareLink = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(shareUrl)}`;
        
        const copyBtn = document.getElementById("copy-linkedin-btn");
        if (copyBtn) {
            // Eliminar listeners anteriores clonando el nodo
            const newCopyBtn = copyBtn.cloneNode(true);
            copyBtn.parentNode.replaceChild(newCopyBtn, copyBtn);
            
            newCopyBtn.addEventListener("click", () => {
                // Copiar el mensaje al portapapeles para que puedan pegarlo en la ventana que se abre
                navigator.clipboard.writeText(shareText + " " + shareUrl).then(() => {
                    // Mostrar toast premium explicativo
                    showToast("¡Texto de recomendación copiado! Redirigiendo a LinkedIn...");
                    
                    // Abrir la ventana de compartir de LinkedIn después de una brevísima pausa
                    setTimeout(() => {
                        window.open(linkedinShareLink, '_blank', 'width=600,height=600');
                    }, 500);
                }).catch(() => {
                    // Si falla el portapapeles, igual abrimos la ventana
                    window.open(linkedinShareLink, '_blank', 'width=600,height=600');
                });
            });
        }

        // ==========================================
        // Inyectar Texto Plano en la Vista Ojo de Robot
        // ==========================================
        const plainTextBox = document.getElementById("ats-plain-text-box");
        if (plainTextBox) {
            plainTextBox.textContent = data.text || "(No se pudo extraer texto plano de este archivo)";
        }

        // ==========================================
        // Renderizar Bloque de Compatibilidad (Opcional)
        // ==========================================
        const compatCard = document.getElementById("compatibility-card");
        if (compatCard) {
            if (data.compatibilityData) {
                compatCard.style.display = "flex";
                
                // Animación de número
                const compatScoreNum = document.getElementById("compat-score-num");
                animateNumber(compatScoreNum, 0, data.compatibilityData.score, 1500);
                
                // Animación del anillo de progreso (perímetro con r=58 es 2 * PI * 58 = 364)
                const compatRingFill = document.getElementById("compat-ring-fill");
                const compatDashOffset = 364 - (data.compatibilityData.score / 100) * 364;
                if (compatRingFill) {
                    setTimeout(() => {
                        compatRingFill.style.strokeDashoffset = compatDashOffset;
                        if (data.compatibilityData.score >= 75) {
                            compatRingFill.style.stroke = "#3f625b";
                        } else if (data.compatibilityData.score >= 50) {
                            compatRingFill.style.stroke = "#d98757";
                        } else {
                            compatRingFill.style.stroke = "#b05c48";
                        }
                    }, 100);
                }

                // Resumen del Match
                const compatSummary = document.getElementById("compat-summary-text");
                if (compatSummary) {
                    const score = data.compatibilityData.score;
                    const kwScore = data.compatibilityData.keywordsScore;
                    const reqExp = data.compatibilityData.yearsRequired;
                    const candExp = data.compatibilityData.yearsCandidate;
                    const langMatch = data.compatibilityData.langMatch;
                    const locMatch = data.compatibilityData.locMatch;

                    const expOk = reqExp === null || (candExp !== null && candExp >= reqExp);
                    const langOk = langMatch !== "check";
                    const locOk = locMatch !== "check";
                    const basicsOk = expOk && langOk && locOk;

                    if (score >= 75) {
                        compatSummary.innerHTML = `<strong>¡Excelente compatibilidad (${score}%)!</strong> Tu currículum cumple con los requisitos indispensables de experiencia, idioma y ubicación, y además incorpora las palabras clave técnicas más relevantes del puesto. Esto indica que superará con facilidad el filtro de compatibilidad ATS para este puesto.`;
                    } else if (score >= 45) {
                        if (basicsOk && kwScore < 40) {
                            compatSummary.innerHTML = `<strong>Alineación del ${score}% (Perfil apto pero con brechas de palabras clave).</strong> Cumples con la experiencia, el idioma y la ubicación requeridos (por eso tus tarjetas de la matriz están aprobadas en verde). Sin embargo, el puntaje general no es más alto porque tu CV casi no tiene las <strong>palabras clave específicas</strong> del sector que la vacante exige (tienes un ${kwScore}% de coincidencia en habilidades técnicas). Para que el filtro automático ATS te clasifique primero en la búsqueda del reclutador, te sugerimos incorporar estos términos técnicos clave en la redacción de tu experiencia.`;
                        } else {
                            compatSummary.innerHTML = `<strong>Compatibilidad media del ${score}%.</strong> Tienes una buena base para postularte, pero existen brechas en tu experiencia o en las palabras clave del perfil. Ajustar tu CV sumando las competencias técnicas que te faltan incrementará fuertemente tus probabilidades de ser contactado.`;
                        }
                    } else {
                        compatSummary.innerHTML = `<strong>Compatibilidad inicial del ${score}%.</strong> Tu perfil actual tiene una baja alineación con esta oferta. Esto puede deberse a diferencias en los años de experiencia, el idioma requerido o a que tu currículum no incluye los términos clave que el motor ATS busca para esta vacante. Te recomendamos adaptar el CV enfocando tus logros en las habilidades solicitadas.`;
                    }
                }

                // --- INYECTAR MATRIZ DE CRITERIOS ATS ---
                
                // Criterio 1: Experiencia
                const reqExp = data.compatibilityData.yearsRequired;
                const candExp = data.compatibilityData.yearsCandidate;
                const mExpReq = document.getElementById("matrix-exp-req");
                const mExpCand = document.getElementById("matrix-exp-candidate");
                const mExpBadge = document.getElementById("matrix-exp-badge");
                const mExpCard = document.getElementById("matrix-exp-card");

                if (mExpReq && mExpCand && mExpBadge) {
                    if (reqExp !== null) {
                        mExpReq.textContent = `${reqExp} ${reqExp === 1 ? 'año' : 'años'}`;
                        mExpCand.textContent = candExp !== null ? `${candExp} ${candExp === 1 ? 'año' : 'años'}` : "No detectado";
                        
                        if (candExp !== null) {
                            if (candExp >= reqExp) {
                                mExpBadge.textContent = "Alineado ✓";
                                mExpBadge.style.backgroundColor = "rgba(144, 181, 163, 0.15)";
                                mExpBadge.style.color = "#3f625b";
                                mExpCard.style.borderColor = "rgba(144, 181, 163, 0.35)";
                                mExpCard.style.backgroundColor = "rgba(144, 181, 163, 0.05)";
                                mExpCard.style.boxShadow = "0 6px 16px rgba(63, 98, 91, 0.04)";
                            } else {
                                mExpBadge.textContent = "Brecha ⚠️";
                                mExpBadge.style.backgroundColor = "rgba(217, 135, 87, 0.15)";
                                mExpBadge.style.color = "var(--accent)";
                                mExpCard.style.borderColor = "rgba(217, 135, 87, 0.35)";
                                mExpCard.style.backgroundColor = "rgba(217, 135, 87, 0.05)";
                                mExpCard.style.boxShadow = "0 6px 16px rgba(217, 135, 87, 0.04)";
                            }
                        } else {
                            mExpBadge.textContent = "Revisar";
                            mExpBadge.style.backgroundColor = "rgba(217, 135, 87, 0.1)";
                            mExpBadge.style.color = "var(--accent)";
                            mExpCard.style.borderColor = "rgba(217, 135, 87, 0.2)";
                            mExpCard.style.backgroundColor = "rgba(217, 135, 87, 0.02)";
                        }
                    } else {
                        mExpReq.textContent = "No especificado";
                        mExpCand.textContent = candExp !== null ? `${candExp} ${candExp === 1 ? 'año' : 'años'}` : "No detectado";
                        mExpBadge.textContent = "Neutral";
                        mExpBadge.style.backgroundColor = "rgba(78, 96, 116, 0.08)";
                        mExpBadge.style.color = "var(--text-muted)";
                        mExpCard.style.borderColor = "rgba(78, 96, 116, 0.1)";
                        mExpCard.style.backgroundColor = "rgba(78, 96, 116, 0.01)";
                    }
                }

                // Criterio 2: Idiomas
                const reqLang = data.compatibilityData.langRequired;
                const candLang = data.compatibilityData.langCandidate;
                const langMatch = data.compatibilityData.langMatch;
                const mLangReq = document.getElementById("matrix-lang-req");
                const mLangCand = document.getElementById("matrix-lang-candidate");
                const mLangBadge = document.getElementById("matrix-lang-badge");
                const mLangCard = document.getElementById("matrix-lang-card");

                if (mLangReq && mLangCand && mLangBadge) {
                    mLangReq.textContent = reqLang;
                    mLangCand.textContent = candLang;
                    if (langMatch === "match") {
                        mLangBadge.textContent = "Coincide ✓";
                        mLangBadge.style.backgroundColor = "rgba(144, 181, 163, 0.15)";
                        mLangBadge.style.color = "#3f625b";
                        mLangCard.style.borderColor = "rgba(144, 181, 163, 0.35)";
                        mLangCard.style.backgroundColor = "rgba(144, 181, 163, 0.05)";
                        mLangCard.style.boxShadow = "0 6px 16px rgba(63, 98, 91, 0.04)";
                    } else if (langMatch === "check") {
                        mLangBadge.textContent = "Faltante ✗";
                        mLangBadge.style.backgroundColor = "rgba(217, 135, 87, 0.15)";
                        mLangBadge.style.color = "var(--accent)";
                        mLangCard.style.borderColor = "rgba(217, 135, 87, 0.35)";
                        mLangCard.style.backgroundColor = "rgba(217, 135, 87, 0.05)";
                        mLangCard.style.boxShadow = "0 6px 16px rgba(217, 135, 87, 0.04)";
                    } else {
                        mLangBadge.textContent = "Neutral";
                        mLangBadge.style.backgroundColor = "rgba(78, 96, 116, 0.08)";
                        mLangBadge.style.color = "var(--text-muted)";
                        mLangCard.style.borderColor = "rgba(78, 96, 116, 0.1)";
                        mLangCard.style.backgroundColor = "rgba(78, 96, 116, 0.01)";
                    }
                }

                // Criterio 3: Ubicación / Modalidad
                const reqLoc = data.compatibilityData.locRequired;
                const candLoc = data.compatibilityData.locCandidate;
                const locMatch = data.compatibilityData.locMatch;
                const mLocReq = document.getElementById("matrix-loc-req");
                const mLocCand = document.getElementById("matrix-loc-candidate");
                const mLocBadge = document.getElementById("matrix-loc-badge");
                const mLocCard = document.getElementById("matrix-loc-card");

                if (mLocReq && mLocCand && mLocBadge) {
                    mLocReq.textContent = reqLoc;
                    mLocCand.textContent = candLoc;
                    if (locMatch === "match") {
                        mLocBadge.textContent = "Compatible ✓";
                        mLocBadge.style.backgroundColor = "rgba(144, 181, 163, 0.15)";
                        mLocBadge.style.color = "#3f625b";
                        mLocCard.style.borderColor = "rgba(144, 181, 163, 0.35)";
                        mLocCard.style.backgroundColor = "rgba(144, 181, 163, 0.05)";
                        mLocCard.style.boxShadow = "0 6px 16px rgba(63, 98, 91, 0.04)";
                    } else if (locMatch === "check") {
                        mLocBadge.textContent = "Diferente";
                        mLocBadge.style.backgroundColor = "rgba(217, 135, 87, 0.15)";
                        mLocBadge.style.color = "var(--accent)";
                        mLocCard.style.borderColor = "rgba(217, 135, 87, 0.35)";
                        mLocCard.style.backgroundColor = "rgba(217, 135, 87, 0.05)";
                        mLocCard.style.boxShadow = "0 6px 16px rgba(217, 135, 87, 0.04)";
                    } else {
                        mLocBadge.textContent = "Neutral";
                        mLocBadge.style.backgroundColor = "rgba(78, 96, 116, 0.08)";
                        mLocBadge.style.color = "var(--text-muted)";
                        mLocCard.style.borderColor = "rgba(78, 96, 116, 0.1)";
                        mLocCard.style.backgroundColor = "rgba(78, 96, 116, 0.01)";
                    }
                }

                // Criterio 4: Habilidades
                const mSkillsCand = document.getElementById("matrix-skills-candidate");
                const mSkillsBadge = document.getElementById("matrix-skills-badge");
                const mSkillsCard = document.getElementById("matrix-skills-card");
                if (mSkillsCand && mSkillsBadge) {
                    const kwScore = data.compatibilityData.keywordsScore;
                    mSkillsCand.textContent = `${kwScore}% coincidencia`;
                    if (kwScore >= 75) {
                        mSkillsBadge.textContent = "Alta ✓";
                        mSkillsBadge.style.backgroundColor = "rgba(144, 181, 163, 0.15)";
                        mSkillsBadge.style.color = "#3f625b";
                        mSkillsCard.style.borderColor = "rgba(144, 181, 163, 0.35)";
                        mSkillsCard.style.backgroundColor = "rgba(144, 181, 163, 0.05)";
                        mSkillsCard.style.boxShadow = "0 6px 16px rgba(63, 98, 91, 0.04)";
                    } else if (kwScore >= 50) {
                        mSkillsBadge.textContent = "Media";
                        mSkillsBadge.style.backgroundColor = "rgba(217, 135, 87, 0.1)";
                        mSkillsBadge.style.color = "var(--accent)";
                        mSkillsCard.style.borderColor = "rgba(217, 135, 87, 0.25)";
                        mSkillsCard.style.backgroundColor = "rgba(217, 135, 87, 0.03)";
                        mSkillsCard.style.boxShadow = "0 6px 16px rgba(217, 135, 87, 0.02)";
                    } else {
                        mSkillsBadge.textContent = "Baja";
                        mSkillsBadge.style.backgroundColor = "rgba(217, 135, 87, 0.15)";
                        mSkillsBadge.style.color = "var(--accent)";
                        mSkillsCard.style.borderColor = "rgba(217, 135, 87, 0.35)";
                        mSkillsCard.style.backgroundColor = "rgba(217, 135, 87, 0.05)";
                        mSkillsCard.style.boxShadow = "0 6px 16px rgba(217, 135, 87, 0.04)";
                    }
                }

                // Listar palabras encontradas y faltantes
                const matchedList = document.getElementById("compat-matched-list");
                const missingList = document.getElementById("compat-missing-list");
                
                if (matchedList) {
                    matchedList.innerHTML = data.compatibilityData.matched.length > 0 
                        ? data.compatibilityData.matched.map(kw => `<span style="background-color: rgba(144, 181, 163, 0.12); color: var(--primary); padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; text-transform: capitalize;">${kw}</span>`).join("")
                        : '<span style="font-size: 0.78rem; color: var(--text-muted); font-style: italic;">Ninguna coincidencia</span>';
                }
                
                if (missingList) {
                    missingList.innerHTML = data.compatibilityData.missing.length > 0
                        ? data.compatibilityData.missing.map(kw => `<span style="background-color: rgba(217, 135, 87, 0.12); color: var(--accent); padding: 4px 10px; border-radius: 6px; font-size: 0.72rem; text-transform: capitalize;">${kw}</span>`).join("")
                        : '<span style="font-size: 0.78rem; color: var(--primary); font-weight: 600;">¡Ninguna faltante!</span>';
                }

                // Renderizar alineación de experiencia y trayectoria (HR Seniority Analysis)
                const expBlock = document.getElementById("compat-experience-block");
                const expText = document.getElementById("compat-experience-text");
                if (expBlock && expText) {
                    const req = data.compatibilityData.yearsRequired;
                    const cand = data.compatibilityData.yearsCandidate;
                    
                    if (req !== null) {
                        expBlock.style.display = "block";
                        if (cand !== null) {
                            if (cand >= req) {
                                expText.innerHTML = `<span style="color: #3f625b; font-weight: 700;"><i class="fa-solid fa-circle-check"></i> Trayectoria Alineada:</span> La oferta solicita <strong>${req} años</strong> de experiencia y estimamos que posees aproximadamente <strong>${cand} años</strong> en tu trayectoria. ¡Cumples con el criterio de experiencia del reclutador!`;
                            } else {
                                expText.innerHTML = `<span style="color: var(--accent); font-weight: 700;"><i class="fa-solid fa-triangle-exclamation"></i> Brecha de Experiencia:</span> La vacante solicita <strong>${req} años</strong> de experiencia, mientras que en tu currículum estimamos alrededor de <strong>${cand} años</strong>. En entrevistas, enfócate en destacar tus logros y competencias transferibles para compensar esta diferencia.`;
                            }
                        } else {
                            expText.innerHTML = `<span style="color: var(--primary); font-weight: 700;"><i class="fa-solid fa-circle-info"></i> Información del Puesto:</span> El puesto solicita <strong>${req} años</strong> de experiencia. Asegúrate de estructurar claramente tus periodos de empleo en el CV para evidenciar tu trayectoria.`;
                        }
                    } else {
                        expBlock.style.display = "none";
                    }
                }

                // Renderizar sugerencia de idioma (Language Alignment Advice)
                const langAdviceBlock = document.getElementById("compat-lang-advice-block");
                const langAdviceText = document.getElementById("compat-lang-advice-text");
                if (langAdviceBlock && langAdviceText) {
                    const advice = data.compatibilityData.langAdvice;
                    if (advice) {
                        langAdviceBlock.style.display = "block";
                        langAdviceText.innerHTML = advice.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
                    } else {
                        langAdviceBlock.style.display = "none";
                    }
                }
            } else {
                compatCard.style.display = "none";
            }
        }

        // Animación de número de Score Principal
        const scoreNum = document.getElementById("result-score-num");
        animateNumber(scoreNum, 0, score, 1500);

        // Animación del Anillo Circular de Progreso
        const ringFill = document.getElementById("score-ring-fill");
        // El perímetro del círculo con r=78 es 2 * PI * 78 = 490
        const dashOffset = 490 - (score / 100) * 490;
        setTimeout(() => {
            ringFill.style.strokeDashoffset = dashOffset;
            // Cambiar color del anillo según puntaje
            if (score >= 80) {
                ringFill.style.stroke = "#3f625b"; // Verde oscuro premium
            } else if (score >= 60) {
                ringFill.style.stroke = "#d98757"; // Terracota / Naranja
            } else {
                ringFill.style.stroke = "#b05c48"; // Rojo apagado
            }
        }, 100);

        // Estado del Badge
        const scoreBadge = document.getElementById("result-score-badge");
        const summaryText = document.getElementById("result-summary-text");
        
        if (score >= 80) {
            scoreBadge.textContent = "Optimizado (Excelente)";
            scoreBadge.style.backgroundColor = "#3f625b";
            summaryText.textContent = "¡Excelente trabajo! Tu currículum cuenta con un nivel técnico excepcional. Está muy bien estructurado para superar los filtros ATS y posee una redacción dinámica orientada a resultados concretos. Con algunos pequeños ajustes finos estará completamente perfecto para postularte.";
        } else if (score >= 60) {
            scoreBadge.textContent = "Intermedio (Apto)";
            scoreBadge.style.backgroundColor = "#d98757";
            summaryText.textContent = "Tu currículum tiene una base aceptable y contiene la información esencial. Sin embargo, cuenta con debilidades en la estructuración de secciones para sistemas ATS y su redacción es mayormente pasiva. Te recomendamos incorporar más logros cuantitativos y remover elementos gráficos innecesarios para hacerlo destacar.";
        } else {
            scoreBadge.textContent = "Crítico (Requiere Ajustes)";
            scoreBadge.style.backgroundColor = "#b05c48";
            summaryText.textContent = "Atención: Tu currículum cuenta con filtros de legibilidad deficientes que podrían provocar que sea descartado de manera automática por sistemas ATS. Le faltan secciones clave, carece de verbos de acción fuertes y la presentación visual incluye elementos gráficos complejos que bloquean la extracción del texto.";
        }

        // Actualizar barras de dimensiones individuales
        updateDimensionUI("ats", ats);
        updateDimensionUI("impact", impact);
        updateDimensionUI("skills", skills);
        updateDimensionUI("design", design);

        // ==========================================
        // 6. Construcción de Listas de Fortalezas & Advertencias
        // ==========================================
        const strengthsList = document.getElementById("strengths-list");
        const warningsList = document.getElementById("warnings-list");
        const actionChecklist = document.getElementById("action-checklist");

        strengthsList.innerHTML = "";
        warningsList.innerHTML = "";
        actionChecklist.innerHTML = "";

        let strengths = [];
        let warnings = [];
        let actionItems = [];

        // Evaluaciones de estructura
        if (data.sectionsFound.profile && data.sectionsFound.experience && data.sectionsFound.education && data.sectionsFound.skills) {
            strengths.push("Estructura de secciones completa y estándar.");
        } else {
            let missing = [];
            if (!data.sectionsFound.profile) missing.push("Perfil Profesional");
            if (!data.sectionsFound.experience) missing.push("Experiencia Laboral");
            if (!data.sectionsFound.education) missing.push("Formación Académica");
            if (!data.sectionsFound.skills) missing.push("Habilidades");
            
            warnings.push(`Faltan secciones estándar del mercado o no se leen bien. Secciones comprometidas: ${missing.join(", ")}.`);
            actionItems.push("Renombra los títulos de tus secciones usando términos estándar: 'Experiencia Profesional', 'Educación / Formación', 'Habilidades' y 'Perfil Profesional'.");
        }

        // Evaluaciones de Contactos
        if (data.hasLinkedIn) {
            strengths.push("Enlace a perfil de LinkedIn detectado en los encabezados.");
        } else {
            warnings.push("No se encontró el enlace de tu perfil de LinkedIn, vital para reclutamiento digital.");
            actionItems.push("Agrega el enlace directo a tu perfil de LinkedIn optimizado en la cabecera de datos de contacto.");
        }

        if (data.hasEmail && data.hasPhone) {
            strengths.push("Datos de contacto directos (Email y Teléfono) completos.");
        } else {
            if (!data.hasEmail) {
                warnings.push("No se detectó dirección de correo electrónico en la cabecera.");
                actionItems.push("Incorpora un correo electrónico profesional legible en la zona superior.");
            }
            if (!data.hasPhone) {
                warnings.push("No se detectó número telefónico de contacto directo.");
                actionItems.push("Agrega tu número telefónico incluyendo código de área internacional.");
            }
        }

        // Longitud del documento
        if (data.pages <= 2 && data.pages > 0) {
            strengths.push(`Extensión ideal del documento (${data.pages} página${data.pages > 1 ? 's' : ''}).`);
        } else if (data.pages > 2) {
            warnings.push(`El currículum es muy extenso (${data.pages} páginas). Los reclutadores dedican un promedio de 6 segundos al primer filtro.`);
            actionItems.push(`Sintetiza la información de tu experiencia antigua para reducir la extensión de tu CV a un máximo de 2 páginas.`);
        }

        // Verbos de acción e Impacto
        if (data.totalVerbsCount >= 6) {
            strengths.push(`Uso dinámico de lenguaje laboral (${data.totalVerbsCount} verbos de acción fuertes detectados).`);
        } else {
            warnings.push("El lenguaje descriptivo es mayormente pasivo o basado únicamente en tareas operativas.");
            actionItems.push("Reescribe las descripciones de tus funciones comenzando cada punto con un verbo de acción fuerte en primera persona (ej: 'Coordiné', 'Lideré', 'Optimicé').");
        }

        // Métricas / Resultados
        if (data.metricsCount >= 2) {
            strengths.push("Incluyes logros cuantificables y métricas de rendimiento en tus roles pasados.");
        } else {
            warnings.push("Tu CV carece de logros cuantificados. Las tareas descriptivas sin métricas no evidencian tu impacto.");
            actionItems.push("Cuantifica al menos 3 de tus logros clave utilizando porcentajes, números absolutos o ahorros de tiempo/dinero.");
        }

        // Clichés
        if (data.foundCliches.length > 0) {
            warnings.push(`Utilizas clichés de relleno que restan objetividad: "${data.foundCliches.slice(0, 3).join(", ")}".`);
            actionItems.push(`Elimina los clichés genéricos como "${data.foundCliches[0]}" y demuestra tu valor con hechos prácticos.`);
        } else {
            strengths.push("Excelente redacción descriptiva sin clichés genéricos de relleno.");
        }

        // Preguntas complementarias (Foto y Barras/Diseño)
        if (data.qPhoto === "yes") {
            warnings.push("La fotografía puede generar sesgos en ciertos mercados internacionales. Si buscas trabajo en USA/UK, remueve la foto obligatoriamente.");
            actionItems.push("Verifica que tu fotografía sea profesional, con fondo neutro, buena iluminación y expresión amigable.");
        } else {
            strengths.push("Diseño sobrio y moderno sin fotografía, ideal para ATS globales.");
        }

        if (data.qDesign === "yes") {
            warnings.push("Las barras de nivel (ej: 80% Inglés) y tablas con celdas complejas rompen el orden de lectura de los robots de selección (ATS).");
            actionItems.push("Sustituye los gráficos de porcentaje de habilidades por descripciones de texto clásicas (ej: 'Inglés: Avanzado (C1)').");
        } else {
            strengths.push("Formato plano y limpio, altamente compatible con sistemas ATS.");
        }

        // Inyectar en el HTML de Fortalezas y Críticos
        strengths.forEach(str => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.gap = "10px";
            li.style.alignItems = "flex-start";
            li.style.fontSize = "0.85rem";
            li.style.lineHeight = "1.5";
            li.style.color = "var(--text-main)";
            li.innerHTML = `<i class="fa-solid fa-circle-check" style="color: #3f625b; margin-top: 3px; font-size: 0.95rem;"></i> <span>${str}</span>`;
            strengthsList.appendChild(li);
        });

        warnings.forEach(warn => {
            const li = document.createElement("li");
            li.style.display = "flex";
            li.style.gap = "10px";
            li.style.alignItems = "flex-start";
            li.style.fontSize = "0.85rem";
            li.style.lineHeight = "1.5";
            li.style.color = "var(--text-main)";
            li.innerHTML = `<i class="fa-solid fa-triangle-exclamation" style="color: var(--accent); margin-top: 3px; font-size: 0.95rem;"></i> <span>${warn}</span>`;
            warningsList.appendChild(li);
        });

        // Inyectar en Checklist del Plan de Acción
        if (actionItems.length === 0) {
            const li = document.createElement("li");
            li.style.textAlign = "center";
            li.style.color = "var(--text-muted)";
            li.style.fontSize = "0.9rem";
            li.innerHTML = "🎉 ¡Felicidades! Tu plan de acción está vacío. Tu CV cumple con todas las heurísticas de optimización.";
            actionChecklist.appendChild(li);
        } else {
            actionItems.forEach((act, idx) => {
                const li = document.createElement("li");
                li.style.display = "flex";
                li.style.gap = "12px";
                li.style.alignItems = "flex-start";
                li.style.padding = "12px 15px";
                li.style.backgroundColor = "rgba(144, 181, 163, 0.04)";
                li.style.border = "1px solid rgba(144, 181, 163, 0.1)";
                li.style.borderRadius = "8px";
                li.style.fontSize = "0.85rem";
                li.style.color = "var(--text-main)";
                li.style.lineHeight = "1.5";
                li.innerHTML = `
                    <input type="checkbox" id="act-chk-${idx}" style="accent-color: var(--accent); width: 16px; height: 16px; margin-top: 2px; cursor: pointer;">
                    <label for="act-chk-${idx}" style="cursor: pointer; font-weight: 500;">${act}</label>
                `;
                
                // Tachar al marcar checkbox
                const checkbox = li.querySelector('input[type="checkbox"]');
                const label = li.querySelector('label');
                checkbox.addEventListener('change', () => {
                    if (checkbox.checked) {
                        label.style.textDecoration = 'line-through';
                        label.style.color = 'var(--text-muted)';
                        li.style.backgroundColor = 'rgba(78, 96, 116, 0.03)';
                    } else {
                        label.style.textDecoration = 'none';
                        label.style.color = 'var(--text-main)';
                        li.style.backgroundColor = 'rgba(144, 181, 163, 0.04)';
                    }
                });

                actionChecklist.appendChild(li);
            });
        }
    };

    const updateDimensionUI = (id, score) => {
        const scoreText = document.getElementById(`dim-${id}-score`);
        const ringFill = document.getElementById(`dim-${id}-ring`);

        if (scoreText) scoreText.textContent = `${score}%`;
        if (ringFill) {
            // Perímetro con r=28 es 2 * PI * 28 = 176
            const dashOffset = 176 - (score / 100) * 176;
            setTimeout(() => {
                ringFill.style.strokeDashoffset = dashOffset;
                // Cambiar color del anillo según puntaje
                if (score >= 80) {
                    ringFill.style.stroke = "#3f625b"; // Verde oscuro premium
                } else if (score >= 60) {
                    ringFill.style.stroke = "#d98757"; // Terracota / Naranja
                } else {
                    ringFill.style.stroke = "#b05c48"; // Rojo
                }
            }, 150);
        }
    };

    // Animación de conteo numérico progresivo
    const animateNumber = (element, start, end, duration) => {
        if (!element) return;
        let startTimestamp = null;
        const step = (timestamp) => {
            if (!startTimestamp) startTimestamp = timestamp;
            const progress = Math.min((timestamp - startTimestamp) / duration, 1);
            element.textContent = Math.floor(progress * (end - start) + start);
            if (progress < 1) {
                window.requestAnimationFrame(step);
            }
        };
        window.requestAnimationFrame(step);
    };

    // ==========================================
    // 7. Navegación de Pestañas del Reporte
    // ==========================================
    const tabBtns = document.querySelectorAll(".tab-btn");
    const tabContents = document.querySelectorAll(".tab-content");

    tabBtns.forEach(btn => {
        btn.addEventListener("click", () => {
            const targetTab = btn.getAttribute("data-tab");

            // Desactivar todas las pestañas
            tabBtns.forEach(b => {
                b.classList.remove("active");
                b.style.color = "var(--text-muted)";
                b.style.borderBottomColor = "transparent";
            });

            tabContents.forEach(c => c.style.display = "none");

            // Activar seleccionada
            btn.classList.add("active");
            btn.style.color = "var(--primary)";
            btn.style.borderBottomColor = "var(--accent)";

            const activeContent = document.getElementById(targetTab);
            if (activeContent) {
                activeContent.style.display = "block";
            }
        });
    });

    // 8. Manejo del selector de sectores para Fórmula de Redacción de Logros
    // ==========================================
    const sectorSelect = document.getElementById("sector-select");
    const formulaBefore = document.getElementById("formula-before-text");
    const formulaAfter = document.getElementById("formula-after-text");

    const sectorExamples = {
        hr: {
            before: '"Coordinación de procesos de reclutamiento y selección."',
            after: '"Gestioné el ciclo completo de selección para perfiles tácticos y mandos medios, optimizando las etapas de entrevista y logrando reducir el tiempo medio de contratación en un 20%."'
        },
        admin: {
            before: '"Carga de facturas y conciliación de cuentas bancarias."',
            after: '"Gestioné y concilié cuentas bancarias de más de 40 proveedores clave, logrando digitalizar el proceso de facturación y reduciendo los tiempos de cierre mensual en un 25%."'
        },
        sales: {
            before: '"Atención al cliente y venta de productos en tienda."',
            after: '"Lideré la atención al cliente en el sector de ventas corporativas, superando los objetivos mensuales en un 15% promedio durante el último año."'
        },
        tech: {
            before: '"Mantenimiento de bases de datos y soporte técnico."',
            after: '"Optimicé el rendimiento de la base de datos principal mediante la reestructuración de consultas SQL, aumentando la velocidad de respuesta del sistema en un 30%."'
        },
        mkt: {
            before: '"Creación de contenido para redes sociales y redacción."',
            after: '"Diseñé y coordiné la estrategia de contenidos para Instagram y LinkedIn, logrando incrementar el alcance orgánico en un 40% y atrayendo más de 50 leads semanales."'
        }
    };

    if (sectorSelect && formulaBefore && formulaAfter) {
        sectorSelect.addEventListener("change", (e) => {
            const val = e.target.value;
            if (sectorExamples[val]) {
                formulaBefore.textContent = sectorExamples[val].before;
                formulaAfter.textContent = sectorExamples[val].after;
            }
        });
    }

});

