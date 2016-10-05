var currentSlide

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
    var slides = document.querySelectorAll('.slide')

    for (var i = 0; i < slides.length; i += 1) {
        slides[i].setAttribute('aria-selected', 'false')
    }

    slide.setAttribute('aria-selected', 'true')
    repositionSlide(slide)
    currentSlide = slide
}

function onLoad() {
    var slide = location.hash && document.querySelector(location.hash)

    if (!slide) {
        return location.replace('#slide-0-0')
    }

    showSlide(slide)
}

onLoad()
window.onresize = function () {
    repositionSlide(currentSlide)
}

document.addEventListener('keydown', function (e) {
    if (e.keyCode === 32) { // Space
        if (e.shiftKey) {
            // previous
            var previousSlide = currentSlide.previousElementSibling
            if (!previousSlide) {
                var previousSection = currentSlide.parentElement.previousElementSibling
                if (previousSection) {
                    previousSlide = previousSection.lastElementChild
                }
            }

            if (previousSlide) {
                showSlide(previousSlide)
            }
        } else {
            // next
            var nextSlide = currentSlide.nextElementSibling
            if (!nextSlide) {
                var nextSection = currentSlide.parentElement.nextElementSibling
                if (nextSection) {
                    nextSlide = nextSection.firstElementChild
                }
            }

            if (nextSlide) {
                showSlide(nextSlide)
            }
        }
    }

})
