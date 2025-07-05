# SQL Formatter for PHP

A lightweight Visual Studio Code extension that formats SQL queries inside PHP string assignments.

Perfect for PHP developers who write long SQL queries and want clean formatting.

---

## ✨ Features

- ✅ Format SQL assigned to PHP variables like `$sql = "..."` or `$query = '...'`
- ✅ Supports **multi-line SQL strings**
- ✅ Respects your editor's **indentation settings** (tabs or spaces)
- ✅ Automatically **preserves curly-brace variables** like `{$table_name}`
- ✅ Safe and smart re-indentation after formatting

---

## 📸 Demo

> Coming soon! 

---

## 🚀 How to Use

1. Select the line (or lines) containing your SQL string inside PHP code:

```php
$select = "SELECT id, name FROM users WHERE active = 1 ORDER BY id DESC";
```

### After

```php
$select = "
  SELECT 
    id, name 
  FROM 
    users 
  WHERE 
    active = 1
  ORDER BY 
    id DESC
";
```

## Commands to build

```npm
npm run compile
```

```npm
vsce package
```