export const classNames = (classes: string[]): string => {
  let classString = '';
  classes.map((classStyle) => classString += `${classStyle} `);
  return classString;
};