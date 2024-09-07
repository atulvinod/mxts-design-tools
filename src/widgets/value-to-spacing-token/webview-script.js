( function () {
  const vscode = acquireVsCodeApi();
  const convertButton = document.querySelector( '#convert-button' );
  const inputValue = document.querySelector( '#value-input' );
  const resultTextArea = document.querySelector( '#convert-result-textarea' );

  convertButton.addEventListener( 'click', () => {
    const inputValueText = inputValue.value;
    postMessageToVs( 'CONVERT_SPACING', inputValueText );
  } );


  inputValue.addEventListener( 'keydown', ( event ) => {
    if ( event.key === 'Enter' || event.keyCode === 13 ) {
      const inputValueText = inputValue.value;
      postMessageToVs( 'CONVERT_SPACING', inputValueText );
    }
  } );


  function postMessageToVs ( command, args ) {
    vscode.postMessage( {
      command,
      args
    } );
  }

  window.addEventListener( 'message', event => {
    const { args, command } = event.data;
    resultTextArea.value = args;
  } );
} )();