document.addEventListener('DOMContentLoaded', function() {
    // Check if GSAP and plugins are loaded
    if (typeof gsap === 'undefined' || typeof ScrollTrigger === 'undefined' || typeof ScrollToPlugin === 'undefined') {
        console.error("GSAP or its plugins (ScrollTrigger, ScrollToPlugin) are not loaded!");
        return;
    }

    // Initialize GSAP and Plugins
    gsap.registerPlugin(ScrollTrigger, ScrollToPlugin);

    // --- PRELOADER ---
    const loaderWrapper = document.querySelector('.loader-wrapper');
    if (loaderWrapper) {
        // Use GSAP for fade out controlled by window load
        gsap.to(loaderWrapper, {
            opacity: 0,
            duration: 0.8,
            delay: 0.3, // Slight delay after content might be visible
            ease: 'power1.out',
            onComplete: () => {
                loaderWrapper.style.display = 'none'; // Hide completely
                document.body.classList.remove('loading'); // Remove loading class from body
                document.body.classList.add('loaded');
                // Trigger entry animations after load
                animateHeroElements();
                // Trigger general scroll animations setup after load
                setupScrollAnimations();
                 // Ensure initial states are correct after loading
                setupSmoothScrolling(); // Re-check links after potential dynamic content
            }
        });
         // Fallback if window.load doesn't fire quickly or correctly
        setTimeout(() => {
            if (document.body.classList.contains('loading')) {
                console.warn("Load event fallback triggered.");
                 gsap.to(loaderWrapper, {opacity: 0, duration: 0.5, onComplete: () => loaderWrapper.style.display = 'none'});
                document.body.classList.remove('loading');
                document.body.classList.add('loaded');
                animateHeroElements();
                setupScrollAnimations();
                 setupSmoothScrolling();
            }
        }, 3000); // Max wait 3 seconds

    } else {
        // If no loader, trigger animations immediately
         document.body.classList.remove('loading'); // Ensure class is removed
         document.body.classList.add('loaded');
        animateHeroElements();
        setupScrollAnimations();
        setupSmoothScrolling(); // Setup scrolling immediately
    }

    // --- NAVIGATION ---
    const nav = document.querySelector('nav');
    let lastScrollTop = 0; // For hiding nav on scroll down
    if (nav) {
        ScrollTrigger.create({
            start: 'top -70', // A bit past the top
            end: 99999,
            onUpdate: self => {
                const currentScrollTop = self.scroll();
                // Add scrolled class for background change
                 if (currentScrollTop > 60) {
                     nav.classList.add('scrolled');
                 } else {
                     nav.classList.remove('scrolled');
                 }

                 // Hide/show nav on scroll direction change (optional)
                 // Uncomment if you want the nav to hide on scroll down
                 /*
                 if (currentScrollTop > lastScrollTop && currentScrollTop > nav.offsetHeight * 2) {
                     // Scrolling Down
                     gsap.to(nav, { y: -nav.offsetHeight, duration: 0.3, ease: 'power1.out' });
                 } else {
                      // Scrolling Up or near top
                     gsap.to(nav, { y: 0, duration: 0.3, ease: 'power1.out' });
                 }
                 lastScrollTop = currentScrollTop <= 0 ? 0 : currentScrollTop; // For Mobile or negative scrolling
                 */
            }
            // Note: toggleClass might conflict with the hide/show logic if enabled
            // toggleClass: { className: 'scrolled', targets: nav }
        });
    }

    // Add this to your existing script.js file or replace the current hamburger menu functionality



    // --- SMOOTH SCROLLING HELPER ---
     let isScrolling = false; // Flag to prevent overlapping scroll animations

    function scrollToTarget(targetId, callback = null) {
        if (!targetId || targetId === '#' || isScrolling) return; // Prevent scroll if already scrolling

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
             isScrolling = true; // Set flag
             const navHeight = nav ? nav.offsetHeight : 70; // Get current nav height
            // Calculate target Y position carefully
            // Use ScrollTrigger's utility if available or calculate manually
             let targetY;
             try {
                  targetY = ScrollTrigger.maxScroll(window) < targetElement.offsetTop + navHeight + 20 ?
                      ScrollTrigger.maxScroll(window) :
                      targetElement.offsetTop - navHeight - 20; // Adjust offset as needed
             } catch(e) {
                 targetY = targetElement.offsetTop - navHeight - 20; // Fallback calculation
             }

             targetY = Math.max(0, targetY); // Ensure targetY is not negative


            gsap.to(window, {
                duration: 1.2, // Adjust duration
                scrollTo: {
                    y: targetY, // Use calculated offset
                    autoKill: true // Kill existing scrolls to this target
                },
                ease: 'power3.inOut', // Smoother ease
                onComplete: () => {
                     isScrolling = false; // Reset flag
                    if (callback && typeof callback === 'function') {
                        callback();
                    }
                 },
                 onInterrupt: () => { // Handle scroll interruption by user
                     isScrolling = false;
                 }
            });
        } else {
            console.warn('Scroll target not found:', targetId);
             isScrolling = false; // Reset flag even if target not found
            if (callback && typeof callback === 'function') {
                 callback();
            }
        }
    }

    // --- SETUP SMOOTH SCROLL EVENT LISTENERS ---
    function setupSmoothScrolling() {
         document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            // Ensure it's not a mobile menu link (handled separately)
             if (!anchor.closest('.mobile-menu')) {
                anchor.addEventListener('click', function (e) {
                    e.preventDefault();
                    const targetId = this.getAttribute('href');
                    scrollToTarget(targetId);
                });
            }
        });
         // Handle scroll indicator click
        const scrollIndicator = document.querySelector('.scroll-indicator');
        if (scrollIndicator) {
            scrollIndicator.addEventListener('click', () => {
                 // Target the first actual section after the header
                const firstSection = document.querySelector('header + section');
                if (firstSection && firstSection.id) {
                    scrollToTarget(`#${firstSection.id}`);
                } else {
                     console.warn("Could not find the first section after the header to scroll to.");
                     scrollToTarget(0); // Scroll to top as fallback
                }
            });
        }
    }
    // setupSmoothScrolling() is called after loader logic finishes.


    // --- HERO ANIMATION ---
    function animateHeroElements() {
        const heroHeading = document.querySelector('.hero h1');
        const heroParagraph = document.querySelector('.hero p');
        const heroButtons = document.querySelectorAll('.hero .cta-buttons a');
        const scrollIndicator = document.querySelector('.scroll-indicator');

        const tl = gsap.timeline({ delay: 0.2 }); // Reduce delay slightly

        if (heroHeading) tl.from(heroHeading, { opacity: 0, y: 50, duration: 1, ease: 'power3.out' });
        if (heroParagraph) tl.from(heroParagraph, { opacity: 0, y: 40, duration: 1, ease: 'power3.out' }, "-=0.8");
        if (heroButtons.length > 0) tl.from(heroButtons, { opacity: 0, y: 40, duration: 0.8, stagger: 0.2, ease: 'power3.out' }, "-=0.7");
        if (scrollIndicator) tl.from(scrollIndicator, { opacity: 0, y: 30, duration: 0.8, ease: 'power2.out'}, "-=0.6");
    }

    // --- EXPLOSION/PARTICLE ANIMATION (Innovation Section) ---
     const explosionAnimationContainer = document.querySelector('.explosion-animation');

     if (explosionAnimationContainer) {
        let particleAnimationId;
        const canvas = document.createElement('canvas');
        explosionAnimationContainer.innerHTML = ''; // Clear placeholder
        explosionAnimationContainer.appendChild(canvas);
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationActive = false;
        let mouse = { x: null, y: null, radius: 100 }; // Increased radius

        function resizeCanvas() {
            canvas.width = explosionAnimationContainer.clientWidth;
            canvas.height = explosionAnimationContainer.clientHeight;
        }

        class Particle {
            constructor(x, y) {
                this.x = x || Math.random() * canvas.width;
                this.y = y || Math.random() * canvas.height;
                this.size = Math.random() * 5 + 2;
                this.baseX = this.x;
                this.baseY = this.y;
                this.density = (Math.random() * 40) + 5; // Wider range
                this.color = `hsl(${Math.random() * 60 + 200}, 100%, ${Math.random() * 40 + 50}%)`; // Cooler tones (Blues/Purples)
                this.opacity = Math.random() * 0.5 + 0.3; // Start partially transparent
                this.maxOpacity = this.opacity;
                this.velocity = { x: (Math.random() - 0.5) * 1, y: (Math.random() - 0.5) * 1 };
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

                if (distance < mouse.radius) {
                     let pushStrength = force * this.density * 0.1; // Adjusted push strength
                     this.x -= forceDirectionX * pushStrength;
                     this.y -= forceDirectionY * pushStrength;
                    this.opacity = this.maxOpacity; // Become fully visible near mouse
                 } else {
                     // Return to base
                     if (this.x !== this.baseX) this.x -= (this.x - this.baseX) / 20;
                     if (this.y !== this.baseY) this.y -= (this.y - this.baseY) / 20;
                     // Fade slightly when away from mouse
                     this.opacity = Math.max(this.maxOpacity * 0.5, this.opacity - 0.01);
                 }
                 // Gentle drift
                 this.x += this.velocity.x;
                 this.y += this.velocity.y;

                 // Keep within bounds slightly more aggressively
                 if (this.x < 0 || this.x > canvas.width) this.velocity.x *= -0.9;
                 if (this.y < 0 || this.y > canvas.height) this.velocity.y *= -0.9;
            }
            draw() {
                ctx.fillStyle = this.color;
                ctx.globalAlpha = Math.max(0, this.opacity); // Clamp opacity
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.closePath();
                ctx.fill();
            }
        }

        function initParticles(num) {
            particles = [];
            const count = num || Math.min(400, Math.floor(canvas.width * canvas.height / 600));
            for (let i = 0; i < count; i++) {
                particles.push(new Particle());
            }
        }

        function animateParticles() {
            if (!animationActive) return;
            ctx.clearRect(0, 0, canvas.width, canvas.height);
             ctx.globalAlpha = 1; // Reset alpha for drawing
            particles.forEach(particle => {
                particle.update();
                particle.draw();
            });
            particleAnimationId = requestAnimationFrame(animateParticles);
        }

        canvas.addEventListener('mousemove', function(event){
            const rect = canvas.getBoundingClientRect();
            mouse.x = event.clientX - rect.left;
            mouse.y = event.clientY - rect.top;
        });
        canvas.addEventListener('mouseleave', function() { mouse.x = null; mouse.y = null; });
         // Add touch support
         canvas.addEventListener('touchmove', function(event) {
            if (event.touches.length > 0) {
                const rect = canvas.getBoundingClientRect();
                mouse.x = event.touches[0].clientX - rect.left;
                mouse.y = event.touches[0].clientY - rect.top;
             }
         }, { passive: true });
         canvas.addEventListener('touchend', function() { mouse.x = null; mouse.y = null; });

        // Use Intersection Observer for better performance control
        const observer = new IntersectionObserver((entries) => {
             entries.forEach(entry => {
                if (entry.isIntersecting) {
                     if (!animationActive) {
                         console.log("Starting particle animation");
                         animationActive = true;
                         resizeCanvas(); // Ensure size is correct
                         initParticles(); // Re-initialize or adjust as needed
                         animateParticles();
                     }
                 } else {
                     if (animationActive) {
                         console.log("Stopping particle animation");
                         animationActive = false;
                         cancelAnimationFrame(particleAnimationId);
                     }
                 }
             });
        }, { threshold: 0.1 }); // Trigger when 10% is visible

        observer.observe(explosionAnimationContainer);
        window.addEventListener('resize', () => {
             if (animationActive) { // Only resize/reinit if currently active
                 resizeCanvas();
                 initParticles();
             }
        });

     } // End particle animation setup

    // --- METRICS COUNTER (REMOVED) ---
    // Code related to .metric-number and its ScrollTrigger can be deleted.

    // --- PULSE INTERACTION (Digital Frontiers) ---
    const pulseCircle = document.querySelector('.pulse-circle');
    if (pulseCircle) {
        let pulseTimeout;
        let interactionStarted = false;

        const startInteraction = (e) => {
            e.preventDefault(); // Prevent default behavior (like text selection or dragging)
            if (interactionStarted) return;
            interactionStarted = true;
            pulseCircle.classList.add('active'); // Visual feedback: darker bg maybe
             // Optional: Stop the CSS pulse animation
             // pulseCircle.style.animationPlayState = 'paused';
            clearTimeout(pulseTimeout); // Clear any existing timeout
            pulseTimeout = setTimeout(() => {
                 console.log("Hold interaction action!");
                 // Trigger the sound from the inline script or here
                 // playSound(soundInteract); // If you move sound logic here
                 gsap.to(pulseCircle, { scale: 1.15, duration: 0.5, ease: 'elastic.out(1, 0.6)' });
             }, 700); // Hold duration
        };

        const endInteraction = () => {
            clearTimeout(pulseTimeout);
            if (interactionStarted) {
                 pulseCircle.classList.remove('active');
                 // Optional: Resume the CSS pulse animation
                 // pulseCircle.style.animationPlayState = 'running';
                 gsap.to(pulseCircle, { scale: 1, duration: 0.3, ease: 'power1.out' });
                 interactionStarted = false;
            }
        };

        // Add event listeners
        pulseCircle.addEventListener('mousedown', startInteraction);
        pulseCircle.addEventListener('mouseup', endInteraction);
        pulseCircle.addEventListener('mouseleave', endInteraction);
        pulseCircle.addEventListener('touchstart', startInteraction, { passive: false }); // Need false to preventDefault
        pulseCircle.addEventListener('touchend', endInteraction);
        pulseCircle.addEventListener('touchcancel', endInteraction);
    }


    // --- SOLUTIONS CAROUSEL ---
    const carouselContainer = document.querySelector('.carousel-container');
    const carouselTrack = document.querySelector('.carousel-track');

     if (carouselContainer && carouselTrack && carouselTrack.children.length > 0) { // Check children exist
         const carouselItems = Array.from(carouselTrack.children);
         const prevBtn = document.querySelector('.prev-btn');
         const nextBtn = document.querySelector('.next-btn');

         let itemWidth = 0;
         let currentIndex = 0;
         let visibleItems = 3;
         let totalItems = carouselItems.length;
         let maxIndex = 0; // Will be calculated
         let isDragging = false;
         let startPosX = 0;
         let currentTranslate = 0;
         let prevTranslate = 0;
         let animationID;
         const dragThreshold = 30; // Minimum pixels to drag to change slide

         function calculateDimensions() {
             if (!carouselItems[0]) return 0; // Safety check
            const style = window.getComputedStyle(carouselItems[0]);
             const itemMargin = parseFloat(style.marginLeft) + parseFloat(style.marginRight);
            itemWidth = carouselItems[0].offsetWidth + itemMargin; // Include margins
            const containerWidth = carouselContainer.offsetWidth;

             // Adjust visible items based on viewport
             if (window.innerWidth < 600) visibleItems = 1;
             else if (window.innerWidth < 992) visibleItems = 2;
             else visibleItems = Math.max(1, Math.floor(containerWidth / itemWidth) || 3); // Ensure at least 1

            maxIndex = Math.max(0, totalItems - visibleItems);
            return itemWidth; // Return it for immediate use
         }

        function setPositionByIndex(animate = true) {
            if (itemWidth === 0) return; // Don't position if width not calculated
            currentIndex = Math.max(0, Math.min(currentIndex, maxIndex)); // Clamp index
            currentTranslate = -currentIndex * itemWidth;
            prevTranslate = currentTranslate;
            carouselTrack.style.transition = animate && !isDragging ? 'transform 0.4s cubic-bezier(0.25, 0.8, 0.25, 1)' : 'none';
            carouselTrack.style.transform = `translateX(${currentTranslate}px)`;
            updateNavButtons();
        }

         function updateNavButtons() {
             if (!prevBtn || !nextBtn) return;
             prevBtn.disabled = currentIndex <= 0;
             nextBtn.disabled = currentIndex >= maxIndex;
             gsap.to([prevBtn, nextBtn], { // Animate opacity for smoother feel
                 opacity: (btn) => btn.disabled ? 0.4 : 1,
                 cursor: (btn) => btn.disabled ? 'not-allowed' : 'pointer',
                 duration: 0.2
             });
         }

        function dragStart(e) {
             if (isScrolling) return; // Prevent drag during page scroll
            isDragging = true;
            startPosX = getPositionX(e);
             animationID = requestAnimationFrame(animationLoop); // Not strictly needed if only updating on move
             carouselTrack.style.transition = 'none';
             carouselContainer.style.cursor = 'grabbing';
        }

        function dragging(e) {
            if (!isDragging) return;
            const currentPosition = getPositionX(e);
            currentTranslate = prevTranslate + currentPosition - startPosX;
            // Limit dragging past boundaries visually (optional)
             // const minTranslate = -maxIndex * itemWidth;
             // currentTranslate = Math.max(minTranslate - itemWidth/2, Math.min(itemWidth/2, currentTranslate)); // Allow slight overdrag
            carouselTrack.style.transform = `translateX(${currentTranslate}px)`; // Update visual position immediately
        }

        function dragEnd() {
            if (!isDragging) return;
            isDragging = false;
             cancelAnimationFrame(animationID); // Not critical here
             carouselContainer.style.cursor = 'grab';

            const movedBy = currentTranslate - prevTranslate;

             // Snap based on drag distance only if moved significantly
             if (Math.abs(movedBy) > dragThreshold) {
                 if (movedBy < 0 && currentIndex < maxIndex) currentIndex++;
                 else if (movedBy > 0 && currentIndex > 0) currentIndex--;
             }
             // Always snap back to the determined index
             setPositionByIndex();
        }

        function getPositionX(e) {
            return e.type.includes('mouse') ? e.pageX : e.touches[0].clientX;
        }
         function animationLoop(){ /* Currently empty, kept for potential future use */ }

         // Event Listeners for Drag
        carouselContainer.addEventListener('mousedown', dragStart);
        carouselContainer.addEventListener('touchstart', dragStart, { passive: true });
        document.addEventListener('mousemove', dragging); // Listen on document to drag outside container
        document.addEventListener('touchmove', dragging, { passive: true });
        document.addEventListener('mouseup', dragEnd); // Listen on document
        document.addEventListener('touchend', dragEnd);
        document.addEventListener('touchcancel', dragEnd);

         // Button Listeners
         if(nextBtn) nextBtn.addEventListener('click', () => { if (currentIndex < maxIndex) currentIndex++; setPositionByIndex(); });
         if(prevBtn) prevBtn.addEventListener('click', () => { if (currentIndex > 0) currentIndex--; setPositionByIndex(); });

        // Initial Setup & Resize Handling
        let resizeTimeout;
        function onResize() {
             clearTimeout(resizeTimeout);
             resizeTimeout = setTimeout(() => {
                itemWidth = calculateDimensions(); // Recalculate width
                setPositionByIndex(false); // Update position without animation
                 console.log("Carousel resized. New itemWidth:", itemWidth, "Max Index:", maxIndex);
             }, 200); // Debounce resize event
        }

        window.addEventListener('resize', onResize);
        itemWidth = calculateDimensions(); // Initial calculation
         setTimeout(() => { // Initial position after slight delay for layout stability
             itemWidth = calculateDimensions(); // Recalculate just in case
             setPositionByIndex(false);
         }, 150);

     } else {
          console.warn("Carousel elements missing or empty.");
     } // End carousel logic


    // --- DEMO VIDEO MODAL ---
     const placeholderVideo = document.querySelector('.placeholder-video');
     let videoModal = null; // Use let, initialize to null
     let videoIframe = null;

     function openVideoModal() {
         if (videoModal) return; // Prevent opening multiple modals

         // *** Replace with your ACTUAL YouTube video ID ***
         const youtubeVideoId = 'dQw4w9WgXcQ'; // Example placeholder ID
         if (!youtubeVideoId) {
             alert('Video ID not set.');
             return;
         }

         videoModal = document.createElement('div'); // Create the element now
         videoModal.className = 'video-modal';
         videoModal.innerHTML = `
             <div class="video-modal-content">
                  <!-- Added loading state -->
                  <div class="video-loading" style="position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; background: #000; color: #fff; font-size: 1rem;">Loading Video...</div>
                  <iframe style="opacity: 0; transition: opacity 0.5s ease 0.3s;" src="https://www.youtube.com/embed/${youtubeVideoId}?autoplay=1&rel=0&showinfo=0&enablejsapi=1" frameborder="0" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" allowfullscreen></iframe>
             </div>
             <div class="close-video-modal" title="Close Video">×</div>
         `;
         document.body.appendChild(videoModal);
         videoIframe = videoModal.querySelector('iframe');
          const loadingIndicator = videoModal.querySelector('.video-loading');

          // Show iframe when loaded
          videoIframe.onload = () => {
              loadingIndicator.style.display = 'none';
              videoIframe.style.opacity = '1';
          };


          // Stop potential background scroll
          document.body.style.overflow = 'hidden';

         // Use GSAP for animations
         gsap.fromTo(videoModal, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: 'power1.inOut', onStart: () => videoModal.classList.add('active') });
         gsap.fromTo(videoModal.querySelector('.video-modal-content'),
              { scale: 0.7, opacity: 0 },
              { scale: 1, opacity: 1, duration: 0.4, delay: 0.1, ease: 'back.out(1.5)' }
         );

         // Add close listeners AFTER modal is created
         videoModal.querySelector('.close-video-modal').addEventListener('click', closeVideoModal);
         videoModal.addEventListener('click', (e) => { // Close on overlay click
             if (e.target === videoModal) {
                 closeVideoModal();
             }
         });
         document.addEventListener('keydown', handleEscKey); // Use named function
     }

     function closeVideoModal() {
         if (!videoModal) return; // Prevent closing if already closed

         document.removeEventListener('keydown', handleEscKey); // Clean up listener
         gsap.to(videoModal, {
             opacity: 0,
             duration: 0.3,
             ease: 'power1.inOut',
             onComplete: () => {
                 // Stop video playback by removing the iframe OR clearing src
                 if (videoIframe && videoIframe.contentWindow) {
                      // Send postMessage to YouTube API to stop video if loaded
                       videoIframe.contentWindow.postMessage('{"event":"command","func":"' + 'stopVideo' + '","args":""}', '*');
                  }
                 if (videoModal.parentNode) {
                     videoModal.remove(); // Remove modal from DOM
                 }
                 videoModal = null; // Reset variable
                 videoIframe = null;
                 document.body.style.overflow = ''; // Restore scrolling
             }
         });
     }

     // Separate ESC key handler function
     function handleEscKey(event) {
         if (event.key === 'Escape' || event.key === 'Esc') { // Check both key values
             closeVideoModal();
         }
     }

     if (placeholderVideo) {
         placeholderVideo.addEventListener('click', (e) => {
             e.preventDefault(); // Prevent potential default behavior
             openVideoModal();
         });
     } else {
         console.warn("Placeholder video element not found.");
     }

    // --- SCROLL UP BUTTON ---
    const scrollUpButton = document.querySelector('.scroll-up');
    if (scrollUpButton) {
         // Initial state hidden
         gsap.set(scrollUpButton, { bottom: -60, opacity: 0, scale: 0.8 });

        ScrollTrigger.create({
             trigger: 'body', // Monitor whole body scroll
             start: "top -400", // Show after scrolling down 400px
             end: 99999,
             toggleClass: { targets: scrollUpButton, className: "active" }, // Simple toggle class
             onEnter: () => gsap.to(scrollUpButton, { bottom: 30, opacity: 1, scale: 1, duration: 0.4, ease: 'back.out(1.7)'}),
             onLeaveBack: () => gsap.to(scrollUpButton, { bottom: -60, opacity: 0, scale: 0.8, duration: 0.3, ease: 'power1.in'})
        });

        scrollUpButton.addEventListener('click', () => {
            scrollToTarget(0); // Use the helper function
        });
    }

    // --- GENERAL SCROLL-TRIGGERED ANIMATIONS ---
    function setupScrollAnimations() {
         // Animate elements fading/sliding in on scroll
         gsap.utils.toArray('.section-header, .content-left, .content-right, .solution-card, .feature, .pricing-card, .video-container, footer > .footer-container > *').forEach((el, index) => {
             gsap.from(el, {
                 opacity: 0.1, // Start slightly visible for perceived performance
                 y: 60,
                 duration: 0.8,
                 ease: 'power2.out',
                 // delay: index * 0.05, // Subtle stagger within sections
                 scrollTrigger: {
                     trigger: el,
                     start: 'top 88%', // Adjust trigger point
                     end: 'bottom 20%',
                     toggleActions: 'play none none none', // Play once on enter
                     // markers: true, // Uncomment for debugging
                     // once: true, // Consider using 'once' for performance
                 }
             });
         });

          // Staggered animation specifically for grids like solutions carousel items (apply to container)
          gsap.utils.toArray('.solutions-carousel .carousel-track, .features').forEach(container => {
             gsap.from(container.children, {
                 opacity: 0,
                 y: 50,
                 duration: 0.6,
                 ease: 'power2.out',
                 stagger: 0.1, // Stagger the animation of direct children
                 scrollTrigger: {
                     trigger: container,
                     start: 'top 85%',
                     toggleActions: 'play none none none',
                 }
             });
         });

    }
    // setupScrollAnimations() is called after loader/immediately.

    // --- PARALLAX BACKGROUND EFFECT ---
     gsap.utils.toArray('.hero, .cosmic-section').forEach(section => {
         const stars = section.querySelector('.stars');
         const twinkling = section.querySelector('.twinkling');

         if (stars) {
            gsap.to(stars, {
                 backgroundPosition: "50% 150%", // Enhanced effect
                 ease: "none",
                 scrollTrigger: {
                     trigger: section,
                     start: "top bottom",
                     end: "bottom top",
                     scrub: 2 // Adjust scrub speed
                 },
             });
         }
         if (twinkling) {
             gsap.to(twinkling, {
                 backgroundPosition: "50% 100%", // Subtle parallax
                 ease: "none",
                 scrollTrigger: {
                     trigger: section,
                     start: "top bottom",
                     end: "bottom top",
                     scrub: 3
                 },
             });
         }
    });


    // --- END OF DOMContentLoaded ---
    console.log("Setica page scripts initialized.");
});
