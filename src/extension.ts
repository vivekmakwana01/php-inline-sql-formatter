// src/extension.ts
import * as vscode from 'vscode';
import { format } from 'sql-formatter';

let outputChannel: vscode.OutputChannel | undefined;

export function activate(context: vscode.ExtensionContext) {
    if (!outputChannel) {
        outputChannel = vscode.window.createOutputChannel('SQL Formatter');
    }

    let disposable = vscode.commands.registerCommand('extension.formatSqlInPhp', () => {
        const editor = vscode.window.activeTextEditor;
        if (!editor) return;

        const document = editor.document;
        const selection = editor.selection;
        const line = document.lineAt(selection.active.line);
        const lineText = line.text;

        console.log('Original line text:', lineText);
        outputChannel?.appendLine('Original line text: ' + lineText);

        // Match SQL in string (double or single quotes)
        const match = lineText.match(/=\s*(["'])(.+?)\1;/);
        if (match && match[2]) {
            const quote = match[1];
            const sql = match[2];

            console.log('Detected SQL:', sql);
            outputChannel?.appendLine('Detected SQL: ' + sql);

            const formattedSql = format(sql, {
                language: 'sql',
                keywordCase: 'upper',
                tabWidth: 4,
                paramTypes: {
                    named: [':']
                }
            });

            console.log('Formatted SQL:', formattedSql);
            outputChannel?.appendLine('Formatted SQL:\n' + formattedSql);

            const baseIndent = lineText.match(/^(\s*)/)?.[1] || '';
            const extraIndent = '    ';

            const indentedSql = formattedSql
                .split('\n')
                .map(line => baseIndent + extraIndent + line)
                .join('\n') + '\n' + baseIndent;

            const newPhp = `${lineText.split('=')[0]}= ${quote}\n${indentedSql}${quote};`;

            editor.edit(editBuilder => {
                editBuilder.replace(line.range, newPhp);
            });

            vscode.window.showInformationMessage('SQL formatted successfully.');
            outputChannel?.appendLine('SQL formatted and replaced in editor.');
            outputChannel?.show(true);
        } else {
            vscode.window.showInformationMessage('No SQL string found on this line.');
            outputChannel?.appendLine('No SQL string found on this line.');
            outputChannel?.show(true);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() {}
