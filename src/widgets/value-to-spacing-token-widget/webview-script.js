( function () {
  const vscode = acquireVsCodeApi();
  const convertButton = $( '#convert-button' );
  const inputValue = $( '#value-input' );
  const resultTextArea = $( '#convert-result-textarea' );
  const remView = $( '#rem-value' );
  const copyTokensToClipboard = $( '#copy-tokens' );

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
    }
  } );
} )();