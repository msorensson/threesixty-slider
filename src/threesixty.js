/*!
 * 360 degree Image Slider v2.0.4
 * http://gaurav.jassal.me
 *
 * Copyright 2015, gaurav@jassal.me
 * Dual licensed under the MIT or GPL Version 3 licenses.
 *
 */

'use strict';
require('classlist-polyfill');
var assign = require('lodash/assign');

/**
 * @class ThreeSixty
 * **The ThreeSixty slider class**.
 */
var ThreeSixty = function(el, options) {
    var self = this,
        AppConfig,
        frames = [];

    self.el = el;
    self.frames = [];

    /**
     * @method init
     * The function extends the user options with default settings for the
     * slider and initilize the slider.
     */
    self.init = function() {
        AppConfig = assign(ThreeSixty.defaultOptions, options);
        if(AppConfig.disableSpin) {
            AppConfig.currentFrame = 1;
            AppConfig.endFrame = 1;
        }
        self.initProgress();
        self.loadImages();
    };

    /**
     * @method initProgress
     * The function sets initial styles and start the progress indicator
     * to show loading of images.
     *
     * @private
     */
    self.initProgress = function() {
        var spinner;

        self.el.style.width = AppConfig.width + 'px';
        self.el.style.height = AppConfig.height + 'px';
        self.el.style.backgroundImage = 'none !important';

        if(AppConfig.styles) {
            for (var key in AppConfig.styles) {
                self.el.style[key] = AppConfig.styles[key];
            }
        }

        self.responsive();

        spinner = self.el.querySelector(AppConfig.progress);
        if (spinner) {
            spinner.style.marginTop = ((AppConfig.height / 2) - 15) + 'px';
        }
    };

    /**
     * @method getNextImageByFolder
     * @private
     * The function returns the name of the next image based on index and folder path.
     */
    self.getNextImageByFolder = function() {
        var selfIndex, host;

        selfIndex = AppConfig.zeroSelfd ? 0 : 1;
        return !AppConfig.imgArray ?
            AppConfig.domain + AppConfig.imagePath + AppConfig.filePrefix + self.zeroPad((AppConfig.loadedImages + selfIndex)) + AppConfig.ext + ((self.browser.isIE()) ? '?' + new Date().getTime() : '') : AppConfig.imgArray[AppConfig.loadedImages];
    };

    /**
     * @method loadImages
     * @private
     * The function asynchronously loads images and inject into the slider.
     */
    self.loadImages = function() {
        var li, image, imageName, imageList;
        imageName = self.getNextImageByFolder();

        li = document.createElement('li');
        image = document.createElement('img');

        image.setAttribute('src', imageName);
        image.classList.add('previous-image');
        li.appendChild(image);

        self.frames.push(image);

        imageList = self.el.querySelector(AppConfig.imgList);
        imageList.appendChild(li);

        image.onload = function() {
            self.imageLoaded();
        };
    };

    /**
     * @method imageLoaded
     * @private
     * The function gets triggers once the image is loaded. We also update
     * the progress percentage in this function.
     */
    self.imageLoaded = function () {
        var spinnerTextEl = self.el.querySelector(AppConfig.progress + ' span');
        AppConfig.loadedImages += 1;

        if (spinnerTextEl) {
            spinnerTextEl.innerHTML = Math.floor(AppConfig.loadedImages / AppConfig.totalFrames * 100) + '%';
        }

        if (AppConfig.loadedImages >= AppConfig.totalFrames) {
            if(AppConfig.disableSpin) {
                self.frames[0].classList.remove('previous-image');
                self.frames[0].classList.add('current-image');
            }

            self.showImages();
            self.showNavigation();
        } else {
            self.loadImages();
        }
    };

    /**
     * @method showImages
     * @private
     * This function is called when all the images are loaded.
     * **The function does following operations**
     * - Removes background image placeholder
     * - Displays the 360 images
     * - Initilizes mouse intraction events
     */
    self.showImages = function () {
        var imgList = self.el.querySelector(AppConfig.imgList);
        imgList.classList.add('visible');
        self.ready = true;
        AppConfig.ready = true;

        if (AppConfig.drag) {
            self.initEvents();
        }
        self.refresh();
        AppConfig.onReady();

        setTimeout(function() { self.responsive(); }, 50);
    };

    /**
     * @method showNavigation
     * Creates a navigation panel if navigation is set to true in the
     * settings.
     */
    self.showNavigation = function() {
        if (AppConfig.navigation && !AppConfig.navigation_init) {
            var nav_bar, next, previous, play_stop;

            nav_bar = document.createElement('div');
            nav_bar.classList.add('nav_bar');

            next = document.createElement('a');
            next.classList.add('nav_bar_next');
            next.setAttribute('href', '#');
            next.innerHTML = 'next';

            previous = document.createElement('a');
            previous.classList.add('nav_bar_previous');
            previous.setAttribute('href', '#');
            previous.innerHTML = 'previous';

            play_stop = document.createElement('a');
            play_stop.classList.add('nav_bar_play');
            play_stop.setAttribute('href', '#');
            play_stop.innerHTML = 'play';

            nav_bar.appendChild(previous);
            nav_bar.appendChild(play_stop);
            nav_bar.appendChild(next);

            self.el.insertBefore(nav_bar, self.el.firstChild);

            next.addEventListener('mousedown', self.next);
            next.addEventListener('touchstart', self.next);

            previous.addEventListener('mousedown', self.previous);
            previous.addEventListener('touchstart', self.previous);

            play_stop.addEventListener('mousedown', self.play_stop);
            play_stop.addEventListener('touchstart', self.play_stop);
            AppConfig.navigation_init = true;
        }
    };

    /**
     * @method play_stop
     * @private
     * Function toggles the autoplay rotation of 360 slider
     * @param {Object} [event] jQuery events object.
     *
     */

    self.play_stop = function(event) {
        event.preventDefault();

        if (!AppConfig.autoplay) {
            AppConfig.autoplay = true;
            AppConfig.play = setInterval(self.moveToNextFrame, AppConfig.playSpeed);
            event.currentTarget.classList.remove('nav_bar_play');
            event.currentTarget.classList.add('nav_bar_stop');
        } else {
            AppConfig.autoplay = false;
            event.currentTarget.classList.remove('nav_bar_stop');
            event.currentTarget.classList.add('nav_bar_play');
            clearInterval(AppConfig.play);
            AppConfig.play = null;
        }
    };

    /**
     * @method next
     * Using this function you can rotate 360 to next 5 frames.
     * @param {Object} [event] jQuery events object.
     *
     */
    self.next = function(event) {
        if (event) { event.preventDefault(); }
        AppConfig.endFrame -= 5;
        self.refresh();
    };

    /**
     * @method previous
     * Using this function you can rotate 360 to previous 5 frames.
     * @param {Object} [event] jQuery events object.
     *
     */
    self.previous = function(event) {
        if (event) { event.preventDefault(); }
        AppConfig.endFrame += 5;
        self.refresh();
    };

    /**
     * @method play
     * You are start the auto rotaion for the slider with this function.
     *
     */
    self.play = function(speed, direction) {
        var _speed = speed || AppConfig.playSpeed;
        var _direction = direction || AppConfig.autoplayDirection;
        AppConfig.autoplayDirection = _direction;

        if (!AppConfig.autoplay) {
            AppConfig.autoplay = true;
            AppConfig.play = setInterval(self.moveToNextFrame, _speed);
        }
    };

    /**
     * @method stop
     * You can stop the auto rotation of the 360 slider with this function.
     *
     */
    self.stop = function() {
        if (AppConfig.autoplay) {
            AppConfig.autoplay = false;
            clearInterval(AppConfig.play);
            AppConfig.play = null;
        }
    };

    /**
     * @method endFrame
     * @private
     * Function animates to previous frame
     *
     */
    self.moveToNextFrame = function () {
        if (AppConfig.autoplayDirection === 1) {
            AppConfig.endFrame -= 1;
        } else {
            AppConfig.endFrame += 1;
        }
        self.refresh();
    };

    /**
     * @method gotoAndPlay
     * @public
     * Function animates to previous frame
     *
     */
    self.gotoAndPlay = function (n) {
        if( AppConfig.disableWrap ) {
            AppConfig.endFrame = n;
            self.refresh();
        } else {
            // Since we could be looped around grab the multiplier
            var multiplier = Math.ceil(AppConfig.endFrame / AppConfig.totalFrames);
            if(multiplier === 0) {
                multiplier = 1;
            }

            // Figure out the quickest path to the requested frame
            var realEndFrame = (multiplier > 1) ?
                    AppConfig.endFrame - ((multiplier - 1) * AppConfig.totalFrames) :
                    AppConfig.endFrame;

            var currentFromEnd = AppConfig.totalFrames - realEndFrame;

            // Jump past end if it's faster
            var newEndFrame = 0;
            if(n - realEndFrame > 0) {
                // Faster to move the difference ahead?
                if(n - realEndFrame < realEndFrame + (AppConfig.totalFrames - n)) {
                    newEndFrame = AppConfig.endFrame + (n - realEndFrame);
                } else {
                    newEndFrame = AppConfig.endFrame - (realEndFrame + (AppConfig.totalFrames - n));
                }
            } else {
                // Faster to move the distance back?
                if(realEndFrame - n < currentFromEnd + n) {
                    newEndFrame = AppConfig.endFrame - (realEndFrame - n);
                } else {
                    newEndFrame = AppConfig.endFrame + (currentFromEnd + n);
                }
            }

            // Now set the end frame
            if(realEndFrame !== n) {
                AppConfig.endFrame = newEndFrame;
                self.refresh();
            }
        }
    };


    /**
     * @method initEvents
     * @private
     * Function initilizes all the mouse and touch events for 360 slider movement.
     *
     */
    self.initEvents = function () {
        function multiEventListener(event) {
            if ((event.type === 'mousedown' && event.which === 1) || event.type === 'touchstart') {
                AppConfig.pointerStartPosX = self.getPointerEvent(event).pageX;
                AppConfig.pointerStartPosY = self.getPointerEvent(event).pageY;
                AppConfig.dragging = true;
                AppConfig.onDragStart(AppConfig.currentFrame);

            } else if (event.type === 'touchmove') {
                self.trackPointer(event);
            } else if (event.type === 'touchend') {
                AppConfig.dragging = false;
                AppConfig.onDragStop(AppConfig.endFrame);
                event.preventDefault();
            }
        }

        self.el.addEventListener('mousedown', multiEventListener);
        self.el.addEventListener('touchstart', multiEventListener);
        self.el.addEventListener('touchmove', multiEventListener);
        self.el.addEventListener('touchend', multiEventListener);
        self.el.addEventListener('click', multiEventListener);

        function mouseUp(event) {
            AppConfig.dragging = false;
            AppConfig.onDragStop(AppConfig.endFrame);
        }

        document.addEventListener('mouseup', mouseUp);

        window.addEventListener('resize', self.responsive.bind(self));

        function mouseMove(event) {
            if (AppConfig.dragging) {
                event.preventDefault();
            }
            self.trackPointer(event);
        }

        document.addEventListener('mousemove', mouseMove);
    };

    /**
     * @method getPointerEvent
     * @private
     * Function returns touch pointer events
     *
     * @params {Object} [event]
     */
    self.getPointerEvent = function (event) {
        return event.targetTouches ? event.targetTouches[0] : event;
    };

    self.pointerEventDirection = function(distanceX, distanceY) {
        return (Math.abs(distanceX) > Math.abs(distanceY)) ? 'horizontal' : 'vertical';
    };

    /**
     * @method trackPointer
     * @private
     * Function calculates the distance between the start pointer and end pointer/
     *
     * @params {Object} [event]
     */
    self.trackPointer = function (event) {
        if (AppConfig.ready && AppConfig.dragging) {
            AppConfig.pointerEndPosX = self.getPointerEvent(event).pageX;
            AppConfig.pointerEndPosY = self.getPointerEvent(event).pageY;

            if (AppConfig.monitorStartTime < new Date().getTime() - AppConfig.monitorInt) {
                AppConfig.pointerDistance = AppConfig.pointerEndPosX - AppConfig.pointerStartPosX;
                AppConfig.pointerDistanceY = AppConfig.pointerEndPosY - AppConfig.pointerStartPosY;

                if (self.pointerEventDirection(AppConfig.pointerDistance, AppConfig.pointerDistanceY) !== 'horizontal') {
                    return;
                }

                event.preventDefault();

                if(AppConfig.pointerDistance > 0){
                    AppConfig.endFrame = AppConfig.currentFrame + Math.ceil((AppConfig.totalFrames - 1) * AppConfig.speedMultiplier * (AppConfig.pointerDistance / self.el.offsetWidth));
                }else{
                    AppConfig.endFrame = AppConfig.currentFrame + Math.floor((AppConfig.totalFrames - 1) * AppConfig.speedMultiplier * (AppConfig.pointerDistance / self.el.offsetWidth));
                }

                if( AppConfig.disableWrap ) {
                    AppConfig.endFrame = Math.min(AppConfig.totalFrames - (AppConfig.zeroSelfd ? 1 : 0), AppConfig.endFrame);
                    AppConfig.endFrame = Math.max((AppConfig.zeroSelfd ? 0 : 1), AppConfig.endFrame);
                }
                self.refresh();
                AppConfig.monitorStartTime = new Date().getTime();
                AppConfig.pointerStartPosX = self.getPointerEvent(event).pageX;
            }
        }
    };

    /**
     * @method refresh
     * @public
     * Function refeshes the timer and set interval for render cycle.
     *
     */
    self.refresh = function () {
        if (AppConfig.ticker === 0) {
            AppConfig.ticker = setInterval(self.render, Math.round(1000 / AppConfig.framerate));
        }
    };

    self.triggerFrameChangeEvent = function(current, total) {
        var event = document.createEvent('Event');
        event.current = current;
        event.total = total;
        event.initEvent('frameIndexChanged');
        self.el.dispatchEvent(event);
    };

    /**
     * @method refresh
     * @private
     * Function render the animation frames on the screen with easing effect.
     */
    self.render = function () {
        var frameEasing;
        if (AppConfig.currentFrame !== AppConfig.endFrame) {
            frameEasing = AppConfig.endFrame < AppConfig.currentFrame ? Math.floor((AppConfig.endFrame - AppConfig.currentFrame) * 0.1) : Math.ceil((AppConfig.endFrame - AppConfig.currentFrame) * 0.1);
            self.hidePreviousFrame();
            AppConfig.currentFrame += frameEasing;
            self.showCurrentFrame();
            self.triggerFrameChangeEvent(self.getNormalizedCurrentFrame(), AppConfig.totalFrames);

        } else {
            window.clearInterval(AppConfig.ticker);
            AppConfig.ticker = 0;
        }
    };

    /**
     * @method hidePreviousFrame
     * @private
     * Function hide the previous frame in the animation loop.
     */
    self.hidePreviousFrame = function () {
        var frame = self.frames[self.getNormalizedCurrentFrame()];
        frame.classList.remove('current-image');
        frame.classList.add('previous-image');
    };

    /**
     * @method showCurrentFrame
     * @private
     * Function shows the current frame in the animation loop.
     */
    self.showCurrentFrame = function () {
        var frame = self.frames[self.getNormalizedCurrentFrame()];
        frame.classList.remove('previous-image');
        frame.classList.add('current-image');
    };

    /**
     * @method getNormalizedCurrentFrame
     * @private
     * Function normalize and calculate the current frame once the user release the mouse and release touch event.
     */
    self.getNormalizedCurrentFrame = function () {
        var c, e;

        if ( !AppConfig.disableWrap ) {
            c = Math.ceil(AppConfig.currentFrame % AppConfig.totalFrames);
            if (c < 0) {
                c += AppConfig.totalFrames - (AppConfig.zeroSelfd ? 1 : 0);
            }
        } else {
            c = Math.min(AppConfig.currentFrame, AppConfig.totalFrames - (AppConfig.zeroSelfd ? 1 : 0));
            e = Math.min(AppConfig.endFrame, AppConfig.totalFrames - (AppConfig.zeroSelfd ? 1 : 0));
            c = Math.max(c, (AppConfig.zeroSelfd ? 0 : 1));
            e = Math.max(e, (AppConfig.zeroSelfd ? 0 : 1));
            AppConfig.currentFrame = c;
            AppConfig.endFrame = e;
        }

        return c;
    };

    /*
     * @method getCurrentFrame
     * Function returns the current active frame.
     *
     * @return Number
     */
    self.getCurrentFrame = function() {
        return AppConfig.currentFrame;
    };

    /*
     * @method responsive
     * Function calculates and set responsive height and width
     *
     */
    self.responsive = function() {
        var currentImage,
            currentImageHeight;

        if(AppConfig.responsive) {
            currentImage = self.el.querySelector('.current-image');
            currentImageHeight = currentImage && currentImage.offsetHeight;

            self.el.style.height = currentImageHeight + 'px';
            self.el.style.width = '100%';
        }
    };

    /**
     * Function to return with zero padding.
     */
    self.zeroPad = function (num) {
        function pad(number, length) {
            var str = number.toString();
            if(AppConfig.zeroPadding) {
                while (str.length < length) {
                    str = '0' + str;
                }
            }
            return str;
        }

        var approximateLog = Math.log(AppConfig.totalFrames) / Math.LN10;
        var roundTo = 1e3;
        var roundedLog = Math.round(approximateLog * roundTo) / roundTo;
        var numChars = Math.floor(roundedLog) + 1;
        return pad(num, numChars);
    };

    self.browser = {};

    /**
     * Function to detect if the brower is IE
     * @return {boolean}
     *
     * http://msdn.microsoft.com/en-gb/library/ms537509(v=vs.85).aspx
     */
    self.browser.isIE = function () {
        var rv = -1;
        if (navigator.appName === 'Microsoft Internet Explorer')
        {
            var ua = navigator.userAgent;
            var re  = new RegExp('MSIE ([0-9]{1,}[\\.0-9]{0,})');
            if (re.exec(ua) !== null){
                rv = parseFloat( RegExp.$1 );
            }
        }

        return rv !== -1;
    };

    ThreeSixty.defaultOptions = {
        /**
         * @cfg {Boolean} dragging [dragging=false]
         * @private
         * Private propery contains a flags if users is in dragging mode.
         */
        dragging: false,
        /**
         * @cfg {Boolean} ready [ready=false]
         * @private
         * Private propery is set to true is all assets are loading and application is
         * ready to render 360 slider.
         */
        ready: false,
        /**
         * @cfg {Number} pointerStartPosX
         * @private
         * private property mouse pointer start x position when user starts dragging slider.
         */
        pointerStartPosX: 0,
        /**
         * @cfg {Number} pointerEndPosX
         * @private
         * private property mouse pointer start x position when user end dragging slider.
         */
        pointerEndPosX: 0,
        /**
         * @cfg {Number} pointerDistance
         * @private
         * private property contains the distance between the pointerStartPosX and pointerEndPosX
         */
        pointerDistance: 0,
        /**
         * @cfg {Number} monitorStartTime
         * @private
         * private property contains time user took in dragging mouse from pointerStartPosX and pointerEndPosX
         */
        monitorStartTime: 0,
        monitorInt: 10,
        /**
         * @cfg {Number} ticker
         * @private
         * Timer event that renders the 360
         */
        ticker: 0,
        /**
         * @cfg {Number} speedMultiplier
         * This property controls the sensitivity for the 360 slider
         */
        speedMultiplier: 7,
        /**
         * @cfg {Number} totalFrames
         * Set total number for frames used in the 360 rotation
         */
        totalFrames: 180,
        /**
         * @cfg {Number} currentFrame
         * Current frame of the slider.
         */
        currentFrame: 0,
        /**
         * @cfg {Array} endFrame
         * Private perperty contains information about the end frame when user slides the slider.
         */
        endFrame: 0,
        /**
         * @cfg {Number} loadedImages
         * Private property contains count of loaded images.
         */
        loadedImages: 0,
        /**
         * @cfg {Array} framerate
         * Set framerate for the slider animation
         */
        framerate: 60,
        /**
         * @cfg {String} domains
         * Set comma seprated list of all parallel domain from where 360 assets needs to be loaded.
         */
        domains: null,
        /**
         * @cfg {String} domain
         * Domain from where assets needs to be loaded. Use this propery is you want to load all assets from
         * single domain.
         */
        domain: '',
        /**
         * @cfg {Boolean} parallel
         * Set to true if you want to load assets from parallel domain. Default false
         */
        parallel: false,
        /**
         * @cfg {Number} queueAmount
         * Set number of calls to be made on parallel domains.
         */
        queueAmount: 8,
        /**
         * @cfg {Number} idle
         * Mouse Inactivite idle time in seconds. If set more than 0 will auto spine the slider
         */
        idle: 0,
        /**
         * @cfg {String} filePrefix
         * Prefix for the image file name before the numeric value.
         */
        filePrefix: '',
        /**
         * @cfg {String} ext [ext=.png]
         * Slider image extension.
         */
        ext: 'png',
        /**
         * @cfg {Object} height [300]
         * Height of the slider
         */
        height: 300,
        /**
         * @cfg {Number} width [300]
         * Width of the slider
         */
        width: 300,
        /**
         * @cfg {Object} styles
         * CSS Styles for the 360 slider
         */
        styles: {},
        /**
         * @cfg {Boolean} navigation[false]
         * State if navigation controls are visible or not.
         */
        navigation: false,
        /**
         * @cfg {Boolean} autoplay[false]
         * Autoplay the 360 animation
         */
        autoplay: false,
        /**
         * @cfg {number} autoplayDirection [1]
         * Direction for autoplay the 360 animation. 1 for right spin, and -1 for left spin.
         */
        autoplayDirection: 1,
        /**
         * Property to disable auto spin
         * @type {Boolean}
         */
        disableSpin: false,
        /**
         * Property to disable infinite wrap
         * @type {Boolean}
         */
        disableWrap: false,
        /**
         * Responsive width
         * @type {Boolean}
         */
        responsive: false,
        /**
         * Zero Padding for filenames
         * @type {Boolean}
         */
        zeroPadding: false,
        /**
         * Zero selfd for image filenames starting at 0
         * @type {Boolean}
         */
        zeroSelfd: false,
        /**
         * @type {Array}
         * List of plugins
         */
        plugins: [],
        /**
         * @type {Boolean}
         * Show hand cursor on drag
         */
        showCursor: false,
        /**
         * @cfg {Boolean} drag
         * Set it to false if you want to disable mousedrag or touch events
         */
        drag: true,
        /**
         * @cfg {Function} onReady
         * Callback triggers once all images are loaded and ready to render on the screen
         */
        onReady: function() {},
        /**
         * @cfg {Function} onDragStart
         * Callback triggers when a user initiates dragging
         */
        onDragStart: function() {},
        /**
         * @cfg {Function} onDragStop
         * Callback triggers when a user releases after dragging
         */
        onDragStop: function() {},
        /**
         * @cfg {String} imgList
         * Set ul element where image will be loaded
         */
        imgList: '.threesixty_images',
        /**
         * @cfg {Array} imgArray
         * Use set of images in array to load images
         */
        imgArray: null,
        /**
         * @cfg {Number} playSpeed
         * Value to control the speed of play button rotation
         */
        playSpeed: 100
    };
    self.init();
};

module.exports = ThreeSixty;
