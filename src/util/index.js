const convo = {
    buf(v) {
        if (typeof v === "string") return Buffer.from(v);
        else if (typeof v === "bigint") return Buffer.from(new BigInt64Array([v]).buffer);
        else if (typeof v === "number" && (v % 1) === 0) return Buffer.from(new Int32Array([v]).buffer);
        else if (typeof v === "number") return Buffer.from(new Float32Array([v]).buffer);
        else if (Buffer.isBuffer(v)) return v;
        else if (Array.isArray(v)) return Buffer.concat(v.map(c => convo.buf(c)));
        else throw new TypeError("Unsupported type");
    },
    utf(v) {
        return convo.buf(v).toString();
    },
    i32(v) {
        return new Int32Array(Uint8Array.from(convo.buf(v)).buffer)[0];
    },
    f32(v) {
        return new Float32Array(Uint8Array.from(convo.buf(v)).buffer)[0];
    }
}


module.exports = {
  convo
}
