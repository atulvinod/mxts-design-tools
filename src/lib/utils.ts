export function trimRemCalc ( value: string ) {
  return value.replace( 'rem-calc(', '' ).replace( ')', '' );
}

export function trimVar ( value: string ) {
  return value.replace( 'var(', '' ).replace( ')', '' );
}

export function getTokenAndValue ( line: string ) {
  return line.split( ':' ).map( v => v.trim().replace( ';', '' ) );
}

export type RGBAValue = {
  rgba :{
    r: number,
    g: number,
    b: number,
    a: number,
  },
  original: string
} | null;

export function convertValueToRGBA ( value: string ) : RGBAValue {
  if ( value.startsWith( '#' ) ) {
    if ( value.length < 7 ) {
      throw new Error( 'Invalid hex value' );
    }
    const hex = value.replace( /^#/, '' );
    let r = parseInt( hex.substring( 0, 2 ), 16 );
    let g = parseInt( hex.substring( 2, 4 ), 16 );
    let b = parseInt( hex.substring( 4, 6 ), 16 );
    let a = 255;
    if ( hex.length === 8 ) {
      a = parseInt( hex.substring( 6, 8 ), 16 );
    }
    return { rgba: { r, g, b, a }, original: value };
  } else if ( value.startsWith( 'rgb(' ) ) {
    const rgb = value.replace( 'rgb(', '' ).replace( ')', '' ).split( ',' ).map( ( x ) => Number( x.trim() ) );

    if ( rgb.length !== 3 ) {
      throw new Error( 'Invalid rgb value' );
    }

    const [ r, g, b, ] = rgb;
    return { rgba: { r, g, b, a: 255 }, original: value };
  } else if ( value.startsWith( 'rgba(' ) ) {
    const rgba = value.replace( 'rgba(', '' ).replace( ')', '' ).split( ',' ).map( ( x ) => Number( x.trim() ) );

    if ( rgba.length !== 4 ) {
      throw new Error( 'Invalid rgba value' );
    }

    const [ r, g, b, a ] = rgba;
    return { rgba: { r, g, b, a }, original: value };
  }

  return null;
}
