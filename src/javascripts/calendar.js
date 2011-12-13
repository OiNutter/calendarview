var Calendar = Class.create()

//------------------------------------------------------------------------------
// Constants
//------------------------------------------------------------------------------

Calendar.VERSION = '1.2'

Calendar.DAY_NAMES = new Array(
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
  'Sunday'
)

Calendar.SHORT_DAY_NAMES = new Array(
  'S', 'M', 'T', 'W', 'T', 'F', 'S', 'S'
)

Calendar.MONTH_NAMES = new Array(
  'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August',
  'September', 'October', 'November', 'December'
)

Calendar.SHORT_MONTH_NAMES = new Array(
  'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov',
  'Dec' 
)

Calendar.NAV_PREVIOUS_YEAR  = -2
Calendar.NAV_PREVIOUS_MONTH = -1
Calendar.NAV_TODAY          =  0
Calendar.NAV_NEXT_MONTH     =  1
Calendar.NAV_NEXT_YEAR      =  2

//------------------------------------------------------------------------------
// Static Methods
//------------------------------------------------------------------------------

// This gets called when the user presses a mouse button anywhere in the
// document, if the calendar is shown. If the click was outside the open
// calendar this function closes it.
Calendar._checkCalendar = function(event) {
  if (!window._popupCalendar)
    return false
  if (Element.descendantOf(Event.element(event), window._popupCalendar.container))
    return
  window._popupCalendar.callCloseHandler()
  return Event.stop(event)
}

//------------------------------------------------------------------------------
// Event Handlers
//------------------------------------------------------------------------------

Calendar.handleMouseDownEvent = function(event)
{
  Event.observe(document, 'mouseup', Calendar.handleMouseUpEvent)
  Event.stop(event)
}

// XXX I am not happy with how clicks of different actions are handled. Need to
// clean this up!
Calendar.handleMouseUpEvent = function(event)
{
  var el        = Event.element(event),
  	  calendar  = el.calendar,
  	  isNewDate = false,
  	  isOtherMonth,
  	  date,
  	  year,
  	  mon

  // If the element that was clicked on does not have an associated Calendar
  // object, return as we have nothing to do.
  if (!calendar) return false

  // Clicked on a day
  if (typeof el.navAction == 'undefined')
  {
	  
    if (calendar.currentDateElement)
    {
      Element.removeClassName(calendar.currentDateElement, 'selected')
      Element.addClassName(el, 'selected')
      calendar.shouldClose = (calendar.currentDateElement == el)
      if (!calendar.shouldClose) calendar.currentDateElement = el
    }
    
    calendar.date.setDateOnly(el.date)
    isNewDate = true
    calendar.shouldClose = !el.hasClassName('otherDay')
    isOtherMonth         = !calendar.shouldClose
    if (isOtherMonth) calendar.update(calendar.date)
  
  }   
  //Clicked on an action button
  else  
  {
    date = new Date(calendar.date)

    if (el.navAction == Calendar.NAV_TODAY)
      date.setDateOnly(new Date())

    year = date.getFullYear()
    mon = date.getMonth()
    
    function setMonth(m) {
      var day = date.getDate(),
          max = date.getMonthDays(m)
      if (day > max) date.setDate(max)
      date.setMonth(m)
    }
    
    switch (el.navAction) {

    // Previous Year
      case Calendar.NAV_PREVIOUS_YEAR:
        if (year > calendar.minYear)
          date.setFullYear(year - 1)
        break

      // Previous Month
      case Calendar.NAV_PREVIOUS_MONTH:
        if (mon > 0) {
          setMonth(mon - 1)
        }
        else if (year-- > calendar.minYear) {
          date.setFullYear(year)
          setMonth(11)
        }
        break

      // Today
      case Calendar.NAV_TODAY:
        break

      // Next Month
      case Calendar.NAV_NEXT_MONTH:
        if (mon < 11) {
          setMonth(mon + 1)
        }
        else if (year < calendar.maxYear) {
          date.setFullYear(year + 1)
          setMonth(0)
        }
        break

      // Next Year
      case Calendar.NAV_NEXT_YEAR:
        if (year < calendar.maxYear)
          date.setFullYear(year + 1)
        break

    }

    if (!date.equalsTo(calendar.date)) {
      calendar.setDate(date)
      isNewDate = true
    } else if (el.navAction == 0) {
      isNewDate = (calendar.shouldClose = true)
    }
  }

  if (isNewDate) event && calendar.callSelectHandler()
  if (calendar.shouldClose) event && calendar.callCloseHandler()

  Event.stopObserving(document, 'mouseup', Calendar.handleMouseUpEvent)

  return Event.stop(event)
}

Calendar.defaultSelectHandler = function(calendar)
{
  if (!calendar.dateField) return false

  // Update dateField value
  if (calendar.dateField.tagName == 'DIV')
    Element.update(calendar.dateField, calendar.date.print(calendar.dateFormat))
  else if (calendar.dateField.tagName == 'INPUT') {
    calendar.dateField.value = calendar.date.print(calendar.dateFormat) }

  // Trigger the onchange callback on the dateField, if one has been defined
  if (typeof calendar.dateField.onchange == 'function')
    calendar.dateField.onchange()

  // Call the close handler, if necessary
  if (calendar.shouldClose) calendar.callCloseHandler()
}

Calendar.defaultCloseHandler = function(calendar)
{
  calendar.hide()
}


//------------------------------------------------------------------------------
// Calendar Setup
//------------------------------------------------------------------------------

Calendar.setup = function(params)
{

  function param_default(name, def) {
    if (!params[name]) params[name] = def
  }

  param_default('dateField', null)
  param_default('triggerElement', null)
  param_default('parentElement', null)
  param_default('selectHandler',  null)
  param_default('closeHandler', null)

  // In-Page Calendar
  if (params.parentElement)
  {
    var calendar = new Calendar(params.parentElement)
    calendar.setSelectHandler(params.selectHandler || Calendar.defaultSelectHandler)
    if (params.dateFormat)
      calendar.setDateFormat(params.dateFormat)
    if (params.dateField) {
      calendar.setDateField(params.dateField)
      calendar.parseDate(calendar.dateField.innerHTML || calendar.dateField.value)
    }
    calendar.show()
    return calendar
  }

  // Popup Calendars
  //
  // XXX There is significant optimization to be had here by creating the
  // calendar and storing it on the page, but then you will have issues with
  // multiple calendars on the same page.
  else
  {
    var triggerElement = $(params.triggerElement || params.dateField)
    triggerElement.onclick = function() {
      var calendar = new Calendar()
      calendar.setSelectHandler(params.selectHandler || Calendar.defaultSelectHandler)
      calendar.setCloseHandler(params.closeHandler || Calendar.defaultCloseHandler)
      if (params.dateFormat)
        calendar.setDateFormat(params.dateFormat)
      if (params.dateField) {
        calendar.setDateField(params.dateField)
        calendar.parseDate(calendar.dateField.innerHTML || calendar.dateField.value)
      }
      if (params.dateField)
        Date.parseDate(calendar.dateField.value || calendar.dateField.innerHTML, calendar.dateFormat)
      calendar.showAtElement(triggerElement)
      return calendar
    }
  }

}



//------------------------------------------------------------------------------
// Calendar Instance
//------------------------------------------------------------------------------

Calendar.prototype = {

  // The HTML Container Element
  container: null,

  // Callbacks
  selectHandler: null,
  closeHandler: null,

  // Configuration
  minYear: 1900,
  maxYear: 2100,
  dateFormat: '%Y-%m-%d',

  // Dates
  date: new Date(),
  currentDateElement: null,

  // Status
  shouldClose: false,
  isPopup: true,

  dateField: null,


  //----------------------------------------------------------------------------
  // Initialize
  //----------------------------------------------------------------------------

  initialize: function(parent,planner)
  {
		
    if (parent)
      this.create($(parent))
    else
      this.create()
  },



  //----------------------------------------------------------------------------
  // Update / (Re)initialize Calendar
  //----------------------------------------------------------------------------

  update: function(date)
  {
    var calendar   = this,
    	today      = new Date(),
    	thisYear   = today.getFullYear(),
    	thisMonth  = today.getMonth(),
    	thisDay    = today.getDate(),
    	month      = date.getMonth(),
    	dayOfMonth = date.getDate()
    

    // Ensure date is within the defined range
    if (date.getFullYear() < this.minYear)
      date.setFullYear(this.minYear)
    else if (date.getFullYear() > this.maxYear)
      date.setFullYear(this.maxYear)

    this.date = new Date(date)

    // Calculate the first day to display (including the previous month)
    date.setDate(1)
    date.setDate(-(date.getDay()) + 1)

    // Fill in the days of the month
    Element.getElementsBySelector(this.container, 'tbody tr').each(
      function(row, i) {
        var rowHasDays = false
        row.immediateDescendants().each(
          function(cell, j) {
            var day            = date.getDate()
            var dayOfWeek      = date.getDay()
            var isCurrentMonth = (date.getMonth() == month)

            // Reset classes on the cell
            cell.className = ''
            cell.date = new Date(date)
            cell.update(day)

            // Account for days of the month other than the current month
            if (!isCurrentMonth)
              cell.addClassName('otherDay')
            else
              rowHasDays = true

            // Ensure the current day is selected
            if (isCurrentMonth && day == dayOfMonth) {
              cell.addClassName('selected')
              calendar.currentDateElement = cell
            }

            // Today
            if (date.getFullYear() == thisYear && date.getMonth() == thisMonth && day == thisDay)
              cell.addClassName('today')

            // Weekend
            if ([0, 6].indexOf(dayOfWeek) != -1)
              cell.addClassName('weekend')

            // Set the date to tommorrow
            date.setDate(day + 1)
          }
        )
        // Hide the extra row if it contains only days from another month
        !rowHasDays ? row.hide() : row.show()
      }
    )

    this.container.getElementsBySelector('td.title')[0].update(
      Calendar.MONTH_NAMES[month] + ' ' + this.date.getFullYear()
    )
  },



  //----------------------------------------------------------------------------
  // Create/Draw the Calendar HTML Elements
  //----------------------------------------------------------------------------

  create: function(parent)
  {

    // If no parent was specified, assume that we are creating a popup calendar.
    if (!parent) {
      parent = document.getElementsByTagName('body')[0]
      this.isPopup = true
    } else {
      this.isPopup = false
    }

    // Calendar Table
    var table = new Element('table')

    // Calendar Header
    var thead = new Element('thead')
    table.appendChild(thead)

    // Title Placeholder
    var row  = new Element('tr')
    var cell = new Element('td', { colSpan: 7 } )
    cell.addClassName('title')
    row.appendChild(cell)
    thead.appendChild(row)

    // Calendar Navigation
    row = new Element('tr')
    this._drawButtonCell(row, '&#x00ab;', 1, Calendar.NAV_PREVIOUS_YEAR)
    this._drawButtonCell(row, '&#x2039;', 1, Calendar.NAV_PREVIOUS_MONTH)
    this._drawButtonCell(row, 'Today',    3, Calendar.NAV_TODAY)
    this._drawButtonCell(row, '&#x203a;', 1, Calendar.NAV_NEXT_MONTH)
    this._drawButtonCell(row, '&#x00bb;', 1, Calendar.NAV_NEXT_YEAR)
    thead.appendChild(row)

    // Day Names
    row = new Element('tr')
    for (var i = 0; i < 7; ++i) {
      cell = new Element('th').update(Calendar.SHORT_DAY_NAMES[i])
      if (i == 0 || i == 6)
        cell.addClassName('weekend')
      row.appendChild(cell)
    }
    thead.appendChild(row)

    // Calendar Days
    var tbody = table.appendChild(new Element('tbody'))
    for (i = 6; i > 0; --i) {
      row = tbody.appendChild(new Element('tr'))
      row.addClassName('days')
      for (var j = 7; j > 0; --j) {
        cell = row.appendChild(new Element('td'))
        cell.calendar = this
      }
    }

    // Calendar Container (div)
    this.container = new Element('div')
    this.container.addClassName('calendar')
    if (this.isPopup) {
      this.container.setStyle({ position: 'absolute', display: 'none' })
      this.container.addClassName('popup')
    }
    this.container.appendChild(table)

    // Initialize Calendar
    this.update(this.date)

    // Observe the container for mousedown events
    Event.observe(this.container, 'mousedown', Calendar.handleMouseDownEvent)

    // Append to parent element
    parent.appendChild(this.container)

  },

  _drawButtonCell: function(parent, text, colSpan, navAction)
  {
    var cell          = new Element('td')
    if (colSpan > 1) cell.colSpan = colSpan
    cell.className    = 'button'
    cell.calendar     = this
    cell.navAction    = navAction
    cell.innerHTML    = text
    cell.unselectable = 'on' // IE
    parent.appendChild(cell)
    return cell
  },



  //------------------------------------------------------------------------------
  // Callbacks
  //------------------------------------------------------------------------------

  // Calls the Select Handler (if defined)
  callSelectHandler: function()
  {
    if (this.selectHandler)
      this.selectHandler(this, this.date.print(this.dateFormat))
  },

  // Calls the Close Handler (if defined)
  callCloseHandler: function()
  {
    if (this.closeHandler)
      this.closeHandler(this)
  },



  //------------------------------------------------------------------------------
  // Calendar Display Functions
  //------------------------------------------------------------------------------

  // Shows the Calendar
  show: function()
  {
    this.container.show()
    if (this.isPopup) {
      window._popupCalendar = this
      Event.observe(document, 'mousedown', Calendar._checkCalendar)
    }
  },

  // Shows the calendar at the given absolute position
  showAt: function (x, y)
  {
    this.container.setStyle({ left: x + 'px', top: y + 'px' })
    this.show()
  },

  // Shows the Calendar at the coordinates of the provided element
  showAtElement: function(element)
  {
    var pos = Position.cumulativeOffset(element)
    this.showAt(pos[0], pos[1])
  },

  // Hides the Calendar
  hide: function()
  {
    if (this.isPopup)
      Event.stopObserving(document, 'mousedown', Calendar._checkCalendar)
    this.container.hide()
  },



  //------------------------------------------------------------------------------
  // Miscellaneous
  //------------------------------------------------------------------------------

  // Tries to identify the date represented in a string.  If successful it also
  // calls this.setDate which moves the calendar to the given date.
  parseDate: function(str, format)
  {
    if (!format)
      format = this.dateFormat
    this.setDate(Date.parseDate(str, format))
  },



  //------------------------------------------------------------------------------
  // Getters/Setters
  //------------------------------------------------------------------------------

  setSelectHandler: function(selectHandler)
  {
    this.selectHandler = selectHandler
  },

  setCloseHandler: function(closeHandler)
  {
    this.closeHandler = closeHandler
  },

  setDate: function(date)
  {
    if (!date.equalsTo(this.date))
      this.update(date)
  },

  setDateFormat: function(format)
  {
    this.dateFormat = format
  },

  setDateField: function(field)
  {
    this.dateField = $(field)
  },

  setRange: function(minYear, maxYear)
  {
    this.minYear = minYear
    this.maxYear = maxYear
  }

}

// global object that remembers the calendar
window._popupCalendar = null