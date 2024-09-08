import * as vscode from 'vscode';
import { APP_CONFIG_KEYS, appConfig } from '../../lib/config';
import { getNonce, validatePathForCoreLib } from '../../utils';

function getWebViewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const nonce = getNonce();
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'config-widget', 'webview-script.js' ) );

  const openSettingsSvg = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'open.svg' ) );

  return `
    <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <meta http-equiv="Content-Security-Policy"  content="default-src 'none'; img-src ${ webview.cspSource }; style-src ${ webview.cspSource } 'nonce-${ nonce }'; script-src 'nonce-${ nonce }';">
        <link rel='stylesheet' href='${ mainStyleUri }'>
        <title>Document</title>
      </head>
      <body>
        <div class='d-flex d-flex-col my-10'>
          <label>Core lib location</label>
          <div class='d-flex my-5'>
            <input type="text" class='flex-1' id='core-lib-location' readonly>
            <button class='icon-button' id='open-core-lib-settings' title='Open settings'>
            <img src="${ openSettingsSvg }" alt='open-settings'>
            </button>
          </div>
          <span class='warning' id='lib-location-invalid'>Core lib location invalid!</span>
          <span class='success' id='lib-location-valid'>Core lib location valid!</span> 
        </div>
        <script nonce="${ nonce }" src="${ scriptUri }"></script>
      </body>
      </html>
  `;
}


export class ConfigProvider implements vscode.WebviewViewProvider {

  public static readonly PROVIDER_ID = 'config-provider';

  constructor(
    private _extensionUri: vscode.Uri
  ) { }


  resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken ): Thenable<void> | void {
    webviewView.webview.options = {
      enableScripts: true,
      localResourceRoots: [ this._extensionUri ]
    };

    appConfig.subscribe( ( values ) => {
      webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_LOCATION', args: values[ APP_CONFIG_KEYS.CORE_LIB_LOCATION ] } );
      webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_VALID', args: values[ APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION ] } );
    } );

    webviewView.webview.onDidReceiveMessage( message => {
      switch ( message.command ) {
        case 'OPEN_CORE_LIB_SETTINGS': {
          vscode.commands.executeCommand( 'workbench.action.openSettings', 'mxtsDesignTools.coreLibLocation' );
        }
      }
    } );

    webviewView.webview.html = getWebViewContent( webviewView.webview, this._extensionUri );

    //To set the initial state
    webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_LOCATION', args: appConfig.value[ APP_CONFIG_KEYS.CORE_LIB_LOCATION ] } );
    webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_VALID', args: appConfig.value[ APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION ] } );

    //to restore the state when the webview is closed and then reopened
    webviewView.onDidChangeVisibility( () => {
      if ( webviewView.visible ) {
        webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_LOCATION', args: appConfig.value[ APP_CONFIG_KEYS.CORE_LIB_LOCATION ] } );
        webviewView.webview.postMessage( { command: 'UPDATE_CORE_LIB_VALID', args: appConfig.value[ APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION ] } );
      }
    } );
  }

}