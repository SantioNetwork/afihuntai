import ext from "./utils/ext";

var optionsLink = document.getElementById("open_option_tab_menu");

optionsLink.addEventListener("click", function(e) {
  ext.runtime.openOptionsPage()
 // ext.runtime.sendMessage({ action: "open-options"  });

})
