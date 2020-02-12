import * as $ from 'jquery';
import * as moment from 'moment';

// Язык виджета
const LANGUAGE = 'ru';

// Справочник переводов
const TRANSLATE = {
    'ru': {
        'rooms_text_array': ['номер', 'номера', 'номеров'],
        'adults_text_array': ['взрослый', 'взрослых', 'взрослых'],
        'childs_text_array': ['ребенок', 'детей', 'детей'],
        'month_names': ['Январь', 'Февраль', 'Март', 'Апрель', 'Май', 'Июнь', 'Июль', 'Август', 'Сентябрь', 'Октябрь', 'Ноябрь', 'Декабрь'],
        'month_names_2': ['Января', 'Февраля', 'Марта', 'Апреля', 'Мая', 'Июня', 'Июля', 'Августа', 'Сентября', 'Октября', 'Ноября', 'Декабря'],
        'month_names_short': ['янв', 'фев', 'мар', 'апр', 'мая', 'июн', 'июл', 'авг', 'сен', 'окт', 'ноя', 'дек'],
        'weekday_names': ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
        'weekday_names_long': ['Воскресенье', 'Понедельник', 'Вторник', 'Среда', 'Четверг', 'Пятница', 'Суббота'],
        'not_free_rooms': 'Нет свободных номеров',
        'nights_text_array': ['ночь', 'ночи', 'ночей']
    },
    'en': {
        'rooms_text_array': ['room', 'rooms', 'rooms'],
        'adults_text_array': ['adult', 'adults', 'adults'],
        'childs_text_array': ['child', 'childs', 'childs'],
        'month_names': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'month_names_2': ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'],
        'month_names_short': ['jan', 'feb', 'mar', 'apr', 'may', 'june', 'july', 'aug', 'sept', 'oct', 'nov', 'dec'],
        'weekday_names': ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'],
        'weekday_names_long': ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        'not_free_rooms': 'There are no available rooms',
        'nights_text_array': ['night', 'nights', 'nights']
    }
};

// справочники для календаря
const MONTH_NAMES = TRANSLATE[LANGUAGE]['month_names'];
const MONTH_NAMES_2 = TRANSLATE[LANGUAGE]['month_names_2'];
const MONTH_NAMES_SHORT = TRANSLATE[LANGUAGE]['month_names_short'];
const WEEKDAY_NAMES = TRANSLATE[LANGUAGE]['weekday_names'];
const WEEKDAY_NAMES_LONG = TRANSLATE[LANGUAGE]['weekday_names_long'];
const NIGHTS_TEXT_ARRAY = TRANSLATE[LANGUAGE]['nights_text_array'];

export default function bookingInit() {
    //инициализация скриптов календаря мобильной версии
    calendarInit();

    //инициализация скриптов выбора кол-ва номеров/гостей мобильной версии
    initSelectRoomsGuests();

    // инициализация календаря desktop
    $('[data-reserv_rangepicker]').each(function () {
        reservpicker($(this));
    });

    // инициализация выбора количества гостей и номеров desktop
    $('[data-reserv_select_guests]').each(function () {
        initSelectGuests($(this));
    });
}


// выбор периода - на вход блок, для которого инициализируется календарь!
function reservpicker($field) {
    if (!$field) return false;

    // основные элементы поля для выбора периода
    // дата начала периода
    const $dateStart = $field.find('[data-date_start]'); // блок с данными для даты начала периода
    const $dateStartText = $dateStart.find('[data-date]'); // блок с текстовым выводом значения
    const $dateStartWeekday = $dateStart.find('[data-weekday]'); // блок для вывода дня недели
    const $dateStartInput = $dateStart.find('input'); // значение даты

    // дата завершения периода
    const $dateEnd = $field.find('[data-date_end]');
    const $dateEndText = $dateEnd.find('[data-date]');
    const $dateEndWeekday = $dateEnd.find('[data-weekday]');
    const $dateEndInput = $dateEnd.find('input');

    // основные элементы календаря - присваювиются при инициализации
    let $reservpicker; // основная обертка календаря
    let $calendar; // календарь
    let $monthSwitcherPrev; // кнопка предыдущий месяц
    let $monthSwitcherNext; // кнопка следующий месяц
    let $months; // обертка для вывода месяцев

    // глобальные настройки мин/макс даты при выборе периода
    // мин - текущая, макс - текущая плюс 1 год
    let now = new Date();
    let nowDay = now.getDate();
    let nowMonth = now.getMonth();
    let nowYear = now.getFullYear();

    let dateCurrent = new Date(nowYear, nowMonth, nowDay);

    // глубина бронирования в днях
    let depthOfBooking = 365;

    let calendarDateMin = new Date(nowYear, nowMonth, nowDay);
    let calendarDateMax = new Date(nowYear, nowMonth, nowDay + depthOfBooking);

    // значения выбранного периода
    // по умолчанию текущая и плюс 1 день
    let dateStart = formatDate(now);
    let dateEnd = formatDate(new Date(nowYear, nowMonth, nowDay + 1));

    // основные параметры календаря
    // влияют на выбор даты
    let dateType; // какую дату выбираем(старт/завершение периода)
    let dateSelectMin; // минимальная дата, доступная для выбора
    let dateSelectMax; // максимальная дата, доступная для выбора


    // параметр отображения календаря
    // для мобильной версии показываем 1 месяц, десктоп/планшет - 2 месяца
    let version = getVersion();

    $(window).on('resize', function () {
        const oldVersion = version;
        version = getVersion();

        // если изменилось разрешение и календарь открыт
        // для переинициализации открываем календарь заново
        if (version !== oldVersion && dateType) {
            openCalendar();
        }
    });

    init();

    // первичная инициализация календаря
    function init() {
        // добавляем в HTML обертку для календаря
        // формируем ID основного блока с календарем
        const id = 'reservpicker_' + randomInteger(0, 100000000);
        $('body').append('<div id="' + id + '" class="reservpicker"><div class="calendar"><a href="#" class="month-switcher prev disable"><i class="icon icon-left-arrow-1"></i></a><a href="#" class="month-switcher next"><i class="icon icon-right-arrow-1"></i></a><div class="months"></div></div><div class="triangle"></div></div>');

        // присваиваем основные HTML блоки созданного календаря
        $reservpicker = $('#' + id);
        $calendar = $reservpicker.find('.calendar'); // календарь
        $monthSwitcherPrev = $reservpicker.find('.month-switcher.prev'); // кнопка предыдущий месяц
        $monthSwitcherNext = $reservpicker.find('.month-switcher.next'); // кнопка следующий месяц
        $months = $reservpicker.find('.months'); // обертка для вывода месяцев

        // получаем первичные значения дат
        // если не заданы - ставим текущую и плюс 1 день
        if ($dateStartInput.val()) dateStart = $dateStartInput.val();
        if ($dateEndInput.val()) dateEnd = $dateEndInput.val();


        // обновляем значения выбранного периода
        refreshPeriodValue();

        // инициализируем основные обработчики события календаря
        initEventsCalendar();

        function randomInteger(min, max) {
            let rand = min - 0.5 + Math.random() * (max - min + 1)
            rand = Math.round(rand);
            return rand;
        }
    }

    // инициализиция обработчика событий календаря
    function initEventsCalendar() {
        // переход к выбору даты начала периода
        $dateStart.on('click', function () {
            dateType = 'start';
            openCalendar();
            return false;
        });

        // переход к выбору даты завершения периода
        $dateEnd.on('click', function () {
            dateType = 'end';
            openCalendar();
            return false;
        });

        // закрытие календаря
        $reservpicker.find('.pxl').on('click', function () {
            hideCalendar();
            return false;
        });

        // переключатели месяцев
        $monthSwitcherNext.on('click', function () {
            if ($(this).hasClass('disable')) return false;

            let dateText = $months.find('.day').first().attr('data-date');
            let _d = createDate(dateText);
            createMonthsHTML(new Date(_d.getFullYear(), _d.getMonth() + 1, 1));

            return false;
        });
        $monthSwitcherPrev.on('click', function () {
            if ($(this).hasClass('disable')) return false;

            let dateText = $months.find('.day').first().attr('data-date');
            let _d = createDate(dateText);
            createMonthsHTML(new Date(_d.getFullYear(), _d.getMonth() - 1, 1));

            return false;
        });

        // выбор даты
        $months.on('click', '.day', function () {
            if ($(this).hasClass('disable')) return false;

            // данные о дате, по которой клик
            let date = $(this).attr('data-date');
            let dateObj = createDate(date);

            if (dateType === 'start') {
                // не даем выбрать дату заезда, если в ней нет свободных номеров
                if ($(this).hasClass('empty')) return false;
                dateStart = date;

                // проверяем - если дата заезда > даты выезда
                // или дата выезда превышает лимит макс.выбранного количества ночей)
                // устанавливаем дату выезда = дата заезда + 1 день
                let dateEndObj = createDate(dateEnd);

                let dateMax = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 60);
                if (+dateObj >= +dateEndObj || dateMax < +dateEndObj) {
                    let newDateEnd = new Date(dateObj.getFullYear(), dateObj.getMonth(), dateObj.getDate() + 1);
                    dateEnd = formatDate(newDateEnd);
                }

                // переключаем календарь в режим выбора даты завершения периода
                dateType = 'end';

                // обновляем значение периода
                refreshPeriodValue();

                openCalendar();

            } else if (dateType === 'end') {
                if ($(this).hasClass('start')) return false;
                dateEnd = $(this).attr('data-date');

                refreshPeriodValue();

                hideCalendar();

                // открываем выбор гостей
                $field.parents('form').find('[data-button_popup]').trigger('click');
            }

            return false;
        });

        // подсветка выбираемого периода при наведении
        $months
            .on('mouseover', '.day:not(.selected.start, .disable)', function () {
                if (dateType === 'start') return false;

                // очищаем подсветку текущего периода
                $months.find('.day.selected:not(.start)').removeClass('selected end');

                // формируем новый период
                // от текущей даты начала до той на которую навели
                const hoverDate = +$(this).attr('data-date_unix');
                $months.find('.day:not(.disable)').each(function () {
                    const _d = +$(this).attr('data-date_unix');

                    if (_d <= hoverDate) {
                        $(this).addClass('hover');
                    }
                });
            })
            .on('mouseout', '.day', function () {
                $months.find('.day.hover').removeClass('hover last');
                refreshAvailableDays();
            });

        // disable закрытие календаря при клике на любое место в месяце!
        $months.on('click', function () {
            return false;
        });

        $('body').on('click', function (e) {
            hideCalendar();
        });

        $(window).on('scrollLeft resize', function () {
            setCalendarPosition();
        });
    }

    // открытие календаря
    function openCalendar() {
        // формируем HTML месяцев
        createMonthsHTML();

        // показываем календарь
        $reservpicker.show();

        // позиционируем календарь
        setCalendarPosition();

        // закрываем выбор колва гостей
        $('[data-reserv_select_guests]').removeClass('open');
    }

    // закрытие календаря
    function hideCalendar() {
        $reservpicker.hide();

        dateType = null;
    }

    // формирование HTML месяцев
    // на вход дата с которой формировать месяцы
    // для мобильной версии формируется HTML 1 месяца, декспотной - 2 месяца
    function createMonthsHTML(date) {
        // если даты на вход нет - подставляем дату начала или завершения
        if (!date) {
            // if (dateType === 'start') {
            //     date = createDate(dateStart);

            // } else {
            //     date = createDate(dateEnd);
            // }
            date = createDate($dateStartInput.val());
        }

        // HTML месяцев
        let monthsHTML = '';
        monthsHTML += createMonth(date);

        if (version === 'desktop') {
            // получаем следующий месяц
            let dateNext = new Date(date.getFullYear(), date.getMonth() + 1, 1);
            monthsHTML += createMonth(dateNext);
        }

        $months.html(monthsHTML);

        // обновляем доступность дней
        refreshAvailableDays();

        function createMonth(date) {
            // получаем месяц/год для которых формируем HTML
            let month = date.getMonth();
            let year = date.getFullYear();

            // получаем кол-во дней в месяце
            let _d = new Date(year, month + 1, 0);
            let lastDay = _d.getDate();

            // формируем HTML дней календаря
            let daysHTML = '';
            for (let day = 1; day <= lastDay; day++) {
                let dateDay = new Date(year, month, day);

                let dayClass = '';
                // день недели
                let weekday = dateDay.getDay();
                // отмечаем выходные
                if (weekday === 0 || weekday === 6) {
                    dayClass += ' weekend';
                }

                if (weekday === 1 || day === 1) {
                    daysHTML += '<div class="tr">';
                }

                daysHTML += '<div class="td d' + weekday + '"><div class="day ' + dayClass + '" data-date_unix="' + dateDay * 1 + '" data-date="' + formatDate(dateDay) + '">' + day + '</div></div>';

                // если воскресенье - закрываем неделю
                if (weekday === 0 || day === lastDay) {
                    daysHTML += '</div>';
                }
            }

            daysHTML = '<div class="days">' + daysHTML + '</div>';

            let monthHTML = '<div class="month"><p class="name">' + MONTH_NAMES[month] + ' ' + year + '</p><div' +
                         ' class="tr"><div class="td d1"><div class="weekday">' + WEEKDAY_NAMES[1] + '</div></div><div class="td d2"><div class="weekday">' + WEEKDAY_NAMES[2] + '</div></div><div class="td d3"><div class="weekday">' + WEEKDAY_NAMES[3] + '</div></div><div class="td d4"><div class="weekday">' + WEEKDAY_NAMES[4] + '</div></div><div class="td d5"><div class="weekday">' + WEEKDAY_NAMES[5] + '</div></div><div class="td d6"><div class="weekday">' + WEEKDAY_NAMES[6] + '</div></div><div class="td d0"><div class="weekday">' + WEEKDAY_NAMES[0] + '</div></div></div>' + daysHTML + '</div></div>';

            return monthHTML;
        }
    }

    // обновление доступных для выбора дней
    function refreshAvailableDays() {
        $months.find('.day').removeClass('disable selected start end empty').attr('title', '');

        // массив с днями, в которых нет свободных номеров
        let emptyDays = $field.attr('data-empty');
        if (emptyDays) {
            emptyDays = emptyDays.split(',');
        } else {
            emptyDays = [];
        }
        for (let i = 0; i < emptyDays.length; i++) {
            $months.find('.day[data-date="' + emptyDays[i] + '"]').addClass('empty').attr('title', TRANSLATE[LANGUAGE]['not_free_rooms']);
        }

        let holidays = $field.attr('data-holidays');
        if (holidays) {
            holidays = holidays.split(',');
        } else {
            holidays = [];
        }
        for (let i = 0; i < holidays.length; i++) {
            $months.find('.day[data-date="' + holidays[i] + '"]').addClass('holidays');
        }

        // мин/макс допустимая дата
        // зависят от типа выбираемой даты
        // дата заезда - от текущей до максимально возможной в календаре
        // дата выезда - от даты заезда до 30 дней от даты заезда
        let min;
        let max;

        if (dateType === 'start') {
            min = +calendarDateMin;
            max = +calendarDateMax;

        } else {
            const _dateMin = createDate($dateStartInput.val());
            const _dateMax = new Date(_dateMin.getFullYear(), +_dateMin.getMonth(), _dateMin.getDate() + 60);

            min = +_dateMin;
            max = +_dateMax;
        }

        // флаги для проверки возможности переключения месяцев
        let disablePrevMonth = false;
        let disableNextMonth = false;

        $months.find('.day').each(function () {
            let dayClass = '';

            let dateUnix = +$(this).attr('data-date_unix');

            // если в период попадают недоступные дни
            // ограничиваем выбираемый промежуток
            // если текущий день недоступен для выбора
            // и его дата попадает в мин/макс
            // обновляем максимальную для выбора дату
            if (
                $(this).hasClass('empty') &&
                dateUnix >= min && dateUnix <= max &&
                dateType === 'end'
            ) {
                max = +$(this).attr('data-date_unix')
            }

            // отмечаем невозможные для выбора дни
            if (dateUnix < min) {
                dayClass += ' disable';
                disablePrevMonth = true;
            }

            if (dateUnix > max) {
                dayClass += ' disable';
                disableNextMonth = true;
            }

            // отмечаем текущую дату
            if (dateUnix === +dateCurrent) {
                dayClass += ' current';
            }

            // отмечаем выбранные дни
            let _dateStart = createDate($dateStartInput.val());
            let _dateEnd = createDate($dateEndInput.val());
            if (+dateUnix >= +_dateStart && +dateUnix <= +_dateEnd) {
                dayClass += ' selected';

                if (dateUnix === +_dateStart) dayClass += ' start';
                if (dateUnix === +_dateEnd) dayClass += ' end';
            }

            $(this).addClass(dayClass);
        });

        disableNextMonth ? $monthSwitcherNext.addClass('disable') : $monthSwitcherNext.removeClass('disable');
        disablePrevMonth ? $monthSwitcherPrev.addClass('disable') : $monthSwitcherPrev.removeClass('disable');
    }

    // позиционирование календаря относительно полей ввода
    function setCalendarPosition() {
        if (!dateType) return false;

        // получаем параметры для позиционирования календаря
        let fieldOffset;
        let fieldWidth;
        let fieldHeight;

        if (dateType === 'start') {
            fieldOffset = $dateStart.offset();
            fieldHeight = +$dateStart.outerHeight();
            fieldWidth = +$dateStart.outerWidth();

        } else if (dateType === 'end') {
            fieldOffset = $dateEnd.offset();
            fieldHeight = +$dateEnd.outerHeight();
            fieldWidth = +$dateStart.outerWidth();
        }

        // формируем позицию календаря
        const left = +$dateStart.offset().left;
        const top = +fieldOffset.top + fieldHeight + 20;

        const leftTriangle = +fieldOffset.left + fieldWidth / 2 - left - 5;

        $reservpicker.css({
            'left': left + 'px',
            'top': top + 'px'
        });

        $reservpicker.find('.triangle').css('left', leftTriangle + 'px')
    }

    // обновление значений выбранного периода в HTML
    function refreshPeriodValue() {
        // обновляем значение даты начала периода
        let dateStartObj = createDate(dateStart);
        $dateStartInput.val(dateStart);
        $dateStartText.text(getDateText(dateStartObj));
        $dateStartWeekday.text(getWeekdayName(dateStartObj));

        // обновляем значение даты завершения периода
        let dateEndObj = createDate(dateEnd);
        $dateEndInput.val(dateEnd);
        $dateEndText.text(getDateText(dateEndObj));
        $dateEndWeekday.text(getWeekdayName(dateEndObj));


        // обновляем значение в мобильной версии
        // дата начала периода
        let $dateInDay = $('#calendar .day[data-date="' + dateStart + '"]');
        let dateStartText = $dateInDay.attr('data-datetext').split('|');
        let $dateInObj = $('#calendar_date_in, #date_in');

        //формируем html выбранной даты
        $dateInObj.attr('data-date', dateStart);
        $dateInObj.find('.day').text(dateStartText[0]);
        $dateInObj.find('.month').text(dateStartText[1]);
        $dateInObj.find('.weekday').text(dateStartText[2]);

        // дата завершения периода
        let $dateOutDay = $('#calendar .day[data-date="' + dateEnd + '"]');
        let dateEndText = $dateOutDay.attr('data-datetext').split('|');
        let $dateOutObj = $('#calendar_date_out, #date_out');

        //формируем html выбранной даты
        $dateOutObj.attr('data-date', dateEnd);
        $dateOutObj.find('.day').text(dateEndText[0]);
        $dateOutObj.find('.month').text(dateEndText[1]);
        $dateOutObj.find('.weekday').text(dateEndText[2]);


        // выделяем период в мобильном календаре
        $('#calendar').find('.day').removeClass('active start finish disable period');
        $dateInDay.addClass('active start');
        $dateOutDay.addClass('active finish');

        $('#calendar').find('.day').removeClass('disable');

        let start = +$('#calendar').find('.day.active.start').attr('rel');
        let finish = +$('#calendar').find('.day.active.finish').attr('rel') + 1;

        $('#calendar').find('.day:not(.null)').slice(start, finish).addClass('period');

        // обновляем кол-во ночей
        let countNight = +$('#calendar').find('.day.period').length - 1;
        if (countNight < 0) {
            countNight = 0;
        }
        $('#select_date, #calendar_date').find('.nights p').html('<span class="num">' + countNight + '</span> ' + declOfNum(countNight, NIGHTS_TEXT_ARRAY));
    }


}

// инициализация выбора количества гостей и номеров
function initSelectGuests($field) {
    const $fieldLabel = $field.find('[data-button_popup]'); //поле для открытие/закрытия popup
    const $valueText = $field.find('[data-value_text]'); // текстовое значение
    const $countRoomsInput = $field.find('[data-count_rooms]'); // скрытый инпат со значением колва номеров
    const $countAdultsInput = $field.find('[data-count_adults]'); // скрытый инпат со значением колва взрослых
    const $countChildsInput = $field.find('[data-count_childs]'); // скрытый инпат со значением колва детей
    const $countRooms = $field.find('[data-count_rooms_field]'); // сзначение кол-во номеров
    const $countAdults = $field.find('[data-count_adults_field]'); // значение кол-во взрослых
    const $countChilds = $field.find('[data-count_childs_field]'); // значение кол-во детей
    const $childsAge = $field.find('[data-childs_age]'); //блок с возрастом детей
    const $childsAgeSelects = $field.find('[data-childs_age_selects]'); //обертка для селектов возраста ребенка

    //добавление/удаление HTML селектов
    //html добавляемого селекта
    const selectHTML = '<div class="age"><select name="child_age[]" class="new"><option value="0">0</option><option' +
                   ' value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option></select></div>';

    // HTML добавляемого селекта в моб.версии
    const selectMobileHTML = '<div class="age"><label class="select-field"><select name="child_age[]"' +
                         ' class="select-child-age" data-icons="false"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option></select><span class="arrow"><i class="icon icon-down-arrow-2"></i></span></label></div>';

    $fieldLabel.on('click', function () {
        if ($field.hasClass('open')) {
            hidePopup();

        } else {
            showPopup();
        }

        return false;
    });

    $field.find('.item input').on('change', function () {
        const val = $(this).val();
        const maxVal = $(this).attr('data-max');
        const minVal = $(this).attr('data-min');
        const $object = $(this).parent();
        const type = $object.attr('data-type');

        if (val === '' || val.search(/^\d+$/) == -1) {
            $(this).val(minVal);

        } else {
            $object.find('.minus').removeClass('disable');
            $object.find('.plus').removeClass('disable');
            //если прибавляем
            if (val >= maxVal) {
                $object.find('.minus').removeClass('disable');
                $object.find('.plus').addClass('disable');

                if (val > maxVal) {
                    $(this).val(maxVal);
                }

            } else if (val <= minVal) {
                $object.find('.minus').addClass('disable');
                $object.find('.plus').removeClass('disable');

                if (val < minVal) {
                    $(this).val(minVal);
                }

            }
        }

        const countAdults = $countAdults.val();
        const countRooms = $countRooms.val();

        //изменение взрослых
        if (type == 'adults') {
            if (countAdults < countRooms) {
                $countRooms.val(countAdults).trigger('change');
            }
        }
        //изменение номеров
        if (type == 'rooms') {
            if (countRooms > countAdults) {
                $countAdults.val(countRooms).trigger('change');
            }
        }

        refreshValue();
    });

    //плюс/минус взрослые/дети
    $field.find('.action-button').on('click', function () {
        if (!$(this).hasClass('disable')) {
            const $object = $(this).parent();
            const $input = $object.find('input');
            const maxVal = $input.data('max');
            const minVal = $input.data('min');

            //если прибавляем
            if ($(this).hasClass('plus')) {

                $object.find('.minus').removeClass('disable');

                const newVal = $input.val() * 1 + 1;
                if (newVal == maxVal) {
                    $object.find('.plus').addClass('disable');
                }

            } else {
                $object.find('.plus').removeClass('disable');

                const newVal = $input.val() - 1;
                if (newVal == minVal) {
                    $object.find('.minus').addClass('disable');
                }
            }

            $input.val(newVal).trigger('change');

            refreshValue();
        }

        return false;
    });


    //при инициализации обновляем значение
    refreshValue();

    $field.find('.popup-fields').on('click', function () {
        return false;
    });

    // при изменении возраста - обновляем возраст в моб.версии
    $childsAgeSelects.on('change', 'select', function () {
        $childsAgeSelects.find('select').each(function (i) {
            $('#select_rooms_guest_count .childs-age-selects select').eq(i).val($(this).val());
        });
    });

    //поля для ввода только цифр
    $field.on('keydown', '.number', function (e) {
        // Разрешаем: backspace, delete, tab и escape
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            // Разрешаем: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Разрешаем: home, end, влево, вправо
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // Ничего не делаем
            return;

        } else {
            // Запрещаем все, кроме цифр на основной клавиатуре, а так же Num-клавиатуре
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        }
    });

    //показ
    function showPopup() {
        $field.addClass('open');
        //клик по любому элементу будет закрывать попап
        $('body, a, button').on('click', function (e) {
            if ($(e.target).closest('.select-guests-wrapper').length) {
                return;

            } else {
                hidePopup();
            }
        });

        // закрывам календари
        $('.reservpicker').hide();
    }
    //закрытие
    function hidePopup() {
        $field.removeClass('open');
        $(window).off('click');
    }

    //обновление значений и текста
    function refreshValue() {
        //получаем значения
        const countRooms = $countRooms.val();
        const countAdults = $countAdults.val();
        const countChilds = $countChilds.val();

        //формируем текст и добавляем подставленные значения в скрытые инпаты
        $countRoomsInput.val(countRooms);
        $countAdultsInput.val(countAdults);
        $countChildsInput.val(countChilds);

        let text = '';
        text += countRooms + ' ' + declOfNum(countRooms, TRANSLATE[LANGUAGE]['rooms_text_array']) + ', ';
        text += countAdults + ' ' + declOfNum(countAdults, TRANSLATE[LANGUAGE]['adults_text_array']) + ', ';
        text += countChilds + ' ' + declOfNum(countChilds, TRANSLATE[LANGUAGE]['childs_text_array']);
        $valueText.html(text);

        // добавляем подставленные значения в моб.версию
        const $countRoomsMob = $('#select_rooms_guest_count').find('input[data-type="rooms"]'); //кол-во номеров
        const $countAdultsMob = $('#select_rooms_guest_count').find('input[data-type="adults"]'); //кол-во взрослых
        const $countChildsMob = $('#select_rooms_guest_count').find('input[data-type="childs"]'); // кол-во детей

        $countRoomsMob.val(countRooms);
        $countAdultsMob.val(countAdults);
        $countChildsMob.val(countChilds);

        $countRoomsMob.trigger('change');
        $countAdultsMob.trigger('change');
        $countChildsMob.trigger('change');

        //для детей проверяем кол-во детей и кол-во селектов для возраста
        //если разное - добавляем/удаляем селекты
        const countSelects = $childsAgeSelects.find('.age').length * 1;

        //если колво селектов больше колва детей
        //удаляем лишние селекты
        if (countSelects > countChilds) {
            const diff = countSelects - countChilds;
            for (let i = 0; i < diff; i++) {
                removeSelect();
            }

        } else if (countSelects < countChilds) {
            const diff = countChilds - countSelects;
            for (var i = 0; i < diff; i++) {
                addSelect();
            }
        }
    }

    function addSelect() {
        //добавляем селект
        $childsAgeSelects.append(selectHTML);
        $childsAge.removeClass('hide');

        // обновляем блок в моб.версии
        $('#select_rooms_guest_count .childs-age-selects').append(selectMobileHTML);
        $('#select_rooms_guest_count .childs-age').removeClass('hide');
    }

    function removeSelect() {
        //удаляем селект
        $childsAgeSelects.find('.age').last().remove();
        // обновляем в моб.версии
        $('#select_rooms_guest_count .childs-age-selects').find('.age').last().remove();

        if (!$childsAgeSelects.find('.age').length) {
            $childsAge.addClass('hide');
            // обновляем в моб.версии
            $('#select_rooms_guest_count .childs-age').addClass('hide');
        }
    }
}

//datepicker mobile
function calendarInit() {
    // основные HTML объекты
    const $calendarWrapper = $('#calendar_wrapper');
    const $calendar = $('#calendar');
    const $selectDate = $('#select_date');

    // основные элементы поля для выбора периода
    const $field = $('body').find('[data-reserv_rangepicker]');

    // дата начала периодаtText = $dateStart.find('[data-date]'),
    const $dateStart = $field.find('[data-date_start]'); // блок с данными для даты начала периода
    const $dateStartText = $dateStart.find('[data-date]'); // блок с текстовым выводом значения
    const $dateStartWeekday = $dateStart.find('[data-weekday]'); // блок для вывода дня недели
    const $dateStartInput = $dateStart.find('input'); // значение даты

    // дата завершения периода
    const $dateEnd = $field.find('[data-date_end]');
    const $dateEndText = $dateEnd.find('[data-date]');
    const $dateEndWeekday = $dateEnd.find('[data-weekday]');
    const $dateEndInput = $dateEnd.find('input');

    // значения даты заезда/выезда
    let dateStart = $dateStartInput.val();
    let dateEnd = $dateEndInput.val();

    // текущая дата
    const now = moment();
    moment.locale('ru');

    let currentDay = now.format('D');
    let currentMonth = now.format('M');
    let currentYear = now.format('gggg');
    let countMonth = 12;
    let i = 0;
    let maxNight = 61;

    //закрытие календаря
    $calendarWrapper.find('.close').on('click', function () {
        hideCalendar();

        return false;
    });

    //показ календаря
    $selectDate.on('click', function () {
        showCalendar();

        return false;
    });

    $calendar.on('click', '.day', function () {
        if (!$(this).hasClass('null')) {
            const $dayActive = $calendar.find('.day.active');

            //если уже выбран период обнуляем его и выбираем дату заезда
            if ($dayActive.length == 2) {
                $calendar.find('.day').removeClass('active start finish disable period');
                $(this).addClass('active start');

                //получаем значения даты заезда и устанавливаем их
                const dateIn = $(this).attr('data-date');
                const dateTextIn = $(this).attr('data-datetext');
                setValue('in', dateIn, dateTextIn);

                //обнуляем значение даты выезда
                const dateOut = '';
                const dateTextOut = '||';
                setValue('out', dateOut, dateTextOut);

                //ограничиваем выбор кол-ва ночей
                disableDate();

            } else {

                if (!$(this).hasClass('active') && !$(this).hasClass('disable')) {

                    const $dayActive = $calendar.find('.day.active');

                    //если есть выбранный день, выбираем дату выезда
                    if ($dayActive.length == 1) {
                        const numCurrent = +$dayActive.attr('rel');
                        const numClick = +$(this).attr('rel');

                        if (numClick > numCurrent) {
                            $(this).addClass('active finish');

                            //выделяем выбранный период
                            addPeriod();
                            //$('#calendar_select .text').append(' - '+$(this).attr('data-datetext'));
                            const dateOut = $(this).attr('data-date');
                            const dateTextOut = $(this).attr('data-datetext');
                            setValue('out', dateOut, dateTextOut);

                            setTimeout(function () {
                                hideCalendar();
                            }, 300);

                        } else {
                            $calendar.find('.day').removeClass('active start disable');
                            $(this).addClass('active start');

                            const dateIn = $(this).attr('data-date');
                            const dateInText = $(this).attr('data-datetext');
                            setValue('in', dateIn, dateInText);

                            disableDate();
                        }

                    } else {
                        $(this).addClass('active start');

                        const dateIn = $(this).attr('data-date');
                        const dateInText = $(this).attr('data-datetext');
                        setValue('in', dateIn, dateInText);

                        disableDate();
                    }
                }
            }
        }


        return false;
    });

    //формирование HTML каледаря календаря
    function create(day, month, year) {
        let startDate = day;

        if (countMonth > 0) {
            let monthDays = moment(year + '-' + month, 'YYYY-M').daysInMonth();
            let monthHTML = '<p class="month">' + MONTH_NAMES[month - 1] + ' ' + year + '</p>';

            day = 1;
            while (day <= monthDays) {
                const weekday = moment(year + '-' + month + '-' + day, 'YYYY-M-D').format('E');

                if (day == 1 || weekday == 1) {
                    monthHTML += '<div class="week">';
                }

                let dayFull = day;
                if (day < 10) dayFull = '0' + day;

                let monthFull = month;
                if (month < 10) monthFull = '0' + month;

                const fullDate = dayFull + '.' + monthFull + '.' + year;

                // для справочника названий дней недели воскресенье идёт первым элементом!
                let weekdayKey = +weekday;
                if (weekdayKey === 7) weekdayKey = 0;
                const textDate = day + '|' + MONTH_NAMES_SHORT[month - 1] + '|' + WEEKDAY_NAMES[weekdayKey];

                //проверка для формирования прошедших дат текущего месяца
                let prevDateClass = '';
                if (startDate > 1 && month == currentMonth && day < startDate) {
                    prevDateClass = 'null';
                    i = -1;
                }

                monthHTML += '<div class="day d' + weekday + ' ' + prevDateClass + '" rel="' + i + '" data-datetext="' + textDate + '" data-date="' + fullDate + '"><span>' + day + '</span></div>';

                if (day == monthDays || weekday == 7) {
                    monthHTML += '</div>';
                }

                day++;
                i++;
            }

            $('#calendar').append(monthHTML);

            countMonth--;
            month = +month + 1;

            if (month > 12) {
                month = 1;
                year++;
            }

            create(1, month, year);

        } else {
            if (dateStart != '' && dateEnd != '') {
                $calendar.find('.day[data-date="' + dateStart + '"]').trigger('click');
                $calendar.find('.day[data-date="' + dateEnd + '"]').trigger('click');

            } else {
                $calendar.find('.day[rel=0]').trigger('click');
                $calendar.find('.day[rel=1]').trigger('click');
            }

            // массив с днями, в которых нет свободных номеров
            let emptyDays = $selectDate.attr('data-empty');
            if (emptyDays) {
                emptyDays = emptyDays.split(',');
            } else {
                emptyDays = [];
            }
            for (let ii = 0; ii < emptyDays.length; ii++) {
                $calendar.find('.day[data-date="' + emptyDays[ii] + '"]').addClass('empty').attr('title', TRANSLATE[LANGUAGE]['not_free_rooms']);
            }

            // массив с праздниками
            let holidays = $selectDate.attr('data-holidays');
            if (holidays) {
                holidays = holidays.split(',');
            } else {
                holidays = [];
            }
            for (let iii = 0; iii < holidays.length; iii++) {
                $calendar.find('.day[data-date="' + holidays[iii] + '"]').addClass('holidays');
            }

        }
    }

    //выделяем выбранный период бронирования
    function addPeriod() {
        $calendar.find('.day').removeClass('disable');

        const start = +$calendar.find('.day.active.start').attr('rel');
        const finish = +$calendar.find('.day.active.finish').attr('rel') + 1;

        $calendar.find('.day:not(.null)').slice(start, finish).addClass('period');
    }

    //установка ограничения на колво ночей
    function disableDate() {
        const start = +$calendar.find('.day.active.start').attr('rel') + maxNight;
        $calendar.find('.day:not(.null)').slice(start).addClass('disable');
    }

    //показ календаря
    function showCalendar() {
        $('body').addClass('open-calendar');
    }
    //закрытие календаря
    function hideCalendar() {
        $('body').removeClass('open-calendar');

        if (dateStart == '' || dateEnd == '') {
            $('body').find('.button').attr('disabled', 'disabled').addClass('disable');

        } else {
            $('body').find('.button').removeAttr('disabled').removeClass('disable');

            //добавляем выбранный период в навигацию
            let dateTextHTML = $('#date_in').find('.day').html() + ' ' + $('#date_in').find('.month').html() + ' - ' + $('#date_out').find('.day').html() + ' ' + $('#date_out').find('.month').html();
            $('#steps_period_date').html(dateTextHTML);

            // обновляем значений в виджете!
            refreshPeriodValue();
        }
    }

    //установка значения даты, на вход:
    //type - тип даты заезд/выезд(in/out)
    //date - значение даты дд.мм.гггг
    //text - значение даты текстовое для html
    function setValue(type, date, text) {
        text = text.split('|');
        let $obj;
        if (type == 'in') {
            $obj = $('#calendar_date_in, #date_in');
            dateStart = date;

        } else {
            $obj = $('#calendar_date_out, #date_out');
            dateEnd = date;
        }

        //формируем html выбранной даты
        $obj.attr('data-date', date);
        $obj.find('.day').text(text[0]);
        $obj.find('.month').text(text[1]);
        $obj.find('.weekday').text(text[2]);

        //получаем количество ночей если выбрано 2 даты
        let countNight = +$calendar.find('.day.period').length - 1;
        if (countNight < 0) {
            countNight = 0;
        }

        $('#select_date, #calendar_date').find('.nights p').html('<span class="num">' + countNight + '</span> ' + declOfNum(countNight, NIGHTS_TEXT_ARRAY));
    }

    // обновление значений выбранного периода в HTML
    function refreshPeriodValue() {
        // обновляем значение даты начала периода
        const dateStartObj = createDate(dateStart);
        $dateStartInput.val(dateStart);
        $dateStartText.text(getDateText(dateStartObj));
        $dateStartWeekday.text(getWeekdayName(dateStartObj));

        // обновляем значение даты завершения периода
        const dateEndObj = createDate(dateEnd);
        $dateEndInput.val(dateEnd);
        $dateEndText.text(getDateText(dateEndObj));
        $dateEndWeekday.text(getWeekdayName(dateEndObj));
    }

    create(currentDay, currentMonth, currentYear);
}

// Выбор кол-ва номеров/гостей mobile version
function initSelectRoomsGuests() {

    const $field = $('#select_rooms_guest_count');
    const $countRooms = $field.find('input[data-type="rooms"]'); //кол-во номеров
    const $countAdults = $field.find('input[data-type="adults"]'); //кол-во взрослых
    const $countChilds = $field.find('input[data-type="childs"]'); //кол-во детей
    const $childsAge = $field.find('.childs-age'); //блок с возрастом детей
    const $childsAgeSelects = $field.find('.childs-age-selects'); //обертка для селектов возраста ребенка

    //обновление значений и текста
    //на вход тип для проверки кол-во взрослых и номеров
    function refreshValue() {
        //получаем значения
        const countRooms = $countRooms.val();
        const countAdults = $countAdults.val();
        const countChilds = $countChilds.val();
        const childsAge = [];

        $childsAgeSelects.find('select').each(function (i) {
            $('body').find('[data-reserv_select_guests] .childs-age-selects select').eq(i).val($(this).val());
        });

        //для детей проверяем кол-во детей и кол-во селектов для возраста
        //если разное - добавляем/удаляем селекты
        const countSelects = $childsAgeSelects.find('.age').length * 1;
        //если колво селектов больше колва детей
        //удаляем лишние селекты
        if (countSelects > countChilds) {
            const diff = countSelects - countChilds;
            for (var i = 0; i < diff; i++) {
                removeSelect();
            }

        } else if (countSelects < countChilds) {
            const diff = countChilds - countSelects;
            for (var i = 0; i < diff; i++) {
                addSelect();
            }
        }

        // обновляем ПК версию
        $('body').find('[data-count_rooms_field]').val(countRooms);
        $('body').find('[data-count_adults_field]').val(countAdults);
        $('body').find('[data-count_childs_field]').val(countChilds);

        // обновляем доступность кнопок +- на ПК версии
        const $fieldRooms = $countRooms.parents('.select-count');
        if ($fieldRooms.find('.minus').hasClass('disable')) {
            $('body').find('.control[data-type="rooms"] .minus').addClass('disable');
        } else {
            $('body').find('.control[data-type="rooms"] .minus').removeClass('disable');
        }
        if ($fieldRooms.find('.plus').hasClass('disable')) {
            $('body').find('.control[data-type="rooms"] .plus').addClass('disable');
        } else {
            $('body').find('.control[data-type="rooms"] .plus').removeClass('disable');
        }

        const $fieldAdults = $countAdults.parents('.select-count');
        if ($fieldAdults.find('.minus').hasClass('disable')) {
            $('body').find('.control[data-type="adults"] .minus').addClass('disable');
        } else {
            $('body').find('.control[data-type="adults"] .minus').removeClass('disable');
        }
        if ($fieldAdults.find('.plus').hasClass('disable')) {
            $('body').find('.control[data-type="adults"] .plus').addClass('disable');
        } else {
            $('body').find('.control[data-type="adults"] .plus').removeClass('disable');
        }

        const $fieldChilds = $countChilds.parents('.select-count');
        if ($fieldChilds.find('.minus').hasClass('disable')) {
            $('body').find('.control[data-type="childs"] .minus').addClass('disable');
        } else {
            $('body').find('.control[data-type="childs"] .minus').removeClass('disable');
        }
        if ($fieldChilds.find('.plus').hasClass('disable')) {
            $('body').find('.control[data-type="childs"] .plus').addClass('disable');
        } else {
            $('body').find('.control[data-type="childs"] .plus').removeClass('disable');
        }

        // обновляем текст в поле ПК версии
        let text = '';
        text += countRooms + ' ' + declOfNum(countRooms, TRANSLATE[LANGUAGE]['rooms_text_array']) + ', ';
        text += countAdults + ' ' + declOfNum(countAdults, TRANSLATE[LANGUAGE]['adults_text_array']) + ', ';
        text += countChilds + ' ' + declOfNum(countChilds, TRANSLATE[LANGUAGE]['childs_text_array']);
        $('body').find('[data-value_text]').html(text);
    }

    //добавление/удаление HTML селектов
    //html добавляемого селекта
    let selectHTML = '<div class="age"><label class="select-field"><select name="child_age[]"' +
                     ' class="select-child-age" data-icons="false"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option></select><span class="arrow"><i class="icon icon-down-arrow-2"></i></span></label></div>';

    // добавляемый селект для ПК версии
    let selectDesktopHTML = '<div class="age"><select name="child_age[]" class="new"><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4</option><option value="5">5</option><option value="6">6</option><option value="7">7</option><option value="8">8</option><option value="9">9</option><option value="10">10</option><option value="11">11</option><option value="12">12</option><option value="13">13</option><option value="14">14</option><option value="15">15</option><option value="16">16</option><option value="17">17</option></select></div>';

    function addSelect() {
        //добавляем селект
        $childsAgeSelects.append(selectHTML);
        $childsAge.removeClass('hide');

        // обновляем ПК версию
        $('body').find('[data-childs_age_selects]').append(selectDesktopHTML);
        $('body').find('[data-childs_age]').removeClass('hide');
    }

    function removeSelect() {
        //удаляем селект
        $childsAgeSelects.find('.age').last().remove();
        // обновляем ПК версию
        $('body').find('[data-childs_age_selects] .age').last().remove();

        if (!$childsAgeSelects.find('.age').length) {
            $childsAge.addClass('hide');
            // обновляем ПК версию
            $('body').find('[data-childs_age]').addClass('hide');
        }
    }

    //плюс/минус взрослые/дети
    $field.find('.button-action').on('click', function () {
        if (!$(this).hasClass('disable')) {
            const $object = $(this).parent();
            const $input = $object.find('input');
            const maxVal = $input.attr('data-max');
            const minVal = $input.attr('data-min');
            const type = $object.attr('data-type');

            //если прибавляем
            if ($(this).hasClass('plus')) {
                $object.find('.minus').removeClass('disable');

                const newVal = $input.val() * 1 + 1;
                if (newVal == maxVal) {
                    $object.find('.plus').addClass('disable');
                }

            } else {
                $object.find('.plus').removeClass('disable');

                const newVal = $input.val() - 1;
                if (newVal == minVal) {
                    $object.find('.minus').addClass('disable');
                }
            }

            $input.val(newVal).trigger('change');

            refreshValue();
        }

        return false;
    });

    $field.find('input').on('change', function () {
        let val = $(this).val();
        const maxVal = $(this).attr('data-max') * 1;
        const minVal = $(this).attr('data-min') * 1;
        const $object = $(this).parent().parent();
        const type = $(this).attr('data-type');

        if (val == '' || val.search(/^\d+$/) == -1) {
            $(this).val(minVal);

        } else {
            $object.find('.minus').removeClass('disable');
            $object.find('.plus').removeClass('disable');

            //приводим к Integer
            val = val * 1;

            //если прибавляем
            if (val >= maxVal) {
                $object.find('.minus').removeClass('disable');
                $object.find('.plus').addClass('disable');

                if (val > maxVal) {
                    $(this).val(maxVal);
                }

            } else if (val <= minVal) {
                $object.find('.minus').addClass('disable');
                $object.find('.plus').removeClass('disable');

                if (val < minVal) {
                    $(this).val(minVal);
                }

            }
        }

        const countAdults = $countAdults.val();
        const countRooms = $countRooms.val();
        //изменение взрослых
        if (type == 'adults') {
            if (countAdults < countRooms) {
                $countRooms.val(countAdults).trigger('change');
            }
        }
        //изменение номеров
        if (type == 'rooms') {
            if (countRooms > countAdults) {
                $countAdults.val(countRooms).trigger('change');
            }
        }

        refreshValue();
    });

    //изменение возраста детей
    $childsAgeSelects.on('change', 'select', function () {
        refreshValue();
    });

    //при инициализации обновляем значение
    refreshValue();

    //поля для ввода только цифр
    $field.on('keydown', '.number', function (e) {
        // Разрешаем: backspace, delete, tab и escape
        if (event.keyCode == 46 || event.keyCode == 8 || event.keyCode == 9 || event.keyCode == 27 ||
            // Разрешаем: Ctrl+A
            (event.keyCode == 65 && event.ctrlKey === true) ||
            // Разрешаем: home, end, влево, вправо
            (event.keyCode >= 35 && event.keyCode <= 39)) {
            // Ничего не делаем
            return;

        } else {
            // Запрещаем все, кроме цифр на основной клавиатуре, а так же Num-клавиатуре
            if ((event.keyCode < 48 || event.keyCode > 57) && (event.keyCode < 96 || event.keyCode > 105)) {
                event.preventDefault();
            }
        }
    });
}

// получение названия дня недели
// на вход объект даты
function getWeekdayName(date) {
    return WEEKDAY_NAMES_LONG[+date.getDay()];
}

// получение текстового названия даты
// на вход объект даты
// возвращаемое значение в формате 31 авг 2017
function getDateText(date) {
    const day = +date.getDate();
    const month = +date.getMonth();
    const year = date.getFullYear();

    const result = day + ' ' + MONTH_NAMES_SHORT[month] + ' ' + year;

    return result;
}

// определение версии календаря
function getVersion() {
    if (+$(window).width() < 1000) return 'mobile';

    return 'desktop';
}

// форматирование даты к дд.мм.гггг
function formatDate(date) {
    let dd = date.getDate();
    if (dd < 10) dd = '0' + dd;

    let mm = date.getMonth() + 1;
    if (mm < 10) mm = '0' + mm;

    let yy = date.getFullYear();

    return dd + '.' + mm + '.' + yy;
}

// создание объекта даты на основе дд.мм.гггг
function createDate(date) {
    const dateArray = date.split('.');
    const day = +dateArray[0];
    const month = +dateArray[1] - 1;
    const year = dateArray[2];

    return new Date(year, month, day);
}



// Склонение слов по падежам в зависимости от количесва
// Пример: declOfNum(term, ['неделя', 'недели', 'недель'])
function declOfNum(number, titles) {
    const cases = [2, 0, 1, 1, 1, 2];
    return titles[(number % 100 > 4 && number % 100 < 20) ? 2 : cases[(number % 10 < 5) ? number % 10 : 5]];
}