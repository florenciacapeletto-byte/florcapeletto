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
    // 3. Filtrado Dinámico de Recursos e Infoproductos
    // ==========================================
    const tabButtons = document.querySelectorAll(".tab-btn");
    const recursoCards = document.querySelectorAll(".recurso-card");

    tabButtons.forEach(button => {
        // Ignorar botones de pestañas del panel administrativo
        if (button.id === "admin-tab-leads" || button.id === "admin-tab-bookings") return;

        button.addEventListener("click", () => {
            // Remover clase activa de todos y añadir al seleccionado
            tabButtons.forEach(btn => {
                if (btn.id !== "admin-tab-leads" && btn.id !== "admin-tab-bookings") {
                    btn.classList.remove("active");
                }
            });
            button.classList.add("active");
            
            const filterValue = button.getAttribute("data-filter");
            
            recursoCards.forEach(card => {
                const category = card.getAttribute("data-category");
                
                if (filterValue === "all") {
                    card.style.display = "flex";
                } else if (category === filterValue) {
                    card.style.display = "flex";
                } else {
                    card.style.display = "none";
                }
            });
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
                modalTitle.innerText = config.title;
                modalSubtitle.innerText = config.subtitle;
                requestedResourceInput.value = resourceKey;
                
                // Cambiar icono del badge
                modalBadgeIcon.innerHTML = `<i class="${config.icon}"></i>`;
                
                // Abrir modal con efecto
                leadModal.classList.add("active");
                document.body.style.overflow = "hidden"; // Evitar scroll del fondo
            }
        });
    });

    // Cerrar Modal Leads
    const closeLeadModal = () => {
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
        
        const name = document.getElementById("lead-name").value.trim();
        const email = document.getElementById("lead-email").value.trim();
        const resourceKey = requestedResourceInput.value;
        const config = RESOURCE_DELIVERY[resourceKey];

        if (!name || !email || !config) return;

        // Guardar localmente y enviar a Make/Supabase
        saveLead(name, email, config.title, config.link);

        // Configurar el enlace de descarga exitoso
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
        
        const successMsgEl = document.getElementById("success-message");
        successMsgEl.innerText = config.successMsg;

        // Ocultar formulario y mostrar pantalla de éxito
        leadForm.style.display = "none";
        modalSuccessState.style.display = "flex";
    });

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

});
