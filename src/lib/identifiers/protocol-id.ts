export const ProtocolId = {
  isValid,
};

function isValid(value: any): boolean {
  const kebabCaseRegex = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

  return typeof value === 'string' && kebabCaseRegex.test(value);
}
