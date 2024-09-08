import { BehaviorSubject } from 'rxjs';

export type AppConfigType = {
  BASE_REM_VALUE: number,
  CORE_LIB_LOCATION: string | null,
  IS_VALID_CORE_LOCATION: false,
  [key: string]: any,
};

export const APP_CONFIG_KEYS = {
  'BASE_REM_VALUE': 'BASE_REM_VALUE',
  'CORE_LIB_LOCATION': 'CORE_LIB_LOCATION',
  'IS_VALID_CORE_LOCATION':'IS_VALID_CORE_LOCATION'
};

const CONFIG: AppConfigType = {
  BASE_REM_VALUE: 16,
  CORE_LIB_LOCATION: null,
  IS_VALID_CORE_LOCATION: false,
  SPACING_TOKENS: {
    32: '$spacing-3xl',
    16: '$spacing-l',
    12: '$spacing-m',
    8: '$spacing-s',
    4: '$spacing-xs',
    2: '$spacing-2xs',
    24: '$spacing-2xl',
    40: '$spacing-4xl',
    20: '$spacing-xl',
  }
};

export const appConfig = new BehaviorSubject( CONFIG );

export function updateAppConfig(key: string, value: any) {
  appConfig.next(
    {
      ...appConfig.value,
      [key]: value
    }
  );
}
