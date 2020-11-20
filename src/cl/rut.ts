/**
 *
 * Chile RUT/RUN numbers
 *
 * RUT number (Rol Unico Tributario).
 *
 * The RUT, the Chilean national tax number is the same as the RUN (Rol Único
 * Nacional) the Chilean national identification number. The number consists of
 * 8 digits, followed by a check digit.
 */

import * as exceptions from '../exceptions';
import { strings, weightedChecksum } from '../util';
import { Validator, ValidateReturn } from '../types';

function clean(input: string): ReturnType<typeof strings.cleanUnicode> {
  const [v, err] = strings.cleanUnicode(input, ' -');

  if (err) {
    return ['', err];
  }

  if (v.startsWith('CL')) {
    return [v.substr(2), null];
  }

  return [v, null];
}

const impl: Validator = {
  compact(input: string): string {
    const [value, err] = clean(input);

    if (err) {
      throw err;
    }

    return value;
  },

  format(input: string): string {
    const [value] = clean(input);

    const [a, b, c, d] = strings.splitAt(value, 2, 5, 8);

    return `${a}.${b}.${c}-${d}`;
  },

  /**
   * Check if the number is a valid Andorra NRT number.
   * This checks the length, formatting and other contraints. It does not check
   * for control letter.
   */
  validate(input: string): ValidateReturn {
    const [value, error] = clean(input);

    if (error) {
      return { isValid: false, error };
    }
    if (value.length != 8 && value.length !== 9) {
      return { isValid: false, error: new exceptions.InvalidLength() };
    }

    const [front, check] = strings.splitAt(value, value.length - 1);

    if (!strings.isdigits(front)) {
      return { isValid: false, error: new exceptions.InvalidComponent() };
    }

    const sum = weightedChecksum(
      strings.reverse(front),
      [9, 8, 7, 6, 5, 4, 9, 8, 7],
      11,
    );

    const digit = '0123456789K'[sum];

    if (check !== digit) {
      return { isValid: false, error: new exceptions.InvalidChecksum() };
    }

    return {
      isValid: true,
      compact: value,
      isIndividual: false,
      isCompany: false,
    };
  },
};

export const validate = impl.validate;
export const format = impl.format;
export const compact = impl.compact;
