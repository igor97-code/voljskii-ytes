import * as $ from 'jquery';
import 'slick-carousel';

$(function () {
   toggleMainMenu();
   oneItemSlider();
   playAboutVideo();
   visibleAroundSlider()
});

function toggleMainMenu() {
   $('#menu-burger').click(function () {
      $('html').toggleClass('main-menu-open')
   })
}

function oneItemSlider() {
   $('.initialize-slider').slick({
      infinite: true,
      slidesToShow: 1,
      slidesToScroll: 1,
      vertical: false,
      arrows: false,
      dots: true,
      customPaging: function (slider, i) {
         return '<a>' + '</a>';
      }
   });
}
function visibleAroundSlider() {
   $('.quest-slider').slick({
      infinite: true,
      slidesToShow: 3,
      slidesToScroll: 1,
      vertical: false,
      arrows: false,
      dots: true,
      centerMode: true,
      customPaging: function (slider, i) {
         return '<a>' + '</a>';
      }
   });
}

function playAboutVideo() {
   $('#about__video-play').click(function (e) {
      e.preventDefault()

      let elem = document.getElementById('about__video');
      if (elem.requestFullscreen) {
         elem.requestFullscreen();
      } else if (elem.mozRequestFullScreen) { /* Firefox */
         elem.mozRequestFullScreen();
      } else if (elem.webkitRequestFullscreen) { /* Chrome, Safari & Opera */
         elem.webkitRequestFullscreen();
      } else if (elem.msRequestFullscreen) { /* IE/Edge */
         elem.msRequestFullscreen();
      }
   })

}
