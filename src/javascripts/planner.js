//=======================================
// Planner Add On For CalendarView
//
// Allows events to be added to calendar 
//======================================= 
 

Calendar.Planner = Class.create();

Calendar.Planner.Setup = function(events){
	var planner = Calendar.Planner.new(),
		i
		
	for(i = 0; i < events.length; i++)
		planner.addEvent(events[i])
		
	return planner
}

Calendar.Planner.prototype = {
		initialize: function(){
			this.events = {}
		},
		addEvent: function(event){
			var date = new Date(event.date)
			if(!this.events[date.print('%Y-%m-%d')])
				this.events[date] = []
			
			this.events[date].push(event)
		},
		getEventsForDate: function(date){
			return this.events[date] || []
		}
}