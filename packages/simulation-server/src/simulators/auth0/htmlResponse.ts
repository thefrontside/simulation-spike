export const iframeResponse = ({ state, code }: { state: string; code: string }): string => {
  return `
  <!DOCTYPE html>
<html>

<head>
  <title>Authorizatio Response</title>
</head>

<body>
  <script
    type="text/javascript">(function (window, document) {
        var targetOrigin = "http://localhost:5000";
        var webMessageRequest = {};
        var authorizationResponse = { 
          type: "authorization_response",
          response: {
            "code": "${code}",
            "state": "${state}" 
          } 
        }; 
        
        var mainWin = (window.opener) ? window.opener : window.parent;
        
        if (webMessageRequest["web_message_uri"] && webMessageRequest["web_message_target"]) { 
          window.addEventListener("message", function (evt) { 
            if (evt.origin != targetOrigin) return; 
              switch (evt.data.type) { 
                case "relay_response": 
                  var messageTargetWindow = evt.source.frames[webMessageRequest["web_message_target"]]; 
                  
                  if (messageTargetWindow) { 
                    messageTargetWindow.postMessage(authorizationResponse, webMessageRequest["web_message_uri"]); 
                    window.close(); 
                  } 
                  
                  break; 
                } 
              }); 
            
              mainWin.postMessage({ 
                type: "relay_request" }, 
                targetOrigin
               ); 
            } 
        else { mainWin.postMessage(authorizationResponse, targetOrigin); 
      }
      })(this, this.document);</script>
</body>

</html>
  `;
};
