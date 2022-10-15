/*
 * Starter Project for WhatsApp Echo Bot Tutorial
 *
 * Remix this as the starting point for following the WhatsApp Echo Bot tutorial
 *
 */

"use strict";
global.XMLHttpRequest = require('xhr2');
global.WebSocket = require('ws');

const { DirectLine } = require('botframework-directlinejs');
const fs = require("fs");
const WA = require("./whatsapp")

// Access token for your app
// (copy token from DevX getting started page
// and save it as environment variable into the .env file)
const token = process.env.WHATSAPP_TOKEN;

const azure_bot_secret = process.env.AZURE_BOT_SECRET

const ConnectionStatus = require('botframework-directlinejs');

// Imports dependencies and set up http server
const request = require("request"),
    json = require("JSON"),
    express = require("express"),
    body_parser = require("body-parser"),
    axios = require("axios").default,
    app = express().use(body_parser.json()); // creates express http server

// Sets server port and logs message on success
app.listen(process.env.PORT || 1337, () => console.log("webhook is listening"));

// Accepts POST requests at /webhook endpoint
app.post("/webhook", (req, res) => {
    try {


        // Parse the request body from the POST
        // let body = req.body;

        // Check the Incoming webhook message
     
        console.log(JSON.stringify(req.body, null, 2));

        // info on WhatsApp text message payload: https://developers.facebook.com/docs/whatsapp/cloud-api/webhooks/payload-examples#text-messages
        if (req && req.body && req.body.object) {
            if (
                req.body.entry &&
                req.body.entry[0].changes &&
                req.body.entry[0].changes[0] &&
                req.body.entry[0].changes[0].value.messages &&
                req.body.entry[0].changes[0].value.messages[0]
            ) {
                let phone_number_id =
                    req.body.entry[0].changes[0].value.metadata.phone_number_id;
                let from = req.body.entry[0].changes[0].value.messages[0].from; // extract the phone number from the webhook payload
                let msg_type = req.body.entry[0].changes[0].value.messages[0].type;
                let interactive_type = "";
                let msg_body = "";
                let tracking_number = "";
                let userLocale = "en-US";
              
                if (msg_type == "text") {
                    msg_body = req.body.entry[0].changes[0].value.messages[0].text.body; // extract the message text from the webhook payload
                } else if (msg_type == "button") {
                    msg_body = req.body.entry[0].changes[0].value.messages[0].button.payload;
                    tracking_number = msg_body.match(/\d+/)[0];
                }
                else if (msg_type == "interactive") {
                    interactive_type = req.body.entry[0].changes[0].value.messages[0].interactive.type;
                    if (interactive_type == "button_reply") {
                        //msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.title;
                        let id = req.body.entry[0].changes[0].value.messages[0].interactive.button_reply.id;
                        let arrId = id.split(":");
                        tracking_number = arrId[0];
                        userLocale = arrId[1];
                        msg_body = arrId[2];
                    } else if (interactive_type == "list_reply") {
                        //msg_body = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.title;
                        let id = req.body.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
                        let arrId = id.split(":");
                        tracking_number = arrId[0];
                        userLocale = arrId[1];
                        msg_body = arrId[2];
                    }
                }
              
               console.log(tracking_number);
               console.log(userLocale);
              console.log(msg_body);
               
              
              
                console.log("Locale is :" + userLocale);
                var conversationdata = fs.readFileSync('conversation.json')
                var conversationmap = JSON.parse(conversationdata);

                if (conversationmap && conversationmap[from + "_" + tracking_number]) {
                    
                    console.log("User: ", from + "_" + tracking_number)
                    console.log("Found conversation for the User: ", conversationmap[from + "_" + tracking_number])

                    var directLine = new DirectLine({
                        secret: azure_bot_secret
                        //, webSocket: false
                        //, timeout: 60000
                        , conversationId: conversationmap[from + "_" + tracking_number]
                        , conversationStartProperties: { /* optional: properties to send to the bot on conversation start */
                            locale: userLocale
                        }
                    });

                } else {

                    console.log("Starting a new conversation")
                    var directLine = new DirectLine({
                        secret: azure_bot_secret
                        //, timeout: 60000
                        //, webSocket: false
                        , conversationStartProperties: { /* optional: properties to send to the bot on conversation start */
                            locale: userLocale
                        }
                    });

                }

                directLine.connectionStatus$
                    .subscribe(connectionStatus => {
                        switch (connectionStatus) {
                            case ConnectionStatus.Uninitialized: { console.log("Connection Status", connectionStatus); } // the status when the DirectLine object is first created/constructed
                            case ConnectionStatus.Connecting: { console.log("Connection Status", connectionStatus); }    // currently trying to connect to the conversation
                            case ConnectionStatus.Online: { console.log("Connection Status", connectionStatus); }         // successfully connected to the converstaion. Connection is healthy so far as we know.
                            case ConnectionStatus.ExpiredToken: { console.log("Connection Status", connectionStatus); }   // last operation errored out with an expired token. Your app should supply a new one.
                            case ConnectionStatus.FailedToConnect: { console.log("Connection Status", connectionStatus); } // the initial attempt to connect to the conversation failed. No recovery possible.
                            case ConnectionStatus.Ended: { console.log("Connection Status", connectionStatus); }        // the bot ended the conversation
                        }
                    });

                //msg_body = "Trck_nbr:12345678 - Trigger Change Delivery"
                console.log("Posting", msg_body);
                postMessageToAzureBotService(directLine, userLocale, phone_number_id, tracking_number, from, msg_body, conversationmap);
            }
            res.sendStatus(200);
        } else {
            // Return a '404 Not Found' if event is not from a WhatsApp API
            res.sendStatus(404);
        }
    } catch (err) {
        console.log("Technical Error while processing Request", err);
    }
});

function postMessageToAzureBotService(directLine, userLocale, phone_number_id, tracking_number, from, msg_body, conversationmap) {
    console.log("FROM:", from);
  
    directLine.postActivity({
        from: { id: from, name: from, locale: 'nl-NL' }, // required (from.name is optional)
        type: 'message',
        text: msg_body,
        locale: userLocale
    }).subscribe(
        function (id) {
            console.log("Posted: ", msg_body);
            console.log("Posted activity, assigned ID ", id);
            if (id == "retry") {
              console.log("Post to Azure Bot Failed, Submitted for Retry");
              console.log(from, msg_body);
              postMessageToAzureBotService(directLine, phone_number_id, tracking_number, from, msg_body, conversationmap);
            } else {
              directLine.activity$
                  .filter(activity => activity.type === 'message' && activity.from.id === 'fdmideliverychatbot' && activity.replyToId === id)
                  //.filter(activity => activity.type === 'message' && activity.from.id === 'fdmideliverychatbot')
                  .subscribe(function (message) {
                      
                      console.log("received message ", message);
                      WA.sendInteractiveMessage(phone_number_id, tracking_number, from, message);
                      conversationmap[from + "_" + tracking_number] = id.substring(0, id.indexOf("|"));
                      //console.log("Storing the Conversation map", conversationmap);
                      const data = JSON.stringify(conversationmap, null, 4);
                      fs.writeFileSync('conversation.json', data);

                    }
                  );
            }
        },
        error => {
          console.log("Error posting activity", error);
          postMessageToAzureBotService(directLine, phone_number_id, tracking_number, from, msg_body, conversationmap);
        }
    );
}

// Accepts GET requests at the /webhook endpoint. You need this URL to setup webhook initially.
// info on verification request payload: https://developers.facebook.com/docs/graph-api/webhooks/getting-started#verification-requests
app.get("/webhook", (req, res) => {
    /**
     * UPDATE YOUR VERIFY TOKEN
     *This will be the Verify Token value when you set up webhook
     **/
    const verify_token = process.env.VERIFY_TOKEN;

    // Parse params from the webhook verification request
    let mode = req.query["hub.mode"];
    let token = req.query["hub.verify_token"];
    let challenge = req.query["hub.challenge"];

    // Check if a token and mode were sent
    if (mode && token) {
      
        // Check the mode and token sent are correct
        if (mode === "subscribe" && token === verify_token) {
            // Respond with 200 OK and challenge token from the request
            console.log("WEBHOOK_VERIFIED");
            res.status(200).send(challenge);
        } else {
            // Responds with '403 Forbidden' if verify tokens do not match
            res.sendStatus(403);
        }
    }
});
