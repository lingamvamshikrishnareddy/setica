document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;

    // --- GSAP/ScrollTrigger Check ---
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
        console.error("GSAP or its plugins (ScrollTrigger, ScrollToPlugin) are not loaded! Animations and scroll effects will be disabled.");
        // Optionally provide fallback behavior or just let it fail gracefully
    } else {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        console.log("GSAP and plugins registered.");
        // Initialize GSAP dependent features *only if GSAP is loaded*
        initializeGsapFeatures();
    }

    // --- Preloader ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        window.addEventListener('load', () => {
            gsap.to(loaderWrapper, {
                opacity: 0,
                duration: 0.5, // Faster fade
                ease: 'power1.out',
                onComplete: () => {
                    loaderWrapper.style.display = 'none'; // Hide completely
                    body.classList.remove('loading');
                    body.classList.add('loaded');
                    console.log("Page loaded, loader hidden.");
                    // Trigger entry animations only if GSAP loaded
                    if (typeof gsap !== 'undefined') {
                        animateHeroElements();
                    }
                }
            });
        });
        // Fallback if load event is slow
        setTimeout(() => {
            if (body.classList.contains('loading')) {
                console.warn("Load event fallback triggered.");
                gsap.to(loaderWrapper, {opacity: 0, duration: 0.5, onComplete: () => loaderWrapper.style.display = 'none'});
                body.classList.remove('loading');
                body.classList.add('loaded');
                if (typeof gsap !== 'undefined') {
                    animateHeroElements();
                }
            }
        }, 3500); // Increased fallback timeout slightly

    } else {
        // If no loader, remove classes immediately
        body.classList.remove('loading');
        body.classList.add('loaded');
        if (typeof gsap !== 'undefined') {
            animateHeroElements(); // Still try hero animations
        }
    }

    // --- Sound Playback ---
    const sound1 = document.getElementById('sound-click-1');
    const sound2 = document.getElementById('sound-click-2');
    const soundInteract = document.getElementById('sound-interact');

    const playSound = (audioElement) => {
        if (audioElement && audioElement.readyState >= 2) { // Check if audio is ready
            audioElement.currentTime = 0;
            audioElement.play().catch(error => console.log("Audio play prevented:", error));
        } else if (audioElement) {
            console.warn("Audio element not ready:", audioElement.id);
        }
    };

    // --- Navigation & Button Click Sounds ---
    // Add sound to specific buttons without preventing navigation
    document.querySelectorAll('a.btn, .cta-buttons a, .footer-social a, .read-more').forEach(el => {
        // Exclude buttons that might have other specific interactions handled elsewhere (like modal triggers)
        if (!el.closest('.placeholder-video')) { // Example exclusion
            el.addEventListener('click', (e) => {
                // Determine which sound based on class or ID if needed
                // For simplicity, using sound1 for most link clicks
                playSound(sound1);
                console.log(`Link/Button clicked: ${el.href || el.id || 'Unknown'}`);
                // IMPORTANT: No preventDefault() here for standard links/buttons
            });
        }
    });

    // --- Hamburger Menu ---
    const hamburger = document.querySelector('.hamburger');
    const navLinks = document.querySelector('.nav-links'); // The container for mobile links
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

    if (hamburger && navLinks && mobileMenuOverlay) {
        hamburger.addEventListener('click', () => {
            playSound(sound1); // Sound on toggle
            const isActive = hamburger.classList.toggle('active');
            navLinks.classList.toggle('active', isActive);
            mobileMenuOverlay.classList.toggle('active', isActive);
            // Toggle body scroll based on menu state
            body.style.overflow = isActive ? 'hidden' : '';
        });

        mobileMenuOverlay.addEventListener('click', () => {
            closeMobileMenu();
        });

        // *** FIX: Handle clicks on links *inside* the mobile menu ***
        navLinks.querySelectorAll('a').forEach(link => {
            link.addEventListener('click', (e) => {
                // Play sound if desired
                 playSound(sound1);
                // Only close the menu if it's currently active (mobile view)
                if (hamburger.classList.contains('active')) {
                     console.log('Closing mobile menu on link click:', link.href);
                     closeMobileMenu();
                     // *** DO NOT call e.preventDefault() ***
                     // Let the browser handle the navigation to the link's href
                }
            });
        });

        function closeMobileMenu() {
            hamburger.classList.remove('active');
            navLinks.classList.remove('active');
            mobileMenuOverlay.classList.remove('active');
            body.style.overflow = ''; // Restore body scroll
        }

    } else {
        console.warn("Hamburger menu elements not found.");
    }


    // --- Dynamic Copyright Year ---
    const yearSpan = document.getElementById('copyright-year');
    if (yearSpan) {
        yearSpan.textContent = new Date().getFullYear();
    }

    // --- Love Counter Logic ---
    const loveButton = document.getElementById('love-it-button');
    const loveCounterSpan = document.getElementById('love-counter');
    if (loveButton && loveCounterSpan) {
        const localStorageKey = 'seticaLoveCount';
        const lovedStateKey = 'seticaLovedState';

        let currentLoveCount = parseInt(localStorage.getItem(localStorageKey) || '0');
        let userHasLoved = localStorage.getItem(lovedStateKey) === 'true';

        const updateLoveDisplay = () => {
            loveCounterSpan.textContent = currentLoveCount;
            loveButton.classList.toggle('loved', userHasLoved);
        };

        updateLoveDisplay(); // Initial display

        loveButton.addEventListener('click', () => {
            playSound(sound2); // Different sound for love?
            if (!userHasLoved) {
                currentLoveCount++;
                userHasLoved = true;
                localStorage.setItem(localStorageKey, currentLoveCount);
                localStorage.setItem(lovedStateKey, 'true');
                updateLoveDisplay();

                // Animation (requires GSAP)
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(loveButton.querySelector('.heart-icon'),
                        { scale: 1 },
                        { scale: 1.4, duration: 0.3, ease: 'back.out(3)', yoyo: true, repeat: 1 }
                    );
                }
            } else {
                console.log("User has already loved this.");
                // Optional shake effect (requires GSAP)
                if (typeof gsap !== 'undefined') {
                    gsap.fromTo(loveButton, { x: 0 }, { x: 5, duration: 0.1, repeat: 3, yoyo: true, clearProps: "x" });
                }
            }
        });
    } else {
         console.warn("Love counter elements not found.");
    }

    // --- Demo Video Modal Trigger ---
    // The modal creation/closing logic is now within initializeGsapFeatures
    // This just adds the listener to the trigger element
    const placeholderVideo = document.querySelector('.placeholder-video');
    if (placeholderVideo) {
        placeholderVideo.addEventListener('click', (e) => {
            e.preventDefault(); // Prevent any default link behavior
            playSound(soundClick1); // Play click sound
            // Check if the function exists (meaning GSAP loaded) before calling
            if (typeof openVideoModal === 'function') {
                openVideoModal();
            } else {
                alert('Video player requires JavaScript libraries to be loaded.');
            }
        });
    }

    // --- Interactive Hold Element ---
    const interactElement = document.getElementById('hold-interact-element');
    if (interactElement) {
        const pulseCircle = interactElement.querySelector('.pulse-circle');
        let pulseTimeout;
        let interactionStarted = false;

        const startInteraction = (e) => {
            e.preventDefault();
            if (interactionStarted) return;
            interactionStarted = true;
            if (pulseCircle) pulseCircle.classList.add('active');
            playSound(soundInteract); // Play hold sound immediately

            clearTimeout(pulseTimeout);
            pulseTimeout = setTimeout(() => {
                console.log("Hold interaction complete!");
                 if (typeof gsap !== 'undefined' && pulseCircle) {
                     gsap.to(pulseCircle, { scale: 1.15, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
                 }
            }, 700);
        };

        const endInteraction = () => {
            clearTimeout(pulseTimeout);
            if (interactionStarted) {
                 if (pulseCircle) pulseCircle.classList.remove('active');
                 if (typeof gsap !== 'undefined' && pulseCircle) {
                    gsap.to(pulseCircle, { scale: 1, duration: 0.3, ease: 'power1.out' });
                }
                interactionStarted = false;
            }
        };

        interactElement.addEventListener('mousedown', startInteraction);
        interactElement.addEventListener('mouseup', endInteraction);
        interactElement.addEventListener('mouseleave', endInteraction);
        interactElement.addEventListener('touchstart', startInteraction, { passive: false });
        interactElement.addEventListener('touchend', endInteraction);
        interactElement.addEventListener('touchcancel', endInteraction);
    }


    // ========================================================================
    // == GSAP-DEPENDENT FEATURES INITIALIZATION                           ==
    // ========================================================================
    function initializeGsapFeatures() {
        console.log("Initializing GSAP-dependent features...");

        // --- Smooth Scrolling Setup ---
        setupSmoothScrolling();

        // --- Nav Scroll Behavior ---
        setupNavScroll();

        // --- General Scroll Animations ---
        setupScrollAnimations();

        // --- Parallax Background ---
        setupParallax();

        // --- Particle Animation (Innovation Section) ---
        setupParticleAnimation();

        // --- Demo Video Modal ---
        setupVideoModal(); // Define the functions needed for the modal

        // --- Scroll Up Button ---
         setupScrollUpButton();

        // --- Solutions Carousel (If you add it back) ---
        // setupSolutionsCarousel();
    }


    // ========================================================================
    // == GSAP Helper Functions (called from initializeGsapFeatures)       ==
    // ========================================================================

    function setupSmoothScrolling() {
        const nav = document.querySelector('nav');
        let isScrolling = false;

        function scrollToTarget(target, offset = 0) {
            let targetElement;
            if (typeof target === 'number') {
                targetElement = target; // Direct scroll position
            } else if (typeof target === 'string') {
                targetElement = document.querySelector(target);
            } else {
                targetElement = target; // Assume it's already an element
            }

            if (targetElement === null || targetElement === undefined || isScrolling) return;

            isScrolling = true;
            let targetY;

            if (typeof targetElement === 'number') {
                 targetY = targetElement;
            } else {
                const navHeight = nav ? nav.offsetHeight : 70;
                const elementTop = targetElement.getBoundingClientRect().top + window.pageYOffset;
                targetY = elementTop - navHeight - 20 + offset; // Standard offset
            }

            targetY = Math.max(0, targetY); // Ensure not negative
            targetY = Math.min(targetY, ScrollTrigger.maxScroll(window)); // Ensure not past max scroll


            gsap.to(window, {
                scrollTo: { y: targetY, autoKill: true },
                duration: 1.2,
                ease: 'power2.inOut',
                onComplete: () => isScrolling = false,
                onInterrupt: () => isScrolling = false
            });
        }

        // Attach listeners to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            if (anchor.getAttribute('href') !== '#') { // Avoid empty hash links
                anchor.addEventListener('click', function(e) {
                    // Don't prevent default if it's inside the mobile menu (handled there)
                    if (!anchor.closest('.nav-links.active')) {
                        e.preventDefault();
                        const targetId = this.getAttribute('href');
                        scrollToTarget(targetId);
                         // Close mobile menu if open (safety check)
                         if (hamburger && hamburger.classList.contains('active')) {
                            closeMobileMenu();
                         }
                    }
                });
            }
        });

        // Scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                const firstSection = document.querySelector('header.hero + section');
                if (firstSection) {
                    scrollToTarget(firstSection);
                } else {
                    scrollToTarget(window.innerHeight * 0.8); // Scroll down a bit
                }
            });
        }

        // Expose scrollToTarget globally if needed (e.g., for onclick attributes, though not recommended)
        // window.scrollToTarget = scrollToTarget;
    }

    function setupNavScroll() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        ScrollTrigger.create({
            start: 'top -70',
            end: 99999,
            toggleClass: { className: 'scrolled', targets: nav }
            // Add onUpdate for hide/show logic if desired
        });
    }

    function setupScrollAnimations() {
        // Fade/slide in sections and elements
        gsap.utils.toArray('.section-header, .content-left, .content-right, .solution-card-large, .feature, .video-container, footer > .footer-container > div, .solutions-grid, .view-more-section, #demo .section-wrapper.single-column > h2').forEach(el => {
            gsap.from(el, {
                opacity: 0.1,
                y: 50,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%', // Trigger when 88% from top enters viewport
                    toggleActions: 'play none none none', // Play once
                    // markers: true, // For debugging
                    // once: true // More performant if animation only runs once
                }
            });
        });

         // Stagger children of specific containers if needed
         gsap.utils.toArray('.features, .solutions-grid').forEach(container => {
             if(container.children.length > 0) {
                 gsap.from(container.children, {
                     opacity: 0,
                     y: 40,
                     duration: 0.6,
                     ease: 'power2.out',
                     stagger: 0.1,
                     scrollTrigger: {
                         trigger: container,
                         start: 'top 85%',
                         toggleActions: 'play none none none',
                         // once: true
                     }
                 });
             }
         });
    }

    function animateHeroElements() {
         const heroHeading = document.querySelector('.hero h1.animate-text');
         const heroParagraph = document.querySelector('.hero p.animate-text-delay');
         const heroButtons = document.querySelectorAll('.hero .cta-buttons a'); // If you add buttons back
         const scrollIndicator = document.querySelector('.scroll-indicator');

         const tl = gsap.timeline({ delay: 0.3 }); // Start slightly after load

         if (heroHeading) tl.from(heroHeading, { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
         if (heroParagraph) tl.from(heroParagraph, { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, "-=0.8");
         if (heroButtons.length > 0) tl.from(heroButtons, { opacity: 0, y: 30, duration: 0.8, stagger: 0.15, ease: 'back.out(1.7)' }, "-=0.7");
         if (scrollIndicator) tl.from(scrollIndicator, { opacity: 0, y: 20, duration: 0.8, ease: 'power2.out'}, "-=0.6");
     }

    function setupParallax() {
        gsap.utils.toArray('.hero, .cosmic-section').forEach(section => {
            const stars = section.querySelector('.stars');
            const twinkling = section.querySelector('.twinkling');

            if (stars) {
                gsap.to(stars, {
                    backgroundPosition: "50% 150%",
                    ease: "none",
                    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 2 }
                });
            }
            if (twinkling) {
                gsap.to(twinkling, {
                    backgroundPosition: "50% 100%",
                    ease: "none",
                    scrollTrigger: { trigger: section, start: "top bottom", end: "bottom top", scrub: 3 }
                });
            }
        });
    }

    function setupParticleAnimation() {
        const container = document.querySelector('#innovation .content-right');
        if (!container) return;

        const canvas = document.createElement('canvas');
        container.innerHTML = ''; // Clear placeholder
        container.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationActive = false;
        let animationFrameId;
        let mouse = { x: null, y: null, radius: 100 };

        function resizeCanvas() {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
        }

        class Particle {
             constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.size = Math.random() * 4 + 1.5; // Slightly smaller range
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 30) + 5; // Adjusted density
                // Cooler color theme (blues, purples, teals)
                this.color = `hsl(${Math.random() * 80 + 180}, 90%, ${Math.random() * 30 + 55}%)`;
                this.opacity = Math.random() * 0.4 + 0.2;
                this.maxOpacity = this.opacity + 0.3; // Can get brighter near mouse
                this.velocity = { x: (Math.random() - 0.5) * 0.5, y: (Math.random() - 0.5) * 0.5 }; // Slower drift
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                if (force < 0) force = 0;
                let pushStrength = force * this.density * 0.05; // Softer push

                if (distance < mouse.radius && mouse.x !== null) {
                    this.x -= forceDirectionX * pushStrength;
                    this.y -= forceDirectionY * pushStrength;
                    this.opacity = Math.min(this.maxOpacity, this.opacity + 0.05); // Fade in
                } else {
                    // Return to base softly
                    if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 30;
                    if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 30;
                    // Fade out slightly
                    this.opacity = Math.max(this.maxOpacity * 0.4, this.opacity - 0.005);
                }
                // Drift
                this.x += this.velocity.x;
                this.y += this.velocity.y;

                // Boundary check (wrap around for smoother effect?)
                if (this.x < -this.size) this.x = canvas.width + this.size;
                else if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                else if (this.y > canvas.height + this.size) this.y = -this.size;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0, this.opacity);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }


        function initParticles(num) {
            particles = [];
            resizeCanvas(); // Ensure canvas size is current
            const count = num || Math.min(300, Math.floor(canvas.width * canvas.height / 800)); // Adjust density
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
             console.log(`Initialized ${particles.length} particles.`);
        }

        function animateParticles() {
            if (!animationActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
             ctx.globalAlpha = 1; // Reset alpha
            particles.forEach(p => { p.update(); p.draw(); });
            animationFrameId = requestAnimationFrame(animateParticles);
        }

        function handleMouseMove(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        }
        function handleMouseLeave() { mouse.x = null; mouse.y = null; }
        function handleTouchMove(event) {
             if (event.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = event.touches[0].clientX - rect.left;
                mouse.y = event.touches[0].clientY - rect.top;
             }
        }

        canvas.addEventListener('mousemove', handleMouseMove);
        canvas.addEventListener('mouseleave', handleMouseLeave);
        canvas.addEventListener('touchmove', handleTouchMove, { passive: true });
        canvas.addEventListener('touchend', handleMouseLeave);
        canvas.addEventListener('touchcancel', handleMouseLeave);


        // Observer to start/stop animation
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting && !animationActive) {
                    console.log("Starting particle animation");
                    animationActive = true;
                    initParticles(); // Initialize on first view or resize
                    animateParticles();
                } else if (!entry.isIntersecting && animationActive) {
                    console.log("Stopping particle animation");
                    animationActive = false;
                    cancelAnimationFrame(animationFrameId);
                }
            });
        }, { threshold: 0.05 }); // Trigger when 5% is visible

        observer.observe(container);

        // Handle resize
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animationActive) { // Only re-init if currently visible/active
                    console.log("Resizing particle canvas");
                    // Cancel existing animation before re-init to avoid issues
                    cancelAnimationFrame(animationFrameId);
                    initParticles();
                    animateParticles(); // Restart animation loop
                } else {
                    // If not active, just update dimensions for next time it becomes active
                    resizeCanvas();
                }
            }, 250); // Debounce resize
        });
    }

    // --- Video Modal Functions (Defined within initializeGsapFeatures) ---
    let videoModal = null;
    let videoIframe = null;

    function setupVideoModal() {
        // Define open/close functions here, making them accessible to the event listener added earlier
        window.openVideoModal = () => { // Assign to window to make it accessible globally from the listener
            if (videoModal) return;

            const youtubeVideoId = 'dQw4w9WgXcQ'; // Placeholder - CHANGE THIS
            if (!youtubeVideoId) { alert('Video ID not configured.'); return; }

            videoModal = document.createElement('div');
            videoModal.className = 'video-modal';
            videoModal.innerHTML = `
                <div class="video-modal-content">
                    <div class="video-loading" style="position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; background: #111; color: #fff; font-size: 1rem; z-index: 1;">Loading...</div>
                    <iframe style="opacity: 0; transition: opacity 0.5s ease 0.2s;" src="https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                <div class="close-video-modal" title="Close Video">×</div>`;
            document.body.appendChild(videoModal);
            document.body.style.overflow = 'hidden'; // Prevent background scroll

            videoIframe = videoModal.querySelector('iframe');
            const loadingIndicator = videoModal.querySelector('.video-loading');
            const closeBtn = videoModal.querySelector('.close-video-modal');

            videoIframe.onload = () => {
                if(loadingIndicator) loadingIndicator.style.display = 'none';
                videoIframe.style.opacity = '1';
            };

            gsap.fromTo(videoModal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.inOut', onStart: () => videoModal.classList.add('active') });
            gsap.fromTo(videoModal.querySelector('.video-modal-content'),
                { scale: 0.7, opacity: 0 },
                { scale: 1, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.7)' }
            );

            closeBtn.addEventListener('click', closeVideoModal);
            videoModal.addEventListener('click', (e) => { if (e.target === videoModal) closeVideoModal(); });
            document.addEventListener('keydown', handleEscKey);
        };

        window.closeVideoModal = () => { // Assign to window
            if (!videoModal) return;
            document.removeEventListener('keydown', handleEscKey);
            gsap.to(videoModal, {
                opacity: 0, duration: 0.3, ease: 'power1.inOut',
                onComplete: () => {
                    if (videoIframe && videoIframe.contentWindow) {
                        try { // Wrap in try/catch in case iframe is weird
                             videoIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
                        } catch (err) { console.error("Error stopping video:", err); }
                    }
                    if(videoModal.parentNode) videoModal.remove();
                    videoModal = null;
                    videoIframe = null;
                    document.body.style.overflow = ''; // Restore scroll
                }
            });
        };

        function handleEscKey(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                closeVideoModal();
            }
        }
    } // End setupVideoModal

     function setupScrollUpButton() {
        const scrollUpButton = document.createElement('div');
        scrollUpButton.className = 'scroll-up'; // Add a class for styling
        scrollUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        document.body.appendChild(scrollUpButton);

        gsap.set(scrollUpButton, { bottom: -60, opacity: 0, scale: 0.8 }); // Initial hidden state

        ScrollTrigger.create({
            trigger: 'body',
            start: "top -400", // Show after scrolling 400px
            end: 99999,
            onEnter: () => gsap.to(scrollUpButton, { bottom: 30, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)' }),
            onLeaveBack: () => gsap.to(scrollUpButton, { bottom: -60, opacity: 0, scale: 0.8, duration: 0.3, ease: 'power1.in' })
        });

        scrollUpButton.addEventListener('click', () => {
             if (typeof gsap !== 'undefined') {
                 gsap.to(window, { scrollTo: 0, duration: 1, ease: 'power2.inOut' });
             } else {
                 window.scrollTo({ top: 0, behavior: 'smooth' }); // Fallback
             }
        });
    }

    // --- End of DOMContentLoaded ---
    console.log("Setica base scripts initialized.");

}); // End DOMContentLoaded wrapper
