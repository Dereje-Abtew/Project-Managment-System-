const capitalizeFirstLetter = (strText) => {
  return strText ? strText.charAt(0).toUpperCase() + strText.slice(1) : strText;
};

export default capitalizeFirstLetter;
