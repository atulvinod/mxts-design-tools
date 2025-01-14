import * as path from 'path';
import * as fs from 'fs';

import { trimRemCalc, trimVar, getTokenAndValue, convertValueToRGBA, RGBAValue, bracketContentSkipper } from './utils';
import { APP_CONFIG_KEYS } from './config';

export const getDesignTokenDirPath = ( coreDirPath: string ) => path.join( coreDirPath, 'lib', 'design-tokens', 'src' );

export const getScssTokensDirPath = ( coreDirPath: string ) => path.join( getDesignTokenDirPath( coreDirPath ), 'scss-tokens' );

export const getTokensDirPath = ( coreDirPath: string ) => path.join( getDesignTokenDirPath( coreDirPath ), 'tokens' );

type themeColorType = { lightTheme: { [ key: string ]: string }, darkTheme: { [ key: string ]: string } };

function getRootColors( rootColorFilePath: string ) {
  const processColorLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '--' ) ) {
      const [ variable, value ] = getTokenAndValue( line );

      //skip spacing and radius
      if ( !value.startsWith( 'rem-calc' ) && !variable.includes( 'radius' ) ) {

        //values that start with var are derived from root color
        const isDerivedColor = value.startsWith( 'var' );
        if ( isDerivedColor ) {
          const rootValue = trimVar( value );
          agg[ variable ] = agg[ rootValue ];
        } else {
          agg[ variable ] = value;
        }
      }
    }
    return agg;
  };

  const colors = processScssFile( rootColorFilePath, processColorLine, true );
  return colors;
}

function processScssFile<T>( filePath: string, processLineCallback: ( a0: string, a1: { [ key: string ]: T } ) => { [ key: string ]: T }, disableSkippingWithinBracketContent: boolean = false ) {
  let agg: { [ key: string ]: T } = {};
  const checkInvalidLine = bracketContentSkipper();
  const file = fs.readFileSync( filePath, 'utf8' );
  const fileLines = file.split( '\n' );
  for ( let line of fileLines ) {
    line = line.trim();
    if ( !disableSkippingWithinBracketContent && checkInvalidLine( line ) ) {
      continue;
    }
    agg = processLineCallback( line, agg );
  }
  return agg;
}

function getThemeBasedColors( coreDirPath: string ) {
  const lightTheme = getRootColors( path.join( getScssTokensDirPath( coreDirPath ), '_light.scss' ) );
  const darkTheme = getRootColors( path.join( getScssTokensDirPath( coreDirPath ), '_dark.scss' ) );
  return { lightTheme, darkTheme };
}

function getRadiusAndSpacingTokens( coreDirPath: string ) {

  /**
   * 
   * @param {string} line 
   * @param {{}} agg 
   */
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = getTokenAndValue( line );
      const rawPxValue = trimRemCalc( value );
      agg[ token ] = rawPxValue + 'px';
    }
    return agg;
  };

  const radiusTokens = processScssFile( path.join( getScssTokensDirPath( coreDirPath ), '_radius.scss' ), processLine );
  const spacingTokens = processScssFile( path.join( getScssTokensDirPath( coreDirPath ), '_spacing.scss' ), processLine );

  return { radiusTokens, spacingTokens };
}

function getColorTokens( fileName: string, themeColors: themeColorType, coreDirPath: string ) {
  const { lightTheme, darkTheme } = themeColors;

  const processColorTokenLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = getTokenAndValue( line );
      value = trimVar( value );
      agg[ token ] = value;
    }
    return agg;
  };
  const tokens = processScssFile( path.join( getScssTokensDirPath( coreDirPath ), fileName ), processColorTokenLine );

  const color_tokens = Object.entries( tokens ).reduce( ( agg: { lightTheme: { [ key: string ]: RGBAValue }, darkTheme: { [ key: string ]: RGBAValue } }, [ key, value ] ) => {
    agg.lightTheme[ key ] = convertValueToRGBA( lightTheme[ value as string ] );
    agg.darkTheme[ key ] = convertValueToRGBA( darkTheme[ value as string ] );
    return agg;
  }, { lightTheme: {}, darkTheme: {} } );

  return color_tokens;
}

function getOverlayTokens( coreDirPath: string ) {
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = getTokenAndValue( line );
      agg[ token ] = trimVar( value );
    }
    return agg;
  };

  const tokens = processScssFile( path.join( getScssTokensDirPath( coreDirPath ), '_overlay-color.scss' ), processLine );
  return tokens;
}

function getChartTokens( coreDirPath: string ) {
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      const [ token, value ] = getTokenAndValue( line );
      agg[ token ] = trimVar( value );
    }
    return agg;
  };

  const tokens = processScssFile( path.join( getScssTokensDirPath( coreDirPath ), '_chart-color.scss' ), processLine );
  return tokens;
}

function getMixinTokens( coreDirPath: string, fileName: string ) {
  const validateNotBracketContent = bracketContentSkipper();
  const processLine = ( line: string, agg: { [ key: string ]: Array<string> } ) => {
    if ( !Array.isArray( agg[ 'tokens' ] ) ) {
      agg[ 'tokens' ] = [];
    }
    if ( validateNotBracketContent( line ) ) {
      if ( line.startsWith( '@mixin' ) ) {
        const mixinName = line.replace( '@mixin', '' ).replace( '{', '' ).replace( /\([^()]*\)/, '' ).trim();
        if ( !mixinName.endsWith( 'classes' ) && !mixinName.startsWith( '-' ) ) {
          agg[ 'tokens' ].push( mixinName );
        }
      }
    }
    return agg;
  };

  const mixinTokens = processScssFile( path.join( getTokensDirPath( coreDirPath ), fileName ), processLine, true );
  return mixinTokens[ 'tokens' ];
}

export function parseTokens( coreDirPath: string ) {
  const { spacingTokens, radiusTokens } = getRadiusAndSpacingTokens( coreDirPath );
  const themeColors = getThemeBasedColors( coreDirPath );
  const colorTokens = getColorTokens( '_color.scss', themeColors, coreDirPath );
  const accentColors = getColorTokens( '_accent-color.scss', themeColors, coreDirPath );
  const elevationTokens = getMixinTokens( coreDirPath, "_elevation.scss" );
  const typographyTokens = getMixinTokens( coreDirPath, '_typography.scss' );
  const buttonStyles = getMixinTokens( coreDirPath, '_button-styles.scss' );
  return {
    [ APP_CONFIG_KEYS.SPACING_TOKENS ]: spacingTokens,
    [ APP_CONFIG_KEYS.COLOR_TOKENS ]: colorTokens,
    [ APP_CONFIG_KEYS.ACCENT_TOKENS ]: accentColors,
    [ APP_CONFIG_KEYS.ELEVATION_TOKENS ]: elevationTokens,
    [ APP_CONFIG_KEYS.TYPOGRAPHY_TOKENS ]: typographyTokens,
    [ APP_CONFIG_KEYS.BUTTON_STYLE_TOKENS ]: buttonStyles,
    [ APP_CONFIG_KEYS.RADIUS_TOKENS ]: radiusTokens,
  };
}