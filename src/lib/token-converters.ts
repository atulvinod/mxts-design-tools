import * as appConfig from './config';

let BASE_REM_VALUE = 16;
let SPACING_TOKENS: { [ key: string ]: string } = {};
let SPACING_BREAKPOINTS: number[] = [];

appConfig.appConfig.subscribe( ( values ) => {
  if ( values.IS_TOKEN_CONFIG_LOADED ) {
    const spacingTokens = values[ appConfig.APP_CONFIG_KEYS.SPACING_TOKENS ]['SPACING_TOKENS'];
    Object.entries( spacingTokens ).forEach( ( [ token, unitPxValue ] ) => {
      const nonPxVal = ( unitPxValue as string ).replace( 'px', '' );
      SPACING_TOKENS[ nonPxVal ] = token;
    } );
    SPACING_BREAKPOINTS = Object.keys( SPACING_TOKENS ).sort( ( a, b ) => Number( a ) - Number( b ) ).map( Number );
  }
  BASE_REM_VALUE = Number(values.BASE_REM_VALUE);
} );


function getSpacingToken( isNegative: boolean, tokenValue: string, multiplier?: string ) {
  const sign = ( isNegative ? "-" : '' );
  if ( multiplier ) {
    return sign + multiplier + ' * tokens.' + tokenValue;
  }
  return sign + 'tokens.' + tokenValue;
}

/**
 * 
 * @param {string} value 
 */
export function convertToSpacingToken( value: string ) {
  if ( value.includes( '$' ) || value.includes( 'rem-calc' ) || /[1-9]em$/gi.test( value ) || value.endsWith( 'px' ) ) {
    return value;
  }

  value = value.trim().replace( ';', '' );
  const [ unit ] = value.match( /[^0-9]+$/ ) ?? [];
  const [ numericValue ] = value.match( /^-?\d+(\.\d+)?/ ) ?? [];

  if ( !unit || !numericValue ) {
    return value;
  }

  let pxValue = Number( numericValue ) * ( unit === 'rem' ? BASE_REM_VALUE : 1 );

  if ( !pxValue ) {
    return 0;
  }

  let result = null;
  const isNegative = pxValue < 0;

  if ( isNegative ) {
    pxValue = Math.abs( pxValue );
  }

  for ( let i = 0; i < SPACING_BREAKPOINTS.length; i++ ) {
    const currentBreakpoint = SPACING_BREAKPOINTS[ i ] as number;
    const currentToken = SPACING_TOKENS[ currentBreakpoint ];

    if ( i === 0 ) {
      // px value is lower than the lowest breakpoint
      if ( pxValue < currentBreakpoint ) {
        const multiplier = ( currentBreakpoint / pxValue ).toPrecision( 3 );
        result = getSpacingToken( isNegative, currentToken, multiplier );

        break;
      } else if ( pxValue === currentBreakpoint ) {
        result = getSpacingToken( isNegative, currentToken );

        break;
      }
    } else if ( i === SPACING_BREAKPOINTS.length - 1 ) {
      /**
       * If the pxValue is equal to breakpoint, then use the breakpoint else create a multiplier to the required px value
       */
      if ( pxValue === currentBreakpoint ) {
        result = getSpacingToken( isNegative, currentToken );
      } else {
        const multiplier = ( pxValue / currentBreakpoint ).toPrecision( 3 );
        result = getSpacingToken( isNegative, currentToken, multiplier );
      }

      break;
    } else {
      const lowerBound = SPACING_BREAKPOINTS[ i - 1 ] as number;
      const upperBound = SPACING_BREAKPOINTS[ i + 1 ] as number;

      //if the value is between two breakpoints, then approximate to the nearest breakpoint
      if ( lowerBound <= pxValue && pxValue <= upperBound ) {
        const lowerBoundDiff = Math.abs( lowerBound - pxValue );
        const upperBoundDiff = Math.abs( upperBound - pxValue );

        if ( lowerBoundDiff === 0 ) {
          result = getSpacingToken( isNegative, SPACING_TOKENS[ lowerBound ] );
        } else if ( upperBoundDiff === 0 ) {
          result = getSpacingToken( isNegative, SPACING_TOKENS[ upperBound ] );
        } else {
          if ( lowerBoundDiff < upperBoundDiff ) {
            const multiplier = ( pxValue / lowerBound ).toPrecision( 3 );
            result = getSpacingToken( isNegative, SPACING_TOKENS[ lowerBound ], multiplier );

          } else {
            const multiplier = ( upperBound / pxValue ).toPrecision( 3 );
            result = getSpacingToken( isNegative, SPACING_TOKENS[ upperBound ], multiplier );

          }
        }

        break;
      }
    }
  }

  return result;
}