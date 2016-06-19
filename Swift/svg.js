/**
 * @constructor
 * @this {SVGA}
 * @param {HTMLElement} el The HTMLElement of the SVG to animate.
 * @return {Object} Public methods.
 */
var SVGA = function (el) {
    // passed arguments
    /** @private */ 
    var _opts = {}, 
    // stores the interval object
    /** @private */     
    _interval = null, 

    // cache of dom elements
    /** @private */    
    _dom = {
        // SVG HTMLElement
        svg: el,           
        // array of frame elements
        frames: null,       
        // play button HTMLElement
        playbutton: el.parentNode.querySelector('.svg-play-button')
    },
        
    /** @private */     
    _frame = {
        current: 0,     // index of the frame that's currently showing
        total: 0,       // amount of actual frames to cycle through
        delayed: 0      // number of frames that should pause after a loop
    },

    // counter of times the animation has looped
    /** @private */     
    _plays = 0;
    // flag for if the animation is currently running
    /** @private */    
    _isPlaying = false;

    return {
        /**
         * Initializes the SVGA object with 
         * @this {SVGA}
         * @param {Object} params A dictionary of options to pass
         */
        init: function (params) {
            // default params
            _opts = params || {
                dur: 50,        // ms in between frames
                delay: 800,     // ms pause after 1 loop
                playCap: 5      // number of loops
            };
            // get svg document 
            var svg = _dom.svg.contentDocument;
            // cache frame elements
            _dom.frames = svg.querySelectorAll('svg > g'); 
            // count visible frames
            _frame.total = _dom.frames.length;
            // count invisible frames
            _frame.delayed = Math.round(_opts.delay / _opts.dur);  
            // set starting frame to bottom-most frame                   
            _frame.current = _frame.total - 1;
        }, 
        /**
         * Kicks off the {@see loop} interval.
         * @this {SVGA}
         */
        start: function () {
            _interval = this.loop(_opts.dur);
            _isPlaying = true;
            _dom.playbutton.classList.add('faded');
        }, 
        /**
         * Loops through each frame of the SVG by setting an interval.
         * @this {SVGA}
         * @param {Number} dur The duration of time between frames, in ms.
         * @return {Interval} The interval, which .stop() clears.
         */
        loop: function (dur) {
            var that = this;
            var interval = setInterval(function () {
                
                // if this is not the text or phone layer
                if (_frame.current >= 1) {
                    // show the current frame
                    _dom.frames[_frame.current].style.display = 'block'; 
                    // if this isn't the last frame (because we want the last frame to hold)
                    if ( _frame.current !== _frame.total - 1) {
                        // hide the previous frame
                        _dom.frames[_frame.current + 1].style.display = 'none'; 
                    }
                }
                that.next();

            }, dur);

            return interval;
        }, 
        /**
         * Proceed to the next frame.
         * @this {SVGA}
         */
        next: function () {
            // if we're at the second to last frame (1)
            // last frame is the text, which we're not touching
            if (_frame.current === _frame.delayed * -1) {
                // if we've reached our max play count
                if (_plays === _opts.playCap - 1) {
                    // reset to base frame
                    this.stop();
                }
                else {
                    // hide top frame
                    // (text and phone are frames 0 and 1, which we shouldn't touch)
                    _dom.frames[1].style.display = 'none'; 
                    // rewind to beginning
                    _frame.current = _frame.total - 1;
                    _dom.frames[_frame.current].style.display = 'block'; 

                    _plays++;
                }
            }
            // otherwise, decrement
            else {
                _frame.current--;
            }
        }, 
        /**
         * Stops and resets the animation.
         * @this {SVGA}
         */
        stop: function () {
            // clear the interval loop
            clearInterval(_interval);

            // hide all frames except the text and iphone layers
            for (var i = 1; i < _dom.frames.length; i++) {
                _dom.frames[i].style.display = 'none'; 
            }
            // show the first frame
            _frame.current = _frame.total - 1;
            _dom.frames[_frame.current].style.display = 'block'; 

            // reset the play count
            _plays = 0;

            // show the play button
            _dom.playbutton.classList.remove('faded');

            _isPlaying = false;
        }, 
        /**
         * Stops and resets the animation.
         * @this {SVGA}
         * @return {Boolean} A Boolean value determining whether the animation is currently playing.
         */
        isPlaying: function () {
            return _isPlaying;
        }
    };
};

window.addEventListener('load', function(){
    // keeps track of other playing animations on the page
        var peripheralAnimation = null;
        // SVGAs must be wrapped in a .svg-container div!
        var containers = document.querySelectorAll('.svg-container');
        // foreach svg animation on the page
        Array.prototype.forEach.call(containers, function (container) {
            var svg = container.querySelector('.svg-animation'), 
                svgAnimation = new SVGA(svg);

            // init svg animation object
            svgAnimation.init();

            // start the animation on click
            svg.contentDocument.querySelector('svg').addEventListener('click', function (e) { 
                e.preventDefault();
                // ensure no other animations are playing at the same time
                if (peripheralAnimation && 
                    svgAnimation !== peripheralAnimation && 
                    peripheralAnimation.isPlaying()) {
                        peripheralAnimation.stop();
                }

                if (!svgAnimation.isPlaying()) {
                    svgAnimation.start();
                    peripheralAnimation = svgAnimation;
                }
            });
        });
});