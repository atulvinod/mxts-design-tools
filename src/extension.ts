// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ValueToSpacingTokenProvider } from './widgets/value-to-spacing-token-widget/value-to-spacing-provider';
import { ConfigProvider } from './widgets/config-widget/config-provider';
import * as  appConfig from './lib/config';
import * as utils from './utils';

const WIDGET_PROVIDERS: { [ provider: string ]: ( uri: vscode.Uri ) => vscode.WebviewViewProvider } =
{
	[ ValueToSpacingTokenProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ValueToSpacingTokenProvider( extensionUri ),
	[ ConfigProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ConfigProvider( extensionUri )
};


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate( context: vscode.ExtensionContext ) {

	setAppConfig();
	vscode.workspace.onDidChangeConfiguration( ( event ) => {
		if ( event.affectsConfiguration( 'mxtsDesignTools' ) ) {
			setAppConfig();
		}
	} );


	Object.entries( WIDGET_PROVIDERS ).forEach( ( [ key, provider ] ) => {
		context.subscriptions.push( vscode.window.registerWebviewViewProvider( key, provider( context.extensionUri ) ) );
	} );
}

function setAppConfig() {
	const appSettings = vscode.workspace.getConfiguration( 'mxtsDesignTools', null );
	const coreLibLocation = appSettings.get( 'coreLibLocation' );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.CORE_LIB_LOCATION, coreLibLocation );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION, utils.validatePathForCoreLib( coreLibLocation as string ) );
}

// This method is called when your extension is deactivated
export function deactivate() { }


