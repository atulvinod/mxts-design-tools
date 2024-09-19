import * as vscode from 'vscode';
import { getNonce } from '../../utils';

export function getUnConfiguredContent( webview: vscode.Webview, extensionUri: vscode.Uri ) {
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