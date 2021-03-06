import contains from 'dom-helpers/query/contains'

import React, { PropTypes } from 'react'
import { findDOMNode } from 'react-dom'

import getBoundsForNode from '../utils/getBoundsForNode.js'

let DEBUGGING = {
  debug: false,
  bounds: false,
  clicks: false,
  selection: false,
  registration: false,
  collisions: false,
}

function debug({ bounds = false, clicks = false, selection = false, registration = false, collisions = false }) {
  if (bounds || clicks || selection || registration || collisions) {
    const props = { bounds, clicks, selection, registration, collisions }
    DEBUGGING = {
      debug: true,
      ...props
    }
  } else {
    DEBUGGING.debug = false
  }
}

function makeSelectable( Component, options = {}) {
  const { containerDiv = true, sorter = (a, b) => a - b, nodevalue = (node) => node.props.value } = options
  if (!Component) throw new Error("Component is undefined")
  const displayName = Component.displayName || Component.name || 'Component'

  return class extends React.Component {
    static displayName = `Selection(${displayName})`
    constructor(props) {
      super(props)
      this.mouseDown = this.mouseDown.bind(this)
      this.mouseUp = this.mouseUp.bind(this)
      this.mouseMove = this.mouseMove.bind(this)
      this.click = this.click.bind(this)
      this.mouseDownData = null
      this.clickTolerance = 5
      this.handlers = {
        stopmouseup: () => null,
        stopmousemove: () => null
      }
      this.selectables = {}
      this.selectableKeys = []
      this.sortedNodes = []
      this.containerDiv = containerDiv
      this.state = {
        selecting: false,
        selectedNodes: {},
        selectedNodeList: [],
        selectedValues: {},
        selectedValueList: []
      }
    }
    
    static propTypes = {
      clickTolerance: PropTypes.number,
      constantSelect: PropTypes.bool,
      selectable: PropTypes.bool,
      preserveSelection: PropTypes.bool,
      selectIntermediates: PropTypes.bool,
      onSelectSlot: PropTypes.func,
      onFinishSelect: PropTypes.func
    }
    
    static defaultProps = {
      clickTolerance: 5,
      constantSelect: false,
      selectable: false,
      preserveSelection: false,
      selectIntermediates: false
    }

    static childContextTypes = {
      registerSelectable: PropTypes.func,
      unregisterSelectable: PropTypes.func,
      selectedNodes: PropTypes.object,
      selectedValues: PropTypes.object
    }

    updateState(selecting, nodes, values) {
      if (DEBUGGING.debug && DEBUGGING.selection) {
        console.log('updatestate: ', selecting, nodes, values)
      }
      const newnodes = nodes === null ? this.state.selectedNodes : nodes
      const newvalues = values === null ? this.state.selectedValues : values
      this.setState({
        selecting: selecting === null ? this.state.selecting : selecting,
        selectedNodes: newnodes,
        selectedValues: newvalues,
        containerBounds: this.bounds
      })
      if (this.props.onSelectSlot || this.props.onFinishSelect) {
        const nodelist = Object.keys(newnodes).map((key) => newnodes[key]).sort((a, b) => nodevalue(a.node) - nodevalue(b.node))
        const valuelist = Object.keys(newvalues).map((key) => newvalues[key]).sort(sorter)
        if (DEBUGGING.debug && DEBUGGING.selection) {
          console.log('updatestate onSelectSlot', values, nodes, valuelist, nodelist, this.bounds)
        }
        this.props.onSelectSlot && this.props.onSelectSlot(values, () => nodes, valuelist, () => nodelist, this.bounds)
      }
    }

    propagateFinishedSelect() {
      if (!this.props.onFinishSelect) return
      const newnodes = this.state.selectedNodes
      const newvalues = this.state.selectedValues
      const nodelist = Object.keys(newnodes).map((key) => newnodes[key]).sort((a, b) => sorter(nodevalue(a.node), nodevalue(b.node)))
      const valuelist = Object.keys(newvalues).map((key) => newvalues[key]).sort(sorter)
      if (DEBUGGING.debug && DEBUGGING.selection) {
        console.log('finishselect', newvalues, newnodes, valuelist, nodelist, this.bounds)
      }
      this.props.onFinishSelect(newvalues, () => newnodes, valuelist, () => nodelist, this.bounds)
      
    }
    getChildContext() {
      return {
        registerSelectable: (component, key, value, callback) => {
          if (!this.selectables.hasOwnProperty(key)) {
            this.selectableKeys.push(key)
            this.sortedNodes.push({ component, key, value, callback } )
          }
          if (DEBUGGING.debug && DEBUGGING.registration) {
            console.log(`registered: ${key}`, value)
          }
          this.selectables[key] = { component, value, callback }
        },
        unregisterSelectable: (component, key) => {
          delete this.selectables[key]
          this.selectableKeys = this.selectableKeys.filter((itemKey) => itemKey !== key)
          if (this.state.selectedNodes[key]) {
            const nodes = this.state.selectedNodes
            const values = this.state.selectedValues
            delete nodes[key]
            delete values[key]
            this.updateState(null, nodes, values)
          }
        },
        selectedNodes: this.state.selectedNodes,
        selectedValues: this.state.selectedValues
      }
    }

    addListener(node, type, handler) {
      node.addEventListener(type, handler)
      this.handlers[`stop${type}`] = () => {
        node.removeEventListener(type, handler)
        this.handlers[`stop${type}`] = () => null
      }
    }

    componentWillUnmount() {
      this.handlers.stopmousedown && this.handlers.stopmousedown()
      this.handlers.stopmouseup && this.handlers.stopmouseup()
      this.handlers.stopmousemove && this.handlers.stopmousemove()
    }

    objectsCollide(nodeA, nodeB, tolerance = 0, key = '(unknown)') {
      const {
        top: aTop,
        left: aLeft,
        right: aRight = aLeft,
        bottom: aBottom = aTop
      } = getBoundsForNode(nodeA);
      const {
        top: bTop,
        left: bLeft,
        right: bRight = bLeft,
        bottom: bBottom = bTop
      } = getBoundsForNode(nodeB);
      if (DEBUGGING.debug && DEBUGGING.bounds) {
        console.log(`collide ${key}: `, getBoundsForNode(nodeA), getBoundsForNode(nodeB))
        if (DEBUGGING.collisions) {
          console.log('a bottom < b top', ((aBottom - tolerance ) < bTop))
          console.log('a top > b bottom', (aTop + tolerance) > (bBottom))
          console.log('a right < b left', ((aBottom - tolerance ) < bTop))
          console.log('a left > b right', (aLeft + tolerance) > (bRight))
        }
        console.log(!(
          // 'a' bottom doesn't touch 'b' top
          ((aBottom - tolerance ) < bTop)  ||
          // 'a' top doesn't touch 'b' bottom
          ((aTop + tolerance) > (bBottom)) ||
          // 'a' right doesn't touch 'b' left
          ((aRight - tolerance) < bLeft )  ||
          // 'a' left doesn't touch 'b' right
          ((aLeft + tolerance) > (bRight) )
        ) ? `${key} COLLIDES` : `${key} does not collide`)
      }

      return !(
        // 'a' bottom doesn't touch 'b' top
        ((aBottom - tolerance ) < bTop)  ||
        // 'a' top doesn't touch 'b' bottom
        ((aTop + tolerance) > (bBottom)) ||
        // 'a' right doesn't touch 'b' left
        ((aRight - tolerance) < bLeft )  ||
        // 'a' left doesn't touch 'b' right
        ((aLeft + tolerance) > (bRight) )
      );
    }
    
    isOverContainer(container, x, y) {
      return !container || contains(container, document.elementFromPoint(x, y))
    }

    isClick(e) {
      const { x, y } = this.mouseDownData;
      return (
        Math.abs(e.pageX - x) <= this.clickTolerance &&
        Math.abs(e.pageY - y) <= this.clickTolerance
      );
    }

    mouseDown(e) {
      if (!this.props.selectable) {
        return this.props.onMouseDown && this.props.onMouseDown(e)
      }
      if (DEBUGGING.debug && DEBUGGING.clicks) {
        console.log('mousedown')
      }
      if (!this.props.selectable) return
      if (DEBUGGING.debug && DEBUGGING.clicks) {
        console.log('mousedown: selectable')
      }
      if (!this.node) {
        this.node = findDOMNode(this.ref)
        this.bounds = getBoundsForNode(this.node)
      }
      if (e.which === 3 || e.button === 2 || !this.isOverContainer(this.node, e.clientX, e.clientY))
        return
      if (DEBUGGING.debug && DEBUGGING.clicks) {
        console.log('mousedown: left click')
      }
      if (DEBUGGING.debug && DEBUGGING.bounds) {
        console.log('mousedown: bounds', this.bounds, e.pageY, e.pageX)
      }
      if (!this.objectsCollide(this.bounds, {
        top: e.pageY,
        left: e.pageX
      })) return
      if (DEBUGGING.debug && DEBUGGING.clicks) {
        console.log('mousedown: maybe select')
      }

      this.mouseDownData = {
        x: e.pageX,
        y: e.pageY,
        clientX: e.clientX,
        clientY: e.clientY
      }

      if (this.props.constantSelect) {
        this.createSelectRect(e)
        this.selectNodes(e)
      }

      e.preventDefault()

      this.addListener(document, 'mouseup', this.mouseUp)
      this.addListener(document, 'mousemove', this.mouseMove)
    }

    click(e) {
      if (!this.props.selectable) {
        return this.props.onClick && this.props.onClick(e)
      }
      if (!this.mouseDownData) return
      this.handlers.stopmouseup()
      this.handlers.stopmousemove()
      this.createSelectRect(e)
      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.deselectNodes()
        return
      }
      this.selectNodes(e)
    }

    mouseUp(e) {
      this.handlers.stopmouseup()
      this.handlers.stopmousemove()

      if (!this.mouseDownData) return

      if (this.isClick(e)) {
        if (this.state.selecting) {
          this.setState({ selecting: false })
        }
        return
      }

      if (this.props.constantSelect && !this.props.preserveSelection) {
        this.propagateFinishedSelect()
        this.deselectNodes()
        return
      }
      this.selectNodes(e)
    }

    mouseMove(e) {
      if (!this.mouseDownData) return
      const old = this.state.selecting;

      if (!old) {
        this.setState({selecting: true})
      }

      if (!this.isClick(e.pageX, e.pageY))
      this.createSelectRect(e)
      if (this.props.constantSelect) {
        this.selectNodes(e)
      }
    }

    createSelectRect(e) {
      const { x, y } = this.mouseDownData;
      const w = Math.abs(x - e.pageX);
      const h = Math.abs(y - e.pageY);

      const left = Math.min(e.pageX, x)
      const top = Math.min(e.pageY, y)

      this._selectRect = {
        top,
        left,
        x: e.pageX,
        y: e.pageY,
        right: left + w,
        bottom: top + h
      }
    }

    deselectNodes() {
      let changed = false
      Object.keys(this.state.selectedNodes).forEach((key) => {
        changed = true
        this.selectables[key].callback(false, {}, {})
      })
      if (changed) {
        this.updateState(false, {}, {})
      }
    }

    selectNodes() {
      let nodes = {...this.state.selectedNodes}
      let values = {...this.state.selectedValues}
      const changedNodes = []
      const selectedIndices = []
      const saveNode = (node, bounds) => {
        if (nodes[node.key] !== undefined) return
        if (DEBUGGING.debug && DEBUGGING.selection) {
          console.log(`select: ${node.key}`)
        }
        nodes[node.key] = {node: node.component, bounds: bounds}
        values[node.key] = node.value
        changedNodes.push([true, node])
      }

      this.sortedNodes.forEach((node, idx) => {
        const domnode = findDOMNode(node.component)
        const key = node.key
        const bounds = getBoundsForNode(domnode)
        if (DEBUGGING.debug && DEBUGGING.bounds) {
          console.log(`node ${key} bounds`, bounds)
        }
        if (!domnode || !this.objectsCollide(this._selectRect, bounds, this.clickTolerance, key)) {
          if (nodes[key] === undefined) return
          if (DEBUGGING.debug && DEBUGGING.selection) {
            console.log(`deselect: ${key}`)
          }
          delete nodes[key]
          delete values[key]
          changedNodes.push([false, node])
          return
        }
        selectedIndices.push(idx)
        saveNode(node, bounds)
      })
      if (this.props.selectIntermediates) {
        const min = Math.min(...selectedIndices)
        const max = Math.max(...selectedIndices)
        const filled = Array.apply(min, Array(max-min)).map((x, y) => min + y + 1)
        filled.unshift(min)
        const diff = filled.filter(val => selectedIndices.indexOf(val) === -1)
        diff.forEach(idx => saveNode(this.sortedNodes[idx], getBoundsForNode(findDOMNode(this.sortedNodes[idx].component))))
      }
      if (changedNodes.length) {
        changedNodes.forEach((item) => {
          item[1].callback(item[0], nodes, values)
        })
        this.updateState(null, nodes, values)
      }
    }

    render() {
      if (this.containerDiv) {
        return <div
          onMouseDown={this.mouseDown}
          onClick={this.click}
        >
          <Component
            {...this.props}
            {...this.state}
            ref={(ref) => { this.ref = ref }}
          />
        </div>
      }
      return <Component
        {...this.props}
        {...this.state}
        onMouseDown={this.mouseDown}
        onClick={this.click}
        ref={(ref) => { this.ref = ref }}
      />
    }
  }
}

export { debug }

export default makeSelectable
