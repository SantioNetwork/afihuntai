import ext from "./utils/ext";
import storage from "./utils/storage";

ext.storage.sync.get("afiHuntck", function(data) {
  if(data !== null && data !== undefined){
    document.getElementById("api_keys").value = data.afiHuntck
  }
})
ext.storage.sync.get("yesSound", function(data) {
  if(data.yesSound === "true"){
    document.getElementById("program-found-toggle").checked = true
  }else{
    document.getElementById("program-found-toggle").checked = false
  }
})
ext.storage.sync.get("possibleSound", function(data) {
  if(data.possibleSound === "true"){
    document.getElementById("possible-program-found-toggle").checked = true
  }else{
    document.getElementById("possible-program-found-toggle").checked = false
  }
})

document.getElementById("switch").addEventListener("click", function(){
  var x = document.getElementById("api_keys");
  if (x.type === "password") {
    x.type = "text";
  } else {
    x.type = "password";
  }
})

document.getElementById("program-found-toggle").addEventListener("click", function(){
  var toggle = document.getElementById("program-found-toggle").checked;
  var toggleVar = "false";
  if(toggle){
    toggleVar = "true"
  }
  ext.storage.sync.set({"yesSound": toggleVar}, function() {
    if(ext.runtime.lastError) {
      console.error(
        "Error setting sound for affiliate program found failed " + JSON.stringify(data) +
        ": " + ext.runtime.lastError.message
      );
      var x = document.getElementById("snackbar_error");
      x.innerHTML = "Failed to change setting for affiliate program detection alert sound"
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }else{
      var x = document.getElementById("snackbar");
      x.innerHTML = "Setting for affiliate program detection alert sound successfully changed"
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      ext.reload()
    }
  });
})
 
document.getElementById("possible-program-found-toggle").addEventListener("click", function(){
  var toggle = document.getElementById("possible-program-found-toggle").checked;
  var toggleVar = "false";
  if(toggle){
    toggleVar = "true"
  }
  ext.storage.sync.set({"possibleSound": toggleVar}, function() {
    if(ext.runtime.lastError) {
      console.error(
        "Error setting sound for possible affiliate found failed " + JSON.stringify(data) +
        ": " + ext.runtime.lastError.message
      );
      var x = document.getElementById("snackbar_error");
      x.innerHTML = "Failed to change setting for possible affiliate alert sound"
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }else{
      var x = document.getElementById("snackbar");
      x.innerHTML = "Setting for possible affiliate alert sound successfully changed"
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      ext.reload()
    }
  });
})

document.getElementById("submit_key").addEventListener("click", function(){

  var key = document.getElementById("api_keys").value
  if(key == "" || key == null){
    var x = document.getElementById("snackbar_error");
    x.innerHTML = "API key cannot be empty!"
    x.className = "show";
    setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      return
  }
  ext.storage.sync.set({"afiHuntck": key}, function() {
    if(ext.runtime.lastError) {
      console.error(
        "Error setting " + key + " to " + JSON.stringify(data) +
        ": " + ext.runtime.lastError.message
      );
      var x = document.getElementById("snackbar_error");
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
    }else{
      var x = document.getElementById("snackbar");
      x.className = "show";
      setTimeout(function(){ x.className = x.className.replace("show", ""); }, 3000);
      ext.reload()
    }
  });
})

document.getElementById("dashboard-click").addEventListener("click", function(){
  var message = {"action": 'open-dashboard'} 
  ext.runtime.sendMessage({ message: message});
})






