import { BehaviorSubject } from 'rxjs';
import * as vscode from 'vscode';
import * as utils from '../utils';
import * as fs from 'fs';
import { parseTokens } from './token-parser';
import * as os from 'os';
import * as path from 'path';
import { version as extensionVersion } from '../../package.json';

export type AppConfigType = {
  IS_TOKEN_CONFIG_LOADED: boolean
  BASE_REM_VALUE: number,
  CORE_LIB_LOCATION: string | null,
  IS_VALID_CORE_LOCATION: false,
  [ key: string ]: any,
};

export const TOKEN_CONFIG_FILE_PATH = path.join( os.homedir(), '.mxts-design-tools', 'token-config.json' );
export const LOGS_DIR_PATH = path.join( os.homedir(), '.mxts-design-tools', 'logs' );
export const APP_CONFIG_KEYS = {
  'BASE_REM_VALUE': 'BASE_REM_VALUE',
  'CORE_LIB_LOCATION': 'CORE_LIB_LOCATION',
  'IS_VALID_CORE_LOCATION': 'IS_VALID_CORE_LOCATION',
  'IS_TOKEN_CONFIG_LOADED': 'IS_TOKEN_CONFIG_LOADED',
  'SPACING_TOKENS': 'SPACING_TOKENS',
  'COLOR_TOKENS': 'COLOR_TOKENS',
  'NON_EXACT_TOKEN_TO_REM_CALC': 'NON_EXACT_TOKEN_TO_REM_CALC',
  'ACCENT_TOKENS': 'ACCENT_TOKENS',
  'ELEVATION_TOKENS': 'ELEVATION_TOKENS',
  'TYPOGRAPHY_TOKENS': 'TYPOGRAPHY_TOKENS',
  'BUTTON_STYLE_TOKENS': 'BUTTON_STYLE_TOKENS',
  'RADIUS_TOKENS': 'RADIUS_TOKENS'
};

const CONFIG: AppConfigType = {
  IS_TOKEN_CONFIG_LOADED: false,
  BASE_REM_VALUE: 16,
  CORE_LIB_LOCATION: null,
  IS_VALID_CORE_LOCATION: false,
};

export const appConfig = new BehaviorSubject( CONFIG );

export function updateAppConfig( key: string, value: any ) {
  appConfig.next(
    {
      ...appConfig.value,
      [ key ]: value
    }
  );
}

export function setAppConfig( forceUpdate: boolean = false ) {
  const appSettings = vscode.workspace.getConfiguration( 'mxtsDesignTools', null );
  const coreLibLocation = appSettings.get( 'coreLibLocation' );
  const baseREMValue = appSettings.get( 'baseREMValue' );
  const nonExactTokenToRemCalc = appSettings.get( 'nonExactTokenToRemCalc' );

  const isValidCoreLibLocation = utils.validatePathForCoreLib( coreLibLocation as string );
  updateAppConfig( APP_CONFIG_KEYS.CORE_LIB_LOCATION, coreLibLocation );
  updateAppConfig( APP_CONFIG_KEYS.IS_VALID_CORE_LOCATION, isValidCoreLibLocation );
  updateAppConfig( APP_CONFIG_KEYS.IS_TOKEN_CONFIG_LOADED, false );
  updateAppConfig( APP_CONFIG_KEYS.NON_EXACT_TOKEN_TO_REM_CALC, nonExactTokenToRemCalc );
  updateAppConfig( APP_CONFIG_KEYS.BASE_REM_VALUE, baseREMValue );

  if ( isValidCoreLibLocation ) {
    let tokenData = getTokenDataFromConfig();
    if ( !tokenData || !Object.keys( tokenData ).length || forceUpdate ) {
      const parsedTokenData = parseTokens( coreLibLocation as string );
      saveTokenDataToConfig( parsedTokenData );
      tokenData = parsedTokenData;
    }

    updateAppConfig( APP_CONFIG_KEYS.SPACING_TOKENS, tokenData[ APP_CONFIG_KEYS.SPACING_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.COLOR_TOKENS, tokenData[ APP_CONFIG_KEYS.COLOR_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.ACCENT_TOKENS, tokenData[ APP_CONFIG_KEYS.ACCENT_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.ELEVATION_TOKENS, tokenData[ APP_CONFIG_KEYS.ELEVATION_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.BUTTON_STYLE_TOKENS, tokenData[ APP_CONFIG_KEYS.BUTTON_STYLE_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.TYPOGRAPHY_TOKENS, tokenData[ APP_CONFIG_KEYS.TYPOGRAPHY_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.RADIUS_TOKENS, tokenData[ APP_CONFIG_KEYS.RADIUS_TOKENS ] );
    updateAppConfig( APP_CONFIG_KEYS.IS_TOKEN_CONFIG_LOADED, true );
  }
}

function getTokenDataFromConfig() {
  if ( !fs.existsSync( TOKEN_CONFIG_FILE_PATH ) ) {
    return {};
  }
  const data = fs.readFileSync( TOKEN_CONFIG_FILE_PATH, 'utf-8' );

  try {
    const parsedData = JSON.parse( data );
    return parsedData[ 'tokenData' ];
  } catch ( error ) {
    console.error( 'Failed to parse config file ', error );
    return {};
  }
}


function saveTokenDataToConfig( tokenData: Object ) {
  if ( fs.existsSync( TOKEN_CONFIG_FILE_PATH ) ) {
    const meta = {
      extVersion: extensionVersion,
      timestamp: new Date().toISOString()
    };
    fs.writeFileSync( TOKEN_CONFIG_FILE_PATH, JSON.stringify( { tokenData, meta } ), 'utf-8' );
  }
}

export function checkTokenConfigDirectory() {
  const homeDir = os.homedir();
  const configDir = path.join( homeDir, '.mxts-design-tools' );
  if ( !fs.existsSync( configDir ) ) {
    fs.mkdirSync( configDir, { recursive: true } );
  }

  const configFile = path.join( configDir, 'token-config.json' );
  if ( !fs.existsSync( configFile ) ) {
    fs.writeFileSync( configFile, '{}', 'utf-8' );
  }
}

export function createErrorLog( trace: string ) {
  if ( !fs.existsSync( LOGS_DIR_PATH ) ) {
    fs.mkdirSync( LOGS_DIR_PATH, { recursive: true } );
  }

  const logFileName = `[ERROR] MXTS_DESIGN_TOOL_EXTENSION-${ new Date().toISOString().replace( /:/g, '-' ) }.txt`;
  const logFilePath = path.join( LOGS_DIR_PATH, logFileName );
  fs.writeFileSync( logFilePath, trace );
  return logFilePath;
}