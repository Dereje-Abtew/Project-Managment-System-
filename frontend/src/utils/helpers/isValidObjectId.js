export default function isValidObjectId(id) {
  const validObjectIdRegex = /^[0-9a-fA-F]{24}$/; // Regular expression for validating object IDs
  return validObjectIdRegex.test(id);
}
