$.fn.setCursorPosition = function(pos) {
  if($(this).get(0).setSelectionRange) {
    $(this).get(0).setSelectionRange(pos, pos);
  } else if($(this).get(0).createTextRange) {
    var range = $(this).get(0).createTextRange();
    range.collapse(true);
    range.moveEnd('character', pos);
    range.moveStart('character', pos);
    range.select();
  }
}

String.prototype.replaceBoldWithCase = function(subStr, newStr) {
  return this.replace( new RegExp(subStr, 'ig'), function(found) {
    var doneNew;

    if(/[A-Z]/.test(found.charAt(0))) {
      doneNew = '<b>' + newStr.charAt(0).toUpperCase() + newStr.substring(1) + '</b>';
    } else {
      doneNew = '<b>' + newStr.toLowerCase() + '</b>';
    }

    return doneNew;
  });
}


function otherWeek(nuInput) {
  weeknummer = nuInput.val();
  var pathArray = window.location.pathname.split('/');
  pathArray[4] = weeknummer;
  var fullUrl = 'http://' + window.location.host + pathArray.join('/');
  window.location = fullUrl;
}


var response;

function fetchUsers(searchInput, callback) {
  var svalue = searchInput.val();
  $.ajax({
    type: "POST",
    url: "/fetch/",
    data: { 
      value: svalue,
      week: weeknummer
    }
  }).done(function(back) {
      response = back;
      if(callback) {
        callback(searchInput);
      }
  });
}

function processUsers(searchInput) {
  if(searchInput.val().length > 1) {
    if(response['users'] === 'true') {
      var toReplace = searchInput.val();
      var reg = new RegExp(toReplace,"gi");

      $('ul#acs').html('');

      for(var key in response) {
        if(response.hasOwnProperty(key) && key !== 'users') {
          var itemName = response[key]['name'].replaceBoldWithCase(toReplace, toReplace);
          var itemUrl = '/' + response[key]['ref'] + '/' + response[key]['group'] + '/' + response[key]['llnr'] + '/';
          var listItem = '<li><a href="' + itemUrl + '">' + itemName + ' (' + response[key]['llnr'] + ', ' + response[key]['group'] + ')</a></li>';
          $('ul#acs').append(listItem);
        }
      }

      $('ul#acs').children(':first').addClass('selected');
    } else {
      $('ul#acs').html('<li class="noresult"><i>Er zijn geen resultaten voor de naam waar je naar zoekt.</i></li>');
    }
  } else {
    $('ul#acs').html('');
  }
}

function bothUsers(searchInput) {
  fetchUsers(searchInput, processUsers);
}


function highlightHour(current) {
  var usableLessonHour = current['hour'] + 1;
  var usableDay;
  
  var hourSelector = 'table.roosterdeel > tbody > tr:nth-child(' + usableLessonHour + ')';

  if(current['day'] > 5) {
    usableDay = 2;
  } else {
    usableDay = current['day'] + 1;
  }
  var lessonSelector = ':nth-child(' + usableDay + ')';

  $('table.roosterdeel > tbody > tr').removeClass('highlighted');
  currentLesson = $(hourSelector).children(lessonSelector);
  currentLesson.addClass('current');
  dTop = currentLesson.offset().top;
  dLeft = currentLesson.offset().left;
  $(window).scrollTop(dTop - 80);
  $('section#timetable').scrollLeft(dLeft - 50);
  var currentDate = new Date();
}

function getCorrectHour() {
  var currentDate = new Date();
  var currentHour = currentDate.getHours();
  var currentMinute = currentDate.getMinutes();
  var currentDay = currentDate.getDay();
  var lessonHour;

  if(currentDay == 6 || currentDay == 0) {
    lessonHour = 1;
    currentDay = 1;
  } else {
    switch(currentHour) {
      case 1:
      case 2:
      case 3:
      case 4:
      case 5:
      case 6:
      case 7:
      case 8:
        lessonHour = 1;
        break;
  
      case 9:
        if(currentMinute < 20) {
          lessonHour = 1;
        } else {
          lessonHour = 2;
        }
        break;
  
      case 10:
        if(currentMinute < 10) {
          lessonHour = 2;
        } else {
          lessonHour = 3;
        }
        break;
  
      case 11:
        lessonHour = 4;
        break;
  
      case 12:
        if(currentMinute < 10) {
          lessonHour = 4;
        } else {
          lessonHour = 5;
        }
        break;
        
      case 13:
        lessonHour = 6;
        break;
        
      case 14:
        if(currentMinute < 20) {
          lessonHour = 6;
        } else {
          lessonHour = 7;
        }
        break;
        
      case 15:
        if(currentMinute < 10) {
          lessonHour = 7;
        } else {
          lessonHour = 8;
        }
        break;
        
      case 16:
        if(currentMinute < 10) {
          lessonHour = 8;
        } else {
          lessonHour = 9;
        }
        break;

      case 17:
      case 18:
      case 19:
      case 20:
      case 21:
      case 22:
      case 23:
        lessonHour = 1;
        currentDay = currentDay + 1;
        break;
    }
  }

  return { 'hour': lessonHour, 'day': currentDay };
}


function placeCookie(group, user_id, ref) {
  if(document.cookie == document.cookie) {
    index = -1;
  }

  if (index == -1) {
    document.cookie = "group=" + group + "; path=/; expires=Monday, 04-Apr-2020 05:00:00 GMT";
    document.cookie = "user_id=" + user_id + "; path=/; expires=Monday, 04-Apr-2020 05:00:00 GMT";
    document.cookie = "ref=" + ref + "; path=/; expires=Monday, 04-Apr-2020 05:00:00 GMT";
  }
}


$(document).ready(function() {

  console.log('Hey! Leuk dat je hier even kijkt. Wil je helpen dit te verbeteren? Mail even naar florismartijnjansen+infowebviewer@gmail.com! (infowebviewer v0.4)');

  $('body').css('padding-top', $('header#main').height());

  $('select#menu').change(function() {
    window.location = $(this).find('option:selected').val();
  });

  var searchInput = $('div#searchname input');
  var searchVal = '';
  var searchTimeout;

  if($('button#save_user').length === 1) {
    var cookie_string = document.cookie;
    if(cookie_string.length != 0) {
      var user_id_value = cookie_string.match('user_id=([^;]*)');
      if(user_id_value) {
        if($('button#save_user').attr('data-user_id') === user_id_value[1]) {
          $('button#save_user').text('Dit rooster wordt getoond bij het openen. Verwijderen?').attr('id', 'remove_user');
        }
      }
    }
  }

  $('body').on('click', 'button#save_user', function(e) {
    e.preventDefault();
    var group = $(this).attr('data-group');
    var user_id = $(this).attr('data-user_id');
    var ref = $(this).attr('data-ref');
    placeCookie(group, user_id, ref);
    $(this).text('Dit rooster wordt getoond bij het openen. Verwijderen?').attr('id', 'remove_user');
  });

  $('body').on('click', 'button#remove_user', function(e) {
    e.preventDefault();
    document.cookie="user_id=; max-age=0; path=/";
    $(this).text('Toon dit rooster bij openen').attr('id', 'save_user');
  });

  if(window.location.pathname.length < 2) {
    var cookie_string = document.cookie;
    if(cookie_string.length != 0) {
      var group_value = cookie_string.match('group=([^;]*)');
      var user_id_value = cookie_string.match('user_id=([^;]*)');
      var ref_value = cookie_string.match('ref=([^;]*)');
      if(group_value && user_id_value && ref_value) {
        window.location.pathname = '/' + ref_value[1] + '/' + group_value[1] + '/' + user_id_value[1] + '/';
      }
    }
  }

  searchInput.keyup(function(e) {

    if(e.keyCode === 38) { //uparrow
      $(this).setCursorPosition($(this).val().length);
      if($('ul#acs li:first').hasClass('selected')) {
        $('ul#acs .selected').removeClass('selected')
        $('ul#acs li:last').addClass('selected');
      } else {
        $('ul#acs .selected').removeClass('selected')
                             .prev().addClass('selected');
      }

    } else if(e.keyCode === 40) { //downarrow
      if($('ul#acs li:last').hasClass('selected')) {
        $('ul#acs .selected').removeClass('selected')
        $('ul#acs li:first').addClass('selected');
      } else {
        $('ul#acs .selected').removeClass('selected')
                             .next().addClass('selected');
      }

    } else if(e.keyCode === 13) { //enter
      var selectedHref = $('ul#acs .selected a').attr('href');
      if(selectedHref != undefined && selectedHref != '') {
        window.location = selectedHref;
      } else {
        alert('Er waren geen resultaten en je gaat dus nu nergens heen.');
      }

    } else if(searchVal !== searchInput.val()) {
      window.clearTimeout(searchTimeout);
      searchTimeout = window.setTimeout(bothUsers, 100, searchInput);
      searchVal = searchInput.val();
    }

  });


  $('input[type=number]').change(function() {
    weeknummer = $(this).val();

    processUsers(searchInput);
  });

  $(window).resize(function() {
    $('body').css('padding-top', $('header#main').height());
  });

});
