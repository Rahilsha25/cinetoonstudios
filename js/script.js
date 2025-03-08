document.addEventListener("DOMContentLoaded", function () {
    // Hide loader after 2 seconds
    setTimeout(() => {
        const loader = document.querySelector(".loader");
        if (loader) loader.classList.add("hidden");
    }, 2000);

    const navbar = document.querySelector(".navbar");
    const hamburger = document.querySelector(".hamburger");
    const navLinks = document.querySelector(".nav-links");

    // Sticky Navbar Effect
    window.addEventListener("scroll", function () {
        if (window.scrollY > 50) {
            navbar.classList.add("scrolled");
        } else {
            navbar.classList.remove("scrolled");
        }
    });

    // Mobile Menu Toggle
    if (hamburger && navLinks) {
        hamburger.addEventListener("click", function () {
            navLinks.classList.toggle("active");
        });
    }

    // GSAP Animations
    gsap.from(".hero h1", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
    gsap.from(".hero p", { duration: 1.5, y: 30, opacity: 0, delay: 0.5 });
    gsap.from(".cta-button", { duration: 1, scale: 0.8, opacity: 0, delay: 1 });

    gsap.from(".about-text h2", { duration: 1, x: -50, opacity: 0, ease: "power2.out" });
    gsap.from(".about-text p", { duration: 1.5, y: 30, opacity: 0, delay: 0.5 });
    gsap.from(".about-image img", { duration: 1, scale: 0.8, opacity: 0, delay: 0.7 });

    gsap.from(".contact-container h2", { duration: 1, y: -50, opacity: 0, ease: "power2.out" });
    gsap.from(".contact-container p", { duration: 1.5, y: 30, opacity: 0, delay: 0.3 });
    gsap.from(".contact-content", { duration: 1, opacity: 0, delay: 0.5 });


    // Smooth Scrolling
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener("click", function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute("href")).scrollIntoView({
                behavior: "smooth"
            });
        });
    });

    

    // Partner Logos Infinite Scroll
    const logoTrack = document.querySelector(".logo-track");
    const logos = document.querySelectorAll(".logo-track img");

    if (logoTrack) {
        const clonedLogos = [...logos].map(logo => logo.cloneNode(true));
        clonedLogos.forEach(clone => logoTrack.appendChild(clone));

        let scrollSpeed = 0.8;
        function scrollLogos() {
            if (logoTrack) {
                logoTrack.style.transform = `translateX(${-scrollSpeed}px)`;
                scrollSpeed += 0.5;

                if (scrollSpeed >= logoTrack.scrollWidth / 2) {
                    scrollSpeed = 0; // Reset for a seamless loop
                }
            }
            requestAnimationFrame(scrollLogos);
        }
        scrollLogos();
    }


    const btn = document.getElementById('sendButton');

    document.getElementById('contactForm')
    .addEventListener('submit', function(event) {
    event.preventDefault();

    btn.value = 'Sending...';

    const serviceID = 'service_doai0xs';
    const templateID = 'template_8hui04w';

    emailjs.sendForm(serviceID, templateID, this)
        .then(() => {
        btn.value = 'Send Email';
        alert('Sent!');
        }, (err) => {
        btn.value = 'Send Email';
        alert(JSON.stringify(err));
        });
    });
});
