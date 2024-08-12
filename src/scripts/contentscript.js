import ext from "./utils/ext";
import toastrMinAfi from "./toastr.min.js";
import toastrMinAfi1 from "./toastr.min.js";
import  "../styles/toastr.min.css"
import  "../styles/customNoti.css"
import ext from "./utils/ext";
import storage from "./utils/storage";
import yesSound from "url:../sounds/mixkit-bubble-pop-up-alert-notification-2357.wav"
import possibleSound from  "url:../sounds/mixkit-dry-pop-up-notification-alert-2356.wav"


  
  toastrMinAfi.options = {
    'allowHtml': true,
    'closeButton':true,
    'debug': false,
    'newestOnTop': true,
    'progressBar': false,
    'positionClass': 'toast-top-right',
    'preventDuplicates': false,
    'showDuration': '1000',
    'hideDuration': '1000',
    'timeOut': '120000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'slideDown',
    'hideMethod': 'slideUp',
  }
  
  toastrMinAfi1.options = {
    'allowHtml': true,
    'closeButton':true,
    'debug': false,
    'newestOnTop': true,
    'progressBar': false,
    'positionClass': 'toast-top-right',
    'preventDuplicates': false,
    'showDuration': '1000',
    'hideDuration': '1000',
    'timeOut': '120000',
    'extendedTimeOut': '1000',
    'showEasing': 'swing',
    'hideEasing': 'linear',
    'showMethod': 'slideDown',
    'hideMethod': 'slideUp',
  }
  
   ext.runtime.onMessage.addListener(
    function(request, sender, sendResponse) {
   
      if (request.action === 'ok') {
      
        if (request.status === 'YES') {
          yesNotification(request.site, request.geminiResponse)
        }
    
        if(request.status === 'POSSIBLE') {
    
          possibleNotification(request.geminiResponse.Link)
    
        }
      }
    }
   );


    // Notify client an affiliate program has been definitely found
    function yesNotification(site, geminiResponse){
      storage.get("yesSound", function(data) {
        if(data.yesSound == "true"){
          var audio = new Audio(yesSound);
          audio.play();
        }
      })
      
      toastrMinAfi.success(`A potential affiliate program by `+ geminiResponse.Business + 
      ` detected! Click here to explore details & commission rates.`,'Affiliate Program Found!',
      {onclick: function() {toastrMinAfi.clear(); details(geminiResponse)}});
    }
    
    // Gemini response shown after yesNotification onclick 
    function details(geminiResponse){
    
      var message = `<div style="margin-bottom: 4px;"><b>Offer: </b>` + geminiResponse.Offer + `</div>
      <div style="margin-bottom: 4px;"><b>Requirements: </b>` + geminiResponse.Requirements + `</div>
      <div style="margin-bottom: 4px;"><b>Category: </b>` + geminiResponse.Category + `</div>
      <div style="margin-bottom: 4px;"><b>Duration: </b>` + geminiResponse.Duration + `</div>
      <div style="margin-bottom: 4px;"><b>Payment Method: </b>` + geminiResponse.Payment_Method + `</div>
      <div style="margin-bottom: 4px;"><b>Business Name: </b>` + geminiResponse.Business + `</div>
      <div style="margin-bottom: 4px;">` + geminiResponse.Details + `</div>
      <div>Page link <a style="color: blue;" href="` + geminiResponse.Link + `">` + geminiResponse.Link + `</a><div>`
      toastrMinAfi1.success(message);
    }
       
    // Notify client a possible affiliate program has been detected
    function possibleNotification(link){
      storage.get("possibleSound", function(data) {
        if(data.possibleSound == "true"){
          var audio = new Audio(possibleSound);
          audio.play();
        }
      })
      
      if (link == "NO"){
        toastrMinAfi.success(`AfiHunt AI detected a potential affiliate program on this page, 
        but details are limited. Consider exploring the website for clues about the program.`,
        'Dig Deeper! ⛏️');
      
      }else{
        toastrMinAfi.success(`AfiHunt AI detected a potential affiliate program on this page. <br>
        For more, click this link <a style="color: blue;" href="` + link +`">` + link + ``,
        'Dig Deeper! ⛏️');
    
      }
      
    }

