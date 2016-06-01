import React, { PropTypes, Component } from 'react'
import SelectableBackgroundCell from '../containers/SelectableBackgroundCell.jsx'

export default class BackgroundCells extends Component {
  static propTypes = {
    slots: PropTypes.number.isRequired,
    levels: PropTypes.number.isRequired,
    getValueFromSlot: PropTypes.func.isRequired,
    isAllDay: PropTypes.bool.isRequired
  }

  static defaultProps = {
    getValueFromSlot: (i) => i,
    isAllDay: false
  }
  
  render() {
    const slots = []
    const className = this.props.isAllDay ? 'rbc-allday-bg' : 'rbc-row-bg'
    const height = this.props.levels * 20
    for (let i = 0; i < this.props.slots; i++) {
      slots.push((
        <SelectableBackgroundCell
          key={i}
          index={i}
          value={this.props.getValueFromSlot(i)}
          slots={this.props.slots}
          height={height}
        />
      ))
    }

    return (
      <div className={className} style={{height: height}}>
        {slots}
        {this.props.children}
      </div>
    )
  }
}
