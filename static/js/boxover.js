function showSelects() {
  var elements = document.getElementsByTagName("select");
  for(i=0;i< elements.length;i++) {
    elements[i].style.visibility='visible';
  }
}

function hideSelects() {
   var elements = document.getElementsByTagName("select");
   for(i=0;i< elements.length;i++) {
     elements[i].style.visibility='hidden';
   }
}

function hideHoverInfo() {
  clearTimeout(timer_hover_id);
  if(timer_hover_id == 0) return;
  var hover = document.getElementById('hoverinfo');
  hover.style.display = 'none';

  timer_hover_id = 0;
}

function showHoverInfo(header, body, caller) {
  clearTimeout(timer_hover_id);
  timer_hover_id = 0;

  // register id of element that called hover.
  document.getElementById('hover_caller_id').innerHTML = caller.getAttribute( 'id' );

  var curleft = curtop = 0;
  do {
    curleft += caller.offsetLeft;
    curtop += caller.offsetTop;
  } while(caller = caller.offsetParent);

  var hover = document.getElementById('hoverinfo');
  hover.style.display = 'block';
  hover.style.top  = (curtop - 40) + 'px';
  hover.style.left = (curleft - 40) + 'px';
  console.log(curleft + ' ' + curtop + ' ' + hover.style.top + ' ' + hover.style.left);

  var content = document.getElementById('hovercontent');
  var new_content = "";
  if(header != "") new_content += "<b>"+header+"</b><br />";
  new_content += body;
  content.innerHTML = new_content;
}


function checkAndHideHoverInfo() {
  // event.clientX and event.clientY contain the mouse position
  var id_holder = document.getElementById('hover_caller_id');
  var caller_id = id_holder.innerHTML;
  
  var appointment = document.getElementById(caller_id);

  var rect_appointment = appointment.getBoundingClientRect();

  var hiden = false;
  if(mouse_location_event.clientX < rect_appointment.left) hiden = true;
  if(mouse_location_event.clientX > rect_appointment.right) hiden = true;
  if(mouse_location_event.clientY < rect_appointment.top) hiden = true; 
  if(mouse_location_event.clientY > rect_appointment.bottom) hiden = true; 
  
  if(hiden) timer_hover_id = setTimeout(hideHoverInfo, 1000);
}
