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
