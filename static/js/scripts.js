$.fn.setCursorPosition = function(pos) {
  if ($(this).get(0).setSelectionRange) {
    $(this).get(0).setSelectionRange(pos, pos);
  } else if ($(this).get(0).createTextRange) {
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
  if(searchInput.val().length > 2) {
    if(response['users'] === 'true') {
      var toReplace = searchInput.val();
      var reg = new RegExp(toReplace,"gi");

      $('ul#acs').html('');

      for(var key in response) {
        if(response.hasOwnProperty(key) && key !== 'users') {
          var itemName = response[key]['name'].replaceBoldWithCase(toReplace, toReplace);
          var itemUrl = '/' + weeknummer + '/' + response[key]['ref'] + '/' + response[key]['llnr'] + '/';
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

$(document).ready(function() {

  console.log('Hey! Leuk dat je hier even kijkt. Wil je helpen dit te verbeteren? Mail even naar florismartijnjansen+infowebviewer@gmail.com!');

  $('body').css('padding-top', $('header#main').height());

  $('select#menu').change(function() {
    window.location = $(this).find('option:selected').val();
  });

  var searchInput = $('div#searchname input');
  var searchVal = '';
  var searchTimeout;

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
      searchTimeout = window.setTimeout(bothUsers, 300, searchInput);
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
