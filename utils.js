/**
 * Styles an integer number separating the thousands (each three numbers) with spaces.
 * Example:
 *   1452 -> 1 452
 *   583950 -> 583 950
 *
 * @param {Integer} number Number to be styled
 * @return {String} Styles number
 */
export const styleNumber = (number) => {
  const numberArray = number.toString().split('');
  let i = numberArray.length;

  while (i--) {
    if (i % 3 === 0 && i !== 0) {
      numberArray.splice(-i, 0, ' ');
    }    
  }

  return numberArray.join('');
};