import * as vscode from 'vscode';
import { getNonce } from '../../utils';
import { getNearestColorTokens } from '../../lib/token-converters';

function getWebviewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {

  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const jquery = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'deps', 'jquery.js' ) );
  const nonce = getNonce();
  const script = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'color-finder-widget', 'webview-script.js' ) );
  const styles = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'color-finder-widget', 'styles.css' ) );

  return `<!DOCTYPE html>
            <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
               <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${ webview.cspSource } 'unsafe-inline'; script-src 'nonce-${ nonce }';">
              <link rel='stylesheet' href='${ mainStyleUri }'>
              <link rel='stylesheet'  href='${ styles }'>
              <script src="${ jquery }" nonce ="${ nonce }"></script>
              <title>Document</title>
            </head>
            <body>
              <div class='d-flex' id='color-input-row'>
                <input type='text' placeholder='HEX or RGBA value...' id='color-input'/>
                <div id='color-preview-container'>
                  <span id='color-preview'></span>
                </div>
              </div>
              <span class='warning-subtext' id='invalid-value'>Invalid color value</span><br>
              <span class='info-subtext'>Results are sorted starting from the closest color</span>
              <hr>
              <div id='finder-results'>
              </div>
            </body>
            <script src="${ script }" nonce = ${ nonce }></script>
            </html>
            `;
}

export class ColorTokenFinderProvider implements vscode.WebviewViewProvider {
  public static readonly PROVIDER_ID = 'color-token-finder-provider';

  constructor(
    private _extensionUri: vscode.Uri
  ) {

  }

  resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken ): Thenable<void> | void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [ this._extensionUri ]
    };

    webviewView.webview.html = getWebviewContent( webviewView.webview, this._extensionUri );

    webviewView.webview.onDidReceiveMessage( message => {
      switch ( message.command ) {
        case 'GET_RESULT': {
          const colorTokens = getNearestColorTokens( message.args );
          if ( colorTokens instanceof Error && colorTokens.message === 'INVALID_VALUE' ) {
            webviewView.webview.postMessage( { command: 'INVALID_VALUE', args: null } );
          }else{
            webviewView.webview.postMessage( { command: 'RESULTS', args: colorTokens } );
          }
        }
      }
    } );
  }

}