export const parseName = (fullName: string) => {
  const [firstName, ...lastNameParts] = fullName.trim().split(' ');
  return {
    firstName,
    lastName: lastNameParts.join(' ')
  };
};