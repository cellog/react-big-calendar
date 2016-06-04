import React, { PropTypes, Component } from 'react'
import message from '../utils/messages';

import SelectableBackgroundCells from '../containers/SelectableBackgroundCells.jsx'

export default class TimeGridAllDay extends Component {
  static propTypes = {
    messages: PropTypes.array,
    gutterWidth: PropTypes.number,
    range: PropTypes.array,
    selectable: PropTypes.bool,
    gutterRef: PropTypes.func,
    levels: PropTypes.array
  }
  static defaultProps = {
    range: [],
    gutterRef: () => null
  }
  render() {
    
    return (
      <div className="rbc-row">
        <div ref={this.props.gutterRef} className="rbc-gutter-cell" style={this.props.gutterWidth ?
          {width: this.props.gutterWidth} : {}}>
          { message(this.props.messages).allDay }
        </div>
        <div className="rbc-allday-cell">
          <SelectableBackgroundCells selectable={this.props.selectable}
                                     constantSelect
                                     isAllDay
                                     slots={this.props.range.length}
                                     levels={this.props.levels.length + 1}
                                     getValueFromSlot={(slot) => this.props.range[slot]}
                                     onFinishSelect={(a,b,values) => this.props.onSelectSlot({
                                      start: values[0],
                                      slots: values,
                                      end: values[values.length - 1]})}
          >
            {this.props.children}
          </SelectableBackgroundCells>
        </div>
      </div>
    )
  }
}
