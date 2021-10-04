# elf-parser
ELF file parser written in Javascript.

```js
const elf = new ELF(bin /* ArrayBufferLike */);

const section = elf.getSection(".text");
const version = elf.header.version;
const machine = elf.header.machine;
```
