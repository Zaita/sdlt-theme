// @flow

export type User = {
  id: string,
  name: string,
  email: string,
  isSA: boolean,
  isCISO: boolean,
};

export type Collaborator = {
  value: string, // email
  labe: string,  // name
};
