
function onLoad() {
    var slide = location.hash && document.querySelector(location.hash)

    if (!slide) {
        return location.replace('#slide-0-0')
    }

    var slides = document.querySelectorAll('.slide')

    for (var i = 0; i < slides.length; i += 1) {
        slides[i].setAttribute('aria-selected', 'false')
        var slideHeight = slides[i].height
        var slideWidth = slides[i].width
        if (slideHeight > slideWidth && slideHeight > window.innerHeight) {
        } else if (slideHeight <= slideWidth && slideWidth > window.innerWidth) {
            // scale to 
        }
    }

    slide.setAttribute('aria-selected', 'true')
}

onLoad()
