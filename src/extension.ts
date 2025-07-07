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

        let sql = '';
        let quote: string | null = null;
        let prefix = '';
        let suffix = '';

        const phpMatch = selectedLineText.match(/^(.*?)=\s*(["'])([\s\S]+?)\2;?$/m);
        if (phpMatch) {
            console.log("phpMatch ==> ", phpMatch);
            quote = phpMatch[2]; 
            sql = phpMatch[3];
            prefix = phpMatch[1] + '= ' + quote + '\n';
            suffix = quote + ';';
        } else {
            console.log("else ==> ");
            const quoteMatch = selectedLineText.match(/^["']([\s\S]+?)["']$/m);
            if (quoteMatch) {
                sql = quoteMatch[1];
                quote = selectedLineText[0];
                prefix = quote + '\n';
                suffix = quote + ';';
            } else {
                sql = selectedLineText.trim();
                prefix = '\r';
                suffix = '';
            }
        }

        if (sql !== '') {
            console.log('Detected SQL:', sql);

            const varMap: Record<string, string> = {};
            let varIndex = 0;
            sql = sql.replace(/\{\$[a-zA-Z0-9_]+\}/g, (match) => {
                const key = `___PLACEHOLDER_${varIndex++}___`;
                varMap[key] = match;
                return key;
            });

            const formattedSql = format(sql, {
                language: 'sql',
                keywordCase: 'upper',
                tabWidth: 4,
                paramTypes: {
                    named: [':']
                }
            });

            const restoredSql = Object.entries(varMap).reduce((sql, [key, original]) => {
                return sql.replace(new RegExp(key, 'g'), original);
            }, formattedSql);

            console.log('Formatted SQL:', restoredSql);

            const baseIndent = selectedLineText.match(/^(\s*)/)?.[1] || '';
            const extraIndent = useTabs ? '\t' : ' '.repeat(tabSize);

            const indentedSql = restoredSql
                .split('\n')
                .map(line => baseIndent + extraIndent + line)
                .join('\n') + '\n' + baseIndent;

            console.log('Indented SQL:', indentedSql);

            const newPhp = `${prefix}${indentedSql}${suffix}`;

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
