import * as $ from 'jquery';
import 'slick-carousel';
import {
    initPlaceholders,
    initMaskedInput,
    validateForm,
    validateField,
    getMoneyInputValue,
    getMaskedInputValue
} from './components/form';


$(function () {
    toggleMainMenu();
    oneItemSlider();
    playAboutVideo();
    visibleAroundSlider();

    // кастомные плейсхолдеры
    initPlaceholders();
    // маски ввода
    initMaskedInput();

    initFeedbackForm($('#feedback_form'));
});

function toggleMainMenu() {
    $('#menu-burger').click(function () {
        $('html').toggleClass('main-menu-open');
    });
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
      slidesToShow: 2,
      slidesToScroll: 1,
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
        e.preventDefault();

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
    });

}

function initFeedbackForm($form) {
   if (!$form) return;

   const formAction = $form.attr('action');

   // отслеживаем изменения в полях формы
   $form.on('change', '.validate', function () {
      validateField($(this));
   });

   $form.on('submit', function () {
      if (validateForm($form)) {
         send();
      }

      return false;
   });

   function send() {
      const data = $form.serialize();

      $.ajax({
         url: formAction,
         type: 'POST',
         dataType: 'json',
         data: data,
         success: function (res) {
            // success handler
            success();
         },
         error: function (res) {
            // error handler
            // пока api нет можно сюда запихнуть success для тестов
            // потом убрать обязательно!
            setTimeout(success, 1000);
         },
         timeout: 30000
      });
   }

   // успешная отправка формы
   function success() {
      console.log('success');
   }
}
