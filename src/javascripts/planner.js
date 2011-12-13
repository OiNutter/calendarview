//=======================================
// Planner Add On For CalendarView
//
// Allows events to be added to calendar 
//======================================= 
 

Calendar.Planner = Class.create();

Calendar.Planner.Setup = function(events,options){
	var planner = Calendar.Planner.new(options),
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
				labelFormat:'{{event}}',
				countFormat:'{{count}} events'
				}
			},options);
		},
		addEvent: function(event){
			var date = new Date(event.date)
			if(!this.events[date.print('%Y-%m-%d')])
				this.events[date] = []
			
			this.events[date].push(event)
		},
		getEventsForDate: function(date){
			return this.events[date] || []
		},
		render: function(container,date,format){
			format ||= "summary"
							
			var label,
				i;
			
			if(this.getEventsForDate(date.print('%Y-%m-%d')).length>this.options.maxEvents){
				label = new Element('span').update(this.parse(countFormat,{count:events.length}))
				container.appendChild(label)
			} else {
				for(i=0;i<events.length;i++){
					label = new Element('span').update(this.parse(labelFormat,events[i]))
					container.appendChild(label)
				}
			}
		},
		parse: function(string,replacements){
			var key;
			for(key in replacements)
				string=string.replace(new RegExp('{'+key+'}','g'),replacement[key]);
			return string;
		}
}

