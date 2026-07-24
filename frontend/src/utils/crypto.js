const _0x334b8a = _0x26d1;
(function (_0x3ceec1, _0xb6fc91) {
  const _0x42b949 = _0x26d1,
    _0x250df3 = _0x3ceec1();
  while (!![]) {
    try {
      const _0x9b0c18 =
        (-parseInt(_0x42b949(0x163)) / 0x1) * (parseInt(_0x42b949(0x156)) / 0x2) +
        -parseInt(_0x42b949(0x159)) / 0x3 +
        -parseInt(_0x42b949(0x164)) / 0x4 +
        parseInt(_0x42b949(0x15f)) / 0x5 +
        parseInt(_0x42b949(0x160)) / 0x6 +
        parseInt(_0x42b949(0x161)) / 0x7 +
        parseInt(_0x42b949(0x15d)) / 0x8;
      if (_0x9b0c18 === _0xb6fc91) break;
      else _0x250df3['push'](_0x250df3['shift']());
    } catch (_0x1edbd5) {
      _0x250df3['push'](_0x250df3['shift']());
    }
  }
})(_0x54a9, 0xaaa2d);
const CryptoJS = require('crypto-js');
class CryptoHelper {
  constructor(_0x571ea5, _0x88fa89) {
    const _0x505399 = _0x26d1;
    let _0x375e6d = _0x571ea5,
      _0xdb7aa3 = _0x88fa89;
    const _0x43a79d = (_0x476c5b) => {
        const _0x83de5e = _0x26d1;
        try {
          const _0x2cda01 = CryptoJS['AES']
            [_0x83de5e(0x165)](JSON[_0x83de5e(0x15c)](_0x476c5b), _0x375e6d)
            ['toString']();
          return _0x2cda01;
        } catch (_0x4bc7a9) {
          return null;
        }
      },
      _0x33180d = (_0x499f3e) => {
        const _0x15ec90 = _0x26d1;
        try {
          const _0x237c84 = CryptoJS[_0x15ec90(0x157)][_0x15ec90(0x15e)](_0x499f3e, _0xdb7aa3),
            _0x53bd54 = JSON[_0x15ec90(0x158)](
              _0x237c84[_0x15ec90(0x15a)](CryptoJS[_0x15ec90(0x162)]['Utf8'])
            );
          return _0x53bd54;
        } catch (_0x55ff81) {
          return null;
        }
      };
    (this[_0x505399(0x165)] = (_0x233ab5) => {
      return _0x43a79d(_0x233ab5);
    }),
      (this[_0x505399(0x15e)] = (_0x244616) => {
        return _0x33180d(_0x244616);
      });
  }
}
const secretKey = process['env'][_0x334b8a(0x15b)],
  cryptoHelper = new CryptoHelper(secretKey, secretKey);
export default cryptoHelper;
function _0x26d1(_0x386fdf, _0x4fa515) {
  const _0x54a94c = _0x54a9();
  return (
    (_0x26d1 = function (_0x26d1da, _0x9418a0) {
      _0x26d1da = _0x26d1da - 0x156;
      let _0x5243db = _0x54a94c[_0x26d1da];
      return _0x5243db;
    }),
    _0x26d1(_0x386fdf, _0x4fa515)
  );
}
function _0x54a9() {
  const _0x3de8ee = [
    'REACT_APP_ENC_DEC_SECRET_KEY',
    'stringify',
    '5545344xKTlyv',
    'decrypt',
    '6763530Xmrnvm',
    '7179576zXFnTY',
    '2779679DpUGxd',
    'enc',
    '387654sIMyvO',
    '4807344XkpAXA',
    'encrypt',
    '2zcquph',
    'AES',
    'parse',
    '4053456LOSkth',
    'toString',
  ];
  _0x54a9 = function () {
    return _0x3de8ee;
  };
  return _0x54a9();
}
