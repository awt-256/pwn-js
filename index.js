const applyProperty = (obj, value) => (obj[value.name] = value, obj);

class ELF {
    static ABI_ID = {
        0x00: "System V",
        0x01: "HP-UX",
        0x02: "NetBSD",
        0x03: "Linux",
        0x04: "GNU Hurd",
        0x06: "Solaris",
        0x07: "AIX",
        0x08: "IRIX",
        0x09: "FreeBSD",
        0x0A: "Tru64",
        0x0B: "Novell Modesto",
        0x0C: "OpenBSD",
        0x0D: "OpenVMS",
        0x0E: "NonStop Kernel",
        0x0F: "AROS",
        0x10: "Fenix OS",
        0x11: "CloudABI",
        0x12: "Stratus Technologies OpenVOS",

        default: "Unknown"
    }

    static OBJECT_TYPE_ID = {
        0x00: "NONE",
        0x01: "REL",
        0x02: "EXEC",
        0x03: "DYN",
        0x04: "CORE",
        0xFE00: "LOOS",
        0xFEFF: "HIOS",
        0xFF00: "LOPROC",
        0xFFFF: "HIPROC",

        default: "UNKNOWN"
    }
    
    static PROGRAM_TYPE_ID = {
        0x00000000:	"NULL",
        0x00000001:	"LOAD",
        0x00000002:	"DYNAMIC",
        0x00000003:	"INTERP",
        0x00000004:	"NOTE",
        0x00000005:	"SHLIB",
        0x00000006:	"PHDR",
        0x00000007:	"TLS",
        0x60000000:	"LOOS",
        0x6FFFFFFF:	"HIOS",
        0x70000000:	"LOPROC",
        0x7FFFFFFF:	"HIPROC",

        LOOS: 0x60000000,
        HIOS: 0x6FFFFFFF,

        LOPROC: 0x70000000,
        HIPROC: 0x7FFFFFFF,

        default: "UNKNOWN"
    }

    static ISA_ID = {
        0x00: "No specific instruction set",
        0x01: "AT&T WE 32100",
        0x02: "SPARC",
        0x03: "x86",
        0x04: "Motorola 68000 (M68k)",
        0x05: "Motorola 88000 (M88k)",
        0x06: "Intel MCU",
        0x07: "Intel 80860",
        0x08: "MIPS",
        0x09: "IBM_System/370",
        0x0A: "MIPS RS3000 Little-endian",
        // 0x0B - 0x0D	Reserved for future use
        0x0E: "Hewlett-Packard PA-RISC",
        0x0F: "Reserved for future use",
        0x13: "Intel 80960",
        0x14: "PowerPC",
        0x15: "PowerPC (64-bit)",
        0x16: "S390, including S390x",
        0x17: "IBM SPU/SPC",
        // 0x18 - 0x23	Reserved for future use
        0x24: "NEC V800",
        0x25: "Fujitsu FR20",
        0x26: "TRW RH-32",
        0x27: "Motorola RCE",
        0x28: "ARM (up to ARMv7/Aarch32)",
        0x29: "Digital Alpha",
        0x2A: "SuperH",
        0x2B: "SPARC Version 9",
        0x2C: "Siemens TriCore embedded processor",
        0x2D: "Argonaut RISC Core",
        0x2E: "Hitachi H8/300",
        0x2F: "Hitachi H8/300H",
        0x30: "Hitachi H8S",
        0x31: "Hitachi H8/500",
        0x32: "IA-64",
        0x33: "Stanford MIPS-X",
        0x34: "Motorola ColdFire",
        0x35: "Motorola M68HC12",
        0x36: "Fujitsu MMA Multimedia Accelerator",
        0x37: "Siemens PCP",
        0x38: "Sony nCPU embedded RISC processor",
        0x39: "Denso NDR1 microprocessor",
        0x3A: "Motorola Star*Core processor",
        0x3B: "Toyota ME16 processor",
        0x3C: "STMicroelectronics ST100 processor",
        0x3D: "Advanced Logic Corp. TinyJ embedded processor family",
        0x3E: "AMD x86-64",
        0x8C: "TMS320C6000 Family",
        0xAF: "MCST Elbrus e2k",
        0xB7: "ARM 64-bits (ARMv8/Aarch64)",
        0xF3: "RISC-V",
        0xF7: "Berkeley Packet Filter",
        0x101: "WDC 65C816",

        default: "Unknown"
    }

    static SECTION_TYPE_ID = {
        0x0: "NULL",
        0x1: "PROGBITS",
        0x2: "SYMTAB",
        0x3: "STRTAB",
        0x4: "RELA",
        0x5: "HASH",
        0x6: "DYNAMIC",
        0x7: "NOTE",
        0x8: "NOBITS",
        0x9: "REL",
        0x0A: "SHLIB",
        0x0B: "DYNSYM",
        0x0E: "INIT_ARRAY",
        0x0F: "FINI_ARRAY",
        0x10: "PREINIT_ARRAY",
        0x11: "GROUP",
        0x12: "SYMTAB_SHNDX",
        0x13: "NUM",
        0x60000000: "LOOS",

        default: "UNDEF"
    }

    static SECTION_FLAGS = {
        0x1: "WRITE",
        0x2: "ALLOC",
        0x4: "EXECINSTR",
        0x10: "MERGE",
        0x20: "STRINGS",
        0x40: "INFO_LINK",
        0x80: "LINK_ORDER",
        0x100: "OS_NONCONFORMING",
        0x200: "GROUP",
        0x400: "TLS",
        0x0ff00000: "MASKOS",
        0xf0000000: "MASKPROC",
        0x4000000: "ORDERED",
        0x8000000: "EXCLUDE",
    }

    constructor(buffer) {
        this._view = new DataView(buffer.buffer ?? buffer);
        this.buffer = this._view.buffer;

        this._raw = this._read();
        this._sectionHeaders = this._raw.sectionHeaders;
        this._programHeaders = this._raw.programHeaders;
        this.header = this._raw.header;

        this._parse();
    }

    _read() {
        if (this._view.getUint32(0x00, false) !== 0x7F_454C46) throw new TypeError("Invalid magic. Probably not an ELF file.");

        const header = {};
        header.ident = {};

        const addressClass = header.ident.class = this._view.getUint8(0x04) === 1 ? "32-bit" : "64-bit";
        const littleEndian = header.data = this._view.getUint8(0x05) === 1;

        header.ident.version = this._view.getUint8(0x06);
        header.ident.osabi = ELF.ABI_ID[this._view.getUint8(0x07)] || ELF.ABI.default;
        header.ident.abiversion = this._view.getUint8(0x08);
        // Unused
        header.ident.pad = new Uint8Array(7).map((_, i) => this._view.getUint8(0x09 + i));

        header.type = ELF.OBJECT_TYPE_ID[this._view.getUint16(0x10, littleEndian)] || ELF.OBJ_TYPE.default;
        header.machine = ELF.ISA_ID[this._view.getUint16(0x12, littleEndian)] || ELF.OBJ_TYPE.default;
        header.version = this._view.getUint32(0x14, littleEndian);

        if (addressClass === "32-bit") {
            header.entry = this._view.getUint32(0x18, littleEndian);
            header.phoff = this._view.getUint32(0x1C, littleEndian);
            header.shoff = this._view.getUint32(0x20, littleEndian);
            header.flags = this._view.getUint32(0x24, littleEndian);
            header.ehsize = this._view.getUint16(0x28, littleEndian);
            header.phentsize = this._view.getUint16(0x2A, littleEndian);
            header.phnum = this._view.getUint16(0x2C, littleEndian);
            header.shentsize = this._view.getUint16(0x2E, littleEndian);
            header.shnum = this._view.getUint16(0x30, littleEndian);
            header.shstrndx = this._view.getUint16(0x32, littleEndian);
        } else { // if === 64-bit
            header.entry = Number(this._view.getBigUint64(0x18, littleEndian));
            header.phoff = Number(this._view.getBigUint64(0x20, littleEndian));
            header.shoff = Number(this._view.getBigUint64(0x28, littleEndian));
            header.flags = this._view.getUint32(0x30, littleEndian);
            header.ehsize = this._view.getUint16(0x34, littleEndian);
            header.phentsize = this._view.getUint16(0x36, littleEndian);
            header.phnum = this._view.getUint16(0x38, littleEndian);
            header.shentsize = this._view.getUint16(0x3A, littleEndian);
            header.shnum = this._view.getUint16(0x3C, littleEndian);
            header.shstrndx = this._view.getUint16(0x3E, littleEndian);
        }

        const programHeaders = Array(header.phnum);
        for (let i = 0, offset=header.phoff; i < header.phnum; ++i, offset += header.phentsize) {
            const pHeader = programHeaders[i] = {};

            const rawType = this._view.getUint32(offset, littleEndian);
            if (rawType >= ELF.PROGRAM_TYPE_ID.LOOS || rawType <= ELF.PROGRAM_TYPE_ID.HIOS) pHeader.type = "OS:" + rawType.toString(16).toUpperCase().padStart(8, "0");
            else if (rawType >= ELF.PROGRAM_TYPE_ID.LOPROC || rawType <= ELF.PROGRAM_TYPE_ID.HIPROC) pHeader.type = "PROC:" + rawType.toString(16).toUpperCase().padStart(8, "0");
            else pHeader.type = ELF.PROGRAM_TYPE_ID[rawType] || ELF.PROGRAM_TYPE_ID.default; 

            if (addressClass === "32-bit") {
                pHeader.offset = this._view.getUint32(offset + 0x04, littleEndian);
                pHeader.vaddr = this._view.getUint32(offset + 0x08, littleEndian);
                pHeader.paddr = this._view.getUint32(offset + 0x0C, littleEndian);
                pHeader.filesz = this._view.getUint32(offset + 0x10, littleEndian);
                pHeader.memsz = this._view.getUint32(offset + 0x14, littleEndian);
                pHeader.flags = this._view.getUint32(offset + 0x18, littleEndian);

                const alignRaw = this._view.getUint32(offset + 0x1C, littleEndian);
                pHeader.align = alignRaw === 0 || alignRaw === 1 ? null : alignRaw;
            } else {
                pHeader.flags = this._view.getUint32(offset + 0x04, littleEndian);
                pHeader.offset = Number(this._view.getBigUint64(offset + 0x08, littleEndian));
                pHeader.vaddr = Number(this._view.getBigUint64(offset + 0x10, littleEndian));
                pHeader.paddr = Number(this._view.getBigUint64(offset + 0x18, littleEndian));
                pHeader.filesz = Number(this._view.getBigUint64(offset + 0x20, littleEndian));
                pHeader.memsz = Number(this._view.getBigUint64(offset + 0x28, littleEndian));
                
                const alignRaw = Number(this._view.getBigUint64(offset + 0x30, littleEndian));
                pHeader.align = alignRaw === 0n || alignRaw === 1n ? null : alignRaw;
            }
        }

        const sectionHeaders = Array(header.shnum);
        for (let i = 0, offset=header.shoff; i < header.shnum; ++i, offset += header.shentsize) {
            const sHeader = sectionHeaders[i] = {};

            sHeader.name = this._view.getUint32(offset, littleEndian);

            const rawType = this._view.getUint32(offset + 0x04, littleEndian);
            sHeader.type = ELF.SECTION_TYPE_ID[rawType] || ELF.SECTION_TYPE_ID.default; 

            if (addressClass === "32-bit") {
                const flags = this._view.getUint32(offset + 0x08, littleEndian);

                sHeader.flags = {
                    [ELF.SECTION_FLAGS[0x1]]: flags & 0x1,
                    [ELF.SECTION_FLAGS[0x2]]: flags & 0x2,
                    [ELF.SECTION_FLAGS[0x4]]: flags & 0x4,
                    [ELF.SECTION_FLAGS[0x10]]: flags & 0x10,
                    [ELF.SECTION_FLAGS[0x20]]: flags & 0x20,
                    [ELF.SECTION_FLAGS[0x40]]: flags & 0x40,
                    [ELF.SECTION_FLAGS[0x80]]: flags & 0x80,
                    [ELF.SECTION_FLAGS[0x100]]: flags & 0x100,
                    [ELF.SECTION_FLAGS[0x200]]: flags & 0x200,
                    [ELF.SECTION_FLAGS[0x400]]: flags & 0x400,
                    [ELF.SECTION_FLAGS[0x0ff00000]]: flags & 0x0ff00000,
                    [ELF.SECTION_FLAGS[0xf0000000]]: flags & 0xf0000000,
                    [ELF.SECTION_FLAGS[0x4000000]]: flags & 0x4000000,
                    [ELF.SECTION_FLAGS[0x8000000]]: flags & 0x8000000,
                }
                sHeader.addr = this._view.getUint32(offset + 0x0C, littleEndian);
                sHeader.offset = this._view.getUint32(offset + 0x10, littleEndian);
                sHeader.size = this._view.getUint32(offset + 0x14, littleEndian);
                sHeader.link = this._view.getUint32(offset + 0x18, littleEndian);
                sHeader.info = this._view.getUint32(offset + 0x1C, littleEndian);
                sHeader.addralign = this._view.getUint32(offset + 0x20, littleEndian);
                sHeader.entsize = this._view.getUint32(offset + 0x24, littleEndian);

                const alignRaw = this._view.getUint32(offset + 0x1C, littleEndian);
                sHeader.align = alignRaw === 0 || alignRaw === 1 ? null : alignRaw;
            } else {
                const flags = Number(this._view.getBigUint64(offset + 0x08, littleEndian));

                sHeader.flags = {
                    [ELF.SECTION_FLAGS[0x1]]: flags & 0x1,
                    [ELF.SECTION_FLAGS[0x2]]: flags & 0x2,
                    [ELF.SECTION_FLAGS[0x4]]: flags & 0x4,
                    [ELF.SECTION_FLAGS[0x10]]: flags & 0x10,
                    [ELF.SECTION_FLAGS[0x20]]: flags & 0x20,
                    [ELF.SECTION_FLAGS[0x40]]: flags & 0x40,
                    [ELF.SECTION_FLAGS[0x80]]: flags & 0x80,
                    [ELF.SECTION_FLAGS[0x100]]: flags & 0x100,
                    [ELF.SECTION_FLAGS[0x200]]: flags & 0x200,
                    [ELF.SECTION_FLAGS[0x400]]: flags & 0x400,
                    [ELF.SECTION_FLAGS[0x0ff00000]]: flags & 0x0ff00000,
                    [ELF.SECTION_FLAGS[0xf0000000]]: flags & 0xf0000000,
                    [ELF.SECTION_FLAGS[0x4000000]]: flags & 0x4000000,
                    [ELF.SECTION_FLAGS[0x8000000]]: flags & 0x8000000,
                }

                sHeader.addr = Number(this._view.getBigUint64(offset + 0x10, littleEndian));
                sHeader.offset = Number(this._view.getBigUint64(offset + 0x18, littleEndian));
                sHeader.size = Number(this._view.getBigUint64(offset + 0x20, littleEndian));
                sHeader.link = this._view.getUint32(offset + 0x18, littleEndian);
                sHeader.info = this._view.getUint32(offset + 0x1C, littleEndian);
                sHeader.addralign = Number(this._view.getBigUint64(offset + 0x20, littleEndian));
                sHeader.entsize = Number(this._view.getBigUint64(offset + 0x24, littleEndian));
            }
        }

        return {
            header,
            programHeaders,
            sectionHeaders
        }
    }

    _readStringNT(offset) {
        offset |= 0;

        const start = offset;

        while (this._view.getUint8(offset) !== 0) offset += 1;

        return new TextDecoder().decode(new Uint8Array(this._view.buffer).subarray(start, offset));
    }

    _parse() {
        const secStrOffset = this._sectionHeaders[this.header.shstrndx].offset;

        this.sections = Array(this._sectionHeaders.length);
        for (let i = 0; i < this._sectionHeaders.length; ++i) {
            const header = this._sectionHeaders[i];
            const name = this._readStringNT(secStrOffset + header.name);
            const buffer = this.buffer.slice(header.offset, header.offset + header.size);

            this.sections[i] = {
                header,
                name,
                buffer,
                flags: header.flags,
                type: header.type,
                addr: header.addr
            }
        }
        this.sections.byName = this.sections.reduce(applyProperty, {});

        this.programs = Array(this._programHeaders.length);
        for (let i = 0; i < this._programHeaders.length; ++i) {
            const header = this._programHeaders[i];

            this.programs[i] = {
                header
            }
        }
    }

    getSection(name) {
        return this.sectionsByName[name] || null;
    }
}
