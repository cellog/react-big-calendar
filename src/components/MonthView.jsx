import React, { Component } from 'react'

export default class MonthView extends Component {
  render() {
    const { children, ...props } = this.props
    return (
      <div {...props}>
        {children}
      </div>
    )
  }
}

