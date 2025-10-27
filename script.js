document.addEventListener('DOMContentLoaded', function() {
    const body = document.body;
    let videoModal = null;
    let videoIframe = null;

    // --- GSAP/ScrollTrigger Check ---
    let gsapLoaded = typeof gsap !== 'undefined';
    let scrollTriggerLoaded = typeof ScrollTrigger !== 'undefined';
    let scrollToPluginLoaded = typeof ScrollToPlugin !== 'undefined';

    if (!gsapLoaded || !scrollTriggerLoaded || !scrollToPluginLoaded) {
        console.error("GSAP or required plugins (ScrollTrigger, ScrollToPlugin) not fully loaded! Some animations and scroll effects may be disabled or use fallbacks.");
        if (!gsapLoaded) console.error("GSAP core is missing.");
        if (!scrollTriggerLoaded) console.error("ScrollTrigger plugin is missing.");
        if (!scrollToPluginLoaded) console.error("ScrollToPlugin is missing.");
        initializeNonGsapFeatures();
    } else {
        gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);
        console.log("GSAP and plugins registered.");
        initializeGsapFeatures();
        initializeNonGsapFeatures();
    }

    // --- Preloader ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        window.addEventListener('load', () => {
            if (gsapLoaded) {
                gsap.to(loaderWrapper, {
                    opacity: 0,
                    duration: 0.5,
                    ease: 'power1.out',
                    onComplete: finishLoading
                });
            } else {
                finishLoading();
            }
        });
        setTimeout(() => {
            if (body.classList.contains('loading')) {
                console.warn("Load event fallback triggered.");
                if (gsapLoaded) {
                    gsap.to(loaderWrapper, {opacity: 0, duration: 0.5, onComplete: finishLoading});
                } else {
                    finishLoading();
                }
            }
        }, 3500);
    } else {
        finishLoading();
    }

    function finishLoading() {
        if (loaderWrapper) {
            setTimeout(() => {
                 if (loaderWrapper) loaderWrapper.style.display = 'none';
            }, 500);
        }
        body.classList.remove('loading');
        body.classList.add('loaded');
        console.log("Page loaded sequence complete.");
        if (gsapLoaded) {
            animateHeroElements();
        } else {
            document.querySelectorAll('.animate-text, .animate-text-delay, .scroll-indicator').forEach(el => {
                el.style.opacity = 1;
            });
        }
    }

    // --- Sound Playback ---
    const sound1 = document.getElementById('sound-click-1');
    const sound2 = document.getElementById('sound-click-2');
    const soundInteract = document.getElementById('sound-interact');

    const playSound = (audioElement) => {
        if (audioElement && audioElement.readyState >= 2) {
            audioElement.currentTime = 0;
            audioElement.play().catch(error => console.warn("Audio play prevented:", error));
        } else if (audioElement) {
            console.warn("Audio element not ready or not found:", audioElement.id);
        }
    };

    // ========================================================================
    // == NON-GSAP & CONDITIONAL FEATURES INITIALIZATION                   ==
    // ========================================================================
    function initializeNonGsapFeatures() {
        console.log("Initializing non-GSAP & conditional features...");

        // --- Navigation & Button Click Sounds ---
        document.querySelectorAll('a.btn, .cta-buttons a, .footer-social a, .read-more, .nav-links a').forEach(el => {
            if (!el.closest('.placeholder-video')) {
                el.addEventListener('click', (e) => { playSound(sound1); });
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
                 body.style.overflow = isActive ? 'hidden' : '';
                 body.classList.toggle('menu-open', isActive);
             });
             mobileMenuOverlay.addEventListener('click', () => { closeMobileMenu(); });
             navLinks.querySelectorAll('a').forEach(link => {
                 link.addEventListener('click', (e) => {
                     const href = link.getAttribute('href');
                     if (!href || href === '#' || (href.startsWith('#') && href.length > 1 && hamburger.classList.contains('active'))) {
                         closeMobileMenu();
                     }
                 });
             });
             window.closeMobileMenu = function() {
                 if (hamburger.classList.contains('active')) {
                     playSound(sound2);
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

        // --- Love Button Functionality ---
        const initializeLoveButton = () => {
            const loveButton = document.getElementById('love-it-button');
            const loveCounterSpan = document.getElementById('love-counter');
        
            if (loveButton && loveCounterSpan) {
                const localStorageKey = 'seticaLoveCount';
                const lovedStateKey = 'seticaLovedState';
                let currentLoveCount = 0;
                
                // Generate a unique browser ID if not already saved
                const browserIdKey = 'seticaBrowserId';
                let browserId = localStorage.getItem(browserIdKey);
                if (!browserId) {
                    browserId = 'browser_' + Date.now() + '_' + Math.random().toString(36).substring(2, 15);
                    localStorage.setItem(browserIdKey, browserId);
                }
                
                // Check if this browser has loved already
                let userHasLoved = localStorage.getItem(lovedStateKey) === 'true';
        
                // Fetch the current count from the server on page load
                const fetchLoveCount = async () => {
                    try {
                        // Make sure the URL is correct - adjust if your API is on a different domain
                        const apiUrl = window.location.origin + '/api/love-count';
                        console.log('Fetching love count from:', apiUrl);
                        
                        const response = await fetch(apiUrl);
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Received love count from server:', data);
                            currentLoveCount = data.count;
                            updateLoveDisplay();
                        } else {
                            console.warn('Could not fetch love count from server. Status:', response.status);
                            // Try to get response text for better debugging
                            const errorText = await response.text();
                            console.warn('Error response:', errorText);
                            
                            // Fallback to local storage
                            const localCount = localStorage.getItem(localStorageKey);
                            if (localCount) {
                                currentLoveCount = parseInt(localCount, 10);
                            }
                            updateLoveDisplay();
                        }
                    } catch (err) {
                        console.error('Error fetching love count:', err);
                        // Fallback to local storage
                        const localCount = localStorage.getItem(localStorageKey);
                        if (localCount) {
                            currentLoveCount = parseInt(localCount, 10);
                        }
                        updateLoveDisplay();
                    }
                };
        
                const updateLoveDisplay = () => {
                    loveCounterSpan.textContent = currentLoveCount;
                    loveButton.classList.toggle('loved', userHasLoved);
                };
        
                // Initially fetch the count from server
                fetchLoveCount();
        
                loveButton.addEventListener('click', async () => {
                    // Play sound if available
                    const sound = document.getElementById('sound-click-2');
                    if (sound) {
                        sound.play().catch(e => console.warn('Could not play sound', e));
                    }
        
                    // Allow click regardless of local storage state for testing
                    // This ensures we can test the counter from the same browser
                    try {
                        // First update UI optimistically
                        currentLoveCount++;
                        userHasLoved = true;
                        updateLoveDisplay();
        
                        // Store in local storage
                        localStorage.setItem(lovedStateKey, 'true');
                        localStorage.setItem(localStorageKey, currentLoveCount.toString());
        
                        // Send request to increment count on server with browser ID
                        const apiUrl = window.location.origin + '/api/love-count/increment';
                        console.log('Sending increment request to:', apiUrl);
                        
                        const response = await fetch(apiUrl, {
                            method: 'POST',
                            headers: {
                                'Content-Type': 'application/json'
                            },
                            body: JSON.stringify({ 
                                browserId: browserId 
                            })
                        });
        
                        console.log('Server response status:', response.status);
                        
                        if (response.ok) {
                            const data = await response.json();
                            console.log('Server response after increment:', data);
                            // Update with server value
                            currentLoveCount = data.count;
                            updateLoveDisplay();
                        } else {
                            console.warn('Server returned error on increment:', response.status);
                            // Try to get more error details
                            const errorText = await response.text();
                            console.error('Error response:', errorText);
                        }
        
                        // Animation effects
                        const heartIcon = loveButton.querySelector('.heart-icon');
                        if (heartIcon) {
                            heartIcon.style.transform = 'scale(1.4)';
                            setTimeout(() => {
                                heartIcon.style.transform = 'scale(1)';
                            }, 300);
                        }
                    } catch (err) {
                        console.error('Error incrementing love count on server:', err);
                        // Keep the optimistic update
                    }
                });
            } else {
                console.warn("Love counter elements not found.");
            }
        };
        
        initializeLoveButton();

        // --- Demo Video Modal Trigger ---
        const placeholderVideo = document.querySelector('.placeholder-video');
        if (placeholderVideo) {
            placeholderVideo.addEventListener('click', (e) => {
                e.preventDefault();
                playSound(sound1);
                if (typeof openVideoModal === 'function') {
                    openVideoModal();
                } else {
                    alert('Video player cannot be opened.');
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
             let holdCompleteTween = null;

             const startInteraction = (e) => {
                 e.preventDefault();
                 if (interactionStarted) return;
                 interactionStarted = true;
                 if (pulseCircle) pulseCircle.classList.add('active');
                 playSound(soundInteract);
                 if (gsapLoaded && pulseCircle) {
                     if (holdCompleteTween) holdCompleteTween.kill();
                     holdCompleteTween = gsap.delayedCall(1.0, () => {
                         console.log("GSAP Hold complete!");
                         gsap.to(pulseCircle, { scale: 1.2, duration: 0.6, ease: 'elastic.out(1, 0.5)', overwrite: true });
                     });
                 } else if (pulseCircle) {
                     pulseCircle.style.transition = 'transform 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
                     pulseCircle.style.transform = 'scale(1.15)';
                 }
                 clearTimeout(pulseTimeout);
                 pulseTimeout = setTimeout(() => {
                     console.log("Fallback Hold complete!");
                 }, 1000);
             };

             const endInteraction = () => {
                 clearTimeout(pulseTimeout);
                 if (holdCompleteTween) {
                     holdCompleteTween.kill();
                     holdCompleteTween = null;
                 }
                 if (interactionStarted) {
                     if (pulseCircle) pulseCircle.classList.remove('active');
                     if (gsapLoaded && pulseCircle) {
                         gsap.to(pulseCircle, { scale: 1, duration: 0.3, ease: 'power1.out', overwrite: true });
                     } else if (pulseCircle) {
                         pulseCircle.style.transition = 'transform 0.3s ease-out';
                         pulseCircle.style.transform = 'scale(1)';
                     }
                     interactionStarted = false;
                 }
             };

             interactElement.addEventListener('pointerdown', startInteraction);
             interactElement.addEventListener('pointerup', endInteraction);
             interactElement.addEventListener('pointerleave', endInteraction);
             interactElement.addEventListener('pointercancel', endInteraction);
        }

        // --- Performance Optimizations (Basic) ---
        document.querySelectorAll('.btn, .feature, .footer-social a').forEach(el => {
            el.addEventListener('mouseenter', () => {
                el.style.willChange = 'transform, box-shadow';
            });
            el.addEventListener('mouseleave', () => {
                el.style.willChange = 'auto';
            });
        });

        document.addEventListener('visibilitychange', () => {
            const state = document.hidden ? 'paused' : 'running';
            document.querySelectorAll('.pulse-circle, .loader, .twinkling, .heart-icon').forEach(el => {
                el.style.animationPlayState = state;
            });
        });

        console.log("Non-GSAP & conditional features initialized.");
    }

    // ========================================================================
    // == GSAP-DEPENDENT FEATURES INITIALIZATION                           ==
    // ========================================================================
    function initializeGsapFeatures() {
        console.log("Initializing GSAP-dependent features...");
        setupSmoothScrolling();
        setupNavScroll();
        setupScrollAnimations();
        setupParallax();
        setupParticleAnimation();
        setupVideoModal();
        setupScrollUpButton();

        const interactElement = document.getElementById('hold-interact-element');
        if (interactElement) {
            const pulseCircle = interactElement.querySelector('.pulse-circle');
            let holdCompleteTween = null;

            interactElement.addEventListener('pointerdown', (e) => {
                if (pulseCircle) {
                    if (holdCompleteTween) holdCompleteTween.kill();
                    holdCompleteTween = gsap.delayedCall(1.0, () => {
                        console.log("GSAP Hold interaction complete!");
                        gsap.to(pulseCircle, {
                            scale: 1.2,
                            duration: 0.6,
                            ease: 'elastic.out(1, 0.5)',
                            overwrite: true
                        });
                    });
                }
            });

            ['pointerup', 'pointerleave', 'pointercancel'].forEach(eventType => {
                interactElement.addEventListener(eventType, () => {
                    if (holdCompleteTween) {
                        holdCompleteTween.kill();
                        holdCompleteTween = null;
                    }
                    if (pulseCircle) {
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
                targetElement = target;
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
                targetElement = target;
            }

            if (isScrolling) {
                return;
            }
            isScrolling = true;

            let targetY;
            const navHeight = nav ? nav.offsetHeight : 70;

            if (typeof targetElement === 'number') {
                targetY = targetElement;
            } else {
                const elementRect = targetElement.getBoundingClientRect();
                const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
                targetY = elementRect.top + scrollTop - navHeight - 20 + offset;
            }

            targetY = Math.max(0, targetY);
            const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
            targetY = Math.min(targetY, maxScroll);

            gsap.to(window, {
                scrollTo: { y: targetY, autoKill: true },
                duration: 1.2,
                ease: 'power2.inOut',
                onComplete: () => { isScrolling = false; },
                onInterrupt: () => { isScrolling = false; }
            });
        }

        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            const href = anchor.getAttribute('href');
            if (href && href.length > 1) {
                anchor.addEventListener('click', function(e) {
                    if (window.location.pathname === anchor.pathname || anchor.pathname === '') {
                        e.preventDefault();
                        playSound(sound1);
                        const targetId = this.getAttribute('href');
                        scrollToTarget(targetId);
                        if (typeof closeMobileMenu === 'function' && body.classList.contains('menu-open')) {
                            closeMobileMenu();
                        }
                    }
                });
            }
        });

        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                playSound(sound1);
                const firstSection = document.querySelector('header.hero + section');
                if (firstSection) {
                    scrollToTarget(firstSection);
                } else {
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
            start: 'top -80',
            end: 99999,
            toggleClass: { className: 'scrolled', targets: nav }
        });
    }

    function setupScrollAnimations() {
        console.log("Setting up scroll animations...");

        const standardAnimatedElements = gsap.utils.toArray(
            '.section-header, .content-left, .content-right, .feature, .video-container, footer > .footer-container > div, .view-more-section, #demo .section-wrapper.single-column > h2'
        );

        standardAnimatedElements.forEach(el => {
            if (el.querySelector('canvas')) return;

            gsap.from(el, {
                opacity: 0,
                y: 50,
                duration: 0.8,
                ease: 'power2.out',
                scrollTrigger: {
                    trigger: el,
                    start: 'top 88%',
                    toggleActions: 'play none none none',
                    once: true
                }
            });
        });

        const solutionCards = gsap.utils.toArray('.solution-card-large');
        solutionCards.forEach(card => {
            gsap.from(card, {
                opacity: 0,
                duration: 0.9,
                ease: 'power1.inOut',
                scrollTrigger: {
                    trigger: card,
                    start: 'top 90%',
                    toggleActions: 'play none none none',
                    once: true
                }
            });
        });

        gsap.utils.toArray('.features').forEach(container => {
            const items = container.querySelectorAll('.feature');
            if(items.length > 0) {
                gsap.from(items, {
                    opacity: 0,
                    y: 40,
                    duration: 0.6,
                    ease: 'power2.out',
                    stagger: 0.15,
                    scrollTrigger: {
                        trigger: container,
                        start: 'top 85%',
                        toggleActions: 'play none none none',
                        once: true
                    }
                });
            }
        });
    }

    function animateHeroElements() {
        console.log("Animating hero elements (Faster)...");
        const heroHeading = document.querySelector('.hero h1.animate-text');
        const heroParagraph = document.querySelector('.hero p.animate-text-delay');
        const scrollIndicator = document.querySelector('.scroll-indicator');
        const animatedBg = document.querySelector('.animated-bg'); // Keep background animation if desired

        // Reduce or remove the initial delay
        const tl = gsap.timeline({ delay: 0.1 }); // Significantly reduced delay (was 0.6)

        if (animatedBg) {
            // Keep background animation running independently
            gsap.to('.animated-bg', {
                backgroundPosition: '200% 200%',
                duration: 20,
                ease: 'none',
                repeat: -1,
                yoyo: true
            });
        }

        if (heroHeading) {
            // --- CHANGE: Animate H1 directly, remove character split ---
            // Remove the character splitting loop:
            // const chars = heroHeading.textContent.split('');
            // heroHeading.innerHTML = '';
            // chars.forEach(char => { ... });

            // Animate the whole H1 element at once
            tl.to(heroHeading, {
                opacity: 1,
                y: 0,
                duration: 0.4, // Faster duration (was 0.8 + stagger)
                ease: 'power1.out'
                // No stagger needed
            });
            // tl.set(heroHeading, { opacity: 1 }); // No longer needed with direct animation
        } else {
            tl.to({}, {duration: 0.01}); // Minimal placeholder if heading not found
        }

        if (heroParagraph) {
            // Make paragraph appear almost simultaneously or very shortly after H1
            tl.to(heroParagraph, {
                opacity: 1,
                y: 0,
                duration: 0.4, // Faster duration (was 1.0)
                ease: 'power1.out'
            }, "-=0.3"); // Reduced negative offset, appears sooner (was -=0.7)
        }

        if (scrollIndicator) {
            // Make scroll indicator appear quickly too
            tl.to(scrollIndicator, {
                opacity: 1,
                y: 0,
                duration: 0.5, // Faster duration
                ease: 'power1.out'
            }, "-=0.2"); // Reduced negative offset (was -=0.6)
        }
    }

    function setupParallax() {
        gsap.utils.toArray('.cosmic-section').forEach(section => {
            const stars = section.querySelector('.stars');
            const twinkling = section.querySelector('.twinkling');
            if (stars) {
                gsap.to(stars, {
                    backgroundPosition: "50% 150%",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 2
                    }
                });
            }
            if (twinkling) {
                gsap.to(twinkling, {
                    backgroundPosition: "-2000px 1000px",
                    ease: "none",
                    scrollTrigger: {
                        trigger: section,
                        start: "top bottom",
                        end: "bottom top",
                        scrub: 3
                    }
                });
            }
        });
        console.log("Parallax setup (Cosmic only).");
    }

    function setupParticleAnimation() {
        console.log("Setting up Particle Animation...");
        const container = document.querySelector('#innovation .particle-container');
        if (!container) {
            console.warn("Particle container (#innovation .particle-container) not found.");
            return;
        }

        const overlay = container.querySelector('.particle-overlay');

        const canvas = document.createElement('canvas');
        container.appendChild(canvas);

        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationActive = false;
        let animationFrameId;
        let mouse = { x: null, y: null, radius: 100 };
        let interactionTimeout;

        function calculateMouseRadius() {
            const width = container.clientWidth || 300;
            return Math.min(100, Math.max(60, width * 0.15));
        }

        function resizeCanvas() {
            canvas.width = container.clientWidth;
            canvas.height = container.clientHeight;
            mouse.radius = calculateMouseRadius();
            console.log(`Particle canvas resized: ${canvas.width}x${canvas.height}, Mouse Radius: ${mouse.radius}`);
        }

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.size = Math.random() * 2.5 + 1;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 8) + 4;
                this.color = ['#30cfd0', '#3498db', '#5352ed', '#2980b9'][Math.floor(Math.random() * 4)];
                this.targetOpacity = 0.6;
                this.currentOpacity = 0;
                this.vx = (Math.random() - 0.5) * 0.2;
                this.vy = (Math.random() - 0.5) * 0.2;
            }

            update() {
                if (this.currentOpacity < this.targetOpacity) {
                    this.currentOpacity += 0.02;
                }

                let dx = 0, dy = 0, distance = Infinity, forceX = 0, forceY = 0;

                if (mouse.x !== null) {
                    dx = mouse.x - this.x;
                    dy = mouse.y - this.y;
                    distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < mouse.radius && distance > 0) {
                        const forceDirectionX = dx / distance;
                        const forceDirectionY = dy / distance;
                        const proximityFactor = 1 - (distance / mouse.radius);
                        forceX = forceDirectionX * this.density * proximityFactor * 0.8;
                        forceY = forceDirectionY * this.density * proximityFactor * 0.8;
                        this.targetOpacity = 0.9;
                    } else {
                        this.targetOpacity = 0.6;
                    }
                } else {
                    this.targetOpacity = 0.6;
                }

                this.x -= forceX;
                this.y -= forceY;

                this.x += (this.baseX - this.x) * 0.01 + this.vx;
                this.y += (this.baseY - this.y) * 0.01 + this.vy;

                if (this.x < -10) this.x = canvas.width + 10;
                else if (this.x > canvas.width + 10) this.x = -10;
                if (this.y < -10) this.y = canvas.height + 10;
                else if (this.y > canvas.height + 10) this.y = -10;
            }

            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0, this.currentOpacity);
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            }
        }

        function initParticles() {
            particles = [];
            resizeCanvas();
            const particleCount = Math.min(120, Math.max(40, Math.floor((canvas.width * canvas.height) / 2500)));
            console.log(`Initializing ${particleCount} particles.`);
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            if (!animationActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.globalAlpha = 1;

            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        }

        function handlePointerMove(event) {
            event.preventDefault();
            const rect = canvas.getBoundingClientRect();
            let clientX, clientY;
            if (event.touches) {
                clientX = event.touches[0].clientX;
                clientY = event.touches[0].clientY;
            } else {
                clientX = event.clientX;
                clientY = event.clientY;
            }
            mouse.x = clientX - rect.left;
            mouse.y = clientY - rect.top;

            if (overlay) {
                container.classList.add('interacting');
                clearTimeout(interactionTimeout);
                interactionTimeout = setTimeout(() => {
                    container.classList.remove('interacting');
                }, 1500);
            }
        }

        function handlePointerLeave() {
            mouse.x = null;
            mouse.y = null;
        }

        canvas.addEventListener('pointermove', handlePointerMove);
        canvas.addEventListener('pointerleave', handlePointerLeave);
        canvas.addEventListener('touchmove', handlePointerMove, { passive: false });
        canvas.addEventListener('touchend', handlePointerLeave);
        canvas.addEventListener('touchcancel', handlePointerLeave);

        const observer = new IntersectionObserver(entries => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    if (!animationActive) {
                        console.log("Starting particle animation");
                        animationActive = true;
                        initParticles();
                        animate();
                    }
                } else {
                    if (animationActive) {
                        console.log("Stopping particle animation");
                        animationActive = false;
                        cancelAnimationFrame(animationFrameId);
                        particles = [];
                    }
                }
            });
        }, { threshold: 0.1 });
        observer.observe(container);

        let resizeTimer;
        window.addEventListener('resize', () => {
            clearTimeout(resizeTimer);
            resizeTimer = setTimeout(() => {
                console.log("Window resize detected for particles.");
                resizeCanvas();
                if (animationActive) {
                    initParticles();
                }
            }, 250);
        });

        resizeCanvas();
    }

    function setupVideoModal() {
        window.openVideoModal = () => {
            if (videoModal) return;
            const youtubeVideoId = 'dQw4w9WgXcQ';
            if (!youtubeVideoId) {
                alert('Video ID not configured.');
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
            document.body.style.overflow = 'hidden';
            videoIframe = videoModal.querySelector('iframe');
            const loadingIndicator = videoModal.querySelector('.video-loading');
            const closeBtn = videoModal.querySelector('.close-video-modal');
            const modalContent = videoModal.querySelector('.video-modal-content');

            videoIframe.onload = () => {
                if (loadingIndicator) loadingIndicator.style.display = 'none';
                videoIframe.style.opacity = '1';
            };
            setTimeout(() => {
                if (loadingIndicator && videoIframe.style.opacity === '0') {
                    loadingIndicator.style.display = 'none';
                    videoIframe.style.opacity = '1';
                }
            }, 3000);

            gsap.timeline()
                .to(videoModal, { opacity: 1, duration: 0.3, ease: 'power1.inOut', onStart: () => videoModal.classList.add('active') })
                .to(modalContent, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(1.7)' }, "-=0.1");

            closeBtn.addEventListener('click', closeVideoModal);
            videoModal.addEventListener('click', (e) => {
                if (e.target === videoModal) {
                    closeVideoModal();
                }
            });
            document.addEventListener('keydown', handleEscKey);
        };

        window.closeVideoModal = () => {
            if (!videoModal || !videoModal.parentNode) return;
            document.removeEventListener('keydown', handleEscKey);
            gsap.timeline({
                onComplete: () => {
                    if (videoIframe && videoIframe.contentWindow) {
                        try {
                            videoIframe.contentWindow.postMessage('{"event":"command","func":"stopVideo","args":""}', '*');
                        } catch (err) {
                            console.error("Error stopping video:", err);
                        }
                    }
                    videoModal.remove();
                    videoModal = null;
                    videoIframe = null;
                    document.body.style.overflow = '';
                }
            })
            .to(videoModal.querySelector('.video-modal-content'), { scale: 0.7, opacity: 0, duration: 0.3, ease: 'power1.in' })
            .to(videoModal, { opacity: 0, duration: 0.3, ease: 'power1.inOut' }, "-=0.2");
        };

        function handleEscKey(event) {
            if (event.key === 'Escape' || event.key === 'Esc') {
                closeVideoModal();
            }
        }
    }

    function setupScrollUpButton() {
        const scrollUpButton = document.createElement('div');
        scrollUpButton.className = 'scroll-up';
        scrollUpButton.innerHTML = '<i class="fas fa-arrow-up"></i>';
        scrollUpButton.setAttribute('aria-label', 'Scroll to top');
        scrollUpButton.setAttribute('role', 'button');
        document.body.appendChild(scrollUpButton);

        gsap.to(scrollUpButton, {
            scrollTrigger: {
                trigger: "body",
                start: "top -500",
                end: 99999,
                toggleClass: { targets: scrollUpButton, className: "visible" },
            },
        });

        scrollUpButton.addEventListener('click', () => {
            playSound(sound2);
            gsap.to(window, {
                scrollTo: { y: 0, autoKill: true },
                duration: 1.0,
                ease: 'power2.inOut'
            });
        });
    }

    // Create gradient spheres for background
    const animatedBg = document.getElementById('animated-bg');
    const colors = ['#30cfd0', '#5352ed', '#3498db', '#6e57ff'];

    // Create limited number of gradient spheres (performance optimization)
    for (let i = 0; i < 4; i++) {
        const sphere = document.createElement('div');
        sphere.classList.add('gradient-sphere');

        // Set random properties
        const size = Math.random() * 30 + 15;
        sphere.style.width = `${size}vw`;
        sphere.style.height = `${size}vw`;
        sphere.style.backgroundColor = colors[i % colors.length];
        sphere.style.left = `${Math.random() * 80 + 10}%`;
        sphere.style.top = `${Math.random() * 80 + 10}%`;
        sphere.style.opacity = Math.random() * 0.3 + 0.2;

        animatedBg.appendChild(sphere);

        // Animate each sphere separately with GSAP
        gsap.to(sphere, {
            x: `${Math.random() * 20 - 10}vw`,
            y: `${Math.random() * 20 - 10}vh`,
            duration: 8 + Math.random() * 10,
            ease: 'sine.inOut',
            repeat: -1,
            yoyo: true
        });
    }

    // Particle system
    const canvas = document.getElementById('particles-canvas');
    const ctx = canvas.getContext('2d');

    // Set canvas dimensions
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resizeCanvas();

    // Create particles
    const particleCount = Math.min(40, Math.max(20, Math.floor(window.innerWidth / 50)));
    const particles = [];

    class Particle {
        constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.size = Math.random() * 2 + 1;
            this.speedX = Math.random() * 0.5 - 0.25;
            this.speedY = Math.random() * 0.5 - 0.25;
            this.color = colors[Math.floor(Math.random() * colors.length)];
            this.alpha = Math.random() * 0.5 + 0.2;
        }

        update() {
            this.x += this.speedX;
            this.y += this.speedY;

            // Wrap around edges
            if (this.x < 0) this.x = canvas.width;
            if (this.x > canvas.width) this.x = 0;
            if (this.y < 0) this.y = canvas.height;
            if (this.y > canvas.height) this.y = 0;
        }

        draw() {
            ctx.globalAlpha = this.alpha;
            ctx.fillStyle = this.color;
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
            ctx.fill();
        }
    }

    // Initialize particles
    for (let i = 0; i < particleCount; i++) {
        particles.push(new Particle());
    }

    // Draw connections between particles that are close
    function drawConnections() {
        const maxDistance = 150;

        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < maxDistance) {
                    // Calculate line opacity based on distance
                    const opacity = 1 - (distance / maxDistance);
                    ctx.strokeStyle = `rgba(255, 255, 255, ${opacity * 0.15})`;
                    ctx.lineWidth = 1;
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.stroke();
                }
            }
        }
    }

    // Animation loop with optimized performance
    function animate() {
        // Clear canvas with slight fade effect for trails
        ctx.fillStyle = 'rgba(10, 10, 16, 0.1)';
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Update and draw particles
        particles.forEach(particle => {
            particle.update();
            particle.draw();
        });

        // Draw connections (only do this when browser isn't busy)
        if (!window.requestIdleCallback) {
            drawConnections();
        } else {
            requestIdleCallback(() => drawConnections());
        }

        requestAnimationFrame(animate);
    }

    // Handle window resize
    window.addEventListener('resize', () => {
        resizeCanvas();
    });

    // Start animation
    animate();

    // Disable animations when page is not visible
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            gsap.ticker.sleep();
        } else {
            gsap.ticker.wake();
        }
    });

    console.log("Setica base scripts initialized.");
});
