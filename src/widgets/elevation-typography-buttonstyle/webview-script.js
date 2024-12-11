( function () {
  const vscode = acquireVsCodeApi();
  const elevationSection = $( '#elevation-section' );
  const typographySection = $( '#typography-section' );
  const buttonSection = $( '#button-section' );

  const tokenSearchbar = $( '#token-search' );

  tokenSearchbar.on( 'input', event => {
    const { value } = event.target;
    postMessageToVS( 'GET_RESULT', value );
  } );

  window.addEventListener( 'message', event => {
    const { args, command } = event.data;

    switch ( command ) {
      case "SET_RESULT": {
        const { ELEVATION, TYPOGRAPHY, BUTTON_STYLE } = args.reduce( ( agg, value ) => {
          if ( value.type === 'elevation' ) {
            agg.ELEVATION.push( value );
          } else if ( value.type === 'typography' ) {
            agg.TYPOGRAPHY.push( value );
          } else {
            agg.BUTTON_STYLE.push( value );
          }
          return agg;
        }, {
          ELEVATION: [],
          TYPOGRAPHY: [],
          BUTTON_STYLE: []
        } );

        elevationSection.empty();
        ELEVATION.forEach( ( arg ) => {
          elevationSection.append( getResultRow( arg ) );
        } );

        typographySection.empty();
        TYPOGRAPHY.forEach( ( arg ) => {
          typographySection.append( getResultRow( arg ) );
        } );

        buttonSection.empty();
        BUTTON_STYLE.forEach( ( arg ) => {
          buttonSection.append( getResultRow( arg ) );
        } );
        break;
      }
    }
  } );


  function postMessageToVS ( command, args ) {
    vscode.postMessage( {
      command,
      args,
    } );
  }

  function getResultRow ( args ) {
    return `
    <div class='result-row' data-token=${ args.name }>
      <span class='token-name'>${ args.name }</span>
    </div>
    `;
  }

  postMessageToVS( 'GET_RESULT', '' );
} )();