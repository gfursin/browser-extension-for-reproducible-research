/*
 Copyright 2020 Grigori Fursin
*/

/* https://gitbrent.github.io/bootstrap4-toggle/ */

document.addEventListener('DOMContentLoaded', function () {
  if (!localStorage.initialized) {
    localStorage.checked = 0;
    localStorage.initialized = true;
  } else {
    var checked=localStorage.checked;
    if (checked==1) {
      $('#cr_status').bootstrapToggle('on');
    } else {
      $('#cr_status').bootstrapToggle('off');
    }
  }
});


$(function() {

  $('#cr_status').change(function() {

    if (!localStorage.initialized) {
      localStorage.enabled = true;
      localStorage.initialized = true;
    } else {
      var checked=$('#cr_status').prop('checked');
      if (checked===true) {
        localStorage.checked=1;

        var gettingAllTabs = chrome.tabs.query({
            active: true,
            currentWindow: true
        }, function(tabs) {
          for (let tab of tabs) {
            initializePageAction(tab);
          }
        });
      }
      else {
        localStorage.checked=0;
        $('#cr_dashboard').empty();
      }
    }

    chrome.runtime.sendMessage({update_icon: true});

  })
})