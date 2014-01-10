function highlightHour(current) {
  var usableLessonHour = current['hour'];
  var usableDay;
  
  if(current['day'] > 5) {
    usableDay = 2;
  } else {
    usableDay = current['day'];
  }
  var daySelector = '#days > table:nth-of-type(' + usableDay + ') > tbody > :nth-child(' + usableLessonHour + ')';

  $('*').removeClass('current');
  currentLesson = $(daySelector);
  currentLesson.addClass('current');
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

function openTab(day) {
  var currentDate = new Date();
  var currentDay = currentDate.getDay();
  var currentHour = currentDate.getHours();
  $('nav#tabswitcher a').removeClass('focused');
  $('table.day').hide();

  if(day) {
    $('table.day' + day).show();
    $('a[href=' + day + ']').addClass('focused');
  } else {
    if(currentHour > 16) {
      currentDay = currentDay + 1;
    }
    switch(currentDay) {
      case 6:
      case 0:
      case 1:
        $('table.day#mon').show();
        $('nav#tabswitcher a[href=#mon]').addClass('focused');
      case 2:
        $('table.day#tue').show();
        $('nav#tabswitcher a[href=#tue]').addClass('focused');
      case 3:
        $('table.day#wed').show();
        $('nav#tabswitcher a[href=#wed]').addClass('focused');
      case 4:
        $('table.day#thu').show();
        $('nav#tabswitcher a[href=#thu]').addClass('focused');
      case 5:
        $('table.day#fri').show();
        $('nav#tabswitcher a[href=#fri]').addClass('focused');
    }
  }
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
  $('button#change_week').click(function() {
    otherWeek($(this).prev());
  });
  $('input[type=number]').keyup(function(e) {
    if(e.keyCode === 13) { //enter
      otherWeek($(this));
    }
  });
  openTab(false);

  highlightHour(getCorrectHour());
  var reCalcHour = setInterval(function() {
    highlightHour(getCorrectHour())
  }, 1000 * 60 * 5);

  var cookie_string = document.cookie;
  if(cookie_string.length != 0) {
    var user_id_value = cookie_string.match('user_id=([^;]*)');
    if(user_id_value) {
      if($('button#save_user').attr('data-user_id') === user_id_value[1]) {
        $('button#save_user').text('Dit rooster wordt getoond bij het openen. Verwijderen?').attr('id', 'remove_user');
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

  $('nav#tabswitcher a').click(function() {
    openTab($(this).attr('href'));
  });

  $('#searchname').hide();
  $('#togglesearch').click(function() {
    $('#searchname').slideToggle('fast');
  });

});

var mouse_location_event = null;
var timer_hover_id = null;

function handleMouseMove(event) {
  event = event || window.event; // IE-ism
  mouse_location_event = event;
}

document.onmousemove = handleMouseMove;