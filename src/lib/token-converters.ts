import * as config from './config';
import { convertValueToRGBA, RGBAValue } from './utils';

type colorTokenType = {
  lightTheme: { [ key: string ]: RGBAValue },
  darkTheme: { [ key: string ]: RGBAValue }
};

type tokenType = {
  name: string,
  type: string,
  value?: string,
};

let BASE_REM_VALUE = 16;
let SPACING_TOKEN_MAP: { [ key: string ]: string } = {};
let SPACING_BREAKPOINTS: number[] = [];
let COLOR_TOKENS: colorTokenType = { lightTheme: {}, darkTheme: {} };
let ACCENT_TOKENS: colorTokenType = { lightTheme: {}, darkTheme: {} };

let ELEVATION_TOKENS: tokenType[] = [];
let TYPOGRAPHY_TOKENS: tokenType[] = [];
let BUTTON_STYLE_TOKENS: tokenType[] = [];
let RADIUS_TOKENS: tokenType[] = [];
let SPACING_TOKENS: tokenType[] = [];


config.appConfig.subscribe( ( values ) => {
  if ( values.IS_TOKEN_CONFIG_LOADED ) {
    const spacingTokens = values[ config.APP_CONFIG_KEYS.SPACING_TOKENS ];
    COLOR_TOKENS = values[ config.APP_CONFIG_KEYS.COLOR_TOKENS ] ?? { lightTheme: {}, darkTheme: {} };
    ACCENT_TOKENS = values[ config.APP_CONFIG_KEYS.ACCENT_TOKENS ] ?? { lightTheme: {}, darkTheme: {} };
    Object.entries( spacingTokens ).forEach( ( [ token, unitPxValue ] ) => {
      const nonPxVal = ( unitPxValue as string ).replace( 'px', '' );
      SPACING_TOKEN_MAP[ nonPxVal ] = token;
    } );

    SPACING_BREAKPOINTS = Object.keys( SPACING_TOKEN_MAP ).sort( ( a, b ) => Number( a ) - Number( b ) ).map( Number );

    ELEVATION_TOKENS = ( values[ config.APP_CONFIG_KEYS.ELEVATION_TOKENS ] ?? [] ).map( ( name: string ) => ( { name, type: 'elevation' } ) );

    TYPOGRAPHY_TOKENS = ( values[ config.APP_CONFIG_KEYS.TYPOGRAPHY_TOKENS ] ?? [] ).map( ( name: string ) => ( { name, type: 'typography' } ) );;

    BUTTON_STYLE_TOKENS = ( values[ config.APP_CONFIG_KEYS.BUTTON_STYLE_TOKENS ] ?? [] ).map( ( name: string ) => ( { name, type: 'button_style' } ) );;

    RADIUS_TOKENS = Object.entries( values[ config.APP_CONFIG_KEYS.RADIUS_TOKENS ] ?? {} ).map( ( [ key, value ] ) => {
      return {
        name: key,
        value: value,
        type: 'radius-tokens'
      };
    } ) as { name: string, value: string, type: string }[];

    SPACING_TOKENS = Object.entries( values[ config.APP_CONFIG_KEYS.SPACING_TOKENS ] ).map( ( [ name, value ] ) => {
      return {
        name,
        value: (value as string),
        type: 'spacing_tokens'
      };
    } );
  }
  BASE_REM_VALUE = Number( values.BASE_REM_VALUE );
} );


function getSpacingToken( isNegative: boolean, tokenValue: string, multiplier?: string ) {
  const sign = ( isNegative ? "-" : '' );
  if ( multiplier ) {
    return sign + multiplier + ' * tokens.' + tokenValue;
  }
  return sign + 'tokens.' + tokenValue;
}

function getRemCalcValue( pxValue: number ) {
  return `rem-calc(${ pxValue })`;
}

/**
 * 
 * @param {string} value 
 */
export function convertToSpacingToken( value: string ) {
  if ( value.includes( '$' ) || value.includes( 'rem-calc' ) || /[1-9]em$/gi.test( value ) || value.endsWith( 'px' ) ) {
    return value;
  }
  const nonExactToRemCalc = config.appConfig.value[ config.APP_CONFIG_KEYS.NON_EXACT_TOKEN_TO_REM_CALC ];
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
    const currentToken = SPACING_TOKEN_MAP[ currentBreakpoint ];

    if ( i === 0 ) {
      // px value is lower than the lowest breakpoint
      if ( pxValue < currentBreakpoint ) {
        if ( nonExactToRemCalc ) {
          result = getRemCalcValue( pxValue );
        } else {
          const multiplier = ( currentBreakpoint / pxValue ).toPrecision( 3 );
          result = getSpacingToken( isNegative, currentToken, multiplier );
        }
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
      } else if ( nonExactToRemCalc ) {
        result = getRemCalcValue( pxValue );
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
          result = getSpacingToken( isNegative, SPACING_TOKEN_MAP[ lowerBound ] );
        } else if ( upperBoundDiff === 0 ) {
          result = getSpacingToken( isNegative, SPACING_TOKEN_MAP[ upperBound ] );
        } else {
          if ( lowerBoundDiff < upperBoundDiff ) {
            const multiplier = ( pxValue / lowerBound ).toPrecision( 3 );
            result = getSpacingToken( isNegative, SPACING_TOKEN_MAP[ lowerBound ], multiplier );

          } else {
            const multiplier = ( pxValue / upperBound ).toPrecision( 3 );
            result = getSpacingToken( isNegative, SPACING_TOKEN_MAP[ upperBound ], multiplier );
          }
          if ( nonExactToRemCalc ) {
            result = getRemCalcValue( pxValue );
          }
        }
        break;
      }
    }
  }

  return result;
}

function findNearestColor( colorToFind: RGBAValue, allColorTokens: { [ key: string ]: RGBAValue, } ) {
  let result: {
    tokenName: string,
    difference: number,
    rgba: {
      r: number,
      g: number,
      b: number,
      a: number
    },
    original: string
  }[] = [];

  Object.entries( allColorTokens ).forEach( ( [ tokenName, tokenConfig ] ) => {

    if ( !tokenConfig || !colorToFind ) {
      return;
    }

    //Finding the euclidean distance
    const R = Math.pow( ( colorToFind.rgba.r - tokenConfig.rgba.r ), 2 );
    const G = Math.pow( ( colorToFind.rgba.g - tokenConfig.rgba.g ), 2 );
    const B = Math.pow( ( colorToFind.rgba.b - tokenConfig.rgba.b ), 2 );
    const A = Math.pow( ( colorToFind.rgba.a - tokenConfig.rgba.a ), 2 );

    const difference = Math.sqrt( R + G + B + A );
    result.push( {
      tokenName,
      difference,
      rgba: tokenConfig.rgba,
      original: tokenConfig.original
    } );
  } );

  //sort descending on difference
  const finalResultSet = result.sort( ( a, b ) => a.difference - b.difference ).slice( 0, 11 );
  return finalResultSet;
}

export function getNearestColorTokens( colorValue: string, mode = 'light' ) {
  const lightTheme = { ...COLOR_TOKENS.lightTheme, ...ACCENT_TOKENS.lightTheme };
  const darkTheme = { ...COLOR_TOKENS.darkTheme, ...ACCENT_TOKENS.darkTheme };
  const tokens = mode === 'light' ? lightTheme : darkTheme;

  try {
    if ( colorValue.startsWith( '$' ) ) {
      const searchString = colorValue.replace( '$', '' );
      const entries = Object.entries( tokens );
      return entries.filter( ( [ tokenName ] ) => tokenName.includes( searchString ) ).map( ( [ tokenName, value ] ) => ( {
        tokenName,
        rgba: value?.rgba,
        original: value?.original
      } ) );
    }

    const rgba = convertValueToRGBA( colorValue );
    const colors = findNearestColor( rgba, tokens );
    return colors;
  } catch ( error ) {
    return error as Error;
  }
}

export function findTokens( searchString: string ) {
  const searchSpace = [ ...ELEVATION_TOKENS, ...BUTTON_STYLE_TOKENS, ...TYPOGRAPHY_TOKENS, ...RADIUS_TOKENS, ...SPACING_TOKENS ];

  if ( !searchString || !searchString.length ) {
    return searchSpace;
  }
  const result = searchSpace.filter( ( value ) => value.name.includes( searchString.toLowerCase() ) );
  return result;
}