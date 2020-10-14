import { CompletionItem, CompletionItemKind } from 'vscode'

export const file: CompletionItem[] = [
	{
		kind: CompletionItemKind.Function,
		label: 'close',
		detail: 'close()',
		documentation: 'Closes the open file, if any.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'exists',
		detail: 'exists(filename)',
		documentation: 'Determines whether the specified file exists.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'flush',
		detail: 'flush()',
		documentation: 'Flushes any pending writes to the file system, ensuring no data is lost on a restart. Closing the open file using [\'file.close()\'](#fileclose) performs an implicit flush as well.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'format',
		detail: 'format()',
		documentation: 'Format the file system. Completely erases any existing file system and writes a new one. Depending on the size of the flash chip in the ESP, this may take several seconds.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'fscfg',
		detail: 'fscfg()',
		documentation: 'Returns the flash address and physical size of the file system area, in bytes.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'fsinfo',
		detail: 'fsinfo()',
		documentation: 'Return size information for the file system, in bytes.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'list',
		detail: 'list()',
		documentation: 'Lists all files in the file system.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'open',
		detail: 'open(filename, mode)',
		documentation: 'Opens a file for access, potentially creating it (for write modes).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'read',
		detail: 'read([n_or_str])',
		documentation: 'Read content from the open file.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'readline',
		detail: 'readline()',
		documentation: 'Read the next line from the open file. Lines are defined as zero or more bytes ending with a EOL (\'\n\') byte. If the next line is longer than \'LUAL_BUFFERSIZE\', this function only returns the first \'LUAL_BUFFERSIZE\' bytes (this is 1024 bytes by default).',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'remove',
		detail: 'file.remove(filename)',
		documentation: 'Remove a file from the file system. The file must not be currently open.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'rename',
		detail: 'rename(oldname, newname)',
		documentation: 'Renames a file. If a file is currently open, it will be closed first.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'seek',
		detail: 'seek([whence [, offset]])',
		documentation: 'Sets and gets the file position, measured from the beginning of the file, to the position given by offset plus a base specified by the string whence.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'write',
		detail: 'write(string)',
		documentation: 'Write a string to the open file.',
	},
	{
		kind: CompletionItemKind.Function,
		label: 'writeline',
		detail: 'writeline(string)',
		documentation: 'Write a string to the open file and append \'\n\' at the end.',
	},
]
