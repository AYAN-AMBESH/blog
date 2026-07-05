import { useState, useEffect, useRef } from 'react'
import DOMPurify from 'dompurify'
import { allPosts } from '../lib/blogs.js'
import { usePageSeo } from '../lib/seo.js'
import './TerminalPage.css'

// Hex ciphertext of decrypted contact details (RC4 encrypted with SHA256 key)
const CONTACT_CIPHERTEXT = "1c8560ebcc65c38f84277139860d824c8df8c652ac3e3fb36096fc8c803b04e7cee3eb6048968d7c6b3dd751fcf92cdb8ce1aa063ae3425f89dc570142d6137f87ecb5b335f1dea38edf5a8767130eca7ae1fa46b92bf5b57eac3f0abb068056024e6fdb174e204bfa7ee3a71b156e71f1e7633362a0d107fd717c6a73627270180bbd571afa61ddafada3d261e8b9d124530b0ce49822b05895ff8d1df76ba03e2f57"

const INITIAL_FS = {
  bin: {
    "cat": "prints the content of a file", 
    "ls": "list all the files in the directory", 
    "pwd": "prints the current directory", 
    "cd": "changes directory", 
    "write": "writes to a file", 
    "clear": "clears the screen",
    "theme": "changes the terminal theme (cozy/light/classic)",
    "neofetch": "prints system profile info",
    "blog": "lists or reads blog posts",
    "skills": "lists technical skill set",
    "help": "displays this help menu",
    "xxd": "hexdump files",
    "strings": "find printable strings in files",
    "sha256sum": "compute SHA-256 checksum",
    "decrypt": "decrypt encrypted files using a key",
    "base64": "encode/decode base64 data"
  },
  home: {
    ambesh: {
      "about_me.txt": atob("TXkgbmFtZSBpcyBBeWFuIEFtYmVzaCBhbmQgaW0ga25vd24gYnkgbWFueSBuYW1lcywgd2hva2lsbGVkdHVscGEgKGN1cnJlbnQgdXNlcm5hbWUpIApsaW5rOiA8YSB0YXJnZXQ9J19ibGFuaycgaHJlZj0nL3Jlc3VtZSc+UmVzdW1lPC9hPg=="),
      "status.txt": atob("SSBhbSBhIHN0dWRlbnQgc3R1ZHlpbmcgRGlnaXRhbCBGb3JlbnNpY3MgYW5kIEluZm9ybWF0aW9uIFNlY3VyaXR5IGF0IE5GU1UgRGVsaGkuIApJIGxvdmUgbXVsdGlwbGF5ZXIgZ2FtZXMgYW5kIGNvZGluZy4gCkkgYWxzbyBwbGF5IENURnMgaW4gbXkgZnJlZSB0aW1lLg=="),
      "contact_me.txt": atob("bm90IHJuIGltIGJ1c3ksIGprIGNoZWNrIC9ldGMvY29udGFjdC50eHQgZm9yIGZ1cnRoZXIgZGV0YWlscw=="),
    }
  },
  etc: {
    "contact.txt": atob("WyFdIEVSUk9SOiBldGMvY29udGFjdC50eHQgaXMgZW5jcnlwdGVkIHVzaW5nIFJDNCAoaGV4IGVuY29kZWQpLgpUbyBkZWNyeXB0IHRoaXMgZmlsZSwgeW91IG11c3QgZmluZCB0aGUgMjU2LWJpdCBkZWNyeXB0aW9uIGtleS4KCi0tLSBGT1JFTlNJQyBJTlRFTCAtLS0KQW4gYXV0b21hdGVkIGJhY2t1cCBzY3JpcHQgd2FzIHJ1bm5pbmcgd2hlbiB0aGlzIHN5c3RlbSB3YXMgY29tcHJvbWlzZWQuClBlcmhhcHMgdGhlIGJhY2t1cCBzY3JpcHQgbGVmdCBzb21lIHRyYWNlcyBpbiB0aGUgc3lzdGVtIGxvZ3Mgb3IgcHJvY2VzcyB0cmVlPwpFeHBsb3JlIHRoZSBmaWxlc3lzdGVtICgvdmFyL2xvZywgL29wdCwgL2RldikgdG8gZmluZCBjbHVlcy4KVXNlICdoZWxwJyB0byBzZWUgdGhlIGRpYWdub3N0aWMgZm9yZW5zaWMgdG9vbHMgYXZhaWxhYmxlIG9uIHRoaXMgdGVybWluYWwuCk9uY2UgeW91IGZpbmQgdGhlIGtleSwgcnVuOgogICAgZGVjcnlwdCBldGMvY29udGFjdC50eHQgW2tleV0KLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0="),
  },
  opt: {
    backup: {
      "backup.sh": atob("IyEvYmluL2Jhc2gKIyBCYWNrdXAgY3JpdGljYWwgY29uZmlndXJhdGlvbiBhbmQgY29udGFjdCBpbmZvCiMgV0FSTklORzogRG8gbm90IGV4cG9zZSB0aGUgcGFzc3BocmFzZSEKIyBUaGUgcGFzc3BocmFzZSBpcyBjb25zdHJ1Y3RlZCBkeW5hbWljYWxseSB1c2luZzoKIyBTSEEyNTYgb2YgdGhlIGtlcm5lbCBtZW1vcnkgYnVmZmVyIGJsb2NrIGF0IG9mZnNldCAweDQwMCAobGVuZ3RoIDY0IGJ5dGVzKQojIGNvbWJpbmVkIHdpdGggdGhlIHZhbHVlIG9mIHRoZSBlbnZpcm9ubWVudCB2YXJpYWJsZSAu"),
    }
  },
  var: {
    log: {
      "syslog": atob("SnVsICA1IDIwOjI1OjAxIHR1bHBhb3MgQ1JPTlsxMjA0XTogKHJvb3QpIENNRCAoL29wdC9iYWNrdXAvYmFja3VwLnNoKQpKdWwgIDUgMjA6MjU6MDIgdHVscGFvcyBiYWNrdXAuc2hbMTIwNV06IFN0YXJ0aW5nIGF1dG9tYXRlZCBiYWNrdXAuLi4KSnVsICA1IDIwOjI1OjAyIHR1bHBhb3MgYmFja3VwLnNoWzEyMDVdOiBSZWFkaW5nIDY0IGJ5dGVzIGZyb20gbWVtb3J5IGJ1ZmZlciBhdCBvZmZzZXQgMHg0MDAuLi4KSnVsICA1IDIwOjI1OjAzIHR1bHBhb3MgYmFja3VwLnNoWzEyMDVdOiBCYWNrdXAgZW5jcnlwdGVkLiBTYWx0IHVzZWQgZnJvbSBlbnZpcm9ubWVudCB2YXJpYWJsZS4KSnVsICA1IDIwOjI1OjAzIHR1bHBhb3MgYmFja3VwLnNoWzEyMDVdOiBCYWNrdXAgb3V0cHV0IHNhdmVkIHRvIC9ldGMvY29udGFjdC50eHQu"),
    }
  },
  dev: {
    "mem_dump": atob("AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAHRoZV90dWxwYV93YXNfbmV2ZXJfa2lsbGVkX2l0X2xpdmVzX2luX3RoZV9tYWNoaW5lX2ZvcmV2ZXJfMTMzNyEAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA")
  }
}

// Pure JS SHA-256 implementation
function sha256(ascii) {
  function rightRotate(value, amount) {
    return (value >>> amount) | (value << (32 - amount));
  }
  
  var mathPow = Math.pow;
  var maxWord = mathPow(2, 32);
  var lengthProperty = 'length'
  var i, j;

  var result = '';
  var words = [];
  var asciiLength = ascii[lengthProperty];
  var hash = [];
  var k = [];
  var primeCounter = 0;

  var isComposite = {};
  for (var candidate = 2; primeCounter < 64; candidate++) {
    if (!isComposite[candidate]) {
      for (i = 0; i < 313; i += candidate) {
        isComposite[i] = 1;
      }
      hash[primeCounter] = (mathPow(candidate, .5)*maxWord)|0;
      k[primeCounter++] = (mathPow(candidate, 1/3)*maxWord)|0;
    }
  }
  
  ascii += '\x80'
  while (ascii[lengthProperty] % 64 - 56) ascii += '\x00'
  for (i = 0; i < ascii[lengthProperty]; i++) {
    j = ascii.charCodeAt(i);
    if (j >> 8) return '';
    words[i >> 2] |= j << (24 - (i % 4) * 8);
  }
  words[words[lengthProperty]] = ((asciiLength * 8) / maxWord) | 0;
  words[words[lengthProperty]] = (asciiLength * 8) | 0;
  
  for (j = 0; j < words[lengthProperty]; j += 16) {
    var w = words.slice(j, j + 16);
    var oldHash = hash.slice(0);
    
    for (i = 0; i < 64; i++) {
      var wItem = w[i];
      if (i >= 16) {
        var s0 = rightRotate(w[i - 15], 7) ^ rightRotate(w[i - 15], 18) ^ (w[i - 15] >>> 3);
        var s1 = rightRotate(w[i - 2], 17) ^ rightRotate(w[i - 2], 19) ^ (w[i - 2] >>> 10);
        wItem = w[i] = (w[i - 16] + s0 + w[i - 7] + s1) | 0;
      }
      
      var ch = (hash[4] & hash[5]) ^ (~hash[4] & hash[6]);
      var maj = (hash[0] & hash[1]) ^ (hash[0] & hash[2]) ^ (hash[1] & hash[2]);
      var sigma0 = rightRotate(hash[0], 2) ^ rightRotate(hash[0], 13) ^ rightRotate(hash[0], 22);
      var sigma1 = rightRotate(hash[4], 6) ^ rightRotate(hash[4], 11) ^ rightRotate(hash[4], 25);
      
      var temp1 = (hash[7] + sigma1 + ch + k[i] + wItem) | 0;
      var temp2 = (sigma0 + maj) | 0;
      
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.length = 8;
    }
    
    for (i = 0; i < 8; i++) {
      hash[i] = (hash[i] + oldHash[i]) | 0;
    }
  }
  
  for (i = 0; i < 8; i++) {
    var hex = (hash[i] >>> 0).toString(16);
    result += hex.padStart(8, '0');
  }
  
  return result;
}

// Pure JS RC4 decryption function
function rc4DecryptHex(key, hexStr) {
  const S = Array.from({ length: 256 }, (_, i) => i);
  let j = 0;
  for (let i = 0; i < 256; i++) {
    j = (j + S[i] + key.charCodeAt(i % key.length)) % 256;
    const temp = S[i];
    S[i] = S[j];
    S[j] = temp;
  }
  let i = 0;
  j = 0;
  let out = '';
  for (let k = 0; k < hexStr.length; k += 2) {
    const byteVal = parseInt(hexStr.substring(k, k + 2), 16);
    i = (i + 1) % 256;
    j = (j + S[i]) % 256;
    const temp = S[i];
    S[i] = S[j];
    S[j] = temp;
    const keyByte = S[(S[i] + S[j]) % 256];
    out += String.fromCharCode(byteVal ^ keyByte);
  }
  return out;
}

// Hex Dump helper
function runXxd(filename, fileContent) {
  let out = [];
  for (let i = 0; i < fileContent.length; i += 16) {
    let offset = i.toString(16).padStart(8, '0');
    let hexParts = [];
    let asciiParts = '';
    for (let j = 0; j < 16; j++) {
      if (i + j < fileContent.length) {
        let charCode = fileContent.charCodeAt(i + j);
        hexParts.push(charCode.toString(16).padStart(2, '0'));
        asciiParts += (charCode >= 32 && charCode <= 126) ? fileContent[i + j] : '.';
      } else {
        hexParts.push('  ');
      }
    }
    let hexFormatted = '';
    for (let k = 0; k < 16; k += 2) {
      let b1 = hexParts[k] || '  ';
      let b2 = hexParts[k+1] || '  ';
      hexFormatted += b1 + b2 + ' ';
    }
    out.push(`${offset}: ${hexFormatted} ${asciiParts}`);
  }
  return out.join('\n');
}

// Strings helper
function runStrings(fileContent) {
  let lines = [];
  let currentString = '';
  for (let i = 0; i < fileContent.length; i++) {
    let charCode = fileContent.charCodeAt(i);
    if (charCode >= 32 && charCode <= 126) {
      currentString += fileContent[i];
    } else {
      if (currentString.length >= 4) {
        lines.push(currentString);
      }
      currentString = '';
    }
  }
  if (currentString.length >= 4) {
    lines.push(currentString);
  }
  return lines.length > 0 ? lines.join('\n') : 'no printable strings found';
}

export function TerminalPage() {
  const [cwd, setCwd] = useState('home/ambesh')
  const [fs, setFs] = useState(INITIAL_FS)
  const [inputValue, setInputValue] = useState('')
  const [history, setHistory] = useState([])
  const [historyIndex, setHistoryIndex] = useState(-1)
  const [theme, setTheme] = useState('dark') // 'dark' | 'light' | 'classic'
  
  const [output, setOutput] = useState([
    { type: 'output', text: 'Ambash (build 2.0) initializing...done' },
    { type: 'output', text: 'starting TulpaOS...' },
    { type: 'output', text: '----------------------------------------' },
    { type: 'output', text: "Tulpa's Terminal Homepage" },
    { type: 'output', text: 'Try poking around the filesystem!' },
    { type: 'output', text: 'For help, run "help"' },
    { type: 'output', text: '----------------------------------------' }
  ])

  const consoleBodyRef = useRef(null)
  const inputRef = useRef(null)

  usePageSeo({
    title: 'Terminal',
    description: 'Interactive portfolio terminal. Browse projects, read blog posts, and explore the system.',
  })

  useEffect(() => {
    if (consoleBodyRef.current) {
      consoleBodyRef.current.scrollTop = consoleBodyRef.current.scrollHeight
    }
  }, [output])

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }, [])

  const focusInput = () => {
    const selectedText = window.getSelection().toString()
    if (selectedText) return
    if (inputRef.current) {
      inputRef.current.focus()
    }
  }

  const getCwdNode = (pathStr) => {
    if (pathStr === '') return fs
    const parts = pathStr.split('/')
    let current = fs
    for (const part of parts) {
      if (current && typeof current === 'object' && part in current) {
        current = current[part]
      } else {
        return null
      }
    }
    return current
  }

  const resolvePath = (targetPath) => {
    if (!targetPath) return { error: "no directory specified" }
    if (targetPath === "/") return { path: "" }

    const parts = targetPath.startsWith("/") 
      ? targetPath.split("/").filter(Boolean) 
      : [...cwd.split("/").filter(Boolean), ...targetPath.split("/").filter(Boolean)]
    
    const resolvedParts = []
    for (const part of parts) {
      if (part === ".") {
        continue
      }
      if (part === "..") {
        resolvedParts.pop()
      } else {
        resolvedParts.push(part)
      }
    }

    const targetNode = getCwdNode(resolvedParts.join("/"))
    if (!targetNode) {
      return { error: "directory not found" }
    }
    if (typeof targetNode !== 'object') {
      return { error: "not a directory" }
    }

    return { path: resolvedParts.join("/") }
  }

  const resolveFilePath = (targetPath) => {
    if (!targetPath) return { error: "no file specified" }
    
    const parts = targetPath.split('/')
    const filename = parts.pop()
    const parentPathStr = parts.join('/')
    
    let parentDir = cwd
    if (parentPathStr !== '') {
      const res = resolvePath(parentPathStr.startsWith('/') ? parentPathStr : (cwd ? cwd + '/' + parentPathStr : parentPathStr))
      if (res.error) {
        return { error: `path not found: ${res.error}` }
      }
      parentDir = res.path
    }
    
    const node = getCwdNode(parentDir)
    if (!node || typeof node !== 'object') {
      return { error: "directory not found" }
    }
    
    if (!(filename in node)) {
      return { error: "file not found" }
    }
    
    return { parentDir, filename, node }
  }

  const handleCommand = (rawCommand) => {
    const trimmed = rawCommand.trim()
    if (!trimmed) return

    const nextHistory = [...history, trimmed]
    setHistory(nextHistory)
    setHistoryIndex(-1)

    const newLines = [{ type: 'command', text: `$ ${trimmed}` }]

    // Pipeline parsing: supports pipes like echo -n "foo" | sha256sum or cat file | base64
    let cmdToRun = trimmed
    let pipedInput = null

    if (trimmed.includes('|')) {
      const parts = trimmed.split('|')
      const firstPart = parts[0].trim()
      const secondPart = parts[1].trim()

      if (firstPart.startsWith('echo -n ')) {
        const match = firstPart.match(/echo -n\s+["'](.*?)["']/)
        pipedInput = match ? match[1] : firstPart.substring(8).replace(/^["']|["']$/g, '').trim()
      } else if (firstPart.startsWith('echo ')) {
        const match = firstPart.match(/echo\s+["'](.*?)["']/)
        pipedInput = match ? match[1] : firstPart.substring(5).replace(/^["']|["']$/g, '').trim()
      } else {
        const firstArgs = firstPart.split(' ')
        const firstCmd = firstArgs[0].toLowerCase()
        if (firstCmd === 'cat' && firstArgs[1]) {
          const res = resolveFilePath(firstArgs[1])
          if (!res.error) {
            const val = res.node[res.filename]
            if (typeof val !== 'object') {
              pipedInput = val
            }
          }
        }
      }
      cmdToRun = secondPart
    }

    const args = cmdToRun.split(' ')
    const cmdName = args[0].toLowerCase()
    const params = args.slice(1)

    const currentFolder = getCwdNode(cwd)

    switch (cmdName) {
      case 'clear':
        setOutput([])
        return

      case 'help':
        newLines.push({
          type: 'output',
          text: `Available commands:
  cat [file]           : prints the content of a file
  ls [path]            : lists all the files/folders in the directory
  pwd                  : prints the current working directory
  cd [path]            : changes the directory
  write [file] [text]  : writes/creates a new file in the directory
  blog [list|read]     : lists blog posts or reads a blog post (e.g. blog read xss)
  skills               : lists technical skills
  neofetch             : prints system profile and info
  env                  : prints system environment variables
  xxd [file]           : displays a hex dump of the target file
  strings [file]       : displays printable character sequences in a file
  sha256sum [file|str] : computes the SHA-256 checksum of file or text
  base64 [-d] [file]   : encodes or decodes base64 data
  decrypt [file] [key] : decrypts a file using the decryption key
  theme [theme_name]   : sets theme to: dark, light, classic
  clear                : clears the screen`
        })
        break

      case 'pwd':
        newLines.push({ type: 'output', text: `/${cwd}` })
        break

      case 'ls': {
        let targetCwd = cwd
        if (params[0]) {
          const res = resolvePath(params[0])
          if (res.error) {
            newLines.push({ type: 'error', text: `ls: ${res.error}` })
            break
          }
          targetCwd = res.path
        }
        const node = getCwdNode(targetCwd)
        if (node && typeof node === 'object') {
          const keys = Object.keys(node)
          if (keys.length === 0) {
            newLines.push({ type: 'output', text: '(empty directory)' })
          } else {
            const listText = keys.map(k => {
              const subNode = node[k]
              return typeof subNode === 'object' ? `${k}/` : k
            }).join('   ')
            newLines.push({ type: 'output', text: listText })
          }
        } else {
          newLines.push({ type: 'error', text: 'ls: directory not found' })
        }
        break
      }

      case 'cd': {
        const pathParam = params[0] || '/'
        const res = resolvePath(pathParam)
        if (res.error) {
          newLines.push({ type: 'error', text: `cd: ${res.error}` })
        } else {
          setCwd(res.path)
          newLines.push({ type: 'success', text: `changed working dir to /${res.path || 'root'}` })
        }
        break
      }

      case 'cat': {
        if (params.length === 0) {
          newLines.push({ type: 'error', text: 'cat: no file specified' })
          break
        }
        for (const filename of params) {
          const res = resolveFilePath(filename)
          if (res.error) {
            newLines.push({ type: 'error', text: `cat: ${filename}: ${res.error}` })
          } else {
            const val = res.node[res.filename]
            if (typeof val === 'object') {
              newLines.push({ type: 'error', text: `cat: ${filename}: Is a directory` })
            } else {
              newLines.push({ type: 'output', text: val, isHtml: val.includes('<a') || val.includes('<br') || val.includes('[!] ERROR') })
            }
          }
        }
        break
      }

      case 'xxd': {
        if (params.length === 0) {
          newLines.push({ type: 'error', text: 'xxd: no file specified' })
          break
        }
        const filename = params[0]
        const res = resolveFilePath(filename)
        if (res.error) {
          newLines.push({ type: 'error', text: `xxd: ${filename}: ${res.error}` })
        } else {
          const val = res.node[res.filename]
          if (typeof val === 'object') {
            newLines.push({ type: 'error', text: `xxd: ${filename}: Is a directory` })
          } else {
            newLines.push({ type: 'output', text: runXxd(res.filename, val) })
          }
        }
        break
      }

      case 'strings': {
        if (params.length === 0) {
          newLines.push({ type: 'error', text: 'strings: no file specified' })
          break
        }
        const filename = params[0]
        const res = resolveFilePath(filename)
        if (res.error) {
          newLines.push({ type: 'error', text: `strings: ${filename}: ${res.error}` })
        } else {
          const val = res.node[res.filename]
          if (typeof val === 'object') {
            newLines.push({ type: 'error', text: `strings: ${filename}: Is a directory` })
          } else {
            newLines.push({ type: 'output', text: runStrings(val) })
          }
        }
        break
      }

      case 'sha256sum': {
        let textToHash = pipedInput
        if (textToHash === null) {
          if (params.length === 0) {
            newLines.push({ type: 'error', text: 'sha256sum: missing operand' })
            break
          }
          const filename = params[0]
          const res = resolveFilePath(filename)
          if (!res.error) {
            const val = res.node[res.filename]
            if (typeof val === 'object') {
              newLines.push({ type: 'error', text: `sha256sum: ${filename}: Is a directory` })
              break
            }
            textToHash = val
          } else {
            // Assume raw text argument
            textToHash = params.join(' ')
          }
        }
        newLines.push({ type: 'output', text: `${sha256(textToHash)}  -` })
        break
      }

      case 'base64': {
        const decodeMode = params.includes('-d')
        const filename = params.find(p => p !== '-d')
        let inputData = pipedInput

        if (filename) {
          const res = resolveFilePath(filename)
          if (res.error) {
            newLines.push({ type: 'error', text: `base64: ${filename}: ${res.error}` })
            break
          }
          const val = res.node[res.filename]
          if (typeof val === 'object') {
            newLines.push({ type: 'error', text: `base64: ${filename}: Is a directory` })
            break
          }
          inputData = val
        }

        if (inputData === null) {
          newLines.push({ type: 'error', text: 'base64: missing input' })
          break
        }

        try {
          if (decodeMode) {
            newLines.push({ type: 'output', text: atob(inputData.trim()) })
          } else {
            newLines.push({ type: 'output', text: btoa(inputData) })
          }
        } catch {
          newLines.push({ type: 'error', text: 'base64: invalid input data' })
        }
        break
      }

      case 'decrypt': {
        if (params.length < 2) {
          newLines.push({ type: 'error', text: 'Usage: decrypt <file> <key>' })
          break
        }
        const filepath = params[0]
        const key = params[1]

        const res = resolveFilePath(filepath)
        if (res.error) {
          newLines.push({ type: 'error', text: `decrypt: ${filepath}: ${res.error}` })
          break
        }

        if (res.filename !== 'contact.txt') {
          newLines.push({ type: 'error', text: 'decrypt: decryption is only supported for etc/contact.txt' })
          break
        }

        const decrypted = rc4DecryptHex(key, CONTACT_CIPHERTEXT)
        if (decrypted.includes("Email:")) {
          const newFs = {
            ...fs,
            etc: {
              ...fs.etc,
              "contact.txt": decrypted
            }
          }
          setFs(newFs)
          newLines.push({
            type: 'success',
            text: `[+] Decryption Successful!
[+] Content of etc/contact.txt has been decrypted and updated in the filesystem.

----------------------------------------
${decrypted}
----------------------------------------`
          })
        } else {
          newLines.push({
            type: 'error',
            text: `[-] Decryption Failed: Invalid key.
Verification token mismatch or corrupted data.`
          })
        }
        break
      }

      case 'env': {
        newLines.push({
          type: 'output',
          text: `SHELL=/bin/bash
USER=ambesh
PATH=/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin
PWD=/${cwd}
BACKUP_SALT=tulpas_revenge_2026`
        })
        break
      }

      case 'write': {
        if (params.length < 2) {
          newLines.push({ type: 'error', text: "Usage: write <filename> <content>" })
          break
        }
        const filename = params[0]
        const content = params.slice(1).join(' ')
        if (filename.includes('/') || filename === '.' || filename === '..') {
          newLines.push({ type: 'error', text: 'write: invalid filename' })
          break
        }
        if (filename in currentFolder && typeof currentFolder[filename] === 'object') {
          newLines.push({ type: 'error', text: `write: a directory named ${filename} already exists` })
          break
        }

        const newFs = { ...fs }
        let pointer = newFs
        if (cwd !== '') {
          const parts = cwd.split('/')
          for (const part of parts) {
            pointer[part] = { ...pointer[part] }
            pointer = pointer[part]
          }
        }
        pointer[filename] = content
        setFs(newFs)
        newLines.push({ type: 'success', text: `Created file ${filename}` })
        break
      }

      case 'theme': {
        const themeParam = params[0]
        if (!themeParam) {
          newLines.push({ type: 'output', text: `Current theme is '${theme}'. Available themes: dark, light, classic. Usage: theme [name]` })
        } else if (['dark', 'light', 'classic'].includes(themeParam.toLowerCase())) {
          setTheme(themeParam.toLowerCase())
          newLines.push({ type: 'success', text: `Theme changed to ${themeParam.toLowerCase()}` })
        } else {
          newLines.push({ type: 'error', text: `Unknown theme: ${themeParam}. Choose from: dark, light, classic` })
        }
        break
      }

      case 'neofetch': {
        const banner = ` _______  _    _  _        _____          
|__   __|| |  | || |      |  __ \\   /\\    
   | |   | |  | || |      | |__) | /  \\   
   | |   | |  | || |      |  ___/ / /\\ \\  
   | |   | |__| || |____  | |    / ____ \\ 
   |_|    \\____/ |______| |_|   /_/    \\_\\`
        
        newLines.push({
          type: 'output',
          text: `<span class="terminal-banner-art">${banner}</span>
          
 <span class="terminal-banner-info-key">OS</span>: <span class="terminal-banner-info-val">TulpaOS v2.0.0 (React/Vite Core)</span>
 <span class="terminal-banner-info-key">Host</span>: <span class="terminal-banner-info-val">Ayan Ambesh Portfolio Terminal</span>
 <span class="terminal-banner-info-key">Kernel</span>: <span class="terminal-banner-info-val">React 18 / Vite 5</span>
 <span class="terminal-banner-info-key">Shell</span>: <span class="terminal-banner-info-val">TulpaShell v2.1</span>
 <span class="terminal-banner-info-key">Education</span>: <span class="terminal-banner-info-val">MSc Digital Forensics & InfoSec (NFSU Delhi)</span>
 <span class="terminal-banner-info-key">Core Focus</span>: <span class="terminal-banner-info-val">AppSec, OSINT, Digital Forensics</span>
 <span class="terminal-banner-info-key">Status</span>: <span class="terminal-banner-info-val">Active & perpetual debugging</span>`,
          isHtml: true
        })
        break
      }

      case 'blog': {
        const blogCmd = params[0]
        if (!blogCmd) {
          newLines.push({ type: 'output', text: 'Usage: blog [list | read <slug>]' })
        } else if (blogCmd.toLowerCase() === 'list') {
          const listText = allPosts.map(p => `  • ${p.slug} : ${p.title} (${p.dateLabel})`).join('\n')
          newLines.push({
            type: 'output',
            text: `Recent Blog Posts:\n${listText}\n\nTo read a post, run: blog read <slug>`
          })
        } else if (blogCmd.toLowerCase() === 'read') {
          const slug = params[1]
          if (!slug) {
            newLines.push({ type: 'error', text: 'Usage: blog read <slug>' })
            break
          }
          const post = allPosts.find(p => p.slug === slug)
          if (!post) {
            newLines.push({ type: 'error', text: `Post not found: ${slug}. Type "blog list" for options.` })
          } else {
            const htmlLink = `<a href="/blog/${post.slug}" class="terminal-line-link">Click here to open full post</a>`
            newLines.push({
              type: 'output',
              text: `Title: ${post.title}
Date: ${post.dateLabel}
Tags: ${post.tags.join(', ')}
Excerpt: ${post.excerpt}

${htmlLink}`,
              isHtml: true
            })
          }
        } else {
          newLines.push({ type: 'error', text: `Unknown blog command: ${blogCmd}` })
        }
        break
      }

      case 'skills': {
        newLines.push({
          type: 'output',
          text: `[Technical Skillset]
 ├── Security Areas : Offensive Security, Application Security, Vulnerability Triage
 ├── Forensics      : Digital Forensics, OSINT Investigations, Incident Response
 ├── Languages      : Python, Rust, JavaScript, HTML/CSS
 └── Automation     : Scripting, Security Automation, CTF Tooling`
        })
        break
      }

      case 'sudo':
        newLines.push({ type: 'error', text: 'tulpa is not in the sudoers file. This incident will be reported.' })
        break

      default:
        newLines.push({ type: 'error', text: `Command not found: ${cmdName}. Run "help" to see available commands.` })
    }

    setOutput(prev => [...prev, ...newLines])
  }

  const handleAutocomplete = () => {
    const val = inputValue
    const parts = val.split(' ')
    
    if (parts.length === 1) {
      const commandPrefix = parts[0].toLowerCase()
      const commandsList = ["cat", "ls", "pwd", "cd", "write", "clear", "help", "neofetch", "theme", "skills", "blog", "sudo", "xxd", "strings", "sha256sum", "decrypt", "base64", "env"]
      const matches = commandsList.filter(cmd => cmd.startsWith(commandPrefix))

      if (matches.length === 1) {
        setInputValue(matches[0] + ' ')
      } else if (matches.length > 1) {
        setOutput(prev => [
          ...prev,
          { type: 'command', text: `$ ${val}` },
          { type: 'output', text: matches.join('    ') }
        ])
      }
    } 
    else if (parts.length > 1 && ['cat', 'cd', 'ls', 'xxd', 'strings', 'sha256sum', 'decrypt', 'base64'].includes(parts[0].toLowerCase())) {
      const currentFolder = getCwdNode(cwd)
      if (!currentFolder || typeof currentFolder !== 'object') return

      const prefix = parts.slice(1).join(' ')
      const options = Object.keys(currentFolder)
      const matches = options.filter(opt => opt.toLowerCase().startsWith(prefix.toLowerCase()))

      if (matches.length === 1) {
        const subNode = currentFolder[matches[0]]
        const isDir = typeof subNode === 'object'
        setInputValue(`${parts[0]} ${matches[0]}${isDir ? '/' : ''}`)
      } else if (matches.length > 1) {
        setOutput(prev => [
          ...prev,
          { type: 'command', text: `$ ${val}` },
          { type: 'output', text: matches.join('    ') }
        ])
      }
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      const command = inputValue
      setInputValue('')
      handleCommand(command)
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      if (history.length === 0) return
      
      const newIdx = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1)
      setHistoryIndex(newIdx)
      setInputValue(history[newIdx])
    } else if (e.key === 'ArrowDown') {
      e.preventDefault()
      if (historyIndex === -1) return
      
      const newIdx = historyIndex + 1
      if (newIdx >= history.length) {
        setHistoryIndex(-1)
        setInputValue('')
      } else {
        setHistoryIndex(newIdx)
        setInputValue(history[newIdx])
      }
    } else if (e.key === 'Tab') {
      e.preventDefault()
      handleAutocomplete()
    }
  }

  return (
    <div className="terminal-page">
      <div className="terminal-toolbar">
        <h1>Terminal</h1>
        <div className="terminal-hint">
          Tip: Try typing <code>neofetch</code> or <code>help</code>. Arrow keys navigate history. Tab autocompletes.
        </div>
      </div>

      <div className={`terminal-container theme-${theme}`}>
        <div className="terminal-console" onClick={focusInput}>
          <div className="terminal-console-header">
            <div className="terminal-window-dots">
              <span className="terminal-dot red"></span>
              <span className="terminal-dot yellow"></span>
              <span className="terminal-dot green"></span>
            </div>
            <span className="terminal-window-title">whokilledtulpa@tulpaos: /{cwd}</span>
            <span className="terminal-theme-indicator">{theme} theme</span>
          </div>

          <div className="terminal-console-body" ref={consoleBodyRef}>
            <div className="terminal-scanlines"></div>

            {output.map((line, idx) => (
              <div 
                key={idx} 
                className={`terminal-line terminal-line-${line.type}`}
                {...(line.isHtml ? { dangerouslySetInnerHTML: { __html: DOMPurify.sanitize(line.text, { ADD_ATTR: ['target'] }) } } : { children: line.text })}
              />
            ))}

            <div className="terminal-prompt-row">
              <span className="terminal-prompt-symbol">
                whokilledtulpa@tulpaos:/{cwd}$
              </span>
              <input
                ref={inputRef}
                type="text"
                className="terminal-input"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                autoFocus
                autoComplete="off"
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck="false"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
