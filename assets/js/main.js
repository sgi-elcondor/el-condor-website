;
(function ($) {
    "use strict";

    jQuery(document).ready(function () {

        AOS.init({ once: true, duration: 500, offset: 60 });

        // Testimonial slider
        if ($(".test-slider").length) {
            var testSwiper = new Swiper(".test-slider", {
                autoplay: { delay: 2500, disableOnInteraction: true },
                speed: 1200,
                loop: true,
                pagination: { el: ".test-pagination", clickable: true },
                on: {
                    slideChangeTransitionStart: function () {
                        $(".testimonials .test-img, .testimonials h5, .testimonials span, .testimonials p")
                            .removeClass("aos-init aos-animate");
                    },
                    slideChangeTransitionEnd: function () {
                        AOS.init({ once: true, duration: 500, offset: 60 });
                    }
                }
            });

            $(".test-slider").hover(
                function () { this.swiper.autoplay.stop(); },
                function () { this.swiper.autoplay.start(); }
            );
        }

        // FAQ acordeón con apertura/cierre animados (un <details> no anima el cierre)
        var faqItems = document.querySelectorAll(".faq-item");
        if (faqItems.length) {
            var animateFaq = function (item, answer, opening) {
                if (!answer) return;
                item.classList.add("faq-animating");
                if (opening) item.open = true;
                var full = answer.scrollHeight;
                answer.style.height = (opening ? 0 : full) + "px";
                requestAnimationFrame(function () {
                    answer.style.height = (opening ? full : 0) + "px";
                });
                answer.addEventListener("transitionend", function done(e) {
                    if (e.propertyName !== "height") return;
                    if (!opening) item.open = false;
                    answer.style.height = "";
                    item.classList.remove("faq-animating");
                    answer.removeEventListener("transitionend", done);
                });
            };

            faqItems.forEach(function (item) {
                var summary = item.querySelector("summary");
                var answer  = item.querySelector(".faq-answer");
                if (!summary || !answer) return;

                summary.addEventListener("click", function (e) {
                    e.preventDefault();
                    if (item.classList.contains("faq-animating")) return;
                    if (item.open) {
                        animateFaq(item, answer, false);
                    } else {
                        faqItems.forEach(function (other) {
                            if (other !== item && other.open && !other.classList.contains("faq-animating")) {
                                animateFaq(other, other.querySelector(".faq-answer"), false);
                            }
                        });
                        animateFaq(item, answer, true);
                    }
                });
            });
        }

        // Contador animado de métricas (index.html)
        var statNumbers = document.querySelectorAll(".stat-number[data-count]");
        if (statNumbers.length) {
            var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

            var animateCount = function (el) {
                var target = parseInt(el.getAttribute("data-count"), 10) || 0;
                var prefix = el.getAttribute("data-prefix") || "";
                if (reduceMotion) { el.textContent = prefix + target; return; }
                var duration = 1600, start = null;
                var step = function (ts) {
                    if (!start) start = ts;
                    var p = Math.min((ts - start) / duration, 1);
                    var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
                    el.textContent = prefix + Math.round(eased * target);
                    if (p < 1) requestAnimationFrame(step);
                };
                requestAnimationFrame(step);
            };

            if ("IntersectionObserver" in window) {
                var obs = new IntersectionObserver(function (entries) {
                    entries.forEach(function (entry) {
                        if (entry.isIntersecting) {
                            animateCount(entry.target);
                            obs.unobserve(entry.target);
                        }
                    });
                }, { threshold: 0.4 });
                statNumbers.forEach(function (el) {
                    el.textContent = (el.getAttribute("data-prefix") || "") + "0";
                    obs.observe(el);
                });
            } else {
                statNumbers.forEach(animateCount);
            }
        }

    });

    jQuery(window).on("load", function () {
        $(".css-loader").fadeOut("slow");
    });

    // Header pill — disappear completely on scroll
    window.addEventListener("scroll", function () {
        var header = document.querySelector(".main-header");
        if (!header) return;
        if (window.scrollY > 60) {
            header.classList.add("header-hidden");
        } else {
            header.classList.remove("header-hidden");
        }
    });

})(jQuery);
