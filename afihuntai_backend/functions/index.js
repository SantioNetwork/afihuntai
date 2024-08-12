/* eslint-disable operator-linebreak */
/* eslint-disable camelcase */
/* eslint-disable keyword-spacing */
/* eslint-disable space-before-blocks */
/* eslint-disable prefer-const */
/* eslint-disable no-unused-vars */
/* eslint-disable object-curly-spacing */
/* eslint-disable padded-blocks */
/* eslint-disable max-len */
/* eslint-disable spaced-comment */
/* eslint-disable no-trailing-spaces */
/* eslint-disable indent */
const { onCall, HttpsError} = require("firebase-functions/v2/https");
const logger = require("firebase-functions/logger");
const admin = require("firebase-admin");
admin.initializeApp();
const db = admin.database();
const {VertexAI} = require("@google-cloud/vertexai");

exports.vertexai = onCall({cors: false},
async (request) => { 
    
    const body = request.data.reqObj;
    const apiKey = body.bong;
    const scrappedText = body.text;
    const links = body.links;
    let site = body.site;
    const url = body.url;
    
    const ref = db.ref(`bongs/${apiKey}`);
    try {
        return await ref.once("value").then( async (snapshot) => {
          
          if(snapshot.exists()){
              const userID = snapshot.val();

              const subRef = db.ref(`subscribers/${userID}`);
              return await subRef.once("value").then( async (snap) => {


                  if(snap.exists() && snap.child("status").val() == "active" && snap.child("apikey").val() == apiKey){
                  
                      let webVisits = snap.child("websiteVisits").val();
                      let totalWebVisits = snap.child("totalWebsiteVisits").val();
                      let webVisitLimit = snap.child("webVisitLimit").val();
                      let subType = snap.child("subType").val();
                      let daySpan = 0;
                      if(subType == "monthly_50" || subType == "monthly_custom"){
                          daySpan = 30;
                      }else if(subType == "yearly_50" || subType == "yearly_custom"){
                          daySpan = 365;
                      }
                    
                      if(Number(webVisits) >= Number(webVisitLimit)) {
                          
                          return await subRef.update({
                              status: "inactive",
                              webVisitLimit: 0,
                          }).then(()=>{
                            logger.info("api call limit exceeded");
                            throw new HttpsError(400, "api call limit exceeded");
                          }).catch((error) => {
                              logger.info("api call limit exceeded " + error);
                            
                          });
                      
                      }
                      webVisits = Number(webVisits) + 1;
                      totalWebVisits = Number(totalWebVisits) + 1;

                      return await subRef.update({
                          websiteVisits: webVisits,
                          totalWebsiteVisits: totalWebVisits,
                      }).then(async ()=>{

                          let paymentDate = snap.child("paymentDate").val() + "";
                      
                          const dateObj = paymentDate.split("T")[0];
                          let d = dateObj.split("-")[2];
                          let m = dateObj.split("-")[1];
                          let y = dateObj.split("-")[0];
                          let subDate = new Date(y, m, d);
      
                          let cD = new Date().getDate();
                          let cM = new Date().getMonth() + 1;
                          let cY = new Date().getFullYear();
                          let currentDate = new Date( cY, cM, cD);
      
                          let diff = Math.abs(subDate.getTime() - currentDate.getTime());
                          let daysDiff = diff / (1000 * 60 * 60 * 24);

                          if ((subType === "monthly_50" || subType === "monthly_custom" || subType === "yearly_custom") && (Number(daysDiff) > daySpan)) {
                            logger.info("client afihunt ai api call limit exceeded");
                            return await subRef.update({
                                status: "inactive",
                                webVisitLimit: 0,
                            }).then(()=>{
                                logger.info("client afihunt ai api call limit exceeded");
                                throw new HttpsError(400, "client afihunt ai api call limit exceeded");
                            });
                          }
                         
                          const request = {
                            contents: [{role: "user", parts: [{text: `You are called AfiHunt AI. Your job is to help affiliate marketers automate their search for affiliate programs. You do this by analyzing texts and links from websites they visit as they browse the web. They're going to provide you with these texts and links from the visited website. Analyze them and then give them a light and warm reply based on the following conditions:

1. if the whole context of the text is about the said website/company's own affiliate program or referral program or partner program or influencer program
or ambassador program, generate a response that strictly follows the following format, it is very IMPORTANT you follow it:
Status: followed by YES
Offer: followed by a short sentence/phrase of the commission being offered and the kind of offer the program is presenting, if you cannot determine it, let the affiliate marketer know. 
Requirements: followed by a short sentence/phrase of who is eligible to participate, if you cannot determine it from the text, let the affiliate marketer know. 
Category: followed by the industry within which you think the business operates, if you cannot determine it from the text, let the affiliate marketer know. 
Duration: followed by a short sentence/phrase of how long you think the affiliate program will go on for, if you cannot determine it from the text, let the affiliate marketer know. 
Payment_Method: followed by method by which affiliate marketers will be paid, if you cannot determine it from the text, let the affiliate marketer know. 
Business: followed by the name of the business, if you cannot determine it from the text, let the affiliate marketer know.
Details: followed by the conclusion of your analysis, suggestions and anything you want the affiliate marketer to know and remember to make it light, warm and short too.
Link:  followed by the link to the webpage that talks about the affiliate or partner or referral or influencer or ambassador program which should be chosen from the list of links . If you cannot find the link from the list of links given. Link containing "affiliate" or it's equivalent should take should be considered above any other.
If you cannot determine the link, simply write NO.

2. if the whole context of the text is not about the website/company's own affiliate program but contains certain keywords like "Partner program", "Partners", "Affiliate program", "Affiliates", "Referral Program", "Referrals", "Partnerships", generate a response that strictly follows the following format:
Status: followed by POSSIBLE
Business: followed by the name of the business, if you cannot determine it from the text, let the affiliate marketer know.
Link: followed by the link to the webpage that talks about the affiliate or partner or referral or influencer or ambassador program which should be chosen from the list of links . If you cannot find the link from the list of links given. Link containing "affiliate" or it's equivalent should take should be considered above any other.
If you cannot determine the link, simply write NO.

If the text does not satisfy the above two conditions,  generate a response that strictly follows the following format:
Status: followed by NO.\n"` + scrappedText + `\n`+ links + `"`}]}],
                          };
                       
                        const vertexAI = new VertexAI({project: "ai-proj-c54e6", location: "us-central1", googleAuthOptions: {keyFile: ""}});
                       
                        const generativeModel = vertexAI.getGenerativeModel({
                        model: "projects/ai-proj-c54e6/locations/us-central1/endpoints/5876896247532486656", 
                        generationConfig: {
                            temperature: 0.3,
                            topP: 0,
                            maxOutputTokens: 1080,
                            responseMimeType: "text/plain",
                        },
                        });
                       
                        let responseText = null;
                  
                        const result = await generativeModel.generateContent(request);
                       
                        const contentResponse = result.response;
                        logger.info("contentResponse: " + JSON.stringify(result.response)); 
                        responseText = contentResponse.candidates[0].content.parts[0].text;
                    
                        let data = {};

                        const lines = responseText.split("\n");

                        for (const line of lines) {
                            const [key, value] = line.split(": "); 
                            if (key && value) { 
                            data[key.trim()] = value.trim(); 
                            }
                        }
                        
                        const date = Date.now();
                      
                        if(data["Status"] == "YES") {
                            if(data["Link"] == "NO"){
                                data["Link"] = "Couldn't determine";
                            }   
                        
                            site = site.replaceAll(".", "_");
                            return await db.ref(`personal_sites/${userID}/${site}`).once("value").then( async (snap) => {
                                if(!snap.exists()){
                                    return await db.ref(`personal_sites/${userID}/${site}`).set({
                                        date: date,
                                        details: data,
                                    }).then(()=>{
                                        return{"status": "YES", "text": data};
                                    })
                                    .catch((error) => {
                                        logger.info("error saving personal site data " + error);
                                        throw new HttpsError(503, "error saving personal site data", error);
                                    });
                                }else {
                                    
                                    if(snap.child("details").child("Status").val() == "POSSIBLE"){
                                        return await db.ref(`personal_sites/${userID}/${site}`).update({
                                            date: date,
                                            details: data,
                                        }).then(()=>{
                                            return{"status": "YES", "text": data};
                                        })
                                        .catch((error) => {
                                            logger.info("error saving personal site data " + error);
                                            throw new HttpsError(503, "error saving personal site data", error);
                                        });
                                    }else{
                                        return await db.ref(`personal_sites/${userID}/${site}`).update({
                                            date: date,
                                        }).then(()=>{
                                            return{"status": "YES", "text": data};
                                        })
                                        .catch((error) => {
                                            logger.info("error saving personal site data " + error);
                                            throw new HttpsError(503, "error saving personal site data", error);
                                        });
                                    }
                                }
                            })
                            .catch((error) => {
                                logger.info("error saving personal site data " + error);
                                throw new HttpsError(503, "error saving personal site data", error);
                            });

                        }else if(data["Status"] == "POSSIBLE") {
                            data["Status"] = "POSSIBLE";
                            data["Offer"] = "-";
                            data["Requirements"] = "-";
                            data["Category"] = "-";
                            data["Duration"] = "-";
                            data["Payment_Method"] = "-";
                            data["Details"] = "-";
                            if(data["Link"] !== "NO"){
                                site = site.replaceAll(".", "_");
                                return await db.ref(`personal_sites/${userID}/${site}`).once("value").then( async (snap) => {
                                if(!snap.exists()){
                                    return await db.ref(`personal_sites/${userID}/${site}`).set({
                                        date: date,
                                        details: data,
                                    }).then(()=>{
                                        return {"status": "POSSIBLE", "text": data};
                                    })
                                    .catch((error) => {
                                        logger.info("error saving personal site data " + error);
                                        throw new HttpsError(503, "error saving personal site data", error);
                                    });
                                }else {
                                    return await db.ref(`personal_sites/${userID}/${site}`).update({
                                        date: date,
                                    }).then(()=>{
                                        return {"status": "POSSIBLE", "text": data};
                                    })
                                    .catch((error) => {
                                        logger.info("error saving personal site data " + error);
                                        throw new HttpsError(503, "error saving personal site data", error);
                                    });
                                }
                                })
                                .catch((error) => {
                                    logger.info("error saving personal site data " + error);
                                    throw new HttpsError(503, "error saving personal site data", error);
                                });
                            }else{
                                return {"status": "NO", "text": "null"};
                            }
                        }else if(data["Status"] == "NO") {
                            return {"status": "NO", "text": "null"};
                                
                        }else{
                            logger.info("gemini prompt error");
                            throw new HttpsError(500, "gemini prompt error");
                        }
                            
                      })
                      .catch((error) => {
                          logger.info("error updating webVisits " + error);
                          throw new HttpsError(503, "error updating webVisits ", error);
                      });
                      
                      
                  }else{
                      logger.info("database error, database condition not met- " + "sub error");
                      throw new HttpsError(403, "database error, database condition not met ", "sub error");
                  }
              }).catch((error) => {
                  logger.info("database error, failed to subs database- " + error);
                  throw new HttpsError(403, "database error, failed to subs database", error);
              });
              
          }else{
              logger.info("404, bong resource unknown- " + apiKey);
              throw new HttpsError(403, "bong resource unknown");
          }
        }).catch((error) => {
            logger.info("database error, failed to read key- " + error);
            throw new HttpsError(403, "database error, failed to read key", error);
        });
    }catch(err) {
        logger.info("try/catch error caught " + err);
        throw new HttpsError(403, "try/catch error caught: ", err);
    }
  
});
