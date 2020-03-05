var preloadImages = function(imageSources, callback) {

	var images = [];

	var tryCallback = function() {
		var allImagesLoaded = (function(){
			for (var i = images.length; i--;) {
				if(!images[i].isLoaded){
					return false;
				}
			}
			return true;
		})();

		if(allImagesLoaded) {
			callback();
		}
	};

	for (var i = imageSources.length; i--;) {
		var imageSrc = imageSources[i];
		var image = document.createElement('img');
		images.push(image);
		image.onload = function() {
			this.isLoaded = true;
			tryCallback();
		};
		image.src = imageSrc;
	}
};

// var callback = function() {
// 	console.log('OHHAI!')
// };

// preloadImages([
// 	'http://placekitten.com/1000/1000',
// 	'http://placekitten.com/300/1000',
// 	'http://placekitten.com/1000/2000'
// ], callback);