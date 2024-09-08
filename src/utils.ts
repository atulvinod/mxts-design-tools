import * as fs from 'fs';
import { getDesignTokenDirPath, getScssTokensDirPath } from './lib/token-parser';
import * as path from 'path';

export function getNonce() {
  let text = '';
  const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  for ( let i = 0; i < 32; i++ ) {
    text += possible.charAt( Math.floor( Math.random() * possible.length ) );
  }
  return text;
}

export function validatePathForCoreLib( coreLibPath: string ) {
  try {
    if ( !coreLibPath || !coreLibPath.trim().length ) {
      return false;
    }
    const baseExists = fs.existsSync( coreLibPath );
    if ( !baseExists ) {
      return false;
    }

    const packageJson = JSON.parse( fs.readFileSync( path.join( coreLibPath, 'package.json' ), 'utf-8' ) );
    if ( packageJson[ 'name' ] !== '@maxxton/core' ) {
      return false;
    }

    const basePathStatus = fs.statSync( coreLibPath );
    if ( basePathStatus.isFile() ) {
      return false;
    }

    const designTokenDirPath = getDesignTokenDirPath( coreLibPath );
    if ( !fs.existsSync( designTokenDirPath ) || !fs.statSync( designTokenDirPath ).isDirectory() ) {
      return false;
    }

    const scssTokenDirPath = getScssTokensDirPath( coreLibPath );
    if ( !fs.existsSync( scssTokenDirPath ) || !fs.statSync( scssTokenDirPath ).isDirectory() ) {
      return false;
    }

    return true;
  } catch ( err ) {
    console.error( err );
    return false;
  }
}