

// ========== REVEAL ON SCROLL ==========
function revealOnScroll() {
  document.querySelectorAll('.reveal').forEach(el => {
    const rect = el.getBoundingClientRect();
    if (rect.top < (window.innerHeight - 80)) {
      el.classList.add('visible');
    }
  });
}
window.addEventListener('scroll', revealOnScroll);
window.addEventListener('load', revealOnScroll);

// ========== TESTIMONIAL SLIDER ==========
// const container = document.getElementById('testimonialContainer');
// let index = 0;
// if (container) {
//   const total = container.children.length;

//   function showSlide(i) {
//     index = (i + total) % total;
//     container.style.transform = `translateX(-${index * 100}%)`;
//   }

//   function nextSlide() { showSlide(index + 1); }
//   function prevSlide() { showSlide(index - 1); }

//   // Auto-slide every 5s
//   setInterval(nextSlide, 5000);

//   // Expose for button controls
//   window.nextSlide = nextSlide;
//   window.prevSlide = prevSlide;
// }
const slider = document.querySelector('.testimonial-slider');
const totalSlides = slider.children.length;
let currentIndex = 0;

function stopAllVideos() {
  const iframes = slider.querySelectorAll('iframe');
  iframes.forEach(iframe => {
    // Reset the video source to stop playback
    const src = iframe.src;
    iframe.src = src;
  });
}

function showSlide(index) {
  stopAllVideos(); // stop previous videos before sliding
  currentIndex = (index + totalSlides) % totalSlides;
  slider.style.transform = `translateX(-${currentIndex * 100}%)`;
}

function nextVideo() { showSlide(currentIndex + 1); }
function prevVideo() { showSlide(currentIndex - 1); }

// Auto-slide every 70 seconds
setInterval(nextVideo, 70000);

// ========== REGISTRATION FORM + PAYSTACK ==========
const sheetURL = "https://script.google.com/macros/s/AKfycbwHGG7B_BzPVelzxJc3cat34ai1j3sL0iqv-FFa_t9SDNCPtNpLN33Vrs33TPwVXObF/exec"; 
const whatsappLink = "https://chat.whatsapp.com/FGKtfnhZAbu4qQbQALNCnN?mode=ems_copy_c"; 

document.addEventListener("DOMContentLoaded", () => {
  const modal = document.getElementById("paymentModal");
  const form = document.getElementById("registrationForm");

  if (!form) return;

  form.addEventListener("submit", function(e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const email = document.getElementById("email").value.trim();
    const phone = document.getElementById("phone").value.trim();
    const location = document.getElementById("location").value.trim();
    const expectations = document.getElementById("expectations").value.trim();
    const plan = document.getElementById("planSelect").value;

    if (!plan) {
      alert("Please select a valid plan.");
      return;
    }

    // Decide amount & currency
    let amount = 0, currency = "NGN";
    switch(plan) {
      case "NGN_Full": amount = 75000; currency = "NGN"; break;
      case "NGN_Installment": amount = 40000; currency = "NGN"; break;
      // case "USD_Full": amount = 50; currency = "USD"; break;
      // case "USD_Installment": amount = 35; currency = "USD"; break;
      default: alert("Invalid plan."); return;
    }

    let finalAmount = amount * 100; // kobo or cents

    // Show modal
    if (modal) modal.style.display = "block";

    // Setup Paystack
    let handler = PaystackPop.setup({
      key: "pk_live_1398907aed1e1d78249e3f8f4ba9ea593d70d57a",
      email,
      amount: finalAmount,
      currency,
      ref: '' + Math.floor((Math.random() * 1000000000) + 1),
      metadata: {
        custom_fields: [
          { display_name: "Name", value: name },
          { display_name: "Phone", value: phone },
          { display_name: "Location", value: location },
          { display_name: "Expectations", value: expectations }
        ]
      },
      callback: function(response) {
        const paymentRef = response.reference;

        // Send data to Google Sheets (mode: no-cors to avoid CORS issue)
        fetch(sheetURL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, location, expectations, plan, amount, currency, paymentRef }),
          headers: { "Content-Type": "application/json" },
          mode: "no-cors"
        }).catch(err => console.warn("Note: cannot read response due to no-cors mode.", err));

        // Hide modal and redirect
        if (modal) modal.style.display = "none";
        window.location.href = whatsappLink;
      },
      onClose: function() {
        if (modal) modal.style.display = "none";
        alert("Payment was not completed.");
      }
    });

    handler.openIframe();
  });
});
