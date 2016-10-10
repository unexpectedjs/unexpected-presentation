function toArray (items) {
    return Array.prototype.slice.call(items)
}

var slides = toArray(document.querySelectorAll('.slide'))
var sections = toArray(document.querySelectorAll('.section'))

var presentation = {
    currentSection: 0,
    sections: sections.map(function (section) {
        var sectionSlides = toArray(section.querySelectorAll('.slide'))
        return {
            currentSlide: 0,
            slides: sectionSlides
        }
    }),

    getCurrentSection: function () {
        return this.sections[this.currentSection]
    },

    getCurrentSlide: function () {
        var section = this.getCurrentSection()
        var slide = section.slides[section.currentSlide]
        return slide
    },

    isFirstSection: function () {
        return this.currentSection === 0
    },

    isLastSection: function () {
        return this.currentSection === this.sections.length - 1
    },

    nextSection: function () {
        if (!this.isLastSection()) {
            this.currentSection++
            this.getCurrentSection().currentSlide = 0
        }
    },

    prevSection: function () {
        if (!this.isFirstSection()) {
            this.currentSection--
            var section = this.getCurrentSection()
            section.currentSlide = section.slides.length - 1
        }
    },

    nextSlide: function () {
        var section = this.getCurrentSection()
        if (section.currentSlide < section.slides.length - 1) {
            section.currentSlide++
        } else {
            this.nextSection()
        }
    },

    prevSlide: function () {
        var section = this.getCurrentSection()
        if (section.currentSlide > 0) {
            section.currentSlide--
        } else {
            this.prevSection()
        }
    },

    leftSlide: function () {
        if (!this.isFirstSection()) {
            this.currentSection--
        }
    },

    rightSlide: function () {
        if (!this.isLastSection()) {
            this.currentSection++
        }
    },

    upSlide: function () {
        var section = this.getCurrentSection()
        var nextSlide = Math.max(section.currentSlide - 1, 0)
        section.currentSlide = nextSlide
    },

    downSlide: function () {
        var section = this.getCurrentSection()
        var nextSlide = Math.min(section.currentSlide + 1, section.slides.length - 1)
        section.currentSlide = nextSlide
    },

    render: function () {
        var slide = this.getCurrentSlide()

        var hash = '#' + slide.id
        if (hash !== location.hash) {
            history.pushState(slide.id, slide.id, hash)
        }

        slides.forEach((slide) => {
            slide.setAttribute('aria-selected', 'false')
        })

        slide.setAttribute('aria-selected', 'true')
        repositionSlide(slide)
    }
}

function repositionSlide(slide) {
    var slideHeight = slide.clientHeight
    var slideWidth = slide.clientWidth
    var scale = 1
    if (slideHeight > window.innerHeight && slideWidth > window.innerWidth) {
        scale = Math.min(
            window.innerWidth / slideWidth,
            window.innerHeight / slideHeight
        )
    } else if (slideHeight > window.innerHeight) {
        scale = window.innerHeight / slideHeight
    } else if (slideWidth > window.innerWidth) {
        scale = window.innerWidth / slideWidth
    }

    slide.style.top = (window.innerHeight - slideHeight) / 2 + 'px'
    slide.style.left = (window.innerWidth - slideWidth) / 2 + 'px'

    if (scale === 1) {
        slide.style.transform = ''
    } else {
        slide.style.transform = 'scale(' + scale + ')'
    }
}

window.onresize = function () {
    presentation.render()
}

window.onpopstate = function(event) {
    presentation.render()
};

presentation.render()

function onSpace (e) {
    if (e.shiftKey) {
        presentation.prevSlide()
    } else {
        presentation.nextSlide()
    }
}

function onArrowLeft () {
    presentation.leftSlide()
}

function onArrowUp () {
    presentation.upSlide()
}

function onArrowRight () {
    presentation.rightSlide()
}

function onArrowDown () {
    presentation.downSlide()
}

var keyHandlers = {
    32: onSpace,
    37: onArrowLeft,
    38: onArrowUp,
    39: onArrowRight,
    40: onArrowDown
}

document.addEventListener('keydown', function (e) {
    var handler = keyHandlers[e.keyCode]
    if (handler) {
        handler(e)
        presentation.render()
    }
})
