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
const slider = document.querySelector('.testimonial-slider');
if (slider) {
  const totalSlides = slider.children.length;
  let currentIndex = 0;

  function stopAllVideos() {
    const iframes = slider.querySelectorAll('iframe');
    iframes.forEach(iframe => {
      const src = iframe.src;
      iframe.src = src; // reset to stop playback
    });
  }

  function showSlide(index) {
    stopAllVideos();
    currentIndex = (index + totalSlides) % totalSlides;
    slider.style.transform = `translateX(-${currentIndex * 100}%)`;
  }

  function nextVideo() { showSlide(currentIndex + 1); }
  function prevVideo() { showSlide(currentIndex - 1); }

  // Auto-slide every 70 seconds
  setInterval(nextVideo, 70000);

  // Optional: expose for manual control
  window.nextVideo = nextVideo;
  window.prevVideo = prevVideo;
}

// ========== REGISTRATION FORM + PAYSTACK ==========
const sheetURL = "https://script.google.com/macros/s/AKfycbynqMrMdHoLZGKh7bI4TWaVZgyfWEVHJfsw5gNLPEb5Kyh73mMYxeyMxkILwyiah9X2/exec";
const whatsappLink = "https://chat.whatsapp.com/FGKtfnhZAbu4qQbQALNCnN";

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
    switch (plan) {
      case "NGN_Full": amount = 75000; currency = "NGN"; break;
      case "NGN_Installment": amount = 40000; currency = "NGN"; break;
      default: alert("Invalid plan."); return;
    }

    const finalAmount = amount * 100; // convert to kobo

    if (modal) modal.style.display = "block";

    const handler = PaystackPop.setup({
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

        // Send to Google Sheet
        fetch(sheetURL, {
          method: "POST",
          body: JSON.stringify({ name, email, phone, location, expectations, plan, amount, currency, paymentRef }),
          headers: { "Content-Type": "application/json" },
          mode: "no-cors"
        }).catch(err => console.warn("Note: cannot read response due to no-cors mode.", err));

        // Close modal
        document.body.style.overflow = "auto";
        if (modal) modal.style.display = "none";

        // Redirect to WhatsApp after small delay
        setTimeout(() => {
          try {
            window.location.href = whatsappLink;
          } catch (e) {
            console.error("Redirect failed:", e);
          }
        }, 500);

        // ===== FALLBACK JOIN BUTTON (in case redirect fails) =====
        setTimeout(() => {
          if (!document.getElementById("joinWhatsappFallback")) {
            const fallbackDiv = document.createElement("div");
            fallbackDiv.id = "joinWhatsappFallback";
            fallbackDiv.style.position = "fixed";
            fallbackDiv.style.top = "0";
            fallbackDiv.style.left = "0";
            fallbackDiv.style.width = "100%";
            fallbackDiv.style.height = "100%";
            fallbackDiv.style.background = "rgba(0,0,0,0.85)";
            fallbackDiv.style.display = "flex";
            fallbackDiv.style.flexDirection = "column";
            fallbackDiv.style.alignItems = "center";
            fallbackDiv.style.justifyContent = "center";
            fallbackDiv.style.zIndex = "9999";
            fallbackDiv.innerHTML = `
              <div style="background:#fff; padding:30px 40px; border-radius:16px; text-align:center; max-width:420px; box-shadow:0 6px 20px rgba(0,0,0,0.3);">
                <h2 style="color:#1e3a8a; margin-bottom:12px;">Payment Successful 🎉</h2>
                <p style="margin-bottom:20px; color:#333; font-size:15px;">
                  If you were not redirected automatically,<br>
                  click below to join the WhatsApp group.
                </p>
                <a href="${whatsappLink}" target="_blank" style="background:#1e3a8a; color:#00ffff; text-decoration:none; padding:12px 26px; border-radius:8px; font-weight:600; transition:0.3s;">
                  Join WhatsApp Group
                </a>
              </div>
            `;
            document.body.appendChild(fallbackDiv);
          }
        }, 3000); // Show fallback after 3 seconds
      },
      onClose: function() {
        if (modal) modal.style.display = "none";
        alert("Payment was not completed.");
      }
    });

    handler.openIframe();
  });
});
