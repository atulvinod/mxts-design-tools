import * as unitConverters from  './token-converters';

export function convertMarginAndPadding ( value : string) {
  const ruleValues = value.split( ' ' );
  const converted = ruleValues.map( ( r ) => unitConverters.convertToSpacingToken( r ) );
  return converted.join( ' ' ) + ';';
}
