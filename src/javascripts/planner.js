//=======================================
// Planner Add On For CalendarView
//
// Allows events to be added to calendar 
//======================================= 
 

Calendar.Planner = Class.create();

Calendar.Planner.setup = function(events,options){
	var planner = new Calendar.Planner(options),
		i
		
	for(i = 0; i < events.length; i++)
		planner.addEvent(events[i])
	
	return planner
}

Calendar.Planner.prototype = {
		initialize: function(options){
			this.events = {}
			this.options = Object.extend({
				maxEvents:3,
				labelFormat:'{event}',
				countFormat:'{count} events'
			},options);
		},
		addEvent: function(event){
			var startDate = new Date(event.startDate),
				endDate = new Date(event.endDate),
				limit = new Date(endDate.getFullYear(),endDate.getMonth(),endDate.getDate(),23,59,59)
			
			if(startDate.getDate() == endDate.getDate())
				this.storeEvent(event,startDate)
			else
				for(i = startDate.getTime();i<=limit.getTime();i+=86400000)
					this.storeEvent(event,new Date(i))			
			
		},
		storeEvent: function(event,eventDate){
			if(!this.events[eventDate.print('%Y-%m-%d')])
				this.events[eventDate.print('%Y-%m-%d')] = []
			
			this.events[eventDate.print('%Y-%m-%d')].push(event)
		},
		getEventsForDate: function(date){
			return this.events[date] || []
		},
		render: function(container,date,format){
			format = format || "summary"
							
			var label,
				i;
			
			if(this.getEventsForDate(date.print('%Y-%m-%d')).length>this.options.maxEvents){
				label = new Element('span').update(this.parse(this.options.countFormat,{count:events.length}))
				container.appendChild(label)
			} else {
				for(i=0;i<events.length;i++){
					label = new Element('span').update(this.parse(this.options.labelFormat,events[i]))
					container.appendChild(label)
				}
			}
		},
		parse: function(string,replacements){
			var key;
			for(key in replacements)
				string=string.replace(new RegExp('{'+key+'}','g'),replacements[key]);
			return string;
		}
}