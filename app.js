/* ==========================================================================
   Flor Capeletto - Lógica de Interactividad, Leads y Turnos Lunes
   ========================================================================== */

document.addEventListener("DOMContentLoaded", () => {
    
    // ==========================================
    // 0. Configuración de Supabase (Base de Datos en la Nube)
    // ==========================================
    const SUPABASE_URL = "https://ihpmpobduoprtgxmdpwo.supabase.co";
    const SUPABASE_KEY = "sb_publishable_cniZ40P2W8Is7YGlml6ovA_KUotiOfh";
    let supabaseClient = null;

    try {
        if (typeof supabase !== 'undefined' && SUPABASE_URL && SUPABASE_KEY) {
            supabaseClient = supabase.createClient(SUPABASE_URL, SUPABASE_KEY);
            console.log("🚀 Conexión con Supabase inicializada con éxito.");
        } else {
            console.warn("⚠️ Supabase no configurado o no cargado. Usando almacenamiento local (localStorage) como fallback.");
        }
    } catch (err) {
        console.error("❌ Error al inicializar Supabase:", err);
    }

    // ==========================================
    // 0.1. Sistema de Analíticas y Tracking Privado
    // ==========================================
    let visitorId = localStorage.getItem("flor_visitor_id");
    if (!visitorId) {
        visitorId = "visitor_" + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
        localStorage.setItem("flor_visitor_id", visitorId);
    }

    const logEvent = async (eventType, eventName) => {
        if (supabaseClient) {
            try {
                await supabaseClient
                    .from('analytics_events')
                    .insert([
                        {
                            event_type: eventType,
                            event_name: eventName,
                            visitor_id: visitorId,
                            referrer: document.referrer || null
                        }
                    ]);
            } catch (err) {
                console.error("Error logging event:", err);
            }
        }
    };

    // Registrar visita a la Home
    logEvent("page_view", "home_view");

    // ==========================================
    // 0.2. Detección de Región y Moneda
    // ==========================================
    let userCurrency = "USD";

    const detectUserCurrency = async () => {
        const savedCurrency = localStorage.getItem("user-currency");
        if (savedCurrency && ["ARS", "USD", "EUR"].includes(savedCurrency)) {
            userCurrency = savedCurrency;
            return;
        }

        try {
            const tz = Intl.DateTimeFormat().resolvedOptions().timeZone;
            if (tz) {
                if (tz.includes("Argentina") || tz === "America/Buenos_Aires") {
                    userCurrency = "ARS";
                } else if (tz.startsWith("Europe/")) {
                    userCurrency = "EUR";
                } else {
                    userCurrency = "USD";
                }
            }
        } catch (e) {
            console.warn("Timezone detection failed:", e);
        }

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 2000);

        try {
            const response = await fetch("https://freeipapi.com/api/json", { signal: controller.signal });
            clearTimeout(timeoutId);
            
            if (response.ok) {
                const data = await response.json();
                const countryCode = data.countryCode;
                
                if (countryCode === "AR") {
                    userCurrency = "ARS";
                } else {
                    const euCountries = [
                        "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", 
                        "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU", "MT", "NL", 
                        "PL", "PT", "RO", "SK", "SI", "ES", "SE"
                    ];
                    if (euCountries.includes(countryCode)) {
                        userCurrency = "EUR";
                    } else {
                        userCurrency = "USD";
                    }
                }
            }
        } catch (err) {
            console.log("IP Geolocation failed/timeout, keeping fallback:", userCurrency);
        }
    };

    detectUserCurrency();

    // Registro de clics delegados (para evitar re-enlazar listeners individuales)
    document.addEventListener("click", (e) => {
        // 1. Clic en compra de Guía de LinkedIn (Hotmart)
        const buyBtn = e.target.closest("#btn-linkedin-comprar");
        if (buyBtn) {
            logEvent("click", "click_linkedin_buy");
            return;
        }

        // 2. Clic en el botón para duplicar Tracker en Notion (desde el modal de éxito)
        const trackerBtn = e.target.closest('a[href*="notion.site"]');
        if (trackerBtn) {
            logEvent("click", "click_notion_tracker_duplicate");
            return;
        }

        // 3. Clic en abrir modal de Tracker de Notion
        const openTrackerModalBtn = e.target.closest('.open-modal-btn[data-resource="tracker"]');
        if (openTrackerModalBtn) {
            logEvent("click", "click_notion_tracker_open");
            return;
        }

        // 4. Clic en reservar sesión de diagnóstico gratuita
        const bookingBtn = e.target.closest("#open-booking-card-btn") || e.target.closest(".open-booking-btn");
        if (bookingBtn) {
            logEvent("click", "click_diagnostic_zoom");
            return;
        }

        // 5. Clic en consultar disponibilidad de Consultoría Táctica
        const tacticalBtn = e.target.closest(".open-tactical-session-btn");
        if (tacticalBtn) {
            logEvent("click", "click_tactical_consult");
            return;
        }

        // 6. Clic en WhatsApp Directo
        const whatsappBtn = e.target.closest('a[href*="wa.me"], a[href*="api.whatsapp.com"]');
        if (whatsappBtn) {
            logEvent("click", "click_whatsapp");
            return;
        }

        // 7. Redes sociales
        const socialLink = e.target.closest('a[href*="instagram.com"], a[href*="linkedin.com/in"]');
        if (socialLink) {
            let socialName = "click_other_social";
            if (socialLink.href.includes("instagram.com")) socialName = "click_instagram";
            if (socialLink.href.includes("linkedin.com")) socialName = "click_linkedin_profile";
            logEvent("click", socialName);
            return;
        }
    });

    // Enlace permanente de Google Meet para sesiones de diagnóstico
    const PERMANENT_MEET_LINK = "https://meet.google.com/wki-npgi-cyn";

    // ==========================================
    // 1. Navegación Fija y Efecto Scroll (Sticky Navbar)
    // ==========================================
    const navbar = document.getElementById("navbar");
    
    window.addEventListener("scroll", () => {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // ==========================================
    // 2. Menú de Navegación Responsivo (Móvil)
    // ==========================================
    const mobileMenuBtn = document.getElementById("mobile-menu-btn");
    const navMenu = document.getElementById("nav-menu");
    const navItems = document.querySelectorAll(".nav-item, .nav-btn");

    mobileMenuBtn.addEventListener("click", () => {
        mobileMenuBtn.classList.toggle("active");
        navMenu.classList.toggle("active");
    });

    // Cerrar menú al hacer clic en un enlace
    navItems.forEach(item => {
        item.addEventListener("click", () => {
            mobileMenuBtn.classList.remove("active");
            navMenu.classList.remove("active");
        });
    });



    // ==========================================
    // 4. Sistema de Captura de Leads (Modales)
    // ==========================================
    const leadModal = document.getElementById("lead-modal");
    const modalCloseBtn = document.getElementById("modal-close-btn");
    const openModalButtons = document.querySelectorAll(".open-modal-btn");
    
    const leadForm = document.getElementById("lead-form");
    const modalSuccessState = document.getElementById("modal-success-state");
    const modalTitle = document.getElementById("modal-title");
    const modalSubtitle = document.getElementById("modal-subtitle");
    const requestedResourceInput = document.getElementById("requested-resource");
    const modalDownloadLink = document.getElementById("modal-download-link");
    const modalBadgeIcon = document.getElementById("modal-badge-icon");

    // URLs de entrega de los regalos
    const RESOURCE_DELIVERY = {
        tracker: {
            title: "Tracker de Postulaciones",
            subtitle: "Ingresa tu correo para recibir el enlace exclusivo de duplicación en tu Notion.",
            icon: "fa-solid fa-clipboard-list",
            successMsg: "¡Registro exitoso! Ya puedes duplicar la plantilla en tu Notion e iniciar tu organización hoy.",
            link: "https://tough-ball-6b4.notion.site/Tracker-de-postulaciones-CV-Carta-de-Presentaci-n-c7715a00061a821394b481a5a5e41f21?pvs=74",
            btnText: "Duplicar Plantilla en Notion"
        },
        linkedin: {
            title: "Guía de LinkedIn 2026",
            subtitle: "Ingresa tus datos y descarga el eBook de 80 páginas en formato PDF.",
            icon: "fa-solid fa-book-open-reader",
            successMsg: "¡Registro exitoso! Haz clic en el botón de abajo para iniciar la descarga del PDF de tu Guía estratégica.",
            link: "assets/guia-linkedin-2026-flor-capeletto.pdf",
            btnText: "Descargar Guía en PDF"
        },
        talleres: {
            title: "Lista de Espera: Talleres Autogestionados",
            subtitle: "Ingresa tus datos para sumarte a la lista de espera y recibir una notificación exclusiva y un descuento el día del lanzamiento.",
            icon: "fa-solid fa-photo-film",
            successMsg: "¡Ya te has registrado en la lista de espera! Te enviaremos una notificación especial y un cupón de descuento en cuanto abramos las inscripciones.",
            link: "#",
            btnText: "Entendido"
        }
    };

    let closeLeadModal = () => {};

    if (leadModal && leadForm && modalCloseBtn && modalSuccessState) {
        // Abrir Modal de Leads
        openModalButtons.forEach(button => {
            button.addEventListener("click", () => {
                const resourceKey = button.getAttribute("data-resource");
                const config = RESOURCE_DELIVERY[resourceKey];
                
                if (config) {
                    // Resetear estado del formulario
                    leadForm.style.display = "flex";
                    modalSuccessState.style.display = "none";
                    leadForm.reset();

                    // Cargar contenidos del recurso seleccionado
                    if (modalTitle) modalTitle.innerText = config.title;
                    if (modalSubtitle) modalSubtitle.innerText = config.subtitle;
                    if (requestedResourceInput) requestedResourceInput.value = resourceKey;
                    
                    // Cambiar icono del badge
                    if (modalBadgeIcon) modalBadgeIcon.innerHTML = `<i class="${config.icon}"></i>`;
                    
                    // Abrir modal con efecto
                    leadModal.classList.add("active");
                    document.body.style.overflow = "hidden"; // Evitar scroll del fondo
                }
            });
        });

        // Cerrar Modal Leads
        closeLeadModal = () => {
            leadModal.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        };

        modalCloseBtn.addEventListener("click", closeLeadModal);
        
        leadModal.addEventListener("click", (e) => {
            if (e.target === leadModal) {
                closeLeadModal();
            }
        });

        // Procesar Formulario de Leads (Captura)
        leadForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const nameEl = document.getElementById("lead-name");
            const emailEl = document.getElementById("lead-email");
            if (!nameEl || !emailEl) return;

            const name = nameEl.value.trim();
            const email = emailEl.value.trim();
            const resourceKey = requestedResourceInput ? requestedResourceInput.value : "";
            const config = RESOURCE_DELIVERY[resourceKey];

            if (!name || !email || !config) return;

            // Guardar localmente y enviar a Make/Supabase
            saveLead(name, email, config.title, config.link);

            // Configurar el enlace de descarga exitoso
            if (modalDownloadLink) {
                modalDownloadLink.href = config.link;
                if (resourceKey === "talleres") {
                    modalDownloadLink.innerHTML = `${config.btnText} <i class="fa-solid fa-circle-check"></i>`;
                } else {
                    modalDownloadLink.innerHTML = `${config.btnText} <i class="fa-solid fa-circle-arrow-down"></i>`;
                }
                
                // Configurar descarga nativa para el PDF y enlace para Notion
                if (resourceKey === "linkedin") {
                    modalDownloadLink.setAttribute("download", "Guia_LinkedIn_2026_FlorCapeletto.pdf");
                } else {
                    modalDownloadLink.removeAttribute("download");
                }
                
                // Agregar manejador de clic explícito para asegurar compatibilidad en cualquier navegador
                modalDownloadLink.onclick = (event) => {
                    if (resourceKey === "talleres") {
                        event.preventDefault();
                        closeLeadModal();
                        return;
                    }
                    if (resourceKey === "linkedin") {
                        // Permitir que el navegador ejecute la descarga nativa con el atributo 'download'
                        return;
                    }
                    // Para Notion, abrir explícitamente en pestaña nueva
                    event.preventDefault();
                    window.open(config.link, '_blank');
                };
            }
            
            const successMsgEl = document.getElementById("success-message");
            if (successMsgEl) successMsgEl.innerText = config.successMsg;

            // Ocultar formulario y mostrar pantalla de éxito
            leadForm.style.display = "none";
            modalSuccessState.style.display = "flex";
        });
    }

    // Manejo de botones de conversión dentro de la pantalla de éxito del modal de leads
    const modalSuccessBookingBtn = document.getElementById("modal-success-booking-btn");
    const modalSuccessTacticalBtn = document.getElementById("modal-success-tactical-btn");

    if (modalSuccessBookingBtn) {
        modalSuccessBookingBtn.addEventListener("click", () => {
            closeLeadModal(); // Cerrar el modal actual de lead
            setTimeout(() => {
                // Abrir el modal de reserva (Calendly)
                if (typeof bookingModal !== "undefined" && bookingModal) {
                    bookingModal.classList.add("active");
                    document.body.style.overflow = "hidden";
                }
            }, 350); // Pequeño delay para que la transición visual sea suave
        });
    }

    if (modalSuccessTacticalBtn) {
        modalSuccessTacticalBtn.addEventListener("click", () => {
            closeLeadModal(); // Cerrar modal actual
            setTimeout(() => {
                // Hacer scroll suave hacia la sección de contacto
                const contactSection = document.getElementById("contacto");
                if (contactSection) {
                    contactSection.scrollIntoView({ behavior: "smooth" });
                    
                    // Auto-seleccionar "Optimización de CV / LinkedIn / Entrevistas"
                    const hiddenSubjectInput = document.getElementById("form-subject");
                    const selectTrigger = document.getElementById("select-trigger-subject");
                    const customOptions = document.querySelectorAll(".custom-option");
                    
                    if (hiddenSubjectInput && selectTrigger) {
                        hiddenSubjectInput.value = "corporativo";
                        const triggerTextEl = selectTrigger.querySelector(".custom-select-trigger-text");
                        if (triggerTextEl) triggerTextEl.innerText = "Optimización de CV / LinkedIn / Entrevistas";
                        selectTrigger.classList.add("has-value");
                        selectTrigger.classList.remove("invalid");
                        
                        customOptions.forEach(opt => {
                            if (opt.getAttribute("data-value") === "corporativo") {
                                opt.classList.add("selected");
                            } else {
                                opt.classList.remove("selected");
                            }
                        });
                    }
                    
                    // Pre-rellenar el mensaje del formulario con el cupón
                    const formMessage = document.getElementById("form-message");
                    if (formMessage) {
                        formMessage.value = "Hola Flor, acabo de descargar tu recurso y me interesa agendar una Sesión Táctica de Empleo (CV & LinkedIn Boost / Simulacro) aprovechando el cupón de bienvenida BIENVENIDA15. ¡Hablemos!";
                        formMessage.focus();
                    }
                }
            }, 400); // Delay para esperar a que el modal se cierre
        });
    }

    const saveLead = async (name, email, resourceTitle, downloadLink = "") => {
        let leads = JSON.parse(localStorage.getItem("leads_database")) || [];
        const dateStr = new Date().toLocaleDateString("es-ES") + " " + new Date().toLocaleTimeString("es-ES", {hour: '2-digit', minute:'2-digit'});
        leads.push({
            date: dateStr,
            name: name,
            email: email,
            resource: resourceTitle
        });
        localStorage.setItem("leads_database", JSON.stringify(leads));

        // Enviar datos al Webhook de Make
        try {
            let absoluteLink = downloadLink;
            if (downloadLink && !downloadLink.startsWith("http")) {
                absoluteLink = `https://www.florcapeletto.com/${downloadLink}`;
            }
            
            fetch("https://hook.eu1.make.com/5r6rnkfrwanu7xc51zaxh5x8nk5u6ii5", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    name: name,
                    email: email,
                    resource: resourceTitle,
                    link: absoluteLink,
                    date: dateStr
                })
            });
            console.log("📨 Lead enviado a Make con éxito.");
        } catch (err) {
            console.error("❌ Error al enviar lead a Make:", err);
        }

        if (supabaseClient) {
            try {
                const { error } = await supabaseClient
                    .from('leads')
                    .insert([
                        { name: name, email: email, resource: resourceTitle }
                    ]);
                if (error) throw error;
                console.log("📝 Lead guardado exitosamente en Supabase.");
                logEvent("conversion", "lead_tracker_" + resourceTitle.toLowerCase().replace(/\s+/g, '_'));
            } catch (err) {
                console.error("❌ Error al guardar lead en Supabase:", err);
            }
        }
    };


    // ==========================================
    // 5. Sistema de Reserva de Sesión Lunes Gratis
    // ==========================================
    const bookingModal = document.getElementById("booking-modal");
    const bookingCloseBtn = document.getElementById("booking-close-btn");
    const openBookingButtons = document.querySelectorAll(".open-booking-btn");
    
    // Abrir Modal de Reservas (Bindeado a todos los botones correspondientes)
    openBookingButtons.forEach(btn => {
        btn.addEventListener("click", () => {
            bookingModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Evitar scroll del fondo
        });
    });

    // Cerrar Modal Reservas
    const closeBookingModal = () => {
        bookingModal.classList.remove("active");
        document.body.style.overflow = ""; // Restaurar scroll
    };

    if (bookingCloseBtn) bookingCloseBtn.addEventListener("click", closeBookingModal);
    
    bookingModal.addEventListener("click", (e) => {
        if (e.target === bookingModal) {
            closeBookingModal();
        }
    });

    // ==========================================
    // 6. Formulario de Contacto (Simulación Premium)
    // ==========================================
    const contactForm = document.getElementById("contact-form");
    const formStatus = document.getElementById("form-status");
    const formSubmitBtn = document.getElementById("form-submit-btn");

    if (contactForm) {
        contactForm.addEventListener("submit", (e) => {
            e.preventDefault();
            
            const name = document.getElementById("form-name").value;
            const email = document.getElementById("form-email").value;
            const subject = document.getElementById("form-subject").value;
            const message = document.getElementById("form-message").value;

            // Validación de selector desplegable personalizado
            if (!subject) {
                const trigger = document.getElementById("select-trigger-subject");
                if (trigger) trigger.classList.add("invalid");
                return;
            }

            formSubmitBtn.disabled = true;
            formSubmitBtn.innerHTML = `Enviando mensaje... <i class="fa-solid fa-spinner fa-spin"></i>`;

            setTimeout(async () => {
                let contactLeads = JSON.parse(localStorage.getItem("contacts_database")) || [];
                contactLeads.push({
                    date: new Date().toLocaleString(),
                    name: name,
                    email: email,
                    subject: subject,
                    message: message
                });
                localStorage.setItem("contacts_database", JSON.stringify(contactLeads));

                if (supabaseClient) {
                    try {
                        const { error } = await supabaseClient
                            .from('contacts')
                            .insert([
                                { name: name, email: email, subject: subject, message: message }
                            ]);
                        if (error) throw error;
                        console.log("📝 Contacto guardado exitosamente en Supabase.");
                        logEvent("conversion", "contact_form_submit");
                    } catch (err) {
                        console.error("❌ Error al guardar contacto en Supabase:", err);
                    }
                }

                formStatus.className = "form-status-message success";
                formStatus.style.display = ""; // Reset inline display style from previous hides
                formStatus.innerHTML = `<i class="fa-solid fa-circle-check"></i> ¡Muchas gracias, ${name}! Tu consulta llegó con éxito. Te responderé lo antes posible.`;
                
                contactForm.reset();
                formSubmitBtn.disabled = false;
                formSubmitBtn.innerHTML = `Enviar Consulta <i class="fa-solid fa-paper-plane"></i>`;
                
                setTimeout(() => {
                    formStatus.style.display = "none";
                }, 6000);
                
            }, 1500);
        });
    }


    // ==========================================
    // 7. Modal de Aviso Legal y Privacidad
    // ==========================================
    const legalModal = document.getElementById("legal-modal");
    const openLegalBtn = document.getElementById("open-legal-btn");
    const legalCloseBtn = document.getElementById("legal-close-btn");
    const legalSuccessCloseBtn = document.getElementById("legal-success-close-btn");

    if (openLegalBtn && legalModal) {
        openLegalBtn.addEventListener("click", (e) => {
            e.preventDefault();
            legalModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Evitar scroll del fondo
        });

        const closeLegalModal = () => {
            legalModal.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        };

        if (legalCloseBtn) legalCloseBtn.addEventListener("click", closeLegalModal);
        if (legalSuccessCloseBtn) legalSuccessCloseBtn.addEventListener("click", closeLegalModal);

        legalModal.addEventListener("click", (e) => {
            if (e.target === legalModal) {
                closeLegalModal();
            }
        });
    }

    // ==========================================
    // 8. Visor de Artículos de Blog
    // ==========================================
    const blogModal = document.getElementById("blog-modal");
    const openArticleBtns = document.querySelectorAll(".open-article-btn");
    const blogCloseBtn = document.getElementById("blog-close-btn");
    const blogSuccessCloseBtn = document.getElementById("blog-success-close-btn");

    const blogModalImg = document.getElementById("blog-modal-img");
    const blogModalCategory = document.getElementById("blog-modal-category");
    const blogModalTitle = document.getElementById("blog-modal-title");
    const blogModalDate = document.getElementById("blog-modal-date");
    const blogModalBodyContent = document.getElementById("blog-modal-body-content");

    const ARTICLES_DATABASE = {
        mindset: {
            title: "Saber qué hacer no alcanza: cómo superar el bloqueo mental en la búsqueda laboral",
            category: "Mentalidad",
            date: "Junio, 2026",
            image: "assets/blog_mindset.png",
            content: [
                "Hay una escena que se repite más de lo que imaginamos: Una persona quiere cambiar de trabajo. Sabe que necesita actualizar su CV, mejorar su perfil de LinkedIn, empezar a postularse. Incluso tiene claro por dónde empezar. Pero no lo hace. Pasan los días. Las semanas. A veces, los meses. Y aparece una pregunta incómoda, casi siempre acompañada de culpa: <em>“Si sé lo que tengo que hacer, ¿por qué no lo hago?”</em>",
                "Durante años, en el mundo de los Recursos Humanos, esta situación se leyó desde categorías bastante conocidas: falta de motivación, escasa disciplina o ausencia de claridad. Sin embargo, esa explicación empieza a resultar insuficiente. Porque entre saber y hacer no siempre hay un problema de información. Muchas veces, hay un problema de adaptación.",
                "La adaptabilidad mental —es decir, nuestra capacidad para aprender, reconfigurar hábitos y responder a la experiencia— ayuda a entender este punto. Nuestra mente no es una estructura fija: aprende, se ajusta y se moldea según lo que repite, practica y vive. Y esa misma capacidad que permite desarrollar nuevas habilidades también explica por qué los viejos patrones cuestan tanto de soltar.",
                "En términos laborales, esto tiene una implicancia concreta: Ya sea que tu objetivo sea conseguir trabajo, cambiar el mismo, dar un salto profesional (o animarse a emprender por tu cuenta) no supone solamente actualizar herramientas externas. También exige que la persona se adapte a una nueva exigencia interna.",
                "Salir a buscar oportunidades, mostrarse, exponerse a entrevistas o imaginarse en otro rol implica romper con circuitos conocidos y empezar a construir otros nuevos. Y ahí aparece la fricción. No porque la persona no quiera avanzar, sino porque avanzar también implica desarmar hábitos mentales, respuestas automáticas y formas de vincularse con lo laboral que llevan tiempo instaladas. Lo conocido, aun cuando incomoda, suele sentirse más seguro que lo nuevo.",
                "Por eso, muchas veces no alcanza con decirle a alguien lo que “debería” hacer. El problema no siempre está en la estrategia. A veces está en que nuestra mente todavía no se adaptó a la idea del cambio.",
                "La buena noticia es que esa adaptación es posible. Justamente porque conservamos capacidad de aprendizaje y reorganización a lo largo de la vida, las personas pueden desarrollar nuevas habilidades, ampliar su manera de responder al entorno y construir formas más funcionales de actuar frente a desafíos laborales. La formación, la repetición y la exposición progresiva a nuevos contextos son parte de ese proceso.",
                "Visto así, la empleabilidad deja de ser solo una cuestión de CV, LinkedIn o entrevistas. También pasa a ser un proceso de transformación más profundo: el de aprender a pensar, actuar y sostenerse de una manera nueva frente al cambio.",
                "Trabajar únicamente sobre el “qué hacer” deja fuera una parte fundamental del proceso. Hoy sabemos que factores como:",
                "<ul><li>La percepción de seguridad</li><li>La claridad del contexto</li><li>El sentido de control</li><li>La conexión con otros</li></ul>",
                "influyen directamente en cómo una persona piensa, decide y actúa. Y esto redefine completamente la forma de acompañar procesos laborales.",
                "La empleabilidad, entendida desde este lugar, deja de ser solo una cuestión de estrategia y pasa a ser un proceso más amplio, que involucra a la persona en su totalidad. No solo lo que sabe, sino también cómo responde frente al cambio. Porque ahí es donde se define, en gran parte, la posibilidad real de avanzar.",
                "Tal vez el problema no sea la falta de información. Tal vez sea que estamos intentando resolver procesos complejos solo desde la lógica, sin considerar cómo funciona el sistema que los sostiene.",
                "Y ahí, incorporar la mirada de la gestión del comportamiento no es una tendencia. Es una forma más realista —y más humana— de entender el desarrollo profesional. Porque no alcanza con saber qué hacer. El verdadero cambio empieza cuando una persona logra <strong>SOSTENERLO</strong>.",
                "Desde mi trabajo en Recursos Humanos, acompañando a personas en sus procesos laborales, cada vez veo con más claridad que el diferencial no está solo en las herramientas, sino en cómo las personas se vinculan con el cambio. Y eso… lo cambia todo.",
                "<small style='opacity: 0.8;'><strong>Fuentes y referencias:</strong><br>• Artículo sobre adaptabilidad y desarrollo profesional (INEAF)<br>• Informe sobre hábitos y comportamiento en el entorno laboral (WeMind Cluster)</small>"
            ]
        },
        mindfulness: {
            title: "Equilibrando la balanza...",
            category: "Bienestar Emocional",
            date: "Abril, 2024",
            image: "assets/blog_mindfulness.png",
            content: [
                "Hoy fue un día de esos en los que quería llegar a casa y simplemente tirarme en el sillón con el celular. Sin pensar, sin producir, sin tomar decisiones. Solo scroll infinito para 'desconectar' de una jornada intensa.",
                "Pero, ¿realmente desconectamos? A los veinte minutos de deslizar la pantalla, la sensación no es de descanso. Es una mezcla de fatiga visual, rumiación mental sobre lo pendiente y una leve culpa por estar perdiendo el tiempo. En el fondo de la balanza, la aguja no se mueve hacia el equilibrio, sino hacia un cansancio silencioso.",
                "En la sociedad del rendimiento constante, se nos vende el autocuidado como una lista de tareas más: hacer yoga, meditar, comer saludable, tener una rutina impecable de mañana. Sumamos exigencias para intentar contrarrestar el estrés, convirtiendo el descanso en otra meta que cumplir. Así, la balanza nunca se equilibra; solo pesa más.",
                "<strong>El mito de la productividad total</strong>",
                "Como profesionales, sobre todo cuando estamos en pleno proceso de cambio, reinvención o gestionando proyectos de gran intensidad, caemos en la trampa de que 'parar es retroceder'. Sentimos que cada minuto libre debe ser aprovechado para actualizar el CV, optimizar LinkedIn o aprender una nueva habilidad. Nos convertimos en nuestros propios recruiters autoexigentes.",
                "La psicología del bienestar nos enseña que el cerebro necesita periodos de inactividad real —lo que se conoce como el estado de reposo mental activo— para procesar información, consolidar aprendizajes y, fundamentalmente, regular nuestro sistema nervioso. Estar en el sillón mirando la pantalla no es inactividad; es sobreestimular un cerebro que ya viene saturado.",
                "<strong>¿Cómo equilibramos la balanza en la práctica?</strong>",
                "1. <strong>Definir el descanso real:</strong> El descanso no se planifica como una tarea con objetivos. A veces es simplemente mirar por la ventana cinco minutos, dar un paseo sin auriculares o permitirnos estar aburridos sin recurrir al celular.",
                "2. <strong>Poner límites a la autoexigencia:</strong> Si hoy tu balanza laboral estuvo muy cargada y demandó mucha energía, tu balanza personal necesita restar, no sumar. Está bien que tu único logro del día sea haber terminado tu jornada y haber descansado de verdad.",
                "3. <strong>Abrazar la imperfección:</strong> La reinvención y el crecimiento profesional no son caminos lineales. Habrá días intensos, días de acción y días donde tirar el celular a un lado sea lo más sano.",
                "Equilibrar la balanza no es lograr una estabilidad perfecta todos los días. Es aprender a escuchar nuestro cuerpo, validar el cansancio sin juzgarlo y entender que cuidar nuestra energía no es un lujo, sino la única estrategia sostenible para sostener nuestra carrera en el largo plazo.",
                "Así que, si hoy fue uno de esos días intensos, permítete tirar el celular a un lado, cerrar los ojos y descansar en serio. Tu carrera te lo agradecerá."
            ]
        }
    };

    const blogCards = document.querySelectorAll(".blog-card");
    if (blogModal && blogCards.length > 0) {
        blogCards.forEach(card => {
            // Asegurar que la tarjeta completa tenga el cursor de mano interactivo
            card.style.cursor = "pointer";

            // Buscar el botón o identificador interno del artículo
            const btn = card.querySelector(".open-article-btn");
            const articleKey = btn ? btn.getAttribute("data-article") : null;

            card.addEventListener("click", (e) => {
                e.preventDefault(); // Detener cualquier desplazamiento al principio de la página (#)
                const article = ARTICLES_DATABASE[articleKey];

                if (article) {
                    // Cargar contenidos dinámicamente en el modal
                    blogModalImg.src = article.image;
                    blogModalImg.alt = article.title;
                    blogModalCategory.innerText = article.category;
                    blogModalTitle.innerText = article.title;
                    blogModalDate.innerText = article.date;
                    
                    // Renderizar párrafos formateados
                    blogModalBodyContent.innerHTML = article.content.map(p => `<p>${p}</p>`).join("");

                    // Abrir modal con efecto
                    blogModal.classList.add("active");
                    document.body.style.overflow = "hidden"; // Desactivar scroll del fondo
                }
            });
        });

        const closeBlogModal = () => {
            blogModal.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        };

        if (blogCloseBtn) blogCloseBtn.addEventListener("click", closeBlogModal);
        if (blogSuccessCloseBtn) blogSuccessCloseBtn.addEventListener("click", closeBlogModal);

        blogModal.addEventListener("click", (e) => {
            if (e.target === blogModal) {
                closeBlogModal();
            }
        });
    }

    // ==========================================
    // 9. Modal de Simbología del Triskelion
    // ==========================================
    const triskelionModal = document.getElementById("triskelion-modal");
    const triskelionTrigger = document.getElementById("triskelion-trigger");
    const triskelionCloseBtn = document.getElementById("triskelion-close-btn");

    if (triskelionModal && triskelionTrigger) {
        triskelionTrigger.addEventListener("click", (e) => {
            e.preventDefault();
            triskelionModal.classList.add("active");
            document.body.style.overflow = "hidden"; // Desactivar scroll del fondo
        });

        const closeTriskelionModal = () => {
            triskelionModal.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        };

        if (triskelionCloseBtn) triskelionCloseBtn.addEventListener("click", closeTriskelionModal);

        triskelionModal.addEventListener("click", (e) => {
            if (e.target === triskelionModal) {
                closeTriskelionModal();
            }
        });
    }

    // ==========================================
    // 10. Lógica de Lista Desplegable Personalizada (form-subject)
    // ==========================================
    const selectTrigger = document.getElementById("select-trigger-subject");
    const optionsList = document.getElementById("options-list-subject");
    const hiddenSubjectInput = document.getElementById("form-subject");
    const customOptions = document.querySelectorAll(".custom-option");

    if (selectTrigger && optionsList && hiddenSubjectInput) {
        // Abrir/Cerrar listado al hacer clic en el disparador
        selectTrigger.addEventListener("click", (e) => {
            e.stopPropagation();
            optionsList.classList.toggle("active");
            selectTrigger.classList.toggle("active");
            selectTrigger.classList.remove("invalid"); // Quitar borde de error
        });

        // Al seleccionar una opción
        customOptions.forEach(option => {
            option.addEventListener("click", (e) => {
                e.stopPropagation();
                const value = option.getAttribute("data-value");
                const text = option.innerText;

                // Guardar valor en el input hidden
                hiddenSubjectInput.value = value;

                // Modificar el texto del disparador y cambiar color
                selectTrigger.querySelector(".custom-select-trigger-text").innerText = text;
                selectTrigger.classList.add("has-value");

                // Marcar item como seleccionado
                customOptions.forEach(opt => opt.classList.remove("selected"));
                option.classList.add("selected");

                // Cerrar listado
                optionsList.classList.remove("active");
                selectTrigger.classList.remove("active");
            });
        });

        // Cerrar el listado automáticamente al hacer clic en cualquier parte fuera de él
        document.addEventListener("click", () => {
            optionsList.classList.remove("active");
            selectTrigger.classList.remove("active");
        });

        // Auto-seleccionar "Mentoría para Reinvención Profesional" en el formulario de contacto
        const openNexoSessionBtns = document.querySelectorAll(".open-nexo-session-btn");
        openNexoSessionBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                hiddenSubjectInput.value = "reinvencion";
                selectTrigger.querySelector(".custom-select-trigger-text").innerText = "Mentoría para Reinvención Profesional";
                selectTrigger.classList.add("has-value");
                selectTrigger.classList.remove("invalid");
                
                customOptions.forEach(opt => {
                    if (opt.getAttribute("data-value") === "reinvencion") {
                        opt.classList.add("selected");
                    } else {
                        opt.classList.remove("selected");
                    }
                });
            });
        });

        // Auto-seleccionar "Optimización de CV / LinkedIn / Entrevistas" en el formulario de contacto
        const openTacticalSessionBtns = document.querySelectorAll(".open-tactical-session-btn");
        openTacticalSessionBtns.forEach(btn => {
            btn.addEventListener("click", () => {
                hiddenSubjectInput.value = "corporativo";
                selectTrigger.querySelector(".custom-select-trigger-text").innerText = "Optimización de CV / LinkedIn / Entrevistas";
                selectTrigger.classList.add("has-value");
                selectTrigger.classList.remove("invalid");
                
                customOptions.forEach(opt => {
                    if (opt.getAttribute("data-value") === "corporativo") {
                        opt.classList.add("selected");
                    } else {
                        opt.classList.remove("selected");
                    }
                });
            });
        });

        // Lógica para Expandir/Contraer Testimonios Largos ("Ver más")
        const testimonialToggleBtns = document.querySelectorAll(".testimonial-toggle-btn");
        testimonialToggleBtns.forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const moreText = btn.parentNode.querySelector(".testimonial-more-text");
                if (moreText) {
                    const isExpanded = moreText.classList.toggle("visible");
                    btn.innerText = isExpanded ? "Ver menos" : "Ver más";
                }
            });
        });
    }

    // ==========================================
    // 11. Animación Interactiva de la Línea de Tiempo del Método NEXO
    // ==========================================
    const timeline = document.querySelector(".nexo-timeline");
    const pathFill = document.getElementById("nexo-path-fill");
    const traveler = document.getElementById("nexo-traveler");
    const travelerLogo = traveler ? traveler.querySelector(".nexo-traveler-logo") : null;
    const timelineDots = document.querySelectorAll(".nexo-timeline-dot");

    if (timeline && pathFill && traveler) {
        const updateTimelineProgress = () => {
            const rect = timeline.getBoundingClientRect();
            const viewportHeight = window.innerHeight;

            // Inicia cuando la parte superior de la sección está al 60% de alto de pantalla
            const startTrigger = viewportHeight * 0.6;
            // Termina cuando la parte inferior de la sección está al 40% de alto de pantalla
            const endTrigger = viewportHeight * 0.4;

            const sectionHeight = rect.height;
            const sectionTop = rect.top;

            let progress = 0;

            if (sectionTop < startTrigger) {
                const scrolledDistance = startTrigger - sectionTop;
                const totalDistance = sectionHeight + startTrigger - endTrigger;
                progress = Math.min(Math.max(scrolledDistance / totalDistance, 0), 1);
            }

            // Altura de progreso en porcentaje
            const progressPercent = progress * 100;
            pathFill.style.height = `${progressPercent}%`;

            // Posición top del viajero (Triskelion)
            const travelerTop = progress * sectionHeight;
            traveler.style.top = `${travelerTop}px`;

            // Rotar el logo del triskelion a medida que avanza (hasta 360 grados)
            if (travelerLogo) {
                const rotation = progress * 360;
                travelerLogo.style.transform = `rotate(${rotation}deg)`;
            }

            // Activar dinámicamente los círculos indicadores (dots) a medida que el viajero los pasa
            timelineDots.forEach(dot => {
                const dotTop = dot.offsetTop;
                if (travelerTop >= dotTop - 10) {
                    dot.classList.add("active");
                } else {
                    dot.classList.remove("active");
                }
            });
        };

        // Ejecutar en scroll y en load/resize inicial
        window.addEventListener("scroll", updateTimelineProgress);
        window.addEventListener("resize", updateTimelineProgress);
        setTimeout(updateTimelineProgress, 100);
    }

    // ==========================================
    // 7. Lógica Especial de la Página de Servicios y Precios (servicios.html)
    // ==========================================

    // B. Modal para Detalles de Tarjetas de Servicios
    const serviceModal = document.getElementById("service-modal");
    const serviceCloseBtn = document.getElementById("service-close-btn");
    const detailsButtons = document.querySelectorAll(".btn-card-details");

    if (serviceModal && detailsButtons.length > 0) {
        
        const openServiceModal = (cardKey) => {
            const buttonEl = document.querySelector(`[data-card="${cardKey}"]`);
            if (!buttonEl) return;

            const cardElement = buttonEl.closest(".pricing-card");
            const panel = document.getElementById(`details-${cardKey}`);

            if (cardElement && panel) {
                // 1. Obtener elementos de la tarjeta
                const title = cardElement.querySelector(".card-title").innerText;
                const subtitle = cardElement.querySelector(".card-subtitle").innerText;
                const imgSrc = cardElement.querySelector(".card-image").src;
                const description = cardElement.querySelector(".card-desc").innerText;

                // Precios y notas por región desde los data-attributes de la tarjeta
                const priceArs = cardElement.getAttribute("data-price-ars") || "";
                const priceUsd = cardElement.getAttribute("data-price-usd") || "";
                const priceEur = cardElement.getAttribute("data-price-eur") || "";
                
                const priceArsNote = cardElement.getAttribute("data-price-ars-note") || "";
                const priceUsdNote = cardElement.getAttribute("data-price-usd-note") || "";
                const priceEurNote = cardElement.getAttribute("data-price-eur-note") || "";

                const activeCardData = {
                    title,
                    priceArs,
                    priceUsd,
                    priceEur,
                    priceArsNote,
                    priceUsdNote,
                    priceEurNote
                };

                // 2. Poblar cabecera
                const modalImg = document.getElementById("service-modal-img");
                const modalTitle = document.getElementById("service-modal-title");
                const modalSubtitle = document.getElementById("service-modal-subtitle");
                const modalDesc = document.getElementById("service-modal-description");

                if (modalImg) {
                    modalImg.src = imgSrc;
                    modalImg.alt = title;
                }
                if (modalTitle) modalTitle.innerText = title;
                if (modalSubtitle) modalSubtitle.innerText = subtitle;
                if (modalDesc) modalDesc.innerText = description;

                // 3. Organizar bloques de contenido (Izquierda vs Derecha)
                const leftContainer = document.getElementById("service-modal-details-container");
                const paymentsSection = document.getElementById("service-modal-payments-section");
                const modalWhatsappBtn = document.getElementById("service-modal-whatsapp-btn");
                const modalCurrencySelect = document.getElementById("modal-currency-select");

                if (leftContainer) leftContainer.innerHTML = "";
                if (paymentsSection) paymentsSection.innerHTML = "";

                // Clonar bloques de detalle (información básica y métodos de pago)
                const detailBlocks = panel.querySelectorAll(".detail-block");
                detailBlocks.forEach(block => {
                    const blockTitleEl = block.querySelector(".detail-block-title");
                    if (!blockTitleEl) return;

                    const blockTitle = blockTitleEl.innerText.toLowerCase();

                    // Identificar el tipo de bloque por su título/icono
                    if (blockTitle.includes("pago") || blockTitle.includes("facilidades")) {
                        if (paymentsSection) {
                            paymentsSection.innerHTML = block.innerHTML;
                        }
                    } else {
                        // Bloques informativos (Duración, Primera sesión, Metodología, Recursos) van a la izquierda
                        if (leftContainer) {
                            const clone = block.cloneNode(true);
                            leftContainer.appendChild(clone);
                        }
                    }
                });

                // Función interna para actualizar el precio y el botón de WhatsApp
                const updateModalPricing = () => {
                    const activeSelect = document.getElementById("modal-currency-select");
                    const selectedCurrency = activeSelect ? activeSelect.value : userCurrency;
                    
                    const priceEl = document.getElementById("service-modal-price");
                    const noteEl = document.getElementById("service-modal-price-note");

                    let priceText = "";
                    let noteText = "";

                    if (selectedCurrency === "ARS") {
                        priceText = activeCardData.priceArs;
                        noteText = activeCardData.priceArsNote;
                    } else if (selectedCurrency === "EUR") {
                        priceText = activeCardData.priceEur;
                        noteText = activeCardData.priceEurNote;
                    } else {
                        priceText = activeCardData.priceUsd;
                        noteText = activeCardData.priceUsdNote;
                    }

                    if (priceEl) priceEl.innerText = priceText;
                    
                    if (noteEl) {
                        if (noteText) {
                            noteEl.innerText = noteText;
                            noteEl.style.display = "inline-block";
                        } else {
                            noteEl.style.display = "none";
                        }
                    }

                    // Configurar enlace y mensaje de WhatsApp
                    if (modalWhatsappBtn) {
                        const baseMsg = `¡Hola Flor! Me interesa contratar el servicio de "${activeCardData.title}" (${priceText}). ¿Cómo coordinamos los detalles?`;
                        modalWhatsappBtn.href = `https://wa.me/393445628917?text=${encodeURIComponent(baseMsg)}`;
                        
                        // Textos de botón customizados por tipo de servicio
                        if (cardKey === "nexo") {
                            modalWhatsappBtn.innerHTML = `Aplicar al Programa <i class="fa-solid fa-arrow-right"></i>`;
                        } else if (cardKey === "migracion") {
                            modalWhatsappBtn.innerHTML = `Contratar Programa <i class="fa-solid fa-arrow-right"></i>`;
                        } else if (cardKey === "insercion") {
                            modalWhatsappBtn.innerHTML = `Contratar Pack <i class="fa-solid fa-arrow-right"></i>`;
                        } else {
                            modalWhatsappBtn.innerHTML = `Contratar Servicio <i class="fa-solid fa-arrow-right"></i>`;
                        }
                    }
                };

                // Asignar el selector al valor detectado o guardado actual y enlazar listener
                if (modalCurrencySelect) {
                    modalCurrencySelect.value = userCurrency;
                    
                    // Clonar selector para eliminar event listeners acumulados de modales anteriores
                    const newSelect = modalCurrencySelect.cloneNode(true);
                    modalCurrencySelect.parentNode.replaceChild(newSelect, modalCurrencySelect);

                    newSelect.addEventListener("change", (e) => {
                        userCurrency = e.target.value;
                        localStorage.setItem("user-currency", userCurrency);
                        updateModalPricing();
                    });
                }

                // Ejecutar inicialización de visualización de precios
                updateModalPricing();

                // 5. Mostrar modal
                serviceModal.classList.add("active");
                document.body.style.overflow = "hidden"; // Desactivar scroll
                
                if (typeof logEvent === "function") {
                    logEvent("click", "open_service_modal_" + cardKey);
                }
            }
        };

        const closeServiceModal = () => {
            serviceModal.classList.remove("active");
            document.body.style.overflow = ""; // Restaurar scroll
        };

        detailsButtons.forEach(button => {
            button.addEventListener("click", () => {
                const cardKey = button.getAttribute("data-card");
                openServiceModal(cardKey);
            });
        });

        if (serviceCloseBtn) serviceCloseBtn.addEventListener("click", closeServiceModal);
        
        serviceModal.addEventListener("click", (e) => {
            if (e.target === serviceModal) {
                closeServiceModal();
            }
        });
    }

    // C. Acordeón de Preguntas Frecuentes (FAQs)
    const faqItems = document.querySelectorAll(".faq-item");
    faqItems.forEach(item => {
        const trigger = item.querySelector(".faq-trigger");
        if (trigger) {
            trigger.addEventListener("click", () => {
                const isActive = item.classList.contains("active");
                
                // Cerrar todos los demás ítems
                faqItems.forEach(otherItem => {
                    if (otherItem !== item) {
                        otherItem.classList.remove("active");
                    }
                });

                // Toggle del ítem actual
                item.classList.toggle("active");

                if (typeof logEvent === "function" && !isActive) {
                    logEvent("click", "open_faq");
                }
            });
        }
    });

    // ==========================================
    // ==========================================
    // D. Carrusel de Testimonios Interactivo e Infinito
    // ==========================================
    const track = document.getElementById("testimonios-track");
    const prevBtn = document.querySelector(".carousel-control.prev");
    const nextBtn = document.querySelector(".carousel-control.next");

    if (track) {
        const originalCards = Array.from(track.children);
        
        if (originalCards.length > 0) {
            // 1. Recorte de texto a 4 líneas y botón "Ver más" dinámico
            originalCards.forEach(card => {
                const textEl = card.querySelector(".testimonial-text");
                if (!textEl) return;

                const wrap = document.createElement("div");
                wrap.className = "testimonial-text-wrap";
                textEl.parentNode.insertBefore(wrap, textEl);
                wrap.appendChild(textEl);
            });

            // Medir alturas y agregar botones antes de clonar para que se dupliquen
            originalCards.forEach(card => {
                const wrap = card.querySelector(".testimonial-text-wrap");
                // 98px representa la altura holgada para exactamente 4 líneas de lectura.
                // Si sobrepasa esta altura, aplicamos la clase de recorte (clipped) y agregamos el botón.
                if (wrap && wrap.scrollHeight > 98) {
                    wrap.classList.add("clipped");
                    const btn = document.createElement("button");
                    btn.className = "testimonial-toggle-btn";
                    btn.innerText = "Ver más";
                    wrap.parentNode.insertBefore(btn, wrap.nextSibling);
                }
            });

            // 2. Clonación para Loop Infinito
            const numClones = 4;
            let cardWidth = originalCards[0].offsetWidth;
            let gap = parseInt(window.getComputedStyle(track).gap) || 24;
            let step = cardWidth + gap;

            // Clonar las primeras tarjetas al final
            for (let i = 0; i < numClones; i++) {
                const clone = originalCards[i].cloneNode(true);
                clone.classList.add("clone");
                track.appendChild(clone);
            }

            // Clonar las últimas tarjetas al principio
            for (let i = originalCards.length - 1; i >= originalCards.length - numClones; i--) {
                const clone = originalCards[i].cloneNode(true);
                clone.classList.add("clone");
                track.insertBefore(clone, track.firstChild);
            }

            // Posición inicial centrada en los elementos originales
            const setInitialScroll = () => {
                const style = window.getComputedStyle(track);
                const paddingLeft = parseInt(style.paddingLeft) || 0;
                track.scrollLeft = numClones * step - paddingLeft;
            };

            setTimeout(setInitialScroll, 50);

            // Ajustar proporciones y posiciones en cambio de tamaño de ventana
            window.addEventListener("resize", () => {
                const firstCard = track.querySelector(".testimonial-card");
                if (firstCard) {
                    const newCardWidth = firstCard.offsetWidth;
                    const newGap = parseInt(window.getComputedStyle(track).gap) || 24;
                    const ratio = (newCardWidth + newGap) / step;
                    step = newCardWidth + newGap;
                    track.scrollLeft = track.scrollLeft * ratio;
                }
            });

            // 3. Salto de Scroll Infinito (Snapping)
            const handleScrollSnap = () => {
                const scrollLeft = track.scrollLeft;
                const totalOriginalWidth = originalCards.length * step;
                const rightThreshold = (numClones + originalCards.length - 2) * step;
                const leftThreshold = (numClones - 2) * step;

                if (scrollLeft >= rightThreshold) {
                    track.style.scrollBehavior = "auto";
                    track.scrollLeft = scrollLeft - totalOriginalWidth;
                    track.offsetHeight; // Forzar reflow
                    track.style.scrollBehavior = "smooth";
                } else if (scrollLeft <= leftThreshold) {
                    track.style.scrollBehavior = "auto";
                    track.scrollLeft = scrollLeft + totalOriginalWidth;
                    track.offsetHeight; // Forzar reflow
                    track.style.scrollBehavior = "smooth";
                }
            };

            track.addEventListener("scroll", handleScrollSnap);

            // 4. Listeners de Botones de Control
            if (prevBtn) {
                prevBtn.addEventListener("click", () => {
                    track.style.scrollBehavior = "smooth";
                    track.scrollLeft -= step;
                });
            }

            if (nextBtn) {
                nextBtn.addEventListener("click", () => {
                    track.style.scrollBehavior = "smooth";
                    track.scrollLeft += step;
                });
            }

            // 5. Control de Arrastre con Mouse (Grab & Drag)
            let isDown = false;
            let startX;
            let startScrollLeft;
            let dragMoved = false;

            track.addEventListener("mousedown", (e) => {
                isDown = true;
                track.classList.add("dragging");
                track.style.scrollBehavior = "auto";
                startX = e.pageX - track.offsetLeft;
                startScrollLeft = track.scrollLeft;
                dragMoved = false;
            });

            track.addEventListener("mouseleave", () => {
                isDown = false;
                track.classList.remove("dragging");
            });

            track.addEventListener("mouseup", (e) => {
                isDown = false;
                track.classList.remove("dragging");
                track.style.scrollBehavior = "smooth";
                
                if (dragMoved) {
                    const preventClick = (event) => {
                        event.preventDefault();
                        event.stopPropagation();
                    };
                    track.addEventListener("click", preventClick, { capture: true, once: true });
                }
            });

            track.addEventListener("mousemove", (e) => {
                if (!isDown) return;
                e.preventDefault();
                const x = e.pageX - track.offsetLeft;
                const walk = (x - startX) * 1.5;
                if (Math.abs(walk) > 5) {
                    dragMoved = true;
                }
                track.scrollLeft = startScrollLeft - walk;
            });

            // 6. Delegación de Eventos para botones "Ver más"
            track.addEventListener("click", (e) => {
                const btn = e.target.closest(".testimonial-toggle-btn");
                if (!btn) return;
                e.stopPropagation();

                const card = btn.closest(".testimonial-card");
                const wrap = card.querySelector(".testimonial-text-wrap");
                if (wrap) {
                    const isExpanded = wrap.classList.toggle("expanded");
                    btn.innerText = isExpanded ? "Ver menos" : "Ver más";
                }
            });
        }
    }

    // ==========================================
    // 9. Animaciones de Desplazamiento (Scroll Reveal)
    // ==========================================
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

});

