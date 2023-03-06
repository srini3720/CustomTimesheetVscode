// The module 'vscode' contains the VS Code extensibility API
// Import the module and reference it with the alias vscode in your code below
const vscode = require('vscode');
const axios = require('axios');


let Gitlabtoken;


// This method is called when your extension is activated
// Your extension is activated the very first time the command is executed

/**
 * @param {vscode.ExtensionContext} context
 */
function activate(context) {

	const config = vscode.workspace.getConfiguration('timesheet');
	Gitlabtoken = config.get('personalAccessToken');
	
	let setToken = vscode.commands.registerCommand("timesheet.setGitlabToken",function() {
		vscode.window.showInputBox({
			prompt: 'Enter your GitLab personal access token Will be required only Once :)',
			password: true
		}).then((input) => {
			if (input) {
				// Store the personal access token in the extension settings
				config.update('personalAccessToken', input, true);
				Gitlabtoken = input;
				vscode.window.showInformationMessage('Gitlab personal Token had Set :)');
			} else {
				vscode.window.showErrorMessage('No personal access token entered. The Timesheet extension will not work without a personal access token.');
			}
		});
	})
	// Use the console to output diagnostic information (console.log) and errors (console.error)
	// This line of code will only be executed once when your extension is activated
	console.log('Congratulations, your extension "timesheet" is now active!');

		if (!Gitlabtoken) {
			// Prompt the user to enter their personal access token
			vscode.window.showInputBox({
				prompt: 'Enter your GitLab personal access token Will be required only Once :)',
				password: true
			}).then((input) => {
				if (input) {
					// Store the personal access token in the extension settings
					config.update('personalAccessToken', input, true);
					Gitlabtoken = input;
					vscode.window.showInformationMessage('Gitlab personal Token had Set :)');
				} else {
					vscode.window.showErrorMessage('No personal access token entered. The Timesheet extension will not work without a personal access token.');
				}
			});
		}

	// The command has been defined in the package.json file
	// Now provide the implementation of the command with  registerCommand
	// The commandId parameter must match the command field in package.json
	let disposable = vscode.commands.registerCommand('timesheet.helloWorld', function () {
		// The code you place here will be executed every time your command is executed

		// Display a message box to the user
		vscode.window.showInformationMessage('Hello World from Timesheet!');
	});

	let addTimeEntryCommand = vscode.commands.registerCommand('timesheet.addTimeEntry', async function () {
		try {
			const projectId = await vscode.window.showInputBox({
                prompt: 'Enter the ID of the Project to add a time entry for:'
            });
            // Get the issue ID from the user
            const issueId = await vscode.window.showInputBox({
                prompt: 'Enter the ID of the issue to add a time entry for:'
            });
			

            if (!issueId || !projectId) {
                // User cancelled the input box
                return;
            }

            // Get the time spent from the user
            const timeSpent = await vscode.window.showInputBox({ prompt: 'Enter the time spent (in Hour)' });

            if (!timeSpent) {
                // User cancelled the input box
                return;
            }
			const summary = await vscode.window.showInputBox({ prompt: 'Enter the Summary for the time Entry' });
            // Construct the URL for the time entries API
            const apiUrl = `https://gitlab.com/api/v4/projects/${projectId}/issues/${issueId}/add_spent_time`;

            // Get the personal access token from the extension settings
            // const token = vscode.workspace.getConfiguration('timesheet').get('personalAccessToken');


            // Make the API call to add the time entry
            const response = await axios.post(apiUrl, {
                duration: timeSpent,
				summary:summary
            }, {
                headers: {
					'PRIVATE-TOKEN': Gitlabtoken,
					'Content-Type': 'application/json'
                }
            });


			console.log("api result ",response)
			vscode.window.showInformationMessage(`Time entry added for issue #${issueId}`);
        } catch (error) {
			console.log(`Error adding time entry: ${error.message}`)
            vscode.window.showErrorMessage(`Error adding time entry: ${error.message}`);
        }
		
	});

	context.subscriptions.push(setToken)
	context.subscriptions.push(disposable);
	context.subscriptions.push(addTimeEntryCommand);
}

// This method is called when your extension is deactivated
function deactivate() {}

module.exports = {
	activate,
	deactivate
}
