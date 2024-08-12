import ext from "./src/scripts/utils/ext.js"
import _ from "lodash"
import { initializeApp } from "firebase/app";
import { getFunctions, httpsCallable } from "firebase/functions" 
import storage from "./src/scripts/utils/storage.js";
const app = initializeApp({
  apiKey: "AIzaSyAfMiJV0WoI8E4es8qmANqw3qSWApsdJyI",
  authDomain: "ai-proj-c54e6.firebaseapp.com",
  databaseURL: "https://ai-proj-c54e6-default-rtdb.firebaseio.com",
  projectId: "ai-proj-c54e6",
  storageBucket: "ai-proj-c54e6.appspot.com",
  messagingSenderId: "525275819582",
  appId: "1:525275819582:web:69c8bc6199304a438eeb6f",
  measurementId: "G-2NPJ48VPDP"
});


const functions = getFunctions();
const vertexai = httpsCallable(functions, 'vertexai');

var apiKey = null
var geminiResponse = null

storage.get("afiHuntck", function(data) {
  if(data !== null){
    apiKey = data.afiHuntck
  }
})
function gettextsLinks(){
  var allText = document.body.innerText
  var linksArr = []
  var links = document.getElementsByTagName("a");
  linksArr.push(window.location.href)
  for(var i=0, max=links.length; i<max; i++) {
    if((/affili/i.test(links[i].href)) || (/refer/i.test(links[i].href)) ||
    (/ambassa/i.test(links[i].href)) || (/influencer/i.test(links[i].href)) ||
    (/partne/i.test(links[i].href))){
      linksArr.push(links[i].href);
    }
    
  }
  
  var message = 
 {"action": 'scraping-done',"texts":allText, "links":linksArr, 
  "siteName": window.location.hostname, "url": window.location.href }
 
  return message
}

ext.tabs.onUpdated.addListener( async function (tabId, changeInfo, tab) {
  if(changeInfo.status == "complete" ) {
    let injectionResults = await ext.scripting.executeScript({
      target: { tabId: tab.id,allFrames: true },
      func: gettextsLinks,
    })
        var texts = ""
        var linksArr = []
        var url = ""
        var site = ""
        var frammm = ""
      for (const frameResult of injectionResults) {
        const {frameId, result} = frameResult;
        if(frameId == 0){
          if(result.url != null){
            url = result.url
          }
          if(result.siteName != null){
            site = result.siteName
          }
        }
        if(result.texts != null){
          texts = texts + " " + result.texts
        }
        if(result.links != null){
          linksArr = _.union(linksArr, result.links)
        }
        frammm = frammm + " " + frameId
      }
        var obj = {"bong": apiKey, "text": texts, "links": linksArr, "site": site, "url": url}

        vertexai({ reqObj: obj })
          .then( (result) => {
            const data = result.data;
            geminiResponse = data.text;
            ext.tabs.sendMessage(tabId,{ "action": "ok", "status": data.status, "geminiResponse": geminiResponse, "site": site});
          })
          .catch((error) => {
            // Getting the Error details.
            const code = error.code;
            const message = error.message;
            const details = error.details;
            console.log(code + " " + message)
          });
        
  }
  
})

ext.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {

    if(request.message.action === "open-link") {

      ext.tabs.create({
        url: request.message.Link
      })
      sendResponse();
      return true;
    } 
    
    if(request.message.action === "open-dashboard") {
      
      ext.tabs.create({
        url: "https://me.afihuntai.com/dashboard"
      })
      sendResponse();
      return true;
    }
    
  }
);

ext.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
    storage.set({"yesSound": "false"}, function() {
      if(ext.runtime.lastError) {
        console.error(
          "Error setting sound for affiliate program found failed " + JSON.stringify(data) +
          ": " + ext.runtime.lastError.message
        );
      }
    });

    storage.set({"possibleSound": "false"}, function() {
      if(ext.runtime.lastError) {
        console.error(
          "Error setting sound for possible affiliate program found failed " + JSON.stringify(data) +
          ": " + ext.runtime.lastError.message
        );
      }
    });

    storage.set({"afiHuntck": ""}, function() {
      if(ext.runtime.lastError) {
        console.error(
          "Error setting key to "+ JSON.stringify(data) +
          ": " + ext.runtime.lastError.message
        );
      }
    });

  }else if(details.reason == "update"){
      var thisVersion = ext.runtime.getManifest().version;
      console.log("Updated from " + details.previousVersion + " to " + thisVersion + "!");
  }
});

ext.storage.onChanged.addListener((changes, namespace) => {
  for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
    if(key == "afiHuntck"){
      apiKey = newValue;
    }
  }
});
