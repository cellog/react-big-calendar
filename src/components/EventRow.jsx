import React, { PropTypes, Component } from 'react'

import EventCell from '../EventCell.jsx'

import { accessor, elementType } from '../utils/propTypes';
import { isSelected } from '../utils/selection';

export default class EventRow extends Component {
  static propTypes = {
    slots: PropTypes.number.isRequired,
    end: PropTypes.instanceOf(Date),
    start: PropTypes.instanceOf(Date),

    selected: PropTypes.array,
    eventPropGetter: PropTypes.func,
    titleAccessor: accessor,
    allDayAccessor: accessor,
    startAccessor: accessor,
    endAccessor: accessor,

    eventComponent: elementType,
    onSelect: React.PropTypes.func
  }

  renderEvent(event){
    let {
      eventPropGetter, selected, start, end
      , startAccessor, endAccessor, titleAccessor
      , allDayAccessor, eventComponent, onSelect } = this.props;

    return (
      <EventCell
        event={event}
        eventPropGetter={eventPropGetter}
        onSelect={onSelect}
        selected={isSelected(event, selected)}
        startAccessor={startAccessor}
        endAccessor={endAccessor}
        titleAccessor={titleAccessor}
        allDayAccessor={allDayAccessor}
        slotStart={start}
        slotEnd={end}
        component={eventComponent}
        style={{position: 'static', zIndex: 4}}
      />
    )
  }

  getCss(left, level, span) {
    const top = level * 20
    const leftPercent = Math.round(((left - 1) / this.props.slots) * 100)
    const spanPercent = Math.round((span / this.props.slots) * 100)
    return {
      position: 'absolute',
      top: top,
      left: `${leftPercent}%`,
      flex: `1 0 100%`,
      width: `${spanPercent}%`
    }
  }

  renderLevels() {
    const { segments } = this.props

    return segments.reduce((row, { event, left, level, span }) => {
      row.push((
        <div style={this.getCss(left, level, span)} key={`${event.title}-${level}-${left}`}>
          {this.renderEvent(event)}
        </div>
      ))
      return row
    }, [])
  }

  render() {
    return (
      <div>
        {this.renderLevels()}
      </div>
    )
  }
}

