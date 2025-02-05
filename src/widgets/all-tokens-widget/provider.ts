import * as vscode from 'vscode';
import { getNonce } from '../../utils';
import { appConfig } from '../../lib/config';
import { getUnConfiguredContent } from '../shared/shared-webviews';
import { findTokens } from '../../lib/token-converters';


function getMainWebViewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'all-tokens-widget', 'webview-script.js' ) );
  // Use CSP to allow loading of resources
  const nonce = getNonce();
  const jquery = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'deps', 'jquery.js' ) );
  const styles = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'all-tokens-widget', 'styles.css' ) );

  return `<!DOCTYPE html>
            <html lang="en">
              <head>
              <meta charset="UTF-8">
              <meta name="viewport" content="width=device-width, initial-scale=1.0">
              <meta http-equiv="Content-Security-Policy" content="default-src 'none'; style-src ${ webview.cspSource } 'nonce-${ nonce }'; script-src 'nonce-${ nonce }';">
              <link rel='stylesheet' href='${ mainStyleUri }'>
              <link rel='stylesheet'  href='${ styles }'>
              <script src="${ jquery }" nonce ="${ nonce }"></script>
              <title>Document</title>
            </head>
            <body>
              <input type='text' placeholder='Search for a token' id='token-search'> 

              <section class='tokens-section'>
                <div id='spacing-heading'>
                  <h4>Spacing tokens</h4>
                  <hr>
                </div>
                <div id='spacing-section'>
                </div>
              </section>

              <section class='tokens-section'>
                <div id='radius-heading'>
                  <h4>Radius tokens</h4>
                  <hr>
                </div>
                <div id='radius-section'>
                </div>
              </section>

              <section class='tokens-section'>
                <div id='elevation-heading'>
                  <h4>Elevation</h4>
                  <hr>
                </div>
                <div id='elevation-section'>
                </div>
              </section>

              <section class='tokens-section'>
                <div id='typography-heading'>
                  <h4>Typography</h4>
                  <hr>
                </div>
                <div id='typography-section'>
                </div>
              </section>

              <section class='tokens-section'>
                <div id='button-heading'>
                  <h4>Button Styles</h4>
                  <hr>
                </div>
                <div id='button-section'>
                </div>
              </section>
            </body>
            <script src="${ scriptUri }" nonce="${ nonce }"></script>
          </html>`;
}

export class AllTokensProvider implements vscode.WebviewViewProvider {

  public static readonly PROVIDER_ID = 'all-tokens';

  constructor( private extensionUri: vscode.Uri ) { }

  resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken ): Thenable<void> | void {

    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [ this.extensionUri ]
    };

    appConfig.subscribe( ( values ) => {
      if ( !values.IS_VALID_CORE_LOCATION ) {
        webviewView.webview.html = getUnConfiguredContent( webviewView.webview, this.extensionUri );
      } else {
        webviewView.webview.html = getMainWebViewContent( webviewView.webview, this.extensionUri );
      }
    } );

    webviewView.webview.onDidReceiveMessage( message => {
      switch ( message.command ) {
        case 'GET_RESULT': {
          const result = findTokens( message.args );
          webviewView.webview.postMessage( {
            args: result,
            command: 'SET_RESULT',
          } );
        }
        case 'COPY_TO_CLIPBOARD': {
          vscode.env.clipboard.writeText( message.args );
        }
      }
    } );
  }
}