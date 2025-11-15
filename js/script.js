// ============================================
// CINETOON STUDIOS - MAIN JAVASCRIPT FILE
// Professional, optimized, and error-handled
// ============================================

(function() {
    'use strict';

    // ============================================
    // UTILITY FUNCTIONS
    // ============================================
    
    const utils = {
        // Safe query selector
        $: (selector, context = document) => {
            try {
                return context.querySelector(selector);
            } catch (e) {
                console.warn('Query selector error:', e);
                return null;
            }
        },
        
        // Safe query selector all
        $$: (selector, context = document) => {
            try {
                return Array.from(context.querySelectorAll(selector));
            } catch (e) {
                console.warn('Query selector all error:', e);
                return [];
            }
        },
        
        // Debounce function for performance
        debounce: (func, wait) => {
            let timeout;
            return function executedFunction(...args) {
                const later = () => {
                    clearTimeout(timeout);
                    func(...args);
                };
                clearTimeout(timeout);
                timeout = setTimeout(later, wait);
            };
        }
    };

    // ============================================
    // LOADER MANAGEMENT
    // ============================================
    
    const LoaderManager = {
        init: () => {
            const loader = utils.$('.loader');
            if (!loader) return;
            
            // Hide loader when page is fully loaded
            const hideLoader = () => {
                loader.classList.add('hidden');
                document.body.style.overflow = '';
            };
            
            // Hide after minimum 1 second for smooth UX
            if (document.readyState === 'complete') {
                setTimeout(hideLoader, 1000);
            } else {
                window.addEventListener('load', () => {
                    setTimeout(hideLoader, 1000);
                });
            }
        }
    };

    // ============================================
    // NAVIGATION MANAGEMENT
    // ============================================
    
    const NavigationManager = {
        init: () => {
            const navbar = utils.$('.navbar');
            const hamburger = utils.$('.hamburger');
            const navLinks = utils.$('.nav-links');
            
            if (!navbar) return;
            
            // Sticky Navbar with performance optimization
            const handleScroll = utils.debounce(() => {
                if (window.scrollY > 50) {
                    navbar.classList.add('scrolled');
                } else {
                    navbar.classList.remove('scrolled');
                }
            }, 10);
            
            window.addEventListener('scroll', handleScroll, { passive: true });
            
            // Mobile Menu Toggle
            if (hamburger && navLinks) {
                hamburger.addEventListener('click', () => {
                    const isActive = navLinks.classList.toggle('active');
                    hamburger.classList.toggle('active');
                    hamburger.setAttribute('aria-expanded', isActive);
                    document.body.style.overflow = isActive ? 'hidden' : '';
                });
                
                // Close menu when clicking on a link
                utils.$$('.nav-links a').forEach(link => {
                    link.addEventListener('click', () => {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    });
                });
                
                // Close menu when clicking outside
                document.addEventListener('click', (e) => {
                    if (!hamburger.contains(e.target) && !navLinks.contains(e.target)) {
                        navLinks.classList.remove('active');
                        hamburger.classList.remove('active');
                        hamburger.setAttribute('aria-expanded', 'false');
                        document.body.style.overflow = '';
                    }
                });
            }
        }
    };

    // ============================================
    // SMOOTH SCROLLING
    // ============================================
    
    const SmoothScrollManager = {
        init: () => {
            utils.$$('a[href^="#"]').forEach(anchor => {
                anchor.addEventListener('click', function(e) {
                    const href = this.getAttribute('href');
                    if (href === '#' || !href) return;
                    
                    const target = utils.$(href);
                    if (!target) return;
                    
                    e.preventDefault();
                    
                    const offsetTop = target.offsetTop - 80; // Account for fixed navbar
                    
                    window.scrollTo({
                        top: offsetTop,
                        behavior: 'smooth'
                    });
                });
            });
        }
    };

    // ============================================
    // GSAP ANIMATIONS (with error handling)
    // ============================================
    
    const AnimationManager = {
        init: () => {
            if (typeof gsap === 'undefined') {
                console.warn('GSAP library not loaded');
                return;
            }
            
            try {
                // Hero animations
                const heroH1 = utils.$('.hero h1');
                const heroP = utils.$('.hero p');
                const heroBtn = utils.$('.hero .cta-button');
                
                if (heroH1) gsap.from(heroH1, { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
                if (heroP) gsap.from(heroP, { duration: 1.5, y: 30, opacity: 0, delay: 0.5 });
                if (heroBtn) gsap.from(heroBtn, { duration: 1, scale: 0.8, opacity: 0, delay: 1 });
                
                // About section animations
                const aboutH2 = utils.$('.about-text h2');
                const aboutP = utils.$('.about-text p');
                const aboutImg = utils.$('.about-image img');
                
                if (aboutH2) gsap.from(aboutH2, { duration: 1, x: -50, opacity: 0, ease: "power2.out", scrollTrigger: { trigger: aboutH2, start: "top 80%" } });
                if (aboutP) gsap.from(aboutP, { duration: 1.5, y: 30, opacity: 0, delay: 0.5, scrollTrigger: { trigger: aboutP, start: "top 80%" } });
                if (aboutImg) gsap.from(aboutImg, { duration: 1, scale: 0.8, opacity: 0, delay: 0.7, scrollTrigger: { trigger: aboutImg, start: "top 80%" } });
                
            } catch (e) {
                console.warn('Animation error:', e);
            }
        }
    };

    // ============================================
    // PARTNER LOGOS INFINITE SCROLL
    // ============================================
    
    const PartnerLogosManager = {
        init: () => {
            const logoTrack = utils.$('.logo-track');
            if (!logoTrack) return;
            
            const logos = utils.$$('.logo-track img');
            if (logos.length === 0) return;
            
            // Clone logos for seamless loop
            const clonedLogos = logos.map(logo => logo.cloneNode(true));
            clonedLogos.forEach(clone => logoTrack.appendChild(clone));
            
            let scrollSpeed = 0;
            let animationId = null;
            
            const scrollLogos = () => {
                scrollSpeed += 0.5;
                logoTrack.style.transform = `translateX(${-scrollSpeed}px)`;
                
                // Reset when we've scrolled half the width
                if (scrollSpeed >= logoTrack.scrollWidth / 2) {
                    scrollSpeed = 0;
                }
                
                animationId = requestAnimationFrame(scrollLogos);
            };
            
            // Start animation
            scrollLogos();
            
            // Pause on hover for better UX
            logoTrack.addEventListener('mouseenter', () => {
                if (animationId) cancelAnimationFrame(animationId);
            });
            
            logoTrack.addEventListener('mouseleave', () => {
                scrollLogos();
            });
        }
    };

    // ============================================
    // CONTACT FORM HANDLING
    // ============================================
    
    const ContactFormManager = {
        init: () => {
            const form = utils.$('#contactForm');
            const sendButton = utils.$('#sendButton');
            const responseMessage = utils.$('#responseMessage');
            
            if (!form || !sendButton) return;
            
            // Check if EmailJS is loaded
            if (typeof emailjs === 'undefined') {
                console.warn('EmailJS not loaded');
                return;
            }
            
            // Form validation
            const validateForm = () => {
                const name = utils.$('#name', form);
                const email = utils.$('#email', form);
                const phone = utils.$('#phone', form);
                const message = utils.$('#message', form);
                
                let isValid = true;
                
                // Remove previous error messages
                utils.$$('.error-message', form).forEach(el => el.remove());
                
                // Validate name
                if (!name || name.value.trim().length < 2) {
                    ContactFormManager.showError(name, 'Name must be at least 2 characters');
                    isValid = false;
                }
                
                // Validate email
                const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
                if (!email || !emailRegex.test(email.value)) {
                    ContactFormManager.showError(email, 'Please enter a valid email address');
                    isValid = false;
                }
                
                // Validate phone
                const phoneRegex = /^[\d\s\-\+\(\)]+$/;
                if (!phone || phone.value.trim().length < 10 || !phoneRegex.test(phone.value)) {
                    ContactFormManager.showError(phone, 'Please enter a valid phone number');
                    isValid = false;
                }
                
                // Validate message
                if (!message || message.value.trim().length < 10) {
                    ContactFormManager.showError(message, 'Message must be at least 10 characters');
                    isValid = false;
                }
                
                return isValid;
            };
            
            // Show error message
            ContactFormManager.showError = (field, message) => {
                if (!field) return;
                
                const errorDiv = document.createElement('div');
                errorDiv.className = 'error-message';
                errorDiv.style.color = '#ff4444';
                errorDiv.style.fontSize = '0.875rem';
                errorDiv.style.marginTop = '5px';
                errorDiv.textContent = message;
                
                field.parentNode.appendChild(errorDiv);
                field.style.borderColor = '#ff4444';
                
                // Remove error on input
                field.addEventListener('input', function removeError() {
                    field.style.borderColor = '';
                    errorDiv.remove();
                    field.removeEventListener('input', removeError);
                });
            };
            
            // Show success/error message
            ContactFormManager.showMessage = (message, isSuccess = true) => {
                if (!responseMessage) return;
                
                responseMessage.textContent = message;
                responseMessage.style.color = isSuccess ? '#00ff55' : '#ff4444';
                responseMessage.style.padding = '10px';
                responseMessage.style.borderRadius = '5px';
                responseMessage.style.marginTop = '10px';
                responseMessage.style.backgroundColor = isSuccess ? 'rgba(0, 255, 85, 0.1)' : 'rgba(255, 68, 68, 0.1)';
                
                // Auto-hide after 5 seconds
                setTimeout(() => {
                    responseMessage.textContent = '';
                    responseMessage.style.backgroundColor = '';
                }, 5000);
            };
            
            // Form submission
            form.addEventListener('submit', async function(e) {
                e.preventDefault();
                
                if (!validateForm()) {
                    ContactFormManager.showMessage('Please fix the errors above', false);
                    return;
                }
                
                const originalText = sendButton.textContent;
                sendButton.disabled = true;
                sendButton.textContent = 'Sending...';
                sendButton.style.opacity = '0.7';
                
                try {
                    const serviceID = 'service_doai0xs';
                    const templateID = 'template_8hui04w';
                    
                    await emailjs.sendForm(serviceID, templateID, form);
                    
                    ContactFormManager.showMessage('Message sent successfully! We\'ll get back to you soon.', true);
                    form.reset();
                    
                } catch (error) {
                    console.error('EmailJS error:', error);
                    ContactFormManager.showMessage('Failed to send message. Please try again or contact us directly.', false);
                } finally {
                    sendButton.disabled = false;
                    sendButton.textContent = originalText;
                    sendButton.style.opacity = '1';
                }
            });
        }
    };

    // ============================================
    // PORTFOLIO SLIDER
    // ============================================
    
    const PortfolioSliderManager = {
        init: () => {
            const slides = utils.$$('.cinetoon-slider-item');
            if (slides.length === 0) return;
            
            let currentIndex = 0;
            
            const showSlide = (index) => {
                slides.forEach((slide, i) => {
                    slide.classList.toggle('active', i === index);
                });
            };
            
            const nextSlide = () => {
                currentIndex = (currentIndex + 1) % slides.length;
                showSlide(currentIndex);
            };
            
            // Auto-advance slides
            if (slides.length > 1) {
                setInterval(nextSlide, 5000);
            }
            
            // Initialize first slide
            showSlide(0);
        }
    };

    // ============================================
    // LOGO MODAL MANAGEMENT
    // ============================================
    
    const LogoModalManager = {
        init: () => {
            const modal = utils.$('#cinetoon-logo-modal');
            if (!modal) return;
            
            // Open modal
            window.openLogoModal = (image) => {
                const modalImg = utils.$('#cinetoon-enlarged-logo');
                if (modalImg && image) {
                    modalImg.src = image.src;
                    modal.style.display = 'flex';
                    document.body.style.overflow = 'hidden';
                }
            };
            
            // Close modal
            window.closeLogoModal = () => {
                modal.style.display = 'none';
                document.body.style.overflow = '';
            };
            
            // Close on outside click
            modal.addEventListener('click', (e) => {
                if (e.target === modal) {
                    window.closeLogoModal();
                }
            });
            
            // Close on Escape key
            document.addEventListener('keydown', (e) => {
                if (e.key === 'Escape' && modal.style.display === 'flex') {
                    window.closeLogoModal();
                }
            });
        }
    };

    // ============================================
    // LAZY LOADING IMAGES
    // ============================================
    
    const LazyLoadManager = {
        init: () => {
            if ('IntersectionObserver' in window) {
                const imageObserver = new IntersectionObserver((entries, observer) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const img = entry.target;
                            if (img.dataset.src) {
                                img.src = img.dataset.src;
                                img.removeAttribute('data-src');
                                observer.unobserve(img);
                            }
                        }
                    });
                });
                
                utils.$$('img[data-src]').forEach(img => imageObserver.observe(img));
            }
        }
    };

    // ============================================
    // FAQ ACCORDION MANAGER
    // ============================================
    
    const FAQManager = {
        init: () => {
            const faqItems = utils.$$('.faq-item');
            
            faqItems.forEach(item => {
                const question = utils.$('.faq-question', item);
                if (!question) return;
                
                question.addEventListener('click', () => {
                    const isActive = item.classList.contains('active');
                    
                    // Close all other items
                    faqItems.forEach(otherItem => {
                        if (otherItem !== item) {
                            otherItem.classList.remove('active');
                        }
                    });
                    
                    // Toggle current item
                    item.classList.toggle('active', !isActive);
                });
            });
        }
    };

    // ============================================
    // STATS COUNTER ANIMATION
    // ============================================
    
    const StatsCounterManager = {
        init: () => {
            const statNumbers = utils.$$('.stat-number');
            if (statNumbers.length === 0) return;
            
            const animateCounter = (element) => {
                const target = parseInt(element.getAttribute('data-target'));
                const duration = 2000; // 2 seconds
                const increment = target / (duration / 16); // 60fps
                let current = 0;
                
                const updateCounter = () => {
                    current += increment;
                    if (current < target) {
                        element.textContent = Math.floor(current);
                        requestAnimationFrame(updateCounter);
                    } else {
                        element.textContent = target;
                    }
                };
                
                updateCounter();
            };
            
            // Use Intersection Observer to trigger animation when in view
            if ('IntersectionObserver' in window) {
                const observer = new IntersectionObserver((entries) => {
                    entries.forEach(entry => {
                        if (entry.isIntersecting) {
                            const element = entry.target;
                            if (!element.classList.contains('animated')) {
                                element.classList.add('animated');
                                animateCounter(element);
                                observer.unobserve(element);
                            }
                        }
                    });
                }, { threshold: 0.5 });
                
                statNumbers.forEach(stat => observer.observe(stat));
            }
        }
    };

    // ============================================
    // INITIALIZATION
    // ============================================
    
    const App = {
        init: () => {
            // Wait for DOM to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', App.init);
                return;
            }
            
            // Initialize all managers
            LoaderManager.init();
            NavigationManager.init();
            SmoothScrollManager.init();
            AnimationManager.init();
            PartnerLogosManager.init();
            ContactFormManager.init();
            PortfolioSliderManager.init();
            LogoModalManager.init();
            LazyLoadManager.init();
            FAQManager.init();
            StatsCounterManager.init();
            
            console.log('Cinetoon Studios - Website initialized successfully');
        }
    };
    
    // Start the application
    App.init();
    
})();
