import * as vscode from 'vscode';
import { APP_CONFIG_KEYS, appConfig, setAppConfig, updateAppConfig } from '../../lib/config';
import { getNonce, validatePathForCoreLib } from '../../utils';

function getWebViewContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
  const mainStyleUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'media', 'main.css' ) );
  const nonce = getNonce();
  const scriptUri = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'src', 'widgets', 'config-widget', 'webview-script.js' ) );
  const jquery = webview.asWebviewUri( vscode.Uri.joinPath( extensionUri, 'deps', 'jquery.js' ) );
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
        <script src="${ jquery }" nonce ="${ nonce }"></script>
      </head>
      <body>
        <div class='d-flex d-flex-col my-10'>
          <label>Core library path</label>
          <div class='d-flex my-5'>
            <input type="text" class='flex-1' id='core-lib-location' readonly>
            <button class='icon-button' id='open-core-lib-settings' title='Open settings'>
            <img src="${ openSettingsSvg }" alt='open-settings'>
            </button>
          </div>
          <div class="d-flex d-justify-space-between">
            <span class='warning' id='lib-location-invalid'>Core library path is invalid!</span>
            <span class='success' id='lib-location-valid'>Core library path is valid!</span> 
            <button id='reload-data'>Reload data</button>
          </div>
        </div>
        <div class='d-flex d-flex-col my-10'>
          <label>Base value of 1REM</label>
          <div class='d-flex my-5'>
            <input type="text" class='flex-1' id='base-rem-value' value="" readonly>
            <button class='icon-button' id='open-base-rem-value' title='Open settings'>
            <img src="${ openSettingsSvg }" alt='open-settings'>
            </button>
          </div>
        </div>
        <div class='d-flex d-flex-col my-10'>
        <label>Get rem-calc value for non exact token values in 'Unit values to Spacing Tokens'</label>
          <div class='d-flex my-5'>
            <input type="text" class='flex-1' id='rem-calc-non-exact' value="" readonly> 
            <button class='icon-button' id='open-rem-calc-non-exact' title='Open settings'>
              <img src="${ openSettingsSvg }" alt='open-settings'>
            </button>
          </div>
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
      this.postCommonMessagesToWebView( webviewView, values );
    } );

    webviewView.webview.onDidReceiveMessage( message => {
      switch ( message.command ) {
        case 'OPEN_CORE_LIB_SETTINGS': {
          vscode.commands.executeCommand( 'workbench.action.openSettings', 'mxtsDesignTools.coreLibLocation' );
          break;
        }
        case 'OPEN_BASE_REM_SETTINGS': {
          vscode.commands.executeCommand( 'workbench.action.openSettings', 'mxtsDesignTools.baseREMValue' );
          break;
        }
        case "RELOAD_CONFIG": {
          try {
            setAppConfig( true );
            vscode.window.showInformationMessage( 'The data from core library was reloaded successfully!' );
          } catch ( error ) {
            vscode.window.showErrorMessage( 'An unexpected error occurred while loading data from core library!' );
          }
          break;
        }
        case "OPEN_NON_EXACT_TO_REM_CALC": {
          vscode.commands.executeCommand( 'workbench.action.openSettings', 'mxtsDesignTools.nonExactTokenToRemCalc' );
          break;
        }
      }
    } );

    webviewView.webview.html = getWebViewContent( webviewView.webview, this._extensionUri );

    //To set the initial state
    this.postCommonMessagesToWebView( webviewView, appConfig.value );

    //to restore the state when the webview is closed and then reopened
    webviewView.onDidChangeVisibility( () => {
      if ( webviewView.visible ) {
        this.postCommonMessagesToWebView( webviewView, appConfig.value );
      }
    } );
  }

  postCommonMessagesToWebView( webView: vscode.WebviewView, args: { [ key: string ]: string } ) {
    webView.webview.postMessage( { command: 'UPDATE_CORE_LIB_LOCATION', args: args[ APP_CONFIG_KEYS.CORE_LIB_LOCATION ] } );
    webView.webview.postMessage( { command: 'UPDATE_CORE_LIB_VALID', args: args[ APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION ] } );
    webView.webview.postMessage( { command: "UPDATE_BASE_REM", args: args[ APP_CONFIG_KEYS.BASE_REM_VALUE ] } );
    webView.webview.postMessage( { command: "UPDATE_NON_EXACT_TOKEN_TO_REM_CALC", args: args[ APP_CONFIG_KEYS.NON_EXACT_TOKEN_TO_REM_CALC ] } );
  }

}