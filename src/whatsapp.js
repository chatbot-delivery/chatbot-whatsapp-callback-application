module.exports = {

  sendInteractiveMessage: function (sender, tracking_number, receiver, message) {

    //console.log("Inside the WhatsApp Method", message);
    var received_msg_txt = message.text;
    if (message.inputHint == "expectingInput") {
      
      var choice_options = received_msg_txt.match('\([0-9]\).*$');
8
      if (choice_options) {
        var arr_choice_options = choice_options[0].split(",");
        if (arr_choice_options.length <= 3) {
          sendInteractiveButtonMessage(sender, receiver, tracking_number, arr_choice_options, received_msg_txt);
        } else {
          sendInteractiveListMessage(sender, receiver, tracking_number, arr_choice_options, received_msg_txt);
        }
      } /*else {
        var response_body = JSON.stringify({
          messaging_product: "whatsapp",
          to: receiver,
          text: { body:  received_msg_txt},
        });
        sendWhatsAppMessage(sender, response_body);      
      }*/
    } else {
      var response_body = JSON.stringify({
          messaging_product: "whatsapp",
          to: receiver,
          text: { body:  received_msg_txt},
        });
      sendWhatsAppMessage(sender, response_body);      
    }
  },
  sendInteractiveListMessage: sendInteractiveListMessage,

  sendInteractiveButtonMessage: sendInteractiveButtonMessage,

  sendWhatsAppMessage: sendWhatsAppMessage

};

function sendInteractiveListMessage(sender, receiver, tracking_number, arr_choice_options, received_msg_txt) {

  let d = []
  for (var i = 0; i < arr_choice_options.length; i++) {
    var choice = arr_choice_options[i].split(") ");
    if (choice) {
      var payload = choice[0].substr(choice[0].indexOf("\(") + 1, choice[0].length);
      var text = choice[1].substring(0, 20);
      d.push({
        title: (i+1),
        rows: [{ "id": tracking_number+ ":" +":"+payload, "title": text }]
      })
    }
  }

  var button_text = received_msg_txt.substr(0, received_msg_txt.indexOf("\(") - 1)
  console.log("BUTTON TEXT:", button_text);

  var response_body = JSON.stringify(
    {
      "messaging_product": "whatsapp",
      "to": receiver,
      "type": "interactive",
      "interactive": {
        "type": "list",
        "body": {
          "text": button_text
        },
        "action": {
          "button": "Select",
          "sections": d
        }
      }
    }
  )

  //console.log(response_body);

  sendWhatsAppMessage(sender, response_body);


}

function sendInteractiveButtonMessage(sender, receiver, tracking_number, arr_choice_options, received_msg_txt) {
  let d = []
  for (var i = 0; i < arr_choice_options.length; i++) {
    var choice = arr_choice_options[i].split(") ");
    if (choice) {
      var payload = choice[0].substr(choice[0].indexOf("\(") + 1, choice[0].length);
      var text = choice[1].substring(0, 20);
      d.push({
        type: "reply",
        reply: { "id": tracking_number+ ":" +":"+payload, "title": text }
      })
    }
  }

  var button_text = received_msg_txt.substr(0, received_msg_txt.indexOf("\(") - 1)
  console.log("BUTTON TEXT:", button_text);

  var response_body = JSON.stringify(
    {
      "messaging_product": "whatsapp",
      "to": receiver,
      "type": "interactive",
      "interactive": {
        "type": "button",
        "body": {
          "text": button_text
        },
        "action": {
          "buttons":d        
        }
      }
    }
  )

  //console.log(response_body);

  sendWhatsAppMessage(sender, response_body);

}

function sendWhatsAppMessage(sender, response_body) {
  console.log(response_body);
  var axios = require("axios").default;
  const token = process.env.WHATSAPP_TOKEN;
  axios({
    method: "POST", // Required, HTTP method, a string, e.g. POST, GET
    url:
      "https://graph.facebook.com/v14.0/" +
      sender +
      "/messages?access_token=" +
      token,
    data: response_body,
    headers: { "Content-Type": "application/json" }
  }).then(function (response) {
    console.log('Successfully sent WhatsApp Msg ')
  })
    .catch(function (error) {
      console.error('Error ' + error.message)
    });
}