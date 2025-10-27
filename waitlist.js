// Setica Waitlist Application - Enhanced with Debugging
// Modular, clean JavaScript for waitlist functionality

class SeticaWaitlist {
  constructor() {
    this.db = null;
    this.elements = {};
    this.state = {
      loveCount: parseInt(localStorage.getItem('seticaLoveCount') || '0'),
      userHasLoved: localStorage.getItem('seticaLovedState') === 'true',
      userHasClickedInterest: localStorage.getItem('seticaUserInterested') === 'true'
    };
    this.init();
  }

  init() {
    document.addEventListener('DOMContentLoaded', () => {
      this.initFirebase();
      this.cacheElements();
      this.setupEventListeners();
      this.initializeUI();
      this.fetchCounts();
    });
  }

  initFirebase() {
    // Check if Firebase is loaded
    if (typeof firebase === 'undefined') {
      console.error('❌ Firebase SDK not loaded!');
      this.showMessage('Firebase not loaded. Please refresh the page.', 'error');
      return;
    }

    // Check if Firebase is initialized
    if (!firebase.apps.length) {
      console.error('❌ Firebase not initialized! Check config.js');
      this.showMessage('Firebase configuration error. Please contact support.', 'error');
      return;
    }

    // Get Firestore instance
    this.db = firebase.firestore();
    
    // Enable Firestore debug logging (remove in production)
    firebase.firestore.setLogLevel('debug');
    
    console.log('✅ Firebase initialized successfully');
    console.log('📊 Firestore instance:', this.db);
  }

  cacheElements() {
    this.elements = {
      body: document.body,
      nav: document.querySelector('nav'),
      hamburger: document.querySelector('.hamburger'),
      navLinks: document.querySelector('.nav-links'),
      loveButton: document.getElementById('love-it-button'),
      loveButtonFooter: document.getElementById('love-it-button-footer'),
      loveCounter: document.getElementById('love-counter'),
      loveCounterFooter: document.getElementById('love-counter-footer'),
      waitlistForm: document.getElementById('waitlist-form'),
      emailInput: document.getElementById('email'),
      messageArea: document.getElementById('form-message-area'),
      interestButton: document.getElementById('interested-btn'),
      interestCount: document.getElementById('interest-count'),
      waitlistCount: document.getElementById('waitlist-count'),
      copyrightYear: document.getElementById('copyright-year')
    };
  }

  setupEventListeners() {
    // Window load
    window.addEventListener('load', () => this.handlePageLoad());

    // Mobile menu
    if (this.elements.hamburger && this.elements.navLinks) {
      this.elements.hamburger.addEventListener('click', () => this.toggleMobileMenu());
    }

    // Love buttons
    if (this.elements.loveButton) {
      this.elements.loveButton.addEventListener('click', () => this.handleLoveClick(this.elements.loveButton));
    }
    if (this.elements.loveButtonFooter) {
      this.elements.loveButtonFooter.addEventListener('click', () => this.handleLoveClick(this.elements.loveButtonFooter));
    }

    // Interest button
    if (this.elements.interestButton) {
      this.elements.interestButton.addEventListener('click', () => this.handleInterestClick());
    }

    // Waitlist form
    if (this.elements.waitlistForm) {
      this.elements.waitlistForm.addEventListener('submit', (e) => this.handleWaitlistSubmit(e));
    }

    // Nav scroll effect
    if (this.elements.nav && typeof ScrollTrigger !== 'undefined') {
      ScrollTrigger.create({
        start: "top top",
        end: 99999,
        onUpdate: (self) => this.elements.nav.classList.toggle('scrolled', self.scroll() > 50)
      });
    }
  }

  initializeUI() {
    // Set copyright year
    if (this.elements.copyrightYear) {
      this.elements.copyrightYear.textContent = new Date().getFullYear();
    }

    // Update love display
    this.updateLoveDisplay();

    // Update interest button
    this.updateInterestButton();
  }

  handlePageLoad() {
    this.elements.body.classList.remove('loading');
    this.elements.body.classList.add('loaded');
  }

  toggleMobileMenu() {
    this.elements.hamburger.classList.toggle('active');
    this.elements.navLinks.classList.toggle('active');
  }

  updateLoveDisplay() {
    if (this.elements.loveCounter) {
      this.elements.loveCounter.textContent = this.state.loveCount;
    }
    if (this.elements.loveCounterFooter) {
      this.elements.loveCounterFooter.textContent = this.state.loveCount;
    }
    if (this.elements.loveButton) {
      this.elements.loveButton.classList.toggle('loved', this.state.userHasLoved);
    }
    if (this.elements.loveButtonFooter) {
      this.elements.loveButtonFooter.classList.toggle('loved', this.state.userHasLoved);
    }
  }

  handleLoveClick(button) {
    if (!this.state.userHasLoved) {
      this.state.loveCount++;
      localStorage.setItem('seticaLoveCount', this.state.loveCount);
      localStorage.setItem('seticaLovedState', 'true');
      this.state.userHasLoved = true;
      this.updateLoveDisplay();

      // Animate heart
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          button.querySelector('.heart-icon'),
          { scale: 1 },
          { scale: 1.4, duration: 0.3, ease: 'back.out(3)', yoyo: true, repeat: 1 }
        );
      }
    }
  }

  async fetchCounts() {
    if (!this.db) {
      console.error('❌ Cannot fetch counts: Firestore not initialized');
      return;
    }

    try {
      console.log('📊 Fetching counts...');

      // Get interest count
      const interestDoc = await this.db.collection('stats').doc('interest').get();
      const interestCount = interestDoc.exists ? interestDoc.data().count : 0;
      console.log('✅ Interest count:', interestCount);
      
      // Get waitlist count
      const waitlistSnapshot = await this.db.collection('waitlist').get();
      const waitlistCount = waitlistSnapshot.size;
      console.log('✅ Waitlist count:', waitlistCount);

      // Animate counts
      this.animateCount(this.elements.interestCount, interestCount);
      this.animateCount(this.elements.waitlistCount, waitlistCount);

      this.updateInterestButton();
    } catch (error) {
      console.error("❌ Error fetching counts:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      // Show user-friendly error
      if (error.code === 'permission-denied') {
        console.error('🔒 Permission denied - check Firestore rules!');
      }
    }
  }

  animateCount(element, targetValue) {
    if (!element) return;

    if (typeof gsap !== 'undefined') {
      gsap.to(element, {
        duration: 1,
        innerText: targetValue,
        roundProps: "innerText",
        ease: "power1.out"
      });
    } else {
      element.textContent = targetValue;
    }
  }

  updateInterestButton() {
    if (!this.elements.interestButton) return;

    if (this.state.userHasClickedInterest) {
      this.elements.interestButton.disabled = true;
      this.elements.interestButton.innerHTML = '<i class="fas fa-check"></i> Thanks!';
    } else {
      this.elements.interestButton.disabled = false;
      this.elements.interestButton.innerHTML = '<i class="fas fa-heart"></i> I\'m Interested!';
    }
  }

  async handleInterestClick() {
    if (this.state.userHasClickedInterest) return;

    if (!this.db) {
      this.showMessage('Database not ready. Please refresh the page.', 'error');
      return;
    }

    try {
      console.log('💖 Incrementing interest count...');

      // Increment interest count in Firestore
      const interestRef = this.db.collection('stats').doc('interest');
      const newCount = await this.db.runTransaction(async (transaction) => {
        const doc = await transaction.get(interestRef);
        const currentCount = doc.exists ? doc.data().count : 0;
        const newCount = currentCount + 1;
        transaction.set(interestRef, { count: newCount });
        return newCount;
      });

      console.log('✅ Interest incremented to:', newCount);

      this.state.userHasClickedInterest = true;
      localStorage.setItem('seticaUserInterested', 'true');
      
      // Refresh counts
      await this.fetchCounts();

      // Animation
      if (typeof gsap !== 'undefined') {
        gsap.fromTo(
          this.elements.interestButton, 
          { scale: 1 }, 
          { scale: 1.05, duration: 0.2, yoyo: true, repeat: 1 }
        );
        gsap.fromTo(
          this.elements.interestCount,
          { scale: 1 },
          { scale: 1.2, duration: 0.3, yoyo: true, repeat: 1, ease: 'back.out(2)' }
        );
      }
    } catch (error) {
      console.error("❌ Error incrementing interest:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      
      if (error.code === 'permission-denied') {
        this.showMessage('Permission denied. Please check Firestore rules.', 'error');
      } else {
        this.showMessage('An error occurred. Please try again.', 'error');
      }
    }
  }

  async handleWaitlistSubmit(e) {
    e.preventDefault();
    
    console.log('📧 Form submitted');

    if (!this.db) {
      console.error('❌ Firestore not initialized');
      this.showMessage('Database not ready. Please refresh the page.', 'error');
      return;
    }

    const email = this.elements.emailInput.value.trim().toLowerCase();
    console.log('📧 Email entered:', email);

    // Validate email
    if (!this.validateEmail(email)) {
      console.error('❌ Invalid email format');
      this.showMessage('Please enter a valid email address.', 'error');
      return;
    }

    const submitButton = this.elements.waitlistForm.querySelector('button[type="submit"]');
    const originalButtonText = submitButton.innerHTML;
    
    this.setButtonLoading(submitButton, true);

    try {
      console.log('🔍 Checking if email exists...');

      // Check if email already exists
      const existingEmail = await this.db.collection('waitlist')
        .where('email', '==', email)
        .get();

      if (!existingEmail.empty) {
        console.log('⚠️ Email already exists in waitlist');
        this.showMessage('This email is already on the waitlist!', 'error');
        this.setButtonLoading(submitButton, false, originalButtonText);
        return;
      }

      console.log('➕ Adding email to waitlist...');

      // Add to waitlist - Create proper data object
      const waitlistData = {
        email: email,
        timestamp: firebase.firestore.FieldValue.serverTimestamp(),
        source: 'website'
      };

      console.log('📤 Data to be added:', waitlistData);

      const docRef = await this.db.collection('waitlist').add(waitlistData);

      console.log('✅ Successfully added to waitlist! Doc ID:', docRef.id);

      this.showMessage('Success! You\'ve joined the waitlist. Check your email soon!', 'success');
      this.elements.emailInput.value = '';
      
      // Refresh counts
      await this.fetchCounts();

    } catch (error) {
      console.error("❌ Error adding to waitlist:", error);
      console.error("Error code:", error.code);
      console.error("Error message:", error.message);
      console.error("Full error object:", error);
      
      // Specific error messages
      if (error.code === 'permission-denied') {
        this.showMessage('Permission denied. Please check Firestore security rules.', 'error');
        console.error('🔒 Firestore rules are blocking the write operation!');
      } else if (error.code === 'unavailable') {
        this.showMessage('Network error. Please check your internet connection.', 'error');
      } else {
        this.showMessage(`Error: ${error.message}`, 'error');
      }
    } finally {
      this.setButtonLoading(submitButton, false, originalButtonText);
    }
  }

  validateEmail(email) {
    const isValid = email && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    console.log('🔍 Email validation:', email, '→', isValid);
    return isValid;
  }

  setButtonLoading(button, isLoading, originalText = '') {
    if (isLoading) {
      button.disabled = true;
      button.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Processing...';
    } else {
      button.disabled = false;
      button.innerHTML = originalText;
    }
  }

  showMessage(text, type) {
    if (!this.elements.messageArea) return;
    
    console.log(`💬 Showing ${type} message:`, text);
    
    this.elements.messageArea.textContent = text;
    this.elements.messageArea.className = `form-message ${type}`;
    this.elements.messageArea.style.display = 'block';

    setTimeout(() => {
      this.elements.messageArea.style.display = 'none';
    }, 5000);
  }
}

// Initialize the application
console.log('🚀 Initializing Setica Waitlist Application...');
new SeticaWaitlist();