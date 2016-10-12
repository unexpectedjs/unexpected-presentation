function toArray (items) {
    return Array.prototype.slice.call(items)
}

var slides = toArray(document.querySelectorAll('.slide'))

var sections = toArray(document.querySelectorAll('.section'))

var presentation = {
    lastPosition: { section: -1, slide: -1 },

    position: {
        section: 0,
        slide: 0
    },

    sections: sections.map(function (section) {
        return toArray(section.querySelectorAll('.slide'))
    }),

    updatePosition: function (section, slide) {
        if (0 <= section && section < this.sections.length) {
            this.lastPosition = {
                section: this.position.section,
                slide: this.position.slide
            }

            this.position.section = section
            if (0 <= slide && slide < this.sections[section].length) {
                this.position.slide = slide
            }
        }
    },

    getCurrentSection: function () {
        return this.sections[this.position.section]
    },

    getSlideAtPosition: function (position) {
        var section = this.sections[position.section]
        var slide = section && section[position.slide]
        return slide || null
    },

    getLastSlide: function () {
        return this.getSlideAtPosition(this.lastPosition)
    },

    getCurrentSlide: function () {
        return this.getSlideAtPosition(this.position)
    },

    isFirstSection: function () {
        return this.position.section === 0
    },

    isLastSection: function () {
        return this.position.section === this.sections.length - 1
    },

    nextSection: function () {
        this.updatePosition(
            this.position.section + 1,
            0
        )
    },

    prevSection: function () {
        var section = this.getCurrentSection()
        this.updatePosition(
            this.position.section - 1,
            section.length - 1
        )
    },

    nextSlide: function () {
        var section = this.getCurrentSection()
        if (this.position.slide < section.length - 1) {
            this.updatePosition(
                this.position.section,
                this.position.slide + 1
            )
        } else {
            this.nextSection()
        }
    },

    prevSlide: function () {
        if (this.position.slide > 0) {
            this.updatePosition(
                this.position.section,
                this.position.slide - 1
            )
        } else {
            this.prevSection()
        }
    },

    leftSlide: function () {
        this.updatePosition(
            this.position.section - 1,
            0
        )
    },

    rightSlide: function () {
        this.nextSection()
    },

    upSlide: function () {
        this.updatePosition(
            this.position.section,
            this.position.slide - 1
        )
    },

    downSlide: function () {
        this.updatePosition(
            this.position.section,
            this.position.slide + 1
        )
    },

    restart: function () {
        this.updatePosition(
            0,
            0
        )
    },

    showLastSlide: function () {
        var section = this.getCurrentSection()
        this.updatePosition(
            this.sections.length - 1,
            section.length - 1
        )
    },

    getDirection: function (last, next) {
        if (last.section < next.section) {
            return 'left'
        } else if (last.section > next.section) {
            return 'right'
        } else if (last.slide < next.slide) {
            return 'up'
        } else if (last.slide > next.slide) {
            return 'down'
        } else {
            return 'none'
        }
    },

    render: function () {
        if (
            this.lastPosition.section !== this.position.section ||
            this.lastPosition.slide !== this.position.slide
        ) {
            console.log(this.lastPosition, this.position);
            var slide = this.getCurrentSlide()
            var lastSlide = this.getLastSlide()

            var hash = '#' + slide.id
            if (hash !== location.hash) {
                history.pushState(slide.id, slide.id, hash)
            }


            if (lastSlide) {
                var direction = this.getDirection(this.lastPosition, this.position)
                document.body.className = 'transition-' + direction

                lastSlide.classList.add('slide-out')
                setTimeout(function () {
                    lastSlide.classList.remove('slide-out')
                }, 400);
                lastSlide.setAttribute('aria-selected', 'false')
            }

            slide.setAttribute('aria-selected', 'true')
            repositionSlide(slide)
        }
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

function onHome() {
    presentation.restart()
}

function onEnd() {
    presentation.showLastSlide()
}

var keyHandlers = {
    32: onSpace,
    35: onEnd,
    36: onHome,
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
