import React, { PropTypes, Component } from 'react'
import { segStyle } from '../utils/eventLevels';

export default class BackgroundCell extends Component {
  static propTypes = {
    index: PropTypes.number.isRequired,
    slots: PropTypes.number.isRequired,
    value: PropTypes.instanceOf(Date),
    height: PropTypes.number,
    selected: PropTypes.bool
  }
  static defaultProps = {
    selected: false
  }
  
  render() {
    const selstyle = this.props.selected ? 'rbc-day-bg rbc-selected-cell' : 'rbc-day-bg'
    const segmentStyle = segStyle(1, this.props.slots)
    if (this.props.height) {
      segmentStyle.height = this.props.height
    }
    return (
      <div key={`bg_${this.props.index}`}
           style={segmentStyle}
           className={selstyle}
      />
    )
  }
}

