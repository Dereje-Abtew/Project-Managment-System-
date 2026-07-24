const _0x4952cc = _0x4e38;
(function (_0x22339e, _0x324132) {
  const _0x395a00 = _0x4e38,
    _0x2c93c1 = _0x22339e();
  while (!![]) {
    try {
      const _0x27395f =
        parseInt(_0x395a00(0x141)) / 0x1 +
        parseInt(_0x395a00(0x13a)) / 0x2 +
        (parseInt(_0x395a00(0x134)) / 0x3) * (-parseInt(_0x395a00(0x128)) / 0x4) +
        (parseInt(_0x395a00(0x124)) / 0x5) * (-parseInt(_0x395a00(0x137)) / 0x6) +
        (parseInt(_0x395a00(0x12f)) / 0x7) * (-parseInt(_0x395a00(0x12a)) / 0x8) +
        parseInt(_0x395a00(0x139)) / 0x9 +
        (parseInt(_0x395a00(0x129)) / 0xa) * (parseInt(_0x395a00(0x12e)) / 0xb);
      if (_0x27395f === _0x324132) break;
      else _0x2c93c1['push'](_0x2c93c1['shift']());
    } catch (_0x197351) {
      _0x2c93c1['push'](_0x2c93c1['shift']());
    }
  }
})(_0x317a, 0x6bf81);
const cryptoHelper = require(_0x4952cc(0x133)),
  jwt = require(_0x4952cc(0x12b)),
  mongoose = require('mongoose'),
  User = mongoose[_0x4952cc(0x13b)](_0x4952cc(0x13c));
require(_0x4952cc(0x130))[_0x4952cc(0x132)]({ path: '.env' });
function isTokenExpired(_0xc59b4e) {
  const _0x1c7b15 = _0x4952cc;
  try {
    const _0x363db9 = jwt[_0x1c7b15(0x127)](_0xc59b4e);
    if (_0x363db9[_0x1c7b15(0x123)] < Date['now']() / 0x3e8) return !![];
    return ![];
  } catch (_0x2adb87) {
    return !![];
  }
}
const isValidToken = async (_0x5eb899, _0x4ba406, _0x3fcde6) => {
  const _0x188cdd = _0x4952cc;
  try {
    let _0x499c18 = undefined;
    const _0x166296 = _0x5eb899['headers']['authorization'];
    _0x166296 &&
      _0x166296[_0x188cdd(0x131)](_0x188cdd(0x126)) &&
      (_0x499c18 = _0x499c18 === undefined ? _0x166296[_0x188cdd(0x125)]('\x20')[0x1] : undefined);
    if (!_0x499c18)
      return _0x4ba406[_0x188cdd(0x136)](0x191)[_0x188cdd(0x140)]({
        success: ![],
        message: _0x188cdd(0x142),
        jwtExpired: !![],
      });
    const _0x2447a4 = isTokenExpired(_0x499c18);
    if (_0x2447a4)
      return _0x4ba406[_0x188cdd(0x136)](0x191)[_0x188cdd(0x140)]({
        success: ![],
        message: _0x188cdd(0x138),
        jwtExpired: !![],
      });
    const _0x461df6 = jwt['verify'](_0x499c18, process[_0x188cdd(0x13d)]['JWT_SECRET']);
    if (!_0x461df6)
      return _0x4ba406[_0x188cdd(0x136)](0x191)[_0x188cdd(0x140)]({
        success: ![],
        message: _0x188cdd(0x13e),
        jwtExpired: !![],
      });
    const _0x3ae25c = await User[_0x188cdd(0x12c)]({ _id: _0x461df6['id'], removed: ![] });
    if (!_0x3ae25c)
      return _0x4ba406['status'](0x191)['json']({
        success: ![],
        message: _0x188cdd(0x13f),
        jwtExpired: !![],
      });
    if (_0x3ae25c['isLoggedIn'] === 0x0)
      return _0x4ba406[_0x188cdd(0x136)](0x191)[_0x188cdd(0x140)]({
        success: ![],
        message: _0x188cdd(0x12d),
        jwtExpired: !![],
      });
    else (_0x5eb899[_0x188cdd(0x143)] = _0x3ae25c), _0x3fcde6();
  } catch (_0x5925f3) {
    _0x4ba406['status'](0x191)['json']({ success: ![], message: _0x188cdd(0x135) });
  }
};
function _0x4e38(_0xef6eb9, _0x1f4baf) {
  const _0x317a2e = _0x317a();
  return (
    (_0x4e38 = function (_0x4e38d4, _0x4e2da4) {
      _0x4e38d4 = _0x4e38d4 - 0x123;
      let _0x28ac4b = _0x317a2e[_0x4e38d4];
      return _0x28ac4b;
    }),
    _0x4e38(_0xef6eb9, _0x1f4baf)
  );
}
module['exports'] = isValidToken;
function _0x317a() {
  const _0x24bd7d = [
    'jsonwebtoken',
    'findOne',
    'User\x20is\x20already\x20logout\x20try\x20to\x20login,\x20authorization\x20denied.',
    '14580995ymnXgt',
    '5312489tbacBf',
    'dotenv',
    'startsWith',
    'config',
    '@/utils/crypto',
    '18AmBatR',
    'You\x20are\x20not\x20authorized\x20to\x20access\x20this\x20resource.',
    'status',
    '1469220JPeNdM',
    'Token\x20has\x20expired,\x20authorization\x20denied.',
    '999990TWjORQ',
    '176886wiBsuX',
    'model',
    'User',
    'env',
    'Token\x20verification\x20failed,\x20authorization\x20denied.',
    'Invalid\x20token.\x20Please\x20try\x20again!',
    'json',
    '208278jDRGnZ',
    'No\x20authentication\x20token,\x20authorization\x20denied.',
    'user',
    'exp',
    '10eZafXU',
    'split',
    'Bearer\x20',
    'decode',
    '28312nKiuws',
    '10qBXxzG',
    '8xRtxsF',
  ];
  _0x317a = function () {
    return _0x24bd7d;
  };
  return _0x317a();
}
