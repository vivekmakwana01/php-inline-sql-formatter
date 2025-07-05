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

        const options = editor.options;
        const useTabs = options.insertSpaces === false;
        const tabSize = Number(options.tabSize);

        const document = editor.document;
        const selection = editor.selection;
        const selectedLineText = document.getText(selection);

        console.log("selected ==> ", selectedLineText);

        // Match SQL in string (double or single quotes)
        const match = selectedLineText.match(/=\s*(["'])([\s\S]+?)\1;/m);
        if (match && match[2]) {
            const quote = match[1];
            let sql = match[2];

            console.log('Detected SQL:', sql);

            // Step 1: Replace {$var} with placeholders
            const varMap: Record<string, string> = {};
            let varIndex = 0;
            sql = sql.replace(/\{\$[a-zA-Z0-9_]+\}/g, (match) => {
                const key = `___PLACEHOLDER_${varIndex++}___`;
                varMap[key] = match;
                return key;
            });

            // Step 2: Format using sql-formatter
            const formattedSql = format(sql, {
                language: 'sql',
                keywordCase: 'upper',
                tabWidth: 4,
                paramTypes: {
                    named: [':']
                }
            });

            // Step 3: Restore original curly-brace variables
            const restoredSql = Object.entries(varMap).reduce((sql, [key, original]) => {
                return sql.replace(new RegExp(key, 'g'), original);
            }, formattedSql);

            console.log('Formatted SQL:', restoredSql);

            // Step 4: Rebuild PHP line with indentation
            const baseIndent = selectedLineText.match(/^(\s*)/)?.[1] || '';
            const extraIndent = useTabs ? '\t' : ' '.repeat(tabSize);

            const indentedSql = restoredSql
                .split('\n')
                .map(line => baseIndent + extraIndent + line)
                .join('\n') + '\n' + baseIndent;

            const newPhp = `${selectedLineText.split('=')[0]}= ${quote}\n${indentedSql}${quote};`;

            editor.edit(editBuilder => {
                editBuilder.replace(selection, newPhp);
            });

            vscode.window.showInformationMessage('SQL formatted successfully.');
        } else {
            vscode.window.showInformationMessage('No SQL string found on this line.');
            outputChannel?.appendLine('No SQL string found on this line.');
            outputChannel?.show(true);
        }
    });

    context.subscriptions.push(disposable);
}

export function deactivate() { }
