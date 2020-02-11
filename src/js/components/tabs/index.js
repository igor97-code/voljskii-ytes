import * as $ from 'jquery';

function initTabs($tabs) {
   if (!$tabs) return;

   let defaultTab = $tabs.attr('data-default-tab');
   if (!defaultTab) {
      defaultTab = $tabs.find('[data-tab]').first().attr('data-tab');
   }

   changeTab(defaultTab);

   $tabs.on('click', '.switch', function () {
      if ($(this).hasClass('active')) return false;

      changeTab($(this).attr('data-tab'));

      return false;
   });

   function changeTab(tab) {
      $tabs.find('[data-tab]').removeClass('active');
      $tabs.find('[data-tab="' + tab + '"]').addClass('active');
   }
}

export {initTabs}

