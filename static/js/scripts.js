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

function fetchRoosters(searchInput) {
  if(searchInput.val().length > 2) {
    var svalue = searchInput.val();
    $.ajax({
      type: "POST",
      url: "/fetch/",
      data: { 
        value: svalue,
        week: weeknummer
      }
    })
      .done(function(back) {
        $('ul#acs').html(back).children(':first').addClass('selected');
      });
  } else {
    $('ul#acs').html('');
  }
}

$(document).ready(function() {

  $('select#menu').change(function() {
    window.location = $(this).find('option:selected').val();
  });

  var searchInput = $('div#searchname input');


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
      window.location = $('ul#acs .selected a').attr('href');

    } else {
      fetchRoosters(searchInput);
    }

  });


  $('input[type=number]').change(function() {
    weeknummer = $(this).val();
    fetchRoosters(searchInput);
  });

});
