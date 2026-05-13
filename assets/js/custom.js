(function ($) {
	
	"use strict";

	$(function() {
        $("#tabs").tabs();
    });

	$(window).scroll(function() {
	  var scroll = $(window).scrollTop();
	  var box = $('.header-text').height();
	  var header = $('header').height();

	  if (scroll >= box - header) {
	    $("header").addClass("background-header");
	  } else {
	    $("header").removeClass("background-header");
	  }
	});
	

	$('.schedule-filter li').on('click', function() {
        var tsfilter = $(this).data('tsfilter');
        $('.schedule-filter li').removeClass('active');
        $(this).addClass('active');
        if (tsfilter == 'all') {
            $('.schedule-table').removeClass('filtering');
            $('.ts-item').removeClass('show');
        } else {
            $('.schedule-table').addClass('filtering');
        }
        $('.ts-item').each(function() {
            $(this).removeClass('show');
            if ($(this).data('tsmeta') == tsfilter) {
                $(this).addClass('show');
            }
        });
    });


	// Window Resize Mobile Menu Fix
	mobileNav();


	// Scroll animation init
	window.sr = new scrollReveal();
	

	// Menu Dropdown Toggle
	if($('.menu-trigger').length){
		$(".menu-trigger").on('click', function() {	
			$(this).toggleClass('active');
			$('.header-area .nav').slideToggle(200);
		});
	}


	$(document).ready(function () {
	    $(document).on("scroll", onScroll);
	    
	    //smoothscroll
	    $('.scroll-to-section a[href^="#"]').on('click', function (e) {
	        e.preventDefault();
	        $(document).off("scroll");
	        
	        $('a').each(function () {
	            $(this).removeClass('active');
	        })
	        $(this).addClass('active');
	      
	        var target = this.hash,
	        menu = target;
	       	var target = $(this.hash);
	        $('html, body').stop().animate({
	            scrollTop: (target.offset().top) + 1
	        }, 500, 'swing', function () {
	            window.location.hash = target;
	            $(document).on("scroll", onScroll);
	        });

	        // Close mobile menu after clicking a link
	        if($(window).width() < 992) {
	            $('.header-area .nav').slideUp(200);
	            $('.menu-trigger').removeClass('active');
	        }
	    });

	    // Close mobile menu when clicking on any nav link (including WhatsApp)
	    $('.header-area .nav li a').on('click', function() {
	        if($(window).width() < 992) {
	            $('.header-area .nav').slideUp(200);
	            $('.menu-trigger').removeClass('active');
	        }
	    });
	});

	function onScroll(event){
	    var scrollPos = $(document).scrollTop();
	    $('.nav a').each(function () {
	        var currLink = $(this);
	        var refElement = $(currLink.attr("href"));
	        if (refElement.position().top <= scrollPos && refElement.position().top + refElement.height() > scrollPos) {
	            $('.nav ul li a').removeClass("active");
	            currLink.addClass("active");
	        }
	        else{
	            currLink.removeClass("active");
	        }
	    });
	}


	// Page loading animation
	 $(window).on('load', function() {

        $('#js-preloader').addClass('loaded');

    });


	// Window Resize Mobile Menu Fix
	$(window).on('resize', function() {
		mobileNav();
	});

	// -----------------------------------------------
	// Tours carousel – with horizontal-swipe-only fix
	// -----------------------------------------------
	(function initToursCarousel() {
		var carousel = document.querySelector('[data-carousel]');
		if (!carousel) { return; }

		var track    = carousel.querySelector('.tours-track');
		var viewport = carousel.querySelector('.tours-viewport');
		var slides   = carousel.querySelectorAll('.tour-slide');
		var dots     = carousel.querySelectorAll('.tours-dot');
		var prevBtn  = carousel.querySelector('.tours-nav.prev');
		var nextBtn  = carousel.querySelector('.tours-nav.next');

		var currentIndex  = 0;
		var touchStartX   = 0;
		var touchStartY   = 0;
		var touchCurrentX = 0;
		var isTouching    = false;
		var swipeAxis     = null; // null=undecided, 'h'=horizontal, 'v'=vertical

		if (!track || !slides.length) { return; }

		function updateCarousel(index) {
			if (index < 0)              { index = slides.length - 1; }
			if (index >= slides.length) { index = 0; }
			currentIndex = index;
			track.style.transform = 'translateX(-' + (currentIndex * 100) + '%)';
			dots.forEach(function(dot, dotIndex) {
				var isActive = dotIndex === currentIndex;
				dot.classList.toggle('active', isActive);
				dot.setAttribute('aria-selected', isActive ? 'true' : 'false');
			});
		}

		if (prevBtn) { prevBtn.addEventListener('click', function() { updateCarousel(currentIndex - 1); }); }
		if (nextBtn) { nextBtn.addEventListener('click', function() { updateCarousel(currentIndex + 1); }); }

		dots.forEach(function(dot) {
			dot.addEventListener('click', function() {
				var index = parseInt(dot.getAttribute('data-slide'), 10);
				if (!isNaN(index)) { updateCarousel(index); }
			});
		});

		function handleTouchStart(event) {
			if (!event.touches || !event.touches.length) { return; }
			isTouching    = true;
			swipeAxis     = null;
			touchStartX   = event.touches[0].clientX;
			touchStartY   = event.touches[0].clientY;
			touchCurrentX = touchStartX;
		}

		function handleTouchMove(event) {
			if (!isTouching || !event.touches || !event.touches.length) { return; }
			var dx = event.touches[0].clientX - touchStartX;
			var dy = event.touches[0].clientY - touchStartY;

			// Determine axis once movement is clear
			if (swipeAxis === null && (Math.abs(dx) > 6 || Math.abs(dy) > 6)) {
				swipeAxis = Math.abs(dx) >= Math.abs(dy) ? 'h' : 'v';
			}

			// Prevent page scroll only during horizontal swipe
			if (swipeAxis === 'h') {
				event.preventDefault();
			}

			touchCurrentX = event.touches[0].clientX;
		}

		function handleTouchEnd() {
			if (!isTouching) { return; }
			isTouching = false;
			if (swipeAxis !== 'h') { return; }
			var swipeDistance = touchCurrentX - touchStartX;
			if (Math.abs(swipeDistance) < 35) { return; }
			if (swipeDistance < 0) { updateCarousel(currentIndex + 1); }
			else                   { updateCarousel(currentIndex - 1); }
		}

		if (viewport) {
			viewport.addEventListener('touchstart',  handleTouchStart,  { passive: true  });
			// passive:false required so we can call preventDefault() for horizontal swipes
			viewport.addEventListener('touchmove',   handleTouchMove,   { passive: false });
			viewport.addEventListener('touchend',    handleTouchEnd,    { passive: true  });
			viewport.addEventListener('touchcancel', function() { isTouching = false; swipeAxis = null; }, { passive: true });
		}

		window.addEventListener('keydown', function(event) {
			if (event.key === 'ArrowRight') { updateCarousel(currentIndex + 1); }
			if (event.key === 'ArrowLeft')  { updateCarousel(currentIndex - 1); }
		});

		updateCarousel(0);
	})();


	// -----------------------------------------------
	// Gallery – tab filtering + lightbox
	// -----------------------------------------------
	(function initGallery() {
		var tabs     = document.querySelectorAll('.gallery-tab');
		var items    = document.querySelectorAll('.gallery-item');
		var lightbox = document.getElementById('gallery-lightbox');
		var lbImg    = document.getElementById('gallery-lightbox-img');
		var lbClose  = document.getElementById('gallery-lightbox-close');

		if (!tabs.length || !items.length) { return; }

		function showCategory(category) {
			tabs.forEach(function(tab) {
				tab.classList.toggle('active', tab.dataset.category === category);
			});
			items.forEach(function(item) {
				if (item.dataset.category === category) {
					item.classList.remove('gallery-hidden');
				} else {
					item.classList.add('gallery-hidden');
				}
			});
		}

		showCategory(tabs[0].dataset.category);

		tabs.forEach(function(tab) {
			tab.addEventListener('click', function() { showCategory(tab.dataset.category); });
		});

		if (lightbox && lbImg) {
			items.forEach(function(item) {
				item.addEventListener('click', function() {
					var img = item.querySelector('img');
					if (!img) { return; }
					lbImg.src = img.src;
					lbImg.alt = img.alt || '';
					lightbox.classList.add('active');
					document.body.style.overflow = 'hidden';
				});
			});

			function closeLightbox() {
				lightbox.classList.remove('active');
				document.body.style.overflow = '';
				lbImg.src = '';
			}

			lightbox.addEventListener('click', function(e) {
				if (e.target === lightbox) { closeLightbox(); }
			});

			if (lbClose) { lbClose.addEventListener('click', closeLightbox); }

			document.addEventListener('keydown', function(e) {
				if (e.key === 'Escape' && lightbox.classList.contains('active')) { closeLightbox(); }
			});
		}
	})();


	// Window Resize Mobile Menu Fix
	function mobileNav() {
		var width = $(window).width();
		$('.submenu').on('click', function() {
			if(width < 767) {
				$('.submenu ul').removeClass('active');
				$(this).find('ul').toggleClass('active');
			}
		});
	}


})(window.jQuery);
