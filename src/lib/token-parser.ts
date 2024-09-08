import * as path from 'path';
import * as fs from 'fs';

const CORE_DIR_PATH = path.join( 'D:', 'projects', 'core' );
export const getDesignTokenDirPath = ( coreDirPath: string ) => path.join( coreDirPath, 'lib', 'design-tokens', 'src' );
export const getScssTokensDirPath = ( coreDirPath: string ) => path.join( getDesignTokenDirPath( coreDirPath ), 'scss-tokens' );

function trimRemCalc( value: string ) {
  return value.replace( 'rem-calc(', '' ).replace( ')', '' );
}

function trimVar( value: string ) {
  return value.replace( 'var(', '' ).replace( ')', '' );
}

function getTokenAndValue( line: string ) {
  return line.split( ':' ).map( v => v.trim().replace( ';', '' ) );
}

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

  const colors = processScssFile( rootColorFilePath, processColorLine );
  return colors;
}

function processScssFile( filePath: string, processLineCallback: ( a0: string, a1: { [ key: string ]: string } ) => { [ key: string ]: string }, breakConditionCallback?: ( a0: string ) => boolean ) {
  let agg = {};
  const file = fs.readFileSync( filePath, 'utf8' );
  const fileLines = file.split( '\n' );
  for ( let line of fileLines ) {
    line = line.trim();
    if ( breakConditionCallback && breakConditionCallback( line ) ) {
      return agg;
    }
    agg = processLineCallback( line, agg );
  }
  return agg;
}

function getThemeBasedColors() {
  const lightTheme = getRootColors( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_light.scss' ) );
  const darkTheme = getRootColors( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_dark.scss' ) );
  return { lightTheme, darkTheme };
}

function getRadiusAndSpacingTokens() {

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

  const radiusTokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_radius.scss' ), processLine );
  const spacingTokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_spacing.scss' ), processLine );

  return { radiusTokens, spacingTokens };
}

type themeColorType = { lightTheme: { [ key: string ]: string }, darkTheme: { [ key: string ]: string } };

function getColorTokens( themeColors: themeColorType ) {
  const { lightTheme, darkTheme } = themeColors;

  const processColorTokenLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = getTokenAndValue( line );
      value = trimVar( value );
      agg[ token ] = value;
    }
    return agg;
  };
  const tokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_color.scss' ), processColorTokenLine );

  const color_tokens = Object.entries( tokens ).reduce( ( agg: themeColorType, [ key, value ] ) => {
    agg.lightTheme[ key ] = lightTheme[ value as string ];
    agg.darkTheme[ key ] = darkTheme[ value as string ];
    return agg;
  }, { lightTheme: {}, darkTheme: {} } );

  return color_tokens;
}

function getAccentTokenColors() {
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = line.split( ':' ).map( ( t ) => t.trim().replace( ';', '' ) );
      agg[ token ] = trimVar( value );
    }
    return agg;
  };

  const breakCondition = ( line: string ) => line.trim().startsWith( '$accent-color-map' );

  const tokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_accent-color.scss' ), processLine, breakCondition );
  return tokens;
}

function getOverlayTokens() {
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      let [ token, value ] = getTokenAndValue( line );
      agg[ token ] = trimVar( value );
    }
    return agg;
  };

  const breakCondition = ( line: string ) => line.trim().startsWith( '$color-map' );

  const tokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_overlay-color.scss' ), processLine, breakCondition );
  return tokens;
}

function getChartTokens() {
  const processLine = ( line: string, agg: { [ key: string ]: string } ) => {
    if ( line.startsWith( '$' ) ) {
      const [ token, value ] = getTokenAndValue( line );
      agg[ token ] = trimVar( value );
    }
    return agg;
  };

  const tokens = processScssFile( path.join( getScssTokensDirPath( CORE_DIR_PATH ), '_chart-color.scss' ), processLine );
  return tokens;
}