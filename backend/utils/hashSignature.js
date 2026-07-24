const _0x6e6f6b = _0x2b57;
function _0x12f3() {
  const _0x4551cd = [
    'SHA256',
    '1646091rxMtQV',
    'push',
    '1404502gLgAvY',
    '29469FxSmae',
    '4617565NwdXOC',
    '822132whbaEq',
    'crypto-js',
    'exports',
    '124Stzkpe',
    'SHA256ToString',
    'env',
    'Hex',
    '182PCAnxS',
    'toString',
    '724793csYEsa',
    '263768SbdGAE',
    '40gkcmXX',
    'HASH_SECRET_KEY',
    'enc',
    'CreateSignature',
  ];
  _0x12f3 = function () {
    return _0x4551cd;
  };
  return _0x12f3();
}
(function (_0x42733d, _0x156d5c) {
  const _0x3e93f3 = _0x2b57,
    _0x2aa82d = _0x42733d();
  while (!![]) {
    try {
      const _0x2d396e =
        parseInt(_0x3e93f3(0xa4)) / 0x1 +
        parseInt(_0x3e93f3(0x98)) / 0x2 +
        (-parseInt(_0x3e93f3(0x99)) / 0x3) * (-parseInt(_0x3e93f3(0x9e)) / 0x4) +
        -parseInt(_0x3e93f3(0x9a)) / 0x5 +
        -parseInt(_0x3e93f3(0x9b)) / 0x6 +
        (parseInt(_0x3e93f3(0xa2)) / 0x7) * (-parseInt(_0x3e93f3(0x90)) / 0x8) +
        (parseInt(_0x3e93f3(0x96)) / 0x9) * (parseInt(_0x3e93f3(0x91)) / 0xa);
      if (_0x2d396e === _0x156d5c) break;
      else _0x2aa82d['push'](_0x2aa82d['shift']());
    } catch (_0x1761e0) {
      _0x2aa82d['push'](_0x2aa82d['shift']());
    }
  }
})(_0x12f3, 0x8525c);
const CryptoJS = require(_0x6e6f6b(0x9c));
function _0x2b57(_0x38ee5b, _0x374eaa) {
  const _0x12f331 = _0x12f3();
  return (
    (_0x2b57 = function (_0x2b57ca, _0x4a2627) {
      _0x2b57ca = _0x2b57ca - 0x90;
      let _0x1c37bc = _0x12f331[_0x2b57ca];
      return _0x1c37bc;
    }),
    _0x2b57(_0x38ee5b, _0x374eaa)
  );
}
class SignatureGenerator {
  [_0x6e6f6b(0x9f)](_0x390732) {
    const _0x1b7749 = _0x6e6f6b,
      _0x7aea00 = CryptoJS[_0x1b7749(0x95)](_0x390732),
      _0x376a4c = _0x7aea00[_0x1b7749(0xa3)](CryptoJS[_0x1b7749(0x93)][_0x1b7749(0xa1)]);
    return _0x376a4c;
  }
  [_0x6e6f6b(0x94)](_0x14b3d1) {
    const _0x3b1e96 = _0x6e6f6b,
      _0x40efc5 = { _1: process[_0x3b1e96(0xa0)][_0x3b1e96(0x92)], _2: _0x14b3d1 },
      _0xfe8ae = [];
    for (const [_0x520ec7, _0x3969db] of Object['entries'](_0x40efc5)) {
      _0xfe8ae[_0x3b1e96(0x97)](_0x520ec7 + '=' + _0x3969db);
    }
    const _0x71d3b = this['SHA256ToString'](_0xfe8ae['join']('&'));
    return _0x71d3b;
  }
}
const signatureGenerator = new SignatureGenerator();
module[_0x6e6f6b(0x9d)] = signatureGenerator;
