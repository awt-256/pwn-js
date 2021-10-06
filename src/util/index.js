const convoBuffer = new ArrayBuffer(8);
const u8 = new Uint8Array(convoBuffer);
const i32 = new Int32Array(convoBuffer);
const f32 = new Int32Array(convoBuffer);
const i64 = new BigInt64Array(convoBuffer);

const convo = {
    toBuffer(v) {
        if (typeof v === "string" || v instanceof Uint8Array) return Buffer.from(v);
        else if (typeof v === "bigint") {
            i64[0] = v;

            return Buffer.from(u8);
        } else if (typeof v === "number" && (v % 1) === 0) {
            i32[0] = v;

            return Buffer.from(u8);
        } else if (typeof v === "number") {
            f32[0] = v;
            
            return Buffer.from(u8);
        } else if (Buffer.isBuffer(v)) return v;
        else if (Array.isArray(v)) return Buffer.concat(v.map(c => convo.toBuffer(c)));

        else throw new TypeError("Unsupported type");
    },
    toString(v) {
        return convo.toBuffer(v).toString();
    },
    toInt32(v) {
        u8.set(convo.toBuffer(v));

        return i32[0];
    },
    toBigInt64(v) {
        u8.set(convo.toBuffer(v));

        return i64[0];
    },
    toFloat32(v) {
        u8.set(convo.toBuffer(v));
        
        return f32[0];
    }
}

module.exports = { convo }
