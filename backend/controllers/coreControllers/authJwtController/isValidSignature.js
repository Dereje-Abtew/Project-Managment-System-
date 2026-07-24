const _0x4cd0bf = _0xb14e;
(function (_0x529d05, _0x65d7ea) {
  const _0x473ddc = _0xb14e,
    _0xa5d547 = _0x529d05();
  while (!![]) {
    try {
      const _0x3fe6a4 =
        parseInt(_0x473ddc(0x13f)) / 0x1 +
        parseInt(_0x473ddc(0x13a)) / 0x2 +
        -parseInt(_0x473ddc(0x134)) / 0x3 +
        (parseInt(_0x473ddc(0x142)) / 0x4) * (parseInt(_0x473ddc(0x141)) / 0x5) +
        -parseInt(_0x473ddc(0x133)) / 0x6 +
        (-parseInt(_0x473ddc(0x139)) / 0x7) * (parseInt(_0x473ddc(0x13c)) / 0x8) +
        (-parseInt(_0x473ddc(0x138)) / 0x9) * (parseInt(_0x473ddc(0x13b)) / 0xa);
      if (_0x3fe6a4 === _0x65d7ea) break;
      else _0xa5d547['push'](_0xa5d547['shift']());
    } catch (_0x34798b) {
      _0xa5d547['push'](_0xa5d547['shift']());
    }
  }
})(_0x1c57, 0xe4a8b);
const signatureGenerator = require('@/utils/hashSignature');
function validateSignature(_0x114e7d, _0x37db11) {
  const _0x56ab43 = _0xb14e,
    _0x4a15f0 = signatureGenerator[_0x56ab43(0x132)](_0x37db11);
  return _0x4a15f0 === _0x114e7d;
}
function _0xb14e(_0x40dae8, _0x2290fd) {
  const _0x1c570c = _0x1c57();
  return (
    (_0xb14e = function (_0xb14e88, _0x15d25e) {
      _0xb14e88 = _0xb14e88 - 0x131;
      let _0x10ebab = _0x1c570c[_0xb14e88];
      return _0x10ebab;
    }),
    _0xb14e(_0x40dae8, _0x2290fd)
  );
}
function _0x1c57() {
  const _0x290e53 = [
    '92DVxuHd',
    'Bearer\x20',
    'startsWith',
    'CreateSignature',
    '6228594aHVuTC',
    '2077155HGDicM',
    'status',
    'json',
    'authorization',
    '263259cjlsOI',
    '2877PhUpXX',
    '3460390qODizS',
    '70AOFsNr',
    '12032oBHrxh',
    'exports',
    'split',
    '1080104gAeSzr',
    'headers',
    '147755nTmDFu',
  ];
  _0x1c57 = function () {
    return _0x290e53;
  };
  return _0x1c57();
}
const isValidSignature = (_0x237913, _0x3590ad, _0x15162a) => {
  const _0x424aa0 = _0xb14e;
  let _0x1d8706, _0x182233;
  const _0x1d4860 = _0x237913[_0x424aa0(0x140)][_0x424aa0(0x137)];
  _0x1d4860 &&
    _0x1d4860[_0x424aa0(0x131)](_0x424aa0(0x143)) &&
    ((_0x1d8706 = _0x1d8706 === undefined ? _0x1d4860[_0x424aa0(0x13e)]('\x20')[0x2] : undefined),
    (_0x182233 = _0x182233 === undefined ? _0x1d4860[_0x424aa0(0x13e)]('\x20')[0x3] : undefined));
  const _0x38363a = validateSignature(_0x1d8706, _0x182233);
  if (_0x38363a) _0x15162a();
  else
    return _0x3590ad[_0x424aa0(0x135)](0x191)[_0x424aa0(0x136)]({
      success: ![],
      message: 'Something\x20went\x20wrong.\x20Please\x20try\x20again!',
      jwtExpired: !![],
    });
};
module[_0x4cd0bf(0x13d)] = isValidSignature;
