/**
 * JMBG (Bosnia and Herzegovina Unique Master Citizen Number).
 *
 * Source
 *    https://en.wikipedia.org/wiki/Unique_Master_Citizen_Number#
 *
 * PERSON
 */

import * as exceptions from '../exceptions';
import { strings } from '../util';
import { Validator, ValidateReturn } from '../types';
import { weightedSum } from '../util/checksum';

function clean(input: string): ReturnType<typeof strings.cleanUnicode> {
  return strings.cleanUnicode(input, ' -');
}

const impl: Validator = {
  name: 'Bosnia Unique Master Citizen Number',
  localName: 'Jedinstveni matični broj građana',
  abbreviation: 'JMBG',
  compact(input: string): string {
    const [value, err] = clean(input);

    if (err) {
      throw err;
    }

    return value;
  },

  format(input: string): string {
    const [value] = clean(input);

    return value;
  },

  validate(input: string): ValidateReturn {
    const [value, error] = clean(input);

    if (error) {
      return { isValid: false, error };
    }
    if (value.length !== 13) {
      return { isValid: false, error: new exceptions.InvalidLength() };
    }
    if (!strings.isdigits(value)) {
      return { isValid: false, error: new exceptions.InvalidFormat() };
    }

    const [front, check] = strings.splitAt(value, 12);

    const sum =
      11 -
      weightedSum(front, {
        modulus: 11,
        weights: [7, 6, 5, 4, 3, 2, 7, 6, 5, 4, 3, 2],
      });

    if (String(sum % 10) !== check) {
      return { isValid: false, error: new exceptions.InvalidChecksum() };
    }

    return {
      isValid: true,
      compact: value,
      isIndividual: true,
      isCompany: false,
    };
  },
};

export const { name, localName, abbreviation, validate, format, compact } =
  impl;
