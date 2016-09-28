var ThreeSixty = require('./threesixty');

(function($) {
    $.fn.ThreeSixty = function(options) {
        return this.each(function() {
            new ThreeSixty(this, options);
        });
    };
})(jQuery);
