/*
 Copyright 2020 Grigori Fursin
*/

// get specific cookie

function getCKCookie(name) {
  var cookieValue = null;
  if (document.cookie && document.cookie !== '') {
      var cookies = document.cookie.split(';');
      for (var i = 0; i < cookies.length; i++) {
          var cookie = cookies[i].trim();
          if (cookie.substring(0, name.length + 1) === (name + '=')) {
              cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
              break;
          }
      }
  }
  return cookieValue;
};

// Access cK portal API
async function accessCK(api_url, dict, uploadInput) {

  // Form Data
//  const formData = new FormData();
  const formData = dict;

  // Add uploaded file if needed
  if (uploadInput && uploadInput.files && uploadInput.files.length == 1) {
    formData.append("file", uploadInput.files[0]);
  }

  // Add authentication
  var csrftoken = getCKCookie('csrftoken');

  // SEEMS like above authentication is not directly related to the browser one
  // I managed to login at some point but then couldn't get another user ...

  var output={'return':9, 'error':'empty output'};

  if (!api_url || api_url=='')
    api_url='/api/v1/?'

  console.log(api_url);

  const r = await fetch(api_url, 
    {
      method: "POST",
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
        'X-CSRFToken': csrftoken
      },
      body: JSON.stringify(formData),
      mode: 'cors',
      cache: 'default'
    }).then(response => {
      if (!response.ok)
        return {'return':9, 'error':'cK portal API returned error: '+response.statusText};
      else 
        return response.json();
    }).then(function (data) {
//      alert(csrftoken+'\n'+JSON.stringify(data));
      output=data;
    }).catch(function(error) {
      output={'return':9, 'error':'Error while accessing the cK portal API: '+error}
    });

  return output;
}
