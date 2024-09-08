// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import { ValueToSpacingTokenProvider } from './widgets/value-to-spacing-token-widget/value-to-spacing-provider';
import { ConfigProvider } from './widgets/config-widget/config-provider';
import * as  appConfig from './lib/config';
import * as utils from './utils';
import * as os from 'os';
import * as path from 'path';
import * as fs from 'fs';
import { parseTokens } from './lib/token-parser';

const WIDGET_PROVIDERS: { [ provider: string ]: ( uri: vscode.Uri ) => vscode.WebviewViewProvider } =
{
	[ ValueToSpacingTokenProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ValueToSpacingTokenProvider( extensionUri ),
	[ ConfigProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ConfigProvider( extensionUri )
};

const TOKEN_CONFIG_PATH = path.join( os.homedir(), '.mxts-design-tools', 'token-config.json' );

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate( context: vscode.ExtensionContext ) {
	checkTokenConfigDirectory();
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
	const baseREMValue = appSettings.get( 'baseREMValue' );
	const isValidCoreLibLocation = utils.validatePathForCoreLib( coreLibLocation as string );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.CORE_LIB_LOCATION, coreLibLocation );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION, isValidCoreLibLocation );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.IS_TOKEN_CONFIG_LOADED, false );
	appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.BASE_REM_VALUE, baseREMValue );

	if ( isValidCoreLibLocation ) {
		let tokenData = getDataFromTokenConfig();
		if ( !tokenData || !Object.keys( tokenData ).length ) {
			const parsedTokenData = parseTokens( coreLibLocation as string );
			saveDataToTokenConfig( parsedTokenData );
			tokenData = parsedTokenData;
		}
		appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.SPACING_TOKENS, tokenData );
		appConfig.updateAppConfig( appConfig.APP_CONFIG_KEYS.IS_TOKEN_CONFIG_LOADED, true );
	}
}


function checkTokenConfigDirectory() {
	const homeDir = os.homedir();
	const configDir = path.join( homeDir, '.mxts-design-tools' );
	if ( !fs.existsSync( configDir ) ) {
		fs.mkdirSync( configDir, { recursive: true } );
	}

	const configFile = path.join( configDir, 'token-config.json' );
	if ( !fs.existsSync( configFile ) ) {
		fs.writeFileSync( configFile, '{}', 'utf-8' );
	}
}

function getDataFromTokenConfig() {
	if ( !fs.existsSync( TOKEN_CONFIG_PATH ) ) {
		return {};
	}
	const data = fs.readFileSync( TOKEN_CONFIG_PATH, 'utf-8' );

	try {
		const parsedData = JSON.parse( data );
		return parsedData;
	} catch ( error ) {
		console.error( 'Failed to parse config file ', error );
		return {};
	}
}

function saveDataToTokenConfig( data: Object ) {
	if ( fs.existsSync( TOKEN_CONFIG_PATH ) ) {
		fs.writeFileSync( TOKEN_CONFIG_PATH, JSON.stringify( data ), 'utf-8' );
	}
}

// This method is called when your extension is deactivated
export function deactivate() { }


