var currentSlide
var slides = Array.prototype.slice.call(document.querySelectorAll('.slide'))

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

function showSlide(slide) {
    var hash = '#' + slide.id
    if (hash !== location.hash) {
        history.pushState(slide.id, slide.id, hash)
    }

    slides.forEach((slide) => {
        slide.setAttribute('aria-selected', 'false')
    })

    slide.setAttribute('aria-selected', 'true')
    repositionSlide(slide)
    currentSlide = slide
}

window.onresize = function () {
    repositionSlide(currentSlide)
}

function route () {
    var slide = location.hash && document.querySelector(location.hash)
    showSlide(slide || slides[0])
}

window.onpopstate = function(event) {
    route()
};

route()

document.addEventListener('keydown', function (e) {
    if (e.keyCode === 32) { // Space
        var index = slides.indexOf(currentSlide)

        if (e.shiftKey) {
            showSlide(slides[Math.max(index - 1, 0)])
        } else {
            showSlide(slides[Math.min(index + 1, slides.length - 1)])
        }
    }
})
