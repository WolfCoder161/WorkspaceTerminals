import * as vscode from 'vscode';
import * as path from 'path';

interface TerminalConfig {
	name: string;
	icon?: string;
	color?: string;
	workingDir: string;
	shellPath: string;
	shellArgs?: string[];
}

interface ActivityBarButtonConfig {
	display: boolean;
	position: "left" | "right";
}

function fetchTerminalConfig(): TerminalConfig[] {
	const config = vscode.workspace.getConfiguration('workspaceTerminals');
	return config.get<TerminalConfig[]>('terminals') || [];
}

function fetchActivityBarConfig(): ActivityBarButtonConfig {
	const config = vscode.workspace.getConfiguration('workspaceTerminals');
	const display = config.get<boolean>('activityBarButton') ?? false;
	const position = config.get<'left' | 'right'>('activityBarButtonPosition') ?? "right";
	return { display, position };
}

function resolveWorkingDir(workingDir: string): string | undefined {
	if (!workingDir) { return undefined; }
	if (path.isAbsolute(workingDir)) { return workingDir; }

	const workspaceFolders = vscode.workspace.workspaceFolders;
	if (!workspaceFolders) { return undefined; }

	const matchingFolder = workspaceFolders.find(folder => folder.name === workingDir);
	
	if (matchingFolder) { return matchingFolder.uri.fsPath; }

	return path.join(workspaceFolders[0].uri.fsPath, workingDir);
}

function isTerminalOpen(name: string): boolean {
	return vscode.window.terminals.some(terminal => terminal.name === name);
}

function createTerminal(config: TerminalConfig): void {
	const workingDir = resolveWorkingDir(config.workingDir);
	const terminalOptions: vscode.TerminalOptions = {
		name: config.name,
		cwd: workingDir,
		shellPath: config.shellPath,
		shellArgs: config.shellArgs,
		iconPath: config.icon ? new vscode.ThemeIcon(config.icon) : undefined,
		color: config.color ? new vscode.ThemeColor(config.color) : undefined
	};
	const terminal = vscode.window.createTerminal(terminalOptions);
	terminal.show();
}

function launchTerminals(manuallyInvoked: boolean = false): void {
	const configs = fetchTerminalConfig();

	if (!vscode.workspace.workspaceFolders || configs.length === 0){
		if (manuallyInvoked){
			vscode.window.showWarningMessage('Workspace Terminals: No Workspace Terminals configurations found.');
		}
		return;

	}

	

		
		let terminalsOpened = 0;
		for (const config of configs) {
			if (!isTerminalOpen(config.name)) {
				createTerminal(config);
				terminalsOpened += 1;
			}
		}

		if (configs.length > 0 && terminalsOpened === 0) {
			vscode.window.showInformationMessage('Workspace Terminals: All workspace terminals are already open.');
		}
		else if (terminalsOpened >= 0) {
			vscode.window.showInformationMessage(`Workspace Terminals: Opened ${terminalsOpened} terminal${terminalsOpened === 1 ? '' : 's'}.`);
		}
	}

	

	



export function activate(context: vscode.ExtensionContext): void {

	launchTerminals();

	const disposableManuallyInvokedCommand = vscode.commands.registerCommand('workspaceTerminals.launchTerminals', () => { launchTerminals(true); });
	context.subscriptions.push(disposableManuallyInvokedCommand);

	const activityBarConfig = fetchActivityBarConfig();

	if (activityBarConfig.display) {
		const position = activityBarConfig.position === "right" ? vscode.StatusBarAlignment.Right : vscode.StatusBarAlignment.Left;
		const statusBarItem = vscode.window.createStatusBarItem(position, 100);
		statusBarItem.text = '$(workplace-terminals-icon-2)';
		statusBarItem.command = 'workspaceTerminals.launchTerminals';
		statusBarItem.show();

		context.subscriptions.push(statusBarItem);
	}



}

export function deactivate(): void {

}