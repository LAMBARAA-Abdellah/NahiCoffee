(function () {
    const WIDGET_ID = 'nahi-whatsapp-widget';
    const WHATSAPP_URL = 'https://wa.me/212661773616';
    const LANG_TEXT = {
        fr: 'Discutez avec nous sur WhatsApp',
        en: 'Chat with us on WhatsApp',
        ar: 'تحدث معنا على واتساب'
    };

    function getLanguage() {
        const htmlLang = (document.documentElement.lang || 'fr').toLowerCase().slice(0, 2);
        return LANG_TEXT[htmlLang] ? htmlLang : 'fr';
    }

    function getTooltipText(lang) {
        return LANG_TEXT[lang] || LANG_TEXT.fr;
    }

    function isRoundedContainer(element) {
        if (!(element instanceof HTMLElement)) {
            return false;
        }

        const classList = element.classList;
        if (classList.contains('section-block') || classList.contains('contact-section') || classList.contains('gallery-section') || classList.contains('site-footer') || classList.contains('about') || classList.contains('hero')) {
            return true;
        }

        const radius = parseFloat(window.getComputedStyle(element).borderTopLeftRadius || '0');
        return radius >= 18;
    }

    function initWhatsAppWidget() {
        if (!window.gsap || document.getElementById(WIDGET_ID)) {
            return;
        }

        const widget = document.createElement('div');
        widget.id = WIDGET_ID;
        widget.className = 'nahi-whatsapp-widget';
        widget.setAttribute('data-nahi-whatsapp-widget', 'true');

        widget.innerHTML = `
            <a class="nahi-whatsapp-widget__button" href="${WHATSAPP_URL}" target="_blank" rel="noopener noreferrer" aria-describedby="${WIDGET_ID}-tooltip">
                <span class="nahi-whatsapp-widget__progress" aria-hidden="true"></span>
                <span class="nahi-whatsapp-widget__icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false">
                        <path fill="currentColor" d="M12.04 2C6.52 2 2.04 6.48 2.04 12c0 1.86.51 3.67 1.47 5.25L2 22l4.89-1.44A9.93 9.93 0 0 0 12.04 22c5.52 0 10-4.48 10-10s-4.48-10-10-10Zm0 18.18c-1.68 0-3.33-.45-4.75-1.31l-.34-.2-2.9.85.87-2.82-.22-.36A8.14 8.14 0 0 1 3.84 12c0-4.54 3.69-8.22 8.2-8.22 2.2 0 4.25.85 5.8 2.4a8.15 8.15 0 0 1 2.4 5.8c0 4.5-3.68 8.2-8.2 8.2Zm4.75-6.1c-.26-.13-1.55-.77-1.79-.85-.24-.09-.42-.13-.6.13-.18.26-.69.85-.84 1.02-.15.18-.31.2-.57.07-.26-.13-1.1-.4-2.1-1.28a7.9 7.9 0 0 1-1.45-1.8c-.15-.26-.02-.4.11-.53.12-.12.26-.31.39-.46.13-.15.18-.26.26-.44.09-.18.04-.34-.02-.47-.07-.13-.6-1.44-.82-1.97-.22-.53-.44-.45-.6-.45h-.51c-.18 0-.47.07-.71.34-.24.26-.93.91-.93 2.22s.95 2.57 1.08 2.75c.13.18 1.89 2.89 4.57 4.05.64.28 1.14.45 1.53.58.64.2 1.22.17 1.68.1.51-.08 1.55-.64 1.77-1.26.22-.62.22-1.15.15-1.26-.06-.11-.24-.18-.5-.31Z"/>
                    </svg>
                </span>
                <span class="nahi-whatsapp-widget__accent" aria-hidden="true"></span>
            </a>
            <div class="nahi-whatsapp-widget__tooltip" id="${WIDGET_ID}-tooltip" role="tooltip"></div>
        `;

        document.body.appendChild(widget);

        const button = widget.querySelector('.nahi-whatsapp-widget__button');
        const tooltip = widget.querySelector('.nahi-whatsapp-widget__tooltip');
        const progressRing = widget.querySelector('.nahi-whatsapp-widget__progress');
        const footer = document.querySelector('.site-footer');

        const setWidgetX = window.gsap.quickTo(widget, 'x', { duration: 0.55, ease: 'power3.out' });
        const setWidgetY = window.gsap.quickTo(widget, 'y', { duration: 0.55, ease: 'power3.out' });
        const setWidgetScale = window.gsap.quickTo(widget, 'scale', { duration: 0.45, ease: 'power3.out' });
        const setButtonX = window.gsap.quickTo(button, 'x', { duration: 0.5, ease: 'power3.out' });
        const setButtonY = window.gsap.quickTo(button, 'y', { duration: 0.5, ease: 'power3.out' });
        const setButtonScale = window.gsap.quickTo(button, 'scale', { duration: 0.35, ease: 'power2.out' });

        const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        const showAt = 300;

        let visible = false;
        let hovered = false;
        let pointer = null;
        let scrollVelocity = 0;
        let lastScrollY = window.scrollY;
        let lastScrollTime = performance.now();
        let scrolling = false;
        let scrollEndTimer = null;
        let liftOffset = 0;

        function syncTooltipLanguage() {
            const lang = getLanguage();
            const text = getTooltipText(lang);
            tooltip.textContent = text;
            tooltip.dir = lang === 'ar' ? 'rtl' : 'ltr';
            button.setAttribute('aria-label', text);
            button.title = text;
        }

        function setVisible(nextVisible) {
            if (visible === nextVisible) {
                return;
            }

            visible = nextVisible;
            widget.classList.toggle('is-visible', visible);

            if (visible) {
                window.gsap.to(widget, {
                    autoAlpha: 1,
                    scale: 1,
                    y: 0,
                    duration: reduceMotion ? 0.01 : 0.7,
                    ease: 'power3.out'
                });
            } else {
                window.gsap.to(widget, {
                    autoAlpha: 0,
                    scale: 0.86,
                    y: 18,
                    duration: reduceMotion ? 0.01 : 0.45,
                    ease: 'power3.out'
                });
            }
        }

        function updateScrollState() {
            const maxScroll = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
            const progress = Math.min(1, Math.max(0, window.scrollY / maxScroll));
            progressRing.style.setProperty('--progress-angle', `${progress * 360}deg`);

            if (window.scrollY >= showAt) {
                setVisible(true);
            } else {
                setVisible(false);
            }

            const speedFactor = Math.min(1, scrollVelocity / 14);
            const scrollScale = scrolling ? 1 - speedFactor * 0.08 : 1;
            const hoverScale = hovered ? 1.15 : 1;
            setButtonScale(scrollScale * hoverScale);
        }

        function updateMagnetism() {
            if (!pointer || !visible) {
                setButtonX(0);
                setButtonY(0);
                return;
            }

            const rect = button.getBoundingClientRect();
            const centerX = rect.left + rect.width / 2;
            const centerY = rect.top + rect.height / 2;
            const deltaX = pointer.x - centerX;
            const deltaY = pointer.y - centerY;
            const distance = Math.hypot(deltaX, deltaY);
            const strength = Math.max(0, 1 - distance / 260);
            const x = Math.max(-8, Math.min(8, deltaX * 0.1 * strength));
            const y = Math.max(-8, Math.min(8, deltaY * 0.1 * strength));

            setButtonX(x);
            setButtonY(y);
        }

        function updateLift() {
            let nextLift = 0;

            if (footer instanceof HTMLElement) {
                const footerRect = footer.getBoundingClientRect();
                if (footerRect.top < window.innerHeight) {
                    nextLift = Math.min(120, window.innerHeight - footerRect.top + 18);
                }
            }

            const probeX = Math.max(0, window.innerWidth - 118);
            const probeY = Math.max(0, window.innerHeight - 118);
            const probe = document.elementFromPoint(probeX, probeY);

            if (isRoundedContainer(probe) || (probe && probe.closest && probe.closest('.section-block, .contact-section, .gallery-section, .hero, .about'))) {
                nextLift = Math.max(nextLift, 10);
            }

            if (nextLift !== liftOffset) {
                liftOffset = nextLift;
                setWidgetY(-liftOffset);
                setWidgetX(liftOffset > 0 ? -2 : 0);
            }
        }

        function tick() {
            updateScrollState();
            updateMagnetism();
            updateLift();
            requestAnimationFrame(tick);
        }

        window.gsap.set(widget, {
            autoAlpha: 0,
            scale: 0.86,
            y: 18,
            x: 0
        });

        syncTooltipLanguage();

        window.addEventListener('scroll', () => {
            const now = performance.now();
            const nextScrollY = window.scrollY;
            const deltaY = Math.abs(nextScrollY - lastScrollY);
            const deltaTime = Math.max(16, now - lastScrollTime);

            scrollVelocity = deltaY / deltaTime;
            scrolling = true;
            lastScrollY = nextScrollY;
            lastScrollTime = now;

            window.clearTimeout(scrollEndTimer);
            scrollEndTimer = window.setTimeout(() => {
                scrolling = false;
                scrollVelocity = 0;
            }, 110);
        }, { passive: true });

        window.addEventListener('pointermove', (event) => {
            pointer = { x: event.clientX, y: event.clientY };
        }, { passive: true });

        window.addEventListener('pointerleave', () => {
            pointer = null;
        });

        window.addEventListener('resize', updateLift, { passive: true });

        button.addEventListener('pointerenter', () => {
            hovered = true;
            widget.classList.add('is-hovered');
            setButtonScale((scrolling ? 0.92 : 1) * 1.15);
        });

        button.addEventListener('pointerleave', () => {
            hovered = false;
            widget.classList.remove('is-hovered');
        });

        button.addEventListener('focus', () => {
            hovered = true;
            widget.classList.add('is-hovered', 'is-tooltip-visible');
        });

        button.addEventListener('blur', () => {
            hovered = false;
            widget.classList.remove('is-hovered', 'is-tooltip-visible');
        });

        button.addEventListener('pointerenter', () => {
            widget.classList.add('is-tooltip-visible');
        });

        button.addEventListener('pointerleave', () => {
            if (!button.matches(':focus-visible')) {
                widget.classList.remove('is-tooltip-visible');
            }
        });

        const mutationObserver = new MutationObserver(syncTooltipLanguage);
        mutationObserver.observe(document.documentElement, {
            attributes: true,
            attributeFilter: ['lang']
        });

        if (footer instanceof HTMLElement) {
            const footerObserver = new IntersectionObserver(() => {
                updateLift();
            }, { threshold: [0, 0.1, 0.2, 0.4, 0.6, 1] });

            footerObserver.observe(footer);
        }

        setVisible(window.scrollY >= showAt);
        updateLift();
        requestAnimationFrame(tick);
    }

    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initWhatsAppWidget, { once: true });
    } else {
        initWhatsAppWidget();
    }
})();
