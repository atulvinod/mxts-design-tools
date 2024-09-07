// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
import * as vscode from 'vscode';
import * as fs from 'fs';
import *as path from 'path';

// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed
export function activate( context: vscode.ExtensionContext ) {

	const webviewProvider = new MyWebviewProvider();

	context.subscriptions.push( vscode.window.registerWebviewViewProvider( 'design-tools', webviewProvider ) );

}

// This method is called when your extension is deactivated
export function deactivate() { }


function getWebViewContent() {
	return fs.readFileSync( path.join( __dirname, '..', 'webviews', 'testView.html' ), 'utf-8' );
}


class MyWebviewProvider implements vscode.WebviewViewProvider {

	resolveWebviewView( webviewView: vscode.WebviewView, context: vscode.WebviewViewResolveContext, token: vscode.CancellationToken ): Thenable<void> | void {
		webviewView.webview.html = getWebViewContent();
	}

}