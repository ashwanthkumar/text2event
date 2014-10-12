/*
  To manually test it use the following URL via GET
  http://facebook-calendar-parser.herokuapp.com/?q=tomorrow
*/
var postServer = "http://facebook-calendar-parser.herokuapp.com";
chrome.contextMenus.create({"title": "Add to Google Calendar", "contexts":["selection"], "onclick": addToGCalMenu});

function addToGCalMenu(info, tab) {
  parseStringAndCreateEvent(info.selectionText, tab.id, tab.index);
}

function parseStringAndCreateEvent(text, tabId, tabIndex) {
  $.post(postServer, text, function(response) {
    $.each(response.result, function(_, data) {
      var urlToOpen = generateGCalLink(new Date(data.date), text);
      chrome.tabs.create({"url": urlToOpen, "openerTabId": tabId, "index": tabIndex+1});
    });

    if(response.result.length == 0) {
      // TODO - add a notification to the user that we couldn't extract any date time information from the selection
      chrome.tabs.executeScript({
        code: 'console.log(\'I am sorry, but can not really make much sense from - "' + text + '"\');',
      });
    }
  });
}

function generateGCalLink(date, text) {
  var dates = formatDate(date);
  var encodedText = encodeURI(text);
  return "https://www.google.com/calendar/render?action=TEMPLATE&text=" + encodedText + "&dates=" + dates + "/" + dates;
}

function formatDate(date) {
  var year = date.getUTCFullYear().toString();
  var month = pad(date.getUTCMonth(), 2);
  var dateInMonth = pad(date.getUTCDate(), 2);
  var hours = pad(date.getUTCHours(), 2);
  var minutes = pad(date.getUTCMinutes(), 2);
  var seconds = pad(date.getUTCSeconds(), 2);

  return year + month + dateInMonth + "T" + hours + minutes + seconds + "Z";
}

function pad(n, width, z) {
  z = z || '0';
  n = n + '';
  return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

