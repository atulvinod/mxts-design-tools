// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ValueToSpacingTokenProvider } from './widgets/value-to-spacing-token-widget/value-to-spacing-provider';
import { ConfigProvider } from './widgets/config-widget/config-provider';
import * as  appConfig from './lib/config';
import { ColorTokenFinderProvider } from './widgets/color-finder-widget/color-finder-provider';
import { AllTokensProvider } from './widgets/all-tokens-widget/provider';

const WIDGET_PROVIDERS: { [ provider: string ]: ( uri: vscode.Uri ) => vscode.WebviewViewProvider } =
{
	[ ValueToSpacingTokenProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ValueToSpacingTokenProvider( extensionUri ),
	[ ConfigProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ConfigProvider( extensionUri ),
	[ ColorTokenFinderProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ColorTokenFinderProvider( extensionUri ),
	[ AllTokensProvider.PROVIDER_ID ]: ( uri: vscode.Uri ) => new AllTokensProvider( uri )
};


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate( context: vscode.ExtensionContext ) {
	appConfig.checkTokenConfigDirectory();
	appConfig.setAppConfig();
	vscode.workspace.onDidChangeConfiguration( ( event ) => {
		if ( event.affectsConfiguration( 'mxtsDesignTools' ) ) {
			appConfig.setAppConfig();
		}
	} );


	//Add all widgets to the context subscription
	Object.entries( WIDGET_PROVIDERS ).forEach( ( [ key, provider ] ) => {
		context.subscriptions.push( vscode.window.registerWebviewViewProvider( key, provider( context.extensionUri ) ) );
	} );

	process.on( 'uncaughtException', ( reason: Error ) => {
		console.error( 'Uncaught exception', reason );
		let logFilePath = null;
		if ( reason instanceof Error ) {
			logFilePath = appConfig.createErrorLog( reason.stack || reason.message );
		}
		if ( !logFilePath ) {
			vscode.window.showErrorMessage( 'An unexpected error has occurred in Design tools' );
		} else {
			vscode.window.showErrorMessage( `An unexpected error has occurred in Design tools\nYou can find the logs at ${ logFilePath }` );
		}
	} );

}

export function deactivate() { }


