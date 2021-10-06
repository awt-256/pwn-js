# util
Utility functions and classes for PWNjs.

## `util.convo`
```js
// `toBuffer` normalizes its parameter to a NodeJS.Buffer when possible. If the conversion is not supported it throws a TypeError.
util.convo.toBuffer(0xdeadbeef); // Buffer< ... >

// `toString` converts its first parameter to a string. All parameters types supported by `toBuffer` are supported by .utf.
util.convo.toString(0x414243); // "ABC"

// `toFloat32` converts its first parameter to a buffer, then converts the buffer to an float.
// `toBigInt64` converts its first parameter to a buffer, then converts the buffer to a bigint.
// `toInt32` converts its first parameter to a buffer, then converts the buffer to an i32.
util.convo.toInt32("\x02"); // 2
```
