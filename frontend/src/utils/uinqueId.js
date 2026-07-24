export default function uniqueId() {
  let idstr = String.fromCharCode(Math.floor(Math.random() * 25 + 65));
  do {
    const ascicodeChar = Math.floor(Math.random() * 25 + 65);
    idstr += String.fromCharCode(ascicodeChar);
    idstr += Math.floor(Math.random() * 99);
  } while (idstr.length < 8);

  return idstr;
}
