# PHP Inline SQL Formatter

A simple VSCode extension to format inline SQL queries written as strings in PHP files.

## Features

- Detects SQL queries in PHP string assignments
- Uses `sql-formatter` to format SQL
- Works on selected line via command palette

## Usage

1. Open a PHP file with inline SQL.
2. Place the cursor on the line with the SQL string.
3. Open Command Palette (`Ctrl+Shift+P`), run **Format SQL in PHP Line**.

## Example

### Before

```php
$select = "SELECT id, name FROM users WHERE active = 1 ORDER BY id DESC";
```

## Commands to build

```npm
npm run compile
```

```npm
vsce package
```