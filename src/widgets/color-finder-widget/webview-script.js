( function () {
  const vscode = acquireVsCodeApi();

  const colorInput = $( '#color-input' );
  const colorPreview = $( '#color-preview' );
  const finderResults = $( '#finder-results' );
  const invalidValueSpan = $('#invalid-value');
  invalidValueSpan.hide();

  colorInput.on( 'input', ( event ) => {
    const value = event.target.value;
    colorPreview.css( 'background-color', value );
    postMessageToVs( 'GET_RESULT', value );
  } );

  window.addEventListener( 'message', event => {
    const { args, command } = event.data;
    switch ( command ) {
      case 'RESULTS': {
        invalidValueSpan.hide();
        finderResults.empty();
        args.forEach( ( row ) => {
          finderResults.append( getResultRow( row ) );
        } );
        break;
      }
      case 'INVALID_VALUE': {
        invalidValueSpan.show();
        finderResults.empty();
        break;
        }
    }
  } );

  function postMessageToVs ( command, args ) {
    vscode.postMessage( {
      command,
      args
    } );
  }

  function getResultRow ( args ) {
    const template = `
    <div class='color-result-container'>
      <span class='color-result-token-name'>${ args.tokenName }</span>
      <div class='color-result-overview-container'>
        <span class='color-result-overview' style="background-color: ${ args.original }"></span>
        <span>${ args.original }</span>
      </div>
    </div>`;

    return template;
  }

} )();