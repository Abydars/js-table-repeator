# js-table-repeator

```
var columns = {
		"phonenumber": {
			type: 'text',
			heading: 'Phone Number'
		},
		"number_of_notifications": {
			type: 'number',
			heading: 'Notifications',
		},
		"notification_type": {
			type: 'dropdown',
			heading: 'Notification Type',
			options: [
				{name: "One-Time", value: "onetime"},
				{name: "Acknowledge", value: "ackowledge"},
			]
		},
		"days_of_week": {
			type: 'checkbox',
			heading: 'Days of Week',
			options: [
				{name: "Sunday", value: "sunday"},
				{name: "Monday", value: "monday"},
				{name: "Tuesday", value: "tuesday"},
				{name: "Wednesday", value: "wednesday"},
				{name: "Thursday", value: "thursday"},
				{name: "Friday", value: "friday"},
				{name: "Saturday", value: "saturday"},
			],
			check: function(value, option) {
				return value[option.value];
			}
		},
		"from_timestamp": {
			type: 'datetime-local',
			heading: 'Date From',
		},
		"to_timestamp": {
			type: 'datetime-local',
			heading: 'Date To',
		},
		"actions": {
			type: 'actions',
			heading: 'Actions',
		}
	};

var data = [];// DATA HERE
	
	$('#nas-table').Crud({
		columns: columns, 
		data: data,
		saveEach: (row, updated, $tr) => {
			// perform your ajax here
		},
		deleteEach: (row, $tr) => {
			// perform your ajax here
		},
		disableDelete: false,
		saveAll: true,
	});
```
