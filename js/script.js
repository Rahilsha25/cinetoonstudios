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

    //Portfolio Page
    let cinetoonSlides = document.querySelectorAll(".cinetoon-slider-item");
    let cinetoonCurrentIndex = 0;

    function cinetoonShowNextSlide() {
        cinetoonSlides[cinetoonCurrentIndex].classList.remove("active");
        cinetoonCurrentIndex = (cinetoonCurrentIndex + 1) % cinetoonSlides.length;
        cinetoonSlides[cinetoonCurrentIndex].classList.add("active");
    }

    setInterval(cinetoonShowNextSlide, 5000); // Change slide every 5 seconds

    // Open Modal with Clicked Image
    window.openLogoModal = function (image) {
        var modal = document.getElementById("cinetoon-logo-modal");
        var modalImg = document.getElementById("cinetoon-enlarged-logo");

        modal.style.display = "flex";  // Ensure modal appears
        modalImg.src = image.src;  // Set clicked image as modal image
    };

    // Close Modal when Clicking Outside or Close Button
    window.closeLogoModal = function () {
        document.getElementById("cinetoon-logo-modal").style.display = "none";
    };

    // Close Modal When Clicking Outside the Image
    document.getElementById("cinetoon-logo-modal").addEventListener("click", function (event) {
        if (event.target === this) {
            closeLogoModal();
        }
    });

    
});
