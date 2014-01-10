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

String.prototype.replaceBoldWithCase = function(subStr) {
  start = this.toLowerCase().indexOf(subStr.toLowerCase());
  end = start + subStr.length;
  finish = this.length - 1;
  console.log(start + ' ' + end);
  newStr = this.substr(0, start) + '<b>' + this.substr(start, subStr.length) + '</b>' + this.substr(end, finish);
  return newStr;
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
      console.log(response);
      var toReplace = searchInput.val();

      $('ul#acs').html('');

      for(var key in response) {
        if(response.hasOwnProperty(key) && key !== 'users') {
          var itemName = response[key]['name'];
          var itemLlnr = response[key]['llnr'];
          var itemGroup = response[key]['group'];

          switch(response[key]['match']) {
            case 'name':
              itemName = itemName.replaceBoldWithCase(toReplace);
              break;
            case 'llnr':
              itemLlnr = itemLlnr.replaceBoldWithCase(toReplace);
              break;
            case 'group':
              itemGroup = itemGroup.replaceBoldWithCase(toReplace);
              break;
            default:
              console.log(response['match']);
              break;
          }
          var itemUrl = '/' + response[key]['ref'] + '/' + response[key]['group'] + '/' + response[key]['llnr'] + '/';
          var listItem = '<li><a href="' + itemUrl + '">' + itemName + ' (' + itemLlnr + ', ' + itemGroup + ')</a></li>';
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


$(document).ready(function() {

  console.log('Hey! Leuk dat je hier even kijkt. Wil je helpen dit te verbeteren? Mail even naar florismartijnjansen+infowebviewer@gmail.com! (infowebviewer v0.4.1)');

  $('body').css('padding-top', $('header#main').height());

  $('select#menu').change(function() {
    window.location = $(this).find('option:selected').val();
  });

  var searchInput = $('div#searchname input');
  var searchVal = '';
  var searchTimeout;

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

  $('body').keyup(function(e) {
    if(e.keyCode === 191 || e.keyCode === 83) { //S & /
      if(!$('input').is(':focus')) {
        searchInput.focus();
      }
    } else if(e.keyCode === 27) { //Esc
      $('body').focus();
    } else if(e.keyCode === 78) { //N
      if(!$('input').is(':focus')) {
        $('input[type=number]').focus();
      }
    }
  });

});