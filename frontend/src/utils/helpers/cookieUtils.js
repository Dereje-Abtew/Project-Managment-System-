class CookieManager {
  static setCookie(name, value, expirationDays, sameSite = 'Strict') {
    const date = new Date();
    date.setTime(date.getTime() + expirationDays * 24 * 60 * 60 * 1000);
    const expires = 'expires=' + date.toUTCString();
    const cookieOptions = { expires, path: '/', sameSite };
    document.cookie =
      name +
      '=' +
      value +
      ';' +
      Object.entries(cookieOptions)
        .map(([key, val]) => `${key}=${val}`)
        .join(';');
  }

  static getCookie(name) {
    const cookies = document.cookie.split('; ');
    for (let i = 0; i < cookies.length; i++) {
      const cookie = cookies[i];
      const separatorIndex = cookie.indexOf('=');
      const cookieName = cookie.substring(0, separatorIndex);
      const cookieValue = cookie.substring(separatorIndex + 1);
      if (cookieName === name) {
        return cookieValue;
      }
    }
    return null;
  }

  static clearCookie(name) {
    const expirationDate = new Date();
    expirationDate.setTime(expirationDate.getTime() - 1);
    const expires = 'expires=' + expirationDate.toUTCString();
    document.cookie = name + '=; ' + expires + '; path=/';
  }
}
export default CookieManager;
