import * as $ from 'jquery';
import 'slick-carousel';

$(function () {
   initApp();
   toggleMainMenu();
   oneItemSlider();
});

function initApp() {
   console.log('initApp');
}

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
      customPaging : function(slider, i) {
         return '<a>' + '</a>';
      }
   });
}
