import { BehaviorSubject } from 'rxjs';

export type AppConfigType = {
  IS_TOKEN_CONFIG_LOADED: boolean
  BASE_REM_VALUE: number,
  CORE_LIB_LOCATION: string | null,
  IS_VALID_CORE_LOCATION: false,
  [ key: string ]: any,
};

export const APP_CONFIG_KEYS = {
  'BASE_REM_VALUE': 'BASE_REM_VALUE',
  'CORE_LIB_LOCATION': 'CORE_LIB_LOCATION',
  'IS_VALID_CORE_LOCATION': 'IS_VALID_CORE_LOCATION',
  'IS_TOKEN_CONFIG_LOADED': 'IS_TOKEN_CONFIG_LOADED',
  'SPACING_TOKENS': 'SPACING_TOKENS',
  'COLOR_TOKENS': 'COLOR_TOKENS'
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
