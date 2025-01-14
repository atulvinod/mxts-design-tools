import * as vscode from 'vscode';
import { getNonce } from '../../utils';
import * as valueConverters from '../../lib/value-converters';
import { APP_CONFIG_KEYS, appConfig } from '../../lib/config';
import { getUnConfiguredContent } from '../shared/shared-webviews';
import { tokenType } from '../../lib/token-converters';

function getMainWebViewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'value-to-spacing-token-widget', 'webview-script.js' ) );
  // Use CSP to allow loading of resources
  const nonce = getNonce();
  const jquery = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'deps', 'jquery.js' ) );

  return `<!DOCTYPE html>
          <html lang="en">
            <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${ webview.cspSource } 'nonce-${ nonce }'; script-src 'nonce-${ nonce }';">
              <link rel='stylesheet' href='${ mainStyleUri }'>
              <script src="${ jquery }" nonce ="${ nonce }"></script>
              <title>Document</title>
            </head>
            <body>
              <div class="d-flex d-flex-row w-100">
                <input type="text" id="value-input" class="flex-1" name="value-input" placeholder='Enter a unit value...'/>
                <button id='convert-button'>Convert</button>
              </div>
              
              <textarea rows="5" class='w-95 convert-result-textarea no-resize' placeholder='Result' readonly id='convert-result-textarea'></textarea>
              
              <div class='d-flex d-justify-space-between'>
                <span class='info-subtext'>1REM = <span id="rem-value" '></span>px</span>
                <span id='copy-tokens' class='secondary-button mr-8' title='Click to copy'>Copy</span>
              </div>

              <div class='tokens-section'>
                <hr>
                <div id='spacing-tokens'>
                <div>
              </div>

            </body>
            <script src="${ scriptUri }" nonce="${ nonce }"></script>
          </html>
`;
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

    //Initial state
    this.postCommonMessagesToWebview( webviewView );

    appConfig.subscribe( ( values ) => {
      if ( !values.IS_VALID_CORE_LOCATION ) {
        webviewView.webview.html = getUnConfiguredContent( webviewView.webview, this._extensionUri );
      } else {
        webviewView.webview.html = getMainWebViewContent( webviewView.webview, this._extensionUri );
      }
      this.postCommonMessagesToWebview( webviewView );
    } );

    webviewView.webview.onDidReceiveMessage(
      message => {
        switch ( message.command ) {
          case 'CONVERT_SPACING': {
            const result = valueConverters.convertMarginAndPadding( message.args );
            webviewView.webview.postMessage( { args: result, command: message.command } );
            break;
          }
          case 'COPY_TO_CLIPBOARD': {
            vscode.env.clipboard.writeText( message.args );
            break;
          }
        }
      }
    );

    webviewView.onDidChangeVisibility( () => {
      if ( webviewView.visible ) {
        this.postCommonMessagesToWebview( webviewView );
      }
    } );
  }

  postCommonMessagesToWebview( webviewView: vscode.WebviewView ) {
    webviewView.webview.postMessage( { command: "UPDATE_REM", args: appConfig.value.BASE_REM_VALUE } );
    webviewView.webview.postMessage( { command: "UPDATE_NON_EXACT_TOKEN_TO_REM", args: appConfig.value[ APP_CONFIG_KEYS.NON_EXACT_TOKEN_TO_REM_CALC ] } );

    const tokens: tokenType[] = Object.entries( appConfig.value[ APP_CONFIG_KEYS.SPACING_TOKENS ] ?? {} ).map( ( [ name, value ] ) => {
      return {
        name,
        value: ( value as string ),
        type: 'spacing_tokens'
      };
    } );

    webviewView.webview.postMessage( { command: 'UPDATE_TOKEN_SECTION', args: tokens } );
  }


}
