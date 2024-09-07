import * as  valueConverters from  './value-converters' ;

const SPACING_RULES = [
  'margin',
  'margin-left',
  'margin-right',
  'margin-top',
  'margin-bottom',
  'padding',
  'padding-left',
  'padding-right',
  'padding-top',
  'padding-bottom',
];

export function getRuleConverter ( rule: string ) {
  if ( SPACING_RULES.includes( rule.trim() ) ) {
    return valueConverters.convertMarginAndPadding;
  }
  return null;
}