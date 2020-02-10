import * as $ from 'jquery';

$(function () {
	initApp();
	toggleMainMenu();
});

function initApp() {
	console.log('initApp');
}

function toggleMainMenu() {
	$('#menu-burger').click(function () {
		$('html').toggleClass('main-menu-open')
	})
}
