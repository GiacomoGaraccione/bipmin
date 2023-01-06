import BpmnModeler from 'bpmn-js/dist/bpmn-modeler.production.min.js';

import React from 'react';

export default class ReactEditor extends React.Component {
  constructor() {
      super()
    this.containerRef = React.createRef();
  }

  componentDidMount() {
    const container = this.containerRef.current;

    this.bpmnModeler = new BpmnModeler({ container });
  }

  componentWillUnmount() {
    this.bpmnModeler.destroy();
  }
  
  render() {
    return (
      <div ref={ this.containerRef }></div>
    );
  }
}
