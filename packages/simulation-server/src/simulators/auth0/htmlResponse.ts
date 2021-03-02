import { Auth0QueryParams } from './types';

export const authorizationResponse = ({
  state,
  code,
  redirect_uri,
}: Pick<Auth0QueryParams, 'state' | 'code' | 'redirect_uri'>): string => {
  return `
  <!DOCTYPE html>
    <html>
      <head>
        <title>Authorization Response</title>
      </head>
      <body>
        <script type="text/javascript">
        (function(window, document) {
          var targetOrigin = "${redirect_uri}";
          var webMessageRequest = {};
          var authorizationResponse = {
            type: "authorization_response",
            response: {
              "code":"${code}",
              "state":"${state}"}
            };
            
            var mainWin = (window.opener) ? window.opener : window.parent;
            
            if (webMessageRequest["web_message_uri"] && webMessageRequest["web_message_target"]) {
              window.addEventListener("message", function(evt) {
                if (evt.origin != targetOrigin) {
                  return;
                }
                
                switch (evt.data.type) {
                  case "relay_response":
                    var messageTargetWindow = evt.source.frames[webMessageRequest["web_message_target"]];
                    
                    if (messageTargetWindow) {
                      messageTargetWindow.postMessage(authorizationResponse, webMessageRequest["web_message_uri"]);
                      window.close();
                    }
                    break;
                  }
                }
              );
              
              mainWin.postMessage({
                type: "relay_request"
              }, targetOrigin);
            } else {
              mainWin.postMessage(authorizationResponse, targetOrigin);
            }
          })(this, this.document);
        </script>
      </body>
    </html>
  `;
};
