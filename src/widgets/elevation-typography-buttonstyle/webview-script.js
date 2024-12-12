( function () {
  const vscode = acquireVsCodeApi();
  const elevationSection = $( '#elevation-section' );
  const typographySection = $( '#typography-section' );
  const buttonSection = $( '#button-section' );
  const radiusSection = $( '#radius-section' );

  const tokenSearchbar = $( '#token-search' );

  const elevationHeading = $( '#elevation-heading' );
  const typographyHeading = $( '#typography-heading' );
  const buttonHeading = $( '#button-heading' );
  const radiusHeading = $( '#radius-heading' );

  tokenSearchbar.on( 'input', event => {
    const { value } = event.target;
    postMessageToVS( 'GET_RESULT', value );
  } );

  window.addEventListener( 'message', event => {
    const { args, command } = event.data;

    switch ( command ) {
      case "SET_RESULT": {
        const { ELEVATION, TYPOGRAPHY, BUTTON_STYLE, RADIUS } = args.reduce( ( agg, value ) => {
          if ( value.type === 'elevation' ) {
            agg.ELEVATION.push( value );
          } else if ( value.type === 'typography' ) {
            agg.TYPOGRAPHY.push( value );
          } else if ( value.type == 'button_style' ) {
            agg.BUTTON_STYLE.push( value );
          } else {
            agg.RADIUS.push( value );
          }
          return agg;
        }, {
          ELEVATION: [],
          TYPOGRAPHY: [],
          BUTTON_STYLE: [],
          RADIUS: []
        } );

        elevationSection.empty();
        ELEVATION.forEach( ( arg ) => {
          elevationSection.append( getResultRow( arg ) );
        } );

        if ( ELEVATION.length ) {
          elevationHeading.show();
        } else {
          elevationHeading.hide();
        }

        typographySection.empty();
        TYPOGRAPHY.forEach( ( arg ) => {
          typographySection.append( getResultRow( arg ) );
        } );
        if ( TYPOGRAPHY.length ) {
          typographyHeading.show();
        } else {
          typographyHeading.hide();
        }

        buttonSection.empty();
        BUTTON_STYLE.forEach( ( arg ) => {
          buttonSection.append( getResultRow( arg ) );
        } );
        if ( BUTTON_STYLE.length ) {
          buttonHeading.show();
        } else {
          buttonHeading.hide();
        }

        radiusSection.empty();
        RADIUS.forEach( arg => {
          radiusSection.append( getResultRow( arg ) );
        } );
        if ( RADIUS.length ) {
          radiusHeading.show();
        } else {
          radiusHeading.hide();
        }

        Array.from( $( '.result-row' ) ).forEach( row => {
          $( row ).on( 'click', () => {
            if ( row.dataset.type == 'nonevalue' ) {
              postMessageToVS( 'COPY_TO_CLIPBOARD', `@include tokens.${ row.dataset.token }` );
            } else {
              postMessageToVS( 'COPY_TO_CLIPBOARD', `tokens.${ row.dataset.token }` );
            }
          } );
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
    if ( !args.value ) {
      return `
      <div class='result-row' data-type='nonvalue'  data-token=${ args.name } title='Click to copy'>
        <span class='token-name'>${ args.name }</span>
      </div>
      `;
    }

    return `
      <div class='result-row' data-type='value' data-token=${ args.name } title='Click to copy'>
        <span class='token-name'>${ args.name }</span>
        <span class='token-name--noflex'>${ args.value }</span>
      </div>
      `;
  }

  postMessageToVS( 'GET_RESULT', '' );
} )();