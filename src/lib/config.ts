import {BehaviorSubject} from 'rxjs';


const CONFIG = {
  BASE_REM_VALUE: 16,
  SPACING_TOKENS : {
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

export const appConfig = new BehaviorSubject(CONFIG);