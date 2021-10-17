/**
 *
 * @author : Martin Laxenaire
 * http://www.martin-laxenaire.fr/
 *
 * This is used mostly to display loading progress and handle UI
 *
 */

(function($) {

	if(has_gl) { // webgl supported
		var mountains = [
			"everest",
			"k2",
			"kangchenjunga",
			"lhotse",
			"makalu",
			"cho-oyu",
			"dhaulagiri",
			"manaslu",
			"nanga-parbat",
			"annapurna",
			"gasherbrum-1",
			"broad-peak",
			"gasherbrum-2",
			"shishapangma"
		];
		
		var actualMountain = null;
		
		var routeToggled = false;
		
		menuScroll = new IScroll('#mountain-menu', {
			mouseWheel: true,
			click: true
		});
		
		/*aboutScroll = new IScroll('#about-content', {
			mouseWheel: true,
			click: true,
			scrollbars: true,
			interactiveScrollbars: true
		});*/
		

		$('.outside-link').attr('target', '_new');

		
		$('.toggle-routes').click(function() { // toggle routes
			/*$('.toggle-routes').removeClass('active');
			routeToggled = !routeToggled;
			if(routesMesh) {
				$(this).removeClass('active');
				$(this).closest('.routes-infos').find('.routes-details').removeClass('toggled');
				removeRoutes();
			}
			else {
				$(this).addClass('loading');
				$(this).closest('.routes-infos').find('.routes-details').addClass('toggled');
				var mountain = $(this).attr('data-mountain');
				loadRoutes(mountain);
			}*/
            if($('.toggle-routes').hasClass('active')) {
                $(this).removeClass('active');
                $(this).closest('.routes-infos').find('.routes-details').removeClass('toggled');
                removeRoutes();

                setTimeout(function() {
                    if(infoScroll) {
                        infoScroll.refresh();
                    }
                }, 500);
            }
            else {
                $(this).addClass('active');
                $(this).closest('.routes-infos').find('.routes-details').addClass('toggled');
                var mountain = $(this).attr('data-mountain');
                loadRoutes(mountain);

                setTimeout(function() {
                    if(infoScroll) {
                        infoScroll.refresh();
                    }
                }, 500);
            }
		});

		$(".change-mountain").click(function(e) {
			
			removeRoutes();
			$('.toggle-routes').removeClass('active'); // routes
			$('.routes-details').removeClass('toggled');
			
			$(".change-mountain").removeClass('active');
			$(this).addClass('active');
			var index = $(this).closest('li').index();
			$('.mountain-info-content').removeClass('active');
			$('#mountain-info-wrapper').removeClass('toggled');
			//$('#help-controls').removeClass('toggled');
			
			var mountain = $(this).attr('data-title');
			
			if(routeToggled) {
				loadRoutes(mountain);
				$('#toggle-' + mountain + '-routes').addClass('active');
				$('#' + mountain + '-routes-details').addClass('toggled');
			}
			
			$('#container').stop().animate({
				opacity: 0
			}, 500, function() {
				document.location.hash = '#/' + mountain;
				
				$('#container').stop().animate({
					opacity: 1
				}, 500, function() {
					//$('#help-controls').addClass('toggled');
					$('#mountain-info-wrapper').addClass('toggled');
					$('.mountain-info-content').eq(index).addClass('active');
					
					updateSharingLinks(mountain);
					
					if(infoScroll) {
						infoScroll.refresh();
					}
				});
			})
			
			
			e.stopPropagation();
			e.preventDefault();
			
		});
		
		
		function updateSharingLinks(mountain) {
			// twitter
			var mountainNiceName = mountain.replace("-", " ");
			mountainNiceName = mountainNiceName.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
			
			/* var twitterUrl = encodeURI('https://twitter.com/share?url=http://www.martin-laxenaire.fr/experiments/%23/' + mountain + '/&text=' + mountainNiceName + ' on 8000ers, a WebGL experiment&via=webdesign_ml');
			var facebookUrl = encodeURI('http://www.facebook.com/sharer.php?u=http://www.martin-laxenaire.fr/experiments/%23/' + mountain + '/&t=' + mountainNiceName + ' on 8000ers, a WebGL experiment'); */
			var twitterUrl = 'https://twitter.com/share?url=' + encodeURIComponent(window.location.href) + '/&text=Explore ' + mountainNiceName + ' on 8000ers, a WebGL experiment&via=webdesign_ml';
			var facebookUrl = 'http://www.facebook.com/sharer.php?u=' + encodeURIComponent(window.location.href) + '/&t=Explore ' + mountainNiceName + ' on 8000ers, a WebGL experiment';
			
			$('.twitter-share-link').attr('href', twitterUrl);
			$('.facebook-share-link').attr('href', facebookUrl);
			document.title = mountainNiceName + ' - The eight-thousanders';
		}
		
		$('#toggle-mountain-infos').click(function() {
			$(this).toggleClass('toggled');
			$('#mountain-info').toggleClass('hide-mountain-infos');
		});
		
		/*$('#close-about').click(function() {
			if(actualMountain) {
				window.location.hash = '#/' + actualMountain;
			}
			else {
				window.location.hash = '#/everest';
			}
			$('#about').removeClass('toggled');
		});*/

		
		//load mountain based on hash
		$(window).bind('hashchange', function() {
			var hash = window.location.hash;
			ga('send', 'pageview', 'experiments/8000ers/' + hash); // should change
			hash = hash.substring(2);
			if(mountains.indexOf(hash) !== -1 && hash === actualMountain) {
				//$('#about').removeClass('toggled');
				$('.mountain-info-content, .change-mountain').removeClass('active');
				$('.mountain-info-content').each(function() {
					if($(this).hasClass(window.location.hash.substring(2) + '-info')) {
						$(this).addClass('active');
					}
				});
				$('.change-mountain').each(function() {
					if($(this).attr('data-title') === window.location.hash.substring(2)) {
						$(this).addClass('active');
					}
				});
				$('#mountain-info-wrapper').addClass('toggled');
				if(infoScroll) {
					infoScroll.refresh();
				}
			}
			else if(mountains.indexOf(hash) !== -1) {
				//$('#about').removeClass('toggled');
				loadMountain(hash);
				actualMountain = hash;
			}
			/* else if(hash === 'about') {
				$('#about').addClass('toggled');
			} */
			else {
				//$('#about').removeClass('toggled');
				loadMountain('everest');
				actualMountain = 'everest';
			}
		});
		

		// check for about page
		/* if(window.location.hash === '#/about') {
			$('#about').toggleClass('toggled');
		} */
		
		// display mountain based on hash
		if(window.location.hash && mountains.indexOf(window.location.hash.substring(2)) !== -1) {
			loadMountain(window.location.hash.substring(2));
			actualMountain = window.location.hash.substring(2);
			$('.mountain-info-content, .change-mountain').removeClass('active');
			$('.mountain-info-content').each(function() {
				if($(this).hasClass(window.location.hash.substring(2) + '-info')) {
					$(this).addClass('active');
				}
			});
			$('.change-mountain').each(function() {
				if($(this).attr('data-title') === window.location.hash.substring(2)) {
					$(this).addClass('active');
				}
			});
			//$('#mountain-info-wrapper').addClass('toggled');
			
			infoScroll = new IScroll('#mountain-all-infos', {
				mouseWheel: true,
				click: true,
				scrollbars: true,
				interactiveScrollbars: true
			});
			
			updateSharingLinks(window.location.hash.substring(2));
		}
		else {
			loadMountain('everest');
			actualMountain = 'everest';
			$(".change-mountain").first().addClass('active');
			$(".mountain-info-content").first().addClass('active');
			//$('#help-controls').addClass('toggled');
			
			infoScroll = new IScroll('#mountain-all-infos', {
				mouseWheel: true,
				click: true,
				scrollbars: true,
				interactiveScrollbars: true
			});
			
			updateSharingLinks('everest');
		}
		
		// mobile layout
		if(window.matchMedia("(max-width: 800px)").matches) {
			$('#mountain-info').addClass('hide-mountain-infos');
			$('#toggle-mountain-infos').addClass('toggled');
		}
		
		// loading progress
		$('#mountain').width('10%');				
		function loadHeightMaps(imageIndex) {
			$('#loading-infos').empty().text('Loading heightmaps');
			var img = new Image();
			//console.log('loading heightmap ', imageIndex, img);
			img.onload = function () {
				if(imageIndex < mountains.length - 1) {
					$('#mountain').width((10 + (imageIndex * 10) / mountains.length) + '%');
					//console.log('heightmap loaded ', imageIndex, img, img.src);
					loadHeightMaps(imageIndex + 1);
				}
				else {
					//console.log('all heightmaps loaded');
					loadImages(0);
				}
			};
			img.src = "images/heightmaps/" + mountains[imageIndex] + "-256.jpg";
		}
		
		
		function loadImages(imageIndex) {
			$('#loading-infos').empty().text('Loading textures');
			var img = new Image();
			//console.log('loading mountain ', imageIndex, img);
			img.onload = function () {
				if(imageIndex < mountains.length - 1) {
					$('#mountain').width((20 + (imageIndex * 90) / mountains.length) + '%');
					//console.log('mountain loaded ', imageIndex, img, img.src);
					loadImages(imageIndex + 1);
				}
				else {
					//console.log('all pictures loaded');
					$('#loading-infos').empty().text('Loading complete');
					$('#mountain').width('100%');
					$('body').addClass('mountain-frame');
					$('#mountain-info-wrapper').addClass('toggled');
				}
			}
			img.src = "images/pictures/" + mountains[imageIndex] + "-picture" + textureQuality + ".jpg";
		}
		
		loadHeightMaps(0);
	}
	else { // no webgl
		$('#loading').empty().html('<h3>Oops !</h3>It seems that your browser does not support WebGL.<br/>Please check that your video card drivers are up to date and/or try again with another browser (latests versions of Google Chrome should work just fine).')
	}

})(jQuery);

// trigger onload event on back/forth navigation
window.onunload = function(){};