import React from 'react';
import { storiesOf, action, linkTo } from '@kadira/storybook';
import Calendar from '../Calendar.jsx';
import moment from 'moment';
import momentLocalizer from '../localizers/moment.js'
import '../less/styles.less'
import { debug } from '../containers/Selection.jsx'

// Setup the localizer by providing the moment (or globalize) Object
// to the correct localizer.
momentLocalizer(moment); // or globalizeLocalizer

const events = [{
    title: 'test',
    start: moment().add(1, 'days').subtract(5, 'hours').toDate(),
    end: moment().add(1, 'days').subtract(4, 'hours').toDate(),
    allDay: false
  },
  {
    title: 'test all day',
    start: moment().toDate(),
    end: moment().toDate(),
    allDay: true
  }]

storiesOf('module.Calendar', module)
  .add('default view', () => {
    return (
      <div style={{height: 600}}>
        <Calendar
          min={moment('12:00am', 'h:mma').toDate()}
          max={moment('11:59pm', 'h:mma').toDate()}
          events={events}
          onSelectEvent={action('event selected')}
          defaultDate={new Date()}
        />
      </div>
    )
  })

  .add('selectable', () => {
    //debug({ registration: true })
    return (
      <div style={{height: 600}}>
        <Calendar
          selectable
          min={moment('12:00am', 'h:mma').toDate()}
          max={moment('11:59pm', 'h:mma').toDate()}
          events={events}
          onSelectEvent={action('event selected')}
          onSelectSlot={action('slot selected')}
          defaultDate={new Date()}
        />
      </div>
    )
  })