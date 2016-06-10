/*
	Focal Point by Pixelarity
	pixelarity.com @pixelarity
	License: pixelarity.com/license
*/

(function($) {

	skel
		.breakpoints({
			desktop: '(min-width: 737px)',
			tablet: '(min-width: 737px) and (max-width: 1200px)',
			mobile: '(max-width: 736px)'
		})
		.viewport({
			breakpoints: {
				tablet: {
					width: 1080
				}
			}
		});

	$(function() {

		var	$window = $(window),
			$body = $('body');

		// Fix: Placeholder polyfill.
			$('form').placeholder();

		// Prioritize "important" elements on mobile.
			skel.on('+mobile -mobile', function() {
				$.prioritize(
					'.important\\28 mobile\\29',
					skel.breakpoint('mobile').active
				);
			});

		// Dropdowns.
			$('#nav > ul').dropotron({
				offsetY: -18,
				offsetX: -1,
				mode: 'fade',
				noOpenerFade: true,
				speed: 300,
				alignment: 'center'
			});

		// Off-Canvas Navigation.

			// Title Bar.
				$(
					'<div id="titleBar">' +
						'<a href="#navPanel" class="toggle"></a>' +
					'</div>'
				)
					.appendTo($body);

			// Navigation Panel.
				$(
					'<div id="navPanel">' +
						'<nav>' +
							$('#nav').navList() +
						'</nav>' +
					'</div>'
				)
					.appendTo($body)
					.panel({
						delay: 500,
						hideOnClick: true,
						hideOnSwipe: true,
						resetScroll: true,
						resetForms: true,
						side: 'left',
						target: $body,
						visibleClass: 'navPanel-visible'
					});

			// Fix: Remove transitions on WP<10 (poor/buggy performance).
				if (skel.vars.os == 'wp' && skel.vars.osVersion < 10)
					$('#titleBar, #navPanel, #page-wrapper')
						.css('transition', 'none');

		// Portfolio.
			var poptroxSettings;

			if (skel.breakpoint('mobile').active)
				poptroxSettings = {
					selector: 'a.image',
					baseZIndex: 100000,
					overlayClass: 'poptrox-overlay skel-layers-fixed',
					usePopupDefaultStyling: false,
					overlayColor: '#222',
					overlayOpacity: 0.8,
					windowMargin: 10,
					useBodyOverflow: false,
					usePopupNav: false,
					usePopupEasyClose: true,
					usePopupCloser: false
				};
			else
				poptroxSettings = {
					selector: 'a.image',
					baseZIndex: 100000,
					overlayClass: 'poptrox-overlay skel-layers-fixed',
					usePopupDefaultStyling: false,
					overlayColor: '#222',
					overlayOpacity: 0.8,
					windowMargin: 30,
					useBodyOverflow: false,
					usePopupNav: true,
					usePopupEasyClose: false,
					popupCloserText: ''
				};

			var $portfolio = $('#portfolio');
			if ($portfolio.length > 0) {

				$portfolio
					.poptrox(poptroxSettings)
					.selectorr({
						titleSelector: 'h3',
						fadeOutSpeed: 250,
						fadeInSpeed: 500
					});

			}

			var $portfolioPreview = $('#portfolio-preview');
			if ($portfolioPreview.length > 0)
				$portfolioPreview.poptrox(poptroxSettings);

	});

})(jQuery);