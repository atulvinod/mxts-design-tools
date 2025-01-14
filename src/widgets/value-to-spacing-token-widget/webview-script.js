( function () {
  const vscode = acquireVsCodeApi();
  const convertButton = $( '#convert-button' );
  const inputValue = $( '#value-input' );
  const resultTextArea = $( '#convert-result-textarea' );
  const remView = $( '#rem-value' );
  const copyTokensToClipboard = $( '#copy-tokens' );
  const tokensSection = $( '#spacing-tokens' );

  convertButton.on( 'click', () => {
    const inputValueText = inputValue.val();
    postMessageToVs( 'CONVERT_SPACING', inputValueText );
  } );


  inputValue.on( 'keydown', ( event ) => {
    if ( event.key === 'Enter' || event.keyCode === 13 ) {
      const inputValueText = inputValue.val();
      postMessageToVs( 'CONVERT_SPACING', inputValueText );
    }
  } );

  copyTokensToClipboard.on( 'click', () => {
    postMessageToVs(
      'COPY_TO_CLIPBOARD',
      resultTextArea.val()
    );
  } );


  function postMessageToVs ( command, args ) {
    vscode.postMessage( {
      command,
      args
    } );
  }

  function getResultRow ( args ) {
    if ( !args.value ) {
      return `
      <div class='result-row' data-type='no-value'  data-token=${ args.name } title='Click to copy'>
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

  window.addEventListener( 'message', event => {
    const { args, command } = event.data;
    switch ( command ) {
      case 'CONVERT_SPACING': {
        resultTextArea.val( args );
        break;
      }
      case 'UPDATE_REM': {
        remView.html( args );
        break;
      }
      case 'UPDATE_TOKEN_SECTION': {
        tokensSection.empty();
        args.forEach( ( arg ) => {
          tokensSection.append( getResultRow( arg ) );
        } );

        Array.from( $( '.result-row' ) ).forEach( row => {
          $( row ).on( 'click', () => {
            postMessageToVs( 'COPY_TO_CLIPBOARD', `tokens.${ row.dataset.token };` );
          } );
        } );
      }
    }
  } );
} )();