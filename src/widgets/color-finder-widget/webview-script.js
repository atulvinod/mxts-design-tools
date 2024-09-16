( function () {
  const vscode = acquireVsCodeApi();

  const colorInput = $( '#color-input' );
  const colorPreview = $( '#color-preview' );
  const finderResults = $( '#finder-results' );
  const invalidValueSpan = $( '#invalid-value' );
  invalidValueSpan.hide();

  colorInput.on( 'input', ( event ) => {
    const value = event.target.value;
    colorPreview.css( 'background-color', value );
    const mode = $( 'input[name="color-mode"]:checked' ).val();
    postMessageToVs( 'GET_RESULT', { value, mode } );
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
        const colorResultContainers = $( '.color-result-container' );
        Array.from(colorResultContainers).forEach( ( container ) => {
          $(container).on( 'click', () => {
            postMessageToVs( 'COPY_TO_CLIPBOARD', 'tokens.'+container.dataset.token );
          } );
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
    <div class='color-result-container' data-token="${ args.tokenName }">
      <span class='color-result-token-name'>${ args.tokenName }</span>
      <div class='color-result-overview-container'>
        <span class='color-result-overview' style="background-color: ${ args.original }"></span>
        <span>${ args.original }</span>
      </div>
    </div>`;

    return template;
  }

} )();