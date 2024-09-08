import * as vscode from 'vscode';
import { getNonce } from '../../utils';
import * as valueConverters from '../../lib/value-converters';
import { appConfig } from '../../lib/config';

function getMainWebViewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'value-to-spacing-token-widget', 'webview-script.js' ) );
  // Use CSP to allow loading of resources
  const nonce = getNonce();

  return `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${ webview.cspSource } 'nonce-${ nonce }'; script-src 'nonce-${ nonce }';">
              <link rel='stylesheet' href='${ mainStyleUri }'>
              <title>Document</title>
            </head>
            <body>
              <div class="d-flex d-flex-row w-100">
                <input type="text" id="value-input" class="flex-1" name="value-input" placeholder='Enter a unit value...'/>
                <button id='convert-button'>Convert</button>
              </div>
              <textarea rows="5" class='w-95 convert-result-textarea no-resize' placeholder='Result' readonly id='convert-result-textarea'></textarea>
              <span class='text-subtext'>1REM = <span id="rem-value"></span>px</span>
            </body>
            <script src="${ scriptUri }" nonce="${ nonce }"></script>
          </html>
`;
}

function getUnConfiguredContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'value-to-spacing-token-widget', 'webview-script.js' ) );

  // Use CSP to allow loading of resources
  const nonce = getNonce();
  return `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${ webview.cspSource } 'nonce-${ nonce }'; script-src 'nonce-${ nonce }';">
              <link rel='stylesheet' href='${ mainStyleUri }'>
              <title>Document</title>
            </head>
            <body>
              <h1>Oops! :(</h1>
              <h3>Could not find valid tokens to use.</h3>
              <span>Please configure the correct core library location from Settings.</span>
            </body>
            <script src="${ scriptUri }" nonce="${ nonce }"></script>
          </html>`;
}


export class ValueToSpacingTokenProvider implements vscode.WebviewViewProvider {
  public static readonly PROVIDER_ID = 'value-to-token';

  constructor(
    private _extensionUri: vscode.Uri
  ) { }

  resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken ): Thenable<void> | void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [ this._extensionUri ]
    };

    appConfig.subscribe( ( values ) => {
      if ( !values.IS_VALID_CORE_LOCATION ) {
        webviewView.webview.html = getUnConfiguredContent( webviewView.webview, this._extensionUri );
      } else {
        webviewView.webview.html = getMainWebViewContent( webviewView.webview, this._extensionUri );
      }
      webviewView.webview.postMessage( { command: "UPDATE_REM", args: values.BASE_REM_VALUE } );
    } );

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch ( message.command ) {
          case 'CONVERT_SPACING': {
            const result = valueConverters.convertMarginAndPadding( message.args );
            webviewView.webview.postMessage( { args: result, command: message.command } );
          }
        }
      }
    );
  }
}
