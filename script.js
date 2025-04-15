document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    let videoModal = null; // Declare globally for modal functions
    let videoIframe = null; // Declare globally for modal functions

    // --- GSAP/ScrollTrigger Check ---
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
        console.error("GSAP or its plugins (ScrollTrigger, ScrollToPlugin) are not loaded! Animations and scroll effects will be disabled.");
        // Fallback initialization if needed, or just let CSS handle things
        initializeNonGsapFeatures(); // Example: Initialize features that don't rely on GSAP
    } else {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        console.log("GSAP and plugins registered.");
        initializeGsapFeatures(); // Initialize GSAP-dependent things first
        initializeNonGsapFeatures(); // Then initialize others
    }

    // --- Preloader ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        window.addEventListener('load', () => {
            gsap.to(loaderWrapper, {
                opacity: 0,
                duration: 0.5,
                ease: 'power1.out',
                onComplete: () => {
                    loaderWrapper.style.display = 'none';
                    body.classList.remove('loading');
                    body.classList.add('loaded');
                    console.log("Page loaded, loader hidden.");
                    // Trigger animations only if GSAP is loaded
                    if (typeof gsap !== 'undefined') {
                        animateHeroElements();
                    }
                }
            });
        });
        // Fallback timeout
        setTimeout(() => {
            if (body.classList.contains('loading')) {
                console.warn("Load event fallback triggered.");
                gsap.to(loaderWrapper, {opacity: 0, duration: 0.5, onComplete: () => loaderWrapper.style.display = 'none'});
                body.classList.remove('loading');
                body.classList.add('loaded');
                if (typeof gsap !== 'undefined') {
                    animateHeroElements(); // Ensure hero animates even on fallback
                }
            }
        }, 3500);
    } else {
        // No loader? Just set body state
        body.classList.remove('loading');
        body.classList.add('loaded');
        if (typeof gsap !== 'undefined') {
            animateHeroElements(); // Animate hero immediately if no loader
        }
    }

    // --- Sound Playback ---
    const sound1 = document.getElementById('sound-click-1');
    const sound2 = document.getElementById('sound-click-2');
    const soundInteract = document.getElementById('sound-interact');

    const playSound = (audioElement) => {
        if (audioElement && audioElement.readyState >= 2) { // Check if ready
            audioElement.currentTime = 0;
            audioElement.play().catch(error => console.warn("Audio play prevented:", error));
        } else if (audioElement) {
            // Optional: Load if not ready? Be careful with this on user interaction
            // audioElement.load();
            console.warn("Audio element not ready or not found:", audioElement ? audioElement.id : 'unknown');
        }
    };

    // ========================================================================
    // == NON-GSAP FEATURES INITIALIZATION                                ==
    // ========================================================================
    function initializeNonGsapFeatures() {
        console.log("Initializing non-GSAP features...");

        // --- Navigation & Button Click Sounds ---
        document.querySelectorAll('a.btn, .cta-buttons a, .footer-social a, .read-more, .nav-links a').forEach(el => {
            if (!el.closest('.placeholder-video')) { // Avoid double sound on video click
                el.addEventListener('click', (e) => {
                    playSound(sound1);
                    // console.log(`Link/Button clicked: ${el.href || el.id || 'Unknown'}`);
                });
            }
        });

        // --- Hamburger Menu ---
        const hamburger = document.querySelector('.hamburger');
        const navLinks = document.querySelector('.nav-links');
        const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');

        if (hamburger && navLinks && mobileMenuOverlay) {
            hamburger.addEventListener('click', () => {
                playSound(sound1);
                const isActive = hamburger.classList.toggle('active');
                navLinks.classList.toggle('active', isActive);
                mobileMenuOverlay.classList.toggle('active', isActive);
                body.style.overflow = isActive ? 'hidden' : ''; // Prevent background scroll
                body.classList.toggle('menu-open', isActive); // Add class to body
            });

            mobileMenuOverlay.addEventListener('click', () => {
                closeMobileMenu();
            });

            navLinks.querySelectorAll('a').forEach(link => {
                link.addEventListener('click', (e) => {
                    // Sound already added above
                    // Check if it's a link within the page or to another page
                    const href = link.getAttribute('href');
                    if (href && href.startsWith('#') && href.length > 1) {
                         // It's an anchor link, close menu if active
                         if (hamburger.classList.contains('active')) {
                            closeMobileMenu();
                         }
                    } else if (!href || href === '#') {
                         // Links with no real destination or just '#'
                         if (hamburger.classList.contains('active')) {
                            closeMobileMenu();
                         }
                    }
                    // For external links or other pages, the page will navigate away anyway.
                });
            });

             window.closeMobileMenu = function() { // Make it globally accessible if needed elsewhere
                if (hamburger.classList.contains('active')) {
                    playSound(sound2); // Different sound for closing?
                    hamburger.classList.remove('active');
                    navLinks.classList.remove('active');
                    mobileMenuOverlay.classList.remove('active');
                    body.style.overflow = '';
                    body.classList.remove('menu-open');
                }
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
                playSound(sound2); // Use second click sound
                if (!userHasLoved) {
                    currentLoveCount++;
                    userHasLoved = true;
                    localStorage.setItem(localStorageKey, currentLoveCount);
                    localStorage.setItem(lovedStateKey, 'true');
                    updateLoveDisplay();

                    // Simple scale animation via class or direct style if GSAP not available/wanted
                    const heartIcon = loveButton.querySelector('.heart-icon');
                    if (heartIcon) {
                        heartIcon.style.transition = 'transform 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                        heartIcon.style.transform = 'scale(1.4)';
                        setTimeout(() => {
                             heartIcon.style.transform = 'scale(1)';
                        }, 300);
                    }

                } else {
                    console.log("User has already loved this.");
                    // Add a little shake animation using CSS/JS if GSAP not available
                    loveButton.style.transition = 'transform 0.1s ease-in-out';
                    let shakes = 0;
                    const interval = setInterval(() => {
                        loveButton.style.transform = `translateX(${shakes % 2 === 0 ? 4 : -4}px)`;
                        shakes++;
                        if (shakes > 3) {
                             clearInterval(interval);
                             loveButton.style.transform = 'translateX(0)';
                        }
                    }, 80);
                }
            });
        } else {
            console.warn("Love counter elements not found.");
        }

        // --- Demo Video Modal Trigger ---
        const placeholderVideo = document.querySelector('.placeholder-video');
        if (placeholderVideo) {
            placeholderVideo.addEventListener('click', (e) => {
                e.preventDefault(); // Prevent default link behavior if it were an anchor
                playSound(sound1);
                if (typeof openVideoModal === 'function') {
                    openVideoModal(); // Assumes openVideoModal is defined (likely in GSAP section)
                } else {
                    // Provide a fallback if GSAP/Modal code isn't loaded
                    alert('Video player cannot be opened. Required libraries might be missing.');
                    console.error('openVideoModal function not found.');
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
                e.preventDefault(); // Prevent text selection/dragging on hold
                if (interactionStarted) return;
                interactionStarted = true;
                if (pulseCircle) pulseCircle.classList.add('active');
                playSound(soundInteract); // Play hold sound

                // Optional: Add visual feedback using direct styles if GSAP not loaded
                if (typeof gsap === 'undefined' && pulseCircle) {
                   pulseCircle.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)'; // Elastic ease approx
                   pulseCircle.style.transform = 'scale(1.15)';
                }

                clearTimeout(pulseTimeout);
                // Slightly longer timeout to feel the hold
                pulseTimeout = setTimeout(() => {
                    console.log("Hold interaction complete!");
                    // Could trigger another effect here
                }, 1000);
            };

            const endInteraction = () => {
                clearTimeout(pulseTimeout);
                if (interactionStarted) {
                    if (pulseCircle) pulseCircle.classList.remove('active');

                    // Reset visual feedback if using direct styles
                    if (typeof gsap === 'undefined' && pulseCircle) {
                         pulseCircle.style.transition = 'transform 0.3s ease-out';
                         pulseCircle.style.transform = 'scale(1)';
                    }
                    interactionStarted = false;
                }
            };

            // Use pointer events for unified mouse/touch
            interactElement.addEventListener('pointerdown', startInteraction);
            interactElement.addEventListener('pointerup', endInteraction);
            interactElement.addEventListener('pointerleave', endInteraction); // End if pointer leaves element
            interactElement.addEventListener('pointercancel', endInteraction); // End on cancel
        }

        // --- Performance Optimizations (Basic) ---
        // Add will-change dynamically on hover for elements with transforms
        document.querySelectorAll('.btn, .feature, .footer-social a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.willChange = 'transform, box-shadow';
            });
            el.addEventListener('mouseleave', () => {
                el.style.willChange = 'auto';
            });
        });

        // Handle page visibility for CSS animations (basic pause)
        document.addEventListener('visibilitychange', () => {
            const state = document.hidden ? 'paused' : 'running';
            document.querySelectorAll('.pulse-circle, .loader, .twinkling, .heart-icon').forEach(el => {
                el.style.animationPlayState = state;
            });
        });

        console.log("Non-GSAP features initialized.");
    }


    // ========================================================================
    // == GSAP-DEPENDENT FEATURES INITIALIZATION                           ==
    // ========================================================================
    function initializeGsapFeatures() {
        console.log("Initializing GSAP-dependent features...");
        setupSmoothScrolling();
        setupNavScroll();
        setupScrollAnimations(); // Modified scroll animations
        setupParallax();
        setupParticleAnimation(); // Particle animation requires GSAP for smooth interaction potentially
        setupVideoModal(); // Modal uses GSAP for transitions
        setupScrollUpButton(); // Scroll up uses GSAP for animation

        // Add GSAP specific interactions if any (e.g., more complex hover effects)
        // Example: GSAP-powered pulse effect on hold completion
         const interactElement = document.getElementById('hold-interact-element');
         if (interactElement) {
            const pulseCircle = interactElement.querySelector('.pulse-circle');
            let holdCompleteTween = null; // Store the tween

            interactElement.addEventListener('pointerdown', (e) => {
                 // Check if GSAP is loaded before using it
                 if (typeof gsap !== 'undefined' && pulseCircle) {
                     // Kill previous completion tween if any
                     if (holdCompleteTween) holdCompleteTween.kill();

                     // Use GSAP 'delayedCall' for hold completion effect
                     holdCompleteTween = gsap.delayedCall(1.0, () => { // 1 second hold
                        console.log("GSAP Hold interaction complete!");
                        gsap.to(pulseCircle, {
                            scale: 1.2,
                            duration: 0.6,
                            ease: 'elastic.out(1, 0.5)',
                            overwrite: true // Ensure it overrides base scale
                        });
                     });
                 }
            });

            ['pointerup', 'pointerleave', 'pointercancel'].forEach(eventType => {
                interactElement.addEventListener(eventType, () => {
                    if (holdCompleteTween) {
                        holdCompleteTween.kill(); // Cancel the delayed call if pointer released early
                        holdCompleteTween = null;
                    }
                     // Use GSAP to smoothly return to normal scale
                    if (typeof gsap !== 'undefined' && pulseCircle) {
                        gsap.to(pulseCircle, {
                            scale: 1,
                            duration: 0.3,
                            ease: 'power1.out',
                            overwrite: true
                        });
                    }
                });
            });
         }


        console.log("GSAP features initialized.");
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
                targetElement = target; // Direct pixel value
            } else if (typeof target === 'string') {
                try {
                    targetElement = document.querySelector(target);
                    if (!targetElement) {
                        console.warn(`Scroll target element not found: ${target}`);
                        return;
                    }
                } catch (e) {
                    console.error(`Invalid selector for scroll target: ${target}`, e);
                    return;
                }
            } else {
                targetElement = target; // Assume it's a DOM element
            }

            if (isScrolling) {
                console.log("Scroll animation already in progress.");
                return; // Prevent overlapping animations
            }
            isScrolling = true;

            let targetY;
            const navHeight = nav ? nav.offsetHeight : 70; // Dynamic nav height

            if (typeof targetElement === 'number') {
                targetY = targetElement; // Use pixel value directly
            } else {
                // Calculate position relative to the document top
                const elementRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                targetY = elementRect.top + scrollTop - navHeight - 20 + offset; // Adjust for nav and add offset
            }

            // Clamp targetY to valid scroll range
            targetY = Math.max(0, targetY);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            targetY = Math.min(targetY, maxScroll);

            console.log(`Scrolling to: ${targetY}px`);

            gsap.to(window, {
                scrollTo: { y: targetY, autoKill: false }, // autoKill: false might be needed if clicks overlap quickly
                duration: 1.2, // Adjust duration as needed
                ease: 'power2.inOut',
                onComplete: () => { isScrolling = false; console.log("Scroll complete."); },
                onInterrupt: () => { isScrolling = false; console.log("Scroll interrupted."); }
            });
        }

        // Attach smooth scroll to anchor links
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href && href.length > 1) { // Ensure it's not just "#"
                anchor.addEventListener('click', function(e) {
                    // Prevent default only if the link is for the current page
                    if (window.location.pathname === anchor.pathname || anchor.pathname === '') {
                        e.preventDefault();
                        playSound(sound1); // Play sound on click
                        const targetId = this.getAttribute('href');
                        scrollToTarget(targetId);
                        // Close mobile menu if open
                        if (typeof closeMobileMenu === 'function' && document.body.classList.contains('menu-open')) {
                             closeMobileMenu();
                        }
                    }
                     // Let default behavior handle links to other pages
                });
            }
        });

        // Scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                playSound(sound1);
                const firstSection = document.querySelector('header.hero + section');
                if (firstSection) {
                    scrollToTarget(firstSection);
                } else {
                    // Fallback: scroll down by viewport height adjusted for nav
                     const navHeight = nav ? nav.offsetHeight : 70;
                     scrollToTarget(window.innerHeight - navHeight);
                }
            });
        }
    }

    function setupNavScroll() {
        const nav = document.querySelector('nav');
        if (!nav) return;
        ScrollTrigger.create({
            start: 'top -80', // Trigger slightly after scrolling starts
            end: 99999,
            toggleClass: { className: 'scrolled', targets: nav },
            // markers: true // uncomment for debugging
        });
    }

    function setupScrollAnimations() {
        console.log("Setting up scroll animations...");

        // --- Animation for most elements (Fade in + Slide up) ---
        const standardAnimatedElements = gsap.utils.toArray(
            '.section-header, .content-left, .content-right, .feature, .video-container, footer > .footer-container > div, .view-more-section, #demo .section-wrapper.single-column > h2'
        );

        standardAnimatedElements.forEach(el => {
             // Skip particle container if we handle it separately
             if (el.querySelector('canvas')) return;

            gsap.from(el, {
                opacity: 0, // Start fully transparent
                y: 50,      // Start 50px down
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%', // Trigger when 88% from top enters viewport
                    toggleActions: 'play none none none', // Play once on enter
                    // markers: true, // for debugging
                     once: true // Ensures the animation runs only once per element
                }
            });
        });

        // --- MODIFIED: Animation for Solution Cards (Only Fade in, NO slide up) ---
        const solutionCards = gsap.utils.toArray('.solution-card-large');
        solutionCards.forEach(card => {
            gsap.from(card, {
                opacity: 0, // Start fully transparent
                // y: 50, // <<<< REMOVED to prevent blur issue
                duration: 0.9, // Slightly longer duration for fade
                ease: 'power1.inOut', // Smooth fade ease
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%', // Adjust trigger point if needed
                    toggleActions: 'play none none none',
                    // markers: true, // for debugging
                     once: true // Play animation only once
                }
            });
        });

         // --- Stagger Animation Example (e.g., for .features grid) ---
         gsap.utils.toArray('.features').forEach(container => {
            const items = container.querySelectorAll('.feature');
            if(items.length > 0) {
                gsap.from(items, {
                    opacity: 0,
                    y: 40,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.15, // Stagger the animation for each item
                    scrollTrigger: {
                        trigger: container, // Trigger based on the container
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                        // markers: true,
                         once: true // Run stagger sequence once
                    }
                });
            }
        });

        // Note: Staggering '.solutions-grid .solution-card-large' was removed
        // to keep the simpler fade-in logic for those cards.
        // If you wanted stagger fade-in for solution cards, you'd adapt the above .features example.
    }


    function animateHeroElements() {
        console.log("Animating hero elements...");
        const heroHeading = document.querySelector('.hero h1.animate-text');
        const heroParagraph = document.querySelector('.hero p.animate-text-delay');
        // Select the buttons within the hero explicitly if needed, otherwise rely on generic button selection
        const heroButtons = document.querySelectorAll('.hero .cta-buttons a'); // Example if they exist
        const scrollIndicator = document.querySelector('.scroll-indicator');

        // Ensure elements exist before trying to animate them
        if (!heroHeading && !heroParagraph && !scrollIndicator) {
            console.warn("Hero elements for animation not found.");
            return;
        }

        const tl = gsap.timeline({ delay: 0.4 }); // Add a slight delay after load

        // Animate Heading
        if (heroHeading) {
            tl.from(heroHeading, {
                opacity: 0,
                y: 60, // Slightly more dramatic entrance
                duration: 1.2, // Longer duration
                ease: 'power3.out'
            });
        }

        // Animate Paragraph
        if (heroParagraph) {
            tl.from(heroParagraph, {
                opacity: 0,
                y: 50,
                duration: 1.0,
                ease: 'power3.out'
            }, "-=0.9"); // Overlap slightly with heading animation
        }

        // Animate Hero CTA Buttons (if they exist specifically in hero)
        if (heroButtons && heroButtons.length > 0) {
             tl.from(heroButtons, {
                opacity: 0,
                y: 30,
                duration: 0.8,
                stagger: 0.15, // Stagger if multiple buttons
                ease: 'back.out(1.7)' // Playful bounce
             }, "-=0.7");
        }

        // Animate Scroll Indicator
        if (scrollIndicator) {
             tl.from(scrollIndicator, {
                 opacity: 0,
                 y: 25,
                 duration: 0.8,
                 ease: 'power2.out'
             }, "-=0.6"); // Overlap slightly
        }
    }


    function setupParallax() {
        // Parallax for Hero Background (Subtle)
        gsap.to('.hero', {
            backgroundPosition: "50% 100%", // Move background image slightly on scroll
            ease: "none",
            scrollTrigger: {
                trigger: '.hero',
                start: "top top",
                end: "bottom top",
                scrub: 1.5 // Adjust scrub value for smoothness
            }
        });

        // Parallax for Cosmic Section Backgrounds (More pronounced)
        gsap.utils.toArray('.cosmic-section').forEach(section => {
            const stars = section.querySelector('.stars');
            const twinkling = section.querySelector('.twinkling');

            if (stars) {
                gsap.to(stars, {
                    backgroundPosition: "50% 150%", // Adjust Y position more
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom", // Start when section top enters bottom
                        end: "bottom top",   // End when section bottom leaves top
                        scrub: 2 // Slower scrub for background layer
                    }
                });
            }
            if (twinkling) {
                // Use existing CSS animation for twinkling, but maybe adjust speed slightly with scroll?
                 gsap.to(twinkling, {
                    // Example: Modulate animation speed or opacity slightly with scroll
                    // opacity: 0.8, // Could fade in/out based on scroll
                    // timeScale: 1.2, // Speed up animation slightly as you scroll through? Be careful with performance.
                     // Let's keep it simple and rely on CSS animation + background position scrub
                    backgroundPosition: "-2000px 1000px", // Adjust values for desired movement
                     ease: "none",
                     scrollTrigger: {
                         trigger: section,
                         start: "top bottom",
                         end: "bottom top",
                         scrub: 3 // Faster scrub for foreground layer
                     }
                 });
            }
        });
    }

    function setupParticleAnimation() {
        const container = document.querySelector('#innovation .content-right');
        if (!container) {
            console.warn("Particle animation container (#innovation .content-right) not found.");
            return;
        }

        // Check if canvas already exists (e.g., from previous init)
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            container.innerHTML = ''; // Clear placeholder text/content
            container.appendChild(canvas);
        }

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationActive = false;
        let animationFrameId;
        let mouse = { x: null, y: null, radius: calculateMouseRadius() }; // Dynamic radius

        function calculateMouseRadius() {
            // Adjust interaction radius based on container width
            const width = container.clientWidth || 300; // Default width if not available yet
            return Math.max(80, Math.min(150, width * 0.2)); // Clamp between 80px and 150px
        }

        function resizeCanvas() {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            mouse.radius = calculateMouseRadius(); // Recalculate radius on resize
            console.log(`Canvas resized: ${canvas.width}x${canvas.height}, Mouse Radius: ${mouse.radius}`);
        }

        class Particle {
            constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.size = Math.random() * 3.5 + 1; // Slightly smaller max size
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 20) + 10; // Adjusted density range
                this.color = `hsl(${Math.random() * 60 + 190}, 85%, ${Math.random() * 35 + 50}%)`; // Cooler color range (blues/cyans)
                this.opacity = Math.random() * 0.5 + 0.1; // Lower base opacity
                this.maxOpacity = Math.min(1, this.opacity + 0.4); // Max opacity capped at 1
                this.velocity = { x: (Math.random() - 0.5) * 0.4, y: (Math.random() - 0.5) * 0.4 }; // Slower base velocity
            }
            update() {
                let dx = mouse.x - this.x;
                let dy = mouse.y - this.y;
                let distance = Math.sqrt(dx * dx + dy * dy);
                let forceDirectionX = dx / distance;
                let forceDirectionY = dy / distance;
                let maxDistance = mouse.radius;
                let force = (maxDistance - distance) / maxDistance;
                force = Math.max(0, Math.min(1, force)); // Clamp force between 0 and 1

                let pushStrength = force * this.density * 0.08; // Adjusted interaction strength

                if (distance < mouse.radius && mouse.x !== null) {
                    // Use GSAP for smoother repulsion if available
                    if (typeof gsap !== 'undefined') {
                        gsap.to(this, {
                            x: this.x - forceDirectionX * pushStrength,
                            y: this.y - forceDirectionY * pushStrength,
                            opacity: this.maxOpacity,
                            duration: 0.3, // Duration for repulsion movement
                            ease: 'power1.out'
                        });
                    } else {
                        // Fallback to direct manipulation
                        this.x -= forceDirectionX * pushStrength;
                        this.y -= forceDirectionY * pushStrength;
                        this.opacity = Math.min(this.maxOpacity, this.opacity + 0.05);
                    }

                } else {
                     // Use GSAP for smoother return if available
                     if (typeof gsap !== 'undefined') {
                         gsap.to(this, {
                            x: this.baseX + this.velocity.x * 10, // Return towards base + velocity influence
                            y: this.baseY + this.velocity.y * 10,
                            opacity: this.maxOpacity * 0.5, // Fade back partially
                            duration: 1.5, // Longer duration for return
                            ease: 'power2.out'
                         });
                     } else {
                        // Fallback to direct manipulation for return
                        if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 40;
                        if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 40;
                         this.opacity = Math.max(this.maxOpacity * 0.2, this.opacity - 0.008);
                     }
                     // Apply base velocity drift even when returning
                    this.x += this.velocity.x * 0.5;
                    this.y += this.velocity.y * 0.5;
                }


                // Keep particles within bounds (simple wrap around)
                if (this.x < -this.size) this.x = canvas.width + this.size;
                else if (this.x > canvas.width + this.size) this.x = -this.size;
                if (this.y < -this.size) this.y = canvas.height + this.size;
                else if (this.y > canvas.height + this.size) this.y = -this.size;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0, this.opacity); // Ensure alpha is not negative
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles(num) {
            particles = [];
            resizeCanvas(); // Ensure canvas size is correct before creating particles
            // Calculate number based on area, but cap it for performance
            const area = canvas.width * canvas.height;
            const desiredCount = Math.floor(area / 900); // Adjust density factor
            const count = num || Math.min(250, Math.max(50, desiredCount)); // Cap between 50 and 250

            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
            console.log(`Initialized ${particles.length} particles.`);
        }

        function animateParticles() {
            if (!animationActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1; // Reset global alpha for drawing
            particles.forEach(p => {
                 if (typeof gsap === 'undefined') { // Only call update if not using GSAP for movement
                     p.update();
                 }
                 p.draw();
             });
            animationFrameId = requestAnimationFrame(animateParticles);
        }

        // --- Event Handlers for Mouse/Touch Interaction ---
         function handlePointerMove(event) {
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
         }
         function handlePointerLeave() { mouse.x = null; mouse.y = null; }

        // Use pointer events for unified handling
        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerleave', handlePointerLeave);

        // --- Intersection Observer to Start/Stop Animation ---
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationActive) {
                        console.log("Starting particle animation");
                        animationActive = true;
                        initParticles(); // Initialize particles when visible
                        animateParticles();
                    }
                } else {
                    if (animationActive) {
                        console.log("Stopping particle animation");
                        animationActive = false;
                        cancelAnimationFrame(animationFrameId);
                         // Optional: Clear canvas when not visible
                         // ctx.clearRect(0, 0, canvas.width, canvas.height);
                         // Optional: Kill GSAP tweens if using GSAP for particle movement
                         if (typeof gsap !== 'undefined') {
                            particles.forEach(p => gsap.killTweensOf(p));
                         }
                    }
                }
            });
        }, { threshold: 0.1 }); // Trigger when 10% is visible

        observer.observe(container);

        // --- Debounced Resize Handler ---
        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                if (animationActive) {
                    // If active, restart the animation with new dimensions
                    console.log("Resizing particle canvas and reinitializing.");
                    cancelAnimationFrame(animationFrameId);
                     // Kill GSAP tweens before reinitializing
                     if (typeof gsap !== 'undefined') {
                        particles.forEach(p => gsap.killTweensOf(p));
                     }
                    initParticles();
                    animateParticles();
                } else {
                    // If inactive, just resize the canvas dimensions
                    resizeCanvas();
                }
            }, 250);
        });
    }


    function setupVideoModal() {
        // Make functions globally accessible IF needed by inline HTML, but better to trigger via JS selectors
        window.openVideoModal = () => {
            if (videoModal) return; // Prevent opening multiple modals

            const youtubeVideoId = 'dQw4w9WgXcQ'; // Replace with your actual YouTube video ID
            if (!youtubeVideoId) {
                alert('Video ID not configured.');
                console.error('YouTube Video ID is missing.');
                return;
            }

            videoModal = document.createElement('div');
            videoModal.className = 'video-modal';
            videoModal.innerHTML = `
                <div class="video-modal-content">
                    <div class="video-loading" style="position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; background: #111; color: #fff; font-size: 1rem; z-index: 1; border-radius: var(--border-radius);">Loading Video...</div>
                    <iframe style="opacity: 0; transition: opacity 0.5s ease 0.2s; border-radius: var(--border-radius);" src="https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
                </div>
                <div class="close-video-modal" title="Close Video">×</div>`;
            document.body.appendChild(videoModal);
            document.body.style.overflow = 'hidden'; // Prevent background scroll

            videoIframe = videoModal.querySelector('iframe');
            const loadingIndicator = videoModal.querySelector('.video-loading');
            const closeBtn = videoModal.querySelector('.close-video-modal');
            const modalContent = videoModal.querySelector('.video-modal-content');

            // Hide loader and show iframe when loaded
            videoIframe.onload = () => {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                videoIframe.style.opacity = '1';
            };
            // Fallback if onload doesn't fire quickly
            setTimeout(() => {
                 if (loadingIndicator && videoIframe.style.opacity === '0') {
                     loadingIndicator.style.display = 'none';
                     videoIframe.style.opacity = '1';
                 }
            }, 3000);


            // GSAP Animations for modal entrance
             gsap.timeline()
                 .to(videoModal, { opacity: 1, duration: 0.3, ease: 'power1.inOut', onStart: () => videoModal.classList.add('active') })
                 .to(modalContent, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, "-=0.1");


            // Event listeners for closing
            closeBtn.addEventListener('click', closeVideoModal);
            videoModal.addEventListener('click', (e) => {
                // Close only if clicking the background overlay, not the content/iframe
                if (e.target === videoModal) {
                    closeVideoModal();
                }
            });
            document.addEventListener('keydown', handleEscKey);
        };

        window.closeVideoModal = () => {
            if (!videoModal || !videoModal.parentNode) return; // Ensure modal exists and is in DOM

            document.removeEventListener('keydown', handleEscKey);

            gsap.timeline({
                onComplete: () => {
                    // Attempt to stop the video using YouTube IFrame Player API
                    if (videoIframe && videoIframe.contentWindow) {
                        try {
                            // Check if YT object and Player are ready might be complex without API callbacks
                            // Simple postMessage attempt
                            videoIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
                        } catch (err) {
                            console.error("Error attempting to stop video via postMessage:", err);
                        }
                    }
                    // Remove modal from DOM after animation
                    videoModal.remove();
                    videoModal = null; // Clear reference
                    videoIframe = null; // Clear reference
                    document.body.style.overflow = ''; // Restore background scroll
                    console.log("Video modal closed and removed.");
                }
            })
            .to(videoModal.querySelector('.video-modal-content'), { scale: 0.7, opacity: 0, duration: 0.3, ease: 'power1.in' })
            .to(videoModal, { opacity: 0, duration: 0.3, ease: 'power1.inOut' }, "-=0.2"); // Overlap opacity fade slightly
        };

        // ESC key handler
        function handleEscKey(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                closeVideoModal();
            }
        }
    }


    function setupScrollUpButton() {
        const scrollUpButton = document.createElement('div');
        scrollUpButton.className = 'scroll-up'; // Style using this class in CSS
        scrollUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollUpButton.setAttribute('aria-label', 'Scroll to top');
        scrollUpButton.setAttribute('role', 'button');
        scrollUpButton.style.visibility = 'hidden'; // Start hidden
        document.body.appendChild(scrollUpButton);

        // Use GSAP for smooth appearance/disappearance tied to scroll position
        gsap.to(scrollUpButton, {
            scrollTrigger: {
                trigger: "body", // Trigger based on body scrolling
                start: "top -500", // Show button after scrolling down 500px
                end: 99999,
                toggleClass: { targets: scrollUpButton, className: "visible" }, // Use class for visibility/styles
                onEnter: () => gsap.to(scrollUpButton, { autoAlpha: 1, y: 0, duration: 0.4, ease: 'power2.out' }),
                onLeaveBack: () => gsap.to(scrollUpButton, { autoAlpha: 0, y: 20, duration: 0.3, ease: 'power1.in' })
            },
            // Initial state (set directly or via CSS)
             autoAlpha: 0, // GSAP's way of handling opacity + visibility
             y: 20 // Start slightly down
        });

        // Click event to scroll smoothly to top
        scrollUpButton.addEventListener('click', () => {
             playSound(sound2); // Click sound
             gsap.to(window, {
                scrollTo: { y: 0, autoKill: true },
                duration: 1.0, // Duration for scroll-to-top
                ease: 'power2.inOut'
             });
        });

        // Add styles for the .visible class if needed (though autoAlpha handles visibility)
        // Example in CSS:
        // .scroll-up { opacity: 0; visibility: hidden; transform: translateY(20px); ... }
        // .scroll-up.visible { opacity: 1; visibility: visible; transform: translateY(0px); ... }
        // GSAP's autoAlpha handles opacity and visibility, 'y' handles transform
    }

    // --- Final Log ---
    console.log("Setica base scripts initialized.");

}); // End DOMContentLoaded