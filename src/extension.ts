// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ValueToSpacingTokenProvider } from './widgets/value-to-spacing-token/value-to-spacing-provider';

const WIDGET_PROVIDERS: [ { [ provider: string ]: ( uri: vscode.Uri ) => vscode.WebviewViewProvider } ] = [
	{
		[ ValueToSpacingTokenProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ValueToSpacingTokenProvider( extensionUri )
	}
];


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate( context: vscode.ExtensionContext ) {
	( WIDGET_PROVIDERS ).forEach( ( obj ) => {
		const [ [ key, provider ] ] = Object.entries( obj );
		context.subscriptions.push( vscode.window.registerWebviewViewProvider( key, provider( context.extensionUri ) ) );
	} );

}

// This method is called when your extension is deactivated
export function deactivate() { }


