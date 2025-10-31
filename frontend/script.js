// === Scroll Fade Animation ===
const sections = document.querySelectorAll("section");
window.addEventListener("scroll", () => {
    sections.forEach(sec => {
        const top = sec.getBoundingClientRect().top;
        if (top < window.innerHeight - 100) sec.classList.add("visible");
    });
});

// === Animated Stats Counter ===
document.addEventListener("DOMContentLoaded", () => {
    const counters = document.querySelectorAll(".neon-number");
    let hasAnimated = false;

    function startCount() {
        counters.forEach(counter => {
            const target = parseInt(counter.dataset.target);
            let current = 0;
            const step = target / 100;

            function update() {
                current += step;
                if (current < target) {
                    counter.textContent = Math.floor(current);
                    requestAnimationFrame(update);
                } else {
                    if (target === 95) counter.textContent = "95%";
                    else if (target === 10000) counter.textContent = "10K+";
                    else counter.textContent = "24";
                }
            }
            update();
        });
    }

    function onScroll() {
        const rect = document.querySelector(".stats").getBoundingClientRect();
        if (!hasAnimated && rect.top < window.innerHeight - 100) {
            hasAnimated = true;
            startCount();
        }
    }

    window.addEventListener("scroll", onScroll);
    onScroll();
});