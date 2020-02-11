import * as $ from 'jquery';
import Inputmask from 'inputmask';
// import './form.css';

const regEmail = /^([a-z0-9_-]+\.)*[a-z0-9_-]+@[a-z0-9_-]+(\.[a-z0-9_-]+)*\.[a-z]{2,}$/i;
const regName = /^[a-zA-Z\s]+$/i;
const regNameRus = /^[А-Яа-яЁё\-'\s]+$/i;
const regPass = /^[a-zA-Z0-9]+$/i;
const regDate = /(\d{2}\.\d{2}\.\d{4})/;
const regNum = /^\d+$/;

// на вход объект с формой и type - all_fields если нужно проверять все поля, в том числе скрытые!
function validateForm($form, type) {
    let error = 0;

    let $fields;
    if (type === 'all_fields') {
        $fields = $form.find('input, select, textarea, .radio-input, .checkbox-input');

    } else {
        $fields = $form.find('input, select, textarea, .radio-input, .checkbox-input').filter(':visible');
    }

    $fields.each(function () {
        if (!validateField($(this))) {
            error++;
        }
    });

    if (error > 0) {
        return false;

    } else {
        return true;
    }
}

//функция проверки корректности заполненения полей
//на вход тип проверки, значение, placeholder
function validateField($field) {
    if (!$field.hasClass('validate')) return true;
    if ($field.hasClass('validate-disabled')) return true;

    let error = 0;
    let message = '';

    let val = $.trim($field.val());
    const plh = $field.attr('data-placeholder');
    const type = $field.attr('data-validate');
    const errorMessage = $field.attr('data-error_message');

    const mobilePhoneInvalidFirstSymbols = ['0', '1', '2', '7'];

    let firstSymbol = val[0] || '';


    switch (type) {

        //обязательно для заполнения
        case 'required':
            if (!val) {
                error++;
                message = 'Поле обязательно для заполнения';
            }
            break;

        //радио кнопки - обязательно для выбора
        case 'required_checkbox_radio':
            if (!+$field.find('input:checked').length) {
                error++;
                message = errorMessage || 'Выберите хотя бы 1 вариант';
            }
            break;


        // число
        case 'number':
            if (val === undefined || val.search(regNum) === -1) {
                error++;
                message = $field.attr('data-messge') || 'Только цифры';
            }
            break;

        // число
        case 'number_empty':
            if (val) {
                if (val.search(regNum) === -1) {
                    error++;
                    message = $field.attr('data-messge') || 'Только цифры';
                }
            }
            break;

        //номер телефона
        case 'mobile_phone':
            val = getMaskedInputValue($field);
            firstSymbol = val[0];

            if (!val || val.search(regNum) === -1 || val.length !== 10 || mobilePhoneInvalidFirstSymbols.includes(firstSymbol)) {
                error++;
                message = 'Укажите корректный номер телефона';
            }
            break;

        //номер телефона необязательное
        case 'mobile_phone_empty':
            val = getMaskedInputValue($field);
            firstSymbol = val[0];

            if (val) {
                if (val.search(regNum) == -1 || val.length != 10 || mobilePhoneInvalidFirstSymbols.includes(+firstSymbol)) {
                    error++;
                    message = 'Укажите корректный номер телефона';
                }
            }

            break;

        case 'date':
            if (!val || val.search(regDate) == -1) {
                error++;
                message = 'Дата в формате дд.мм.гггг';
            }
            break;

        //email
        case 'email':
            val = val.toLowerCase();
            if (!val || val.search(regEmail) === -1 || val.length > 50 || val == 'mig@mig.mig' || val == 'email@adress.ru') {
                error++;
                message = 'Укажите корректный адрес электронной почты';
            }
            break;

        /*русские символы + спец.символы для фио*/
        case 'rusfield':
            if (!val || val.search(regNameRus) === -1 || val.length > 50 || val.length < 2) {
                error++;
                message = 'Только русские буквы, до 50 символов';
            }
            break;

        /*русские символы + спец.символы для фио НЕ обязательное*/
        case 'rusfield_empty':
            if (val) {
                if (val.search(regNameRus) === -1 || val.length > 50 || val.length < 2) {
                    error++;
                    message = 'Только русские буквы, до 50 символов';
                }
            }

            break;


        //денежный формат
        case 'money':
            val = getMoneyInputValue($field);
            if (!val || val.search(regNum) === -1) {
                error++;
                message = 'Только цифры';
            }
            break;
    }

    // еслии задано кастомное сообщение об ошибке - выводим его
    if (errorMessage) message = errorMessage;

    //если поле заполнено не корректно
    //возвращаем
    if (error > 0) {
        if ($field.hasClass('radio-input') || $field.hasClass('checkbox-input')) {
            $field.find('.error-message').html(message);
            $field.removeClass('success').addClass('error');

        } else {
            $field.parents('.field').find('.error-message').html(message);
            $field.parents('.field').removeClass('success').addClass('error');
        }

        return false;

    } else {
        if ($field.hasClass('radio-input') || $field.hasClass('checkbox-input')) {
            $field.removeClass('error').addClass('success');
            $field.find('.error-message').text('');

        } else {
            $field.parents('.field').removeClass('error').addClass('success');
            $field.parents('.field').find('.error-message').text('');
        }

        return true;
    }
}

/**
 * Плейсхолдеры кастомный
 */
function initPlaceholders() {
    $('.placeholder').each(function () {
        if ($(this).hasClass('ready')) return;

        const $this = $(this);

        const $field = $this.parents('.field');
        const plh = $this.data('placeholder');
        const val = $.trim($this.val());
        if ((val === '' || val == plh) && plh != '' && plh != undefined) {
            $field.addClass('empty');

        } else {
            $field.removeClass('empty');
        }

        $field.prepend('<span class="label">' + plh + '</span>');

        $(this).addClass('ready');

        $(this)
            .on('focus', function () {
                const $this = $(this);
                const $field = $this.parents('.field');
                const plh = $this.attr('data-placeholder');
                const val = $.trim($this.val());

                if ($this.prop('readonly')) return false;

                if (val === '' || val === plh) {
                    $field.removeClass('empty');
                }
            })
            .on('blur', function () {
                const $this = $(this);
                const $field = $this.parents('.field');
                const plh = $this.attr('data-placeholder');
                const val = $.trim($this.val());

                if (val === '' || val === plh) {
                    $field.removeClass('error success').addClass('empty');

                } else {
                    $field.removeClass('empty');
                }
            });
    });

    $('.placeholder-select').each(function () {
        if ($(this).hasClass('ready')) return;

        const $this = $(this);
        const $field = $this.parents('.field');
        const plh = $this.attr('data-placeholder');
        const val = $.trim($this.val());


        if ((val === '' || val === plh) && plh !== '' && plh !== undefined) {
            $field.addClass('empty');

        } else {
            $field.removeClass('empty');
        }

        $field.find('.selectwrap').prepend('<span class="label">' + plh + '</span>');

        $this.addClass('ready');

        $this
            .on('focus', function () {
                const $this = $(this);
                const $field = $this.parents('.field');
                const plh = $this.attr('data-placeholder');
                const val = $.trim($this.val());

                if ($this.prop('readonly')) return false;

                if (val == '' || val == plh) {
                    $field.removeClass('empty');
                }
            })
            .on('blur', function () {
                const $this = $(this);
                setTimeout(function () {
                    const $field = $this.parents('.field');
                    const val = $this.val();
                    const plh = $this.attr('data-placeholder');

                    if (!val || val === plh) {
                        $field.removeClass('error success').addClass('empty');

                    } else {
                        $field.removeClass('empty');
                    }
                }, 150);
            });
    });
}

/**
 * Инициализация инпатов с маской ввода
 * Маска может инициализироваться для инпата двумя вариантами
 * 1. Из базовых шаблонов - data-mask_tpl="phone"
 * 2. Кастомная маска - data-mask="99.99.9999 99:99"
 * Если присутствуют оба атрибута - приоритет у шаблона
 */
function initMaskedInput() {
    $('.input-mask').each(function () {
        const $field = $(this);
        if ($field.hasClass('mask-ready')) return;

        const maskTpl = $field.attr('data-mask_tpl');
        let mask = $field.attr('data-mask');

        let autoUnmask = true;

        if (!maskTpl && !mask) return;

        switch (maskTpl) {
            case 'phone_plus7':
                mask = '+7 (999) 999 9999';
                break;

            case 'phone':
                mask = '(999) 999 9999';
                break;

            case 'date':
                mask = '99.99.9999';
                autoUnmask = false;
                break;

            case 'passport_code':
                mask = '999-999';
                autoUnmask = false;
                break;

            case 'passport_serial_number':
                mask = '9999 999999';
                autoUnmask = false;
                break;
        }

        Inputmask({
            mask: mask,
            placeholder: '_',
            showMaskOnHover: false,
            showMaskOnFocus: true,
            autoUnmask: autoUnmask
        }).mask($field);

        $field.addClass('mask-ready');
    });
}


/**
 * Получение значения с инпата в денежном формате
 * @param {HTMLElement} $input - сам инпат
 * @result {Number} value input
 */
function getMoneyInputValue($input) {
    return +$input.val() || 0;
}
/**
 * Получение значения с инпата с маской ввода
 * @param {HTMLElement} $input - сам инпат
 * @result {Number} value input
 */
function getMaskedInputValue($input) {
    return $input.val() || '';
}


export {
    initMaskedInput,
    initPlaceholders,
    getMoneyInputValue,
    getMaskedInputValue,
    validateForm,
    validateField
};