/* ========================================
   Bentecc Engineering Services
   Main JavaScript
   ======================================== */

// ---- Mobile Nav Toggle ----
const navToggle = document.querySelector('.nav-toggle');
const navLinks = document.querySelector('.nav-links');
if (navToggle) {
  navToggle.addEventListener('click', () => {
    navLinks.classList.toggle('open');
    const spans = navToggle.querySelectorAll('span');
    // Animate hamburger to X
    if (navLinks.classList.contains('open')) {
      spans[0].style.transform = 'rotate(45deg) translate(5px, 5px)';
      spans[1].style.opacity = '0';
      spans[2].style.transform = 'rotate(-45deg) translate(5px, -5px)';
    } else {
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
}

// Close nav on link click
document.querySelectorAll('.nav-links a').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    if (navToggle) {
      const spans = navToggle.querySelectorAll('span');
      spans[0].style.transform = '';
      spans[1].style.opacity = '';
      spans[2].style.transform = '';
    }
  });
});

// ---- Scroll Shadow Navbar ----
const navbar = document.querySelector('.navbar');
window.addEventListener('scroll', () => {
  if (window.scrollY > 50) {
    navbar.style.borderBottom = '1px solid rgba(255,255,255,0.12)';
    navbar.style.boxShadow = '0 4px 20px rgba(0,0,0,0.3)';
  } else {
    navbar.style.borderBottom = '1px solid rgba(255,255,255,0.06)';
    navbar.style.boxShadow = 'none';
  }
});

// ---- Contact Form Handler ----
const contactForm = document.getElementById('contactForm');
const formStatus = document.getElementById('formStatus');

if (contactForm) {
  contactForm.addEventListener('submit', async (e) => {
    e.preventDefault();

    const submitBtn = contactForm.querySelector('.submit-btn');
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending...';

    formStatus.className = 'form-status loading';
    formStatus.textContent = 'Submitting your message...';

    const formData = {
      name: document.getElementById('name').value.trim(),
      email: document.getElementById('email').value.trim(),
      phone: document.getElementById('phone')?.value?.trim() || '',
      service: document.getElementById('service')?.value || '',
      message: document.getElementById('message').value.trim(),
      consent: document.getElementById('consent')?.checked || false
    };

    // Validation
    if (!formData.name || !formData.email || !formData.message) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Please fill in all required fields (Name, Email, Message).';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      return;
    }

    if (!formData.consent) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'You must consent to the privacy policy.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Please enter a valid email address.';
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
      return;
    }

    try {
      // Determine API URL — works both in dev and production
      const apiBase = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
        ? 'http://localhost:3001'
        : '';

      const response = await fetch(`${apiBase}/api/contact`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      const data = await response.json();

      if (response.ok && data.success) {
        formStatus.className = 'form-status success';
        formStatus.textContent = 'Thank you! Your message has been sent. We will get back to you soon.';
        contactForm.reset();
      } else {
        formStatus.className = 'form-status error';
        formStatus.textContent = data.error || 'Something went wrong. Please try again later.';
      }
    } catch (err) {
      formStatus.className = 'form-status error';
      formStatus.textContent = 'Network error. Please check your connection and try again.';
      console.error('Contact form error:', err);
    } finally {
      submitBtn.disabled = false;
      submitBtn.textContent = 'Send Message';
    }
  });
}

// ---- Smooth Scroll for Anchor Links ----
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
  anchor.addEventListener('click', function(e) {
    const href = this.getAttribute('href');
    if (href === '#') return;
    e.preventDefault();
    const target = document.querySelector(href);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// ---- Simple Counter Animation ----
function animateCounters() {
  const counters = document.querySelectorAll('.stat-number');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const target = parseInt(entry.target.dataset.target);
        if (!target) return;
        let current = 0;
        const increment = Math.ceil(target / 60);
        const interval = setInterval(() => {
          current += increment;
          if (current >= target) {
            entry.target.textContent = target + '+';
            clearInterval(interval);
          } else {
            entry.target.textContent = current;
          }
        }, 25);
        observer.unobserve(entry.target);
      }
    });
  });

  counters.forEach(counter => observer.observe(counter));
}

document.addEventListener('DOMContentLoaded', animateCounters);
