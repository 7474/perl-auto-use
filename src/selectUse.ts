import * as vscode from 'vscode';

import { DB, ImportObject } from './db';

import { AutoUseContext } from './autoUseContext';
import { UseBuilder } from './useBuilder';

const COMMAND_INSERT_SELECT_USE = 'extension.insertSelectUse';

export class SelectUse extends UseBuilder implements vscode.CodeActionProvider {
    public static readonly providedCodeActionKinds = [
        vscode.CodeActionKind.QuickFix
    ];

    constructor(context: AutoUseContext) {
        super(context);

        const insertSelectUseCommand = vscode.commands.registerCommand(COMMAND_INSERT_SELECT_USE, (importObjects: ImportObject[]) => {
            this.insertUseStatementByImportObjects(importObjects);
        });

        context.extensionContext.subscriptions.push(insertSelectUseCommand);
    }

    public provideCodeActions(document: vscode.TextDocument, selection: vscode.Selection, ctx: vscode.CodeActionContext): vscode.Command[] | undefined {
        const selectText = document.getText(selection);
        const importObjects = DB.findByName(selectText);
        if (importObjects.length <= 1) { return; }
        return this.actionHandler(importObjects);
    }

    private actionHandler(importObjects: ImportObject[]): vscode.Command[] {
        return importObjects.map(io => {
            const command: vscode.Command = {
                title: `$import ${io.name} from ${io.packageName}`,
                command: COMMAND_INSERT_SELECT_USE,
                arguments: [[io]]
            };
            return command;
        });
    }
}