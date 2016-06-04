import React, { Component } from 'react';
import dates from './utils/dates';
import localizer from './localizer';
import { navigate } from './utils/constants';

import TimeGrid from './components/TimeGrid';

export default class Week extends Component {

  static propTypes = TimeGrid.propTypes

  static defaultProps = TimeGrid.defaultProps

  static navigate(date, action) {
    switch (action) {
      case navigate.PREVIOUS:
        return dates.add(date, -1, 'week');

      case navigate.NEXT:
        return dates.add(date, 1, 'week')

      default:
        return date;
    }
  }

  static range(date, { culture }) {
    let firstOfWeek = localizer.startOfWeek(culture)
    let start = dates.startOf(date, 'week', firstOfWeek)
    let end = dates.endOf(date, 'week', firstOfWeek)

    return { start, end }
  }

  render() {
    let { date } = this.props
    let { start, end } = Week.range(date, this.props)

    return (
      <TimeGrid {...this.props} start={start} end={end} eventOffset={15}/>
    );
  }

}
