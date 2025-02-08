import * as vscode from 'vscode';
import { ValueToSpacingTokenProvider } from './widgets/value-to-spacing-token-widget/value-to-spacing-provider';
import { ConfigProvider } from './widgets/config-widget/config-provider';
import * as  appConfig from './lib/config';
import { ColorTokenFinderProvider } from './widgets/color-finder-widget/color-finder-provider';
import { AllTokensProvider } from './widgets/all-tokens-widget/provider';
import { RGBAValue } from './lib/utils';

const WIDGET_PROVIDERS: { [ provider: string ]: ( uri: vscode.Uri ) => vscode.WebviewViewProvider } =
{
	[ ValueToSpacingTokenProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ValueToSpacingTokenProvider( extensionUri ),
	[ ConfigProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ConfigProvider( extensionUri ),
	[ ColorTokenFinderProvider.PROVIDER_ID ]: ( extensionUri: vscode.Uri ) => new ColorTokenFinderProvider( extensionUri ),
	[ AllTokensProvider.PROVIDER_ID ]: ( uri: vscode.Uri ) => new AllTokensProvider( uri )
};

function getAutoCompleteCompletions( document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext, tokens: appConfig.AppConfigType ): vscode.CompletionItem[] | undefined {

	const linePrefix = document.lineAt( position ).text.substr( 0, position.character );
	const completions: vscode.CompletionItem[] = [];

	const spacingTokensMap = tokens[ appConfig.APP_CONFIG_KEYS.SPACING_TOKENS ];
	const radiusTokens = tokens[ appConfig.APP_CONFIG_KEYS.RADIUS_TOKENS ];

	const typographyMixins = tokens[ appConfig.APP_CONFIG_KEYS.TYPOGRAPHY_TOKENS ];
	const elevationMixins = tokens[ appConfig.APP_CONFIG_KEYS.ELEVATION_TOKENS ];
	const buttonStyleMixins = tokens[ appConfig.APP_CONFIG_KEYS.BUTTON_STYLE_TOKENS ];

	const colorTokens = tokens[ appConfig.APP_CONFIG_KEYS.COLOR_TOKENS ];
	const accentTokens = tokens[ appConfig.APP_CONFIG_KEYS.ACCENT_TOKENS ];

	if ( linePrefix.endsWith( '@include tokens.' ) ) {
		( [ ...typographyMixins, ...elevationMixins, ...buttonStyleMixins ] ).map( ( name: string ) => {
			const completion = new vscode.CompletionItem( `@include tokens.${ name }` );
			completion.kind = vscode.CompletionItemKind.Variable;
			completion.insertText = `.${ name }();`;
			completion.documentation = new vscode.MarkdownString( `Typography mixin of ${ name }` );
			completions.push( completion );
		} );

		return completions;
	}

	if ( linePrefix.endsWith( 'tokens.' ) ) {
		Object.entries( { ...spacingTokensMap, ...radiusTokens } ).map( ( [ name, value ] ) => {
			const completion = new vscode.CompletionItem( `tokens.${ name }` );
			completion.kind = vscode.CompletionItemKind.Variable;
			completion.insertText = `.${ name }`;
			completion.documentation = new vscode.MarkdownString( `Spacing token of ${ value }` );
			completions.push( completion );
		} );

		Object.entries( { ...(colorTokens.lightTheme), ...(accentTokens.lightTheme) } ).map( ( [ name, obj ] ) => {
			const completion = new vscode.CompletionItem( `tokens.${ name }` );
			completion.kind = vscode.CompletionItemKind.Variable;
			completion.insertText = `.${ name }`;	
		  completion.documentation = new vscode.MarkdownString(`Color token of ${ ( obj as RGBAValue )!.original.toUpperCase() } `);
			completions.push( completion );
		} );

		return completions;
	}

	return undefined;
}

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


	let isCompletionProviderPushed = false;
	appConfig.appConfig.subscribe( ( values ) => {
		if ( values.IS_TOKEN_CONFIG_LOADED ) {

			const provider = vscode.languages.registerCompletionItemProvider( {
				scheme: 'file',
				language: 'scss'
			}, {
				provideCompletionItems( document: vscode.TextDocument, position: vscode.Position, token: vscode.CancellationToken, context: vscode.CompletionContext ) {
					return getAutoCompleteCompletions( document, position, token, context, values );
				}
			} );

			if ( !isCompletionProviderPushed ) {
				context.subscriptions.push( provider );
			}
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


